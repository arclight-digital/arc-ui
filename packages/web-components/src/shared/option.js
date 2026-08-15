import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Whether an `arc-option` element refuses selection.
 *
 * Shared because all four consumers need the same answer and all four had the
 * same wrong one — they read the *group's* `disabled` and never the option's
 * (finding #6). Reads the attribute as well as the property: on the slotchange
 * that builds a listbox an arc-option may not have upgraded yet, and an
 * un-upgraded element has no `disabled` property at all.
 *
 * @param {Element | null | undefined} option
 * @returns {boolean}
 */
export function isOptionDisabled(option) {
  if (!option) return false;
  return option.disabled === true || option.hasAttribute('disabled');
}

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

  /**
   * Consumers render an arc-option's state into *their* shadow DOM — the
   * option itself is `display: none`. So a change here is invisible until the
   * owner re-renders, and nothing else asks it to (finding #6).
   *
   * Guarded on the previous value being defined: on the first update every
   * entry's old value is undefined, and the owner is mid-render anyway.
   */
  updated(changed) {
    const moved = (name) => changed.has(name) && changed.get(name) !== undefined;
    if (!moved('disabled') && !moved('value') && !moved('selected')) return;

    for (let node = this.parentElement; node; node = node.parentElement) {
      if (typeof node.requestUpdate === 'function') {
        node.requestUpdate();
        return;
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
