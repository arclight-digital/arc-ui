import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { positionStyles } from '../shared/position-styles.js';
import { PositionController } from '../shared/position-controller.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import { setTriggerAria, deepActiveElement } from '../shared/trigger-aria.js';

/**
 * Floating content panel anchored to a trigger element, with four placement positions and
 * automatic outside-click dismissal.
 *
 * @tag arc-popover
 * @prop {boolean} open - Whether the popover panel is currently visible. Reflected as an attribute.
 * @prop {'top' | 'bottom' | 'left' | 'right'} position - Placement of the panel relative to the trigger element.
 * @prop {string} trigger - Reserved for future trigger-mode configuration (click, hover, manual).
 * @fires arc-open - Fired when the popover opens.
 * @fires {CustomEvent<void>} arc-close - Fired when the popover closes.
 * @slot trigger
 * @slot - Default content.
 * @csspart trigger
 * @csspart panel
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
    this._openedFrom = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._clickOutside = new ClickOutsideController(this, {
      // _close(false): the pointer chose a new target, so don't yank focus back
      // to the trigger.
      onClickOutside: () => this._close(false),
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.popover__trigger'),
      floating: () => this.shadowRoot?.querySelector('.popover__panel'),
      placement: () => this.position,
    });
  }

  updated(changed) {
    if (changed.has('open') || changed.has('position')) {
      this.open ? this._position.show() : this._position.hide();
    }
    if (changed.has('open')) {
      this._syncTriggerAria();
      if (this.open) {
        this._openedFrom = deepActiveElement();
        this._clickOutside.activate();
        document.addEventListener('keydown', this._onKeyDown);
      } else {
        this._clickOutside.deactivate();
        document.removeEventListener('keydown', this._onKeyDown);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _syncTriggerAria() {
    setTriggerAria(
      this.shadowRoot.querySelector('slot[name="trigger"]'),
      {
        'aria-haspopup': 'dialog',
        'aria-expanded': this.open ? 'true' : 'false',
      }
    );
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') {
      this._close();
    }
  }

  _toggle() {
    if (this.open) {
      this._close();
      return;
    }
    this.open = true;
    this.dispatchEvent(new CustomEvent('arc-open', {
      bubbles: true,
      composed: true,
    }));
  }

  _close(restoreFocus = true) {
    if (!this.open) return;
    if (!this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
      cancelable: true,
    }))) return;
    this.open = false;
    if (restoreFocus && this._openedFrom && this._openedFrom.isConnected) {
      this._openedFrom.focus();
    }
    this._openedFrom = null;
  }

  render() {
    return html`
      <div
        class="popover__trigger"
        @click=${this._toggle}
        part="trigger"
      >
        <slot name="trigger" @slotchange=${this._syncTriggerAria}></slot>
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
