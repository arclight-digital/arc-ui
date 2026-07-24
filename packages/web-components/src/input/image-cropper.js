import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

const MIN_SIZE = 32;
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

/**
 * Crop-before-upload control with a draggable, resizable crop rectangle, aspect-ratio locking,
 * zoom, and canvas export at natural image resolution.
 *
 * Crop-before-upload for avatar/media flows. The crop rect lives in stage coordinates; zoom scales
 * the letterboxed image around its center underneath. `getCroppedBlob()`/`getCroppedDataUrl()`
 * require `src` to be same-origin or CORS-enabled — a tainted canvas throws with a clear message.
 *
 * @tag arc-image-cropper
 * @prop {string} src - Image URL, object URL, or data URL to crop. Must be same-origin or CORS-enabled for canvas export.
 * @prop {number} height - Fixed stage height in pixels. The image is letterboxed to fit.
 * @prop {number} aspect - Crop aspect ratio as width/height (e.g. `1`, `16/9`). `0` allows free-form cropping.
 * @prop {number} zoom - Image zoom factor, clamped to 1-4. Scales the image around its center; also settable via the built-in slider.
 * @fires arc-crop-change - Fired when the crop changes (drag, resize, keyboard, zoom, stage resize). `event.detail` is `{ x, y, width, height }` in natural image pixels, debounced to animation frames.
 * @csspart stage
 * @csspart image
 * @csspart skeleton
 * @csspart error
 * @csspart crop
 * @csspart handle
 * @csspart zoom
 */
export class ArcImageCropper extends LitElement {
  static properties = {
    src:    { type: String, reflect: true },
    height: { type: Number, reflect: true },
    aspect: { type: Number, reflect: true },
    zoom:   { type: Number, reflect: true },
    _loaded:   { state: true },
    _errored:  { state: true },
    _rect:     { state: true },
    _stageW:   { state: true },
    _announce: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; font-family: var(--font-body); }

      .stage {
        position: relative;
        width: 100%;
        overflow: hidden;
        background: var(--surface-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        user-select: none;
        -webkit-user-select: none;
      }

      .stage__img {
        position: absolute;
        display: block;
        max-width: none;
        -webkit-user-drag: none;
        pointer-events: none;
      }

      .stage__img--hidden { visibility: hidden; }

      @keyframes shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .skeleton {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          var(--surface-overlay) 25%,
          rgba(var(--accent-primary-rgb), 0.04) 37%,
          var(--surface-overlay) 63%
        );
        background-size: 200% 100%;
        animation: shimmer 1.8s ease-in-out infinite;
      }

