import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, num, list, int } from '../shared/props.js';
import { VirtualController } from '../shared/virtual-controller.js';
import { tokenStyles } from '../shared-styles.js';

/**
 * Windowed list that renders only the visible slice of a large array.
 * Fixed row height with configurable overscan.
 *
 * Two ways to supply rows, because "render a row" means something different
 * inside a framework than it does outside one:
 *
 *   - `renderItem` — a callback returning the row's content. The component
 *     mounts only the visible rows, so a million-row array puts a screenful of
 *     nodes in the DOM. This is the direct path: plain JS, HTML, Lit.
 *   - windowed slots — the component renders an `item-N` slot for each index in
 *     the visible range only, and announces that range as it scrolls. (Spelled
 *     without the tag on purpose: prism scans this whole file for slot markup,
 *     and a literal one in a comment invents a slot named `item-N`.)
 *     Whoever owns
 *     the light DOM supplies just those rows. This is how the framework
 *     wrappers do it, so a React consumer writes JSX and a Svelte consumer
 *     writes markup, rather than a callback returning nodes their framework
 *     didn't create.
 *
 * Both paths share one geometry engine, so scrolling behaves identically.
 * `renderItem` wins if both are present.
 *
 * @tag arc-virtual-list
 * @status stable
 * @prop {Array} items - The full data array. Only the visible slice is rendered at any given time.
 * @prop {Function} renderItem - `(item, index) => unknown` returning one row's content. Anything Lit can render: a template, a DOM node, a string. When set, rows come from here and the slots are not used.
 * @prop {number} itemHeight - Height in pixels of each row. Must match what actually renders, and must be at least 1 — it is a divisor, so a zero would put NaN through every window calculation.
 * @prop {number} overscan - Rows rendered above and below the visible window to cover fast scrolling. Never negative.
 * @fires {CustomEvent<{value: {start: number, end: number}, start: number, end: number}>} arc-range-change - Fired when the visible range changes. `end` is exclusive.
 * @slot item-${index}
 * @csspart base - The root element.
 * @csspart spacer
 * @csspart item
 */
export class ArcVirtualList extends DeclaredPropsMixin(LitElement) {
  static properties = {
    items: list(),
    // Attribute is off: a function can't survive a round trip through one, and
    // leaving it on invites `render-item="handleRow"` that silently sets a string.
    renderItem: { attribute: false },
    itemHeight: num({ default: 40, min: 1, clamp: 'toRange', attribute: 'item-height' }),
    overscan: int({ default: 5, min: 0, clamp: 'toRange' }),
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

      .virtual-list__row {
        position: absolute;
        inset-inline-start: 0;
        width: 100%;
      }

      ::slotted(*) {
        position: absolute;
        inset-inline-start: 0;
        width: 100%;
      }
    `,
  ];

  constructor() {
    super();
    this.renderItem = null;
    this.itemHeight = 40;
    this.overscan = 5;
    this._startIndex = 0;
    this._visibleCount = 0;
    this._rafId = null;
    this._onScroll = this._onScroll.bind(this);

    this._window = new VirtualController(this, {
      // This component *is* the scroller, which is exactly why the controller
      // takes a getter: the two tables scroll an inner wrapper that does not
      // exist until their first render.
      getViewport: () => this,
      getTotal: () => this.items?.length || 0,
      getRowHeight: () => this.itemHeight,
      getOverscan: () => this.overscan,
      onChange: ({ start, end }) =>
        this.dispatchEvent(
          new CustomEvent('arc-range-change', {
            detail: { value: { start, end }, start, end },
            bubbles: true,
            composed: true,
          }),
        ),
    });
  }

  connectedCallback() {
    super.connectedCallback();
    // The host is the scrollable region — it must be keyboard-focusable
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
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

  /**
   * The window is `VirtualController`'s since 4.2 — the same five lines lived
   * here, in arc-data-table and in arc-data-grid, having drifted three ways.
   * `_startIndex` and `_visibleCount` stay as reactive state mirroring it: they
   * are what `render()` reads and what a re-render has to be keyed on.
   */
  _recalc() {
    this._window.measure();
    this._startIndex = this._window.start;
    this._visibleCount = this._window.count;
  }

  /** Scroll a row into view. Clamped to the list. */
  scrollToIndex(index) {
    const total = this.items?.length || 0;
    if (!total) return;
    const clamped = Math.min(Math.max(0, index), total - 1);
    this.scrollTop = clamped * this.itemHeight;
    this._recalc();
  }

  render() {
    const total = this.items?.length || 0;
    const totalHeight = total * this.itemHeight;
    const visibleItems =
      this.items?.slice(this._startIndex, this._startIndex + this._visibleCount) || [];

    return html`
      <div class="virtual-list__spacer" style="height:${totalHeight}px" part="base spacer">
        ${visibleItems.map((item, i) => {
          const index = this._startIndex + i;
          return html`
            <div
              class="virtual-list__row"
              style="top:${index * this.itemHeight}px;height:${this.itemHeight}px;"
              part="item"
            >
              ${
                this.renderItem
                  ? this.renderItem(item, index)
                  : html`<slot name="item-${index}"></slot>`
              }
            </div>
          `;
        })}
      </div>
    `;
  }

  /** The range of currently rendered indices. `end` is exclusive. */
  get visibleRange() {
    return {
      start: this._startIndex,
      end: this._startIndex + this._visibleCount,
    };
  }
}
