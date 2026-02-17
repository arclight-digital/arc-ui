import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-settings-layout
 */
export class ArcSettingsLayout extends LitElement {
  static properties = {
    navPosition: { type: String, reflect: true, attribute: 'nav-position' },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        box-sizing: border-box;
      }

      /* Left nav layout */
      .settings-layout--left {
        display: grid;
        grid-template-columns: 220px 1fr;
        min-height: 100%;
      }

      .settings-layout--left .nav {
        padding: var(--space-lg);
        background: var(--surface-raised);
        border-right: 1px solid var(--divider);
      }

      .settings-layout--left .content {
        padding: var(--space-xl);
        flex: 1;
      }

      /* Top nav layout */
      .settings-layout--top {
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }

      .settings-layout--top .nav {
        padding: var(--space-lg);
        background: var(--surface-raised);
        border-bottom: 1px solid var(--divider);
      }

      .settings-layout--top .content {
        padding: var(--space-xl);
        flex: 1;
      }

      @media (max-width: 768px) { /* --breakpoint-md */
        .settings-layout--left {
          display: flex;
          flex-direction: column;
        }

        .settings-layout--left .nav {
          border-right: none;
          border-bottom: 1px solid var(--divider);
        }
      }
    `,
  ];

  constructor() {
    super();
    this.navPosition = 'left';
  }

  render() {
    const layoutClass =
      this.navPosition === 'top'
        ? 'settings-layout--top'
        : 'settings-layout--left';

    return html`
      <div class="${layoutClass}" part="layout">
        <div class="nav" part="nav">
          <slot name="nav"></slot>
        </div>
        <div class="content" part="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
