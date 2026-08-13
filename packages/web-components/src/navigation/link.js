import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { isLoneSlottedAnchor } from '../shared/anchor-adoption.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Styled anchor with nav, muted, and default variants.
 *
 * @tag arc-link
 * @prop {string} href - URL destination for the link.
 * @prop {'default' | 'muted' | 'nav'} variant - Link style variant. `default` uses accent-primary color, `muted` uses muted text, `nav` uses secondary text with 14px size and flex layout.
 * @prop {boolean} active - Active state — applies accent-primary color for navigation highlighting.
 * @prop {boolean} external - When true, adds `target="_blank"` and `rel="noopener noreferrer"`, and renders an external link icon after the text.
 * @prop {'hover' | 'always' | 'never'} underline - Controls underline behavior: 'hover' underlines on hover, 'always' keeps it visible, 'never' omits it.
 * @slot - Default content. Slotting a single `<a>` as the only child adopts it as the link — the recommended form for links that must work before hydration or without JavaScript. In this form `external` contributes the marker icon only; put `target`/`rel` on your own anchor, and note that `::part(link)` does not apply.
 * @csspart link
 */
export class ArcLink extends DeclaredPropsMixin(LitElement) {
  static properties = {
    href: { type: String },
    variant: oneOf(['default', 'muted', 'nav']),
    underline: oneOf(['hover', 'always', 'never']),
    active: flag(false),
    external: flag(false),
    _slottedAnchor: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline; }

      /* Anchor-adoption form: a lone slotted <a> becomes the link itself and
         takes the same styling as .link — see shared/anchor-adoption.js.
         Keep each .link rule paired with its .link-slot::slotted(a) form. */
      .link,
      .link-slot::slotted(a) {
        font-family: var(--font-body);
        font-size: inherit;
        color: var(--interactive);
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

      .link:hover,
      .link-slot::slotted(a:hover) {
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      /* Underline variants */
      :host([underline="always"]) .link,
      :host([underline="always"]) .link-slot::slotted(a) {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      :host([underline="never"]) .link:hover,
      :host([underline="never"]) .link-slot::slotted(a:hover) {
        text-decoration: none;
      }

      :host([variant="muted"]) .link,
      :host([variant="muted"]) .link-slot::slotted(a) {
        color: var(--text-muted);
      }
      :host([variant="muted"]) .link:hover,
      :host([variant="muted"]) .link-slot::slotted(a:hover) {
        color: var(--text-primary);
      }

      :host([variant="nav"]) .link,
      :host([variant="nav"]) .link-slot::slotted(a) {
        color: var(--text-secondary);
        font-size: var(--_text-sm);
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
      }
      :host([variant="nav"]) .link:hover,
      :host([variant="nav"]) .link-slot::slotted(a:hover) {
        color: var(--text-primary);
        text-decoration: none;
      }

      :host([active]) .link,
      :host([active]) .link-slot::slotted(a) {
        color: var(--interactive);
      }

      .link:focus-visible,
      .link-slot::slotted(a:focus-visible) {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
        border-radius: var(--radius-xs);
      }

      .link__external-icon {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-inline-start: 2px; /* cosmetic micro-spacing for external icon */
        vertical-align: middle;
        opacity: 0.6;
      }
    `,
  ];

  constructor() {
    super();
    this.href = '';
    this._slottedAnchor = false;
  }

  _onDefaultSlotChange(e) {
    this._slottedAnchor = isLoneSlottedAnchor(e.target);
  }

  _renderExternalIcon() {
    if (!this.external) return '';
    return html`
      <svg class="link__external-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5zm6.75 0a.75.75 0 000 1.5h1.94L8.22 7.72a.75.75 0 001.06 1.06l4.22-4.22v1.94a.75.75 0 001.5 0V2.75a.75.75 0 00-.75-.75h-4.5z"/>
      </svg>
    `;
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    // An explicit href always wins — established API, unchanged behavior.
    if (!this.href && this._slottedAnchor) {
      // The icon sits beside the adopted anchor rather than inside it; light DOM
      // is the consumer's to own, so `external` contributes the marker only and
      // target/rel belong on their anchor.
      return html`
        <slot class="link-slot" @slotchange=${this._onDefaultSlotChange}></slot>${this._renderExternalIcon()}
      `;
    }

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
        <slot @slotchange=${this._onDefaultSlotChange}></slot>
        ${this._renderExternalIcon()}
      </a>
    `;
  }
}
