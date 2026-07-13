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
 */
export const FormControlMixin = (superClass) => class extends superClass {
  static formAssociated = true;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    // Capture the reset baseline on first connect
    if (this.__resetState === undefined) {
      this.__resetState = this._formResetState();
    }
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

  /** Sync the current value into the form. Call on every value change. */
  _updateFormValue() {
    this._internals.setFormValue(this._formValue());
  }

  /** Constraint-validation passthrough with a stable signature. */
  _setValidity(flags = {}, message = '', anchor = undefined) {
    this._internals.setValidity(flags, message, anchor);
  }

  formDisabledCallback(disabled) {
    this.disabled = disabled;
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

  get form() { return this._internals.form; }
  get validity() { return this._internals.validity; }
  get validationMessage() { return this._internals.validationMessage; }
  checkValidity() { return this._internals.checkValidity(); }
  reportValidity() { return this._internals.reportValidity(); }
};
