import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-list-item
 */
export class ArcListItem extends LitElement {
  static properties = {
    value:      { type: String, reflect: true },
    selected:   { type: Boolean, reflect: true },
    disabled:   { type: Boolean, reflect: true },
    href:       { type: String },
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
        transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast), transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
        border: none;
        background: none;
        width: 100%;
        text-align: left;
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
        font-size: var(--text-sm);
        color: var(--text-muted);
        line-height: 1.4;
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
    this.value = '';
    this.selected = false;
    this.disabled = false;
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
    this.dispatchEvent(new CustomEvent('arc-item-select', {
      bubbles: true,
      composed: true,
      detail: { value: this.value },
    }));
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

  render() {
    if (this.href) {
      return html`
        <a
          class="item"
          href=${this.href}
          role="option"
          aria-selected=${this.selected ? 'true' : 'false'}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          @click=${this._onClick}
          part="item"
        >${this._renderContent()}</a>
      `;
    }

    return html`
      <div
        class="item"
        role="option"
        aria-selected=${this.selected ? 'true' : 'false'}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this._onClick}
        part="item"
      >${this._renderContent()}</div>
    `;
  }
}
