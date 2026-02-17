import { LitElement } from 'lit';
import { brandColors } from '../brand-palette.js';

export { brandColors };

/** Convert camelCase → kebab-case (e.g. primaryRgb → primary-rgb) */
function toKebab(str) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** Track which prefixes have already been injected */
const _injected = new Set();

/**
 * Zero-DOM Lit element that injects `--{prefix}-{key}` CSS custom properties
 * onto `document.documentElement` for every entry in `brandColors`.
 *
 * @tag arclight-brand-colors
 */
export class ArclightBrandColors extends LitElement {
  static properties = {
    prefix: { type: String, reflect: true },
  };

  constructor() {
    super();
    this.prefix = 'arclight';
  }

  connectedCallback() {
    super.connectedCallback();
    this._inject();
  }

  updated() {
    this._inject();
  }

  /** Idempotently set CSS custom properties on :root */
  _inject() {
    if (_injected.has(this.prefix)) return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(brandColors)) {
      root.style.setProperty(`--${this.prefix}-${toKebab(key)}`, value);
    }
    _injected.add(this.prefix);
  }

  render() {
    return null;
  }
}

customElements.define('arclight-brand-colors', ArclightBrandColors);
