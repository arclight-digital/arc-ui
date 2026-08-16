/**
 * arc-split-pane — the two-pane splitter.
 *
 * What this pins: the ratio drives both panes' sizes, dragging the divider
 * recomputes it against the container, minRatio/maxRatio clamp it, and the
 * gesture is torn down on release and on disconnect.
 *
 * Four tests were marked BUG (findings #33-#35), and the fix is the component
 * one file away: arc-resizable solves the same problem and got all four right —
 * a role="separator" handle with tabindex, aria-value* and a keydown handler,
 * driven by pointer events, emitting during the drag rather than on release.
 * The divider is built that way now. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record, drag, pointerInit, deepActive } from './helpers.js';

import '../src/layout/split-pane.register.js';

afterEach(() => cleanup());

async function pane(attrs = '') {
  const el = mount(`
    <arc-split-pane ${attrs} style="width: 400px; height: 200px; display: block">
      <div slot="primary">Left</div>
      <div slot="secondary">Right</div>
    </arc-split-pane>
  `);
  await settle(el);
  return el;
}

const handle = (el) => el.shadowRoot.querySelector('[part~="handle"]');
const primary = (el) => el.shadowRoot.querySelector('[part~="primary"]');
const base = (el) => el.shadowRoot.querySelector('[part~="base"]');

/**
 * Press the divider and move to a point, leaving the gesture open.
 *
 * Pointer events, and dispatched on the handle rather than on the window: the
 * component captures the pointer, which is what follows it outside the element
 * without a second teardown path to keep in step.
 */
async function dragTo(el, { clientX = 0, clientY = 0 } = {}) {
  const h = handle(el);
  h.setPointerCapture = () => {};
  h.releasePointerCapture = () => {};
  h.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, cancelable: true, clientX, clientY }));
  h.dispatchEvent(new PointerEvent('pointermove', { ...pointerInit, clientX, clientY }));
  await settle(el);
}

async function release(el) {
  handle(el).dispatchEvent(new PointerEvent('pointerup', pointerInit));
  await settle(el);
}

describe('arc-split-pane rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await pane();
    for (const part of ['base', 'primary', 'handle', 'secondary']) {
      expect(el.shadowRoot.querySelector(`[part~="${part}"]`), part).to.not.equal(null);
    }
  });

  it('projects both named slots', async () => {
    const el = await pane();
    const named = (name) =>
      el.shadowRoot.querySelector(`slot[name="${name}"]`).assignedElements();
    expect(named('primary')[0].textContent).to.equal('Left');
    expect(named('secondary')[0].textContent).to.equal('Right');
  });

  it('splits evenly by default', async () => {
    const el = await pane();
    expect(el.ratio).to.equal(0.5);
    expect(primary(el).style.width).to.equal('50%');
  });

  it('sizes the primary pane from the ratio', async () => {
    const el = await pane('ratio="0.25"');
    expect(primary(el).style.width).to.equal('25%');
  });

  it('sizes along the block axis when vertical', async () => {
    const el = await pane('orientation="vertical" ratio="0.3"');
    expect(primary(el).style.height).to.equal('30%');
    expect(primary(el).style.width).to.equal('');
  });
});

