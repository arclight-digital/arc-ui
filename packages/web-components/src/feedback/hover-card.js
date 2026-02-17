import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { positionStyles } from '../shared/position-styles.js';

/**
 * @tag arc-hover-card
 */
export class ArcHoverCard extends LitElement {
  static properties = {
    position:   { type: String, reflect: true },
    openDelay:  { type: Number, attribute: 'open-delay' },
    closeDelay: { type: Number, attribute: 'close-delay' },
    _visible:   { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }

      .hovercard__trigger {
        display: inline-block;
      }

      .hovercard__card {
        position: absolute;
        z-index: var(--z-dropdown);
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--space-md);
        box-shadow: var(--shadow-overlay);
        min-width: 200px;
        max-width: 360px;
        opacity: 0;
        transform: scale(0.96);
        pointer-events: none;
        transition: opacity var(--transition-base), transform var(--transition-base);
      }

      .hovercard__card--visible {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
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
    positionStyles('hovercard__card', { scale: 0.96, openCls: 'hovercard__card--visible' }),
  ];

  constructor() {
    super();
    this.position = 'bottom';
    this.openDelay = 400;
    this.closeDelay = 300;
    this._visible = false;
    this._openTimeout = null;
    this._closeTimeout = null;
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKeyDown);
    clearTimeout(this._openTimeout);
    clearTimeout(this._closeTimeout);
  }

  _onKeyDown(e) {
    if (e.key === 'Escape' && this._visible) {
      this._hide();
    }
  }

  _scheduleOpen() {
    clearTimeout(this._closeTimeout);
    if (this._visible) return;
    this._openTimeout = setTimeout(() => {
      this._visible = true;
      this.dispatchEvent(new CustomEvent('arc-open', {
        bubbles: true,
        composed: true,
      }));
    }, this.openDelay);
  }

  _scheduleClose() {
    clearTimeout(this._openTimeout);
    if (!this._visible) return;
    this._closeTimeout = setTimeout(() => {
      this._hide();
    }, this.closeDelay);
  }

  _cancelClose() {
    clearTimeout(this._closeTimeout);
  }

  _hide() {
    clearTimeout(this._openTimeout);
    clearTimeout(this._closeTimeout);
    this._visible = false;
    this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div
        class="hovercard__trigger"
        @mouseenter=${this._scheduleOpen}
        @mouseleave=${this._scheduleClose}
        @focusin=${this._scheduleOpen}
        @focusout=${this._scheduleClose}
        part="trigger"
      >
        <slot></slot>
      </div>
      <div
        class="hovercard__card ${this._visible ? 'hovercard__card--visible' : ''}"
        @mouseenter=${this._cancelClose}
        @mouseleave=${this._scheduleClose}
        role="dialog"
        aria-hidden=${String(!this._visible)}
        part="card"
      >
        <slot name="content"></slot>
      </div>
    `;
  }
}
