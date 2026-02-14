import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-toolbar
 */
export class ArcToolbar extends LitElement {
  static properties = {
    sticky: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    border: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-body);
      }

      :host([sticky]) {
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .toolbar {
        display: flex;
        align-items: center;
        height: 48px;
        padding: 0 var(--space-md);
        background: var(--bg-card);
        gap: var(--space-sm);
      }

      :host([size='sm']) .toolbar {
        height: 36px;
        padding: 0 var(--space-sm);
      }

      :host([border]) .toolbar {
        border-bottom: 1px solid var(--border-subtle);
      }

      .toolbar__start {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      .toolbar__center {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex: 1;
        justify-content: center;
      }

      .toolbar__end {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
        margin-left: auto;
      }
    `,
  ];

  constructor() {
    super();
    this.sticky = false;
    this.size = 'md';
    this.border = true;
  }

  render() {
    return html`
      <div class="toolbar" part="base" role="toolbar">
        <div class="toolbar__start" part="start">
          <slot name="start"></slot>
        </div>
        <div class="toolbar__center" part="center">
          <slot></slot>
        </div>
        <div class="toolbar__end" part="end">
          <slot name="end"></slot>
        </div>
      </div>
    `;
  }
}
