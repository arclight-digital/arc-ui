import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Compact pill-shaped label for status indicators, category tags, and notification counts. Three
 * color variants let you encode meaning at a glance across dashboards, tables, and card layouts.
 *
 * @tag arc-badge
 * @prop {'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'} variant - Controls the badge color scheme. Default renders a neutral gray. Primary and secondary use the accent token colors. Success, warning, error, and info map to the corresponding semantic color tokens for status-oriented labels.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the badge size. Options: 'sm', 'md', 'lg'.
 * @prop {string} color - Custom RGB color value (e.g. `"255, 100, 50"`) that overrides the variant color. Sets the border, text, background tint, and hover glow to the specified color.
 * @slot - Default content.
 * @csspart badge
 */
export class ArcBadge extends DeclaredPropsMixin(LitElement) {
  static properties = {
    variant: oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info']),
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),
    color: { type: String },
  };

  static styles = [
    tokenStyles,
    statusVars,
    css`
      :host { display: inline-flex; }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-mono);
        font-weight: 500;
        font-size: var(--_text-xs);
        letter-spacing: normal;
        text-transform: none;
        color: var(--text-muted);
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-full);
        background: var(--surface-hover);
        transition: box-shadow var(--transition-base), border-color var(--transition-base);
        line-height: 1.4;
      }

      :host([variant="primary"]) .badge {
        border-color: var(--accent-primary-border);
        color: color-mix(in srgb, var(--accent-primary), var(--text-primary) var(--accent-text-mix, 0%));
        background: rgba(var(--accent-primary-rgb), 0.06);
      }

      :host([variant="secondary"]) .badge {
        border-color: var(--accent-secondary-border);
        color: color-mix(in srgb, var(--accent-secondary), var(--text-primary) var(--accent-text-mix, 0%));
        background: rgba(var(--accent-secondary-rgb), 0.06);
      }

      :host([variant="success"]) .badge {
        border-color: rgba(var(--color-success-rgb), 0.2);
        color: color-mix(in srgb, var(--color-success), var(--text-primary) var(--accent-text-mix, 0%));
        background: rgba(var(--color-success-rgb), 0.06);
      }

      :host([variant="warning"]) .badge {
        border-color: rgba(var(--color-warning-rgb), 0.2);
        color: color-mix(in srgb, var(--color-warning), var(--text-primary) var(--accent-text-mix, 0%));
        background: rgba(var(--color-warning-rgb), 0.06);
      }

      :host([variant="error"]) .badge {
        border-color: rgba(var(--color-error-rgb), 0.2);
        color: color-mix(in srgb, var(--color-error), var(--text-primary) var(--accent-text-mix, 0%));
        background: rgba(var(--color-error-rgb), 0.06);
      }

      :host([variant="info"]) .badge {
        border-color: rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
        background: rgba(var(--color-info-rgb), 0.06);
      }

      /* One hover rule for every variant: --glow-status takes its color from
         the --_status-rgb that statusVars sets on the host. This was six rules
         saying the same thing in six colors. The border is deliberately left
         alone — hover adds light, it does not move the edge. */
      :host(:hover) .badge { box-shadow: var(--glow-status); }

      /* Sizes */
      :host([size="sm"]) .badge { font-size: calc(var(--_text-xs) - 1px); padding: 2px var(--space-xs); }
      :host([size="lg"]) .badge { font-size: var(--_text-sm); padding: var(--space-sm) var(--space-md); }
    `,
  ];

  constructor() {
    super();
    this.color = '';
  }

  render() {
    const colorStyle = this.color
      ? `border-color: rgba(${this.color}, 0.2); color: color-mix(in srgb, rgb(${this.color}), var(--text-primary) var(--accent-text-mix, 0%)); background: rgba(${this.color}, 0.06);`
      : '';

    return html`<span class="badge" part="badge" style=${colorStyle}
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
    ><slot></slot></span>`;
  }
}
