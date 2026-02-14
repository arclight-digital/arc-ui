import { LitElement, html, css } from 'lit';

/**
 * @tag arc-breadcrumb-item
 */
export class ArcBreadcrumbItem extends LitElement {
  static properties = {
    href: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.href = '';
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
