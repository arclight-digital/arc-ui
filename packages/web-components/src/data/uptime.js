import { LitElement, html, css, nothing } from 'lit';
import { DeclaredPropsMixin, flag, list } from '../shared/props.js';
import { tokenStyles } from '../shared-styles.js';
import { PositionController } from '../shared/position-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';

/**
 * Status-page uptime history strip: one slim tick per period, colored by
 * status. Hovering or arrow-keying across the strip raises a tick with the
 * house status glow and shows its detail in a small built-in bubble. Accepts
 * plain uptime fractions (thresholds decide the status) or explicit status
 * objects, and renders the computed overall percentage above the track.
 *
 * @tag arc-uptime
 * @status stable
 * @prop {Array<number | {value?: number, status?: 'up' | 'degraded' | 'down' | 'none', label?: string}>} data - One entry per period, oldest first. A number is an uptime fraction from 0 to 1, mapped to a status by threshold (0.99 and up is "up", 0.95 and up is "degraded", below is "down"). An object may carry an explicit `status` (which wins over any threshold), a `value` used for the summary math, and a `label` shown in the hover detail. An entry with neither a finite value nor a status renders as the neutral "none" track. Set it from script, a framework binding, or a JSON attribute.
 * @prop {string} startLabel - Caption under the oldest end of the track (e.g. "90 days ago").
 * @prop {string} endLabel - Caption under the newest end of the track (e.g. "Today").
 * @prop {boolean} summary - Whether to render the overall percentage above the track (default true; set the attribute to the string "false" to disable from markup). The percentage is the mean of every finite value in the data; when no entry carries a value the line is omitted regardless.
 * @slot none
 * @csspart base - The root element.
 * @csspart uptime
 * @csspart summary
 * @csspart track
 * @csspart tick
 * @csspart detail
 * @csspart caption
 */
export class ArcUptime extends DeclaredPropsMixin(LitElement) {
  static properties = {
    data: list(),
    startLabel: { type: String, attribute: 'start-label' },
    endLabel: { type: String, attribute: 'end-label' },
    summary: flag(true, { negative: 'no-summary' }),
    _activeIndex: { state: true },
  };

