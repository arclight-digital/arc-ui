#!/usr/bin/env node
/**
 * wrapper-runtime.js — mounts every wrapper package in a real browser.
 *
 * The gap this closes: **nothing in this repo has ever mounted a wrapper.**
 * `wrapper-slots.js` reads generated source, `smoke-test-wrappers.js` proves a
 * packed tarball *builds* inside a real consumer, and the component suite tests
 * the custom element the wrappers wrap. All three can be green while a wrapper
 * drops every child it is handed, stringifies an array prop into
 * `[object Object]`, or wipes a component's default by writing `undefined` over
 * it. Those are wrapper-layer bugs and no wrapper-layer test existed.
 *
 * V4-PLAN 2.4a costed this as "six harnesses + CI wiring, then ~300 LOC of test
 * bodies per framework" — six framework test toolchains (vitest/jest/karma),
 * none of which exists anywhere in the monorepo today. That shape was rejected
 * for two reasons. Six hand-written suites drift, and a matrix whose rows
 * assert different things cannot be read as a matrix. And the toolchains would
 * be testing wrapper *source*, not what npm serves.
 *
 * So: one harness. It packs the real tarballs (each package's `prepack` builds
 * `dist/`), scaffolds one scratch consumer per framework, builds it with that
 * framework's real toolchain, serves the built bundle, and runs **one shared
 * probe set** — `test/wrapper-runtime/contract.js` — against all six. The
 * fixture apps contain no assertions; they only render the DOM the contract
 * describes, each in its own framework's idiom (`v-model:value` for Vue,
 * `bind:value` for Svelte, `onArcChange` for React/Preact/Solid), because a
 * capability a consumer cannot reach the normal way is not a capability.
 *
 * Playwright is already a devDependency (the a11y audit uses it), so the
 * browser side costs nothing new.
 *
 *   pnpm test:wrappers                      all six
 *   pnpm test:wrappers -- --only react,vue  a subset
 *   pnpm test:wrappers -- --keep            leave the scratch apps on disk
 *
 * Needs network for the scratch apps' dependencies, so it is its own CI job
 * alongside wrapper-builds rather than a step in `verify`.
 */

import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync, cpSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import {
  FIXTURE, collect, expectations, CAPABILITY, PINNED,
} from '../test/wrapper-runtime/contract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const fixtures = resolve(root, 'test/wrapper-runtime/fixtures');

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : (argv[i + 1] ?? '');
};
const only = flag('only')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null;
const keep = argv.includes('--keep');

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });

const INDEX_HTML = (entry) =>
  `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div>` +
  `<script type="module" src="/src/${entry}"></script></body></html>`;

/**
 * Angular does not build with plain Vite. ng-packagr emits *partial*
 * declarations (`ɵɵngDeclareComponent`) that the Angular linker has to process,
 * so a consumer needs a real Angular build — which is also the honest test,
 * since it is what an Angular consumer runs. `smoke-test-wrappers.js` skips
 * Angular for exactly this cost and leans on ng-packagr's own strictTemplates
 * pass instead; that is a compile check, and compiling is precisely what the
 * empty-template bug survives.
 */
const ANGULAR_JSON = JSON.stringify({
  version: 1,
  projects: {
    app: {
      projectType: 'application',
      root: '',
      sourceRoot: 'src',
      architect: {
        build: {
          builder: '@angular-devkit/build-angular:application',
          options: {
            outputPath: 'dist',
            index: 'src/index.html',
            browser: 'src/main.ts',
            tsConfig: 'tsconfig.json',
            polyfills: ['zone.js'],
            optimization: false,
          },
        },
      },
    },
  },
}, null, 2);

const ANGULAR_TSCONFIG = JSON.stringify({
  compilerOptions: {
    target: 'ES2022',
    module: 'ES2022',
    moduleResolution: 'bundler',
    lib: ['ES2022', 'DOM'],
    experimentalDecorators: true,
    useDefineForClassFields: false,
    skipLibCheck: true,
    // contract.js is plain ESM shared with the other five fixtures — one copy
    // of the fixture values, or the matrix stops being a matrix.
    allowJs: true,
    strict: false,
  },
  files: ['src/main.ts'],
}, null, 2);

