import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-dock
 */
export class ArcDock extends LitElement {
  static properties = {
    position:  { type: String, reflect: true },
    autoHide:  { type: Boolean, reflect: true, attribute: 'auto-hide' },
    open:      { type: Boolean, reflect: true },
    _hovered:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: contents;
      }

      .dock {
        position: fixed;
        z-index: 100;
        background: var(--surface-primary);
        border: 1px solid var(--border-subtle);
        transition: transform var(--transition-base) var(--ease-out-expo);
        overflow-y: auto;
      }

      /* Bottom */
      :host([position="bottom"]) .dock {
        bottom: 0;
        left: 0;
        right: 0;
        border-top: 1px solid var(--border-subtle);
        border-bottom: none;
      }

      :host([position="bottom"][auto-hide]:not([open]):not(:hover)) .dock {
        transform: translateY(100%);
      }

      /* Left */
      :host([position="left"]) .dock {
        top: 0;
        bottom: 0;
        left: 0;
        border-right: 1px solid var(--border-subtle);
        border-left: none;
      }

      :host([position="left"][auto-hide]:not([open]):not(:hover)) .dock {
        transform: translateX(-100%);
      }

      /* Right */
      :host([position="right"]) .dock {
        top: 0;
        bottom: 0;
        right: 0;
        border-left: 1px solid var(--border-subtle);
        border-right: none;
      }

      :host([position="right"][auto-hide]:not([open]):not(:hover)) .dock {
        transform: translateX(100%);
      }

      /* Subtle glow on reveal */
      :host([auto-hide]) .dock:hover,
      :host([auto-hide][open]) .dock {
        box-shadow: 0 0 20px rgba(var(--accent-primary-rgb), 0.08);
      }
    `,
  ];

  constructor() {
    super();
    this.position = 'bottom';
    this.autoHide = false;
    this.open = false;
    this._hovered = false;
  }

  updated(changed) {
    if (changed.has('open')) {
      this.dispatchEvent(
        new CustomEvent(this.open ? 'arc-open' : 'arc-close', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  render() {
    return html`
      <div class="dock" part="dock">
        <slot></slot>
      </div>
    `;
  }
}
