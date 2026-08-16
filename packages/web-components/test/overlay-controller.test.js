/**
 * OverlayController — the modal behaviour layer, tested directly.
 *
 * Successor to overlay-mixin.test.js, and deliberately mostly the same file:
 * that suite said it asserted "the *contract* (Escape closes, the body is
 * locked, focus comes back) rather than the mechanism, and should survive the
 * move unchanged", and V4-PLAN 4.4 is the move it was written for. Most of it
 * did survive. What changed is recorded here rather than quietly dropped,
 * because "the test had to change" is the interesting half of a rewrite:
 *
 *  - **Escape** is no longer a keydown the library listens for. A modal
 *    `<dialog>` gets Escape from the user agent as a `cancel` event, and no
 *    dispatched KeyboardEvent produces one. Pressing a synthetic Escape at
 *    these components now asserts nothing, so the driver dispatches `cancel`.
 *  - **The Tab trap is gone**, and with it the two tests that drove it. They
 *    are replaced by the stronger property that made the trap redundant: the
 *    rest of the document is `inert`, which no Tab handler ever achieved.
 *  - **"does not steal focus already inside the panel"** described a real
 *    behaviour of the mixin and describes nothing now: a closed `<dialog>` is
 *    `display: none`, so nothing inside it can hold focus before it opens.
 *    `autofocus` is the supported way to say where focus should land, and that
 *    is what is asserted in its place.
 */
import { expect } from '@esm-bundle/chai';
import { LitElement, html } from 'lit';
import { mount, cleanup, settle, tick, deepActive } from './helpers.js';
import { OverlayController } from '../src/shared/overlay-controller.js';

class OverlayProbe extends LitElement {
  static properties = { open: { type: Boolean, reflect: true }, autofocusB: { type: Boolean } };

  constructor() {
    super();
    this.open = false;
    this.autofocusB = false;
    this.closed = 0;
    this._overlay = new OverlayController(this, {
      dialog: () => this.shadowRoot?.querySelector('dialog'),
      isOpen: () => this.open,
      onRequestClose: () => this._close(),
    });
  }

  _close() {
    this.closed += 1;
    this.open = false;
  }

  render() {
    return html`
      <dialog>
        <div class="panel">
          <button class="a">a</button>
          <button class="b" ?autofocus=${this.autofocusB}>b</button>
        </div>
      </dialog>
    `;
  }
}
if (!customElements.get('arc-overlay-probe')) {
  customElements.define('arc-overlay-probe', OverlayProbe);
}

afterEach(() => {
  cleanup();
  // The controller releases its lock on disconnect, so cleanup() covers the
  // normal path — this is belt and braces so one failing test cannot leave the
  // body unscrollable for the rest of the file.
  document.body.style.overflow = '';
});

/** A probe plus an outside button to own focus before it opens. */
async function fixture({ open = false, autofocusB = false } = {}) {
  const outside = mount('<button>outside</button>');
  const el = mount('<arc-overlay-probe></arc-overlay-probe>');
  el.autofocusB = autofocusB;
  await settle(el);
  if (open) {
    outside.focus();
    el.open = true;
    await settle(el);
    await tick();
  }
  return { el, outside, dialog: el.shadowRoot.querySelector('dialog') };
}

const buttons = (el) => [...el.shadowRoot.querySelectorAll('button')];

/** Escape, as the user agent delivers it to a modal dialog. */
function escape(el) {
  el.shadowRoot.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
}

// ---------------------------------------------------------------------------
// Escape
// ---------------------------------------------------------------------------

describe('OverlayController: Escape', () => {
  it('closes an open overlay', async () => {
    const { el } = await fixture({ open: true });
    escape(el);
    expect(el.closed).to.equal(1);
  });

  it('routes through the host rather than letting the browser close it', async () => {
    // The reason `cancel` is preventDefault-ed: whether Escape closes an
    // overlay is the component's policy. A host that declines has to be able
    // to, and a dialog that closed and reopened would flash.
    const { el, dialog } = await fixture({ open: true });
    el._close = () => {}; // a host that refuses
    escape(el);
    await settle(el);
    expect(dialog.open, 'the dialog is still in the top layer').to.equal(true);
  });

  it('does nothing before the overlay has ever opened', async () => {
    const { el } = await fixture();
    escape(el);
    expect(el.closed).to.equal(0);
  });

  it('stops responding once disconnected', async () => {
    const { el } = await fixture({ open: true });
    el.remove();
    escape(el);
    expect(el.closed).to.equal(0);
  });
});

// ---------------------------------------------------------------------------
// Inertness — what replaced the Tab trap
// ---------------------------------------------------------------------------

describe('OverlayController: the background is inert', () => {
  it('will not give focus to anything outside the overlay', async () => {
    // `trapTabKey` moved focus back when Tab would have left the panel, which
    // is a keyboard behaviour and only a keyboard behaviour. It did nothing
    // about a screen reader's virtual cursor or a click landing behind the
    // scrim. Modal `<dialog>` inerts the rest of the document, which is the
    // property the trap was an approximation of.
    const { el, outside } = await fixture({ open: true });
    outside.focus();
    expect(deepActive(), 'the outside button cannot take focus').to.not.equal(outside);
    expect(el.open).to.equal(true);
  });

  it('releases the rest of the document when it closes', async () => {
    const { el, outside } = await fixture({ open: true });
    el.open = false;
    await settle(el);
    await tick();

    outside.focus();
    expect(deepActive()).to.equal(outside);
  });
});

