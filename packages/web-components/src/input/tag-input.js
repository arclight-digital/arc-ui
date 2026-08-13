import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { PositionController } from '../shared/position-controller.js';
import { ListboxController } from '../shared/listbox-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { DismissController } from '../shared/dismiss-controller.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Free-text token entry field with optional autocomplete suggestions, delimiter splitting, and
 * duplicate rejection.
 *
 * @tag arc-tag-input
 * @prop {string[]} value - Array of current tags. Updated on add/remove and emitted via `arc-change`.
 * @prop {string[]} suggestions - Autocomplete candidates. When non-empty, typing filters them into a dropdown listbox.
 * @prop {string} delimiter - Character that commits the current text as a tag when typed; pasted text is split on it.
 * @prop {number} maxTags - Maximum number of tags (0 = unlimited). At the limit, entry is disabled with a "-- max reached" hint.
 * @prop {boolean} allowCustom - When false, only values from `suggestions` can be added; free text is rejected.
 * @prop {string} label - Visible label rendered above the field in a small uppercase style.
 * @prop {string} placeholder - Hint text shown inside the field when no tags exist and the input is empty.
 * @prop {string} name - Form field name. Each tag is submitted as its own FormData entry under this name.
 * @prop {boolean} disabled - Disables the control, preventing interaction and reducing opacity to 50%.
 * @prop {boolean} readonly - Prevents adding or removing tags while the field stays focusable and the tags still submit with the form.
 * @prop {string} error - Error message shown below the field; also applies error styling to the border.
 * @prop {'sm' | 'md' | 'lg'} size - Control size. `md` is the default; `sm` and `lg` scale the field height and padding.
 * @fires {CustomEvent<{ value: string[] }>} arc-change - Fired when a tag is added or removed; detail contains `{ value }`
 * @fires arc-input - Fired as the user types; detail contains `{ query }`
 * @slot none
 * @csspart label
 * @csspart field
 * @csspart tag
 * @csspart input
 * @csspart dropdown
 * @csspart option
 * @csspart error
 */
