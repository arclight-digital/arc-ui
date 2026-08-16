#!/usr/bin/env node
/**
 * check-icon-names.js
 *
 * Asserts that every icon name ARC UI's own components ask for resolves in
 * *both* icon libraries.
 *
 * The failure this catches renders an empty box, silently. arc-transfer-list
 * asked for `chevron-right`, `chevrons-right`, `chevron-left` and
 * `chevrons-left` — all four are Lucide spellings, and the library in use was
 * Phosphor, which calls them `caret-*`. `iconRegistry.get()` returns null for an
 * unknown name, arc-icon renders nothing, and no error appears anywhere. The
 * component's four move buttons were blank from the day it shipped.
 *
 * Both libraries are checked, whichever one a page selects: a built-in
 * component must not break on `iconRegistry.use('lucide')`. Where the two
 * disagree on a name — and for the carets they disagree completely, with no
 * spelling present in both — @arclux/arc-ui-icons carries an alias map, which
 * this check resolves through before looking up.
 *
 * Consumer-supplied names are out of scope; they get the runtime warning in
 * arc-icon instead.
 *
 * Run via: pnpm check icon-names (and as part of pnpm generate)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const SRC = path.join(root, 'packages/web-components/src');
const ICONS = path.join(root, 'packages/icons/src');
const LIBRARIES = ['phosphor', 'lucide'];

// The resolvers are generated and gitignored, so on a fresh checkout this check
// used to die with a raw readFileSync ENOENT stack. Fail with the fix instead,
// matching scripts/smoke-test-wrappers.js.
for (const lib of LIBRARIES) {
  if (!fs.existsSync(path.join(ICONS, lib, '_resolver.js'))) {
    console.error('✗ generated icon modules missing — run `pnpm generate:icons` first');
    process.exit(1);
  }
}

/** Icon names available in a library, read from its generated resolver. */
function libraryNames(lib) {
  const file = path.join(ICONS, lib, '_resolver.js');
  const src = fs.readFileSync(file, 'utf-8');
  return new Set([...src.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]));
}

/**
 * The alias map the icons package registers, imported rather than parsed.
 *
 * It used to be a `const ALIASES` inside icon-registry.js, reachable only by
 * regex — 4.7 moved it to @arclux/arc-ui-icons/aliases, where it is a plain
 * dependency-free module this can just import. The structural parser and its
 * "parsed as empty" guard went with it: there is nothing left to drift.
 */
const { aliases: ALIASES } = await import(
  pathToFileURL(path.join(ICONS, 'aliases.js')).href
);

/** Icon names hard-coded in component templates, with where they came from. */
function usedNames() {
  const found = [];
  for (const tier of fs.readdirSync(SRC, { withFileTypes: true })) {
    if (!tier.isDirectory()) continue;
    const dir = path.join(SRC, tier.name);
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.js') || file.endsWith('.register.js')) continue;
      const src = fs.readFileSync(path.join(dir, file), 'utf-8');
      // <arc-icon …> and <arc-icon-button …>, whose name attribute may sit
      // several lines below the tag.
      //
      // The lookahead is load-bearing: `\b` here also matched `<arc-icon` at
      // the head of `<arc-icon-library name="lucide">`, whose `name` is a
      // library and not a glyph, and reported "lucide" as an icon missing from
      // both libraries. Nothing in a template had triggered it until 4.7 put
      // that tag in a docstring.
      for (const m of src.matchAll(/<arc-icon(?:-button)?(?=[\s>])([\s\S]*?)>/g)) {
        const name = m[1].match(/\bname="([a-z0-9-]+)"/);
        if (name) found.push({ name: name[1], file: `${tier.name}/${file}` });
      }
    }
  }
  return found;
}

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
    '\nEither use a name both libraries have, or add an alias to\n' +
    'packages/icons/src/aliases.js. A name missing from one library renders an\n' +
    'empty box for anyone using that library.'
  );
  process.exit(1);
}

const distinct = new Set(used.map((u) => u.name));
console.log(
  `check-icon-names: ${distinct.size} icon name(s) across ${used.length} usage(s) resolve in ${LIBRARIES.join(' + ')}`
);
