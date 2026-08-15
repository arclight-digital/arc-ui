import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import './icon-button.js';
import { DeclaredPropsMixin, flag, num } from '../shared/props.js';

/**
 * Canvas signature capture that participates in forms. A bordered drawing surface with a muted
 * "Sign here" baseline while empty, a velocity-scaled pen line for a natural stroke, and a ghost
 * clear button once ink is down. Each completed stroke serializes the whole canvas to a PNG
 * data-URL and submits it as the field value; required-and-blank reports `valueMissing` like any
 * other input.
 *
 * Signing by hand is inherently a pointer gesture: the pad itself offers no keyboard path to
 * produce a signature (the clear button is keyboard-reachable, the canvas is focusable so its
 * signed/empty state is announced). A consumer collecting signatures must offer keyboard users an
 * equivalent — a type-to-sign field, an upload — alongside this control; the pad does not
 * simulate one.
 *
 * @tag arc-signature-pad
 * @requires arc-icon-button
 * @prop {string} value - The signature as a PNG data-URL, empty string while the pad is blank. Updated after every completed stroke. Setting it from script draws the image onto the canvas (client-side only). Not reflected — a data-URL is far too large to live in an attribute.
 * @prop {string} name - Form field name the data-URL submits under.
 * @prop {string} label - Label text displayed above the pad in the label typography role. Also feeds the canvas's accessible name.
 * @prop {boolean} disabled - Disables interaction, reducing opacity and blocking pointer events. The pad leaves the tab order.
 * @prop {boolean} readonly - Prevents drawing and hides the clear button while the pad stays focusable and the value still submits.
 * @prop {boolean} required - When true and the pad is blank, the control is invalid with `valueMissing`.
 * @prop {string} penColor - Pen color as any CSS color, including a `var()` expression, resolved against the canvas at stroke time. Attribute: `pen-color`. Defaults to the resolved value of `--text-primary`.
 * @prop {number} penWidth - Base pen width in CSS pixels. The drawn line scales with stroke velocity — up to 40% thicker on slow, deliberate movement and 40% thinner on fast flicks. Attribute: `pen-width`. Default 2.
 * @fires {CustomEvent<{ value: string }>} arc-input - Fired once per completed stroke with the serialized data-URL. A stroke is the edit unit — nothing fires per point while the pen is down.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when the pointer session ends and the value serializes. A stroke is a discrete gesture, so each stroke end fires arc-input then arc-change together.
 * @fires {CustomEvent<void>} arc-clear - Fired when the pad is cleared, via the clear button or the clear() method.
 * @slot none
 * @csspart pad
 * @csspart label
 * @csspart canvas
 * @csspart placeholder
 * @csspart clear
 */
