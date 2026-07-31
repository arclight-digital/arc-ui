#!/usr/bin/env node

/**
 * check.js — Run repo assertion scripts from scripts/checks/.
 *
 * The checks are self-contained scripts discovered by filename, so adding one
 * to the directory is all it takes to be included here; there is no list to
 * keep in sync (the generate pipeline, which needs its own ordering, keeps
 * its explicit list in generate.js).
 *
 *   pnpm check                 run every check
 *   pnpm check ssr motion-tokens   run a subset by name (filename minus .js)
 *   pnpm check --list          list available names
 *
 * Note the output-level checks (prop-unions, enum-fallbacks, wrapper-slots,
 * wrapper-types) assert against generated wrappers — on a stale tree run
 * `pnpm generate` first.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHECKS_DIR = path.join(__dirname, 'checks');

const available = fs
  .readdirSync(CHECKS_DIR)
  .filter((f) => f.endsWith('.js'))
  .map((f) => f.replace(/\.js$/, ''))
  .sort();

const args = process.argv.slice(2).filter((a) => a !== '--');

if (args.includes('--list')) {
  console.log(available.join('\n'));
  process.exit(0);
}

const unknown = args.filter((a) => !available.includes(a));
if (unknown.length) {
  console.error(`check: unknown check(s): ${unknown.join(', ')}\navailable: ${available.join(', ')}`);
  process.exit(1);
}

const toRun = args.length ? args : available;
const totalStart = performance.now();
let failed = 0;

console.log(`\n  ARC UI — Check (${toRun.length})\n`);

for (const name of toRun) {
  const start = performance.now();
  process.stdout.write(`  ${name.padEnd(22)} `);
  try {
    execFileSync('node', [path.join(CHECKS_DIR, `${name}.js`)], { stdio: ['inherit', 'pipe', 'pipe'] });
    console.log(`ok    ${Math.round(performance.now() - start)}ms`);
  } catch (err) {
    console.log(`FAIL  ${Math.round(performance.now() - start)}ms`);
    const out = `${err.stdout?.toString() || ''}${err.stderr?.toString() || ''}`.trim();
    if (out) console.error(out.replace(/^/gm, '    '));
    failed++;
  }
}

console.log(`\n  ${failed ? `${failed} check(s) failed` : 'All checks passed'} in ${Math.round(performance.now() - totalStart)}ms\n`);
process.exit(failed ? 1 : 0);
