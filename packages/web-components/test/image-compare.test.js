/**
 * arc-image-compare: slot layering, position clamping, the drag gesture's
 * edit/commit contract — arc-input per move, arc-change once on release; a
 * keyboard nudge is both at once — and the orientation switch that turns the
 * drag axis from X to Y.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/content/image-compare.register.js';

afterEach(() => cleanup());

/**
 * Mount a compare with sized div stand-ins for the two images — network images
 * never load in the test runner, and the geometry only needs a real box.
 */
async function mountCompare(attrs = '') {
  const el = mount(`
    <arc-image-compare ${attrs}>
      <div slot="before" style="height:200px;background:#333"></div>
      <div slot="after" style="height:200px;background:#666"></div>
    </arc-image-compare>
  `);
  await el.updateComplete;
  return el;
}

/** Record both contract events in fire order. */
function record(el) {
  const seen = [];
  el.addEventListener('arc-input', (e) => seen.push(['input', e.detail.value]));
  el.addEventListener('arc-change', (e) => seen.push(['change', e.detail.value]));
  return seen;
}

const only = (seen, kind) => seen.filter(([k]) => k === kind);

/**
 * One pointer drag across the frame: down at, moves through, up.
 * Fractions 0..1 along the drag axis (X by default, Y when `vertical`).
 */
function drag(el, downAt, moves, { vertical = false } = {}) {
  const frame = el.shadowRoot.querySelector('.compare');
  const box = frame.getBoundingClientRect();
  const at = (fraction) => vertical
    ? { clientX: box.left + 10, clientY: box.top + box.height * fraction }
    : { clientX: box.left + box.width * fraction, clientY: box.top + 10 };
  // setPointerCapture rejects an id it has never seen, so the whole gesture
  // carries one real pointerId.
  const pointer = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse' };
  frame.dispatchEvent(new PointerEvent('pointerdown', { ...pointer, ...at(downAt) }));
  for (const fraction of moves) {
    window.dispatchEvent(new PointerEvent('pointermove', { ...pointer, ...at(fraction) }));
  }
  window.dispatchEvent(new PointerEvent('pointerup', pointer));
}

function press(el, key, init = {}) {
  el.shadowRoot.querySelector('.compare__handle').dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  );
}

describe('arc-image-compare rendering', () => {
  it('renders both named slots with their assigned content', async () => {
    const el = await mountCompare();
    const before = el.shadowRoot.querySelector('slot[name="before"]');
    const after = el.shadowRoot.querySelector('slot[name="after"]');
    expect(before.assignedElements()).to.have.lengthOf(1);
    expect(after.assignedElements()).to.have.lengthOf(1);
  });

  it('drives the reveal from the position via the private custom property', async () => {
    const el = await mountCompare('position="25"');
    const frame = el.shadowRoot.querySelector('.compare');
    expect(frame.getAttribute('style')).to.contain('--_pos: 25');
  });

  it('label chips render only when their prop is set', async () => {
    const el = await mountCompare('before-label="Original" after-label="Edited"');
    expect(el.shadowRoot.querySelector('[part="label-before"]').textContent.trim()).to.equal('Original');
    expect(el.shadowRoot.querySelector('[part="label-after"]').textContent.trim()).to.equal('Edited');

    const bare = await mountCompare();
    expect(bare.shadowRoot.querySelector('.compare__chip')).to.not.exist;
  });
});

describe('arc-image-compare position clamping', () => {
  it('clamps to 0-100 and reflects the clamped value', async () => {
    const el = await mountCompare();
    expect(el.position).to.equal(50);

    el.position = 150;
    await el.updateComplete;
    expect(el.position).to.equal(100);
    expect(el.getAttribute('position')).to.equal('100');

    el.position = -20;
    await el.updateComplete;
    expect(el.position).to.equal(0);
  });

  it('a non-numeric attribute falls back to the centered default', async () => {
    const el = await mountCompare('position="sideways"');
    expect(el.position).to.equal(50);
  });
});

