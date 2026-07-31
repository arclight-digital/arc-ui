import { LitElement, html, css, svg } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';

/**
 * Rotary knob input for continuous parameters — the control a slider can't be when the panel
 * is a rack of channel strips. A 270-degree arc track fills from min to the current value with
 * a glowing indicator line, a monospace readout below, and synth-style interaction: vertical
 * drag to turn (Shift for fine adjustment), mouse wheel and arrow keys to step, optional
 * magnetic detents at named values.
 *
 * @tag arc-knob
 * @prop {number} value - Current knob value. Reflected as an attribute and updated on user interaction.
 * @prop {number} min - Minimum allowed value at the start of the arc sweep.
 * @prop {number} max - Maximum allowed value at the end of the arc sweep.
 * @prop {number} step - Increment granularity. The value snaps to multiples of this number.
 * @prop {string} label - Label text displayed above the knob in the label typography role.
 * @prop {number[] | string} detents - Snap values, as an array from script or a comma-separated attribute (for example "0,50,100"). While dragging, the value snaps magnetically to a detent within 2.5% of the range, and each detent renders as a tick mark around the dial. Keyboard and wheel stepping ignore detents.
 * @prop {Function} format - `(value) => string` shaping the readout and the accessible value text, for example adding a unit suffix. Defaults to the plain number.
 * @prop {boolean} disabled - Disables interaction, reducing opacity and blocking pointer events.
 * @prop {boolean} readonly - Prevents dragging, wheel, and key changes while the dial stays focusable and the value still submits.
 * @prop {'sm' | 'md' | 'lg'} size - Control size. `md` is the default; `sm` and `lg` scale the dial.
 * @fires {CustomEvent<{ value: number }>} arc-input - Fired continuously while the knob is turning — every drag movement, wheel notch, or key step. Use for real-time preview such as a filter cutoff or gain applied live.
 * @fires {CustomEvent<{ value: number }>} arc-change - Fired once when a turn commits: on drag release, and after each discrete wheel or key step. Use for persisting the value or triggering an expensive operation.
 * @slot none
 * @csspart knob
 * @csspart label
 * @csspart dial
 * @csspart track
 * @csspart fill
 * @csspart indicator
 * @csspart value
 */
export class ArcKnob extends FormControlMixin(LitElement) {
  static properties = {
    size: { type: String, reflect: true },
    value: { type: Number, reflect: true },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    name: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    detents: {
      attribute: 'detents',
      // The default converter for an Array type wants JSON; a knob's detents
      // read better as the comma list a patch file would carry.
      converter: {
        fromAttribute: (v) =>
          v == null || v === '' ? [] : v.split(',').map(Number).filter(Number.isFinite),
      },
    },
    // Attribute is off: a function can't survive a round trip through one.
    format: { attribute: false },
    /** @internal */ _dragging: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .knob {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs);
      }

      .knob__label {
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        user-select: none;
      }

