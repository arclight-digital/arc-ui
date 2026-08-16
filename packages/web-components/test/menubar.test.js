/**
 * arc-menubar — the desktop-application menu bar.
 *
 * What this pins: the WAI-ARIA menubar keyboard pattern (roving focus across
 * the bar, vertical movement inside a menu, ArrowRight/ArrowLeft to enter and
 * leave a submenu, Escape collapsing one level at a time, Tab leaving
 * entirely), the documented `arc-select` payload — `detail.path` is the full
 * label chain from the top-level menu to the leaf — and the pointer paths that
 * have to agree with the keyboard ones.
 *
 * The fixture deliberately contains a divider, a disabled leaf, a disabled
 * top-level menu and a submenu, because almost every navigation rule in this
 * component is really a rule about which entries get skipped.
 *
 * One test is marked BUG: reopening a menu creates a fresh PositionController
 * and never retires the old one. See test-findings.md #56.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, tick, until } from './helpers.js';

import '../src/navigation/menubar.register.js';

afterEach(() => cleanup());

const ITEMS = [
  {
    label: 'File',
    items: [
      { label: 'New', shortcut: '⌘N' },
      { label: 'Open' },
      { divider: true },
      { label: 'Export', items: [{ label: 'PNG' }, { label: 'SVG' }] },
      { label: 'Quit', disabled: true },
    ],
  },
  { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Redo' }] },
  { label: 'Help', disabled: true, items: [{ label: 'About' }] },
  { label: 'View', items: [{ label: 'Zoom In' }, { label: 'Zoom Out' }] },
];

async function menubar(items = ITEMS) {
  const el = mount('<arc-menubar></arc-menubar>');
  el.items = items;
  await settle(el);
  return el;
}

const triggers = (el) => [...el.shadowRoot.querySelectorAll('[part~="trigger"]')];
const menus = (el) => [...el.shadowRoot.querySelectorAll('[role="menu"]')];
const items = (el) => [...el.shadowRoot.querySelectorAll('[role="menuitem"]:not([part~="trigger"])')];
const labels = (el) => items(el).map((b) => b.querySelector('.item__label').textContent.trim());
const active = (el) => el.shadowRoot.querySelector('.item.is-active');
const activeLabel = (el) => active(el)?.querySelector('.item__label').textContent.trim() ?? null;
const tabStops = (el) => [...el.shadowRoot.querySelectorAll('[tabindex="0"]')];
/** Whatever currently owns the keyboard, as a label. */
const focused = (el) =>
  el.shadowRoot.activeElement?.textContent.trim().replace(/[›⌘].*$/, '').trim() ?? null;

/**
 * Send a key at the element that actually has focus, as a real press would.
 *
 * The fallback is the bar rather than the host: the keydown listener lives on
 * `[part~="bar"]` inside the shadow root, and an event dispatched at the host
 * bubbles *outward*, so it would never reach the handler — a silently inert
 * press that reads as the component ignoring the key.
 */
const press = (el, key, init) =>
  keyOn(el.shadowRoot.activeElement ?? el.shadowRoot.querySelector('[part~="bar"]'), key, init);

