import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-page-indicator
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
        background: var(--accent-primary);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.4);
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
