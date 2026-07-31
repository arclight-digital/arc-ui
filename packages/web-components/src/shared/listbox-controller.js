/**
 * ListboxController — shared keyboard and active-option behaviour for the
 * listbox-bearing inputs (select, combobox, multi-select, tag-input).
 *
 * All four grew the same `switch (e.key)` independently, and all four had the
 * same three defects:
 *
 *   1. ArrowUp did not open a closed listbox — only ArrowDown did — and it
 *      clamped at index 0 instead of wrapping, so there was no way to reach the
 *      last option with one key.
 *   2. Nothing scrolled the active option into view, so keyboard navigation
 *      stopped being visible at whatever item the panel's max-height cut off
 *      (around the sixth).
 *   3. Both ARIA patterns were half-implemented at once: `aria-activedescendant`
 *      on the input *and* `role="option"` on focusable `<button>` elements. They
 *      are mutually exclusive — activedescendant means DOM focus never leaves
 *      the input, so a focusable option puts a second, real tab stop inside a
 *      widget that claims focus is elsewhere.
 *
 * This settles (3) on virtual focus: DOM focus stays on the input or trigger,
 * the controller tracks which option is active, and options render as
 * non-focusable elements carrying `role="option"` and an id. A component's only
 * ARIA obligations are to put `aria-activedescendant` on the focused control and
 * ids matching `optionId` on the options.
 *
 * ## Usage
 *
 *     this._listbox = new ListboxController(this, {
 *       getItemCount: () => this._filteredItems.length,
 *       isOpen: () => this._open,
 *       onOpen: () => { this._open = true; },
 *       onClose: () => { this._open = false; },
 *       onSelect: (i) => this._selectItem(this._filteredItems[i]),
 *       optionId: (i) => `${this._id}-opt-${i}`,
 *       scrollContainer: () => this.shadowRoot?.querySelector('.listbox'),
 *     });
 *
 *     // in the control's keydown handler, before any component-specific keys:
 *     if (this._listbox.handleKeydown(e)) return;
 *
 * `activeIndex` is the render-time source of truth — components read it rather
 * than keeping their own copy, and the controller requests a host update
 * whenever it changes.
 */

/** How long a typeahead buffer survives between keystrokes. */
const TYPEAHEAD_TIMEOUT = 500;

export class ListboxController {
  /**
   * @param {import('lit').ReactiveElement} host
   * @param {object} opts
   * @param {() => number} opts.getItemCount - How many options are rendered.
   * @param {() => boolean} opts.isOpen - Whether the listbox is currently open.
   * @param {() => void} [opts.onOpen] - Called when a key should open the listbox.
   * @param {() => void} [opts.onClose] - Called when Escape should close it.
   * @param {(index: number) => void} [opts.onSelect] - Called to activate an option.
   * @param {(index: number) => string} [opts.optionId] - Option element id, used
   *   for aria-activedescendant and to find the element to scroll into view.
   * @param {() => Element | null | undefined} [opts.scrollContainer] - The
   *   scrolling listbox element.
   * @param {(index: number) => string} [opts.getItemLabel] - Option text, needed
   *   only when typeahead is enabled.
   * @param {boolean} [opts.typeahead=false] - Jump to an option by typing its
   *   first letters. Off by default: in a combobox or tag-input the same
   *   keystrokes belong to the text field, and stealing them would break typing.
   * @param {boolean} [opts.wrap=true] - Wrap from last to first and back.
   * @param {boolean} [opts.selectOnClose=false] - Reset the active option when
   *   the listbox closes.
   */
  constructor(host, opts) {
    this.host = host;
    this.opts = opts;
    this._activeIndex = -1;
    this._typeahead = '';
    this._typeaheadTimer = null;
    this._pendingScroll = false;
    host.addController(this);
  }

  /** The active (virtually focused) option index, or -1 for none. */
  get activeIndex() {
    return this._activeIndex;
  }

  /**
   * The value for `aria-activedescendant` on the focused control, or an empty
   * string when nothing is active. Empty rather than absent because a stale id
   * pointing at a removed option is worse than none — assistive technology
   * announces nothing at all.
   */
  get activeDescendantId() {
    if (this._activeIndex < 0 || !this.opts.optionId) return '';
    // Range-checked here rather than trusting clampToCount, because the render
    // that shrinks the option set runs before the host's updated() gets a chance
    // to clamp. Without this guard that one render emits an id for an option it
    // just stopped drawing.
    if (this._activeIndex >= this.opts.getItemCount()) return '';
    return this.opts.optionId(this._activeIndex);
  }

  /** Move virtual focus, and queue a scroll so the option stays visible. */
  setActive(index) {
    const count = this.opts.getItemCount();
    const next = count === 0 ? -1 : Math.max(-1, Math.min(index, count - 1));
    if (next === this._activeIndex) return;
    this._activeIndex = next;
    this._pendingScroll = next >= 0;
    this.host.requestUpdate();
  }

  /** Clear virtual focus — on close, or when the option set changes wholesale. */
  reset() {
    this._activeIndex = -1;
    this._clearTypeahead();
    this.host.requestUpdate();
  }

  /**
   * Keep the active index inside the current option set.
   *
   * Call after the options change — filtering a combobox down to fewer items
   * than the active index would otherwise leave `aria-activedescendant` pointing
   * at an option that no longer exists.
   */
  clampToCount() {
    const count = this.opts.getItemCount();
    if (count === 0) {
      if (this._activeIndex !== -1) this.reset();
      return;
    }
    if (this._activeIndex > count - 1) this.setActive(count - 1);
  }