export class ArcTagInput extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    value: { type: Array },
    suggestions: { type: Array },
    delimiter: { type: String },
    maxTags: { type: Number, attribute: 'max-tags' },
    allowCustom: flag(true, { attribute: 'allow-custom', negative: 'no-custom', reflect: false }),
    label: { type: String },
    placeholder: { type: String },
    name: { type: String, reflect: true },
    // NOT flag(): a form-associated custom element whose `disabled` content
    // attribute is merely *present* is "actually disabled" per the HTML spec,
    // so the platform calls formDisabledCallback(true) and the mixin sets the
    // property back. `disabled="false"` is a disabled control here for exactly
    // the reason it is on a native <input>. Native semantics win; see
    // shared/props.js.
    disabled: { type: Boolean, reflect: true },
    error: { type: String },
    _query: { state: true },
    _open: { state: true },
    _focused: { state: true },
    _shakeValue: { state: true },
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

      .ti__label {
        display: block;
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--space-xs);
      }

      .ti__field {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-xs);
        min-height: var(--touch-min);
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-xs) var(--space-sm);
        cursor: text;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-shadow: var(--shadow-inset);
      }

      /* Sizes. The field wraps its tags, so height is a floor rather than a
         fixed value — md is the base rule above, which uses --touch-min. */
      :host([size="sm"]) .ti__field { min-height: 32px; padding: 2px var(--space-xs); }
      :host([size="sm"]) .ti__input { font-size: var(--_text-sm); }
      :host([size="lg"]) .ti__input { font-size: var(--_text-md); }
      :host([size="lg"]) .ti__field { min-height: 52px; padding: var(--space-sm) var(--space-md); }

      .ti__field:hover:not(.ti__field--focused) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }

      .ti__field--focused {
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      .ti__field--error,
      .ti__field--error.ti__field--focused {
        border-color: var(--color-error);
      }

      .ti__tag {
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

      @keyframes tag-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-4px); }
        40% { transform: translateX(4px); }
        60% { transform: translateX(-2px); }
        80% { transform: translateX(2px); }
      }

      .ti__tag--shake {
        animation: tag-shake 0.35s var(--ease-out-expo);
        border-color: var(--color-error);
      }

      .ti__tag-remove {
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

      .ti__tag-remove:hover {
        color: var(--text-primary);
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .ti__tag-remove:focus-visible {
        outline: none;
        color: var(--text-primary);
        box-shadow: var(--interactive-focus);
      }

      .ti__input {
        flex: 1;
        min-width: 60px;
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-primary);
        background: none;
        border: none;
        outline: none;
        padding: var(--space-xs) 0;
      }

      .ti__input::placeholder {
        color: var(--text-muted);
      }

      .ti__input[aria-disabled="true"]::placeholder {
        font-style: italic;
      }

      @keyframes dropdown-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .ti__dropdown {
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

      .ti__dropdown--open {
        display: block;
        animation: dropdown-in var(--transition-fast);
      }

      .ti__dropdown::before {
        content: '';
        display: block;
        height: 1px;
        background: var(--divider-glow);
      }

      .ti__option {
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

      .ti__option:hover,
      .ti__option--active {
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .ti__option:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .ti__error {
        display: block;
        margin-top: var(--space-xs);
        font-size: var(--_text-xs);
        color: var(--color-error);
        line-height: 1.4;
      }
    `,
    // animate: false — this panel has its own keyframe entrance.
    managedPanelStyles('ti__dropdown', { animate: false }),
  ];

  static _idCounter = 0;

  constructor() {
    super();
    this.value = [];
    this.suggestions = [];
    this.delimiter = ',';
    this.maxTags = 0;
    this.label = '';
    this.placeholder = '';
    this.name = '';
    this.disabled = false;
    this.error = '';
    this._query = '';
    this._open = false;
    this._focused = false;
    this._shakeValue = null;
    this._shakeTimer = 0;
    this._tiId = `tag-input-${++ArcTagInput._idCounter}`;
    this._dismiss = new DismissController(this, {
      onDismiss: () => {
        this._open = false;
        this._focused = false;
      },
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.ti__field'),
      floating: () => this.shadowRoot?.querySelector('.ti__dropdown'),
      matchWidth: true,
      offset: 4,
    });
    this._listbox = new ListboxController(this, {
      getItemCount: () => this._filteredSuggestions.length,
      isOpen: () => this._open,
      // Only open on a direction key when there is something to show — an empty
      // suggestion list would otherwise open a blank panel.
      onOpen: () => {
        if ((this.suggestions || []).length > 0) this._open = true;
      },
      onClose: () => {
        this._open = false;
      },
      onSelect: (i) => this._commit(this._filteredSuggestions[i]),
      optionId: (i) => `${this._tiId}-option-${i}`,
      scrollContainer: () => this.shadowRoot?.querySelector('.ti__dropdown'),
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._shakeTimer);
  }

  /** Submits one FormData entry per tag under `name`. */
  _formValue() {
    const tags = this.value || [];
    if (this.name) {
      const data = new FormData();
      for (const tag of tags) data.append(this.name, tag);
      return data;
    }
    return tags.join(',');
  }

  _formResetState() {
    return { value: [...(this.value || [])] };
  }

  _applyFormState(state) {
    this.value = [...(state.value || [])];
  }

  updated(changed) {
    super.updated(changed);
    if (changed.has('_open')) {
      this._open ? this._position.show() : this._position.hide();
    }
    // Keyed on `_focused` as well as `_open`, because this control carries focus
    // state that outlives its panel: the field keeps its focus ring while the
    // suggestion list is closed. Subscribing only while open left the ring stuck
    // on a control the user had already tabbed away from (finding #60).
    if (changed.has('_open') || changed.has('_focused')) {
      if (this._open || this._focused) this._dismiss.activate();
      else this._dismiss.deactivate();
    }
    if (changed.has('_query') || changed.has('suggestions') || changed.has('value')) {
      this._listbox.clampToCount();
    }
  }

  get _atMax() {
    return this.maxTags > 0 && (this.value || []).length >= this.maxTags;
  }

  get _filteredSuggestions() {
    const tags = (this.value || []).map((t) => t.toLowerCase());
    const q = this._query.trim().toLowerCase();
    return (this.suggestions || [])
      .filter((s) => !tags.includes(s.toLowerCase()))
      .filter((s) => !q || s.toLowerCase().includes(q));
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Adds a trimmed tag; rejects empties, over-max, non-suggestions (when allowCustom=false), and duplicates (with a shake). */
  _commit(raw) {
    if (this.readonly) return false;
    const text = (raw ?? '').trim();
    if (!text || this._atMax) return false;

    // canonicalize casing against suggestions when one matches
    const match = (this.suggestions || []).find((s) => s.toLowerCase() === text.toLowerCase());
    if (!this.allowCustom && !match) return false;
    const finalValue = match || text;

    const existing = (this.value || []).find((t) => t.toLowerCase() === finalValue.toLowerCase());
    if (existing) {
      this._shakeExisting(existing);
      this._query = '';
      return false;
    }

    this.value = [...(this.value || []), finalValue];
    this._query = '';
    this._listbox.reset();
    this._emitChange();
    return true;
  }

  _shakeExisting(tag) {
    // reset then re-set on the next frame so the animation restarts on repeat offenses
    this._shakeValue = null;
    requestAnimationFrame(() => {
      this._shakeValue = tag;
    });
    clearTimeout(this._shakeTimer);
    this._shakeTimer = setTimeout(() => {
      this._shakeValue = null;
    }, 450);
  }

  _removeTag(tag, e) {
    e?.stopPropagation();
    if (this.readonly) return;
    this.value = (this.value || []).filter((t) => t !== tag);
    this._emitChange();
  }

  _onInput(e) {
    const raw = e.target.value;
    if (this.delimiter && raw.includes(this.delimiter)) {
      // typed or pasted delimiters: commit every complete segment, keep the remainder
      const parts = raw.split(this.delimiter);
      const remainder = parts.pop();
      for (const part of parts) this._commit(part);
      this._query = remainder;
      e.target.value = remainder;
    } else {
      this._query = raw;
    }
    this._open = (this.suggestions || []).length > 0;
    this._listbox.reset();
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: this._query, query: this._query },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onFocusIn() {
    this._focused = true;
    if ((this.suggestions || []).length > 0) this._open = true;
  }

  _onKeyDown(e) {
    if (this.delimiter && e.key === this.delimiter) {
      e.preventDefault();
      this._commit(this._query);
      return;
    }

    // The listbox declines Enter when no option is active, which is what leaves
    // the "commit whatever was typed" case below reachable.
    const textKeys = (e.key === 'Home' || e.key === 'End') && this._query;
    if (!textKeys && this._listbox.handleKeydown(e)) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this._commit(this._query);
        break;
      case 'ArrowLeft':
        if (
          e.target.selectionStart === 0 &&
          e.target.selectionEnd === 0 &&
          (this.value || []).length > 0
        ) {
          e.preventDefault();
          this._focusTag((this.value || []).length - 1);
        }
        break;
      case 'Backspace':
        if (!this._query && this.value && this.value.length > 0) {
          this._removeTag(this.value[this.value.length - 1], e);
        }
        break;
    }
  }

  _focusTag(index) {
    this.shadowRoot.querySelectorAll('.ti__tag-remove')[index]?.focus();
  }

  _onTagKeyDown(e, index) {
    const tags = this.value || [];

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this._focusTag(Math.max(index - 1, 0));
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < tags.length - 1) {
          this._focusTag(index + 1);
        } else {
          this.shadowRoot.querySelector('.ti__input')?.focus();
        }
        break;
      case 'Backspace':
      case 'Delete':
        e.preventDefault();
        this._removeTag(tags[index], e);
        this.updateComplete.then(() => {
          const remaining = this.shadowRoot.querySelectorAll('.ti__tag-remove');
          if (remaining.length > 0) {
            remaining[Math.min(index, remaining.length - 1)].focus();
          } else {
            this.shadowRoot.querySelector('.ti__input')?.focus();
          }
        });
        break;
      case 'Escape':
        e.preventDefault();
        this.shadowRoot.querySelector('.ti__input')?.focus();
        break;
    }
  }

  render() {
    const tags = this.value || [];
    const filtered = this._filteredSuggestions;
    const atMax = this._atMax;
    const dropdownOpen = this._open && !atMax && filtered.length > 0;
    const hasError = !!this.error;
    const inputId = `${this._tiId}-input`;
    const listboxId = `${this._tiId}-listbox`;
    const activeId =
      dropdownOpen && this._listbox.activeIndex >= 0
        ? `${this._tiId}-option-${this._listbox.activeIndex}`
        : undefined;
    const placeholder = atMax
      ? '-- max reached'
      : tags.length === 0 && !this._query
        ? this.placeholder
        : '';

    return html`
      ${this.label ? html`<label class="ti__label" for=${inputId} part="label">${this.label}</label>` : ''}
      <div
        class="ti__field ${this._focused ? 'ti__field--focused' : ''} ${hasError ? 'ti__field--error' : ''}"
        @click=${() => this.shadowRoot.querySelector('.ti__input')?.focus()}
        part="field"
      >
        ${tags.map(
          (tag, i) => html`
          <span class="ti__tag ${this._shakeValue === tag ? 'ti__tag--shake' : ''}" part="tag">
            ${tag}
            <button
              class="ti__tag-remove"
              @click=${(e) => this._removeTag(tag, e)}
              @keydown=${(e) => this._onTagKeyDown(e, i)}
              aria-label="Remove ${tag}"
              tabindex="-1"
            >&times;</button>
          </span>
        `,
        )}
        <input
          id=${inputId}
          class="ti__input"
          type="text"
          role="combobox"
          autocomplete="off"
          .value=${this._query}
          placeholder=${placeholder}
          ?disabled=${this.disabled}
          ?readonly=${atMax || this.readonly}
          aria-disabled=${atMax || this.disabled ? 'true' : 'false'}
          aria-expanded=${String(dropdownOpen)}
          aria-controls=${listboxId}
          aria-activedescendant=${activeId || ''}
          aria-autocomplete="list"
          aria-invalid=${hasError ? 'true' : 'false'}
          @input=${this._onInput}
          @focus=${this._onFocusIn}
          @keydown=${this._onKeyDown}
          part="input"
        />
      </div>
      <div
        id=${listboxId}
        class="ti__dropdown ${dropdownOpen ? 'ti__dropdown--open' : ''}"
        role="listbox"
        part="dropdown"
      >
        ${filtered.map(
          (item, i) => html`
          <div
            id="${this._tiId}-option-${i}"
            class="ti__option ${i === this._listbox.activeIndex ? 'ti__option--active' : ''}"
            role="option"
            aria-selected=${String((this.value || []).includes(item))}
            @click=${() => this._commit(item)}
            part="option"
          >${item}</div>
        `,
        )}
      </div>
      ${hasError ? html`<span class="ti__error" role="alert" part="error">${this.error}</span>` : ''}
    `;
  }
}
