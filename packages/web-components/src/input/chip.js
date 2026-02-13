import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcChip extends LitElement {
  static properties = {
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    value:    { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
        padding: calc(var(--space-xs) + 2px) var(--space-md);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-full);
        background: var(--bg-hover);
        cursor: pointer;
        user-select: none;
        transition:
          background var(--transition-base),
          border-color var(--transition-base),
          color var(--transition-base),
          box-shadow var(--transition-base);
        line-height: 1.4;
        outline: none;
      }

      .chip:hover {
        border-color: var(--border-bright);
        background: var(--bg-elevated);
      }

      :host([selected]) .chip {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
        background: var(--accent-primary-subtle);
        box-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.15);
      }

      :host([selected]) .chip:hover {
        box-shadow: 0 0 16px rgba(var(--accent-primary-rgb), 0.25);
      }

      .chip:focus-visible {
        box-shadow: var(--focus-glow);
      }

      :host([selected]) .chip:focus-visible {
        box-shadow: var(--focus-glow), 0 0 12px rgba(var(--accent-primary-rgb), 0.15);
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
    this.selected = false;
    this.disabled = false;
    this.value = '';
  }

  _toggle() {
    if (this.disabled) return;
    this.selected = !this.selected;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value, selected: this.selected },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggle();
    }
  }

  render() {
    return html`
      <span
        class="chip"
        role="option"
        aria-selected=${this.selected ? 'true' : 'false'}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this._toggle}
        @keydown=${this._handleKeydown}
        part="chip"
      >
        <slot></slot>
      </span>
    `;
  }
}

customElements.define('arc-chip', ArcChip);
