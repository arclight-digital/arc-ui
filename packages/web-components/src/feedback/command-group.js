import { LitElement, html, css } from 'lit';

/**
 * @tag arc-command-group
 */
export class ArcCommandGroup extends LitElement {
  static properties = {
    heading: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.heading = '';
  }

  render() {
    return html`<slot></slot>`;
  }
}
