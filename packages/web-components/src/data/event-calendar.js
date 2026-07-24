import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Scheduling calendar with month and week views that renders all-day and multi-day event chips
 * colored by the chart palette.
 *
 * @tag arc-event-calendar
 * @prop events - The event objects to display. `date` (and optional `end` for multi-day spans) are ISO strings (YYYY-MM-DD). `color` indexes the fixed `--chart-N` palette and defaults to 1. Set via JavaScript property, not an attribute.
 * @prop {'month' | 'week'} view - Which period layout to render. Also switchable by the user via the header view toggle.
 * @prop {string} date - ISO date string (YYYY-MM-DD) anchoring the visible period. Defaults to today when left empty.
 * @fires arc-event-click - Fired when an event chip is clicked or activated. `event.detail.event` contains the original event object.
 * @fires arc-date-click - Fired when a day cell or a "+N more" overflow button is activated. `event.detail.date` contains the ISO date string.
 * @fires {CustomEvent<{ view: 'month' | 'week', date: string }>} arc-period-change - Fired when the visible period or view changes (navigation buttons, Today, view toggle, or keyboard). `event.detail` contains `{ view, date }`.
 * @csspart event
 * @csspart day
 * @csspart day-number
 * @csspart events
 * @csspart more
 * @csspart calendar
 * @csspart header
 * @csspart nav-prev
 * @csspart nav-next
 * @csspart today
 * @csspart title
 * @csspart view-toggle
 * @csspart view-month
 * @csspart view-week
 * @csspart dows
 * @csspart dow
 * @csspart grid
 */
