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
        /** Whether a submitted value counts as empty for `required`. */
        _formValueIsEmpty(value: any): boolean;
        /** valueMissing tracks required + emptiness; everything else stays clear. */
        _syncRequiredValidity(): void;
        /** Sync the current value into the form. Call on every value change. */
        _updateFormValue(): void;
        /** Constraint-validation passthrough with a stable signature. */
        _setValidity(flags?: {}, message?: string, anchor?: undefined): void;
        updated(changed: any): void;
        formDisabledCallback(disabled: any): void;
        disabled: any;
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
        _recaptureFormResetState(): void;
        formResetCallback(): void;
        formStateRestoreCallback(state: any): void;
        value: string | undefined;
        get form(): any;
        get validity(): any;
        get validationMessage(): any;
        /**
         * Whether the control currently satisfies its constraints, per the native
         * constraint-validation API. Fires `invalid` on the element when it does
         * not, and reports nothing to the user.
         *
         * @returns {boolean}
         */
        checkValidity(): boolean;
        /**
         * As checkValidity(), but also shows the browser's validation message
         * against the control when it fails.
         *
         * @returns {boolean}
         */
        reportValidity(): boolean;
    };
    [x: string]: any;
    formAssociated: boolean;
    /**
     * Lit merges static properties up the prototype chain, so every consumer
     * gets these without declaring them. `required` participates in constraint
     * validation below; `readonly` reflects for styling and is enforced by
     * each component's interaction handlers (the mixin can't know which
     * gestures mutate state).
     */
    properties: {
        required: {
            type: BooleanConstructor;
            reflect: boolean;
            attribute?: string | undefined;
            converter: {
                fromAttribute: (v: any) => boolean;
                toAttribute: (v: any) => "" | null;
            };
            arc: {
                kind: string;
                default: boolean;
                negative: string;
                derived: any;
                blockedBy: string | undefined;
                nullable: any;
            };
        };
        readonly: {
            type: BooleanConstructor;
            reflect: boolean;
            attribute?: string | undefined;
            converter: {
                fromAttribute: (v: any) => boolean;
                toAttribute: (v: any) => "" | null;
            };
            arc: {
                kind: string;
                default: boolean;
                negative: string;
                derived: any;
                blockedBy: string | undefined;
                nullable: any;
            };
        };
    };
    /**
     * Components that run their own constraint-validation logic (pattern
     * checks, range checks) opt out of the automatic required sync by
     * overriding this to false, and own the whole validity flag set instead.
     */
    autoValidates: boolean;
};
