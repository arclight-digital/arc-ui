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
export declare const FormControlMixin: (superClass: any) => {
    new (): {
        [x: string]: any;
        _internals: any;
        connectedCallback(): void;
        __resetState: {
            value: string | undefined;
        } | undefined;
        /** State captured for form.reset(). Override for non-`value` controls. */
        _formResetState(): {
            value: string | undefined;
        };
        /** Apply captured state on reset/restore. Override alongside _formResetState. */
        _applyFormState(state: any): void;
        /** The value submitted with the form. Override when it isn't `this.value`. */
        _formValue(): string | null;
        /** Sync the current value into the form. Call on every value change. */
        _updateFormValue(): void;
        /** Constraint-validation passthrough with a stable signature. */
        _setValidity(flags?: {}, message?: string, anchor?: undefined): void;
        formDisabledCallback(disabled: any): void;
        disabled: any;
        formResetCallback(): void;
        formStateRestoreCallback(state: any): void;
        value: string | undefined;
        get form(): any;
        get validity(): any;
        get validationMessage(): any;
        checkValidity(): any;
        reportValidity(): any;
    };
    [x: string]: any;
    formAssociated: boolean;
};
