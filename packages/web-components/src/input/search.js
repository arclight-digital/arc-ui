import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import { PositionController } from '../shared/position-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';

/**
 * Search input with a magnifying glass icon, clear button, loading spinner, and autocomplete
 * suggestions dropdown.
 *
 * @tag arc-search
 * @requires arc-suggestion
 * @prop {string} value - Current text content of the search input.
 * @prop {string} placeholder - Hint text displayed when the input is empty.
 * @prop {string} label - Accessible label for the search field. Rendered visually above the input when provided.
 * @prop {boolean} disabled - Disables the input, reducing opacity and blocking interaction.
 * @prop {boolean} loading - Shows a spinning indicator in place of the clear button to signal in-progress loading.
 * @prop {boolean} open - Whether the suggestion dropdown is visible. Reflected so it can be opened programmatically or styled from CSS.
 * @fires {CustomEvent<{ value: string }>} arc-input - Fired on each keystroke in the search field
 * @fires {CustomEvent<void>} arc-clear - Fired when the clear button is clicked
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when the value is committed: Enter in the field, or a suggestion selected by click or keyboard
 * @fires arc-select - Fired when a suggestion is selected (before the accompanying arc-change)
 * @slot - Default content.
 * @csspart label
 * @csspart wrapper
 * @csspart icon
 * @csspart input
 * @csspart spinner
 * @csspart clear
 * @csspart suggestions
 * @csspart suggestion
 */
export class ArcSearch extends LitElement {
  static properties = {
    value: { type: String },
    placeholder: { type: String },
    label: { type: String },
    disabled: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    _activeIndex: { state: true },
    _suggestions: { state: true },
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

      .search__label {
        display: block;
        font-size: var(--_text-xs);
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: var(--space-xs);
        letter-spacing: 0.5px;
      }

      .search__wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search__icon {
        position: absolute;
        inset-inline-start: var(--space-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: var(--text-muted);
        pointer-events: none;
      }

      .search__input {
        width: 100%;
        box-sizing: border-box;
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-primary);
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-lg) var(--space-sm) calc(var(--space-sm) + 26px);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .search__input::placeholder {
        color: var(--text-muted);
      }

      .search__input:focus-visible {
        outline: none;
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--interactive-focus);
      }

