import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-speed-dial
 */
export class ArcSpeedDial extends LitElement {
  static properties = {
    open:      { type: Boolean, reflect: true },
    direction: { type: String, reflect: true },
    position:  { type: String, reflect: true },
    items: {
      converter: {
        fromAttribute: (v) => { try { return JSON.parse(v); } catch { return []; } },
      },
    },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: contents;
      }

      .speed-dial {
        position: absolute;
        z-index: 100;
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        gap: var(--space-sm);
      }

      :host([position="bottom-right"]) .speed-dial {
        bottom: var(--space-xl);
        right: var(--space-xl);
      }

      :host([position="bottom-left"]) .speed-dial {
        bottom: var(--space-xl);
        left: var(--space-xl);
      }

      :host([direction="down"]) .speed-dial {
        flex-direction: column;
      }

      :host([direction="left"]) .speed-dial {
        flex-direction: row;
      }

      :host([direction="right"]) .speed-dial {
        flex-direction: row-reverse;
      }

      .speed-dial__actions {
        display: flex;
        flex-direction: column-reverse;
        gap: var(--space-sm);
      }

      :host([direction="down"]) .speed-dial__actions {
        flex-direction: column;
      }

      :host([direction="left"]) .speed-dial__actions {
        flex-direction: row;
      }

      :host([direction="right"]) .speed-dial__actions {
        flex-direction: row-reverse;
      }

      .speed-dial__action {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-overlay);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transform: scale(0.3);
        transition: opacity 200ms, transform 200ms var(--ease-out-expo), background var(--transition-fast);
        color: var(--text-secondary);
        padding: 0;
        font: inherit;
      }

      .speed-dial__action:hover {
        background: var(--bg-hover);
      }

      :host([open]) .speed-dial__action {
        opacity: 1;
        transform: scale(1);
      }

      :host([open]) .speed-dial__action:nth-child(1) { transition-delay: 0ms; }
      :host([open]) .speed-dial__action:nth-child(2) { transition-delay: 40ms; }
      :host([open]) .speed-dial__action:nth-child(3) { transition-delay: 80ms; }
      :host([open]) .speed-dial__action:nth-child(4) { transition-delay: 120ms; }
      :host([open]) .speed-dial__action:nth-child(5) { transition-delay: 160ms; }

      .speed-dial__trigger {
        display: flex;
      }

      .speed-dial__trigger ::slotted(*) {
        cursor: pointer;
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.direction = 'up';
    this.position = 'bottom-right';
    this.items = [];
  }

  _toggle() {
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent(this.open ? 'arc-open' : 'arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  _onAction(index) {
    this.dispatchEvent(new CustomEvent('arc-action', {
      detail: { index },
      bubbles: true,
      composed: true,
    }));
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="speed-dial" part="base">
        <div class="speed-dial__actions" part="actions">
          ${this.items.map((action, i) => html`
            <button
              class="speed-dial__action"
              part="action"
              @click=${() => this._onAction(i)}
              aria-label=${action.label || ''}
              title=${action.label || ''}
            >
              <arc-icon name=${action.icon || ''} size="sm"></arc-icon>
            </button>
          `)}
        </div>
        <div class="speed-dial__trigger" part="trigger" @click=${this._toggle}>
          <slot name="trigger">
            <arc-icon-button name="plus" label="Open actions" variant="primary"></arc-icon-button>
          </slot>
        </div>
      </div>
    `;
  }
}
