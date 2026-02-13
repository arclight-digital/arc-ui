import { LitElement, html, css } from 'lit';

export class ArcSidebarLink extends LitElement {
  static properties = {
    href:   { type: String, reflect: true },
    active: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.href = '';
    this.active = false;
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('arc-sidebar-link', ArcSidebarLink);
