import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcToggle extends LitElement {
  static formAssociated = true;

  static properties = {
    checked:  { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size:     { type: String, reflect: true },
    label:    { type: String },
    name:     { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; align-items: center; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .toggle {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
        cursor: pointer;
      }

      .toggle__track {
        position: relative;
        width: 44px;
        height: 24px;
        border-radius: var(--radius-full);
        background: var(--bg-elevated);
        border: 1px solid var(--border-bright);
        transition:
          background var(--transition-base),
          border-color var(--transition-base),
          box-shadow var(--transition-base);
        flex-shrink: 0;
      }

      .toggle__track:hover {
        border-color: var(--text-muted);
      }

      :host([checked]) .toggle__track {
        background: var(--accent-primary);
        border-color: transparent;
        box-shadow:
          0 0 8px rgba(var(--accent-primary-rgb), 0.5),
          0 0 20px rgba(var(--accent-primary-rgb), 0.3),
          0 0 40px rgba(var(--accent-primary-rgb), 0.15);
      }

      :host([checked]) .toggle__track:hover {
        box-shadow:
          0 0 10px rgba(var(--accent-primary-rgb), 0.6),
          0 0 28px rgba(var(--accent-primary-rgb), 0.35),
          0 0 50px rgba(var(--accent-primary-rgb), 0.2);
      }

      .toggle__thumb {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: var(--radius-full);
        background: var(--text-primary);
        transition:
          transform var(--transition-base),
          box-shadow var(--transition-base);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      :host([checked]) .toggle__thumb {
        transform: translateX(20px);
        box-shadow:
          0 1px 3px rgba(0, 0, 0, 0.2),
          0 0 8px rgba(var(--accent-primary-rgb), 0.5),
          0 0 16px rgba(var(--accent-primary-rgb), 0.3);
      }

      /* Sizes */
      :host([size="sm"]) .toggle__track { width: 34px; height: 18px; }
      :host([size="sm"]) .toggle__thumb { width: 12px; height: 12px; top: 2px; left: 2px; }
      :host([size="sm"][checked]) .toggle__thumb { transform: translateX(16px); }
      :host([size="sm"]) .toggle__label { font-size: var(--text-sm); }
      :host([size="lg"]) .toggle__track { width: 56px; height: 30px; }
      :host([size="lg"]) .toggle__thumb { width: 22px; height: 22px; top: 3px; left: 3px; }
      :host([size="lg"][checked]) .toggle__thumb { transform: translateX(26px); }

      .toggle__label {
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: 400;
        letter-spacing: normal;
        text-transform: none;
        color: var(--text-muted);
        user-select: none;
      }

      .toggle__track:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      :host([checked]) .toggle__track:focus-visible {
        box-shadow:
          0 0 0 1px rgba(var(--accent-primary-rgb), 0.25),
          0 0 10px rgba(var(--accent-primary-rgb), 0.6),
          0 0 28px rgba(var(--accent-primary-rgb), 0.35),
          0 0 50px rgba(var(--accent-primary-rgb), 0.2);
      }

      @media (prefers-reduced-motion: reduce) {
        .toggle__track,
        .toggle__thumb { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.checked = false;
    this.disabled = false;
    this.size = 'md';
    this.label = '';
    this.name = '';
  }

  updated(changed) {
    if (changed.has('checked')) {
      this._internals.setFormValue(this.checked ? 'on' : null);
    }
  }

  _toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this._internals.setFormValue(this.checked ? 'on' : null);
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e) {
    if (e.key === ' ') {
      e.preventDefault();
      this._toggle();
    }
  }

  render() {
    return html`
      <label class="toggle" part="toggle">
        <div
          class="toggle__track"
          role="switch"
          aria-checked=${this.checked ? 'true' : 'false'}
          tabindex=${this.disabled ? '-1' : '0'}
          @click=${this._toggle}
          @keydown=${this._handleKeydown}
          part="track"
        >
          <div class="toggle__thumb" part="thumb"></div>
        </div>
        ${this.label ? html`<span class="toggle__label" part="label">${this.label}</span>` : ''}
      </label>
    `;
  }
}

customElements.define('arc-toggle', ArcToggle);
