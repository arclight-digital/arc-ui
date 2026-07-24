import { LitElement, html, css } from 'lit';

/**
 * An individual crumb inside a Breadcrumb trail. Each item represents one level of the page
 * hierarchy. Items with an `href` render as clickable links; the item without an `href` (typically
 * the last one) is treated as the current page and displayed with stronger visual weight.
 *
 * @tag arc-breadcrumb-item
 * @prop {string} href - Navigation URL for this crumb. When provided, the crumb renders as a clickable link styled in muted text that brightens on hover. Omit this property on the final item to mark it as the current page -- it will receive `aria-current="page"` and a bolder font weight automatically.
 * @slot - Default content.
 */
export class ArcBreadcrumbItem extends LitElement {
  static properties = {
    href: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.href = '';
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
