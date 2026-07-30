import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { monthNames, weekdayNames, firstDayOfWeek, weekdayOffset } from '../shared/date-names.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import { PositionController } from '../shared/position-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';

/**
 * Calendar-based date picker with keyboard navigation.
 *
 * @tag arc-date-picker
 * @prop {string} value - The selected date as an ISO string (YYYY-MM-DD). Set this to pre-select a date. Updated when the user picks a date from the calendar.
 * @prop {string} min - Minimum selectable date as an ISO string. Dates before this are visually dimmed and non-interactive.
 * @prop {string} max - Maximum selectable date as an ISO string. Dates after this are visually dimmed and non-interactive.
 * @prop {string} placeholder - Placeholder text displayed in the input when no date is selected.
 * @prop {boolean} disabled - Disables the date picker, reducing opacity and preventing the calendar from opening.
 * @prop {string} label - Label text rendered above the input in uppercase accent font styling.
 * @prop {boolean} open - Whether the calendar dropdown is visible. Reflected so it can be opened programmatically or styled from CSS.
 * @prop {string} locale - BCP 47 tag used for month and weekday names. Defaults to the document's `lang`, then the browser's language.
 * @prop {number} firstDayOfWeek - Which day the week starts on, 1 = Monday … 7 = Sunday. Defaults to the locale's own convention, so most of the world gets Monday and the US gets Sunday without configuring anything.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when a date is selected
 * @csspart wrapper
 * @csspart label
 * @csspart input-wrapper
 * @csspart input
 * @csspart dropdown
 */
export class ArcDatePicker extends FormControlMixin(LitElement) {
  static properties = {
    value:       { type: String, reflect: true },
    name:        { type: String, reflect: true },
    min:         { type: String },
    max:         { type: String },
    placeholder: { type: String },
    disabled:    { type: Boolean, reflect: true },
    label:       { type: String },
    open:        { type: Boolean, reflect: true },
    locale:      { type: String },
    firstDayOfWeek: { type: Number, attribute: 'first-day-of-week' },
    _viewMonth:  { state: true },
    _viewYear:   { state: true },
    _mode:       { state: true },
    _focusedIso: { state: true },
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
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
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
        font-size: var(--_text-sm);
        color: var(--text-primary);
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        padding-inline-end: 36px;
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
        inset-inline-end: var(--space-sm);
        color: var(--text-muted);
        font-size: var(--_text-sm);
        pointer-events: none;
      }

      .dropdown {
        position: absolute;
        top: 100%;
        inset-inline-start: 0;
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
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
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
        font-family: var(--font-label);
        font-size: var(--_text-xs);
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
        font-size: var(--_text-md);
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
        font-size: var(--_text-xs);
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
        font-size: var(--_text-sm);
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
    // animate: false — this panel has its own keyframe entrance.
    managedPanelStyles('dropdown', { animate: false }),
  ];

