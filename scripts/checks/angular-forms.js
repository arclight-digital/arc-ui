/**
 * Every form-associated element has a working Angular accessor.
 *
 * `scripts/generate/angular-cva.js` writes them, and it already fails loudly
 * when it cannot find what it needs to rewrite. That covers the pass not
 * running. It does not cover the pass running and being *wrong* — an accessor
 * bound to a property the element does not have, or registered under a
 * `forwardRef` to a different class, both of which compile and both of which
 * fail at runtime as a form control that never updates.
 *
 * So this reads the finished Angular sources and checks the three facts that
 * make `formControlName` work, against the element's own declarations rather
 * than against the generator's intent:
 *
 *   1. the class implements ControlValueAccessor and provides NG_VALUE_ACCESSOR
 *      under a forwardRef to itself — Angular silently uses no accessor if the
 *      provider is missing, which is the state all 27 were in before v4;
 *   2. it commits on an event the element actually emits;
 *   3. it binds a property the element actually declares.
 *
 * The set is derived, not listed: `static formAssociated = true` is the
 * platform's own definition of a form control, so a 28th one is covered by
 * writing it rather than by remembering this file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const WC_SRC = path.join(ROOT, 'packages', 'web-components', 'src');
const NG_SRC = path.join(ROOT, 'packages', 'angular', 'src');

/** Components whose class is form-associated, as `tier/name`. */
function formControls() {
  const found = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'generated' && entry.name !== 'icons') walk(full);
      } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.register.js')) {
        const src = fs.readFileSync(full, 'utf-8');
        if (!/FormControlMixin\(/.test(src)) continue;
        found.push({ rel: path.relative(WC_SRC, full).replace(/\.js$/, ''), src });
      }
    }
  })(WC_SRC);
  return found;
}

const pascal = (name) =>
  name
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');

const failures = [];
let checked = 0;

for (const { rel, src } of formControls()) {
  const file = path.join(NG_SRC, path.dirname(rel), `${pascal(path.basename(rel))}.ts`);
  const at = (msg) => failures.push({ rel, msg });

  if (!fs.existsSync(file)) {
    at(`no Angular wrapper at ${path.relative(ROOT, file)}`);
    continue;
  }
  const ng = fs.readFileSync(file, 'utf-8');
  const cls = /export class (\w+)/.exec(ng)?.[1];

  // 1. Registered, and registered as itself.
  if (!/implements ControlValueAccessor/.test(ng)) {
    at('does not implement ControlValueAccessor — formControlName binds nothing');
  }
  if (!ng.includes(`useExisting: forwardRef(() => ${cls})`)) {
    at(
      `does not provide NG_VALUE_ACCESSOR under forwardRef(() => ${cls}) — Angular ` +
        `falls back to no accessor without a diagnostic`,
    );
  }

  // 2. Commits on an event the element emits.
  const commit = /addEventListener\('([\w-]+)'/.exec(ng)?.[1];
  if (!commit) {
    at('never listens for a commit event, so the form is never told the value changed');
  } else if (!src.includes(`'${commit}'`)) {
    at(`commits on '${commit}', which ${path.basename(rel)} does not emit`);
  }

  // 3. Binds properties the element declares. `writeValue` assigns each of
  //    them, which is also what makes the composite controls checkable.
  const assigned = [...ng.matchAll(/this\._el\.(\w+) = next(?:\.(\w+))?;/g)].map((m) => m[1]);
  if (!assigned.length) {
    at('writeValue assigns nothing, so the form cannot push a value into the element');
  }
  for (const prop of assigned) {
    if (new RegExp(`^\\s{4}${prop}:`, 'm').test(src)) continue;
    at(`writeValue assigns \`${prop}\`, which ${path.basename(rel)} does not declare`);
  }

  checked++;
}

if (checked === 0) {
  failures.push({ rel: '(none)', msg: 'no form-associated components found — is this the right tree?' });
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} Angular form-control problem(s):\n`);
  for (const f of failures) console.error(`  ${f.rel}\n    ${f.msg}\n`);
  console.error(
    `  These are written by scripts/generate/angular-cva.js, which rewrites prism's\n` +
      `  output and is therefore coupled to prism's formatting. If prism changed the\n` +
      `  shape of an Angular wrapper, that pass is where to look. See PRISM-3.md §2.1.\n`,
  );
  process.exit(1);
}

console.log(`✓ ${checked} form-associated elements bind to Angular forms`);
