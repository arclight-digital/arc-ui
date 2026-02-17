import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { tekturSubsetBase64 } from '../assets/tektur-font.js';
import './logo.js';

// @font-face must be in document scope — shadow DOM won't pick it up.
let fontInjected = false;
function injectFont() {
  if (fontInjected) return;
  fontInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Tektur Subset';
      src: url('data:font/woff2;base64,${tekturSubsetBase64}') format('woff2');
      font-weight: 400 900;
      font-display: block;
    }
  `;
  document.head.appendChild(style);
}

const SIZES = {
  sm: { logoSize: 'sm' },
  md: { logoSize: 'lg' },
  lg: { logoSize: 'lg' },
};

/** @tag arclight-loading */
export class ArclightLoading extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    fullscreen: { type: Boolean, reflect: true },
    label: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :host([fullscreen]) {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(15, 15, 26, 0.92);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        animation: fade-in 300ms ease-out both;
      }

      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-md);
      }

      .label {
        font-family: 'Tektur Subset', system-ui, sans-serif;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: var(--text-ghost, #6b6b80);
      }
    `,
  ];

  constructor() {
    super();
    this.size = 'md';
    this.fullscreen = false;
    this.label = '';
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.label) {
      injectFont();
    }
  }

  render() {
    const s = SIZES[this.size] || SIZES.md;
    return html`
      <div class="container">
        <arclight-logo size="${s.logoSize}"></arclight-logo>
        ${this.label ? html`<span class="label">${this.label}</span>` : null}
      </div>
    `;
  }
}

customElements.define('arclight-loading', ArclightLoading);
