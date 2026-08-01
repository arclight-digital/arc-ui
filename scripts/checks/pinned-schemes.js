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
 * A list is exactly the thing that goes stale. When the softened variants were
 * added, the bar kept its three-name list, and `.theme-fixed-dark-soft` fell
 * through to the translucent path: the top bar rendered its softened blue at
 * 85% over a light page while the bar directly beneath it — a plain div with
 * the same class — painted the same token flat. Two pinned regions stacked
 * against each other, disagreeing, which reads as a rendering fault rather than
 * as a missing selector.
 *
 * Nothing failed. No test broke, no build warned; the class was real, the rule
 * was valid, and the only signal was a seam. So the list is checked against the
 * stylesheet that defines the classes rather than trusted.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const BASE_CSS = path.join(ROOT, 'shared', 'base.css');

/* Components that special-case being inside a pinned region, and must therefore
   handle every one of them. Add a file here when it grows a `:host(.theme-fixed…)`
   rule — the check reports what it covers, so an unlisted file is visible as an
   absence rather than silently unchecked. */
const CONSUMERS = [path.join(ROOT, 'packages', 'web-components', 'src', 'navigation', 'top-bar.js')];

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

const failures = [];

for (const file of CONSUMERS) {
  const src = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(ROOT, file);

  /* Which pinned classes this file names at all. Matching :host(.x) rather than
     a bare .x, because that is the form the special-case takes and a mention in
     a comment should not count as coverage. */
  const handled = new Set(
    [...src.matchAll(/:host\(\s*\.(theme-fixed[\w-]*)\s*\)/g)].map((m) => m[1]),
  );

  if (handled.size === 0) continue; // this file does not special-case pinned regions

  for (const cls of defined) {
    if (!handled.has(cls)) failures.push({ rel, cls });
  }
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} pinned-scheme class(es) not handled:\n`);
  for (const f of failures) {
    console.error(`  ${f.rel}  is missing :host(.${f.cls})`);
  }
  console.error(
    `\n  These components change behavior inside a pinned region. A class they do not\n` +
      `  name takes the unpinned path, which produces two adjacent regions that carry\n` +
      `  the same tokens and do not match.\n`,
  );
  process.exit(1);
}

console.log(`✓ ${defined.size} pinned-scheme classes handled by every component that special-cases them`);
