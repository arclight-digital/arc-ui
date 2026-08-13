import { LitElement, html, css } from 'lit';
import { loneAnchorChild, resolveCarrierHref } from '../shared/anchor-adoption.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * A single entry inside NavigationMenu. When used at the top level and containing nested NavItem
 * children, it becomes a dropdown trigger. When used without children, it renders as a direct
 * navigation link. Nest one level deep to populate a dropdown panel.
 *
 * @tag arc-nav-item
 * @prop {string} href - Destination URL for the nav item. Required for leaf items that navigate. Omit on parent items that serve only as dropdown triggers.
 * @prop {boolean} active - Highlights the item with an accent-colored bottom border to indicate the current route. Set this on the top-level NavItem that corresponds to the active page.
 * @prop {'default' | 'primary' | 'muted'} variant - Visual style variant. `default` shows a subtle border and muted text with accent glow on active. `primary` uses accent-colored text and border in the resting state with a stronger glow on hover/active. `muted` renders a subdued style with no border and lighter text — ideal for secondary links like "Blog" or "Changelog".
 * @prop {string} description - Secondary text displayed below the item label inside a dropdown. Use this to add context like "Real-time dashboards and metrics" so users can scan the mega-menu without clicking through.
 * @slot - Default content.
 */
export class ArcNavItem extends DeclaredPropsMixin(LitElement) {
  static properties = {
    href: { type: String, reflect: true },
    active: flag(false),
    variant: oneOf(['default', 'primary', 'muted']),
    description: { type: String },
  };

  static styles = css`
    :host { display: contents; }
  `;

  constructor() {
    super();
    this.href = '';
    this.description = '';
  }

  /**
   * Destination, preferring the explicit attribute over an anchor child.
   *
   * Authoring `<arc-nav-item><a href="/docs">Docs</a></arc-nav-item>` makes the
   * pre-upgrade markup a working link list, which is what no-JS visitors and
   * anyone on a slow connection actually see — arc-navigation-menu hides this
   * light DOM only once it has upgraded and re-rendered it into shadow DOM.
   */
  get resolvedHref() {
    return resolveCarrierHref(this, this.href);
  }

  get label() {
    const anchor = loneAnchorChild(this);
    if (anchor) return anchor.textContent.trim();

    return [...this.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(' ');
  }

  /** Nested arc-nav-item children for dropdown menus. */
  get subItems() {
    return [...this.querySelectorAll(':scope > arc-nav-item')];
  }

  get hasChildren() {
    return this.subItems.length > 0;
  }

  render() {
    return html`<slot></slot>`;
  }
}
