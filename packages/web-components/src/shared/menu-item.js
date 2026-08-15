import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, flag } from '../shared/props.js';
import { notifyOwner } from './hydrate-slots.js';

/**
 * A single action entry inside the context menu.
 *
 * @tag arc-menu-item
 * @prop {string} label - Display text for the menu item. Settable, and falls back to the element's text content when unset — `<arc-menu-item label="Cut">` and `<arc-menu-item>Cut</arc-menu-item>` are equivalent.
 * @prop {string} shortcut - Keyboard shortcut hint displayed on the right side.
 * @prop {string} icon - Name of the icon to display before the label.
 * @prop {boolean} disabled - Disables the item, preventing interaction.
 * @prop {string} value - Stable identifier carried on the arc-select detail. Defaults to the label, which is fine until two items share one — give anything a handler must act on its own value rather than matching against display text.
 * @slot - Default content.
 */
export class ArcMenuItem extends DeclaredPropsMixin(LitElement) {
  static properties = {
    label: { type: String },
    shortcut: { type: String, reflect: true },
    disabled: flag(false),
    icon: { type: String },
    value: { type: String },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.label = '';
    this.shortcut = '';
    this.icon = '';
    this.value = '';
  }

  /**
   * The text to draw.
   *
   * `label` was documented as a prop and implemented as a getter over
   * textContent with no setter and no attribute, so
   * `<arc-menu-item label="Cut"></arc-menu-item>` rendered a blank item —
   * silently, and the six generated wrappers exposed a writable `label` that
   * did nothing (finding #32). It is a real property now; the text-content form
   * stays the fallback, so every existing consumer is unaffected.
   */
  get displayLabel() {
    return this.label || this.textContent.trim();
  }

  /**
   * What arc-select reports. Falls back to the label so an item that never sets
   * `value` behaves as it always did.
   */
  get selectionValue() {
    return this.value || this.displayLabel;
  }

  /** The menu draws this item from its own render — see notifyOwner. */
  updated(changed) {
    notifyOwner(this, changed, ['label', 'shortcut', 'icon', 'disabled', 'value']);
  }

  render() {
    return html`<slot></slot>`;
  }
}
