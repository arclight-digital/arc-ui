import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-virtual-list
 */
export class ArcVirtualList extends LitElement {
  static properties = {
    items:      { type: Array },
    itemHeight: { type: Number, attribute: 'item-height' },
    overscan:   { type: Number },
    _startIndex: { state: true },
    _visibleCount: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        overflow: auto;
        position: relative;
      }

      .virtual-list__spacer {
        position: relative;
        width: 100%;
      }

      .virtual-list__viewport {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
      }

      ::slotted(*) {
        position: absolute;
        left: 0;
        width: 100%;
      }
    `,
  ];

  constructor() {
    super();
    this.items = [];
    this.itemHeight = 40;
    this.overscan = 5;
    this._startIndex = 0;
    this._visibleCount = 0;
    this._rafId = null;
    this._onScroll = this._onScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('scroll', this._onScroll, { passive: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('scroll', this._onScroll);
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  firstUpdated() {
    this._recalc();
  }

  updated(changed) {
    if (changed.has('items') || changed.has('itemHeight') || changed.has('overscan')) {
      this._recalc();
    }
  }

  _onScroll() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._recalc();
    });
  }

  _recalc() {
    const scrollTop = this.scrollTop;
    const viewHeight = this.clientHeight;
    const total = this.items?.length || 0;

    const rawStart = Math.floor(scrollTop / this.itemHeight);
    const rawVisible = Math.ceil(viewHeight / this.itemHeight);

    this._startIndex = Math.max(0, rawStart - this.overscan);
    const endIndex = Math.min(total, rawStart + rawVisible + this.overscan);
    this._visibleCount = endIndex - this._startIndex;
  }

  render() {
    const total = this.items?.length || 0;
    const totalHeight = total * this.itemHeight;
    const visibleItems = this.items?.slice(this._startIndex, this._startIndex + this._visibleCount) || [];

    return html`
      <div class="virtual-list__spacer" style="height:${totalHeight}px" part="spacer">
        ${visibleItems.map((item, i) => {
          const index = this._startIndex + i;
          const top = index * this.itemHeight;
          return html`
            <div
              style="position:absolute;top:${top}px;left:0;width:100%;height:${this.itemHeight}px;"
              part="item"
            >
              <slot name="item-${index}"></slot>
            </div>
          `;
        })}
      </div>
    `;
  }

  /** Returns the range of currently rendered indices for external template rendering */
  get visibleRange() {
    return {
      start: this._startIndex,
      end: this._startIndex + this._visibleCount,
    };
  }
}
