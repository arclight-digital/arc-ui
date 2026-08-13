import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Individual option element slotted into the segmented control. The `value` attribute identifies
 * the option and the text content becomes the label.
 *
 * Also used inside Select and MultiSelect, where each option provides a value for form submission
 * and its text content becomes the label shown in the dropdown.
 *
 * @tag arc-option
 * @prop {string} value - The value identifier for this option, used to match against the parent control value.
 * @prop {boolean} disabled - When true, dims this option and prevents it from being selected.
 * @slot - Default content.
 */
export class ArcOption extends DeclaredPropsMixin(LitElement) {
  static properties = {
    value: { type: String, reflect: true },
    disabled: flag(false),
    selected: flag(false),
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.value = '';
  }

  /** Expose text content as label */
  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
