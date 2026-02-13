import { LitElement, html, css } from 'lit';

export class ArcAccordionItem extends LitElement {
  static properties = {
    question: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.question = '';
  }

  /** Answer content from slotted children */
  get answer() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('arc-accordion-item', ArcAccordionItem);