/**
 * Each framework: which tarball it needs, what its scratch app installs, what
 * vite config it needs, and which entry the page loads. The fixture sources
 * themselves live under test/wrapper-runtime/fixtures/<name>/ as real files —
 * they are the part a human reads when a row goes red.
 */
const FRAMEWORKS = {
  react: {
    pkg: 'react',
    dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
    devDependencies: { vite: '^7.0.0', '@vitejs/plugin-react': '^5.0.0' },
    entry: 'main.jsx',
    viteConfig:
      "import react from '@vitejs/plugin-react';\nexport default { plugins: [react()] };\n",
  },
  preact: {
    pkg: 'preact',
    dependencies: { preact: '^10.19.0' },
    devDependencies: { vite: '^7.0.0', '@preact/preset-vite': '^2.9.0' },
    entry: 'main.jsx',
    viteConfig:
      "import preact from '@preact/preset-vite';\nexport default { plugins: [preact()] };\n",
  },
  solid: {
    pkg: 'solid',
    dependencies: { 'solid-js': '^1.9.0' },
    devDependencies: { vite: '^7.0.0', 'vite-plugin-solid': '^2.11.0' },
    entry: 'main.jsx',
    viteConfig:
      "import solid from 'vite-plugin-solid';\nexport default { plugins: [solid()] };\n",
  },
  vue: {
    pkg: 'vue',
    dependencies: { vue: '^3.5.0' },
    devDependencies: { vite: '^7.0.0', '@vitejs/plugin-vue': '^6.0.0' },
    entry: 'main.js',
    viteConfig: "import vue from '@vitejs/plugin-vue';\nexport default { plugins: [vue()] };\n",
  },
  svelte: {
    pkg: 'svelte',
    dependencies: { svelte: '^5.0.0' },
    devDependencies: { vite: '^7.0.0', '@sveltejs/vite-plugin-svelte': '^6.0.0' },
    entry: 'main.js',
    viteConfig:
      "import { svelte } from '@sveltejs/vite-plugin-svelte';\n" +
      'export default { plugins: [svelte()] };\n',
  },
  angular: {
    pkg: 'angular',
    dependencies: {
      '@angular/common': '^17.3.12',
      '@angular/compiler': '^17.3.12',
      '@angular/core': '^17.3.12',
      '@angular/forms': '^17.3.12',
      '@angular/platform-browser': '^17.3.12',
      rxjs: '^7.8.2',
      tslib: '^2.8.1',
      'zone.js': '~0.14.10',
    },
    devDependencies: {
      '@angular/cli': '^17.3.12',
      '@angular/compiler-cli': '^17.3.12',
      '@angular-devkit/build-angular': '^17.3.12',
      typescript: '~5.4.5',
    },
    // The Angular CLI owns the whole app shell, so it gets its own scaffold
    // and its own index.html rather than the shared Vite one.
    build: ['npx', ['ng', 'build']],
    dist: 'dist/browser',
    files: {
      'angular.json': ANGULAR_JSON,
      'tsconfig.json': ANGULAR_TSCONFIG,
      'src/index.html':
        '<!doctype html><html><head><meta charset="utf-8"><title>arc</title></head>' +
        '<body><app-root></app-root></body></html>',
    },
  },
};

const names = only ?? Object.keys(FRAMEWORKS);
const unknown = names.filter((n) => !FRAMEWORKS[n]);
if (unknown.length) {
  console.error(`unknown framework(s): ${unknown.join(', ')}`);
  console.error(`known: ${Object.keys(FRAMEWORKS).join(', ')}`);
  process.exit(1);
}

// The per-icon modules are generated and gitignored; packing without them is
// the v2.3.0 broken publish. Fail here, with the fix, rather than inside a
// scratch app's bundler output three steps later.
if (!existsSync(resolve(root, 'packages/icons/src/phosphor/_resolver.js'))) {
  console.error('✗ generated icon modules missing — run `pnpm generate:icons` first');
  process.exit(1);
}

const scratch = mkdtempSync(join(tmpdir(), 'arc-wrapper-runtime-'));
console.log(`\n  ARC UI — wrapper runtime\n\n  scratch: ${scratch}\n`);

