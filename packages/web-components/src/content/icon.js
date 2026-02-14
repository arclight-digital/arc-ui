import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { iconRegistry } from './icon-registry.js';

const _svgCache = new Map();

/** Parse an SVG string into a sanitized SVG element, stripping scripts and event handlers. */
function sanitizeSvg(svgStr) {
  if (_svgCache.has(svgStr)) return _svgCache.get(svgStr).cloneNode(true);
  const doc = new DOMParser().parseFromString(svgStr, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return null;
  // Strip <script> and any elements with event handler attributes
  for (const el of svg.querySelectorAll('script')) el.remove();
  const walk = svg.querySelectorAll('*');
  for (const el of walk) {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
    }
  }
  _svgCache.set(svgStr, svg);
  return svg.cloneNode(true);
}

/**
 * @tag arc-icon
 */
export class ArcIcon extends LitElement {
  static properties = {
    name:  { type: String, reflect: true },
    size:  { type: String, reflect: true },
    label: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: currentColor;
        vertical-align: middle;
      }

      :host([size="xs"]) { width: 12px; height: 12px; }
      :host(:not([size])),
      :host([size="sm"]) { width: 16px; height: 16px; }
      :host([size="md"]) { width: 20px; height: 20px; }
      :host([size="lg"]) { width: 24px; height: 24px; }
      :host([size="xl"]) { width: 32px; height: 32px; }

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      svg {
        width: 100%;
        height: 100%;
      }

      ::slotted(svg) {
        width: 100%;
        height: 100%;
        fill: currentColor;
      }
    `,
  ];

  constructor() {
    super();
    this.name = '';
    this.size = 'sm';
    this.label = '';
  }

  render() {
    const svgStr = this.name ? iconRegistry.get(this.name) : null;
    const svgNode = svgStr ? sanitizeSvg(svgStr) : null;
    return html`
      <span
        class="icon"
        role=${this.label ? 'img' : 'presentation'}
        aria-label=${this.label || ''}
        aria-hidden=${this.label ? 'false' : 'true'}
        part="icon"
      >
        ${svgNode ?? html`<slot></slot>`}
      </span>
    `;
  }
}
