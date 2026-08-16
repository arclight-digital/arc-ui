/**
 * arc-context-menu — the right-click menu.
 *
 * What this pins: it binds to its parent's contextmenu and suppresses the
 * native menu, opens at the pointer, keyboard navigation skips dividers and
 * disabled items and wraps, arc-select carries the item's value on detail.value,
 * and the v3 close contract holds — a cancelable arc-close fires before the
 * state flips, from Escape, from the backdrop and from choosing an item.
 *
 * Focus handling is the part most worth pinning: the menu takes focus on open
 * and returns it to whatever had it, except on a backdrop dismissal, where the
 * component deliberately leaves focus alone.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record, deepActive, until, stableRect } from './helpers.js';

import '../src/feedback/context-menu.register.js';
// The menu reads these from its slot rather than rendering them, so they are
// the consumer's import — not a @requires on the component.
import '../src/shared/menu-item.register.js';
import '../src/shared/menu-divider.register.js';

afterEach(() => cleanup());

// arc-menu-item takes its label from slotted text *or* from the `label`
// attribute — both work (finding #32); `displayLabel` is what resolves them.
const ITEMS = `
  <arc-menu-item>Cut</arc-menu-item>
  <arc-menu-item value="copy">Copy</arc-menu-item>
  <arc-menu-divider></arc-menu-divider>
  <arc-menu-item disabled>Paste</arc-menu-item>
  <arc-menu-item value="delete">Delete</arc-menu-item>
`;

/** A target element with a context menu attached to it. */
async function target(items = ITEMS) {
  const host = mount(`<div id="target" tabindex="0">Right-click me<arc-context-menu>${items}</arc-context-menu></div>`);
  const el = host.querySelector('arc-context-menu');
  await settle(el);
  return { host, el };
}

/** Fire a contextmenu on the target the way a right-click would. */
/** The gesture DismissController listens for: a pointerdown anywhere else. */
function outsidePointerDown() {
  document.body.dispatchEvent(
    new PointerEvent('pointerdown', { bubbles: true, composed: true, cancelable: true }),
  );
}

async function rightClick(host, el, { clientX = 40, clientY = 60 } = {}) {
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX, clientY });
  host.dispatchEvent(event);
  await settle(el);
  return event;
}

const menu = (el) => el.shadowRoot.querySelector('[part~="menu"]');
const menuItems = (el) => [...el.shadowRoot.querySelectorAll('[role="menuitem"]')];
const labels = (el) => menuItems(el).map((i) => i.textContent.trim());
const active = (el) => menu(el)?.getAttribute('aria-activedescendant') ?? null;

