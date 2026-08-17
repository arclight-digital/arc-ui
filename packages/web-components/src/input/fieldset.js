import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Grouped form section with legend, description, error message, and optional card variant. Wraps
 * related inputs with native fieldset semantics.
 *
 * @tag arc-fieldset
 * @status stable
 * @prop {string} legend - Text displayed in the `<legend>` element. Also available via the `legend` slot for rich content.
 * @prop {string} description - Helper text displayed below the legend.
 * @prop {boolean} disabled - Disables all child controls and dims the fieldset.
 * @prop {string} error - Error message displayed below the content with `role="alert"`.
 * @prop {'default' | 'card'} variant - Visual style. Card adds a surface background and shadow.
 * @slot legend
 * @slot actions
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart fieldset
 * @csspart legend
 * @csspart description
 * @csspart content
 * @csspart error
 */
export class ArcFieldset extends DeclaredPropsMixin(LitElement) {
  static properties = {
    legend: { type: String },
    description: { type: String },
    disabled: flag(false),
    error: { type: String },
    variant: oneOf(['default', 'card']),
    _hasLegend: { state: true },
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
        background: var(--surface-primary);
        box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      }

      legend {
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: var(--font-label-weight, 600);
        color: var(--text-primary);
        padding: 0 var(--space-xs);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .legend__slot { display: contents; }
      .legend__slot--empty { display: none; }

      /* The <legend> renders unconditionally so its slots exist for slotchange
         to fire on; this hides it when it would be empty. Making the whole
         block conditional on _hasLegend was circular — the flag is set by the
         slotchange of a slot that only existed once the flag was set, so a
         slotted legend never appeared at all. */
      .fieldset__legend--empty { display: none; }

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
        font-size: var(--_text-sm);
        color: var(--text-muted);
        line-height: var(--ui-lh);
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
        font-size: var(--_text-sm);
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
    this.error = '';
    this._hasLegend = false;
    this._hasActions = false;
  }

  _onLegendSlotChange(e) {
    this._hasLegend = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onActionsSlotChange(e) {
    this._hasActions = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const hasContent = this.legend || this._hasLegend || this._hasActions;

    return html`
      <fieldset ?disabled=${this.disabled} part="base fieldset">
        ${html`
          <legend part="legend" class="${hasContent ? '' : 'fieldset__legend--empty'}">
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
        `}
        ${this.description ? html`<div class="fieldset__description" part="description">${this.description}</div>` : ''}
        <div class="fieldset__content" part="content">
          <slot></slot>
        </div>
        ${this.error ? html`<div class="fieldset__error" role="alert" part="error">${this.error}</div>` : ''}
      </fieldset>
    `;
  }
}
