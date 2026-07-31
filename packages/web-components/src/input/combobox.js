import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { PositionController } from '../shared/position-controller.js';
import { ListboxController } from '../shared/listbox-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import '../shared/option.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';

/**
 * Searchable dropdown with type-ahead filtering.
 *
 * @tag arc-combobox
 * @prop {string} value - The currently selected option value. Reflected as an attribute so it can be read from the DOM. Updated automatically when the user selects an option.
 * @prop {string} placeholder - Placeholder text shown in the input when no value is entered.
 * @prop {string} label - Visible label rendered above the input. Also used as the accessible label for the combobox.
 * @prop {boolean} disabled - Disables the input and prevents interaction. The host element receives reduced opacity and pointer-events: none.
 * @prop {boolean} readonly - Prevents typing and selecting an option while the input stays focusable; the list can still be opened for viewing and the value still submits.
 * @prop {'sm' | 'md' | 'lg'} size - Control size. `md` is the default; `sm` and `lg` scale the field padding.
 * @fires arc-input - Fired on every keystroke in the filter input. `event.detail.value` contains the current query text.
 * @fires arc-change - Fired when an option is selected. `event.detail.value` contains the selected option value.
 * @slot - Default content.
 * @csspart label
 * @csspart wrapper
 * @csspart input
 * @csspart listbox
 * @csspart option
 */
export class ArcCombobox extends FormControlMixin(LitElement) {
  static properties = {
    size: { type: String, reflect: true },
    value: { type: String, reflect: true },
    placeholder: { type: String },
    label: { type: String },
    name: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    _query: { state: true },
    _open: { state: true },
    _options: { state: true },
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

      .combobox__label {
        display: block;
        font-size: var(--_text-xs);
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: var(--space-xs);
        letter-spacing: 0.5px;
      }

      .combobox__wrapper {
        position: relative;
      }

      .combobox__input {
        width: 100%;
        box-sizing: border-box;
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: var(--field-weight, 400);
        color: var(--text-primary);
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-shadow: var(--shadow-inset);
      }

      /* Sizes. md is the base rule above, so an unrecognised value lands on it. */
      :host([size="sm"]) .combobox__input { padding: var(--space-xs) var(--space-sm); font-size: var(--_text-sm); }
      :host([size="lg"]) .combobox__input { padding: var(--space-md) var(--space-lg); font-size: var(--_text-md); }

      .combobox__input::placeholder {
        color: var(--text-muted);
      }

      .combobox__input:hover:not(:focus) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }

