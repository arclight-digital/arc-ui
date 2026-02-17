import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-page-header
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

      .page-header__heading {
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
          <h1 class="page-header__heading" part="heading">${this.heading}</h1>
          <div class="page-header__aside" part="aside">
            <slot name="aside"></slot>
          </div>
        </div>
        ${this.description
          ? html`<p class="page-header__description" part="description">${this.description}</p>`
          : ''}
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
