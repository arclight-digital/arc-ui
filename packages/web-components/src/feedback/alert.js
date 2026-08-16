import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { getStatusIcon } from '../status-utils.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Contextual alert banner with four semantic variants and optional dismiss button for delivering
 * timely, prominent feedback to users.
 *
 * @tag arc-alert
 * @status stable
 * @requires arc-icon-button
 * @prop {'info' | 'tip' | 'success' | 'warning' | 'error'} variant - Controls the semantic color palette, the icon, and — through the `ROLES` table — the ARIA role and whether the alert is announced. Use "info" for neutral guidance, "tip" for advice, "success" for confirmations, "warning" for caution states, and "error" for failures or blocking issues.
 * @prop {'auto' | 'off' | 'polite' | 'assertive'} live - Announcement behaviour. `auto` (the default) derives it from `variant`: error and warning are assertive, success is polite, info and tip are not announced at all. Set it explicitly when severity and urgency disagree — an `info` alert injected after a background save wants `polite`; a `warning` rendered in the initial page probably wants `off`.
 * @prop {boolean} dismissible - When true, renders a close button in the top-right corner. Clicking it removes the alert from the DOM and fires an "arc-close" event that parent components can listen to.
 * @prop {string} heading - Optional bold heading rendered above the body slot. Use it for a scannable one-line summary so users can quickly gauge the alert's importance before reading the full message.
 * @prop {'default' | 'compact'} density - Visual density. 'compact' reduces padding and font sizes for inline or space-constrained usage.
 * @fires {CustomEvent<void>} arc-close - Fired when a dismissible alert is closed
 * @slot icon - Replaces the built-in status glyph. Absorbed from arc-callout, whose icon was slottable.
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart alert
 * @csspart icon
 * @csspart heading
 * @csspart content
 * @csspart dismiss
 */
export class ArcAlert extends DeclaredPropsMixin(LitElement) {
  /**
   * Severity → ARIA role. V4-SCOPE §3.2, ratified 2026-08-13.
   *
   * `arc-alert` already implemented role-follows-severity, so most of this is a
   * ratification of what the component did. The exception is `info`, and it is
   * the reason the row needed a decision at all: `info` used to map to
   * `role="status"`, which *is* a polite live region. `arc-callout`'s default
   * variant is `info` and it was a static `role="note"` box — so a naive merge
   * would have upgraded every informational callout on every page into an
   * announcement, landing the regression on the single most common variant.
   *
   * **So `info` is `note` now, and that is a behaviour change for existing
   * `arc-alert` users too**, not only for callout's. The reasoning: `info` is
   * the variant most likely to be static page furniture, and an alert that
   * genuinely needs announcing has two ways to say so — pick a severity that
   * carries one, or set `live`.
   */
  static ROLES = {
    error: 'alert',
    warning: 'alert',
    success: 'status',
    info: 'note',
    tip: 'note',
  };

  static properties = {
    variant: oneOf(['info', 'tip', 'success', 'warning', 'error']),
    /**
     * The escape hatch, and it exists because the heuristic above answers the
     * wrong question. Severity answers "how bad is this"; a live region asks
     * "did this just appear", and no prop can infer that from the markup.
     */
    live: oneOf(['auto', 'off', 'polite', 'assertive']),
    density: oneOf(['default', 'compact']),
    dismissible: flag(false),
    heading: { type: String },
  };

  static styles = [
    tokenStyles,
    statusVars,
    css`
      /* Lobe inputs on :host: a custom property substitutes its own var()s at
         the element that declares the property, and the shape is declared on
         :host — see shared/tokens.js. */
      :host {
        display: block;
        --lobe-rgb: var(--_status-rgb);
      }

      .alert {
        position: relative;
        display: flex;
        gap: var(--space-md);
        padding: var(--space-lg);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
        background: var(--surface-raised);
        overflow: hidden;
      }

      /* Top gradient rule */
      .alert::before {
        content: '';
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        height: 2px;
        background: var(--lobe-line);
        box-shadow: var(--glow-status);
      }

      .alert__icon-wrap {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        font-size: var(--_text-md);
        transition: box-shadow var(--transition-base);
        background: rgba(var(--_status-rgb), 0.08);
        border: 1px solid rgba(var(--_status-rgb), 0.15);
        color: var(--_status-color);
        box-shadow: 0 0 16px rgba(var(--_status-rgb), 0.1);
      }

      .alert__body { flex: 1; min-width: 0; }

      .alert__heading {
        font-family: var(--font-body);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-md);
        color: var(--text-primary);
        margin: 0 0 var(--space-xs);
      }

      .alert__content {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        line-height: var(--body-lh);
        color: var(--text-secondary);
      }

      /* Compact variant */
      :host([density="compact"]) .alert { padding: var(--space-sm) var(--space-md); gap: var(--space-sm); }
      :host([density="compact"]) .alert__icon-wrap { width: 24px; height: 24px; font-size: var(--_text-sm); }
      :host([density="compact"]) .alert__heading { font-size: var(--_text-sm); margin-bottom: 2px; }
      :host([density="compact"]) .alert__content { font-size: var(--_text-xs); }
    `,
  ];

  constructor() {
    super();
    this.heading = '';
  }

  _dismiss() {
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', { bubbles: true, composed: true, cancelable: true }),
      )
    )
      return;
    this.style.display = 'none';
  }

  /**
   * `aria-live`, or undefined to leave the role's implicit behaviour alone.
   *
   * Emitted only when `live` is not `auto`. In auto mode the role already
   * carries the right implicit politeness — `alert` is assertive, `status` is
   * polite, `note` is neither — and writing it out again would be a second
   * declaration of the same thing that could drift from the first.
   *
   * An explicit value overrides the implicit one in both directions, which is
   * what makes `live="off"` on an `error` work: the role stays `alert`, so the
   * semantics of "this is an error" survive, and only the announcement stops.
   */
  get _ariaLive() {
    return this.live === 'auto' ? undefined : this.live;
  }

  render() {
    return html`
      <div
        class="alert"
        role=${ArcAlert.ROLES[this.variant] ?? 'note'}
        aria-live=${ifDefined(this._ariaLive)}
        part="base alert"
      >
        <div class="alert__icon-wrap" aria-hidden="true" part="icon">
          <slot name="icon">${getStatusIcon(this.variant)}</slot>
        </div>
        <div class="alert__body">
          ${this.heading ? html`<p class="alert__heading" part="heading">${this.heading}</p>` : ''}
          <div class="alert__content" part="content"><slot></slot></div>
        </div>
        ${
          this.dismissible
            ? html`
          <arc-icon-button name="x" label="Dismiss" variant="ghost" size="sm" @click=${this._dismiss} part="dismiss"></arc-icon-button>
        `
            : ''
        }
      </div>
    `;
  }
}