// ── 1. Pack the tarballs (prepack builds dist/ in every package) ─────────────
const tarballs = {};
for (const pkg of ['web-components', ...new Set(names.map((n) => FRAMEWORKS[n].pkg))]) {
  const out = run('pnpm', ['pack', '--pack-destination', scratch], resolve(root, 'packages', pkg));
  tarballs[pkg] = out.trim().split('\n').pop();
  console.log(`  packed ${pkg}`);
}

// ── 2. A static server for the built bundles ────────────────────────────────
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.map': 'application/json',
};

function serve(dir) {
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const file = join(dir, rel);
    // The bundle is built output under our own temp dir, but a served path is
    // a served path: refuse anything that escapes the root.
    if (!file.startsWith(dir) || !existsSync(file)) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server)));
}

// ── 3. Build and probe each framework ───────────────────────────────────────
const expected = expectations(FIXTURE);
const results = {};
const buildFailures = {};

for (const name of names) {
  const fw = FRAMEWORKS[name];
  const app = join(scratch, name);
  mkdirSync(join(app, 'src'), { recursive: true });

  writeFileSync(join(app, 'package.json'), JSON.stringify({
    name: `arc-wrapper-runtime-${name}`,
    private: true,
    type: 'module',
    dependencies: {
      '@arclux/arc-ui': `file:${tarballs['web-components']}`,
      [`@arclux/arc-ui-${name}`]: `file:${tarballs[fw.pkg]}`,
      ...fw.dependencies,
    },
    devDependencies: fw.devDependencies,
  }, null, 2));

  if (fw.entry) writeFileSync(join(app, 'index.html'), INDEX_HTML(fw.entry));
  if (fw.viteConfig) writeFileSync(join(app, 'vite.config.js'), fw.viteConfig);
  for (const [rel, contents] of Object.entries(fw.files ?? {})) {
    mkdirSync(dirname(join(app, rel)), { recursive: true });
    writeFileSync(join(app, rel), contents);
  }

  // The fixture sources, plus the contract they read their values from — one
  // copy of the values, shared by the fixtures and by the assertions.
  cpSync(join(fixtures, name), join(app, 'src'), { recursive: true });
  cpSync(resolve(root, 'test/wrapper-runtime/contract.js'), join(app, 'src/contract.js'));

  const [buildCmd, buildArgs] = fw.build ?? ['npx', ['vite', 'build']];
  try {
    console.log(`  [${name}] installing…`);
    run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], app);
    console.log(`  [${name}] building…`);
    run(buildCmd, buildArgs, app);
  } catch (err) {
    buildFailures[name] = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim() || err.message;
    console.log(`  [${name}] BUILD FAILED`);
    continue;
  }

  const server = await serve(join(app, fw.dist ?? 'dist'));
  const { port } = server.address();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // A framework that throws mid-render reports every probe as absent, and the
  // reason is on the console. Capturing it turns a wall of red into one line.
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(m.text()); });

  try {
    console.log(`  [${name}] probing…`);
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
    // Custom element upgrade plus the framework's first paint. The probes
    // await `updateComplete` themselves; this is only the mount.
    await page.waitForFunction(() => !!document.querySelector('arc-card'), null, { timeout: 10_000 })
      .catch(() => {});
    results[name] = { probes: await page.evaluate(collect, FIXTURE), pageErrors };
  } catch (err) {
    results[name] = { probes: {}, pageErrors: [...pageErrors, String(err)] };
  } finally {
    await browser.close();
    server.close();
  }
}

// ── 4. The matrix ───────────────────────────────────────────────────────────
const probeNames = Object.keys(expected);
const cols = names.filter((n) => !buildFailures[n]);
const pad = (s, n) => String(s).padEnd(n);
const w = Math.max(24, ...probeNames.map((p) => p.length + 2));

// Three states, not two. A pinned probe that fails is the recorded state and
// costs nothing; a pinned probe that *passes* means the upstream defect is
// fixed and the pin is now lying, which is a failure of its own.
const OK = 'ok', BROKE = 'broke', PIN = 'pinned', FIXED = 'fixed';

