import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, flag } from '../shared/props.js';
import { notifyOwner } from '../shared/hydrate-slots.js';

/**
 * Individual radio option rendered inside a RadioGroup. Each Radio represents a single selectable
 * choice with its own label and value. Can be independently disabled while the rest of the group
 * remains interactive.
 *
 * @tag arc-radio
 * @status stable
 * @prop {string} value - The value submitted when this option is selected. Must be unique within the parent RadioGroup.
 * @prop {boolean} disabled - When true, the option is dimmed and announced as disabled, the arrow keys skip it, it is never the group's Tab stop, and a click or Space does not select it. Setting it does not clear a group `value` that already names this option.
 * @slot - Default content.
 */
export class ArcRadio extends DeclaredPropsMixin(LitElement) {
  static properties = {
    value: { type: String, reflect: true },
    disabled: flag(false),
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

  /**
   * The group renders its own copy of each radio, so a change here is
   * invisible until the group re-renders; see shared/option.js.
   */
  updated(changed) {
    notifyOwner(this, changed, ['disabled', 'value']);
  }

  render() {
    return html`<slot></slot>`;
  }
}
