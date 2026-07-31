import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import { PositionController } from '../shared/position-controller.js';
import { ListboxController } from '../shared/listbox-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';
import '../shared/option.js';

/**
 * Dropdown select with searchable options, keyboard navigation, and full ARIA listbox semantics
 * for accessible form inputs.
 *
 * @tag arc-select
 * @prop {string} value - The currently selected value. Must match one of the child `arc-option` value attributes. Setting this programmatically updates the displayed label and internal selection state.
 * @prop {string} placeholder - Hint text displayed inside the trigger button when no option is selected. Use it to communicate what kind of choice the user should make, such as "Choose a team member..." or "Pick a status". The placeholder disappears once a value is chosen.
 * @prop {string} label - Visible label rendered above the select trigger. Also serves as the accessible name for assistive technologies. Always provide a label for accessibility compliance.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the select trigger size.
 * @prop {string} name - Form field name submitted with the selected value. Required for native form integration via ElementInternals.
 * @prop {boolean} disabled - When true, the select trigger becomes non-interactive: it cannot be opened, focused via keyboard, or clicked. The component renders with reduced opacity to visually convey the unavailable state.
 * @prop {string} error - Error message displayed below the select. When set, the trigger border turns red.
 * @prop {boolean} open - Controls whether the dropdown is visible. Set programmatically to open or close the dropdown. Automatically set to `false` when an option is selected or the user clicks outside.
 * @fires arc-change - Fired when the selected option changes
 * @slot - Default content.
 * @csspart select
 * @csspart label
 * @csspart trigger
 * @csspart dropdown
 * @csspart error
 */
export class ArcSelect extends FormControlMixin(LitElement) {
  static properties = {
    value:       { type: String, reflect: true },
    placeholder: { type: String },
    label:       { type: String },
    name:        { type: String, reflect: true },
    disabled:    { type: Boolean, reflect: true },
    size:        { type: String, reflect: true },
    error:       { type: String },
    open:        { type: Boolean, reflect: true },
    _options:    { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; position: relative; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .select__label {
        display: block;
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--space-xs);
      }

      .select__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: var(--touch-min);
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: var(--field-weight, 400);
        color: var(--text-primary);
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-sizing: border-box;
        box-shadow: var(--shadow-inset);
      }