describe('arc-split-pane dragging', () => {
  it('recomputes the ratio from the pointer position', async () => {
    const el = await pane();
    const rect = base(el).getBoundingClientRect();

    await dragTo(el, { clientX: rect.left + rect.width * 0.75 });

    expect(el.ratio).to.be.closeTo(0.75, 0.02);
    await release(el);
  });

  it('clamps to minRatio and maxRatio', async () => {
    const el = await pane('min-ratio="0.3" max-ratio="0.7"');
    const rect = base(el).getBoundingClientRect();

    await dragTo(el, { clientX: rect.left - 500 });
    expect(el.ratio, 'held at the floor').to.be.closeTo(0.3, 0.001);
    await release(el);

    await dragTo(el, { clientX: rect.right + 500 });
    expect(el.ratio, 'held at the ceiling').to.be.closeTo(0.7, 0.001);
    await release(el);
  });

  it('uses the block axis when vertical', async () => {
    const el = await pane('orientation="vertical"');
    const rect = base(el).getBoundingClientRect();

    await dragTo(el, { clientY: rect.top + rect.height * 0.25 });

    expect(el.ratio).to.be.closeTo(0.25, 0.05);
    await release(el);
  });

  it('ignores pointer movement once released', async () => {
    const el = await pane();
    const rect = base(el).getBoundingClientRect();

    await dragTo(el, { clientX: rect.left + rect.width * 0.7 });
    await release(el);
    const settled = el.ratio;

    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + 10 }));
    await settle(el);

    expect(el.ratio, 'the listeners are gone').to.equal(settled);
  });

  it('stops listening when disconnected mid-drag', async () => {
    const el = await pane();
    const rect = base(el).getBoundingClientRect();

    handle(el).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    await settle(el);
    const before = el.ratio;

    el.remove();
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + 10 }));
    await settle(el);

    expect(el.ratio, 'a detached pane must not keep tracking').to.equal(before);
  });

  it('announces the ratio it moved to', async () => {
    const el = await pane();
    const rect = base(el).getBoundingClientRect();
    const details = [];
    el.addEventListener('arc-resize', (e) => details.push(e.detail));

    await dragTo(el, { clientX: rect.left + rect.width * 0.6 });
    await release(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].ratio).to.be.closeTo(0.6, 0.02);
    expect(details[0].value, 'detail.value is canonical').to.equal(details[0].ratio);
  });

  it('stays silent for a move that does not change the ratio', async () => {
    const el = await pane();
    const rect = base(el).getBoundingClientRect();

    await dragTo(el, { clientX: rect.left + rect.width * 0.6 });
    const seen = record(el, ['arc-resize']);

    // The same point again, and then a point past the ceiling, which clamps
    // back to where it already is.
    handle(el).dispatchEvent(
      new PointerEvent('pointermove', { ...pointerInit, clientX: rect.left + rect.width * 0.6 }),
    );
    await settle(el);
    await release(el);

    expect(seen).to.deep.equal([]);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await pane();
    const rect = base(el).getBoundingClientRect();
    let event = null;
    document.body.addEventListener('arc-resize', (e) => { event = e; }, { once: true });

    await dragTo(el, { clientX: rect.left + rect.width * 0.6 });
    await release(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });
});

