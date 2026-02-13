import { LitElement, html, css } from 'lit';

/**
 * @arc-prism interactive — sidebar section, child of arc-sidebar
 */
export class ArcSidebarSection extends LitElement {
  static properties = {
    heading:     { type: String, reflect: true },
    collapsible: { type: Boolean, reflect: true },
    open:        { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: contents; }
  `;

  constructor() {
    super();
    this.heading = '';
    this.collapsible = false;
    this.open = true;
  }

  /** Get child arc-sidebar-link elements */
  get links() {
    return [...this.querySelectorAll(':scope > arc-sidebar-link')];
  }

  toggle() {
    if (this.collapsible) {
      this.open = !this.open;
      this.dispatchEvent(new CustomEvent('arc-toggle', {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('arc-sidebar-section', ArcSidebarSection);