describe('arc-context-menu opening', () => {
  it('opens on the parent contextmenu and suppresses the native menu', async () => {
    const { host, el } = await target();
    expect(el.open).to.equal(false);

    const event = await rightClick(host, el);

    expect(el.open).to.equal(true);
    expect(event.defaultPrevented, 'the browser menu must not also appear').to.equal(true);
  });

  it('fires arc-open, bubbling and composed', async () => {
    const { host, el } = await target();
    let event = null;
    document.body.addEventListener('arc-open', (e) => { event = e; }, { once: true });

    await rightClick(host, el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('renders nothing but the slots while closed', async () => {
    const { el } = await target();
    expect(menu(el) === null, 'no menu panel until opened').to.equal(true);
  });

  it('renders one menuitem per non-divider child', async () => {
    const { host, el } = await target();
    await rightClick(host, el);

    expect(labels(el)).to.deep.equal(['Cut', 'Copy', 'Paste', 'Delete']);
    expect(el.shadowRoot.querySelector('[part~="divider"]')).to.not.equal(null);
  });

  it('opens at the pointer', async () => {
    const { host, el } = await target();
    await rightClick(host, el, { clientX: 120, clientY: 90 });

    // Exact placement is PositionController's contract and has its own 28
    // tests; what matters here is that the menu hangs off the click rather
    // than off the host, which sits at the top-left of the page.
    // Polled, not read once after settle(). settle() is a fixed two-frame wait,
    // which is a guess that PositionController has finished measuring and
    // placing by then — true on an idle machine, not under full-suite load.
    // Until then the panel sits unpositioned at the origin.
    const box = await stableRect(() => menu(el));
    expect(box.left, 'near the pointer, not at the origin').to.be.closeTo(120, 10);
    expect(box.top).to.be.closeTo(90, 10);
  });

  it('re-anchors when reopened at a new point', async () => {
    const { host, el } = await target();
    await rightClick(host, el, { clientX: 30, clientY: 30 });

    const first = (await stableRect(() => menu(el))).left;

    keyOn(menu(el), 'Escape');
    await settle(el);
    await rightClick(host, el, { clientX: 150, clientY: 100 });

    // THE FLAKE. This read `getBoundingClientRect()` once, straight after
    // settle(), and there are *two* races underneath that, which is why the
    // first fix was not enough:
    //
    //   1. PositionController may not have placed the panel yet — delta ~0.
    //   2. `.menu` animates in over 100ms (`menu-in`, scale 0.95 -> 1), which
    //      is ~6 frames, while settle() waits 2. A rect read mid-animation is a
    //      few pixels out — the observed failure was 123.09 against 120 +/- 2.
    //
    // Polling for "it moved" fixed (1) and left (2). stableRect() waits for the
    // box to stop moving, which covers both without encoding a frame count.
    const second = (await stableRect(() => menu(el))).left;
    expect(second - first, 'the menu tracks the click delta').to.be.closeTo(120, 2);
  });

  // Was a BUG pin (finding #31). `_x`/`_y` are plain fields rather than
  // reactive state — deliberately, since PositionController writes the menu's
  // coordinates to its inline style and a re-render driven by them would wipe
  // that — and `updated()` only repositioned when `open` itself changed. So a
  // second right-click while the menu was already open recorded the new
  // coordinates and left the menu at the first click, pointing at the wrong
  // target. Reproducing it needed no unusual sequence: right-click, then
  // right-click elsewhere without dismissing first.
  it('follows a second right-click while already open', async () => {
    const { host, el } = await target();
    await rightClick(host, el, { clientX: 30, clientY: 30 });
    const first = (await stableRect(() => menu(el))).left;

    await rightClick(host, el, { clientX: 150, clientY: 100 });

    // Only where the menu ended up: `_x` is the coordinate on its way in, and
    // a menu that recorded it and never re-anchored is the bug this pins.
    const second = (await stableRect(() => menu(el))).left;
    expect(second - first, 'the menu moved with the second click').to.be.closeTo(120, 2);
  });

  it('stays open across the re-anchor', async () => {
    // The cheap wrong fix is to close and reopen, which loses the arc-close /
    // arc-open contract and any veto a consumer put on it.
    const { host, el } = await target();
    await rightClick(host, el, { clientX: 30, clientY: 30 });

    let closes = 0;
    el.addEventListener('arc-close', () => { closes += 1; });
    await rightClick(host, el, { clientX: 150, clientY: 100 });

    expect(el.open).to.equal(true);
    expect(closes, 'a re-anchor is not a dismissal').to.equal(0);
  });

  it('takes focus on open', async () => {
    const { host, el } = await target();
    await rightClick(host, el);
    expect(deepActive()).to.equal(menu(el));
  });

  it('survives having no items', async () => {
    const { host, el } = await target('');
    await rightClick(host, el);
    expect(el.open).to.equal(true);
    expect(menuItems(el)).to.have.lengthOf(0);
  });
});

describe('arc-context-menu accessibility', () => {
  it('is a menu of menuitems', async () => {
    const { host, el } = await target();
    await rightClick(host, el);

    expect(menu(el).getAttribute('role')).to.equal('menu');
    expect(menuItems(el)).to.have.lengthOf(4);
  });

  it('marks a disabled item rather than dropping it', async () => {
    const { host, el } = await target();
    await rightClick(host, el);

    const paste = menuItems(el).find((i) => i.textContent.trim() === 'Paste');
    expect(paste.getAttribute('aria-disabled')).to.equal('true');
  });

  it('omits aria-activedescendant until something is active', async () => {
    const { host, el } = await target();
    await rightClick(host, el);

    expect(menu(el).hasAttribute('aria-activedescendant'), 'nothing active yet').to.equal(false);

    keyOn(menu(el), 'ArrowDown');
    await settle(el);
    expect(active(el)).to.be.a('string').and.not.empty;
  });

  it('points aria-activedescendant at a live element', async () => {
    const { host, el } = await target();
    await rightClick(host, el);
    keyOn(menu(el), 'ArrowDown');
    await settle(el);

    expect(el.shadowRoot.getElementById(active(el)), 'must resolve').to.not.equal(null);
  });
});

describe('arc-context-menu keyboard', () => {
  const openMenu = async () => {
    const { host, el } = await target();
    await rightClick(host, el);
    return el;
  };

  /** The label of whatever aria-activedescendant currently points at. */
  const activeLabel = (el) => el.shadowRoot.getElementById(active(el))?.textContent.trim() ?? null;

  it('walks the enabled items, skipping the divider and the disabled one', async () => {
    const el = await openMenu();

    keyOn(menu(el), 'ArrowDown');
    await settle(el);
    expect(activeLabel(el)).to.equal('Cut');

    keyOn(menu(el), 'ArrowDown');
    await settle(el);
    expect(activeLabel(el)).to.equal('Copy');

    keyOn(menu(el), 'ArrowDown');
    await settle(el);
    expect(activeLabel(el), 'divider and disabled Paste are both skipped').to.equal('Delete');
  });

  it('wraps at both ends', async () => {
    const el = await openMenu();

    keyOn(menu(el), 'End');
    await settle(el);
    expect(activeLabel(el)).to.equal('Delete');

    keyOn(menu(el), 'ArrowDown');
    await settle(el);
    expect(activeLabel(el), 'last → first').to.equal('Cut');

    keyOn(menu(el), 'ArrowUp');
    await settle(el);
    expect(activeLabel(el), 'first → last').to.equal('Delete');
  });

  it('Home and End hit the enabled ends', async () => {
    const el = await openMenu();

    keyOn(menu(el), 'Home');
    await settle(el);
    expect(activeLabel(el)).to.equal('Cut');

    keyOn(menu(el), 'End');
    await settle(el);
    expect(activeLabel(el)).to.equal('Delete');
  });

  it('claims the keys it handles', async () => {
    const el = await openMenu();
    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      menu(el).dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
      if (!el.open) await rightClick(el.parentElement, el);
    }
  });

  it('Enter does nothing while no item is active', async () => {
    const el = await openMenu();
    const seen = record(el, ['arc-select']);

    keyOn(menu(el), 'Enter');
    await settle(el);

    expect(seen).to.deep.equal([]);
  });
});

describe('arc-context-menu selection', () => {
  it('reports the item value on detail.value and closes', async () => {
    const { host, el } = await target();
    await rightClick(host, el);

    const details = [];
    el.addEventListener('arc-select', (e) => details.push(e.detail));

    menuItems(el).find((i) => i.textContent.trim() === 'Copy').click();
    await settle(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].value).to.equal('copy');
    expect(details[0].item.label).to.equal('Copy');
    expect(el.open, 'choosing an item dismisses the menu').to.equal(false);
  });

  it('falls back to the label when an item has no value', async () => {
    const { host, el } = await target();
    await rightClick(host, el);

    const details = [];
    el.addEventListener('arc-select', (e) => details.push(e.detail));

    menuItems(el).find((i) => i.textContent.trim() === 'Cut').click();
    await settle(el);

    expect(details[0].value).to.equal('Cut');
  });

  it('selects with Enter', async () => {
    const { host, el } = await target();
    await rightClick(host, el);
    const details = [];
    el.addEventListener('arc-select', (e) => details.push(e.detail));

    keyOn(menu(el), 'ArrowDown');
    await settle(el);
    keyOn(menu(el), 'Enter');
    await settle(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].value).to.equal('Cut');
  });

  it('does not select a disabled item', async () => {
    const { host, el } = await target();
    await rightClick(host, el);
    const seen = record(el, ['arc-select']);

    menuItems(el).find((i) => i.textContent.trim() === 'Paste').click();
    await settle(el);

    expect(seen).to.deep.equal([]);
    expect(el.open, 'and the menu stays open').to.equal(true);
  });
});