describe('arc-image-compare dragging', () => {
  it('emits arc-input per move and commits once on release', async () => {
    const el = await mountCompare();
    const seen = record(el);

    drag(el, 0.25, [0.4, 0.6, 0.75]);
    await tick();

    expect(only(seen, 'input').length, 'one per down and move').to.equal(4);
    expect(only(seen, 'change').length, 'exactly one commit').to.equal(1);
    expect(only(seen, 'change')[0][1], 'commits the release position').to.be.closeTo(75, 2);
    expect(el.position).to.be.closeTo(75, 2);
  });

  it('arc-input carries the live position while dragging', async () => {
    const el = await mountCompare();
    const seen = record(el);

    drag(el, 0.2, [0.8]);
    await tick();

    const inputs = only(seen, 'input');
    expect(inputs[0][1], 'grab point').to.be.closeTo(20, 2);
    expect(inputs[inputs.length - 1][1], 'last move').to.be.closeTo(80, 2);
  });

  it('a drag past the edge clamps instead of overshooting', async () => {
    const el = await mountCompare();
    drag(el, 0.5, [1.4]);
    await tick();
    expect(el.position).to.equal(100);
  });
});

describe('arc-image-compare keyboard', () => {
  it('arrows step by 1, each press an edit and a commit at once', async () => {
    const el = await mountCompare();
    const seen = record(el);

    press(el, 'ArrowRight');
    await tick();
    expect(el.position).to.equal(51);
    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);

    press(el, 'ArrowLeft');
    await tick();
    expect(el.position).to.equal(50);
  });

  it('Shift multiplies the step to 10', async () => {
    const el = await mountCompare();

    press(el, 'ArrowRight', { shiftKey: true });
    await tick();
    expect(el.position).to.equal(60);

    press(el, 'ArrowLeft', { shiftKey: true });
    await tick();
    expect(el.position).to.equal(50);
  });

  it('Home and End jump to the extremes', async () => {
    const el = await mountCompare();

    press(el, 'End');
    await tick();
    expect(el.position).to.equal(100);

    press(el, 'Home');
    await tick();
    expect(el.position).to.equal(0);
  });

  it('a press at the boundary emits nothing', async () => {
    const el = await mountCompare('position="100"');
    const seen = record(el);

    press(el, 'ArrowRight');
    await tick();

    expect(seen.length).to.equal(0);
    expect(el.position).to.equal(100);
  });
});

describe('arc-image-compare accessibility', () => {
  it('the handle is a focusable slider with full aria values', async () => {
    const el = await mountCompare('label="Photo comparison" position="30"');
    const handle = el.shadowRoot.querySelector('.compare__handle');
    expect(handle.getAttribute('role')).to.equal('slider');
    expect(handle.getAttribute('tabindex')).to.equal('0');
    expect(handle.getAttribute('aria-label')).to.equal('Photo comparison');
    expect(handle.getAttribute('aria-valuemin')).to.equal('0');
    expect(handle.getAttribute('aria-valuemax')).to.equal('100');
    expect(handle.getAttribute('aria-valuenow')).to.equal('30');
    expect(handle.getAttribute('aria-orientation')).to.equal('horizontal');
  });
});

describe('arc-image-compare orientation', () => {
  it('vertical switches the drag axis to Y', async () => {
    const el = await mountCompare('orientation="vertical"');
    drag(el, 0.25, [0.7], { vertical: true });
    await tick();
    expect(el.position).to.be.closeTo(70, 2);
  });

  it('vertical announces itself and flips the arrow keys to the block axis', async () => {
    const el = await mountCompare('orientation="vertical"');
    const handle = el.shadowRoot.querySelector('.compare__handle');
    expect(handle.getAttribute('aria-orientation')).to.equal('vertical');

    press(el, 'ArrowDown');
    await tick();
    expect(el.position).to.equal(51);

    press(el, 'ArrowUp');
    await tick();
    expect(el.position).to.equal(50);
  });

  it('vertical drags ignore the X coordinate', async () => {
    const el = await mountCompare('orientation="vertical"');
    const frame = el.shadowRoot.querySelector('.compare');
    const box = frame.getBoundingClientRect();
    const pointer = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse' };

    // Pointer at 90% of the width but 30% of the height: only Y may count.
    frame.dispatchEvent(new PointerEvent('pointerdown', {
      ...pointer,
      clientX: box.left + box.width * 0.9,
      clientY: box.top + box.height * 0.3,
    }));
    window.dispatchEvent(new PointerEvent('pointerup', pointer));
    await tick();

    expect(el.position).to.be.closeTo(30, 2);
  });
});
