import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Styled scrollable container with custom thin scrollbar styling for Webkit and Firefox,
 * configurable orientation, and optional max-height constraint.
 *
 * @tag arc-scroll-area
 * @prop {string} maxHeight - CSS max-height value applied to the scrollable container. Use any valid CSS length (e.g. `300px`, `50vh`).
 * @prop {'vertical' | 'horizontal' | 'both'} orientation - Scroll direction. `vertical` shows a vertical scrollbar, `horizontal` shows a horizontal scrollbar, `both` shows both.
 * @slot - Default content.
 * @csspart scroll-area
 */
export class ArcScrollArea extends LitElement {
  static properties = {
    maxHeight:    { type: String, attribute: 'max-height', reflect: true },
    orientation:  { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        position: relative;
      }

      .scroll-area {
        overflow: hidden;
        scroll-behavior: smooth;
        border-radius: inherit;
      }

      /* Orientation variants */
      :host([orientation="vertical"]) .scroll-area,
      :host(:not([orientation])) .scroll-area {
        overflow-y: auto;
        overflow-x: hidden;
      }

      :host([orientation="horizontal"]) .scroll-area {
        overflow-x: auto;
        overflow-y: hidden;
      }

      :host([orientation="both"]) .scroll-area {
        overflow: auto;
      }

      /* Webkit scrollbar styling */
      .scroll-area::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      .scroll-area::-webkit-scrollbar-track {
        background: var(--surface-overlay);
        border-radius: var(--radius-full);
      }

      .scroll-area::-webkit-scrollbar-thumb {
        background: var(--border-bright);
        border-radius: var(--radius-full);
        transition: background var(--transition-fast);
      }

      .scroll-area::-webkit-scrollbar-thumb:hover {
        background: var(--text-ghost);
      }

      .scroll-area::-webkit-scrollbar-corner {
        background: var(--surface-overlay);
      }

      /* Firefox scrollbar styling */
      .scroll-area {
        scrollbar-width: thin;
        scrollbar-color: var(--border-bright) var(--surface-overlay);
      }

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.maxHeight = '';
    this.orientation = 'vertical';
  }

  render() {
    const styles = this.maxHeight ? `max-height: ${this.maxHeight}` : '';

    return html`
      <div
        class="scroll-area"
        style=${styles}
        tabindex="0"
        role="region"
        aria-label="Scrollable content"
        part="scroll-area"
      >
        <slot></slot>
      </div>
    `;
  }
}
