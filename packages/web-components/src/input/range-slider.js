import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-range-slider
 */
export class ArcRangeSlider extends LitElement {
  static properties = {
    min:        { type: Number },
    max:        { type: Number },
    step:       { type: Number },
    low:        { type: Number, reflect: true },
    high:       { type: Number, reflect: true },
    disabled:   { type: Boolean, reflect: true },
    label:      { type: String },
    showValues: { type: Boolean, reflect: true, attribute: 'show-values' },
    /** @internal */ _dragging: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .range-slider {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .range-slider__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .range-slider__label {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        user-select: none;
      }

      .range-slider__values {
        font-family: var(--font-mono);
        font-size: var(--code-size);
        color: var(--interactive);
        font-weight: 600;
      }

      .range-slider__track {
        position: relative;
        width: 100%;
        height: 20px;
        display: flex;
        align-items: center;
        cursor: pointer;
        touch-action: none;
      }

      .range-slider__rail {
        position: absolute;
        width: 100%;
        height: 6px;
        border-radius: var(--radius-full);
        background: var(--border-default);
      }

      .range-slider__fill {
        position: absolute;
        height: 6px;
        background: var(--interactive);
        border-radius: var(--radius-full);
      }

      .range-slider__thumb {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: var(--radius-full);
        background: var(--interactive);
        border: 2px solid var(--surface-primary);
        cursor: pointer;
        transform: translateX(-50%);
        transition: box-shadow var(--transition-fast);
        box-shadow: 0 0 6px rgba(var(--interactive-rgb), 0.3);
        outline: none;
        z-index: 1;
      }

      .range-slider__thumb:hover {
        box-shadow:
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 20px rgba(var(--interactive-rgb), 0.25);
      }

      .range-slider__thumb:focus-visible {
        box-shadow: var(--interactive-focus);
      }

      .range-slider__thumb--active {
        box-shadow:
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 20px rgba(var(--interactive-rgb), 0.25);
        z-index: 2;
      }

      @media (prefers-reduced-motion: reduce) {
        .range-slider__thumb {
          transition: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.low = 0;
    this.high = 100;
    this.disabled = false;
    this.label = '';
    this.showValues = true;
    this._dragging = null; // 'low' | 'high' | null
    this._onPointerMoveBound = this._onPointerMove.bind(this);
    this._onPointerUpBound = this._onPointerUp.bind(this);
  }

  get _lowPercent() {
    const range = this.max - this.min;
    if (range === 0) return 0;
    return ((this.low - this.min) / range) * 100;
  }

  get _highPercent() {
    const range = this.max - this.min;
    if (range === 0) return 100;
    return ((this.high - this.min) / range) * 100;
  }

  _clamp(value, lo, hi) {
    return Math.min(Math.max(value, lo), hi);
  }

  _snap(value) {
    const snapped = Math.round((value - this.min) / this.step) * this.step + this.min;
    // Fix floating point precision issues
    const decimals = (String(this.step).split('.')[1] || '').length;
    return Number(snapped.toFixed(decimals));
  }

  _valueFromPointer(e) {
    const track = this.renderRoot.querySelector('.range-slider__track');
    const rect = track.getBoundingClientRect();
    const percent = this._clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const raw = this.min + percent * (this.max - this.min);
    return this._snap(this._clamp(raw, this.min, this.max));
  }

  _fireInput() {
    this.dispatchEvent(new CustomEvent('arc-input', {
      detail: { low: this.low, high: this.high },
      bubbles: true,
      composed: true,
    }));
  }

  _fireChange() {
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { low: this.low, high: this.high },
      bubbles: true,
      composed: true,
    }));
  }

  _onThumbPointerDown(thumb, e) {
    if (this.disabled) return;
    e.preventDefault();
    this._dragging = thumb;
    e.target.setPointerCapture(e.pointerId);
  }

