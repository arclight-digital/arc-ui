import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { logoSm, logoLg } from '../assets/logo.js';

const SIZES = { sm: { svg: logoSm, height: 28 }, lg: { svg: logoLg, height: 96 } };

/** @tag arclight-logo */
export class ArclightLogo extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        color: var(--text-primary, #e8e8ec);
      }

      @keyframes pulse-expand {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.15); opacity: 1; }
      }

      @keyframes pulse-contract {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.92); opacity: 0.5; }
      }

      .pulse-out {
        animation: pulse-expand 4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }

      .pulse-in {
        animation: pulse-contract 4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
`,
  ];

  constructor() {
    super();
    this.size = 'sm';
  }

  render() {
    const s = SIZES[this.size] || SIZES.sm;
    return html`${s.svg}`;
  }

  updated() {
    const s = SIZES[this.size] || SIZES.sm;
    const svg = this.renderRoot.querySelector('svg');
    if (svg) {
      svg.style.height = `${s.height}px`;
      svg.style.width = 'auto';

      // Tag the pulsing rings — skip the first child (solid dot)
      const circles = svg.querySelector('#Circles');
      if (circles) {
        const children = [...circles.children];
        // 0: solid dot (stays still)
        // 1: 7% opacity ring — expands out
        // 2: large gradient — contracts in (counter-motion)
        // 3: medium gradient — expands out
        if (children[1]) { children[1].classList.add('pulse-out'); children[1].style.animationDelay = '0s'; }
        if (children[2]) { children[2].classList.add('pulse-in'); children[2].style.animationDelay = '-1s'; }
        if (children[3]) { children[3].classList.add('pulse-out'); children[3].style.animationDelay = '-2s'; }
      }
    }
  }
}

customElements.define('arclight-logo', ArclightLogo);
