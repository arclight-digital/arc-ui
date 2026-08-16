/**
 * Fixed-height row windowing, in one place.
 *
 * Three components implemented this: `arc-virtual-list`, `arc-data-table` and
 * `arc-data-grid`. The arithmetic is the same five lines in all three — floor
 * the scroll offset by row height, ceil the viewport by row height, pad both
 * ends by an overscan, clamp to the row count — and it had drifted in three
 * ways, each of which is a decision one copy made and the others never saw:
 *
 *  1. **`arc-data-table` could produce a negative count.** It wrote
 *     `this._visibleCount = endIndex - this._startIndex` with no floor, where
 *     the other two clamped at zero. `end` is `min(total, …)` and `start` is
 *     `max(0, …)`, so any state where the row set shrinks below the current
 *     scroll offset — a filter applied, rows removed, `rows` reassigned —
 *     inverts them, and the slice that follows renders nothing under a
 *     full-height top spacer. A blank table that scrolls.
 *  2. **`overscan` was public on one of the three and hardcoded to 5 in the
 *     other two.** Same default, no way to change it on a grid.
 *  3. **Only `arc-virtual-list` announced the window**, and only when it
 *     actually moved — which is the part that matters, since a scroll handler
 *     fires every frame of a drag and a consumer re-rendering rows on each one
 *     rebuilds an unchanged window sixty times a second.
 *
 * The controller takes the union: the clamp, a configurable overscan, and
 * change-only notification. Adopting it is what fixes (1) in `arc-data-table`
 * and gives (2) and (3) to both tables.
 *
 * **The viewport is a getter, not the host.** `arc-virtual-list` scrolls
 * itself; the two tables scroll an inner wrapper that does not exist until the
 * first render. A controller that read `host.scrollTop` would have fit exactly
 * one of its three consumers, which is how the three copies happened.
 */
export class VirtualController {
  /**
   * @param {import('lit').ReactiveElement} host
   * @param {object} opts
   * @param {() => Element | null | undefined} opts.getViewport - The scrolling
   *   element. May return null before the first render; `measure()` is a no-op
   *   until it does not.
   * @param {() => number} opts.getTotal - Row count.
   * @param {() => number} opts.getRowHeight - Row height in pixels. Guarded
   *   below rather than trusted: it is a divisor.
   * @param {() => number} [opts.getOverscan] - Rows rendered beyond each edge.
   *   Defaults to 5, which is what the two tables hardcoded.
   * @param {(range: {start: number, end: number, count: number}) => void} [opts.onChange]
   *   - Called only when the window actually moves.
   */
  constructor(host, { getViewport, getTotal, getRowHeight, getOverscan, onChange }) {
    this.host = host;
    this.opts = { getViewport, getTotal, getRowHeight, getOverscan, onChange };
    /** First rendered row index. */
    this.start = 0;
    /** How many rows are rendered. Never negative — see (1) above. */
    this.count = 0;
    host.addController(this);
  }

  /** One past the last rendered row. */
  get end() {
    return this.start + this.count;
  }

  /** Pixels of spacer above the rendered rows. */
  get offsetBefore() {
    return this.start * this._rowHeight();
  }

  /** Pixels of spacer below them. */
  get offsetAfter() {
    return Math.max(0, this.opts.getTotal() - this.end) * this._rowHeight();
  }

  /**
   * A row height of zero or less would put Infinity or NaN through every
   * calculation below and render either nothing or everything. `arc-virtual-list`
   * declares `min: 1` on the prop; the two tables declare no minimum, so the
   * guard lives here where all three get it.
   */
  _rowHeight() {
    const h = this.opts.getRowHeight();
    return Number.isFinite(h) && h > 0 ? h : 1;
  }

  /**
   * Recompute the window. Returns true when it moved.
   *
   * Returning the movement rather than only firing `onChange` is what lets a
   * host skip its own `requestUpdate` on a scroll frame that changed nothing —
   * the notification and the re-render are different decisions, and a host that
   * re-renders unconditionally is the cost this replaces.
   */
  measure() {
    const viewport = this.opts.getViewport();
    if (!viewport) return false;

    const rowHeight = this._rowHeight();
    const total = Math.max(0, this.opts.getTotal() || 0);
    const overscan = Math.max(0, this.opts.getOverscan?.() ?? 5);

    const rawStart = Math.floor(viewport.scrollTop / rowHeight);
    const rawVisible = Math.ceil(viewport.clientHeight / rowHeight);

    const start = Math.max(0, Math.min(total, rawStart - overscan));
    const end = Math.min(total, rawStart + rawVisible + overscan);
    // The clamp that arc-data-table did not have. `end` can land below `start`
    // whenever the row set shrank under the current scroll offset.
    const count = Math.max(0, end - start);

    const moved = start !== this.start || count !== this.count;
    this.start = start;
    this.count = count;
    if (moved) this.opts.onChange?.({ start, end: start + count, count });
    return moved;
  }

  /**
   * Re-measure on the next frame, coalescing a burst of scroll events into one.
   *
   * A scroll handler fires far more often than a frame, and measuring in the
   * handler both wastes the work and reads layout mid-scroll.
   */
  schedule() {
    if (this._rafId !== undefined) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = undefined;
      if (this.measure()) this.host.requestUpdate();
    });
  }

  /**
   * Both halves, because a controller with only a teardown is a one-way door —
   * a host that is disconnected and reconnected (a list moved in the DOM, a
   * table inside a re-parented panel) would come back with no pending frame and
   * no way to schedule one. See HANDOFF.
   */
  hostConnected() {}

  hostDisconnected() {
    if (this._rafId !== undefined) {
      cancelAnimationFrame(this._rafId);
      this._rafId = undefined;
    }
  }
}
