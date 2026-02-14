import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-footer
 */
export class ArcFooter extends LitElement {
  static properties = {
    compact: { type: Boolean, reflect: true },
    border:  { type: Boolean, reflect: true },
    align:   { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        background: var(--bg-deep);
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--body-size);
      }

      :host([border]) .footer {
        border-top: 1px solid var(--border-subtle);
      }

      .footer {
        padding: var(--space-2xl) var(--space-xl) var(--space-xl);
      }

      :host([compact]) .footer {
        padding: var(--space-lg) var(--space-md) var(--space-md);
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
        padding-top: var(--space-md);
        border-top: 1px solid var(--border-subtle);
        color: var(--text-muted);
        font-size: var(--text-sm);
      }
    `,
  ];

  constructor() {
    super();
    this.compact = false;
    this.border = true;
    this.align = 'left';
  }

  render() {
    return html`
      <footer class="footer" part="base">
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
      </footer>
    `;
  }
}
