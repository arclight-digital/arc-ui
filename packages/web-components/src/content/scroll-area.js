import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-scroll-area
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
