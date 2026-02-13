import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcForm extends LitElement {
  static properties = {
    action:     { type: String },
    method:     { type: String },
    novalidate: { type: Boolean },
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
    `,
  ];

  constructor() {
    super();
    this.action = '';
    this.method = '';
    this.novalidate = false;
  }

  _collectValues() {
    const slot = this.shadowRoot.querySelector('slot');
    const children = slot ? slot.assignedElements({ flatten: true }) : [];
    const values = {};
    const errors = [];

    const formControls = [];
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
          formControls.push(el);
        }
        if (!el.shadowRoot && el.children?.length) {
          gather([...el.children]);
        }
      }
    };

    gather(children);

    for (const control of formControls) {
      const name = control.getAttribute('name') || control.label || control.tagName.toLowerCase();
      const tag = control.tagName.toLowerCase();

      if (tag === 'arc-checkbox' || tag === 'arc-toggle') {
        values[name] = control.checked ?? false;
      } else {
        values[name] = control.value ?? '';
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

    return { values, errors, valid: errors.length === 0 };
  }

  _handleSubmit(e) {
    const { values, errors, valid } = this._collectValues();

    if (!valid && !this.novalidate) {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('arc-invalid', {
        detail: { errors },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    // Native form submission — let the browser handle it
    if (this.action) {
      this.dispatchEvent(new CustomEvent('arc-submit', {
        detail: { values, valid },
        bubbles: true,
        composed: true,
      }));
      // Don't preventDefault — the form submits natively
      return;
    }

    // JS-only mode — prevent default and let the listener handle it
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('arc-submit', {
      detail: { values, valid },
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
    const slot = this.shadowRoot.querySelector('slot');
    const children = slot ? slot.assignedElements({ flatten: true }) : [];

    const clearErrors = (elements) => {
      for (const el of elements) {
        if (typeof el.error !== 'undefined') {
          el.error = '';
        }
        if (typeof el.value === 'string') {
          el.value = '';
        }
        if (typeof el.checked === 'boolean') {
          el.checked = false;
        }
        if (!el.shadowRoot && el.children?.length) {
          clearErrors([...el.children]);
        }
      }
    };

    clearErrors(children);
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
          <slot></slot>
        </div>
      </form>
    `;
  }
}

customElements.define('arc-form', ArcForm);
