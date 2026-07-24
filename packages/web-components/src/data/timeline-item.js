import { LitElement, html, css } from 'lit';

/**
 * Individual event within a Timeline.
 *
 * @tag arc-timeline-item
 * @prop {string} heading - Event heading
 * @prop {string} date - Date string to display
 * @slot - Default content.
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
