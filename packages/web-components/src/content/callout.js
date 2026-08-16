import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * @deprecated Since v4.0.0 — use `<arc-alert>`. It absorbed the `tip` variant and the `icon` slot,
 *   and `info` now maps to `role="note"` as this component always did. `variant` carries over; the
 *   derived uppercase label has no equivalent — pass `heading` if you want one. Removed in v5.
 *
 * Styled callout box for tips, warnings, and info.
 *
 * @tag arc-callout
 * @status deprecated
 * @arc-merged-into arc-alert
 * @requires arc-icon-button
 * @requires arc-icon
 * @prop {'info' | 'tip' | 'warning' | 'error'} variant - Semantic variant that controls the color scheme, top accent bar, and default icon
 * @prop {boolean} dismissible - Shows a close button that removes the callout. Fires an arc-close event on close.
 * @fires {CustomEvent<void>} arc-close - Fired when the dismiss button is clicked on a dismissible callout.
 * @slot icon
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart callout
 * @csspart header
 * @csspart icon
 * @csspart label
 * @csspart dismiss
 * @csspart content
 */
export class ArcCallout extends DeclaredPropsMixin(LitElement) {
  static properties = {
    variant: oneOf(['info', 'tip', 'warning', 'error']),
    dismissible: flag(false),
    _dismissed: { state: true },
  };

  static styles = [
    tokenStyles,
    statusVars,
    css`
      :host { display: block; }

      .callout {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        border: 1px solid rgba(var(--_status-rgb), 0.12);
        background: rgba(var(--_status-rgb), 0.04);
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        line-height: var(--body-lh);
        color: var(--text-secondary);
      }

      .callout__header {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .callout__icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        color: var(--_status-color);
      }

      .callout__label {
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        letter-spacing: var(--label-spacing);
        text-transform: uppercase;
        color: var(--_status-color);
      }

      .callout__content {
        min-width: 0;
      }


      :host(.dismissed) {
        display: none;
      }
    `,
  ];

  constructor() {
    super();
    this._dismissed = false;
  }

  /** @private */
  _getDefaultIcon() {
    const icons = {
      info: 'info',
      warning: 'warning',
      tip: 'lightbulb',
      error: 'x-circle',
    };
    return icons[this.variant] || icons.info;
  }

  /** @private */
  _getLabel() {
    const labels = {
      info: 'Note',
      warning: 'Warning',
      tip: 'Tip',
      error: 'Error',
    };
    return labels[this.variant] || labels.info;
  }

  _dismiss() {
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', { bubbles: true, composed: true, cancelable: true }),
      )
    )
      return;
    this._dismissed = true;
    this.classList.add('dismissed');
  }

  render() {
    if (this._dismissed) return html``;

    return html`
      <div class="callout" part="base callout" role="note">
        <div class="callout__header" part="header">
          <span class="callout__icon" part="icon" aria-hidden="true">
            <slot name="icon"><arc-icon name=${this._getDefaultIcon()} size="sm"></arc-icon></slot>
          </span>
          <span class="callout__label" part="label">${this._getLabel()}</span>
          ${
            this.dismissible
              ? html`
            <arc-icon-button name="x" label="Dismiss" variant="ghost" size="sm" @click=${this._dismiss} part="dismiss"></arc-icon-button>
          `
              : ''
          }
        </div>
        <div class="callout__content" part="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
