import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-meter
 */
export class ArcMeter extends LitElement {
  static properties = {
    value:   { type: Number, reflect: true },
    min:     { type: Number },
    max:     { type: Number },
    low:     { type: Number },
    high:    { type: Number },
    optimum: { type: Number },
    label:   { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .meter {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .meter__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .meter__label {
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-secondary);
        user-select: none;
      }

      .meter__value {
        font-family: var(--font-mono);
        font-size: var(--code-size);
        color: var(--text-muted);
      }

      .meter__track {
        position: relative;
        width: 100%;
        height: 8px;
        background: var(--bg-elevated);
        border-radius: var(--radius-full);
        overflow: hidden;
      }

      .meter__fill {
        height: 100%;
        border-radius: var(--radius-full);
        transition: width var(--transition-base), background var(--transition-base);
        min-width: 0;
      }

      .meter__fill--success { background: var(--color-success); }
      .meter__fill--warning { background: var(--color-warning); }
      .meter__fill--error   { background: var(--color-error); }

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.low = undefined;
    this.high = undefined;
    this.optimum = undefined;
    this.label = '';
  }

  /** Clamp and compute fill percentage. */
  get _percent() {
    const range = this.max - this.min;
    if (range <= 0) return 0;
    const clamped = Math.max(this.min, Math.min(this.max, this.value));
    return ((clamped - this.min) / range) * 100;
  }

  /**
   * Determine color zone based on low / high / optimum thresholds.
   *
   * Logic mirrors the HTML <meter> algorithm:
   * - If optimum is in the "good" segment and value is there too  -> success
   * - If value is in the middle segment (between low and high)    -> warning
   * - If value is in the far-from-optimum segment                 -> error
   * - Fallback when thresholds are not set: use simple thirds.
   */
  get _zone() {
    const { value, min, max } = this;
    const low = this.low ?? min + (max - min) * 0.33;
    const high = this.high ?? min + (max - min) * 0.67;
    const optimum = this.optimum ?? (low + high) / 2;

    // Determine which segment the optimum lives in
    const optimumInLow = optimum <= low;
    const optimumInHigh = optimum >= high;

    if (optimumInLow) {
      // Lower is better (e.g. error count)
      if (value <= low) return 'success';
      if (value <= high) return 'warning';
      return 'error';
    }

    if (optimumInHigh) {
      // Higher is better (e.g. battery level)
      if (value >= high) return 'success';
      if (value >= low) return 'warning';
      return 'error';
    }

    // Optimum is in the middle segment
    if (value >= low && value <= high) return 'success';
    if (value < low) return 'warning';
    return 'warning';
  }

  render() {
    const percent = this._percent;
    const zone = this._zone;

    return html`
      <div
        class="meter"
        part="meter"
        role="meter"
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${this.value}
        aria-label=${this.label || 'Meter'}
      >
        ${this.label ? html`
          <div class="meter__header" part="header">
            <span class="meter__label" part="label">${this.label}</span>
            <span class="meter__value" part="value">${Math.round(percent)}%</span>
          </div>
        ` : ''}
        <div class="meter__track" part="track">
          <div
            class="meter__fill meter__fill--${zone}"
            style="width: ${percent}%"
            part="fill"
          ></div>
        </div>
      </div>
    `;
  }
}
