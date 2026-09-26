import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * A link in an `arc-settings-layout`'s navigation: one section of a settings page.
 *
 * Point `href` at the section's hash (`#profile`). The layout marks the item for
 * the current hash `active`, and it is drawn as the selected entry of a vertical
 * list, or as the selected tab of the row the nav becomes on a phone.
 *
 * @tag arc-settings-nav-item
 * @status stable
 * @prop {string} href - Where the item links to, usually a section's hash such as `#profile`.
 * @prop {boolean} active - Whether this is the current section. Managed by the parent layout from the URL hash; set it yourself when the layout is not in charge of routing.
 * @slot - The item's text, and an optional icon.
 * @csspart base - The link.
 */
export class ArcSettingsNavItem extends DeclaredPropsMixin(LitElement) {
  static properties = {
    href: { type: String },
    active: flag(false),
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .link {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-sm);
        font-family: var(--font-body);
        font-size: var(--ui-size);
        line-height: var(--ui-lh);
        color: var(--text-secondary);
        text-decoration: none;
        transition: background var(--transition-fast), color var(--transition-fast);
      }
      .link:hover { background: var(--surface-hover); color: var(--text-primary); }
      .link:focus-visible { outline: none; box-shadow: var(--interactive-focus); }

      :host([active]) .link {
        background: rgba(var(--interactive-rgb), 0.08);
        color: var(--text-primary);
        box-shadow: inset 2px 0 0 var(--interactive);
      }

      /* On a phone the layout's nav is a row of tabs (finding #120). The
         marker moves from the inline edge to the bottom edge with it. */
      @media (max-width: 768px) { /* --breakpoint-md */
        .link { white-space: nowrap; border-radius: 0; }
        :host([active]) .link {
          background: none;
          box-shadow: inset 0 -2px 0 var(--interactive);
        }
      }
    `,
  ];

  constructor() {
    super();
    this.href = '';
  }

  render() {
    return html`
      <a class="link" part="base" href=${this.href || nothing} aria-current=${this.active ? 'page' : nothing}>
        <slot></slot>
      </a>
    `;
  }
}
