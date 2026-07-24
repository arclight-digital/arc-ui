import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Content centering primitive with max-width, intrinsic centering, and text-center options.
 *
 * @tag arc-center
 * @prop {string} maxWidth - Maximum width for the centered content block. Accepts any CSS length or custom property. Only applies in default (block) centering mode.
 * @prop {boolean} intrinsic - Enables intrinsic centering mode using flexbox, which centers children based on their natural width rather than stretching to max-width.
 * @prop {boolean} text - Adds text-align: center for centering inline text content within the block.
 * @slot - Default content.
 */
export class ArcCenter extends LitElement {
  static properties = {
    maxWidth:  { type: String, reflect: true, attribute: 'max-width' },
    intrinsic: { type: Boolean, reflect: true },
    text:      { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        box-sizing: border-box;
        margin-inline: auto;
        max-width: var(--_max-width, 60ch);
        padding-inline: var(--space-lg);
      }

      :host([intrinsic]) {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      :host([text]) {
        text-align: center;
      }
    `,
  ];

  constructor() {
    super();
    this.maxWidth = '60ch';
    this.intrinsic = false;
    this.text = false;
  }

  updated(changed) {
    if (changed.has('maxWidth')) {
      this.style.setProperty('--_max-width', this.maxWidth);
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
