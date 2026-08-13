/**
 * MenuKeyboardController — Arrow/Home/End/Enter/Space/Escape for menu-like
 * components, tested directly.
 *
 * Three consumers (dropdown-menu, command-palette, toolbar), and the
 * interesting half of the contract is what it does **not** handle: two of the
 * three put a text input in the same overlay, so Home, End and Space have to
 * defer to the caret when the key came from a field and act on the menu when it
 * did not. That branch is per-key, and it was untested.
 */
import { expect } from '@esm-bundle/chai';
import { LitElement, html } from 'lit';
import { mount, cleanup, settle, pressKey } from './helpers.js';
import { MenuKeyboardController } from '../src/shared/menu-keyboard.js';

afterEach(cleanup);

class MenuProbe extends LitElement {
  constructor() {
    super();
    this.items = 3;
    this.selected = [];
    this.closed = 0;
  }

  install() {
    this._kb = new MenuKeyboardController(this, {
      getItemCount: () => this.items,
      onSelect: (i) => this.selected.push(i),
      onClose: () => {
        this.closed += 1;
      },
    });
    return this._kb;
  }

  render() {
    return html`<input class="search" type="text" />`;
  }
}
if (!customElements.get('arc-menu-probe')) customElements.define('arc-menu-probe', MenuProbe);

async function fixture({ items = 3, attach = true } = {}) {
  const el = mount('<arc-menu-probe></arc-menu-probe>');
  await settle(el);
  el.items = items;
  const kb = el.install();
  if (attach) kb.attach();
  return { el, kb, search: el.shadowRoot.querySelector('.search') };
}

/** A key press originating in a text field, which is what the guards read. */
function typeKey(search, key, init = {}) {
  search.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      composed: true,
      cancelable: true,
      ...init,
    })
  );
}

// ---------------------------------------------------------------------------
// Escape
// ---------------------------------------------------------------------------

describe('MenuKeyboardController: Escape', () => {
  it('closes', async () => {
    const { el } = await fixture();
    pressKey('Escape');
    expect(el.closed).to.equal(1);
  });

  it('closes even with no items at all', async () => {
    // Checked before the count guard on purpose: a search with zero matches is
    // exactly when the user reaches for Escape, and it is the one state where
    // the menu has nothing to navigate.
    const { el } = await fixture({ items: 0 });
    pressKey('Escape');
    expect(el.closed).to.equal(1);
  });

  it('closes even from inside the search field', async () => {
    const { el, search } = await fixture();
    typeKey(search, 'Escape');
    expect(el.closed).to.equal(1);
  });
});

// ---------------------------------------------------------------------------
// Arrow navigation and its wrapping
// ---------------------------------------------------------------------------

describe('MenuKeyboardController: arrows', () => {
  it('ArrowDown enters the menu at the first item', async () => {
    const { kb } = await fixture();
    pressKey('ArrowDown');
    expect(kb.focusedIndex).to.equal(0);
  });

  it('ArrowDown wraps from the last item to the first', async () => {
    const { kb } = await fixture();
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    expect(kb.focusedIndex, 'on the last item').to.equal(2);

    pressKey('ArrowDown');
    expect(kb.focusedIndex).to.equal(0);
  });

  it('ArrowUp enters the menu at the last item', async () => {
    // Both ends of the same ternary: from -1 it must reach the end, which is a
    // different branch from stepping back off item 0.
    const { kb } = await fixture();
    pressKey('ArrowUp');
    expect(kb.focusedIndex).to.equal(2);
  });

  it('ArrowUp wraps from the first item to the last', async () => {
    const { kb } = await fixture();
    pressKey('ArrowDown');
    expect(kb.focusedIndex).to.equal(0);

    pressKey('ArrowUp');
    expect(kb.focusedIndex).to.equal(2);
  });

  it('arrows still navigate when the key came from the search field', async () => {
    // The whole point of a command palette: type to filter, arrow to choose,
    // without ever leaving the input.
    const { kb, search } = await fixture();
    typeKey(search, 'ArrowDown');
    expect(kb.focusedIndex).to.equal(0);
  });

  it('does nothing when there are no items', async () => {
    const { kb } = await fixture({ items: 0 });
    pressKey('ArrowDown');
    pressKey('ArrowUp');
    expect(kb.focusedIndex).to.equal(-1);
  });

  it('claims the key so the page does not scroll', async () => {
    const { search } = await fixture();
    const e = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    search.dispatchEvent(e);
    expect(e.defaultPrevented).to.equal(true);
  });
});

// ---------------------------------------------------------------------------
// Home / End — the caret branch
// ---------------------------------------------------------------------------

