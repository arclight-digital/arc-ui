import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-date-picker
 */
export class ArcDatePicker extends LitElement {
  static properties = {
    value:       { type: String },
    min:         { type: String },
    max:         { type: String },
    placeholder: { type: String },
    disabled:    { type: Boolean, reflect: true },
    label:       { type: String },
    _open:       { state: true },
    _viewMonth:  { state: true },
    _viewYear:   { state: true },
    _mode:       { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-block; font-family: var(--font-body); position: relative; }
      :host([disabled]) { opacity: 0.5; pointer-events: none; }

      .wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      label {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      input {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        padding-right: 36px;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        cursor: pointer;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      input::placeholder { color: var(--text-muted); }
      input:hover:not(:focus) { border-color: var(--border-bright); }
      input:focus { outline: none; border-color: rgba(var(--interactive-rgb), 0.4); box-shadow: var(--interactive-focus); }

      .calendar-icon {
        position: absolute;
        right: var(--space-sm);
        color: var(--text-muted);
        font-size: var(--text-sm);
        pointer-events: none;
      }

      .dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: var(--z-dropdown);
        margin-top: var(--space-xs);
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        padding: var(--space-sm);
        min-width: 280px;
        animation: dropdown-in var(--transition-fast);
      }

      @keyframes dropdown-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-xs) 0;
        margin-bottom: var(--space-xs);
      }

      .calendar-title {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--text-primary);
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .calendar-title:hover {
        color: var(--interactive);
        background: var(--surface-hover);
      }