describe('arc-context-menu closing', () => {
  it('closes on Escape', async () => {
    const { host, el } = await target();
    await rightClick(host, el);

    keyOn(menu(el), 'Escape');
    await settle(el);
    expect(el.open).to.equal(false);
  });

  it('closes when the pointer lands outside', async () => {
    // Was a click on a full-viewport invisible `.backdrop` div. V4-PLAN 4.4
    // moved this component onto DismissController — the last `open`-declaring
    // overlay on neither central contract — so the gesture is an ordinary
    // pointerdown elsewhere in the document, and the click that dismisses the
    // menu now reaches whatever it was aimed at.
    const { host, el } = await target();
    await rightClick(host, el);

    outsidePointerDown();
    await settle(el);
    expect(el.open).to.equal(false);
  });

  it('fires arc-close before the state flips', async () => {
    const { host, el } = await target();
    await rightClick(host, el);

    let openDuringEvent = null;
    el.addEventListener('arc-close', () => { openDuringEvent = el.open; }, { once: true });

    keyOn(menu(el), 'Escape');
    await settle(el);

    expect(openDuringEvent, 'a listener must observe the still-open state').to.equal(true);
    expect(el.open).to.equal(false);
  });

  it('preventDefault() on arc-close vetoes every dismissal path', async () => {
    const { host, el } = await target();
    await rightClick(host, el);
    const veto = (e) => e.preventDefault();
    el.addEventListener('arc-close', veto);

    keyOn(menu(el), 'Escape');
    await settle(el);
    expect(el.open, 'Escape vetoed').to.equal(true);

    outsidePointerDown();
    await settle(el);
    expect(el.open, 'outside dismissal vetoed').to.equal(true);

    menuItems(el)[0].click();
    await settle(el);
    expect(el.open, 'selection vetoed').to.equal(true);

    el.removeEventListener('arc-close', veto);
    keyOn(menu(el), 'Escape');
    await settle(el);
    expect(el.open, 'and the next close works').to.equal(false);
  });

  it('returns focus to whatever had it before opening', async () => {
    const outside = mount('<button>elsewhere</button>');
    const { host, el } = await target();
    outside.focus();

    await rightClick(host, el);
    expect(deepActive(), 'focus moved into the menu').to.equal(menu(el));

    keyOn(menu(el), 'Escape');
    await settle(el);
    expect(deepActive()).to.equal(outside);
  });

  it('leaves focus alone on an outside dismissal', async () => {
    // The outside path passes restoreFocus: false — the user has already moved
    // their attention somewhere else, so pulling focus back to where it was
    // before the menu opened would fight them. `outside` is exactly where
    // restoreFocus: true would have put it, so asserting focus is *not* there
    // is what pins the flag.
    //
    // Compared with `===` rather than handed to `expect(a).to.equal(b)`: on
    // failure chai diffs the two values, and one of them is whatever has focus
    // — `document.body` here — which it walks. That hangs the runner rather
    // than reporting, and it cost a bisect to find.
    const outside = mount('<button>elsewhere</button>');
    const { host, el } = await target();
    outside.focus();
    await rightClick(host, el);

    outsidePointerDown();
    await settle(el);

    expect(deepActive() === outside, 'focus is not pulled back to the opener').to.equal(false);
  });
});

