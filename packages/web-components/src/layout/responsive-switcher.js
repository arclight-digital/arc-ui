import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-responsive-switcher
 */
export class ArcResponsiveSwitcher extends LitElement {
  static properties = {
    threshold: { type: String, reflect: true },
    gap:       { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }

      .switcher {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      :host([gap="xs"]) .switcher { gap: var(--space-xs); }
      :host([gap="sm"]) .switcher { gap: var(--space-sm); }
      :host([gap="md"]) .switcher { gap: var(--space-md); }
      :host([gap="lg"]) .switcher { gap: var(--space-lg); }
      :host([gap="xl"]) .switcher { gap: var(--space-xl); }

      @container (min-width: 600px) {
        .switcher {
          flex-direction: row;
        }
      }

      ::slotted(*) {
        flex: 1;
      }
    `,
  ];

  constructor() {
    super();
    this.threshold = '600px';
    this.gap = 'md';
    this._sheet = null;
  }

  updated(changed) {
    if (changed.has('threshold')) {
      this._updateContainerQuery();
    }
  }

  _updateContainerQuery() {
    if (this._sheet) {
      this._sheet.replaceSync(
        `@container (min-width: ${this.threshold}) { .switcher { flex-direction: row; } }`,
      );
    } else if (this.shadowRoot) {
      this._sheet = new CSSStyleSheet();
      this._sheet.replaceSync(
        `@container (min-width: ${this.threshold}) { .switcher { flex-direction: row; } }`,
      );
      this.shadowRoot.adoptedStyleSheets = [
        ...this.shadowRoot.adoptedStyleSheets,
        this._sheet,
      ];
    }
  }

  render() {
    return html`
      <div class="switcher" part="switcher">
        <slot></slot>
      </div>
    `;
  }
}
