import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { ClickOutsideController } from '../shared/click-outside.js';

/**
 * @tag arc-date-range-picker
 */
export class ArcDateRangePicker extends FormControlMixin(LitElement) {
  static properties = {
    start:       { type: String },
    end:         { type: String },
    name:        { type: String, reflect: true },
    min:         { type: String },
    max:         { type: String },
    months:      { type: Number },
    presets:     { type: Array },
    placeholder: { type: String },
    disabled:    { type: Boolean, reflect: true },
    required:    { type: Boolean, reflect: true },
    label:       { type: String },
    _open:        { state: true },
    _viewMonth:   { state: true },
    _viewYear:    { state: true },
    _focusedIso:  { state: true },
    _previewIso:  { state: true },
    _announcement:{ state: true },
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
        min-height: var(--touch-min);
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
        width: max-content;
        max-width: min(720px, calc(100vw - var(--space-lg)));
        animation: dropdown-in var(--transition-fast);
      }

      @keyframes dropdown-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .layout {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
      }

      .presets {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 0 0 auto;
        min-width: 132px;
        padding: var(--space-xs);
        border-right: 1px solid var(--border-default);
      }

      .preset {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        text-align: left;
        color: var(--text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-sm);
        padding: var(--space-xs) var(--space-sm);
        min-height: var(--touch-min);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .preset:hover {
        background: var(--surface-overlay);
        color: var(--text-primary);
      }

      .preset:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .calendars {
        flex: 1 1 auto;
        min-width: 0;
      }

      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-xs) var(--space-xs) 0;
      }

      .nav-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: var(--text-md);
        padding: var(--space-xs) var(--space-sm);
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

      /* Panels sit side by side; they wrap into a vertical stack when the
         available width falls below roughly two panel widths (~640px). */
      .panels {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-md);
        padding: 0 var(--space-xs) var(--space-xs);
      }

      .panel {
        flex: 1 1 264px;
        min-width: 264px;
      }

      .panel-title {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--text-primary);
        text-align: center;
        padding: var(--space-xs) 0;
        margin-bottom: var(--space-xs);
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

      /* No column gap: in-range backgrounds must form a continuous bar */
      .days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px 0;
      }

      .day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 36px;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        position: relative;
      }

      .day:hover:not(.disabled):not(.empty):not(.in-range):not(.selected) {
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

      .day.in-range,
      .day.range-start,
      .day.range-end {
        background: rgba(var(--interactive-rgb), 0.08);
        color: var(--text-primary);
        border-radius: 0;
      }

      .day.range-start { border-radius: var(--radius-full) 0 0 var(--radius-full); }
      .day.range-end { border-radius: 0 var(--radius-full) var(--radius-full) 0; }
      .day.range-start.range-end { border-radius: var(--radius-full); }

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

      .day.empty {
        visibility: hidden;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        .dropdown { animation: none; }
        .day, .preset, .nav-btn, input { transition: none; }
      }
    `,
  ];

  static _MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  constructor() {
    super();
    this.start = '';
    this.end = '';
    this.name = '';
    this.min = '';
    this.max = '';
    this.months = 2;
    this.presets = [];
    this.placeholder = 'Select date range';
    this.disabled = false;
    this.required = false;
    this.label = '';
    this._open = false;
    this._viewMonth = null;
    this._viewYear = null;
    this._focusedIso = null;
    this._previewIso = null;
    this._announcement = '';

    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => { this._open = false; },
      when: () => this._open,
    });
    this._handleEscape = this._handleEscape.bind(this);
  }

  /** ISO 8601 interval ("start/end") when the range is complete, else ''. */
  get value() {
    return this.start && this.end ? `${this.start}/${this.end}` : '';
  }

  set value(v) {
    const [s = '', e = ''] = (v || '').split('/');
    this.start = s;
    this.end = e;
  }

  _formValue() {
    return this.value || null;
  }

  _formResetState() {
    return { start: this.start, end: this.end };
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
    if (this._open && e.key === 'Escape') {
      this._open = false;
      this.shadowRoot.querySelector('input')?.focus();
    }
  }

  get _monthCount() {
    return Math.max(1, Math.floor(Number(this.months)) || 1);
  }

  _toggleDropdown() {
    if (this.disabled) return;
    this._open = !this._open;
    if (this._open) {
      this._focusedIso = null;
      this._previewIso = null;
      const anchor = this.start || this.end;
      if (anchor) {
        const d = new Date(anchor + 'T00:00:00');
        if (!isNaN(d)) {
          this._viewMonth = d.getMonth();
          this._viewYear = d.getFullYear();
        }
      }
    }
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

  _selectDay(iso) {
    if (this._isDisabledDate(iso)) return;
    this._focusedIso = iso;

    if (!this.start || (this.start && this.end)) {
      // First click, or third click starting a new range
      this.start = iso;
      this.end = '';
      this._previewIso = null;
      this._announcement = 'Start date set. Choose end date.';
      return;
    }

    // Second click: commit the range (auto-swap if before start)
    if (iso < this.start) {
      this.end = this.start;
      this.start = iso;
    } else {
      this.end = iso;
    }
    this._previewIso = null;
    this._announcement = `Range: ${this._dayAriaLabel(this.start)} to ${this._dayAriaLabel(this.end)}.`;
    this._open = false;
    this.shadowRoot.querySelector('input')?.focus();

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { start: this.start, end: this.end },
      bubbles: true,
      composed: true,
    }));
  }

  _applyPreset(preset) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (Math.max(1, preset.days) - 1));
    this.start = this._toISO(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    this.end = this._toISO(today.getFullYear(), today.getMonth(), today.getDate());
    this._previewIso = null;
    this._announcement = `Range: ${this._dayAriaLabel(this.start)} to ${this._dayAriaLabel(this.end)}.`;
    this._open = false;
    this.shadowRoot.querySelector('input')?.focus();

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { start: this.start, end: this.end },
      bubbles: true,
      composed: true,
    }));
  }

  _isDisabledDate(iso) {
    if (this.min && iso < this.min) return true;
    if (this.max && iso > this.max) return true;
    return false;
  }

  _toISO(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  _formatDisplay() {
    if (!this.start && !this.end) return '';
    const fmt = (iso, opts) => {
      const d = new Date(iso + 'T00:00:00');
      return isNaN(d) ? iso : new Intl.DateTimeFormat('en-US', opts).format(d);
    };
    const full = { month: 'short', day: 'numeric', year: 'numeric' };
    if (this.start && !this.end) return `${fmt(this.start, full)} – `;
    if (!this.start) return fmt(this.end, full);
    const sameYear = this.start.slice(0, 4) === this.end.slice(0, 4);
    const startStr = fmt(this.start, sameYear ? { month: 'short', day: 'numeric' } : full);
    return `${startStr} – ${fmt(this.end, full)}`;
  }

  /** Visible months as { month, year } starting at the current view. */
  _visibleMonths() {
    const panels = [];
    for (let i = 0; i < this._monthCount; i++) {
      const d = new Date(this._viewYear, this._viewMonth + i, 1);
      panels.push({ month: d.getMonth(), year: d.getFullYear() });
    }
    return panels;
  }

  /** Day cells for one panel; outside-month cells render as hidden fillers
      so a date never appears twice across adjacent panels. */
  _buildPanelDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const todayISO = this._toISO(today.getFullYear(), today.getMonth(), today.getDate());

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ empty: true });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = this._toISO(year, month, d);
      days.push({
        day: d,
        iso,
        today: iso === todayISO,
        disabled: this._isDisabledDate(iso),
      });
    }
    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) days.push({ empty: true });
    return days;
  }

  /** The displayed range [lo, hi]: committed, or a hover/focus preview. */
  _displayRange() {
    if (this.start && this.end) return { lo: this.start, hi: this.end };
    if (this.start && this._previewIso && this._previewIso !== this.start) {
      return this._previewIso < this.start
        ? { lo: this._previewIso, hi: this.start }
        : { lo: this.start, hi: this._previewIso };
    }
    if (this.start) return { lo: this.start, hi: this.start };
    return null;
  }

  /** ISO of the single day button acting as the roving tab stop. */
  _getTabStopIso(allDays) {
    const enabled = (iso) => allDays.some(d => d.iso === iso && !d.disabled);
    if (this._focusedIso && enabled(this._focusedIso)) return this._focusedIso;
    if (this.start && enabled(this.start)) return this.start;
    if (this.end && enabled(this.end)) return this.end;
    const today = allDays.find(d => d.today && !d.disabled);
    if (today) return today.iso;
    const first = allDays.find(d => !d.empty && !d.disabled);
    return first ? first.iso : null;
  }

  /** Human-readable label, e.g. "July 13, 2026, range start" */
  _dayAriaLabel(iso, suffix = '') {
    const [y, m, d] = iso.split('-').map(Number);
    return `${ArcDateRangePicker._MONTHS[m - 1]} ${d}, ${y}${suffix}`;
  }

  /** Page the view so the given date is visible, keeping it in the
      nearest edge panel. */
  _ensureVisible(d) {
    const first = new Date(this._viewYear, this._viewMonth, 1);
    const afterLast = new Date(this._viewYear, this._viewMonth + this._monthCount, 1);
    if (d < first) {
      this._viewMonth = d.getMonth();
      this._viewYear = d.getFullYear();
    } else if (d >= afterLast) {
      const target = new Date(d.getFullYear(), d.getMonth() - (this._monthCount - 1), 1);
      this._viewMonth = target.getMonth();
      this._viewYear = target.getFullYear();
    }
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
      case 'PageUp': this._shiftMonthClamped(d, -1); break;
      case 'PageDown': this._shiftMonthClamped(d, 1); break;
      default:
        handled = false;
    }

    if (!handled) return;
    e.preventDefault();

    const nextIso = this._toISO(d.getFullYear(), d.getMonth(), d.getDate());
    if (this._isDisabledDate(nextIso)) return;

    this._focusedIso = nextIso;
    if (this.start && !this.end) this._previewIso = nextIso;
    this._ensureVisible(d);

    this.updateComplete.then(() => {
      this.shadowRoot.querySelector(`.day[data-iso="${nextIso}"]`)?.focus();
    });
  }

  /** Move a Date by whole months, clamping the day to the target month's end. */
  _shiftMonthClamped(d, delta) {
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + delta);
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, daysInMonth));
  }

  _onDaysOver(e) {
    const iso = e.target?.dataset?.iso;
    if (iso && this.start && !this.end && !this._isDisabledDate(iso)) {
      this._previewIso = iso;
    }
  }

  _onDaysLeave() {
    // Fall back to the keyboard-focused preview if the grid still has focus
    const active = this.shadowRoot.activeElement;
    this._previewIso = (this.start && !this.end && active?.dataset?.iso) || null;
  }

  _syncValidity() {
    const anchor = this.shadowRoot?.querySelector('input') ?? undefined;
    if (this.required && !(this.start && this.end)) {
      this._setValidity({ valueMissing: true }, 'Please select a date range.', anchor);
    } else {
      this._setValidity({});
    }
  }

  updated(changed) {
    if (changed.has('start') || changed.has('end')) {
      this._updateFormValue();
    }
    if (changed.has('start') || changed.has('end') || changed.has('required')) {
      this._syncValidity();
    }
    if (changed.has('_open')) {
      if (this._open) {
        this._clickOutside.activate();
        this.updateComplete.then(() => {
          this.shadowRoot.querySelector('.day[tabindex="0"]')?.focus();
        });
      } else {
        this._clickOutside.deactivate();
      }
    }
  }

  _renderPanel(panel, tabStopIso, range) {
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const days = this._buildPanelDays(panel.year, panel.month);
    const committed = Boolean(this.start && this.end);

    return html`
      <div
        class="panel"
        part="calendar"
        role="group"
        aria-label="${ArcDateRangePicker._MONTHS[panel.month]} ${panel.year}"
      >
        <div class="panel-title" part="panel-title">
          ${ArcDateRangePicker._MONTHS[panel.month]} ${panel.year}
        </div>
        <div class="weekdays">
          ${weekdays.map(d => html`<span class="weekday">${d}</span>`)}
        </div>
        <div
          class="days"
          @keydown=${this._onDaysKeydown}
          @mouseover=${this._onDaysOver}
          @mouseleave=${this._onDaysLeave}
        >
          ${days.map(d => {
            if (d.empty) return html`<span class="day empty" aria-hidden="true"></span>`;

            const isStart = d.iso === this.start;
            const isEnd = d.iso === this.end;
            const isLo = range && d.iso === range.lo;
            const isHi = range && d.iso === range.hi;
            const inRange = range && d.iso > range.lo && d.iso < range.hi;
            const selected = isStart || isEnd;
            const suffix = isStart ? ', range start' : isEnd ? ', range end'
              : (!committed && (isLo || isHi) && range.lo !== range.hi) ? ', range end' : '';

            return html`
              <button
                class="day ${d.today ? 'today' : ''} ${selected ? 'selected' : ''}
                  ${inRange ? 'in-range' : ''} ${isLo && range.lo !== range.hi ? 'range-start' : ''}
                  ${isHi && range.lo !== range.hi ? 'range-end' : ''} ${d.disabled ? 'disabled' : ''}"
                part="day"
                ?disabled=${d.disabled}
                tabindex=${d.iso === tabStopIso ? '0' : '-1'}
                data-iso=${d.iso}
                @click=${() => this._selectDay(d.iso)}
                aria-label="${this._dayAriaLabel(d.iso, suffix)}"
                aria-pressed=${selected ? 'true' : 'false'}
              >${d.day}</button>
            `;
          })}
        </div>
      </div>
    `;
  }

  render() {
    const panels = this._visibleMonths();
    const allDays = panels.flatMap(p => this._buildPanelDays(p.year, p.month)).filter(d => !d.empty);
    const tabStopIso = this._getTabStopIso(allDays);
    const range = this._displayRange();
    const hasPresets = Array.isArray(this.presets) && this.presets.length > 0;

    return html`
      <div class="wrapper" part="wrapper">
        ${this.label ? html`<label part="label">${this.label}</label>` : ''}

        <div class="input-wrapper" part="input-wrapper">
          <input
            part="input"
            type="text"
            readonly
            .value=${this._formatDisplay()}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            role="combobox"
            aria-haspopup="dialog"
            aria-expanded=${this._open ? 'true' : 'false'}
            aria-required=${this.required ? 'true' : 'false'}
            aria-label=${this.label || 'Choose date range'}
            @click=${this._toggleDropdown}
          />
          <span class="calendar-icon" aria-hidden="true">\u{1F4C5}</span>
        </div>

        <div class="sr-only" role="status" aria-live="polite">${this._announcement}</div>

        ${this._open ? html`
          <div class="dropdown" part="panel" role="dialog" aria-label="Date range picker">
            <div class="layout">
              ${hasPresets ? html`
                <div class="presets" part="presets" role="group" aria-label="Quick ranges">
                  ${this.presets.map(p => html`
                    <button class="preset" part="preset" @click=${() => this._applyPreset(p)}>
                      ${p.label}
                    </button>
                  `)}
                </div>
              ` : ''}

              <div class="calendars">
                <div class="calendar-header" part="header">
                  <button class="nav-btn" @click=${this._prevMonth} aria-label="Previous month">‹</button>
                  <button class="nav-btn" @click=${this._nextMonth} aria-label="Next month">›</button>
                </div>
                <div class="panels">
                  ${panels.map(p => this._renderPanel(p, tabStopIso, range))}
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}
