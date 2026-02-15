import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-input-group
 */
export class ArcInputGroup extends LitElement {
  static properties = {
    size:       { type: String, reflect: true },
    _hasPrefix: { state: true },
    _hasSuffix: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: flex;
      }

      .input-group {
        display: flex;
        align-items: stretch;
        width: 100%;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--border-default);
        transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
        background: var(--bg-surface);
      }

      .input-group:focus-within {
        border-color: var(--accent-primary);
        box-shadow: var(--focus-glow);
      }

      .input-group__addon {
        display: flex;
        align-items: center;
        padding: 0 var(--space-md);
        background: var(--bg-elevated);
        border-color: inherit;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-muted);
        white-space: nowrap;
        user-select: none;
      }

      .input-group__addon--prefix {
        border-right: 1px solid var(--border-default);
      }

      .input-group__addon--suffix {
        border-left: 1px solid var(--border-default);
      }

      .input-group__addon--empty { display: none; }

      .input-group__content {
        flex: 1;
        min-width: 0;
        display: flex;
      }

      /* Remove borders/radii from slotted inputs */
      ::slotted(arc-input),
      ::slotted(arc-select),
      ::slotted(input),
      ::slotted(select) {
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        flex: 1;
        min-width: 0;
      }

      /* Sizes */
      :host([size="sm"]) .input-group__addon { padding: 0 var(--space-sm); font-size: var(--text-xs); }
      :host([size="lg"]) .input-group__addon { padding: 0 var(--space-lg); font-size: var(--body-size); }

      @media (prefers-reduced-motion: reduce) {
        .input-group { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.size = 'md';
    this._hasPrefix = false;
    this._hasSuffix = false;
  }

  _onPrefixSlotChange(e) {
    this._hasPrefix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onSuffixSlotChange(e) {
    this._hasSuffix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    return html`
      <div class="input-group" part="group">
        <div class="input-group__addon input-group__addon--prefix ${this._hasPrefix ? '' : 'input-group__addon--empty'}" part="prefix">
          <slot name="prefix" @slotchange=${this._onPrefixSlotChange}></slot>
        </div>
        <div class="input-group__content" part="content">
          <slot></slot>
        </div>
        <div class="input-group__addon input-group__addon--suffix ${this._hasSuffix ? '' : 'input-group__addon--empty'}" part="suffix">
          <slot name="suffix" @slotchange=${this._onSuffixSlotChange}></slot>
        </div>
      </div>
    `;
  }
}
