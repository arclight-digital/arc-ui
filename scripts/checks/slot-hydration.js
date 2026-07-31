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
 * What counts as a mirror: a `display: none` rule on a class whose name
 * contains `slot-host` (the house name for the hidden original) or a
 * `.slot-host` of its own. What counts as a first-render read: a
 * `firstUpdated` that mentions a slot.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { SRC_DIR } from '../lib/component-tags.js';

/**
 * Components that hide a slot host but genuinely do not mirror it — the hidden
 * slot is a probe for presence rather than a source of content. Each entry has
 * to say why, and one that stops being true should be deleted rather than kept
 * as cover.
 */
const WAIVERS = new Map([
  [
    'fieldset.js',
    'the hidden rule is .legend__slot--empty, a collapse when the legend slot ' +
      'has no content — there is no mirror, the slot itself is the output',
  ],
]);

const tiers = readdirSync(SRC_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== 'icons' && e.name !== 'generated')
  .map((e) => e.name);

let checked = 0;
let failures = 0;

for (const tier of tiers) {
  for (const file of readdirSync(join(SRC_DIR, tier))) {
    if (!file.endsWith('.js') || file.endsWith('.register.js')) continue;
    const source = readFileSync(resolve(SRC_DIR, tier, file), 'utf-8');

    const hidesSlotHost = /\.[\w-]*slot-host[^{]*\{[^}]*display:\s*none/.test(source);
    const readsOnSlotChange = /@slotchange=/.test(source);
    if (!hidesSlotHost || !readsOnSlotChange) continue;

    checked++;
    if (WAIVERS.has(file)) continue;

    // A firstUpdated that mentions a slot — either querying one directly or
    // handing off to a helper that does.
    const firstUpdated = /firstUpdated\s*\([^)]*\)\s*\{([\s\S]*?)\n {2}\}/.exec(source);
    const readsOnFirstRender = firstUpdated && /slot/i.test(firstUpdated[1]);

    if (!readsOnFirstRender) {
      console.error(
        `  ${tier}/${file} hides its slot host and reads children only on slotchange — ` +
          `under declarative shadow DOM that event never fires, so it renders an ` +
          `empty mirror over hidden content. Read the slot in firstUpdated too.`
      );
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ ${failures} component(s) lose their slotted content under SSR`);
  process.exit(1);
}

console.log(`✓ every mirroring component reads its slot on first render (${checked} components)`);
