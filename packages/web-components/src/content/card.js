import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { cardHoverStyles } from '../card-styles.js';

export class ArcCard extends LitElement {
  static properties = {
    href:        { type: String },
    padding:     { type: String, reflect: true },
    interactive: { type: Boolean, reflect: true },
    _hasFooter:  { state: true },
  };

  static styles = [
    tokenStyles,
    cardHoverStyles,
    css`
      :host { display: block; }

      .card { height: 100%; }

      /* Suppress hover effect when no href and not interactive */
      :host(:not([href]):not([interactive])) .card:hover {
        background: var(--border-subtle);
      }
      :host(:not([href]):not([interactive])) .card:hover .card__inner {
        box-shadow: none;
      }

      :host([interactive]) .card { cursor: pointer; }

      .card__inner {
        padding: var(--space-lg);
      }

      /* Padding variants */
      :host([padding="none"]) .card__inner { padding: 0; }
      :host([padding="sm"]) .card__inner { padding: var(--space-sm); }
      :host([padding="lg"]) .card__inner { padding: var(--space-xl); }

      .card__body {
        flex: 1;
      }

      .card__footer {
        margin-top: var(--space-md);
      }

      .card__footer--empty {
        display: none;
      }

      @media (max-width: 768px) {
        .card__inner { padding: var(--space-lg) var(--space-md); }
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
    this.padding = 'md';
    this.interactive = false;
    this._hasFooter = false;
  }

  _onFooterSlotChange(e) {
    this._hasFooter = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    const content = html`
      <div class="card__body" part="body"><slot></slot></div>
      <div class="card__footer ${this._hasFooter ? '' : 'card__footer--empty'}" part="footer">
        <slot name="footer" @slotchange=${this._onFooterSlotChange}></slot>
      </div>
    `;

    if (this.href) {
      return html`<a class="card" href=${this.href} part="card"><div class="card__inner" part="inner">${content}</div></a>`;
    }
    return html`<div class="card" part="card"><div class="card__inner" part="inner">${content}</div></div>`;
  }
}

customElements.define('arc-card', ArcCard);
