import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-notification-panel
 */
export class ArcNotificationPanel extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    position: { type: String, reflect: true },
    maxHeight: { type: String, attribute: 'max-height' },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
        box-sizing: border-box;
      }

      .trigger {
        cursor: pointer;
      }

      /* ---- Panel shell ---- */
      .panel {
        position: absolute;
        top: calc(100% + var(--space-sm));
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        z-index: 1000;
        min-width: 340px;
        max-width: 400px;
        display: flex;
        flex-direction: column;

        /* closed state */
        opacity: 0;
        transform: translateY(-6px) scale(0.97);
        transform-origin: top right;
        pointer-events: none;

        /* closing transition — slightly faster */
        transition:
          opacity 120ms ease-in,
          transform 120ms ease-in;
      }

      :host([position='top-left']) .panel {
        transform-origin: top left;
      }

      :host([open]) .panel {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;

        /* opening transition — cubic overshoot for a pop feel */
        transition:
          opacity 180ms ease-out,
          transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      :host([position='top-right']) .panel {
        right: 0;
      }

      :host([position='top-left']) .panel {
        left: 0;
      }

      /* ---- Header ---- */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border-subtle);
        padding: var(--space-md);
        font-family: var(--font-body);
        font-weight: 600;
        font-size: var(--text-sm);
        color: var(--text-primary);
      }

      /* ---- Scrollable body ---- */
      .panel-body {
        overflow-y: auto;
        max-height: var(--max-height);
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
      }

      .panel-body::-webkit-scrollbar {
        width: 4px;
      }

      .panel-body::-webkit-scrollbar-track {
        background: transparent;
      }

      .panel-body::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: var(--radius-xs);
      }

      /* ---- Footer ---- */
      .footer {
        border-top: 1px solid var(--border-subtle);
        padding: var(--space-sm);
        text-align: center;
      }

      /* ---- Reduced motion ---- */
      @media (prefers-reduced-motion: reduce) {
        .panel,
        :host([open]) .panel {
          transition: opacity 100ms ease;
          transform: none;
        }
        :host([open]) .panel {
          transform: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.position = 'top-right';
    this.maxHeight = '400px';
    this._onOutsideClick = this._onOutsideClick.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onOutsideClick, true);
  }

  updated(changedProperties) {
    this.style.setProperty('--max-height', this.maxHeight);

    if (changedProperties.has('open')) {
      if (this.open) {
        // Defer so we don't catch the same click that opened the panel
        requestAnimationFrame(() => {
          document.addEventListener('click', this._onOutsideClick, true);
        });
        this.dispatchEvent(
          new CustomEvent('arc-open', { bubbles: true, composed: true })
        );
      } else {
        document.removeEventListener('click', this._onOutsideClick, true);
        if (changedProperties.get('open') === true) {
          this.dispatchEvent(
            new CustomEvent('arc-close', { bubbles: true, composed: true })
          );
        }
      }
    }
  }

  _onTriggerClick() {
    this.open = !this.open;
  }

  _onOutsideClick(e) {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
  }

  render() {
    return html`
      <div class="trigger" part="trigger" @click="${this._onTriggerClick}">
        <slot name="trigger"></slot>
      </div>
      <div class="panel" part="panel">
        <div class="header" part="header">
          <slot name="header"></slot>
        </div>
        <div class="panel-body" part="body">
          <slot></slot>
        </div>
        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}
