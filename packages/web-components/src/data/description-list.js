import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, int, oneOf } from '../shared/props.js';

/**
 * Structured term/detail pair list in a responsive grid layout with optional dividers.
 *
 * @tag arc-description-list
 * @status stable
 * @requires arc-description-item
 * @prop {number} columns - Number of grid columns for laying out items side by side.
 * @prop {'stacked' | 'horizontal'} layout - How each item arranges its own term and detail. `stacked`
 *   (the default) puts the term above the detail; `horizontal` puts them side by side on a shared
 *   two-column grid, so terms align down the list. This composes with `columns`, which is about how
 *   many *items* sit across — one item can be horizontal inside a three-column list.
 * @prop {boolean} dividers - Show horizontal dividers between rows and vertical dividers between columns.
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart list
 */
export class ArcDescriptionList extends DeclaredPropsMixin(LitElement) {
  static properties = {
    columns: int({ default: 1, min: 1, clamp: 'toRange', reflect: true }),
    // Absorbed from arc-key-value (4.2), whose `layout` was its whole reason to
    // exist as a separate component. `stacked` first, so it is the default and
    // arc-description-list renders exactly as it did before this merge —
    // arc-key-value defaulted the other way, which is a MIGRATION line, not a
    // reason to change what the survivor does.
    layout: oneOf(['stacked', 'horizontal']),
    dividers: flag(true, { negative: 'no-dividers' }),
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

      /* Item layout is set as a custom property rather than a selector, because
         the thing that has to change is *inside* arc-description-item's shadow
         root — ::slotted() reaches the host, and the host's only child is the
         item's own wrapper. Custom properties cross the boundary; selectors do
         not. (arc-key-value could style ::slotted(arc-kv-pair) directly only
         because arc-kv-pair renders its two halves as bare children of :host.)

         The item reads these with fallbacks, so it still lays out correctly when
         it is used outside a list. */
      :host([layout="horizontal"]) ::slotted(arc-description-item) {
        --_dl-item-columns: minmax(120px, auto) 1fr;
        --_dl-item-gap: var(--space-md);
        --_dl-item-align: baseline;
        --_dl-term-margin: 0;
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
        item.style.borderBottom = isLastRow ? 'none' : '1px solid var(--border-subtle)';

        if (cols > 1) {
          item.style.borderRight = isLastInRow ? 'none' : '1px solid var(--border-subtle)';
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

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    return html`
      <div
        class="list"
        part="base list"
        role="list"
        style="--cols: ${this.columns}"
      >
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
