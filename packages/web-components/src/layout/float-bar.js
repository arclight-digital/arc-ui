import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-float-bar
 */
export class ArcFloatBar extends LitElement {
  static properties = {
    open:     { type: Boolean, reflect: true },
    position: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: contents;
      }

      .float-bar {
        position: fixed;
        left: 50%;
        transform: translateX(-50%) translateY(0);
        background: var(--bg-elevated);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        padding: var(--space-sm);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        z-index: 100;
        transition: transform var(--transition-base) var(--ease-out-expo),
                    opacity var(--transition-base) var(--ease-out-expo);
        opacity: 1;
      }

      /* Bottom (default) */
      :host(:not([position="top"])) .float-bar {
        bottom: var(--space-lg);
      }

      :host(:not([position="top"]):not([open])) .float-bar {
        transform: translateX(-50%) translateY(calc(100% + var(--space-lg)));
        opacity: 0;
        pointer-events: none;
      }

      /* Top */
      :host([position="top"]) .float-bar {
        top: var(--space-lg);
      }

      :host([position="top"]:not([open])) .float-bar {
        transform: translateX(-50%) translateY(calc(-100% - var(--space-lg)));
        opacity: 0;
        pointer-events: none;
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.position = 'bottom';
  }

  updated(changed) {
    if (changed.has('open')) {
      this.dispatchEvent(
        new CustomEvent(this.open ? 'arc-open' : 'arc-close', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  render() {
    return html`
      <div class="float-bar" part="bar">
        <slot></slot>
      </div>
    `;
  }
}
