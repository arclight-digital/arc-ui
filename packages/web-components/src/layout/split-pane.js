import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, num, oneOf } from '../shared/props.js';

/**
 * Resizable split layout with two panes.
 *
 * @tag arc-split-pane
 * @prop {'horizontal' | 'vertical'} orientation - Controls the split direction. Horizontal places panes side by side with a vertical divider. Vertical stacks panes top and bottom with a horizontal divider.
 * @prop {number} ratio - The proportion of space allocated to the primary pane, clamped to
 *   `minRatio`..`maxRatio` on every path. The drag handle always honoured those bounds;
 *   assigning `ratio` from script used to bypass them entirely. From 0 to 1. A value of 0.4 gives the primary pane 40% of the available width (or height in vertical mode).
 * @prop {number} minRatio - Minimum allowed ratio. The divider cannot be dragged below this value, preventing the primary pane from collapsing.
 * @prop {number} maxRatio - Maximum allowed ratio. The divider cannot be dragged above this value, preventing the secondary pane from collapsing.
 * @prop {string} label - Accessible name for the divider, applied as `aria-label`. Defaults to "Resize panes".
 * @fires {CustomEvent<{ value: number, ratio: number }>} arc-resize - Fired on every step of a divider drag and on every keyboard step, with the new ratio on both `detail.value` and `detail.ratio`.
 * @slot primary
 * @slot secondary
 * @csspart base
 * @csspart primary
 * @csspart handle
 * @csspart secondary
 */
export class ArcSplitPane extends DeclaredPropsMixin(LitElement) {
  static properties = {
    orientation: oneOf(['horizontal', 'vertical']),
    ratio: num({ default: 0.5, min: 'minRatio', max: 'maxRatio', clamp: 'toRange' }),
    minRatio: num({ default: 0.15, min: 0, max: 1, clamp: 'toRange', attribute: 'min-ratio' }),
    maxRatio: num({ default: 0.85, min: 0, max: 1, clamp: 'toRange', attribute: 'max-ratio' }),
    label: { type: String },
  };

  /** Keyboard step, and the larger Shift step — the same 5-and-20 as arc-resizable. */
  static STEP = 0.05;
  static STEP_LARGE = 0.2;

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        height: 100%;
      }

      .split-pane {
        display: flex;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }

      :host([orientation='vertical']) .split-pane {
        flex-direction: column;
      }

      .split-pane__primary,
      .split-pane__secondary {
        overflow: auto;
        min-width: 0;
        min-height: 0;
      }

      .split-pane__secondary {
        flex: 1;
      }

      .split-pane__handle {
        flex-shrink: 0;
        background: var(--divider);
        transition: background var(--transition-fast);
        user-select: none;
        touch-action: none;
      }

      .split-pane__handle:hover,
      .split-pane__handle--dragging {
        background: var(--border-bright);
      }

      /* The handle is a tab stop now (finding #33), so it needs a focus ring —
         a 4px bar with no visible focus is a stop a keyboard user cannot see. */
      .split-pane__handle:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
        background: var(--interactive);
      }

      :host([orientation='horizontal']) .split-pane__handle {
        width: 4px;
        cursor: col-resize;
      }

      :host([orientation='vertical']) .split-pane__handle {
        height: 4px;
        cursor: row-resize;
      }

      :host .split-pane--dragging {
        user-select: none;
      }
    `,
  ];

  constructor() {
    super();
    this.label = '';
    this._dragging = false;
  }

  _clamp(value) {
    return Math.min(this.maxRatio, Math.max(this.minRatio, value));
  }

  /** Move the divider, and announce it only if it actually moved. */
  _setRatio(next) {
    const clamped = this._clamp(next);
    if (clamped === this.ratio) return;
    this.ratio = clamped;
    this.dispatchEvent(
      new CustomEvent('arc-resize', {
        detail: { value: this.ratio, ratio: this.ratio },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * The drag, on pointer events (finding #34).
   *
   * It was wired to mousedown/mousemove/mouseup, which touch and pen never
   * produce — so the divider could not be moved at all on a tablet. Every other
   * draggable control in the library (arc-knob, arc-waveform, arc-image-compare,
   * arc-signature-pad, arc-resizable) was already on pointer events; this was
   * the only one that was not.
   *
   * Capture on the handle rather than listeners on `window`, matching
   * arc-resizable: the capture follows the pointer outside the element without a
   * second teardown path that has to pair correctly with disconnect.
   */
  _onPointerDown(e) {
    e.preventDefault();
    this._dragging = true;
    const container = this.shadowRoot.querySelector('.split-pane');
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);

    const onMove = (ev) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      // arc-resize fires from here, per move — its own docs say "fired during
      // divider drag" and the dispatch used to sit in the mouseup handler, so a
      // consumer syncing a layout live got nothing until the user let go
      // (finding #35).
      this._setRatio(
        this.orientation === 'horizontal'
          ? (ev.clientX - rect.left) / rect.width
          : (ev.clientY - rect.top) / rect.height,
      );
    };

    const onUp = (ev) => {
      this._dragging = false;
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      this.requestUpdate();
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
    this.requestUpdate();
  }

  /**
   * Arrow keys move the divider (finding #33).
   *
   * The handle was a bare `<div>` with a single `@mousedown` — no role, no tab
   * stop, no aria-value*, and no keydown handler anywhere in the file — so a
   * keyboard user could not move it and a screen reader had nothing to
   * announce. `arc-resizable` solved all of it one file away.
   */
  _onKeydown(e) {
    const step = e.shiftKey ? ArcSplitPane.STEP_LARGE : ArcSplitPane.STEP;
    const inline = this.orientation === 'horizontal';
    let delta;

    if (e.key === (inline ? 'ArrowRight' : 'ArrowDown')) delta = step;
    else if (e.key === (inline ? 'ArrowLeft' : 'ArrowUp')) delta = -step;
    else if (e.key === 'Home') delta = this.minRatio - this.ratio;
    else if (e.key === 'End') delta = this.maxRatio - this.ratio;
    else return;

    // Claimed whether or not the divider can still move that way, or the page
    // scrolls under a separator that correctly refused.
    e.preventDefault();
    this._setRatio(this.ratio + delta);
  }

  render() {
    const primarySize = `${this.ratio * 100}%`;
    const draggingClass = this._dragging ? 'split-pane--dragging' : '';
    const handleDragging = this._dragging ? 'split-pane__handle--dragging' : '';

    return html`
      <div class="split-pane ${draggingClass}" part="base">
        <div
          class="split-pane__primary"
          part="primary"
          style="${
            this.orientation === 'horizontal' ? `width: ${primarySize}` : `height: ${primarySize}`
          }"
        >
          <slot name="primary"></slot>
        </div>
        <div
          class="split-pane__handle ${handleDragging}"
          part="handle"
          role="separator"
          tabindex="0"
          aria-orientation=${this.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
          aria-valuenow=${Math.round(this.ratio * 100)}
          aria-valuemin=${Math.round(this.minRatio * 100)}
          aria-valuemax=${Math.round(this.maxRatio * 100)}
          aria-label=${this.label || 'Resize panes'}
          @pointerdown=${this._onPointerDown}
          @keydown=${this._onKeydown}
        ></div>
        <div class="split-pane__secondary" part="secondary">
          <slot name="secondary"></slot>
        </div>
      </div>
    `;
  }
}
