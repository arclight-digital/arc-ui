import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-form
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
        border: 1px solid var(--color-error, #ef4444);
        border-radius: var(--radius-md);
        background: rgba(239, 68, 68, 0.06);
        padding: var(--space-sm) var(--space-md);
        margin-bottom: var(--space-sm);
      }

      .form-errors__title {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--color-error, #ef4444);
        margin: 0 0 var(--space-xs) 0;
      }

      .form-errors__list {
        margin: 0;
        padding: 0 0 0 var(--space-md);
        font-size: var(--text-sm);
        color: var(--color-error, #ef4444);
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
  }

  /** Gather all form controls and propagate disabled */
  _getFormControls() {
    const slot = this.shadowRoot.querySelector('slot');
    const children = slot ? slot.assignedElements({ flatten: true }) : [];
    const controls = [];

    const gather = (elements) => {
      for (const el of elements) {
        const tag = el.tagName?.toLowerCase();
        if (
          tag === 'arc-input' ||
          tag === 'arc-textarea' ||
          tag === 'arc-select' ||
          tag === 'arc-checkbox' ||
          tag === 'arc-toggle' ||
          tag === 'arc-radio-group'
        ) {
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
    this._handleSubmit(new Event('submit'));
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
