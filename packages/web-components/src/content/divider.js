import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-divider
 */
export class ArcDivider extends LitElement {
  static properties = {
    variant:  { type: String, reflect: true },
    align:    { type: String, reflect: true },
    vertical: { type: Boolean, reflect: true },
    label:    { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; width: 100%; }

      .divider { width: 100%; height: 1px; }

      :host(:not([variant])) .divider,
      :host([variant="subtle"]) .divider { background: var(--gradient-divider); }

      :host([variant="glow"]) .divider {
        position: relative;
        background: var(--gradient-divider-glow);
        box-shadow: 0 0 6px rgba(var(--accent-primary-rgb),0.08);
      }
      :host([variant="glow"]) .divider::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(var(--accent-secondary-rgb),0.4) 50%, transparent 100%);
        background-size: 200% 100%;
        animation: divider-shimmer 6s ease-in-out infinite;
        mix-blend-mode: screen;
      }

      :host([variant="line-white"]) .divider,
      :host([variant="line-primary"]) .divider,
      :host([variant="line-gradient"]) .divider {
        height: 2px;
        margin-inline: auto;
      }
      :host([variant="line-white"]) .divider {
        max-width: 160px;
        background: linear-gradient(90deg, transparent, rgba(var(--text-primary-rgb),0.35), transparent);
      }
      :host([variant="line-primary"]) .divider {
        max-width: 200px;
        background: linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.7), transparent);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb),0.3);
      }
      :host([variant="line-gradient"]) .divider {
        max-width: 240px;
        background: var(--divider-glow);
        box-shadow: 0 0 10px rgba(var(--accent-primary-rgb),0.25);
      }

      /* Alignment — rewrite gradients to originate from one edge */
      :host([align="left"]) .divider { margin-inline: 0; }
      :host([align="right"]) .divider { margin-left: auto; margin-right: 0; }

      :host([align="left"]:not([variant])) .divider,
      :host([align="left"][variant="subtle"]) .divider {
        background: linear-gradient(90deg, var(--border-default), transparent);
      }
      :host([align="right"]:not([variant])) .divider,
      :host([align="right"][variant="subtle"]) .divider {
        background: linear-gradient(90deg, transparent, var(--border-default));
      }

      :host([align="left"][variant="glow"]) .divider {
        background: linear-gradient(90deg, rgba(var(--accent-primary-rgb),0.5), rgba(var(--accent-secondary-rgb),0.3), transparent);
      }
      :host([align="right"][variant="glow"]) .divider {
        background: linear-gradient(90deg, transparent, rgba(var(--accent-secondary-rgb),0.3), rgba(var(--accent-primary-rgb),0.5));
      }

      :host([align="left"][variant="line-white"]) .divider {
        background: linear-gradient(90deg, rgba(var(--text-primary-rgb),0.35), transparent);
      }
      :host([align="right"][variant="line-white"]) .divider {
        background: linear-gradient(90deg, transparent, rgba(var(--text-primary-rgb),0.35));
      }

      :host([align="left"][variant="line-primary"]) .divider {
        background: linear-gradient(90deg, rgba(var(--accent-primary-rgb),0.7), transparent);
      }
      :host([align="right"][variant="line-primary"]) .divider {
        background: linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.7));
      }

      :host([align="left"][variant="line-gradient"]) .divider {
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), transparent);
      }
      :host([align="right"][variant="line-gradient"]) .divider {
        background: linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary));
      }

      /* ── Vertical ── */
      :host([vertical]) { display: inline-flex; width: auto; height: 100%; }
      :host([vertical]) .divider { width: 1px; height: 100%; }

      :host([vertical]:not([variant])) .divider,
      :host([vertical][variant="subtle"]) .divider {
        background: linear-gradient(180deg, transparent, var(--border-default), transparent);
      }

      :host([vertical][variant="glow"]) .divider {
        background: linear-gradient(180deg, transparent, rgba(var(--accent-primary-rgb),0.5), rgba(var(--accent-secondary-rgb),0.3), transparent);
      }

      :host([vertical][variant="line-gradient"]) .divider {
        width: 2px;
        max-width: none;
        background: linear-gradient(180deg, transparent, var(--accent-primary), var(--accent-secondary), transparent);
        box-shadow: 0 0 10px rgba(var(--accent-primary-rgb),0.25);
      }

      :host([vertical][variant="line-primary"]) .divider {
        width: 2px;
        max-width: none;
        background: linear-gradient(180deg, transparent, rgba(var(--accent-primary-rgb),0.7), transparent);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb),0.3);
      }

      :host([vertical][variant="line-white"]) .divider {
        width: 2px;
        max-width: none;
        background: linear-gradient(180deg, transparent, rgba(var(--text-primary-rgb),0.35), transparent);
      }

      /* Labeled divider */
      .divider--labeled {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        height: auto;
        background: none !important;
        box-shadow: none !important;
      }

      .divider__line {
        flex: 1;
        height: 1px;
        background: var(--gradient-divider);
      }

      .divider__label {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--text-muted);
        white-space: nowrap;
        flex-shrink: 0;
      }

      @keyframes divider-shimmer {
        0%, 100% { background-position: 200% 0; }
        50% { background-position: -100% 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        :host([variant="glow"]) .divider::after { animation: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.variant = 'subtle';
    this.vertical = false;
    this.label = '';
  }

  render() {
    if (this.label && !this.vertical) {
      return html`
        <div class="divider divider--labeled" role="separator" part="divider">
          <span class="divider__line" part="line"></span>
          <span class="divider__label" part="label">${this.label}</span>
          <span class="divider__line" part="line"></span>
        </div>
      `;
    }
    return html`<div class="divider" role="separator" aria-orientation=${this.vertical ? 'vertical' : 'horizontal'} part="divider"></div>`;
  }
}
