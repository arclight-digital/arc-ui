import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-key-value
 * @requires arc-kv-pair
 */
export class ArcKeyValue extends LitElement {
  static properties = {
    layout:   { type: String, reflect: true },
    dividers: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .kv-list {
        display: flex;
        flex-direction: column;
      }

      /* Horizontal layout — grid pairs */
      :host([layout="horizontal"]) ::slotted(arc-kv-pair) {
        display: grid;
        grid-template-columns: minmax(120px, auto) 1fr;
        gap: var(--space-md);
        align-items: baseline;
      }

      /* Stacked layout — flex column pairs */
      :host([layout="stacked"]) ::slotted(arc-kv-pair) {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      /* Pair padding */
      ::slotted(arc-kv-pair) {
        padding: var(--space-md) var(--space-sm);
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast);
      }

      ::slotted(arc-kv-pair:hover) {
        background: var(--surface-hover);
      }

      /* Dividers */
      :host([dividers]) ::slotted(arc-kv-pair:not(:last-child)) {
        border-bottom: 1px solid var(--divider);
      }

      @media (prefers-reduced-motion: reduce) {
        ::slotted(arc-kv-pair) {
          transition: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.layout = 'horizontal';
    this.dividers = true;
  }

  render() {
    return html`
      <div class="kv-list" role="list" part="list">
        <slot></slot>
      </div>
    `;
  }
}
