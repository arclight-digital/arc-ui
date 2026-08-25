/**
 * check-image-hydration.js
 *
 * Asserts that a component which gates paint on an `<img>` load event also
 * repairs the load it missed, by calling `hydrateImages(this)`.
 *
 * The sibling of slot-hydration.js, and the same trap one element over. Under
 * declarative shadow DOM the parser creates the `<img>` and starts fetching it
 * immediately — a display:none `<dialog>` does not stop it — while the `@load`
 * binding does not exist until the hydrate bundle runs. A cached, small or
 * above-the-fold image finishes in that gap, `load` fires into nothing, and the
 * flag the handler was going to set stays at its default.
 *
 * That default is never neutral in these components, because two-step paint is
 * the point of them: the image sits at `opacity: 0` (arc-image, arc-avatar,
 * arc-lightbox) or `visibility: hidden` (arc-image-cropper) until the handler
 * fades it in. Missing the event means a permanently invisible picture under a
 * shimmer that never stops — and in the cropper, every control disabled. All
 * four shipped this way, and nothing caught it: the event always arrives
 * client-side, which is where tests run, and above-the-fold images are exactly
 * the ones fast enough to lose the race.
 *
 * The rule is the broad one, for the same reason slot-hydration's is: any
 * component that listens for `@load` at all is a component whose first render
 * can be the one that misses it. The fix is one line in connectedCallback.
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

    // A load binding on an element the server can render. `<img>` is the only
    // one here; a media element that grows one belongs in this check too.
    if (!/@load=/.test(source)) continue;

    checked++;

    if (!/hydrateImages\s*\(\s*this\s*\)/.test(source)) {
      console.error(
        `  ${tier}/${file} gates paint on an img load event but never repairs the one ` +
          `declarative shadow DOM already spent — server-rendered, that image loads ` +
          `before the listener exists and the component stays in its loading state ` +
          `forever. Call hydrateImages(this) in connectedCallback.`
      );
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ ${failures} component(s) stay unpainted under SSR`);
  process.exit(1);
}

console.log(`✓ every img load listener repairs the load DSD spent (${checked} components)`);
