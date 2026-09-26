import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, num, oneOf } from '../shared/props.js';

/**
 * Semantic gauge display with color-coded fill zones (success, warning, error) based on
 * configurable low/high/optimum thresholds.
 *
 * @tag arc-meter
 * @status stable
 * @prop {number} value - Current meter value. Clamped between `min` and `max`. Reflected as an attribute.
 * @prop {number} min - Minimum value representing the left edge (empty) of the meter.
 * @prop {number} max - Maximum value representing the right edge (full) of the meter.
 * @prop {number} low - Threshold below which the value is considered low. Used for color zone calculation.
 * @prop {number} high - Threshold above which the value is considered high. Used for color zone calculation.
 * @prop {number} optimum - The optimal value. Determines which end of the range is "good" for color zone logic.
 * @prop {string} label - Label text displayed in the header row alongside the current percentage.
 * @prop {'zones' | 'plain' | 'diverging'} mode - How the fill is coloured. `zones` (the default) colours by the low/high/optimum thresholds in status colours. `plain` is one colour, `--meter-fill` (default the accent), for a quantity that is not good or bad. `diverging` fills from `center` toward the value, `--meter-below` on one side and `--meter-above` on the other (default chart series 1 and 2), for a lean either way, such as −1 to +1.
 * @prop {number} center - The midpoint of a diverging meter. Defaults to halfway between `min` and `max`. Ignored by the other modes.
 * @slot none
 * @csspart base - The root element.
 * @csspart meter
 * @csspart header
 * @csspart label
 * @csspart value
 * @csspart track
 * @csspart fill
 * @csspart center - The centre tick of a diverging meter.
 */
export class ArcMeter extends DeclaredPropsMixin(LitElement) {
  static properties = {
    // Clamped to the declared bounds, which are themselves props — the whole
    // reason `min`/`max` accept a property name. `aria-valuenow` read
    // `this.value` directly, so an out-of-range value drew a full bar and
    // announced the raw number: the visual and the accessible value
    // disagreed (finding #70).
    value: num({ default: 0, min: 'min', max: 'max', clamp: 'toRange', reflect: true }),
    min: num({ default: 0 }),
    max: num({ default: 100 }),
    low: num({ nullable: true }),
    high: num({ nullable: true }),
    optimum: num({ nullable: true }),
    label: { type: String },
    mode: oneOf(['zones', 'plain', 'diverging']),
    center: num({ nullable: true }),
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
        background: var(--surface-overlay);
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

      /* Not status colours: a usage count is not a warning, and a lean either
         way is not good or bad (finding #121). Chart 1 and 2 are a validated
         adjacent pair, so the two sides stay apart under colour-vision
         deficiency. */
      .meter__fill--plain { background: var(--meter-fill, var(--accent-primary)); }
      .meter__fill--below { background: var(--meter-below, var(--chart-1)); }
      .meter__fill--above { background: var(--meter-above, var(--chart-2)); }

      .meter__fill--below,
      .meter__fill--above {
        position: absolute;
        top: 0;
        border-radius: 0;
        transition: width var(--transition-base), inset-inline-start var(--transition-base);
      }
      .meter__fill--below { border-start-start-radius: var(--radius-full); border-end-start-radius: var(--radius-full); }
      .meter__fill--above { border-start-end-radius: var(--radius-full); border-end-end-radius: var(--radius-full); }

      .meter__center {
        position: absolute;
        top: -2px;
        bottom: -2px;
        width: 2px;
        margin-inline-start: -1px;
        background: var(--text-muted);
      }

      :host([mode="diverging"]) .meter__track { overflow: visible; }
    `,
  ];

  constructor() {
    super();
    // Nullable declarations own their own "unset" default — see props.js.
    this.label = '';
  }

  /** Clamp and compute fill percentage. */
  get _percent() {
    const range = this.max - this.min;
    if (range <= 0) return 0;
    const clamped = Math.max(this.min, Math.min(this.max, this.value));
    return ((clamped - this.min) / range) * 100;
  }

  /** The diverging midpoint, inside the range. */
  get _center() {
    const c = this.center ?? (this.min + this.max) / 2;
    return Math.max(this.min, Math.min(this.max, c));
  }

  /** A position in the range as a percentage of the track. */
  _at(v) {
    const range = this.max - this.min;
    return range <= 0 ? 0 : ((v - this.min) / range) * 100;
  }

  /** The value as the header shows it on a diverging meter: signed, two places at most. */
  get _signed() {
    const clamped = Math.max(this.min, Math.min(this.max, this.value));
    const n = Math.round(clamped * 100) / 100;
    return `${clamped > this._center ? '+' : ''}${String(n).replace('-', '−')}`;
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

  _renderFill(percent) {
    if (this.mode === 'diverging') {
      const c = this._at(this._center);
      const below = percent < c;
      const start = below ? percent : c;
      const width = Math.abs(percent - c);
      return html`
        ${
          width > 0
            ? html`<div
              class="meter__fill meter__fill--${below ? 'below' : 'above'}"
              style="inset-inline-start: ${start}%; width: ${width}%"
              part="fill"
            ></div>`
            : ''
        }
        <div class="meter__center" style="inset-inline-start: ${c}%" part="center"></div>
      `;
    }
    const tone = this.mode === 'plain' ? 'plain' : this._zone;
    return html`<div class="meter__fill meter__fill--${tone}" style="width: ${percent}%" part="fill"></div>`;
  }

  render() {
    const percent = this._percent;
    const diverging = this.mode === 'diverging';

    return html`
      <div
        class="meter"
        part="base meter"
        role="meter"
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${this.value}
        aria-valuetext=${diverging ? this._signed : nothing}
        aria-label=${this.label || 'Meter'}
      >
        ${
          this.label
            ? html`
          <div class="meter__header" part="header">
            <span class="meter__label" part="label">${this.label}</span>
            <span class="meter__value" part="value">${diverging ? this._signed : `${Math.round(percent)}%`}</span>
          </div>
        `
            : ''
        }
        <div class="meter__track" part="track">${this._renderFill(percent)}</div>
      </div>
    `;
  }
}
