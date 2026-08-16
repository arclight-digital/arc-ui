import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf, num } from '../shared/props.js';

/**
 * Before/after image comparison: two layered images with a draggable divider revealing one over
 * the other. The `before` layer sits on top, clipped to the region between the start edge and the
 * divider; dragging the handle (or pressing arrow keys on it) moves the reveal line.
 *
 * The clip is pure CSS driven by a private custom property, so the component server-renders at
 * its initial position with no client-side measurement.
 *
 * `orientation` is named for the axis the divider *moves* along: `horizontal` (the default)
 * slides a vertical divider line left and right; `vertical` slides a horizontal divider line up
 * and down.
 *
 * The position axis is logical: 0 is the inline-start edge (left in LTR, right in RTL) for
 * horizontal orientation, and the block-start edge (top) for vertical. Before/after has no
 * inherent screen direction — unlike an audio timeline there is no convention fixing it — so the
 * control mirrors with the document like the rest of the reading order. Arrow keys follow the
 * divider's visible motion.
 *
 * @tag arc-image-compare
 * @arc-group marketing
 * @prop {number} position - Divider position as a percentage, 0 to 100. 0 shows only the after
 *   layer, 100 only the before layer. Clamped, reflected, and updated as the user drags.
 * @prop {'horizontal' | 'vertical'} orientation - Axis the divider moves along. `horizontal`
 *   (default) moves a vertical divider line left-right; `vertical` moves a horizontal line
 *   up-down.
 * @prop {string} beforeLabel - Optional caption for the before layer, rendered as a floating
 *   chip in the start corner.
 * @prop {string} afterLabel - Optional caption for the after layer, rendered as a floating chip
 *   in the end corner.
 * @prop {string} label - Accessible name for the divider handle, announced as the slider label.
 * @fires {CustomEvent<{ value: number }>} arc-input - Fired continuously while dragging (every
 *   pointer move) and on each keyboard nudge. `value` is the position, 0-100. Use for live
 *   readouts.
 * @fires {CustomEvent<{ value: number }>} arc-change - Fired once when the position commits: on
 *   pointer release, or with each keyboard nudge. Use for persisting the position.
 * @slot before - The "before" image (`<img>` or `<arc-image>`), revealed between the start edge
 *   and the divider.
 * @slot after - The "after" image (`<img>` or `<arc-image>`). Sits underneath and sizes the
 *   component.
 * @csspart container - The clipping frame wrapping both layers.
 * @csspart before - The clipped before layer.
 * @csspart after - The base after layer.
 * @csspart divider - The hairline divider.
 * @csspart handle - The circular grab handle (the focusable slider).
 * @csspart label-before - The before caption chip.
 * @csspart label-after - The after caption chip.
 */
export class ArcImageCompare extends DeclaredPropsMixin(LitElement) {
  static properties = {
    // "Divider position as a percentage, 0 to 100". The component clamped on
    // every path it owned; declaring it means the property path is covered
    // too, and conformance derives the assertion (finding #70).
    position: num({ default: 50, min: 0, max: 100, clamp: 'toRange', reflect: true }),
    orientation: oneOf(['horizontal', 'vertical']),
    beforeLabel: { type: String, attribute: 'before-label' },
    afterLabel: { type: String, attribute: 'after-label' },
    label: { type: String },
    _dragging: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .compare {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-md);
        cursor: ew-resize;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }

      :host([orientation="vertical"]) .compare { cursor: ns-resize; }

      /* The after layer sits in normal flow and sizes the component. */
      .compare__after ::slotted(*) {
        display: block;
        inline-size: 100%;
      }

      .compare__before {
        position: absolute;
        inset: 0;
        /* Revealed from the inline-start edge to the divider. inset() offsets
           are physical, so the RTL mirror is a second rule rather than a
           logical property. */
        clip-path: inset(0 calc(100% - var(--_pos, 50) * 1%) 0 0);
      }

