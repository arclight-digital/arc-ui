/**
 * FormControlMixin — standard ElementInternals form participation for input
 * components. Gives every consumer:
 *
 *   - formAssociated + attachInternals (this._internals)
 *   - native <form> value submission via _updateFormValue()
 *   - formDisabledCallback: <fieldset disabled> / <form disabled> works
 *   - formResetCallback: form.reset() restores the initial state
 *   - formStateRestoreCallback: bfcache/autofill restore
 *   - form/validity/validationMessage/checkValidity/reportValidity passthrough
 *
 * Consuming components:
 *   - call _updateFormValue() whenever their public value changes
 *   - override _formValue() when the submitted value isn't `this.value`
 *     (e.g. checkbox submits value-when-checked / null)
 *   - override _formResetState()/_applyFormState() when reset needs more than
 *     restoring `value` (e.g. checked flags, selected arrays)
 *   - may call _setValidity(flags, message, anchor) for constraint validation
 *
 * It also marks the host with `data-arc-editing` while a text-entry element in
 * its shadow root holds focus. Retargeting means an outside listener sees
 * `<arc-textarea>` rather than the `<textarea>` inside it, and no selector
 * crosses a shadow boundary, so without the marker there is no way to tell from
 * the outside that a keypress landed in a text field — which is how a bare-key
 * shortcut ends up firing mid-sentence. See shared/editing-target.js, whose
 * isEditingTarget() is the more reliable check where an event is available.
 */
import { isEditingNode, setEditingMarker } from './editing-target.js';
import { flag } from './props.js';

