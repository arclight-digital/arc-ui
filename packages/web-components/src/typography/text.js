import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-text
 */
export class ArcText extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    as:      { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([variant="accent"]),
      :host([variant="code"]) { display: inline; }

      .text--display {
        font-size: var(--display-xl-size);
        font-weight: var(--display-xl-weight);
        letter-spacing: var(--display-xl-spacing);
        line-height: 1.2;
        padding-bottom: 0.1em;
        background: var(--gradient-display-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .text--heading {
        font-size: var(--heading-size);
        font-weight: var(--heading-weight);
        color: var(--text-primary);
        line-height: 1.4;
        text-wrap: balance;
        margin-bottom: var(--space-md);
      }

      .text--body {
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: var(--body-weight);
        line-height: var(--body-lh);
        text-wrap: balance;
      }

      .text--muted { color: var(--text-muted); }
      .text--ghost { color: var(--text-ghost); }

      .text--accent {
        font-family: var(--font-accent);
        font-weight: var(--ui-accent-weight);
        font-size: var(--ui-accent-size);
        letter-spacing: var(--ui-accent-spacing);
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 12px var(--accent-primary-glow));
      }

      .text--label {
        font-family: var(--font-accent);
        font-weight: var(--section-title-weight);
        font-size: var(--section-title-size);
        letter-spacing: var(--section-title-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .text--wordmark {
        font-weight: var(--wordmark-weight);
        font-size: var(--wordmark-size);
        letter-spacing: var(--wordmark-spacing);
        text-transform: uppercase;
        color: var(--text-primary);
        text-shadow: 0 0 30px var(--accent-primary-glow);
      }

      .text--code {
        font-family: var(--font-mono);
        font-size: var(--code-size);
        line-height: var(--code-lh);
        color: var(--accent-secondary);
        text-shadow: 0 0 14px rgba(var(--accent-secondary-rgb),0.3);
      }
    `,
  ];

  constructor() {
    super();
    this.variant = 'body';
    this.as = 'p';
  }

  render() {
    const tag = this.as;
    switch (tag) {
      case 'h1': return html`<h1 class="text--${this.variant}" part="text"><slot></slot></h1>`;
      case 'h2': return html`<h2 class="text--${this.variant}" part="text"><slot></slot></h2>`;
      case 'h3': return html`<h3 class="text--${this.variant}" part="text"><slot></slot></h3>`;
      case 'h4': return html`<h4 class="text--${this.variant}" part="text"><slot></slot></h4>`;
      case 'h5': return html`<h5 class="text--${this.variant}" part="text"><slot></slot></h5>`;
      case 'h6': return html`<h6 class="text--${this.variant}" part="text"><slot></slot></h6>`;
      case 'span': return html`<span class="text--${this.variant}" part="text"><slot></slot></span>`;
      default: return html`<p class="text--${this.variant}" part="text"><slot></slot></p>`;
    }
  }
}
