import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-spotlight
 */
export class ArcSpotlight extends LitElement {
  static properties = {
    target:  { type: String },
    active:  { type: Boolean, reflect: true },
    padding: { type: Number },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .spotlight__ring {
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
    `,
  ];

  constructor() {
    super();
    this.target = '';
    this.active = false;
    this.padding = 8;
    this._rect = null;
    this._onDocClick = (e) => {
      const el = this.target ? document.querySelector(this.target) : null;
      if (!el || !el.contains(e.target)) this._dismiss();
    };
    this._onScroll = () => this._updatePosition();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('scroll', this._onScroll, true);
  }

  updated(changed) {
    if (changed.has('active') || changed.has('target')) {
      this._updatePosition();
      if (this.active) {
        requestAnimationFrame(() => document.addEventListener('click', this._onDocClick));
        document.addEventListener('scroll', this._onScroll, { capture: true, passive: true });
      } else {
        document.removeEventListener('click', this._onDocClick);
        document.removeEventListener('scroll', this._onScroll, true);
      }
    }
  }

  _updatePosition() {
    if (!this.active || !this.target) {
      this._rect = null;
      this.requestUpdate();
      return;
    }
    const el = document.querySelector(this.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      this._rect = {
        top: rect.top - this.padding,
        left: rect.left - this.padding,
        width: rect.width + this.padding * 2,
        height: rect.height + this.padding * 2,
      };
    } else {
      this._rect = null;
    }
    this.requestUpdate();
  }

  _dismiss() {
    this.active = false;
    this.dispatchEvent(new CustomEvent('arc-dismiss', { bubbles: true, composed: true }));
  }

  render() {
    if (!this.active || !this._rect) return html``;

    const ringStyle = `top:${this._rect.top}px;left:${this._rect.left}px;width:${this._rect.width}px;height:${this._rect.height}px;`;

    return html`
      <div class="spotlight__ring" style=${ringStyle} part="ring"></div>
    `;
  }
}
