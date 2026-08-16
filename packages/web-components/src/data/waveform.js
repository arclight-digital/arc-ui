import { LitElement, html, css, svg, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, num, oneOf, list } from '../shared/props.js';

/**
 * Audio waveform visualization that doubles as a scrubber. Renders a peaks array as an SVG
 * waveform — the played region in accent with a soft glow, the unplayed region muted, and a
 * glowing playhead line at the current position. With `interactive` set it becomes a seek
 * control: pointer scrubbing and keyboard arrows move the playhead, emitting `arc-input`
 * while the gesture is in flight and `arc-change` when the value commits.
 *
 * The component never touches audio itself — no AudioContext, no decoding. The consumer
 * computes peak amplitudes (one number per bar, 0 to 1) however it likes and hands them
 * over as an array. This keeps the component a pure function of its props, so it
 * server-renders and stays cheap enough for a lane of clips in a DAW timeline.
 *
 * The time axis is deliberately direction-fixed: audio time flows left-to-right even in
 * RTL contexts, matching every DAW, player, and editor convention.
 *
 * @tag arc-waveform
 * @arc-group media
 * @status stable
 * @prop {Array} peaks - Peak amplitudes as a number array, each value 0 to 1. Set it from script, a framework binding, or a JSON attribute. Values outside the range are clamped. An empty or missing array renders an empty track.
 * @prop {number} position - Current playhead position as a fraction of the total, 0 to 1. Not seconds: multiply by `duration` yourself if you track seconds. Updated by the component during scrubbing and reflected as an attribute.
 * @prop {number} duration - Total duration in seconds. Optional; when set, time readouts render below the waveform and the slider announces times instead of percentages.
 * @prop {boolean} interactive - Enables scrubbing. The waveform becomes a focusable slider: click or drag to seek, arrow keys to nudge, Home/End to jump. Without it the waveform is a static image.
 * @prop {'bars' | 'mirror'} variant - Rendering style. `bars` draws discrete bar pairs mirrored around the center line; `mirror` draws a filled min/max envelope.
 * @prop {string} label - Accessible name for the waveform. Announced as the slider label when interactive, or as the image description otherwise.
 * @fires {CustomEvent<{ value: number, time: number | null }>} arc-input - Fired continuously while scrubbing (every pointer move and each keyboard nudge). `value` is the position fraction 0-1; `time` is seconds when `duration` is set, otherwise null. Use for live preview — updating a time display or audibly scrubbing.
 * @fires {CustomEvent<{ value: number, time: number | null }>} arc-change - Fired once when the seek commits: on pointer release, or with each keyboard nudge. Use for the actual seek on your audio source.
 * @slot none
 * @csspart base - The root element.
 * @csspart waveform - The interactive track region wrapping the SVG and playhead.
 * @csspart svg - The SVG element.
 * @csspart unplayed - The unplayed (muted) waveform layer. Named `base` before v4, which
 *   is the name the root element takes across every component now.
 * @csspart played - The played (accent) waveform layer.
 * @csspart playhead - The playhead line.
 * @csspart time - The time readout row (renders only when duration is set).
 */
export class ArcWaveform extends DeclaredPropsMixin(LitElement) {
  static properties = {
    // A peaks list is long enough that nobody sensible writes one into markup,
    // but "nobody should" is not a reason to make it impossible — a short
    // envelope in server-rendered HTML is a real case, and the attribute costs
    // nothing while it goes unused.
    peaks: list(),
    position: num({ default: 0, min: 0, max: 1, clamp: 'toRange', reflect: true }),
    duration: num({ nullable: true }),
    interactive: flag(false),
    variant: oneOf(['bars', 'mirror']),
    label: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        inline-size: 100%;
      }

      .waveform {
        position: relative;
        block-size: var(--waveform-height, 48px);
        border-radius: var(--radius-sm);
      }

      :host([interactive]) .waveform {
        cursor: pointer;
        touch-action: none;
      }

      .waveform:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      svg {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        overflow: visible;
        pointer-events: none;
      }

