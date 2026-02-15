import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-fieldset
 */
export class ArcFieldset extends LitElement {
  static properties = {
    legend:      { type: String },
    description: { type: String },
    disabled:    { type: Boolean, reflect: true },
    error:       { type: String },
    variant:     { type: String, reflect: true },
    _hasLegend:  { state: true },
    _hasActions: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      :host([disabled]) {
        opacity: 0.5;
      }

      fieldset {
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-md) var(--space-lg) var(--space-lg);
        margin: 0;
        min-width: 0;
      }

      :host([variant="card"]) fieldset {
        background: var(--bg-surface);
        box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      }

      legend {
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: 600;
        color: var(--text-primary);
        padding: 0 var(--space-xs);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .legend__slot { display: contents; }
      .legend__slot--empty { display: none; }

      .fieldset__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
      }

      .fieldset__actions {
        display: inline-flex;
        gap: var(--space-sm);
      }

      .fieldset__actions--empty { display: none; }

      .fieldset__description {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-muted);
        line-height: 1.5;
        margin-top: var(--space-xs);
        padding: 0 var(--space-xs);
      }

      .fieldset__content {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin-top: var(--space-md);
      }

      .fieldset__error {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--status-error, #ef4444);
        margin-top: var(--space-sm);
        padding: 0 var(--space-xs);
      }
    `,
  ];

  constructor() {
    super();
    this.legend = '';
    this.description = '';
    this.disabled = false;
    this.error = '';
    this.variant = 'default';
    this._hasLegend = false;
    this._hasActions = false;
  }

  _onLegendSlotChange(e) {
    this._hasLegend = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onActionsSlotChange(e) {
    this._hasActions = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    const showLegend = this.legend || this._hasLegend;

    return html`
      <fieldset ?disabled=${this.disabled} part="fieldset">
        ${showLegend ? html`
          <legend part="legend">
            <div class="fieldset__header">
              <span>
                ${this.legend}
                <span class="legend__slot ${this._hasLegend ? '' : 'legend__slot--empty'}">
                  <slot name="legend" @slotchange=${this._onLegendSlotChange}></slot>
                </span>
              </span>
              <span class="fieldset__actions ${this._hasActions ? '' : 'fieldset__actions--empty'}">
                <slot name="actions" @slotchange=${this._onActionsSlotChange}></slot>
              </span>
            </div>
          </legend>
        ` : ''}
        ${this.description ? html`<div class="fieldset__description" part="description">${this.description}</div>` : ''}
        <div class="fieldset__content" part="content">
          <slot></slot>
        </div>
        ${this.error ? html`<div class="fieldset__error" role="alert" part="error">${this.error}</div>` : ''}
      </fieldset>
    `;
  }
}
