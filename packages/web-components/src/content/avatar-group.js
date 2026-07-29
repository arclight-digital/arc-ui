import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Stack of avatars with overflow count badge.
 *
 * @tag arc-avatar-group
 * @prop {number} max - Maximum number of avatars to display. Excess avatars are hidden and a "+N" overflow badge is shown.
 * @prop {'sm' | 'md' | 'lg'} overlap - Overlap density preset. sm = -8px, md = -12px, lg = -16px negative margin between avatars.
 * @slot - Default content.
 * @csspart group
 * @csspart overflow
 */
export class ArcAvatarGroup extends LitElement {
  static properties = {
    max:     { type: Number },
    overlap: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }

      .group {
        display: flex;
        align-items: center;
      }

      ::slotted(*) {
        position: relative;
        box-sizing: border-box;
        box-shadow: 0 0 0 3px var(--surface-base);
        border-radius: var(--radius-full);
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      }

      ::slotted(:hover) {
        transform: translateY(-2px) scale(1.08);
        z-index: 100 !important;
        box-shadow: 0 0 0 3px var(--surface-base), var(--shadow-md);
      }

      .group__overflow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-sm);
        letter-spacing: 0.5px;
        color: var(--text-ghost);
        user-select: none;
        padding-left: var(--space-sm);
      }

      :host([overlap="sm"]) .group__overflow { padding-left: var(--space-xs); }
      :host([overlap="lg"]) .group__overflow { padding-left: var(--space-md); }

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
    this.max = Infinity;
    this.overlap = 'md';
  }

  /** @private */
  _handleSlotChange(e) {
    const nodes = e.target.assignedElements();
    const overflow = nodes.length - this.max;
    const margins = { sm: -8, md: -12, lg: -16 };
    const ml = margins[this.overlap] ?? margins.md;

    nodes.forEach((node, i) => {
      node.style.display = i < this.max ? '' : 'none';
      node.style.zIndex = nodes.length - i;
      node.style.marginLeft = i === 0 ? '0' : `${ml}px`;
    });

    const counter = this.shadowRoot.querySelector('.group__overflow');
    if (counter) {
      counter.style.display = overflow > 0 ? '' : 'none';
      counter.textContent = `+${overflow}`;
    }
  }

  render() {
    return html`
      <div class="group" part="group" role="group" aria-label="Avatar group">
        <slot @slotchange=${this._handleSlotChange}></slot>
        <span class="group__overflow" part="overflow" style="display:none"></span>
      </div>
    `;
  }
}
