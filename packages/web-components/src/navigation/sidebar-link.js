import { LitElement, html, css } from 'lit';
import { resolveCarrierHref } from '../shared/anchor-adoption.js';

/**
 * A navigation link rendered inside a SidebarSection. Supports an active state to indicate the
 * current page and provides focus-visible styling for keyboard navigation.
 *
 * @tag arc-sidebar-link
 * @prop {string} href - Destination URL for the link. Can be an absolute path, relative path, or hash anchor. The link renders as a standard anchor element for full accessibility and SEO.
 * @prop {boolean} active - When true, applies a highlighted style (accent-colored text and a left-edge indicator) to signal that this link corresponds to the currently viewed page. Only one link should be active at a time.
 * @prop {number} level - Nesting depth for visual indentation. Level 0 links render at default size; level 1+ links are indented and use a smaller font size.
 * @prop {string} icon - Name of an icon to render before the label. Use icons consistently within a section — a sidebar where only some links carry one reads as an oversight rather than a hierarchy.
 * @prop {boolean} external - Marks a destination that leaves the surrounding section — an app on its own route, another site, a repository. The link gains a persistent box-arrow glyph in place of the hover chevron, so the departure is legible before the click rather than after it.
 * @slot - Default content.
 */
export class ArcSidebarLink extends LitElement {
  static properties = {
    href:   { type: String, reflect: true },
    active: { type: Boolean, reflect: true },
    level:  { type: Number, reflect: true },
    icon:   { type: String, reflect: true },
    external: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.href = '';
    this.active = false;
    this.level = 0;
    this.icon = '';
    this.external = false;
  }

  /**
   * Destination, preferring the explicit attribute over an anchor child.
   * Authoring `<arc-sidebar-link><a href="/docs">Docs</a></arc-sidebar-link>`
   * leaves a working link in the pre-upgrade markup — arc-sidebar hides this
   * light DOM only once it has re-rendered it into shadow DOM.
   */
  get resolvedHref() {
    return resolveCarrierHref(this, this.href);
  }

  /** textContent already reaches through an anchor child, so this needs no special case. */
  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
