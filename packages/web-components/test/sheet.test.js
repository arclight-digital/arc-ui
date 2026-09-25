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
