#!/usr/bin/env node
/**
 * Runs the custom-elements-manifest analyzer over the web-components package,
 * then strips internal state (underscore-prefixed fields/attributes) from the
 * manifest so it only describes the public API.
 *
 * Output: packages/web-components/custom-elements.json
 * (Called automatically by `pnpm generate`)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wcDir = resolve(__dirname, '../../packages/web-components');
const manifestPath = resolve(wcDir, 'custom-elements.json');

execFileSync('pnpm', ['exec', 'custom-elements-manifest', 'analyze'], {
  cwd: wcDir,
  stdio: ['inherit', 'pipe', 'pipe'],
});

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

// The analyzer emits modules in filesystem-glob order, which is not stable
// across machines — sort by path so the output is deterministic (the CI
// generate-diff gate depends on this).
manifest.modules.sort((a, b) => (a.path ?? '').localeCompare(b.path ?? ''));

for (const mod of manifest.modules) {
  for (const decl of mod.declarations ?? []) {
    if (decl.members) {
      decl.members = decl.members.filter((m) => !m.name?.startsWith('_'));
    }
    if (decl.attributes) {
      decl.attributes = decl.attributes.filter((a) => !a.name?.startsWith('_'));
    }
    // Dynamic event names (dispatchEvent(new CustomEvent(variable))) come out
    // of the analyzer as nameless entries — junk for every downstream consumer.
    if (decl.events) {
      decl.events = decl.events.filter((e) => e.name);
    }
    // `@slot none` is prism's spelling for "this component has no default slot
    // and its wrappers take no children" — the name of an absence, which the
    // analyzer has no reason to know and records as a slot called "none".
    // Left in, every downstream reader repeats it: the manifest, the VS Code
    // and JetBrains data, the docs tables. Nothing here has a slot named none.
    if (decl.slots) {
      decl.slots = decl.slots.filter((s) => s.name !== 'none');
    }
  }
}


/**
 * Fill in defaults the analyzer cannot see.
 *
 * The analyzer reads a default from a constructor assignment. Since the
 * declared-props vocabulary landed, the default lives in the *declaration*
 * (`flag(true, …)`, `oneOf([…], { default })`) and the constructor assignment
 * is gone — so regenerating dropped 588 `default` entries across the manifest,
 * silently, and every downstream reader (docs tables, VS Code and JetBrains
 * data, prism) would have shipped without them.
 *
 * Parsed statically rather than by importing the component: these four helpers
 * have simple, closed default rules, and evaluating a component module in Node
 * would need a DOM.
 *
 * A computed default (`default: () => new Date().getMonth()`) is deliberately
 * skipped — it has no serialisable value to publish, and "the current month" is
 * documented in prose on the prop.
 *
 * **`type` and `reflects` go the same way, for the same reason.** The first
 * pass at this file restored `default` only, and the loss was wider than one
 * key: against the pre-vocabulary manifest, 34 members and 50 attributes also
 * lost `type.text` and 359 members lost `reflects`. That was invisible to every
 * gate in the repo — `pnpm generate` is diff-clean because the manifest is
 * generated, `pnpm check` reads the manifest and so agrees with whatever it
 * says, and the derived suites derive from it too. The one thing that did
 * notice was `ng-packagr`: `types/index.d.ts` degraded `nowrap: boolean` to
 * `nowrap: unknown` while the Angular wrapper's generated getter still returned
 * `boolean`, and the Angular package stopped compiling. Found by the wrapper
 * runtime harness (V4-PLAN 2.4a), which cannot pack a tarball that will not
 * build.
 *
 * The values are not invented here. `flag()` and `oneOf()` default to
 * `reflect: true`, `num()`/`int()` to `reflect: false` — props.js:99, 165, 187 —
 * and an explicit `reflect:` in the declaration overrides. `type` is whatever
 * Lit is handed: `Boolean`, `String`/`Number` for `oneOf` by its members,
 * `Number` for the numeric pair.
 *
 * Only ever *fills a gap*: a `@prop {'sm' | 'md'} size` JSDoc already gives the
 * analyzer a richer union type than the declaration can, and that keeps winning.
 */
const DECL = /^\s*(\w+):\s*(flag|oneOf|num|int)\(([\s\S]*?)\),?\s*$/gm;

/** Serialise a JS value the way the analyzer spells defaults. */
const spell = (v) => (typeof v === 'string' ? `'${v}'` : String(v));

/**
 * Parse every vocabulary declaration in a component source into the three
 * facts the analyzer cannot read out of a function call.
 *
 * @returns {Map<string, {default?: unknown, type: string, reflects: boolean}>}
 */
