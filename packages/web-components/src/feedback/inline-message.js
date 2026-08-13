import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { getStatusIcon } from '../status-utils.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Contextual feedback that sits inline in a form or content area. Same semantic color variants as
 * alert but compact — icon + text only, no background fill.
 *
 * @tag arc-inline-message
 * @prop {'info' | 'success' | 'warning' | 'error'} variant - Controls the icon and text color. Use "info" for neutral hints, "success" for valid state feedback, "warning" for caution notes, and "error" for validation failures.
 * @slot - Default content.
 * @csspart icon
 * @csspart content
 */
export class ArcInlineMessage extends DeclaredPropsMixin(LitElement) {
  static properties = {
    variant: oneOf(['info', 'success', 'warning', 'error']),
  };

  static styles = [
    tokenStyles,
    statusVars,
    css`
      :host {
        display: flex;
        align-items: flex-start;
        gap: var(--space-xs);
      }

      .inline-message__icon {
        color: var(--_status-color);
        flex-shrink: 0;
        font-size: var(--_text-sm);
        line-height: 1.6;
      }

      .inline-message__content {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        line-height: 1.6;
      }
    `,
  ];

  constructor() {
    super();
  }

  render() {
    return html`
      <span class="inline-message__icon" aria-hidden="true" part="icon">${getStatusIcon(this.variant)}</span>
      <span class="inline-message__content" part="content"><slot></slot></span>
    `;
  }
}
