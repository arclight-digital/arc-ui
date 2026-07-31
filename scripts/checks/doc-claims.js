#!/usr/bin/env node
/**
 * check-doc-claims.js
 *
 * Asserts that a component's class JSDoc does not claim a surface it doesn't
 * have. Three claims, one failure mode each:
 *
 *   @csspart x  →  nothing renders `part="x"`, so `::part(x)` silently selects
 *                  nothing and the consumer's styling never applies.
 *   @fires x    →  nothing ever dispatches `x`, so a listener never fires and
 *                  the consumer waits forever for an event that isn't coming.
 *   @prop x     →  `x` is neither a reactive property nor an accessor, so
 *                  setting it does nothing and reading it returns undefined.
 *
 * All three are invisible: the docs say it exists, the generated wrappers and
 * the manifest repeat the claim, and nothing renders an error. That is the same
 * shape as the icon-name bug (see check-icon-names.js), where four buttons were
 * blank for the life of the component because a missing thing failed quietly.
 *
 * The claims flow outward — into custom-elements.json, the VS Code and JetBrains
 * data, the docs site tables, and six framework wrapper packages — so a false
 * claim is repeated everywhere rather than confined to one file.
 *
 * WHAT IS NOT A FAILURE, and why each allowance exists:
 *
 *   - A prop provided by a mixin. FormControlMixin declares `required` and
 *     `readonly` in its own `static properties`, and Lit merges them up the
 *     chain, so a consuming component documents them without declaring them.
 *   - A prop implemented as an accessor. `get value()` / `set value()` is a
 *     real property; arc-date-range-picker and arc-menu-item both do this.
 *   - An event whose name is computed. `new CustomEvent(this.open ? 'arc-open'
 *     : 'arc-close')` dispatches two events from one call site, and arc-top-bar
 *     picks its name into a variable first. So a documented name counts as
 *     dispatched if the literal appears anywhere in the code below the class
 *     JSDoc — looser than matching a dispatch site, and deliberately: the point
 *     is to catch a name that exists *nowhere*, not to police how it is built.
 *   - A part rendered by a shared style helper or a child component that
 *     re-exports it via `exportparts`.
 *
 * Run via: pnpm check doc-claims (and as part of pnpm generate)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const SRC = path.join(root, 'packages/web-components/src');

/** Reactive properties a mixin contributes to every consumer. */
function mixinProps() {
  const out = new Map();
  const dir = path.join(SRC, 'shared');
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('-mixin.js')) continue;
    const src = fs.readFileSync(path.join(dir, file), 'utf-8');
    const block = src.match(/static properties = \{([\s\S]*?)\n\s*\};/);
    const names = block ? [...block[1].matchAll(/^\s*([\w]+):/gm)].map((m) => m[1]) : [];
    // Accessors a mixin defines are equally real (`get form()`, `get validity()`).
    for (const m of src.matchAll(/^\s*(?:get|set)\s+([\w]+)\s*\(/gm)) names.push(m[1]);
    const mixinName = src.match(/export const (\w+) = /)?.[1];
    if (mixinName) out.set(mixinName, new Set(names));
  }
  return out;
}

const MIXINS = mixinProps();

/** Everything a shared module exports as `part="…"`, for helper-rendered parts. */
function sharedParts() {
  const out = new Set();
  for (const dir of [path.join(SRC, 'shared'), SRC]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.js')) continue;
      const src = fs.readFileSync(path.join(dir, file), 'utf-8');
      for (const m of src.matchAll(/part="([^"$]+)"/g)) {
        for (const p of m[1].split(/\s+/)) out.add(p);
      }
    }
  }
  return out;
}

const SHARED_PARTS = sharedParts();

const findings = [];
let checked = 0;

for (const tier of fs.readdirSync(SRC, { withFileTypes: true })) {
  if (!tier.isDirectory() || tier.name === 'icons' || tier.name === 'generated') continue;
  const dir = path.join(SRC, tier.name);

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file.endsWith('.register.js') || file === 'index.js') continue;
    const src = fs.readFileSync(path.join(dir, file), 'utf-8');
    const classAt = src.search(/^export class /m);
    if (classAt === -1) continue;
    const doc = src.slice(0, classAt);
    const code = src.slice(classAt);
    const where = `${tier.name}/${file}`;
    checked++;

    // ── @csspart ────────────────────────────────────────────
    const rendered = new Set(SHARED_PARTS);
    for (const m of src.matchAll(/part="([^"$]+)"/g)) {
      for (const p of m[1].split(/\s+/)) rendered.add(p);
    }
    // A dynamic `part=${…}` means the set can't be known; don't guess.
    const dynamicParts = /part=\$\{/.test(src);
    if (!dynamicParts) {
      for (const [, name] of doc.matchAll(/@csspart\s+([\w-]+)/g)) {
        if (!rendered.has(name)) {
          findings.push(`${where}: @csspart ${name} — nothing renders part="${name}"`);
        }
      }
    }

    // ── @fires ──────────────────────────────────────────────
    const literals = new Set([...code.matchAll(/['"`]([\w-]+)['"`]/g)].map((m) => m[1]));
    for (const [, name] of doc.matchAll(/@fires\s+(?:\{[^}]*\}\s*)?([\w-]+)/g)) {
      if (!literals.has(name)) {
        findings.push(`${where}: @fires ${name} — that name is dispatched nowhere`);
      }
    }

    // ── @prop ───────────────────────────────────────────────
    const propsBlock = code.match(/static properties = \{([\s\S]*?)\n\s*\};/);
    const declared = new Set(
      propsBlock ? [...propsBlock[1].matchAll(/^\s*([\w]+):/gm)].map((m) => m[1]) : []
    );
    for (const m of code.matchAll(/^\s*(?:get|set)\s+([\w]+)\s*\(/gm)) declared.add(m[1]);
    // Mixins in the extends clause contribute their own properties.
    const extendsClause = code.match(/^export class \w+ extends ([^{]+)\{/m)?.[1] ?? '';
    for (const [name, props] of MIXINS) {
      if (extendsClause.includes(name)) for (const p of props) declared.add(p);
    }
    for (const [, name] of doc.matchAll(/@prop\s+(?:\{[^}]*\}\s*)?([\w]+)/g)) {
      if (!declared.has(name)) {
        findings.push(`${where}: @prop ${name} — not a reactive property or accessor`);
      }
    }
  }
}

if (findings.length > 0) {
  console.error(`check-doc-claims: ${findings.length} documented surface(s) that do not exist\n`);
  console.error(findings.map((f) => `  ${f}`).join('\n'));
  console.error(
    '\nEach of these is repeated into custom-elements.json, the editor data, the\n' +
    'docs tables and six wrapper packages. Either implement it or stop claiming it.'
  );
  process.exit(1);
}

console.log(`check-doc-claims: ${checked} components claim no surface they lack`);
