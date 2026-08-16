import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

let maskedInputIdCounter = 0;

/**
 * Mask-definition characters. Anything else in a mask is a literal that the
 * component types for the user.
 */
const FILLABLE = {
  '#': /[0-9]/,
  A: /[A-Za-z]/,
  a: /[A-Za-z]/,
  '*': /[A-Za-z0-9]/,
};

const isFillable = (ch) => Object.prototype.hasOwnProperty.call(FILLABLE, ch);

/** The fillable slot characters of a mask, in order. */
const slotsOf = (mask) => [...mask].filter(isFillable);

/**
 * Filter arbitrary text into the raw characters the mask accepts, in order.
 * Non-conforming characters are dropped, not blocking — pasting a card number
 * with dashes keeps the digits. Uppercase slots normalize their letter.
 */
function conform(mask, text) {
  const slots = slotsOf(mask);
  let out = '';
  for (const ch of String(text ?? '')) {
    if (out.length >= slots.length) break;
    const slot = slots[out.length];
    if (FILLABLE[slot].test(ch)) out += slot === 'A' ? ch.toUpperCase() : ch;
  }
  return out;
}

/** A mask with every fillable position replaced by the placeholder character. */
function shapeOf(mask, placeholderChar) {
  return [...mask].map((ch) => (isFillable(ch) ? placeholderChar : ch)).join('');
}

/**
 * Format a raw value through a mask. Returns the typed portion (raw characters
 * interleaved with the literals that connect them, including literals directly
 * after the last raw character — the caret rides them) and the still-unfilled
 * remainder of the mask, for the hint overlay.
 */
function format(mask, raw, placeholderChar) {
  if (!raw) return { text: '', rest: shapeOf(mask, placeholderChar) };
  let text = '';
  let ri = 0;
  let i = 0;
  while (i < mask.length) {
    const ch = mask[i];
    if (isFillable(ch)) {
      if (ri >= raw.length) break;
      text += raw[ri++];
    } else {
      text += ch;
    }
    i++;
  }
  return { text, rest: shapeOf(mask.slice(i), placeholderChar) };
}

/** How many raw characters sit before a caret position in the formatted text. */
function rawIndexAt(mask, pos) {
  let count = 0;
  for (let i = 0; i < Math.min(pos, mask.length); i++) {
    if (isFillable(mask[i])) count++;
  }
  return count;
}

/**
 * The formatted caret position for a raw index: just before the raw index-th
 * fillable slot, which is also just after any literals that precede it — the
 * next position that can accept a character.
 */
function caretForRaw(mask, formattedLength, rawIndex) {
  let count = 0;
  for (let i = 0; i < mask.length; i++) {
    if (isFillable(mask[i])) {
      if (count === rawIndex) return Math.min(i, formattedLength);
      count++;
    }
  }
  return formattedLength;
}

/**
 * Text field that enforces a character mask as you type — dates, card numbers,
 * phone numbers, license keys. The mask's literals are typed for the user;
 * `value` holds only the raw characters, and the raw value is what forms
 * receive, so the mask stays presentation.
 *
 * @tag arc-masked-input
 * @status stable
 * @prop {string} mask - The mask pattern. `#` accepts a digit, `A` an uppercase letter (lowercase input is uppercased), `a` any letter, `*` a letter or digit; every other character is a literal typed for the user. Examples: `##/##/####`, `#### #### #### ####`, `AAA-###`.
 * @prop {string} value - The RAW accepted characters only, with no mask literals — `12042026`, never `12/04/2026`. The formatted string is presentation; read it from `formattedValue`. Programmatic values are conformed against the mask, so setting a formatted string keeps only the characters the mask accepts.
 * @prop {string} placeholderChar - Character rendered in unfilled positions of the in-field hint once typing starts (for example `12/__/____`). Before any input, the native placeholder shows the full mask shape. Defaults to `_`.
 * @prop {string} label - Visible label rendered above the field. Automatically associated with the field via a generated id, ensuring screen readers announce it correctly.
 * @prop {string} name - The `name` attribute sent with form data on submission. The submitted value is the RAW value, without mask literals.
 * @prop {boolean} disabled - Prevents user interaction and applies a muted visual treatment. The field value is excluded from form submission when disabled.
 * @prop {boolean} required - Marks the field as required. An empty field fails validation with valueMissing; a partially filled one fails with an "Incomplete value" pattern error.
 * @prop {boolean} readonly - Prevents the user from editing the value while keeping the field focusable, and the value is still submitted with the form.
 * @prop {string} autocomplete - Passed through to the inner input, e.g. `cc-number` on a card field so browser autofill can offer saved cards.
 * @prop {string} error - Error message displayed below the input. When set, the input border turns red and the error text appears.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the input size. Options: 'sm', 'md', 'lg'.
 * @fires {CustomEvent<{ value: string, formatted: string }>} arc-input - Fired on each accepted edit. `value` is the raw characters; `formatted` is the presentation string. A rejected character fires nothing.
 * @fires {CustomEvent<{ value: string, formatted: string }>} arc-change - Fired on blur or Enter when the value changed, and immediately when the last mask position fills — a complete mask is a committed value, the fixed-length precedent set by OTP Input.
 * @slot prefix
 * @slot suffix
 * @csspart base - The root element.
 * @csspart field
 * @csspart label
 * @csspart wrapper
 * @csspart prefix
 * @csspart suffix
 * @csspart hint
 * @csspart error
 */
