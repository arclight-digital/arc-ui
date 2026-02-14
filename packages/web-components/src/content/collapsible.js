import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-collapsible
 */
export class ArcCollapsible extends LitElement {
  static properties = {
    open:    { type: Boolean, reflect: true },
    heading: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .collapsible {
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-card);
        overflow: hidden;
      }

      .collapsible__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        width: 100%;
        padding: var(--space-md) var(--space-lg);
        cursor: pointer;
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: 600;
        color: var(--text-primary);
        background: none;
        border: none;
        text-align: left;
        transition: background var(--transition-fast);
      }

      .collapsible__trigger:hover {
        background: var(--bg-elevated);
      }

      .collapsible__trigger:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px var(--accent-primary);
        background: var(--bg-elevated);
      }

      .collapsible__chevron {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        font-size: var(--text-xs);
        flex-shrink: 0;
        transition: transform 300ms ease;
        transform: rotate(0deg);
      }

      :host([open]) .collapsible__chevron {
        transform: rotate(90deg);
      }

      .collapsible__content {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 300ms ease;
      }

      :host([open]) .collapsible__content {
        grid-template-rows: 1fr;
      }

      .collapsible__body {
        overflow: hidden;
      }

      .collapsible__inner {
        padding: 0 var(--space-lg) var(--space-lg);
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--body-size);
        line-height: var(--body-lh);
      }

      @media (prefers-reduced-motion: reduce) {
        .collapsible__chevron,
        .collapsible__content { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.heading = '';
  }

  _toggle() {
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent('arc-toggle', {
      detail: { open: this.open },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggle();
    }
  }

  render() {
    return html`
      <div class="collapsible" part="collapsible">
        <button
          class="collapsible__trigger"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls="content"
          @click=${this._toggle}
          @keydown=${this._handleKeydown}
          part="trigger"
        >
          <span part="heading">${this.heading}</span>
          <span class="collapsible__chevron" aria-hidden="true">&#9656;</span>
        </button>
        <div class="collapsible__content" id="content" role="region" aria-label=${this.heading || 'Collapsible content'}>
          <div class="collapsible__body">
            <div class="collapsible__inner" part="body">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
