#!/usr/bin/env node
/**
 * The sampled mutation gate — V4-PLAN 2.0.
 *
 * A library-wide mutation score is not affordable (every mutant re-runs a test
 * file, and there are 200-odd components), and it would not be useful either: a
 * single number moves for reasons nobody can attribute. So the gate is an
 * explicit list of `--source`/`--tests` pairs, each with its own threshold,
 * chosen for blast radius rather than for coverage arithmetic.
 *
 * **The thresholds are ratchets, not targets.** Each was measured, then set at
 * or just below its measured value. A pair may only ever move up. Nothing here
 * is comparable to the Stryker-era 61.45% -> 67.52% readings in test-audit.md —
 * `mutate.js`'s operator set is deliberately smaller, and its own header says
 * so. Compare runs of this tool to each other and to nothing else.
 *
 * Pairs run strictly one at a time. `mutate.js` rewrites its source file in
 * place for each mutant and restores it in a `finally`, so two of them at once
 * would corrupt each other's tree — and running the ordinary suite alongside
 * one has already produced a "3668 passed, 0 failed" report containing a ❌
 * (see test-findings.md's closing note).
 *
 * Usage:
 *   node scripts/mutate-sample.js            # measure and gate
 *   node scripts/mutate-sample.js --measure  # report only, exit 0
 *   node scripts/mutate-sample.js --only props
 */
import { spawnSync } from 'node:child_process';
import { argv, exit } from 'node:process';

/**
 * gate: null means "measured but not yet ratcheted" — reported, never enforced.
 * Set it once a reading has been seen twice, so a flaky first measurement does
 * not become a permanent floor.
 */
const PAIRS = [
  {
    name: 'props',
    source: 'packages/web-components/src/shared/props.js',
    tests: 'packages/web-components/test/props.test.js',
    // Deliberately higher than everything else: 166 components sit on this
    // file, so a surviving mutant here is a hole under all of them at once.
    gate: 90,
    why: 'the declared-props vocabulary — 166 components',
  },
  {
    name: 'form-control-mixin',
    source: 'packages/web-components/src/shared/form-control-mixin.js',
    tests: 'packages/web-components/test/form-control-mixin.test.js',
    // measured 100.00% (27/27) 2026-08-13
    gate: 95,
    why: 'form participation — 26 controls',
  },
  {
    name: 'dismiss-controller',
    source: 'packages/web-components/src/shared/dismiss-controller.js',
    tests: 'packages/web-components/test/dismiss-controller.test.js',
    // measured 92.00% (23/25) 2026-08-13
    gate: 88,
    why: 'overlay dismissal — 17 consumers, finding #72',
  },
  {
    name: 'overlay-mixin',
    source: 'packages/web-components/src/shared/overlay-mixin.js',
    tests: 'packages/web-components/test/overlay-mixin.test.js',
    // measured 83.33% (5/6) 2026-08-13
    gate: 80,
    why: 'modal behaviour — 5 consumers, finding #73',
  },
  {
    name: 'menu-keyboard',
    source: 'packages/web-components/src/shared/menu-keyboard.js',
    tests: 'packages/web-components/test/menu-keyboard.test.js',
    // measured 100.00% (9/9) 2026-08-13
    gate: 88,
    why: 'menu keyboard protocol — 3 consumers, finding #75',
  },
  {
    name: 'focus-trap',
    source: 'packages/web-components/src/shared/focus-trap.js',
    tests: 'packages/web-components/test/focus-trap.test.js',
    // measured 87.50% (14/16) 2026-08-13
    gate: 85,
    why: 'composed-tree focus — reaches 5 via overlay-mixin',
  },
  {
    name: 'scroll-lock',
    source: 'packages/web-components/src/shared/scroll-lock.js',
    tests: 'packages/web-components/test/scroll-lock.test.js',
    // measured 100.00% (3/3) 2026-08-13
    gate: 95,
    why: 'body scroll refcount — reaches 5 via overlay-mixin',
  },
  {
    name: 'subscriptions',
    source: 'packages/web-components/src/shared/subscriptions.js',
    tests: 'packages/web-components/test/reconnect-sweep.test.js',
    // measured 83.33% (5/6) 2026-08-13; 87.50% (7/8) 2026-08-15 after
    // observeAttributes landed for finding #15. The floor stays at 80: a
    // ratchet guards against regression, and raising it on the strength of one
    // reading of a larger mutant set is how a gate becomes flaky.
    gate: 80,
    why: 'connection-scoped subscriptions — finding #55',
  },
  {
    name: 'listbox-controller',
    source: 'packages/web-components/src/shared/listbox-controller.js',
    tests: 'packages/web-components/test/listbox-controller.test.js',
    // measured 50.00% (39/78) twice — 2026-08-15, either side of the
    // per-option disabled work for finding #6, which added mutants and killed
    // its share of them. Ratcheted on the second identical reading, per the
    // rule at the top of this file.
    //
    // 50 is a floor, not a target. It is the lowest score in the set and the
    // largest module in it, which is what makes it V4-PLAN 2.5's first stop —
    // the gate exists so the climb cannot slide backwards while it happens.
    gate: 50,
    why: 'the select family spine',
  },
  {
    name: 'position-controller',
    source: 'packages/web-components/src/shared/position-controller.js',
    tests: 'packages/web-components/test/position-controller.test.js',
    // measured 52.83% (28/53) twice, 2026-08-15. Same reasoning as
    // listbox-controller above: a floor to climb from, not an endorsement.
    //
    // Its surviving mutants cluster in the flip/shift arithmetic — five
    // `false -> true` and four `>= -> >` at the edge comparisons — which is
    // exactly the geometry 4.4 replaces with CSS anchor positioning. Worth
    // knowing before spending 2.5 effort here: some of this code is scheduled
    // to become the fallback path rather than the main one.
    gate: 52,
    why: 'overlay placement — 20 consumers',
  },
];

