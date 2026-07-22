import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hostGroteskSubsetBase64 } from '../assets/wordmark-font.js';
import { base64ToBlobUrl } from '../assets/blob-url.js';

const SIZES = {
  sm: { fontSize: '15px', fontWeight: '500', letterSpacing: '6px' },
  md: { fontSize: '18px', fontWeight: '500', letterSpacing: '9px' },
  lg: { fontSize: '24px', fontWeight: '500', letterSpacing: '12px' },
  stacked: { fontSize: '18px', fontWeight: '500', letterSpacing: '8px' },
};

// @font-face must be in document scope — shadow DOM won't pick it up.
// Register via the FontFace API (not an injected <style>) so the font
// survives Astro view-transition swaps, which discard runtime-added <head>
// elements but leave document.fonts intact.
let fontInjected = false;
function injectFont() {
  if (fontInjected || typeof document === 'undefined') return;
  fontInjected = true;
  const url = base64ToBlobUrl(hostGroteskSubsetBase64);
  const face = new FontFace('Host Grotesk Subset', `url(${url}) format('woff2')`, {
    weight: '100 900',
    display: 'block',
  });
  face
    .load()
    .then((f) => document.fonts.add(f))
    .catch(() => {
      fontInjected = false;
    });
}

/** @tag arclight-wordmark */
export class ArclightWordmark extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        line-height: 1;
      }

      .wordmark {
        font-family: 'Host Grotesk Subset', system-ui, sans-serif;
        text-transform: uppercase;
        color: var(--text-primary, #e8e8ec);
        white-space: nowrap;
        user-select: none;
        margin-right: calc(-1 * var(--_ls));
      }
    `,
  ];

  constructor() {
    super();
    this.size = 'sm';
  }

  connectedCallback() {
    super.connectedCallback();
    injectFont();
  }

  render() {
    const s = SIZES[this.size] || SIZES.sm;
    return html`
      <span
        class="wordmark"
        style="font-size: ${s.fontSize}; font-weight: ${s.fontWeight}; letter-spacing: ${s.letterSpacing}; --_ls: ${s.letterSpacing};"
      >ARCLIGHT</span>
    `;
  }
}

if (!customElements.get('arclight-wordmark')) customElements.define('arclight-wordmark', ArclightWordmark);
