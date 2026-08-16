#!/usr/bin/env node
/**
 * The core package knows nothing about an icon library.
 *
 * This is 4.7's outcome expressed as a rule, and it is the shiki lesson pointed
 * at a second heavy dependency. `barrelExclude` keeps shiki out of the default
 * barrel because a syntax highlighter has no business in the install of someone
 * who wanted a button; 3,408 vendored SVG modules are the same argument with a
 * bigger number. They were 88% of the core tarball's files and 44% of its
 * unpacked bytes, and every consumer's bundler walked 3,408 static `import()`
 * specifiers to find out it needed four of them.
 *
 * What made that structural rather than incidental was one line —
 * `await import('../icons/phosphor/_resolver.js')` in icon-registry.js. A
 * relative path is a hard edge: no export map, no dependency declaration and no
 * `barrelExclude` entry can cut it, and it kept the packs *inside* the package
 * whether or not anything rendered an icon. Libraries register themselves now,
 * so core's side of the seam is `iconRegistry.register()` and nothing else.
 *
 * ── The three rules ──
 *
 *   1. No module under packages/web-components/src reaches an icon library —
 *      not by relative path, not by package specifier, static or dynamic.
 *   2. The core package declares no dependency on @arclux/arc-ui-icons outside
 *      devDependencies, where its own tests need one to register a library.
 *   3. The core export map publishes no ./icons/ subpath. These were public
 *      (`@arclux/arc-ui/icons/lucide/check`), so their removal is the breaking
 *      half of 4.7 and MIGRATION.md carries it; re-adding one would quietly
 *      reintroduce the coupling from the manifest side, where rule 1 cannot see
 *      it.
 *
 * Rule 1 is the one that matters and the one that is easy to satisfy by
 * accident, so it is proved the way every rule here is proved — by putting the
 * import back and watching this fail. Restore the `getResolver` function
 * icon-registry.js carried before 4.7 and rule 1 names it by file and line.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withoutComments, lineAt } from '../lib/source-walker.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const CORE = path.join(ROOT, 'packages', 'web-components');
const SRC = path.join(CORE, 'src');
const ICONS_PKG = '@arclux/arc-ui-icons';

/**
 * What "reaching an icon library" looks like in a specifier.
 *
 * Deliberately wider than the one form that existed: the defect is the
 * *coupling*, and it does not care whether the next person spells it as a
 * relative path into a sibling package, a bare package subpath, or an upstream
 * vendor. `lucide-static` and `@phosphor-icons/core` are here because they are
 * the generator's inputs — devDependencies of the repo root, and a plausible
 * shortcut for anyone who wants "just one icon" in a component.
 */
const FORBIDDEN = [
  { re: /(^|\/)icons\//, why: 'reaches an icon pack by path' },
  { re: /^@arclux\/arc-ui-icons(\/|$)/, why: `imports ${ICONS_PKG}` },
  { re: /^lucide-static(\/|$)/, why: 'imports the Lucide source package directly' },
  { re: /^@phosphor-icons\//, why: 'imports the Phosphor source package directly' },
];

/** End offset of the string or template literal that starts at `i`. */
function endOfString(src, i) {
  const quote = src[i];
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === '\\') j += 2;
    else if (src[j] === quote) return j + 1;
    else j += 1;
  }
  return src.length;
}

/**
 * Every import/export specifier in a module, static and dynamic.
 *
 * Scanned rather than matched, because the two things this rule must not
 * mistake for an import are exactly the two things a file about imports is full
 * of. Comments come out through the shared walker, which exists because
 * `gradient-stops` learned that a comment quoting the banned thing fails the
 * rule that bans it. Strings are the other half, and the walker deliberately
 * leaves them — a rule looking for `'transparent'` in a CSS value wants to see
 * it — so they are skipped here instead. Both bit on the first run of this
 * check: icon-registry.js's own docstring and its console warning each spell
 * out `import '@arclux/arc-ui-icons/phosphor'` verbatim, being the
 * instruction a consumer follows, and a naive scan reported the file for
 * carrying its own fix.
 *
 * So the loop only tries to recognise a keyword at a position that is not
 * inside a literal, which is what makes the patterns below safe to keep loose.
 */
function specifiers(source) {
  const src = withoutComments(source);
  const dynamic = /import\s*\(\s*['"]([^'"]+)['"]/y;
  // `[^'";]` between the keyword and the specifier: a clause may contain braces
  // and commas but never a statement terminator or another string, which is
  // what stops `export const msg = …` two lines above an import from pairing
  // with it.
  const stat = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/y;
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`') {
      i = endOfString(src, i);
      continue;
    }
    let matched = false;
    if (c === 'i' || c === 'e') {
      for (const re of [dynamic, stat]) {
        re.lastIndex = i;
        const m = re.exec(src);
        if (!m) continue;
        out.push({ spec: m[1], index: i });
        i = re.lastIndex;
        matched = true;
        break;
      }
    }
    if (!matched) i += 1;
  }
  return out;
}

const failures = [];
let scanned = 0;

(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.js')) {
      scanned++;
      const src = fs.readFileSync(full, 'utf-8');
      for (const { spec, index } of specifiers(src)) {
        const hit = FORBIDDEN.find((f) => f.re.test(spec));
        if (hit) {
          failures.push(
            `${path.relative(ROOT, full)}:${lineAt(src, index)} ${hit.why} — '${spec}'`,
          );
        }
      }
    }
  }
})(SRC);

if (scanned === 0) {
  console.error('\n✗ no core modules found — is this running from the repo root?\n');
  process.exit(1);
}

// Rule 2 — the manifest side.
const pkg = JSON.parse(fs.readFileSync(path.join(CORE, 'package.json'), 'utf-8'));
for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
  if (pkg[field]?.[ICONS_PKG]) {
    failures.push(
      `packages/web-components/package.json declares ${ICONS_PKG} in ${field} — ` +
        'it belongs in devDependencies, for this package\'s own tests, and nowhere else',
    );
  }
}
if (!pkg.devDependencies?.[ICONS_PKG]) {
  failures.push(
    `packages/web-components/package.json does not devDepend on ${ICONS_PKG}, so its ` +
      'tests cannot register a library and every icon assertion resolves to null',
  );
}

// Rule 3 — the subpaths that were public until 4.7.
for (const key of Object.keys(pkg.exports ?? {})) {
  if (key.startsWith('./icons/')) {
    failures.push(
      `packages/web-components/package.json exports "${key}" — icon subpaths moved to ` +
        `${ICONS_PKG} in v4 and re-adding one restores the coupling from the manifest side`,
    );
  }
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} icon-independence problem(s):\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    `\n  Core ships no icons. A library registers itself:\n` +
      `      import '${ICONS_PKG}/phosphor.register';\n` +
      `  and core's whole side of that seam is iconRegistry.register(). If a component\n` +
      `  needs a specific glyph, register it by hand rather than reaching for a pack.\n`,
  );
  process.exit(1);
}

console.log(`✓ ${scanned} core modules, none of which knows an icon library exists`);
