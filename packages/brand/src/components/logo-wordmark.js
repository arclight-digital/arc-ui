import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import './logo.js';
import './wordmark.js';

const LAYOUTS = {
  inline: { logoSize: 'sm', wordmarkSize: 'sm', gap: '8px' },
  stacked: { logoSize: 'lg', wordmarkSize: 'stacked', gap: '12px' },
};

/** @tag arclight-logo-wordmark */
export class ArclightLogoWordmark extends LitElement {
  static properties = {
    layout: { type: String, reflect: true },
    href: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        line-height: 0;
      }

      .lockup, a.lockup {
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

      a.lockup:hover {
        transform: translateY(-1px);
        filter:
          drop-shadow(0 0 8px rgba(var(--accent-primary-rgb, 77, 126, 247), 0.3))
          drop-shadow(0 0 20px rgba(var(--accent-secondary-rgb, 168, 85, 247), 0.12));
      }

      :host([layout="stacked"]) .lockup {
        flex-direction: column;
      }

      :host([layout="stacked"]) arclight-logo {
        margin-left: -2px;
      }

      :host(:not([layout="stacked"])) arclight-wordmark {
        margin-top: 0.15em;
      }
    `,
  ];

  constructor() {
    super();
    this.layout = 'inline';
    this.href = 'https://arclight.build';
  }

  render() {
    const s = LAYOUTS[this.layout] || LAYOUTS.inline;
    const content = html`
      <arclight-logo size="${s.logoSize}"></arclight-logo>
      <arclight-wordmark size="${s.wordmarkSize}"></arclight-wordmark>
    `;

    return this.href
      ? html`<a class="lockup" href="${this.href}" style="gap: ${s.gap};">${content}</a>`
      : html`<span class="lockup" style="gap: ${s.gap};">${content}</span>`;
  }
}

customElements.define('arclight-logo-wordmark', ArclightLogoWordmark);