/**
 * Finding #32: `label` was documented as a prop and implemented as a getter
 * over textContent with no setter and no attribute, so
 * `<arc-menu-item label="Cut"></arc-menu-item>` rendered a blank item —
 * silently — and the six generated wrappers exposed a writable `label` that did
 * nothing. It cost a debugging pass while the original tests were being
 * written, which is a fair proxy for what it cost a consumer reading the docs.
 *
 * There was no BUG pin, because there was no behaviour to pin: the component's
 * real contract was the text-content form and that is what the file exercised.
 */
describe('arc-menu-item label', () => {
  const rowLabels = (el) =>
    [...el.shadowRoot.querySelectorAll('.item-label')].map((n) => n.textContent.trim());

  it('renders an item labelled by the attribute', async () => {
    const { host, el } = await target('<arc-menu-item label="Cut"></arc-menu-item>');
    await rightClick(host, el);
    expect(rowLabels(el)).to.deep.equal(['Cut']);
  });

  it('still renders an item labelled by its text content', async () => {
    const { host, el } = await target('<arc-menu-item>Cut</arc-menu-item>');
    await rightClick(host, el);
    expect(rowLabels(el)).to.deep.equal(['Cut']);
  });

  it('prefers the explicit label when both are given', async () => {
    const { host, el } = await target('<arc-menu-item label="Cut">ignored</arc-menu-item>');
    await rightClick(host, el);
    expect(rowLabels(el)).to.deep.equal(['Cut']);
  });

  it('reports the attribute label on arc-select, with no value of its own', async () => {
    // selectionValue falls back to the label, so the fallback has to resolve
    // the same way the render does or the event and the row disagree.
    const { host, el } = await target('<arc-menu-item label="Cut"></arc-menu-item>');
    await rightClick(host, el);

    const details = [];
    el.addEventListener('arc-select', (e) => details.push(e.detail));
    el.shadowRoot.querySelector('.menu-item').click();
    await settle(el);

    expect(details[0].value).to.equal('Cut');
    expect(details[0].item.label).to.equal('Cut');
  });

  it('follows a label set after mount', async () => {
    const { host, el } = await target('<arc-menu-item label="Cut"></arc-menu-item>');
    await rightClick(host, el);

    el.querySelector('arc-menu-item').label = 'Snip';
    await settle(el);

    expect(rowLabels(el)).to.deep.equal(['Snip']);
  });
});
