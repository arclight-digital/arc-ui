import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import './breadcrumb-item.js';

export class ArcBreadcrumb extends LitElement {
  static properties = {
    _items: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        flex-wrap: wrap;
      }

      .breadcrumb__item {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .breadcrumb__link {
        color: var(--text-muted);
        text-decoration: none;
        transition: color var(--transition-fast);
        background: none;
        border: none;
        padding: var(--touch-pad) var(--space-xs);
        cursor: pointer;
        font: inherit;
        font-size: inherit;
        min-height: var(--touch-min);
        display: inline-flex;
        align-items: center;
      }

      .breadcrumb__link:hover {
        color: var(--text-primary);
      }

      .breadcrumb__link:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
        border-radius: var(--radius-xs);
      }

      .breadcrumb__current {
        color: var(--text-primary);
        font-weight: 500;
      }

      .breadcrumb__separator {
        color: var(--text-ghost);
        font-size: var(--text-sm);
        user-select: none;
      }

      .breadcrumb__slot-host { display: none; }

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

  constructor() {
    super();
    this._items = [];
  }

  _onSlotChange(e) {
    this._items = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-BREADCRUMB-ITEM');
  }

  _handleClick(href) {
    this.dispatchEvent(new CustomEvent('arc-navigate', {
      detail: { href },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="breadcrumb__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <nav class="breadcrumb" aria-label="Breadcrumb" part="breadcrumb">
        ${this._items.map((item, i) => {
          const isLast = i === this._items.length - 1;
          return html`
            <span class="breadcrumb__item">
              ${isLast
                ? html`<span class="breadcrumb__current" aria-current="page" part="current">${item.label}</span>`
                : html`
                    ${item.href
                      ? html`<a class="breadcrumb__link" href=${item.href} part="link">${item.label}</a>`
                      : html`<button class="breadcrumb__link" @click=${() => this._handleClick(item.href)} part="link">${item.label}</button>`
                    }
                    <span class="breadcrumb__separator" aria-hidden="true" part="separator">/</span>
                  `
              }
            </span>
          `;
        })}
      </nav>
    `;
  }
}

customElements.define('arc-breadcrumb', ArcBreadcrumb);
