import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Page title area with positional slots for composing breadcrumbs, actions, tabs, or any content
 * around a heading and description.
 *
 * @tag arc-page-header
 * @prop {string} heading - The page title rendered as an <h1>. This is the primary text landmark and should clearly describe the current page or view (e.g. "Team Settings", "Order #4021"). Keep it concise — two to five words is ideal.
 * @prop {string} description - Optional supporting text displayed below the title row. Use it to provide a one-line summary of what the page contains or what action the user should take. When empty, the description paragraph is not rendered.
 * @prop {boolean} border - When set, renders a subtle bottom border below the header to visually separate it from page content.
 * @slot above
 * @slot heading
 * @slot aside
 * @slot description
 * @slot below
 * @slot - Default content.
 * @csspart base
 * @csspart above
 * @csspart title-row
 * @csspart heading
 * @csspart aside
 * @csspart description
 * @csspart below
 * @csspart content
 */
export class ArcPageHeader extends LitElement {
  static properties = {
    heading: { type: String },
    description: { type: String },
    border: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-body);
      }

      .page-header {
        padding: 0 0 var(--space-md);
      }

      :host([border]) .page-header {
        border-bottom: 1px solid var(--divider);
      }

      .page-header__above {
        margin-bottom: var(--space-sm);
      }

      .page-header__title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        flex-wrap: wrap;
      }

      .page-header__heading,
      slot[name='heading']::slotted(*) {
        margin: 0;
        font-family: var(--font-body);
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.2;
      }

      .page-header__aside {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      .page-header__description {
        margin-top: var(--space-sm);
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: 1.5;
      }

      slot[name='description']::slotted(*) {
        margin: var(--space-sm) 0 0;
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: 1.5;
      }

      .page-header__below {
        margin-top: var(--space-md);
      }

      .page-header__content {
        margin-top: var(--space-md);
      }
    `,
  ];

  constructor() {
    super();
    this.heading = '';
    this.description = '';
    this.border = false;
  }

  render() {
    return html`
      <div class="page-header" part="base">
        <div class="page-header__above" part="above">
          <slot name="above"></slot>
        </div>
        <div class="page-header__title-row" part="title-row">
          ${this.heading
            ? html`<h1 class="page-header__heading" part="heading">${this.heading}</h1>`
            : html`<slot name="heading"></slot>`}
          <div class="page-header__aside" part="aside">
            <slot name="aside"></slot>
          </div>
        </div>
        ${this.description
          ? html`<p class="page-header__description" part="description">${this.description}</p>`
          : html`<slot name="description"></slot>`}
        <div class="page-header__below" part="below">
          <slot name="below"></slot>
        </div>
        <div class="page-header__content" part="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
