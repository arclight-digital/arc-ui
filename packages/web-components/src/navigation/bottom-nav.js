import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-bottom-nav
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
        background: var(--bg-elevated);
        backdrop-filter: blur(12px);
        border-top: 1px solid var(--border-subtle);
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
        color: var(--accent-primary);
      }

      .bottom-nav__item.is-active::after {
        content: '';
        width: 20px;
        height: 2px;
        border-radius: 1px;
        background: var(--accent-primary);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.3);
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
