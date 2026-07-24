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
    action:       { type: String },
    method:       { type: String },
    novalidate:   { type: Boolean, reflect: true },
    loading:      { type: Boolean, reflect: true },
    disabled:     { type: Boolean, reflect: true },
    errorSummary: { type: Boolean, reflect: true, attribute: 'error-summary' },
    _errors:      { state: true },
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
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--color-error);
        margin: 0 0 var(--space-xs) 0;
      }

      .form-errors__list {
        margin: 0;
        padding: 0 0 0 var(--space-md);
        font-size: var(--text-sm);
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
    if (['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color'].includes(target.type)) return;
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
        if (!el.shadowRoot && el.children?.length) {
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
      const tag = control.tagName.toLowerCase();

      if (tag === 'arc-checkbox' || tag === 'arc-toggle') {
        values[name] = control.checked ?? false;
        if (control.checked) {
          formData.append(name, 'on');
        }
      } else {
        values[name] = control.value ?? '';
        formData.append(name, control.value ?? '');
      }

      const required = control.hasAttribute('required');
      if (required) {
        const empty = (tag === 'arc-checkbox' || tag === 'arc-toggle')
          ? !control.checked
          : !control.value || control.value.trim() === '';

        if (empty) {
          errors.push({ name, message: `${control.label || name} is required` });
          if (typeof control.error !== 'undefined') {
            control.error = `${control.label || name} is required`;
          }
        } else {
          if (typeof control.error !== 'undefined') {
            control.error = '';
          }
        }
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
      this.dispatchEvent(new CustomEvent('arc-invalid', {
        detail: { errors },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    this._errors = [];

    // Native form submission — let the browser handle it
    if (this.action) {
      this.dispatchEvent(new CustomEvent('arc-submit', {
        detail: { values, formData, valid },
        bubbles: true,
        composed: true,
      }));
      // Don't preventDefault — the form submits natively
      return;
    }

    // JS-only mode — prevent default and let the listener handle it
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('arc-submit', {
      detail: { values, formData, valid },
      bubbles: true,
      composed: true,
    }));
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

  /** Reset error states on child controls */
  reset() {
    const controls = this._getFormControls();

    for (const control of controls) {
      if (typeof control.error !== 'undefined') {
        control.error = '';
      }
      if (typeof control.value === 'string') {
        control.value = '';
      }
      if (typeof control.checked === 'boolean') {
        control.checked = false;
      }
    }

    this._errors = [];

    this.dispatchEvent(new CustomEvent('arc-reset', {
      bubbles: true,
      composed: true,
    }));
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
          ${this.errorSummary && this._errors.length > 0 ? html`
            <div class="form-errors" role="alert" part="errors">
              <p class="form-errors__title">Please fix the following errors</p>
              <ul class="form-errors__list">
                ${this._errors.map(err => html`<li>${err.message}</li>`)}
              </ul>
            </div>
          ` : nothing}
          <slot></slot>
        </div>
      </form>
    `;
  }
}