// ---------------------------------------------------------------------------
// The backdrop
// ---------------------------------------------------------------------------

describe('OverlayController: the backdrop', () => {
  it('closes when the scrim is clicked', async () => {
    // A click on ::backdrop is dispatched to the dialog element itself, which
    // is what makes `target === dialog` mean "outside the content".
    const { el, dialog } = await fixture({ open: true });
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(el.closed).to.equal(1);
  });

  it('does not close when the click lands inside the content', async () => {
    // target === currentTarget is the whole guard: without it every click in
    // the dialog closes it, because the click bubbles to the dialog element.
    const { el } = await fixture({ open: true });
    el.shadowRoot.querySelector('.panel').click();
    expect(el.closed).to.equal(0);
  });

  it('does not close when the click lands on a control inside', async () => {
    const { el } = await fixture({ open: true });
    buttons(el)[0].click();
    expect(el.closed).to.equal(0);
  });
});

// ---------------------------------------------------------------------------
// Scroll lock — still ours, because a modal dialog does not stop the page
// scrolling behind it
// ---------------------------------------------------------------------------

describe('OverlayController: scroll lock', () => {
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

  it('releases the lock when something closes the dialog directly', async () => {
    // A <form method="dialog"> submission, or a stray dialog.close().
    const { el, dialog } = await fixture({ open: true });
    dialog.close();
    await new Promise((r) => requestAnimationFrame(r));
    expect(document.body.style.overflow, 'not left locked by a close we did not initiate')
      .to.equal('');
  });
});

// ---------------------------------------------------------------------------
// Focus
// ---------------------------------------------------------------------------

describe('OverlayController: focus', () => {
  it('moves focus into the panel on open', async () => {
    const { el } = await fixture({ open: true });
    expect(deepActive() === buttons(el)[0]).to.equal(true);
  });

  it('honours autofocus over first-focusable', async () => {
    // The supported replacement for the mixin's "do not steal focus that is
    // already inside" branch. That branch existed so a command palette could
    // put the caret in its own search field; `autofocus` is how a component
    // says the same thing to the platform, and unlike the old branch it works
    // for a consumer's slotted content too.
    const { el } = await fixture({ open: true, autofocusB: true });
    expect(deepActive() === buttons(el)[1], 'focus went to the autofocus control').to.equal(true);
  });

  it('restores focus to where it came from on close', async () => {
    const { el, outside } = await fixture({ open: true });
    el.open = false;
    await settle(el);
    await tick();

    expect(deepActive() === outside).to.equal(true);
  });

  it('does not move focus on the initial render of a closed overlay', async () => {
    const outside = mount('<button>outside</button>');
    outside.focus();
    const el = mount('<arc-overlay-probe></arc-overlay-probe>');
    await settle(el);

    expect(deepActive() === outside, 'focus is left alone').to.equal(true);
    expect(el.open).to.equal(false);
  });

  it('survives the previously-focused element being removed', async () => {
    // A panel opened from a button in a list that re-renders while open: the
    // button is gone by the time the panel closes.
    const { el, outside } = await fixture({ open: true });
    outside.remove();

    el.open = false;
    await settle(el);
    expect(el.closed, 'closing still completed').to.equal(0);
    expect(deepActive() === outside, 'focus did not go to the detached node').to.equal(false);
  });
});

// ---------------------------------------------------------------------------
// Reconnection — findings #55, #64 and #72, still the same shape
// ---------------------------------------------------------------------------

describe('OverlayController: reconnection', () => {
  it('is still open and still locked across a reparent', async () => {
    // Moving an element closes any <dialog> inside it — the top layer belongs
    // to the connection — and changes no property, so nothing schedules the
    // update that would put it back. The mixin needed a connectedCallback
    // override for this; the controller has a hook.
    const { el } = await fixture({ open: true });
    const host = document.createElement('div');
    document.body.appendChild(host);

    el.remove();
    host.appendChild(el);
    await settle(el);
    await tick();

    expect(el.shadowRoot.querySelector('dialog').open, 'back in the top layer').to.equal(true);
    expect(document.body.style.overflow, 'still locked after the move').to.equal('hidden');

    escape(el);
    expect(el.closed, 'Escape still closes after the move').to.equal(1);
    host.remove();
  });

  it('does not arm an overlay that was closed when it moved', async () => {
    const { el } = await fixture();
    const host = document.createElement('div');
    document.body.appendChild(host);

    el.remove();
    host.appendChild(el);
    await settle(el);
    await tick();

    expect(document.body.style.overflow, 'a closed overlay locks nothing').to.equal('');
    expect(el.shadowRoot.querySelector('dialog').open).to.equal(false);
    host.remove();
  });
});
