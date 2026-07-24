import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Locale-aware number, currency, percentage, and compact formatter using Intl.NumberFormat.
 *
 * @tag arc-number-format
 * @prop {number} value - The number to format
 * @prop {'number' | 'currency' | 'percent' | 'compact'} type - Formatting style to apply
 * @prop {string} locale - BCP 47 locale tag for locale-aware formatting
 * @prop {string} currency - ISO 4217 currency code, used when type is "currency"
 * @prop {number} decimals - Number of decimal places (defaults: 0 for number, 2 for currency, 1 for percent)
 * @prop {'standard' | 'compact'} notation - Number notation — compact gives "12.3K", "1.2M"
 * @csspart number
 */
export class ArcNumberFormat extends LitElement {
  static properties = {
    value:    { type: Number },
    type:     { type: String, reflect: true },
    locale:   { type: String },
    currency: { type: String },
    decimals: { type: Number },
    notation: { type: String },
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
    this.value = 0;
    this.type = 'number';
    this.locale = 'en-US';
    this.currency = 'USD';
    this.decimals = undefined;
    this.notation = 'standard';
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