      .calendar-title:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .picker-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-xs);
      }

      .picker-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-sm) var(--space-xs);
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 500;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .picker-cell:hover {
        background: var(--surface-overlay);
        color: var(--text-primary);
      }

      .picker-cell.current {
        background: var(--interactive);
        color: var(--surface-base);
        font-weight: 600;
      }

      .picker-cell:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .nav-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: var(--text-md);
        padding: var(--space-xs);
        border-radius: var(--radius-sm);
        line-height: 1;
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .nav-btn:hover {
        color: var(--text-primary);
        background: var(--surface-overlay);
      }

      .nav-btn:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        margin-bottom: var(--space-xs);
      }

      .weekday {
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--text-muted);
        padding: var(--space-xs) 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }

      .day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        margin: 0 auto;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        position: relative;
      }

      .day:hover:not(.disabled):not(.empty) {
        background: var(--surface-overlay);
        color: var(--text-primary);
      }

      .day:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .day.today {
        box-shadow: inset 0 0 0 1px var(--border-bright);
      }

      .day.selected {
        background: var(--interactive);
        color: var(--text-primary);
        font-weight: 600;
      }

      .day.selected.today {
        box-shadow: none;
      }

      .day.disabled {
        color: var(--text-muted);
        opacity: 0.3;
        cursor: default;
      }

      .day.outside {
        color: var(--text-muted);
        opacity: 0.4;
      }

      .day.empty {
        visibility: hidden;
      }

      @media (prefers-reduced-motion: reduce) {
        .dropdown { animation: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.min = '';
    this.max = '';
    this.placeholder = 'Select date';
    this.disabled = false;
    this.label = '';
    this._open = false;
    this._mode = 'days'; // 'days' | 'months' | 'years'

    this._viewMonth = null;
    this._viewYear = null;

    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleEscape = this._handleEscape.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._viewMonth === null || this._viewYear === null) {
      const today = new Date();
      this._viewMonth = today.getMonth();
      this._viewYear = today.getFullYear();
    }
    document.addEventListener('click', this._handleOutsideClick);
    document.addEventListener('keydown', this._handleEscape);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
    document.removeEventListener('keydown', this._handleEscape);
  }

  _handleOutsideClick(e) {
    if (this._open && !e.composedPath().includes(this)) {
      this._open = false;
    }
  }

  _handleEscape(e) {
    if (this._open && e.key === 'Escape') {
      this._open = false;
      this.shadowRoot.querySelector('input')?.focus();
    }
  }

  _toggleDropdown() {
    if (this.disabled) return;
    this._open = !this._open;

    if (!this._open) this._mode = 'days';
    if (this._open && this.value) {
      const d = new Date(this.value + 'T00:00:00');
      if (!isNaN(d)) {
        this._viewMonth = d.getMonth();
        this._viewYear = d.getFullYear();
      }
    }
  }

  _cycleMode() {
    if (this._mode === 'days') this._mode = 'months';
    else if (this._mode === 'months') this._mode = 'years';
    else this._mode = 'days';
  }

  _selectMonth(month) {
    this._viewMonth = month;
    this._mode = 'days';
  }

  _selectYear(year) {
    this._viewYear = year;
    this._mode = 'months';
  }

  _prevMonth() {
    if (this._viewMonth === 0) {
      this._viewMonth = 11;
      this._viewYear--;
    } else {
      this._viewMonth--;
    }
  }

  _nextMonth() {
    if (this._viewMonth === 11) {
      this._viewMonth = 0;
      this._viewYear++;
    } else {
      this._viewMonth++;
    }
  }

  _prev() {
    if (this._mode === 'days') this._prevMonth();
    else if (this._mode === 'months') this._viewYear--;
    else this._viewYear -= 12;
  }

  _next() {
    if (this._mode === 'days') this._nextMonth();
    else if (this._mode === 'months') this._viewYear++;
    else this._viewYear += 12;
  }

  _selectDate(dateStr) {
    this.value = dateStr;
    this._open = false;

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _isDisabledDate(dateStr) {
    if (this.min && dateStr < this.min) return true;
    if (this.max && dateStr > this.max) return true;
    return false;
  }

  _toISO(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  _getMonthName(month) {
    const names = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return names[month];
  }

  _formatDisplay(isoDate) {
    if (!isoDate) return '';
    const d = new Date(isoDate + 'T00:00:00');
    if (isNaN(d)) return isoDate;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  _buildCalendarDays() {
    const year = this._viewYear;
    const month = this._viewMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const todayISO = this._toISO(today.getFullYear(), today.getMonth(), today.getDate());

    const days = [];

    // Previous month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const iso = this._toISO(prevYear, prevMonth, day);
      days.push({ day, iso, outside: true, disabled: this._isDisabledDate(iso) });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = this._toISO(year, month, d);
      days.push({
        day: d,
        iso,
        outside: false,
        today: iso === todayISO,
        selected: iso === this.value,
        disabled: this._isDisabledDate(iso),
      });
    }

    // Next month fill — fill to 42 cells (6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const iso = this._toISO(nextYear, nextMonth, d);
      days.push({ day: d, iso, outside: true, disabled: this._isDisabledDate(iso) });
    }

    return days;
  }

  render() {
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const days = this._buildCalendarDays();

    return html`
      <div class="wrapper" part="wrapper">
        ${this.label ? html`<label part="label">${this.label}</label>` : ''}

        <div class="input-wrapper" part="input-wrapper">
          <input
            part="input"
            type="text"
            readonly
            .value=${this._formatDisplay(this.value)}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            aria-haspopup="dialog"
            aria-expanded=${this._open ? 'true' : 'false'}
            aria-label=${this.label || 'Choose date'}
            @click=${this._toggleDropdown}
          />
          <span class="calendar-icon" aria-hidden="true">\u{1F4C5}</span>
        </div>

        ${this._open ? html`
          <div class="dropdown" part="dropdown" role="dialog" aria-label="Date picker">
            <div class="calendar-header">
              <button class="nav-btn" @click=${this._prev} aria-label="Previous">\u2039</button>
              <button class="calendar-title" @click=${this._cycleMode}>
                ${this._mode === 'days' ? `${this._getMonthName(this._viewMonth)} ${this._viewYear}`
                  : this._mode === 'months' ? `${this._viewYear}`
                  : `${this._viewYear - 5} – ${this._viewYear + 6}`}
              </button>
              <button class="nav-btn" @click=${this._next} aria-label="Next">\u203A</button>
            </div>

            ${this._mode === 'days' ? html`
              <div class="weekdays">
                ${weekdays.map(d => html`<span class="weekday">${d}</span>`)}
              </div>
              <div class="days" role="grid" aria-label="Calendar">
                ${days.map(d => html`
                  <button
                    class="day ${d.outside ? 'outside' : ''} ${d.today ? 'today' : ''} ${d.selected ? 'selected' : ''} ${d.disabled ? 'disabled' : ''}"
                    ?disabled=${d.disabled}
                    @click=${() => !d.disabled && this._selectDate(d.iso)}
                    aria-label="${d.iso}"
                    aria-selected=${d.selected ? 'true' : 'false'}
                    role="gridcell"
                  >${d.day}</button>
                `)}
              </div>
            ` : this._mode === 'months' ? html`
              <div class="picker-grid">
                ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((name, i) => html`
                  <button
                    class="picker-cell ${i === this._viewMonth ? 'current' : ''}"
                    @click=${() => this._selectMonth(i)}
                  >${name}</button>
                `)}
              </div>
            ` : html`
              <div class="picker-grid">
                ${Array.from({ length: 12 }, (_, i) => this._viewYear - 5 + i).map(y => html`
                  <button
                    class="picker-cell ${y === this._viewYear ? 'current' : ''}"
                    @click=${() => this._selectYear(y)}
                  >${y}</button>
                `)}
              </div>
            `}
          </div>
        ` : ''}
      </div>
    `;
  }
}