describe('arc-menubar rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);
    for (const part of ['bar', 'trigger', 'menu', 'item', 'shortcut', 'divider']) {
      expect(el.shadowRoot.querySelector(`[part~="${part}"]`), part).to.not.equal(null);
    }
  });

  it('carries the menubar roles', async () => {
    const el = await menubar();
    expect(el.shadowRoot.querySelector('[role="menubar"]')).to.not.equal(null);
    expect(triggers(el).map((t) => t.textContent.trim())).to.deep.equal([
      'File',
      'Edit',
      'Help',
      'View',
    ]);
    expect(triggers(el).every((t) => t.getAttribute('aria-haspopup') === 'menu')).to.equal(true);
  });

  it('renders no menu until one is opened', async () => {
    const el = await menubar();
    expect(menus(el)).to.have.lengthOf(0);
    expect(triggers(el).every((t) => t.getAttribute('aria-expanded') === 'false')).to.equal(true);
  });

  it('marks a disabled top-level menu', async () => {
    const el = await menubar();
    expect(triggers(el)[2].getAttribute('aria-disabled')).to.equal('true');
    expect(triggers(el)[0].hasAttribute('aria-disabled')).to.equal(false);
  });

  it('renders dividers as separators rather than as menu items', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);
    expect(el.shadowRoot.querySelectorAll('[role="separator"]')).to.have.lengthOf(1);
    expect(labels(el)).to.deep.equal(['New', 'Open', 'Export', 'Quit']);
  });

  it('shows a shortcut only where one is declared', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);
    const shortcuts = [...el.shadowRoot.querySelectorAll('[part~="shortcut"]')];
    expect(shortcuts).to.have.lengthOf(1);
    expect(shortcuts[0].textContent.trim()).to.equal('⌘N');
  });

  it('marks a submenu parent with aria-haspopup and collapsed aria-expanded', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);
    const exportItem = items(el).find((b) => b.textContent.includes('Export'));
    expect(exportItem.getAttribute('aria-haspopup')).to.equal('menu');
    expect(exportItem.getAttribute('aria-expanded')).to.equal('false');
    // a leaf must not claim a popup
    const newItem = items(el).find((b) => b.textContent.includes('New'));
    expect(newItem.hasAttribute('aria-haspopup')).to.equal(false);
  });

  it('survives items never being set', async () => {
    const el = mount('<arc-menubar></arc-menubar>');
    await settle(el);
    expect(triggers(el)).to.have.lengthOf(0);
    press(el, 'ArrowDown');
    await settle(el);
    expect(menus(el)).to.have.lengthOf(0);
  });

  it('keeps exactly one tab stop', async () => {
    const el = await menubar();
    expect(tabStops(el)).to.have.lengthOf(1);

    triggers(el)[0].click();
    await settle(el);
    expect(tabStops(el)).to.have.lengthOf(1);

    press(el, 'ArrowDown');
    await settle(el);
    expect(tabStops(el)).to.have.lengthOf(1);
    expect(tabStops(el)[0].textContent).to.contain('New');
  });
});

describe('arc-menubar pointer', () => {
  it('opens on trigger click and closes on a second click', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);
    expect(menus(el)).to.have.lengthOf(1);
    expect(triggers(el)[0].getAttribute('aria-expanded')).to.equal('true');

    triggers(el)[0].click();
    await settle(el);
    expect(menus(el)).to.have.lengthOf(0);
  });

  it('ignores a click on a disabled top-level menu', async () => {
    const el = await menubar();
    triggers(el)[2].click();
    await settle(el);
    expect(menus(el)).to.have.lengthOf(0);
  });

  it('switches menus on hover once one is already open', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);

    triggers(el)[1].dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
    await settle(el);
    expect(labels(el)).to.deep.equal(['Undo', 'Redo']);
  });

  it('does not open on hover when nothing is open yet', async () => {
    const el = await menubar();
    triggers(el)[1].dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
    await settle(el);
    expect(menus(el)).to.have.lengthOf(0);
  });

  it('selects a leaf on click and reports the full label path', async () => {
    const el = await menubar();
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail));

    triggers(el)[0].click();
    await settle(el);
    items(el).find((b) => b.textContent.includes('Open')).click();
    await settle(el);

    expect(seen).to.have.lengthOf(1);
    expect(seen[0].path).to.deep.equal(['File', 'Open']);
    expect(menus(el)).to.have.lengthOf(0);
  });

  it('reports the whole chain through a submenu', async () => {
    const el = await menubar();
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail.path));

    triggers(el)[0].click();
    await settle(el);
    items(el).find((b) => b.textContent.includes('Export')).click();
    await settle(el);
    items(el).find((b) => b.textContent.includes('PNG')).click();
    await settle(el);

    expect(seen).to.deep.equal([['File', 'Export', 'PNG']]);
  });

  it('does not select a disabled leaf', async () => {
    const el = await menubar();
    const seen = [];
    el.addEventListener('arc-select', () => seen.push(1));

    triggers(el)[0].click();
    await settle(el);
    items(el).find((b) => b.textContent.includes('Quit')).click();
    await settle(el);

    expect(seen).to.have.lengthOf(0);
    expect(menus(el), 'and the menu stays open').to.have.lengthOf(1);
  });

  it('toggles a submenu open and shut by clicking its parent', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);
    const exportItem = () => items(el).find((b) => b.textContent.includes('Export'));

    exportItem().click();
    await settle(el);
    expect(menus(el)).to.have.lengthOf(2);
    expect(exportItem().getAttribute('aria-expanded')).to.equal('true');

    exportItem().click();
    await settle(el);
    expect(menus(el)).to.have.lengthOf(1);
    expect(exportItem().getAttribute('aria-expanded')).to.equal('false');
  });

  it('opens a submenu after hovering its parent', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);

    const exportItem = items(el).find((b) => b.textContent.includes('Export'));
    exportItem.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));

    expect(await until(() => menus(el).length === 2), 'submenu opens on hover dwell').to.equal(true);
  });

  it('closes an open submenu when a sibling item is hovered', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);
    items(el).find((b) => b.textContent.includes('Export')).click();
    await settle(el);
    expect(menus(el)).to.have.lengthOf(2);

    items(el).find((b) => b.textContent.includes('New'))
      .dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
    await settle(el);

    expect(menus(el)).to.have.lengthOf(1);
  });
});

