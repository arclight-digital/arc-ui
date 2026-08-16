/**
 * DismissController — shared reactive controller for "the user has left".
 *
 * Was `ClickOutsideController`, and the rename is the point of finding #60. An
 * overlay is abandoned in two ways, not one:
 *
 *   - a pointer lands somewhere else
 *   - focus moves somewhere else
 *
 * The old controller answered only the first, by name and by design. Six
 * components built on it, and the three that *open on focus* — arc-multi-select,
 * arc-combobox, arc-tag-input — never closed for a keyboard user at all: tab
 * away and the dropdown stayed open over the rest of the page, with the control
 * still wearing its focus ring. Nobody noticed because the pointer path, the one
 * you test by hand, worked perfectly.
 *
 * That is the same shape as finding #55: a shared layer covering part of a
 * lifecycle, and every consumer inheriting the gap. So the fix is here rather
 * than an `@focusout` handler in each component — and both halves are on by
 * default, because the failure mode was precisely that a component *believed* it
 * had dismissal handled.
 *
 *   this._dismiss = new DismissController(this, {
 *     onDismiss: () => this._close(),
 *     when: () => this._open,          // optional; checked per event
 *   });
 *   // in updated(): open ? this._dismiss.activate() : this._dismiss.deactivate()
 *
 * ## Why pointerdown, and why no requestAnimationFrame
 *
 * Components that hand-rolled this listened for `click` and had to defer the
 * subscription by a frame, or the very click that opened them closed them again.
 * pointerdown avoids that entirely: a click-triggered open happens on pointerup,
 * so by the time the listener exists the opening gesture is already over and the
 * next pointerdown is a genuinely new interaction.
 *
 * ## focusout has two cases, and only one of them is an answer
 *
 * When `relatedTarget` is a real element, focus genuinely moved and it says
 * exactly where — decide immediately.
 *
 * When it is **null**, nothing has been decided yet, and the naive reading of
 * that as "the user left" is wrong in both directions at once:
 *
 *   - **A re-render destroyed the focused node.** These panels rebuild their own
 *     contents constantly — arc-date-picker switching from days to months throws
 *     away the button you just clicked — so focus falls to `<body>` for an
 *     instant before the component puts it back. Dismissing there closes the
 *     panel on its own navigation. This is not hypothetical: it broke 16 tests
 *     across date-picker, date-range-picker and menubar the first time this
 *     controller shipped with a synchronous null check.
 *   - **The window lost focus.** Alt-tab or devtools fires focusout with a null
 *     `relatedTarget` while `document.activeElement` stays put, so every open
 *     panel would collapse on blur and still be collapsed on return.
 *
 * Both were tried and rejected as guesses. Deferring a task and re-reading
 * `document.activeElement` fixes the window-blur case and *not* the re-render
 * one, because a panel that orphans focus without restoring it leaves
 * `activeElement` on `<body>` indefinitely — arc-date-picker's mode switch does
 * exactly that, and it stayed broken.
 *
 * So the focus half simply declines to answer when `relatedTarget` is null. It
 * loses nothing: the only case it uniquely sees is focus moving to a real
 * element elsewhere on the page, which is the keyboard tab-away that started
 * finding #60, and `relatedTarget` names it precisely. Every other departure is
 * a pointer landing somewhere, which the pointer half already has. The cost is
 * that tabbing into browser chrome does not dismiss — which is arguably right,
 * since coming back should find the panel where you left it.
 *
 * Shadow DOM needs no special handling: for a listener on the host,
 * `relatedTarget` retargets to the host itself when focus moves *within* the
 * host's shadow tree, and `Node.contains` counts a node as containing itself.
 * `document.activeElement` likewise reports the host for anything inside it.
 */
