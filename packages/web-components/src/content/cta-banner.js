import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @arc-prism content — call-to-action banner with gradient background
 */
/**
 * @tag arc-cta-banner
 */
export class ArcCtaBanner extends LitElement {
  static properties = {
    eyebrow:    { type: String },
    headline:   { type: String },
    nogradient: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; position: relative; overflow: hidden; }

      .cta {
        position: relative;
        padding: var(--space-3xl) var(--space-lg);
      }

      .cta__bg {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse at 30% 50%, rgba(var(--accent-primary-rgb), 0.1), transparent 60%),
          radial-gradient(ellipse at 70% 50%, rgba(var(--accent-secondary-rgb), 0.08), transparent 60%);
        pointer-events: none;
      }

      :host([nogradient]) .cta__bg { display: none; }

      .cta__inner {
        position: relative;
        max-width: var(--max-width, 1200px);
        margin-inline: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--space-md);
      }

      .cta__eyebrow {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 4px;
        text-transform: uppercase;
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .cta__headline {
        font-size: clamp(28px, 4vw, 40px);
        font-weight: 500;
        letter-spacing: -1px;
        background: var(--gradient-display-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
      }

      .cta__body {
        color: var(--text-secondary);
        font-size: var(--text-md);
        max-width: 480px;
        text-wrap: balance;
        line-height: 1.7;
      }

      .cta__body ::slotted(*) { margin: 0; }

      .cta__actions {
        display: flex;
        gap: var(--space-md);
        margin-top: var(--space-sm);
      }

      @media (max-width: 768px) { /* --breakpoint-md */
        .cta { padding: var(--space-xl) var(--space-md); }
        .cta__actions { flex-direction: column; align-items: center; }
      }
    `,
  ];

  constructor() {
    super();
    this.eyebrow = '';
    this.headline = '';
    this.nogradient = false;
  }

  render() {
    return html`
      <div class="cta" part="container">
        <div class="cta__bg" part="background"></div>
        <div class="cta__inner" part="inner">
          ${this.eyebrow ? html`
            <span class="cta__eyebrow" part="eyebrow">
              <slot name="eyebrow">${this.eyebrow}</slot>
            </span>
          ` : html`<slot name="eyebrow"></slot>`}
          ${this.headline ? html`
            <h2 class="cta__headline" part="headline">
              <slot name="headline">${this.headline}</slot>
            </h2>
          ` : html`<slot name="headline"></slot>`}
          <div class="cta__body" part="body">
            <slot></slot>
          </div>
          <div class="cta__actions" part="actions">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
