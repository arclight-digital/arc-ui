import { LitElement, html, css } from 'lit';

/**
 * @arc-prism interactive — tree item, child of arc-tree-view
 */
/**
 * @tag arc-tree-item
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
