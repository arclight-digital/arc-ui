import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { getStatusIcon } from '../status-utils.js';

/**
 * @tag arc-inline-message
 */
export class ArcInlineMessage extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
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
        font-size: var(--text-sm);
        line-height: 1.6;
      }

      .inline-message__content {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-muted);
        line-height: 1.6;
      }
    `,
  ];

  constructor() {
    super();
    this.variant = 'info';
  }

  render() {
    return html`
      <span class="inline-message__icon" aria-hidden="true" part="icon">${getStatusIcon(this.variant)}</span>
      <span class="inline-message__content" part="content"><slot></slot></span>
    `;
  }
}
