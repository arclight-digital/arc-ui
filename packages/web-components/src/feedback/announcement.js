import { LitElement, html, css } from 'lit';

/**
 * @tag arc-announcement
 */
export class ArcAnnouncement extends LitElement {
  static properties = {
    politeness: { type: String, reflect: true },
    message:    { type: String },
  };

  static styles = [
    css`
      :host {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        clip-path: inset(50%);
        white-space: nowrap;
      }
    `,
  ];

  constructor() {
    super();
    this.politeness = 'polite';
    this.message = '';
  }

  render() {
    return html`
      <div role="status" aria-live=${this.politeness} aria-atomic="true" part="region">${this.message}</div>
    `;
  }
}
