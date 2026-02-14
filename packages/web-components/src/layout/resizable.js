import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-resizable
 */
export class ArcResizable extends LitElement {
  static properties = {
    direction: { type: String, reflect: true },
    minSize:   { type: Number, attribute: 'min-size' },
    maxSize:   { type: Number, attribute: 'max-size' },
    size:      { type: Number },
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
        right: 0;
        width: 4px;
        height: 100%;
        cursor: col-resize;
      }

      /* Vertical: handle on bottom edge */
      :host([direction="vertical"]) .handle {
        bottom: 0;
        left: 0;
        height: 4px;
        width: 100%;
        cursor: row-resize;
      }

      .handle:hover,
      .handle.active {
        background: var(--accent-primary);
      }

      .handle:focus-visible {
        outline: none;
        background: var(--accent-primary);
        box-shadow: var(--focus-glow);
      }

      /* Expand hit area for easier grabbing */
      .handle::before {
        content: '';
        position: absolute;
      }

      :host([direction="horizontal"]) .handle::before {
        top: 0;
        left: -4px;
        right: -4px;
        bottom: 0;
      }

      :host([direction="vertical"]) .handle::before {
        left: 0;
        top: -4px;
        bottom: -4px;
        right: 0;
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
    this.direction = 'horizontal';
    this.minSize = 100;
    this.maxSize = Infinity;
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

        this.dispatchEvent(new CustomEvent('arc-resize', {
          detail: { size: this.size },
          bubbles: true,
          composed: true,
        }));
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

      this.dispatchEvent(new CustomEvent('arc-resize', {
        detail: { size: this.size },
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    return html`
      <div class="container" part="container">
        <slot></slot>
      </div>
      <div
        class="handle ${this._dragging ? 'active' : ''}"
        part="handle"
        role="separator"
        tabindex="0"
        aria-orientation=${this.direction}
        aria-valuenow=${this.size}
        aria-valuemin=${this.minSize}
        aria-valuemax=${isFinite(this.maxSize) ? this.maxSize : undefined}
        aria-label="Resize handle"
        @pointerdown=${this._onPointerDown}
        @keydown=${this._onKeydown}
      ></div>
    `;
  }
}