      :host(:dir(rtl)) .compare__before {
        clip-path: inset(0 0 0 calc(100% - var(--_pos, 50) * 1%));
      }

      /* After the RTL rule on purpose: equal specificity, so source order lets
         vertical win for a vertical compare in an RTL document (the block axis
         does not mirror). */
      :host([orientation="vertical"]) .compare__before {
        clip-path: inset(0 0 calc(100% - var(--_pos, 50) * 1%) 0);
      }

      .compare__before ::slotted(*) {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }

      /* The whole surface is one gesture target; a native image drag would
         steal the pointer mid-gesture. */
      ::slotted(*) {
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
      }

      /* Divider: a neutral hairline that brightens under the hand. */
      .compare__divider {
        position: absolute;
        z-index: 2;
        inset-block: 0;
        inset-inline-start: calc(var(--_pos, 50) * 1%);
        inline-size: 2px;
        margin-inline-start: -1px;
        background: var(--border-bright);
        transition: background var(--transition-fast), box-shadow var(--transition-fast);
      }

      :host([orientation="vertical"]) .compare__divider {
        inset-inline: 0;
        inset-block-start: calc(var(--_pos, 50) * 1%);
        inset-block-end: auto;
        inline-size: auto;
        block-size: 2px;
        margin-inline-start: 0;
        margin-block-start: -1px;
      }

      .compare:hover .compare__divider,
      .compare--dragging .compare__divider {
        background: var(--interactive);
        box-shadow: 0 0 8px rgba(var(--interactive-rgb), 0.4);
      }

      .compare__handle {
        position: absolute;
        /* Physical centering within the divider is symmetric, so it needs no
           logical mirror. */
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 32px;
        block-size: 32px;
        border-radius: var(--radius-full);
        background: var(--surface-primary);
        border: 1px solid var(--border-bright);
        color: var(--text-secondary);
        cursor: inherit;
        box-shadow: var(--shadow-sm);
        transition: box-shadow var(--transition-fast),
                    border-color var(--transition-fast),
                    color var(--transition-fast);
      }

      .compare__handle svg {
        inline-size: 14px;
        block-size: 14px;
      }

      :host([orientation="vertical"]) .compare__handle svg {
        transform: rotate(90deg);
      }

      .compare:hover .compare__handle,
      .compare--dragging .compare__handle {
        border-color: var(--interactive);
        color: var(--text-primary);
        box-shadow: var(--glow-sm);
      }

      .compare__handle:focus-visible {
        outline: none;
        border-color: var(--interactive);
        box-shadow: var(--focus-ring), var(--glow-sm);
      }

      /* Caption chips: muted surface, floating clear of the divider's path. */
      .compare__chip {
        position: absolute;
        z-index: 3;
        inset-block-start: var(--space-sm);
        padding: var(--space-xs) var(--space-md);
        border-radius: var(--radius-full);
        background: var(--surface-overlay);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        letter-spacing: 1px;
        text-transform: uppercase;
        pointer-events: none;
        user-select: none;
      }

      .compare__chip--before { inset-inline-start: var(--space-sm); }
      .compare__chip--after  { inset-inline-end: var(--space-sm); }

      /* Vertically the regions are top/bottom, so the after chip moves to the
         bottom corner instead of the far side. */
      :host([orientation="vertical"]) .compare__chip--after {
        inset-inline-end: auto;
        inset-inline-start: var(--space-sm);
        inset-block-start: auto;
        inset-block-end: var(--space-sm);
      }

