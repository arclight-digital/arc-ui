import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { buttonVariantStyles } from '../button-styles.js';
import { isLoneSlottedAnchor } from '../shared/anchor-adoption.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Primary call-to-action element with three visual variants that map to action hierarchy. Supports
 * prefix and suffix slots for icons. Renders as an anchor when given an href, making it ideal for
 * navigation-driven actions across landing pages, toolbars, and forms.
 *
 * @tag arc-button
 * @prop {'primary' | 'secondary' | 'ghost'} variant - Controls the visual weight and emphasis. Primary is a filled button with a neon glow hover suited for the top-level CTA. Secondary uses a bordered outline for supporting actions. Ghost renders with no border or background, ideal for low-priority or tertiary actions.
 * @prop {'sm' | 'md' | 'lg'} size - Sets the button size. Large (lg) is intended for hero sections and high-impact areas. Medium (md) is the default for general UI. Small (sm) fits compact toolbars, table rows, and inline contexts.
 * @prop {string} href - When provided, the button renders as an <a> element instead of a <button>, making it a navigational link. This is the recommended approach for any action that takes the user to a new page or section.
 * @prop {boolean} disabled - When true, dims the button and prevents all pointer and keyboard interaction. Applies reduced opacity and removes hover/focus effects. Consider pairing with a tooltip that explains why the action is unavailable.
 * @prop {boolean} loading - Shows a spinner and disables the button. Use for async operations like form submission or API calls.
 * @prop {'button' | 'submit' | 'reset'} type - Sets the HTML button type attribute. Use `submit` inside forms to trigger native form submission, or `reset` to clear form fields. Only applies when no `href` is set (link buttons ignore this).
 * @slot prefix
 * @slot - Default content. Slotting a single `<a>` as the only child adopts it as the button's control — the recommended form for links that must work before hydration or without JavaScript, since the anchor is real HTML in the initial markup. Put any icons inside that anchor; the `prefix`/`suffix` slots and `::part(button)` do not apply in this form.
 * @slot suffix
 * @csspart button
 */