describe('arc-menubar keyboard — the bar', () => {
  it('opens the focused menu with ArrowDown, on its first item', async () => {
    const el = await menubar();
    triggers(el)[0].focus();
    press(el, 'ArrowDown');
    await settle(el);
    expect(activeLabel(el)).to.equal('New');
  });

  it('opens on the last item with ArrowUp', async () => {
    const el = await menubar();
    triggers(el)[0].focus();
    press(el, 'ArrowUp');
    await settle(el);
    // Quit is disabled, so the last *selectable* entry is Export
    expect(activeLabel(el)).to.equal('Export');
  });

  it('moves along the bar with ArrowRight, skipping disabled menus', async () => {
    const el = await menubar();
    triggers(el)[0].focus();
    press(el, 'ArrowRight');
    await settle(el);
    expect(focused(el)).to.equal('Edit');

    press(el, 'ArrowRight');
    await settle(el);
    expect(focused(el), 'Help is disabled and is skipped').to.equal('View');
  });

  it('wraps around the bar in both directions', async () => {
    const el = await menubar();
    triggers(el)[0].focus();
    press(el, 'ArrowLeft');
    await settle(el);
    expect(focused(el)).to.equal('View');

    press(el, 'ArrowRight');
    await settle(el);
    expect(focused(el)).to.equal('File');
  });

  it('Home and End jump to the ends of the bar', async () => {
    const el = await menubar();
    triggers(el)[0].focus();
    press(el, 'End');
    await settle(el);
    expect(focused(el)).to.equal('View');

    press(el, 'Home');
    await settle(el);
    expect(focused(el)).to.equal('File');
  });

  it('opens the focused menu with Enter and with Space', async () => {
    for (const key of ['Enter', ' ']) {
      const el = await menubar();
      triggers(el)[0].focus();
      press(el, key);
      await settle(el);
      expect(activeLabel(el), key).to.equal('New');
      el.remove();
    }
  });

  it('jumps along the bar by first letter', async () => {
    const el = await menubar();
    triggers(el)[0].focus();
    press(el, 'v');
    await settle(el);
    expect(focused(el)).to.equal('View');
  });

  it('leaves an unmatched letter alone', async () => {
    const el = await menubar();
    triggers(el)[0].focus();
    press(el, 'z');
    await settle(el);
    expect(focused(el)).to.equal('File');
  });
});

