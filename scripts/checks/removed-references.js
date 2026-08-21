#!/usr/bin/env node
/**
 * removed-references.js
 *
 * Asserts that no component's documentation page recommends a component that
 * was removed.
 *
 * A cut keeps its URL — `data/removed.ts` renders a tombstone rather than a
 * 404, which is ground rule 1. That makes the *reader's* path fine and the
 * *writer's* path silent: a guideline saying "use Callout instead" still links
 * nowhere and still reads as current advice, and the tombstone it eventually
 * lands on says the opposite of what sent you there. Nothing in the build
 * objects, because the prose is a string.
 *
 * The defect is a consequence of how v4 removed things. Eighteen components
 * went away, twelve of them merged into a survivor, and every page that had
 * ever mentioned one by name was left holding a recommendation for it. The
 * merges are the worse half: `arc-modal` is *renamed*, so "use a Modal" reads
 * as perfectly sound English and describes a component that exists under
 * another name — nine pages said it.
 *
 * WHAT IS NOT A FAILURE, and why each allowance exists:
 *
 *   - A mention next to the tombstone's own URL. A survivor page explaining
 *     what it absorbed has to name the thing it absorbed; linking the tombstone
 *     is what turns a stale reference into a migration note.
 *   - A mention inside a sentence that says it is gone — "removed", "merged",
 *     "absorbed", "was cut", "no longer". Same reason.
 *   - A name that is also an ordinary word. `Column`, `Table` and `Separator`
 *     appear in "Column highlighting", "Table-of-contents" and "Separator
 *     characters", which are English, not references. Those three are matched
 *     by tag only (`arc-column`), never by display name.
 *   - Demo content. A tree-view sample listing `Modal.ts` as a filename, or a
 *     search demo whose suggestions are component names, is illustrating a
 *     component rather than recommending one — so `previewHtml`, `previewSetup`
 *     and `tabs` are not scanned. Prose is: `overview`, `features`,
 *     `guidelines`, `description`.
 *
 * Run via: pnpm check removed-references (and as part of pnpm generate)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const DIR = path.join(root, 'docs/src/data/components');
const REMOVED = path.join(root, 'docs/src/data/removed.ts');

/** Names that are also ordinary words, matched by tag only. */
const AMBIGUOUS = new Set(['arc-column', 'arc-table', 'arc-separator', 'arc-spotlight']);

/** A mention is fine when the unit it sits in says the component is gone. */
const EXCUSED = /removed|was cut|merged|absorbed|tombstone|no longer|used to be/i;

/**
 * The editorial unit a mention belongs to — what has to carry the explanation.
 *
 * A character window around the hit was the first draft and it drew the line in
 * the wrong place: a migration paragraph that links three tombstones at the end
 * failed for the component it named at the start. `overview` and `description`
 * are paragraphs, so the paragraph is the unit. `features` and `guidelines` are
 * arrays written one entry per line, and a guideline is a standalone sentence a
 * reader meets on its own — so there, the line is.
 */
function unit(text, index, key) {
  if (key === 'features' || key === 'guidelines') {
    const start = text.lastIndexOf('\n', index) + 1;
    const end = text.indexOf('\n', index);
    return text.slice(start, end === -1 ? undefined : end);
  }
  const before = text.slice(0, index).lastIndexOf('\n\n');
  const after = text.slice(index).search(/\n\s*\n/);
  return text.slice(before === -1 ? 0 : before, after === -1 ? undefined : index + after);
}

const src = fs.readFileSync(REMOVED, 'utf-8');
const removed = [
  ...src.matchAll(/name: '([^']+)',\s*\n\s*slug: '([^']+)',\s*\n\s*tag: '([^']+)'/g),
].map((m) => ({ name: m[1], slug: m[2], tag: m[3] }));

/** The prose fields of a ComponentDef, with tabs and previews left out. */
function prose(text) {
  const fields = [];
  for (const key of ['description', 'overview', 'features', 'guidelines']) {
    const at = text.indexOf(`\n  ${key}:`);
    if (at === -1) continue;
    // Run to the next top-level key rather than parsing: every field in these
    // files is `\n  name:` at two spaces of indent.
    const rest = text.slice(at + 3 + key.length);
    const end = rest.search(/\n  [a-zA-Z]+:/);
    fields.push({ key, start: at, text: end === -1 ? rest : rest.slice(0, end) });
  }
  return fields;
}

const problems = [];
let scanned = 0;
let mentions = 0;
let fields = 0;

for (const file of fs.readdirSync(DIR)) {
  if (!file.endsWith('.ts') || file === '_types.ts' || file === 'index.ts') continue;
  const text = fs.readFileSync(path.join(DIR, file), 'utf-8');
  scanned += 1;

  const proseFields = prose(text);
  fields += proseFields.length;
  for (const field of proseFields) {
    for (const entry of removed) {
      const patterns = [entry.tag];
      if (!AMBIGUOUS.has(entry.tag)) patterns.push(`\\b${entry.name.replace(/ /g, '\\s?')}\\b`);
      const re = new RegExp(patterns.join('|'), 'g');

      for (const hit of field.text.matchAll(re)) {
        mentions += 1;
        const near = unit(field.text, hit.index, field.key);
        if (near.includes(`/docs/components/${entry.slug}`) || EXCUSED.test(near)) continue;

        const line = text.slice(0, field.start).split('\n').length +
          field.text.slice(0, hit.index).split('\n').length;
        problems.push(
          `${file}:${line}  ${field.key} says "${hit[0]}" — ${entry.tag} was removed; ` +
            `see /docs/components/${entry.slug}`
        );
      }
    }
  }
}

// Anti-vacuity. The field-splitting is regex over source text, so a change to
// how these files are written would leave this reporting a clean tree having
// read nothing. Mentions are *not* the measure — the healthy end state is few
// of them — so what is asserted is that the scan reached the prose: every page
// carries at least `description` and `guidelines`, and most carry four fields.
if (scanned < 100 || removed.length < 10 || fields < scanned * 3) {
  console.error(
    `check-removed-references: ${scanned} page(s), ${fields} prose field(s), ` +
      `${removed.length} removed component(s) — the scan is broken, not the tree`
  );
  process.exit(1);
}

if (problems.length === 0) {
  console.log(
    `check-removed-references: ${scanned} page(s), ${mentions} mention(s) of ` +
      `${removed.length} removed component(s), all excused`
  );
  process.exit(0);
}

console.error(`check-removed-references: ${problems.length} stale reference(s)\n`);
for (const p of problems) console.error(`  ${p}`);
console.error(
  '\nA removed component keeps its URL, so advice pointing at one still lands\n' +
    'somewhere — on a tombstone that contradicts the advice that sent the\n' +
    'reader there. Name the survivor instead, or, if the page has to mention\n' +
    'what it absorbed, link the tombstone: /docs/components/<slug>.'
);
process.exit(1);