      @media (prefers-reduced-motion: reduce) {
        .compare__divider,
        .compare__handle { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.beforeLabel = '';
    this.afterLabel = '';
    this.label = '';
    this._dragging = false;
    this._onWindowPointerMove = this._onWindowPointerMove.bind(this);
    this._onWindowPointerUp = this._onWindowPointerUp.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._endDrag();
  }

  willUpdate(changed) {
    if (changed.has('position')) {
      this.position = this._clamp(this.position);
    }
  }

  get _vertical() {
    return this.orientation === 'vertical';
  }

  /** Clamp to 0-100; anything non-numeric falls back to the centered default. */
  _clamp(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 50;
    return Math.min(100, Math.max(0, n));
  }

  _isRTL() {
    return getComputedStyle(this).direction === 'rtl';
  }

  _emitInput() {
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: this.position },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.position },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ---- Pointer dragging ---- */

  _onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this._dragging = true;
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
    this._endDrag();
    // Releasing the pointer is the commit.
    this._emitChange();
  }

  _endDrag() {
    this._dragging = false;
    window.removeEventListener('pointermove', this._onWindowPointerMove);
    window.removeEventListener('pointerup', this._onWindowPointerUp);
    window.removeEventListener('pointercancel', this._onWindowPointerUp);
  }

  _seekFromPointer(e) {
    const frame = this.renderRoot.querySelector('.compare');
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    let fraction;
    if (this._vertical) {
      if (!rect.height) return;
      fraction = (e.clientY - rect.top) / rect.height;
    } else {
      if (!rect.width) return;
      fraction = (e.clientX - rect.left) / rect.width;
      if (this._isRTL()) fraction = 1 - fraction;
    }
    // Two decimals keeps the reflected attribute readable while the divider
    // still tracks the hand to sub-pixel precision.
    this.position = this._clamp(Math.round(fraction * 10000) / 100);
    this._emitInput();
  }

  /* ---- Keyboard ---- */

  _onKeyDown(e) {
    const step = e.shiftKey ? 10 : 1;
    const vertical = this._vertical;
    // Keys follow the divider's visible motion: horizontally, right/left track
    // the screen (so they swap in RTL) while up still means "more"; vertically,
    // down and right advance the divider down the page.
    const rtl = !vertical && this._isRTL();
    let next = null;
    switch (e.key) {
      case 'ArrowRight':
        next = this.position + (rtl ? -step : step);
        break;
      case 'ArrowLeft':
        next = this.position - (rtl ? -step : step);
        break;
      case 'ArrowUp':
        next = this.position + (vertical ? -step : step);
        break;
      case 'ArrowDown':
        next = this.position - (vertical ? -step : step);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = 100;
        break;
      default:
        return;
    }
    e.preventDefault();
    next = this._clamp(next);
    if (next === this.position) return;
    this.position = next;
    // A key press is edit and commit at once, as a native range input's is.
    this._emitInput();
    this._emitChange();
  }

  render() {
    const pos = this._clamp(this.position);
    return html`
      <div
        class="compare ${this._dragging ? 'compare--dragging' : ''}"
        part="container"
        style="--_pos: ${pos}"
        @pointerdown=${this._onPointerDown}
      >
        <div class="compare__after" part="after">
          <slot name="after"></slot>
        </div>
        <div class="compare__before" part="before">
          <slot name="before"></slot>
        </div>
        ${
          this.beforeLabel
            ? html`
          <span class="compare__chip compare__chip--before" part="label-before">${this.beforeLabel}</span>
        `
            : ''
        }
        ${
          this.afterLabel
            ? html`
          <span class="compare__chip compare__chip--after" part="label-after">${this.afterLabel}</span>
        `
            : ''
        }
        <div class="compare__divider" part="divider">
          <div
            class="compare__handle"
            part="handle"
            role="slider"
            tabindex="0"
            aria-label=${this.label || 'Comparison position'}
            aria-orientation=${this._vertical ? 'vertical' : 'horizontal'}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow=${Math.round(pos)}
            aria-valuetext="${Math.round(pos)}%"
            @keydown=${this._onKeyDown}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m9 8-4 4 4 4" />
              <path d="m15 8 4 4-4 4" />
            </svg>
          </div>
        </div>
      </div>
    `;
  }
}
