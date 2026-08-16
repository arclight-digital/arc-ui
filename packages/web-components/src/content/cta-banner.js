import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Full-width call-to-action banner with gradient background, eyebrow text, headline, body copy,
 * and action buttons. Ideal for landing page CTAs, marketing sections, and page closers.
 *
 * @tag arc-cta-banner
 * @arc-group marketing
 * @status stable
 * @prop {string} eyebrow - Small label text displayed above the headline. Typically a short phrase like "Ready to build?" that sets context.
 * @prop {string} headline - Main headline text rendered with gradient display styling. Keep it concise and action-oriented.
 * @prop {boolean} nogradient - When true, disables the radial gradient background effect for quieter contexts.
 * @slot eyebrow
 * @slot headline
 * @slot - Default content.
 * @slot actions
 * @csspart base - The root element.
 * @csspart container
 * @csspart background
 * @csspart inner
 * @csspart eyebrow
 * @csspart headline
 * @csspart body
 * @csspart actions
 */
export class ArcCtaBanner extends DeclaredPropsMixin(LitElement) {
  static properties = {
    eyebrow: { type: String },
    headline: { type: String },
    nogradient: flag(false),
  };

  static styles = [
    tokenStyles,
    css`
      /* Not clipped. A banner whose light stops dead on its own top edge reads
         as a pasted-in box on a dark page — the straight line where the wash
         ends is the giveaway — so the wash below reaches above the host and
         needs to be allowed out. Nothing else here overflows: the wash is
         absolutely positioned and inert. */
      :host { display: block; position: relative; }

      .cta {
        position: relative;
        padding: var(--space-3xl) var(--space-lg);
      }

      /* One wash, not two. It starts above the host and runs to the bottom of
         the banner, so the light entering the section and the light under the
         headline are the same gradient — a second box stacked above this one
         met it at a different brightness and drew a straight line across the
         page at the seam. Negative inset-block-start rather than a taller box:
         the ellipses stay anchored to the content, at 72% of a box that now
         begins above the banner. */
      .cta__bg {
        position: absolute;
        inset: -60% 0 0 0;
        background:
          radial-gradient(ellipse 60% 70% at 30% 72%, rgba(var(--accent-primary-rgb), 0.1), transparent 65%),
          radial-gradient(ellipse 60% 70% at 70% 72%, rgba(var(--accent-secondary-rgb), 0.08), transparent 65%);
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
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
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
        font-size: var(--_text-md);
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
  }

  render() {
    return html`
      <div class="cta" part="base container">
        <div class="cta__bg" part="background"></div>
        <div class="cta__inner" part="inner">
          ${
            this.eyebrow
              ? html`
            <span class="cta__eyebrow" part="eyebrow">
              <slot name="eyebrow">${this.eyebrow}</slot>
            </span>
          `
              : html`<slot name="eyebrow"></slot>`
          }
          ${
            this.headline
              ? html`
            <h2 class="cta__headline" part="headline">
              <slot name="headline">${this.headline}</slot>
            </h2>
          `
              : html`<slot name="headline"></slot>`
          }
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