      .wave-base {
        fill: var(--text-muted);
        opacity: 0.55;
      }

      .wave-played {
        fill: var(--interactive);
        filter: drop-shadow(0 0 4px rgba(var(--interactive-rgb), 0.45));
      }

      .wave-empty {
        stroke: var(--border-subtle);
        stroke-width: 1;
        fill: none;
      }

      /* The playhead rides a full-width rail translated by the position
         fraction: a percentage translation of the rail is a percentage of the
         waveform's width, which keeps the motion on the compositor with no
         per-frame layout. Physical translateX on purpose - the time axis is
         direction-fixed.

         Deliberately untransitioned. The played/unplayed boundary is an SVG
         clip that snaps to the position, so easing the playhead toward the same
         value leaves it trailing the fill edge for the whole of every move -
         and against a playhead advancing each frame, that gap never closes. */
      .waveform__rail {
        position: absolute;
        inset: 0;
        pointer-events: none;
        transform: translateX(calc(var(--_pos, 0) * 100%));
      }

      .waveform__playhead {
        position: absolute;
        inset-block: 0;
        left: -1px;
        inline-size: 2px;
        border-radius: var(--radius-full);
        background: var(--interactive);
        box-shadow:
          0 0 6px rgba(var(--interactive-rgb), 0.6),
          0 0 14px rgba(var(--interactive-rgb), 0.3);
      }

      .waveform__time {
        display: flex;
        justify-content: space-between;
        margin-block-start: var(--space-xs);
        font-family: var(--font-mono);
        font-size: var(--code-size);
        color: var(--text-muted);
        /* Updated on every scrub frame - proportional digits would jitter. */
        font-variant-numeric: tabular-nums;
        user-select: none;
      }

