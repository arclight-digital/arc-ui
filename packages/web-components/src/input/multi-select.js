import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { PositionController } from '../shared/position-controller.js';
import { ListboxController } from '../shared/listbox-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import '../shared/option.js';

/**
 * Multi-value select with tag chips, inline search filtering, and keyboard navigation.
 *
 * @tag arc-multi-select
 * @prop {string[]} value - Array of selected option values. Updated when items are toggled and emitted via `arc-change`.
 * @prop {string} label - Visible label rendered above the control in a small uppercase style.
 * @prop {string} placeholder - Hint text shown inside the control when no items are selected and the input is empty.
 * @prop {boolean} disabled - Disables the control, preventing interaction and reducing opacity to 50%.
 * @prop {boolean} readonly - Prevents toggling options or removing chips while the control stays focusable; the dropdown can still be opened for viewing and the values still submit.
 * @prop {'sm' | 'md' | 'lg'} size - Control size. `md` is the default; `sm` and `lg` scale the control height and padding.
 * @fires {CustomEvent<{ value: string }>} arc-input - Fired on every keystroke in the filter input. `event.detail.value` contains the current query text.
 * @fires {CustomEvent<{ value: string[] }>} arc-change - Fired when the selected values change
 * @slot - Default content.
 * @csspart label
 * @csspart control
 * @csspart tag
 * @csspart input
 * @csspart dropdown
 * @csspart option
 */
export class ArcMultiSelect extends FormControlMixin(LitElement) {
  static properties = {
    size: { type: String, reflect: true },
    value:        { type: Array },
    placeholder:  { type: String },
    label:        { type: String },
    name:         { type: String, reflect: true },
    disabled:     { type: Boolean, reflect: true },
    _query:       { state: true },
    _open:        { state: true },
    _focused:     { state: true },
    _options:     { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        position: relative;
        font-family: var(--font-body);
      }

      :host([disabled]) {
        opacity: 0.5;
        pointer-events: none;
      }

      .ms__label {
        display: block;
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--space-xs);
      }

