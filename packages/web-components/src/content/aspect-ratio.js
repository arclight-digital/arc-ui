import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcAspectRatio extends LitElement {
  static properties = {
    ratio: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .aspect-ratio {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: var(--radius-md);
      }

      .aspect-ratio__inner {
        width: 100%;
        height: 100%;
      }

      ::slotted(*) {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    `,
  ];

  constructor() {
    super();
    this.ratio = '16/9';
  }

  /**
   * Parse the ratio string ('W/H') into a CSS-safe aspect-ratio value.
   * Falls back to 16/9 if the format is invalid.
   */
  get _aspectRatio() {
    const match = this.ratio?.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (!match) return '16 / 9';
    return `${match[1]} / ${match[2]}`;
  }

  /**
   * Compute a padding-top percentage fallback for browsers
   * that don't support the aspect-ratio CSS property.
   */
  get _paddingFallback() {
    const match = this.ratio?.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (!match) return '56.25%';
    const w = parseFloat(match[1]);
    const h = parseFloat(match[2]);
    if (w === 0) return '56.25%';
    return `${(h / w) * 100}%`;
  }

  render() {
    return html`
      <div
        class="aspect-ratio"
        part="container"
        style="aspect-ratio: ${this._aspectRatio};"
      >
        <div class="aspect-ratio__inner" part="inner">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('arc-aspect-ratio', ArcAspectRatio);
