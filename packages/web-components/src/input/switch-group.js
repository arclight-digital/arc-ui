import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-switch-group
 */
export class ArcSwitchGroup extends LitElement {
  static properties = {
    label:       { type: String },
    orientation: { type: String, reflect: true },
    size:        { type: String, reflect: true },
    disabled:    { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      :host([disabled]) {
        opacity: 0.4;
        pointer-events: none;
      }

      fieldset {
        border: none;
        padding: 0;
        margin: 0;
        min-width: 0;
      }

      legend {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-secondary);
        padding: 0;
        margin-bottom: var(--space-sm);
      }

      .switch-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      :host([orientation="horizontal"]) .switch-group {
        flex-direction: row;
        flex-wrap: wrap;
        gap: var(--space-lg);
      }
    `,
  ];

  constructor() {
    super();
    this.label = '';
    this.orientation = 'vertical';
    this.size = 'md';
    this.disabled = false;
  }

  _onSlotChange(e) {
    const children = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-TOGGLE');

    for (const toggle of children) {
      if (this.size) toggle.setAttribute('size', this.size);
      if (this.disabled) toggle.setAttribute('disabled', '');
    }
  }

  updated(changed) {
    if (changed.has('size') || changed.has('disabled')) {
      const toggles = this.querySelectorAll('arc-toggle');
      for (const toggle of toggles) {
        if (this.size) toggle.setAttribute('size', this.size);
        if (this.disabled) toggle.setAttribute('disabled', '');
        else toggle.removeAttribute('disabled');
      }
    }
  }

  render() {
    return html`
      <fieldset ?disabled=${this.disabled} part="fieldset">
        ${this.label ? html`<legend part="legend">${this.label}</legend>` : ''}
        <div class="switch-group" role="group" aria-label=${this.label || 'Switch group'} part="group">
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
      </fieldset>
    `;
  }
}
