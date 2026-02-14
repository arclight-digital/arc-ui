import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-copy-button
 */
export class ArcCopyButton extends LitElement {
  static properties = {
    value:    { type: String },
    disabled: { type: Boolean, reflect: true },
    _copied:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .copy-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs);
        background: var(--copy-btn-bg, var(--bg-elevated));
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--touch-pad) var(--space-sm);
        min-height: var(--touch-min);
        font-family: var(--font-body);
        font-size: var(--text-xs);
        line-height: 1;
        transition:
          background var(--transition-fast),
          border-color var(--transition-fast),
          color var(--transition-fast),
          box-shadow var(--transition-fast);
      }

      .copy-btn:hover {
        border-color: var(--border-bright);
        color: var(--text-primary);
        background: var(--bg-hover);
      }

      .copy-btn:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .copy-btn.is-copied {
        border-color: var(--color-success);
        color: var(--color-success);
      }

      .copy-btn__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
      }

      .copy-btn__label {
        user-select: none;
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
    this.value = '';
    this.disabled = false;
    this._copied = false;
    this._timeout = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  async _copy() {
    if (this.disabled || this._copied) return;

    try {
      await navigator.clipboard.writeText(this.value);
      this._copied = true;

      this.dispatchEvent(new CustomEvent('arc-copy', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }));

      this._timeout = setTimeout(() => {
        this._copied = false;
      }, 2000);
    } catch {
      // Clipboard API may fail in non-secure contexts
    }
  }

  render() {
    return html`
      <button
        class="copy-btn ${this._copied ? 'is-copied' : ''}"
        @click=${this._copy}
        ?disabled=${this.disabled}
        aria-label=${this._copied ? 'Copied' : 'Copy to clipboard'}
        part="button"
      >
        <span class="copy-btn__icon" part="icon">
          ${this._copied ? html`
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06l2.5 2.5 6.72-6.72a.75.75 0 011.06 0z"/>
            </svg>
          ` : html`
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
              <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
            </svg>
          `}
        </span>
        <span class="copy-btn__label" part="label">${this._copied ? 'Copied!' : 'Copy'}</span>
      </button>
    `;
  }
}
