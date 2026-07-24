import { LitElement, html, css } from 'lit';

/**
 * Autocomplete suggestion item inside a Search component.
 *
 * @tag arc-suggestion
 * @prop {string} value - Suggestion value
 * @slot - Default content.
 */
export class ArcSuggestion extends LitElement {
  static properties = {
    value: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.value = '';
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
