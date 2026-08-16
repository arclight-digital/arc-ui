/**
 * The side-slot rename, and what the alias actually promises.
 *
 * V4-PLAN 4.3 converged `start`/`end` onto `prefix`/`suffix` across
 * `arc-toolbar` and `arc-status-bar`. The static half of that is
 * `scripts/checks/side-slots.js`, which reads the JSDoc; it cannot tell whether
 * the old name still *projects*, and that is the whole promise of keeping it
 * for a major. Two slots in one region is the mechanism, so the thing worth
 * asserting is that both reach the same region and that the order is the
 * documented one rather than whatever the template happened to do.
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

    it('still projects the deprecated start/end into the same regions', async () => {
      // The promise the deprecation makes. If this fails, the alias is a
      // documentation claim with nothing behind it and the rename is a break.
      const el = mount(
        `<${tag}><span slot="start" id="a">a</span><span slot="end" id="b">b</span></${tag}>`,
      );
      await settle(el);
      expect(
        el.shadowRoot.querySelector(`${region} slot[name="start"]`).assignedElements(),
        'start still lands in the inline-start region',
      ).to.have.lengthOf(1);
      expect(
        el.shadowRoot.querySelector(`${endRegion} slot[name="end"]`).assignedElements(),
        'end still lands in the inline-end region',
      ).to.have.lengthOf(1);
    });

    it('puts start ahead of prefix when a consumer uses both mid-migration', async () => {
      // Not an arbitrary order: content already in `start` was there first, and
      // a migration that appends to `prefix` should not jump the queue. The
      // documented order is the rendered order of the two slots, so it is
      // asserted rather than left to whoever edits the template next.
      const el = mount(
        `<${tag}><span slot="prefix" id="new">n</span><span slot="start" id="old">o</span></${tag}>`,
      );
      await settle(el);
      const slots = [...el.shadowRoot.querySelectorAll(`${region} slot`)];
      expect(slots.map((s) => s.name)).to.eql(['prefix', 'start']);
      const order = slots.flatMap((s) => s.assignedElements().map((n) => n.id));
      expect(order).to.eql(['new', 'old']);
    });

    it('names the region part both ways', async () => {
      // `::part(start)` was the only handle on this region before v4 and keeps
      // working, on the same element, beside the new name.
      const el = mount(`<${tag}></${tag}>`);
      await settle(el);
      const start = el.shadowRoot.querySelector(region);
      expect(start.getAttribute('part').split(/\s+/)).to.include.members(['prefix', 'start']);
      const end = el.shadowRoot.querySelector(endRegion);
      expect(end.getAttribute('part').split(/\s+/)).to.include.members(['suffix', 'end']);
    });
  });
}
