import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, flag } from '../shared/props.js';
import { notifyOwner } from '../shared/hydrate-slots.js';

/**
 * An individual tab panel within a Tabs group. Each Tab renders a button in the tab bar and owns
 * its associated content panel. Use this sub-component when you need fine-grained control over
 * individual tab behavior, such as disabling a specific tab or attaching per-tab event listeners.
 *
 * @tag arc-tab
 * @prop {string} label - Text displayed on the tab button. Keep labels concise — one or two words — to prevent the tab bar from overflowing.
 * @prop {boolean} disabled - When true, the tab button is dimmed, is skipped by the arrow keys and cannot be selected by click. A disabled tab that is already selected stays visible — disabling is not a way to hide a panel.
 * @slot - Default content.
 */
export class ArcTab extends DeclaredPropsMixin(LitElement) {
  static properties = {
    label: { type: String, reflect: true },
    disabled: flag(false),
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }
  `;

  constructor() {
    super();
    this.label = '';
  }

  /**
   * The tab bar renders `label` and `disabled` off its arc-tab children, which
   * are light-DOM siblings rather than reactive inputs of the group — so a
   * change here has to tell the group, or the button keeps the old text and
   * stays clickable after being disabled.
   */
  updated(changed) {
    notifyOwner(this, changed, ['label', 'disabled']);
  }

  render() {
    return html`<slot></slot>`;
  }
}
