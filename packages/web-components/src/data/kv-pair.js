import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-kv-pair
 */
export class ArcKvPair extends LitElement {
  static properties = {
    label: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .kv__key {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .kv__value {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
      }
    `,
  ];

  constructor() {
    super();
    this.label = '';
  }

  render() {
    return html`
      <span class="kv__key" part="key">${this.label}</span>
      <div class="kv__value" part="value"><slot></slot></div>
    `;
  }
}
