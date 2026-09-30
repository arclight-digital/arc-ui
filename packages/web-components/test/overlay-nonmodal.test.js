/**
 * Non-modal arc-sheet and arc-drawer (test-findings #112).
 *
 * Reported by an application whose phone layout needs a peek strip the reader
 * can scroll past. Its workaround was a hand-built strip bolted onto a modal
 * sheet. Decided with the maintainer: the sheet and the drawer get the same
 * `modal` option in the same release, and a non-modal one leaves focus where
 * it was on open.
 *
 * Booleans rather than elements in every equality: a failing `to.equal(node)`
 * hangs the run while chai prints the node (see test-findings, #119–#124).
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until } from './helpers.js';

import '../src/feedback/sheet.register.js';
import '../src/navigation/drawer.register.js';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

const SUBJECTS = [
  { tag: 'arc-sheet', label: 'Sheet' },
  { tag: 'arc-drawer', label: 'Drawer' },
];

const panel = (el) => el.shadowRoot.querySelector('[part~="panel"]');

/** A page with an input to be reading from, and the overlay after it. */
async function page(tag, attrs = 'no-modal') {
  const wrap =
    mount(`<div><input id="reading" aria-label="Reading"><button id="behind">Behind</button>
    <${tag} heading="Panel" ${attrs}><button id="inside">Inside</button></${tag}></div>`);
  const el = wrap.querySelector(tag);
  await settle(el);
  return {
    el,
    reading: wrap.querySelector('#reading'),
    behind: wrap.querySelector('#behind'),
    inside: wrap.querySelector('#inside'),
  };
}

async function open(el) {
  el.open = true;
  await settle(el);
}

function escapeOn(target) {
  const e = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(e);
  return e;
}

for (const { tag } of SUBJECTS) {
  describe(`${tag} non-modal`, () => {
    it('stays modal by default', async () => {
      const { el } = await page(tag, '');
      await open(el);
      expect(panel(el).localName).to.equal('dialog');
      expect(panel(el).matches(':modal')).to.equal(true);
      expect(document.body.style.overflow).to.equal('hidden');
    });

    it('opens in the top layer as a popover, not a modal dialog', async () => {
      const { el } = await page(tag);
      expect(el.modal).to.equal(false);
      await open(el);
      expect(panel(el).localName).to.equal('div');
      expect(panel(el).getAttribute('role')).to.equal('dialog');
      expect(panel(el).matches(':popover-open')).to.equal(true);
    });

    it('leaves the page usable: no inert, no scroll lock, no backdrop', async () => {
      const { el, behind } = await page(tag);
      await open(el);
      expect(document.body.style.overflow, 'no scroll lock').to.equal('');
      expect(getComputedStyle(panel(el), '::backdrop').display, 'no backdrop').to.equal('none');
      const box = behind.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + 2, box.top + 2);
      // The drawer may cover the button's corner on the left edge; the sheet
      // covers the bottom. Either way the page is reachable where it is visible.
      expect(
        hit === behind || panel(el).contains(hit) || hit === el,
        'the page takes the click',
      ).to.equal(true);
      let clicked = false;
      behind.addEventListener('click', () => {
        clicked = true;
      });
      behind.click();
      expect(clicked).to.equal(true);
    });

    it('leaves focus where it was when it opens', async () => {
      const { el, reading } = await page(tag);
      reading.focus();
      let blurred = 0;
      reading.addEventListener('blur', () => blurred++);
      await open(el);
      expect(document.activeElement === reading, 'focus stays on the page').to.equal(true);
      expect(blurred, 'and never left').to.equal(0);
    });

    it('closes on Escape from inside, and ignores Escape on the page', async () => {
      const { el, reading, inside } = await page(tag);
      await open(el);
      reading.focus();
      expect(escapeOn(reading).defaultPrevented).to.equal(false);
      await settle(el);
      expect(el.open, 'a key press on the page is the page’s').to.equal(true);
      inside.focus();
      escapeOn(inside);
      await settle(el);
      expect(el.open).to.equal(false);
    });

    it('can veto an Escape close through arc-close', async () => {
      const { el, inside } = await page(tag);
      el.addEventListener('arc-close', (e) => e.preventDefault());
      await open(el);
      inside.focus();
      escapeOn(inside);
      await settle(el);
      expect(el.open).to.equal(true);
    });

    it('returns focus to where it was when it closes with focus inside', async () => {
      const { el, reading, inside } = await page(tag);
      reading.focus();
      await open(el);
      inside.focus();
      el.open = false;
      await settle(el);
      expect(document.activeElement === reading).to.equal(true);
    });

    it('returns focus when it closes from its own close button', async () => {
      // The close button's inner <button> is inside arc-icon-button's shadow
      // root, which `contains()` cannot see into (found by the mutation gate).
      const { el, reading } = await page(tag);
      reading.focus();
      await open(el);
      const close = el.shadowRoot.querySelector('[part~="close"]');
      await close.updateComplete;
      close.shadowRoot.querySelector('button').focus();
      el.open = false;
      await settle(el);
      expect(document.activeElement === reading).to.equal(true);
    });

    it('ignores an Escape something inside already handled, and other keys', async () => {
      const { el, inside } = await page(tag);
      await open(el);
      inside.focus();
      inside.addEventListener('keydown', (e) => e.preventDefault(), { once: true });
      escapeOn(inside);
      inside.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
      await settle(el);
      expect(el.open).to.equal(true);
    });

    it('leaves focus alone when it closes with focus outside', async () => {
      const { el, reading, behind } = await page(tag);
      reading.focus();
      await open(el);
      behind.focus();
      el.open = false;
      await settle(el);
      expect(document.activeElement === behind).to.equal(true);
    });

    it('closes from its close button', async () => {
      const { el } = await page(tag);
      await open(el);
      el.shadowRoot.querySelector('[part~="close"]').click();
      await settle(el);
      expect(el.open).to.equal(false);
      expect(panel(el).matches(':popover-open')).to.equal(false);
    });

    it('switches modality while open, and the scroll lock follows', async () => {
      const { el } = await page(tag, '');
      await open(el);
      expect(document.body.style.overflow).to.equal('hidden');
      el.modal = false;
      await settle(el);
      expect(panel(el).matches(':popover-open'), 'still open').to.equal(true);
      expect(document.body.style.overflow, 'lock released').to.equal('');
      el.modal = true;
      await settle(el);
      expect(panel(el).matches(':modal')).to.equal(true);
      expect(document.body.style.overflow).to.equal('hidden');
    });
  });
}

