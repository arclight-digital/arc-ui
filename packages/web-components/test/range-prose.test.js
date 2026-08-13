/**
 * Props whose `@prop` prose stated a range that nothing enforced.
 *
 * Found by surveying rather than by reading components one at a time: of 109
 * numeric props not yet on the vocabulary, **12 state an explicit range** in
 * their prose ("0 to 1", "a fraction", "from 0 to 100"). Those 12 are where a
 * documented constraint can be checked against the code, and five of them were
 * enforced on the render or not at all.
 *
 * arc-split-pane is the one worth reading. Its drag handler clamps to
 * `minRatio`..`maxRatio`, so dragging always respected the bounds — and
 * assigning `ratio` from script bypassed them completely. That is finding #58's
 * shape exactly: a constraint enforced on the *interaction* rather than on the
 * state. It is also why the declaration names the sibling props as bounds
 * rather than hardcoding 0..1: the real contract is the one the drag obeys.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';

import '../src/layout/split-pane.register.js';
import '../src/feedback/progress.register.js';
import '../src/data/waveform.register.js';
import '../src/data/level-meter.register.js';

afterEach(() => cleanup());

const make = async (html) => {
  const el = mount(html);
  await settle(el);
  return el;
};

describe('arc-split-pane ratio obeys its own bounds on every path', () => {
  const pane = (attrs = '') =>
    make(`<arc-split-pane ${attrs}><div slot="start">a</div><div slot="end">b</div></arc-split-pane>`);

  it('defaults to 0.5', async () => {
    expect((await pane()).ratio).to.equal(0.5);
  });

  it('holds an over-range assignment at maxRatio', async () => {
    // The defect: the drag path clamped to maxRatio (0.85 by default) and the
    // property path did not, so `el.ratio = 0.99` produced a layout the
    // component would never allow a user to drag to.
    const el = await pane();
    el.ratio = 0.99;
    await settle(el);
    expect(el.ratio).to.equal(0.85);
  });

  it('holds an under-range assignment at minRatio', async () => {
    const el = await pane();
    el.ratio = 0.01;
    await settle(el);
    expect(el.ratio).to.equal(0.15);
  });

  it('follows custom bounds rather than a hardcoded 0..1', async () => {
    const el = await pane('min-ratio="0.3" max-ratio="0.6"');
    el.ratio = 0.9;
    await settle(el);
    expect(el.ratio, 'clamped to a literal 1 instead of maxRatio').to.equal(0.6);
  });

  it('re-clamps when the bounds move under it', async () => {
    const el = await pane('ratio="0.8"');
    el.maxRatio = 0.5;
    await settle(el);
    expect(el.ratio).to.equal(0.5);
  });
});

describe('arc-progress value is a percentage', () => {
  const bar = (attrs = '') => make(`<arc-progress ${attrs}></arc-progress>`);
  const now = (el) => el.shadowRoot.querySelector('[aria-valuenow]')?.getAttribute('aria-valuenow');

  it('clamps an over-range value on the property, not only in the render', async () => {
    // The render already clamped, and aria-valuenow used the clamped local — so
    // unlike arc-meter (#70) the two readings agreed. What was wrong was the
    // state: `el.value` read back 500 after being clamped everywhere it mattered.
    const el = await bar('value="500"');
    expect(el.value).to.equal(100);
    expect(now(el)).to.equal('100');
  });

  it('clamps a negative value', async () => {
    expect((await bar('value="-20"')).value).to.equal(0);
  });

  it('falls back rather than going NaN', async () => {
    const el = await bar('value="half"');
    expect(Number.isNaN(el.value), 'value went NaN').to.equal(false);
    expect(el.value).to.equal(0);
  });
});

describe('arc-waveform position is a fraction of the track', () => {
  const wave = (attrs = '') => make(`<arc-waveform ${attrs}></arc-waveform>`);

  it('clamps past the end of the track', async () => {
    expect((await wave('position="4"')).position).to.equal(1);
  });

  it('clamps before the start', async () => {
    expect((await wave('position="-1"')).position).to.equal(0);
  });

  it('keeps a real fraction intact', async () => {
    expect((await wave('position="0.25"')).position).to.equal(0.25);
  });
});

describe('arc-level-meter zone thresholds are fractions of the range', () => {
  const meter = (attrs = '') => make(`<arc-level-meter ${attrs}></arc-level-meter>`);

  it('clamps a warn threshold above the range', async () => {
    // Was: `Number.isFinite()` only, so warn=5 put the warning zone off-scale
    // and silently disabled it — the guard checked the wrong property of the
    // value, which is the same shape as clamping in the render.
    expect((await meter('warn="5"')).warn).to.equal(1);
  });

  it('clamps a negative clip threshold', async () => {
    expect((await meter('clip="-2"')).clip).to.equal(0);
  });

  it('still falls back for a non-numeric threshold', async () => {
    expect((await meter('warn="loud"')).warn).to.equal(0.75);
  });
});

// ---------------------------------------------------------------------------
// Documented unions that were plain strings
// ---------------------------------------------------------------------------

import '../src/input/input.register.js';
import '../src/input/textarea.register.js';
import '../src/navigation/drawer.register.js';
import '../src/content/icon.register.js';

/**
 * 32 props documented a closed union (`@prop {'sm' | 'md' | 'lg'} size`) and
 * were declared `{ type: String }` — no fallback anywhere.
 *
 * These *looked* fine, which is why they survived: `md` is the base style and
 * `sm`/`lg` are overrides, so `size="huge"` renders like `md` by accident. The
 * damage is on the state and the DOM — `el.size` reads 'huge', the bogus value
 * reflects onto the host, and the generated wrapper types promise a union the
 * component does not enforce. Finding #61's shape: the constraint was living in
 * the stylesheet.
 *
 * conformance.test.js now derives the per-prop assertions for all 32. What is
 * tested here is the part a declaration cannot know: that the fallback value is
 * the one the component then *renders* with.
 */
