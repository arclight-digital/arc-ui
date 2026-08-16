#!/usr/bin/env node

/**
 * generate.js — Unified code generation pipeline
 *
 * One command regenerates everything derived from source: tokens CSS, icons,
 * registrations, framework wrappers, manifest, types, exports, editor data.
 * Checks from scripts/checks/ are interleaved where their inputs exist —
 * source assertions before the expensive prism step, output assertions after.
 * The phase list below is the ordering contract; each phase's comment says
 * why it sits where it does.
 *
 * Usage: node scripts/generate.js
 */

import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const gen = (name) => ({ name, cmd: 'node', args: [`scripts/generate/${name}.js`] });
const check = (name) => ({ name, cmd: 'node', args: [`scripts/checks/${name}.js`] });

const phases = [
  {
    // Validate the hand-written inputs to everything below — failing here
    // beats failing after the 35s prism step. breakpoint-drift used to run
    // as a hidden dynamic import at the end of generate/breakpoints.js; it
    // reads only hand-written source and tokens.js, so it asserts here.
    title: 'Assert sources',
    steps: [
      // First, and before the prism step it guards: an older prism does not
      // fail, it silently reverts all 235 wrapper files to the pre-fix output.
      check('prism-version'),
      // Before everything that reads a source file, because a source that does
      // not parse fails four steps later with an error naming the wrong thing.
      check('css-backticks'),
      check('child-registrations'),
      check('event-conventions'),
      check('doc-claims'),
      // The 4.3 dialect checks. Source assertions, so they run here — before
      // the prism step whose output would otherwise carry the dialect forward
      // into six wrapper packages.
      check('size-canon'),
      check('dismiss-prop'),
      check('array-dialect'),
      check('part-base'),
      check('side-slots'),
      check('boolean-defaults'),
      check('empty-attributes'),
      check('breakpoint-drift'),
    ],
  },
  {
    // shared/tokens.js → the :root layer (base.css), the :host layer every
    // component adopts, breakpoint constants, and the utility classes.
    // One tree, four outputs, so they cannot drift.
    title: 'Tokens',
    steps: [
      gen('base-css'),
      gen('host-tokens'),
      gen('breakpoints'),
      gen('utilities'),
      // The AAA preset, solved by the same contrast contract as the four
      // shipped schemes rather than written by hand and claimed. See the
      // high-contrast block in shared/tokens.js.
      gen('high-contrast'),
    ],
  },
  {
    // Vendored icon modules are gitignored — fresh checkouts (e.g. the CI
    // release runner) must regenerate them before packing the npm tarball.
    // icon-names reads the vendored resolvers, so it belongs here and not
    // with the other source assertions: run earlier, it passes locally and
    // fails on every clean checkout.
    title: 'Icons',
    steps: [gen('icons'), check('icon-names'), check('icon-attribution')],
    // icon-independence is not here: two of its three rules read the core
    // export map, which `gen('exports')` rewrites four phases later. It runs
    // with the other output assertions.
  },
  {
    // --prune: prism reports orphaned output (wrappers/CSS/examples for a
    // component that no longer exists) but keeps it unless asked to delete.
    // Reporting alone meant deletions were finished by hand and sometimes not
    // at all — the six ToastManager wrapper files outlived their component
    // until they were noticed. Regenerating is the moment the orphan is
    // known; delete it there.
    title: 'Components',
    steps: [
      gen('registrations'),
      // After registrations (the group barrels re-export the .register.js files
      // it writes) and before prism, whose barrelExclude is the other half of
      // the same decision — a group barrel that existed only after the prune
      // would leave the excluded names unreachable for one whole run.
      gen('group-barrels'),
      { name: 'prism', cmd: 'npx', args: ['prism', '--strict', '--prune'] },
      // Immediately after prism, whose output it rewrites. A bridge, not a
      // design: generating framework-native bindings is prism's remit and a
      // ControlValueAccessor is the most framework-native thing Angular has.
      // Specified upstream in PRISM-3.md §2.1; this step goes when that lands.
      gen('angular-cva'),
      check('barrel-gating'),
      // Reads the Angular sources angular-cva just rewrote, against the
      // elements' own declarations — the pass failing loudly covers it not
      // running, not it running wrong.
      check('angular-forms'),
    ],
  },
  {
    // exports runs last of the type steps: it attaches a "types" condition
    // to every subpath and asserts the declaration files exist.
    title: 'Manifest & types',
    steps: [gen('wrapper-exports'), gen('manifest'), gen('types'), gen('module-types'), gen('exports')],
  },
  {
    title: 'Editor & docs data',
    // readme-stats and migration-toc both rewrite hand-written prose from
    // derived facts — the component count, and the order and index of the v4
    // sections. Neither reads generated output, but both belong after the
    // catalog is settled rather than before it.
    steps: [gen('editor-data'), gen('dev-schema'), gen('readme-stats'), gen('migration-toc')],
  },
  {
    // These assert against the generated wrappers, so they can only run
    // after prism has produced them.
    title: 'Assert output',
    steps: [
      check('prop-unions'),
      check('enum-fallbacks'),
      check('wrapper-slots'),
      check('wrapper-types'),
      check('motion-tokens'),
      check('focus-ring'),
      // Reads the component sources *and* the token layer generated above, to
      // tell a font declaration that names a real token from one that names
      // nothing — so it cannot run with the source assertions at the top.
      check('type-roles'),
      // Measured on the emitted stylesheets rather than on the tree: the point
      // is to catch a color that reached a scheme without going through the
      // solver, which is exactly what the hand-written AAA preset was.
      check('contrast-contract'),
      // The theming API, as an assertion: everything that carries the brand
      // follows the two inputs, and the brand is spelled once per scheme.
      check('two-color-contract'),
      // Compiles the JSX augmentations against each framework's own resolution,
      // because their content being right says nothing about whether a consumer
      // can switch them on — see the check's header.
      check('jsx-augmentations'),
      // The release publishes only what changed since the last tag, which is
      // safe exactly while every wrapper's core floor is a caret stamped at
      // pack time rather than a literal someone typed.
      check('version-floor'),
      // 4.7's outcome as a rule: nothing in core reaches an icon pack, by path
      // or by specifier, and the ./icons/ subpaths stay gone from the map that
      // `gen('exports')` rewrote two phases ago.
      check('icon-independence'),
    ],
  },
];