export class DismissController {
  /**
   * @param {import('lit').ReactiveElement} host
   * @param {object} opts
   * @param {() => void} opts.onDismiss
   * @param {() => boolean} [opts.when] - Extra guard, checked per event.
   * @param {() => Element | null | undefined} [opts.boundary] - What counts as
   *   "inside", when that isn't the host. The shape it exists for is a component
   *   that points at a *separate* target element and must stay open for
   *   interaction with that target, not with itself.
   *
   *   **No component consumes this today.** arc-spotlight was the only one, and
   *   V4-SCOPE §4 deleted it in 4.1; `arc-tour` (4.8) is the rebuild that needs
   *   the same thing, and taking element references rather than selectors is
   *   the design change that makes it work through shadow roots. Kept rather
   *   than removed with its last consumer because the behaviour is pinned
   *   directly — `dismiss-controller.test.js` "boundary()" covers inside,
   *   resolves-to-nothing on pointer, and resolves-to-nothing on focusout,
   *   against a purpose-built probe rather than through a component.
   * @param {boolean} [opts.pointer=true] - Dismiss when a pointer lands outside.
   * @param {boolean} [opts.focus=true] - Dismiss when focus moves outside.
   */
  constructor(host, { onDismiss, when, boundary, pointer = true, focus = true }) {
    this.host = host;
    this._onDismiss = onDismiss;
    this._when = when;
    this._boundary = boundary;
    this._pointer = pointer;
    this._focus = focus;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onFocusOut = this._onFocusOut.bind(this);
    this._active = false;
    this._reactivate = false;
    host.addController(this);
  }

  activate() {
    if (this._active) return;
    this._active = true;
    if (this._pointer) document.addEventListener('pointerdown', this._onPointerDown, true);
    // On the host rather than the document: focusout is composed, so it reaches
    // the host for anything inside it, and a document listener would fire for
    // every unrelated field on the page.
    if (this._focus) this.host.addEventListener('focusout', this._onFocusOut);
  }

  deactivate() {
    if (!this._active) return;
    this._active = false;
    document.removeEventListener('pointerdown', this._onPointerDown, true);
    this.host.removeEventListener('focusout', this._onFocusOut);
  }

  /**
   * Re-arm after a reparent — finding #72, which is #55 and #64 a third time.
   *
   * Every consumer activates from `updated()`, keyed on an open-state *change*.
   * Moving an element changes no state and schedules no update, so before this
   * existed `hostDisconnected` was a one-way door: an overlay that was open
   * when it moved came back rendering normally, answering every property, and
   * permanently undismissable by pointer *and* focus.
   *
   * Activation is state, not structure, so this restores what was torn down
   * rather than arming unconditionally — a closed panel must stay inert across
   * a move, or every reparent re-arms every dismissable component on the page.
   */
  hostConnected() {
    if (this._reactivate) this.activate();
  }

  hostDisconnected() {
    this._reactivate = this._active;
    this.deactivate();
  }

  /** The element that counts as "inside", or null when there is none. */
  get _inside() {
    return this._boundary ? this._boundary() : this.host;
  }

  _onPointerDown(e) {
    if (this._when && !this._when()) return;
    const inside = this._inside;
    // A boundary that resolves to nothing means there is no inside: every click
    // is outside. That is the right reading for a component whose highlighted
    // target has gone away — the alternative, treating "no inside" as "nothing
    // is outside", traps the page open with no way to dismiss it.
    if (inside && e.composedPath().includes(inside)) return;
    this._onDismiss();
  }

  /** Is `node` within whatever currently counts as inside? */
  _holds(node) {
    const inside = this._inside;
    if (!inside || !node) return false;
    return inside === node || inside.contains(node) || !!inside.shadowRoot?.contains(node);
  }

  _onFocusOut(e) {
    if (this._when && !this._when()) return;
    if (!this._inside) return this._onDismiss();

    // A null relatedTarget is not an answer — see the header. Nothing is done
    // about it here on purpose: the pointer half already covers every case where
    // it means the user went elsewhere.
    if (!e.relatedTarget) return;
    if (!this._holds(e.relatedTarget)) this._onDismiss();
  }
}