      .select__trigger:hover:not(:focus-visible) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }
      .select__trigger:focus-visible {
        outline: none;
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      :host([open]) .select__trigger {
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      .select__placeholder { color: var(--text-ghost); }

      .select__chevron {
        font-size: var(--_text-xs);
        color: var(--text-muted);
        transition: transform var(--transition-fast) var(--ease-out-expo);
      }
      :host([open]) .select__chevron { transform: rotate(180deg); }

      @keyframes dropdown-in {
        from { opacity: 0; transform: translateY(-4px) scale(0.96); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Resting position for a dropdown PositionController hasn't adopted:
         pre-upgrade and in prism's static HTML export. Once managed, the
         controller writes fixed viewport coordinates and the panel paints in
         the top layer, so it no longer clips at a viewport edge or inside an
         overflow:hidden ancestor. */
      .select__dropdown {
        position: absolute;
        top: 100%;
        inset-inline-start: 0;
        inset-inline-end: 0;
        margin-top: var(--space-xs);
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        max-height: 240px;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: var(--z-dropdown);
        display: none;
      }

      :host([open]) .select__dropdown {
        display: block;
        animation: dropdown-in var(--transition-fast);
      }

      .select__dropdown::before {
        content: '';
        display: block;
        height: 1px;
        background: var(--divider-glow);
      }

      .select__option {
        display: block;
        width: 100%;
        min-height: var(--touch-min);
        padding: var(--touch-pad) var(--space-md);
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-secondary);
        background: none;
        border: none;
        cursor: pointer;
        text-align: start;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .select__option:hover,
      .select__option--active {
        background: rgba(var(--interactive-rgb), 0.08);
        color: var(--text-primary);
        outline: none;
      }

      .select__option[aria-selected="true"] {
        color: var(--interactive);
      }

      /* Sizes */
      :host([size="sm"]) .select__trigger { padding: var(--space-xs) var(--space-sm); font-size: var(--_text-sm); }
      :host([size="sm"]) .select__label { font-size: calc(var(--label-inline-size) - 1px); }
      :host([size="lg"]) .select__trigger { padding: var(--space-md) var(--space-lg); font-size: var(--_text-md); }

      /* Error state */
      .select--error .select__trigger {
        border-color: var(--color-error);
      }

      .select--error .select__trigger:focus-visible,
      :host([open]) .select--error .select__trigger {
        border-color: var(--color-error);
        box-shadow: var(--interactive-focus-error);
      }

      .select__error {
        font-size: var(--_text-xs);
        color: var(--color-error);
        line-height: 1.4;
        margin-top: var(--space-xs);
      }

      .select__slot-host { display: none; }
    `,
    // animate: false — the dropdown has its own dropdown-in keyframes, and a
    // declared transform beside them is redundant at best.
    managedPanelStyles('select__dropdown', { animate: false }),
  ];

  static _idCounter = 0;

  constructor() {
    super();
    this._selectId = `select-${++ArcSelect._idCounter}`;
    this.value = '';
    this.placeholder = 'Select...';
    this.label = '';
    this.name = '';
    this.disabled = false;
    this.size = 'md';
    this.error = '';
    this.open = false;
    this._options = [];
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => { this.open = false; },
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.select__trigger'),
      floating: () => this.shadowRoot?.querySelector('.select__dropdown'),
      // The dropdown belongs directly under its trigger and spans its width, so
      // there is no cross-axis alignment choice to make — only whether it has
      // room below, which flip decides.
      matchWidth: true,
      offset: 4,
    });
    this._listbox = new ListboxController(this, {
      getItemCount: () => this._options.length,
      isOpen: () => this.open,
      onOpen: () => { this.open = true; },
      onClose: () => {
        this.open = false;
        // Virtual focus means the trigger never lost real focus, so there is
        // nothing to restore — but a click-opened select may not have had it.
        this.shadowRoot.querySelector('.select__trigger')?.focus();
      },
      onSelect: (i) => this._selectOption(this._options[i]),
      optionId: (i) => `${this._selectId}-opt-${i}`,
      scrollContainer: () => this.shadowRoot?.querySelector('.select__dropdown'),
      // A select has no text field of its own, so letter keys can mean
      // "jump to the option starting with this" — as a native select does.
      typeahead: true,
      getItemLabel: (i) => this._options[i]?.label ?? '',
    });
  }

  updated(changed) {
    super.updated(changed);
    if (changed.has('open')) {
      if (this.open) {
        this._clickOutside.activate();
        this._position.show();
        // Open onto the selected option, so arrowing starts from where the user
        // already is rather than from the top of the list.
        const selected = this._options.findIndex(o => o.value === this.value);
        if (selected >= 0) this._listbox.setActive(selected);
      } else {
        this._clickOutside.deactivate();
        this._position.hide();
        this._listbox.reset();
      }
    }
    // Options arriving or filtering out changes the panel's height, which can
    // change whether it still fits below the trigger.
    if (changed.has('_options')) {
      this._listbox.clampToCount();
      if (this.open) this._position.show();
    }
  }

  _onSlotChange(e) {
    this._options = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-OPTION');
  }

  _toggleOpen() {
    if (this.disabled || this.readonly) return;
    this.open = !this.open;
  }

  _selectOption(opt) {
    this.value = opt.value;
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: opt.value, label: opt.label },
      bubbles: true,
      composed: true,
    }));
  }

  _handleTriggerKeydown(e) {
    if (this._listbox.handleKeydown(e)) return;

    // Space and Enter open a closed select, and Space selects the active option
    // in an open one. Enter-when-open is already handled above.
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!this.open) {
        this.open = true;
      } else if (this._listbox.activeIndex >= 0) {
        this._selectOption(this._options[this._listbox.activeIndex]);
      }
    }
  }

  get _selectedLabel() {
    const selected = this._options.find(o => o.value === this.value);
    return selected ? selected.label : '';
  }

  render() {
    const display = this._selectedLabel;

    const hasError = !!this.error;
    const listboxId = `${this._selectId}-listbox`;
    const labelId = `${this._selectId}-label`;
    const triggerId = `${this._selectId}-trigger`;

    return html`
      <div class="select ${hasError ? 'select--error' : ''}" part="select">
        <div class="select__slot-host">
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
        ${this.label ? html`<span id=${labelId} class="select__label" part="label">${this.label}</span>` : ''}
        <button
          id=${triggerId}
          class="select__trigger"
          role="combobox"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-haspopup="listbox"
          aria-controls=${listboxId}
          aria-activedescendant=${this._listbox.activeDescendantId || nothing}
          aria-labelledby=${this.label ? labelId : nothing}
          aria-label=${this.label ? nothing : this.placeholder || 'Select an option'}
          @click=${this._toggleOpen}
          @keydown=${this._handleTriggerKeydown}
          part="trigger"
        >
          ${display
            ? html`<span>${display}</span>`
            : html`<span class="select__placeholder">${this.placeholder}</span>`
          }
          <span class="select__chevron" aria-hidden="true">&#9662;</span>
        </button>
        <div id=${listboxId} class="select__dropdown" role="listbox" part="dropdown">
          ${this._options.map((opt, i) => html`
            <div
              id="${this._selectId}-opt-${i}"
              class="select__option ${i === this._listbox.activeIndex ? 'select__option--active' : ''}"
              role="option"
              aria-selected=${opt.value === this.value ? 'true' : 'false'}
              @click=${() => this._selectOption(opt)}
              part="option"
            >${opt.label}</div>
          `)}
        </div>
        ${hasError ? html`<span class="select__error" role="alert" part="error">${this.error}</span>` : ''}
      </div>
    `;
  }
}
