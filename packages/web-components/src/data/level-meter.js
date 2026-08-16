import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf, num, int } from '../shared/props.js';

/**
 * Segmented audio level meter with peak-hold — the live vertical sibling of arc-meter,
 * built for signal-rate updates (audio levels, buffer fill, realtime telemetry).
 * Segments below the warn threshold render success-tinted, between warn and clip
 * warning-tinted, and above clip error-tinted, with the house glow on lit segments.
 * A thin peak-hold line rides the highest recent level and decays toward the
 * current value; feed the `peak` property to drive it yourself instead.
 *
 * One element is one channel. There is deliberately no stereo mode — compose two
 * meters side by side for a stereo pair, one per channel, so channel count is the
 * consumer's decision rather than a prop fork.
 *
 * @tag arc-level-meter
 * @arc-group media
 * @prop {number} value - Current level. Interpreted against `min` and `max`, so with the defaults (0 and 1) it is a linear fraction, and with `min="-60" max="0"` it is a dB reading. Values outside the range are clamped.
 * @prop {number} min - Value at the empty end of the meter. Defaults to 0.
 * @prop {number} max - Value at the full end of the meter. Defaults to 1. Use -60..0 (or your headroom of choice) for dB scales.
 * @prop {number} peak - Externally supplied peak-hold level, in the same units as `value`. When set, the component renders the hold line exactly there and does no tracking of its own. When absent, the meter tracks its own peak from incoming values, holds it briefly, then decays it toward the current level.
 * @prop {'vertical' | 'horizontal'} orientation - Meter direction. Vertical (the default) fills bottom-up like a channel strip; horizontal fills from the inline start. Unknown values fall back to vertical.
 * @prop {number} segments - Number of discrete segments. Defaults to 20. Set 0 for a continuous, unsegmented bar.
 * @prop {number} warn - Fraction of the range (0..1) where the warning zone begins, regardless of units. Defaults to 0.75.
 * @prop {number} clip - Fraction of the range (0..1) where the clip (error) zone begins. Defaults to 0.9.
 * @prop {string} label - Accessible name applied as aria-label on the meter. The component renders no visible text, so this is the only name screen readers get — use something like "Master left" rather than "Level".
 * @slot none
 * @csspart meter - The outer wrapper carrying role="meter".
 * @csspart track - The tinted track containing segments or the continuous fill.
 * @csspart segment - Each discrete segment (segmented mode only).
 * @csspart fill - The continuous fill bar (segments=0 only).
 * @csspart peak - The thin peak-hold line.
 */
export class ArcLevelMeter extends DeclaredPropsMixin(LitElement) {
  static properties = {
    // See arc-meter (finding #70).
    value: num({ default: 0, min: 'min', max: 'max', clamp: 'toRange' }),
    min: num({ default: 0 }),
    max: num({ default: 1 }),
    peak: num({ nullable: true }),
    orientation: oneOf(['vertical', 'horizontal']),
    segments: int({ default: 20, min: 0, clamp: 'toRange' }),
    warn: num({ default: 0.75, min: 0, max: 1, clamp: 'toRange' }),
    clip: num({ default: 0.9, min: 0, max: 1, clamp: 'toRange' }),
    label: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        inline-size: 14px;
        block-size: 160px;
      }

      :host([orientation='horizontal']) {
        inline-size: 160px;
        block-size: 14px;
      }

      .meter {
        inline-size: 100%;
        block-size: 100%;
        display: flex;
      }

      .track {
        position: relative;
        flex: 1;
        display: flex;
        gap: 2px;
        background: var(--surface-overlay);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }

      /* Widened default: any unrecognized orientation computes as vertical.
         Segment 0 sits at the bottom, so the meter fills upward. */
      :host(:not([orientation='horizontal'])) .track {
        flex-direction: column-reverse;
      }

      :host([orientation='horizontal']) .track {
        flex-direction: row;
      }

      /* Zone tints. Each zone class sets the pair of channel/color custom
         properties; lit surfaces below compose tint and glow from them, so the
         three --color-* base tokens recolor everything. */
      .zone--success { --_zone: var(--color-success); --_zone-rgb: var(--color-success-rgb); }
      .zone--warning { --_zone: var(--color-warning); --_zone-rgb: var(--color-warning-rgb); }
      .zone--error   { --_zone: var(--color-error);   --_zone-rgb: var(--color-error-rgb); }

      /* Unlit segments show the track through a faint preview of their zone. */
      .seg {
        flex: 1;
        min-inline-size: 0;
        min-block-size: 0;
        border-radius: var(--radius-xs);
        background: rgba(var(--_zone-rgb), 0.14);
      }

      .seg--lit {
        background: var(--_zone);
        box-shadow: 0 0 6px rgba(var(--_zone-rgb), 0.5);
      }

      /* Continuous bar (segments = 0). A normal flex child rather than an
         absolute overlay, so the same column-reverse / row direction that
         orders segments also anchors the fill at the meter's zero end. */
      .fill {
        border-radius: var(--radius-xs);
        background: var(--_zone);
        box-shadow: 0 0 8px rgba(var(--_zone-rgb), 0.45);
      }

      :host(:not([orientation='horizontal'])) .fill {
        inline-size: 100%;
        block-size: var(--_fill, 0%);
      }

      :host([orientation='horizontal']) .fill {
        block-size: 100%;
        inline-size: var(--_fill, 0%);
      }

