import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-guided-tour
 */
export class ArcGuidedTour extends LitElement {
  static properties = {
    steps:  { state: true },
    active: { state: true },
    open:   { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .tour__ring {
        position: fixed;
        z-index: 9999;
        border-radius: var(--radius-md);
        box-shadow:
          0 0 0 4000px var(--overlay-backdrop),
          0 0 0 3px rgba(var(--accent-primary-rgb), 0.5),
          0 0 24px rgba(var(--accent-primary-rgb), 0.4),
          0 0 48px rgba(var(--accent-primary-rgb), 0.2);
        transition: all var(--transition-base) var(--ease-out-expo);
        pointer-events: none;
      }

      .tour__tooltip {
        position: fixed;
        z-index: 10000;
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        padding: var(--space-lg);
        max-width: 340px;
      }

      .tour__counter {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: var(--space-xs);
      }

      .tour__title {
        font-weight: 600;
        font-size: var(--text-md);
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
      }

      .tour__content {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: var(--space-md);
      }

      .tour__controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-sm);
      }


      @media (prefers-reduced-motion: reduce) {
        .tour__ring { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.steps = [];
    this.active = 0;
    this.open = false;
    this._rect = null;
    this._onScroll = () => this._updatePosition();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('scroll', this._onScroll, true);
  }

  updated(changed) {
    if (changed.has('open') || changed.has('active') || changed.has('steps')) {
      this._updatePosition();
    }
    if (changed.has('open')) {
      if (this.open) {
        document.addEventListener('scroll', this._onScroll, { capture: true, passive: true });
      } else {
        document.removeEventListener('scroll', this._onScroll, true);
      }
    }
  }

  _updatePosition() {
    if (!this.open || !this.steps.length) {
      this._rect = null;
      this.requestUpdate();
      return;
    }
    const step = this.steps[this.active];
    if (!step || !step.target) {
      this._rect = null;
      this.requestUpdate();
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      const pad = 8;
      this._rect = {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      };
    } else {
      this._rect = null;
    }
    this.requestUpdate();
  }

  _next() {
    if (this.active < this.steps.length - 1) {
      this.active++;
      this.dispatchEvent(new CustomEvent('arc-change', {
        detail: { step: this.active },
        bubbles: true,
        composed: true,
      }));
    } else {
      this._complete();
    }
  }

  _prev() {
    if (this.active > 0) {
      this.active--;
      this.dispatchEvent(new CustomEvent('arc-change', {
        detail: { step: this.active },
        bubbles: true,
        composed: true,
      }));
    }
  }

  _complete() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-complete', { bubbles: true, composed: true }));
  }

  _dismiss() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-dismiss', { bubbles: true, composed: true }));
  }

  render() {
    if (!this.open || !this.steps.length) return html``;

    const step = this.steps[this.active];
    const isLast = this.active === this.steps.length - 1;
    const isFirst = this.active === 0;

    const r = this._rect;

    const ringStyle = r
      ? `top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;`
      : 'display:none;';

    const tooltipStyle = r
      ? `top:${r.top + r.height + 12}px;left:${r.left}px;`
      : 'top:50%;left:50%;transform:translate(-50%,-50%);';

    return html`
      <div class="tour__ring" style=${ringStyle} part="ring"></div>
      <div class="tour__tooltip" style=${tooltipStyle} part="tooltip">
        <div class="tour__counter" part="counter">Step ${this.active + 1} of ${this.steps.length}</div>
        <div class="tour__title" part="title">${step.title || ''}</div>
        <div class="tour__content" part="content">${step.content || ''}</div>
        <div class="tour__controls" part="controls">
          ${!isFirst ? html`
            <arc-button variant="ghost" size="sm" @click=${this._prev} part="prev">Back</arc-button>
          ` : html`<span></span>`}
          <arc-button variant="primary" size="sm" @click=${this._next} part="next">
            ${isLast ? 'Finish' : 'Next'}
          </arc-button>
        </div>
      </div>
    `;
  }
}
