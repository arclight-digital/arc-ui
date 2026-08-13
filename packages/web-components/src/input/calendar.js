import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { monthNames, weekdayNames, firstDayOfWeek, weekdayOffset } from '../shared/date-names.js';
import { DeclaredPropsMixin, oneOf, int } from '../shared/props.js';

/**
 * Interactive month-view calendar grid for date selection with min/max constraints, keyboard
 * navigation, and today highlighting.
 *
 * @tag arc-calendar
 * @prop {string} value - The selected date as an ISO string (YYYY-MM-DD). Empty string means no date is selected.
 * @prop {string} min - Minimum selectable date as an ISO string. Days before this date are disabled.
 * @prop {string} max - Maximum selectable date as an ISO string. Days after this date are disabled.
 * @prop {number} month - The currently displayed month (0-based, 0=January). Defaults to the
 *   current month. Clamped to 0-11: an out-of-range month reached `new Date(year, month)`,
 *   which silently rolls into another year.
 * @prop {number} year - The currently displayed year. Defaults to the current year.
 * @fires arc-change - Fired when a date is selected. `event.detail.value` contains the ISO date string (YYYY-MM-DD).
 * @fires {CustomEvent<{ month: number, year: number }>} arc-month-change - Fired when the visible month or year changes via the navigation buttons.
 * @slot none
 * @csspart calendar
 * @csspart header
 * @csspart nav-prev
 * @csspart title
 * @csspart nav-next
 * @csspart grid
 * @csspart dow
 * @csspart day
 * @prop {string} locale - BCP 47 tag used for month and weekday names. Defaults to the document's `lang`, then the browser's language.
 * @prop {0|1|2|3|4|5|6|7} firstDayOfWeek - Which day the week starts on, 1 = Monday … 7 = Sunday.
 *   0 (the default) follows the locale's own convention. An unrecognised value falls back to 0
 *   rather than reaching weekdayOffset() and reordering the week arbitrarily.
 */
export class ArcCalendar extends DeclaredPropsMixin(LitElement) {
  static properties = {
    locale: { type: String },
    firstDayOfWeek: oneOf([0, 1, 2, 3, 4, 5, 6, 7], {
      default: 0,
      attribute: 'first-day-of-week',
    }),
    value: { type: String },
    min: { type: String },
    max: { type: String },
    month: int({ default: () => new Date().getMonth(), min: 0, max: 11, clamp: 'toRange' }),
    year: int({ default: () => new Date().getFullYear() }),
    _focusedDay: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        font-family: var(--font-body);
      }

