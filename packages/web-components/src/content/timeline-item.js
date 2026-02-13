import { LitElement, html, css } from 'lit';

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

customElements.define('arc-timeline-item', ArcTimelineItem);
