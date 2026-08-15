import { LitElement, html, svg, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, oneOf, num } from '../shared/props.js';

/**
 * Radial gauge displaying a scalar value on an arc with color-coded zones (success, warning,
 * error) and an animated sweep. The radial companion to arc-meter: same threshold semantics,
 * with the reading rendered center-stage.
 *
 * @tag arc-gauge
 * @prop {number} value - Current gauge value. Clamped between `min` and `max`. Reflected as an attribute.
 * @prop {number} min - Minimum value representing the empty end of the arc.
 * @prop {number} max - Maximum value representing the full end of the arc.
 * @prop {number} low - Threshold below which the value is considered low. Used for color zone calculation.
 * @prop {number} high - Threshold above which the value is considered high. Used for color zone calculation.
 * @prop {number} optimum - The optimal value. Determines which end of the range is "good" for color zone logic.
 * @prop {string} label - Label text displayed beneath the value and used as the accessible name.
 * @prop {string} unit - Unit suffix rendered after the value (e.g. "%", "ms", "GB").
 * @prop {'full' | 'half'} variant - Arc shape: `full` is a 270-degree horseshoe, `half` a 180-degree semicircle.
 * @prop {boolean} showValue - Whether to render the numeric value in the center of the arc. Defaults to true; disable via the `showValue` property.
 * @slot none
 * @csspart gauge
 * @csspart svg
 * @csspart track
 * @csspart arc
 * @csspart readout
 * @csspart value
 * @csspart unit
 * @csspart label
 */
export class ArcGauge extends DeclaredPropsMixin(LitElement) {
  static properties = {
    // See arc-meter: clamped against the sibling props, so `aria-valuenow`
    // cannot contradict the arc that is drawn (finding #70).
    value: num({ default: 0, min: 'min', max: 'max', clamp: 'toRange', reflect: true }),
    min: num({ default: 0 }),
    max: num({ default: 100 }),
    low: num({ nullable: true }),
    high: num({ nullable: true }),
    optimum: num({ nullable: true }),
    label: { type: String },
    unit: { type: String },
    variant: oneOf(['full', 'half']),
    showValue: flag(true, { attribute: 'show-value', negative: 'no-value' }),
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        width: 160px;
      }

      .gauge {
        position: relative;
        display: block;
      }

      .gauge__svg {
        display: block;
        width: 100%;
        height: auto;
      }

      .gauge__track {
        fill: none;
        stroke: var(--surface-overlay);
        stroke-width: 8;
        stroke-linecap: round;
      }

      .gauge__arc {
        fill: none;
        stroke-width: 8;
        stroke-linecap: round;
        /* Sweep on value change; stroke and glow cross-fade between zones. */
        transition:
          stroke-dashoffset 800ms var(--ease-out),
          stroke var(--transition-base),
          filter var(--transition-base);
        /* Same glow shape as the status glow token, taken as a drop-shadow
           because an SVG stroke has no box for a box-shadow to wrap. */
        filter: drop-shadow(0 0 12px rgba(var(--_zone-rgb), var(--glow-status-alpha, 0.15)));
        animation: gauge-sweep 800ms var(--ease-out);
      }

      .gauge__arc--success { stroke: var(--color-success); --_zone-rgb: var(--color-success-rgb); }
      .gauge__arc--warning { stroke: var(--color-warning); --_zone-rgb: var(--color-warning-rgb); }
      .gauge__arc--error   { stroke: var(--color-error);   --_zone-rgb: var(--color-error-rgb); }

      /* Entrance: draw in from empty to the rendered offset. The reduced-motion
         guard in the shared styles zeroes this out. */
      @keyframes gauge-sweep {
        from { stroke-dashoffset: var(--_arc-total); }
      }

      .gauge__readout {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        user-select: none;
      }

      .gauge--half .gauge__readout {
        justify-content: flex-end;
      }

      .gauge__value {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
        font-size: var(--_text-2xl);
        font-weight: 300;
        line-height: 1;
        color: var(--text-primary);
      }

      .gauge__unit {
        font-size: var(--code-size);
        color: var(--text-muted);
        margin-inline-start: 2px;
      }

      .gauge__label {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
        margin-top: var(--space-xs);
      }
    `,
  ];

  constructor() {
    super();
    // Nullable declarations own their own "unset" default — see props.js.
    this.label = '';
    this.unit = '';
  }

  /** Unknown variant values fall back to the full horseshoe. */
  get _variant() {
    return this.variant === 'half' ? 'half' : 'full';
  }

  /** Value clamped into [min, max]. */
  get _clamped() {
    return Math.max(this.min, Math.min(this.max, this.value));
  }

  /** Clamp and compute fill percentage. */
  get _percent() {
    const range = this.max - this.min;
    if (range <= 0) return 0;
    return ((this._clamped - this.min) / range) * 100;
  }

  /**
   * Determine color zone based on low / high / optimum thresholds.
   *
   * Logic mirrors the HTML <meter> algorithm (and arc-meter exactly):
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

  /** Round to 2 decimals so server and client render identical markup. */
  _round(n) {
    return Math.round(n * 100) / 100;
  }

  /** Point on the arc circle. Angles in degrees from 12 o'clock, clockwise. */
  _point(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return [this._round(cx + r * Math.sin(rad)), this._round(cy - r * Math.cos(rad))];
  }

  /** SVG path for the arc from startDeg to endDeg, clockwise. */
  _arcPath(cx, cy, r, startDeg, endDeg) {
    const [x1, y1] = this._point(cx, cy, r, startDeg);
    const [x2, y2] = this._point(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  /** Geometry for the current variant. Pure math from props: runs server-side. */
  get _geometry() {
    const half = this._variant === 'half';
    const startDeg = half ? -90 : -135;
    const endDeg = half ? 90 : 135;
    const r = 40;
    return {
      viewBox: half ? '0 0 100 58' : '0 0 100 100',
      d: this._arcPath(50, 50, r, startDeg, endDeg),
      length: this._round((r * (endDeg - startDeg) * Math.PI) / 180),
    };
  }

  render() {
    const zone = this._zone;
    const clamped = this._clamped;
    const { viewBox, d, length } = this._geometry;
    const offset = this._round(length * (1 - this._percent / 100));

    return html`
      <div
        class="gauge gauge--${this._variant}"
        part="gauge"
        role="meter"
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${this.value}
        aria-valuetext=${this.unit ? `${clamped}${this.unit}` : nothing}
        aria-label=${this.label || 'Gauge'}
      >
        <svg class="gauge__svg" part="svg" viewBox=${viewBox} aria-hidden="true">
          ${svg`<path class="gauge__track" part="track" d=${d} />`}
          ${svg`<path
            class="gauge__arc gauge__arc--${zone}"
            part="arc"
            d=${d}
            style="stroke-dasharray: ${length} ${length}; stroke-dashoffset: ${offset}; --_arc-total: ${length};"
          />`}
        </svg>
        ${
          this.showValue || this.label
            ? html`
          <div class="gauge__readout" part="readout" aria-hidden="true">
            ${
              this.showValue
                ? html`
              <span class="gauge__value" part="value">${clamped}${
                this.unit ? html`<span class="gauge__unit" part="unit">${this.unit}</span>` : ''
              }</span>
            `
                : ''
            }
            ${this.label ? html`<span class="gauge__label" part="label">${this.label}</span>` : ''}
          </div>
        `
            : ''
        }
      </div>
    `;
  }
}
