#!/usr/bin/env node
/**
 * check-icon-names.js
 *
 * Asserts that every icon name ARC UI's own components ask for resolves in
 * *both* icon libraries.
 *
 * The failure this catches renders an empty box, silently. arc-transfer-list
 * asked for `chevron-right`, `chevrons-right`, `chevron-left` and
 * `chevrons-left` — all four are Lucide spellings, and the default library is
 * Phosphor, which calls them `caret-*`. `iconRegistry.get()` returns null for an
 * unknown name, arc-icon renders nothing, and no error appears anywhere. The
 * component's four move buttons were blank from the day it shipped.
 *
 * Both libraries are checked, not just the default: a consumer may call
 * `iconRegistry.use('lucide')`, and a built-in component must not break when
 * they do. Where the two libraries disagree on a name — and for the carets they
 * disagree completely, with no spelling present in both — icon-registry.js
 * carries an alias map, which this check resolves through before looking up.
 *
 * Consumer-supplied names are out of scope; they get the runtime warning in
 * arc-icon instead.
 *
 * Run via: pnpm run check:icon-names (and as part of pnpm generate)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SRC = path.join(root, 'packages/web-components/src');
const LIBRARIES = ['phosphor', 'lucide'];

/** Icon names available in a library, read from its generated resolver. */
function libraryNames(lib) {
  const file = path.join(SRC, 'icons', lib, '_resolver.js');
  const src = fs.readFileSync(file, 'utf-8');
  return new Set([...src.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]));
}

/** The alias map as icon-registry.js declares it, so the two cannot drift. */
function aliases() {
  const src = fs.readFileSync(path.join(SRC, 'content/icon-registry.js'), 'utf-8');
  const block = src.match(/const ALIASES = \{([\s\S]*?)\n\};/);
  if (!block) {
    console.error('check-icon-names: could not find ALIASES in icon-registry.js');
    process.exit(1);
  }
  // Keyed on structure rather than indentation: a reformat must not silently
  // empty this map, because an empty map makes every aliased name look broken
  // — or, worse in the other direction, would hide a real one.
  const out = {};
  let lib = null;
  for (const line of block[1].split('\n')) {
    const libMatch = line.match(/^\s*(\w+):\s*\{\s*$/);
    if (libMatch) { lib = libMatch[1]; out[lib] = {}; continue; }
    const pair = line.match(/^\s*'([^']+)':\s*'([^']+)'/);
    if (pair && lib) out[lib][pair[1]] = pair[2];
  }
  const total = Object.values(out).reduce((n, m) => n + Object.keys(m).length, 0);
  if (total === 0) {
    console.error('check-icon-names: parsed ALIASES as empty — the map or this parser has drifted');
    process.exit(1);
  }
  return out;
}

/** Icon names hard-coded in component templates, with where they came from. */
function usedNames() {
  const found = [];
  for (const tier of fs.readdirSync(SRC, { withFileTypes: true })) {
    if (!tier.isDirectory() || tier.name === 'icons') continue;
    const dir = path.join(SRC, tier.name);
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.js') || file.endsWith('.register.js')) continue;
      const src = fs.readFileSync(path.join(dir, file), 'utf-8');
      // <arc-icon …> and <arc-icon-button …>, whose name attribute may sit
      // several lines below the tag.
      for (const m of src.matchAll(/<arc-icon(?:-button)?\b([\s\S]*?)>/g)) {
        const name = m[1].match(/\bname="([a-z0-9-]+)"/);
        if (name) found.push({ name: name[1], file: `${tier.name}/${file}` });
      }
    }
  }
  return found;
}

const ALIASES = aliases();
const available = Object.fromEntries(LIBRARIES.map((l) => [l, libraryNames(l)]));
const used = usedNames();

const failures = [];
for (const { name, file } of used) {
  for (const lib of LIBRARIES) {
    const resolved = ALIASES[lib]?.[name] ?? name;
    if (!available[lib].has(resolved)) {
      failures.push(
        `  ${file}: "${name}" does not exist in ${lib}` +
        (resolved === name ? '' : ` (aliased to "${resolved}")`)
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`check-icon-names: ${failures.length} icon name(s) render nothing\n`);
  console.error([...new Set(failures)].join('\n'));
  console.error(
    '\nEither use a name both libraries have, or add an alias to ALIASES in\n' +
    'packages/web-components/src/content/icon-registry.js. A name missing from\n' +
    'one library renders an empty box for anyone using that library.'
  );
  process.exit(1);
}

const distinct = new Set(used.map((u) => u.name));
console.log(
  `check-icon-names: ${distinct.size} icon name(s) across ${used.length} usage(s) resolve in ${LIBRARIES.join(' + ')}`
);
