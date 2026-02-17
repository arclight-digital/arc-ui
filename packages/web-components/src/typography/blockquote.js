import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-blockquote
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
        left: var(--space-lg);
        right: var(--space-lg);
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent);
        opacity: 0.4;
      }

      /* Decorative opening quote mark */
      .blockquote::after {
        content: '\u201C';
        position: absolute;
        top: -8px;
        left: var(--space-md);
        font-size: 64px;
        font-weight: 200;
        line-height: 1;
        color: var(--text-ghost);
        opacity: 0.15;
        font-family: Georgia, serif;
        pointer-events: none;
      }

      .quote {
        font-family: var(--font-body);
        font-size: var(--text-lg);
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
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
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