const verdicts = {};
for (const name of cols) {
  verdicts[name] = {};
  for (const probe of probeNames) {
    const passed = results[name]?.probes?.[probe]?.actual === expected[probe];
    const pin = PINNED[name]?.[probe];
    verdicts[name][probe] = pin ? (passed ? FIXED : PIN) : (passed ? OK : BROKE);
  }
}

const LABEL = { [OK]: '  ok', [BROKE]: '  FAIL', [PIN]: '  pin', [FIXED]: '  FIXED!' };

console.log(`\n  ${pad('probe', w)}${cols.map((n) => pad(n, 10)).join('')}`);
console.log(`  ${'─'.repeat(w + cols.length * 10)}`);
let lastCapability = null;
for (const probe of probeNames) {
  if (CAPABILITY[probe] !== lastCapability) {
    lastCapability = CAPABILITY[probe];
    console.log(`  ${lastCapability}`);
  }
  const row = cols.map((n) => pad(LABEL[verdicts[n][probe]], 10)).join('');
  console.log(`  ${pad(`  ${probe}`, w)}${row}`);
}

const pins = cols.flatMap((n) => probeNames.filter((p) => verdicts[n][p] === PIN).map((p) => [n, p]));
if (pins.length) {
  const findings = [...new Set(pins.map(([n, p]) => PINNED[n][p]))].sort();
  console.log(
    `\n  ${pins.length} pinned failure(s) across ${findings.length} finding(s): ${findings.join(', ')}` +
      ' — see test-findings.md'
  );
}

// ── 5. Failures, in full ────────────────────────────────────────────────────
let failed = Object.keys(buildFailures).length > 0;

for (const [name, log] of Object.entries(buildFailures)) {
  console.error(`\n✗ ${name}: scratch consumer failed to build\n`);
  console.error(log.split('\n').slice(-25).map((l) => `    ${l}`).join('\n'));
}

for (const name of cols) {
  const bad = probeNames.filter((p) => verdicts[name][p] === BROKE);
  const fixed = probeNames.filter((p) => verdicts[name][p] === FIXED);

  if (fixed.length) {
    failed = true;
    console.error(
      `\n✗ ${name}: ${fixed.length} pinned probe(s) now pass — the pin is out of date\n`
    );
    for (const probe of fixed) {
      console.error(`    ${probe} (pinned as ${PINNED[name][probe]})`);
    }
    console.error(
      '    Remove them from PINNED in test/wrapper-runtime/contract.js and close\n' +
        '    the finding, so the capability cannot regress unnoticed.'
    );
  }

  if (!bad.length) continue;
  failed = true;
  console.error(`\n✗ ${name}: ${bad.length}/${probeNames.length} probe(s) failed\n`);
  for (const probe of bad) {
    const got = results[name].probes[probe]?.actual;
    console.error(`    ${probe}`);
    console.error(`      expected  ${JSON.stringify(expected[probe])}`);
    console.error(`      actual    ${JSON.stringify(got === undefined ? '(probe did not run)' : got)}`);
  }
  if (results[name].pageErrors.length) {
    console.error(`    page errors:`);
    for (const e of [...new Set(results[name].pageErrors)].slice(0, 5)) {
      console.error(`      ${e.split('\n')[0]}`);
    }
  }
}

// Anti-vacuity: an empty matrix reports "all green" having mounted nothing.
if (cols.length === 0 || probeNames.length < 10) {
  console.error(
    `\n✗ ${cols.length} framework(s) × ${probeNames.length} probe(s) — ` +
      'the harness is broken, not the wrappers'
  );
  failed = true;
}

if (!keep) rmSync(scratch, { recursive: true, force: true });
else console.log(`\n  scratch kept at ${scratch}`);

if (failed) {
  console.error(
    '\nEach failing probe is a capability a consumer of that package does not\n' +
      'have. The fixture apps under test/wrapper-runtime/fixtures/ are what a\n' +
      'consumer writes; the contract they are held to is test/wrapper-runtime/\n' +
      'contract.js. Re-run with --keep to inspect the built scratch app.\n'
  );
  process.exit(1);
}

console.log(
  `\n  ✓ ${cols.length} wrapper package(s) × ${probeNames.length} probe(s)` +
    `${pins.length ? `, ${pins.length} pinned` : ''} — no unexpected results\n`
);
