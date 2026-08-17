import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { DeclaredPropsMixin, flag, oneOf, list } from '../shared/props.js';

/** Whether two preset lists would draw the same row of swatches. */
const sameColors = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((c, i) => c === b[i]);

/**
 * Full-featured color picker with a saturation/lightness area, hue slider, hex input, and optional
 * preset swatches.
 *
 * @tag arc-color-picker
 * @status stable
 * @prop {string} value - Current color as a 6-digit hex string (e.g. `#4d7ef7`). Reflected as an attribute.
 * @prop {string[]} presets - Array of hex color strings to display as quick-select swatches below the hex input.
 * @prop {string} label - Label text displayed above the picker in uppercase accent font.
 * @prop {boolean} disabled - Disables all interaction, reducing opacity to 40% and blocking pointer events.
 * @prop {boolean} readonly - Prevents changing the color via the area, hue slider, hex input, or swatches while the picker stays focusable and the value still submits.
 * @prop {'sm' | 'md' | 'lg'} size - Control size. `md` is the default; `sm` and `lg` scale the swatch and trigger.
 * @fires arc-input - Fired continuously as the color changes, including every frame of a drag across the saturation area or hue track. Use for live previews. `event.detail.value` contains the hex string.
 * @fires arc-change - Fired once the color is committed: the pointer released after a drag, a preset clicked, or a valid hex typed and blurred. Use for anything expensive. `event.detail.value` contains the hex string.
 * @slot none
 * @csspart base - The root element.
 * @csspart picker
 * @csspart label
 * @csspart area
 * @csspart hue-track
 * @csspart hex-row
 * @csspart preview
 * @csspart hex-input
 * @csspart presets
 */
