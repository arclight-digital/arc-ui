import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import './icon-button.js';

/**
 * Dual-listbox for moving items between an available and a selected pane, ideal for permissions
 * and settings UIs.
 *
 * @tag arc-transfer-list
 * @requires arc-icon-button
 * @prop options - The full universe of items. Items whose value is in `value` render in the Selected pane; the rest render in Available.
 * @prop {string[]} value - Values currently in the Selected pane, kept in options order. Updated after every move and emitted via `arc-change`.
 * @prop {string} name - Form field name. When set, the component submits one form entry per selected value.
 * @prop {boolean} searchable - Adds a filter input to each pane that narrows that pane only, case-insensitively. Move-all respects the filter.
 * @prop {string} sourceLabel - Heading for the left (available) pane. Attribute: `source-label`.
 * @prop {string} targetLabel - Heading for the right (selected) pane. Attribute: `target-label`.
 * @prop {boolean} disabled - Disables the whole control, preventing interaction and reducing opacity.
 * @fires {CustomEvent<{ value: string[] }>} arc-change - Fired after every move with `{ value }` -- the current array of selected values.
 * @csspart pane
 * @csspart pane-header
 * @csspart search
 * @csspart listbox
 * @csspart option
 * @csspart controls
 */
export class ArcTransferList extends FormControlMixin(LitElement) {
  static properties = {
    options:     { type: Array },
    value:       { type: Array },
    name:        { type: String, reflect: true },
    disabled:    { type: Boolean, reflect: true },
    searchable:  { type: Boolean, reflect: true },
    sourceLabel: { type: String, attribute: 'source-label' },
    targetLabel: { type: String, attribute: 'target-label' },
    _sourceQuery:  { state: true },
    _targetQuery:  { state: true },
    _checked:      { state: true },
    _activeSource: { state: true },
    _activeTarget: { state: true },
    _announcement: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-body);
        container-type: inline-size;
      }

      :host([disabled]) {
        opacity: 0.5;
        pointer-events: none;
      }

      .tl {
        display: flex;
        align-items: stretch;
        gap: var(--space-sm);
      }

      .tl__pane {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      .tl__pane-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--border-default);
      }

      .tl__pane-label {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .tl__pane-count {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--text-muted);
        white-space: nowrap;
      }

      .tl__search {
        margin: var(--space-sm) var(--space-sm) 0;
        min-height: 32px;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        padding: var(--space-xs) var(--space-sm);
        box-shadow: var(--shadow-inset);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .tl__search::placeholder {
        color: var(--text-muted);
      }

      .tl__search:focus-visible {
        outline: none;
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      .tl__listbox {
        flex: 1;
        height: 220px;
        overflow-y: auto;
        overflow-x: hidden;
        padding: var(--space-xs);
      }

      .tl__option {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-xs) var(--space-sm);
        min-height: 32px;
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
        color: var(--text-primary);
        cursor: pointer;
        user-select: none;
        transition: background var(--transition-fast);
      }

      .tl__option:hover {
        background: var(--surface-hover);
      }

      .tl__option--checked,
      .tl__option--checked:hover {
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .tl__option:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      .tl__option--disabled,
      .tl__option--disabled:hover {
        color: var(--text-ghost);
        cursor: default;
        background: none;
      }

      .tl__box {
        position: relative;
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-bright);
        background: var(--surface-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background var(--transition-fast), border-color var(--transition-fast);
      }

      .tl__option--disabled .tl__box {
        border-color: var(--border-default);
      }

      .tl__option--checked .tl__box {
        background: var(--interactive);
        border-color: var(--interactive);
      }

      .tl__check {
        width: 10px;
        height: 10px;
        fill: none;
        stroke: var(--surface-base);
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: 0;
        transition: opacity var(--transition-fast);
      }

      .tl__option--checked .tl__check {
        opacity: 1;
      }

      .tl__option-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tl__empty {
        padding: var(--space-lg) var(--space-md);
        text-align: center;
        font-size: var(--text-sm);
        color: var(--text-ghost);
      }

      .tl__controls {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--space-xs);
        flex-shrink: 0;
      }

      @container (max-width: 560px) {
        .tl {
          flex-direction: column;
        }
        .tl__controls {
          flex-direction: row;
        }
        /* Rotate arrows so "right" reads as "down" toward the target pane */
        .tl__controls arc-icon-button {
          transform: rotate(90deg);
        }
      }

      .tl__sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
      }

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
    this.options = [];
    this.value = [];
    this.name = '';
    this.disabled = false;
    this.searchable = false;
    this.sourceLabel = 'Available';
    this.targetLabel = 'Selected';
    this._sourceQuery = '';
    this._targetQuery = '';
    this._checked = new Set();      // values marked to move (distinct from being in `value`)
    this._activeSource = null;      // roving-tabindex value per pane
    this._activeTarget = null;
    this._announcement = '';
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

  updated(changed) {
    if (changed.has('value')) {
      this._updateFormValue();
    }
  }

  get _valueSet() {
    return new Set(this.value || []);
  }

  _paneItems(pane) {
    const selected = this._valueSet;
    return (this.options || []).filter(o =>
      pane === 'source' ? !selected.has(o.value) : selected.has(o.value)
    );
  }

  _filteredItems(pane) {
    const items = this._paneItems(pane);
    const q = (pane === 'source' ? this._sourceQuery : this._targetQuery).toLowerCase();
    if (!q) return items;
    return items.filter(o => String(o.label ?? '').toLowerCase().includes(q));
  }

  /** Active (roving) value for a pane, falling back to the first visible item. */
  _activeValue(pane, items) {
    const stored = pane === 'source' ? this._activeSource : this._activeTarget;
    if (stored != null && items.some(o => o.value === stored)) return stored;
    return items.length > 0 ? items[0].value : null;
  }

  _setActive(pane, val) {
    if (pane === 'source') this._activeSource = val;
    else this._activeTarget = val;
  }

  async _focusActiveOption(pane) {
    await this.updateComplete;
    this.shadowRoot
      .querySelector(`.tl__listbox[data-pane="${pane}"] [role="option"][tabindex="0"]`)
      ?.focus();
  }

  _paneLabel(pane) {
    return pane === 'source' ? this.sourceLabel : this.targetLabel;
  }

  /**
   * Move `values` out of `pane` into the other pane. Keeps `value` in
   * options order, clears moved items from the checked set, announces,
   * and (optionally) keeps focus in the origin pane on the nearest item.
   */
  _move(values, pane, { keepFocus = false } = {}) {
    const movable = values.filter(v => {
      const opt = (this.options || []).find(o => o.value === v);
      return opt && !opt.disabled;
    });
    if (movable.length === 0) return;

    const before = this._filteredItems(pane);
    const firstIdx = Math.min(
      ...movable.map(v => before.findIndex(o => o.value === v)).filter(i => i >= 0)
    );
    const movedSet = new Set(movable);

    const selected = this._valueSet;
    if (pane === 'source') {
      for (const v of movable) selected.add(v);
    } else {
      for (const v of movable) selected.delete(v);
    }
    // Options order is canonical; unknown values are preserved at the end.
    const known = (this.options || []).filter(o => selected.has(o.value)).map(o => o.value);
    const unknown = [...selected].filter(v => !(this.options || []).some(o => o.value === v));
    this.value = [...known, ...unknown];

    const checked = new Set(this._checked);
    for (const v of movable) checked.delete(v);
    this._checked = checked;

    const dest = pane === 'source' ? this.targetLabel : this.sourceLabel;
    this._announcement =
      `${movable.length} ${movable.length === 1 ? 'item' : 'items'} moved to ${dest}`;

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));

    if (keepFocus) {
      const remaining = before.filter(o => !movedSet.has(o.value));
      if (remaining.length > 0) {
        const nearest = remaining[Math.min(Math.max(firstIdx, 0), remaining.length - 1)];
        this._setActive(pane, nearest.value);
        this._focusActiveOption(pane);
      } else {
        this._focusActiveOption(pane === 'source' ? 'target' : 'source');
      }
    }
  }

  _checkedIn(pane) {
    return this._paneItems(pane).filter(o => this._checked.has(o.value) && !o.disabled);
  }

  _movableIn(pane) {
    return this._filteredItems(pane).filter(o => !o.disabled);
  }

  _moveChecked(pane, e) {
    this._move(this._checkedIn(pane).map(o => o.value), pane);
    this._recoverButtonFocus(pane, e);
  }

  _moveAll(pane, e) {
    this._move(this._movableIn(pane).map(o => o.value), pane);
    this._recoverButtonFocus(pane, e);
  }

  /** If the clicked control became disabled, drop focus into a listbox instead of <body>. */
  async _recoverButtonFocus(pane, e) {
    const btn = e?.currentTarget;
    await this.updateComplete;
    if (!btn || !btn.disabled) return;
    if (this._filteredItems(pane).length > 0) this._focusActiveOption(pane);
    else this._focusActiveOption(pane === 'source' ? 'target' : 'source');
  }

  _toggleChecked(item) {
    if (item.disabled) return;
    const checked = new Set(this._checked);
    if (checked.has(item.value)) checked.delete(item.value);
    else checked.add(item.value);
    this._checked = checked;
  }

  _onOptionClick(pane, item) {
    this._setActive(pane, item.value);
    this._toggleChecked(item);
  }

  _onOptionDblClick(pane, item) {
    if (item.disabled) return;
    this._move([item.value], pane, { keepFocus: true });
  }

  _onListKeyDown(e, pane) {
    const items = this._filteredItems(pane);
    if (items.length === 0) return;
    const active = this._activeValue(pane, items);
    const idx = items.findIndex(o => o.value === active);

    if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const checked = new Set(this._checked);
      for (const o of items) if (!o.disabled) checked.add(o.value);
      this._checked = checked;
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._setActive(pane, items[Math.min(idx + 1, items.length - 1)].value);
        this._focusActiveOption(pane);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._setActive(pane, items[Math.max(idx - 1, 0)].value);
        this._focusActiveOption(pane);
        break;
      case 'Home':
        e.preventDefault();
        this._setActive(pane, items[0].value);
        this._focusActiveOption(pane);
        break;
      case 'End':
        e.preventDefault();
        this._setActive(pane, items[items.length - 1].value);
        this._focusActiveOption(pane);
        break;
      case ' ':
        e.preventDefault();
        if (items[idx]) this._toggleChecked(items[idx]);
        break;
      case 'Enter':
        e.preventDefault();
        if (items[idx] && !items[idx].disabled) {
          this._move([items[idx].value], pane, { keepFocus: true });
        }
        break;
    }
  }

  _onSearchInput(e, pane) {
    if (pane === 'source') this._sourceQuery = e.target.value;
    else this._targetQuery = e.target.value;
  }

  _renderPane(pane) {
    const label = this._paneLabel(pane);
    const all = this._paneItems(pane);
    const items = this._filteredItems(pane);
    const query = pane === 'source' ? this._sourceQuery : this._targetQuery;
    const checkedCount = all.filter(o => this._checked.has(o.value) && !o.disabled).length;
    const activeVal = this._activeValue(pane, items);

    return html`
      <div class="tl__pane" part="pane">
        <div class="tl__pane-header" part="pane-header">
          <span class="tl__pane-label">${label}</span>
          <span class="tl__pane-count">${checkedCount} of ${all.length}</span>
        </div>
        ${this.searchable ? html`
          <input
            class="tl__search"
            type="text"
            autocomplete="off"
            placeholder="Filter…"
            aria-label="Filter ${label}"
            .value=${query}
            ?disabled=${this.disabled}
            @input=${(e) => this._onSearchInput(e, pane)}
            part="search"
          />
        ` : ''}
        <div
          class="tl__listbox"
          data-pane=${pane}
          role="listbox"
          aria-multiselectable="true"
          aria-label=${label}
          part="listbox"
          @keydown=${(e) => this._onListKeyDown(e, pane)}
        >
          ${items.length > 0
            ? items.map(item => {
                const checked = this._checked.has(item.value) && !item.disabled;
                const isActive = item.value === activeVal;
                return html`
                  <div
                    class="tl__option ${checked ? 'tl__option--checked' : ''} ${item.disabled ? 'tl__option--disabled' : ''}"
                    role="option"
                    tabindex=${isActive && !this.disabled ? '0' : '-1'}
                    aria-selected=${String(checked)}
                    aria-disabled=${String(!!item.disabled)}
                    @click=${() => this._onOptionClick(pane, item)}
                    @dblclick=${() => this._onOptionDblClick(pane, item)}
                    part="option"
                  >
                    <span class="tl__box" aria-hidden="true">
                      <svg class="tl__check" viewBox="0 0 16 16">
                        <path d="M3.5 8L6.5 11L12.5 5"/>
                      </svg>
                    </span>
                    <span class="tl__option-label">${item.label}</span>
                  </div>
                `;
              })
            : html`<div class="tl__empty">${query ? 'No matches' : 'No items'}</div>`
          }
        </div>
      </div>
    `;
  }

  render() {
    const disabled = this.disabled;
    return html`
      <div class="tl">
        ${this._renderPane('source')}
        <div class="tl__controls" part="controls" role="group" aria-label="Transfer controls">
          <arc-icon-button
            name="chevron-right"
            size="sm"
            variant="secondary"
            label="Move checked to ${this.targetLabel}"
            ?disabled=${disabled || this._checkedIn('source').length === 0}
            @click=${(e) => this._moveChecked('source', e)}
          ></arc-icon-button>
          <arc-icon-button
            name="chevrons-right"
            size="sm"
            variant="secondary"
            label="Move all to ${this.targetLabel}"
            ?disabled=${disabled || this._movableIn('source').length === 0}
            @click=${(e) => this._moveAll('source', e)}
          ></arc-icon-button>
          <arc-icon-button
            name="chevron-left"
            size="sm"
            variant="secondary"
            label="Move checked to ${this.sourceLabel}"
            ?disabled=${disabled || this._checkedIn('target').length === 0}
            @click=${(e) => this._moveChecked('target', e)}
          ></arc-icon-button>
          <arc-icon-button
            name="chevrons-left"
            size="sm"
            variant="secondary"
            label="Move all to ${this.sourceLabel}"
            ?disabled=${disabled || this._movableIn('target').length === 0}
            @click=${(e) => this._moveAll('target', e)}
          ></arc-icon-button>
        </div>
        ${this._renderPane('target')}
      </div>
      <div class="tl__sr-only" aria-live="polite">${this._announcement}</div>
    `;
  }
}
