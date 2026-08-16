#!/usr/bin/env node
/**
 * Orders the v4 half of MIGRATION.md, and writes its table of contents from
 * what is actually there.
 *
 * Sections are written as the work lands, so their order on disk is the order
 * they were discovered in — which is nobody's reading order. V4-PLAN 4.11 says
 * this step "completes and orders them, it does not discover them", and that is
 * the division of labour here: ORDER below is the reading order, this script
 * enforces it, and a section that exists without a place in it fails the build
 * rather than being silently appended to the end.
 *
 * The contents list is derived rather than maintained. It had drifted to seven
 * of eighteen entries before 4.11 — the failure a hand-written index always
 * eventually has, and one nobody notices, because a missing entry looks exactly
 * like a section that does not exist.
 *
 * Anchors are GitHub's algorithm: lowercase, drop everything that is not a word
 * character, a space or a hyphen, spaces to hyphens. `` `size` is `sm | md |
 * lg` `` has to survive that, which is why it is computed rather than typed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '..', '..', 'MIGRATION.md');

const V4_HEADING = '# v4 breaking changes';
const TOC_MARKER = '**v4:**';

/**
 * Reading order: what a consumer meets first, first.
 *
 * Catalog before API before behaviour before styling before packaging — the
 * question "does this component still exist" has to be answered before "does
 * this prop still take a string", and both before "why does it look different".
 * Packaging is last because it is the only group you can act on without reading
 * any of the others.
 */
const ORDER = [
  // What exists
  'The five cuts',
  'The merges',
  'Domain groups: marketing and media leave the default barrel',
  'Every component declares a status, and experimental leaves the barrel',
  '`arc-modal` is `arc-dialog`, and `arc-dialog` is not what it was',

  // What the props take
  '`size` is `sm | md | lg`, and dismissal is `dismissible`',
  'Side slots are `prefix` and `suffix`',
  'Array props take arrays, not JSON strings',
  'Malformed array attributes fall back instead of throwing',
  'Every array prop is `list()`, and every one of them has an attribute',
  'Props that documented a rule now enforce it',

  // What they do
  'The five modal overlays run on `<dialog>`',
  '`arc-navigation-menu` collapses on its own width',
  '`arc-context-menu` dismisses without covering the page',
  'Event details that named the wrong thing',

  // What they look like
  '`::part(base)` reaches the root element of any component',
  'Text is described by a type context',
  'The high-contrast theme is generated, and its AAA claim is now true',
  '`[data-density]`, and the two-color contract as the theming API',

  // What you install
  'Icons moved to `@arclux/arc-ui-icons`',
  'Wrappers: four defects that were shipping',
  'Angular form controls bind to `@angular/forms`',
  'JSX typings for `<arc-*>`, and the React instruction that never worked',
];

/** GitHub's heading-anchor algorithm, for the links in the contents list. */
const anchor = (title) =>
  title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s/g, '-');

const source = fs.readFileSync(FILE, 'utf-8');

const bodyStart = source.indexOf(V4_HEADING);
if (bodyStart === -1) {
  console.error(`generate-migration-toc: no "${V4_HEADING}" heading in MIGRATION.md`);
  process.exit(1);
}

const head = source.slice(0, bodyStart);
const body = source.slice(bodyStart);

/* Split on `## ` at line start. The heading line itself opens each chunk, so
   the text before the first one is the v4 preamble and stays put. */
const parts = body.split(/\n(?=## )/);
const preamble = parts[0];
const sections = new Map();
for (const chunk of parts.slice(1)) {
  const title = chunk.slice(3, chunk.indexOf('\n')).trim();
  if (sections.has(title)) {
    console.error(`generate-migration-toc: two sections titled "${title}"`);
    process.exit(1);
  }
  sections.set(title, chunk.trimEnd());
}

const missing = ORDER.filter((t) => !sections.has(t));
const unplaced = [...sections.keys()].filter((t) => !ORDER.includes(t));
if (missing.length || unplaced.length) {
  console.error('generate-migration-toc: ORDER and MIGRATION.md disagree\n');
  for (const t of missing) console.error(`  in ORDER, not in the file:  ${t}`);
  for (const t of unplaced) console.error(`  in the file, not in ORDER:  ${t}`);
  console.error(
    '\n  A new section needs a place in the reading order, which is a decision\n' +
      '  and not a default — see the ORDER comment in this file.',
  );
  process.exit(1);
}

/* Two titles can differ and still normalise to one anchor — the algorithm drops
   backticks, slashes and punctuation, so `arc-dialog` and arc-dialog are the
   same link. GitHub disambiguates by appending -1 to the second, silently, in
   heading order; a contents list written without knowing that points both
   entries at the first section. */
const anchors = new Map();
for (const title of ORDER) {
  const a = anchor(title);
  if (anchors.has(a)) {
    console.error(
      `generate-migration-toc: "${title}" and "${anchors.get(a)}" both anchor to #${a}.\n` +
        '  Rename one — GitHub would suffix the second and both links would go to the first.',
    );
    process.exit(1);
  }
  anchors.set(a, title);
}

const toc = ORDER.map((t) => `- [${t}](#${anchor(t)})`).join('\n');

const tocStart = head.indexOf(TOC_MARKER);
if (tocStart === -1) {
  console.error(`generate-migration-toc: no "${TOC_MARKER}" marker above the v4 sections`);
  process.exit(1);
}
/* The list runs from the marker to the next blank line followed by a heading —
   in practice, to the `## ` that opens the v2 → v3 sections. */
const tocEnd = head.indexOf('\n## ', tocStart);
if (tocEnd === -1) {
  console.error('generate-migration-toc: could not find the end of the v4 contents list');
  process.exit(1);
}

const rewritten =
  head.slice(0, tocStart) +
  `${TOC_MARKER}\n\n${toc}\n` +
  head.slice(tocEnd) +
  preamble.trimEnd() +
  '\n\n' +
  ORDER.map((t) => sections.get(t)).join('\n\n') +
  '\n';

fs.writeFileSync(FILE, rewritten);
console.log(`MIGRATION.md: ${ORDER.length} v4 sections ordered, contents list rewritten`);
