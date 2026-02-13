import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import './suggestion.js';

export class ArcSearch extends LitElement {
  static properties = {
    value:        { type: String },
    placeholder:  { type: String },
    label:        { type: String },
    disabled:     { type: Boolean, reflect: true },
    loading:      { type: Boolean, reflect: true },
    _open:        { state: true },
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
        font-size: var(--text-xs);
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
        left: var(--space-sm);
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
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-lg) var(--space-sm) calc(var(--space-sm) + 26px);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .search__input::placeholder {
        color: var(--text-muted);
      }

      .search__input:focus {
        outline: none;
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
      }

      .search__clear {
        position: absolute;
        right: var(--space-sm);
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
        font-size: var(--text-md);
        padding: 0;
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .search__clear:hover {
        color: var(--text-primary);
        background: rgba(var(--accent-primary-rgb), 0.1);
      }

      .search__clear:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .search__spinner {
        position: absolute;
        right: var(--space-sm);
        width: 18px;
        height: 18px;
        border: 2px solid var(--border-default);
        border-top-color: var(--accent-primary);
        border-radius: var(--radius-full);
        animation: spin 0.7s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .search__suggestions {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        max-height: 220px;
        overflow-y: auto;
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        z-index: 1000;
        padding: var(--space-xs) 0;
        display: none;
      }

      .search__suggestions--open {
        display: block;
      }

      .search__suggestion {
        display: block;
        width: 100%;
        text-align: left;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: none;
        border: none;
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
        transition: background var(--transition-fast);
      }

      .search__suggestion:hover,
      .search__suggestion--active {
        background: rgba(var(--accent-primary-rgb), 0.1);
      }

      .search__suggestion:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .search__slot-host { display: none; }

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
    this.value = '';
    this.placeholder = 'Search...';
    this.label = '';
    this.disabled = false;
    this.loading = false;
    this._open = false;
    this._activeIndex = -1;
    this._suggestions = [];
    this._onDocClick = this._onDocClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onDocClick, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onDocClick, true);
  }

  _onSlotChange(e) {
    this._suggestions = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-SUGGESTION');
  }

  _onDocClick(e) {
    if (!e.composedPath().includes(this)) {
      this._open = false;
    }
  }

  get _hasSuggestions() {
    return this._suggestions.length > 0;
  }

  get _normalizedSuggestions() {
    return this._suggestions.map(s => ({
      label: s.label,
      value: s.value || s.label,
    }));
  }

  _onInput(e) {
    this.value = e.target.value;
    this._activeIndex = -1;
    if (this._hasSuggestions) this._open = true;

    this.dispatchEvent(new CustomEvent('arc-input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _onFocus() {
    if (this._hasSuggestions) this._open = true;
  }

  _clear() {
    this.value = '';
    this._open = false;
    this._activeIndex = -1;

    this.dispatchEvent(new CustomEvent('arc-clear', {
      bubbles: true,
      composed: true,
    }));

    this.shadowRoot.querySelector('.search__input')?.focus();
  }

  _submit() {
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _selectSuggestion(item) {
    this.value = item.label || item.value;
    this._open = false;
    this._activeIndex = -1;

    this.dispatchEvent(new CustomEvent('arc-select', {
      detail: { value: item },
      bubbles: true,
      composed: true,
    }));
  }

  _onKeyDown(e) {
    const items = this._normalizedSuggestions;

    switch (e.key) {
      case 'ArrowDown':
        if (!this._open && this._hasSuggestions) { this._open = true; return; }
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
        if (this._open) {
          this._open = false;
          this._activeIndex = -1;
        }
        break;
    }
  }

  render() {
    const items = this._normalizedSuggestions;
    const showSuggestions = this._open && items.length > 0;

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
          role="searchbox"
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          aria-label=${this.label || this.placeholder}
          aria-expanded=${this._hasSuggestions ? String(this._open) : undefined}
          @input=${this._onInput}
          @focus=${this._onFocus}
          @keydown=${this._onKeyDown}
          part="input"
        />

        ${this.loading ? html`
          <span class="search__spinner" part="spinner" aria-label="Loading"></span>
        ` : this.value ? html`
          <button
            class="search__clear"
            @click=${this._clear}
            aria-label="Clear search"
            tabindex="-1"
            part="clear"
          >&times;</button>
        ` : ''}

        <div
          class="search__suggestions ${showSuggestions ? 'search__suggestions--open' : ''}"
          role="listbox"
          part="suggestions"
        >
          ${items.map((item, i) => html`
            <button
              class="search__suggestion ${i === this._activeIndex ? 'search__suggestion--active' : ''}"
              role="option"
              aria-selected=${i === this._activeIndex ? 'true' : 'false'}
              @click=${() => this._selectSuggestion(item)}
              part="suggestion"
            >${item.label || item.value}</button>
          `)}
        </div>
      </div>
    `;
  }
}

customElements.define('arc-search', ArcSearch);
