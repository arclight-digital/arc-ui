import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-calendar
 */
export class ArcCalendar extends LitElement {
  static properties = {
    value:  { type: String },
    min:    { type: String },
    max:    { type: String },
    month:  { type: Number },
    year:   { type: Number },
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
        background: var(--bg-card);
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
        font-size: var(--text-sm);
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
        background: var(--bg-elevated);
        color: var(--text-primary);
      }

      .calendar__nav:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .calendar__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        text-align: center;
      }

      .calendar__dow {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
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
        font-size: var(--text-sm);
        color: var(--text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        position: relative;
      }

      .calendar__day:hover:not(:disabled) {
        background: rgba(var(--accent-primary-rgb), 0.1);
        color: var(--text-primary);
      }

      .calendar__day--today {
        box-shadow: inset 0 0 0 1px var(--border-bright);
      }

      .calendar__day--selected {
        background: var(--accent-primary) !important;
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
        box-shadow: var(--focus-glow);
      }

      .calendar__day--focused {
        box-shadow: inset 0 0 0 2px var(--accent-primary);
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

  constructor() {
    super();
    const now = new Date();
    this.value = '';
    this.min = '';
    this.max = '';
    this.month = now.getMonth();
    this.year = now.getFullYear();
    this._focusedDay = null;
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
    const firstDay = new Date(this.year, this.month, 1).getDay();
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
    this.dispatchEvent(new CustomEvent('arc-navigate', {
      detail: { month: this.month, year: this.year },
      bubbles: true,
      composed: true,
    }));
  }

  _selectDate(iso) {
    if (this._isDisabled(iso)) return;
    this.value = iso;

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: iso },
      bubbles: true,
      composed: true,
    }));
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
      case 'ArrowRight': day++; break;
      case 'ArrowLeft': day--; break;
      case 'ArrowDown': day += 7; break;
      case 'ArrowUp': day -= 7; break;
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
    const today = this._todayISO;

    return html`
      <div class="calendar" part="calendar" @keydown=${this._onKeyDown} tabindex="0">
        <div class="calendar__header" part="header">
          <button class="calendar__nav" @click=${this._prevMonth} aria-label="Previous month" part="nav-prev">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M6.5 1.5L3 5L6.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="calendar__title" part="title">${ArcCalendar._MONTHS[this.month]} ${this.year}</span>
          <button class="calendar__nav" @click=${this._nextMonth} aria-label="Next month" part="nav-next">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M3.5 1.5L7 5L3.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="calendar__grid" role="grid" part="grid">
          ${ArcCalendar._DAYS.map(d => html`<div class="calendar__dow" part="dow">${d}</div>`)}

          ${days.map(({ day, month, year, outside }) => {
            const iso = this._toISO(year, month, day);
            const isToday = iso === today;
            const isSelected = iso === this.value;
            const isDisabled = this._isDisabled(iso);
            const isFocused = this._focusedDay &&
              this._focusedDay.year === year &&
              this._focusedDay.month === month &&
              this._focusedDay.day === day;

            return html`
              <button
                class="calendar__day ${outside ? 'calendar__day--outside' : ''} ${isToday ? 'calendar__day--today' : ''} ${isSelected ? 'calendar__day--selected' : ''} ${isFocused ? 'calendar__day--focused' : ''}"
                ?disabled=${isDisabled}
                @click=${() => this._selectDate(iso)}
                aria-label="${ArcCalendar._MONTHS[month]} ${day}, ${year}"
                aria-pressed=${isSelected ? 'true' : 'false'}
                part="day"
              >${day}</button>
            `;
          })}
        </div>
      </div>
    `;
  }
}
