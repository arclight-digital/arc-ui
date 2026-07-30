export declare const FormControlMixin: (superClass: any) => {
    new (): {
        [x: string]: any;
        _internals: any;
        __onEditingFocusIn: (e: any) => void;
        __onEditingFocusOut: () => void;
        connectedCallback(): void;
        __resetState: {
            value: string | undefined;
        } | undefined;
        disconnectedCallback(): void;
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