describe('arc-sheet snap points', () => {
  async function sheet(attrs = 'snap-points="100px, 300px"') {
    const el = mount(`<arc-sheet open heading="S" ${attrs}>Body</arc-sheet>`);
    await settle(el);
    await until(() => panel(el).getBoundingClientRect().height > 0);
    return el;
  }
  const handle = (el) => el.shadowRoot.querySelector('[part~="handle"]');
  const height = (el) => Math.round(panel(el).getBoundingClientRect().height);
  /** Wait out the height transition. */
  const settledAt = (el, px) => until(() => Math.abs(height(el) - px) <= 1, { timeout: 3000 });
  const changes = (el) => {
    const seen = [];
    el.addEventListener('arc-change', (e) => seen.push(e.detail.value));
    return seen;
  };
  const pointer = (box, y) => ({
    bubbles: true,
    composed: true,
    pointerId: 1,
    isPrimary: true,
    pointerType: 'mouse',
    clientX: box.left + 10,
    clientY: y,
  });
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  /**
   * A drag at a human pace: moves 80ms apart, so the release reads as a
   * placement rather than a flick. Back-to-back synthetic moves are microseconds
   * apart and read as a flick however short.
   */
  async function drag(el, dy) {
    const h = handle(el);
    const box = h.getBoundingClientRect();
    const y0 = box.top + 4;
    h.dispatchEvent(new PointerEvent('pointerdown', pointer(box, y0)));
    await pause(80);
    h.dispatchEvent(new PointerEvent('pointermove', pointer(box, y0 + dy / 2)));
    await pause(80);
    h.dispatchEvent(new PointerEvent('pointermove', pointer(box, y0 + dy)));
    await pause(80);
    h.dispatchEvent(new PointerEvent('pointermove', pointer(box, y0 + dy)));
    h.dispatchEvent(new PointerEvent('pointerup', pointer(box, y0 + dy)));
  }
  /**
   * A flick: 45px within a few ms. The threshold is 0.5px/ms, so this holds
   * as long as the timer fires within 90ms, which leaves room for a loaded
   * runner.
   */
  async function flick(el, dy) {
    const h = handle(el);
    const box = h.getBoundingClientRect();
    const y0 = box.top + 4;
    h.dispatchEvent(new PointerEvent('pointerdown', pointer(box, y0)));
    await pause(10);
    h.dispatchEvent(new PointerEvent('pointermove', pointer(box, y0 + dy)));
    h.dispatchEvent(new PointerEvent('pointerup', pointer(box, y0 + dy)));
  }

  it('rests at the first snap point', async () => {
    const el = await sheet();
    expect(await settledAt(el, 100)).to.equal(true);
    expect(el.snap).to.equal(0);
  });

  it('rests at the snap point `snap` names', async () => {
    const el = await sheet('snap-points="100px, 300px" snap="1"');
    expect(await settledAt(el, 300)).to.equal(true);
  });

  it('resolves viewport units', async () => {
    const el = await sheet('snap-points="50dvh"');
    expect(await settledAt(el, Math.round(window.innerHeight / 2))).to.equal(true);
  });

  it('makes the handle a vertical slider over the heights', async () => {
    const el = await sheet('snap-points="100px, 200px, 300px"');
    const h = handle(el);
    expect(h.getAttribute('role')).to.equal('slider');
    expect(h.getAttribute('tabindex')).to.equal('0');
    expect(h.getAttribute('aria-orientation')).to.equal('vertical');
    expect(h.getAttribute('aria-valuemax')).to.equal('3');
    expect(h.getAttribute('aria-valuenow')).to.equal('1');
    expect(h.getAttribute('aria-valuetext')).to.equal('1 of 3');
  });

  it('steps between heights from the keyboard', async () => {
    const el = await sheet('snap-points="100px, 200px, 300px"');
    const seen = changes(el);
    const key = (k) =>
      handle(el).dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
      );
    key('ArrowUp');
    key('ArrowUp');
    key('ArrowUp'); // already at the top
    key('ArrowDown');
    key('End');
    key('Home');
    await settle(el);
    expect(seen).to.deep.equal([1, 2, 1, 2, 0]);
    expect(el.snap).to.equal(0);
  });

  it('follows the pointer during a drag with no easing behind it', async () => {
    const el = await sheet();
    expect(await settledAt(el, 100), 'rests at 100px before the drag').to.equal(true);
    const panel = el.shadowRoot.querySelector('.sheet__panel');
    const h = handle(el);
    const box = h.getBoundingClientRect();
    h.dispatchEvent(new PointerEvent('pointerdown', pointer(box, box.top + 4)));
    h.dispatchEvent(new PointerEvent('pointermove', pointer(box, box.top + 4 - 120)));
    expect(
      getComputedStyle(panel)
        .transitionDuration.split(',')
        .every((d) => parseFloat(d) === 0),
    ).to.equal(true);
    expect(Math.round(panel.getBoundingClientRect().height)).to.equal(220);
    h.dispatchEvent(new PointerEvent('pointerup', pointer(box, box.top + 4 - 120)));
  });

  it('snaps a drag to the nearest height', async () => {
    const el = await sheet();
    expect(await settledAt(el, 100), 'rests at 100px before the drag').to.equal(true);
    const seen = changes(el);
    await drag(el, -150); // up to 250: nearer 300 than 100
    await settle(el);
    expect(seen).to.deep.equal([1]);
    expect(await settledAt(el, 300)).to.equal(true);
  });

  it('settles back when a drag ends nearer where it started', async () => {
    const el = await sheet();
    expect(await settledAt(el, 100), 'rests at 100px before the drag').to.equal(true);
    const seen = changes(el);
    await drag(el, -40);
    await settle(el);
    expect(seen).to.deep.equal([]);
    expect(await settledAt(el, 100)).to.equal(true);
  });

  it('goes to the next height on a flick, however short', async () => {
    const el = await sheet();
    expect(await settledAt(el, 100), 'rests at 100px before the drag').to.equal(true);
    const seen = changes(el);
    await flick(el, -45); // 145: nearer 100, but moving up fast
    await settle(el);
    expect(seen).to.deep.equal([1]);
  });

  it('requests a close when dragged well below the smallest height', async () => {
    const el = await sheet();
    expect(await settledAt(el, 100), 'rests at 100px before the drag').to.equal(true);
    let closes = 0;
    el.addEventListener('arc-close', () => closes++);
    await drag(el, 80); // to 20px, under 60% of 100
    await settle(el);
    expect(closes).to.equal(1);
    expect(el.open).to.equal(false);
  });

  it('ignores snap points on a right sheet', async () => {
    const el = mount(
      '<arc-sheet open side="right" heading="S" snap-points="100px, 300px">Body</arc-sheet>',
    );
    await settle(el);
    expect(handle(el).hasAttribute('role')).to.equal(false);
    expect(panel(el).style.getPropertyValue('--_snap-height')).to.equal('');
  });

  it('works non-modal too', async () => {
    const el = await sheet('no-modal snap-points="100px, 300px"');
    expect(panel(el).matches(':popover-open')).to.equal(true);
    expect(await settledAt(el, 100)).to.equal(true);
  });
});

