import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { PositionController } from '../shared/position-controller.js';
import { ClickOutsideController } from '../shared/click-outside.js';

/**
 * Notification dropdown panel triggered by a button.
 *
 * @tag arc-notification-panel
 * @prop {boolean} open - Controls whether the notification panel is visible. Toggle this programmatically or let the built-in trigger click handler manage it.
 * @prop {'top-right' | 'top-left'} position - Horizontal alignment of the panel relative to the trigger element. Use top-right when the trigger is near the right edge of the viewport.
 * @prop {string} maxHeight - Maximum height of the scrollable body area. Prevents long notification lists from overflowing the viewport.
 * @fires {CustomEvent<void>} arc-open - Fired when the notification panel opens
 * @fires {CustomEvent<void>} arc-close - Fired when the notification panel closes
 * @slot trigger
 * @slot header
 * @slot - Default content.
 * @slot footer
 * @csspart trigger
 * @csspart panel
 * @csspart header
 * @csspart body
 * @csspart footer
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
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        z-index: var(--z-dropdown);
        min-width: 340px;
        max-width: 400px;
        display: flex;
        flex-direction: column;

        /* closed state */
        opacity: 0;
        transform: translateY(-6px) scale(0.97);
        transform-origin: top right;
        pointer-events: none;

        /* closing transition — slightly faster.
           display and overlay ride along with allow-discrete so the panel keeps
           painting through the close once PositionController has promoted it to
           the top layer, where "closed" means display:none. */
        transition:
          opacity 120ms var(--ease-in),
          transform 120ms var(--ease-in),
          display 120ms allow-discrete,
          overlay 120ms allow-discrete;
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
          opacity 180ms var(--ease-standard),
          transform 250ms var(--ease-spring),
          display 180ms allow-discrete,
          overlay 180ms allow-discrete;
      }

      /* A managed panel opens from display:none, which has no previous style to
         interpolate from; @starting-style supplies one so the pop still plays. */
      @starting-style {
        :host([open]) .panel[data-managed] {
          opacity: 0;
          transform: translateY(-6px) scale(0.97);
        }
      }

      :host([position='top-right']) .panel {
        inset-inline-end: 0;
      }

      :host([position='top-left']) .panel {
        inset-inline-start: 0;
      }

      /* ---- Header ---- */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--divider);
        padding: var(--space-md);
        font-family: var(--font-body);
        font-weight: 600;
        font-size: var(--_text-sm);
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
        border-top: 1px solid var(--divider);
        padding: var(--space-sm);
        text-align: center;
      }

      /* ---- Reduced motion ---- */
      @media (prefers-reduced-motion: reduce) {
        .panel,
        :host([open]) .panel {
          transition: opacity var(--transition-fast);
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
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => {
        this.open = false;
      },
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.trigger'),
      floating: () => this.shadowRoot?.querySelector('.panel'),
      // This component's `position` names a corner rather than a side: the panel
      // always hangs below the trigger, and top-left/top-right choose which of
      // its edges lines up. Anything unrecognised aligns like top-right, the
      // same fallback the CSS gives.
      align: () => (this.position === 'top-left' ? 'start' : 'end'),
      fallbackAlign: 'end',
    });
  }

  updated(changedProperties) {
    this.style.setProperty('--max-height', this.maxHeight);

    if (changedProperties.has('open') || changedProperties.has('position')) {
      this.open ? this._position.show() : this._position.hide();
    }

    if (changedProperties.has('open')) {
      if (this.open) {
        this._clickOutside.activate();
        this.dispatchEvent(new CustomEvent('arc-open', { bubbles: true, composed: true }));
      } else {
        this._clickOutside.deactivate();
        if (changedProperties.get('open') === true) {
          this.dispatchEvent(new CustomEvent('arc-close', { bubbles: true, composed: true }));
        }
      }
    }
  }

  _onTriggerClick() {
    this.open = !this.open;
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