export class ArcColorPicker extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    value: { type: String, reflect: true },
    name: { type: String, reflect: true },
    presets: list(),
    // NOT flag(): a form-associated custom element whose `disabled` content
    // attribute is merely *present* is "actually disabled" per the HTML spec,
    // so the platform calls formDisabledCallback(true) and the mixin sets the
    // property back. `disabled="false"` is a disabled control here for exactly
    // the reason it is on a native <input>. Native semantics win; see
    // shared/props.js.
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    _hue: { state: true },
    _sat: { state: true },
    _lit: { state: true },
    _hexInput: { state: true },
    // What the swatch row actually renders — see connectedCallback.
    _presets: { state: true },
    _draggingArea: { state: true },
    _draggingHue: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .picker {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        padding: var(--space-md);
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        width: 260px;
        box-sizing: border-box;
      }

      .picker__label {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .picker__area {
        position: relative;
        width: 100%;
        height: 160px;
        border-radius: var(--radius-sm);
        cursor: crosshair;
        overflow: hidden;
        touch-action: none;
      }

      .picker__area-gradient {
        position: absolute;
        inset: 0;
        border-radius: var(--radius-sm);
      }

      .picker__crosshair {
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: var(--radius-full);
        border: 2px solid var(--picker-thumb-color, #fff);
        /* Functional contrast ring over arbitrary swatch colors — stays black in all themes */
        box-shadow: 0 0 2px rgba(var(--black-rgb), 0.6), inset 0 0 2px rgba(var(--black-rgb), 0.3);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 2;
      }

      .picker__hue-track {
        position: relative;
        width: 100%;
        height: 14px;
        border-radius: var(--radius-full);
        background: linear-gradient(
          to right,
          hsl(0, 100%, 50%),
          hsl(60, 100%, 50%),
          hsl(120, 100%, 50%),
          hsl(180, 100%, 50%),
          hsl(240, 100%, 50%),
          hsl(300, 100%, 50%),
          hsl(360, 100%, 50%)
        );
        cursor: pointer;
        touch-action: none;
      }

      .picker__hue-thumb {
        position: absolute;
        top: 50%;
        width: 18px;
        height: 18px;
        border-radius: var(--radius-full);
        border: 2px solid var(--picker-thumb-color, #fff);
        box-shadow: 0 0 3px rgba(var(--black-rgb), 0.4);
        transform: translate(-50%, -50%);
        pointer-events: none;
      }

      .picker__hex-row {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .picker__preview {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-default);
        flex-shrink: 0;
      }

      .picker__hex-input {
        flex: 1;
        font-family: var(--font-mono);
        font-size: var(--code-size);
        color: var(--text-primary);
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        padding: var(--space-xs) var(--space-sm);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-sizing: border-box;
      }

      .picker__hex-input:focus-visible {
        outline: none;
        border-color: var(--interactive);
        box-shadow: var(--interactive-focus);
      }

      .picker__presets {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs);
      }


      .picker__swatch {
        width: 22px;
        height: 22px;
        border-radius: var(--radius-sm);
        border: 2px solid transparent;
        cursor: pointer;
        transition: border-color var(--transition-fast), transform var(--transition-fast);
        padding: 0;
        box-sizing: border-box;
      }

      /* Sizes — the current-color preview and the preset swatches. md is the
         base rule above, so an unrecognized value lands on it. */
      :host([size="sm"]) .picker__preview { width: 26px; height: 26px; }
      :host([size="sm"]) .picker__swatch { width: 18px; height: 18px; }
      :host([size="lg"]) .picker__preview { width: 40px; height: 40px; }
      :host([size="lg"]) .picker__swatch { width: 28px; height: 28px; }

      .picker__swatch:hover {
        transform: scale(1.15);
      }

      .picker__swatch:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .picker__swatch--active {
        border-color: var(--text-primary);
      }
    `,
  ];

  constructor() {
    super();
    this.value = '#4d7ef7';
    this.name = '';
    this.disabled = false;
    this.label = '';
    // Seeded from `value` by connectedCallback's _parseHex; these are only the
    // pre-connection placeholders. They were hand-written approximations of
    // #4d7ef7 and did not convert back to it.
    this._hue = 225;
    this._sat = 92;
    this._lit = 64;
    this._hexInput = '#4d7ef7';
    this._presets = [];
    this._draggingArea = false;
    this._draggingHue = false;
    this._areaEl = null;
    this._hueTrackEl = null;
    this._onPointerMoveBound = this._onPointerMove.bind(this);
    this._onPointerUpBound = this._onPointerUp.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._parseHex(this.value);
  }

  /**
   * The swatch row renders from `_presets`, and the first render seeds it from
   * markup rather than from the property.
   *
   * The server only ever sees markup, so the presets it can render are the ones
   * the `presets` *attribute* carried. A page that instead assigns
   * `.presets = [...]` from script — the documented way, since most callers
   * have colours in hand rather than JSON in markup — hands the element that
   * array before it upgrades, and Lit re-applies it during the first update,
   * before this. Rendering it here would put a whole swatch row into the
   * client's first render where the server put nothing, and a part that changes
   * shape under hydration is the one thing it cannot adopt. Seeding from the
   * attribute keeps both first renders on the same input; updated() picks the
   * property up one render later, once the server DOM has been adopted.
   */
  willUpdate(changed) {
    super.willUpdate?.(changed);
    if (!this.hasUpdated) {
      const { converter } = this.constructor.elementProperties.get('presets');
      this._presets = converter.fromAttribute(this.getAttribute('presets'), Array);
    }
  }

  updated(changed) {
    super.updated(changed);
    if (changed.has('value') && !this._draggingArea && !this._draggingHue) {
      this._parseHex(this.value);
      this._hexInput = this.value;
    }
    // Compared by content, not identity: the seed above is a fresh array, so
    // an identity test would re-render every picker whose presets never
    // changed — including the ones that have none.
    if (changed.has('presets') && !sameColors(this._presets, this.presets)) {
      this._presets = this.presets;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('pointermove', this._onPointerMoveBound);
    window.removeEventListener('pointerup', this._onPointerUpBound);
  }

  /* ---- Color conversion ---- */

  _parseHex(hex) {
    if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (d !== 0) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g) h = ((b - r) / d + 2) * 60;
      else h = ((r - g) / d + 4) * 60;
    }
    // Deliberately *not* rounded. Integer HSL has far fewer points than the
    // 16.7M hex colours this accepts, so rounding here cannot represent most of
    // its own input — `#4d7ef7`, which used to be this component's default,
    // came back as `#507ff7`. The visible symptom was a colour that jumped to a
    // neighbour it had never been on as soon as the hue slider moved one pixel
    // (finding #62). The pointer handlers still round, and should: those values
    // come from pixels and are quantised already.
    this._hue = h;
    this._sat = s * 100;
    this._lit = l * 100;
  }

  _hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;
    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    const toHex = (v) =>
      Math.round((v + m) * 255)
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Called on every pointermove while dragging the saturation area or the hue
   * track, so this is the continuous edit — arc-input. The commit is
   * pointerup, which fires arc-change once. Dragging across the area used to
   * emit arc-change on every frame, so anything expensive on that listener —
   * a save, a network call — ran hundreds of times per drag.
   */
  _updateFromHSL() {
    const hex = this._hslToHex(this._hue, this._sat, this._lit);
    this.value = hex;
    this._hexInput = hex;
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: hex },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The committed value, after a drag ends or a discrete pick. */
  _commit() {
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ---- Area (saturation / lightness) interaction ---- */

  _onAreaPointerDown(e) {
    if (this.disabled || this.readonly) return;
    e.preventDefault();
    this._draggingArea = true;
    this._areaEl = this.shadowRoot.querySelector('.picker__area');
    e.target.setPointerCapture(e.pointerId);
    this._updateAreaFromPointer(e);
    window.addEventListener('pointermove', this._onPointerMoveBound);
    window.addEventListener('pointerup', this._onPointerUpBound);
  }

  _updateAreaFromPointer(e) {
    const area = this._areaEl;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    // x = saturation (0..100), y inverted = lightness (100..0 mapped through hue)
    // Using HSB-like mapping: saturation = x, lightness derived from both
    this._sat = Math.round(x * 100);
    this._lit = Math.round((1 - y) * 50 + (1 - x) * (1 - y) * 50);
    // Simpler standard mapping: x = saturation, y = lightness (inverted)
    this._sat = Math.round(x * 100);
    this._lit = Math.round((1 - y) * 100);
    this._updateFromHSL();
  }

  /* ---- Hue slider interaction ---- */

  _onHuePointerDown(e) {
    if (this.disabled || this.readonly) return;
    e.preventDefault();
    this._draggingHue = true;
    this._hueTrackEl = this.shadowRoot.querySelector('.picker__hue-track');
    e.target.setPointerCapture(e.pointerId);
    this._updateHueFromPointer(e);
    window.addEventListener('pointermove', this._onPointerMoveBound);
    window.addEventListener('pointerup', this._onPointerUpBound);
  }

  _updateHueFromPointer(e) {
    const track = this._hueTrackEl;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this._hue = Math.round(x * 360);
    this._updateFromHSL();
  }

  /* ---- Shared pointer handlers ---- */

  _onPointerMove(e) {
    if (this._draggingArea) this._updateAreaFromPointer(e);
    else if (this._draggingHue) this._updateHueFromPointer(e);
  }

  _onPointerUp() {
    const wasDragging = this._draggingArea || this._draggingHue;
    this._draggingArea = false;
    this._draggingHue = false;
    this._areaEl = null;
    this._hueTrackEl = null;
    window.removeEventListener('pointermove', this._onPointerMoveBound);
    window.removeEventListener('pointerup', this._onPointerUpBound);
    // Releasing the pointer is the commit. Guarded, because this handler is
    // also reached by a pointerup that never dragged anything.
    if (wasDragging) this._commit();
  }

  /* ---- Hex input ---- */

  _onHexInput(e) {
    this._hexInput = e.target.value;
  }

  _onHexBlur() {
    if (this.disabled || this.readonly) return;
    let hex = this._hexInput.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      hex = hex.toLowerCase();
      this.value = hex;
      this._hexInput = hex;
      this._parseHex(hex);
      // Typing in the hex field is edit-and-commit in one: this runs on blur
      // or Enter, never per keystroke.
      this.dispatchEvent(
        new CustomEvent('arc-input', {
          detail: { value: hex },
          bubbles: true,
          composed: true,
        }),
      );
      this._commit();
    } else {
      this._hexInput = this.value;
    }
  }

  _onHexKeydown(e) {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  }

  /* ---- Preset swatch ---- */

  /** A discrete pick: edit and commit in one click, so both fire. */
  _selectPreset(hex) {
    if (this.disabled || this.readonly) return;
    this.value = hex.toLowerCase();
    this._hexInput = this.value;
    this._parseHex(this.value);
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
    this._commit();
  }

  /* ---- Render ---- */

  get _areaBackground() {
    return `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${this._hue}, 100%, 50%))`;
  }

  get _crosshairX() {
    return `${this._sat}%`;
  }

  get _crosshairY() {
    return `${100 - this._lit}%`;
  }

  get _hueThumbLeft() {
    return `${(this._hue / 360) * 100}%`;
  }

  render() {
    return html`
      <div class="picker" part="base picker">
        ${this.label ? html`<span class="picker__label" part="label">${this.label}</span>` : ''}

        <div
          class="picker__area"
          @pointerdown=${this._onAreaPointerDown}
          part="area"
        >
          <div
            class="picker__area-gradient"
            style="background: ${this._areaBackground}"
          ></div>
          <div
            class="picker__crosshair"
            style="left: ${this._crosshairX}; top: ${this._crosshairY}; background: ${this.value}"
          ></div>
        </div>

        <div
          class="picker__hue-track"
          @pointerdown=${this._onHuePointerDown}
          part="hue-track"
        >
          <div
            class="picker__hue-thumb"
            style="left: ${this._hueThumbLeft}; background: hsl(${this._hue}, 100%, 50%)"
          ></div>
        </div>

        <div class="picker__hex-row" part="hex-row">
          <div
            class="picker__preview"
            style="background: ${this.value}"
            part="preview"
          ></div>
          <input
            class="picker__hex-input"
            type="text"
            maxlength="7"
            .value=${this._hexInput}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @input=${this._onHexInput}
            @blur=${this._onHexBlur}
            @keydown=${this._onHexKeydown}
            aria-label="Hex color value"
            part="hex-input"
          />
        </div>

        ${
          this._presets && this._presets.length
            ? html`
          <div class="picker__presets" part="presets" role="listbox" aria-label="Color presets">
            ${this._presets.map(
              (c) => html`
              <button
                class="picker__swatch ${c.toLowerCase() === this.value ? 'picker__swatch--active' : ''}"
                style="background: ${c}"
                role="option"
                aria-selected=${c.toLowerCase() === this.value ? 'true' : 'false'}
                aria-label=${c}
                ?disabled=${this.disabled}
                @click=${() => this._selectPreset(c)}
              ></button>
            `,
            )}
          </div>
        `
            : ''
        }
      </div>
    `;
  }
}
