import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * On/off switch with smooth animation, glow effect, and ARIA switch role.
 *
 * @tag arc-toggle
 * @status stable
 * @prop {boolean} checked - Whether the toggle is in the on position. When set, the thumb slides to the active side and the track displays the accent glow.
 * @prop {boolean} disabled - Prevents user interaction. The toggle appears at reduced opacity and ignores pointer and keyboard events.
 * @prop {string} label - Visible text rendered beside the toggle. Clicking the label also toggles the switch, matching native `<label>` behavior.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the toggle size.
 * @prop {string} name - Form field name submitted with the toggle value. When set, the component participates in native `<form>` submission.
 * @fires {CustomEvent<{ checked: boolean }>} arc-change - Fired when the toggle state changes
 * @slot none
 * @csspart toggle
 * @csspart track
 * @csspart thumb
 * @csspart label
 */
export class ArcToggle extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    checked: flag(false),
    // NOT flag(): a form-associated custom element whose `disabled` content
    // attribute is merely *present* is "actually disabled" per the HTML spec,
    // so the platform calls formDisabledCallback(true) and the mixin sets the
    // property back. `disabled="false"` is a disabled control here for exactly
    // the reason it is on a native <input>. Native semantics win; see
    // shared/props.js.
    disabled: { type: Boolean, reflect: true },
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    label: { type: String },
    name: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; align-items: center; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .toggle {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
        cursor: pointer;
        min-height: var(--touch-min);
      }

      .toggle__track {
        position: relative;
        width: 44px;
        height: 24px;
        border-radius: var(--radius-full);
        background: var(--surface-overlay);
        border: 1px solid var(--border-bright);
        transition:
          background var(--transition-base),
          border-color var(--transition-base),
          box-shadow var(--transition-base);
        flex-shrink: 0;
      }

      .toggle__track:hover {
        box-shadow: var(--glow-xs);
      }

      :host([checked]) .toggle__track {
        background: var(--interactive);
        border-color: transparent;
        box-shadow:
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 20px rgba(var(--interactive-rgb), 0.3),
          0 0 40px rgba(var(--interactive-rgb), 0.15);
      }

      :host([checked]) .toggle__track:hover {
        box-shadow:
          0 0 10px rgba(var(--interactive-rgb), 0.6),
          0 0 28px rgba(var(--interactive-rgb), 0.35),
          0 0 50px rgba(var(--interactive-rgb), 0.2);
      }

      .toggle__thumb {
        position: absolute;
        top: 3px;
        inset-inline-start: 3px;
        width: 16px;
        height: 16px;
        border-radius: var(--radius-full);
        background: var(--text-primary);
        transition:
          transform 300ms var(--ease-out-expo),
          box-shadow var(--transition-base);
        box-shadow: var(--shadow-xs);
      }

      :host([checked]) .toggle__thumb {
        transform: translateX(20px);
        box-shadow:
          var(--shadow-xs),
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 16px rgba(var(--interactive-rgb), 0.3);
      }

      /* Sizes */
      :host([size="sm"]) .toggle__track { width: 34px; height: 18px; }
      :host([size="sm"]) .toggle__thumb { width: 12px; height: 12px; top: 2px; left: 2px; }
      :host([size="sm"][checked]) .toggle__thumb { transform: translateX(16px); }
      :host([size="sm"]) .toggle__label { font-size: var(--_text-sm); }
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
        box-shadow: var(--interactive-focus);
      }

      /* focus-ring-exempt: a checked track is filled with the accent, so the
         standard glow — the same hue at lower alpha — dissolves into it. This
         is that glow with the alphas raised until it reads against its own
         fill. The only surface in the library that is its own focus color. */
      :host([checked]) .toggle__track:focus-visible {
        box-shadow:
          0 0 0 1px rgba(var(--interactive-rgb), 0.25),
          0 0 10px rgba(var(--interactive-rgb), 0.6),
          0 0 28px rgba(var(--interactive-rgb), 0.35),
          0 0 50px rgba(var(--interactive-rgb), 0.2);
      }

      @media (prefers-reduced-motion: reduce) {
        .toggle__track,
        .toggle__thumb { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.disabled = false;
    this.label = '';
    this.name = '';
  }

  _formValue() {
    return this.checked ? 'on' : null;
  }

  _formResetState() {
    return { checked: this.checked };
  }

  _applyFormState(state) {
    this.checked = state.checked;
  }

  _toggle() {
    if (this.disabled || this.readonly) return;
    this.checked = !this.checked;
    this._updateFormValue();
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.checked, checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleKeydown(e) {
    if (e.key === ' ') {
      e.preventDefault();
      this._toggle();
    }
  }

  render() {
    return html`
      <label class="toggle" part="toggle" @click=${this._toggle}>
        <div
          class="toggle__track"
          role="switch"
          aria-checked=${this.checked ? 'true' : 'false'}
          aria-label=${this.label || nothing}
          tabindex=${this.disabled ? '-1' : '0'}
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
