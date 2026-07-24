import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Ultra-narrow icon-only vertical navigation like VS Code's activity bar. Icons use text-muted at
 * rest, accent-primary glow on active. Expands on hover.
 *
 * @tag arc-rail
 * @prop items - Array of navigation items, each with an icon name, text label, and value identifier.
 * @prop {string} value - The value of the currently active item. Controls which icon receives the accent glow.
 * @prop {boolean} expanded - When true, the Rail widens to show text labels beside each icon. Can be toggled on hover or set permanently.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when an item is selected with detail: { value }.
 * @slot - Default content.
 * @csspart base
 * @csspart item
 */
export class ArcRail extends LitElement {
  static properties = {
    items: {
      converter: {
        fromAttribute: (v) => { try { return JSON.parse(v); } catch { return []; } },
      },
    },
    value:    { type: String, reflect: true },
    expanded: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .rail {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 48px;
        background: var(--surface-primary);
        border-right: 1px solid var(--divider);
        height: 100%;
        padding: var(--space-sm) 0;
        gap: var(--space-xs);
        transition: width var(--transition-base) var(--ease-out-expo);
        overflow: hidden;
      }

      :host([expanded]) .rail {
        width: 200px;
        align-items: stretch;
      }

      .rail__item {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .rail__item arc-icon-button {
        --icon-button-color: var(--text-muted);
      }

      .rail__item arc-icon-button:hover {
        --icon-button-color: var(--text-primary);
      }

      .rail__item.is-active arc-icon-button {
        filter: drop-shadow(0 0 8px rgba(var(--interactive-rgb), 0.2));
      }
    `,
  ];

  constructor() {
    super();
    this.items = [];
    this.value = '';
    this.expanded = false;
  }

  _select(val) {
    this.value = val;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <nav class="rail" part="base" role="navigation" aria-label="Rail navigation">
        ${this.items.map(item => html`
          <div
            class="rail__item ${this.value === item.value ? 'is-active' : ''}"
            part="item"
            @click=${() => this._select(item.value)}
          >
            <arc-icon-button
              name=${item.icon || ''}
              label=${item.label || ''}
              variant=${this.value === item.value ? 'primary' : 'ghost'}
              aria-current=${this.value === item.value ? 'page' : 'false'}
            ></arc-icon-button>
          </div>
        `)}
        <slot></slot>
      </nav>
    `;
  }
}