export class ArcEventCalendar extends LitElement {
  static properties = {
    events: { type: Array },
    view:   { type: String, reflect: true },
    date:   { type: String },
    _focusedIso: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-body);
      }

      .cal {
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      .cal__header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--border-subtle);
      }

      .cal__nav-group {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .cal__nav {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: none;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .cal__today {
        height: 28px;
        padding: 0 var(--space-sm);
        background: none;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        font-family: var(--font-body);
        font-size: var(--text-xs);
        font-weight: 500;
        color: var(--text-secondary);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .cal__nav:hover,
      .cal__today:hover {
        background: var(--surface-overlay);
        color: var(--text-primary);
      }

      .cal__title {
        flex: 1;
        text-align: center;
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-primary);
        min-width: 140px;
      }

      .cal__toggle {
        display: flex;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }

      .cal__view {
        height: 28px;
        padding: 0 var(--space-sm);
        background: none;
        border: none;
        font-family: var(--font-body);
        font-size: var(--text-xs);
        font-weight: 500;
        color: var(--text-secondary);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .cal__view:hover {
        color: var(--text-primary);
      }

      .cal__view[aria-pressed='true'] {
        background: var(--surface-overlay);
        color: var(--text-primary);
      }

      .cal__view + .cal__view {
        border-left: 1px solid var(--border-default);
      }

      .cal__nav:focus-visible,
      .cal__today:focus-visible,
      .cal__view:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
        position: relative;
        z-index: 1;
      }

      .cal__dows {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1px solid var(--border-subtle);
      }

      .cal__dow {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        text-align: center;
        padding: var(--space-xs) 0;
      }

      .cal__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--border-subtle);
      }

      .cal__cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-height: 96px;
        min-width: 0;
        padding: var(--space-xs);
        background: var(--surface-raised);
      }

      :host([view='week']) .cal__cell {
        min-height: 200px;
      }

      .cal__daynum {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        flex: none;
        align-self: flex-start;
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .cal__daynum:hover {
        background: rgba(var(--interactive-rgb), 0.1);
        color: var(--text-primary);
      }

      .cal__daynum--today {
        background: var(--interactive);
        color: var(--text-primary);
        font-weight: 600;
      }

      .cal__daynum--today:hover {
        background: var(--interactive);
      }

      .cal__cell--outside .cal__daynum {
        color: var(--text-muted);
        opacity: 0.4;
      }

      .cal__daynum:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .cal__events {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .cal__chip {
        display: flex;
        align-items: center;
        gap: 5px;
        min-width: 0;
        padding: 2px 6px;
        background: color-mix(in srgb, var(--ec-color) 15%, transparent);
        border: none;
        border-radius: var(--radius-sm);
        font-family: var(--font-body);
        font-size: var(--text-xs);
        color: var(--text-primary);
        text-align: left;
        cursor: pointer;
        transition: background var(--transition-fast);
      }

      .cal__chip:hover {
        background: color-mix(in srgb, var(--ec-color) 28%, transparent);
      }

      .cal__chip:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      /* Multi-day spans: square the inner edges so the chip reads as continuous. */
      .cal__chip--cont {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      .cal__chip--extends {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .cal__dot {
        width: 6px;
        height: 6px;
        flex: none;
        border-radius: var(--radius-full);
        background: var(--ec-color);
      }

      .cal__chip-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cal__more {
        align-self: flex-start;
        padding: 2px 6px;
        background: none;
        border: none;
        border-radius: var(--radius-sm);
        font-family: var(--font-body);
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-align: left;
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .cal__more:hover {
        background: var(--surface-overlay);
        color: var(--text-primary);
      }

      .cal__more:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
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

  static _DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  static _MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  static _MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor() {
    super();
    this.events = [];
    this.view = 'month';
    // Resolved to today in connectedCallback so the constructor stays deterministic.
    this.date = '';
    this._focusedIso = '';
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.date) this.date = this._todayISO();
    if (!this._focusedIso) this._focusedIso = this.date;
  }

  willUpdate(changed) {
    if ((changed.has('date') || changed.has('view')) && this.date) {
      if (!this._focusedIso || !this._isoInPeriod(this._focusedIso)) {
        this._focusedIso = this._anchorISO;
      }
    }
  }

  get _anchorISO() {
    return this.date || this._todayISO();
  }

  _todayISO() {
    return this._toISO(new Date());
  }

  _toISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  _parseISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  _addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  _addMonths(d, n) {
    const daysIn = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
    return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), daysIn));
  }

  _isoInPeriod(iso) {
    const anchor = this._anchorISO;
    if (this.view === 'week') {
      const a = this._parseISO(anchor);
      const start = this._addDays(a, -a.getDay());
      return iso >= this._toISO(start) && iso <= this._toISO(this._addDays(start, 6));
    }
    return iso.slice(0, 7) === anchor.slice(0, 7);
  }

  _visibleDays(anchor) {
    const days = [];
    if (this.view === 'week') {
      const start = this._addDays(anchor, -anchor.getDay());
      for (let i = 0; i < 7; i++) {
        const d = this._addDays(start, i);
        days.push({ d, iso: this._toISO(d), outside: false });
      }
      return days;
    }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const start = this._addDays(first, -first.getDay());
    for (let i = 0; i < 42; i++) {
      const d = this._addDays(start, i);
      days.push({ d, iso: this._toISO(d), outside: d.getMonth() !== anchor.getMonth() });
    }
    return days;
  }

  _eventsForDay(iso) {
    const evs = Array.isArray(this.events) ? this.events : [];
    return evs
      .filter(ev => ev && ev.date && ev.date <= iso && iso <= (ev.end || ev.date))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }

  _periodTitle(anchor, days) {
    const { _MONTHS: M, _MONTHS_SHORT: S } = ArcEventCalendar;
    if (this.view !== 'week') return `${M[anchor.getMonth()]} ${anchor.getFullYear()}`;
    const a = days[0].d;
    const b = days[6].d;
    const startYear = a.getFullYear() === b.getFullYear() ? '' : `, ${a.getFullYear()}`;
    return `${S[a.getMonth()]} ${a.getDate()}${startYear} – ${S[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}`;
  }

  _dispatchPeriodChange() {
    this.dispatchEvent(new CustomEvent('arc-period-change', {
      detail: { view: this.view, date: this.date },
      bubbles: true,
      composed: true,
    }));
  }

  _dispatchDateClick(date) {
    this.dispatchEvent(new CustomEvent('arc-date-click', {
      detail: { date },
      bubbles: true,
      composed: true,
    }));
  }

  _navigate(dir) {
    const a = this._parseISO(this._anchorISO);
    const next = this.view === 'week' ? this._addDays(a, dir * 7) : this._addMonths(a, dir);
    this.date = this._toISO(next);
    this._focusedIso = this.date;
    this._dispatchPeriodChange();
  }

  _goToday() {
    const today = this._todayISO();
    this._focusedIso = today;
    if (this.date !== today) {
      this.date = today;
      this._dispatchPeriodChange();
    }
  }

  _setView(view) {
    if (view === this.view) return;
    this.view = view;
    this._dispatchPeriodChange();
  }

  async _moveFocus(target) {
    const iso = this._toISO(target);
    const periodChanged = !this._isoInPeriod(iso);
    this._focusedIso = iso;
    if (periodChanged) {
      this.date = iso;
      this._dispatchPeriodChange();
    }
    await this.updateComplete;
    this.shadowRoot.querySelector(`.cal__daynum[data-iso="${iso}"]`)?.focus();
  }

  _onGridClick(e) {
    const chip = e.target.closest('.cal__chip');
    if (chip) {
      const ev = (this.events || [])[Number(chip.dataset.idx)];
      this.dispatchEvent(new CustomEvent('arc-event-click', {
        detail: { event: ev },
        bubbles: true,
        composed: true,
      }));
      return;
    }
    const cell = e.target.closest('.cal__cell');
    if (!cell) return;
    this._focusedIso = cell.dataset.iso;
    this._dispatchDateClick(cell.dataset.iso);
  }

  _onGridKeydown(e) {
    const t = e.target;
    if (t.classList.contains('cal__chip') || t.classList.contains('cal__more')) {
      this._onChipKeydown(e, t);
      return;
    }
    if (!t.classList.contains('cal__daynum')) return;
    const d = this._parseISO(t.dataset.iso);
    let target = null;

    switch (e.key) {
      case 'Enter': {
        const first = t.closest('.cal__cell')?.querySelector('.cal__chip');
        if (first) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      case 'ArrowRight': target = this._addDays(d, 1); break;
      case 'ArrowLeft':  target = this._addDays(d, -1); break;
      case 'ArrowDown':  target = this._addDays(d, 7); break;
      case 'ArrowUp':    target = this._addDays(d, -7); break;
      case 'Home':       target = this._addDays(d, -d.getDay()); break;
      case 'End':        target = this._addDays(d, 6 - d.getDay()); break;
      case 'PageUp':     target = this.view === 'week' ? this._addDays(d, -7) : this._addMonths(d, -1); break;
      case 'PageDown':   target = this.view === 'week' ? this._addDays(d, 7) : this._addMonths(d, 1); break;
      default: return;
    }

    e.preventDefault();
    this._moveFocus(target);
  }

  _onChipKeydown(e, t) {
    const cell = t.closest('.cal__cell');
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cell?.querySelector('.cal__daynum')?.focus();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = [...cell.querySelectorAll('.cal__chip, .cal__more')];
      const next = items[items.indexOf(t) + (e.key === 'ArrowDown' ? 1 : -1)];
      next?.focus();
    }
  }

  _renderChip(ev, iso) {
    const raw = Math.floor(ev.color);
    const c = raw >= 1 && raw <= 6 ? raw : 1;
    const isStart = ev.date === iso;
    const isEnd = (ev.end || ev.date) === iso;
    return html`
      <button
        class="cal__chip ${isStart ? '' : 'cal__chip--cont'} ${isEnd ? '' : 'cal__chip--extends'}"
        style="--ec-color: var(--chart-${c})"
        data-idx=${(this.events || []).indexOf(ev)}
        tabindex="-1"
        title=${ev.label ?? ''}
        part="event"
      >
        ${isStart ? html`<span class="cal__dot" aria-hidden="true"></span>` : ''}
        <span class="cal__chip-label">${ev.label}</span>
      </button>
    `;
  }

  _renderCell({ d, iso, outside }, todayIso, focusIso, maxChips) {
    const { _MONTHS: M } = ArcEventCalendar;
    const evs = this._eventsForDay(iso);
    const visible = maxChips ? evs.slice(0, maxChips) : evs;
    const hidden = evs.length - visible.length;
    const countLabel = evs.length
      ? `, ${evs.length === 1 ? '1 event' : `${evs.length} events`}`
      : '';

    return html`
      <div class="cal__cell ${outside ? 'cal__cell--outside' : ''}" data-iso=${iso} part="day">
        <button
          class="cal__daynum ${iso === todayIso ? 'cal__daynum--today' : ''}"
          data-iso=${iso}
          tabindex=${iso === focusIso ? '0' : '-1'}
          aria-label="${M[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}${countLabel}"
          part="day-number"
        >${d.getDate()}</button>
        ${evs.length ? html`
          <div class="cal__events" part="events">
            ${visible.map(ev => this._renderChip(ev, iso))}
            ${hidden > 0 ? html`
              <button
                class="cal__more"
                tabindex="-1"
                aria-label="${hidden} more ${hidden === 1 ? 'event' : 'events'} on ${M[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}"
                part="more"
              >+${hidden} more</button>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    const anchor = this._parseISO(this._anchorISO);
    const days = this._visibleDays(anchor);
    const todayIso = this._todayISO();
    const title = this._periodTitle(anchor, days);
    const isWeek = this.view === 'week';
    const maxChips = isWeek ? 0 : 3;
    const focusIso = days.some(day => day.iso === this._focusedIso)
      ? this._focusedIso
      : this._toISO(anchor);
    const period = isWeek ? 'week' : 'month';

    return html`
      <div class="cal" part="calendar">
        <div class="cal__header" part="header">
          <div class="cal__nav-group">
            <button class="cal__nav" @click=${() => this._navigate(-1)} aria-label="Previous ${period}" part="nav-prev">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M6.5 1.5L3 5L6.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="cal__nav" @click=${() => this._navigate(1)} aria-label="Next ${period}" part="nav-next">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M3.5 1.5L7 5L3.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="cal__today" @click=${this._goToday} part="today">Today</button>
          </div>
          <span class="cal__title" part="title">${title}</span>
          <div class="cal__toggle" part="view-toggle">
            <button class="cal__view" aria-pressed=${!isWeek ? 'true' : 'false'} @click=${() => this._setView('month')} part="view-month">Month</button>
            <button class="cal__view" aria-pressed=${isWeek ? 'true' : 'false'} @click=${() => this._setView('week')} part="view-week">Week</button>
          </div>
        </div>

        <div class="cal__dows" part="dows">
          ${ArcEventCalendar._DAYS.map(dow => html`<div class="cal__dow" part="dow">${dow}</div>`)}
        </div>

        <div
          class="cal__grid"
          role="group"
          aria-label=${title}
          part="grid"
          @click=${this._onGridClick}
          @keydown=${this._onGridKeydown}
        >
          ${days.map(day => this._renderCell(day, todayIso, focusIso, maxChips))}
        </div>
      </div>
    `;
  }
}
