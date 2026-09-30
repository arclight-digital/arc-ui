import { LitElement, html, css, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf, num } from '../shared/props.js';

/**
 * Resizable panel with drag handle.
 *
 * @tag arc-resizable
 * @status stable
 * @prop {'horizontal' | 'vertical'} direction - Which dimension the handle resizes. Horizontal resizes width, with the handle on an inline edge; vertical resizes height, with the handle on the top or bottom edge.
 * @prop {'end' | 'start'} handle - Which edge the handle sits on. `end` (the default) is the inline end (the right edge in a left-to-right page) or the bottom; `start` is the inline start or the top, for a panel docked against the far side of its container. Dragging the handle away from the panel grows it either way.
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
    handle: oneOf(['end', 'start']),
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

      /* Horizontal: handle on the inline end, or the inline start */
      :host([direction="horizontal"]) .handle {
        top: 0;
        inset-inline-end: 0;
        width: 4px;
        height: 100%;
        cursor: col-resize;
      }

      :host([direction="horizontal"][handle="start"]) .handle {
        inset-inline-end: auto;
        inset-inline-start: 0;
      }

      /* Vertical: handle on the bottom edge, or the top */
      :host([direction="vertical"]) .handle {
        bottom: 0;
        inset-inline-start: 0;
        height: 4px;
        width: 100%;
        cursor: row-resize;
      }

      :host([direction="vertical"][handle="start"]) .handle {
        bottom: auto;
        top: 0;
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

  /**
   * +1 when the handle sits on the physical right or bottom edge, -1 on the
   * left or top. Pointer and arrow-key movement are physical; which way that
   * resizes depends on the edge, and a horizontal handle's edge is logical, so
   * a right-to-left page flips it.
   */
  _sign() {
    const atEnd = this.handle !== 'start';
    if (this.direction !== 'horizontal') return atEnd ? 1 : -1;
    const rtl = getComputedStyle(this).direction === 'rtl';
    return atEnd !== rtl ? 1 : -1;
  }

  _onPointerDown(e) {
    e.preventDefault();
    this._dragging = true;
    this._startPos = this.direction === 'horizontal' ? e.clientX : e.clientY;
    this._startSize = this.size;
    const sign = this._sign();

    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);

    const onMove = (ev) => {
      const current = this.direction === 'horizontal' ? ev.clientX : ev.clientY;
      const delta = (current - this._startPos) * sign;
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
    // An arrow moves the handle the way it points, as a drag would.
    const step = (e.shiftKey ? 20 : 5) * this._sign();
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
    // Also in the template, which the server renders: the host property below
    // (part of the documented surface, and kept) is written from firstUpdated,
    // which only the browser runs, so a server-rendered panel sat at its
    // content's width until the script arrived.
    return html`
      <div class="container" part="base container" style=${styleMap({ '--panel-size': `${this.size}px` })}>
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
