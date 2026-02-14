import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import './accordion-item.js';

export class ArcAccordion extends LitElement {
  static properties = {
    multiple:   { type: Boolean, reflect: true },
    _items:     { state: true },
    _openItems: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .accordion {
        display: flex;
        flex-direction: column;
        gap: 1px;
        background: var(--border-subtle);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      .accordion__item { background: var(--bg-card); }

      .accordion__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        width: 100%;
        padding: var(--space-lg) var(--space-xl);
        cursor: pointer;
        font-family: var(--font-body);
        font-size: var(--text-md);
        font-weight: 600;
        color: var(--text-primary);
        background: none;
        border: none;
        text-align: left;
        transition: background var(--transition-fast);
        min-height: var(--touch-min);
      }

      .accordion__trigger:hover { background: var(--bg-elevated); }
      .accordion__trigger[aria-expanded="true"] { background: var(--bg-elevated); }
      .accordion__trigger:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px var(--accent-primary);
        background: var(--bg-elevated);
      }

      .accordion__chevron {
        color: var(--text-muted);
        font-size: var(--text-sm);
        transition: transform 300ms ease;
        flex-shrink: 0;
        display: inline-block;
      }

      .accordion__trigger[aria-expanded="true"] .accordion__chevron {
        transform: rotate(180deg);
      }

      .accordion__content {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 300ms ease;
      }
      .accordion__content.is-open { grid-template-rows: 1fr; }

      .accordion__body { overflow: hidden; }

      .accordion__body p {
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        line-height: 1.75;
        padding: var(--space-xs) var(--space-lg) var(--space-md);
        margin: 0;
      }

      .accordion__slot-host { display: none; }

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
    this.multiple = false;
    this._items = [];
    this._openItems = new Set();
  }

  _onSlotChange(e) {
    this._items = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-ACCORDION-ITEM');
  }

  _toggle(index) {
    const next = new Set(this._openItems);
    if (next.has(index)) {
      next.delete(index);
    } else {
      if (!this.multiple) next.clear();
      next.add(index);
    }
    this._openItems = next;
  }

  render() {
    return html`
      <div class="accordion__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div class="accordion" part="accordion">
        ${this._items.map((item, i) => {
          const isOpen = this._openItems.has(i);
          return html`
            <div class="accordion__item">
              <button
                class="accordion__trigger"
                aria-expanded=${isOpen ? 'true' : 'false'}
                @click=${() => this._toggle(i)}
              >
                <span>${item.question}</span>
                <span class="accordion__chevron">&#9662;</span>
              </button>
              <div class="accordion__content ${isOpen ? 'is-open' : ''}">
                <div class="accordion__body">
                  <p>${item.answer}</p>
                </div>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('arc-accordion', ArcAccordion);