const has = (flag) => argv.includes(`--${flag}`);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : argv[i + 1];
};

const only = arg('only');
const skip = arg('skip');
const measureOnly = has('measure');

const names = (list) => new Set(list.split(',').map((s) => s.trim()));
let selected = only ? PAIRS.filter((p) => names(only).has(p.name)) : PAIRS;
if (skip) selected = selected.filter((p) => !names(skip).has(p.name));

const known = new Set(PAIRS.map((p) => p.name));
for (const n of [...(only ? names(only) : []), ...(skip ? names(skip) : [])]) {
  if (!known.has(n)) {
    console.error(`no pair named "${n}". Known: ${[...known].join(', ')}`);
    exit(2);
  }
}
if (!selected.length) {
  console.error('no pairs selected.');
  exit(2);
}

const results = [];

for (const pair of selected) {
  console.log(`\n=== ${pair.name} — ${pair.why}`);
  const run = spawnSync(
    'node',
    ['scripts/mutate.js', '--source', pair.source, '--tests', pair.tests],
    { encoding: 'utf8' }
  );

  // mutate.js exits non-zero only for a gate it was given, and it is never
  // given one here — the gate is applied below so every pair is measured even
  // when an earlier one is under water. A non-zero exit therefore means the
  // harness itself failed, which must not be read as a score of 0.
  if (run.status !== 0 && run.status !== 1) {
    console.error(run.stdout ?? '');
    console.error(run.stderr ?? '');
    console.error(`\n${pair.name}: mutate.js failed to run (exit ${run.status})`);
    exit(2);
  }

  const out = run.stdout ?? '';
  process.stdout.write(out);
  const match = out.match(/killed (\d+)\/(\d+) — ([\d.]+)%/);
  if (!match) {
    console.error(`\n${pair.name}: could not read a score from mutate.js output`);
    exit(2);
  }

  results.push({ ...pair, killed: +match[1], total: +match[2], score: parseFloat(match[3]) });
}

console.log('\n\n=== sampled mutation gate\n');
const failures = [];
for (const r of results) {
  const gate = r.gate === null ? '  —  ' : `>=${String(r.gate).padStart(3)}`;
  const under = r.gate !== null && r.score < r.gate;
  if (under) failures.push(r);
  console.log(
    `  ${under ? 'FAIL' : 'ok  '}  ${r.name.padEnd(20)} ${String(r.score.toFixed(2)).padStart(6)}%  ` +
      `(${r.killed}/${r.total})  gate ${gate}`
  );
}

const ungated = results.filter((r) => r.gate === null);
if (ungated.length) {
  console.log(
    `\n  ${ungated.length} pair(s) measured but not yet ratcheted — set \`gate\` once a` +
      `\n  reading has been seen twice, so a flaky first run cannot become the floor.`
  );
}

if (measureOnly) {
  console.log('\n--measure: reporting only.\n');
  exit(0);
}

if (failures.length) {
  console.error(`\n${failures.length} pair(s) under gate.\n`);
  exit(1);
}
console.log('\nall gated pairs met their threshold.\n');
