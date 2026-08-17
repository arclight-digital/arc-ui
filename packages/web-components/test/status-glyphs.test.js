/**
 * Status glyphs are decorative — the variant is already conveyed by role and
 * message text, and the raw unicode characters have miserable screen-reader
 * announcements ("check mark", "warning sign") that preface every message.
 * Every component rendering getStatusIcon() output must mark the glyph's
 * element aria-hidden.
 *
 * Regression test for arc-alert, which shipped announcing its glyph while all
 * three siblings guarded theirs.
 */
import { expect } from '@esm-bundle/chai';
import { getStatusIcon } from '../src/status-utils.js';
import '../src/feedback/alert.register.js';
import '../src/feedback/banner.register.js';
import '../src/feedback/toast.register.js';
import { mount, cleanup } from './helpers.js';

const GLYPHS = ['info', 'success', 'warning', 'error'].map(getStatusIcon);

/** Elements in the shadow root whose own text is a status glyph. */
function glyphElements(el) {
  const found = [];
  const walker = document.createTreeWalker(el.shadowRoot, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (GLYPHS.includes(text)) found.push(walker.currentNode.parentElement);
  }
  return found;
}

function expectGlyphsHidden(el, tag) {
  const glyphs = glyphElements(el);
  expect(glyphs.length, `${tag} should render a status glyph`).to.be.greaterThan(0);
  for (const glyphEl of glyphs) {
    const hidden = glyphEl.closest('[aria-hidden="true"]');
    expect(hidden, `${tag} glyph <${glyphEl.localName}> must be inside aria-hidden="true"`).to.not.be.null;
  }
}

describe('status glyphs are aria-hidden', () => {
  afterEach(cleanup);

  for (const tag of ['arc-alert', 'arc-banner']) {
    it(`${tag} hides its glyph from assistive tech`, async () => {
      const el = mount(`<${tag} variant="success">All good</${tag}>`);
      await el.updateComplete;
      expectGlyphsHidden(el, tag);
    });
  }

  it('arc-toast hides its glyph from assistive tech', async () => {
    const el = mount('<arc-toast></arc-toast>');
    await el.updateComplete;
    el.show({ message: 'All good', variant: 'success', persistent: true });
    await el.updateComplete;
    expectGlyphsHidden(el, 'arc-toast');
  });
});
