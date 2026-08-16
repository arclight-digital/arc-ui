/**
 * check-child-registrations.js
 *
 * Asserts that every arc-* element a component renders in its own template is
 * declared with a @requires JSDoc tag, so the generated .register.js pulls the
 * child's registration in.
 *
 * This exists because registration was split out of the class modules: a bare
 * `import '../content/icon.js'` pulls the class and defines nothing, so it
 * looks like a dependency declaration while doing nothing for consumers. A
 * component that renders a child without @requires works under
 * `import '@arclux/arc-ui/register'` (everything is defined) and silently
 * breaks under per-component consumption — `import '@arclux/arc-ui/dialog'`
 * used to yield a dialog whose body was an inert unknown element, because
 * arc-modal and arc-button were rendered but never required.
 *
 * The check is one-directional on purpose: rendered ⇒ required. The inverse
 * would be wrong — @requires legitimately covers elements a component never
 * renders itself but expects consumers to slot in (arc-data-table @requires
 * arc-column, arc-list @requires arc-list-item).
 *
 * Run via: pnpm check child-registrations (and as part of pnpm generate)
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { findComponents, SRC_DIR } from '../lib/component-tags.js';

/**
 * Tags rendered via paths this scan cannot see (document.createElement with a
 * computed name, tags assembled from strings). Every entry must name the tag
 * and the reason; an entry that stops matching a real gap should be deleted.
 */
const WAIVERS = new Map([
  // none
]);

const components = findComponents();
const knownTags = new Set(components.keys());

/**
 * Block comments carry JSDoc examples full of <arc-*> tags that are never
 * rendered, and prose line comments name tags too ("a keypress in
 * <arc-textarea> arrived as…"). Strip block comments wholesale, and line
 * comments only when the line starts with them — `//` mid-line is a string
 * URL more often than a comment, and a whole line starting with `//` inside
 * a template literal would be rendered text, which no template does.
 */
const stripBlockComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/**
 * Blank the contents of ordinary quoted strings, keeping the quotes.
 *
 * A template lives in a backtick, never in `'…'` or `"…"`, so a `<arc-*>` inside
 * a single- or double-quoted string is prose rather than markup. It took a real
 * false positive to notice: `arc-dialog` throws a dev-mode error naming
 * `<arc-confirm>` — the component a consumer of the old tag should move to —
 * and the check read that sentence as a rendered child and demanded a
 * `@requires` for a component arc-dialog does not render and must not import.
 *
 * Backticks are deliberately left alone. That is where the templates are, and
 * blanking them would make this check assert nothing at all.
 */
const blankQuotedStrings = (src) =>
  src.replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g, (m) => m[0] + ' '.repeat(m.length - 2) + m[0]);

let failures = 0;

for (const [tag, comp] of components) {
  const source = readFileSync(resolve(SRC_DIR, comp.tier, comp.file), 'utf-8');
  const scannable = stripBlockComments(source);

  const rendered = new Set();
  // Markup only — see blankQuotedStrings. The createElement scan below runs on
  // the unblanked copy, because there the quoted string *is* the tag name.
  for (const m of blankQuotedStrings(scannable).matchAll(/<(arc-[a-z][a-z0-9-]*)/g)) {
    if (knownTags.has(m[1])) rendered.add(m[1]);
  }
  for (const m of scannable.matchAll(/createElement\(['"`](arc-[a-z][a-z0-9-]*)['"`]\)/g)) {
    if (knownTags.has(m[1])) rendered.add(m[1]);
  }
  rendered.delete(tag);

  const required = new Set(comp.requires);
  for (const child of rendered) {
    if (required.has(child)) continue;
    if (WAIVERS.get(tag)?.includes(child)) continue;
    console.error(
      `  ${tag} renders <${child}> but does not @requires it — ` +
      `per-component imports leave <${child}> undefined (${comp.tier}/${comp.file})`
    );
    failures++;
  }
}

if (failures > 0) {
  console.error(`\n✗ ${failures} rendered child element(s) missing @requires`);
  process.exit(1);
}

console.log(`✓ every rendered child element is covered by @requires (${components.size} components)`);
