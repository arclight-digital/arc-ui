import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcColorPicker extends LitElement {
  static properties = {
    value:    { type: String, reflect: true },
    presets:  { type: Array },
    disabled: { type: Boolean, reflect: true },
    label:    { type: String },
    _hue:     { state: true },
    _sat:     { state: true },
    _lit:     { state: true },
    _hexInput:    { state: true },
    _draggingArea:   { state: true },
    _draggingHue:    { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .picker {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        padding: var(--space-md);
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        width: 260px;
        box-sizing: border-box;
      }

      .picker__label {
        font-family: var(--font-accent);
        font-weight: 600;
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
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.6), inset 0 0 2px rgba(0, 0, 0, 0.3);
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
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
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
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        padding: var(--space-xs) var(--space-sm);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-sizing: border-box;
      }

      .picker__hex-input:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: var(--focus-glow);
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

      .picker__swatch:hover {
        transform: scale(1.15);
      }

      .picker__swatch:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .picker__swatch--active {
        border-color: var(--text-primary);
      }

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
    this.value = '#4d7ef7';
    this.presets = [];
    this.disabled = false;
    this.label = '';
    this._hue = 225;
    this._sat = 92;
    this._lit = 64;
    this._hexInput = '#4d7ef7';
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

  updated(changed) {
    if (changed.has('value') && !this._draggingArea && !this._draggingHue) {
      this._parseHex(this.value);
      this._hexInput = this.value;
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
    this._hue = Math.round(h);
    this._sat = Math.round(s * 100);
    this._lit = Math.round(l * 100);
  }

  _hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  _updateFromHSL() {
    const hex = this._hslToHex(this._hue, this._sat, this._lit);
    this.value = hex;
    this._hexInput = hex;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: hex },
      bubbles: true,
      composed: true,
    }));
  }

  /* ---- Area (saturation / lightness) interaction ---- */

  _onAreaPointerDown(e) {
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
    this._draggingArea = false;
    this._draggingHue = false;
    this._areaEl = null;
    this._hueTrackEl = null;
    window.removeEventListener('pointermove', this._onPointerMoveBound);
    window.removeEventListener('pointerup', this._onPointerUpBound);
  }

  /* ---- Hex input ---- */

  _onHexInput(e) {
    this._hexInput = e.target.value;
  }

  _onHexBlur() {
    let hex = this._hexInput.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      hex = hex.toLowerCase();
      this.value = hex;
      this._hexInput = hex;
      this._parseHex(hex);
      this.dispatchEvent(new CustomEvent('arc-change', {
        detail: { value: hex },
        bubbles: true,
        composed: true,
      }));
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

  _selectPreset(hex) {
    this.value = hex.toLowerCase();
    this._hexInput = this.value;
    this._parseHex(this.value);
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
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
      <div class="picker" part="picker">
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
            @input=${this._onHexInput}
            @blur=${this._onHexBlur}
            @keydown=${this._onHexKeydown}
            aria-label="Hex color value"
            part="hex-input"
          />
        </div>

        ${this.presets && this.presets.length ? html`
          <div class="picker__presets" part="presets" role="listbox" aria-label="Color presets">
            ${this.presets.map(c => html`
              <button
                class="picker__swatch ${c.toLowerCase() === this.value ? 'picker__swatch--active' : ''}"
                style="background: ${c}"
                role="option"
                aria-selected=${c.toLowerCase() === this.value ? 'true' : 'false'}
                aria-label=${c}
                @click=${() => this._selectPreset(c)}
              ></button>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('arc-color-picker', ArcColorPicker);
