import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, oneOf, list } from '../shared/props.js';

/**
 * Floating action button that fans out secondary actions with staggered scale-in animation.
 * Trigger is a primary icon-button.
 *
 * @tag arc-speed-dial
 * @requires arc-icon
 * @requires arc-icon-button
 * @prop {boolean} open - Whether the secondary actions are currently visible.
 * @prop {'up' | 'down' | 'left' | 'right'} direction - The direction in which child actions fan out from the trigger.
 * @prop {'bottom-right' | 'bottom-left'} position - Fixed viewport corner where the speed dial is anchored.
 * @prop {Array<{icon: string, label: string, value?: string}>} items - Array of secondary action items to display when the speed dial is open. Each item needs an icon and label.
 * @fires arc-open - Fired when the speed dial expands.
 * @fires {CustomEvent<void>} arc-close - Fired when the speed dial collapses.
 * @fires arc-action - Fired when a secondary action is selected with detail: { index }.
 * @slot trigger
 * @csspart base
 * @csspart actions
 * @csspart action
 * @csspart trigger
 */
export class ArcSpeedDial extends DeclaredPropsMixin(LitElement) {
  static properties = {
    open: flag(false),
    // Both corner rules are exact-match CSS selectors, so an unrecognised
    // position previously anchored the dial nowhere at all — finding #17.
    direction: oneOf(['up', 'down', 'left', 'right']),
    position: oneOf(['bottom-right', 'bottom-left']),
    items: list(),
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
        inset-inline-end: var(--space-xl);
      }

      :host([position="bottom-left"]) .speed-dial {
        bottom: var(--space-xl);
        inset-inline-start: var(--space-xl);
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
        border-radius: var(--radius-full);
        background: var(--surface-overlay);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-overlay);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transform: scale(0.3);
        transition: opacity var(--transition-base), transform 200ms var(--ease-out), background var(--transition-fast);
        color: var(--text-secondary);
        padding: 0;
        font: inherit;
      }

      .speed-dial__action:hover {
        background: var(--surface-hover);
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
    this.items = [];
  }

  _toggle() {
    if (this.open) {
      if (
        !this.dispatchEvent(
          new CustomEvent('arc-close', {
            bubbles: true,
            composed: true,
            cancelable: true,
          }),
        )
      )
        return;
      this.open = false;
      return;
    }
    this.open = true;
    this.dispatchEvent(
      new CustomEvent('arc-open', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onAction(index) {
    this.dispatchEvent(
      new CustomEvent('arc-action', {
        detail: { index },
        bubbles: true,
        composed: true,
      }),
    );
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', {
          cancelable: true,
          bubbles: true,
          composed: true,
        }),
      )
    )
      return;
    this.open = false;
  }

  render() {
    return html`
      <div class="speed-dial" part="base">
        <div class="speed-dial__actions" part="actions">
          ${this.items.map(
            (action, i) => html`
            <button
              class="speed-dial__action"
              part="action"
              @click=${() => this._onAction(i)}
              aria-label=${action.label || ''}
              title=${action.label || ''}
            >
              <arc-icon name=${action.icon || ''} size="sm"></arc-icon>
            </button>
          `,
          )}
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
