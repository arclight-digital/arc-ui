import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf, int, num } from '../shared/props.js';

/**
 * Locale-aware number, currency, percentage, and compact formatter using Intl.NumberFormat.
 *
 * @tag arc-number-format
 * @status stable
 * @prop {number} value - The number to format
 * @prop {'number' | 'currency' | 'percent' | 'compact'} type - Formatting style to apply
 * @prop {string} locale - BCP 47 locale tag for locale-aware formatting
 * @prop {string} currency - ISO 4217 currency code, used when type is "currency"
 * @prop {number} decimals - Number of decimal places, 0 to 20 — `Intl.NumberFormat`'s own range. Unset uses a per-format default: 0 for number, 2 for currency, 1 for percent.
 * @prop {'standard' | 'compact'} notation - Number notation — compact gives "12.3K", "1.2M"
 * @slot none
 * @csspart number
 */
export class ArcNumberFormat extends DeclaredPropsMixin(LitElement) {
  static properties = {
    value: num({ default: 0 }),
    type: oneOf(['number', 'currency', 'percent', 'compact']),
    locale: { type: String },
    currency: { type: String },
    // 0-20 is `Intl.NumberFormat`'s own range for minimum/maximumFractionDigits
    // and it *throws* outside it — a RangeError from a getter the render calls,
    // so `<arc-number-format decimals="30">` took the whole component down.
    // Surfaced by V4-PLAN 2.3's survey: the prop was documented with no bound
    // at all, and the ceiling belonged to a library the component happens to
    // call rather than to anything the component itself checked.
    decimals: int({ nullable: true, min: 0, max: 20, clamp: 'toRange' }),
    notation: oneOf(['standard', 'compact'], { reflect: false }),
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline;
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
      }
    `,
  ];

  constructor() {
    super();
    // Nullable declarations own their own "unset" default — see props.js.
    this.locale = 'en-US';
    this.currency = 'USD';
  }

  /** @returns {string} */
  get _formatted() {
    const v = this.value ?? 0;
    const type = this.type || 'number';
    const notation = this.notation || 'standard';

    /** @type {Intl.NumberFormatOptions} */
    const opts = {};

    if (notation === 'compact') {
      opts.notation = 'compact';
      opts.compactDisplay = 'short';
    }

    switch (type) {
      case 'currency':
        opts.style = 'currency';
        opts.currency = this.currency || 'USD';
        opts.minimumFractionDigits = this.decimals ?? 2;
        opts.maximumFractionDigits = this.decimals ?? 2;
        break;

      case 'percent':
        // Value is treated as the actual percentage (50 = 50%, not 0.5)
        opts.style = 'percent';
        opts.minimumFractionDigits = this.decimals ?? 1;
        opts.maximumFractionDigits = this.decimals ?? 1;
        return new Intl.NumberFormat(this.locale, opts).format(v / 100);

      case 'compact':
        opts.notation = 'compact';
        opts.compactDisplay = 'short';
        if (this.decimals != null) {
          opts.minimumFractionDigits = this.decimals;
          opts.maximumFractionDigits = this.decimals;
        }
        break;

      default: // 'number'
        if (this.decimals != null) {
          opts.minimumFractionDigits = this.decimals;
          opts.maximumFractionDigits = this.decimals;
        } else {
          opts.maximumFractionDigits = 0;
        }
        break;
    }

    return new Intl.NumberFormat(this.locale, opts).format(v);
  }

  render() {
    return html`<span class="number" part="number">${this._formatted}</span>`;
  }
}