describe('arc-menubar keyboard — inside a menu', () => {
  async function opened() {
    const el = await menubar();
    triggers(el)[0].focus();
    press(el, 'ArrowDown');
    await settle(el);
    return el;
  }

  it('moves down the menu, skipping the divider and the disabled item', async () => {
    const el = await opened();
    expect(activeLabel(el)).to.equal('New');
    press(el, 'ArrowDown');
    await settle(el);
    expect(activeLabel(el)).to.equal('Open');
    press(el, 'ArrowDown');
    await settle(el);
    expect(activeLabel(el), 'the divider is not stopped on').to.equal('Export');
    press(el, 'ArrowDown');
    await settle(el);
    expect(activeLabel(el), 'Quit is disabled, so it wraps instead').to.equal('New');
  });

  it('wraps upward from the first item to the last selectable one', async () => {
    const el = await opened();
    press(el, 'ArrowUp');
    await settle(el);
    expect(activeLabel(el)).to.equal('Export');
  });

  it('Home and End jump within the menu', async () => {
    const el = await opened();
    press(el, 'End');
    await settle(el);
    expect(activeLabel(el)).to.equal('Export');
    press(el, 'Home');
    await settle(el);
    expect(activeLabel(el)).to.equal('New');
  });

  it('jumps by first letter within the open menu', async () => {
    const el = await opened();
    press(el, 'e');
    await settle(el);
    expect(activeLabel(el)).to.equal('Export');
  });

  it('selects the active leaf with Enter', async () => {
    const el = await opened();
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail.path));

    press(el, 'Enter');
    await settle(el);
    expect(seen).to.deep.equal([['File', 'New']]);
    expect(menus(el)).to.have.lengthOf(0);
  });

  it('closes and returns focus to the trigger after selecting', async () => {
    const el = await opened();
    press(el, 'Enter');
    await settle(el);
    expect(focused(el)).to.equal('File');
  });

  it('Escape closes the menu and restores the trigger', async () => {
    const el = await opened();
    press(el, 'Escape');
    await settle(el);
    expect(menus(el)).to.have.lengthOf(0);
    expect(focused(el)).to.equal('File');
  });

  it('Tab closes the menu without swallowing the key', async () => {
    const el = await opened();
    const e = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    el.shadowRoot.activeElement.dispatchEvent(e);
    await settle(el);

    expect(menus(el)).to.have.lengthOf(0);
    expect(e.defaultPrevented, 'focus must be allowed to move on').to.equal(false);
  });

  it('moves to the next menu with ArrowRight from a leaf, landing on its first item', async () => {
    const el = await opened();
    press(el, 'ArrowRight');
    await settle(el);
    expect(labels(el)).to.deep.equal(['Undo', 'Redo']);
    expect(activeLabel(el)).to.equal('Undo');
  });

  it('moves to the previous menu with ArrowLeft from a top-level item', async () => {
    const el = await opened();
    press(el, 'ArrowLeft');
    await settle(el);
    expect(labels(el)).to.deep.equal(['Zoom In', 'Zoom Out']);
  });
});

describe('arc-menubar submenus', () => {
  async function onExport() {
    const el = await menubar();
    triggers(el)[0].focus();
    press(el, 'ArrowDown');
    await settle(el);
    press(el, 'End'); // Export is the last selectable entry
    await settle(el);
    expect(activeLabel(el)).to.equal('Export');
    return el;
  }

  it('ArrowRight expands the submenu onto its first item', async () => {
    const el = await onExport();
    press(el, 'ArrowRight');
    await settle(el);
    expect(menus(el)).to.have.lengthOf(2);
    expect(activeLabel(el)).to.equal('PNG');
  });

  it('Enter expands a submenu parent rather than selecting it', async () => {
    const el = await onExport();
    const seen = [];
    el.addEventListener('arc-select', () => seen.push(1));

    press(el, 'Enter');
    await settle(el);
    expect(menus(el)).to.have.lengthOf(2);
    expect(seen, 'a parent is not a selectable leaf').to.have.lengthOf(0);
  });

  it('ArrowLeft collapses back to the parent item', async () => {
    const el = await onExport();
    press(el, 'ArrowRight');
    await settle(el);
    press(el, 'ArrowLeft');
    await settle(el);
    expect(menus(el)).to.have.lengthOf(1);
    expect(activeLabel(el)).to.equal('Export');
  });

  it('Escape collapses one level at a time rather than closing everything', async () => {
    const el = await onExport();
    press(el, 'ArrowRight');
    await settle(el);
    expect(menus(el)).to.have.lengthOf(2);

    press(el, 'Escape');
    await settle(el);
    expect(menus(el), 'submenu closed, parent menu still open').to.have.lengthOf(1);

    press(el, 'Escape');
    await settle(el);
    expect(menus(el)).to.have.lengthOf(0);
  });

  it('selects a nested leaf with Enter', async () => {
    const el = await onExport();
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail.path));

    press(el, 'ArrowRight');
    await settle(el);
    press(el, 'ArrowDown');
    await settle(el);
    press(el, 'Enter');
    await settle(el);

    expect(seen).to.deep.equal([['File', 'Export', 'SVG']]);
  });

  it('marks the expanded parent with aria-expanded', async () => {
    const el = await onExport();
    press(el, 'ArrowRight');
    await settle(el);
    const exportItem = items(el).find((b) => b.textContent.includes('Export'));
    expect(exportItem.getAttribute('aria-expanded')).to.equal('true');
  });
});

