/**
 * OverlayMixin — the modal behaviour layer, tested directly.
 *
 * Five components consume it (modal, sheet, drawer, lightbox,
 * command-palette) and it had no suite of its own: Escape, the focus trap, the
 * scroll lock and focus restore were each covered only incidentally, by
 * whichever consumer's tests happened to press Escape.
 *
 * The mixin does all of its arming from an `updated()` override keyed on
 * `changed.has('open')` — the exact pattern `props.js`'s docstring rejects, and
 * V4-PLAN 4.4 already schedules its move onto the controller pattern. This
 * suite is what makes that rework safe, so it asserts the *contract* (Escape
 * closes, the body is locked, focus comes back) rather than the mechanism, and
 * should survive the move unchanged.
 */
import { expect } from '@esm-bundle/chai';
import { LitElement, html } from 'lit';
import { mount, cleanup, settle, tick, pressKey, deepActive } from './helpers.js';
import { OverlayMixin } from '../src/shared/overlay-mixin.js';

class OverlayProbe extends OverlayMixin(LitElement) {
  static properties = { open: { type: Boolean, reflect: true } };

  constructor() {
    super();
    this.open = false;
    this.closed = 0;
  }

  _close() {
    this.closed += 1;
    this.open = false;
  }

  render() {
    return html`
      <div class="backdrop" @click=${this._handleBackdropClick}>
        <div role="dialog">
          <button class="a">a</button>
          <button class="b">b</button>
        </div>
      </div>
    `;
  }
}
if (!customElements.get('arc-overlay-probe')) {
  customElements.define('arc-overlay-probe', OverlayProbe);
}

afterEach(() => {
  cleanup();
  // The mixin releases its lock on disconnect, so cleanup() covers the normal
  // path — this is belt and braces so one failing test cannot leave the body
  // unscrollable for the rest of the file.
  document.body.style.overflow = '';
});

/** A probe plus an outside button to own focus before it opens. */
async function fixture({ open = false } = {}) {
  const outside = mount('<button>outside</button>');
  const el = mount('<arc-overlay-probe></arc-overlay-probe>');
  await settle(el);
  if (open) {
    outside.focus();
    el.open = true;
    await settle(el);
    await tick();
  }
  return { el, outside, panel: el.shadowRoot.querySelector('[role="dialog"]') };
}

const buttons = (el) => [...el.shadowRoot.querySelectorAll('button')];

// ---------------------------------------------------------------------------
// Escape
// ---------------------------------------------------------------------------

describe('OverlayMixin: Escape', () => {
  it('closes an open overlay', async () => {
    const { el } = await fixture({ open: true });
    pressKey('Escape');
    expect(el.closed).to.equal(1);
  });

  it('does nothing before the overlay has ever opened', async () => {
    const { el } = await fixture();
    pressKey('Escape');
    expect(el.closed).to.equal(0);
  });

  it('stops listening once closed', async () => {
    // A document-level keydown that outlives the overlay would close it again
    // from anywhere on the page, and there are five of these.
    const { el } = await fixture({ open: true });
    el.open = false;
    await settle(el);

    pressKey('Escape');
    expect(el.closed, 'no _close from a closed overlay').to.equal(0);
  });

  it('stops listening once disconnected', async () => {
    const { el } = await fixture({ open: true });
    el.remove();

    pressKey('Escape');
    expect(el.closed).to.equal(0);
  });
});

// ---------------------------------------------------------------------------
// Tab
// ---------------------------------------------------------------------------

describe('OverlayMixin: Tab', () => {
  it('wraps focus inside the panel', async () => {
    const { el } = await fixture({ open: true });
    const [a, b] = buttons(el);
    b.focus();

    pressKey('Tab');
    expect(deepActive() === a, 'Tab past the last control wraps to the first').to.equal(true);
  });

  it('wraps backward too', async () => {
    const { el } = await fixture({ open: true });
    const [a, b] = buttons(el);
    a.focus();

    pressKey('Tab', { shiftKey: true });
    expect(deepActive() === b).to.equal(true);
  });
});

// ---------------------------------------------------------------------------
// The backdrop
// ---------------------------------------------------------------------------

