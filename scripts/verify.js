#!/usr/bin/env node
/**
 * verify.js — the local gauntlet, in the order that makes it honest.
 *
 * `pnpm verify` = generate → checks → tests → typecheck. Local DX only — CI
 * already runs every stage — but the *order* is the point (V4-PLAN 4.10):
 * four of the check files assert against generated wrapper output, and on an
 * ungenerated tree they silently assert against stale files. Running generate
 * first means the checks always see the tree the sources describe.
 *
 * The staleness guard: if generate changes anything, the run says so and lists
 * the files. That is a warning rather than a failure — the stale output has
 * already been fixed by the time it is detected, and the CI job ("Generated
 * files match source") is the enforcement point for a commit that forgets to
 * include the regeneration.
 */
import { execSync, spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const stages = [
  ['generate', ['pnpm', 'generate']],
  ['check', ['pnpm', 'check']],
  ['test', ['pnpm', 'test']],
  ['test:ssr-fuzz', ['pnpm', 'test:ssr-fuzz']],
  ['typecheck', ['pnpm', 'typecheck']],
];

const dirty = () =>
  execSync('git status --porcelain', { cwd: root, encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean)
    .map((l) => l.slice(3));

const before = new Set(dirty());
let staleness = [];

const totalStart = performance.now();
for (const [name, cmd] of stages) {
  const start = performance.now();
  console.log(`\n▶ verify: ${name}`);
  const res = spawnSync(cmd[0], cmd.slice(1), { cwd: root, stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`\nverify: ${name} failed (${Math.round(performance.now() - start)}ms in).`);
    process.exit(res.status ?? 1);
  }
  if (name === 'generate') {
    staleness = dirty().filter((f) => !before.has(f));
  }
}

console.log(`\nverify: all stages passed in ${Math.round((performance.now() - totalStart) / 1000)}s`);
if (staleness.length) {
  console.log(
    '\nverify: the tree was stale — generate changed the files below, and every\n' +
      'stage above ran against the fresh copy. Review and commit them:\n',
  );
  for (const f of staleness) console.log(`  ${f}`);
}
