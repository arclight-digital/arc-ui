import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-animated-number
 */
export class ArcAnimatedNumber extends LitElement {
  static properties = {
    value:    { type: Number, reflect: true },
    duration: { type: Number },
    format:   { type: String, reflect: true },
    prefix:   { type: String },
    suffix:   { type: String },
    decimals: { type: Number },
    locale:   { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
      }

      .value {
        white-space: nowrap;
      }
    `,
  ];

  constructor() {
    super();
    this.value = 0;
    this.duration = 1000;
    this.format = 'number';
    this.prefix = '';
    this.suffix = '';
    this.decimals = 0;
    this.locale = 'en-US';

    /** @private */
    this._displayValue = 0;
    /** @private */
    this._previousValue = 0;
    /** @private */
    this._rafId = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  willUpdate(changed) {
    if (changed.has('value')) {
      const oldVal = changed.get('value');
      this._previousValue = oldVal != null ? oldVal : 0;
      this._animate(this._previousValue, this.value);
    }
  }

  /** Ease-out-expo: fast start, satisfying deceleration. */
  _easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /** Check if the user prefers reduced motion. */
  _prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  /** Animate from `from` to `to`. */
  _animate(from, to) {
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    // Skip animation when motion is reduced or duration is zero
    if (this._prefersReducedMotion() || this.duration <= 0) {
      this._displayValue = to;
      this.requestUpdate();
      return;
    }

    const start = performance.now();
    const delta = to - from;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / this.duration, 1);
      const eased = this._easeOutExpo(progress);

      this._displayValue = from + delta * eased;
      this.requestUpdate();

      if (progress < 1) {
        this._rafId = requestAnimationFrame(step);
      } else {
        this._displayValue = to;
        this._rafId = null;
        this.requestUpdate();
      }
    };

    this._rafId = requestAnimationFrame(step);
  }

  /** Format the current display value using Intl.NumberFormat. */
  _formatValue(num) {
    const opts = {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals,
    };

    if (this.format === 'currency') {
      // Use Intl currency formatting when no custom prefix is supplied
      if (!this.prefix) {
        opts.style = 'currency';
        opts.currency = 'USD';
      }
    } else if (this.format === 'percent') {
      // Intl percent expects 0.5 for 50%, but we treat value as 50 for 50%.
      // So we format manually to keep the API intuitive.
    }

    let formatted;
    try {
      formatted = new Intl.NumberFormat(this.locale, opts).format(num);
    } catch {
      formatted = num.toFixed(this.decimals);
    }

    // Build the full string with prefix/suffix
    const parts = [];
    if (this.prefix) parts.push(this.prefix);
    parts.push(formatted);
    if (this.format === 'percent' && !this.suffix) {
      parts.push('%');
    } else if (this.suffix) {
      parts.push(this.suffix);
    }

    return parts.join('');
  }

  render() {
    return html`
      <span class="value"
            part="value"
            role="status"
            aria-live="polite"
      >${this._formatValue(this._displayValue)}</span>
    `;
  }
}
