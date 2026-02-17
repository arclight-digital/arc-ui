import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-scroll-spy
 * @requires arc-spy-link
 */
export class ArcScrollSpy extends LitElement {
  static properties = {
    active:  { type: String, reflect: true },
    offset:  { type: Number },
    _active: { state: true },
    _links:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .scroll-spy {
        padding: 0 var(--space-md);
      }

      .scroll-spy__heading {
        display: block;
        width: 100%;
        text-align: left;
        cursor: pointer;
        position: sticky;
        top: 0;
        z-index: 1;
        background: var(--surface-primary);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
        margin-bottom: var(--space-sm);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .scroll-spy__heading:hover {
        border-color: var(--border-default);
        box-shadow: var(--glow-card-hover);
      }

      .scroll-spy__heading-text {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 3px;
        text-transform: uppercase;
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .scroll-spy__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 2px; /* cosmetic micro-spacing */
      }

      .scroll-spy__item {
        display: block;
      }

      .scroll-spy__link {
        display: flex;
        align-items: center;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        line-height: 1.4;
        color: var(--text-ghost);
        text-decoration: none;
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition:
          color var(--transition-fast),
          background var(--transition-fast),
          box-shadow var(--transition-fast);
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        min-height: var(--touch-min);
      }

      .scroll-spy__link:hover {
        color: var(--text-secondary);
        background: rgba(var(--white-rgb), 0.03);
      }

      .scroll-spy__link[aria-current="true"] {
        color: var(--text-primary);
        background: rgba(var(--interactive-rgb), 0.06);
        box-shadow: 0 0 12px rgba(var(--interactive-rgb), 0.08);
      }

      .scroll-spy__link--nested {
        font-size: var(--text-xs);
        color: var(--text-ghost);
      }

      .scroll-spy__slot-host { display: none; }

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
    this.active = '';
    this.offset = 80;
    this._active = '';
    this._links = [];
    this._observer = null;
    this._rafId = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._setupObserver();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  _onSlotChange(e) {
    this._links = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-SPY-LINK');
    this._setupObserver();
  }

  updated(changed) {
    if (changed.has('_links')) {
      this._setupObserver();
    }
  }

  _setupObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    if (this._observer) {
      this._observer.disconnect();
    }

    this._observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this._active = entry.target.id;
            this.active = entry.target.id;
            this.dispatchEvent(new CustomEvent('arc-change', {
              detail: { value: this._active },
              bubbles: true,
              composed: true,
            }));
          }
        }
      },
      { rootMargin: `-${this.offset}px 0px -60% 0px` }
    );

    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      if (!this._observer) return;
      for (const link of this._links) {
        if (!link.target) continue;
        const el = document.getElementById(link.target);
        if (el) this._observer.observe(el);
      }
    });
  }

  _scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Walk up from the host to find the nearest scrollable ancestor
    // (crosses shadow DOM boundaries via assignedSlot)
    let el = this.assignedSlot?.parentElement ?? this.parentElement;
    while (el) {
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }
      el = el.assignedSlot?.parentElement ?? el.parentElement;
    }
  }

  _handleClick(target) {
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this._active = target;
    this.active = target;
  }

  render() {
    return html`
      <div class="scroll-spy__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <nav class="scroll-spy" part="scroll-spy" aria-label="Table of contents">
        <button class="scroll-spy__heading" part="heading" @click=${this._scrollToTop}><span class="scroll-spy__heading-text">On this page</span></button>
        <ul class="scroll-spy__list" part="list">
          ${this._links.map((link) => {
            const level = link.level || 0;
            return html`
            <li class="scroll-spy__item">
              <button
                class="scroll-spy__link ${level > 0 ? 'scroll-spy__link--nested' : ''}"
                aria-current=${this._active === link.target ? 'true' : 'false'}
                @click=${() => this._handleClick(link.target)}
                part="link"
                style=${level > 0 ? `padding-left: ${level * 14 + 8}px` : ''}
              >${link.label}</button>
            </li>
          `})}
        </ul>
      </nav>
    `;
  }
}