  /**
   * Handle a listbox navigation key.
   *
   * @param {KeyboardEvent} e
   * @returns {boolean} true when the key was consumed, so a component can put
   *   `if (this._listbox.handleKeydown(e)) return;` ahead of its own keys.
   */
  handleKeydown(e) {
    const open = this.opts.isOpen();
    const count = this.opts.getItemCount();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        // Opening with a direction key lands on the near end of the list, which
        // is what the pattern calls for and what makes one keypress enough to
        // reach either extreme.
        if (!open) return this._open(0);
        this.setActive(this._step(1, count));
        return true;

      case 'ArrowUp':
        e.preventDefault();
        if (!open) return this._open(count - 1);
        this.setActive(this._step(-1, count));
        return true;

      case 'Home':
        if (!open || count === 0) return false;
        e.preventDefault();
        this.setActive(0);
        return true;

      case 'End':
        if (!open || count === 0) return false;
        e.preventDefault();
        this.setActive(count - 1);
        return true;

      case 'Enter':
        if (!open || this._activeIndex < 0) return false;
        e.preventDefault();
        this.opts.onSelect?.(this._activeIndex);
        return true;

      case 'Escape':
        if (!open) return false;
        e.preventDefault();
        this.reset();
        this.opts.onClose?.();
        return true;

      default:
        return this._handleTypeahead(e);
    }
  }

  /** Ask the host to open, and pre-select an end of the list. */
  _open(index) {
    this.opts.onOpen?.();
    // After onOpen the option set may only exist post-render, so settle the
    // active index once the host has rendered rather than against a stale count.
    this.host.updateComplete?.then(() => this.setActive(index < 0 ? 0 : index));
    return true;
  }

  /** One step with wrapping, treating "nothing active" as before the start. */
  _step(delta, count) {
    if (count === 0) return -1;
    if (this._activeIndex < 0) return delta > 0 ? 0 : count - 1;
    const next = this._activeIndex + delta;
    if (this.opts.wrap === false) return Math.max(0, Math.min(next, count - 1));
    return (next + count) % count;
  }

  /**
   * Jump to the first option starting with the typed characters.
   *
   * Only for listboxes with no text field of their own — see the `typeahead`
   * option. Repeated presses of the same letter cycle through the options that
   * start with it, which is how a native select behaves.
   */
  _handleTypeahead(e) {
    if (!this.opts.typeahead || !this.opts.getItemLabel) return false;
    // Printable single characters only: this must not swallow Tab, modifiers or
    // shortcut combinations.
    if (e.key.length !== 1 || e.altKey || e.ctrlKey || e.metaKey) return false;
    if (e.key === ' ' && this._typeahead === '') return false;

    const count = this.opts.getItemCount();
    if (count === 0) return false;
    if (!this.opts.isOpen()) this.opts.onOpen?.();

    clearTimeout(this._typeaheadTimer);
    this._typeaheadTimer = setTimeout(() => {
      this._typeahead = '';
    }, TYPEAHEAD_TIMEOUT);

    const repeat = this._typeahead === e.key;
    this._typeahead = repeat ? e.key : this._typeahead + e.key;
    const needle = this._typeahead.toLowerCase();

    // Start the search after the active option so a repeated letter advances
    // instead of matching the same option forever.
    const from = repeat || this._typeahead.length === 1 ? this._activeIndex + 1 : 0;
    for (let n = 0; n < count; n++) {
      const i = (from + n + count) % count;
      if ((this.opts.getItemLabel(i) || '').toLowerCase().startsWith(needle)) {
        e.preventDefault();
        this.setActive(i);
        return true;
      }
    }
    return false;
  }

  _clearTypeahead() {
    clearTimeout(this._typeaheadTimer);
    this._typeahead = '';
  }

  /**
   * Scroll the active option into view after the render that marked it active.
   *
   * `block: 'nearest'` so an option already on screen doesn't yank the list, and
   * scoped to the listbox: scrollIntoView on an element inside a top-layer panel
   * would otherwise be free to scroll the page behind it.
   */
  hostUpdated() {
    if (!this._pendingScroll) return;
    this._pendingScroll = false;
    const container = this.opts.scrollContainer?.();
    const id = this.activeDescendantId;
    if (!container || !id) return;
    const option = container.querySelector(`#${CSS.escape(id)}`);
    if (!option) return;

    // Manual arithmetic rather than scrollIntoView: the option is inside a panel
    // that may be in the top layer, and the native call is specified to scroll
    // every scrollable ancestor — it would drag the page behind the panel.
    //
    // offsetTop/offsetHeight rather than rects, because these panels animate in
    // from scale(0.96): a rect read on the opening frame is 4% short, and a
    // delta computed from two such rects under-scrolls by enough to leave the
    // option clipped. The layout box is transform-independent.
    if (option.offsetParent === container) {
      const top = option.offsetTop;
      const bottom = top + option.offsetHeight;
      if (top < container.scrollTop) container.scrollTop = top;
      else if (bottom > container.scrollTop + container.clientHeight) {
        container.scrollTop = bottom - container.clientHeight;
      }
      return;
    }

    // Fallback for a panel that isn't the option's offset parent (no positioning
    // of its own). Rects are the only option here, transform warts and all.
    const c = container.getBoundingClientRect();
    const o = option.getBoundingClientRect();
    if (o.top < c.top) container.scrollTop -= c.top - o.top;
    else if (o.bottom > c.bottom) container.scrollTop += o.bottom - c.bottom;
  }

  hostDisconnected() {
    this._clearTypeahead();
  }
}