      .error {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-md);
        text-align: center;
        font-size: var(--text-sm);
        color: var(--color-error);
      }

      /* Darkens everything outside the crop rect; sits under the rect. */
      .shade {
        position: absolute;
        pointer-events: none;
        box-shadow: 0 0 0 9999px rgba(var(--black-rgb), 0.5);
      }

      .crop {
        position: absolute;
        box-sizing: border-box;
        border: 1px solid var(--text-primary);
        cursor: move;
        touch-action: none;
      }

      .crop:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      .guide {
        position: absolute;
        background: rgba(var(--white-rgb), 0.25);
        pointer-events: none;
      }

      .guide--v { top: 0; bottom: 0; width: 1px; }
      .guide--h { left: 0; right: 0; height: 1px; }

      .handle {
        position: absolute;
        width: var(--touch-min);
        height: var(--touch-min);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
        touch-action: none;
      }

      .handle::after {
        content: '';
        width: 8px;
        height: 8px;
        box-sizing: border-box;
        background: var(--surface-raised);
        border: 1px solid var(--border-bright);
      }

      .handle[data-handle="nw"] { left: 0;    top: 0;    cursor: nwse-resize; }
      .handle[data-handle="n"]  { left: 50%;  top: 0;    cursor: ns-resize; }
      .handle[data-handle="ne"] { left: 100%; top: 0;    cursor: nesw-resize; }
      .handle[data-handle="e"]  { left: 100%; top: 50%;  cursor: ew-resize; }
      .handle[data-handle="se"] { left: 100%; top: 100%; cursor: nwse-resize; }
      .handle[data-handle="s"]  { left: 50%;  top: 100%; cursor: ns-resize; }
      .handle[data-handle="sw"] { left: 0;    top: 100%; cursor: nesw-resize; }
      .handle[data-handle="w"]  { left: 0;    top: 50%;  cursor: ew-resize; }

      .zoom {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-top: var(--space-sm);
      }

      .zoom__label {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        user-select: none;
      }

      .zoom__value {
        font-family: var(--font-mono);
        font-size: var(--code-size);
        font-weight: 600;
        color: var(--interactive);
        min-width: 5ch;
        text-align: right;
      }

      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        flex: 1;
        height: 6px;
        border-radius: var(--radius-full);
        background: linear-gradient(
          to right,
          var(--interactive) 0%,
          var(--interactive) var(--fill-percent, 0%),
          var(--border-default) var(--fill-percent, 0%),
          var(--border-default) 100%
        );
        outline: none;
        cursor: pointer;
        margin: 0;
        padding: 0;
      }

      input[type="range"]:disabled { cursor: default; opacity: 0.5; }

      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: var(--radius-full);
        background: var(--interactive);
        border: 2px solid var(--surface-primary);
        cursor: pointer;
        transition: box-shadow var(--transition-fast);
        box-shadow: 0 0 6px rgba(var(--interactive-rgb), 0.3);
      }

      input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: var(--radius-full);
        background: var(--interactive);
        border: 2px solid var(--surface-primary);
        cursor: pointer;
        transition: box-shadow var(--transition-fast);
        box-shadow: 0 0 6px rgba(var(--interactive-rgb), 0.3);
      }

      input[type="range"]::-moz-range-track {
        height: 6px;
        border-radius: var(--radius-full);
        background: transparent;
      }

      input[type="range"]:focus-visible { outline: none; }

      input[type="range"]:focus-visible::-webkit-slider-thumb {
        box-shadow:
          0 0 0 1px rgba(var(--interactive-rgb), 0.2),
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 20px rgba(var(--interactive-rgb), 0.25);
      }

      input[type="range"]:focus-visible::-moz-range-thumb {
        box-shadow:
          0 0 0 1px rgba(var(--interactive-rgb), 0.2),
          0 0 8px rgba(var(--interactive-rgb), 0.5),
          0 0 20px rgba(var(--interactive-rgb), 0.25);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
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
    this.src = '';
    this.height = 320;
    this.aspect = 0;
    this.zoom = 1;
    this._loaded = false;
    this._errored = false;
    this._rect = null;
    this._stageW = 0;
    this._announce = '';
    this._natW = 0;
    this._natH = 0;
    this._drag = null;
    this._changeRaf = 0;
    this._resizeObserver = null;
    this._onPointerMoveBound = this._onPointerMove.bind(this);
    this._onPointerUpBound = this._onPointerUp.bind(this);
  }

  firstUpdated() {
    const stage = this.shadowRoot.querySelector('.stage');
    this._resizeObserver = new ResizeObserver(() => {
      this._stageW = stage.clientWidth;
      if (this._rect) {
        this._rect = this._clampRect(this._rect);
        this._scheduleChange();
      }
    });
    this._resizeObserver.observe(stage);
    this._stageW = stage.clientWidth;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    if (this._changeRaf) cancelAnimationFrame(this._changeRaf);
    this._changeRaf = 0;
    window.removeEventListener('pointermove', this._onPointerMoveBound);
    window.removeEventListener('pointerup', this._onPointerUpBound);
  }

  willUpdate(changed) {
    if (changed.has('src') && changed.get('src') !== undefined) {
      this._loaded = false;
      this._errored = false;
      this._rect = null;
      this._natW = 0;
      this._natH = 0;
    }
  }

  updated(changed) {
    if (!this._loaded || !this._rect) return;
    if (changed.has('aspect') && this._aspect > 0) {
      const r = this._rect;
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      const h = r.width / this._aspect;
      this._rect = this._clampRect({ x: cx - r.width / 2, y: cy - h / 2, width: r.width, height: h });
      this._scheduleChange();
    } else if (changed.has('zoom') || changed.has('height')) {
      this._rect = this._clampRect(this._rect);
      this._scheduleChange();
    }
  }

  /* ---- Geometry ---- */

  get _aspect() {
    const a = Number(this.aspect);
    return Number.isFinite(a) && a > 0 ? a : 0;
  }

  get _zoomClamped() {
    const z = Number(this.zoom);
    return Number.isFinite(z) ? Math.min(4, Math.max(1, z)) : 1;
  }

  /** Letterbox + zoom geometry in stage coordinates, or null before load/measure. */
  get _geom() {
    if (!this._loaded || !this._stageW || !this._natW || !this._natH) return null;
    const stageW = this._stageW;
    const stageH = this.height;
    const baseScale = Math.min(stageW / this._natW, stageH / this._natH);
    const scale = baseScale * this._zoomClamped;
    const dispW = this._natW * scale;
    const dispH = this._natH * scale;
    const imgX = (stageW - dispW) / 2;
    const imgY = (stageH - dispH) / 2;
    return {
      scale, imgX, imgY, dispW, dispH,
      bx: Math.max(0, imgX),
      by: Math.max(0, imgY),
      bRight: Math.min(stageW, imgX + dispW),
      bBottom: Math.min(stageH, imgY + dispH),
    };
  }

  _initRect() {
    const g = this._geom;
    if (!g) return;
    const bw = g.bRight - g.bx;
    const bh = g.bBottom - g.by;
    let w = bw * 0.8;
    let h = bh * 0.8;
    if (this._aspect > 0) {
      if (w / this._aspect > h) w = h * this._aspect;
      else h = w / this._aspect;
    }
    this._rect = this._clampRect({
      x: g.bx + (bw - w) / 2,
      y: g.by + (bh - h) / 2,
      width: w,
      height: h,
    });
  }

  _clampRect(r) {
    const g = this._geom;
    if (!g) return r;
    const bw = g.bRight - g.bx;
    const bh = g.bBottom - g.by;
    let { x, y, width: w, height: h } = r;
    if (this._aspect > 0) {
      if (w > bw) { w = bw; h = w / this._aspect; }
      if (h > bh) { h = bh; w = h * this._aspect; }
      const minW = Math.min(Math.max(MIN_SIZE, MIN_SIZE * this._aspect), bw, bh * this._aspect);
      if (w < minW) { w = minW; h = w / this._aspect; }
    } else {
      w = Math.max(Math.min(MIN_SIZE, bw), Math.min(w, bw));
      h = Math.max(Math.min(MIN_SIZE, bh), Math.min(h, bh));
    }
    x = Math.max(g.bx, Math.min(x, g.bRight - w));
    y = Math.max(g.by, Math.min(y, g.bBottom - h));
    return { x, y, width: w, height: h };
  }

  /* ---- Pointer interaction ---- */

  _onCropPointerDown(e) {
    if (!this._loaded || !this._rect) return;
    e.preventDefault();
    const mode = e.target.dataset?.handle || 'move';
    this._drag = { mode, startX: e.clientX, startY: e.clientY, rect: { ...this._rect } };
    e.target.setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', this._onPointerMoveBound);
    window.addEventListener('pointerup', this._onPointerUpBound);
  }

  _onPointerMove(e) {
    const d = this._drag;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (d.mode === 'move') {
      this._rect = this._clampRect({ ...d.rect, x: d.rect.x + dx, y: d.rect.y + dy });
    } else {
      this._rect = this._resizeRect(d.rect, d.mode, dx, dy);
    }
    this._scheduleChange();
  }

  _onPointerUp() {
    this._drag = null;
    window.removeEventListener('pointermove', this._onPointerMoveBound);
    window.removeEventListener('pointerup', this._onPointerUpBound);
  }

  _resizeRect(r0, hd, dx, dy) {
    const g = this._geom;
    if (!g) return r0;
    const hasW = hd.includes('w');
    const hasE = hd.includes('e');
    const hasN = hd.includes('n');
    const hasS = hd.includes('s');
    const a = this._aspect;

    if (!(a > 0)) {
      let left = r0.x;
      let right = r0.x + r0.width;
      let top = r0.y;
      let bottom = r0.y + r0.height;
      const minW = Math.min(MIN_SIZE, g.bRight - g.bx);
      const minH = Math.min(MIN_SIZE, g.bBottom - g.by);
      if (hasW) left = Math.max(g.bx, Math.min(r0.x + dx, right - minW));
      if (hasE) right = Math.max(left + minW, Math.min(right + dx, g.bRight));
      if (hasN) top = Math.max(g.by, Math.min(r0.y + dy, bottom - minH));
      if (hasS) bottom = Math.max(top + minH, Math.min(bottom + dy, g.bBottom));
      return { x: left, y: top, width: right - left, height: bottom - top };
    }

    // Aspect-locked: corners and e/w edges are width-driven, n/s edges height-driven.
    if (hasE || hasW) {
      const anchorX = hasW ? r0.x + r0.width : r0.x;
      const anchorY = hasN ? r0.y + r0.height : r0.y;
      let w = r0.width + (hasE ? dx : -dx);
      if (hasN || hasS) {
        w = Math.max(w, (r0.height + (hasS ? dy : -dy)) * a);
      }
      const horizRoom = hasE ? g.bRight - anchorX : anchorX - g.bx;
      let vertRoom;
      const cy = r0.y + r0.height / 2;
      if (hasN || hasS) vertRoom = hasS ? g.bBottom - anchorY : anchorY - g.by;
      else vertRoom = 2 * Math.min(cy - g.by, g.bBottom - cy);
      const maxW = Math.min(horizRoom, vertRoom * a);
      const minW = Math.min(Math.max(MIN_SIZE, MIN_SIZE * a), maxW);
      w = Math.max(minW, Math.min(w, maxW));
      const h = w / a;
      const x = hasW ? anchorX - w : anchorX;
      let y;
      if (hasN) y = anchorY - h;
      else if (hasS) y = anchorY;
      else y = Math.max(g.by, Math.min(cy - h / 2, g.bBottom - h));
      return { x, y, width: w, height: h };
    }

    // Pure n/s edges with aspect: horizontal center fixed.
    const anchorY = hasN ? r0.y + r0.height : r0.y;
    let h = r0.height + (hasS ? dy : -dy);
    const vertRoom = hasS ? g.bBottom - anchorY : anchorY - g.by;
    const cx = r0.x + r0.width / 2;
    const horizRoom = 2 * Math.min(cx - g.bx, g.bRight - cx);
    const maxH = Math.min(vertRoom, horizRoom / a);
    const minH = Math.min(Math.max(MIN_SIZE, MIN_SIZE / a), maxH);
    h = Math.max(minH, Math.min(h, maxH));
    const w = h * a;
    const y = hasN ? anchorY - h : anchorY;
    const x = Math.max(g.bx, Math.min(cx - w / 2, g.bRight - w));
    return { x, y, width: w, height: h };
  }

  /* ---- Keyboard interaction ---- */

  _onCropKeydown(e) {
    if (!ARROW_KEYS.includes(e.key) || !this._rect) return;
    e.preventDefault();
    const step = 2;
    const r = { ...this._rect };
    if (e.shiftKey) {
      // Resize from the bottom-right, top-left anchored.
      let dw = 0;
      let dh = 0;
      if (e.key === 'ArrowRight') dw = step;
      else if (e.key === 'ArrowLeft') dw = -step;
      else if (e.key === 'ArrowDown') dh = step;
      else dh = -step;
      if (this._aspect > 0) {
        if (dw !== 0) dh = dw / this._aspect;
        else dw = dh * this._aspect;
      }
      this._rect = this._resizeFromTopLeft({ ...r, width: r.width + dw, height: r.height + dh });
    } else {
      if (e.key === 'ArrowLeft') r.x -= step;
      else if (e.key === 'ArrowRight') r.x += step;
      else if (e.key === 'ArrowUp') r.y -= step;
      else r.y += step;
      this._rect = this._clampRect(r);
    }
    this._scheduleChange();
  }

  _resizeFromTopLeft(r) {
    const g = this._geom;
    if (!g) return r;
    const maxW = g.bRight - r.x;
    const maxH = g.bBottom - r.y;
    let { width: w, height: h } = r;
    if (this._aspect > 0) {
      w = Math.min(w, maxW, maxH * this._aspect);
      w = Math.max(w, Math.min(Math.max(MIN_SIZE, MIN_SIZE * this._aspect), maxW, maxH * this._aspect));
      h = w / this._aspect;
    } else {
      w = Math.max(Math.min(MIN_SIZE, maxW), Math.min(w, maxW));
      h = Math.max(Math.min(MIN_SIZE, maxH), Math.min(h, maxH));
    }
    return { x: r.x, y: r.y, width: w, height: h };
  }

  _onCropKeyup(e) {
    if (!ARROW_KEYS.includes(e.key)) return;
    const crop = this.getCrop();
    if (crop) {
      this._announce = `Crop ${crop.width} by ${crop.height} pixels at ${crop.x}, ${crop.y}`;
    }
  }

  /* ---- Zoom ---- */

  _onZoomInput(e) {
    this.zoom = Number(e.target.value);
  }

  /* ---- Image lifecycle ---- */

  _onImgLoad(e) {
    this._natW = e.target.naturalWidth;
    this._natH = e.target.naturalHeight;
    this._loaded = true;
    this._errored = false;
    this._stageW = this.shadowRoot.querySelector('.stage')?.clientWidth || this._stageW;
    this._initRect();
    this._scheduleChange();
  }

  _onImgError() {
    this._errored = true;
    this._loaded = false;
    this._rect = null;
  }

  /* ---- Public API ---- */

  /** Current crop in natural image pixels: { x, y, width, height }, or null before load. */
  getCrop() {
    const g = this._geom;
    const r = this._rect;
    if (!g || !r) return null;
    const clampX = (v) => Math.max(0, Math.min(v, this._natW));
    const clampY = (v) => Math.max(0, Math.min(v, this._natH));
    const x = clampX((r.x - g.imgX) / g.scale);
    const y = clampY((r.y - g.imgY) / g.scale);
    const right = clampX((r.x + r.width - g.imgX) / g.scale);
    const bottom = clampY((r.y + r.height - g.imgY) / g.scale);
    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.max(1, Math.round(right - x)),
      height: Math.max(1, Math.round(bottom - y)),
    };
  }

  _drawCropCanvas() {
    const crop = this.getCrop();
    if (!crop) {
      throw new Error('arc-image-cropper: no image loaded — set `src` and wait for it to load before exporting.');
    }
    const img = this.shadowRoot.querySelector('.stage__img');
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    canvas.getContext('2d').drawImage(
      img,
      crop.x, crop.y, crop.width, crop.height,
      0, 0, crop.width, crop.height
    );
    return canvas;
  }

  _corsError(err) {
    return new Error(
      `arc-image-cropper: canvas export failed — \`src\` must be same-origin or served with CORS headers (a cross-origin image taints the canvas). Original error: ${err.message}`
    );
  }

  /** Export the crop as a Blob at natural resolution. */
  async getCroppedBlob(type = 'image/png', quality) {
    const canvas = this._drawCropCanvas();
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => blob
            ? resolve(blob)
            : reject(new Error('arc-image-cropper: canvas.toBlob returned null — the crop could not be encoded.')),
          type,
          quality
        );
      } catch (err) {
        reject(this._corsError(err));
      }
    });
  }

  /** Export the crop as a data URL at natural resolution. */
  async getCroppedDataUrl(type = 'image/png', quality) {
    const canvas = this._drawCropCanvas();
    try {
      return canvas.toDataURL(type, quality);
    } catch (err) {
      throw this._corsError(err);
    }
  }

  /* ---- Events ---- */

  _scheduleChange() {
    if (this._changeRaf) return;
    this._changeRaf = requestAnimationFrame(() => {
      this._changeRaf = 0;
      const crop = this.getCrop();
      if (!crop) return;
      this.dispatchEvent(new CustomEvent('arc-crop-change', {
        detail: crop,
        bubbles: true,
        composed: true,
      }));
    });
  }

  /* ---- Render ---- */

  render() {
    const g = this._geom;
    const r = this._rect;
    const zoom = this._zoomClamped;
    const fill = ((zoom - 1) / 3) * 100;
    const rectStyle = r
      ? `left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px`
      : '';

    return html`
      <div class="stage" part="stage" style="height:${this.height}px">
        ${this.src && !this._errored ? html`
          <img
            class="stage__img ${this._loaded && g ? '' : 'stage__img--hidden'}"
            part="image"
            src=${this.src}
            alt=""
            style=${g ? `left:${g.imgX}px;top:${g.imgY}px;width:${g.dispW}px;height:${g.dispH}px` : ''}
            @load=${this._onImgLoad}
            @error=${this._onImgError}
          />
        ` : ''}

        ${this.src && !this._loaded && !this._errored ? html`
          <div class="skeleton" part="skeleton" role="status" aria-label="Loading image" aria-busy="true"></div>
        ` : ''}

        ${this._errored ? html`
          <div class="error" part="error" role="alert">Image failed to load.</div>
        ` : ''}

        ${g && r ? html`
          <div class="shade" style=${rectStyle}></div>
          <div
            class="crop"
            part="crop"
            style=${rectStyle}
            tabindex="0"
            role="group"
            aria-roledescription="crop area"
            aria-label="Crop area — use arrow keys to move, hold Shift to resize"
            @pointerdown=${this._onCropPointerDown}
            @keydown=${this._onCropKeydown}
            @keyup=${this._onCropKeyup}
          >
            <div class="guide guide--v" style="left:33.333%"></div>
            <div class="guide guide--v" style="left:66.667%"></div>
            <div class="guide guide--h" style="top:33.333%"></div>
            <div class="guide guide--h" style="top:66.667%"></div>
            ${HANDLES.map((hd) => html`
              <div class="handle" part="handle" data-handle=${hd} aria-hidden="true"></div>
            `)}
          </div>
        ` : ''}
      </div>

      <div class="zoom" part="zoom">
        <label class="zoom__label" for="zoom-range">Zoom</label>
        <input
          id="zoom-range"
          type="range"
          min="1"
          max="4"
          step="0.01"
          .value=${String(zoom)}
          ?disabled=${!this._loaded}
          aria-label="Zoom"
          aria-valuemin="1"
          aria-valuemax="4"
          aria-valuenow=${zoom}
          style="--fill-percent: ${fill}%"
          @input=${this._onZoomInput}
        />
        <span class="zoom__value">${zoom.toFixed(2)}×</span>
      </div>

      <div class="sr-only" aria-live="polite">${this._announce}</div>
    `;
  }
}
