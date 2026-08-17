import { LitElement, html, css, svg } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Live clock with a digital or analog face, optionally pinned to an IANA timezone.
 *
 * @tag arc-clock
 * @status stable
 * @prop {'digital' | 'analog'} variant - Which face to render. Digital shows a mono-spaced time string; analog shows an SVG dial with hands.
 * @prop {string} timezone - IANA timezone name (e.g. "Asia/Tokyo"). Defaults to the viewer's local timezone; an unrecognized value falls back to local.
 * @prop {string} label - Optional caption rendered under the face.
 * @prop {boolean} showSeconds - Show seconds on the digital face, or the second hand on the analog face.
 * @prop {boolean} hour12 - Force 12-hour display on the digital face. When unset, the viewer's locale decides. Set the property to false to force 24-hour display.
 * @prop {boolean} showTimezone - Render the timezone abbreviation, muted, beside the digital time.
 * @slot none
 * @csspart base - The root element.
 * @csspart container
 * @csspart face
 * @csspart time
 * @csspart timezone
 * @csspart label
 * @csspart svg
 * @csspart hand-hour
 * @csspart hand-minute
 * @csspart hand-second
 * @csspart pin
 */
export class ArcClock extends DeclaredPropsMixin(LitElement) {
  static properties = {
    variant: oneOf(['digital', 'analog']),
    timezone: { type: String },
    label: { type: String },
    showSeconds: flag(false, { attribute: 'show-seconds' }),
    // A documented tri-state: true forces 12-hour, false forces 24-hour, and
    // *unset* lets the viewer's locale decide. `nullable` is what lets the
    // vocabulary say that — it was this prop's exemption from
    // boolean-defaults.js until V4-PLAN 2.3 found thirteen more of the same
    // shape and gave them all a term. Not reflected: a nullable flag has no
    // attribute spelling that distinguishes false from unset.
    hour12: flag(false, { nullable: true, reflect: false }),
    showTimezone: flag(false, { attribute: 'show-timezone' }),
    _now: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-block; }

      .clock {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
      }

      .time {
        font-family: var(--font-mono);
        font-size: var(--numeral-size);
        font-weight: var(--numeral-weight, 200);
        font-variant-numeric: tabular-nums;
        line-height: var(--heading-lh);
        color: var(--text-primary);
      }

      .zone {
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        letter-spacing: var(--label-spacing);
        color: var(--text-muted);
        margin-inline-start: var(--space-sm);
      }

