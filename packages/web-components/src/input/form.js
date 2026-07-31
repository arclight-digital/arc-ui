import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Form wrapper with built-in validation, error aggregation, and submit handling. Composes Input,
 * Textarea, and Button into a cohesive data-entry workflow.
 *
 * @tag arc-form
 * @prop {string} action - Form action URL for native form submission. When set, the form submits to this URL using the browser's built-in mechanism.
 * @prop {string} method - HTTP method for native form submission (GET or POST). Only applies when action is set.
 * @prop {boolean} novalidate - When true, skips built-in constraint validation on submit. Use this when you need to implement a fully custom validation flow while still leveraging Form for data serialisation.
 * @prop {boolean} loading - Indicates an asynchronous submission is in progress. Disables the submit button and shows a loading indicator to prevent duplicate requests.
 * @prop {boolean} disabled - Disables the entire form, propagating the disabled state to every child field. Useful for read-only previews or while awaiting permissions.
 * @prop {boolean} errorSummary - When true, renders an aggregated list of validation errors above the submit area after a failed submission attempt. Set to false to handle error display manually.
 * @fires arc-submit - Fired on valid form submission with serialized form data
 * @fires arc-invalid - Fired when validation fails, with error details
 * @fires {CustomEvent<void>} arc-reset - Fired when the form is reset via the .reset() method
 * @slot - Default content.
 * @csspart form
 * @csspart layout
 * @csspart errors
 */
export class ArcForm extends LitElement {
  static properties = {
    action: { type: String },
    method: { type: String },
    novalidate: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    errorSummary: { type: Boolean, reflect: true, attribute: 'error-summary' },
    _errors: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; font-family: var(--font-body); }

      form {
        display: contents;
      }

      .form-layout {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      ::slotted(*) {
        margin: 0;
      }

      /* Loading state */
      :host([loading]) .form-layout {
        pointer-events: none;
        opacity: 0.7;
      }

      /* Disabled state */
      :host([disabled]) .form-layout {
        pointer-events: none;
        opacity: 0.5;
      }

      /* Error summary */
      .form-errors {
        border: 1px solid var(--feedback-error-border);
        border-radius: var(--radius-md);
        background: rgba(var(--color-error-rgb), 0.06);
        padding: var(--space-sm) var(--space-md);
        margin-bottom: var(--space-sm);
      }

      .form-errors__title {
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--color-error);
        margin: 0 0 var(--space-xs) 0;
      }

