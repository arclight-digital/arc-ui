import { LitElement, html, css } from 'lit';

/**
 * A navigation link rendered inside a SidebarSection. Supports an active state to indicate the
 * current page and provides focus-visible styling for keyboard navigation.
 *
 * @tag arc-sidebar-link
 * @prop {string} href - Destination URL for the link. Can be an absolute path, relative path, or hash anchor. The link renders as a standard anchor element for full accessibility and SEO.
 * @prop {boolean} active - When true, applies a highlighted style (accent-colored text and a left-edge indicator) to signal that this link corresponds to the currently viewed page. Only one link should be active at a time.
 * @prop {number} level - Nesting depth for visual indentation. Level 0 links render at default size; level 1+ links are indented and use a smaller font size.
 * @slot - Default content.
 */
export class ArcSidebarLink extends LitElement {
  static properties = {
    href:   { type: String, reflect: true },
    active: { type: Boolean, reflect: true },
    level:  { type: Number, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.href = '';
    this.active = false;
    this.level = 0;
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
