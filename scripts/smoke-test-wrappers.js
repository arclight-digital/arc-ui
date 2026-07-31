#!/usr/bin/env node
/**
 * smoke-test-wrappers.js — packs the real tarballs and builds real consumers.
 *
 * Everything else in this repo verifies generated *source*; nothing installs
 * what npm would actually serve. That blind spot is how the packages shipped
 * raw TypeScript entry points for years: every in-repo check resolved through
 * the workspace, where a `src/index.ts` main works fine. This script is the
 * missing consumer: `pnpm pack` (running each package's prepack build), then
 * one scratch Vite app per framework installing the tarballs by file path and
 * running a production build that imports a component through its
 * per-component subpath.
 *
 * Angular is exercised by its own build instead: ng-packagr compiles every
 * wrapper with strictTemplates, and a scratch Angular consumer means the
 * whole Angular CLI — cost out of proportion to what it would add here.
 *
 * Run via: pnpm smoke:wrappers  (needs network for the scratch apps' deps)
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const scratch = mkdtempSync(join(tmpdir(), 'arc-smoke-'));

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });

console.log(`  scratch: ${scratch}`);

// The per-icon modules are generated and gitignored; packing without them
// produces the broken tarball that shipped as v2.3.0. Fail here, with the
// fix, instead of three steps later inside a scratch app's bundler output.
if (!existsSync(resolve(root, 'packages/web-components/src/icons/phosphor/_resolver.js'))) {
  console.error('✗ generated icon modules missing — run `pnpm generate:icons` first');
  process.exit(1);
}

// ── 1. Pack the tarballs (prepack builds dist/ in every package) ────────────
const tarballs = {};
for (const pkg of ['web-components', 'react', 'preact', 'svelte', 'vue', 'solid']) {
  const out = run('pnpm', ['pack', '--pack-destination', scratch], resolve(root, 'packages', pkg));
  tarballs[pkg] = out.trim().split('\n').pop();
  console.log(`  packed ${pkg}`);
}

const INDEX_HTML =
  '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main"></script></body></html>';

/** Each consumer imports one component through a per-component subpath. */
const CONSUMERS = {
  react: {
    dependencies: {
      '@arclux/arc-ui-react': `file:${tarballs.react}`,
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: { vite: '^7.0.0' },
    entry: 'main.tsx',
    files: {
      'src/main.tsx': `
import { createRoot } from 'react-dom/client';
import { Button } from '@arclux/arc-ui-react/Button';
import { Card } from '@arclux/arc-ui-react';
createRoot(document.getElementById('root')!).render(
  <Card padding="md"><Button variant="primary">Smoke</Button></Card>
);
`,
    },
  },
  preact: {
    dependencies: {
      '@arclux/arc-ui-preact': `file:${tarballs.preact}`,
      preact: '^10.19.0',
    },
    devDependencies: { vite: '^7.0.0', '@preact/preset-vite': '^2.9.0' },
    entry: 'main.tsx',
    files: {
      'vite.config.js': `
import preact from '@preact/preset-vite';
export default { plugins: [preact()] };
`,
      'src/main.tsx': `
import { render } from 'preact';
import { Button } from '@arclux/arc-ui-preact/Button';
import { Card } from '@arclux/arc-ui-preact';
render(
  <Card padding="md"><Button variant="primary">Smoke</Button></Card>,
  document.getElementById('root')!
);
`,
    },
  },
  svelte: {
    dependencies: {
      '@arclux/arc-ui-svelte': `file:${tarballs.svelte}`,
      svelte: '^5.0.0',
    },
    devDependencies: { vite: '^7.0.0', '@sveltejs/vite-plugin-svelte': '^6.0.0' },
    entry: 'main.ts',
    files: {
      'vite.config.js': `
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default { plugins: [svelte()] };
`,
      'src/App.svelte': `
<script lang="ts">
import Card from '@arclux/arc-ui-svelte/Card';
import { Button } from '@arclux/arc-ui-svelte';
</script>
<Card padding="md"><Button variant="primary">Smoke</Button></Card>
`,
      'src/main.ts': `
import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('root')! });
`,
    },
  },
  vue: {
    dependencies: {
      '@arclux/arc-ui-vue': `file:${tarballs.vue}`,
      vue: '^3.5.0',
    },
    devDependencies: { vite: '^7.0.0' },
    entry: 'main.ts',
    files: {
      'src/main.ts': `
import { createApp, h } from 'vue';
import Card from '@arclux/arc-ui-vue/Card';
import Button from '@arclux/arc-ui-vue/Button';
createApp({
  render: () => h(Card, { padding: 'md' }, () => h(Button, {}, () => 'Smoke')),
}).mount('#root');
`,
    },
  },
  solid: {
    dependencies: {
      '@arclux/arc-ui-solid': `file:${tarballs.solid}`,
      'solid-js': '^1.9.0',
    },
    devDependencies: { vite: '^7.0.0', 'vite-plugin-solid': '^2.11.0' },
    entry: 'main.tsx',
    files: {
      'vite.config.js': `
import solid from 'vite-plugin-solid';
export default { plugins: [solid()] };
`,
      'src/main.tsx': `
import { render } from 'solid-js/web';
import { Card } from '@arclux/arc-ui-solid/Card';
import { Button } from '@arclux/arc-ui-solid';
render(
  () => <Card padding="md"><Button variant="primary">Smoke</Button></Card>,
  document.getElementById('root')!
);
`,
    },
  },
};

const MARKERS = ['arc-button', 'arc-card', 'customElements'];
let failed = false;

for (const [framework, consumer] of Object.entries(CONSUMERS)) {
  const app = join(scratch, framework);
  mkdirSync(join(app, 'src'), { recursive: true });

  writeFileSync(join(app, 'package.json'), JSON.stringify({
    name: `arc-smoke-${framework}`,
    private: true,
    type: 'module',
    dependencies: {
      '@arclux/arc-ui': `file:${tarballs['web-components']}`,
      ...consumer.dependencies,
    },
    devDependencies: consumer.devDependencies,
  }, null, 2));

  writeFileSync(join(app, 'index.html'), INDEX_HTML.replace('/src/main', `/src/${consumer.entry}`));
  for (const [rel, contents] of Object.entries(consumer.files)) {
    writeFileSync(join(app, rel), contents);
  }

  try {
    console.log(`  [${framework}] installing…`);
    run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], app);
    console.log(`  [${framework}] building…`);
    run('npx', ['vite', 'build'], app);

    const assets = join(app, 'dist', 'assets');
    const bundle = readdirSync(assets)
      .filter((f) => f.endsWith('.js'))
      .map((f) => readFileSync(join(assets, f), 'utf-8'))
      .join('');
    const missing = MARKERS.filter((m) => !bundle.includes(m));
    if (missing.length > 0) {
      console.error(`✗ [${framework}] bundle is missing: ${missing.join(', ')} — inspect ${app}`);
      failed = true;
    } else {
      console.log(`  [${framework}] ✓`);
    }
  } catch (err) {
    console.error(`✗ [${framework}] ${String(err.message).split('\n')[0]}`);
    console.error(`${err.stdout ?? ''}${err.stderr ?? ''}`.split('\n').slice(-15).join('\n'));
    console.error(`  inspect: ${app}`);
    failed = true;
  }
}

if (failed) process.exit(1);
rmSync(scratch, { recursive: true, force: true });
console.log('✓ tarballs install, compile, and register their elements in real Vite consumers (react, preact, svelte, vue, solid)');
