import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * A collapsible group within a Sidebar. Each section renders an optional heading label above its
 * child links, creating a visual and semantic grouping that mirrors your information architecture.
 * Fires an `arc-toggle` event with `{ open }` detail when the section is expanded or collapsed.
 *
 * @tag arc-sidebar-section
 * @prop {string} heading - Text label displayed above the group of links. Keep it short (one to three words) so the sidebar stays scannable. When omitted, links render without a heading divider.
 * @prop {boolean} collapsible - When true, the section heading becomes a toggle button that expands/collapses the child links.
 * @prop {boolean} open - Controls whether a collapsible section is expanded (true) or collapsed (false). Only relevant when collapsible is true.
 * @prop {string} icon - Name of an icon to render before the heading. Ignored when the section has no heading.
 * @fires {CustomEvent<{ open: boolean }>} arc-toggle - Fired when a collapsible section expands or collapses.
 * @slot - Default content.
 */
export class ArcSidebarSection extends DeclaredPropsMixin(LitElement) {
  static properties = {
    heading: { type: String, reflect: true },
    collapsible: flag(false),
    open: flag(true, { negative: 'no-open' }),
    icon: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: contents; }
  `;

  constructor() {
    super();
    this.heading = '';
    this.icon = '';
  }

  /** Get child arc-sidebar-link elements */
  get links() {
    return [...this.querySelectorAll(':scope > arc-sidebar-link')];
  }

  toggle() {
    if (this.collapsible) {
      this.open = !this.open;
      this.dispatchEvent(
        new CustomEvent('arc-toggle', {
          detail: { open: this.open },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
