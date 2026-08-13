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
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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
 */
const DECL = /^\s*(\w+):\s*(flag|oneOf|num|int)\(([\s\S]*?)\),?\s*$/gm;

/** Serialise a JS value the way the analyzer spells defaults. */
const spell = (v) => (typeof v === 'string' ? `'${v}'` : String(v));

function declaredDefaults(source) {
  const out = new Map();
  for (const m of source.matchAll(DECL)) {
    const [, name, helper, rawArgs] = m;
    const args = rawArgs.trim();
    if (/default:\s*\(/.test(args) || /default:\s*function/.test(args)) continue; // computed

    if (helper === 'flag') {
      const lead = args.match(/^(true|false)\b/);
      out.set(name, lead ? lead[1] === 'true' : false);
    } else if (helper === 'oneOf') {
      const list = args.match(/^\[([\s\S]*?)\]/);
      if (!list) continue;
      const members = list[1].split(',').map((x) => x.trim()).filter(Boolean);
      const explicit = args.match(/default:\s*([^,}\n]+)/);
      const raw = (explicit ? explicit[1] : members[0] ?? '').trim();
      if (!raw) continue;
      const unquoted = raw.replace(/^['"]|['"]$/g, '');
      out.set(name, /^-?[\d.]+$/.test(unquoted) ? Number(unquoted) : unquoted);
    } else {
      const explicit = args.match(/default:\s*(-?[\d.]+)/);
      out.set(name, explicit ? Number(explicit[1]) : 0);
    }
  }
  return out;
}

let filled = 0;
for (const mod of manifest.modules) {
  const file = resolve(wcDir, mod.path ?? '');
  if (!existsSync(file)) continue;
  const defaults = declaredDefaults(readFileSync(file, 'utf-8'));
  if (!defaults.size) continue;

  for (const decl of mod.declarations ?? []) {
    for (const member of decl.members ?? []) {
      if (member.default === undefined && defaults.has(member.name)) {
        member.default = spell(defaults.get(member.name));
        filled += 1;
      }
    }
    for (const attr of decl.attributes ?? []) {
      const name = attr.fieldName ?? attr.name;
      if (attr.default === undefined && defaults.has(name)) {
        attr.default = spell(defaults.get(name));
        filled += 1;
      }
    }
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const count = manifest.modules
  .flatMap((m) => m.declarations ?? [])
  .filter((d) => d.customElement && d.tagName).length;
console.log(`✓ custom-elements.json — ${count} custom elements, ${filled} defaults from declarations`);
