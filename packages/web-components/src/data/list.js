import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Structured list container with optional selection, keyboard navigation, and multiple visual
 * variants. Pairs with arc-list-item for rich content rows.
 *
 * @tag arc-list
 * @requires arc-list-item
 * @prop {'default' | 'bordered' | 'separated'} variant - Visual style. Bordered wraps the list in an outlined container. Separated adds bottom borders between items.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the base font size for the list and its children.
 * @prop {boolean} selectable - Enables selection mode. Sets `role="listbox"` and manages `aria-selected` on child items.
 * @prop {boolean} multiple - Allows multiple items to be selected simultaneously. Only applies when `selectable` is true.
 * @prop {string} value - The currently selected value(s). Comma-separated when `multiple` is true. The selection itself is held as a list of values, so a value containing a comma is selected and rendered correctly; only the *serialised* multi-select string cannot represent one, since the comma is its separator. Single-select is exact for any value.
 * @prop {string} label - Accessible name for the list, applied as `aria-label`. Required when `selectable` is set so the listbox has an accessible name.
 * @fires {CustomEvent<{ value: string }>} arc-select - Fired from the activated arc-list-item when a selectable list is driven by Enter or Space.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when the selection changes. `event.detail.value` contains the new value string.
 * @slot - Default content.
 * @csspart list
 */
export class ArcList extends DeclaredPropsMixin(LitElement) {
  static properties = {
    variant: oneOf(['default', 'bordered', 'separated']),
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),
    selectable: flag(false),
    multiple: flag(false, { reflect: false }),
    value: { type: String },
    label: { type: String },
    _items: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .list {
        display: flex;
        flex-direction: column;
        padding: var(--space-xs) 0;
        margin: 0;
        list-style: none;
      }

      :host([variant="bordered"]) .list {
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-xs);
      }

      :host([variant="separated"]) ::slotted(arc-list-item:not(:last-child)) {
        border-bottom: 1px solid var(--divider);
      }

      /* Sizes */
      :host([size="sm"]) { font-size: var(--_text-sm); }
      :host([size="lg"]) { font-size: var(--_text-lg); }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.label = '';
    this._items = [];
    // The selection, as values. `value` is the serialised *view* of this, and
    // splitting it back apart was the whole of finding #26: `"Smith, John"` was
    // recorded in `value` and then looked for among `["Smith", " John"]`, so it
    // was never marked selected on screen. The list is the source of truth now.
    this._selection = [];
    // The last `value` this component wrote, so an assignment from outside can
    // be told from its own serialisation.
    this._serialised = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('arc-select', this._onItemClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('arc-select', this._onItemClick);
  }

  _onSlotChange(e) {
    this._items = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-LIST-ITEM');
    this._applySelectable();
    this._syncSelection();
  }

  _onItemClick = (e) => {
    if (!this.selectable) return;

    const itemValue = e.detail.value;
    let next;
    if (this.multiple) {
      next = [...this._selection];
      const idx = next.indexOf(itemValue);
      if (idx >= 0) next.splice(idx, 1);
      else next.push(itemValue);
    } else {
      next = this._selection[0] === itemValue ? [] : [itemValue];
    }
    this._setSelection(next);

    this.dispatchEvent(
      new CustomEvent('arc-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  };

  /** Adopt a selection chosen here, and serialise it into `value`. */
  _setSelection(values) {
    this._selection = values;
    this._serialised = values.join(',');
    this.value = this._serialised;
    this._syncSelection();
  }

  /**
   * Adopt a `value` assigned from outside.
   *
   * Single-select does not split at all, so any value round-trips — including
   * one with a comma. Multi-select splits, because the comma is the format's
   * separator; that limit is inherent to a string-valued multi-select and is
   * documented on the prop.
   */
  _adoptValue() {
    this._selection = this.multiple
      ? (this.value ? this.value.split(',').filter(Boolean) : [])
      : (this.value ? [this.value] : []);
    this._serialised = this.value;
    this._syncSelection();
  }

  _syncSelection() {
    if (!this.selectable) return;
    for (const item of this._items) {
      item.selected = this._selection.includes(item.value);
      item._selectable = true;
    }
  }

  _handleKeydown(e) {
    const items = this._items.filter((i) => !i.disabled);
    if (!items.length) return;

    const current = items.findIndex(
      (i) =>
        i.shadowRoot?.querySelector('.item') === i.shadowRoot?.activeElement ||
        i === document.activeElement ||
        i.shadowRoot?.querySelector(':focus') !== null,
    );

    let next = -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        next = current < items.length - 1 ? current + 1 : 0;
        break;
      case 'ArrowUp':
        e.preventDefault();
        next = current > 0 ? current - 1 : items.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        next = 0;
        break;
      case 'End':
        e.preventDefault();
        next = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        if (this.selectable && current >= 0) {
          e.preventDefault();
          items[current].dispatchEvent(
            new CustomEvent('arc-select', {
              bubbles: true,
              composed: true,
              detail: { value: items[current].value },
            }),
          );
        }
        return;
      default:
        return;
    }

    if (next >= 0) {
      const focusTarget = items[next].shadowRoot?.querySelector('.item');
      focusTarget?.focus();
    }
  }

  updated(changed) {
    if (changed.has('value') && this.value !== this._serialised) {
      this._adoptValue();
    }
    // The role each item renders depends on this list (finding #28), and
    // `selectable` can be flipped after mount.
    if (changed.has('selectable')) this._applySelectable();
  }

  /** Tell each item whether it is inside a listbox or a plain list. */
  _applySelectable() {
    for (const item of this._items) item._selectable = this.selectable === true;
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    // aria-multiselectable is defined for listbox/grid/tree/tablist and for
    // nothing else, so a plain role="list" must not carry it at all — axe
    // reports it as aria-allowed-attr (finding #27).
    return html`
      <div
        class="list"
        role=${this.selectable ? 'listbox' : 'list'}
        aria-label=${this.label || nothing}
        aria-multiselectable=${this.selectable ? String(this.multiple === true) : nothing}
        @keydown=${this._handleKeydown}
        part="list"
      >
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
