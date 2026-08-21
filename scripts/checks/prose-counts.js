#!/usr/bin/env node
/**
 * prose-counts.js
 *
 * Asserts that a docs page counting a component's variants or sizes counts them
 * correctly.
 *
 * "Four semantic variants" is a fact with a source of truth two files away, and
 * nothing was reading it. The v4 merges made the number wrong on page after
 * page — every absorbed variant is one the survivor's prose does not know it
 * has — and the number is the load-bearing part: a reader who is told there are
 * four does not go looking for a fifth. arc-alert said four with five in the
 * enum, arc-divider said five with nine, arc-tag said six with seven, and
 * arc-toolbar said two sizes with three. In each case the missing value was
 * fully implemented and completely undocumented.
 *
 * The count is checked against the enum in custom-elements.json, which is
 * generated from the `oneOf([...])` the component actually declares — so this
 * cannot drift from the implementation the way the prose did.
 *
 * WHAT IS NOT A FAILURE, and why:
 *
 *   - A count of a *subset*. "Five illuminated variants" and "Four plain rule
 *     variants" are both true of arc-divider's nine. A claim counts as being
 *     about the whole enum only when its qualifier names the kind of the whole
 *     set — `color`, `semantic`, `visual`, `size`, and the handful below — or
 *     when there is no qualifier at all. Anything else reads as a subset and is
 *     skipped, and the skipped count is printed rather than left implicit.
 *   - A component with no such enum. Nothing to compare against.
 *   - A hedged count: "three or more levels", "up to four".
 *
 * Run via: pnpm check prose-counts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const DIR = path.join(root, 'docs/src/data/components');
const CEM = path.join(root, 'packages/web-components/custom-elements.json');

const WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

/** Qualifiers that name the whole set rather than carving a subset out of it. */
const WHOLE = new Set([
  '', 'color', 'colour', 'semantic', 'visual', 'named', 'distinct', 'shape',
  'layout', 'typography', 'size', 'style', 'different', 'built-in',
]);

/**
 * A count that bounds usage rather than inventorying the enum. "Do not mix more
 * than two color variants in one group" is advice about restraint, and the two
 * has nothing to do with how many exist.
 */
const HEDGED = /\b(or more|or fewer|up to|at least|at most|about|around|roughly|more than|fewer than|no more than)\b/i;

const cem = JSON.parse(fs.readFileSync(CEM, 'utf-8'));
const enums = new Map();
for (const mod of cem.modules ?? []) {
  for (const decl of mod.declarations ?? []) {
    if (!decl.tagName) continue;
    for (const member of decl.members ?? []) {
      if (member.kind !== 'field') continue;
      if (member.name !== 'variant' && member.name !== 'size') continue;
      const values = [...(member.type?.text ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
      if (values.length > 1) enums.set(`${decl.tagName}.${member.name}`, values);
    }
  }
}

const NUMBER = Object.keys(WORDS).join('|');
const CLAIM = new RegExp(`\\b(${NUMBER}|\\d+)\\s+((?:[\\w-]+\\s+){0,2}?)(variants?|sizes?)\\b`, 'gi');

const problems = [];
let pages = 0;
let checked = 0;
let subsets = 0;

for (const file of fs.readdirSync(DIR)) {
  if (!file.endsWith('.ts') || file === '_types.ts' || file === 'index.ts') continue;
  const text = fs.readFileSync(path.join(DIR, file), 'utf-8');
  const tag = text.match(/tag: '([^']+)'/)?.[1];
  if (!tag) continue;
  pages += 1;

  for (const hit of text.matchAll(CLAIM)) {
    const word = hit[1].toLowerCase();
    const claimed = WORDS[word] ?? (/^\d+$/.test(word) ? Number(word) : null);
    if (claimed === null) continue;

    const kind = hit[3].toLowerCase().startsWith('variant') ? 'variant' : 'size';
    const values = enums.get(`${tag}.${kind}`);
    if (!values) continue;

    const around = text.slice(Math.max(0, hit.index - 40), hit.index + hit[0].length + 40);
    if (HEDGED.test(around)) continue;

    const qualifier = hit[2].trim().toLowerCase().replace(/\s+/g, ' ');
    // A multi-word qualifier is a subset by construction ("plain rule").
    if (!WHOLE.has(qualifier)) { subsets += 1; continue; }

    checked += 1;
    if (claimed === values.length) continue;

    const line = text.slice(0, hit.index).split('\n').length;
    problems.push(
      `${file}:${line}  "${hit[0]}" — ${tag} declares ${values.length}: ${values.join(', ')}`
    );
  }
}

// Anti-vacuity: the enum map is built by walking a generated file whose shape
// could change, and the claim regex reads hand-written prose. Either going
// quiet would report a clean tree having compared nothing.
if (pages < 100 || enums.size < 50 || checked < 20) {
  console.error(
    `check-prose-counts: ${pages} page(s), ${enums.size} enum(s), ${checked} claim(s) ` +
      'compared — the scan is broken, not the tree'
  );
  process.exit(1);
}

if (problems.length === 0) {
  console.log(
    `check-prose-counts: ${checked} count claim(s) across ${pages} page(s) match their enums` +
      (subsets ? ` (${subsets} subset claim(s) not compared)` : '')
  );
  process.exit(0);
}

console.error(`check-prose-counts: ${problems.length} wrong count(s)\n`);
for (const p of problems) console.error(`  ${p}`);
console.error(
  '\nThe number is the load-bearing part: a reader told there are four does not\n' +
    'go looking for a fifth. Fix the count *and* the prose around it — a value\n' +
    'missing from the count is usually missing from the page entirely.'
);
process.exit(1);