  _onPointerMove(e) {
    if (!this._dragging) return;
    const value = this._valueFromPointer(e);
    if (this._dragging === 'low') {
      this.low = this._clamp(value, this.min, this.high);
    } else {
      this.high = this._clamp(value, this.low, this.max);
    }
    this._fireInput();
  }

  _onPointerUp() {
    if (!this._dragging) return;
    this._dragging = null;
    this._fireChange();
  }

  _onTrackPointerDown(e) {
    if (this.disabled) return;
    // If the click is not directly on a thumb, move the nearest thumb
    if (e.target.classList.contains('range-slider__thumb')) return;
    const value = this._valueFromPointer(e);
    const distLow = Math.abs(value - this.low);
    const distHigh = Math.abs(value - this.high);
    const thumb = distLow <= distHigh ? 'low' : 'high';
    if (thumb === 'low') {
      this.low = this._clamp(value, this.min, this.high);
    } else {
      this.high = this._clamp(value, this.low, this.max);
    }
    this._dragging = thumb;
    this._fireInput();
    // Focus the moved thumb
    const thumbEl = this.renderRoot.querySelector(`.range-slider__thumb--${thumb}`);
    if (thumbEl) thumbEl.focus();
  }

  _onKeyDown(thumb, e) {
    if (this.disabled) return;
    let delta = 0;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        delta = this.step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -this.step;
        break;
      case 'Home':
        delta = thumb === 'low' ? this.min - this.low : this.low - this.high;
        break;
      case 'End':
        delta = thumb === 'low' ? this.high - this.low : this.max - this.high;
        break;
      default:
        return;
    }
    e.preventDefault();
    if (thumb === 'low') {
      this.low = this._snap(this._clamp(this.low + delta, this.min, this.high));
    } else {
      this.high = this._snap(this._clamp(this.high + delta, this.low, this.max));
    }
    this._fireInput();
    this._fireChange();
  }

  render() {
    const lowPct = this._lowPercent;
    const highPct = this._highPercent;

    return html`
      <div class="range-slider" part="range-slider">
        ${this.label || this.showValues ? html`
          <div class="range-slider__header" part="header">
            ${this.label ? html`<label class="range-slider__label" part="label">${this.label}</label>` : html`<span></span>`}
            ${this.showValues ? html`<span class="range-slider__values" part="values">${this.low} – ${this.high}</span>` : ''}
          </div>
        ` : ''}
        <div
          class="range-slider__track"
          part="track"
          @pointerdown=${this._onTrackPointerDown}
          @pointermove=${this._onPointerMoveBound}
          @pointerup=${this._onPointerUpBound}
        >
          <div class="range-slider__rail" part="rail"></div>
          <div
            class="range-slider__fill"
            part="fill"
            style="left: ${lowPct}%; width: ${highPct - lowPct}%"
          ></div>
          <div
            class="range-slider__thumb range-slider__thumb--low ${this._dragging === 'low' ? 'range-slider__thumb--active' : ''}"
            part="thumb-low"
            tabindex="0"
            role="slider"
            aria-label="${this.label ? `${this.label} low` : 'Range low'}"
            aria-valuemin=${this.min}
            aria-valuemax=${this.high}
            aria-valuenow=${this.low}
            style="left: ${lowPct}%"
            @pointerdown=${(e) => this._onThumbPointerDown('low', e)}
            @keydown=${(e) => this._onKeyDown('low', e)}
          ></div>
          <div
            class="range-slider__thumb range-slider__thumb--high ${this._dragging === 'high' ? 'range-slider__thumb--active' : ''}"
            part="thumb-high"
            tabindex="0"
            role="slider"
            aria-label="${this.label ? `${this.label} high` : 'Range high'}"
            aria-valuemin=${this.low}
            aria-valuemax=${this.max}
            aria-valuenow=${this.high}
            style="left: ${highPct}%"
            @pointerdown=${(e) => this._onThumbPointerDown('high', e)}
            @keydown=${(e) => this._onKeyDown('high', e)}
          ></div>
        </div>
      </div>
    `;
  }
}
