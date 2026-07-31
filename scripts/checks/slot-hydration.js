/**
 * check-slot-hydration.js
 *
 * Asserts that a component which hides its slotted children and renders a
 * mirror of them reads the slot on first render, not only on `slotchange`.
 *
 * The trap is the DOM's, not any framework's. Under declarative shadow DOM the
 * parser attaches the shadow root and assigns the light-DOM children to the
 * `<slot>` before any script runs. The element then upgrades and Lit *adopts*
 * that tree rather than building it, so no new `<slot>` is ever created and no
 * assignment ever changes. `slotchange` fires on assignment changes, so it
 * never fires at all.
 *
 * For most components that is harmless — a handler that sets `_hasPrefix` for
 * styling just leaves the default. It is not harmless for the mirror pattern:
 * these components hide the real children with `display: none` on their slot
 * host and render their own copy from state the event was supposed to fill.
 * Upgrading with an empty read means an empty mirror in front of hidden
 * content, which is indistinguishable from the component not being there.
 *
 * It has happened twice. arc-segmented-control collapsed to an 8px sliver on
 * every server-rendered page including its own documentation, and
 * arc-navigation-menu took the site's entire top-bar nav with it on the first
 * production deploy of v3 — four links, gone, with the markup present in the
 * HTML the whole time. Neither had a failing test, because both work
 * client-side, which is where tests run.
 *
 * The fix each time is one line: read the slot in `firstUpdated` as well. This
 * check makes the third instance fail here instead of in production.
 *
 * The rule is deliberately broad: every component that listens for slotchange
 * must read its slots on first render. The first version of this check only
 * looked for the mirror pattern — a hidden slot host — and missed arc-app-shell,
 * which hides nothing and instead sizes its table-of-contents rail from a
 * slotchange read. The rail collapsed to `display: none` and took the docs
 * scroll spy with it, two hours after the narrow check passed. If a component
 * cares about slotchange at all, DSD eats the one that matters.
 *
 * This also removes a divergence rather than adding a special case: client-side,
 * slotchange does fire on first render, so a handler running once at
 * firstUpdated is what every component already experiences in the browser.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { SRC_DIR } from '../lib/component-tags.js';

const tiers = readdirSync(SRC_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== 'icons' && e.name !== 'generated')
  .map((e) => e.name);

let checked = 0;
let failures = 0;

for (const tier of tiers) {
  for (const file of readdirSync(join(SRC_DIR, tier))) {
    if (!file.endsWith('.js') || file.endsWith('.register.js')) continue;
    const source = readFileSync(resolve(SRC_DIR, tier, file), 'utf-8');

    if (!/@slotchange=/.test(source)) continue;

    checked++;

    // A firstUpdated that mentions a slot — either querying one directly or
    // handing off to a helper that does.
    const firstUpdated = /firstUpdated\s*\([^)]*\)\s*\{([\s\S]*?)\n {2}\}/.exec(source);
    const readsOnFirstRender = firstUpdated && /slot/i.test(firstUpdated[1]);

    if (!readsOnFirstRender) {
      console.error(
        `  ${tier}/${file} listens for slotchange but never reads its slots on first ` +
          `render — under declarative shadow DOM that event never fires, so whatever ` +
          `the handler sets stays at its default. Call hydrateSlots(this) in firstUpdated.`
      );
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ ${failures} component(s) lose slot-derived state under SSR`);
  process.exit(1);
}

console.log(`✓ every slotchange listener reads its slots on first render (${checked} components)`);