/** Halteres adoption batch against 4.6.0 (test-findings #136, #137). */
describe('arc-sheet persistent and empty chrome (4.7.0)', () => {
  const open = async (attrs, content = '<p>Body</p>') => {
    const el = mount(`<arc-sheet open ${attrs}>${content}</arc-sheet>`);
    await settle(el);
    return el;
  };
  const header = (el) => el.shadowRoot.querySelector('[part~="header"]');
  const footer = (el) => el.shadowRoot.querySelector('[part~="footer"]');

  it('ignores Escape and has no close button when persistent (#136)', async () => {
    const el = await open(
      'persistent no-modal snap-points="100px, 300px"',
      '<button id="b">In</button>',
    );
    expect(el.shadowRoot.querySelector('[part~="close"]') === null).to.equal(true);
    const b = el.querySelector('#b');
    b.focus();
    b.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    await settle(el);
    expect(el.open).to.equal(true);
  });

  it('ignores Escape on a persistent modal sheet too', async () => {
    const el = await open('persistent heading="S"');
    panel(el).dispatchEvent(new Event('cancel', { cancelable: true }));
    await settle(el);
    expect(el.open).to.equal(true);
  });

  it('settles back on the smallest height instead of closing when dragged down (#136)', async () => {
    const el = await open('persistent snap-points="100px, 300px" snap="1"');
    await until(() => Math.abs(panel(el).getBoundingClientRect().height - 300) <= 1, {
      timeout: 1500,
    });
    let closes = 0;
    el.addEventListener('arc-close', () => closes++);
    const h = el.shadowRoot.querySelector('[part~="handle"]');
    const box = h.getBoundingClientRect();
    const p = (y) => ({
      bubbles: true,
      composed: true,
      pointerId: 1,
      isPrimary: true,
      pointerType: 'mouse',
      clientX: box.left + 5,
      clientY: y,
    });
    h.dispatchEvent(new PointerEvent('pointerdown', p(box.top + 4)));
    await new Promise((r) => setTimeout(r, 80));
    h.dispatchEvent(new PointerEvent('pointermove', p(box.top + 290)));
    await new Promise((r) => setTimeout(r, 80));
    h.dispatchEvent(new PointerEvent('pointermove', p(box.top + 290)));
    h.dispatchEvent(new PointerEvent('pointerup', p(box.top + 290)));
    await settle(el);
    expect(closes).to.equal(0);
    expect(el.open).to.equal(true);
    expect(el.snap).to.equal(0);
  });

  it('still closes from script when persistent', async () => {
    const el = await open('persistent heading="S"');
    el.open = false;
    await settle(el);
    expect(panel(el).open).to.equal(false);
  });

  it('leaves out an empty header and footer on a persistent headless sheet (#137)', async () => {
    const el = await open('persistent no-modal');
    expect(getComputedStyle(header(el)).display).to.equal('none');
    expect(getComputedStyle(footer(el)).display).to.equal('none');
  });

  it('keeps the header for its close button, and the footer when filled', async () => {
    const el = await open('', '<p>Body</p><button slot="footer">Done</button>');
    expect(getComputedStyle(header(el)).display).to.not.equal('none');
    expect(getComputedStyle(footer(el)).display).to.not.equal('none');
  });
});
