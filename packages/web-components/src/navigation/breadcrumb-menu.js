import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-breadcrumb-menu
 */
export class ArcBreadcrumbMenu extends LitElement {
  static properties = {
    items: {
      converter: {
        fromAttribute: (v) => { try { return JSON.parse(v); } catch { return []; } },
      },
    },
    _openIndex:  { type: Number, state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .breadcrumb-menu {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }

      .breadcrumb-menu__item {
        position: relative;
      }

      .breadcrumb-menu__link {
        color: var(--text-muted);
        text-decoration: none;
        padding: var(--space-xs);
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast);
        cursor: pointer;
        background: none;
        border: none;
        font: inherit;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .breadcrumb-menu__link:hover {
        color: var(--text-primary);
        background: var(--bg-hover);
      }

      .breadcrumb-menu__link.is-current {
        color: var(--text-primary);
        font-weight: 600;
      }

      .breadcrumb-menu__chevron {
        width: 12px;
        height: 12px;
        transition: transform var(--transition-fast);
      }

      .breadcrumb-menu__chevron.is-open {
        transform: rotate(180deg);
      }

      .breadcrumb-menu__separator {
        color: var(--text-ghost);
        user-select: none;
      }

      .breadcrumb-menu__dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: var(--space-xs);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        backdrop-filter: blur(12px);
        padding: var(--space-xs);
        min-width: 160px;
        z-index: 200;
      }

      .breadcrumb-menu__dropdown-item {
        display: block;
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: var(--text-sm);
        transition: background var(--transition-fast), color var(--transition-fast);
        cursor: pointer;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        font: inherit;
      }

      .breadcrumb-menu__dropdown-item:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }
    `,
  ];

  constructor() {
    super();
    this.items = [];
    this._openIndex = -1;
    this._onDocClick = this._onDocClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onDocClick);
  }

  _onDocClick() {
    this._openIndex = -1;
  }

  _toggleDropdown(index, e) {
    e.stopPropagation();
    this._openIndex = this._openIndex === index ? -1 : index;
  }

  _navigate(href) {
    this._openIndex = -1;
    this.dispatchEvent(new CustomEvent('arc-navigate', {
      detail: { href },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const lastIndex = this.items.length - 1;

    return html`
      <nav class="breadcrumb-menu" part="base" aria-label="Breadcrumb">
        ${this.items.map((item, i) => html`
          ${i > 0 ? html`<span class="breadcrumb-menu__separator" part="separator" aria-hidden="true">/</span>` : ''}
          <div class="breadcrumb-menu__item" part="item">
            ${item.siblings?.length
              ? html`
                <button
                  class="breadcrumb-menu__link ${i === lastIndex ? 'is-current' : ''}"
                  part="link"
                  @click=${(e) => this._toggleDropdown(i, e)}
                  aria-expanded=${this._openIndex === i ? 'true' : 'false'}
                  aria-current=${i === lastIndex ? 'page' : 'false'}
                >
                  ${item.label}
                  <svg class="breadcrumb-menu__chevron ${this._openIndex === i ? 'is-open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                ${this._openIndex === i ? html`
                  <div class="breadcrumb-menu__dropdown" part="dropdown" @click=${(e) => e.stopPropagation()}>
                    ${item.siblings.map(sib => html`
                      <button
                        class="breadcrumb-menu__dropdown-item"
                        part="dropdown-item"
                        @click=${() => this._navigate(sib.href)}
                      >${sib.label}</button>
                    `)}
                  </div>
                ` : ''}
              `
              : html`
                <button
                  class="breadcrumb-menu__link ${i === lastIndex ? 'is-current' : ''}"
                  part="link"
                  @click=${() => this._navigate(item.href)}
                  aria-current=${i === lastIndex ? 'page' : 'false'}
                >${item.label}</button>
              `
            }
          </div>
        `)}
      </nav>
    `;
  }
}