      .waveform__time-current {
        color: var(--interactive);
        font-weight: 600;
      }
    `,
  ];

  constructor() {
    super();
    // Nullable declarations own their own "unset" default — see props.js.
    this.label = '';
    this._onWindowPointerMove = this._onWindowPointerMove.bind(this);
    this._onWindowPointerUp = this._onWindowPointerUp.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._endScrub();
  }

  _clamp01(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.min(1, Math.max(0, n));
  }

  /** Seconds to a m:ss (or h:mm:ss) string. */
  _formatTime(seconds) {
    const total = Math.max(0, Math.round(seconds));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }

  _valueText(pos) {
    if (this.duration != null && this.duration > 0) {
      return `${this._formatTime(pos * this.duration)} of ${this._formatTime(this.duration)}`;
    }
    return `${Math.round(pos * 100)}%`;
  }

  _emitInput() {
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: {
          value: this.position,
          time: this.duration != null && this.duration > 0 ? this.position * this.duration : null,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: {
          value: this.position,
          time: this.duration != null && this.duration > 0 ? this.position * this.duration : null,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ---- Pointer scrubbing ---- */

  _onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    this._seekFromPointer(e);
    window.addEventListener('pointermove', this._onWindowPointerMove);
    window.addEventListener('pointerup', this._onWindowPointerUp);
    window.addEventListener('pointercancel', this._onWindowPointerUp);
  }

  _onWindowPointerMove(e) {
    this._seekFromPointer(e);
  }

  _onWindowPointerUp() {
    this._endScrub();
    // Releasing the pointer is the commit.
    this._emitChange();
  }

  _endScrub() {
    window.removeEventListener('pointermove', this._onWindowPointerMove);
    window.removeEventListener('pointerup', this._onWindowPointerUp);
    window.removeEventListener('pointercancel', this._onWindowPointerUp);
  }

  _seekFromPointer(e) {
    const track = this.renderRoot.querySelector('.waveform');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (!rect.width) return;
    // Direction-fixed axis: left edge is always 0.
    this.position = this._clamp01((e.clientX - rect.left) / rect.width);
    this._emitInput();
  }

  /* ---- Keyboard seeking ---- */

  _onKeyDown(e) {
    let delta = null;
    let absolute = null;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        delta = 0.01;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -0.01;
        break;
      case 'PageUp':
        delta = 0.1;
        break;
      case 'PageDown':
        delta = -0.1;
        break;
      case 'Home':
        absolute = 0;
        break;
      case 'End':
        absolute = 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const next = this._clamp01(absolute != null ? absolute : this._clamp01(this.position) + delta);
    if (next === this.position) return;
    this.position = next;
    // A key press is edit and commit at once, as a native range input's is.
    this._emitInput();
    this._emitChange();
  }

  /* ---- SVG geometry ----
   * Fixed viewBox, stretched to the host with preserveAspectRatio none, so
   * resize is free: no ResizeObserver, no measuring, and the same markup
   * renders on the server. Each peak owns 4 viewBox units (3 bar + 1 gap). */

  _renderShapes(peaks, W, H) {
    if (peaks.length === 0) {
      // Empty track: a neutral center hairline where the waveform would be.
      return svg`<line
        class="wave-empty"
        x1="0" y1=${H / 2} x2=${W} y2=${H / 2}
        vector-effect="non-scaling-stroke"
      ></line>`;
    }
    const pad = 4;
    const usable = H - pad * 2;
    const mid = H / 2;

    if (this.variant === 'mirror') {
      const half = usable / 2;
      const n = peaks.length;
      const xAt = (i) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
      const amp = (p) => Math.max(1, this._clamp01(p) * half);
      const top = peaks.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${mid - amp(p)}`);
      const bottom = [];
      for (let i = n - 1; i >= 0; i--) {
        bottom.push(`L${xAt(i)},${mid + amp(peaks[i])}`);
      }
      return svg`<path d=${[...top, ...bottom, 'Z'].join(' ')}></path>`;
    }

    return peaks.map((p, i) => {
      const barHeight = Math.max(2, this._clamp01(p) * usable);
      return svg`<rect
        x=${i * 4}
        y=${mid - barHeight / 2}
        width="3"
        height=${barHeight}
      ></rect>`;
    });
  }

  render() {
    const peaks = Array.isArray(this.peaks) ? this.peaks : [];
    const pos = this._clamp01(this.position);
    const H = 64;
    const W = peaks.length > 0 ? peaks.length * 4 : 100;
    const hasTime = this.duration != null && this.duration > 0;
    const interactive = this.interactive;

    return html`
      <div
        class="waveform"
        part="base waveform"
        role=${interactive ? 'slider' : 'img'}
        tabindex=${ifDefined(interactive ? '0' : undefined)}
        aria-label=${this.label || (interactive ? 'Audio position' : 'Audio waveform')}
        aria-orientation=${ifDefined(interactive ? 'horizontal' : undefined)}
        aria-valuemin=${ifDefined(interactive ? '0' : undefined)}
        aria-valuemax=${ifDefined(interactive ? '100' : undefined)}
        aria-valuenow=${ifDefined(interactive ? String(Math.round(pos * 100)) : undefined)}
        aria-valuetext=${ifDefined(interactive ? this._valueText(pos) : undefined)}
        style="--_pos: ${pos}"
        @pointerdown=${interactive ? this._onPointerDown : nothing}
        @keydown=${interactive ? this._onKeyDown : nothing}
      >
        <svg part="svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
          <clipPath id="wave-played-clip">
            <rect x="0" y="0" width=${pos * W} height=${H}></rect>
          </clipPath>
          <g class="wave-base" part="unplayed">${this._renderShapes(peaks, W, H)}</g>
          <g class="wave-played" part="played" clip-path="url(#wave-played-clip)">
            ${this._renderShapes(peaks, W, H)}
          </g>
        </svg>
        ${
          interactive || pos > 0
            ? html`
          <div class="waveform__rail">
            <div class="waveform__playhead" part="playhead"></div>
          </div>
        `
            : ''
        }
      </div>
      ${
        hasTime
          ? html`
        <div class="waveform__time" part="time">
          <span class="waveform__time-current">${this._formatTime(pos * this.duration)}</span>
          <span class="waveform__time-total">${this._formatTime(this.duration)}</span>
        </div>
      `
          : ''
      }
    `;
  }
}