      .calendar {
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--space-md);
        min-width: 280px;
      }

      .calendar__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-md);
      }

      .calendar__title {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        font-weight: 600;
        color: var(--text-primary);
      }

      .calendar__nav {
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

      .calendar__nav:hover {
        background: var(--surface-overlay);
        color: var(--text-primary);
      }

      .calendar__nav:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .calendar__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        text-align: center;
      }

      .calendar__row {
        display: contents;
      }

      .calendar__dow {
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        font-weight: 600;
        color: var(--text-muted);
        padding: var(--space-xs) 0;
        text-transform: uppercase;
      }

      .calendar__day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        margin: 0 auto;
        font-family: var(--font-mono);
        font-size: var(--_text-sm);
        color: var(--text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        position: relative;
      }

      .calendar__day:hover:not(:disabled) {
        background: rgba(var(--interactive-rgb), 0.1);
        color: var(--text-primary);
      }

      .calendar__day--today {
        box-shadow: inset 0 0 0 1px var(--border-bright);
      }

      .calendar__day--selected {
        background: var(--interactive) !important;
        color: var(--text-primary) !important;
        font-weight: 600;
      }

      .calendar__day--outside {
        color: var(--text-muted);
        opacity: 0.3;
      }

      .calendar__day:disabled {
        opacity: 0.25;
        cursor: not-allowed;
      }

      .calendar__day:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .calendar__day--focused {
        box-shadow: var(--interactive-focus-inset);
      }
    `,
  ];

  constructor() {
    super();
    this.locale = '';
    this.value = '';
    this.min = '';
    this.max = '';
    this._focusedDay = null;
  }
  /** The week's first day: an explicit prop, else whatever the locale says. */
  get _firstDay() {
    return this.firstDayOfWeek || firstDayOfWeek(this.locale || undefined);
  }

  get _todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  _toISO(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  _isDisabled(iso) {
    if (this.min && iso < this.min) return true;
    if (this.max && iso > this.max) return true;
    return false;
  }

  _getCalendarDays() {
    // Leading blanks count from the locale's first day, not from Sunday.
    const firstDay = weekdayOffset(new Date(this.year, this.month, 1), this._firstDay);
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const daysInPrev = new Date(this.year, this.month, 0).getDate();

    const days = [];

    // Previous month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrev - i;
      const m = this.month === 0 ? 11 : this.month - 1;
      const y = this.month === 0 ? this.year - 1 : this.year;
      days.push({ day, month: m, year: y, outside: true });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, month: this.month, year: this.year, outside: false });
    }

    // Next month fill
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = this.month === 11 ? 0 : this.month + 1;
      const y = this.month === 11 ? this.year + 1 : this.year;
      days.push({ day: d, month: m, year: y, outside: true });
    }

    return days;
  }

  _prevMonth() {
    if (this.month === 0) {
      this.month = 11;
      this.year--;
    } else {
      this.month--;
    }
    this._dispatchMonthChange();
  }

  _nextMonth() {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else {
      this.month++;
    }
    this._dispatchMonthChange();
  }

  _dispatchMonthChange() {
    this.dispatchEvent(
      new CustomEvent('arc-month-change', {
        detail: { month: this.month, year: this.year },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _selectDate(iso) {
    if (this._isDisabled(iso)) return;
    this.value = iso;

    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: iso },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onKeyDown(e) {
    if (!this._focusedDay) {
      // Initialize focused day from value or today
      const v = this.value || this._todayISO;
      const parts = v.split('-');
      this._focusedDay = { year: +parts[0], month: +parts[1] - 1, day: +parts[2] };
    }

    let { year, month, day } = this._focusedDay;
    let handled = true;

    switch (e.key) {
      case 'ArrowRight':
        day++;
        break;
      case 'ArrowLeft':
        day--;
        break;
      case 'ArrowDown':
        day += 7;
        break;
      case 'ArrowUp':
        day -= 7;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._selectDate(this._toISO(year, month, day));
        return;
      default:
        handled = false;
    }

    if (!handled) return;
    e.preventDefault();

    // Normalize date
    const d = new Date(year, month, day);
    this._focusedDay = { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };

    // Navigate months if needed
    if (d.getMonth() !== this.month || d.getFullYear() !== this.year) {
      this.month = d.getMonth();
      this.year = d.getFullYear();
      this._dispatchMonthChange();
    }

    this.requestUpdate();
  }

  render() {
    const days = this._getCalendarDays();
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    const today = this._todayISO;

    return html`
      <div class="calendar" part="calendar" @keydown=${this._onKeyDown} tabindex="0">
        <div class="calendar__header" part="header">
          <button class="calendar__nav" @click=${this._prevMonth} aria-label="Previous month" part="nav-prev">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M6.5 1.5L3 5L6.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="calendar__title" part="title">${monthNames('long', this.locale || undefined)[this.month]} ${this.year}</span>
          <button class="calendar__nav" @click=${this._nextMonth} aria-label="Next month" part="nav-next">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M3.5 1.5L7 5L3.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="calendar__grid" role="grid" part="grid">
          <div class="calendar__row" role="row">
            ${weekdayNames('short', this.locale || undefined, this._firstDay).map((d) => html`<div class="calendar__dow" role="columnheader" part="dow">${d}</div>`)}
          </div>

          ${weeks.map(
            (week) => html`
            <div class="calendar__row" role="row">
              ${week.map(({ day, month, year, outside }) => {
                const iso = this._toISO(year, month, day);
                const isToday = iso === today;
                const isSelected = iso === this.value;
                const isDisabled = this._isDisabled(iso);
                const isFocused =
                  this._focusedDay &&
                  this._focusedDay.year === year &&
                  this._focusedDay.month === month &&
                  this._focusedDay.day === day;

                return html`
                  <button
                    class="calendar__day ${outside ? 'calendar__day--outside' : ''} ${isToday ? 'calendar__day--today' : ''} ${isSelected ? 'calendar__day--selected' : ''} ${isFocused ? 'calendar__day--focused' : ''}"
                    ?disabled=${isDisabled}
                    @click=${() => this._selectDate(iso)}
                    role="gridcell"
                    aria-label="${monthNames('long', this.locale || undefined)[month]} ${day}, ${year}"
                    aria-selected=${isSelected ? 'true' : 'false'}
                    part="day"
                  >${day}</button>
                `;
              })}
            </div>
          `,
          )}
        </div>
      </div>
    `;
  }
}
