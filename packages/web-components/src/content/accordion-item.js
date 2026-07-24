import { LitElement, html, css } from 'lit';

/**
 * An individual collapsible section inside an Accordion. The question attribute supplies the
 * clickable header text, and slotted children become the expandable body content.
 *
 * @tag arc-accordion-item
 * @prop {string} question - The heading text displayed on the trigger button. Should be a concise, scannable label or question.
 * @slot - Default content.
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
