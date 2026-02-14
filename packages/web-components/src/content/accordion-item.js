import { LitElement, html, css } from 'lit';

/**
 * @tag arc-accordion-item
 */
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
