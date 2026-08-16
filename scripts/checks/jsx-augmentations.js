/**
 * The JSX augmentations are compiled, not asserted.
 *
 * `types/<framework>-jsx.d.ts` types ARC's tags for a consumer who renders
 * `<arc-input>` directly instead of importing a wrapper. React has shipped one
 * since v3; 4.6 gives Preact and Solid the same, beside their packages rather
 * than instead of them.
 *
 * This check exists because of what building the other two turned up. The
 * React file's *content* was correct — the tags were there, the enums were
 * unions — and both activation instructions in its own header were wrong:
 *
 *     { "compilerOptions": { "types": ["@arclux/arc-ui/react-jsx"] } }   ✗
 *     /// <reference types="@arclux/arc-ui/react-jsx" />                 ✗
 *
 * TypeScript resolves a `types` entry as a *package* — `node_modules/@types/
 * <name>`, or `<name>/package.json#types` — and never follows an export-map
 * subpath. So `@arclux/arc-ui/react-jsx` resolved to nothing, nothing was
 * included, and every tag stayed untyped. No diagnostic, because a `types`
 * entry that resolves to nothing is not an error. The instruction shipped for a
 * release and could not have been caught by reading it.
 *
 * So the fixture below is the documented instruction, executed. Two assertions
 * per framework, and the second is the one that matters:
 *
 *   a valid usage compiles — the augmentation is present and reached;
 *   an invalid enum value fails — the tag is not typed loosely. This one is
 *     belt and braces: under `strict`, an unreached augmentation usually fails
 *     the first assertion instead. It guards the case the Solid wrappers are
 *     already in, where the tag *is* declared and declared as
 *     `Record<string, unknown>`, which accepts anything.
 *
 * Three real defects have failed it so far, which is the only evidence worth
 * having: an augmentation aimed at `solid-js` instead of `solid-js/jsx-runtime`
 * (silently inert under the standard Solid setup), a `files` entry reaching
 * outside the project (accepted, loads nothing, reports nothing), and the
 * `types`-entry instruction above.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const TSC = path.join(ROOT, 'node_modules', '.bin', 'tsc');
const TYPES_DIR = path.join(ROOT, 'packages', 'web-components', 'types');

/**
 * One fixture per framework.
 *
 * `jsxImportSource` is the difference that matters: React resolves JSX through
 * `react/jsx-runtime` and Solid through `solid-js/jsx-runtime`, and an
 * augmentation written against the wrong one type-checks as `any` rather than
 * failing. Each fixture compiles in a package that already has that framework
 * installed, so this is the resolution a consumer gets.
 */
const TARGETS = [
  {
    file: 'react-jsx.d.ts',
    pkg: 'packages/react',
    jsx: 'react-jsx',
    jsxImportSource: undefined,
  },
  {
    file: 'preact-jsx.d.ts',
    pkg: 'packages/preact',
    jsx: 'react-jsx',
    jsxImportSource: 'preact',
  },
  {
    file: 'solid-jsx.d.ts',
    pkg: 'packages/solid',
    jsx: 'preserve',
    jsxImportSource: 'solid-js',
  },
];

/* A tag and an enum that exist on it. Read from the emitted file rather than
   hard-coded, so a rename of either does not turn this check green by
   accident — it fails loudly with "no enum attribute found" instead. */
function probeCase(declaration) {
  // Each tag's block, bounded — a pattern allowed to run past `};` matches an
  // attribute belonging to a later tag, which is how the first version of this
  // asked arc-accordion about a date picker's weekStart.
  for (const block of declaration.matchAll(/'(arc-[\w-]+)': ArcBaseAttributes & \{\n([^}]*)\n {6}\};/g)) {
    const [, tag, body] = block;
    const attr = /^ {8}(\w+)\?: ('[^;]*'(?: \| '[^;]*')+);$/m.exec(body);
    if (!attr) continue;
    const members = [...attr[2].matchAll(/'([^']*)'/g)].map((m) => m[1]).filter(Boolean);
    if (!members.length) continue;
    return { tag, attr: attr[1], valid: members[0] };
  }
  return null;
}

