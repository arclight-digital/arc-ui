import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcLink extends LitElement {
  static properties = {
    href:      { type: String },
    variant:   { type: String, reflect: true },
    underline: { type: String, reflect: true },
    active:    { type: Boolean, reflect: true },
    external:  { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline; }

      .link {
        font-family: var(--font-body);
        font-size: inherit;
        color: var(--accent-primary);
        text-decoration: none;
        cursor: pointer;
        transition:
          color var(--transition-fast),
          opacity var(--transition-fast);
        border: none;
        background: none;
        padding: 0;
        min-height: var(--touch-min);
        display: inline-flex;
        align-items: center;
      }

      .link:hover {
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      /* Underline variants */
      :host([underline="always"]) .link {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      :host([underline="never"]) .link:hover {
        text-decoration: none;
      }

      :host([variant="muted"]) .link {
        color: var(--text-muted);
      }
      :host([variant="muted"]) .link:hover {
        color: var(--text-primary);
      }

      :host([variant="nav"]) .link {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
      }
      :host([variant="nav"]) .link:hover {
        color: var(--text-primary);
        text-decoration: none;
      }

      :host([active]) .link {
        color: var(--accent-primary);
      }

      .link:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
        border-radius: var(--radius-xs);
      }

      .link__external-icon {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-left: 2px; /* cosmetic micro-spacing for external icon */
        vertical-align: middle;
        opacity: 0.6;
      }

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.href = '';
    this.variant = 'default';
    this.underline = 'hover';
    this.active = false;
    this.external = false;
  }

  render() {
    const target = this.external ? '_blank' : undefined;
    const rel = this.external ? 'noopener noreferrer' : undefined;

    return html`
      <a
        class="link"
        href=${this.href}
        target=${target || ''}
        rel=${rel || ''}
        part="link"
      >
        <slot></slot>
        ${this.external ? html`
          <svg class="link__external-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5zm6.75 0a.75.75 0 000 1.5h1.94L8.22 7.72a.75.75 0 001.06 1.06l4.22-4.22v1.94a.75.75 0 001.5 0V2.75a.75.75 0 00-.75-.75h-4.5z"/>
          </svg>
        ` : ''}
      </a>
    `;
  }
}

customElements.define('arc-link', ArcLink);
