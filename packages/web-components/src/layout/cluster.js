import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-cluster
 */
export class ArcCluster extends LitElement {
  static properties = {
    gap:     { type: String, reflect: true },
    align:   { type: String, reflect: true },
    justify: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
        align-items: center;
      }

      /* Gap variants */
      :host([gap="xs"]) { gap: var(--space-xs); }
      :host([gap="sm"]) { gap: var(--space-sm); }
      :host([gap="md"]) { gap: var(--space-md); }
      :host([gap="lg"]) { gap: var(--space-lg); }
      :host([gap="xl"]) { gap: var(--space-xl); }

      /* Align variants */
      :host([align="start"])  { align-items: flex-start; }
      :host([align="center"]) { align-items: center; }
      :host([align="end"])    { align-items: flex-end; }

      /* Justify variants */
      :host([justify="start"])         { justify-content: flex-start; }
      :host([justify="center"])        { justify-content: center; }
      :host([justify="end"])           { justify-content: flex-end; }
      :host([justify="space-between"]) { justify-content: space-between; }
      :host([justify="space-around"])  { justify-content: space-around; }
    `,
  ];

  constructor() {
    super();
    this.gap = 'sm';
    this.align = 'center';
    this.justify = 'start';
  }

  render() {
    return html`<slot></slot>`;
  }
}
