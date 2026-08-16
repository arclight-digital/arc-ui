import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { getStatusIcon } from '../status-utils.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * @deprecated Since v4.0.0. **Below a form control, use the control's own `error` prop** — every
 *   form control in the library renders one, with a `part="error"` and the aria wiring already
 *   done, which is a thing a sibling element cannot do for it. Standing alone, use
 *   `<arc-alert density="compact">`. Removed in v5.
 *
 * Contextual feedback that sits inline in a form or content area. Same semantic color variants as
 * alert but compact — icon + text only, no background fill.
 *
 * @tag arc-inline-message
 * @status deprecated
 * @arc-merged-into arc-alert
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
        line-height: var(--body-lh);
      }

      .inline-message__content {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        line-height: var(--body-lh);
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
