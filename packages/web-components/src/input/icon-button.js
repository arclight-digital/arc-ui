import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { buttonVariantStyles, iconBoxStyles } from '../button-styles.js';
import { isLoneSlottedAnchor } from '../shared/anchor-adoption.js';
import '../content/icon.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Compact button that renders an icon with optional text label, supporting ghost, secondary, and
 * primary variants.
 *
 * @tag arc-icon-button
 * @status stable
 * @requires arc-icon
 * @prop {string} name - Name of the arc-icon to render. When empty, the default slot is used for custom icon content.
 * @prop {string} text - Optional text label displayed next to the icon. When provided, the button expands from a square to a wider labeled button with uppercase styling.
 * @prop {'ghost' | 'secondary' | 'primary'} variant - Visual style variant. Ghost is transparent, secondary has a border with glow, primary has a solid accent-primary fill.
 * @prop {'xs' | 'sm' | 'md' | 'lg'} size - Button size controlling dimensions and icon scale. Icon-only sizes are circular: xs=28px, sm=32px, md=36px, lg=44px. The labeled form stays a rounded rectangle.
 * @prop {string} label - Accessible label for the button. Falls back to `text` if not provided. Required for icon-only usage.
 * @prop {string} href - When set, renders the button as an anchor tag for navigation links.
 * @prop {boolean} disabled - Disables the button, reducing opacity to 40% and blocking pointer events.
 * @prop {string} type - HTML button type attribute. Only applies when `href` is not set.
 * @slot - Default content. Slotting a single `<a>` as the only child adopts it as the button's control — the recommended form for links that must work before hydration or without JavaScript. Put the icon inside that anchor; `::part(button)` does not apply in this form.
 * @csspart base - The root element.
 * @csspart button
 */
export class ArcIconButton extends DeclaredPropsMixin(LitElement) {
  static properties = {
    name: { type: String, reflect: true },
    text: { type: String },
    variant: oneOf(['ghost', 'secondary', 'primary']),
    // Canon first, extension after (V4-PLAN 4.3). `xs` moved behind `lg` rather
    // than being dropped — arc-signature-pad renders an icon button at that
    // size, so it is load-bearing. The explicit `default` means the reorder
    // changes nothing at runtime; it is the declaration that now reads the way
    // every other size does.
    size: oneOf(['sm', 'md', 'lg', 'xs'], { default: 'md' }),
    label: { type: String },
    href: { type: String },
    disabled: flag(false),
    type: { type: String },
    _slottedAnchor: { state: true },
  };

  static styles = [
    tokenStyles,
    buttonVariantStyles,
    iconBoxStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; }

