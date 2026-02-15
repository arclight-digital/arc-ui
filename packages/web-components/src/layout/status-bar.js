import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-status-bar
 */
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

      .status-bar__start {
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

      .status-bar__end {
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
        <div class="status-bar__start" part="start">
          <slot name="start"></slot>
        </div>
        <div class="status-bar__center" part="center">
          <slot></slot>
        </div>
        <div class="status-bar__end" part="end">
          <slot name="end"></slot>
        </div>
      </div>
    `;
  }
}
