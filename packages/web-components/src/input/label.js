import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Form label with required indicator, optional description text, and tooltip slot. Pairs with any
 * input component via the `for` attribute.
 *
 * @tag arc-label
 * @status stable
 * @prop {string} for - ID of the target input element. Clicking the label focuses the associated control.
 * @prop {boolean} required - Shows a red asterisk (*) after the label text.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the label font size.
 * @prop {boolean} disabled - Reduces opacity and blocks pointer events.
 * @slot - Default content.
 * @slot tooltip
 * @slot description
 * @csspart base - The root element.
 * @csspart label
 * @csspart description
 */
export class ArcLabel extends DeclaredPropsMixin(LitElement) {
  static properties = {
    for: { type: String, reflect: true },
    required: flag(false),
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),
    disabled: flag(false),
    _hasDescription: { state: true },
    _hasTooltip: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      :host([disabled]) {
        opacity: 0.5;
        pointer-events: none;
      }

      .label {
        display: flex;
        align-items: baseline;
        gap: var(--space-xs);
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        text-transform: uppercase;
        letter-spacing: var(--label-spacing);
        color: var(--text-secondary);
        cursor: pointer;
        line-height: var(--ui-lh);
        margin-bottom: var(--space-xs);
      }

      :host([size="sm"]) .label { font-size: var(--label-inline-size); }
      :host([size="lg"]) .label { font-size: var(--_text-sm); }

      .label__required {
        color: var(--status-error, #ef4444);
        font-weight: 700;
      }

      .label__tooltip {
        display: inline-flex;
        align-items: center;
        margin-inline-start: var(--space-xs);
      }

      .label__tooltip--empty { display: none; }

      .description {
        font-family: var(--font-body);
        font-size: var(--_text-xs);
        color: var(--text-muted);
        line-height: var(--ui-lh);
        margin-bottom: var(--space-xs);
      }

      .description--empty { display: none; }
    `,
  ];

  constructor() {
    super();
    this.for = '';
    this._hasDescription = false;
    this._hasTooltip = false;
  }

  _onDescriptionSlotChange(e) {
    this._hasDescription = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onTooltipSlotChange(e) {
    this._hasTooltip = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onClick() {
    if (!this.for) return;
    // getElementById, not `querySelector('#' + for)` — finding #77. HTML ids may
    // be almost anything (`2fa-code`, `user.email`, `field:1` are all legal and
    // all routine in generated forms) while a CSS id selector may not begin
    // with a digit or carry an unescaped `.` or `:`. querySelector threw
    // SyntaxError, the exception escaped this handler, and the document-level
    // fallback on the same line — which would have worked — never ran.
    //
    // A shadow root and a document both implement getElementById; a *fragment*
    // that is neither does not, hence the guard rather than a bare call.
    const root = this.getRootNode();
    const local = typeof root.getElementById === 'function' ? root.getElementById(this.for) : null;
    const target = local || document.getElementById(this.for);
    target?.focus?.();
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    return html`
      <label class="label" for=${this.for || ''} @click=${this._onClick} part="base label">
        <slot></slot>
        ${this.required ? html`<span class="label__required" aria-hidden="true">*</span>` : ''}
        <span class="label__tooltip ${this._hasTooltip ? '' : 'label__tooltip--empty'}">
          <slot name="tooltip" @slotchange=${this._onTooltipSlotChange}></slot>
        </span>
      </label>
      <div class="description ${this._hasDescription ? '' : 'description--empty'}" part="description">
        <slot name="description" @slotchange=${this._onDescriptionSlotChange}></slot>
      </div>
    `;
  }
}
