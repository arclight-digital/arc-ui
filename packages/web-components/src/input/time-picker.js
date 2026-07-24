import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';

/**
 * Scrollable column-based time picker with 12h/24h format support.
 *
 * @tag arc-time-picker
 * @prop {string} value - The selected time in 24-hour "HH:MM" format (e.g. "14:30"). Set this to pre-select a time. Updated when the user picks a time.
 * @prop {string} min - Minimum selectable time in "HH:MM" 24-hour format. Times before this are visually dimmed and non-interactive.
 * @prop {string} max - Maximum selectable time in "HH:MM" 24-hour format. Times after this are visually dimmed and non-interactive.
 * @prop {number} step - Minute step increment (1, 5, 15, or 30). Controls the granularity of minute options shown in the dropdown.
 * @prop {string} format - Display format: "12h" shows hours 1-12 with an AM/PM column, "24h" shows hours 0-23 without AM/PM.
 * @prop {string} placeholder - Placeholder text displayed in the input when no time is selected.
 * @prop {boolean} disabled - Disables the time picker, reducing opacity and preventing the dropdown from opening.
 * @prop {string} label - Label text rendered above the input in uppercase accent font styling.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when a time is selected. Detail contains { value: "HH:MM" } in 24-hour format.
 * @csspart wrapper
 * @csspart label
 * @csspart input-wrapper
 * @csspart input
 * @csspart dropdown
 */
export class ArcTimePicker extends FormControlMixin(LitElement) {
  static properties = {
    value:       { type: String, reflect: true },
    name:        { type: String, reflect: true },
    min:         { type: String },
    max:         { type: String },
    step:        { type: Number },
    format:      { type: String },
    placeholder: { type: String },
    disabled:    { type: Boolean, reflect: true },
    label:       { type: String },
    _open:            { state: true },
    _selectedHour:    { state: true },
    _selectedMinute:  { state: true },
    _selectedPeriod:  { state: true },
    _focusedColumn:   { state: true },
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

      .clock-icon {
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
        animation: dropdown-in var(--transition-fast);
      }

      @keyframes dropdown-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .columns {
        display: flex;
        gap: var(--space-xs);
      }

      .column {
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-height: 220px;
        overflow-y: auto;
        overflow-x: hidden;
        padding: var(--space-xs);
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
      }

      .column::-webkit-scrollbar {
        width: 4px;
      }

      .column::-webkit-scrollbar-track {
        background: transparent;
      }

      .column::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: var(--radius-full);
      }

      .column-label {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        text-align: center;
        padding: var(--space-xs) 0;
        margin-bottom: var(--space-xs);
      }

      .time-option {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 48px;
        padding: var(--space-xs) var(--space-sm);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        white-space: nowrap;
      }

      .time-option:hover:not(.disabled) {
        background: var(--surface-overlay);
        color: var(--text-primary);
      }

      .time-option:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .time-option.selected {
        background: var(--interactive);
        color: var(--surface-base);
        font-weight: 600;
      }

      .time-option.disabled {
        color: var(--text-muted);
        opacity: 0.3;
        cursor: default;
      }

      .separator {
        display: flex;
        align-items: center;
        color: var(--border-default);
        font-size: var(--text-sm);
        padding-top: calc(var(--text-xs) + var(--space-xs) + var(--space-xs) + var(--space-xs));
      }

