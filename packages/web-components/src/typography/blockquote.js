import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Styled pull-quote with optional citation for editorial emphasis.
 *
 * @tag arc-blockquote
 * @prop {string} cite - Citation or attribution text displayed beneath the quote with an em dash prefix
 * @prop {'default' | 'accent'} variant - Visual variant. Accent applies a gradient text fill to the quote content.
 * @slot - Default content.
 * @csspart blockquote
 * @csspart quote
 * @csspart cite
 */
export class ArcBlockquote extends LitElement {
  static properties = {
    cite:    { type: String },
    variant: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .blockquote {
        position: relative;
        padding: var(--space-lg) var(--space-xl);
        margin: var(--space-lg) 0;
        background: rgba(var(--accent-primary-rgb), 0.02);
        border-radius: var(--radius-md);
      }

      /* Top gradient accent line */
      .blockquote::before {
        content: '';
        position: absolute;
        top: 0;
        inset-inline-start: var(--space-lg);
        inset-inline-end: var(--space-lg);
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent);
        opacity: 0.4;
      }

      /* Decorative opening quote mark */
      .blockquote::after {
        content: '\u201C';
        position: absolute;
        top: -8px;
        inset-inline-start: var(--space-md);
        font-size: 64px;
        font-weight: var(--font-quote-weight, 200);
        line-height: 1;
        color: var(--text-ghost);
        opacity: 0.15;
        font-family: var(--font-quote);
        pointer-events: none;
      }

      .quote {
        font-family: var(--font-body);
        font-size: var(--_text-lg);
        font-weight: 400;
        font-style: italic;
        color: var(--text-primary);
        line-height: 1.8;
      }

      :host([variant='accent']) .quote {
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .cite {
        display: block;
        margin-top: var(--space-md);
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
      }
    `,
  ];

  constructor() {
    super();
    this.cite = '';
    this.variant = 'default';
  }

  render() {
    return html`
      <blockquote class="blockquote" part="blockquote">
        <div class="quote" part="quote">
          <slot></slot>
        </div>
        ${this.cite
          ? html`<footer class="cite" part="cite">&mdash; ${this.cite}</footer>`
          : nothing}
      </blockquote>
    `;
  }
}