function declaredContracts(source) {
  const out = new Map();
  for (const m of source.matchAll(DECL)) {
    const [, name, helper, rawArgs] = m;
    const args = rawArgs.trim();

    // An explicit `reflect:` wins; otherwise the helper's own default applies.
    const explicitReflect = args.match(/\breflect:\s*(true|false)\b/);
    const reflects = explicitReflect
      ? explicitReflect[1] === 'true'
      : helper === 'flag' || helper === 'oneOf';

    const entry = { reflects };

    // A computed default has no serialisable value to publish, but its `type`
    // and `reflects` are as knowable as any other declaration's.
    const computed = /default:\s*\(/.test(args) || /default:\s*function/.test(args);

    if (helper === 'flag') {
      entry.type = 'boolean';
      const lead = args.match(/^(true|false)\b/);
      if (!computed) entry.default = lead ? lead[1] === 'true' : false;
    } else if (helper === 'oneOf') {
      const list = args.match(/^\[([\s\S]*?)\]/);
      if (!list) continue;
      const members = list[1].split(',').map((x) => x.trim()).filter(Boolean);
      // `oneOf` is String-typed unless every member is a number — props.js:150,
      // where a closed numeric set (time-picker's `step`) is a real contract and
      // not a range.
      const numeric = members.length > 0 && members.every((v) => /^-?[\d.]+$/.test(v));
      entry.type = numeric
        ? 'number'
        : members.map((v) => `'${v.replace(/^['"]|['"]$/g, '')}'`).join(' | ');

      if (!computed) {
        const explicit = args.match(/default:\s*([^,}\n]+)/);
        const raw = (explicit ? explicit[1] : members[0] ?? '').trim();
        if (!raw) continue;
        const unquoted = raw.replace(/^['"]|['"]$/g, '');
        entry.default = /^-?[\d.]+$/.test(unquoted) ? Number(unquoted) : unquoted;
      }
    } else {
      entry.type = 'number';
      if (!computed) {
        const explicit = args.match(/default:\s*(-?[\d.]+)/);
        entry.default = explicit ? Number(explicit[1]) : 0;
      }
    }
    out.set(name, entry);
  }
  return out;
}

let filled = 0;

/**
 * Fill `default`, `type` and `reflects` on one member or attribute entry.
 *
 * `reflects` is a member-only key: the analyzer records reflection on the field
 * and never on the attribute entry, and writing it in both places puts 359
 * spurious keys into the manifest that no pre-vocabulary version ever had.
 */
function backfill(node, contract, { isMember }) {
  if (node.default === undefined && contract.default !== undefined) {
    node.default = spell(contract.default);
    filled += 1;
  }
  // The JSDoc type is richer than the declaration wherever it exists, so this
  // only ever fills an absence.
  if (!node.type?.text) {
    node.type = { text: contract.type };
    filled += 1;
  }
  // The analyzer writes `reflects` only when true and omits it otherwise, so a
  // non-reflecting prop is spelled by the key's absence, not by `false`.
  if (isMember && contract.reflects && !node.reflects) {
    node.reflects = true;
    filled += 1;
  }
}

/**
 * A mixin's declarations land on every component that applies it, and appear in
 * none of their sources — `required` and `readonly` are declared once, in
 * `FormControlMixin`, and inherited by 27 controls. Reading component sources
 * alone leaves those 27 × 2 with no type and no reflection, which is 76 of the
 * 84 entries the first pass still missed.
 *
 * Mixins only. `shared/option.js` and `shared/menu-item.js` also declare
 * vocabulary props, but they are base classes with their own manifest modules,
 * so their own sources are already read on their own pass.
 */
const inherited = new Map();
for (const file of readdirSync(resolve(wcDir, 'src/shared'))) {
  if (!file.endsWith('-mixin.js')) continue;
  const source = readFileSync(resolve(wcDir, 'src/shared', file), 'utf-8');
  for (const [name, contract] of declaredContracts(source)) inherited.set(name, contract);
}

for (const mod of manifest.modules) {
  const file = resolve(wcDir, mod.path ?? '');
  if (!existsSync(file)) continue;
  const own = declaredContracts(readFileSync(file, 'utf-8'));
  // A component's own declaration wins; the mixin's only fills what it never
  // declared.
  const contractFor = (name) => own.get(name) ?? inherited.get(name);

  for (const decl of mod.declarations ?? []) {
    for (const member of decl.members ?? []) {
      const contract = contractFor(member.name);
      if (contract) backfill(member, contract, { isMember: true });
    }
    for (const attr of decl.attributes ?? []) {
      const contract = contractFor(attr.fieldName ?? attr.name);
      if (contract) backfill(attr, contract, { isMember: false });
    }
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const count = manifest.modules
  .flatMap((m) => m.declarations ?? [])
  .filter((d) => d.customElement && d.tagName).length;
console.log(
  `✓ custom-elements.json — ${count} custom elements, ${filled} facts recovered from declarations`
);