export class ArcButton extends DeclaredPropsMixin(LitElement) {
  static properties = {
    variant: oneOf(['primary', 'secondary', 'ghost']),
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),
    href: { type: String },
    disabled: flag(false),
    loading: flag(false),
    type: oneOf(['button', 'submit', 'reset'], { reflect: false }),
    _hasPrefix: { state: true },
    _hasSuffix: { state: true },
    _slottedAnchor: { state: true },
  };

  static styles = [
    tokenStyles,
    buttonVariantStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]),
      :host([loading]) { pointer-events: none; }

      :host([loading]) .btn { opacity: 0.7; }

      /* Anchor-adoption form: the slotted <a> *is* the control, so it takes the
         same box styling as .btn. The slot itself is display:contents (UA
         default), so the anchor becomes the host's flex item directly. Rules
         below pair .btn with .btn-slot::slotted(a) rather than duplicating
         declarations — keep the two in step when editing either. */

      .btn__spinner {
        display: none;
        width: 14px;
        height: 14px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: var(--radius-full);
        animation: arc-btn-spin 600ms linear infinite;
      }

      :host([loading]) .btn__spinner { display: inline-block; }
      :host([loading]) .btn__label { opacity: 0.6; }

      @keyframes arc-btn-spin {
        to { transform: rotate(360deg); }
      }

      .btn,
      .btn-slot::slotted(a) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        text-transform: uppercase;
        letter-spacing: 2px;
        border: 1px solid transparent;
        /* Pill. Circles are the house shape — the library is called ARC — and
           the round icon-only controls, the tags, the badges and the toggles
           already read that way; a rounded rectangle here was the odd one out
           on a row that contains all of them. Breaking, and deliberately so:
           there is no opt-out prop, because one shape being the shape is the
           point. Groups follow via --_group-radius in button-group.js. */
        border-radius: var(--radius-full);
        cursor: pointer;
        transition:
          background var(--transition-base),
          border-color var(--transition-base),
          box-shadow var(--transition-base),
          color var(--transition-base),
          transform 120ms var(--ease-out-expo);
        text-decoration: none;
        white-space: nowrap;
        box-sizing: border-box;
        min-height: var(--touch-min);
      }

      /* Sizes */
      :host([size="sm"]) .btn,
      :host([size="sm"]) .btn-slot::slotted(a) { font-size: var(--_text-xs); padding: var(--space-xs) var(--space-md); }
      :host(:not([size="lg"]):not([size="sm"])) .btn,
      :host(:not([size="lg"]):not([size="sm"])) .btn-slot::slotted(a),
      :host([size="md"]) .btn,
      :host([size="md"]) .btn-slot::slotted(a) { font-size: var(--_text-xs); padding: var(--space-sm) var(--space-lg); }
      :host([size="lg"]) .btn,
      :host([size="lg"]) .btn-slot::slotted(a) { font-size: var(--_text-xs); padding: var(--space-md) var(--space-xl); letter-spacing: 3px; }

      /* Default → primary */
      :host(:not([variant="ghost"]):not([variant="secondary"])) .btn,
      :host(:not([variant="ghost"]):not([variant="secondary"])) .btn-slot::slotted(a) {
        background: var(--interactive);
        color: var(--on-accent);
        border-color: var(--interactive);
      }
      :host(:not([variant="ghost"]):not([variant="secondary"])) .btn:hover,
      :host(:not([variant="ghost"]):not([variant="secondary"])) .btn-slot::slotted(a:hover) { box-shadow: var(--interactive-active); }

      /* :active scale */
      :host(:not([variant="ghost"]):not([variant="secondary"])) .btn:active,
      :host(:not([variant="ghost"]):not([variant="secondary"])) .btn-slot::slotted(a:active),
      :host([variant="primary"]) .btn:active,
      :host([variant="primary"]) .btn-slot::slotted(a:active) { transform: scale(0.97); box-shadow: 0 0 8px rgba(var(--interactive-rgb),0.5); }
      :host([variant="secondary"]) .btn:active,
      :host([variant="secondary"]) .btn-slot::slotted(a:active) {
        transform: scale(0.97);
        background: rgba(var(--interactive-rgb),0.05);
      }
      :host([variant="ghost"]) .btn:active,
      :host([variant="ghost"]) .btn-slot::slotted(a:active) {
        transform: scale(0.97);
        background: var(--surface-overlay);
      }

      /* Prefix / Suffix */
      .btn__prefix,
      .btn__suffix {
        display: inline-flex;
        align-items: center;
      }

      .btn__prefix--empty,
      .btn__suffix--empty { display: none; }

      ::slotted([slot="prefix"]),
      ::slotted([slot="suffix"]) {
        display: flex;
      }
    `,
  ];

  constructor() {
    super();
    this.href = '';
    this._hasPrefix = false;
    this._hasSuffix = false;
    this._slottedAnchor = false;
  }

  /**
   * The inner <button> lives in this component's shadow root, so it is never
   * form-associated with an ancestor form — clicking type="submit" would
   * silently do nothing. Bridge the gap by finding the nearest arc-form or
   * native <form> and submitting/resetting it explicitly.
   */
  _handleClick() {
    if (this.type !== 'submit' && this.type !== 'reset') return;
    const form = this.closest('arc-form, form');
    if (!form) return;
    if (form.tagName === 'FORM') {
      if (this.type === 'submit') form.requestSubmit();
      else form.reset();
    } else {
      if (this.type === 'submit') form.submit();
      else form.reset();
    }
  }

  _onPrefixSlotChange(e) {
    this._hasPrefix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onSuffixSlotChange(e) {
    this._hasSuffix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  /**
   * Detect the anchor-adoption form: a single `<a>` as the only slotted element.
   *
   * Authoring `<arc-button><a href="/x">Go</a></arc-button>` puts a real link in
   * the initial HTML, so it works with JS disabled and before the element
   * upgrades. On upgrade we let that anchor *be* the control rather than
   * rendering a second one — nesting `<a>` inside `<a>` is invalid and would
   * produce nested links in the accessibility tree.
   *
   * Requiring the anchor to be the sole element keeps incidental inline links
   * (`<arc-button>Read <a href="/x">this</a></arc-button>`) on the normal path.
   */
  _onDefaultSlotChange(e) {
    this._slottedAnchor = isLoneSlottedAnchor(e.target);
  }

  _renderContent() {
    return html`
      ${this.loading ? html`<span class="btn__spinner" aria-hidden="true"></span>` : ''}
      <span class="btn__prefix ${this._hasPrefix ? '' : 'btn__prefix--empty'}">
        <slot name="prefix" @slotchange=${this._onPrefixSlotChange}></slot>
      </span>
      <span class="btn__label"><slot @slotchange=${this._onDefaultSlotChange}></slot></span>
      <span class="btn__suffix ${this._hasSuffix ? '' : 'btn__suffix--empty'}">
        <slot name="suffix" @slotchange=${this._onSuffixSlotChange}></slot>
      </span>
    `;
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    // An explicit href always wins — it is the established API and stays
    // byte-identical, so nothing that already works changes behavior.
    if (this.href) {
      // `<a>` has no `disabled` attribute and CSS pointer-events does not reach
      // the keyboard, so a disabled link button used to stay focusable and
      // followable (finding #61; test-audit.md §5, bug 2). Dropping `href` is
      // how the platform removes a link from the tab order; aria-disabled keeps
      // it announced, and role="link" keeps it a link once href is gone.
      const off = this.disabled || this.loading;
      return html`<a class="btn" href=${off ? nothing : this.href} role=${off ? 'link' : nothing} aria-disabled=${off ? 'true' : nothing} part="button">${this._renderContent()}</a>`;
    }
    if (this._slottedAnchor) {
      return html`<slot class="btn-slot" @slotchange=${this._onDefaultSlotChange}></slot>`;
    }
    return html`<button class="btn" type=${this.type} ?disabled=${this.disabled || this.loading} aria-busy=${this.loading ? 'true' : 'false'} @click=${this._handleClick} part="button">${this._renderContent()}</button>`;
  }
}
