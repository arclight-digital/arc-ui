/**
 * arc-split-pane — the two-pane splitter.
 *
 * What this pins: the ratio drives both panes' sizes, dragging the divider
 * recomputes it against the container, minRatio/maxRatio clamp it, and the
 * window listeners are torn down on release and on disconnect.
 *
 * Four tests are marked BUG, and they are best read against arc-resizable,
 * which solves the same problem in the same directory and gets all four right:
 * a role="separator" handle with tabindex, aria-value* and a keydown handler,
 * driven by pointer events, emitting during the drag. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

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

const handle = (el) => el.shadowRoot.querySelector('[part="handle"]');
const primary = (el) => el.shadowRoot.querySelector('[part="primary"]');
const base = (el) => el.shadowRoot.querySelector('[part="base"]');

/** Drag the divider with mouse events — the only kind this component listens for. */
async function dragTo(el, { clientX = 0, clientY = 0 } = {}) {
  handle(el).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX, clientY }));
  await settle(el);
}

async function release(el) {
  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  await settle(el);
}

describe('arc-split-pane rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await pane();
    for (const part of ['base', 'primary', 'handle', 'secondary']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
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

  it('announces the final ratio on release', async () => {
    const el = await pane();
    const rect = base(el).getBoundingClientRect();
    const details = [];
    el.addEventListener('arc-resize', (e) => details.push(e.detail));

    await dragTo(el, { clientX: rect.left + rect.width * 0.6 });
    await release(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].ratio).to.be.closeTo(0.6, 0.02);
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
  // BUG: the divider is a bare <div> with a single @mousedown
  // (split-pane.js:164-168) — no role, no tabindex, no aria-value*, no keydown
  // handler. It cannot be operated by keyboard at all and is invisible to
  // assistive tech. arc-resizable's handle, solving the identical problem in
  // the same directory, is role="separator" tabindex="0" with aria-orientation,
  // aria-valuenow/min/max and an arrow-key handler (resizable.js:213-222).
  it('BUG: the divider has no separator role and is not focusable', async () => {
    const el = await pane();
    const div = handle(el);

    expect(div.tagName).to.equal('DIV');
    expect(div.hasAttribute('role'), 'no role="separator"').to.equal(false);
    expect(div.hasAttribute('tabindex'), 'not in the tab order').to.equal(false);
    expect(div.hasAttribute('aria-valuenow'), 'no value reported').to.equal(false);
    expect(div.hasAttribute('aria-orientation')).to.equal(false);
  });

  it('BUG: the divider cannot be moved by keyboard', async () => {
    const el = await pane();
    const before = el.ratio;
    const seen = record(el, ['arc-resize']);

    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End']) {
      keyOn(handle(el), key);
    }
    await settle(el);

    expect(el.ratio, 'no key moves it').to.equal(before);
    expect(seen).to.deep.equal([]);
  });

  // BUG: the drag is wired to mousedown/mousemove/mouseup (split-pane.js:99-131).
  // Touch and pen never produce those, so the splitter is undraggable on a
  // touch device. Every other draggable control in the library — arc-knob,
  // arc-waveform, arc-image-compare, arc-signature-pad and arc-resizable — uses
  // pointer events.
  it('BUG: a pointer (touch) drag does nothing', async () => {
    const el = await pane();
    const rect = base(el).getBoundingClientRect();
    const before = el.ratio;
    const pointer = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'touch' };

    handle(el).dispatchEvent(new PointerEvent('pointerdown', { ...pointer, clientX: rect.left }));
    window.dispatchEvent(
      new PointerEvent('pointermove', { ...pointer, clientX: rect.left + rect.width * 0.8 }),
    );
    window.dispatchEvent(new PointerEvent('pointerup', pointer));
    await settle(el);

    expect(el.ratio, 'touch cannot move the divider').to.equal(before);
  });

  // BUG: split-pane.js:12 documents arc-resize as "Fired during divider drag".
  // It is dispatched only from _onMouseUp (split-pane.js:134), so `ratio`
  // changes throughout the drag with no event at all — a consumer syncing a
  // layout live gets nothing until release.
  it('BUG: arc-resize is documented as firing during the drag but fires only on release', async () => {
    const el = await pane();
    const rect = base(el).getBoundingClientRect();
    const seen = record(el, ['arc-resize']);

    handle(el).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    for (const fraction of [0.6, 0.7, 0.8]) {
      window.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + rect.width * fraction }),
      );
      await settle(el);
    }

    expect(el.ratio, 'the ratio moved three times').to.be.closeTo(0.8, 0.02);
    expect(seen, 'and announced none of them').to.deep.equal([]);

    await release(el);
    expect(seen, 'only the release is announced').to.have.lengthOf(1);
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
