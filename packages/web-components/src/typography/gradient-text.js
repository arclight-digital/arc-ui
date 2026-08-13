import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Inline text wrapper that applies gradient fills to text declaratively.
 *
 * @tag arc-gradient-text
 * @prop {'accent' | 'display' | 'sunset' | 'ocean' | 'custom'} variant - Predefined gradient variant to apply
 * @prop {string} gradient - Custom CSS gradient string, used when variant is set to custom
 * @prop {boolean} animated - Animate the gradient with a shifting background-position cycle
 * @slot - Default content.
 * @csspart text
 */
export class ArcGradientText extends DeclaredPropsMixin(LitElement) {
  static properties = {
    variant: oneOf(['accent', 'display', 'sunset', 'ocean', 'custom']),
    gradient: { type: String },
    animated: flag(false),
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
        /* Clipped text paints glyphs only where the box is — under a tight
           inherited line-height the descenders leave the box and get chopped.
           Extend the paint box in em so it scales with the type; the margin
           gives it back so block layouts don't move. */
        padding-block: 0.1em 0.2em;
        margin-block: -0.1em -0.2em;
      }

      /* --- Variant gradients --- */

      :host([variant="accent"]) .gradient-text,
      :host(:not([variant="display"]):not([variant="ocean"]):not([variant="sunset"])) .gradient-text {
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

      :host([animated]) .gradient-text {
        background-size: 200% 200%;
        animation: gradient-shift 4s ease infinite;
      }

      @keyframes gradient-shift {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @media (prefers-reduced-motion: reduce) {
        :host([animated]) .gradient-text {
          animation: none;
          background-size: 100% 100%;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.gradient = '';
  }

  render() {
    const customStyle =
      this.variant === 'custom' && this.gradient
        ? `background:${this.gradient};-webkit-background-clip:text;background-clip:text;`
        : '';

    return html`<span
      class="gradient-text"
      part="text"
      style="${customStyle}"
    ><slot></slot></span>`;
  }
}