export class ArcSignaturePad extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    value: { type: String },
    name: { type: String, reflect: true },
    label: { type: String },
    // NOT flag(): a form-associated custom element whose `disabled` content
    // attribute is merely *present* is "actually disabled" per the HTML spec,
    // so the platform calls formDisabledCallback(true) and the mixin sets the
    // property back. `disabled="false"` is a disabled control here for exactly
    // the reason it is on a native <input>. Native semantics win; see
    // shared/props.js.
    disabled: { type: Boolean, reflect: true },
    penColor: { type: String, attribute: 'pen-color' },
    penWidth: num({ default: 2, min: 0.1, clamp: 'toRange', attribute: 'pen-width' }),
    /** @internal */ _hasInk: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .pad {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .pad__label {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
        user-select: none;
      }

      .pad__surface {
        position: relative;
      }

      canvas {
        display: block;
        width: 100%;
        height: 160px;
        box-sizing: border-box;
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        /* The pen color: strokes resolve this computed color at pen-down, so a
           consumer theme change or a pen-color var() reference lands without
           the component ever hard-coding a channel. */
        color: var(--text-primary);
        cursor: crosshair;
        /* The gesture is a freehand drag; without this a touch scrolls the
           page instead of signing. */
        touch-action: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      canvas:hover { border-color: var(--border-bright); }

      canvas:focus-visible {
        outline: none;
        border-color: var(--interactive);
        box-shadow: var(--interactive-focus);
      }

      :host([readonly]) canvas { cursor: default; }

      .pad__hint {
        position: absolute;
        inset-inline: 12%;
        bottom: 20%;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        pointer-events: none;
        user-select: none;
        opacity: 1;
        transition: opacity var(--transition-base);
      }

      .pad__hint--hidden { opacity: 0; }

      .pad__hint-line {
        height: 1px;
        background: var(--divider);
      }

      .pad__hint-text {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        text-align: center;
      }

      .pad__clear {
        position: absolute;
        top: var(--space-xs);
        inset-inline-end: var(--space-xs);
      }

      @media (prefers-reduced-motion: reduce) {
        canvas,
        .pad__hint { transition: none; }
      }
    `,
  ];

  /** Stroke speed (CSS px per ms) at which the pen reaches its thinnest. */
  static SPEED_FULL = 1.5;

  constructor() {
    super();
    this.value = '';
    this.name = '';
    this.label = '';
    this.disabled = false;
    this.penColor = '';
    this._hasInk = false;
    // Canvas state lives here, never touched before firstUpdated — the
    // component must construct and render in Node, where no 2D context exists.
    this._ctx = null;
    this._cssW = 0;
    this._cssH = 0;
    this._drawing = false;
    this._skipDraw = false;
    this._resizeObserver = null;
    this._last = null;
    this._lastMid = null;
    this._lastTime = 0;
    this._lineWidth = 2;
  }

  connectedCallback() {
    super.connectedCallback();
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        const canvas = this._canvasEl;
        if (!canvas || !this._ctx) return;
        const rect = canvas.getBoundingClientRect();
        if (rect.width === this._cssW && rect.height === this._cssH) return;
        // Resizing the backing store wipes it; completed strokes live in
        // `value`, so redraw from there.
        this._setupCanvas();
        if (this.value) this._applyValueToCanvas();
      });
      this._resizeObserver.observe(this);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  firstUpdated() {
    this._setupCanvas();
    if (this.value) this._applyValueToCanvas();
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    // Pure derived state — no canvas here. Deriving the signed flag in
    // willUpdate lets the placeholder toggle ride the same update instead of
    // scheduling a second one from updated(). Stroke and clear() set the flag
    // themselves before touching `value` (that path arms _skipDraw).
    if (changed.has('value') && !this._skipDraw) this._hasInk = !!this.value;
  }

  updated(changed) {
    super.updated(changed);
    if (changed.has('value')) {
      // A stroke's own serialization must not bounce back through the
      // draw-from-value path and repaint the canvas it was read from.
      if (this._skipDraw) this._skipDraw = false;
      else this._applyValueToCanvas();
    }
  }

  /** A blank pad submits no entry at all, the way an empty file input does. */
  _formValue() {
    return this.value || null;
  }

  /** Restore only what could plausibly be a serialized signature. */
  formStateRestoreCallback(state) {
    if (typeof state === 'string' && (state === '' || state.startsWith('data:'))) {
      this.value = state;
      this._updateFormValue();
    }
  }

  /* ---- Public API ---- */

  /** Wipe the canvas, empty the value, and bring the placeholder back. */
  clear() {
    this._drawing = false;
    this._hasInk = false;
    if (this.value !== '') {
      // Only arm the skip when `value` will actually change — an unchanged
      // value never reaches updated(), and a stuck flag would swallow the
      // next programmatic draw.
      this._skipDraw = true;
      this.value = '';
    }
    this._clearCanvas();
    this.dispatchEvent(
      new CustomEvent('arc-clear', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * The current canvas as a data-URL in the requested format (PNG by
   * default). Unlike `value`, this reads the canvas directly, so a blank pad
   * returns a blank image rather than an empty string.
   */
  toDataURL(type = 'image/png') {
    const canvas = this._canvasEl;
    return canvas ? canvas.toDataURL(type) : this.value || '';
  }

  /* ---- Canvas plumbing (browser only, never before firstUpdated) ---- */

  get _canvasEl() {
    return this.shadowRoot?.querySelector('canvas') ?? null;
  }

  /** Size the backing store to CSS-size times devicePixelRatio for crisp ink. */
  _setupCanvas() {
    const canvas = this._canvasEl;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this._cssW = rect.width;
    this._cssH = rect.height;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this._ctx = ctx;
  }

  _clearCanvas() {
    if (!this._ctx) return;
    this._ctx.clearRect(0, 0, this._cssW, this._cssH);
  }

  /** Draw a programmatic `value` onto the canvas, contain-fit and centered. */
  _applyValueToCanvas() {
    if (!this._ctx) return;
    this._clearCanvas();
    if (!this.value) return;
    const img = new Image();
    img.onload = () => {
      const ctx = this._ctx;
      if (!ctx || !img.width || !img.height) return;
      const scale = Math.min(this._cssW / img.width, this._cssH / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (this._cssW - w) / 2, (this._cssH - h) / 2, w, h);
    };
    img.src = this.value;
  }

  /**
   * The pen color, resolved at pen-down. The canvas carries the pen color as
   * its CSS `color` (pen-color prop as an inline override, --text-primary as
   * the default), so getComputedStyle hands back a concrete rgb whatever the
   * theme or var() indirection.
   */
  _resolvedPenColor() {
    const canvas = this._canvasEl;
    return (canvas && getComputedStyle(canvas).color) || '#000';
  }

  get _basePenWidth() {
    const w = Number(this.penWidth);
    return Number.isFinite(w) && w > 0 ? w : 2;
  }

  _pointFrom(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  /* ---- Drawing gestures ---- */

  _onPointerDown(e) {
    if (this.disabled || this.readonly || !this._ctx || !e.isPrimary) return;
    e.preventDefault();
    const canvas = e.currentTarget;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* a synthetic or already-lifted pointer has no capture */
    }
    // preventDefault suppressed the focus a pointerdown normally brings.
    canvas.focus();

    this._drawing = true;
    this._hasInk = true;
    const p = this._pointFrom(e);
    this._last = p;
    this._lastMid = p;
    this._lastTime = e.timeStamp || performance.now();
    this._lineWidth = this._basePenWidth;

    const ctx = this._ctx;
    ctx.strokeStyle = ctx.fillStyle = this._resolvedPenColor();
    // A tap with no movement still marks the page — a dot, like a real pen.
    ctx.beginPath();
    ctx.arc(p.x, p.y, this._lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  _onPointerMove(e) {
    if (!this._drawing) return;
    const p = this._pointFrom(e);
    const dx = p.x - this._last.x;
    const dy = p.y - this._last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.5) return;

    // Velocity-scaled width: slow deliberate movement thickens the line up to
    // +40%, a fast flick thins it to -40%, low-pass filtered so the width
    // never steps visibly between segments.
    const now = e.timeStamp || performance.now();
    const dt = Math.max(now - this._lastTime, 1);
    const speed = Math.min(dist / dt / ArcSignaturePad.SPEED_FULL, 1);
    const target = this._basePenWidth * (1.4 - 0.8 * speed);
    this._lineWidth += (target - this._lineWidth) * 0.35;

    // Quadratic through the midpoints keeps a polyline of pointer samples
    // from reading as one.
    const mid = { x: (this._last.x + p.x) / 2, y: (this._last.y + p.y) / 2 };
    const ctx = this._ctx;
    ctx.beginPath();
    ctx.lineWidth = this._lineWidth;
    ctx.moveTo(this._lastMid.x, this._lastMid.y);
    ctx.quadraticCurveTo(this._last.x, this._last.y, mid.x, mid.y);
    ctx.stroke();

    this._last = p;
    this._lastMid = mid;
    this._lastTime = now;
  }

  _onPointerUp() {
    if (!this._drawing) return;
    this._drawing = false;
    // Close the final half-segment the midpoint curve left dangling.
    const ctx = this._ctx;
    if (ctx && this._last && this._lastMid) {
      ctx.beginPath();
      ctx.lineWidth = this._lineWidth;
      ctx.moveTo(this._lastMid.x, this._lastMid.y);
      ctx.lineTo(this._last.x, this._last.y);
      ctx.stroke();
    }
    this._serializeStroke();
  }

  /**
   * Stroke end is the edit unit and the commit in one gesture: the whole
   * canvas serializes into `value`, then arc-input and arc-change fire
   * together, the way any discrete gesture does across the input tier.
   */
  _serializeStroke() {
    const canvas = this._canvasEl;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    if (url !== this.value) {
      this._skipDraw = true;
      this.value = url;
    }
    this._updateFormValue();
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: url },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: url },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onClearClick() {
    this.clear();
  }

  render() {
    const signed = this._hasInk || !!this.value;
    const ariaLabel = `${this.label || 'Signature'} — ${signed ? 'signed' : 'empty'}`;
    return html`
      <div class="pad" part="pad">
        ${
          this.label
            ? html`
          <span class="pad__label" part="label">${this.label}</span>
        `
            : ''
        }
        <div class="pad__surface">
          <canvas
            part="canvas"
            role="img"
            tabindex=${this.disabled ? '-1' : '0'}
            aria-label=${ariaLabel}
            style=${this.penColor ? `color: ${this.penColor}` : nothing}
            @pointerdown=${this._onPointerDown}
            @pointermove=${this._onPointerMove}
            @pointerup=${this._onPointerUp}
            @pointercancel=${this._onPointerUp}
          ></canvas>
          <div
            class="pad__hint ${signed ? 'pad__hint--hidden' : ''}"
            part="placeholder"
            aria-hidden="true"
          >
            <span class="pad__hint-line"></span>
            <span class="pad__hint-text">Sign here</span>
          </div>
          ${
            signed && !this.readonly && !this.disabled
              ? html`
            <arc-icon-button
              class="pad__clear"
              part="clear"
              name="x"
              size="xs"
              variant="ghost"
              label="Clear signature"
              @click=${this._onClearClick}
            ></arc-icon-button>
          `
              : ''
          }
        </div>
      </div>
    `;
  }
}
