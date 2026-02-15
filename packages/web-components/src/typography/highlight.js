import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-highlight
 */
export class ArcHighlight extends LitElement {
  static properties = {
    text:          { type: String },
    query:         { type: String },
    caseSensitive: { type: Boolean, reflect: true, attribute: 'case-sensitive' },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline; }

      mark {
        background: var(--accent-primary-subtle);
        color: var(--accent-primary);
        border-radius: var(--radius-sm);
        padding: 1px var(--space-xs); /* cosmetic 1px vertical for inline highlight */
        font-style: inherit;
        font-weight: inherit;
      }
    `,
  ];

  constructor() {
    super();
    this.text = '';
    this.query = '';
    this.caseSensitive = false;
  }

  /** Escape regex special characters so arbitrary query strings are safe. */
  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  render() {
    if (!this.query || !this.text) {
      return html`<span part="text">${this.text}</span>`;
    }

    const flags = this.caseSensitive ? 'g' : 'gi';
    let regex;
    try {
      regex = new RegExp(`(${this._escapeRegex(this.query)})`, flags);
    } catch {
      return html`<span part="text">${this.text}</span>`;
    }

    const parts = this.text.split(regex);

    // After split-by-captured-group, odd indices are matched segments.
    return html`<span part="text">${parts.map((segment, i) =>
      i % 2 === 1
        ? html`<mark part="mark">${segment}</mark>`
        : segment
    )}</span>`;
  }
}
