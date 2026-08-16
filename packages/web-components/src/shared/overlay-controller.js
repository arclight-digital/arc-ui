import { lockScroll, unlockScroll } from './scroll-lock.js';

/**
 * OverlayController — a modal overlay on the platform's `<dialog>`.
 *
 * Replaces `OverlayMixin`, and V4-PLAN 4.4 makes the change for two separate
 * reasons that happen to have the same fix.
 *
 * ## The mechanism reason
 *
 * The mixin did its work in an `updated()` override — the exact pattern
 * `props.js`'s docstring rejects, and for the reason recorded there: a hook
 * only runs if every component overriding the same method remembers to call
 * `super`. It also could not see a reparent, because moving an element changes
 * no property and schedules no update, so `connectedCallback` had to re-arm by
 * hand (finding #73, and #55/#64/#72 before it). A controller's hooks run
 * regardless of what the host overrides, and `hostConnected` is not a special
 * case bolted on afterwards.
 *
 * ## The platform reason, which is the larger one
 *
 * Five components hand-rolled what a modal `<dialog>` does natively, and every
 * one of those hand-rolled pieces has a failure mode the platform does not:
 *
 * | hand-rolled                        | what `showModal()` gives                |
 * | ---------------------------------- | --------------------------------------- |
 * | `trapTabKey` on a keydown listener | the background is genuinely inert — not |
 * |                                    | just untabbable, but unclickable and    |
 * |                                    | unreachable by a screen reader's own    |
 * |                                    | navigation, which a Tab trap never was  |
 * | `focusFirst(panel)`                | focus placed per spec, honouring        |
 * |                                    | `autofocus`, delegatesFocus and slotted |
 * |                                    | content                                 |
 * | `__previousFocus` + restore        | restored by the browser, and correctly  |
 * |                                    | when the previous element has since     |
 * |                                    | moved or been re-rendered               |
 * | `Escape` on a document listener    | the `cancel` event, which cannot be     |
 * |                                    | missed by a stopped-propagation keydown |
 * | `z-index: var(--z-modal)`          | the top layer: no stacking context, no  |
 * |                                    | `overflow: hidden` ancestor, no ladder  |
 *
 * The Tab-trap row is the one worth reading twice. `trapTabKey` moved focus
 * back into the panel when Tab would have left it, which is a *keyboard*
 * behaviour; it did nothing about a screen reader user browsing the background
 * with virtual-cursor keys, or about a click landing on a button behind the
 * scrim. `inert` is what makes those true, and modal `<dialog>` applies it to
 * everything else in the document without the library maintaining a list.
 *
 * ## What is still ours
 *
 * **Scroll lock.** A modal dialog blocks interaction with the page behind it
 * but does not stop it scrolling, so `scroll-lock.js` stays, per-owner as
 * before.
 *
 * **The dismissal decision.** `cancel` is preventDefault-ed and routed to the
 * host's `onRequestClose` rather than allowed to close the dialog, because
 * whether Escape closes an overlay is the component's policy: `arc-modal`
 * refuses when `dismissible` is false, and every consumer can veto through the
 * cancelable `arc-close` event. Letting the browser close it and reopening
 * afterwards would flash.
 *
 * ## Usage
 *
 *     this._overlay = new OverlayController(this, {
 *       dialog: () => this.shadowRoot?.querySelector('dialog'),
 *       isOpen: () => this.open,
 *       onRequestClose: () => this._close(),
 *     });
 *
 * The host renders a `<dialog>` and nothing else about opening: no `open`
 * attribute in the template, no `showModal` call. The controller reconciles
 * after every render, which is also what makes it correct across a reparent.
 */
export class OverlayController {
  /**
   * @param {import('lit').ReactiveElement} host
   * @param {object} opts
   * @param {() => HTMLDialogElement | null | undefined} opts.dialog
   * @param {() => boolean} opts.isOpen - The host's own open state.
   * @param {() => void} opts.onRequestClose - Called for Escape and backdrop
   *   click. The host decides whether that actually closes anything.
   * @param {boolean} [opts.lightDismiss=true] - Whether a click on the backdrop
   *   requests a close. `arc-lightbox` and the menus want it; a form dialog
   *   that sets `dismissible=false` gets it filtered by its own `_close`.
   */
  constructor(host, opts) {
    this.host = host;
    this.opts = opts;
    this._locked = false;
    this._onCancel = this._onCancel.bind(this);
    this._onClose = this._onClose.bind(this);
    this._onClick = this._onClick.bind(this);
    this._bound = null;
    host.addController(this);
  }