      .knob__dial {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-full);
        cursor: ns-resize;
        outline: none;
        /* The gesture is a vertical drag; without this a touch scrolls the page
           instead of turning the knob. */
        touch-action: none;
        user-select: none;
      }

      .knob__dial:focus-visible {
        box-shadow: var(--interactive-focus);
      }

      /* Sizes — the dial diameter, since the readout and label type already sit
         on the shared scale. md is the base rule above, so an unrecognised
         value lands on it. */
      :host([size="sm"]) .knob__dial { width: 48px; height: 48px; }
      :host([size="lg"]) .knob__dial { width: 84px; height: 84px; }

      .knob__dial svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .knob__track {
        stroke: var(--border-default);
      }

      .knob__cap {
        fill: var(--surface-primary);
        stroke: var(--border-default);
      }

      .knob__tick {
        stroke: var(--border-bright);
      }

      .knob__fill {
        stroke: var(--interactive);
        filter: drop-shadow(0 0 4px rgba(var(--interactive-rgb), 0.35));
        transition: filter var(--transition-fast);
      }

      .knob__indicator {
        stroke: var(--interactive);
        filter: drop-shadow(0 0 3px rgba(var(--interactive-rgb), 0.4));
        transition: filter var(--transition-fast);
      }

      .knob__dial:hover .knob__indicator,
      .knob__dial:focus-visible .knob__indicator,
      .knob__dial--active .knob__indicator {
        filter: drop-shadow(0 0 6px rgba(var(--interactive-rgb), 0.6))
                drop-shadow(0 0 14px rgba(var(--interactive-rgb), 0.3));
      }

      .knob__dial:hover .knob__fill,
      .knob__dial:focus-visible .knob__fill,
      .knob__dial--active .knob__fill {
        filter: drop-shadow(0 0 6px rgba(var(--interactive-rgb), 0.5));
      }

      .knob__value {
        font-family: var(--font-mono);
        font-size: var(--code-size);
        color: var(--interactive);
        font-weight: 600;
        /* Updates on every pointermove — proportional digits would change its
           width each frame and make the whole control breathe while turning. */
        font-variant-numeric: tabular-nums;
        user-select: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .knob__fill,
        .knob__indicator { transition: none; }
      }
    `,
  ];

  /** Degrees of arc the knob sweeps; the remaining 90 stay open at the bottom. */
  static SWEEP = 270;

  /** Pixels of vertical drag that cover the full range. */
  static DRAG_THROW = 150;

  /** Fraction of the range within which a drag snaps to a detent. */
  static DETENT_WINDOW = 0.025;

  constructor() {
    super();
    this.size = 'md';
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.name = '';
    this.disabled = false;
    this.label = '';
    this.detents = [];
    this.format = undefined;
    this._dragging = false;
    this._dragStartY = 0;
    this._dragStartValue = 0;
  }

  _formValue() {
    return this.value == null ? null : String(this.value);
  }

  formStateRestoreCallback(state) {
    if (typeof state === 'string' && state !== '' && !Number.isNaN(Number(state))) {
      this.value = Number(state);
      this._updateFormValue();
    }
  }

  /** Detents as a numeric array regardless of how the property was assigned. */
  get _detentList() {
    if (Array.isArray(this.detents)) return this.detents.filter(Number.isFinite);
    if (typeof this.detents === 'string' && this.detents !== '') {
      return this.detents.split(',').map(Number).filter(Number.isFinite);
    }
    return [];
  }

  get _formatted() {
    return typeof this.format === 'function' ? this.format(this.value) : String(this.value);
  }

  get _fillPercent() {
    const range = this.max - this.min;
    if (range === 0) return 0;
    return ((this.value - this.min) / range) * 100;
  }

  _clamp(value, lo, hi) {
    return Math.min(Math.max(value, lo), hi);
  }

  _snap(value) {
    if (!(this.step > 0)) return value;
    const snapped = Math.round((value - this.min) / this.step) * this.step + this.min;
    // Fix floating point precision issues
    const decimals = (String(this.step).split('.')[1] || '').length;
    return Number(snapped.toFixed(decimals));
  }

  /** Magnetic snap: a value within the detent window lands on the detent. */
  _applyDetents(value) {
    const detents = this._detentList;
    if (detents.length === 0) return value;
    const reach = Math.abs(this.max - this.min) * ArcKnob.DETENT_WINDOW;
    let best = value;
    let bestDist = Infinity;
    for (const d of detents) {
      const dist = Math.abs(value - d);
      if (dist <= reach && dist < bestDist) {
        best = d;
        bestDist = dist;
      }
    }
    return best;
  }

  _fireInput() {
    this._updateFormValue();
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _fireChange() {
    this._updateFormValue();
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** A discrete gesture (wheel notch, key step) is edit and commit at once. */
  _applyDiscrete(next) {
    next = this._snap(this._clamp(next, this.min, this.max));
    if (next === this.value) return;
    this.value = next;
    this._fireInput();
    this._fireChange();
  }

  _onPointerDown(e) {
    if (this.disabled || this.readonly) return;
    e.preventDefault();
    this._dragging = true;
    this._dragStartY = e.clientY;
    this._dragStartValue = this.value;
    e.currentTarget.setPointerCapture(e.pointerId);
    // preventDefault suppressed the focus that a pointerdown normally brings.
    e.currentTarget.focus();
  }

  _onPointerMove(e) {
    if (!this._dragging) return;
    const range = this.max - this.min;
    if (range === 0) return;
    const scale = e.shiftKey ? 0.1 : 1;
    const raw =
      this._dragStartValue + ((this._dragStartY - e.clientY) / ArcKnob.DRAG_THROW) * range * scale;
    const next = this._applyDetents(this._snap(this._clamp(raw, this.min, this.max)));
    if (next === this.value) return;
    this.value = next;
    this._fireInput();
  }

  _onPointerUp() {
    if (!this._dragging) return;
    this._dragging = false;
    this._fireChange();
  }

  _onWheel(e) {
    if (this.disabled || this.readonly) return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    this._applyDiscrete(this.value + direction * this.step);
  }

  _onKeyDown(e) {
    if (this.disabled || this.readonly) return;
    let next;
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        next = this.value + this.step;
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        next = this.value - this.step;
        break;
      case 'PageUp':
        next = this.value + this.step * 10;
        break;
      case 'PageDown':
        next = this.value - this.step * 10;
        break;
      case 'Home':
        next = this.min;
        break;
      case 'End':
        next = this.max;
        break;
      default:
        return;
    }
    e.preventDefault();
    this._applyDiscrete(next);
  }

  /** Tick marks around the dial, one per detent inside the range. */
  _renderTicks() {
    const range = this.max - this.min;
    if (range === 0) return null;
    return this._detentList
      .filter((d) => d >= Math.min(this.min, this.max) && d <= Math.max(this.min, this.max))
      .map((d) => {
        const frac = (d - this.min) / range;
        const deg = -135 + frac * ArcKnob.SWEEP;
        const rad = ((deg - 90) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return svg`<line
          class="knob__tick"
          x1=${(50 + 44 * cos).toFixed(2)} y1=${(50 + 44 * sin).toFixed(2)}
          x2=${(50 + 48 * cos).toFixed(2)} y2=${(50 + 48 * sin).toFixed(2)}
          stroke-width="1.5" stroke-linecap="round"
        ></line>`;
      });
  }

  render() {
    const percent = this._fillPercent;
    // 270 of the circle's 100 pathLength units is 75; the sweep scales into it.
    const sweep = (percent / 100) * 75;
    const angle = -135 + (percent / 100) * ArcKnob.SWEEP;

    return html`
      <div class="knob" part="knob">
        ${
          this.label
            ? html`
          <span class="knob__label" part="label">${this.label}</span>
        `
            : ''
        }
        <div
          class="knob__dial ${this._dragging ? 'knob__dial--active' : ''}"
          part="dial"
          role="slider"
          tabindex=${this.disabled ? '-1' : '0'}
          aria-label=${this.label || 'Knob'}
          aria-valuemin=${this.min}
          aria-valuemax=${this.max}
          aria-valuenow=${this.value}
          aria-valuetext=${this._formatted}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-readonly=${this.readonly ? 'true' : 'false'}
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}
          @wheel=${this._onWheel}
          @keydown=${this._onKeyDown}
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle
              class="knob__track" part="track"
              cx="50" cy="50" r="38" fill="none"
              stroke-width="7" stroke-linecap="round"
              pathLength="100" stroke-dasharray="75 25"
              transform="rotate(135 50 50)"
            ></circle>
            <circle
              class="knob__fill" part="fill"
              cx="50" cy="50" r="38" fill="none"
              stroke-width="7" stroke-linecap="round"
              pathLength="100" stroke-dasharray="${sweep.toFixed(3)} ${(100 - sweep).toFixed(3)}"
              transform="rotate(135 50 50)"
            ></circle>
            ${this._renderTicks()}
            <circle class="knob__cap" cx="50" cy="50" r="27" stroke-width="1.5"></circle>
            <line
              class="knob__indicator" part="indicator"
              x1="50" y1="26" x2="50" y2="36"
              stroke-width="4.5" stroke-linecap="round"
              transform="rotate(${angle.toFixed(2)} 50 50)"
            ></line>
          </svg>
        </div>
        <span class="knob__value" part="value">${this._formatted}</span>
      </div>
    `;
  }
}
