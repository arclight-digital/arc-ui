import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * A single key-value pair within an arc-key-value container. The `label` attribute provides the
 * key text, and the default slot holds the value content.
 *
 * @tag arc-kv-pair
 * @prop {string} label - The key/term text displayed in uppercase accent styling.
 * @slot - Default content.
 * @csspart key
 * @csspart value
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

  connectedCallback() {
    super.connectedCallback();
    // Pairs slot into arc-key-value's role="list" container, which
    // requires listitem children. Respect any author-set role.
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'listitem');
    }
  }

  render() {
    return html`
      <span class="kv__key" part="key">${this.label}</span>
      <div class="kv__value" part="value"><slot></slot></div>
    `;
  }
}
