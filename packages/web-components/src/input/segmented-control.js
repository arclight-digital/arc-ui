import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcSegmentedControl extends LitElement {
  static properties = {
    value:    { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    _options: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .segmented {
        display: inline-flex;
        align-items: center;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: 3px; /* cosmetic inset for pill container */
        gap: 2px; /* cosmetic micro-spacing */
        box-sizing: border-box;
      }

      .segmented__option {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--touch-pad) var(--space-md);
        min-height: var(--touch-min);
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        background: transparent;
        border: 1px solid transparent;
        border-radius: calc(var(--radius-md) - 2px);
        cursor: pointer;
        transition:
          background var(--transition-base),
          color var(--transition-base),
          border-color var(--transition-base),
          box-shadow var(--transition-base);
        white-space: nowrap;
        user-select: none;
        line-height: 1.4;
      }

      .segmented__option:hover:not(.is-active) {
        color: var(--text-primary);
        background: var(--bg-hover);
      }

      .segmented__option.is-active {
        background: var(--accent-primary);
        color: var(--bg-deep);
        border-color: var(--accent-primary);
        box-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.4);
      }

      .segmented__option:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .segmented__option.is-active:focus-visible {
        box-shadow: var(--focus-glow), 0 0 12px rgba(var(--accent-primary-rgb), 0.4);
      }

      .segmented__slot-host { display: none; }

      @media (prefers-reduced-motion: reduce) {
        .segmented__option { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.disabled = false;
    this._options = [];
  }

  _onSlotChange(e) {
    this._options = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-OPTION');
    // Auto-select first if no value set
    if (!this.value && this._options.length > 0) {
      this.value = this._options[0].getAttribute('value') || '';
    }
  }

  _select(optionValue) {
    if (this.disabled || optionValue === this.value) return;
    this.value = optionValue;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e, index) {
    let nextIndex = index;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % this._options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + this._options.length) % this._options.length;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const val = this._options[index]?.getAttribute('value') || '';
      this._select(val);
      return;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = this._options.length - 1;
    } else {
      return;
    }

    const val = this._options[nextIndex]?.getAttribute('value') || '';
    this._select(val);
    this.updateComplete.then(() => {
      const buttons = this.shadowRoot.querySelectorAll('.segmented__option');
      buttons[nextIndex]?.focus();
    });
  }

  render() {
    return html`
      <div class="segmented__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div
        class="segmented"
        role="radiogroup"
        aria-disabled=${this.disabled ? 'true' : 'false'}
        part="control"
      >
        ${this._options.map((opt, i) => {
          const val = opt.getAttribute('value') || '';
          const label = opt.textContent?.trim() || val;
          const isActive = val === this.value;
          return html`
            <button
              class="segmented__option ${isActive ? 'is-active' : ''}"
              role="radio"
              aria-checked=${isActive ? 'true' : 'false'}
              tabindex=${isActive ? '0' : '-1'}
              ?disabled=${this.disabled}
              @click=${() => this._select(val)}
              @keydown=${(e) => this._handleKeydown(e, i)}
              part="option"
            >${label}</button>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('arc-segmented-control', ArcSegmentedControl);
