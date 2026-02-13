import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcKbd extends LitElement {
  static properties = {};

  static styles = [
    tokenStyles,
    css`
      :host { display: inline; }

      .kbd {
        display: inline-flex;
        align-items: center;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        line-height: 1;
        color: var(--text-secondary);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-bottom-width: 2px;
        border-radius: var(--radius-sm);
        padding: 2px calc(var(--space-xs) + 2px); /* cosmetic 2px vertical for kbd element */
        white-space: nowrap;
        user-select: none;
        vertical-align: baseline;
      }
    `,
  ];

  constructor() {
    super();
  }

  render() {
    return html`<kbd class="kbd" part="kbd"><slot></slot></kbd>`;
  }
}

customElements.define('arc-kbd', ArcKbd);
