import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcSection extends LitElement {
  static properties = {
    label: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .section {
        width: 100%;
        max-width: var(--max-width);
        margin-inline: auto;
        padding: var(--space-3xl) var(--space-lg);
        scroll-margin-top: var(--space-md);
      }

      @media (max-width: 768px) {
        .section { padding: var(--space-2xl) var(--space-md); }
      }

      .section__label {
        display: block;
        font-family: var(--font-accent);
        font-weight: var(--section-title-weight);
        font-size: var(--section-title-size);
        letter-spacing: var(--section-title-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--space-lg);
      }
    `,
  ];

  constructor() {
    super();
    this.label = '';
  }

  render() {
    return html`
      <section class="section" part="section">
        ${this.label ? html`<span class="section__label" part="label">${this.label}</span>` : ''}
        <slot></slot>
      </section>
    `;
  }
}

customElements.define('arc-section', ArcSection);
