import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { isOptionDisabled } from '../shared/option.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * A radio-group-style toggle bar that renders slotted arc-option elements as a row of mutually
 * exclusive buttons with an active highlight.
 *
 * @tag arc-segmented-control
 * @status stable
 * @prop {string} value - The value of the currently selected option. Reflected as an attribute and auto-set to the first selectable option if empty.
 * @prop {string} name - The form field name submitted with the selected value. Required for native form integration — without it, the selection will not appear in FormData.
 * @prop {boolean} disabled - Disables the entire control, reducing opacity to 40% and blocking pointer events.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when the selected segment changes
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart control
 * @csspart option
 */
export class ArcSegmentedControl extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    value: { type: String, reflect: true },
    name: { type: String, reflect: true },
    disabled: flag(false),
    _options: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .segmented {
        display: inline-flex;
        align-items: center;
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        /* Pill track, pill thumb — the thumb slides along it, and a capsule is
           the shape that reads as a track rather than as a row of boxes. */
        border-radius: var(--radius-full);
        padding: 3px; /* cosmetic inset for pill container */
        gap: 2px; /* cosmetic micro-spacing */
        box-sizing: border-box;
      }

      .segmented__option {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--touch-pad) var(--space-md);
        min-height: var(--touch-min);
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        background: transparent;
        border: 1px solid transparent;
        /* No inset calc needed once both are pills: a capsule nested in a
           capsule stays concentric at any size, which the md-minus-2px form
           only approximated. */
        border-radius: var(--radius-full);
        cursor: pointer;
        transition:
          background var(--transition-base),
          color var(--transition-base),
          border-color var(--transition-base),
          box-shadow var(--transition-base);
        white-space: nowrap;
        user-select: none;
        line-height: 1.4;
      }

      .segmented__option:hover:not(.is-active):not(:disabled) {
        color: var(--text-primary);
        background: var(--surface-hover);
      }

      /* The per-option disabled state (finding #6). The host rule above covers
         the whole control; this covers one segment of an otherwise live one. */
      .segmented__option:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .segmented__option.is-active {
        background: var(--interactive);
        color: var(--on-accent);
        border-color: var(--interactive);
        box-shadow: 0 0 12px rgba(var(--interactive-rgb), 0.4);
      }

      .segmented__option:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .segmented__option.is-active:focus-visible {
        box-shadow: var(--interactive-focus), 0 0 12px rgba(var(--interactive-rgb), 0.4);
      }

      .segmented__slot-host { display: none; }

      @media (prefers-reduced-motion: reduce) {
        .segmented__option { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.name = '';
    this._options = [];
  }

  /**
   * Read the options once the first render has a slot to read from.
   *
   * `slotchange` alone is not enough under declarative shadow DOM: the parser
   * attaches the shadow root and assigns the slot before Lit adopts the tree,
   * so the assignment has already happened by the time this component's
   * listener exists and the event never arrives. A server-rendered control
   * therefore upgraded with zero options and collapsed to an 8px sliver —
   * on every page that used one, including its own documentation.
   */
  firstUpdated() {
    hydrateSlots(this);
    this._readOptions(this.shadowRoot?.querySelector('slot'));
  }

  _onSlotChange(e) {
    this._readOptions(e.target);
  }

  _readOptions(slot) {
    if (!slot) return;
    const options = slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-OPTION');
    if (!options.length && !this._options.length) return;
    this._options = options;
    // Auto-select the first *selectable* option if no value set — landing the
    // initial selection on a disabled segment would defeat the whole guard.
    if (!this.value && this._options.length > 0) {
      const first = this._options.find((opt) => !this._isDisabled(opt));
      this.value = first?.getAttribute('value') || '';
      // That auto-selection *is* this control's initial state, but it happens
      // after connectedCallback captured the reset baseline — so without this,
      // form.reset() would clear the bar rather than return it here.
      this._recaptureFormResetState();
    }
  }

  /** Whether this option refuses selection — see shared/option.js, finding #6. */
  _isDisabled(option) {
    return isOptionDisabled(option);
  }

  /**
   * The next selectable index walking `step` from `from`, wrapping, or
   * `undefined` when every option is disabled. Bounded so an all-disabled
   * control terminates rather than spinning.
   */
  _seek(from, step) {
    const n = this._options.length;
    for (let i = 1; i <= n; i += 1) {
      const candidate = (from + step * i + n * i) % n;
      if (!this._isDisabled(this._options[candidate])) return candidate;
    }
    return undefined;
  }

  _select(optionValue) {
    if (this.disabled || optionValue === this.value) return;
    const option = this._options.find((opt) => (opt.getAttribute('value') || '') === optionValue);
    if (option && this._isDisabled(option)) return;
    this.value = optionValue;
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleKeydown(e, index) {
    let nextIndex = index;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = this._seek(index, 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = this._seek(index, -1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const val = this._options[index]?.getAttribute('value') || '';
      this._select(val);
      return;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = this._seek(-1, 1);
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = this._seek(this._options.length, -1);
    } else {
      return;
    }

    // The key stays claimed above whether or not a selectable option survives
    // the walk; an all-disabled control must not scroll the page instead.
    if (nextIndex === undefined) return;
    const val = this._options[nextIndex]?.getAttribute('value') || '';
    this._select(val);
    this.updateComplete.then(() => {
      const buttons = this.shadowRoot.querySelectorAll('.segmented__option');
      buttons[nextIndex]?.focus();
    });
  }

  render() {
    return html`
      <div part="base" class="segmented__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div
        class="segmented"
        role="radiogroup"
        aria-disabled=${this.disabled ? 'true' : 'false'}
        part="control"
      >
        ${this._options.map((opt, i) => {
          const val = opt.getAttribute('value') || '';
          const label = opt.textContent?.trim() || val;
          const isActive = val === this.value;
          const optionDisabled = this._isDisabled(opt);
          return html`
            <button
              class="segmented__option ${isActive ? 'is-active' : ''}"
              role="radio"
              aria-checked=${isActive ? 'true' : 'false'}
              tabindex=${isActive ? '0' : '-1'}
              ?disabled=${this.disabled || optionDisabled}
              @click=${() => this._select(val)}
              @keydown=${(e) => this._handleKeydown(e, i)}
              part="option"
            >${label}</button>
          `;
        })}
      </div>
    `;
  }
}