      @media (prefers-reduced-motion: reduce) {
        .dropdown { animation: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.name = '';
    this.min = '';
    this.max = '';
    this.step = 1;
    this.format = '12h';
    this.placeholder = 'Select time';
    this.disabled = false;
    this.label = '';
    this._open = false;
    this._selectedHour = null;
    this._selectedMinute = null;
    this._selectedPeriod = 'AM';
    this._focusedColumn = 'hour';

    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleEscape = this._handleEscape.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._syncFromValue();
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

  _syncFromValue() {
    if (!this.value) return;
    const parts = this.value.split(':');
    if (parts.length !== 2) return;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return;

    this._selectedMinute = m;

    if (this.format === '12h') {
      this._selectedPeriod = h >= 12 ? 'PM' : 'AM';
      this._selectedHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    } else {
      this._selectedHour = h;
    }
  }

  _toggleDropdown() {
    if (this.disabled) return;
    this._open = !this._open;

    if (this._open) {
      this._syncFromValue();
      this._focusedColumn = 'hour';
    }
  }

  /** Convert current selection to 24h "HH:MM" string */
  _to24h(hour, minute, period) {
    let h = hour;
    if (this.format === '12h') {
      if (period === 'AM') {
        h = hour === 12 ? 0 : hour;
      } else {
        h = hour === 12 ? 12 : hour + 12;
      }
    }
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  /** Parse "HH:MM" string to total minutes for comparison */
  _toMinutes(timeStr) {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  _isDisabledTime(timeStr) {
    const t = this._toMinutes(timeStr);
    if (t === null) return false;
    const minT = this._toMinutes(this.min);
    const maxT = this._toMinutes(this.max);
    if (minT !== null && t < minT) return true;
    if (maxT !== null && t > maxT) return true;
    return false;
  }

  _selectHour(hour) {
    this._selectedHour = hour;
    this._emitIfComplete();
  }

  _selectMinute(minute) {
    this._selectedMinute = minute;
    this._emitIfComplete();
  }

  _selectPeriod(period) {
    this._selectedPeriod = period;
    this._emitIfComplete();
  }

  _emitIfComplete() {
    if (this._selectedHour === null || this._selectedMinute === null) return;

    const newValue = this._to24h(this._selectedHour, this._selectedMinute, this._selectedPeriod);

    if (this._isDisabledTime(newValue)) return;

    this.value = newValue;
    this._open = false;

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _formatDisplay(value) {
    if (!value) return '';
    const parts = value.split(':');
    if (parts.length !== 2) return value;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return value;

    if (this.format === '24h') {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  }

  _getHours() {
    if (this.format === '12h') {
      return Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
    }
    return Array.from({ length: 24 }, (_, i) => i);
  }

  _getMinutes() {
    const step = Math.max(1, Math.min(60, this.step));
    const minutes = [];
    for (let m = 0; m < 60; m += step) {
      minutes.push(m);
    }
    return minutes;
  }

  _isHourDisabled(hour) {
    // Check if every possible minute in this hour is disabled
    const minutes = this._getMinutes();
    return minutes.every(m => {
      const timeStr = this._to24h(hour, m, this._selectedPeriod);
      return this._isDisabledTime(timeStr);
    });
  }

  _isMinuteDisabled(minute) {
    if (this._selectedHour === null) return false;
    const timeStr = this._to24h(this._selectedHour, minute, this._selectedPeriod);
    return this._isDisabledTime(timeStr);
  }

  _isPeriodDisabled(period) {
    // Check if every hour+minute combo for this period is disabled
    const hours = this._getHours();
    const minutes = this._getMinutes();
    return hours.every(h =>
      minutes.every(m => {
        const timeStr = this._to24h(h, m, period);
        return this._isDisabledTime(timeStr);
      })
    );
  }

  /** Value that should be the single tab stop for a column (roving tabindex) */
  _tabStopFor(options, selected, isDisabled) {
    if (selected !== null && options.includes(selected) && !isDisabled(selected)) return selected;
    const first = options.find(o => !isDisabled(o));
    return first !== undefined ? first : null;
  }

  _handleColumnKeydown(e, column) {
    const { key } = e;

    if (key === 'Tab') {
      // Let default tab behavior move between columns
      return;
    }

    if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
      e.preventDefault();
      const buttons = [...e.currentTarget.querySelectorAll('button:not(.disabled)')];
      if (!buttons.length) return;
      const currentIndex = buttons.indexOf(e.target);
      let nextIndex;
      if (key === 'ArrowDown') {
        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
      } else if (key === 'ArrowUp') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
      } else if (key === 'Home') {
        nextIndex = 0;
      } else {
        nextIndex = buttons.length - 1;
      }
      const next = buttons[nextIndex];
      if (!next) return;
      // Move the roving tab stop along with focus
      buttons.forEach(b => { b.tabIndex = -1; });
      next.tabIndex = 0;
      next.focus();
      next.scrollIntoView({ block: 'nearest' });
    }

    if (key === 'Enter') {
      e.preventDefault();
      e.target.click();
    }
  }

  updated(changed) {
    if (changed.has('value')) {
      this._updateFormValue();
    }
    if (changed.has('_open') && this._open) {
      // Scroll selected items into view, then focus the hour tab stop
      this.updateComplete.then(() => {
        this.shadowRoot.querySelectorAll('.time-option.selected').forEach(el => {
          el.scrollIntoView({ block: 'nearest' });
        });
        this.shadowRoot.querySelector('.column[aria-label="Hours"] button[tabindex="0"]')?.focus();
      });
    }
  }

  render() {
    const hours = this._getHours();
    const minutes = this._getMinutes();
    const is12h = this.format === '12h';
    const hourTabStop = this._tabStopFor(hours, this._selectedHour, h => this._isHourDisabled(h));
    const minuteTabStop = this._tabStopFor(minutes, this._selectedMinute, m => this._isMinuteDisabled(m));
    const periodTabStop = this._tabStopFor(['AM', 'PM'], this._selectedPeriod, p => this._isPeriodDisabled(p));

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
            aria-expanded=${this._open ? 'true' : 'false'}
            aria-label=${this.label || 'Choose time'}
            @click=${this._toggleDropdown}
          />
          <span class="clock-icon" aria-hidden="true">\u{1F552}</span>
        </div>

        ${this._open ? html`
          <div class="dropdown" part="dropdown" role="dialog" aria-label="Time picker">
            <div class="columns">
              <div>
                <div class="column-label">${is12h ? 'Hr' : 'Hour'}</div>
                <div class="column" role="listbox" aria-label="Hours" @keydown=${(e) => this._handleColumnKeydown(e, 'hour')}>
                  ${hours.map(h => {
                    const disabled = this._isHourDisabled(h);
                    const selected = this._selectedHour === h;
                    return html`
                      <button
                        class="time-option ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}"
                        role="option"
                        aria-selected=${selected ? 'true' : 'false'}
                        ?disabled=${disabled}
                        tabindex=${!disabled && h === hourTabStop ? '0' : '-1'}
                        @click=${() => !disabled && this._selectHour(h)}
                      >${is12h ? h : String(h).padStart(2, '0')}</button>
                    `;
                  })}
                </div>
              </div>

              <div class="separator" aria-hidden="true">:</div>

              <div>
                <div class="column-label">Min</div>
                <div class="column" role="listbox" aria-label="Minutes" @keydown=${(e) => this._handleColumnKeydown(e, 'minute')}>
                  ${minutes.map(m => {
                    const disabled = this._isMinuteDisabled(m);
                    const selected = this._selectedMinute === m;
                    return html`
                      <button
                        class="time-option ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}"
                        role="option"
                        aria-selected=${selected ? 'true' : 'false'}
                        ?disabled=${disabled}
                        tabindex=${!disabled && m === minuteTabStop ? '0' : '-1'}
                        @click=${() => !disabled && this._selectMinute(m)}
                      >${String(m).padStart(2, '0')}</button>
                    `;
                  })}
                </div>
              </div>

              ${is12h ? html`
                <div>
                  <div class="column-label">&nbsp;</div>
                  <div class="column" role="listbox" aria-label="AM or PM" @keydown=${(e) => this._handleColumnKeydown(e, 'period')}>
                    ${['AM', 'PM'].map(p => {
                      const disabled = this._isPeriodDisabled(p);
                      const selected = this._selectedPeriod === p;
                      return html`
                        <button
                          class="time-option ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}"
                          role="option"
                          aria-selected=${selected ? 'true' : 'false'}
                          ?disabled=${disabled}
                          tabindex=${!disabled && p === periodTabStop ? '0' : '-1'}
                          @click=${() => !disabled && this._selectPeriod(p)}
                        >${p}</button>
                      `;
                    })}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}
