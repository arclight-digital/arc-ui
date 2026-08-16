import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf, num } from '../shared/props.js';

/**
 * Resizable panel with drag handle.
 *
 * @tag arc-resizable
 * @status stable
 * @prop {'horizontal' | 'vertical'} direction - Controls which edge the drag handle appears on. Horizontal places the handle on the right edge and resizes width; vertical places it on the bottom edge and resizes height.
 * @prop {number} size - Current size of the panel in pixels. Updated in real time during drag. Maps to the --panel-size CSS custom property.
 * @prop {number} minSize - Minimum allowed size in pixels. The panel cannot be dragged smaller than this value.
 * @prop {number} maxSize - Maximum allowed size in pixels. The panel cannot be dragged larger than this value. Defaults to no limit.
 * @fires {CustomEvent<{ size: number }>} arc-resize - Fired during and after panel resize with { size } detail
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart container
 * @csspart handle
 */
export class ArcResizable extends DeclaredPropsMixin(LitElement) {
  static properties = {
    direction: oneOf(['horizontal', 'vertical']),
    minSize: num({ default: 100, min: 0, clamp: 'toRange', attribute: 'min-size' }),
    maxSize: num({ default: Infinity, attribute: 'max-size' }),
    size: { type: Number },
    _dragging: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
      }

      .container {
        width: 100%;
        height: 100%;
        overflow: auto;
      }

      :host([direction="horizontal"]) .container {
        width: var(--panel-size);
      }

      :host([direction="vertical"]) .container {
        height: var(--panel-size);
      }

      .handle {
        position: absolute;
        z-index: 10;
        flex-shrink: 0;
        background: var(--border-default);
        transition: background var(--transition-fast);
        touch-action: none;
      }

      /* Horizontal: handle on right edge */
      :host([direction="horizontal"]) .handle {
        top: 0;
        inset-inline-end: 0;
        width: 4px;
        height: 100%;
        cursor: col-resize;
      }

      /* Vertical: handle on bottom edge */
      :host([direction="vertical"]) .handle {
        bottom: 0;
        inset-inline-start: 0;
        height: 4px;
        width: 100%;
        cursor: row-resize;
      }

      .handle:hover,
      .handle.active {
        background: var(--interactive);
      }

      .handle:focus-visible {
        outline: none;
        background: var(--interactive);
        box-shadow: var(--interactive-focus);
      }

      /* Expand hit area for easier grabbing */
      .handle::before {
        content: '';
        position: absolute;
      }

      :host([direction="horizontal"]) .handle::before {
        top: 0;
        inset-inline-start: -4px;
        inset-inline-end: -4px;
        bottom: 0;
      }

      :host([direction="vertical"]) .handle::before {
        inset-inline-start: 0;
        top: -4px;
        bottom: -4px;
        inset-inline-end: 0;
      }
    `,
  ];

  constructor() {
    super();
    this.size = 300;
    this._dragging = false;
    this._startPos = 0;
    this._startSize = 0;
  }

  updated(changed) {
    if (changed.has('size') || changed.has('direction')) {
      this.style.setProperty('--panel-size', `${this.size}px`);
    }
  }

  firstUpdated() {
    this.style.setProperty('--panel-size', `${this.size}px`);
  }

  _clamp(val) {
    return Math.min(this.maxSize, Math.max(this.minSize, val));
  }

  _onPointerDown(e) {
    e.preventDefault();
    this._dragging = true;
    this._startPos = this.direction === 'horizontal' ? e.clientX : e.clientY;
    this._startSize = this.size;

    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);

    const onMove = (ev) => {
      const current = this.direction === 'horizontal' ? ev.clientX : ev.clientY;
      const delta = current - this._startPos;
      const newSize = this._clamp(this._startSize + delta);

      if (newSize !== this.size) {
        this.size = newSize;
        this.style.setProperty('--panel-size', `${this.size}px`);

        this.dispatchEvent(
          new CustomEvent('arc-resize', {
            detail: { size: this.size },
            bubbles: true,
            composed: true,
          }),
        );
      }
    };

    const onUp = (ev) => {
      this._dragging = false;
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }

  _onKeydown(e) {
    const step = e.shiftKey ? 20 : 5;
    let newSize = this.size;

    if (this.direction === 'horizontal') {
      if (e.key === 'ArrowRight') newSize += step;
      else if (e.key === 'ArrowLeft') newSize -= step;
      else return;
    } else {
      if (e.key === 'ArrowDown') newSize += step;
      else if (e.key === 'ArrowUp') newSize -= step;
      else return;
    }

    e.preventDefault();
    newSize = this._clamp(newSize);

    if (newSize !== this.size) {
      this.size = newSize;
      this.style.setProperty('--panel-size', `${this.size}px`);

      this.dispatchEvent(
        new CustomEvent('arc-resize', {
          detail: { size: this.size },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  render() {
    return html`
      <div class="container" part="base container">
        <slot></slot>
      </div>
      <div
        class="handle ${this._dragging ? 'active' : ''}"
        part="handle"
        role="separator"
        tabindex="0"
        aria-orientation=${this.direction === 'horizontal' ? 'vertical' : 'horizontal'}
        aria-valuenow=${this.size}
        aria-valuemin=${this.minSize}
        aria-valuemax=${isFinite(this.maxSize) ? this.maxSize : nothing}
        aria-label="Resize handle"
        @pointerdown=${this._onPointerDown}
        @keydown=${this._onKeydown}
      ></div>
    `;
  }
}
