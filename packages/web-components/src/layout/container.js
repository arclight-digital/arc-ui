import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcContainer extends LitElement {
  static properties = {
    narrow: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .container {
        width: 100%;
        max-width: var(--max-width);
        margin-inline: auto;
        padding-inline: var(--space-lg);
      }

      :host([narrow]) .container {
        max-width: var(--max-width-sm);
      }
    `,
  ];

  constructor() {
    super();
    this.narrow = false;
  }

  render() {
    return html`<div class="container" part="container"><slot></slot></div>`;
  }
}

customElements.define('arc-container', ArcContainer);
