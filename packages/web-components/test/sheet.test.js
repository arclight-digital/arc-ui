/**
 * arc-sheet sizing: the two custom properties that size the panel.
 *
 * Reported against 4.2.2 (test-findings #103): the bottom sheet's height was a
 * literal `max-height: 80vh`, reachable only through `::part(panel)`. On a
 * phone, `vh` is the viewport with the browser chrome retracted, so a sheet
 * opened under a visible address bar ran its footer off the screen.
 */
import { expect } from '@esm-bundle/chai';
import '../src/feedback/sheet.register.js';
import { mount, cleanup, settle } from './helpers.js';

afterEach(cleanup);

const panel = (el) => el.shadowRoot.querySelector('[part~="panel"]');

describe('arc-sheet sizing', () => {
  it('defaults a bottom sheet to 80% of the dynamic viewport', async () => {
    const el = mount('<arc-sheet open heading="S">Body</arc-sheet>');
    await settle(el);
    const probe = document.createElement('div');
    probe.style.height = '80dvh';
    document.body.appendChild(probe);
    expect(getComputedStyle(panel(el)).maxHeight).to.equal(`${probe.getBoundingClientRect().height}px`);
  });

  it('takes its height from --sheet-max-height', async () => {
    const el = mount('<arc-sheet open heading="S" style="--sheet-max-height: 240px">Body</arc-sheet>');
    await settle(el);
    expect(getComputedStyle(panel(el)).maxHeight).to.equal('240px');
  });

  it('takes a right sheet\'s width from --sheet-width', async () => {
    const el = mount('<arc-sheet open side="right" heading="S" style="--sheet-width: 320px">Body</arc-sheet>');
    await settle(el);
    expect(getComputedStyle(panel(el)).width).to.equal('320px');
  });
});

/**
 * Where the sheet actually is (test-findings #126). The UA stylesheet gives a
 * modal dialog inset-block: 0 and every dialog inset-inline: 0, and the sheet
 * overrode only half of each, so from the move to <dialog> until 4.6 a bottom
 * sheet rendered at the top of the screen and a right sheet on the left, at its
 * content height. Nothing measured position; these do, modal and not.
 */
describe('arc-sheet position', () => {
  const box = async (markup) => {
    const el = mount(markup);
    await settle(el);
    await new Promise((r) => setTimeout(r, 650)); // past the entry transition
    return panel(el).getBoundingClientRect();
  };

  for (const modality of ['', 'no-modal']) {
    const name = modality ? 'non-modal' : 'modal';

    it(`puts a ${name} bottom sheet on the bottom edge, full width`, async () => {
      const r = await box(`<arc-sheet open heading="S" ${modality}>Short</arc-sheet>`);
      expect(Math.round(r.bottom)).to.equal(window.innerHeight);
      expect(Math.round(r.left)).to.equal(0);
      expect(Math.round(r.right)).to.equal(window.innerWidth);
      expect(r.top, 'not at the top').to.be.greaterThan(0);
    });

    it(`puts a ${name} right sheet on the right edge, full height`, async () => {
      const r = await box(`<arc-sheet open side="right" heading="S" style="--sheet-width: 320px" ${modality}>Short</arc-sheet>`);
      expect(Math.round(r.right)).to.equal(window.innerWidth);
      expect(Math.round(r.width)).to.equal(320);
      expect(Math.round(r.top)).to.equal(0);
      expect(Math.round(r.bottom)).to.equal(window.innerHeight);
    });
  }
});