export const FormControlMixin = (superClass) =>
  class extends superClass {
    static formAssociated = true;

    /**
     * Lit merges static properties up the prototype chain, so every consumer
     * gets these without declaring them. `required` participates in constraint
     * validation below; `readonly` reflects for styling and is enforced by
     * each component's interaction handlers (the mixin can't know which
     * gestures mutate state).
     */
    static properties = {
      // flag(), unlike `disabled`. The exclusion in props.js is specifically
      // about form-associated *platform* semantics: a `disabled` content
      // attribute that is merely present makes the element actually disabled
      // per the HTML spec, and formDisabledCallback assigns the property back,
      // so no converter can win. Neither of these is platform-mapped —
      // `required` is enforced by _computeValidity() below and `readonly` by
      // each component's own interaction handlers — so the stock converter buys
      // nothing here and costs the usual bug: `required="false"` read as true,
      // blocking submission of a form the author meant to leave optional.
      // Finding #48's shape, across all 26 form controls at once.
      required: flag(false),
      readonly: flag(false),
    };

    constructor() {
      super();
      this._internals = this.attachInternals();
      // Bound once so the same reference removes cleanly on disconnect.
      this.__onEditingFocusIn = (e) => {
        setEditingMarker(this, isEditingNode(e.composedPath()[0]));
      };
      this.__onEditingFocusOut = () => setEditingMarker(this, false);
    }

    connectedCallback() {
      super.connectedCallback();
      // Capture the reset baseline on first connect
      if (this.__resetState === undefined) {
        this.__resetState = this._formResetState();
      }
      // A parse-time `required` attribute must be visible to checkValidity()
      // before any value change triggers _updateFormValue.
      if (this.constructor.autoValidates !== false) this._syncRequiredValidity();
      // focusin/focusout are composed, so they cross the shadow boundary and
      // arrive here with the real focused node still at the head of the path.
      // Focus moving between two elements inside fires focusout then focusin, so
      // the marker is dropped and re-set within the same task — nothing can
      // observe the gap.
      this.addEventListener('focusin', this.__onEditingFocusIn);
      this.addEventListener('focusout', this.__onEditingFocusOut);
    }

    disconnectedCallback() {
      super.disconnectedCallback?.();
      this.removeEventListener('focusin', this.__onEditingFocusIn);
      this.removeEventListener('focusout', this.__onEditingFocusOut);
      setEditingMarker(this, false);
    }

    /** State captured for form.reset(). Override for non-`value` controls. */
    _formResetState() {
      return { value: this.value };
    }

    /** Apply captured state on reset/restore. Override alongside _formResetState. */
    _applyFormState(state) {
      Object.assign(this, state);
    }

    /** The value submitted with the form. Override when it isn't `this.value`. */
    _formValue() {
      return this.value ?? null;
    }

    /**
     * Components that run their own constraint-validation logic (pattern
     * checks, range checks) opt out of the automatic required sync by
     * overriding this to false, and own the whole validity flag set instead.
     */
    static autoValidates = true;

    /** Whether a submitted value counts as empty for `required`. */
    _formValueIsEmpty(value) {
      if (value == null || value === '') return true;
      if (Array.isArray(value)) return value.length === 0;
      if (typeof FormData !== 'undefined' && value instanceof FormData) {
        return [...value.keys()].length === 0;
      }
      return false;
    }

    /** valueMissing tracks required + emptiness; everything else stays clear. */
    _syncRequiredValidity() {
      if (this.required && this._formValueIsEmpty(this._formValue())) {
        this._setValidity({ valueMissing: true }, 'Please fill out this field.');
      } else {
        this._setValidity({});
      }
    }

    /** Sync the current value into the form. Call on every value change. */
    _updateFormValue() {
      this._internals.setFormValue(this._formValue());
      if (this.constructor.autoValidates !== false) this._syncRequiredValidity();
    }

    /** Constraint-validation passthrough with a stable signature. */
    _setValidity(flags = {}, message = '', anchor = undefined) {
      this._internals.setValidity(flags, message, anchor);
    }

    updated(changed) {
      super.updated?.(changed);
      // Programmatic value changes must reach the form: most controls only call
      // _updateFormValue() from their interaction handlers, so `el.value = x`
      // from script used to leave the submitted value and validity stale.
      // Double-calling after an interaction handler is harmless — it's
      // idempotent, and serialization always goes through the subclass's own
      // _formValue(). Subclasses that override updated() MUST call
      // super.updated(changed) first or they lose these hooks. Controls whose
      // submitted state lives outside `value`/`checked` (range-slider's
      // low/high, date-range-picker's start/end) must additionally watch their
      // own props and call _updateFormValue() themselves.
      if (changed.has('value') || changed.has('checked')) {
        this._updateFormValue();
      }
      // Toggling `required` after mount must resync without a value change.
      if (changed.has('required') && this.constructor.autoValidates !== false) {
        this._syncRequiredValidity();
      }
    }

    formDisabledCallback(disabled) {
      this.disabled = disabled;
    }

    /**
     * Re-capture the reset baseline, for controls whose initial value does not
     * exist yet at connect time.
     *
     * connectedCallback captures the baseline before the first slotchange, so
     * a control that derives its initial value from slotted children — the
     * segmented control auto-selecting its first option — captures the empty
     * pre-slot state, and form.reset() then *clears* it instead of restoring
     * it. Call this immediately after assigning such a derived initial value.
     */
    _recaptureFormResetState() {
      this.__resetState = this._formResetState();
    }

    formResetCallback() {
      if (this.__resetState !== undefined) {
        this._applyFormState(this.__resetState);
        this._updateFormValue();
      }
    }

    formStateRestoreCallback(state) {
      if (typeof state === 'string') {
        this.value = state;
        this._updateFormValue();
      }
    }

    get form() {
      return this._internals.form;
    }
    get validity() {
      return this._internals.validity;
    }
    get validationMessage() {
      return this._internals.validationMessage;
    }
    /**
     * Whether the control currently satisfies its constraints, per the native
     * constraint-validation API. Fires `invalid` on the element when it does
     * not, and reports nothing to the user.
     *
     * @returns {boolean}
     */
    checkValidity() {
      return this._internals.checkValidity();
    }
    /**
     * As checkValidity(), but also shows the browser's validation message
     * against the control when it fails.
     *
     * @returns {boolean}
     */
    reportValidity() {
      return this._internals.reportValidity();
    }
  };
