import { LitElement, html, css } from 'lit';

/**
 * Individual radio option rendered inside a RadioGroup. Each Radio represents a single selectable
 * choice with its own label and value. Can be independently disabled while the rest of the group
 * remains interactive.
 *
 * @tag arc-radio
 * @prop {string} value - The value submitted when this option is selected. Must be unique within the parent RadioGroup.
 * @prop {boolean} disabled - When true, dims this individual option and removes it from keyboard navigation. The option cannot be selected by click or arrow keys.
 * @slot - Default content.
 */
export class ArcRadio extends LitElement {
  static properties = {
    value:    { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.value = '';
    this.disabled = false;
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
