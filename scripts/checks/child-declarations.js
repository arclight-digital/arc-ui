#!/usr/bin/env node
/**
 * check-child-declarations.js
 *
 * A parent's `@child` tags name exactly the elements it reads from its children.
 *
 * `@child` is what `custom-elements.json` publishes as a parent's `children`
 * (test-findings #129): the machine-readable answer to "what goes inside
 * arc-segmented-control?", which a consumer's tooling and agents could only
 * find in the docs site's preview strings before. A list like that is only
 * worth publishing if it cannot drift, so this holds it in both directions:
 *
 * - a child tag the parent reads must be declared, or the manifest omits a
 *   pairing that works;
 * - a declared child the parent never reads is a promise the component does
 *   not keep.
 *
 * "Reads" means the parent filters or queries its children by tag:
 * `el.tagName === 'ARC-OPTION'`, `el.localName === 'arc-tab'`,
 * `querySelectorAll('arc-nav-item')`, or the menus' shared `MENU_CHILD_TAGS`
 * set, which is expanded here because a grep cannot see through the import.
 *
 * Run via: pnpm check child-declarations (and as part of pnpm generate)
 */
import { run } from '../lib/source-walker.js';

/** Components whose source names child tags without being their parent. */
const WAIVERS = {
  'arc-menu-label':
    'defines MENU_CHILD_TAGS and menuSections() for the two menus; it has no children of its own',
};

const MENU_CHILD_TAGS = ['arc-menu-item', 'arc-menu-divider', 'arc-menu-label'];

function readTags(code) {
  const tags = new Set();
  for (const m of code.matchAll(/tagName\s*===\s*'(ARC-[A-Z-]+)'/g)) tags.add(m[1].toLowerCase());
  for (const m of code.matchAll(/localName\s*===\s*'(arc-[a-z-]+)'/g)) tags.add(m[1]);
  for (const m of code.matchAll(/querySelectorAll\(\s*'(?::scope\s*>\s*)?(arc-[a-z-]+)'/g))
    tags.add(m[1]);
  if (/\bMENU_CHILD_TAGS\b/.test(code)) MENU_CHILD_TAGS.forEach((t) => tags.add(t));
  return tags;
}

export const rule = {
  name: 'child-declarations',
  describe: '@child tags match the child elements each parent reads',
  hint:
    'Add `@child <tag>` (and the slot, when it is not the default: `@child <tag> nav`) to the\n' +
    "    parent's docblock, or remove a @child the parent no longer reads.",
  component({ tag, code, docTag, report }) {
    if (WAIVERS[tag]) return;
    const declared = new Map(docTag('child').map((t) => [t.text.split(/\s+/)[0], t.line]));
    const read = readTags(code);
    for (const child of read) {
      if (!declared.has(child))
        report(1, `reads <${child}> children but has no \`@child ${child}\``);
    }
    for (const [child, line] of declared) {
      if (!read.has(child)) report(line, `declares \`@child ${child}\` but never reads one`);
    }
  },
};

process.exit(run({ name: 'child-declarations', rules: [rule] }));
