/**
 * arc-resizable — the single-edge resizable panel.
 *
 * This is the component arc-split-pane should have been read against: the
 * handle is a real role="separator" with a tab stop, full aria-value* state and
 * an arrow-key handler, the drag runs on pointer events so touch works, and
 * arc-resize fires throughout rather than only on release.
 *
 * What this pins: `size` drives the --panel-size custom property, the drag and
 * the keyboard both clamp to minSize/maxSize, arc-resize fires only when the
 * size actually changed, and `direction` picks the axis for both input paths.
 *
 * One test is marked BUG — the aria-valuemax binding falls back to `undefined`
 * rather than `nothing`, which renders it empty. That one is already enforced
 * by scripts/checks/empty-attributes.js. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record, pointerInit } from './helpers.js';

import '../src/layout/resizable.register.js';

afterEach(() => cleanup());

async function panel(attrs = '') {
  const el = mount(`<arc-resizable ${attrs}>content</arc-resizable>`);
  await settle(el);
  return el;
}

const handle = (el) => el.shadowRoot.querySelector('[part="handle"]');
const panelSize = (el) => el.style.getPropertyValue('--panel-size');

/** A full pointer drag on the handle, which captures the pointer itself. */
async function drag(el, { dx = 0, dy = 0 } = {}) {
  const h = handle(el);
  h.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, clientX: 500, clientY: 300 }));
  h.dispatchEvent(
    new PointerEvent('pointermove', { ...pointerInit, clientX: 500 + dx, clientY: 300 + dy }),
  );
  h.dispatchEvent(new PointerEvent('pointerup', pointerInit));
  await settle(el);
}

describe('arc-resizable rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await panel();
    for (const part of ['container', 'handle']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('publishes the size as --panel-size', async () => {
    const el = await panel();
    expect(el.size).to.equal(300);
    expect(panelSize(el)).to.equal('300px');
  });

  it('tracks a programmatic size onto the custom property', async () => {
    const el = await panel();
    el.size = 420;
    await settle(el);
    expect(panelSize(el)).to.equal('420px');
  });

  it('honours a size set in markup', async () => {
    const el = await panel('size="180"');
    expect(panelSize(el)).to.equal('180px');
  });
});

describe('arc-resizable accessibility', () => {
  it('is a focusable separator carrying its range', async () => {
    const el = await panel('size="250" min-size="100" max-size="500"');
    const h = handle(el);

    expect(h.getAttribute('role')).to.equal('separator');
    expect(h.getAttribute('tabindex'), 'keyboard reachable').to.equal('0');
    expect(h.getAttribute('aria-orientation')).to.equal('horizontal');
    expect(h.getAttribute('aria-valuenow')).to.equal('250');
    expect(h.getAttribute('aria-valuemin')).to.equal('100');
    expect(h.getAttribute('aria-valuemax')).to.equal('500');
    expect(h.getAttribute('aria-label')).to.equal('Resize handle');
  });

  it('tracks aria-valuenow as the size moves', async () => {
    const el = await panel('size="250"');
    keyOn(handle(el), 'ArrowRight');
    await settle(el);
    expect(handle(el).getAttribute('aria-valuenow')).to.equal('255');
  });

  it('reports the axis it resizes', async () => {
    const el = await panel('direction="vertical"');
    expect(handle(el).getAttribute('aria-orientation')).to.equal('vertical');
  });

  // Was a BUG pin (finding #36). `maxSize` defaults to Infinity, so the
  // *common* case took the falsy branch — and only `nothing` removes an
  // attribute in Lit, so an unbounded handle shipped `aria-valuemax=""`.
  it('omits aria-valuemax on an unbounded panel', async () => {
    const el = await panel();
    expect(el.maxSize).to.equal(Infinity);
    expect(handle(el).hasAttribute('aria-valuemax')).to.equal(false);
  });

  it('still reports a bound when there is one', async () => {
    // Anti-vacuity: dropping the binding would pass the test above.
    const el = await panel('max-size="400"');
    expect(handle(el).getAttribute('aria-valuemax')).to.equal('400');
  });
});