export class ArcMaskedInput extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  /** Runs its own constraint logic — owns the whole validity flag set. */
  static autoValidates = false;

  static properties = {
    mask: { type: String },
    value: { type: String },
    placeholderChar: { type: String, attribute: 'placeholder-char' },
    label: { type: String },
    name: { type: String, reflect: true },
    // NOT flag(): a form-associated custom element whose `disabled` content
    // attribute is merely *present* is "actually disabled" per the HTML spec,
    // so the platform calls formDisabledCallback(true) and the mixin sets the
    // property back. `disabled="false"` is a disabled control here for exactly
    // the reason it is on a native <input>. Native semantics win; see
    // shared/props.js.
    disabled: { type: Boolean, reflect: true },
    required: flag(false),
    autocomplete: { type: String },
    error: { type: String },
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    _hasPrefix: { state: true },
    _hasSuffix: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .masked {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .masked__label {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .masked__wrapper {
        display: flex;
        align-items: center;
        min-height: var(--touch-min);
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast),
          background var(--transition-fast);
        box-sizing: border-box;
        width: 100%;
        box-shadow: var(--shadow-inset);
      }

      .masked__wrapper:hover:not(:focus-within) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }
      .masked__wrapper:focus-within {
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
        background: var(--surface-raised);
      }

      :host([disabled]) .masked__wrapper { opacity: 0.5; cursor: not-allowed; }

      /* Error state */
      .masked--error .masked__wrapper {
        border-color: var(--color-error);
      }

      .masked--error .masked__wrapper:focus-within {
        border-color: var(--color-error);
        box-shadow: var(--interactive-focus-error);
      }

      .masked__error {
        font-size: var(--_text-xs);
        color: var(--color-error);
        line-height: var(--ui-lh);
      }

      /*
       * The field and the hint overlay must be the same text box: same font,
       * size, and padding, so the unfilled remainder of the mask lines up
       * exactly behind the caret. Mask values are tabular by nature, which is
       * why the field uses the mono role — with a proportional face the
       * overlay could never align.
       */
      .masked__field,
      .masked__hint {
        font-family: var(--font-mono);
        font-size: var(--body-size);
        font-weight: var(--field-weight, 400);
        letter-spacing: normal;
        padding: var(--space-sm) var(--space-md);
        box-sizing: border-box;
      }

      /* Sizes */
      :host([size="sm"]) .masked__field,
      :host([size="sm"]) .masked__hint { padding: var(--space-xs) var(--space-sm); font-size: var(--_text-sm); }
      :host([size="sm"]) .masked__label { font-size: calc(var(--label-inline-size) - 1px); }
      :host([size="lg"]) .masked__field,
      :host([size="lg"]) .masked__hint { padding: var(--space-md) var(--space-lg); font-size: var(--_text-md); }

      .masked__stack {
        position: relative;
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
      }

      .masked__field {
        color: var(--text-primary);
        background: transparent;
        border: none;
        width: 100%;
        min-width: 0;
        position: relative;
        z-index: 1;
        caret-color: var(--interactive);
      }

      .masked__field:focus-visible { outline: none; }
      .masked__field::placeholder { color: var(--text-ghost); }
      .masked__field:disabled { cursor: not-allowed; }

      .masked__hint {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        pointer-events: none;
        white-space: pre;
        overflow: hidden;
      }

      /* Invisible spacer, sized by the typed text the input renders on top. */
      .masked__hint-pad { visibility: hidden; }
      .masked__hint-rest { color: var(--text-ghost); }

      .masked__prefix,
      .masked__suffix {
        display: flex;
        align-items: center;
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .masked__prefix { padding-inline-start: var(--space-md); }
      .masked__suffix { padding-inline-end: var(--space-md); }

      .masked__prefix--empty,
      .masked__suffix--empty { display: none; }

      ::slotted([slot="prefix"]),
      ::slotted([slot="suffix"]) {
        width: 20px;
        height: 20px;
      }
    `,
  ];

  constructor() {
    super();
    this.mask = '';
    this.value = '';
    this.placeholderChar = '_';
    this.label = '';
    this.name = '';
    this.disabled = false;
    this.autocomplete = '';
    this.error = '';
    this._fieldId = `arc-masked-input-${++maskedInputIdCounter}`;
    this._hasPrefix = false;
    this._hasSuffix = false;
    /** Baseline for blur/Enter commits; snapshotted on focus. */
    this._committed = '';
  }

  /**
   * The formatted presentation string — raw characters interleaved with mask
   * literals, e.g. raw 12042026 under a date mask reads 12/04/2026. Read-only:
   * it is derived from value and mask, never stored, and never submitted.
   */
  get formattedValue() {
    return format(this.mask || '', this.value || '', this.placeholderChar).text;
  }

  get _field() {
    return this.shadowRoot?.querySelector('.masked__field') ?? undefined;
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    // The raw value must always conform to the mask, however it arrived —
    // typed, pasted, or set from script. Conforming here also means a consumer
    // may assign a formatted string and keep only what the mask accepts.
    if (changed.has('value') || changed.has('mask')) {
      this.value = conform(this.mask || '', this.value || '');
    }
  }

  updated(changed) {
    super.updated(changed);
    if (changed.has('value') || changed.has('required') || changed.has('mask')) {
      this._syncValidity();
    }
  }

  _syncValidity() {
    const control = this._field;
    const raw = this.value || '';
    const total = slotsOf(this.mask || '').length;
    if (this.required && !raw) {
      this._setValidity({ valueMissing: true }, 'Please fill out this field.', control);
    } else if (raw && raw.length < total) {
      this._setValidity({ patternMismatch: true }, 'Incomplete value', control);
    } else {
      this._setValidity({});
    }
  }

  /**
   * Apply an accepted edit: raw value, form value, native field text, and the
   * caret on the next fillable position. A no-op edit (every character
   * rejected) changes nothing and fires nothing — rejection is silent.
   */
  _applyEdit(newRaw, caretRaw) {
    const mask = this.mask || '';
    if (newRaw === (this.value || '')) return;
    this.value = newRaw;
    const { text } = format(mask, newRaw, this.placeholderChar);
    const field = this._field;
    if (field) {
      field.value = text;
      const caret = caretForRaw(mask, text.length, caretRaw);
      field.setSelectionRange(caret, caret);
    }
    this._updateFormValue();
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: this.value, formatted: text },
        bubbles: true,
        composed: true,
      }),
    );
    // A full mask is a committed value — the fixed-length commit that
    // otp-input established. Blur will not repeat it for the same value.
    if (newRaw.length > 0 && newRaw.length === slotsOf(mask).length) this._commit();
  }

  _commit() {
    if ((this.value || '') === this._committed) return;
    this._committed = this.value || '';
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this._committed, formatted: this.formattedValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _insert(text) {
    if (this.disabled || this.readonly) return;
    const mask = this.mask || '';
    const field = this._field;
    const raw = this.value || '';
    const start = field?.selectionStart ?? field?.value.length ?? 0;
    const end = field?.selectionEnd ?? start;
    const rawStart = rawIndexAt(mask, start);
    const rawEnd = Math.max(rawIndexAt(mask, end), rawStart);
    // Conforming head + insertion together pins how much of the insertion was
    // accepted, which is where the caret goes; the tail then refills the
    // remaining slots and re-conforms, since shifting can change slot types.
    const acceptedHead = conform(mask, raw.slice(0, rawStart) + text);
    this._applyEdit(conform(mask, acceptedHead + raw.slice(rawEnd)), acceptedHead.length);
  }

  _delete(forward) {
    if (this.disabled || this.readonly) return;
    const mask = this.mask || '';
    const field = this._field;
    const raw = this.value || '';
    const start = field?.selectionStart ?? 0;
    const end = field?.selectionEnd ?? start;
    let rawStart = rawIndexAt(mask, start);
    let rawEnd = Math.max(rawIndexAt(mask, end), rawStart);
    if (rawStart === rawEnd) {
      // Collapsed caret: raw indices already skip literals, so stepping one
      // raw character is exactly "delete past the slash".
      if (forward) rawEnd = Math.min(raw.length, rawEnd + 1);
      else if (rawStart > 0) rawStart -= 1;
      else return;
    }
    this._applyEdit(conform(mask, raw.slice(0, rawStart) + raw.slice(rawEnd)), rawStart);
  }

  _onBeforeInput(e) {
    const type = e.inputType || '';
    if (type.startsWith('delete')) {
      e.preventDefault();
      this._delete(type.includes('Forward'));
      return;
    }
    if (type.startsWith('insert')) {
      if (type === 'insertLineBreak' || type === 'insertParagraph') return;
      e.preventDefault();
      const text = e.data ?? e.dataTransfer?.getData('text') ?? '';
      if (text) this._insert(text);
    }
  }

  /**
   * Safety net for mutations beforeinput cannot cancel (IME composition,
   * history undo): reconform whatever the native field now holds.
   */
  _onInput(e) {
    const field = e.target;
    const expected = format(this.mask || '', this.value || '', this.placeholderChar).text;
    if (field.value === expected) return;
    const newRaw = conform(this.mask || '', field.value);
    this._applyEdit(
      newRaw,
      rawIndexAt(this.mask || '', field.selectionStart ?? field.value.length),
    );
    if (field.value !== expected && newRaw === (this.value || '')) {
      // Every character was rejected — put the field text back.
      field.value = expected;
    }
  }

  _onFocus() {
    // Commit baseline: arc-change reports what changed since focus arrived,
    // matching the native change event's contract.
    this._committed = this.value || '';
  }

  _onBlur() {
    this._commit();
  }

  _onKeydown(e) {
    if (e.key === 'Enter') this._commit();
  }

  _onPrefixSlotChange(e) {
    this._hasPrefix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onSuffixSlotChange(e) {
    this._hasSuffix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const id = this.name || this._fieldId;
    const mask = this.mask || '';
    const { text, rest } = format(mask, this.value || '', this.placeholderChar);
    const hasError = !!this.error;
    // Digit-only masks get the numeric keyboard on mobile.
    const slots = slotsOf(mask);
    const numeric = slots.length > 0 && slots.every((s) => s === '#');

    return html`
      <div part="base" class="masked ${hasError ? 'masked--error' : ''}">
        ${this.label ? html`<label class="masked__label" for=${id} part="label">${this.label}</label>` : ''}
        <div class="masked__wrapper" part="wrapper">
          <div class="masked__prefix ${this._hasPrefix ? '' : 'masked__prefix--empty'}" part="prefix">
            <slot name="prefix" @slotchange=${this._onPrefixSlotChange}></slot>
          </div>
          <div class="masked__stack">
            ${
              text
                ? html`<div class="masked__hint" aria-hidden="true" part="hint"><span
                  class="masked__hint-pad">${text}</span><span class="masked__hint-rest">${rest}</span></div>`
                : ''
            }
            <input
              class="masked__field"
              type="text"
              id=${id}
              name=${this.name}
              placeholder=${mask ? shapeOf(mask, this.placeholderChar) : ''}
              inputmode=${numeric ? 'numeric' : nothing}
              autocomplete=${this.autocomplete || nothing}
              spellcheck="false"
              ?required=${this.required}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              aria-required=${this.required ? 'true' : 'false'}
              aria-disabled=${this.disabled ? 'true' : 'false'}
              .value=${text}
              @beforeinput=${this._onBeforeInput}
              @input=${this._onInput}
              @keydown=${this._onKeydown}
              @focus=${this._onFocus}
              @blur=${this._onBlur}
              part="field"
            />
          </div>
          <div class="masked__suffix ${this._hasSuffix ? '' : 'masked__suffix--empty'}" part="suffix">
            <slot name="suffix" @slotchange=${this._onSuffixSlotChange}></slot>
          </div>
        </div>
        ${hasError ? html`<span class="masked__error" role="alert" part="error">${this.error}</span>` : ''}
      </div>
    `;
  }
}
