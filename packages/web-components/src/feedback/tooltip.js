import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-tooltip
 */
export class ArcTooltip extends LitElement {
  static properties = {
    content:   { type: String },
    position:  { type: String, reflect: true },
    delay:     { type: Number },
    _visible:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }

      .tooltip__trigger {
        display: inline-block;
      }

      .tooltip__popup {
        position: absolute;
        z-index: 1000;
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        padding: var(--space-xs) var(--space-sm);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity var(--transition-fast);
        box-shadow: var(--shadow-overlay);
      }

      :host .tooltip__popup.is-visible {
        opacity: 1;
      }

      /* Arrow */
      .tooltip__arrow {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        transform: rotate(45deg);
      }

      /* Positions */
      :host(:not([position])) .tooltip__popup,
      :host([position="top"]) .tooltip__popup {
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
      }
      :host(:not([position])) .tooltip__arrow,
      :host([position="top"]) .tooltip__arrow {
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        border-top: none;
        border-left: none;
      }

      :host([position="bottom"]) .tooltip__popup {
        top: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
      }
      :host([position="bottom"]) .tooltip__arrow {
        top: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        border-bottom: none;
        border-right: none;
      }

      :host([position="left"]) .tooltip__popup {
        right: calc(100% + 8px);
        top: 50%;
        transform: translateY(-50%);
      }
      :host([position="left"]) .tooltip__arrow {
        right: -5px;
        top: 50%;
        transform: translateY(-50%) rotate(45deg);
        border-bottom: none;
        border-left: none;
      }

      :host([position="right"]) .tooltip__popup {
        left: calc(100% + 8px);
        top: 50%;
        transform: translateY(-50%);
      }
      :host([position="right"]) .tooltip__arrow {
        left: -5px;
        top: 50%;
        transform: translateY(-50%) rotate(45deg);
        border-top: none;
        border-right: none;
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

  static _idCounter = 0;

  constructor() {
    super();
    this.content = '';
    this.position = 'top';
    this.delay = 200;
    this._visible = false;
    this._showTimeout = null;
    this._tooltipId = `tooltip-${++ArcTooltip._idCounter}`;
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKeyDown);
    clearTimeout(this._showTimeout);
  }

  _onKeyDown(e) {
    if (e.key === 'Escape' && this._visible) {
      this._hide();
    }
  }

  _show() {
    this._showTimeout = setTimeout(() => {
      this._visible = true;
    }, this.delay);
  }

  _hide() {
    clearTimeout(this._showTimeout);
    this._visible = false;
  }

  render() {
    return html`
      <div
        class="tooltip__trigger"
        @mouseenter=${this._show}
        @mouseleave=${this._hide}
        @focusin=${this._show}
        @focusout=${this._hide}
        aria-describedby=${this._tooltipId}
        part="trigger"
      >
        <slot></slot>
      </div>
      <div
        class="tooltip__popup ${this._visible ? 'is-visible' : ''}"
        role="tooltip"
        id=${this._tooltipId}
        part="popup"
      >
        ${this.content}
        <div class="tooltip__arrow"></div>
      </div>
    `;
  }
}
