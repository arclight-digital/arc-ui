import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { setTriggerAria } from '../shared/trigger-aria.js';

/**
 * Contextual hint that appears on hover or focus, providing supplementary information without
 * cluttering the UI. Supports four placement positions and a configurable show delay.
 *
 * @tag arc-tooltip
 * @prop {string} content - The plain-text string displayed inside the tooltip popup. Keep this concise — one short phrase that describes the trigger element or provides a supplementary hint. HTML is not supported; for rich content, use the Popover component instead.
 * @prop {'top' | 'bottom' | 'left' | 'right'} position - Controls which side of the trigger the tooltip appears on. Top is the most common default. Switch to bottom, left, or right when the trigger sits near a viewport edge or when the surrounding layout makes another direction more natural.
 * @prop {number} delay - Time in milliseconds to wait after mouseenter or focusin before the tooltip becomes visible. The default of 200 ms prevents accidental activation during casual pointer movement. Increase to 400-600 ms in dense toolbars; avoid setting to 0 as it creates a jittery experience.
 * @slot - Default content.
 * @csspart trigger
 * @csspart popup
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
        z-index: var(--z-tooltip);
        background: var(--surface-overlay);
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
        overflow: hidden;
      }

      .tooltip__popup::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--divider-glow);
      }

      :host .tooltip__popup.is-visible {
        opacity: 1;
      }

      /* No-JS fallback for the static HTML export: reveal on hover/focus.
         The component adds .is-managed at runtime (never in the template, so
         it can't leak into the export), which disables this rule and leaves
         the configured show delay in charge. */
      .tooltip__trigger:hover + .tooltip__popup:not(.is-managed),
      .tooltip__trigger:focus-within + .tooltip__popup:not(.is-managed) {
        opacity: 1;
      }

      /* Arrow */
      .tooltip__arrow {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--surface-overlay);
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

  updated(changed) {
    if (changed.has('content')) {
      this._syncTriggerAria();
    }
    // Re-added after every render: the popup's class attribute binding
    // rewrites the whole attribute and would otherwise drop the marker.
    this.shadowRoot.querySelector('.tooltip__popup')?.classList.add('is-managed');
  }

  /**
   * The tooltip text lives in this component's shadow root, so an
   * aria-describedby id reference from the slotted (light-DOM) trigger cannot
   * cross the shadow boundary. Instead, forward the tooltip text itself as
   * aria-description on the slotted trigger element.
   */
  _syncTriggerAria() {
    setTriggerAria(
      this.shadowRoot.querySelector('.tooltip__trigger slot'),
      { 'aria-description': this.content || null }
    );
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
        part="trigger"
      >
        <slot @slotchange=${this._syncTriggerAria}></slot>
      </div>
      <div
        class="tooltip__popup ${this._visible ? 'is-visible' : ''}"
        role="tooltip"
        id=${this._tooltipId}
        aria-hidden=${this._visible ? 'false' : 'true'}
        part="popup"
      >
        ${this.content}
        <div class="tooltip__arrow"></div>
      </div>
    `;
  }
}
