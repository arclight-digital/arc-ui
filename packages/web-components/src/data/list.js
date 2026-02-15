import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-list
 * @requires arc-list-item
 */
export class ArcList extends LitElement {
  static properties = {
    variant:    { type: String, reflect: true },
    size:       { type: String, reflect: true },
    selectable: { type: Boolean, reflect: true },
    multiple:   { type: Boolean },
    value:      { type: String },
    _items:     { state: true },
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
        border-bottom: 1px solid var(--border-subtle);
      }

      /* Sizes */
      :host([size="sm"]) { font-size: var(--text-sm); }
      :host([size="lg"]) { font-size: var(--text-lg); }
    `,
  ];

  constructor() {
    super();
    this.variant = 'default';
    this.size = 'md';
    this.selectable = false;
    this.multiple = false;
    this.value = '';
    this._items = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('arc-item-click', this._onItemClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('arc-item-click', this._onItemClick);
  }

  _onSlotChange(e) {
    this._items = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-LIST-ITEM');
    this._syncSelection();
  }

  _onItemClick = (e) => {
    if (!this.selectable) return;

    const itemValue = e.detail.value;
    if (this.multiple) {
      const values = this.value ? this.value.split(',').filter(Boolean) : [];
      const idx = values.indexOf(itemValue);
      if (idx >= 0) values.splice(idx, 1);
      else values.push(itemValue);
      this.value = values.join(',');
    } else {
      this.value = this.value === itemValue ? '' : itemValue;
    }

    this._syncSelection();
    this.dispatchEvent(new CustomEvent('arc-change', {
      bubbles: true,
      composed: true,
      detail: { value: this.value },
    }));
  };

  _syncSelection() {
    if (!this.selectable) return;
    const values = this.value ? this.value.split(',') : [];
    for (const item of this._items) {
      item.selected = values.includes(item.value);
    }
  }

  _handleKeydown(e) {
    const items = this._items.filter(i => !i.disabled);
    if (!items.length) return;

    const current = items.findIndex(i =>
      i.shadowRoot?.querySelector('.item') === i.shadowRoot?.activeElement ||
      i === document.activeElement ||
      i.shadowRoot?.querySelector(':focus') !== null
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
          items[current].dispatchEvent(new CustomEvent('arc-item-click', {
            bubbles: true,
            composed: true,
            detail: { value: items[current].value },
          }));
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
    if (changed.has('value')) {
      this._syncSelection();
    }
  }

  render() {
    return html`
      <div
        class="list"
        role=${this.selectable ? 'listbox' : 'list'}
        aria-multiselectable=${this.selectable && this.multiple ? 'true' : 'false'}
        @keydown=${this._handleKeydown}
        part="list"
      >
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
