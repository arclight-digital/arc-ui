import { LitElement, html, css, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { tokenStyles } from '../shared-styles.js';
import { iconRegistry } from './icon-registry.js';
import { sanitizeSvg } from './sanitize-svg.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * An unknown icon name used to render an empty box and say nothing, which is
 * how arc-transfer-list shipped four blank buttons: the names it asked for
 * exist in Lucide but not in the default Phosphor library, and nothing
 * anywhere reported it. A missing glyph is never intentional, so it is worth
 * one line in the console.
 *
 * Once per name, not per element — a table with fifty rows of the same broken
 * icon should not produce fifty lines.
 */
const _warnedIcons = new Set();
function warnUnknownIcon(name) {
  if (_warnedIcons.has(name)) return;
  _warnedIcons.add(name);
  console.warn(
    `[arc-icon] No icon named "${name}" in the active library. ` +
      'Check the spelling against the library in use (Phosphor by default, ' +
      'Lucide via iconRegistry.use("lucide")), or register it yourself with ' +
      'iconRegistry.set({ "' +
      name +
      '": "<svg…>" }).',
  );
}

/**
 * Renders icons from Phosphor (1,500+) or Lucide (1,900+) by name, with one-line library switching
 * and custom icon registration.
 *
 * @tag arc-icon
 * @prop {string} name - Icon name to look up in the icon registry. When provided, renders the matching SVG. When empty, falls back to slotted content.
 * @prop {'xs' | 'sm' | 'md' | 'lg' | 'xl'} size - Icon dimensions: `xs` (12px), `sm` (16px), `md` (20px), `lg` (24px), `xl` (32px).
 * @prop {string} label - Accessibility label. When provided, sets `role="img"` and `aria-label`. When empty, sets `role="presentation"` and `aria-hidden="true"`.
 * @slot - Default content.
 * @csspart icon
 */
export class ArcIcon extends DeclaredPropsMixin(LitElement) {
  static properties = {
    name: { type: String, reflect: true },
    // NOT oneOf(): the JSDoc union above lists the five named sizes, but the
    // code below also accepts any positive number as a pixel size. The
    // documented set is narrower than the accepted set, so normalising to it
    // would silently reject `size="18"`. See test-findings.md.
    size: { type: String, reflect: true },
    label: { type: String },
    _svgContent: { state: true },
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
      :host(:not([size="lg"]):not([size="md"]):not([size="xl"]):not([size="xs"])),
      :host([size="sm"]) { width: 16px; height: 16px; }
      :host([size="md"]) { width: 20px; height: 20px; }
      :host([size="lg"]) { width: 24px; height: 24px; }
      :host([size="xl"]) { width: 32px; height: 32px; }
      /* Numeric sizes (px) are applied as inline width/height in updated() */

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
    this._svgContent = null;
  }

  updated(changed) {
    if (changed.has('name')) this._loadIcon();
    if (changed.has('size')) {
      const px = Number(this.size);
      if (this.size !== '' && Number.isFinite(px) && px > 0) {
        this.style.width = `${px}px`;
        this.style.height = `${px}px`;
      } else {
        this.style.removeProperty('width');
        this.style.removeProperty('height');
      }
    }
  }

  async _loadIcon() {
    if (!this.name) {
      this._svgContent = null;
      return;
    }
    // Already in memory — resolved earlier, registered by hand, or inlined into
    // the page by a server-side build. Taking the sync path keeps the first
    // client render identical to the server's, which is what hydration needs.
    const cached = iconRegistry.getSync(this.name);
    if (cached !== null) {
      this._svgContent = cached;
      return;
    }
    const currentName = this.name;
    const svg = await iconRegistry.get(this.name);
    // Guard against stale responses (name changed while loading)
    if (this.name === currentName) {
      this._svgContent = svg;
      if (svg === null) warnUnknownIcon(currentName);
    }
  }

  render() {
    // `updated()` does not run on the server, so `_svgContent` is never
    // populated there — the registry's synchronous cache is the only way a
    // named icon reaches the server's HTML. Client-side the two agree.
    const source = this._svgContent ?? iconRegistry.getSync(this.name);
    const svg = source ? sanitizeSvg(source) : null;
    return html`
      <span
        class="icon"
        role=${this.label ? 'img' : 'presentation'}
        aria-label=${this.label || nothing}
        aria-hidden=${this.label ? 'false' : 'true'}
        part="icon"
      >
        ${svg ? unsafeHTML(svg) : html`<slot></slot>`}
      </span>
    `;
  }
}