describe('arc-menubar dismissal and state', () => {
  it('closes when focus leaves the component', async () => {
    const el = await menubar();
    const outside = mount('<button>elsewhere</button>');
    triggers(el)[0].click();
    await settle(el);

    el.shadowRoot.querySelector('[part~="bar"]').dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: outside, bubbles: true }),
    );
    await settle(el);
    expect(menus(el)).to.have.lengthOf(0);
  });

  it('stays open when focus moves within itself', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);

    el.shadowRoot.querySelector('[part~="bar"]').dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: triggers(el)[1], bubbles: true }),
    );
    await settle(el);
    expect(menus(el)).to.have.lengthOf(1);
  });

  it('closes on an outside click', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    document.body.click();
    await settle(el);
    await tick();
    expect(menus(el)).to.have.lengthOf(0);
  });

  it('resets open state when items are reassigned', async () => {
    const el = await menubar();
    triggers(el)[0].click();
    await settle(el);
    expect(menus(el)).to.have.lengthOf(1);

    el.items = [{ label: 'Only', items: [{ label: 'Thing' }] }];
    await settle(el);

    expect(menus(el)).to.have.lengthOf(0);
    expect(triggers(el).map((t) => t.textContent.trim())).to.deep.equal(['Only']);
  });

  it('focuses the first enabled menu when the first one is disabled', async () => {
    const el = await menubar([
      { label: 'Nope', disabled: true, items: [{ label: 'x' }] },
      { label: 'Yep', items: [{ label: 'y' }] },
    ]);
    expect(tabStops(el)).to.have.lengthOf(1);
    expect(tabStops(el)[0].textContent.trim()).to.equal('Yep');
  });

  it('opens an empty menu without breaking', async () => {
    const el = await menubar([{ label: 'Empty', items: [] }]);
    triggers(el)[0].click();
    await settle(el);
    expect(menus(el)).to.have.lengthOf(1);
    press(el, 'ArrowDown');
    await settle(el);
    expect(active(el)).to.equal(null);
  });

  it('releases each menu\'s PositionController when the menu closes', async () => {
    // Was finding #56: _positionOpenMenus() creates a PositionController per
    // menu key and calls host.addController(), but on close it only did
    // _positions.delete(key) — never host.removeController(). Lit keeps its own
    // array, so every reopen accumulated one more controller for the life of
    // the element.
    // Counted through addController/removeController, which are public
    // ReactiveElement API — Lit's own `__controllers` is a declared-but-
    // undefined field until first use, so reading it reports nothing.
    const el = await menubar();
    let added = 0;
    let removed = 0;
    const realAdd = el.addController.bind(el);
    const realRemove = el.removeController.bind(el);
    el.addController = (c) => {
      added++;
      return realAdd(c);
    };
    el.removeController = (c) => {
      removed++;
      return realRemove(c);
    };

    for (let i = 0; i < 5; i++) {
      triggers(el)[0].click();
      await settle(el);
      triggers(el)[0].click();
      await settle(el);
      // One of the suite's few deliberate private-state assertions (see
      // HANDOFF's testing rules): a map that leaks entries has no rendered
      // consequence to assert instead — the claim is about the resource.
      expect(el._positions.size, 'the map itself is cleaned up correctly').to.equal(0);
    }

    // anti-vacuity: controllers really are being created, so the pairing below
    // is a balance rather than two zeroes
    expect(added, 'one new controller per open').to.equal(5);
    expect(removed, 'each released on close').to.equal(5);
  });
});
