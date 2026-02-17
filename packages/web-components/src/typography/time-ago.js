import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-time-ago
 */
export class ArcTimeAgo extends LitElement {
  static properties = {
    datetime: { type: String },
    live:     { type: Boolean, reflect: true },
    locale:   { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline;
        font-family: var(--font-mono);
        font-size: inherit;
        color: inherit;
      }

      .time {
        cursor: default;
      }
    `,
  ];

  constructor() {
    super();
    this.datetime = '';
    this.live = true;
    this.locale = 'en-US';
    /** @type {number|undefined} */
    this._timer = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    this._startTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopTimer();
  }

  updated(changed) {
    if (changed.has('live') || changed.has('datetime')) {
      this._stopTimer();
      if (this.live) this._startTimer();
    }
  }

  _stopTimer() {
    if (this._timer != null) {
      clearInterval(this._timer);
      this._timer = undefined;
    }
  }

  _startTimer() {
    if (!this.live) return;
    const interval = this._getInterval();
    this._timer = setInterval(() => {
      this.requestUpdate();
      // Re-evaluate interval as time passes
      const newInterval = this._getInterval();
      if (newInterval !== interval) {
        this._stopTimer();
        this._startTimer();
      }
    }, interval);
  }

  /** @returns {number} interval in ms */
  _getInterval() {
    const date = this._parsedDate;
    if (!date) return 60_000;
    const diffMs = Math.abs(Date.now() - date.getTime());
    if (diffMs < 3_600_000) return 60_000;       // < 1 hour: every 60s
    if (diffMs < 86_400_000) return 300_000;      // < 1 day: every 5 min
    return 3_600_000;                              // else: every hour
  }

  /** @returns {Date|null} */
  get _parsedDate() {
    if (!this.datetime) return null;
    const d = new Date(this.datetime);
    return isNaN(d.getTime()) ? null : d;
  }

  /** @returns {string} */
  get _relative() {
    const date = this._parsedDate;
    if (!date) return '';

    const now = Date.now();
    const diffMs = now - date.getTime();
    const absDiff = Math.abs(diffMs);
    const future = diffMs < 0;

    // < 60 seconds: "just now"
    if (absDiff < 60_000) return 'just now';

    const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });

    /** @type {Intl.RelativeTimeFormatUnit} */
    let unit;
    let value;

    if (absDiff < 3_600_000) {
      unit = 'minute';
      value = Math.floor(absDiff / 60_000);
    } else if (absDiff < 86_400_000) {
      unit = 'hour';
      value = Math.floor(absDiff / 3_600_000);
    } else if (absDiff < 604_800_000) {
      unit = 'day';
      value = Math.floor(absDiff / 86_400_000);
    } else if (absDiff < 2_592_000_000) {
      unit = 'week';
      value = Math.floor(absDiff / 604_800_000);
    } else if (absDiff < 31_536_000_000) {
      unit = 'month';
      value = Math.floor(absDiff / 2_592_000_000);
    } else {
      unit = 'year';
      value = Math.floor(absDiff / 31_536_000_000);
    }

    return rtf.format(future ? value : -value, unit);
  }

  /** @returns {string} */
  get _fullDate() {
    const date = this._parsedDate;
    if (!date) return '';
    return new Intl.DateTimeFormat(this.locale, {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(date);
  }

  render() {
    return html`<time
      class="time"
      part="time"
      datetime="${this.datetime || ''}"
      title="${this._fullDate}"
    >${this._relative}</time>`;
  }
}
