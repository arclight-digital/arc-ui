/**
 * The side-slot rename, finished.
 *
 * V4-PLAN 4.3 converged `start`/`end` onto `prefix`/`suffix` across
 * `arc-toolbar` and `arc-status-bar`, briefly keeping the old names as alias
 * slots; the pre-release housecleaning removed the aliases outright, since v4
 * never shipped and they served no one. The static half is
 * `scripts/checks/side-slots.js`, which reads the JSDoc; what it cannot tell
 * is what the template actually renders — so the canonical slots are asserted
 * to project, and the retired ones are asserted to be *gone*, because an
 * alias slot quietly surviving in the template would be undocumented API.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';
import '../src/layout/toolbar.register.js';
import '../src/layout/status-bar.register.js';

afterEach(() => cleanup());

const BARS = [
  { tag: 'arc-toolbar', region: '.toolbar__start', endRegion: '.toolbar__end' },
  { tag: 'arc-status-bar', region: '.status-bar__start', endRegion: '.status-bar__end' },
];

for (const { tag, region, endRegion } of BARS) {
  describe(`${tag} side slots`, () => {
    it('projects prefix into the inline-start region', async () => {
      const el = mount(`<${tag}><span slot="prefix" id="p">p</span></${tag}>`);
      await settle(el);
      const slot = el.shadowRoot.querySelector(`${region} slot[name="prefix"]`);
      expect(slot, 'the prefix slot renders').to.not.equal(null);
      expect(slot.assignedElements().map((n) => n.id)).to.eql(['p']);
    });

    it('projects suffix into the inline-end region', async () => {
      const el = mount(`<${tag}><span slot="suffix" id="s">s</span></${tag}>`);
      await settle(el);
      const slot = el.shadowRoot.querySelector(`${endRegion} slot[name="suffix"]`);
      expect(slot, 'the suffix slot renders').to.not.equal(null);
      expect(slot.assignedElements().map((n) => n.id)).to.eql(['s']);
    });

    it('no longer renders the retired start/end slots', async () => {
      // The other direction of the removal: an alias slot surviving in the
      // template after leaving the docs would be undocumented API — reachable,
      // unlisted, and rot the moment someone depends on it. MIGRATION.md says
      // content in the old names lands in the default slot now, which is what
      // "no named slot" means.
      const el = mount(`<${tag}></${tag}>`);
      await settle(el);
      expect(el.shadowRoot.querySelector('slot[name="start"]')).to.equal(null);
      expect(el.shadowRoot.querySelector('slot[name="end"]')).to.equal(null);
    });

    it('names the region part with the canonical name only', async () => {
      // `::part(start)` was the pre-v4 handle; it went with the slot alias, so
      // the part list carrying it again would be the same quiet rot.
      const el = mount(`<${tag}></${tag}>`);
      await settle(el);
      expect(el.shadowRoot.querySelector(region).getAttribute('part').split(/\s+/)).to.eql(['prefix']);
      expect(el.shadowRoot.querySelector(endRegion).getAttribute('part').split(/\s+/)).to.eql(['suffix']);
    });
  });
}
