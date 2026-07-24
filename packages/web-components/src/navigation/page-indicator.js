import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Dot-based position indicator for page-level navigation or onboarding flows. Active dot fills
 * with accent-primary and scales up.
 *
 * @tag arc-page-indicator
 * @prop {number} count - Total number of dots to display.
 * @prop {number} value - Zero-based index of the active dot.
 * @prop {boolean} clickable - When true, dots become interactive tap targets that dispatch arc-change on click.
 * @fires {CustomEvent<{ value: number }>} arc-change - Fired when a dot is clicked (clickable mode only) with detail: { value }.
 * @csspart base
 * @csspart dot
 */
export class ArcPageIndicator extends LitElement {
  static properties = {
    count:     { type: Number },
    value:     { type: Number, reflect: true },
    clickable: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-flex;
      }

      .page-indicator {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .page-indicator__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--border-default);
        border: none;
        padding: 0;
        transition: all var(--transition-base);
      }

      :host([clickable]) .page-indicator__dot {
        cursor: pointer;
      }

      .page-indicator__dot:hover {
        background: var(--text-muted);
      }

      .page-indicator__dot.is-active {
        width: 10px;
        height: 10px;
        background: var(--interactive);
        box-shadow: 0 0 8px rgba(var(--interactive-rgb), 0.4);
      }
    `,
  ];

  constructor() {
    super();
    this.count = 0;
    this.value = 0;
    this.clickable = false;
  }

  _select(index) {
    if (!this.clickable) return;
    this.value = index;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const dots = [];
    for (let i = 0; i < this.count; i++) {
      dots.push(i);
    }

    return html`
      <div class="page-indicator" part="base" role="tablist" aria-label="Page indicator">
        ${dots.map(i => html`
          <button
            class="page-indicator__dot ${this.value === i ? 'is-active' : ''}"
            part="dot"
            role="tab"
            aria-selected=${this.value === i ? 'true' : 'false'}
            aria-label="Page ${i + 1}"
            @click=${() => this._select(i)}
            ?disabled=${!this.clickable}
          ></button>
        `)}
      </div>
    `;
  }
}
