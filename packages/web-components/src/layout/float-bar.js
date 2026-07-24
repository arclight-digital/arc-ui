import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Viewport-bottom floating toolbar with surface-overlay background, backdrop blur, and spring
 * easing. For bulk actions, unsaved-changes prompts.
 *
 * @tag arc-float-bar
 * @prop {boolean} open - Controls visibility of the float bar. Set to true when a triggering condition is met (e.g., items selected, form dirty) and false when the condition resolves.
 * @prop {'bottom' | 'top'} position - Which edge of the viewport the float bar appears at. Bottom is standard for bulk-action bars; top works for consent banners or global alerts.
 * @fires arc-open - Fired when the float bar becomes visible after the open prop is set to true.
 * @fires arc-close - Fired when the float bar hides after the open prop is set to false.
 * @slot - Default content.
 * @csspart bar
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
        background: var(--surface-overlay);
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
