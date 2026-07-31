/**
 * check-prop-unions.js
 *
 * Asserts that every string-literal union on a component reaches the generated
 * framework wrappers intact — whether it was documented on the class or
 * inferred by prism from CSS.
 *
 * This exists because the failure it catches is invisible from inside this
 * repo: nothing here consumes the wrappers, so a prop typed `string` instead of
 * `'line' | 'bar'`, or a union silently missing the component's own default
 * value, compiles fine here and only surfaces in a consuming app.
 *
 * Prism derives unions from the JSDoc `@prop {'a' | 'b'} name` annotation, and
 * falls back to scanning CSS `:host([prop="value"])` selectors when there is no
 * annotation. That fallback structurally cannot see the default — the default
 * variant is the base style and has no attribute selector — so a prop relying
 * on it ships a union its own default does not satisfy. This check is what
 * keeps that from coming back.
 *
 * Svelte is the probe: it is generated from the same PropMeta as the other five
 * wrappers, so a union that survives here survived everywhere.
 *
 * Run via: pnpm check prop-unions (and as part of pnpm generate)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');
const SRC = path.join(root, 'packages', 'web-components', 'src');
const SVELTE = path.join(root, 'packages', 'svelte', 'src');

const TIERS = ['content', 'data', 'feedback', 'input', 'layout', 'navigation', 'typography'];
const pascal = (s) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

const collapsed = [];
const missingDefault = [];
const missingMember = [];
const inferredMissingDefault = [];
let checked = 0;

for (const tier of TIERS) {
  const dir = path.join(SRC, tier);
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file.endsWith('.register.js') || file === 'index.js') continue;

    const name = file.replace(/\.js$/, '');
    const source = fs.readFileSync(path.join(dir, file), 'utf-8');
    const wrapperPath = path.join(SVELTE, tier, `${pascal(name)}.svelte`);
    if (!fs.existsSync(wrapperPath)) continue;
    const wrapper = fs.readFileSync(wrapperPath, 'utf-8');

    const documented = new Set();

    for (const m of source.matchAll(/@prop \{([^}]*'[^}]*)\} (\w+)/g)) {
      const [, typeText, prop] = m;
      const members = [...typeText.matchAll(/'([^']+)'/g)].map((x) => x[1]);
      if (members.length < 2) continue;
      documented.add(prop);

      const declared = wrapper.match(new RegExp(`^\\s*${prop}\\?:\\s*(.+?);`, 'm'));
      if (!declared) continue;
      const generated = declared[1].trim();
      checked++;

      if (generated === 'string') {
        collapsed.push(`${name}.${prop} — documented ${members.join(' | ')}, generated \`string\``);
        continue;
      }

      const absent = members.filter((v) => !generated.includes(`'${v}'`));
      if (absent.length) {
        missingMember.push(
          `${name}.${prop} — documented ${absent.map((v) => `'${v}'`).join(', ')} absent from ${generated}`,
        );
        continue;
      }

      const def = source.match(new RegExp(`this\\.${prop}\\s*=\\s*'([^']*)'`));
      if (def && members.includes(def[1]) && !generated.includes(`'${def[1]}'`)) {
        missingDefault.push(`${name}.${prop} — default '${def[1]}' not assignable to ${generated}`);
      }
    }

    // Undocumented props still get a union from prism's CSS fallback, and that
    // path cannot see the default — the default variant is the base style, so
    // it has no :host([prop="value"]) selector to be inferred from. Checking
    // only annotated props would leave exactly the half the fallback gets wrong.
    const propsBlock = source.match(/static properties = \{([\s\S]*?)\n\s{2}\};/);
    for (const p of propsBlock ? propsBlock[1].matchAll(/^\s*(\w+):/gm) : []) {
      const prop = p[1];
      if (prop.startsWith('_') || documented.has(prop)) continue;

      const declared = wrapper.match(new RegExp(`^\\s*${prop}\\?:\\s*(.+?);`, 'm'));
      if (!declared) continue;
      const generated = declared[1].trim();
      if (!generated.includes("'")) continue; // not a union — nothing inferred
      checked++;

      const def = source.match(new RegExp(`this\\.${prop}\\s*=\\s*'([^']+)'`));
      if (def && !generated.includes(`'${def[1]}'`)) {
        inferredMissingDefault.push(
          `${name}.${prop} — default '${def[1]}' not assignable to ${generated} (inferred from CSS; document the union)`,
        );
      }
    }
  }
}

const groups = [
  ['union collapsed to `string`', collapsed],
  ['documented member missing', missingMember],
  ['default value not in its own union', missingDefault],
  ['default value missing from a CSS-inferred union', inferredMissingDefault],
];
const total = groups.reduce((n, [, rows]) => n + rows.length, 0);

if (total === 0) {
  console.log(`check-prop-unions: ${checked} documented unions reach the wrappers intact`);
  process.exit(0);
}

console.error(`check-prop-unions: ${total} prop(s) lost type information in generation\n`);
for (const [label, rows] of groups) {
  if (!rows.length) continue;
  console.error(`  ${label}:`);
  for (const row of rows) console.error(`    ${row}`);
  console.error('');
}
console.error(
  'Document the union on the component class as `@prop {\'x\' | \'y\'} name` — since\n' +
    'prism 2.4.0 that is authoritative and does not require a CSS selector to infer from.',
);
process.exit(1);