const failures = [];

for (const target of TARGETS) {
  const declaration = fs.readFileSync(path.join(TYPES_DIR, target.file), 'utf-8');
  const probe = probeCase(declaration);
  if (!probe) {
    failures.push({ file: target.file, msg: 'no tag with an enum attribute found — cannot test' });
    continue;
  }

  /* Inside the package, not in os.tmpdir(): `jsxImportSource: 'solid-js'` and
     the framework's own types resolve by walking up from the *file*, so a
     fixture in /tmp finds neither. Removed in the finally below. */
  const pkgDir = path.join(ROOT, target.pkg);
  const dir = fs.mkdtempSync(path.join(pkgDir, '.arc-jsx-probe-'));

  /* Reached through the package's own node_modules link, which is the path a
     consumer writes — and the only one that works. A `files` entry pointing
     *outside* the project (../../web-components/types/…) is accepted, loads
     nothing, and reports nothing: the tags stay untyped exactly as they do
     under the wrong `types` instruction. Two ways to silently not apply an
     augmentation is why this check compiles rather than reads. */
  const installed = path.join(pkgDir, 'node_modules', '@arclux', 'arc-ui', 'types', target.file);
  if (!fs.existsSync(installed)) {
    failures.push({
      file: target.file,
      msg: `not reachable at ${target.pkg}/node_modules/@arclux/arc-ui/types/ — run pnpm install`,
    });
    fs.rmSync(dir, { recursive: true, force: true });
    continue;
  }
  const relTypes = path.relative(dir, installed).split(path.sep).join('/');

  const write = (name, body) => {
    fs.writeFileSync(path.join(dir, name), body);
    return `./${name}`;
  };

  const good = write('good.tsx', `export const Ok = () => <${probe.tag} ${probe.attr}="${probe.valid}" />;\n`);
  const bad = write('bad.tsx', `export const No = () => <${probe.tag} ${probe.attr}="not-a-member" />;\n`);

  const config = (entry) => ({
    compilerOptions: {
      target: 'es2022',
      module: 'esnext',
      moduleResolution: 'bundler',
      jsx: target.jsx,
      ...(target.jsxImportSource ? { jsxImportSource: target.jsxImportSource } : {}),
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
    },
    // The documented instruction: the .d.ts joins the program as a file.
    files: [relTypes, entry],
  });

  const run = (entry, label) => {
    const cfg = path.join(dir, `tsconfig.${label}.json`);
    fs.writeFileSync(cfg, JSON.stringify(config(entry), null, 2));
    try {
      execFileSync(TSC, ['-p', cfg], { cwd: dir, stdio: 'pipe' });
      return null;
    } catch (e) {
      return `${e.stdout ?? ''}${e.stderr ?? ''}`.trim();
    }
  };

  const goodErr = run(good, 'good');
  if (goodErr) {
    failures.push({
      file: target.file,
      msg: `<${probe.tag} ${probe.attr}="${probe.valid}"> should compile`,
      detail: goodErr.split('\n').slice(0, 4).join('\n'),
    });
  }

  const badErr = run(bad, 'bad');
  if (!badErr) {
    failures.push({
      file: target.file,
      msg:
        `<${probe.tag} ${probe.attr}="not-a-member"> compiled, so the augmentation is not ` +
        `reaching the tag — it is typed as any`,
    });
  }

  fs.rmSync(dir, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} JSX augmentation problem(s):\n`);
  for (const f of failures) {
    console.error(`  types/${f.file}  ${f.msg}`);
    if (f.detail) console.error(`${f.detail.replace(/^/gm, '      ')}\n`);
  }
  console.error(
    `\n  These files are only worth shipping if a consumer can switch them on. The\n` +
      `  activation instruction lives in each file's header and is generated by\n` +
      `  scripts/generate/types.js — a \`types\` entry naming an export subpath\n` +
      `  resolves to nothing and reports nothing, which is how the React one\n` +
      `  shipped wrong for a release.\n`,
  );
  process.exit(1);
}

console.log(`✓ ${TARGETS.length} JSX augmentations compile, and reject a bad enum value`);
