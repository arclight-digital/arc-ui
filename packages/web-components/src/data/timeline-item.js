import { LitElement, html, css } from 'lit';

/**
 * @tag arc-timeline-item
 */
export class ArcTimelineItem extends LitElement {
  static properties = {
    heading: { type: String, reflect: true },
    date:    { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.heading = '';
    this.date = '';
  }

  /** Description from slotted text content */
  get description() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
