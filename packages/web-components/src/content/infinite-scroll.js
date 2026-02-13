import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../content/spinner.js';

export class ArcInfiniteScroll extends LitElement {
  static properties = {
    threshold: { type: Number },
    loading:   { type: Boolean, reflect: true },
    finished:  { type: Boolean, reflect: true },
    disabled:  { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .infinite-scroll {
        display: flex;
        flex-direction: column;
      }

      .infinite-scroll__content {
        display: contents;
      }

      .infinite-scroll__footer {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-lg) 0;
        min-height: 48px;
      }

      .infinite-scroll__sentinel {
        width: 100%;
        height: 1px;
        pointer-events: none;
      }

      .infinite-scroll__end-text {
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-muted);
        text-align: center;
        user-select: none;
      }
    `,
  ];

  constructor() {
    super();
    this.threshold = 200;
    this.loading = false;
    this.finished = false;
    this.disabled = false;
    this._observer = null;
  }

  firstUpdated() {
    this._setupObserver();
  }

  updated(changed) {
    if (changed.has('finished') || changed.has('disabled')) {
      this._setupObserver();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._destroyObserver();
  }

  _setupObserver() {
    this._destroyObserver();

    if (this.finished || this.disabled) return;

    const sentinel = this.shadowRoot.querySelector('.infinite-scroll__sentinel');
    if (!sentinel) return;

    this._observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !this.loading && !this.finished && !this.disabled) {
          this.dispatchEvent(new CustomEvent('arc-load-more', {
            bubbles: true,
            composed: true,
          }));
        }
      },
      {
        rootMargin: `0px 0px ${this.threshold}px 0px`,
      },
    );

    this._observer.observe(sentinel);
  }

  _destroyObserver() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  render() {
    return html`
      <div
        class="infinite-scroll"
        role="feed"
        aria-busy=${this.loading ? 'true' : 'false'}
        part="container"
      >
        <div class="infinite-scroll__content" part="content">
          <slot></slot>
        </div>

        ${this.finished
          ? html`
            <div class="infinite-scroll__footer" part="footer">
              <span class="infinite-scroll__end-text" part="end-text">No more items</span>
            </div>
          `
          : html`
            <div class="infinite-scroll__footer" part="footer">
              ${this.loading
                ? html`<arc-spinner size="sm" part="spinner"></arc-spinner>`
                : ''
              }
            </div>
            <div class="infinite-scroll__sentinel"></div>
          `
        }
      </div>
    `;
  }
}

customElements.define('arc-infinite-scroll', ArcInfiniteScroll);
