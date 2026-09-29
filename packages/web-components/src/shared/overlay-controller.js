import { lockScroll, unlockScroll } from './scroll-lock.js';
import { deepActiveElement } from './focus-trap.js';

/**
 * OverlayController: a modal overlay on the platform's `<dialog>`.
 *
 * Replaces `OverlayMixin`, and V4-PLAN 4.4 makes the change for two separate
 * reasons that happen to have the same fix.
 *
 * ## The mechanism reason
 *
 * The mixin did its work in an `updated()` override: the exact pattern
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
 * | `trapTabKey` on a keydown listener | the background is genuinely inert:      |
 * |                                    | untabbable, and also unclickable and    |
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
 *
 * ## Non-modal
 *
 * With `modal: () => false` the host renders a `<div popover="manual"
 * role="dialog">` instead of a `<dialog>`, and the controller opens it with
 * `showPopover()`. That keeps it in the top layer, above everything with no
 * z-index, while the page behind stays live: nothing is inert, nothing is
 * scroll-locked, and there is no backdrop (test-findings #112).
 *
 * A popover `<dialog>` was tried first and does not work. `showPopover()` on a
 * dialog runs the dialog focusing steps and pulls focus into it, and so does
 * `show()`. The agreed behaviour is the opposite: opening a non-modal sheet
 * leaves focus where it was, so a peek strip never interrupts someone reading
 * or typing on the page. A `<div>` popover does that. It moves focus only for
 * an `autofocus` descendant, which is the consumer asking for it.
 *
 * What the platform then no longer does is ours: Escape, only while focus is
 * inside the panel (a key press on the page is the page's), and returning
 * focus on close when it was inside, since a hidden popover drops it on the
 * document. Light dismiss does not apply: a click on the page is a click on
 * the page.
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
    this._opener = null;
    this._onCancel = this._onCancel.bind(this);
    this._onClose = this._onClose.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
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
    // A host that changed modality re-rendered its panel as the other element.
    // Rebinding moves the listeners, and _showNonModal releases a modal's lock.
    this._bind(dialog);
    this.opts.isOpen() ? this._show(dialog) : this._hide(dialog);
  }

  /**
   * Reopen after a reparent.
   *
   * Moving an element in the DOM closes any `<dialog>` inside it (the top
   * layer is a property of the connection, not of the element) and changes no
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
      // update, so without this the overlay came back on screen and in the top
      // layer while Escape and backdrop clicks did nothing. Same shape as the
      // finding that put this hook here in the first place.
      this._bind(dialog);
      if (this.opts.isOpen()) this._show(dialog);
    });
  }

  hostDisconnected() {
    if (this._bound) this._unbind(this._bound);
    this._bound = null;
    this._unlock();
  }

  _unbind(panel) {
    panel.removeEventListener('cancel', this._onCancel);
    panel.removeEventListener('close', this._onClose);
    panel.removeEventListener('click', this._onClick);
    panel.removeEventListener('keydown', this._onKeydown);
  }

  _bind(dialog) {
    if (this._bound === dialog) return;
    if (this._bound) this._unbind(this._bound);
    dialog.addEventListener('cancel', this._onCancel);
    dialog.addEventListener('close', this._onClose);
    dialog.addEventListener('click', this._onClick);
    dialog.addEventListener('keydown', this._onKeydown);
    this._bound = dialog;
  }

  _show(dialog) {
    if (dialog.localName !== 'dialog') {
      this._showNonModal(dialog);
      return;
    }
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
    if (dialog.localName !== 'dialog') {
      this._hideNonModal(dialog);
      return;
    }
    // `close()` on an already-closed dialog fires a second `close` event in
    // some engines, so the guard is behavioural rather than cosmetic.
    if (dialog.open) dialog.close();
    this._unlock();
  }

  /** Top layer, page left live, focus left where it is. See the class notes. */
  _showNonModal(panel) {
    // A host switched from modal while open: a modal's lock must not outlive it.
    this._unlock();
    if (panel.matches(':popover-open')) return;
    this._opener = deepActiveElement();
    try {
      panel.showPopover();
    } catch {
      // Disconnected mid-frame; the next render reconciles.
    }
  }

  _hideNonModal(panel) {
    if (!panel.matches(':popover-open')) return;
    // Closing with focus inside would leave it on the document. Hand it back to
    // wherever it was before the panel had it, if that is still on the page.
    const active = deepActiveElement();
    const inside = !!active && this._inHost(active);
    try {
      panel.hidePopover();
    } catch {
      // Already gone; nothing to hide.
    }
    if (inside && this._opener?.isConnected && !this._inHost(this._opener)) {
      this._opener.focus({ preventScroll: true });
    }
    this._opener = null;
  }

  /**
   * Whether a node is the host or anywhere inside it: its light DOM, its shadow
   * root, and shadow roots nested inside those. `contains()` stops at a shadow
   * boundary, so focus on the panel's own close button (inside arc-icon-button's
   * shadow root) read as outside, and closing from it dropped focus on the
   * document. The mutation gate found it.
   */
  _inHost(node) {
    for (let n = node; n; n = n.parentNode ?? n.host) {
      if (n === this.host) return true;
    }
    return false;
  }

  /**
   * Escape, for a non-modal panel only: a modal one gets the dialog's `cancel`.
   * Only while focus is inside, which is what a keydown reaching the panel
   * means; a key press on the page never gets here.
   */
  _onKeydown(e) {
    if (this._bound?.localName === 'dialog') return;
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    e.preventDefault();
    this.opts.onRequestClose();
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
    // A `cancel` on a dialog that is not open cannot come from the user agent:
    // it only fires Escape at a dialog in the top layer, so it is either a
    // stray dispatch or a race with a close already in flight. Either way there
    // is nothing to dismiss, and acting would close whatever opens next.
    if (!this._bound?.open) return;
    e.preventDefault();
    this.opts.onRequestClose();
  }

  /**
   * The dialog closed without going through the host: `dialog.close()` called
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
   * `target === dialog` is exactly "outside the content", provided the dialog
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
