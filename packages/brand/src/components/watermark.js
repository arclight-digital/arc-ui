import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { logoLg } from '../assets/logo.js';

const SIZES = { sm: 120, md: 240, lg: 400 };

/** @tag arclight-watermark */
export class ArclightWatermark extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    opacity: { type: Number, reflect: true },
    animated: { type: Boolean, reflect: true },
    position: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        position: absolute;
        pointer-events: none;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-primary, #e8e8ec);
      }

      :host([position="center"]) {
        inset: 0;
      }

      :host([position="bottom-right"]) {
        bottom: 0;
        right: 0;
        padding: var(--space-md);
      }

      @keyframes pulse-expand {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.15); opacity: 1; }
      }

      @keyframes pulse-contract {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.92); opacity: 0.5; }
      }

      :host([animated]) .pulse-out {
        animation: pulse-expand 4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }

      :host([animated]) .pulse-in {
        animation: pulse-contract 4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
    `,
  ];

  constructor() {
    super();
    this.size = 'md';
    this.opacity = 0.04;
    this.animated = false;
    this.position = 'center';
  }

  render() {
    const px = SIZES[this.size] || SIZES.md;
    return html`
      <div style="opacity: ${this.opacity}; width: ${px}px; height: auto;">
        ${logoLg}
      </div>
    `;
  }

  updated() {
    if (!this.animated) return;

    const svg = this.renderRoot.querySelector('svg');
    if (!svg) return;

    const circles = svg.querySelector('#Circles');
    if (!circles) return;

    const children = [...circles.children];
    if (children[1]) { children[1].classList.add('pulse-out'); children[1].style.animationDelay = '0s'; }
    if (children[2]) { children[2].classList.add('pulse-in'); children[2].style.animationDelay = '-1s'; }
    if (children[3]) { children[3].classList.add('pulse-out'); children[3].style.animationDelay = '-2s'; }
  }
}

customElements.define('arclight-watermark', ArclightWatermark);
