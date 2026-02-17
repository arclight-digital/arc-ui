import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-description-list
 * @requires arc-description-item
 */
export class ArcDescriptionList extends LitElement {
  static properties = {
    columns:  { type: Number, reflect: true },
    dividers: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .list {
        display: grid;
        grid-template-columns: repeat(var(--cols, 1), 1fr);
        gap: 0;
        margin: 0;
        padding: 0;
      }

      ::slotted(arc-description-item) {
        padding: var(--space-md) var(--space-sm);
      }

      @media (max-width: 640px) {
        .list {
          grid-template-columns: 1fr !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          transition: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.columns = 1;
    this.dividers = true;
  }

  _onSlotChange(e) {
    this._applyStyles(e.target.assignedElements({ flatten: true }));
  }

  _applyStyles(items) {
    const cols = this.columns || 1;
    const total = items.length;
    const lastRowStart = total - (total % cols || cols);

    items.forEach((item, i) => {
      const isFirstInRow = i % cols === 0;
      const isLastInRow = (i + 1) % cols === 0 || i === total - 1;
      const isLastRow = i >= lastRowStart;

      if (this.dividers) {
        item.style.borderBottom = isLastRow
          ? 'none'
          : '1px solid var(--border-subtle)';

        if (cols > 1) {
          item.style.borderRight = isLastInRow
            ? 'none'
            : '1px solid var(--border-subtle)';
        } else {
          item.style.borderRight = '';
        }
      } else {
        item.style.borderBottom = '';
        item.style.borderRight = '';
      }

      // Horizontal padding for multi-column grid spacing
      if (cols > 1) {
        item.style.paddingLeft = isFirstInRow ? '0' : 'var(--space-md)';
        item.style.paddingRight = isLastInRow ? '0' : 'var(--space-md)';
      } else {
        item.style.paddingLeft = '';
        item.style.paddingRight = '';
      }
    });
  }

  updated(changed) {
    if (changed.has('columns') || changed.has('dividers')) {
      const slot = this.shadowRoot?.querySelector('slot');
      if (slot) {
        this._applyStyles(slot.assignedElements({ flatten: true }));
      }
    }
  }

  render() {
    return html`
      <div
        class="list"
        part="list"
        role="list"
        style="--cols: ${this.columns}"
      >
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
