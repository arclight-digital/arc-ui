import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { cardHoverStyles } from '../card-styles.js';
import { isLoneSlottedAnchor } from '../shared/anchor-adoption.js';

/**
 * Content container with subtle border styling and hover effects. Links the entire card surface
 * when an href is provided, creating a seamless clickable area with an animated gradient border.
 *
 * @tag arc-card
 * @prop {string} href - When set, renders the card as an anchor element, making the entire card surface a clickable link. On hover, the border transitions to a blue-to-violet gradient and the inner surface gains a lift shadow.
 * @prop {'none' | 'sm' | 'md' | 'lg'} padding - Controls internal spacing. Options: 'none', 'sm', 'md', 'lg'.
 * @prop {boolean} interactive - Enables hover effects for clickable cards that trigger JS instead of navigating via href.
 * @slot - Default content. Wrapping the content in a single `<a>` adopts it as the card's link — the recommended form for cards that must work before hydration or without JavaScript. The anchor fills the padded surface; the `footer` slot stays outside it so footer actions remain separately clickable.
 * @slot footer
 * @csspart body
 * @csspart footer
 * @csspart card
 * @csspart inner
 */
export class ArcCard extends LitElement {
  static properties = {
    href:        { type: String },
    padding:     { type: String, reflect: true },
    interactive: { type: Boolean, reflect: true },
    _hasFooter:  { state: true },
    _slottedAnchor: { state: true },
  };

  static styles = [
    tokenStyles,
    cardHoverStyles,
    css`
      :host { display: block; }

      .card { height: 100%; }

      /* Suppress hover effect when the card isn't actually actionable.
         card--linked opts back in for the anchor-adoption form, where a slotted
         <a> supplies the destination instead of the href attribute. */
      :host(:not([href]):not([interactive])) .card:not(.card--linked):hover {
        background: var(--border-subtle);
      }
      :host(:not([href]):not([interactive])) .card:not(.card--linked):hover .card__inner {
        box-shadow: none;
      }

      /* Anchor-adoption form: the slotted <a> fills the content box, so the
         padded surface is the click target — see shared/anchor-adoption.js.
         It stays inside .card__inner rather than replacing .card, which keeps
         the 1px gradient-border trick in card-styles.js intact. */
      .card-slot::slotted(a) {
        display: flex;
        flex-direction: column;
        flex: 1;
        text-decoration: none;
        color: inherit;
      }
      .card-slot::slotted(a:focus-visible) {
        outline: none;
        box-shadow: var(--interactive-focus);
        border-radius: var(--radius-md);
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
        position: relative;
      }

      .card__footer::before {
        content: '';
        position: absolute;
        top: calc(-1 * var(--space-md) / 2);
        inset-inline-start: var(--space-md);
        inset-inline-end: var(--space-md);
        height: 1px;
        background: var(--divider-glow);
        opacity: 0.5;
      }

      .card__footer--empty {
        display: none;
      }

      .card__footer--empty::before {
        display: none;
      }

      @media (max-width: 768px) { /* --breakpoint-md */
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
    this._slottedAnchor = false;
    this._hasFooter = false;
  }

  _onFooterSlotChange(e) {
    this._hasFooter = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onDefaultSlotChange(e) {
    this._slottedAnchor = isLoneSlottedAnchor(e.target);
  }

  render() {
    const content = html`
      <div class="card__body" part="body">
        <slot class="card-slot" @slotchange=${this._onDefaultSlotChange}></slot>
      </div>
      <div class="card__footer ${this._hasFooter ? '' : 'card__footer--empty'}" part="footer">
        <slot name="footer" @slotchange=${this._onFooterSlotChange}></slot>
      </div>
    `;

    // An explicit href always wins — established API, unchanged behaviour.
    if (this.href) {
      return html`<a class="card" href=${this.href} part="card"><div class="card__inner" part="inner">${content}</div></a>`;
    }
    // The footer stays outside the adopted anchor, so footer actions remain
    // separately clickable rather than nesting inside the card link.
    const classes = `card${this._slottedAnchor ? ' card--linked' : ''}`;
    return html`<div class=${classes} part="card"><div class="card__inner" part="inner">${content}</div></div>`;
  }
}