      /* Peak-hold line. Positioned by the private custom property the render
         writes, clamped so it stays inside the track at both extremes. */
      .peak {
        position: absolute;
        pointer-events: none;
        background: var(--_zone);
        box-shadow: 0 0 6px rgba(var(--_zone-rgb), 0.6);
      }

      :host(:not([orientation='horizontal'])) .peak {
        inset-inline: 0;
        block-size: 2px;
        inset-block-end: clamp(0%, calc(var(--_peak, 0%) - 2px), calc(100% - 2px));
      }

      :host([orientation='horizontal']) .peak {
        inset-block: 0;
        inline-size: 2px;
        inset-inline-start: clamp(0%, calc(var(--_peak, 0%) - 2px), calc(100% - 2px));
      }
    `,
  ];

  constructor() {
    super();
    // Nullable declarations own their own "unset" default — see props.js.
    this.label = '';

    /** @private Self-tracked peak, as a fraction of the range. */
    this._peakF = 0;
    /** @private Timestamp of the last self-tracked peak rise. */
    this._peakAt = 0;
    /** @private */
    this._rafId = null;
    /** @private */
    this._lastTick = null;
    /** @private MediaQueryList for prefers-reduced-motion, set on connect. */
    this._reduceMotion = null;
    /** @private How long a self-tracked peak holds before decaying (ms). */
    this._holdMs = 800;
    /** @private Decay rate once the hold expires, in fractions of full scale per second. */
    this._decayPerS = 0.7;
  }

  connectedCallback() {
    super.connectedCallback();
    // The decay loop is the only browser-global consumer, and it starts here —
    // never at module scope or in the constructor — so the module stays
    // importable and renderable in Node for SSR.
    if (typeof requestAnimationFrame === 'function') {
      this._reduceMotion =
        typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
      this._lastTick = null;
      this._rafId = requestAnimationFrame(this._decayTick);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  willUpdate(changed) {
    // Track the self-held peak from incoming values. Runs on the server too,
    // which is exactly right: a server render shows the peak at the value.
    if (changed.has('value') || changed.has('min') || changed.has('max')) {
      const f = this._toFraction(this.value);
      if (f >= this._peakF) {
        this._peakF = f;
        this._peakAt = Date.now();
      }
    }
  }

  /** @private Map a value in min..max to a clamped 0..1 fraction. */
  _toFraction(v) {
    const range = this.max - this.min;
    if (!(range > 0) || !Number.isFinite(v)) return 0;
    return Math.min(1, Math.max(0, (v - this.min) / range));
  }

  /** @private Zone for a position given as a fraction of the range. */
  _zoneAt(f) {
    const warn = this.warn;
    const clip = this.clip;
    if (f >= clip) return 'error';
    if (f >= warn) return 'warning';
    return 'success';
  }

  /**
   * @private
   * One frame of peak-hold decay. Holds the peak for a beat, then lets it fall
   * toward the current level. Under prefers-reduced-motion the fall becomes a
   * jump: the hold still communicates the peak, the animation does not run.
   */
  _decayTick = (now) => {
    this._rafId = requestAnimationFrame(this._decayTick);
    const dt = this._lastTick == null ? 0 : (now - this._lastTick) / 1000;
    this._lastTick = now;

    // A consumer-supplied peak means the consumer owns the hold line.
    if (this.peak != null && Number.isFinite(this.peak)) return;

    const f = this._toFraction(this.value);
    if (this._peakF <= f) return;
    if (Date.now() - this._peakAt < this._holdMs) return;

    const next = this._reduceMotion?.matches ? f : Math.max(f, this._peakF - this._decayPerS * dt);
    if (next !== this._peakF) {
      this._peakF = next;
      this.requestUpdate();
    }
  };

  render() {
    const f = this._toFraction(this.value);
    const explicitPeak = this.peak != null && Number.isFinite(this.peak);
    const peakF = explicitPeak ? this._toFraction(this.peak) : this._peakF;
    // `segments` is declared int({ min: 0, clamp }), so the finite check, the
    // floor and the floor-at-zero that used to live on this line are the
    // declaration now (V4-PLAN 2.3).
    const count = this.segments;

    const range = this.max - this.min;
    const valueNow = range > 0 ? Math.min(this.max, Math.max(this.min, this.value)) : this.min;

    const segs = [];
    if (count > 0) {
      const litCount = Math.round(f * count);
      for (let i = 0; i < count; i++) {
        const zone = this._zoneAt(i / count);
        const litClass = i < litCount ? ' seg--lit' : '';
        segs.push(html`
          <div part="segment" class="seg zone--${zone}${litClass}"></div>
        `);
      }
    }

    return html`
      <div
        class="meter"
        part="meter"
        role="meter"
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${valueNow}
        aria-label=${this.label || 'Level'}
      >
        <div class="track" part="track">
          ${
            count > 0
              ? segs
              : html`
                <div
                  part="fill"
                  class="fill zone--${this._zoneAt(f)}"
                  style="--_fill: ${(f * 100).toFixed(2)}%"
                ></div>
              `
          }
          ${
            peakF > 0
              ? html`
                <div
                  part="peak"
                  class="peak zone--${this._zoneAt(peakF)}"
                  style="--_peak: ${(peakF * 100).toFixed(2)}%"
                ></div>
              `
              : ''
          }
        </div>
      </div>
    `;
  }
}
