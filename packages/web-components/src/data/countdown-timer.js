import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-countdown-timer
 */
export class ArcCountdownTimer extends LitElement {
  static properties = {
    target:           { type: String },
    label:            { type: String },
    expired:          { type: String },
    hideZeroSegments: { type: Boolean, reflect: true, attribute: 'hide-zero-segments' },
    _days:    { state: true },
    _hours:   { state: true },
    _minutes: { state: true },
    _seconds: { state: true },
    _expired: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-block; }

      .container {
        display: flex;
        align-items: center;
        gap: var(--space-md);
      }

      .top-label {
        display: block;
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        text-align: center;
        margin-bottom: var(--space-md);
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .segment {
        background: var(--surface-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: var(--space-md) var(--space-lg);
        text-align: center;
        min-width: 72px;
        transition: box-shadow var(--transition-fast), transform var(--transition-fast);
      }

      .segment:hover {
        box-shadow: var(--interactive-hover);
      }

      .number {
        font-family: var(--font-mono);
        font-size: clamp(24px, 3vw, 36px);
        font-weight: 200;
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .segment-label {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-ghost);
        margin-top: var(--space-xs);
      }

      .separator {
        color: var(--text-ghost);
        font-size: var(--text-xl);
        font-weight: 200;
        user-select: none;
      }

      .expired-text {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xl);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
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

  constructor() {
    super();
    this.target = '';
    this.label = '';
    this.expired = 'Expired';
    this.hideZeroSegments = false;
    this._days = 0;
    this._hours = 0;
    this._minutes = 0;
    this._seconds = 0;
    this._expired = false;
    this._intervalId = null;
  }

  connectedCallback() {
    super.connectedCallback();
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

  updated(changed) {
    if (changed.has('target')) {
      this._expired = false;
      this._tick();
    }
  }

  _tick() {
    if (!this.target) return;

    const now = Date.now();
    const end = new Date(this.target).getTime();
    const diff = end - now;

    if (diff <= 0) {
      this._days = 0;
      this._hours = 0;
      this._minutes = 0;
      this._seconds = 0;
      if (!this._expired) {
        this._expired = true;
        this.dispatchEvent(new CustomEvent('arc-expired', { bubbles: true, composed: true }));
      }
      return;
    }

    this._days = Math.floor(diff / 86400000);
    this._hours = Math.floor((diff % 86400000) / 3600000);
    this._minutes = Math.floor((diff % 3600000) / 60000);
    this._seconds = Math.floor((diff % 60000) / 1000);
  }

  _pad(n) {
    return String(n).padStart(2, '0');
  }

  _renderSegment(value, label, showSeparator) {
    if (this.hideZeroSegments && value === 0) return '';

    return html`
      ${showSeparator ? html`<span class="separator" part="separator">:</span>` : ''}
      <div class="segment" part="segment">
        <div class="number" part="number">${this._pad(value)}</div>
        <div class="segment-label" part="label">${label}</div>
      </div>
    `;
  }

  render() {
    const topLabel = this.label
      ? html`<div class="top-label">${this.label}</div>`
      : '';

    if (this._expired) {
      return html`
        ${topLabel}
        <div class="container" part="container">
          <span class="expired-text">${this.expired}</span>
        </div>
      `;
    }

    // Build segments, tracking whether we need a separator before each
    const segments = [
      { value: this._days, label: 'Days' },
      { value: this._hours, label: 'Hours' },
      { value: this._minutes, label: 'Min' },
      { value: this._seconds, label: 'Sec' },
    ];

    let visibleCount = 0;

    return html`
      ${topLabel}
      <div class="container" part="container">
        ${segments.map((seg) => {
          if (this.hideZeroSegments && seg.value === 0 && visibleCount === 0) return '';
          const needsSep = visibleCount > 0;
          visibleCount++;
          return this._renderSegment(seg.value, seg.label, needsSep);
        })}
      </div>
    `;
  }
}
