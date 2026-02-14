import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcContainer extends LitElement {
  static properties = {
    narrow:  { type: Boolean, reflect: true },
    size:    { type: String, reflect: true },
    padding: { type: String, reflect: true },
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

      :host([narrow]) .container,
      :host([size="sm"]) .container { max-width: var(--max-width-sm); }
      :host([size="md"]) .container { max-width: var(--max-width); }
      :host([size="lg"]) .container { max-width: 1400px; }
      :host([size="xl"]) .container { max-width: 1600px; }
      :host([size="full"]) .container { max-width: none; }

      /* Padding variants */
      :host([padding="none"]) .container { padding-inline: 0; }
      :host([padding="sm"]) .container { padding-inline: var(--space-sm); }
      :host([padding="lg"]) .container { padding-inline: var(--space-xl); }
    `,
  ];

  constructor() {
    super();
    this.narrow = false;
    this.size = 'md';
    this.padding = 'md';
  }

  render() {
    return html`<div class="container" part="container"><slot></slot></div>`;
  }
}

customElements.define('arc-container', ArcContainer);
