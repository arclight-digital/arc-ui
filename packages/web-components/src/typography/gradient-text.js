import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-gradient-text
 */
export class ArcGradientText extends LitElement {
  static properties = {
    variant:  { type: String, reflect: true },
    gradient: { type: String },
    animate:  { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline;
      }

      .gradient-text {
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        background-size: 100% 100%;
        filter: drop-shadow(0 0 12px rgba(var(--accent-primary-rgb), 0.2));
      }

      /* --- Variant gradients --- */

      :host([variant="accent"]) .gradient-text,
      :host(:not([variant])) .gradient-text {
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        background-clip: text;
      }

      :host([variant="display"]) .gradient-text {
        background: var(--gradient-display-text);
        -webkit-background-clip: text;
        background-clip: text;
      }

      :host([variant="sunset"]) .gradient-text {
        background: linear-gradient(135deg, #ff6b6b, #ffa500, #ff4757);
        -webkit-background-clip: text;
        background-clip: text;
      }

      :host([variant="ocean"]) .gradient-text {
        background: linear-gradient(135deg, #00d2ff, #3a7bd5, #6dd5fa);
        -webkit-background-clip: text;
        background-clip: text;
      }

      /* custom variant handled via inline style in render() */

      /* --- Animation --- */

      :host([animate]) .gradient-text {
        background-size: 200% 200%;
        animation: gradient-shift 4s ease infinite;
      }

      @keyframes gradient-shift {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @media (prefers-reduced-motion: reduce) {
        :host([animate]) .gradient-text {
          animation: none;
          background-size: 100% 100%;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.variant = 'accent';
    this.gradient = '';
    this.animate = false;
  }

  render() {
    const customStyle = this.variant === 'custom' && this.gradient
      ? `background:${this.gradient};-webkit-background-clip:text;background-clip:text;`
      : '';

    return html`<span
      class="gradient-text"
      part="text"
      style="${customStyle}"
    ><slot></slot></span>`;
  }
}