describe('arc-resizable keyboard', () => {
  it('steps by 5, and by 20 with Shift', async () => {
    const el = await panel('size="200"');

    keyOn(handle(el), 'ArrowRight');
    await settle(el);
    expect(el.size).to.equal(205);

    keyOn(handle(el), 'ArrowRight', { shiftKey: true });
    await settle(el);
    expect(el.size).to.equal(225);

    keyOn(handle(el), 'ArrowLeft');
    await settle(el);
    expect(el.size).to.equal(220);
  });

  it('uses the block-axis keys when vertical, and ignores the inline ones', async () => {
    const el = await panel('direction="vertical" size="200"');

    keyOn(handle(el), 'ArrowDown');
    await settle(el);
    expect(el.size).to.equal(205);

    keyOn(handle(el), 'ArrowUp');
    await settle(el);
    expect(el.size).to.equal(200);

    keyOn(handle(el), 'ArrowRight');
    await settle(el);
    expect(el.size, 'the inline arrows are inert in vertical mode').to.equal(200);
  });

  it('clamps to minSize and maxSize', async () => {
    const el = await panel('size="105" min-size="100" max-size="115"');

    keyOn(handle(el), 'ArrowLeft');
    await settle(el);
    expect(el.size, 'held at the floor').to.equal(100);

    for (let i = 0; i < 6; i++) {
      keyOn(handle(el), 'ArrowRight');
      await settle(el);
    }
    expect(el.size, 'held at the ceiling').to.equal(115);
  });

  it('announces each change once, and stays silent at the rails', async () => {
    const el = await panel('size="100" min-size="100"');
    const seen = record(el, ['arc-resize']);

    keyOn(handle(el), 'ArrowLeft');
    await settle(el);
    expect(seen, 'an unchanged size announces nothing').to.deep.equal([]);

    keyOn(handle(el), 'ArrowRight');
    await settle(el);
    expect(seen).to.have.lengthOf(1);
  });

  it('reports the new size on the event', async () => {
    const el = await panel('size="200"');
    const details = [];
    el.addEventListener('arc-resize', (e) => details.push(e.detail));

    keyOn(handle(el), 'ArrowRight');
    await settle(el);

    expect(details).to.deep.equal([{ size: 205 }]);
  });

  it('claims the keys it handles and leaves the rest', async () => {
    const el = await panel('size="200"');

    const handled = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    handle(el).dispatchEvent(handled);
    await settle(el);
    expect(handled.defaultPrevented).to.equal(true);

    const before = el.size;
    const ignored = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
    handle(el).dispatchEvent(ignored);
    await settle(el);
    expect(ignored.defaultPrevented, 'the block arrows are not this axis').to.equal(false);
    expect(el.size).to.equal(before);
  });
});

describe('arc-resizable pointer drag', () => {
  it('resizes by the pointer delta', async () => {
    const el = await panel('size="200"');
    await drag(el, { dx: 60 });
    expect(el.size).to.equal(260);
  });

  it('shrinks on a backward drag', async () => {
    const el = await panel('size="200"');
    await drag(el, { dx: -50 });
    expect(el.size).to.equal(150);
  });

  it('follows the block axis when vertical', async () => {
    const el = await panel('direction="vertical" size="200"');
    await drag(el, { dy: 40 });
    expect(el.size).to.equal(240);
  });

  it('clamps at both rails', async () => {
    const el = await panel('size="200" min-size="150" max-size="250"');

    await drag(el, { dx: -500 });
    expect(el.size).to.equal(150);

    await drag(el, { dx: 500 });
    expect(el.size).to.equal(250);
  });

  it('announces while dragging, not only on release', async () => {
    const el = await panel('size="200"');
    const seen = record(el, ['arc-resize']);
    const h = handle(el);

    h.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, clientX: 500, clientY: 300 }));
    for (const dx of [10, 20, 30]) {
      h.dispatchEvent(new PointerEvent('pointermove', { ...pointerInit, clientX: 500 + dx, clientY: 300 }));
      await settle(el);
    }

    expect(seen, 'one per move, before any release').to.have.lengthOf(3);
    h.dispatchEvent(new PointerEvent('pointerup', pointerInit));
    await settle(el);
  });

  it('stops tracking after release', async () => {
    const el = await panel('size="200"');
    await drag(el, { dx: 30 });
    const settled = el.size;

    handle(el).dispatchEvent(
      new PointerEvent('pointermove', { ...pointerInit, clientX: 900, clientY: 300 }),
    );
    await settle(el);

    expect(el.size, 'the move listeners are gone').to.equal(settled);
  });

  it('keeps the custom property in step with the drag', async () => {
    const el = await panel('size="200"');
    await drag(el, { dx: 40 });
    expect(panelSize(el)).to.equal('240px');
  });
});

describe('arc-resizable enum fallback', () => {
  // BUG: every axis decision is `direction === 'horizontal' ? … : …` — the
  // keyboard handler (resizable.js:178), the drag start (resizable.js:137) and
  // the move maths (resizable.js:141). The documented default is selected by
  // exact match, so an unrecognised value falls through to the *vertical*
  // branch rather than to the default. arc-split-pane has the identical bug in
  // the same directory; see test-findings.md.
  // Was pinned as a BUG. Fixed by declaring `direction` as oneOf(), which
  // normalises an unrecognised value to the documented default before any
  // ternary reads it — finding #37.
  it('normalises an unrecognised direction to the default', async () => {
    const el = await panel('direction="diagonal" size="200"');

    expect(el.direction, 'normalised to the default').to.equal('horizontal');

    keyOn(handle(el), 'ArrowRight');
    await settle(el);
    expect(el.size, 'and the inline arrows now drive it').to.equal(205);
  });

  it('the documented default is the inline axis', async () => {
    const el = await panel('size="200"');
    expect(el.direction).to.equal('horizontal');
    keyOn(handle(el), 'ArrowRight');
    await settle(el);
    expect(el.size).to.equal(205);
  });
});
