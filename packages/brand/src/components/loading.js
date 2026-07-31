import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { injectAzeretFont } from '../assets/inject-azeret.js';
import './logo.js';

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

      @media (prefers-reduced-motion: reduce) {
        :host { animation: none; }
      }

      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-md);
      }

      .label {
        font-family: 'Azeret Mono Subset', ui-monospace, monospace;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 1px;
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
    if (this.label) injectAzeretFont();
  }

  updated() {
    if (this.label) injectAzeretFont();
  }

  render() {
    const s = SIZES[this.size] || SIZES.md;
    return html`
      <div class="container" role="status" aria-label="${this.label || 'Loading'}">
        <arclight-logo size="${s.logoSize}"></arclight-logo>
        ${this.label ? html`<span class="label">${this.label}</span>` : null}
      </div>
    `;
  }
}

if (!customElements.get('arclight-loading')) customElements.define('arclight-loading', ArclightLoading);
