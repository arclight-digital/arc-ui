import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-slider
 */
export class ArcSlider extends LitElement {
  static properties = {
    value:    { type: Number, reflect: true },
    min:      { type: Number },
    max:      { type: Number },
    step:     { type: Number },
    disabled: { type: Boolean, reflect: true },
    label:    { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .slider {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .slider__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .slider__label {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        user-select: none;
      }

      .slider__value {
        font-family: var(--font-mono);
        font-size: var(--code-size);
        color: var(--interactive);
        font-weight: 600;
      }

      .slider__track {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
      }

      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        border-radius: var(--radius-full);
        background: linear-gradient(
          to right,
          var(--interactive) 0%,
          var(--interactive) var(--fill-percent, 0%),
          var(--border-default) var(--fill-percent, 0%),
          var(--border-default) 100%
        );
        outline: none;
        cursor: pointer;
        margin: 0;
        padding: 0;
        transition: filter var(--transition-fast);
      }

      input[type="range"]:hover,
      input[type="range"]:focus {
        filter: drop-shadow(0 0 6px rgba(var(--interactive-rgb), 0.4));
      }

      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: var(--radius-full);
        background: var(--interactive);
        border: 2px solid var(--surface-primary);
        cursor: pointer;
        transition: box-shadow var(--transition-fast);
        box-shadow: 0 0 6px rgba(var(--interactive-rgb), 0.3);
      }

      input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: var(--radius-full);
        background: var(--interactive);
        border: 2px solid var(--surface-primary);
        cursor: pointer;
        transition: box-shadow var(--transition-fast);
        box-shadow: 0 0 6px rgba(var(--interactive-rgb), 0.3);
      }

      input[type="range"]:hover::-webkit-slider-thumb,
      input[type="range"]:focus::-webkit-slider-thumb {
        box-shadow:
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 20px rgba(var(--interactive-rgb), 0.25);
      }

      input[type="range"]:hover::-moz-range-thumb,
      input[type="range"]:focus::-moz-range-thumb {
        box-shadow:
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 20px rgba(var(--interactive-rgb), 0.25);
      }

      input[type="range"]:focus-visible {
        outline: none;
      }

      input[type="range"]:focus-visible::-webkit-slider-thumb {
        box-shadow:
          0 0 0 1px rgba(var(--interactive-rgb), 0.2),
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 20px rgba(var(--interactive-rgb), 0.25);
      }

      input[type="range"]:focus-visible::-moz-range-thumb {
        box-shadow:
          0 0 0 1px rgba(var(--interactive-rgb), 0.2),
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 20px rgba(var(--interactive-rgb), 0.25);
      }

      input[type="range"]::-moz-range-track {
        height: 6px;
        border-radius: var(--radius-full);
        background: transparent;
      }

      @media (prefers-reduced-motion: reduce) {
        input[type="range"],
        input[type="range"]::-webkit-slider-thumb,
        input[type="range"]::-moz-range-thumb { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.disabled = false;
    this.label = '';
  }

  get _fillPercent() {
    const range = this.max - this.min;
    if (range === 0) return 0;
    return ((this.value - this.min) / range) * 100;
  }

  _onInput(e) {
    this.value = Number(e.target.value);
    this.dispatchEvent(new CustomEvent('arc-input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _onChange(e) {
    this.value = Number(e.target.value);
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="slider" part="slider">
        ${this.label ? html`
          <div class="slider__header" part="header">
            <label class="slider__label" part="label">${this.label}</label>
            <span class="slider__value" part="value">${this.value}</span>
          </div>
        ` : ''}
        <div class="slider__track" part="track">
          <input
            type="range"
            .value=${String(this.value)}
            min=${this.min}
            max=${this.max}
            step=${this.step}
            ?disabled=${this.disabled}
            aria-label=${this.label || 'Slider'}
            aria-valuemin=${this.min}
            aria-valuemax=${this.max}
            aria-valuenow=${this.value}
            style="--fill-percent: ${this._fillPercent}%"
            @input=${this._onInput}
            @change=${this._onChange}
            part="input"
          />
        </div>
      </div>
    `;
  }
}
