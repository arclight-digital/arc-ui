import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Mobile bottom bar with icon + label items. Active item gets accent-primary glow underline with
 * surface-overlay background and backdrop blur.
 *
 * @tag arc-bottom-nav
 * @prop items - Array of navigation items, each with a label, icon name, and value identifier.
 * @prop {string} value - The value of the currently active item. Controls which item is highlighted.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when an item is tapped with detail: { value }.
 * @csspart base
 * @csspart item
 * @csspart icon
 * @csspart label
 */
export class ArcBottomNav extends LitElement {
  static properties = {
    items: {
      converter: {
        fromAttribute: (v) => { try { return JSON.parse(v); } catch { return []; } },
      },
    },
    value: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: contents;
      }

      .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        display: flex;
        background: var(--surface-overlay);
        backdrop-filter: blur(12px);
        border-top: 1px solid var(--divider);
        padding: var(--space-xs) 0;
        padding-bottom: env(safe-area-inset-bottom, 0);
      }

      .bottom-nav__item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: var(--space-xs);
        cursor: pointer;
        color: var(--text-muted);
        transition: color var(--transition-fast);
        background: none;
        border: none;
        font: inherit;
        font-size: 10px;
      }

      .bottom-nav__item:hover {
        color: var(--text-primary);
      }

      .bottom-nav__item.is-active {
        color: var(--interactive);
      }

      .bottom-nav__item.is-active::after {
        content: '';
        width: 20px;
        height: 2px;
        border-radius: 1px;
        background: var(--interactive);
        box-shadow: 0 0 8px rgba(var(--interactive-rgb), 0.3);
        margin-top: 2px;
      }

      .bottom-nav__icon {
        font-size: 20px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .bottom-nav__label {
        font-family: var(--font-body);
      }
    `,
  ];

  constructor() {
    super();
    this.items = [];
    this.value = '';
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
      <nav class="bottom-nav" part="base" role="navigation" aria-label="Bottom navigation">
        ${this.items.map(item => html`
          <button
            class="bottom-nav__item ${this.value === item.value ? 'is-active' : ''}"
            part="item"
            @click=${() => this._select(item.value)}
            aria-current=${this.value === item.value ? 'page' : 'false'}
          >
            <span class="bottom-nav__icon" part="icon">${item.icon ? html`<arc-icon name=${item.icon} size="md"></arc-icon>` : ''}</span>
            <span class="bottom-nav__label" part="label">${item.label}</span>
          </button>
        `)}
      </nav>
    `;
  }
}