      .form-errors__list {
        margin: 0;
        padding: 0 0 0 var(--space-md);
        font-size: var(--_text-sm);
        color: var(--color-error);
        line-height: 1.6;
      }
    `,
  ];

  constructor() {
    super();
    this.action = '';
    this.method = '';
    this.novalidate = false;
    this.loading = false;
    this.disabled = false;
    this.errorSummary = true;
    this._errors = [];
    // Controls this form has written an error onto, so it can clear its own
    // messages without clobbering ones the consumer set.
    this._flagged = new WeakSet();
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKeyDown);
  }

  /**
   * Implicit submission: Enter in a slotted single-line input submits the
   * form. The browser only provides this for controls associated with the
   * form element itself, which never happens across shadow boundaries.
   */
  _onKeyDown(e) {
    if (e.key !== 'Enter' || e.defaultPrevented) return;
    const target = e.composedPath()[0];
    if (!target || target.tagName !== 'INPUT') return;
    if (
      ['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color'].includes(
        target.type,
      )
    )
      return;
    e.preventDefault();
    this.submit();
  }

  /** Gather all form controls and propagate disabled */
  _getFormControls() {
    const slot = this.shadowRoot.querySelector('slot');
    const children = slot ? slot.assignedElements({ flatten: true }) : [];
    const controls = [];

    const gather = (elements) => {
      for (const el of elements) {
        // Any ARC form-associated control (FormControlMixin) participates.
        if (el.tagName?.startsWith('ARC-') && el.constructor?.formAssociated) {
          controls.push(el);
        }
        // Descend unconditionally. An element's `children` are its *light* DOM
        // whether or not it has a shadow root, so the old `!el.shadowRoot`
        // guard didn't skip shadow content — it skipped the light content of
        // every wrapper that has a shadow root, which is every ARC layout
        // component. Controls inside <arc-fieldset>, <arc-card> or any grid
        // were invisible to the form: not validated, not serialised, not
        // disabled with it.
        if (el.children?.length) {
          gather([...el.children]);
        }
      }
    };

    gather(children);
    return controls;
  }

  updated(changed) {
    super.updated(changed);

    if (changed.has('disabled')) {
      const controls = this._getFormControls();
      for (const control of controls) {
        if (this.disabled) {
          control.setAttribute('disabled', '');
        } else {
          control.removeAttribute('disabled');
        }
      }
    }
  }

  _collectValues() {
    const controls = this._getFormControls();
    const values = {};
    const formData = new FormData();
    const errors = [];

    for (const control of controls) {
      const name = control.getAttribute('name') || control.label || control.tagName.toLowerCase();

      if (typeof control.checked === 'boolean') {
        values[name] = control.checked;
        if (control.checked) {
          formData.append(name, 'on');
        }
      } else {
        values[name] = control.value ?? '';
        formData.append(name, control.value ?? '');
      }

      // Ask the control, don't re-derive. Every form-associated ARC control
      // runs constraint validation through FormControlMixin (or owns the flags
      // itself via autoValidates = false), so its own validity is the answer.
      // The form used to re-implement `required` here with a string trim that
      // only understood text and checkboxes — it called a date range with both
      // ends unset valid, and a multi-select's array `[]` truthy-non-empty.
      if (control.checkValidity && !control.checkValidity()) {
        const message = control.validationMessage || `${control.label || name} is required`;
        errors.push({ name, message });
        if (typeof control.error !== 'undefined') {
          control.error = message;
          this._flagged.add(control);
        }
      } else if (this._flagged.has(control)) {
        // Only clear what this form put there. A consumer's own error string —
        // a server-side rejection, say — survives a later submit.
        control.error = '';
        this._flagged.delete(control);
      }
    }

    return { values, formData, errors, valid: errors.length === 0 };
  }

  _handleSubmit(e) {
    if (this.loading) {
      e.preventDefault();
      return;
    }

    const { values, formData, errors, valid } = this._collectValues();

    if (!valid && !this.novalidate) {
      e.preventDefault();
      this._errors = errors;
      this.dispatchEvent(
        new CustomEvent('arc-invalid', {
          detail: { errors },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    this._errors = [];

    // Native form submission — let the browser handle it
    if (this.action) {
      this.dispatchEvent(
        new CustomEvent('arc-submit', {
          detail: { values, formData, valid },
          bubbles: true,
          composed: true,
        }),
      );
      // Don't preventDefault — the form submits natively
      return;
    }

    // JS-only mode — prevent default and let the listener handle it
    e.preventDefault();
    this.dispatchEvent(
      new CustomEvent('arc-submit', {
        detail: { values, formData, valid },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Programmatic submit — call from outside */
  submit() {
    // Route through the real <form> so action-mode submits actually navigate;
    // requestSubmit() fires a genuine cancelable submit event into
    // _handleSubmit. Fallback keeps JS-only mode working pre-render.
    const form = this.shadowRoot?.querySelector('form');
    if (form) {
      form.requestSubmit();
    } else {
      this._handleSubmit(new Event('submit', { cancelable: true }));
    }
  }

  /**
   * Reset every child control to the state it had when it first connected,
   * and clear error display.
   *
   * Delegates to each control's formResetCallback — the same path a native
   * form.reset() takes, which never reaches these controls because they live
   * in this element's light DOM rather than inside the shadow <form>. The form
   * used to blank them instead (`value = ''`, `checked = false`), which is not
   * what reset means: a control that shipped with a default lost it, and a
   * non-string value (a multi-select's array, a date range's object) was left
   * untouched entirely.
   */
  reset() {
    const controls = this._getFormControls();

    for (const control of controls) {
      if (typeof control.error !== 'undefined') {
        control.error = '';
      }
      control.formResetCallback?.();
    }

    this._flagged = new WeakSet();
    this._errors = [];

    this.dispatchEvent(
      new CustomEvent('arc-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <form
        part="form"
        action=${this.action || undefined}
        method=${this.method || undefined}
        ?novalidate=${this.novalidate}
        @submit=${this._handleSubmit}
      >
        <div class="form-layout" part="layout">
          ${
            this.errorSummary && this._errors.length > 0
              ? html`
            <div class="form-errors" role="alert" part="errors">
              <p class="form-errors__title">Please fix the following errors</p>
              <ul class="form-errors__list">
                ${this._errors.map((err) => html`<li>${err.message}</li>`)}
              </ul>
            </div>
          `
              : nothing
          }
          <slot></slot>
        </div>
      </form>
    `;
  }
}
