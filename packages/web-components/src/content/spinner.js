import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Animated loading spinner in three sizes.
 *
 * @tag arc-spinner
 * @prop {'sm' | 'md' | 'lg'} size - Spinner dimensions: sm (16px), md (24px), lg (40px)
 * @prop {'primary' | 'secondary' | 'white'} variant - Color of the spinner ring
 * @slot none
 * @csspart spinner
 */
export class ArcSpinner extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    variant: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .spinner {
        border-radius: var(--radius-full);
        border-style: solid;
        border-color: var(--accent-primary);
        border-top-color: transparent;
        animation: spin 0.75s linear infinite;
        box-sizing: border-box;
      }

      :host([size="sm"]) .spinner { width: 16px; height: 16px; border-width: 2px; }
      :host([size="md"]) .spinner { width: 24px; height: 24px; border-width: 2.5px; }
      :host([size="lg"]) .spinner { width: 40px; height: 40px; border-width: 3px; }

      :host([variant="primary"]) .spinner {
        border-color: var(--accent-primary);
        border-top-color: transparent;
      }

      :host([variant="secondary"]) .spinner {
        border-color: var(--accent-secondary);
        border-top-color: transparent;
      }

      :host([variant="white"]) .spinner {
        border-color: var(--text-primary);
        border-top-color: transparent;
      }
    `,
  ];

  constructor() {
    super();
    this.size = 'md';
    this.variant = 'primary';
  }

  render() {
    return html`
      <div
        class="spinner"
        part="spinner"
        role="status"
        aria-label="Loading"
      ></div>
    `;
  }
}
