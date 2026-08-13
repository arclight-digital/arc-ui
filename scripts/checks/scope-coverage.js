/**
 * scope-coverage.js
 *
 * Asserts that every registered tag has exactly one verdict line in
 * `V4-SCOPE.md` §4 — the Phase 1 gate from V4-PLAN.
 *
 * A scope document is a claim about the catalog, and claims go stale the moment
 * a component is added. `HANDOFF.md` asserted "`pnpm generate` exits 0 with zero
 * drift" for weeks while ~150 wrapper files sat unregenerated, because the claim
 * was written down and the command was not re-run. This is the same failure
 * waiting to happen to the catalog decisions: someone adds `arc-whatever`, the
 * scope file still says 207, and nobody notices until the merge list is being
 * executed against a tree that no longer matches it.
 *
 * So the coverage is derived from `custom-elements.json` rather than counted by
 * hand. A new component fails this check until someone gives it a verdict, which
 * is the point — the decision is cheap now and expensive during Phase 4.
 *
 * **Exactly one** verdict, not at least one: merge survivors are referenced from
 * their merge rows too (`arc-tag` absorbs `arc-badge`), so a naive substring
 * count reports 21 false duplicates. Only the *subject* column of a table row
 * counts as a verdict; everything else is cross-reference.
 *
 * This check is scoped to the v4 cycle. Delete it with V4-SCOPE.md when the
 * catalog decisions have been executed and the file stops being a live ledger.
 *
 * Run via: pnpm check scope-coverage (and as part of pnpm generate)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const SCOPE = path.join(ROOT, 'V4-SCOPE.md');
const MANIFEST = path.join(ROOT, 'packages/web-components/custom-elements.json');
const SECTION = '## 4. Per-tag verdicts';

if (!fs.existsSync(SCOPE)) {
  console.error('check-scope-coverage: V4-SCOPE.md is missing.');
  process.exit(1);
}

const scope = fs.readFileSync(SCOPE, 'utf8');
if (!scope.includes(SECTION)) {
  console.error(`check-scope-coverage: V4-SCOPE.md has no "${SECTION}" section.`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const tags = new Set(
  manifest.modules.flatMap((m) =>
    (m.declarations ?? []).map((d) => d.tagName).filter(Boolean)
  )
);

// Only the subject column of a table row is a verdict. A tag named in the
// verdict column is a cross-reference ("absorbs arc-badge") and must not count.
const body = scope.slice(scope.indexOf(SECTION));
const verdicts = new Map();
const duplicated = new Set();

for (const line of body.split('\n')) {
  if (!line.startsWith('|') || line.startsWith('|---') || line.startsWith('| tag')) continue;
  const cells = line.replace(/^\||\|$/g, '').split('|');
  if (cells.length < 2) continue;
  const [subject, verdict] = cells;
  for (const [, tag] of subject.matchAll(/`(arc-[a-z0-9-]+)`/g)) {
    if (verdicts.has(tag)) duplicated.add(tag);
    verdicts.set(tag, verdict.trim());
  }
}

// Anti-vacuity: a parser that silently matched nothing would report a clean
// tree with zero verdicts found.
if (verdicts.size === 0) {
  console.error('check-scope-coverage: parsed zero verdict rows — the scan is broken, not the file.');
  process.exit(1);
}

const missing = [...tags].filter((t) => !verdicts.has(t)).sort();
const stale = [...verdicts.keys()].filter((t) => !tags.has(t)).sort();
const dupes = [...duplicated].sort();

if (!missing.length && !stale.length && !dupes.length) {
  const kinds = { keep: 0, merge: 0, delete: 0, rename: 0, '/marketing': 0, '/media': 0 };
  for (const [tag, verdict] of verdicts) {
    if (!tags.has(tag)) continue;
    if (verdict.includes('/marketing')) kinds['/marketing']++;
    else if (verdict.includes('/media')) kinds['/media']++;
    else if (/\*\*delete/.test(verdict)) kinds.delete++;
    else if (verdict.includes('merge →')) kinds.merge++;
    else if (verdict.includes('rename →')) kinds.rename++;
    else kinds.keep++;
  }
  const summary = Object.entries(kinds)
    .filter(([, n]) => n)
    .map(([k, n]) => `${n} ${k}`)
    .join(', ');
  console.log(`check-scope-coverage: all ${tags.size} tags have a verdict — ${summary}`);
  process.exit(0);
}

console.error(`check-scope-coverage: V4-SCOPE.md §4 does not match the catalog\n`);
if (missing.length) {
  console.error(`  ${missing.length} tag(s) with no verdict:`);
  for (const t of missing) console.error(`    ${t}`);
}
if (stale.length) {
  console.error(`  ${stale.length} verdict(s) for a tag that no longer exists:`);
  for (const t of stale) console.error(`    ${t}`);
}
if (dupes.length) {
  console.error(`  ${dupes.length} tag(s) with more than one verdict row:`);
  for (const t of dupes) console.error(`    ${t}`);
}
console.error(
  '\nEvery registered tag needs exactly one keep/merge/delete/group verdict in\n' +
    'V4-SCOPE.md §4. Add the row rather than widening this check — deciding is\n' +
    'cheap now and expensive once Phase 4 is executing against the list.'
);
process.exit(1);
