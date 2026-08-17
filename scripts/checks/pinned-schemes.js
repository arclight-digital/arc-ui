/**
 * Every pinned-scheme class has to reach the components that special-case one.
 *
 * `.theme-fixed-*` pins a subtree to a scheme, and a component may need to know
 * it is inside one. arc-top-bar does: it paints `--surface-base` mixed 85% with
 * transparent, which costs nothing when the region's scheme matches the page —
 * 15% of a near-black page bleeds through as near-black — but renders the same
 * token visibly lighter when it doesn't. So it drops the translucency inside a
 * pinned region, via an explicit `:host(.theme-fixed…)` list.
 *
 * A list is exactly the thing that goes stale. When the classes were renamed,
 * the bar kept the old names, and the new one fell through to the translucent
 * path: the top bar rendered its lifted blue at 85% over a light page while the
 * bar directly beneath it — a plain div with the same class — painted the same
 * token flat. Two pinned regions stacked against each other, disagreeing, which
 * reads as a rendering fault rather than as a missing selector.
 *
 * Nothing failed. No test broke, no build warned; the class was real, the rule
 * was valid, and the only signal was a seam. So the list is checked against the
 * stylesheet that defines the classes rather than trusted.
 *
 * ── On `scripts/lib/source-walker.js` (V4-PLAN 4.10) ──
 *
 * The stylesheet half stays file-level — shared/base.css is not a component and
 * is where the classes are defined. The consumer half is a rule, run over the
 * components CONSUMERS names, which is the same set the hand-rolled loop opened
 * and now cannot name a file that is not a registered component. Coverage is
 * read off `code` rather than the raw source, so the "a mention in a comment
 * should not count as coverage" below is now true of a `:host(…)` in a comment
 * as well as of a bare `.theme-fixed-dark`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { lineAt, run } from '../lib/source-walker.js';
import { SRC_DIR } from '../lib/component-tags.js';

const ROOT = path.resolve(SRC_DIR, '..', '..', '..');
const BASE_CSS = path.join(ROOT, 'shared', 'base.css');

/* Components that special-case being inside a pinned region, and must therefore
   handle every one of them. Add a file here when it grows a `:host(.theme-fixed…)`
   rule — the check reports what it covers, so an unlisted file is visible as an
   absence rather than silently unchecked. */
const CONSUMERS = [path.join('navigation', 'top-bar.js')];

/** The pinned-scheme classes the stylesheet actually defines. */
const css = fs.readFileSync(BASE_CSS, 'utf-8');
const defined = new Set([...css.matchAll(/\.(theme-fixed[\w-]*)/g)].map((m) => m[1]));

if (defined.size === 0) {
  console.error(
    `\n✗ no .theme-fixed* classes found in shared/base.css — either the pinned-scheme\n` +
      `  blocks were removed, or this check is looking at a stale or unbuilt stylesheet.\n` +
      `  Run \`pnpm generate\` and try again.\n`,
  );
  process.exit(1);
}

/** How many classes the consumers covered between them — see the guard below. */
let covered = 0;

const everyPinnedClass = {
  name: 'pinned-schemes',
  describe: 'a component that special-cases a pinned region handles every pinned class',
  hint:
    'These components change behavior inside a pinned region. A class they do not\n' +
    '    name takes the unpinned path, which produces two adjacent regions that carry\n' +
    '    the same tokens and do not match.',
  component({ code, report }) {
    /* Which pinned classes this file names at all. Matching :host(.x) rather than
       a bare .x, because that is the form the special-case takes and a mention in
       a comment should not count as coverage. */
    const hits = [...code.matchAll(/:host\(\s*\.(theme-fixed[\w-]*)\s*\)/g)];
    const handled = new Set(hits.map((m) => m[1]));

    if (handled.size === 0) return; // this file does not special-case pinned regions
    covered += handled.size;

    const line = lineAt(code, hits[0].index);
    for (const cls of defined) {
      if (!handled.has(cls)) report(line, `is missing :host(.${cls})`);
    }
  },
};

const code = run({
  name: 'pinned-schemes',
  rules: [everyPinnedClass],
  filter: (meta) => CONSUMERS.includes(path.join(meta.tier, meta.file)),
});

/**
 * The consumers, checked for having stopped being consumers.
 *
 * Every listed file is allowed to name no pinned class — that is the `continue`
 * above, and it is what lets a file be listed before it grows the rule. But if
 * *none* of them names one, the sweep asserted nothing at all, which is the
 * same silence the seam had: valid files, a valid stylesheet, and no coverage.
 */
if (covered === 0) {
  console.error(
    `\n✗ no :host(.theme-fixed…) rules in any of the ${CONSUMERS.length} consumer(s) —\n` +
      `  ${CONSUMERS.join(', ')}.\n` +
      `  Either the special-casing was removed, or CONSUMERS names the wrong files.\n` +
      `  Both leave this check asserting nothing.\n`,
  );
  process.exit(1);
}

if (code === 0) {
  console.log(`✓ ${defined.size} pinned-scheme classes handled by every component that special-cases them`);
}

process.exit(code);