/**
 * Steps run quiet, but a finding on a *successful* step is still a finding,
 * and swallowing stdout wholesale meant those scrolled into a pipe nobody
 * read. Prism prefixes its report headings with a literal `prism: warning:` /
 * `prism: accepted:` precisely so this match can be exact rather than a guess
 * at its prose — earlier versions were matched heuristically and a reworded
 * heading silently hid a real finding twice.
 *
 * Prism additionally runs under --strict, so anything it could not act on
 * fails the step outright. Findings we have decided about are waived in
 * prism.config.js `acknowledge`, where they still print and where a stale
 * entry is itself a strict failure. Only the headings carry the prefix; the
 * findings themselves are indented beneath one — take the heading and its
 * block, or the summary would say "1 accepted finding" without ever saying
 * which.
 */
function extractFindings(stdout) {
  const reported = [];
  let inBlock = false;
  for (const line of stdout.split('\n')) {
    if (/^\s*prism: (warning|accepted):/.test(line)) {
      inBlock = true;
      reported.push(line);
    } else if (inBlock && /^\s+\S/.test(line)) {
      reported.push(line);
    } else {
      inBlock = false;
      if (/\bwarn(ing)?\b/i.test(line)) reported.push(line);
    }
  }
  // An acknowledged finding is a recorded decision, not an outstanding one —
  // counting them together would make a clean run read as a dirty one, which
  // is how a summary line stops being worth reading. Count headings only;
  // the block beneath one is detail, not extra findings.
  return {
    reported,
    warnings: reported.filter(
      (l) => /^\s*prism: warning:/.test(l) || (!/^\s+\S/.test(l) && /\bwarn(ing)?\b/i.test(l)),
    ).length,
    accepted: reported.filter((l) => /^\s*prism: accepted:/.test(l)).length,
  };
}

const totalStart = performance.now();
let failed = false;
let warned = 0;
let accepted = 0;

console.log('\n  ARC UI — Generate');

outer: for (const phase of phases) {
  console.log(`\n  ${phase.title}`);
  for (const step of phase.steps) {
    const start = performance.now();
    process.stdout.write(`    ${step.name.padEnd(22)} `);
    try {
      const out = execFileSync(step.cmd, step.args, { stdio: ['inherit', 'pipe', 'pipe'] });
      console.log(`done  ${Math.round(performance.now() - start)}ms`);
      const findings = extractFindings(out.toString());
      for (const line of findings.reported) console.log(`      ${line.trim()}`);
      warned += findings.warnings;
      accepted += findings.accepted;
    } catch (err) {
      console.log(`FAIL  ${Math.round(performance.now() - start)}ms`);
      // Both streams, stdout first (matching scripts/check.js): prism reports
      // its findings on stdout and several checks mix streams, so printing
      // stderr alone left CI red with no cause shown.
      const out = `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`.trim();
      console.error(`\n${out || err.message}\n`);
      failed = true;
      break outer;
    }
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