describe('documented unions now fall back', () => {
  it('arc-input size falls back to md and stops reflecting a bogus value', async () => {
    const el = await make('<arc-input size="huge"></arc-input>');
    expect(el.size).to.equal('md');
    expect(el.getAttribute('size'), 'a value outside the union reflected onto the host').to.equal(
      'md',
    );
  });

  it('arc-input type falls back to text', async () => {
    // Matches the platform: an <input> with an unknown type behaves as text.
    const el = await make('<arc-input type="quantum"></arc-input>');
    expect(el.type).to.equal('text');
    expect(el.shadowRoot.querySelector('input').getAttribute('type')).to.equal('text');
  });

  it('arc-input type does not start reflecting, since it never did', async () => {
    // oneOf() reflects by default; this prop did not. Silently adding reflection
    // would change the DOM and any CSS selecting on it, so the conversion
    // carried `reflect: false` over.
    // Set from script, on an element with no `type` attribute in its markup —
    // otherwise hasAttribute() is true because the author wrote it, which says
    // nothing about reflection. (First version of this test made that mistake.)
    const el = await make('<arc-input></arc-input>');
    el.type = 'email';
    await settle(el);
    expect(el.hasAttribute('type'), 'type started reflecting after the conversion').to.equal(false);
  });

  it('arc-textarea resize falls back to its documented default', async () => {
    const el = await make('<arc-textarea resize="diagonal"></arc-textarea>');
    expect(el.resize).to.equal('vertical');
  });

  it('arc-drawer position falls back to the first member', async () => {
    const el = await make('<arc-drawer position="ceiling"></arc-drawer>');
    expect(el.position).to.equal('left');
  });

  it('arc-icon size still accepts a pixel number', async () => {
    // Deliberately NOT converted: the JSDoc lists five names and the code also
    // accepts any positive number, so the documented set is narrower than the
    // accepted set. Normalising to the union would reject this.
    const el = await make('<arc-icon name="check" size="18"></arc-icon>');
    expect(el.size, 'the union conversion swept up a prop with an open set').to.equal('18');
  });
});
