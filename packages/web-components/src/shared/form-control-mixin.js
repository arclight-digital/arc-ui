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

export const FormControlMixin = (superClass) => class extends superClass {
  static formAssociated = true;

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