describe('MenuKeyboardController: Home and End', () => {
  it('Home jumps to the first item', async () => {
    const { kb } = await fixture();
    pressKey('End');
    pressKey('Home');
    expect(kb.focusedIndex).to.equal(0);
  });

  it('End jumps to the last item', async () => {
    const { kb } = await fixture();
    pressKey('End');
    expect(kb.focusedIndex).to.equal(2);
  });

  it('Home from the search field moves the caret, not the menu', async () => {
    const { kb, search } = await fixture();
    pressKey('End');
    expect(kb.focusedIndex, 'parked on the last item').to.equal(2);

    const e = new KeyboardEvent('keydown', {
      key: 'Home',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    search.dispatchEvent(e);

    expect(kb.focusedIndex, 'the menu did not move').to.equal(2);
    expect(e.defaultPrevented, 'and the input keeps the key').to.equal(false);
  });

  it('End from the search field moves the caret, not the menu', async () => {
    const { kb, search } = await fixture();
    pressKey('ArrowDown');
    expect(kb.focusedIndex).to.equal(0);

    const e = new KeyboardEvent('keydown', {
      key: 'End',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    search.dispatchEvent(e);

    expect(kb.focusedIndex).to.equal(0);
    expect(e.defaultPrevented).to.equal(false);
  });
});

// ---------------------------------------------------------------------------
// Enter and Space
// ---------------------------------------------------------------------------

describe('MenuKeyboardController: activation', () => {
  it('Enter selects the focused item', async () => {
    const { el } = await fixture();
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    pressKey('Enter');
    expect(el.selected).to.eql([1]);
  });

  it('Enter with nothing focused selects nothing', async () => {
    // focusedIndex is -1 until the user has actually arrowed into the menu, and
    // Enter there belongs to whatever has focus — the search field's own submit.
    const { el } = await fixture();
    pressKey('Enter');
    expect(el.selected).to.eql([]);
  });

  it('Enter selects even from the search field', async () => {
    const { el, search } = await fixture();
    pressKey('ArrowDown');
    typeKey(search, 'Enter');
    expect(el.selected).to.eql([0]);
  });

  it('Space selects when the key did not come from a field', async () => {
    const { el } = await fixture();
    pressKey('ArrowDown');
    pressKey(' ');
    expect(el.selected).to.eql([0]);
  });

  it('Space from the search field types a space instead', async () => {
    // Without this branch the palette becomes unable to search for two words.
    const { el, search } = await fixture();
    pressKey('ArrowDown');

    const e = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    search.dispatchEvent(e);

    expect(el.selected, 'nothing was activated').to.eql([]);
    expect(e.defaultPrevented, 'the space reaches the input').to.equal(false);
  });
});

// ---------------------------------------------------------------------------
// attach / detach / reset
// ---------------------------------------------------------------------------

describe('MenuKeyboardController: attachment', () => {
  it('is inert until attached', async () => {
    const { el, kb } = await fixture({ attach: false });
    pressKey('Escape');
    pressKey('ArrowDown');
    expect(el.closed).to.equal(0);
    expect(kb.focusedIndex).to.equal(-1);
  });

  it('detach stops listening and forgets the position', async () => {
    const { el, kb } = await fixture();
    pressKey('ArrowDown');
    kb.detach();

    pressKey('ArrowDown');
    pressKey('Escape');
    expect(kb.focusedIndex, 'reopening starts from the top').to.equal(-1);
    expect(el.closed).to.equal(0);
  });

  it('reset clears the position without detaching', async () => {
    const { kb } = await fixture();
    pressKey('ArrowDown');
    kb.reset();
    expect(kb.focusedIndex).to.equal(-1);

    pressKey('ArrowDown');
    expect(kb.focusedIndex, 'still listening').to.equal(0);
  });

  it('stops listening when the host disconnects', async () => {
    // Only the listener is asserted, not the index: a disconnect may be a
    // reparent, and the position is deliberately carried across one so the
    // user does not lose their place mid-navigation. `detach()` still clears
    // it, because closing a menu genuinely should forget where you were —
    // that is the test above.
    const { el, kb } = await fixture();
    pressKey('ArrowDown');
    el.remove();

    pressKey('Escape');
    pressKey('ArrowDown');
    expect(el.closed, 'no keys answered while disconnected').to.equal(0);
    expect(kb.focusedIndex, 'and none acted on').to.equal(0);
  });
});

// ---------------------------------------------------------------------------
// Reconnection — findings #72 and #73, a third time in the same layer
// ---------------------------------------------------------------------------

describe('MenuKeyboardController: reconnection', () => {
  it('re-attaches after the host is reparented while open', async () => {
    // All three consumers attach from updated() keyed on an open-state change
    // (dropdown-menu:184, command-palette:478, toolbar:227), so a reparent —
    // which changes nothing — left an open menu that still rendered and no
    // longer answered a single key.
    const { el, kb } = await fixture();
    pressKey('ArrowDown');
    expect(kb.focusedIndex).to.equal(0);

    const host = document.createElement('div');
    document.body.appendChild(host);
    el.remove();
    host.appendChild(el);
    await settle(el);

    pressKey('ArrowDown');
    expect(kb.focusedIndex, 'the keyboard survived the move').to.equal(1);

    pressKey('Escape');
    expect(el.closed).to.equal(1);
  });

  it('does not re-attach one that was explicitly detached first', async () => {
    // Distinct from the never-attached case below: this one exercises the flag
    // that detach() clears. A closed menu that is then reparented must stay
    // closed — otherwise every DOM move re-arms every menu on the page.
    const { el, kb } = await fixture();
    pressKey('ArrowDown');
    kb.detach();

    const host = document.createElement('div');
    document.body.appendChild(host);
    el.remove();
    host.appendChild(el);
    await settle(el);

    pressKey('Escape');
    pressKey('ArrowDown');
    expect(el.closed, 'a detached menu stays detached across a move').to.equal(0);
    expect(kb.focusedIndex).to.equal(-1);
  });

  it('does not attach a controller that was never attached at all', async () => {
    const { el, kb } = await fixture({ attach: false });
    const host = document.createElement('div');
    document.body.appendChild(host);
    el.remove();
    host.appendChild(el);
    await settle(el);

    pressKey('Escape');
    expect(el.closed).to.equal(0);
    expect(kb.focusedIndex).to.equal(-1);
  });
});
