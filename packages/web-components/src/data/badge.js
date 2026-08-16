import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Compact pill-shaped label for status indicators, category tags, and notification counts. Three
 * color variants let you encode meaning at a glance across dashboards, tables, and card layouts.
 *
 * @tag arc-badge
 * @status stable
 *
 * NOT merged into arc-tag in 4.2, against V4-SCOPE §3 row 3. That row reads
 * "arc-tag is the superset (it has removable) ... no new prop needed", which is
 * true of the props and false of the styles: arc-badge is `--font-mono`, normal
 * letter-spacing, sentence case, `--space-xs`/`--space-sm` padding; arc-tag is
 * `--font-label`, 2px tracking, UPPERCASE, and `min-height: var(--touch-min)`.
 * Merging as written would silently re-set every badge on every page in an
 * uppercase label face — `v3.2.0` becomes `V3.2.0` in a taller box — which is
 * the "quietly delete a visual capability" failure §3.2 rules out by name for
 * arc-callout's accent bar.
 *
 * The fix is a typography decision (does ARC have one chip face or two?), and
 * V4-PLAN 4.5 owns typography by name: one type scale as font-role tokens, no
 * component styling text outside a role. Deciding it here would be inventing
 * design API in a merge commit and then re-deciding it three workstreams later.
 * The `info` variant arc-tag gained in 4.2 stands on its own — every other
 * status set in the library has one — and the merge is unblocked either way.
 * @prop {'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'} variant - Controls the badge color scheme. Default renders a neutral gray. Primary and secondary use the accent token colors. Success, warning, error, and info map to the corresponding semantic color tokens for status-oriented labels.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the badge size. Options: 'sm', 'md', 'lg'.
 * @prop {string} color - Custom RGB color value (e.g. `"255, 100, 50"`) that overrides the variant color. Sets the border, text, background tint, and hover glow to the specified color.
 * @slot - Default content.
 * @csspart base - The root element.
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
        font-weight: var(--font-body-weight, 500);
        font-size: var(--_text-xs);
        letter-spacing: normal;
        text-transform: none;
        color: var(--text-muted);
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-full);
        background: var(--surface-hover);
        transition: box-shadow var(--transition-base), border-color var(--transition-base);
        line-height: var(--ui-lh);
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

    return html`<span class="badge" part="base badge" style=${colorStyle}
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
