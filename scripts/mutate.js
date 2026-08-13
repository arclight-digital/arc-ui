#!/usr/bin/env node
/**
 * A small, committed mutation harness.
 *
 * Why not Stryker: it is not installed, no config was ever committed (see
 * test-audit.md), and it has no runner for @web/test-runner — the previous
 * attempt needed a hand-written bridge to push `globalThis.__stryker__
 * .activeMutant` into the browser page, and without that bridge every mutant
 * reports as survived and the suite looks worthless. That trap is documented
 * and real. For a single module with a fast dedicated suite, mutating the
 * source directly and running the suite is simpler, reproducible, and has no
 * silent failure mode: a mutant that does not change behaviour is visible as a
 * survivor rather than as a broken pipeline.
 *
 * **Scores from this tool are not comparable to Stryker's.** The operator set
 * below is deliberate and small; Stryker's is larger, so its score on the same
 * file would be lower. Compare runs of this tool to each other, not to the
 * 67.52% in test-audit.md.
 *
 * Usage:
 *   node scripts/mutate.js --source packages/web-components/src/shared/props.js \
 *                          --tests packages/web-components/test/props.test.js \
 *                          --gate 90
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { argv, exit } from 'node:process';

function arg(name, fallback = null) {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
}

const SOURCE = arg('source');
const TESTS = arg('tests');
const GATE = Number(arg('gate', '0'));
if (!SOURCE || !TESTS) {
  console.error('usage: mutate.js --source <file> --tests <file> [--gate N]');
  exit(2);
}

/**
 * Operators. Each is [label, pattern, replacement].
 *
 * Chosen so that every mutant is a *behaviour* change a test could reasonably
 * catch. Deliberately excluded: mutating strings used only in thrown messages
 * (a test asserting exact prose is worse than one that does not), and anything
 * inside a comment, which is stripped before matching.
 */
const OPERATORS = [
  ['equality', /===/g, '!=='],
  ['inequality', /!==/g, '==='],
  ['gte', />=/g, '>'],
  ['lte', /<=/g, '<'],
  ['and-to-or', /&&/g, '||'],
  ['or-to-and', /\|\|/g, '&&'],
  ['true-to-false', /\btrue\b/g, 'false'],
  ['false-to-true', /\bfalse\b/g, 'true'],
  ['max-to-min', /Math\.max/g, 'Math.min'],
  ['min-to-max', /Math\.min/g, 'Math.max'],
  ['trunc-to-round', /Math\.trunc/g, 'Math.round'],
  ['negate-not', /!([A-Za-z_$][\w$.]*)/g, '$1'],
];

const original = readFileSync(SOURCE, 'utf8');

/** Blank out comments and string literals so matches land on real code only. */
function maskable(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length))
    .replace(/'(?:[^'\\\n]|\\.)*'/g, (m) => ' '.repeat(m.length))
    .replace(/"(?:[^"\\\n]|\\.)*"/g, (m) => ' '.repeat(m.length))
    .replace(/`(?:[^`\\]|\\.)*`/g, (m) => ' '.repeat(m.length));
}

const masked = maskable(original);
const lineOf = (index) => original.slice(0, index).split('\n').length;

const mutants = [];
for (const [label, pattern, replacement] of OPERATORS) {
  for (const m of masked.matchAll(pattern)) {
    const start = m.index;
    const end = start + m[0].length;
    // Rebuild the replacement against the real source, so $1 captures work.
    const replaced = original.slice(start, end).replace(new RegExp(pattern.source), replacement);
    if (replaced === original.slice(start, end)) continue;
    mutants.push({
      label,
      line: lineOf(start),
      from: original.slice(start, end),
      to: replaced,
      source: original.slice(0, start) + replaced + original.slice(end),
    });
  }
}

console.log(`${mutants.length} mutants in ${SOURCE}\n`);

let killed = 0;
const survivors = [];

const restore = () => writeFileSync(SOURCE, original);
process.on('SIGINT', () => {
  restore();
  exit(130);
});

try {
  for (const [i, mutant] of mutants.entries()) {
    writeFileSync(SOURCE, mutant.source);
    let died = false;
    try {
      execFileSync('npx', ['web-test-runner', '--files', TESTS], { stdio: 'pipe' });
    } catch {
      died = true;
    }
    if (died) killed += 1;
    else survivors.push(mutant);

    const tag = died ? '·' : 'S';
    process.stdout.write(tag);
    if ((i + 1) % 50 === 0) process.stdout.write(` ${i + 1}\n`);
  }
} finally {
  restore();
}

const score = mutants.length ? (killed / mutants.length) * 100 : 0;
console.log(`\n\nkilled ${killed}/${mutants.length} — ${score.toFixed(2)}%\n`);

if (survivors.length) {
  console.log('survivors:');
  for (const s of survivors) {
    console.log(`  ${SOURCE}:${s.line}  ${s.label}: ${s.from.trim()} -> ${s.to.trim()}`);
  }
}

if (GATE && score < GATE) {
  console.error(`\ngate not met: ${score.toFixed(2)}% < ${GATE}%`);
  exit(1);
}