      /* Anchor-adoption form: a lone slotted <a> becomes the control and takes
         the same box styling as .btn — see shared/anchor-adoption.js. The
         adopted anchor is always treated as icon-only, since any text the
         consumer wants lives inside their own anchor. */
      .btn,
      .btn-slot::slotted(a) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs);
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition:
          background var(--transition-base),
          border-color var(--transition-base),
          box-shadow var(--transition-base),
          color var(--transition-base),
          transform 120ms var(--ease-out-expo);
        text-decoration: none;
        box-sizing: border-box;
        color: inherit;
      }

      /* With text */
      .btn--has-text {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        text-transform: uppercase;
        --_ls: 1.5px;
        letter-spacing: var(--_ls);
        white-space: nowrap;
      }

      .btn__text {
        line-height: var(--glyph-lh);
        /* letter-spacing also lands after the final letter, and that trailing
           space is inside the box being centered — so the word rendered half of
           it, 0.75px, to the left of centre. Pulled back off the end here, at
           the cause: the box then matches the ink and every size centres
           correctly, where compensating with padding would have meant patching
           each of the four size rules separately.
           arc-navigation-menu does the same correction with asymmetric padding
           instead, because its label is a bare text node with no element to
           hang a margin on. */
        margin-inline-end: calc(var(--_ls) * -1);
      }

      /* Sizes — icon-only: see iconBoxStyles in ../button-styles.js, shared with
         arc-theme-toggle so the two cannot drift apart in a top bar. */

      /* Sizes — with text */
      .btn--has-text { min-height: var(--touch-min); }
      :host([size="xs"]) .btn--has-text { padding: var(--space-xs) var(--space-sm); font-size: var(--_text-xs); }
      :host([size="sm"]) .btn--has-text { padding: calc(var(--space-xs) + 2px) calc(var(--space-sm) + 2px); font-size: var(--_text-xs); }
      :host(:not([size="lg"]):not([size="sm"]):not([size="xs"])) .btn--has-text,
      :host([size="md"]) .btn--has-text { padding: var(--space-xs) var(--space-sm); font-size: var(--_text-xs); }
      :host([size="lg"]) .btn--has-text { padding: var(--space-sm) var(--space-md); font-size: var(--_text-xs); }

      /* Default → ghost */
      :host(:not([variant="primary"]):not([variant="secondary"])) .btn,
      :host(:not([variant="primary"]):not([variant="secondary"])) .btn-slot::slotted(a) {
        background: transparent;
        color: var(--text-muted);
        border-color: transparent;
      }
      :host(:not([variant="primary"]):not([variant="secondary"])) .btn:hover,
      :host(:not([variant="primary"]):not([variant="secondary"])) .btn-slot::slotted(a:hover) {
        color: var(--text-primary);
        background: var(--surface-hover);
      }

      /* :active scale */
      :host(:not([variant="primary"]):not([variant="secondary"])) .btn:active,
      :host(:not([variant="primary"]):not([variant="secondary"])) .btn-slot::slotted(a:active),
      :host([variant="ghost"]) .btn:active,
      :host([variant="ghost"]) .btn-slot::slotted(a:active) {
        transform: scale(0.93);
        background: var(--surface-overlay);
      }
      :host([variant="secondary"]) .btn:active,
      :host([variant="secondary"]) .btn-slot::slotted(a:active) {
        transform: scale(0.93);
        background: rgba(var(--interactive-rgb), 0.05);
      }
      :host([variant="primary"]) .btn:active,
      :host([variant="primary"]) .btn-slot::slotted(a:active) {
        transform: scale(0.93);
        box-shadow: 0 0 8px rgba(var(--interactive-rgb), 0.5);
      }

      /* IconButton secondary uses text-secondary instead of text-primary */
      :host([variant="secondary"]) .btn,
      :host([variant="secondary"]) .btn-slot::slotted(a) {
        color: var(--text-secondary);
      }

      /* IconButton secondary hover uses smaller glow */
      :host([variant="secondary"]) .btn:hover,
      :host([variant="secondary"]) .btn-slot::slotted(a:hover) {
        box-shadow: 0 0 16px var(--accent-primary-ring);
      }
    `,
  ];

  constructor() {
    super();
    this.name = '';
    this.text = '';
    this.label = '';
    this.href = '';
    this.type = 'button';
    this._slottedAnchor = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // aria-label is prohibited on a role-less custom element — adopt it as the
    // internal button's label (explicit `label` wins) and remove it from the host.
    const hostLabel = this.getAttribute('aria-label');
    if (hostLabel) {
      if (!this.label) this.label = hostLabel;
      this.removeAttribute('aria-label');
    }
  }

  /** Map icon-button size to arc-icon size */
  get _iconSize() {
    const map = { xs: 'xs', sm: 'sm', md: 'sm', lg: 'md' };
    return map[this.size] || 'sm';
  }

  _onDefaultSlotChange(e) {
    this._slottedAnchor = isLoneSlottedAnchor(e.target);
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const hasText = !!this.text;
    const icon = this.name
      ? html`<arc-icon name=${this.name} size=${this._iconSize}></arc-icon>`
      : html`<slot @slotchange=${this._onDefaultSlotChange}></slot>`;
    const textEl = hasText ? html`<span class="btn__text">${this.text}</span>` : null;
    const classes = `btn${hasText ? ' btn--has-text' : ''}`;

    // An explicit href wins; adoption only applies when the icon comes from the
    // slot, since a `name`-supplied icon leaves no slot to author an anchor in.
    if (!this.href && this._slottedAnchor) {
      return html`<slot class="btn-slot" @slotchange=${this._onDefaultSlotChange}></slot>`;
    }

    if (this.href) {
      // Same as arc-button: an anchor has no `disabled` attribute, so a disabled
      // link icon-button stayed focusable and followable. Dropping `href` is how
      // the platform removes a link from the tab order (finding #61).
      const off = this.disabled;
      return html`<a class=${classes} href=${off ? nothing : this.href} role=${off ? 'link' : nothing} aria-disabled=${off ? 'true' : nothing} aria-label=${this.label || nothing} part="base button">${icon}${textEl}</a>`;
    }
    return html`
      <button
        class=${classes}
        type=${this.type}
        ?disabled=${this.disabled}
        aria-label=${this.label || nothing}
        part="base button"
      >${icon}${textEl}</button>
    `;
  }
}