  /**
   * Reconcile after every render.
   *
   * Every render rather than on an `open` change, because the dialog element
   * itself can be replaced by a re-render while `open` never changes, and a
   * fresh `<dialog>` is closed no matter what the host thinks. Both calls
   * below are no-ops when the state already matches, so the common case costs
   * two property reads.
   */
  hostUpdated() {
    const dialog = this.opts.dialog();
    if (!dialog) return;
    this._bind(dialog);
    this.opts.isOpen() ? this._show(dialog) : this._hide(dialog);
  }

  /**
   * Reopen after a reparent.
   *
   * Moving an element in the DOM closes any `<dialog>` inside it — the top
   * layer is a property of the connection, not of the element — and changes no
   * property, so nothing would schedule the update that `hostUpdated` needs.
   * This is the same finding (#73) the mixin's `connectedCallback` was added
   * for, and it is still a real case; what changed is that the controller has a
   * hook for it rather than an override.
   */
  hostConnected() {
    // After the host's own connection work, and after the browser has finished
    // the move: `showModal()` on an element mid-reparent throws.
    this.host.updateComplete?.then(() => {
      const dialog = this.opts.dialog();
      if (!dialog) return;
      // Rebinding matters as much as reshowing, and is easy to miss: a reparent
      // runs `hostDisconnected`, which removes the listeners, and schedules no
      // update — so without this the overlay came back on screen and in the top
      // layer while Escape and backdrop clicks did nothing. Same shape as the
      // finding that put this hook here in the first place.
      this._bind(dialog);
      if (this.opts.isOpen()) this._show(dialog);
    });
  }

  hostDisconnected() {
    const dialog = this._bound;
    if (dialog) {
      dialog.removeEventListener('cancel', this._onCancel);
      dialog.removeEventListener('close', this._onClose);
      dialog.removeEventListener('click', this._onClick);
      this._bound = null;
    }
    this._unlock();
  }

  _bind(dialog) {
    if (this._bound === dialog) return;
    if (this._bound) {
      this._bound.removeEventListener('cancel', this._onCancel);
      this._bound.removeEventListener('close', this._onClose);
      this._bound.removeEventListener('click', this._onClick);
    }
    dialog.addEventListener('cancel', this._onCancel);
    dialog.addEventListener('close', this._onClose);
    dialog.addEventListener('click', this._onClick);
    this._bound = dialog;
  }

  _show(dialog) {
    if (!dialog.open) {
      // Throws when the element is disconnected or already in the top layer;
      // both are races with a host closing mid-frame, and the next render
      // reconciles.
      try {
        dialog.showModal();
      } catch {
        return;
      }
    }
    this._lock();
  }

  _hide(dialog) {
    // `close()` on an already-closed dialog fires a second `close` event in
    // some engines, so the guard is behavioural rather than cosmetic.
    if (dialog.open) dialog.close();
    this._unlock();
  }

  _lock() {
    if (this._locked) return;
    lockScroll(this.host);
    this._locked = true;
  }

  _unlock() {
    if (!this._locked) return;
    unlockScroll(this.host);
    this._locked = false;
  }

  /** Escape. The browser would close it; the component decides instead. */
  _onCancel(e) {
    // A `cancel` on a dialog that is not open cannot come from the user agent —
    // it only fires Escape at a dialog in the top layer — so it is either a
    // stray dispatch or a race with a close already in flight. Either way there
    // is nothing to dismiss, and acting would close whatever opens next.
    if (!this._bound?.open) return;
    e.preventDefault();
    this.opts.onRequestClose();
  }

  /**
   * The dialog closed without going through the host — `dialog.close()` called
   * directly, or a `<form method="dialog">` submission inside it.
   *
   * Reconciling the host's `open` rather than reopening: the dialog is already
   * out of the top layer, so the honest reading is that it closed, and leaving
   * `open` true would make the property lie until the next unrelated render.
   */
  _onClose() {
    this._unlock();
    if (this.opts.isOpen()) this.opts.onRequestClose();
  }

  /**
   * Backdrop click.
   *
   * A click on `::backdrop` is dispatched to the `<dialog>` element itself, so
   * `target === dialog` is exactly "outside the content" — provided the dialog
   * has no padding of its own, which is why every consumer puts its padding on
   * the sections inside. Cheaper and more reliable than comparing pointer
   * coordinates against `getBoundingClientRect()`, which reads the animated box
   * mid-transition.
   */
  _onClick(e) {
    if (this.opts.lightDismiss === false) return;
    if (e.target === this._bound) this.opts.onRequestClose();
  }
}