describe('OverlayMixin: the backdrop', () => {
  it('closes when the backdrop itself is clicked', async () => {
    const { el } = await fixture({ open: true });
    el.shadowRoot.querySelector('.backdrop').click();
    expect(el.closed).to.equal(1);
  });

  it('does not close when the click lands on the panel', async () => {
    // e.target === e.currentTarget is the whole guard: without it, every click
    // inside the dialog closes it, because the click bubbles to the backdrop.
    const { el, panel } = await fixture({ open: true });
    panel.click();
    expect(el.closed).to.equal(0);
  });

  it('does not close when the click lands on a control inside the panel', async () => {
    const { el } = await fixture({ open: true });
    buttons(el)[0].click();
    expect(el.closed).to.equal(0);
  });
});

// ---------------------------------------------------------------------------
// Scroll lock
// ---------------------------------------------------------------------------

describe('OverlayMixin: scroll lock', () => {
  it('locks the body while open and releases it on close', async () => {
    const { el } = await fixture({ open: true });
    expect(document.body.style.overflow, 'locked while open').to.equal('hidden');

    el.open = false;
    await settle(el);
    expect(document.body.style.overflow, 'released on close').to.equal('');
  });

  it('releases the lock when the overlay is removed while open', async () => {
    // Otherwise a route change that unmounts an open modal leaves the page
    // permanently unscrollable.
    const { el } = await fixture({ open: true });
    el.remove();
    expect(document.body.style.overflow).to.equal('');
  });
});

// ---------------------------------------------------------------------------
// Focus
// ---------------------------------------------------------------------------

describe('OverlayMixin: focus', () => {
  it('moves focus into the panel on open', async () => {
    const { el } = await fixture({ open: true });
    expect(deepActive() === buttons(el)[0]).to.equal(true);
  });

  it('does not steal focus that is already inside the panel', async () => {
    // The `!panel.contains(deepActiveElement())` half. A component that focuses
    // its own control as it opens — a command palette putting the caret in its
    // search field — must not have that overruled by the mixin's generic
    // "focus the first thing". Found by mutation: without this the condition
    // could be flipped to always-focus and every existing test still passed.
    const el = mount('<arc-overlay-probe></arc-overlay-probe>');
    await settle(el);
    const [, b] = buttons(el);

    b.focus();
    el.open = true;
    await settle(el);
    await tick();

    expect(deepActive() === b, 'focus stayed where the component put it').to.equal(true);
  });

  it('restores focus to where it came from on close', async () => {
    const { el, outside } = await fixture({ open: true });
    el.open = false;
    await settle(el);

    expect(deepActive() === outside).to.equal(true);
  });

  it('does not restore focus on the initial render of a closed overlay', async () => {
    // changed.has('open') is true on first update even for `open = false`, so
    // without the changed.get('open') guard the else-branch would run its
    // restore path on every overlay on the page at mount time.
    const outside = mount('<button>outside</button>');
    outside.focus();
    const el = mount('<arc-overlay-probe></arc-overlay-probe>');
    await settle(el);

    expect(deepActive() === outside, 'focus is left alone').to.equal(true);
  });

  it('survives the previously-focused element being removed', async () => {
    // A panel opened from a button in a list that re-renders while open: the
    // button is gone by the time the panel closes, and .focus() on a
    // disconnected node silently sends focus to <body>.
    const { el, outside } = await fixture({ open: true });
    outside.remove();

    el.open = false;
    await settle(el);
    expect(el.closed, 'closing still completed').to.equal(0);
    expect(deepActive() === outside, 'focus did not go to the detached node').to.equal(false);
  });
});

// ---------------------------------------------------------------------------
// Reconnection — findings #55, #64 and #72, now in the overlay layer
// ---------------------------------------------------------------------------

describe('OverlayMixin: reconnection', () => {
  it('keeps Escape and the scroll lock across a reparent', async () => {
    // disconnectedCallback tears both down, and the only thing that puts them
    // back is updated() keyed on an `open` *change* — which a reparent is not.
    // So an open modal moved in the DOM came back scrollable behind and deaf
    // to Escape, while still looking exactly like a modal.
    const { el } = await fixture({ open: true });
    const host = document.createElement('div');
    document.body.appendChild(host);

    el.remove();
    host.appendChild(el);
    await settle(el);

    expect(document.body.style.overflow, 'still locked after the move').to.equal('hidden');

    pressKey('Escape');
    expect(el.closed, 'Escape still closes after the move').to.equal(1);
  });

  it('does not arm an overlay that was closed when it moved', async () => {
    const { el } = await fixture();
    const host = document.createElement('div');
    document.body.appendChild(host);

    el.remove();
    host.appendChild(el);
    await settle(el);

    expect(document.body.style.overflow, 'a closed overlay locks nothing').to.equal('');
    pressKey('Escape');
    expect(el.closed).to.equal(0);
  });
});
