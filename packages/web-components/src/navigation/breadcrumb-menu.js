import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import { PositionController } from '../shared/position-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';

/**
 * Each breadcrumb segment doubles as a dropdown showing sibling pages at that hierarchy level.
 * Dropdown panels match dropdown-menu styling.
 *
 * @tag arc-breadcrumb-menu
 * @prop {Array<{label: string, href?: string, siblings?: Array<{label: string, href?: string}>}>} items - Array of breadcrumb items. Each item has a label and href. Optionally include a siblings array to enable a dropdown at that level.
 * @fires arc-navigate - Fired when a breadcrumb link or dropdown item is clicked with detail: { href }.
 * @slot none
 * @csspart base
 * @csspart separator
 * @csspart item
 * @csspart link
 * @csspart dropdown
 * @csspart dropdown-item
 */
export class ArcBreadcrumbMenu extends LitElement {
  static properties = {
    items: {
      converter: {
        fromAttribute: (v) => {
          try {
            return JSON.parse(v);
          } catch {
            return [];
          }
        },
      },
    },
    label: { type: String },
    _openIndex: { type: Number, state: true },
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
        font-size: var(--_text-sm);
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
        background: var(--surface-hover);
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
        inset-inline-start: 0;
        margin-top: var(--space-xs);
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        backdrop-filter: blur(12px);
        padding: var(--space-xs);
        /* Sizes to its longest crumb rather than to the width available from a
           narrow positioned ancestor. See the note in navigation/menubar.js. */
        width: max-content;
        min-width: 160px;
        max-width: var(--menu-max-width, min(420px, calc(100vw - 2 * var(--space-md))));
        z-index: 200;
      }

      .breadcrumb-menu__dropdown-item {
        display: block;
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: var(--_text-sm);
        transition: background var(--transition-fast), color var(--transition-fast);
        cursor: pointer;
        background: none;
        border: none;
        width: 100%;
        text-align: start;
        font: inherit;
      }

      .breadcrumb-menu__dropdown-item:hover {
        background: var(--surface-hover);
        color: var(--text-primary);
      }
    `,
    // animate: false — the dropdown is created and destroyed per open crumb
    // rather than toggled, so there is no open state for an enter transition to
    // key on. Asking for one would leave the panel stuck at opacity 0.
    managedPanelStyles('breadcrumb-menu__dropdown', { animate: false }),
  ];

  constructor() {
    super();
    this.label = 'Breadcrumb';
    this.items = [];
    this._openIndex = -1;
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => {
        this._openIndex = -1;
      },
    });
    this._position = new PositionController(this, {
      // Only one crumb's dropdown is rendered at a time, so "the dropdown" is
      // unambiguous, and its anchor is the crumb it was rendered inside.
      floating: () => this.shadowRoot?.querySelector('.breadcrumb-menu__dropdown'),
      anchor: () => this.shadowRoot?.querySelector('.breadcrumb-menu__dropdown')?.parentElement,
      align: () => 'start',
      offset: 4,
    });
  }

  updated(changed) {
    if (changed.has('_openIndex')) {
      const open = this._openIndex >= 0;
      open ? this._position.show() : this._position.hide();
      open ? this._clickOutside.activate() : this._clickOutside.deactivate();
    }
  }

  _toggleDropdown(index, e) {
    e.stopPropagation();
    this._openIndex = this._openIndex === index ? -1 : index;
  }

  _navigate(href) {
    this._openIndex = -1;
    this.dispatchEvent(
      new CustomEvent('arc-navigate', {
        detail: { href },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const lastIndex = this.items.length - 1;

    return html`
      <nav class="breadcrumb-menu" part="base" aria-label=${this.label}>
        ${this.items.map(
          (item, i) => html`
          ${i > 0 ? html`<span class="breadcrumb-menu__separator" part="separator" aria-hidden="true">/</span>` : ''}
          <div class="breadcrumb-menu__item" part="item">
            ${
              item.siblings?.length
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
                ${
                  this._openIndex === i
                    ? html`
                  <div class="breadcrumb-menu__dropdown" part="dropdown" @click=${(e) => e.stopPropagation()}>
                    ${item.siblings.map(
                      (sib) => html`
                      <button
                        class="breadcrumb-menu__dropdown-item"
                        part="dropdown-item"
                        @click=${() => this._navigate(sib.href)}
                      >${sib.label}</button>
                    `,
                    )}
                  </div>
                `
                    : ''
                }
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
        `,
        )}
      </nav>
    `;
  }
}