      .search__clear {
        position: absolute;
        inset-inline-end: var(--space-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: var(--radius-full);
        font-size: var(--_text-md);
        padding: 0;
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .search__clear:hover {
        color: var(--text-primary);
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .search__clear:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .search__spinner {
        position: absolute;
        inset-inline-end: var(--space-sm);
        width: 18px;
        height: 18px;
        border: 2px solid var(--border-default);
        border-top-color: var(--interactive);
        border-radius: var(--radius-full);
        animation: spin 0.7s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .search__suggestions {
        position: absolute;
        top: calc(100% + 4px);
        inset-inline-start: 0;
        inset-inline-end: 0;
        max-height: 220px;
        overflow-y: auto;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        z-index: var(--z-dropdown);
        padding: var(--space-xs) 0;
        display: none;
      }

      .search__suggestions--open {
        display: block;
      }

      .search__suggestion {
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

      .search__suggestion:hover,
      .search__suggestion--active {
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .search__suggestion:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .search__slot-host { display: none; }
    `,
    managedPanelStyles('search__suggestions', {
      openCls: 'search__suggestions--open',
      animate: false,
    }),
  ];

  constructor() {
    super();
    this.value = '';
    this.placeholder = 'Search...';
    this.label = '';
    this.disabled = false;
    this.loading = false;
    this.open = false;
    this._activeIndex = -1;
    this._suggestions = [];
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => {
        this.open = false;
      },
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.search__wrapper'),
      floating: () => this.shadowRoot?.querySelector('.search__suggestions'),
      matchWidth: true,
      offset: 4,
    });
  }

  updated() {
    // The panel is only really open when there is something to show, which is
    // the same condition render() uses for the --open class.
    const showing = this.open && this._suggestions.length > 0;
    showing ? this._position.show() : this._position.hide();
    showing ? this._clickOutside.activate() : this._clickOutside.deactivate();
  }

  _onSlotChange(e) {
    this._suggestions = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-SUGGESTION');
  }

  get _hasSuggestions() {
    return this._suggestions.length > 0;
  }

  get _normalizedSuggestions() {
    return this._suggestions.map((s) => ({
      label: s.label,
      value: s.value || s.label,
    }));
  }

  _onInput(e) {
    this.value = e.target.value;
    this._activeIndex = -1;
    if (this._hasSuggestions) this.open = true;

    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onFocus() {
    if (this._hasSuggestions) this.open = true;
  }

  _clear() {
    this.value = '';
    this.open = false;
    this._activeIndex = -1;

    this.dispatchEvent(
      new CustomEvent('arc-clear', {
        bubbles: true,
        composed: true,
      }),
    );

    this.shadowRoot.querySelector('.search__input')?.focus();
  }

  _submit() {
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _selectSuggestion(item) {
    this.value = item.label || item.value;
    this.open = false;
    this._activeIndex = -1;

    this.dispatchEvent(
      new CustomEvent('arc-select', {
        detail: { value: item },
        bubbles: true,
        composed: true,
      }),
    );

    // A suggestion pick commits the value just like Enter does, so it must
    // also fire arc-change — same detail shape as _submit().
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onKeyDown(e) {
    const items = this._normalizedSuggestions;

    switch (e.key) {
      case 'ArrowDown':
        if (!this.open && this._hasSuggestions) {
          this.open = true;
          return;
        }
        e.preventDefault();
        this._activeIndex = Math.min(this._activeIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._activeIndex = Math.max(this._activeIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (this._activeIndex >= 0 && items[this._activeIndex]) {
          this._selectSuggestion(items[this._activeIndex]);
        } else {
          this._submit();
        }
        break;
      case 'Escape':
        if (this.open) {
          this.open = false;
          this._activeIndex = -1;
        }
        break;
    }
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const items = this._normalizedSuggestions;
    const showSuggestions = this.open && items.length > 0;

    return html`
      <div class="search__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      ${this.label ? html`<label class="search__label" part="label">${this.label}</label>` : ''}
      <div class="search__wrapper" part="wrapper">
        <span class="search__icon" aria-hidden="true" part="icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M11 11L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>

        <input
          class="search__input"
          type="text"
          role=${this._hasSuggestions ? 'combobox' : 'searchbox'}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          aria-label=${this.label || this.placeholder}
          aria-expanded=${this._hasSuggestions ? String(this.open) : nothing}
          aria-autocomplete=${this._hasSuggestions ? 'list' : nothing}
          aria-controls=${this._hasSuggestions ? 'search-suggestions' : nothing}
          @input=${this._onInput}
          @focus=${this._onFocus}
          @keydown=${this._onKeyDown}
          part="input"
        />

        ${
          this.loading
            ? html`
          <span class="search__spinner" part="spinner" aria-label="Loading"></span>
        `
            : this.value
              ? html`
          <button
            class="search__clear"
            @click=${this._clear}
            aria-label="Clear search"
            tabindex="-1"
            part="clear"
          >&times;</button>
        `
              : ''
        }

        <div
          id="search-suggestions"
          class="search__suggestions ${showSuggestions ? 'search__suggestions--open' : ''}"
          role="listbox"
          aria-label="Suggestions"
          part="suggestions"
        >
          ${items.map(
            (item, i) => html`
            <button
              class="search__suggestion ${i === this._activeIndex ? 'search__suggestion--active' : ''}"
              role="option"
              aria-selected=${i === this._activeIndex ? 'true' : 'false'}
              @click=${() => this._selectSuggestion(item)}
              part="suggestion"
            >${item.label || item.value}</button>
          `,
          )}
        </div>
      </div>
    `;
  }
}
