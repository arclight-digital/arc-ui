import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcCard extends LitElement {
  static properties = {
    href: { type: String },
    _hasFooter: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .card {
        position: relative;
        border-radius: var(--radius-lg);
        padding: 1px;
        background: var(--border-subtle);
        transition: background var(--transition-slow);
        text-decoration: none;
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      :host([href]) .card:hover {
        background: linear-gradient(135deg, rgba(var(--accent-primary-rgb),0.3), rgba(var(--accent-secondary-rgb),0.15), var(--border-default));
      }

      .card__inner {
        position: relative;
        background: var(--bg-card);
        border-radius: calc(var(--radius-lg) - 1px);
        padding: var(--space-xl) var(--space-lg);
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        transition: box-shadow var(--transition-slow);
      }

      .card:hover .card__inner {
        box-shadow: inset 0 1px 0 var(--bg-hover), var(--glow-card-hover);
      }

      .card:focus-visible { outline: none; box-shadow: var(--focus-glow); border-radius: var(--radius-lg); }

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
