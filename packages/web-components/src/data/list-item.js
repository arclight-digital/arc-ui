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
 * @prop {boolean} selected - Whether this item is currently selected. Managed automatically by the parent list.
 * @prop {boolean} disabled - Prevents interaction and dims the item.
 * @prop {string} href - When set, renders the item as an anchor tag for navigation.
 * @fires {CustomEvent<{ value: string }>} arc-select - Fired when the item is activated by click. The parent arc-list dispatches the same event from this element for Enter and Space.
 * @slot prefix
 * @slot - Default content.
 * @slot description
 * @slot suffix
 * @csspart base - The root element.
 * @csspart label
 * @csspart description
 * @csspart item
 */
export class ArcListItem extends DeclaredPropsMixin(LitElement) {
  static properties = {
    value: { type: String, reflect: true },
    selected: flag(false),
    /**
     * Whether this item sits in a selection list, which decides its role
     * (finding #28). Pushed by the parent arc-list rather than read from the
     * DOM: the parent's `role="listbox"` lives in *its* shadow root, so
     * `closest('[role="listbox"]')` — arc-chip's test for the same question —
     * cannot see it from out here.
     */
    _selectable: { state: true },
    disabled: flag(false),
    href: { type: String },
    _hasPrefix: { state: true },
    _hasSuffix: { state: true },
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

      .item {
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

  constructor() {
    super();
    this._selectable = false;
    this.value = '';
    this.href = '';
    this._hasPrefix = false;
    this._hasSuffix = false;
    this._hasDescription = false;
  }

  _onPrefixSlotChange(e) {
    this._hasPrefix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onSuffixSlotChange(e) {
    this._hasSuffix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onDescriptionSlotChange(e) {
    this._hasDescription = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onClick(e) {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('arc-select', {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
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

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
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
    // paths that set `_selectable` runs there — the parent sets it from
    // `updated()` and from its slotchange, and the server runs neither. So a
    // server-rendered item is a `listitem` and becomes an `option` on
    // hydration if its list is selectable. That is the right way round: plain
    // lists are the default and are now correct in the served HTML, where they
    // used to ship `role="option"` permanently.
    if (typeof this.closest !== 'function') return 'listitem';
    return this.closest('[role="listbox"], [role="group"]') ? 'option' : 'listitem';
  }

  render() {
    const asOption = this._role === 'option';
    if (this.href) {
      return html`
        <a
          class="item"
          href=${this.href}
          role=${this._role}
          aria-selected=${asOption ? (this.selected ? 'true' : 'false') : nothing}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          @click=${this._onClick}
          part="base item"
        >${this._renderContent()}</a>
      `;
    }

    return html`
      <div
        class="item"
        role=${this._role}
        aria-selected=${asOption ? (this.selected ? 'true' : 'false') : nothing}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this._onClick}
        part="base item"
      >${this._renderContent()}</div>
    `;
  }
}
