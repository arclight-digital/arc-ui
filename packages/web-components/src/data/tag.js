import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { warnLowContrast } from '../shared/contrast.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Compact pill-shaped label with color variants, custom color support, and an optional remove
 * button, for categorisation, filtering, and selection feedback.
 *
 * @tag arc-tag
 * @status stable
 * @prop {'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'} variant - Color variant. Default is neutral. Primary and secondary use accent tints. Success, warning, error and info provide semantic status colors.
 * @prop {string} color - Custom color as an RGB triplet (e.g. `"77, 126, 247"`). When set, overrides the variant colors for border, text, background, and hover glow. Useful for data-driven category colors.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the tag size.
 * @prop {boolean} removable - When true, shows a close button that fires `arc-remove` when clicked.
 * @prop {boolean} disabled - Disables the tag, reducing opacity to 40% and blocking pointer events including the remove button.
 * @fires {CustomEvent<void>} arc-remove - Fired when the remove button on a removable tag is clicked
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart tag
 * @csspart label
 * @csspart remove
 */
export class ArcTag extends DeclaredPropsMixin(LitElement) {
  static properties = {
    variant: oneOf([
      'default', 'primary', 'secondary', 'success', 'warning', 'error',
      // Absorbed from arc-badge (4.2), which is the only variant it had that
      // arc-tag did not. V4-SCOPE §3 read this row as "no new prop needed",
      // which is true of the props and not of the enum behind one — a badge
      // with variant="info" would have fallen through to `default` here.
      'info',
    ]),
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),
    removable: flag(false),
    disabled: flag(false),
    color: { type: String },
  };

  static styles = [
    tokenStyles,
    statusVars,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .tag {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
        min-height: var(--touch-min);
        padding: var(--touch-pad) calc(var(--space-sm) + var(--space-xs));
        border: 1px solid var(--border-default);
        border-radius: var(--radius-full);
        background: var(--surface-hover);
        transition: box-shadow var(--transition-base), border-color var(--transition-base);
        line-height: 1.4;
      }

      :host([variant="primary"]) .tag {
        border-color: var(--accent-primary-border);
        color: color-mix(in srgb, var(--accent-primary), var(--text-primary) var(--accent-text-mix, 0%));
        background: var(--accent-primary-subtle);
      }

      :host([variant="secondary"]) .tag {
        border-color: var(--accent-secondary-border);
        color: color-mix(in srgb, var(--accent-secondary), var(--text-primary) var(--accent-text-mix, 0%));
        background: var(--accent-secondary-subtle);
      }

      :host([variant="success"]) .tag {
        border-color: rgba(var(--color-success-rgb), 0.2);
        color: color-mix(in srgb, var(--color-success), var(--text-primary) var(--accent-text-mix, 0%));
        background: rgba(var(--color-success-rgb), 0.06);
      }

      :host([variant="warning"]) .tag {
        border-color: rgba(var(--color-warning-rgb), 0.2);
        color: color-mix(in srgb, var(--color-warning), var(--text-primary) var(--accent-text-mix, 0%));
        background: rgba(var(--color-warning-rgb), 0.06);
      }

      :host([variant="error"]) .tag {
        border-color: rgba(var(--color-error-rgb), 0.2);
        color: color-mix(in srgb, var(--color-error), var(--text-primary) var(--accent-text-mix, 0%));
        background: rgba(var(--color-error-rgb), 0.06);
      }

      /* Absorbed from arc-badge, and copied from it verbatim including the flat
         color — the other five mix toward --text-primary, info does not, and
         a merge is the wrong moment to quietly restyle the thing being merged. */
      :host([variant="info"]) .tag {
        border-color: rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
        background: rgba(var(--color-info-rgb), 0.06);
      }

      /* One hover rule for every variant — see arc-badge. */
      .tag:hover { box-shadow: var(--glow-status); }

      /* Sizes */
      :host([size="sm"]) .tag { font-size: calc(var(--_text-xs) - 1px); padding: 2px var(--space-sm); letter-spacing: 1.5px; }
      :host([size="lg"]) .tag { font-size: var(--_text-sm); padding: var(--space-sm) var(--space-lg); }

      .tag__label {
        display: inline-flex;
        align-items: center;
      }

      .tag__remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: var(--touch-pad);
        margin: calc(var(--touch-pad) * -1);
        margin-inline-start: var(--space-xs);
        border-radius: var(--radius-full);
        opacity: 0.6;
        transition: opacity var(--transition-fast), background var(--transition-fast);
      }

      .tag__remove:hover {
        opacity: 1;
        background: var(--surface-overlay);
      }

      .tag__remove:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }
    `,
  ];

  constructor() {
    super();
    this.color = '';
  }

  _remove(e) {
    e.stopPropagation();
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('arc-remove', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * A custom color is the consumer's, and the theme will not repaint it to
   * make it legible — so say so when it isn't. The mix the palette applies is
   * solved for our own accents, and a grey passed for a category chip is
   * exactly the case it does not cover.
   */
  updated() {
    if (this.color) {
      warnLowContrast(this, this.renderRoot?.querySelector('.tag'), `color="${this.color}"`);
    }
  }

  render() {
    const colorStyle = this.color
      ? `border-color: rgba(${this.color}, 0.2); color: color-mix(in srgb, rgb(${this.color}), var(--text-primary) var(--accent-text-mix, 0%)); background: rgba(${this.color}, 0.06);`
      : '';

    return html`
      <span class="tag" part="base tag" style=${colorStyle}
        @mouseenter=${
          this.color
            ? (e) => {
                e.currentTarget.style.boxShadow = `0 0 12px rgba(${this.color}, 0.15)`;
              }
            : null
        }
        @mouseleave=${
          this.color
            ? (e) => {
                e.currentTarget.style.boxShadow = '';
              }
            : null
        }
      >
        <span class="tag__label" part="label"><slot></slot></span>
        ${
          this.removable
            ? html`
          <button
            class="tag__remove"
            @click=${this._remove}
            aria-label="Remove tag"
            tabindex=${this.disabled ? '-1' : '0'}
            part="remove"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        `
            : ''
        }
      </span>
    `;
  }
}
