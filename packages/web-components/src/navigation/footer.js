import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../layout/container.register.js';

/**
 * Page footer with branding, link columns, and legal text. Provides a structured layout with slots
 * for a logo, navigational link groups, social icons, and copyright information.
 *
 * @tag arc-footer
 * @prop {boolean} compact - Reduces internal padding and spacing throughout the footer. Use this in dashboard layouts or admin panels where vertical space is limited and the footer should feel lightweight rather than expansive.
 * @prop {boolean} border - Renders a subtle top border on the footer to visually separate it from the page content above. Enabled by default; disable it only when the footer sits against a dark background where the border would be redundant.
 * @prop {string} contained - Sets a max-width containment on the footer content. Accepts any CSS length value or named size token.
 * @prop {string} align - Controls footer content alignment. Options: 'left', 'center'.
 * @slot logo
 * @slot - Default content.
 * @slot social
 * @slot legal
 * @csspart brand
 * @csspart columns
 * @csspart social
 * @csspart legal
 * @csspart base
 */
export class ArcFooter extends LitElement {
  static properties = {
    compact:   { type: Boolean, reflect: true },
    border:    { type: Boolean, reflect: true },
    contained: { type: String, reflect: true },
    align:     { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        background: var(--surface-base);
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--body-size);
      }

      :host([border]) .footer {
        border-top: 1px solid var(--divider);
      }

      .footer {
        padding: var(--space-xl);
        padding-inline: var(--space-lg);
      }

      :host([contained]) .footer {
        padding-inline: 0;
      }

      :host([compact]) .footer {
        padding: var(--space-md);
      }

      .footer__brand {
        margin-bottom: var(--space-xl);
      }

      :host([compact]) .footer__brand {
        margin-bottom: var(--space-md);
      }

      .footer__columns {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: var(--space-xl);
        margin-bottom: var(--space-xl);
      }

      :host([compact]) .footer__columns {
        gap: var(--space-md);
        margin-bottom: var(--space-md);
      }

      .footer__social {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
      }

      :host([compact]) .footer__social {
        margin-bottom: var(--space-sm);
      }

      /* Center alignment */
      :host([align="center"]) .footer { text-align: center; }
      :host([align="center"]) .footer__columns { justify-items: center; }
      :host([align="center"]) .footer__social { justify-content: center; }
      :host([align="center"]) .footer__legal { text-align: center; }

      .footer__legal {
        position: relative;
        padding-top: var(--space-md);
        color: var(--text-muted);
        font-size: var(--text-sm);
      }

      .footer__legal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--gradient-divider-glow);
      }
    `,
  ];

  constructor() {
    super();
    this.compact = false;
    this.border = true;
    this.contained = null;
    this.align = 'left';
  }

  get _containerSize() {
    if (!this.contained && this.contained !== '') return null;
    const size = this.contained || 'md';
    return ['sm', 'md', 'lg', 'xl', 'full'].includes(size) ? size : 'md';
  }

  _renderContent() {
    return html`
      <div class="footer__brand" part="brand">
        <slot name="logo"></slot>
      </div>
      <div class="footer__columns" part="columns">
        <slot></slot>
      </div>
      <div class="footer__social" part="social">
        <slot name="social"></slot>
      </div>
      <div class="footer__legal" part="legal">
        <slot name="legal"></slot>
      </div>
    `;
  }

  render() {
    const size = this._containerSize;
    return html`
      <footer class="footer" part="base">
        ${size
          ? html`<arc-container size=${size}>${this._renderContent()}</arc-container>`
          : this._renderContent()
        }
      </footer>
    `;
  }
}
