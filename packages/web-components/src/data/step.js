import { LitElement, html, css } from 'lit';

/**
 * Individual step within a Stepper.
 *
 * @tag arc-step
 * @prop {string} label - Step label text
 * @slot - Default content.
 */
export class ArcStep extends LitElement {
  static properties = {
    label: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.label = '';
  }

  render() {
    return html`<slot></slot>`;
  }
}
