import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { tekturSubsetBase64 } from '../assets/tektur-font.js';
import { base64ToBlobUrl } from '../assets/blob-url.js';
import './logo-wordmark.js';

// @font-face must be in document scope — shadow DOM won't pick it up.
let fontInjected = false;
function injectFont() {
  if (fontInjected) return;
  fontInjected = true;
  const url = base64ToBlobUrl(tekturSubsetBase64);
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Tektur Subset';
      src: url('${url}') format('woff2');
      font-weight: 400 900;
      font-display: block;
    }
  `;
  document.head.appendChild(style);
}

const SIZES = {
  sm: { fontSize: '9px', gap: '6px' },
  md: { fontSize: '10px', gap: '8px' },
};

/** @tag arclight-powered-by */
export class ArclightPoweredBy extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    href: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
      }

      .badge, a.badge {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        user-select: none;
        text-decoration: none;
        color: inherit;
        transition:
          transform 400ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
          filter 400ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
      }

      a.badge:hover {
        transform: translateY(-1px);
        filter:
          drop-shadow(0 0 6px rgba(var(--accent-primary-rgb, 77, 126, 247), 0.25))
          drop-shadow(0 0 16px rgba(var(--accent-secondary-rgb, 168, 85, 247), 0.1));
      }

      .label {
        font-family: 'Tektur Subset', system-ui, sans-serif;
        text-transform: uppercase;
        letter-spacing: 3px;
        color: var(--text-ghost, #6b6b80);
        font-weight: 500;
        margin-top: 0.15em;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    injectFont();
  }

  constructor() {
    super();
    this.size = 'md';
    this.href = 'https://arclight.build';
  }

  render() {
    const s = SIZES[this.size] || SIZES.md;
    const content = html`
      <span class="label">Powered by</span>
      <arclight-logo-wordmark layout="inline"></arclight-logo-wordmark>
    `;

    return this.href
      ? html`<a class="badge" href="${this.href}" style="gap: ${s.gap}; font-size: ${s.fontSize};">${content}</a>`
      : html`<span class="badge" style="gap: ${s.gap}; font-size: ${s.fontSize};">${content}</span>`;
  }
}

customElements.define('arclight-powered-by', ArclightPoweredBy);
