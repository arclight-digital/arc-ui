import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Individual row within an arc-list. Supports prefix/suffix slots, a description slot for
 * secondary text, links, and selection state.
 *
 * @tag arc-list-item
 * @status stable
 * @prop {string} value - Unique identifier used for selection tracking.
 * @prop {boolean} selected - Whether this item is currently selected. Managed automatically by a selectable parent list. On an `href` item in a plain list it marks the current page instead (`aria-current="page"`), which is the accessible way to show the current row in a list whose rows carry actions.
 * @prop {boolean} disabled - Prevents interaction and dims the item.
 * @prop {string} href - When set, renders the item as an anchor tag for navigation.
 * @fires {CustomEvent<{ value: string }>} arc-select - Fired when the item is activated: by click, or by Enter or Space on a focused row (in a selectable list the parent dispatches it from this element). Cancelable: on an `href` row, cancelling it stops the link navigating, which is how a single-page app routes the click itself. A modified click (Ctrl, Cmd, Shift, a middle click) is left to the browser and does not fire it.
 * @slot prefix
 * @slot - Default content.
 * @slot description
 * @slot suffix
 * @slot actions - Buttons that act on this row, such as rename or delete. Hidden until the row is hovered or something in it has focus, so they stay reachable from the keyboard; always shown on a device without hover. They sit beside the row rather than inside it, so a click on one never activates the row. Plain lists only: in a `selectable` list the row is an option, and a listbox can hold nothing but options, so the slot is not rendered there. For rows that are both current and actionable, use a plain list with `href` and `selected`.
 * @csspart base - The root element.
 * @csspart label
 * @csspart description
 * @csspart item
 * @csspart actions - The container of the `actions` slot.
 */
export class ArcListItem extends DeclaredPropsMixin(LitElement) {
  static properties = {
    value: { type: String, reflect: true },
    selected: flag(false),
    /**
     * Whether this item sits in a selection list, which decides its role
     * (finding #28). Pushed by the parent arc-list rather than read from the
     * DOM: the parent's `role="listbox"` lives in *its* shadow root, so
     * `closest('[role="listbox"]')`, arc-chip's test for the same question,
     * cannot see it from out here.
     */
    _selectable: { state: true },
    disabled: flag(false),
    href: { type: String },
    _hasPrefix: { state: true },
    _hasSuffix: { state: true },
    _hasActions: { state: true },
    _size: { state: true },
    _hasDescription: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      :host([disabled]) {
        pointer-events: none;
        opacity: 0.5;
      }

      /* The row and its actions, side by side. The actions are never inside
         .item: that element is an option in a selectable list and an <a> with
         href, and an interactive control inside either is invalid, which axe
         reported against 4.5.0 as nested-interactive (finding #125). */
      .row {
        display: flex;
        align-items: center;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast), box-shadow var(--transition-fast);
      }

      /* With actions, the wrapper carries the row's hover and selected fill, so
         the highlight still runs under the buttons. */
      .row--actions:hover {
        background: var(--surface-overlay);
        box-shadow: var(--interactive-hover);
      }
      :host([selected]) .row--actions {
        background: rgba(var(--interactive-rgb), 0.08);
        box-shadow: inset 0 0 8px rgba(var(--interactive-rgb), 0.06);
      }
      .row--actions .item:hover,
      :host([selected]) .row--actions .item {
        background: none;
        box-shadow: none;
      }
      .row--actions .item:focus-visible { box-shadow: var(--interactive-focus); }