describe('arc-split-pane accessibility and input', () => {
  // Was four BUG pins (findings #33-#35). The divider was a bare <div> with a
  // single @mousedown — no role, no tab stop, no aria-value*, no keydown
  // handler anywhere in the file — driven by mouse events that touch and pen
  // never produce, announcing only on release. arc-resizable solved every part
  // of this one file away, and the divider is built the same way now.
  it('is a separator, focusable, reporting its position', async () => {
    const el = await pane();
    const div = handle(el);

    expect(div.getAttribute('role')).to.equal('separator');
    expect(div.getAttribute('tabindex')).to.equal('0');
    expect(div.getAttribute('aria-valuenow')).to.equal('50');
    expect(div.getAttribute('aria-valuemin')).to.equal('15');
    expect(div.getAttribute('aria-valuemax')).to.equal('85');
    expect(div.getAttribute('aria-label')).to.equal('Resize panes');
  });

  it('takes an accessible name of its own', async () => {
    const el = await pane('label="Split editor and preview"');
    expect(handle(el).getAttribute('aria-label')).to.equal('Split editor and preview');
  });

  it('reports the separator axis, not the split axis', async () => {
    // Side-by-side panes are divided by a *vertical* separator, and ARIA's
    // aria-orientation describes the separator itself — it is what tells
    // assistive tech which arrows move it.
    const el = await pane('orientation="horizontal"');
    expect(handle(el).getAttribute('aria-orientation')).to.equal('vertical');

    const stacked = await pane('orientation="vertical"');
    expect(handle(stacked).getAttribute('aria-orientation')).to.equal('horizontal');
  });

  it('tracks aria-valuenow as the divider moves', async () => {
    const el = await pane();
    keyOn(handle(el), 'ArrowRight');
    await settle(el);
    expect(handle(el).getAttribute('aria-valuenow')).to.equal('55');
  });

  it('is reachable by keyboard', async () => {
    const el = await pane();
    handle(el).focus();
    expect(deepActive()).to.equal(handle(el));
  });

  it('moves with the inline arrows when horizontal', async () => {
    const el = await pane();
    const seen = record(el, ['arc-resize']);

    keyOn(handle(el), 'ArrowRight');
    await settle(el);
    expect(el.ratio).to.be.closeTo(0.55, 0.001);

    keyOn(handle(el), 'ArrowLeft');
    await settle(el);
    expect(el.ratio).to.be.closeTo(0.5, 0.001);

    expect(seen.map(([kind]) => kind), 'each step is announced').to.deep.equal(['resize', 'resize']);
  });

  it('moves with the block arrows when vertical', async () => {
    const el = await pane('orientation="vertical"');

    keyOn(handle(el), 'ArrowDown');
    await settle(el);
    expect(el.ratio).to.be.closeTo(0.55, 0.001);

    keyOn(handle(el), 'ArrowRight');
    await settle(el);
    expect(el.ratio, 'the inline arrows are inert in vertical mode').to.be.closeTo(0.55, 0.001);
  });

  it('takes a larger step with Shift', async () => {
    const el = await pane();
    keyOn(handle(el), 'ArrowRight', { shiftKey: true });
    await settle(el);
    expect(el.ratio).to.be.closeTo(0.7, 0.001);
  });

  it('Home and End go to the bounds, not to 0 and 1', async () => {
    const el = await pane('min-ratio="0.3" max-ratio="0.7"');

    keyOn(handle(el), 'End');
    await settle(el);
    expect(el.ratio).to.be.closeTo(0.7, 0.001);

    keyOn(handle(el), 'Home');
    await settle(el);
    expect(el.ratio).to.be.closeTo(0.3, 0.001);
  });

  it('clamps at the bounds and stays silent there', async () => {
    const el = await pane('min-ratio="0.3" max-ratio="0.7"');
    keyOn(handle(el), 'End');
    await settle(el);

    const seen = record(el, ['arc-resize']);
    keyOn(handle(el), 'ArrowRight');
    await settle(el);

    expect(el.ratio).to.be.closeTo(0.7, 0.001);
    expect(seen, 'a step that cannot move announces nothing').to.deep.equal([]);
  });

  it('claims the keys it handles even at a bound', async () => {
    // Or the page scrolls under a separator that correctly refused to move.
    const el = await pane('min-ratio="0.3" max-ratio="0.7"');
    keyOn(handle(el), 'End');
    await settle(el);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    handle(el).dispatchEvent(event);
    await settle(el);
    expect(event.defaultPrevented).to.equal(true);
  });

  it('leaves keys it does not handle for the page', async () => {
    const el = await pane();
    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    handle(el).dispatchEvent(event);
    await settle(el);
    expect(event.defaultPrevented).to.equal(false);
  });

  it('is draggable by touch', async () => {
    // The whole of finding #34: the drag was on mousedown/mousemove/mouseup,
    // which touch and pen never produce, so the splitter could not be moved on
    // a tablet at all.
    const el = await pane();
    const rect = base(el).getBoundingClientRect();
    const h = handle(el);
    h.setPointerCapture = () => {};
    h.releasePointerCapture = () => {};

    const touch = { ...pointerInit, pointerType: 'touch' };
    h.dispatchEvent(new PointerEvent('pointerdown', { ...touch, cancelable: true, clientX: rect.left }));
    h.dispatchEvent(new PointerEvent('pointermove', { ...touch, clientX: rect.left + rect.width * 0.8 }));
    h.dispatchEvent(new PointerEvent('pointerup', touch));
    await settle(el);

    expect(el.ratio).to.be.closeTo(0.8, 0.02);
  });

  it('announces during the drag, not only on release', async () => {
    // Finding #35: the docs said "fired during divider drag" and the dispatch
    // sat in the mouseup handler, so `ratio` changed throughout with no event —
    // a consumer syncing a layout live got nothing until the user let go.
    const el = await pane();
    const rect = base(el).getBoundingClientRect();
    const h = handle(el);
    h.setPointerCapture = () => {};
    h.releasePointerCapture = () => {};

    const seen = record(el, ['arc-resize']);
    h.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, cancelable: true, clientX: rect.left }));
    for (const fraction of [0.6, 0.7, 0.8]) {
      h.dispatchEvent(
        new PointerEvent('pointermove', { ...pointerInit, clientX: rect.left + rect.width * fraction }),
      );
      await settle(el);
    }

    expect(el.ratio, 'the ratio moved three times').to.be.closeTo(0.8, 0.02);
    expect(seen, 'and announced each of them').to.have.lengthOf(3);

    await release(el);
    expect(seen, 'the release itself is not a fourth change').to.have.lengthOf(3);
  });
});

describe('arc-split-pane enum fallback', () => {
  // BUG: both the render (split-pane.js:155) and the drag maths
  // (split-pane.js:117) branch on `orientation === 'horizontal'`, so the
  // documented default is selected by exact match and *every* unrecognised
  // value falls through to the vertical branch. `orientation="diagonal"` lays
  // out and drags as a vertical split, which is neither the default nor the
  // value asked for. This is the failure mode scripts/checks/enum-fallbacks.js
  // exists for, in its ternary rather than its CSS-selector form.
  // Was pinned as a BUG. Fixed by declaring `orientation` as oneOf() — #37.
  it('normalises an unrecognised orientation to the default', async () => {
    const unknown = await pane('orientation="diagonal" ratio="0.3"');

    expect(unknown.orientation, 'normalised to the default').to.equal('horizontal');
    expect(primary(unknown).style.width, 'sized along the inline axis').to.equal('30%');
  });

  it('the documented default is the inline axis', async () => {
    const el = await pane('ratio="0.3"');
    expect(el.orientation).to.equal('horizontal');
    expect(primary(el).style.width).to.equal('30%');
  });
});
