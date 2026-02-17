import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-page-layout
 */
export class ArcPageLayout extends LitElement {
  static properties = {
    layout: { type: String, reflect: true },
    maxWidth: { type: String, attribute: 'max-width' },
    gap: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        box-sizing: border-box;
      }

      .page-layout {
        padding: var(--space-xl) var(--space-lg);
        gap: var(--gap);
        min-height: 100%;
        box-sizing: border-box;
      }

      /* Centered layout */
      :host([layout='centered']) .page-layout {
        display: block;
        max-width: var(--max-width);
        margin: 0 auto;
      }

      /* Wide layout */
      :host([layout='wide']) .page-layout {
        display: block;
      }

      /* Sidebar left layout */
      :host([layout='sidebar-left']) .page-layout {
        display: grid;
        grid-template-columns: 240px 1fr;
      }

      /* Sidebar right layout */
      :host([layout='sidebar-right']) .page-layout {
        display: grid;
        grid-template-columns: 1fr 300px;
      }

      .sidebar {
        display: none;
      }

      :host([layout='sidebar-left']) .sidebar {
        display: block;
      }

      .aside {
        display: none;
      }

      :host([layout='sidebar-right']) .aside {
        display: block;
      }

      .main {
        min-width: 0;
      }

      @media (max-width: 768px) { /* --breakpoint-md */
        :host([layout='sidebar-left']) .page-layout,
        :host([layout='sidebar-right']) .page-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.layout = 'centered';
    this.maxWidth = '1120px';
    this.gap = 'var(--space-xl)';
  }

  updated(changed) {
    if (changed.has('maxWidth')) {
      this.style.setProperty('--max-width', this.maxWidth);
    }
    if (changed.has('gap')) {
      this.style.setProperty('--gap', this.gap);
    }
  }

  render() {
    return html`
      <div class="page-layout" part="layout">
        <div class="sidebar" part="sidebar">
          <slot name="sidebar"></slot>
        </div>
        <div class="main" part="main">
          <slot></slot>
        </div>
        <div class="aside" part="aside">
          <slot name="aside"></slot>
        </div>
      </div>
    `;
  }
}