      .item {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm);
        min-height: var(--touch-min);
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-secondary);
        text-decoration: none;
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast), transform 150ms var(--ease-out);
        border: none;
        background: none;
        width: 100%;
        text-align: start;
      }

      .item:hover {
        background: var(--surface-overlay);
        color: var(--text-primary);
        box-shadow: var(--interactive-hover);
      }

      .item:active {
        transform: scale(0.98);
      }

      .item:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      :host([selected]) .item {
        background: rgba(var(--interactive-rgb), 0.08);
        color: var(--text-primary);
        box-shadow: inset 0 0 8px rgba(var(--interactive-rgb), 0.06);
      }

      /* The parent list's size, pushed as _size (finding #135). The touch
         minimum stays on sm: it is 24px with a mouse and 36px on touch. */
      .item--sm {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--_text-sm);
        line-height: var(--ui-lh);
      }
      .item--lg {
        padding: var(--space-md);
        font-size: var(--_text-lg);
      }

      .item__prefix,
      .item__suffix {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }

      .item__prefix--empty,
      .item__suffix--empty { display: none; }

      .item__body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .item__label {
        display: block;
      }

      .item__description {
        font-size: var(--_text-sm);
        color: var(--text-muted);
        line-height: var(--ui-lh);
      }

      .item__description--empty { display: none; }

      /* Revealed by hover or by focus anywhere in the row, never by hover
         alone: opacity rather than visibility, because a hidden action cannot
         take focus, and focus is what reveals it for a keyboard user. No hover
         at all, as on a phone, and they simply stay shown (finding #113). */
      .item__actions {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        flex-shrink: 0;
        padding-inline-end: var(--space-sm);
        opacity: 0;
        transition: opacity var(--transition-fast);
      }

      .row:hover .item__actions,
      :host(:focus-within) .item__actions {
        opacity: 1;
      }

      @media (hover: none) {
        .item__actions { opacity: 1; }
      }

      .item__actions--empty { display: none; }

      ::slotted([slot="prefix"]),
      ::slotted([slot="suffix"]) { display: flex; }

      @media (prefers-reduced-motion: reduce) {
        .item {
          transition: none;
          transform: none !important;
        }
      }
    `,
  ];

  /** Slots read on the server and before hydration; see ssr.js. */
  static slotReaders = {
    prefix: '_onPrefixSlotChange',
    description: '_onDescriptionSlotChange',
    suffix: '_onSuffixSlotChange',
    actions: '_onActionsSlotChange',
  };

  constructor() {
    super();
    this._selectable = false;
    this.value = '';
    this.href = '';
    this._hasPrefix = false;
    this._hasSuffix = false;
    this._hasActions = false;
    this._hasDescription = false;
  }

  _onPrefixSlotChange(e) {
    this._hasPrefix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onSuffixSlotChange(e) {
    this._hasSuffix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onActionsSlotChange(e) {
    this._hasActions = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onDescriptionSlotChange(e) {
    this._hasDescription = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  /**
   * Activation, from a click or a key. Cancelable, and on a link row the
   * cancel is honoured as "do not navigate": a single-page app handled a
   * composed click and filtered modified clicks by hand before this
   * (finding #134).
   * @returns {boolean} whether the event was not cancelled
   */
  _activate() {
    return this.dispatchEvent(
      new CustomEvent('arc-select', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { value: this.value },
      }),
    );
  }

  _onClick(e) {
    if (this.disabled) return;
    // Opening in a new tab or window is the browser's, and not a selection.
    if (this.href && (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button > 0)) return;
    if (!this._activate() && this.href) e.preventDefault();
  }

  /**
   * Enter and Space on a focused row in a plain list. The row is in the tab
   * order, and a focusable control the keyboard cannot activate fails WCAG
   * 2.1.1 (finding #133). A selectable list handles these keys itself, and a
   * link row already has Enter; Space on a link scrolls the page, as it should.
   */
  _onKeydown(e) {
    if (this.disabled || this._role === 'option' || this.href) return;
    if (e.target !== e.currentTarget) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this._activate();
  }

  _renderContent() {
    return html`
      <span class="item__prefix ${this._hasPrefix ? '' : 'item__prefix--empty'}">
        <slot name="prefix" @slotchange=${this._onPrefixSlotChange}></slot>
      </span>
      <span class="item__body">
        <span class="item__label" part="label"><slot></slot></span>
        <span class="item__description ${this._hasDescription ? '' : 'item__description--empty'}" part="description">
          <slot name="description" @slotchange=${this._onDescriptionSlotChange}></slot>
        </span>
      </span>
      <span class="item__suffix ${this._hasSuffix ? '' : 'item__suffix--empty'}">
        <slot name="suffix" @slotchange=${this._onSuffixSlotChange}></slot>
      </span>
    `;
  }

  /** Beside the row, never inside it, and not at all in a listbox. */
  _renderActions() {
    if (this._role === 'option') return nothing;
    return html`
      <span class="item__actions ${this._hasActions ? '' : 'item__actions--empty'}" part="actions">
        <slot name="actions" @slotchange=${this._onActionsSlotChange}></slot>
      </span>
    `;
  }

  /** The slotchange DSD swallows; see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  /**
   * `option` inside a listbox, `listitem` inside a plain list.
   *
   * Rendering `role="option"` unconditionally made a non-selectable arc-list a
   * `role="list"` containing options: a list with no listitem in it, and
   * options outside any listbox. Both halves are invalid, and screen readers
   * announce item counts and positions from these roles. arc-chip solves the
   * same question by checking its ancestor; here the answer comes from the
   * parent list, which is the only thing that knows.
   */
  get _role() {
    if (this._selectable) return 'option';
    // Lit's server-side element shim has no `closest`, and neither of the two
    // paths that set `_selectable` runs there; the parent sets it from
    // `updated()` and from its slotchange, and the server runs neither. So a
    // server-rendered item is a `listitem` and becomes an `option` on
    // hydration if its list is selectable. That is the right way round: plain
    // lists are the default and are now correct in the served HTML, where they
    // used to ship `role="option"` permanently.
    if (typeof this.closest !== 'function') return 'listitem';
    return this.closest('[role="listbox"], [role="group"]') ? 'option' : 'listitem';
  }

  /**
   * Where the list role goes. In a listbox the row itself is the option and
   * carries no actions. In a plain list the `listitem` role is on the wrapper,
   * so the row and its actions are both inside the item: a list may contain
   * only list items, and buttons beside a `listitem` row would break that as
   * surely as buttons inside it broke the option. The row is then a plain
   * focusable element, or a real link when it has `href`.
   */
  render() {
    const asOption = this._role === 'option';
    const rowClass = `row ${!asOption && this._hasActions ? 'row--actions' : ''}`;
    const item = this.href
      ? html`<a
          class="item item--${this._size || 'md'}"
          href=${this.href}
          role=${asOption ? 'option' : nothing}
          aria-selected=${asOption ? (this.selected ? 'true' : 'false') : nothing}
          aria-current=${!asOption && this.selected ? 'page' : nothing}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          @click=${this._onClick}
          part="base item"
        >${this._renderContent()}</a>`
      : html`<div
          class="item item--${this._size || 'md'}"
          role=${asOption ? 'option' : nothing}
          aria-selected=${asOption ? (this.selected ? 'true' : 'false') : nothing}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          tabindex=${this.disabled ? '-1' : '0'}
          @click=${this._onClick}
          @keydown=${this._onKeydown}
          part="base item"
        >${this._renderContent()}</div>`;
    return html`<div class=${rowClass} role=${asOption ? nothing : 'listitem'}>${item}${this._renderActions()}</div>`;
  }
}
