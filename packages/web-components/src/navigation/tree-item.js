import { LitElement, html, css } from 'lit';

/**
 * Node within a TreeView. Can nest for sub-trees.
 *
 * @tag arc-tree-item
 * @prop {string} label - Item label text
 * @prop {string} icon - Icon or emoji
 * @prop {boolean} expanded - Expand child items
 * @slot - Default content.
 */
export class ArcTreeItem extends LitElement {
  static properties = {
    label:    { type: String, reflect: true },
    icon:     { type: String },
    expanded: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: contents; }
  `;

  constructor() {
    super();
    this.label = '';
    this.icon = '';
    this.expanded = false;
  }

  /** Nested arc-tree-item children */
  get items() {
    return [...this.querySelectorAll(':scope > arc-tree-item')];
  }

  get hasChildren() {
    return this.items.length > 0;
  }

  render() {
    return html`<slot></slot>`;
  }
}
