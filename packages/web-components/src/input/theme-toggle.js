import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-theme-toggle
 */
export class ArcThemeToggle extends LitElement {
  static properties = {
    theme:    { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    iconOnly: { type: Boolean, attribute: 'icon-only', reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .theme-toggle {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        background: transparent;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--space-sm);
        min-width: 90px;
        transition:
          background var(--transition-fast),
          border-color var(--transition-fast),
          color var(--transition-fast),
          box-shadow var(--transition-fast);
      }

      :host([icon-only]) .theme-toggle {
        min-width: 0;
        padding: calc(var(--space-xs) + 2px);
        border-radius: var(--radius-full);
        width: 36px;
        height: 36px;
      }

      .theme-toggle:hover {
        border-color: var(--border-bright);
        color: var(--text-primary);
        background: var(--bg-hover);
      }

      .theme-toggle:active {
        transform: scale(0.95);
      }

      .theme-toggle:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      /* ── Icon container ── */
      .theme-toggle__icon {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      /* All three icons sit on top of each other, opacity-animated */
      .theme-toggle__icon svg {
        position: absolute;
        inset: 0;
        opacity: 0;
        transform: scale(0.5) rotate(-90deg);
        transition: opacity 300ms var(--ease-out-expo), transform 300ms var(--ease-out-expo);
      }

      .theme-toggle__icon svg.is-active {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }

      /* ── Label ── */
      .theme-toggle__label {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        text-transform: capitalize;
        user-select: none;
        width: 32px;
        text-align: left;
      }

      :host([icon-only]) .theme-toggle__label {
        display: none;
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

  static _themeOrder = ['dark', 'light', 'auto'];

  constructor() {
    super();
    this.theme = 'auto';
    this.disabled = false;
    this.iconOnly = false;
  }

  connectedCallback() {
    super.connectedCallback();
    const stored = localStorage.getItem('arc-theme');
    if (stored && ArcThemeToggle._themeOrder.includes(stored)) {
      this.theme = stored;
    } else {
      this.theme = document.documentElement.getAttribute('data-theme') || 'auto';
    }
  }

  _cycle() {
    if (this.disabled) return;

    const order = ArcThemeToggle._themeOrder;
    const currentIdx = order.indexOf(this.theme);
    const nextIdx = (currentIdx + 1) % order.length;
    this.theme = order[nextIdx];

    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('arc-theme', this.theme);

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.theme },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this._cycle();
    }
  }

  render() {
    return html`
      <button
        class="theme-toggle"
        @click=${this._cycle}
        @keydown=${this._handleKeydown}
        ?disabled=${this.disabled}
        aria-label="Toggle theme, current: ${this.theme}"
        title="Theme: ${this.theme}"
        part="button"
      >
        <span class="theme-toggle__icon" part="icon">
          <!-- Sun -->
          <svg class="${this.theme === 'light' ? 'is-active' : ''}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon -->
          <svg class="${this.theme === 'dark' ? 'is-active' : ''}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          <!-- Monitor (auto) -->
          <svg class="${this.theme === 'auto' ? 'is-active' : ''}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </span>
        <span class="theme-toggle__label" part="label">${this.theme}</span>
      </button>
    `;
  }
}