      .label {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: var(--label-spacing);
        text-transform: uppercase;
        text-align: center;
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .dial {
        inline-size: 160px;
        block-size: auto;
        max-inline-size: 100%;
      }

      .dial-face {
        fill: var(--surface-primary);
        stroke: var(--border-subtle);
        stroke-width: 1;
      }

      .tick {
        stroke: var(--border-subtle);
        stroke-width: 0.8;
      }

      .tick--major {
        stroke: var(--text-muted);
        stroke-width: 1.6;
      }

      .hand {
        stroke: var(--text-primary);
        stroke-linecap: round;
      }

      .hand--hour { stroke-width: 3.4; }
      .hand--minute { stroke-width: 2.4; }

      /*
       * The second hand is the one accent moment on the dial: accent stroke
       * with a soft glow, both composed from the base accent tokens so a
       * consumer override recolors them together. Hands move in discrete
       * one-second ticks with no transition, so there is no sweep animation
       * to suppress under prefers-reduced-motion.
       */
      .hand--second {
        stroke: var(--accent-primary);
        stroke-width: 1.2;
        filter: drop-shadow(0 0 2.5px rgba(var(--accent-primary-rgb), 0.5));
      }

      .pin {
        fill: var(--accent-primary);
      }

      .pin-core {
        fill: var(--surface-primary);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
    `,
  ];

  constructor() {
    super();
    // Nullable declarations own their own "unset" default — see props.js.
    this.timezone = '';
    this.label = '';
    // Left undefined so the locale decides; a boolean (either way) forces it.
    // Null until the first tick, which is taken after the first render — see
    // _start(). The server render (constructor, willUpdate, render only — no
    // connectedCallback) therefore shows the static placeholder face and never
    // touches Date or Intl, and so does the client's hydrating render.
    this._now = null;
    this._intervalId = null;
  }

  connectedCallback() {
    super.connectedCallback();
    // Reconnect only. On the *first* connect the timer is started by
    // firstUpdated() instead: see _start().
    if (this.hasUpdated) this._start();
  }

  firstUpdated() {
    this._start();
  }

  /**
   * Take the first tick and keep ticking.
   *
   * Wall-clock time is the one thing this component renders that the server
   * cannot agree with, so it must not exist during the first render: hydration
   * adopts the server's DOM by rendering the same template against the same
   * state, and a `_now` set in connectedCallback — which runs before that
   * render — puts the viewer's time where the server wrote 12:00 / --:--, which
   * throws instead of adopting. firstUpdated() is the first moment after the
   * comparison is over, so the face is live one frame later and hydration never
   * sees a value the server could not have had.
   */
  _start() {
    if (this._intervalId) return;
    this._tick();
    this._intervalId = setInterval(() => this._tick(), 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  _tick() {
    this._now = Date.now();
  }

  /**
   * The timezone to hand to Intl, validated so a typo degrades to local time
   * instead of throwing mid-render.
   * @returns {string|undefined}
   */
  get _safeTimeZone() {
    if (!this.timezone) return undefined;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: this.timezone });
      return this.timezone;
    } catch {
      return undefined;
    }
  }

  /**
   * Hour/minute/second in the target timezone. The placeholder (server render
   * and pre-first-tick) reads 12:00:00 so the analog face is a valid static
   * dial that hydration replaces without layout shift.
   * @returns {{h: number, m: number, s: number}}
   */
  _timeParts() {
    if (this._now == null) return { h: 0, m: 0, s: 0 };
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: this._safeTimeZone,
      hourCycle: 'h23',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).formatToParts(new Date(this._now));
    const num = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    return { h: num('hour'), m: num('minute'), s: num('second') };
  }

  /** @returns {string} the formatted digital time, or a dash placeholder pre-hydration */
  _formatTime() {
    if (this._now == null) return this.showSeconds ? '--:--:--' : '--:--';
    /** @type {Intl.DateTimeFormatOptions} */
    const opts = { timeZone: this._safeTimeZone, hour: 'numeric', minute: '2-digit' };
    if (this.showSeconds) opts.second = '2-digit';
    if (typeof this.hour12 === 'boolean') opts.hour12 = this.hour12;
    return new Intl.DateTimeFormat(undefined, opts).format(new Date(this._now));
  }

  /** @returns {string} short zone name for the current time, e.g. "GMT+9" or "PST" */
  _zoneAbbr() {
    if (this._now == null) return '';
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZone: this._safeTimeZone,
      timeZoneName: 'short',
      hour: 'numeric',
    }).formatToParts(new Date(this._now));
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  }

  /**
   * The accessible reading of the clock. It lives in visually-hidden text with
   * no aria-live region: a live clock re-announcing every tick would flood a
   * screen reader, so the text updates silently and is read on demand.
   * @returns {string}
   */
  _accessibleTime() {
    if (this._now == null) return '';
    const zone = this.timezone ? ` ${this._zoneAbbr()}` : '';
    return `${this.label ? `${this.label}: ` : ''}${this._formatTime()}${zone}`;
  }

  _renderDigital() {
    const zone = this.showTimezone ? this._zoneAbbr() : '';
    return html`
      <span class="time" part="time">${this._formatTime()}</span>
      ${zone ? html`<span class="zone" part="timezone">${zone}</span>` : ''}
    `;
  }

  _renderAnalog() {
    const { h, m, s } = this._timeParts();
    const hourAngle = (h % 12) * 30 + m * 0.5;
    const minuteAngle = m * 6 + s * 0.1;
    const secondAngle = s * 6;

    const ticks = [];
    for (let i = 0; i < 60; i++) {
      const major = i % 5 === 0;
      const rad = (i * 6 * Math.PI) / 180;
      const inner = major ? 41 : 43.5;
      const x1 = (50 + inner * Math.sin(rad)).toFixed(2);
      const y1 = (50 - inner * Math.cos(rad)).toFixed(2);
      const x2 = (50 + 46.5 * Math.sin(rad)).toFixed(2);
      const y2 = (50 - 46.5 * Math.cos(rad)).toFixed(2);
      ticks.push(svg`<line
        class="tick ${major ? 'tick--major' : ''}"
        x1=${x1} y1=${y1} x2=${x2} y2=${y2}
      ></line>`);
    }

    return html`
      <svg class="dial" part="svg" viewBox="0 0 100 100" role="presentation">
        <circle class="dial-face" cx="50" cy="50" r="48.5"></circle>
        ${ticks}
        <line class="hand hand--hour" part="hand-hour"
          x1="50" y1="50" x2="50" y2="29"
          transform="rotate(${hourAngle} 50 50)"></line>
        <line class="hand hand--minute" part="hand-minute"
          x1="50" y1="50" x2="50" y2="18"
          transform="rotate(${minuteAngle} 50 50)"></line>
        ${
          this.showSeconds
            ? svg`<line class="hand hand--second" part="hand-second"
              x1="50" y1="57" x2="50" y2="14"
              transform="rotate(${secondAngle} 50 50)"></line>`
            : ''
        }
        <circle class="pin" part="pin" cx="50" cy="50" r="3"></circle>
        <circle class="pin-core" cx="50" cy="50" r="1.1"></circle>
      </svg>
    `;
  }

  render() {
    // Any value outside the documented set renders the digital default.
    const analog = this.variant === 'analog';
    const accessible = this._accessibleTime();

    return html`
      <div class="clock" part="base container">
        <div class="face" part="face" aria-hidden="true">
          ${analog ? this._renderAnalog() : this._renderDigital()}
        </div>
        ${
          this.label
            ? html`<div class="label" part="label" aria-hidden="true">${this.label}</div>`
            : ''
        }
        ${accessible ? html`<span class="sr-only">${accessible}</span>` : ''}
      </div>
    `;
  }
}
