import { LitElement, html, css } from 'lit';
import { notifyOwner } from './hydrate-slots.js';

/**
 * A heading over a group of menu items.
 *
 * The items after it, up to the next label, become one group, announced by
 * this text: the parent menu wraps them in `role="group"` labelled by it. It is
 * never focusable and never selected. It was reported missing (finding #115)
 * by a consumer titling each specialist's items in one menu, whose workaround
 * was a disabled `arc-menu-item`, which reads as a dead option rather than a
 * heading.
 *
 * @tag arc-menu-label
 * @status stable
 * @prop {string} label - The heading text. Falls back to the element's text content when unset, as on arc-menu-item.
 * @slot - Default content.
 */
export class ArcMenuLabel extends LitElement {
  static properties = {
    label: { type: String },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.label = '';
  }

  get displayLabel() {
    return this.label || this.textContent.trim();
  }

  /** The menu draws this label from its own render — see notifyOwner. */
  updated(changed) {
    notifyOwner(this, changed, ['label']);
  }

  render() {
    return html`<slot></slot>`;
  }
}

/** The authored children a menu draws: items, dividers and labels. */
export const MENU_CHILD_TAGS = new Set(['ARC-MENU-ITEM', 'ARC-MENU-DIVIDER', 'ARC-MENU-LABEL']);

/**
 * Split a menu's children into sections at each label.
 *
 * Returns `[{ label, entries }]`, where `label` is the arc-menu-label that heads
 * the section (null for anything before the first one) and `entries` are
 * `{ child, index }` pairs, `index` being the child's position in `children`,
 * which is what each menu's ids and event details are keyed on.
 */
export function menuSections(children) {
  const sections = [{ label: null, entries: [] }];
  children.forEach((child, index) => {
    if (child.tagName === 'ARC-MENU-LABEL') sections.push({ label: child, entries: [] });
    else sections.at(-1).entries.push({ child, index });
  });
  return sections.filter((s) => s.label || s.entries.length);
}