      .combobox__input:focus-visible {
        outline: none;
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      @keyframes dropdown-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .combobox__listbox {
        position: absolute;
        top: calc(100% + 4px);
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

      .combobox__listbox--open {
        display: block;
        animation: dropdown-in var(--transition-fast);
      }

      .combobox__listbox::before {
        content: '';
        display: block;
        height: 1px;
        background: var(--divider-glow);
      }

      .combobox__option {
        display: block;
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

      .combobox__option:hover,
      .combobox__option--active {
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .combobox__option--selected {
        color: var(--interactive);
      }

      .combobox__empty {
        padding: var(--space-sm) var(--space-md);
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      .combobox__slot-host { display: none; }
    `,
    // animate: false — this panel has its own keyframe entrance.
    managedPanelStyles('combobox__listbox', { animate: false }),
  ];

  static _idCounter = 0;

  constructor() {
    super();
    this.size = 'md';
    this.value = '';
    this.placeholder = '';
    this.label = '';
    this.name = '';
    this.disabled = false;
    this._query = '';
    this._open = false;
    this._options = [];
    this._comboId = `combobox-${++ArcCombobox._idCounter}`;
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => {
        this._open = false;
      },
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.combobox__wrapper'),
      floating: () => this.shadowRoot?.querySelector('.combobox__listbox'),
      matchWidth: true,
      offset: 4,
    });
    this._listbox = new ListboxController(this, {
      getItemCount: () => this._filteredItems.length,
      isOpen: () => this._open,
      onOpen: () => {
        this._open = true;
      },
      onClose: () => {
        this._open = false;
      },
      onSelect: (i) => this._selectItem(this._filteredItems[i]),
      optionId: (i) => `${this._comboId}-opt-${i}`,
      scrollContainer: () => this.shadowRoot?.querySelector('.combobox__listbox'),
    });
  }

  /**
   * The visible text is derived from `value` only when a matching option
   * exists, so restoring `value` alone leaves stale text after form.reset()
   * clears it — capture and restore the query alongside the value.
   */
  _formResetState() {
    return { value: this.value, query: this._query };
  }

  _applyFormState(state) {
    this.value = state.value ?? '';
    this._query = state.query ?? '';
  }

  _onSlotChange(e) {
    this._options = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-OPTION');
  }

  get _normalizedItems() {
    return this._options.map((opt) => ({ label: opt.label, value: opt.value }));
  }

  get _filteredItems() {
    const q = this._query.toLowerCase();
    if (!q) return this._normalizedItems;
    return this._normalizedItems.filter((item) => item.label.toLowerCase().includes(q));
  }

  _onInput(e) {
    this._query = e.target.value;
    this._open = true;
    this._listbox.reset();
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: this._query },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onFocus() {
    this._open = true;
  }

  _selectItem(item) {
    if (this.readonly) return;
    this.value = item.value;
    this._query = item.label;
    this._open = false;
    this._listbox.reset();

    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: item.value, item },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onKeyDown(e) {
    // Home/End belong to the text cursor while there is a query to move through;
    // ListboxController only gets them when the field is empty.
    if ((e.key === 'Home' || e.key === 'End') && this._query) return;
    this._listbox.handleKeydown(e);
  }

  updated(changed) {
    super.updated(changed);
    if (changed.has('_open')) {
      this._open ? this._position.show() : this._position.hide();
    }
    if (changed.has('value')) {
      if (!this._open) {
        const item = this._normalizedItems.find((i) => i.value === this.value);
        if (item) this._query = item.label;
      }
    }
    if (changed.has('_open')) {
      if (this._open) this._clickOutside.activate();
      else this._clickOutside.deactivate();
    }
    // Filtering can leave fewer options than the active index, which would point
    // aria-activedescendant at an option that no longer exists.
    if (changed.has('_query') || changed.has('_options')) this._listbox.clampToCount();
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const filtered = this._filteredItems;
    const listboxId = `${this._comboId}-listbox`;
    const activeId = this._listbox.activeDescendantId;

    return html`
      <div class="combobox__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      ${this.label ? html`<label class="combobox__label" for="${this._comboId}-input" part="label">${this.label}</label>` : ''}
      <div class="combobox__wrapper" part="wrapper">
        <input
          id="${this._comboId}-input"
          class="combobox__input"
          type="text"
          role="combobox"
          autocomplete="off"
          .value=${this._query}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          aria-expanded=${String(this._open)}
          aria-controls=${listboxId}
          aria-activedescendant=${activeId || ''}
          aria-autocomplete="list"
          @input=${this._onInput}
          @focus=${this._onFocus}
          @keydown=${this._onKeyDown}
          part="input"
        />
        <div
          id=${listboxId}
          class="combobox__listbox ${this._open ? 'combobox__listbox--open' : ''}"
          role="listbox"
          part="listbox"
        >
          ${
            filtered.length > 0
              ? filtered.map(
                  (item, i) => html`
                <div
                  id="${this._comboId}-opt-${i}"
                  class="combobox__option ${i === this._listbox.activeIndex ? 'combobox__option--active' : ''} ${item.value === this.value ? 'combobox__option--selected' : ''}"
                  role="option"
                  aria-selected=${item.value === this.value ? 'true' : 'false'}
                  @click=${() => this._selectItem(item)}
                  part="option"
                >${item.label}</div>
              `,
                )
              : html`<div class="combobox__empty">No results found</div>`
          }
        </div>
      </div>
    `;
  }
}
