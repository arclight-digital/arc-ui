import { LitElement, html, css } from 'lit';

/**
 * @arc-prism interactive — nav item, child of arc-navigation-menu
 */
export class ArcNavItem extends LitElement {
  static properties = {
    href:        { type: String, reflect: true },
    active:      { type: Boolean, reflect: true },
    description: { type: String },
  };

  static styles = css`
    :host { display: contents; }
  `;

  constructor() {
    super();
    this.href = '';
    this.active = false;
    this.description = '';
  }

  get label() {
    return [...this.childNodes]
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .filter(Boolean)
      .join(' ');
  }

  /** Nested arc-nav-item children for dropdown menus */
  get children() {
    return [...this.querySelectorAll(':scope > arc-nav-item')];
  }

  get hasChildren() {
    return this.children.length > 0;
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('arc-nav-item', ArcNavItem);
