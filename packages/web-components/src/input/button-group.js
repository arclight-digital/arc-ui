import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Connects multiple buttons into a single visual unit with shared borders and collapsed radii.
 * Supports horizontal and vertical orientations.
 *
 * @tag arc-button-group
 * @status stable
 * @prop {'horizontal' | 'vertical'} orientation - Layout direction. Vertical stacks buttons top-to-bottom.
 * @prop {'sm' | 'md' | 'lg'} size - Size cascaded to all child buttons.
 * @prop {string} variant - Button variant cascaded to all children (e.g., "ghost", "outline").
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart group
 */
export class ArcButtonGroup extends DeclaredPropsMixin(LitElement) {
  static properties = {
    orientation: oneOf(['horizontal', 'vertical']),
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),
    variant: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-flex;
        /* Follows the button shape rather than restating it: buttons are
           pills, so the outer corners of a group of them are pill ends. In
           CSS, where the server's paint has it too; it was written from
           connectedCallback, which only the client runs. */
        --_group-radius: var(--radius-full);
      }

      .button-group {
        display: inline-flex;
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      :host([orientation="vertical"]) .button-group {
        flex-direction: column;
      }

      /* Remove inner radii: connected borders */
      ::slotted(*) {
        --radius-md: 0;
        --radius-sm: 0;
        --radius-lg: 0;
        border-radius: 0 !important;
      }

      /* Horizontal: first/last get outer radii */
      :host(:not([orientation="vertical"])) ::slotted(:first-child) {
        border-radius: var(--_group-radius) 0 0 var(--_group-radius) !important;
      }

      :host(:not([orientation="vertical"])) ::slotted(:last-child) {
        border-radius: 0 var(--_group-radius) var(--_group-radius) 0 !important;
      }

      :host(:not([orientation="vertical"])) ::slotted(:only-child) {
        border-radius: var(--_group-radius) !important;
      }

      /* Vertical: first/last get outer radii */
      :host([orientation="vertical"]) ::slotted(:first-child) {
        border-radius: var(--_group-radius) var(--_group-radius) 0 0 !important;
      }

      :host([orientation="vertical"]) ::slotted(:last-child) {
        border-radius: 0 0 var(--_group-radius) var(--_group-radius) !important;
      }

      :host([orientation="vertical"]) ::slotted(:only-child) {
        border-radius: var(--_group-radius) !important;
      }

      /* Collapse borders between items */
      :host(:not([orientation="vertical"])) ::slotted(:not(:first-child)) {
        margin-inline-start: -1px;
      }

      :host([orientation="vertical"]) ::slotted(:not(:first-child)) {
        margin-top: -1px;
      }
    `,
  ];

  /** @internal Slots read on the server and before hydration; see ssr.js. */
  static slotReaders = { '': '_onSlotChange' };

  constructor() {
    super();
    this.variant = '';
  }

  _onSlotChange(e) {
    const children = e.target.assignedElements({ flatten: true });
    for (const child of children) {
      if (this.size) child.setAttribute('size', this.size);
      if (this.variant) child.setAttribute('variant', this.variant);
    }
  }

  updated(changed) {
    if (changed.has('size') || changed.has('variant')) {
      const children = Array.from(this.children);
      for (const child of children) {
        if (this.size) child.setAttribute('size', this.size);
        if (this.variant) child.setAttribute('variant', this.variant);
      }
    }
  }

  /** The slotchange DSD swallows; see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    return html`
      <div class="button-group" role="group" part="base group">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
