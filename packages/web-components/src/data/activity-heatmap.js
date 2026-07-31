import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { monthNames, weekdayNames, defaultLocale } from '../shared/date-names.js';
import { PositionController } from '../shared/position-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';

/** Milliseconds per day; all internal date math is UTC epoch-day arithmetic. */
const DAY = 86400000;

/** Parse a strict YYYY-MM-DD string to a UTC epoch-day number, or null. */
function parseISO(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? '');
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  return Number.isFinite(t) ? t / DAY : null;
}

/** Epoch day back to YYYY-MM-DD. */
function toISO(epochDay) {
  const d = new Date(epochDay * DAY);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/** Day of week for an epoch day, 0 = Sunday. Day 0 (1970-01-01) was a Thursday. */
const dowOf = (epochDay) => ((epochDay % 7) + 7 + 4) % 7;

/**
 * GitHub-style contribution calendar: a year of day cells laid out as one
 * column per week, each cell tinted by that day's activity on a five-step
 * accent ramp. Hovering or arrow-keying a cell raises it with the house glow
 * and shows its detail — the date and the day's label or value — in the same
 * built-in bubble arc-uptime carries. Month labels run along the top, sparse
 * weekday labels down the side, and a Less→More legend sits below.
 *
 * The grid is a pure function of its props. When `end-date` is unset the
 * anchor is today, computed at render time in the browser; when rendering
 * server-side with no `end-date`, the anchor is instead derived from the
 * newest date present in `data`, so the server output is deterministic. Pin
 * `end-date` explicitly whenever server and client must agree exactly.
 *
 * @tag arc-activity-heatmap
 * @prop {Array<{date: string, value: number, label?: string}>} data - One entry per day with activity: an ISO `date` (YYYY-MM-DD), a numeric `value` mapped to the intensity ramp, and an optional `label` shown in the hover detail in place of the bare value (e.g. "7 commits"). Days in the rendered span with no entry render as empty cells, so sparse data is fine. Property only — set it from script or a framework binding.
 * @prop {string} endDate - The newest day shown, as an ISO string (YYYY-MM-DD). Unset: today in the browser; on the server, the newest date in `data` (see above).
 * @prop {number} weeks - How many week columns to render, counting back from the week containing the end date (default 52). The last column is truncated after the end date, so the newest cell is always the end date itself.
 * @prop {string} weekStart - Which day starts each column: "sunday" (default, the GitHub convention) or "monday".
 * @prop {number} max - When set, intensity is a linear scale from 0 to this value instead of the default quartile mapping: each nonzero value lands on step 1-4 by `value / max`. Values at or above `max` render as step 4.
 * @prop {boolean} legend - Whether to render the Less→More swatch strip under the grid (default true; set the attribute to the string "false" to disable from markup).
 * @slot none
 * @csspart heatmap
 * @csspart months
 * @csspart month
 * @csspart weekdays
 * @csspart weekday
 * @csspart grid
 * @csspart cell
 * @csspart detail
 * @csspart legend
 * @csspart swatch
 */
export class ArcActivityHeatmap extends LitElement {
  static properties = {
    data: { attribute: false },
    endDate: { type: String, attribute: 'end-date' },
    weeks: { type: Number },
    weekStart: { type: String, attribute: 'week-start' },
    max: { type: Number },
    legend: { type: Boolean, converter: { fromAttribute: (v) => v !== 'false' } },
    _activeIndex: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-block; }

      .heatmap {
        --_cell: var(--activity-heatmap-cell, 11px);
        --_gap:  var(--activity-heatmap-gap, 3px);
        /* Block-level, not inline-grid: as an inline box it sat in a line box
           and inherited the host's half-leading as ~10px of dead space above
           the months row, plus a sub-pixel height that made any surrounding
           scroller show a 1px vertical scrollbar. The host is inline-block,
           so shrink-to-fit sizing is already handled a level up. */
        display: grid;
        justify-content: start;
        grid-template-areas:
          '.        months'
          'weekdays grid'
          '.        legend';
        grid-template-columns: max-content max-content;
        gap: var(--space-xs);
      }

      /* The five intensity steps. Step 0 is the empty-day tint; 1-4 compose
         from the accent channels, alpha only, so a consumer overriding
         --accent-primary-rgb recolors the whole ramp. Each step also carries
         the rgb its glow reads — the uptime statusVars pattern — so an empty
         cell raises with a faint neutral breath instead of an accent halo. */
      .level-0 {
        --_cell-rgb: var(--text-primary-rgb);
        background: var(--surface-overlay);
      }
      .level-1 {
        --_cell-rgb: var(--accent-primary-rgb);
        background: rgba(var(--accent-primary-rgb), 0.25);
      }
      .level-2 {
        --_cell-rgb: var(--accent-primary-rgb);
        background: rgba(var(--accent-primary-rgb), 0.45);
      }
      .level-3 {
        --_cell-rgb: var(--accent-primary-rgb);
        background: rgba(var(--accent-primary-rgb), 0.7);
      }
      .level-4 {
        --_cell-rgb: var(--accent-primary-rgb);
        background: rgba(var(--accent-primary-rgb), 1);
      }

      .heatmap__months {
        grid-area: months;
        display: grid;
        grid-auto-rows: max-content;
        column-gap: var(--_gap);
      }

      .heatmap__month,
      .heatmap__weekday,
      .heatmap__legend {
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        color: var(--text-muted);
        line-height: 1;
      }

      .heatmap__month {
        grid-row: 1;
        white-space: nowrap;
      }

      .heatmap__weekdays {
        grid-area: weekdays;
        display: grid;
        grid-template-rows: repeat(7, var(--_cell));
        row-gap: var(--_gap);
      }

      .heatmap__weekday {
        align-self: center;
        justify-self: end;
        white-space: nowrap;
      }

      .heatmap__grid {
        grid-area: grid;
        position: relative;
        display: grid;
        grid-template-rows: repeat(7, var(--_cell));
        grid-auto-flow: column;
        grid-auto-columns: var(--_cell);
        gap: var(--_gap);
        border-radius: var(--radius-sm);
      }

      .heatmap__grid:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .heatmap__cell {
        border-radius: var(--radius-xs);
        transition:
          transform var(--transition-fast),
          box-shadow var(--transition-fast);
      }

      /* The house raise: --glow-sm's shape, parametrised on the step's own
         channels the way --glow-status is on --_status-rgb. */
      .heatmap__cell:hover,
      .heatmap__cell.is-active {
        transform: scale(1.3);
        box-shadow: 0 0 8px rgba(var(--_cell-rgb), 0.3);
      }

      /* The resting position, for the panel PositionController hasn't adopted
         yet — pre-upgrade and in prism's static export. Once managed it moves
         to the top layer, which is what lets it escape the scroll container a
         year-wide heatmap is usually placed in: anchored to the grid it was
         clipped to a sliver by the wrapper's overflow. */
      .heatmap__detail {
        position: absolute;
        bottom: calc(100% + var(--space-xs));
        z-index: var(--z-tooltip);
        display: flex;
        flex-direction: column;
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        padding: var(--space-xs) var(--space-sm);
        white-space: nowrap;
        pointer-events: none;
        box-shadow: var(--shadow-overlay);
        overflow: hidden;
      }

      /* The house tooltip hairline. */
      .heatmap__detail::before {
        content: '';
        position: absolute;
        top: 0;
        inset-inline: 0;
        height: 1px;
        background: var(--divider-glow);
      }

      .heatmap__detail-date {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-primary);
      }

      .heatmap__detail-value {
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        color: var(--accent-primary);
      }

      .heatmap__detail-value--empty {
        color: var(--text-muted);
      }

      .heatmap__legend {
        grid-area: legend;
        display: flex;
        align-items: center;
        justify-content: end;
        gap: var(--_gap);
      }

      .heatmap__legend > span:first-child { margin-inline-end: var(--space-xs); }
      .heatmap__legend > span:last-child  { margin-inline-start: var(--space-xs); }

      .heatmap__swatch {
        width: var(--_cell);
        height: var(--_cell);
        border-radius: var(--radius-xs);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      @media (prefers-reduced-motion: reduce) {
        .heatmap__cell { transition: none; }
      }
    `,
    // Cross-fade like tooltip rather than scale: the detail tracks a pointer
    // moving cell to cell, and a panel that rescaled on every step would flicker.
    managedPanelStyles('heatmap__detail', {
      openCls: 'is-visible',
      scale: 1,
      duration: 'var(--duration-fast)',
    }),
  ];

  constructor() {
    super();
    this.data = [];
    this.endDate = '';
    this.weeks = 52;
    this.weekStart = 'sunday';
    this.max = null;
    this.legend = true;
    this._activeIndex = null;
    // The anchor is the hovered cell, not the grid: the detail should sit over
    // the day it describes, and the cell moves under the pointer.
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.heatmap__cell.is-active'),
      floating: () => this.shadowRoot?.querySelector('.heatmap__detail'),
      placement: () => 'top',
      fallbackPlacement: 'top',
      offset: 6,
    });
  }

  updated(changed) {
    // Re-run on every step, not just on open: the anchor is a different cell
    // each time the pointer or the arrow keys move.
    if (changed.has('_activeIndex')) {
      this._activeIndex !== null ? this._position.show() : this._position.hide();
    }
  }

  /**
   * The anchor day. An explicit end-date wins; otherwise today where a
   * browser exists, and on the server the newest date in the data — the one
   * derivation that keeps server output a pure function of props. Null when
   * nothing can anchor the grid (server, no end-date, no data).
   */
  _resolveEndEpoch() {
    const explicit = parseISO(this.endDate);
    if (explicit !== null) return explicit;
    if (typeof window !== 'undefined') {
      const now = new Date();
      return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY;
    }
    const data = Array.isArray(this.data) ? this.data : [];
    let max = null;
    for (const entry of data) {
      const e = parseISO(entry?.date);
      if (e !== null && (max === null || e > max)) max = e;
    }
    return max;
  }

  /**
   * Grid geometry in one place: the span runs from the week-start of the
   * column `weeks - 1` weeks before the end date, through the end date
   * itself, so the last column is truncated rather than padded with future
   * days. With grid-auto-flow: column and the start pinned to row 0, cell i
   * sits at row i % 7 and column floor(i / 7) with no placement styles.
   */
  _layout() {
    let weeks = Math.floor(Number(this.weeks));
    if (!Number.isFinite(weeks) || weeks < 1) weeks = 52;
    const ws = this.weekStart === 'monday' ? 1 : 0;
    const end = this._resolveEndEpoch();
    if (end === null) return { end: null, start: null, count: 0, weekCount: 0, ws };
    const endRow = (dowOf(end) - ws + 7) % 7;
    const count = (weeks - 1) * 7 + endRow + 1;
    return { end, start: end - (count - 1), count, weekCount: weeks, ws };
  }

  /**
   * Quartile thresholds over the nonzero values of the whole data array (not
   * just the visible span, so scrolling the window never rescales the ramp).
   * q(p) is the value at index floor(n * p) of the sorted list.
   */
  _thresholds() {
    const data = Array.isArray(this.data) ? this.data : [];
    const values = data
      .map((e) => e?.value)
      .filter((v) => typeof v === 'number' && Number.isFinite(v) && v > 0)
      .sort((a, b) => a - b);
    if (values.length === 0) return null;
    const q = (p) => values[Math.min(values.length - 1, Math.floor(values.length * p))];
    return [q(0.25), q(0.5), q(0.75)];
  }

  /** Map one value to a step 0-4: quartiles by default, linear when max is set. */
  _levelOf(value, thresholds) {
    if (!(typeof value === 'number' && Number.isFinite(value) && value > 0)) return 0;
    if (typeof this.max === 'number' && Number.isFinite(this.max) && this.max > 0) {
      return Math.min(4, Math.max(1, Math.ceil((value / this.max) * 4)));
    }
    if (!thresholds) return 0;
    const [q1, q2, q3] = thresholds;
    if (value < q1) return 1;
    if (value < q2) return 2;
    if (value < q3) return 3;
    return 4;
  }

  /** One object per rendered day, oldest first. Later duplicate dates win. */
  _cells(layout) {
    const data = Array.isArray(this.data) ? this.data : [];
    const byDate = new Map();
    for (const entry of data) {
      if (entry && parseISO(entry.date) !== null) byDate.set(entry.date, entry);
    }
    const thresholds = this._thresholds();
    const cells = [];
    for (let i = 0; i < layout.count; i++) {
      const epoch = layout.start + i;
      const date = toISO(epoch);
      const entry = byDate.get(date);
      const value =
        typeof entry?.value === 'number' && Number.isFinite(entry.value) ? entry.value : 0;
      cells.push({
        epoch,
        date,
        value,
        label: entry?.label != null ? String(entry.label) : '',
        level: this._levelOf(value, thresholds),
      });
    }
    return cells;
  }

  /** "Mar 4, 2026" for an epoch day, in the document's locale. */
  _fmtDate(epoch) {
    return new Intl.DateTimeFormat(defaultLocale(), {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(epoch * DAY));
  }

  /**
   * Month labels along the top: one per column where the month of the
   * column's first day changes, plus the first column. Two labels closer
   * than three columns would collide, so the earlier of the pair yields —
   * that is always the partial month, and the real month start wins.
   */
  _monthLabels(layout) {
    const names = monthNames('short');
    const labels = [];
    let prev = null;
    for (let w = 0; w < layout.weekCount; w++) {
      const first = layout.start + w * 7;
      if (first > layout.end) break;
      const m = new Date(first * DAY).getUTCMonth();
      if (w === 0 || m !== prev) {
        if (labels.length && w - labels[labels.length - 1].week < 3) labels.pop();
        labels.push({ week: w, text: names[m] });
      }
      prev = m;
    }
    return labels;
  }

  /** Sparse weekday labels: Monday, Wednesday, Friday rows only. */
  _weekdayLabels(ws) {
    // weekdayNames takes 1 = Monday … 7 = Sunday; our ws is 0 = Sunday, 1 = Monday.
    const names = weekdayNames('short', undefined, ws === 1 ? 1 : 7);
    return names
      .map((text, row) => ({ row, text }))
      .filter(({ row }) => [1, 3, 5].includes((ws + row) % 7));
  }

  /** The whole grid in one sentence, for the grid's aria-label. */
  _summaryLabel(cells, layout) {
    if (cells.length === 0) return 'Activity heatmap: no data';
    const active = cells.filter((c) => c.value > 0);
    const total = active.reduce((a, c) => a + c.value, 0);
    return (
      `Activity heatmap: ${cells.length} days ending ${this._fmtDate(layout.end)}, ` +
      `${total} total across ${active.length} active ${active.length === 1 ? 'day' : 'days'}`
    );
  }

  /** Hover-bubble and live-region text for one cell. */
  _detailOf(cell) {
    return {
      date: this._fmtDate(cell.epoch),
      value: cell.label || (cell.value > 0 ? String(cell.value) : 'No activity'),
      empty: cell.value <= 0,
    };
  }

  _onPointerOver(e) {
    const cell = e.target.closest?.('[data-index]');
    if (cell) this._activeIndex = Number(cell.dataset.index);
  }

  _clearActive() {
    this._activeIndex = null;
  }

  /**
   * One tab stop, grid semantics: up/down step a day (a row), left/right a
   * week (a column), Home/End the first/last day. The first press lands on
   * an end of the grid instead of applying its delta — arriving fresh and
   * jumping a week into the middle would disorient.
   */
  _onKeyDown(e) {
    const { count } = this._layout();
    if (count === 0) return;
    const rtl = this.matches(':dir(rtl)');
    const step = (delta) => {
      this._activeIndex =
        this._activeIndex === null
          ? delta > 0
            ? 0
            : count - 1
          : Math.min(count - 1, Math.max(0, this._activeIndex + delta));
      e.preventDefault();
    };
    switch (e.key) {
      case 'ArrowDown':
        step(1);
        break;
      case 'ArrowUp':
        step(-1);
        break;
      case 'ArrowRight':
        step(rtl ? -7 : 7);
        break;
      case 'ArrowLeft':
        step(rtl ? 7 : -7);
        break;
      case 'Home':
        this._activeIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        this._activeIndex = count - 1;
        e.preventDefault();
        break;
      case 'Escape':
        if (this._activeIndex !== null) {
          this._clearActive();
          e.stopPropagation();
        }
        break;
    }
  }

  render() {
    const layout = this._layout();
    const cells = this._cells(layout);
    const active = this._activeIndex !== null ? cells[this._activeIndex] : undefined;
    const detail = active ? this._detailOf(active) : null;
    const columns = `grid-template-columns: repeat(${Math.max(layout.weekCount, 1)}, var(--_cell));`;

    return html`
      <div class="heatmap" part="heatmap">
        <div class="heatmap__months" part="months" style=${columns} aria-hidden="true">
          ${this._monthLabels(layout).map(
            (m) => html`
            <span class="heatmap__month" part="month" style="grid-column-start: ${m.week + 1};">${m.text}</span>
          `,
          )}
        </div>
        <div class="heatmap__weekdays" part="weekdays" aria-hidden="true">
          ${this._weekdayLabels(layout.ws).map(
            (d) => html`
            <span class="heatmap__weekday" part="weekday" style="grid-row: ${d.row + 1};">${d.text}</span>
          `,
          )}
        </div>
        <div
          class="heatmap__grid"
          part="grid"
          role="img"
          tabindex=${cells.length === 0 ? '-1' : '0'}
          aria-label=${this._summaryLabel(cells, layout)}
          @pointerover=${this._onPointerOver}
          @pointerleave=${this._clearActive}
          @keydown=${this._onKeyDown}
          @blur=${this._clearActive}
        >
          ${cells.map(
            (cell, i) => html`
            <span
              class="heatmap__cell level-${cell.level} ${i === this._activeIndex ? 'is-active' : ''}"
              part="cell"
              data-index=${i}
              data-date=${cell.date}
            ></span>
          `,
          )}
          ${
            detail
              ? html`
            <div
              class="heatmap__detail is-visible"
              part="detail"
              aria-hidden="true"
            >
              <span class="heatmap__detail-date">${detail.date}</span>
              <span class="heatmap__detail-value ${detail.empty ? 'heatmap__detail-value--empty' : ''}">${detail.value}</span>
            </div>
          `
              : nothing
          }
        </div>
        ${
          this.legend
            ? html`
          <div class="heatmap__legend" part="legend" aria-hidden="true">
            <span>Less</span>
            ${[0, 1, 2, 3, 4].map(
              (l) => html`
              <span class="heatmap__swatch level-${l}" part="swatch"></span>
            `,
            )}
            <span>More</span>
          </div>
        `
            : nothing
        }
        <span class="sr-only" role="status">${detail ? `${detail.date}: ${detail.value}` : ''}</span>
      </div>
    `;
  }
}