      .ms__control {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-xs);
        min-height: 38px;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-xs) var(--space-sm);
        cursor: text;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-shadow: var(--shadow-inset);
      }

      /* Sizes. The control wraps its chips, so height is a floor rather than a
         fixed value — md is the base rule above. */
      :host([size="sm"]) .ms__control { min-height: 32px; padding: 2px var(--space-xs); }
      :host([size="sm"]) .ms__input { font-size: var(--_text-sm); }
      :host([size="lg"]) .ms__input { font-size: var(--_text-md); }
      :host([size="lg"]) .ms__control { min-height: 46px; padding: var(--space-sm) var(--space-md); }

      .ms__control:hover:not(.ms__control--focused) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }

      .ms__control--focused {
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      .ms__tag {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-size: var(--_text-xs);
        font-weight: 500;
        color: var(--text-primary);
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-full);
        padding: 2px calc(var(--space-xs) + 2px) 2px calc(var(--space-sm) + 2px); /* cosmetic 2px vertical for inline tag */
        white-space: nowrap;
      }

      .ms__tag-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border: none;
        background: none;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: var(--radius-full);
        font-size: var(--_text-sm);
        line-height: 1;
        padding: 0;
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .ms__tag-remove:hover {
        color: var(--text-primary);
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .ms__tag-remove:focus-visible {
        outline: none;
        color: var(--text-primary);
        box-shadow: var(--interactive-focus);
      }

      .ms__input {
        flex: 1;
        min-width: 60px;
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: var(--field-weight, 400);
        color: var(--text-primary);
        background: none;
        border: none;
        outline: none;
        padding: var(--space-xs) 0;
      }

      .ms__input::placeholder {
        color: var(--text-muted);
      }

      @keyframes dropdown-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .ms__dropdown {
        position: absolute;
        top: calc(100% + var(--space-xs));
        inset-inline-start: 0;
        inset-inline-end: 0;
        max-height: 220px;
        overflow-y: auto;
        overflow-x: hidden;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        z-index: var(--z-dropdown);
        padding: var(--space-xs) 0;
        display: none;
      }

      .ms__dropdown--open {
        display: block;
        animation: dropdown-in var(--transition-fast);
      }

      .ms__dropdown::before {
        content: '';
        display: block;
        height: 1px;
        background: var(--divider-glow);
      }

      .ms__option {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        text-align: start;
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-primary);
        background: none;
        border: none;
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
        transition: background var(--transition-fast);
      }

      .ms__option:hover,
      .ms__option--active {
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .ms__check {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        color: var(--interactive);
        opacity: 0;
      }

      .ms__check--visible {
        opacity: 1;
      }

      .ms__empty {
        padding: var(--space-sm) var(--space-md);
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      .ms__slot-host { display: none; }

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
    // animate: false — this panel has its own keyframe entrance.
    managedPanelStyles('ms__dropdown', { animate: false }),
  ];

  static _idCounter = 0;

  constructor() {
    super();
    this.size = 'md';
    this.value = [];
    this.placeholder = '';
    this.label = '';
    this.name = '';
    this.disabled = false;
    this._query = '';
    this._open = false;
    this._focused = false;
    this._options = [];
    this._msId = `multi-select-${++ArcMultiSelect._idCounter}`;
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => {
        this._open = false;
        this._focused = false;
      },
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.ms__control'),
      floating: () => this.shadowRoot?.querySelector('.ms__dropdown'),
      matchWidth: true,
      offset: 4,
    });
    this._listbox = new ListboxController(this, {
      getItemCount: () => this._filteredItems.length,
      isOpen: () => this._open,
      onOpen: () => { this._open = true; },
      onClose: () => { this._open = false; },
      onSelect: (i) => this._toggleItem(this._filteredItems[i]),
      optionId: (i) => `${this._msId}-option-${i}`,
      scrollContainer: () => this.shadowRoot?.querySelector('.ms__dropdown'),
    });
  }

  /** Submits one FormData entry per selected value under `name`. */
  _formValue() {
    const selected = this.value || [];
    if (this.name) {
      const data = new FormData();
      for (const val of selected) data.append(this.name, val);
      return data;
    }
    return selected.join(',');
  }

  _formResetState() {
    return { value: [...(this.value || [])] };
  }

  _applyFormState(state) {
    this.value = [...(state.value || [])];
  }

  _onSlotChange(e) {
    this._options = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-OPTION');
  }

  updated(changed) {
    if (changed.has('_open')) {
      this._open ? this._position.show() : this._position.hide();
    }
    if (changed.has('value')) {
      this._updateFormValue();
    }
    if (changed.has('_open')) {
      if (this._open) this._clickOutside.activate();
      else this._clickOutside.deactivate();
    }
    if (changed.has('_query') || changed.has('_options') || changed.has('suggestions')) {
      this._listbox.clampToCount();
    }
  }

  get _normalizedItems() {
    return this._options.map(opt => ({ label: opt.label, value: opt.value }));
  }

  get _filteredItems() {
    const q = this._query.toLowerCase();
    if (!q) return this._normalizedItems;
    return this._normalizedItems.filter(item =>
      item.label.toLowerCase().includes(q)
    );
  }

  _isSelected(item) {
    return (this.value || []).includes(item.value);
  }

  _toggleItem(item) {
    if (this.readonly) return;
    const current = [...(this.value || [])];
    const idx = current.indexOf(item.value);

    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(item.value);
    }

    this.value = current;
    this._query = '';
    this._listbox.reset();

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _removeItem(val, e) {
    e.stopPropagation();
    if (this.readonly) return;
    this.value = (this.value || []).filter(v => v !== val);

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _onInput(e) {
    this._query = e.target.value;
    this._open = true;
    this._listbox.reset();
    this.dispatchEvent(new CustomEvent('arc-input', {
      detail: { value: this._query },
      bubbles: true,
      composed: true,
    }));
  }

  _onFocusIn() {
    this._focused = true;
    this._open = true;
  }

  _onKeyDown(e) {
    // Home/End move the text cursor while there is a query; the listbox only
    // gets them when the field is empty.
    const textKeys = (e.key === 'Home' || e.key === 'End') && this._query;
    if (!textKeys && this._listbox.handleKeydown(e)) return;

    switch (e.key) {
      case 'ArrowLeft':
        if (e.target.selectionStart === 0 && e.target.selectionEnd === 0 && (this.value || []).length > 0) {
          e.preventDefault();
          this._focusTag((this.value || []).length - 1);
        }
        break;
      case 'Backspace':
        if (!this._query && this.value && this.value.length > 0) {
          this._removeItem(this.value[this.value.length - 1], e);
        }
        break;
    }
  }

  _focusTag(index) {
    this.shadowRoot.querySelectorAll('.ms__tag-remove')[index]?.focus();
  }

  _onTagKeyDown(e, index) {
    const selected = this.value || [];

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this._focusTag(Math.max(index - 1, 0));
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < selected.length - 1) {
          this._focusTag(index + 1);
        } else {
          this.shadowRoot.querySelector('.ms__input')?.focus();
        }
        break;
      case 'Backspace':
      case 'Delete':
        e.preventDefault();
        this._removeItem(selected[index], e);
        this.updateComplete.then(() => {
          const remaining = this.shadowRoot.querySelectorAll('.ms__tag-remove');
          if (remaining.length > 0) {
            remaining[Math.min(index, remaining.length - 1)].focus();
          } else {
            this.shadowRoot.querySelector('.ms__input')?.focus();
          }
        });
        break;
      case 'Escape':
        e.preventDefault();
        this.shadowRoot.querySelector('.ms__input')?.focus();
        break;
    }
  }

  _getLabel(val) {
    const item = this._normalizedItems.find(i => i.value === val);
    return item ? item.label : val;
  }

  render() {
    const filtered = this._filteredItems;
    const selected = this.value || [];
    const showPlaceholder = selected.length === 0 && !this._query;
    const listboxId = `${this._msId}-listbox`;
    const activeId = this._listbox.activeIndex >= 0 ? `${this._msId}-option-${this._listbox.activeIndex}` : undefined;

    return html`
      <div class="ms__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      ${this.label ? html`<label class="ms__label" part="label">${this.label}</label>` : ''}
      <div
        class="ms__control ${this._focused ? 'ms__control--focused' : ''}"
        @click=${() => this.shadowRoot.querySelector('.ms__input')?.focus()}
        part="control"
      >
        ${selected.map((val, i) => html`
          <span class="ms__tag" part="tag">
            ${this._getLabel(val)}
            <button
              class="ms__tag-remove"
              @click=${(e) => this._removeItem(val, e)}
              @keydown=${(e) => this._onTagKeyDown(e, i)}
              aria-label="Remove ${this._getLabel(val)}"
              tabindex="-1"
            >&times;</button>
          </span>
        `)}
        <input
          class="ms__input"
          type="text"
          role="combobox"
          autocomplete="off"
          .value=${this._query}
          placeholder=${showPlaceholder ? this.placeholder : ''}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          aria-expanded=${String(this._open)}
          aria-controls=${listboxId}
          aria-activedescendant=${activeId || ''}
          aria-autocomplete="list"
          @input=${this._onInput}
          @focus=${this._onFocusIn}
          @keydown=${this._onKeyDown}
          part="input"
        />
      </div>
      <div
        id=${listboxId}
        class="ms__dropdown ${this._open ? 'ms__dropdown--open' : ''}"
        role="listbox"
        aria-multiselectable="true"
        part="dropdown"
      >
        ${filtered.length > 0
          ? filtered.map((item, i) => {
              const checked = this._isSelected(item);
              return html`
                <div
                  id="${this._msId}-option-${i}"
                  class="ms__option ${i === this._listbox.activeIndex ? 'ms__option--active' : ''}"
                  role="option"
                  aria-selected=${String(checked)}
                  @click=${() => this._toggleItem(item)}
                  part="option"
                >
                  <svg class="ms__check ${checked ? 'ms__check--visible' : ''}" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  ${item.label}
                </div>
              `;
            })
          : html`<div class="ms__empty">No results found</div>`
        }
      </div>
    `;
  }
}
