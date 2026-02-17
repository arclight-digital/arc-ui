import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { positionStyles } from '../shared/position-styles.js';

/**
 * @tag arc-popover
 */
export class ArcPopover extends LitElement {
  static properties = {
    open:     { type: Boolean, reflect: true },
    position: { type: String, reflect: true },
    trigger:  { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }

      .popover__trigger {
        display: inline-block;
        cursor: pointer;
      }

      .popover__panel {
        position: absolute;
        z-index: 100;
        min-width: 200px;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        box-shadow: var(--shadow-overlay);
        opacity: 0;
        visibility: hidden;
        transform: scale(0.95);
        transition:
          opacity var(--transition-base),
          visibility var(--transition-base),
          transform var(--transition-base);
        pointer-events: none;
      }

      :host([open]) .popover__panel {
        opacity: 1;
        visibility: visible;
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
    positionStyles('popover__panel'),
  ];

  constructor() {
    super();
    this.open = false;
    this.position = 'bottom';
    this.trigger = '';
    this._onDocumentClick = this._onDocumentClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  updated(changed) {
    if (changed.has('open')) {
      if (this.open) {
        // Defer so the opening click doesn't immediately close
        requestAnimationFrame(() => {
          document.addEventListener('click', this._onDocumentClick);
        });
        document.addEventListener('keydown', this._onKeyDown);
      } else {
        document.removeEventListener('click', this._onDocumentClick);
        document.removeEventListener('keydown', this._onKeyDown);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onDocumentClick);
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _onDocumentClick(e) {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._close();
    }
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') {
      this._close();
    }
  }

  _toggle() {
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent(this.open ? 'arc-open' : 'arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  _close() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div
        class="popover__trigger"
        @click=${this._toggle}
        aria-haspopup="true"
        aria-expanded=${this.open ? 'true' : 'false'}
        part="trigger"
      >
        <slot name="trigger"></slot>
      </div>
      <div
        class="popover__panel"
        role="dialog"
        aria-hidden=${this.open ? 'false' : 'true'}
        part="panel"
      >
        <slot></slot>
      </div>
    `;
  }
}