  /** Uptime fraction at or above `up` reads as up; at or above `degraded`, degraded; below, down. */
  static thresholds = { up: 0.99, degraded: 0.95 };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .uptime {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      /* Per-status color pair, resolved the statusVars way: the tick paints
         with the color, the glow and the detail text read the rgb channels.
         The base declaration is the "none" state - a neutral member of the
         gray ramp, so an unknown period still raises with a faint white
         breath instead of a dead spot. */
      .status--none {
        --_status-color: var(--text-secondary);
        --_status-rgb:   var(--text-primary-rgb);
      }
      .status--up {
        --_status-color: var(--color-success);
        --_status-rgb:   var(--color-success-rgb);
      }
      .status--degraded {
        --_status-color: var(--color-warning);
        --_status-rgb:   var(--color-warning-rgb);
      }
      .status--down {
        --_status-color: var(--color-error);
        --_status-rgb:   var(--color-error-rgb);
      }

      .uptime__summary {
        align-self: flex-end;
        font-family: var(--font-mono);
        font-size: var(--_text-sm);
        color: var(--text-primary);
      }

      .uptime__track {
        position: relative;
        display: flex;
        gap: var(--uptime-tick-gap, 3px);
        height: var(--uptime-tick-height, 28px);
        border-radius: var(--radius-sm);
      }

      .uptime__track:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .uptime__tick {
        flex: 1 1 0;
        min-width: 2px;
        border-radius: var(--radius-full);
        background: var(--surface-overlay);
        transition:
          transform var(--transition-fast),
          box-shadow var(--transition-fast);
      }

      .uptime__tick:not(.status--none) {
        background: var(--_status-color);
      }

      .uptime__tick:hover,
      .uptime__tick.is-active {
        transform: scaleY(1.2);
        box-shadow: var(--glow-status);
      }

      /* The resting position, for the panel PositionController hasn't adopted
         yet — pre-upgrade and in prism's static export. Once managed it moves
         to the top layer, so a track inside a scrolling card no longer clips
         the bubble to a sliver. */
      .uptime__detail {
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
      .uptime__detail::before {
        content: '';
        position: absolute;
        top: 0;
        inset-inline: 0;
        height: 1px;
        background: var(--divider-glow);
      }

      .uptime__detail-label {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-primary);
      }

      .uptime__detail-status {
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        color: var(--_status-color);
      }

      .uptime__caption {
        display: flex;
        justify-content: space-between;
        gap: var(--space-sm);
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        color: var(--text-muted);
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
        .uptime__tick { transition: none; }
      }
    `,
    // Cross-fade rather than scale: the bubble tracks a pointer moving tick to
    // tick, and a panel that rescaled on every step would flicker.
    managedPanelStyles('uptime__detail', {
      openCls: 'is-visible',
      scale: 1,
      duration: 'var(--duration-fast)',
    }),
  ];

  constructor() {
    super();
    this.startLabel = '';
    this.endLabel = '';
    this.summary = true;
    this._activeIndex = null;
    // The anchor is the hovered tick, not the track: the bubble belongs over
    // the interval it describes.
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.uptime__tick.is-active'),
      floating: () => this.shadowRoot?.querySelector('.uptime__detail'),
      placement: () => 'top',
      fallbackPlacement: 'top',
      offset: 6,
    });
  }

  updated(changed) {
    // Re-run on every step, not just on open: the anchor is a different tick
    // each time the pointer or the arrow keys move.
    if (changed.has('_activeIndex')) {
      this._activeIndex !== null ? this._position.show() : this._position.hide();
    }
  }

  /** Map an uptime fraction to a status name; anything non-finite is none. */
  static statusOf(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 'none';
    if (value >= ArcUptime.thresholds.up) return 'up';
    if (value >= ArcUptime.thresholds.degraded) return 'degraded';
    return 'down';
  }

  static #STATUSES = new Set(['up', 'degraded', 'down', 'none']);

  static #STATUS_TEXT = {
    up: 'Operational',
    degraded: 'Degraded',
    down: 'Outage',
    none: 'No data',
  };

  /**
   * One shape out of the two shapes in. An explicit `status` wins over the
   * value-derived one; the value is kept regardless, because the summary
   * averages it even when the status was pinned by hand.
   */
  _normalized() {
    const data = Array.isArray(this.data) ? this.data : [];
    return data.map((entry) => {
      let value;
      let status;
      let label = '';
      if (typeof entry === 'number') {
        value = entry;
      } else if (entry && typeof entry === 'object') {
        if (typeof entry.value === 'number' && Number.isFinite(entry.value)) value = entry.value;
        if (ArcUptime.#STATUSES.has(entry.status)) status = entry.status;
        if (entry.label != null) label = String(entry.label);
      }
      return { value, status: status ?? ArcUptime.statusOf(value), label };
    });
  }

  /** Overall percentage string ("99.98"), or null when no entry carries a value. */
  _percentOf(ticks) {
    const values = ticks.filter((t) => t.value !== undefined).map((t) => t.value);
    if (values.length === 0) return null;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return (mean * 100).toFixed(2).replace(/\.?0+$/, '');
  }

  /** The whole strip in one sentence, for the track's aria-label. */
  _summaryLabel(ticks, percent) {
    if (ticks.length === 0) return 'Uptime history: no data';
    const down = ticks.filter((t) => t.status === 'down').length;
    const degraded = ticks.filter((t) => t.status === 'degraded').length;
    const parts = [`${ticks.length} periods, oldest first`];
    if (percent !== null) parts.push(`${percent}% uptime`);
    parts.push(down === 1 ? '1 outage period' : `${down} outage periods`);
    if (degraded > 0) parts.push(`${degraded} degraded`);
    return `Uptime history: ${parts.join(', ')}`;
  }

  /** Hover-bubble and live-region text for one tick. */
  _detailOf(tick, index, count) {
    const label = tick.label || `Period ${index + 1} of ${count}`;
    const status =
      tick.value !== undefined
        ? `${(tick.value * 100).toFixed(2).replace(/\.?0+$/, '')}% — ${ArcUptime.#STATUS_TEXT[tick.status]}`
        : ArcUptime.#STATUS_TEXT[tick.status];
    return { label, status };
  }

  _onPointerOver(e) {
    const tick = e.target.closest?.('[data-index]');
    if (tick) this._activeIndex = Number(tick.dataset.index);
  }

  _clearActive() {
    this._activeIndex = null;
  }

  _onKeyDown(e) {
    const count = Array.isArray(this.data) ? this.data.length : 0;
    if (count === 0) return;
    const rtl = this.matches(':dir(rtl)');
    const step = (delta) => {
      const from = this._activeIndex ?? (delta > 0 ? -1 : count);
      this._activeIndex = Math.min(count - 1, Math.max(0, from + delta));
      e.preventDefault();
    };
    switch (e.key) {
      case 'ArrowRight':
        step(rtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        step(rtl ? 1 : -1);
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
    const ticks = this._normalized();
    const percent = this._percentOf(ticks);
    const active = this._activeIndex !== null ? ticks[this._activeIndex] : undefined;
    const detail = active ? this._detailOf(active, this._activeIndex, ticks.length) : null;

    return html`
      <div class="uptime" part="base uptime">
        ${
          this.summary && percent !== null
            ? html`
          <div class="uptime__summary" part="summary">${percent}% uptime</div>
        `
            : nothing
        }
        <div
          class="uptime__track"
          part="track"
          role="img"
          tabindex=${ticks.length === 0 ? '-1' : '0'}
          aria-label=${this._summaryLabel(ticks, percent)}
          @pointerover=${this._onPointerOver}
          @pointerleave=${this._clearActive}
          @keydown=${this._onKeyDown}
          @blur=${this._clearActive}
        >
          ${ticks.map(
            (tick, i) => html`
            <span
              class="uptime__tick status--${tick.status} ${i === this._activeIndex ? 'is-active' : ''}"
              part="tick"
              data-index=${i}
            ></span>
          `,
          )}
          ${
            detail
              ? html`
            <div
              class="uptime__detail is-visible"
              part="detail"
              aria-hidden="true"
            >
              <span class="uptime__detail-label">${detail.label}</span>
              <span class="uptime__detail-status status--${active.status}">${detail.status}</span>
            </div>
          `
              : nothing
          }
        </div>
        ${
          this.startLabel || this.endLabel
            ? html`
          <div class="uptime__caption" part="caption">
            <span>${this.startLabel}</span>
            <span>${this.endLabel}</span>
          </div>
        `
            : nothing
        }
        <span class="sr-only" role="status">${detail ? `${detail.label}: ${detail.status}` : ''}</span>
      </div>
    `;
  }
}