  constructor() {
    super();
    this.value = '';
    this.name = '';
    this.min = '';
    this.max = '';
    this.placeholder = 'Select date';
    this.disabled = false;
    this.label = '';
    this.open = false;
    this.locale = '';
    this.firstDayOfWeek = 0;
    this._mode = 'days'; // 'days' | 'months' | 'years'
    this._focusedIso = null;

    this._viewMonth = null;
    this._viewYear = null;

    this._handleEscape = this._handleEscape.bind(this);
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => { this.open = false; },
      when: () => this.open,
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.input-wrapper'),
      floating: () => this.shadowRoot?.querySelector('.dropdown'),
      // The calendar sizes to its own content (min-width: 280px) and hangs off
      // the input's left edge — matching the input's width instead would squash
      // a narrow field's calendar or stretch a wide one's.
      align: () => 'start',
      offset: 4,
    });
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._viewMonth === null || this._viewYear === null) {
      const today = new Date();
      this._viewMonth = today.getMonth();
      this._viewYear = today.getFullYear();
    }
    document.addEventListener('keydown', this._handleEscape);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleEscape);
  }

  _handleEscape(e) {
    if (this.open && e.key === 'Escape') {
      this.open = false;
      this.shadowRoot.querySelector('input')?.focus();
    }
  }

  _toggleDropdown() {
    if (this.disabled || this.readonly) return;
    this.open = !this.open;

    if (!this.open) this._mode = 'days';
    if (this.open) {
      this._focusedIso = null;
      if (this.value) {
        const d = new Date(this.value + 'T00:00:00');
        if (!isNaN(d)) {
          this._viewMonth = d.getMonth();
          this._viewYear = d.getFullYear();
        }
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
    this.open = false;

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

  /** The week's first day: an explicit prop, else whatever the locale says. */
  get _firstDay() {
    return this.firstDayOfWeek || firstDayOfWeek(this.locale || undefined);
  }

  _getMonthName(month) {
    return monthNames('long', this.locale || undefined)[month];
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
    // Leading blanks are counted from the locale's first day, not from Sunday.
    const firstDay = weekdayOffset(new Date(year, month, 1), this._firstDay);
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

  /** ISO of the single day button that should be the tab stop (roving tabindex) */
  _getTabStopIso(days) {
    if (this._focusedIso && days.some(d => d.iso === this._focusedIso && !d.disabled)) {
      return this._focusedIso;
    }
    const selected = days.find(d => d.selected && !d.disabled);
    if (selected) return selected.iso;
    const today = days.find(d => d.today && !d.disabled);
    if (today) return today.iso;
    const first = days.find(d => !d.outside && !d.disabled) || days.find(d => !d.disabled);
    return first ? first.iso : null;
  }

  /** Human-readable label for a day button, e.g. "July 13, 2026" */
  _dayAriaLabel(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${this._getMonthName(m - 1)} ${d}, ${y}`;
  }

  _onDaysKeydown(e) {
    const iso = e.target?.dataset?.iso;
    if (!iso) return;

    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return;

    let handled = true;
    switch (e.key) {
      case 'ArrowRight': d.setDate(d.getDate() + 1); break;
      case 'ArrowLeft': d.setDate(d.getDate() - 1); break;
      case 'ArrowDown': d.setDate(d.getDate() + 7); break;
      case 'ArrowUp': d.setDate(d.getDate() - 7); break;
      case 'Home': d.setDate(d.getDate() - d.getDay()); break;
      case 'End': d.setDate(d.getDate() + (6 - d.getDay())); break;
      default:
        handled = false;
    }

    if (!handled) return;
    e.preventDefault();

    const nextIso = this._toISO(d.getFullYear(), d.getMonth(), d.getDate());
    if (this._isDisabledDate(nextIso)) return;

    this._focusedIso = nextIso;

    // Navigate months if the target day is outside the visible month
    if (d.getMonth() !== this._viewMonth || d.getFullYear() !== this._viewYear) {
      this._viewMonth = d.getMonth();
      this._viewYear = d.getFullYear();
    }

    this.updateComplete.then(() => {
      this.shadowRoot.querySelector(`.day[data-iso="${nextIso}"]`)?.focus();
    });
  }

  updated(changed) {
    if (changed.has('open')) {
      this.open ? this._position.show() : this._position.hide();
      this.open ? this._clickOutside.activate() : this._clickOutside.deactivate();
    }
    if (changed.has('value')) {
      this._updateFormValue();
    }
    if (changed.has('open') && this.open && this._mode === 'days') {
      // Move focus to the roving tab stop when the popup opens
      this.updateComplete.then(() => {
        this.shadowRoot.querySelector('.day[tabindex="0"]')?.focus();
      });
    }
  }

  render() {
    const weekdays = weekdayNames('short', this.locale || undefined, this._firstDay);
    const days = this._buildCalendarDays();
    const tabStopIso = this._getTabStopIso(days);

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
            role="combobox"
            aria-haspopup="dialog"
            aria-expanded=${this.open ? 'true' : 'false'}
            aria-label=${this.label || 'Choose date'}
            @click=${this._toggleDropdown}
          />
          <span class="calendar-icon" aria-hidden="true">\u{1F4C5}</span>
        </div>

        ${this.open ? html`
          <div class="dropdown" part="dropdown" role="dialog" aria-label="Date picker">
            <div class="calendar-header">
              <button class="nav-btn" @click=${this._prev} aria-label=${this._mode === 'days' ? 'Previous month' : this._mode === 'months' ? 'Previous year' : 'Previous years'}>\u2039</button>
              <button class="calendar-title" @click=${this._cycleMode}>
                ${this._mode === 'days' ? `${this._getMonthName(this._viewMonth)} ${this._viewYear}`
                  : this._mode === 'months' ? `${this._viewYear}`
                  : `${this._viewYear - 5} – ${this._viewYear + 6}`}
              </button>
              <button class="nav-btn" @click=${this._next} aria-label=${this._mode === 'days' ? 'Next month' : this._mode === 'months' ? 'Next year' : 'Next years'}>\u203A</button>
            </div>

            ${this._mode === 'days' ? html`
              <div class="weekdays">
                ${weekdays.map(d => html`<span class="weekday">${d}</span>`)}
              </div>
              <div class="days" role="group" aria-label="Calendar days" @keydown=${this._onDaysKeydown}>
                ${days.map(d => html`
                  <button
                    class="day ${d.outside ? 'outside' : ''} ${d.today ? 'today' : ''} ${d.selected ? 'selected' : ''} ${d.disabled ? 'disabled' : ''}"
                    ?disabled=${d.disabled}
                    tabindex=${d.iso === tabStopIso ? '0' : '-1'}
                    data-iso=${d.iso}
                    @click=${() => !d.disabled && this._selectDate(d.iso)}
                    aria-label="${this._dayAriaLabel(d.iso)}"
                    aria-pressed=${d.selected ? 'true' : 'false'}
                  >${d.day}</button>
                `)}
              </div>
            ` : this._mode === 'months' ? html`
              <div class="picker-grid">
                ${monthNames('short', this.locale || undefined).map((name, i) => html`
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
