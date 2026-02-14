import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcPagination extends LitElement {
  static properties = {
    total:    { type: Number },
    current:  { type: Number, reflect: true },
    siblings: { type: Number },
    compact:  { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }

      .pagination {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-body);
      }

      .pagination__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        padding: 0 var(--space-sm);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        cursor: pointer;
        transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
        user-select: none;
      }

      .pagination__btn:hover:not(:disabled):not(.is-active) {
        border-color: var(--border-bright);
        color: var(--text-primary);
        background: var(--bg-hover);
      }

      .pagination__btn:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .pagination__btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .pagination__btn.is-active {
        background: var(--accent-primary);
        border-color: var(--accent-primary);
        color: var(--text-primary);
        box-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.4);
      }

      /* Compact: show current/total between prev/next */
      .pagination__compact-label {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--text-muted);
        padding: 0 var(--space-sm);
        white-space: nowrap;
      }

      .pagination__ellipsis {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        color: var(--text-muted);
        font-size: var(--text-sm);
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
    this.total = 1;
    this.current = 1;
    this.siblings = 1;
    this.compact = false;
  }

  _getPageRange() {
    const total = Math.max(1, this.total);
    const current = Math.min(Math.max(1, this.current), total);
    const siblings = Math.max(0, this.siblings);

    // Always show first, last, current, and siblings around current
    const pages = new Set();
    pages.add(1);
    pages.add(total);

    const start = Math.max(2, current - siblings);
    const end = Math.min(total - 1, current + siblings);
    for (let i = start; i <= end; i++) {
      pages.add(i);
    }

    const sorted = [...pages].sort((a, b) => a - b);

    // Insert ellipsis markers
    const result = [];
    let prev = 0;
    for (const page of sorted) {
      if (page - prev > 1) {
        result.push('...');
      }
      result.push(page);
      prev = page;
    }

    return result;
  }

  _goToPage(page) {
    if (page < 1 || page > this.total || page === this.current) return;
    this.current = page;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.current },
      bubbles: true,
      composed: true,
    }));
  }

  _prev() { this._goToPage(this.current - 1); }
  _next() { this._goToPage(this.current + 1); }

  render() {
    const pages = this._getPageRange();
    const prevBtn = html`
      <button class="pagination__btn" @click=${this._prev} ?disabled=${this.current <= 1} aria-label="Previous page" part="prev">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M10.78 3.22a.75.75 0 010 1.06L7.06 8l3.72 3.72a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"/>
        </svg>
      </button>`;
    const nextBtn = html`
      <button class="pagination__btn" @click=${this._next} ?disabled=${this.current >= this.total} aria-label="Next page" part="next">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M5.22 12.78a.75.75 0 010-1.06L8.94 8 5.22 4.28a.75.75 0 011.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0z"/>
        </svg>
      </button>`;

    if (this.compact) {
      return html`
        <nav class="pagination" role="navigation" aria-label="Pagination" part="pagination">
          ${prevBtn}
          <span class="pagination__compact-label" part="label">${this.current} / ${this.total}</span>
          ${nextBtn}
        </nav>
      `;
    }

    return html`
      <nav class="pagination" role="navigation" aria-label="Pagination" part="pagination">
        ${prevBtn}
        ${pages.map(page =>
          page === '...'
            ? html`<span class="pagination__ellipsis" part="ellipsis" aria-hidden="true">&hellip;</span>`
            : html`
              <button
                class="pagination__btn ${page === this.current ? 'is-active' : ''}"
                @click=${() => this._goToPage(page)}
                aria-label="Page ${page}"
                aria-current=${page === this.current ? 'page' : 'false'}
                part="page"
              >${page}</button>
            `
        )}
        ${nextBtn}
      </nav>
    `;
  }
}

customElements.define('arc-pagination', ArcPagination);
