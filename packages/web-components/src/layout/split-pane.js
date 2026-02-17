import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-split-pane
 */
export class ArcSplitPane extends LitElement {
  static properties = {
    orientation: { type: String, reflect: true },
    ratio: { type: Number },
    minRatio: { type: Number, attribute: 'min-ratio' },
    maxRatio: { type: Number, attribute: 'max-ratio' },
  };

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
        transition: background 0.15s ease;
        user-select: none;
        touch-action: none;
      }

      .split-pane__handle:hover,
      .split-pane__handle--dragging {
        background: var(--border-bright);
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
    this.orientation = 'horizontal';
    this.ratio = 0.5;
    this.minRatio = 0.15;
    this.maxRatio = 0.85;
    this._dragging = false;
    this._containerEl = null;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
  }

  _onMouseDown(e) {
    e.preventDefault();
    this._dragging = true;
    this._containerEl = this.shadowRoot.querySelector('.split-pane');
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    this.requestUpdate();
  }

  _onMouseMove(e) {
    if (!this._dragging) return;

    const container = this._containerEl;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let newRatio;

    if (this.orientation === 'horizontal') {
      newRatio = (e.clientX - rect.left) / rect.width;
    } else {
      newRatio = (e.clientY - rect.top) / rect.height;
    }

    newRatio = Math.max(this.minRatio, Math.min(this.maxRatio, newRatio));
    this.ratio = newRatio;
  }

  _onMouseUp() {
    if (!this._dragging) return;
    this._dragging = false;
    this._containerEl = null;
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    this.requestUpdate();

    this.dispatchEvent(
      new CustomEvent('arc-resize', {
        detail: { ratio: this.ratio },
        bubbles: true,
        composed: true,
      })
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
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
          style="${this.orientation === 'horizontal'
            ? `width: ${primarySize}`
            : `height: ${primarySize}`}"
        >
          <slot name="primary"></slot>
        </div>
        <div
          class="split-pane__handle ${handleDragging}"
          part="handle"
          @mousedown=${this._onMouseDown}
        ></div>
        <div class="split-pane__secondary" part="secondary">
          <slot name="secondary"></slot>
        </div>
      </div>
    `;
  }
}
