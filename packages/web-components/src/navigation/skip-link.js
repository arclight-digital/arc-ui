import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-skip-link
 */
export class ArcSkipLink extends LitElement {
  static properties = {
    target: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: contents;
      }

      .skip-link {
        position: fixed;
        top: var(--space-md);
        left: 50%;
        transform: translateX(-50%) translateY(-200%);
        z-index: 10000;
        background: var(--accent-primary);
        color: white;
        padding: var(--space-xs) var(--space-lg);
        border-radius: var(--radius-full);
        font-family: var(--font-accent);
        font-size: var(--text-sm);
        font-weight: 600;
        text-decoration: none;
        transition: transform var(--transition-fast) var(--ease-out-expo);
        white-space: nowrap;
      }

      .skip-link:focus-visible {
        transform: translateX(-50%) translateY(0);
        box-shadow: var(--focus-glow), 0 0 20px rgba(var(--accent-primary-rgb), 0.3);
        outline: none;
      }
    `,
  ];

  constructor() {
    super();
    this.target = '#main';
  }

  render() {
    return html`
      <a class="skip-link" href=${this.target} part="link">
        <slot>Skip to content</slot>
      </a>
    `;
  }
}
