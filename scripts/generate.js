#!/usr/bin/env node

/**
 * generate.js — Unified code generation pipeline
 *
 * Runs all generation steps in order:
 *   1. Tokens    — shared/tokens.js → shared/base.css
 *   2. Icons     — vendored icon modules from upstream libraries (gitignored,
 *                  so fresh checkouts — e.g. the CI release runner — must
 *                  regenerate them before packing the npm tarball)
 *   3. Register  — Auto-generate .register.js files
 *   4. Brand     — Generate brand assets
 *   5. Prism     — Generate framework wrappers + HTML/CSS
 *   6. Manifest  — custom-elements.json via @custom-elements-manifest/analyzer
 *   7. Types     — types/index.d.ts generated from the manifest
 *   8. ModuleTypes — types/**.d.ts for exported non-element modules, from JSDoc
 *   9. Exports   — Sync package.json exports map, attaching a "types" condition
 *                  to every subpath. Runs last of the type steps because it
 *                  asserts the declaration files exist.
 *  10. Readme    — README component counts synced from docs data
 *
 * Usage: node scripts/generate.js
 */

import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const steps = [
  { name: 'Tokens',   cmd: 'node',  args: ['scripts/generate-base-css.js'] },
  { name: 'Icons',    cmd: 'node',  args: ['scripts/generate-icons.js'] },
  { name: 'Register', cmd: 'node',  args: ['scripts/generate-registrations.js'] },
  { name: 'Brand',    cmd: 'node',  args: ['scripts/generate-brand-assets.js'] },
  { name: 'Prism',    cmd: 'npx',   args: ['prism'] },
  { name: 'Manifest', cmd: 'node',  args: ['scripts/generate-manifest.js'] },
  { name: 'Types',    cmd: 'node',  args: ['scripts/generate-types.js'] },
  { name: 'ModuleTypes', cmd: 'node', args: ['scripts/generate-module-types.js'] },
  { name: 'Exports',  cmd: 'node',  args: ['scripts/generate-exports.js'] },
  { name: 'Editor',   cmd: 'node',  args: ['scripts/generate-editor-data.js'] },
  { name: 'DevSchema', cmd: 'node', args: ['scripts/generate-dev-schema.js'] },
  { name: 'Readme',   cmd: 'node',  args: ['scripts/generate-readme-stats.js'] },
  { name: 'Unions',   cmd: 'node',  args: ['scripts/check-prop-unions.js'] },
];

const totalStart = performance.now();
let failed = false;
let warned = 0;

console.log('\n  ARC UI — Generate\n');

for (const step of steps) {
  const start = performance.now();
  process.stdout.write(`  ${step.name.padEnd(10)} `);

  try {
    const out = execFileSync(step.cmd, step.args, { stdio: ['inherit', 'pipe', 'pipe'] });
    const ms = Math.round(performance.now() - start);
    console.log(`done  ${ms}ms`);

    // Steps run quiet, but a warning on a successful step is still a finding —
    // prism reports documentation drift this way. Swallowing stdout wholesale
    // meant those scrolled past into a pipe nobody read.
    // Prism groups its findings into a labelled end-of-run block rather than
    // printing the word "warning", so match the block's markers too. Its
    // --strict flag is the robust channel for this, but it cannot be adopted
    // while a finding we have deliberately accepted keeps it failing.
    const warnings = out
      .toString()
      .split('\n')
      .filter((l) =>
        /\bwarn(ing)?\b/i.test(l) ||
        /\bomits\b/.test(l) ||
        /\breserves\b/.test(l) ||
        /could not emit|can't emit/.test(l) ||
        /--strict/.test(l),
      );
    for (const w of warnings) console.log(`             ${w.trim()}`);
    if (warnings.length) warned += warnings.length;
  } catch (err) {
    const ms = Math.round(performance.now() - start);
    console.log(`FAIL  ${ms}ms`);
    console.error(`\n${err.stderr?.toString() || err.message}\n`);
    failed = true;
    break;
  }
}

const totalMs = Math.round(performance.now() - totalStart);
console.log(
  `\n  ${failed ? 'Done with errors' : 'Done'} in ${totalMs}ms` +
    (warned ? ` — ${warned} warning(s) above` : '') +
    '\n',
);

if (failed) process.exit(1);
