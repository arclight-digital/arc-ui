import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @arc-prism interactive
 */
export class ArcScrollToTop extends LitElement {
  static properties = {
    threshold: { type: Number },
    smooth:    { type: Boolean },
    position:  { type: String, reflect: true },
    offset:    { type: String },
    _visible:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .scroll-to-top {
        position: fixed;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-full);
        background: var(--bg-elevated);
        box-shadow: var(--shadow-md);
        color: var(--text-muted);
        cursor: pointer;
        opacity: 0;
        transform: translateY(12px);
        pointer-events: none;
        transition:
          opacity var(--transition-fast),
          transform var(--transition-fast),
          background var(--transition-fast),
          border-color var(--transition-fast),
          color var(--transition-fast),
          box-shadow var(--transition-fast);
      }

      .scroll-to-top.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .scroll-to-top:hover {
        background: var(--accent-primary-subtle);
        border-color: var(--accent-primary-border);
        color: var(--accent-primary);
      }

      .scroll-to-top:active {
        transform: scale(0.95);
      }

      .scroll-to-top.visible:active {
        transform: scale(0.95);
      }

      .scroll-to-top:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .scroll-to-top svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* Position variants */
      :host(:not([position])) .scroll-to-top,
      :host([position="bottom-right"]) .scroll-to-top {
        bottom: var(--_offset);
        right: var(--_offset);
      }

      :host([position="bottom-left"]) .scroll-to-top {
        bottom: var(--_offset);
        left: var(--_offset);
      }

      @media (prefers-reduced-motion: reduce) {
        .scroll-to-top {
          transition: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.threshold = 300;
    this.smooth = true;
    this.position = 'bottom-right';
    this.offset = 'var(--space-lg)';
    this._visible = false;
    this._onScroll = this._onScroll.bind(this);
    this._ticking = false;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this._onScroll, { passive: true });
    // Check initial scroll position
    this._checkScroll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this._onScroll);
  }

  _onScroll() {
    if (!this._ticking) {
      this._ticking = true;
      requestAnimationFrame(() => {
        this._checkScroll();
        this._ticking = false;
      });
    }
  }

  _checkScroll() {
    this._visible = window.scrollY > this.threshold;
  }

  _scrollToTop() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = this.smooth && !prefersReducedMotion ? 'smooth' : 'instant';
    window.scrollTo({ top: 0, behavior });
  }

  render() {
    return html`
      <button
        class="scroll-to-top ${this._visible ? 'visible' : ''}"
        style="--_offset: ${this.offset}"
        @click=${this._scrollToTop}
        aria-label="Scroll to top"
        part="button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    `;
  }
}

customElements.define('arc-scroll-to-top', ArcScrollToTop);
