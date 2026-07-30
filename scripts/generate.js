#!/usr/bin/env node

/**
 * generate.js — Unified code generation pipeline
 *
 * Runs all generation steps in order:
 *   1. Tokens    — shared/tokens.js → shared/base.css (the :root layer) and
 *                  src/generated/host-tokens.js (the :host layer every component
 *                  adopts). Both from one tree so they cannot drift.
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
  // Source-level assertions run first: they validate the hand-written inputs
  // to everything below, and failing here beats failing after the 35s prism
  // step. The output-level checks (Unions/Fallbacks/Slots) stay at the end —
  // they need the generated wrappers to exist.
  { name: 'Requires', cmd: 'node',  args: ['scripts/check-child-registrations.js'] },
  { name: 'Events',   cmd: 'node',  args: ['scripts/check-event-conventions.js'] },
  { name: 'IconNames', cmd: 'node', args: ['scripts/check-icon-names.js'] },
  { name: 'DocClaims', cmd: 'node', args: ['scripts/check-doc-claims.js'] },
  { name: 'Tokens',   cmd: 'node',  args: ['scripts/generate-base-css.js'] },
  { name: 'HostTokens', cmd: 'node', args: ['scripts/generate-host-tokens.js'] },
  { name: 'Icons',    cmd: 'node',  args: ['scripts/generate-icons.js'] },
  { name: 'Register', cmd: 'node',  args: ['scripts/generate-registrations.js'] },
  { name: 'Brand',    cmd: 'node',  args: ['scripts/generate-brand-assets.js'] },
  // --prune: prism reports orphaned output (wrappers/CSS/examples for a component
  // that no longer exists) but keeps it unless asked to delete. Reporting alone
  // meant deletions were finished by hand and sometimes not at all — the six
  // ToastManager wrapper files outlived their component until they were noticed.
  // Regenerating is the moment the orphan is known; delete it there.
  { name: 'Prism',    cmd: 'npx',   args: ['prism', '--strict', '--prune'] },
  { name: 'WrapperExports', cmd: 'node', args: ['scripts/generate-wrapper-exports.js'] },
  { name: 'Manifest', cmd: 'node',  args: ['scripts/generate-manifest.js'] },
  { name: 'Types',    cmd: 'node',  args: ['scripts/generate-types.js'] },
  { name: 'ModuleTypes', cmd: 'node', args: ['scripts/generate-module-types.js'] },
  { name: 'Exports',  cmd: 'node',  args: ['scripts/generate-exports.js'] },
  { name: 'Editor',   cmd: 'node',  args: ['scripts/generate-editor-data.js'] },
  { name: 'DevSchema', cmd: 'node', args: ['scripts/generate-dev-schema.js'] },
  { name: 'Readme',   cmd: 'node',  args: ['scripts/generate-readme-stats.js'] },
  { name: 'Unions',   cmd: 'node',  args: ['scripts/check-prop-unions.js'] },
  { name: 'Fallbacks', cmd: 'node', args: ['scripts/check-enum-fallbacks.js'] },
  { name: 'Slots',    cmd: 'node',  args: ['scripts/check-wrapper-slots.js'] },
  { name: 'WrapperTypes', cmd: 'node', args: ['scripts/check-wrapper-types.js'] },
];

const totalStart = performance.now();
let failed = false;
let warned = 0;
let accepted = 0;

console.log('\n  ARC UI — Generate\n');

for (const step of steps) {
  const start = performance.now();
  process.stdout.write(`  ${step.name.padEnd(10)} `);

  try {
    const out = execFileSync(step.cmd, step.args, { stdio: ['inherit', 'pipe', 'pipe'] });
    const ms = Math.round(performance.now() - start);
    console.log(`done  ${ms}ms`);

    // Steps run quiet, but a finding on a *successful* step is still a finding,
    // and swallowing stdout wholesale meant those scrolled into a pipe nobody
    // read. Prism prefixes its report headings with a literal `prism: warning:`
    // / `prism: accepted:` precisely so this match can be exact rather than a
    // guess at its prose — earlier versions were matched heuristically and a
    // reworded heading silently hid a real finding twice.
    //
    // Prism additionally runs under --strict, so anything it could not act on
    // fails this step outright. Findings we have decided about are waived in
    // prism.config.js `acknowledge`, where they still print and where a stale
    // entry is itself a strict failure.
    // Only the headings carry the prefix; the findings themselves are indented
    // beneath one. Take the heading and its block, or the summary would say
    // "1 accepted finding" without ever saying which.
    const lines = out.toString().split('\n');
    const reported = [];
    let inBlock = false;
    for (const line of lines) {
      const heading = /^\s*prism: (warning|accepted):/.test(line);
      if (heading) {
        inBlock = true;
        reported.push(line);
        continue;
      }
      if (inBlock) {
        if (/^\s+\S/.test(line)) reported.push(line);
        else inBlock = false;
        continue;
      }
      if (/\bwarn(ing)?\b/i.test(line)) reported.push(line);
    }
    for (const line of reported) console.log(`             ${line.trim()}`);
    // An acknowledged finding is a recorded decision, not an outstanding one.
    // Counting them together would make a clean run read as a dirty one, which
    // is how a summary line stops being worth reading.
    // Count headings only — the block beneath one is detail, not extra findings.
    warned += reported.filter(
      (l) => /^\s*prism: warning:/.test(l) || (!/^\s+\S/.test(l) && /\bwarn(ing)?\b/i.test(l)),
    ).length;
    accepted += reported.filter((l) => /^\s*prism: accepted:/.test(l)).length;
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
    (accepted ? ` — ${accepted} accepted finding(s)` : '') +
    '\n',
);

if (failed) process.exit(1);
