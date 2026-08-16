import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { DeclaredPropsMixin, flag, oneOf, num } from '../shared/props.js';

/**
 * Dual-thumb range slider for selecting a numeric interval within a defined range, with
 * accent-primary fill between the thumbs and live value display.
 *
 * @tag arc-range-slider
 * @status stable
 * @prop {number} min - Minimum allowed value at the left edge of the track.
 * @prop {number} max - Maximum allowed value at the right edge of the track.
 * @prop {number} step - Increment granularity. Values snap to multiples of this number.
 * @prop {number} low - Lower bound value of the selected range. Reflected as an attribute.
 * @prop {number} high - Upper bound value of the selected range. Reflected as an attribute.
 * @prop {string} label - Label text displayed above the slider with the range values shown on the right.
 * @prop {boolean} showValues - Whether to display the numeric "low – high" readout in the header.
 * @prop {boolean} disabled - Disables interaction, reducing opacity and blocking pointer events.
 * @prop {'sm' | 'md' | 'lg'} size - Control size. `md` is the default; `sm` and `lg` scale the track and thumbs.
 * @fires {CustomEvent<{ value: [number, number], low: number, high: number }>} arc-input - Fired continuously as the user drags either thumb. Detail contains the canonical `value` as `[low, high]`, plus `low` and `high` named separately. Use for real-time filtering or preview. Not fired when a key press leaves the range unchanged.
 * @fires {CustomEvent<{ value: [number, number], low: number, high: number }>} arc-change - Fired once when the user releases a thumb, indicating the final committed range. Detail contains the canonical `value` as `[low, high]`, plus `low` and `high` named separately. Use for persisting to a database or triggering an expensive operation. Not fired when a key press leaves the range unchanged.
 * @slot none
 * @csspart base - The root element.
 * @csspart range-slider
 * @csspart header
 * @csspart label
 * @csspart values
 * @csspart track
 * @csspart rail
 * @csspart fill
 * @csspart thumb-low
 * @csspart thumb-high
 */
export class ArcRangeSlider extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    min: num({ default: 0 }),
    max: { type: Number },
    step: num({ default: 1, min: 0, clamp: 'toRange' }),
    low: num({ default: 0, min: 'min', max: 'max', clamp: 'toRange', reflect: true }),
    high: num({ default: 100, min: 'min', max: 'max', clamp: 'toRange', reflect: true }),
    name: { type: String, reflect: true },
    // NOT flag(): a form-associated custom element whose `disabled` content
    // attribute is merely *present* is "actually disabled" per the HTML spec,
    // so the platform calls formDisabledCallback(true) and the mixin sets the
    // property back. `disabled="false"` is a disabled control here for exactly
    // the reason it is on a native <input>. Native semantics win; see
    // shared/props.js.
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    showValues: flag(true, { attribute: 'show-values', negative: 'no-values' }),
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
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
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
        /* The readout changes on every pointermove. Proportional digits make it
           a different width each frame, which is visible as the label beside it
           shifting — and, anywhere the control is sized to its content, as the
           whole slider breathing while you drag. */
        font-variant-numeric: tabular-nums;
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
        box-shadow: var(--glow-xs);
        outline: none;
        z-index: 1;
      }

      /* Sizes — the rail thickness and the thumbs, since a slider has no text
         to scale. md is the base rule above. The track keeps the thumb's height
         so the hit area never shrinks below it. */
      :host([size="sm"]) .range-slider__track { height: 16px; }
      :host([size="sm"]) .range-slider__rail,
      :host([size="sm"]) .range-slider__fill { height: 4px; }
      :host([size="sm"]) .range-slider__thumb { width: 16px; height: 16px; }
      :host([size="lg"]) .range-slider__track { height: 26px; }
      :host([size="lg"]) .range-slider__rail,
      :host([size="lg"]) .range-slider__fill { height: 8px; }
      :host([size="lg"]) .range-slider__thumb { width: 26px; height: 26px; }

      .range-slider__thumb:hover {
        box-shadow: var(--interactive-focus-thumb);
      }

      .range-slider__thumb:focus-visible {
        box-shadow: var(--interactive-focus);
      }

      .range-slider__thumb--active {
        box-shadow: var(--interactive-focus-thumb);
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
    this.max = 100;
    this.name = '';
    this.disabled = false;
    this.label = '';
    this._dragging = null; // 'low' | 'high' | null
    this._onPointerMoveBound = this._onPointerMove.bind(this);
    this._onPointerUpBound = this._onPointerUp.bind(this);
  }

  updated(changed) {
    super.updated(changed);
    // The submitted value tracks `low`/`high`, not `value`, so the mixin's
    // value-watch never fires for this control — sync locally.
    if (changed.has('low') || changed.has('high')) {
      this._updateFormValue();
    }
  }

  _formValue() {
    return `${this.low},${this.high}`;
  }

  _formResetState() {
    return { low: this.low, high: this.high };
  }

  _applyFormState(state) {
    this.low = state.low;
    this.high = state.high;
  }

  formStateRestoreCallback(state) {
    if (typeof state === 'string') {
      const [low, high] = state.split(',').map(Number);
      if (!Number.isNaN(low)) this.low = low;
      if (!Number.isNaN(high)) this.high = high;
      this._updateFormValue();
    }
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
    this._updateFormValue();
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: [this.low, this.high], low: this.low, high: this.high },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _fireChange() {
    this._updateFormValue();
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: [this.low, this.high], low: this.low, high: this.high },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onThumbPointerDown(thumb, e) {
    if (this.disabled || this.readonly) return;
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
    if (this.disabled || this.readonly) return;
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
    if (this.disabled || this.readonly) return;
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

    // Clamp first, then compare, then announce — finding #38. This used to fire
    // an input *and* a change unconditionally, so holding a key against a rail
    // emitted a full edit-and-commit pair per repeat for a range that had not
    // moved. arc-change is the expensive half of the v3 contract by its own
    // docs ("persisting to a database or triggering an expensive operation"),
    // which is what made this the costliest instance of the shape after #19.
    //
    // The key stays claimed above either way: at a rail it is still the
    // slider's key, and letting it through would scroll the page.
    const before = thumb === 'low' ? this.low : this.high;
    const after =
      thumb === 'low'
        ? this._snap(this._clamp(this.low + delta, this.min, this.high))
        : this._snap(this._clamp(this.high + delta, this.low, this.max));
    if (after === before) return;

    if (thumb === 'low') this.low = after;
    else this.high = after;
    this._fireInput();
    this._fireChange();
  }

  render() {
    const lowPct = this._lowPercent;
    const highPct = this._highPercent;

    return html`
      <div class="range-slider" part="base range-slider">
        ${
          this.label || this.showValues
            ? html`
          <div class="range-slider__header" part="header">
            ${this.label ? html`<label class="range-slider__label" part="label">${this.label}</label>` : html`<span></span>`}
            ${this.showValues ? html`<span class="range-slider__values" part="values">${this.low} – ${this.high}</span>` : ''}
          </div>
        `
            : ''
        }
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
            tabindex=${this.disabled ? '-1' : '0'}
            role="slider"
            aria-disabled=${this.disabled ? 'true' : 'false'}
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
            tabindex=${this.disabled ? '-1' : '0'}
            role="slider"
            aria-disabled=${this.disabled ? 'true' : 'false'}
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
