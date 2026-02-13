import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcStatusBar extends LitElement {
  static properties = {
    position: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      :host([position='fixed']) {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
      }

      .status-bar {
        display: flex;
        align-items: center;
        height: 28px;
        padding: 0 var(--space-sm);
        background: var(--bg-deep);
        border-top: 1px solid var(--border-subtle);
        gap: var(--space-sm);
      }

      .status-bar__left {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      .status-bar__center {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex: 1;
        justify-content: center;
      }

      .status-bar__right {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
        margin-left: auto;
      }
    `,
  ];

  constructor() {
    super();
    this.position = 'static';
  }

  render() {
    return html`
      <div class="status-bar" part="base" role="status">
        <div class="status-bar__left" part="left">
          <slot name="left"></slot>
        </div>
        <div class="status-bar__center" part="center">
          <slot></slot>
        </div>
        <div class="status-bar__right" part="right">
          <slot name="right"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('arc-status-bar', ArcStatusBar);
