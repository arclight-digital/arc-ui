import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-label
 */
export class ArcLabel extends LitElement {
  static properties = {
    for:       { type: String, reflect: true },
    required:  { type: Boolean, reflect: true },
    size:      { type: String, reflect: true },
    disabled:  { type: Boolean, reflect: true },
    _hasDescription: { state: true },
    _hasTooltip:     { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      :host([disabled]) {
        opacity: 0.5;
        pointer-events: none;
      }

      .label {
        display: flex;
        align-items: baseline;
        gap: var(--space-xs);
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-secondary);
        cursor: pointer;
        line-height: 1.4;
        margin-bottom: var(--space-xs);
      }

      :host([size="sm"]) .label { font-size: 10px; }
      :host([size="lg"]) .label { font-size: var(--text-sm); }

      .label__required {
        color: var(--status-error, #ef4444);
        font-weight: 700;
      }

      .label__tooltip {
        display: inline-flex;
        align-items: center;
        margin-left: var(--space-xs);
      }

      .label__tooltip--empty { display: none; }

      .description {
        font-family: var(--font-body);
        font-size: var(--text-xs);
        color: var(--text-muted);
        line-height: 1.5;
        margin-bottom: var(--space-xs);
      }

      .description--empty { display: none; }
    `,
  ];

  constructor() {
    super();
    this.for = '';
    this.required = false;
    this.size = 'md';
    this.disabled = false;
    this._hasDescription = false;
    this._hasTooltip = false;
  }

  _onDescriptionSlotChange(e) {
    this._hasDescription = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onTooltipSlotChange(e) {
    this._hasTooltip = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onClick() {
    if (!this.for) return;
    const target = (this.getRootNode()).querySelector(`#${this.for}`) ||
                   document.getElementById(this.for);
    target?.focus?.();
  }

  render() {
    return html`
      <label class="label" for=${this.for || ''} @click=${this._onClick} part="label">
        <slot></slot>
        ${this.required ? html`<span class="label__required" aria-hidden="true">*</span>` : ''}
        <span class="label__tooltip ${this._hasTooltip ? '' : 'label__tooltip--empty'}">
          <slot name="tooltip" @slotchange=${this._onTooltipSlotChange}></slot>
        </span>
      </label>
      <div class="description ${this._hasDescription ? '' : 'description--empty'}" part="description">
        <slot name="description" @slotchange=${this._onDescriptionSlotChange}></slot>
      </div>
    `;
  }
}
