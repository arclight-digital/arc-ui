import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * ARIA live-region wrapper with no visual output. Announces dynamic content changes to screen
 * readers. Zero visual footprint — pure accessibility utility.
 *
 * @tag arc-announcement
 * @status stable
 * @prop {'polite' | 'assertive'} politeness - Controls the ARIA live region politeness level. Polite waits for the screen reader to finish before announcing; assertive interrupts immediately.
 * @prop {string} message - The text to announce to screen readers. Each time this property changes, a new announcement is triggered.
 * @slot none
 * @csspart region
 */
export class ArcAnnouncement extends DeclaredPropsMixin(LitElement) {
  static properties = {
    politeness: oneOf(['polite', 'assertive']),
    message: { type: String },
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
    this.message = '';
  }

  render() {
    return html`
      <div role="status" aria-live=${this.politeness} aria-atomic="true" part="region">${this.message}</div>
    `;
  }
}
