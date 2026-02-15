import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-button-group
 */
export class ArcButtonGroup extends LitElement {
  static properties = {
    orientation: { type: String, reflect: true },
    size:        { type: String, reflect: true },
    variant:     { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-flex;
      }

      .button-group {
        display: inline-flex;
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      :host([orientation="vertical"]) .button-group {
        flex-direction: column;
      }

      /* Remove inner radii — connected borders */
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
        margin-left: -1px;
      }

      :host([orientation="vertical"]) ::slotted(:not(:first-child)) {
        margin-top: -1px;
      }
    `,
  ];

  constructor() {
    super();
    this.orientation = 'horizontal';
    this.size = 'md';
    this.variant = '';
    this.style.setProperty('--_group-radius', '10px');
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

  render() {
    return html`
      <div class="button-group" role="group" part="group">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
