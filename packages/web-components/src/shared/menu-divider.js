import { LitElement, css } from 'lit';

export class ArcMenuDivider extends LitElement {
  static styles = css`
    :host { display: none; }
  `;
}

customElements.define('arc-menu-divider', ArcMenuDivider);
