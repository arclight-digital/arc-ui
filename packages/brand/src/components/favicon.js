import { LitElement } from 'lit';

/**
 * Default favicon SVG — squircle background with branded Arclight logo.
 * Uses CSS custom properties for light/dark mode adaptation.
 * Gradient circles use hardcoded brand colors so they render correctly
 * as a favicon (CSS vars in gradients have spotty browser support in favicons).
 */
const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600">
<style>
  :root { --bg: #0f0f1a; --fg: #e8e8ec; --st: #e8e8f4 }
  @media (prefers-color-scheme: light) { :root { --bg: #f0f0f4; --fg: #1a1a2e; --st: #1a1a2e } }
</style>
<rect width="1600" height="1600" rx="320" fill="var(--bg)"/>
<g transform="translate(160, 120) scale(0.8)">
  <path d="M64.393,1538.856c0,0 305.399,-541.018 735.607,-541.018c430.207,0 735.607,541.018 735.607,541.018" fill="none" stroke="var(--st)" stroke-width="103.09" stroke-linecap="round"/>
  <circle cx="800" cy="489.573" r="489.573" fill="none" stroke="rgba(77,126,247,0.12)" stroke-width="2"/>
  <circle cx="800" cy="489.573" r="305.035" fill="none" stroke="rgba(168,85,247,0.15)" stroke-width="2"/>
  <radialGradient id="g1" cx="800" cy="490" r="490" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#4d7ef7" stop-opacity="0.25"/>
    <stop offset="0.6" stop-color="#a855f7" stop-opacity="0.12"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <circle cx="800" cy="489.573" r="489.573" fill="url(#g1)"/>
  <radialGradient id="g2" cx="800" cy="490" r="305" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#a855f7" stop-opacity="0.2"/>
    <stop offset="0.5" stop-color="#4d7ef7" stop-opacity="0.1"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <circle cx="800" cy="489.573" r="305.035" fill="url(#g2)"/>
  <radialGradient id="g3" cx="800" cy="490" r="120" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#e8e8ec" stop-opacity="1"/>
    <stop offset="0.7" stop-color="#4d7ef7" stop-opacity="0.8"/>
    <stop offset="1" stop-color="#a855f7" stop-opacity="0.6"/>
  </radialGradient>
  <circle cx="800" cy="489.573" r="118.659" fill="url(#g3)"/>
</g>
</svg>`;

/** @tag arclight-favicon */
export class ArclightFavicon extends LitElement {
  static properties = {
    /** When true, locks the favicon to dark-mode colors (disables automatic light-mode adaptation). */
    dark: { type: Boolean, reflect: true },
    /** Custom SVG string to use instead of the default Arclight logo. */
    svg: { type: String },
    /** Background color override for the squircle. */
    bg: { type: String },
    /** Foreground/stroke color override. */
    fg: { type: String },
  };

  constructor() {
    super();
    this.dark = false;
    this.svg = '';
    this.bg = '';
    this.fg = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this._inject();
  }

  updated() {
    this._inject();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const link = document.head.querySelector('link[rel="icon"][data-arclight]');
    if (link) link.remove();
  }

  _inject() {
    let svgStr = this.svg || DEFAULT_SVG;

    // Apply color overrides
    if (this.bg) {
      svgStr = svgStr.replace(/--bg:\s*#[0-9a-f]+/gi, `--bg: ${this.bg}`);
    }
    if (this.fg) {
      svgStr = svgStr.replace(/--fg:\s*#[0-9a-f]+/gi, `--fg: ${this.fg}`);
      svgStr = svgStr.replace(/--st:\s*#[0-9a-f]+/gi, `--st: ${this.fg}`);
    }

    // Force dark mode — strip the light-mode media query
    if (this.dark) {
      svgStr = svgStr.replace(/@media\s*\(prefers-color-scheme:\s*light\)\s*\{[^}]*\{[^}]*\}\s*\}/g, '');
    }

    const href = `data:image/svg+xml,${encodeURIComponent(svgStr)}`;

    let link = document.head.querySelector('link[rel="icon"][data-arclight]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.setAttribute('data-arclight', '');
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = href;
  }

  render() {
    return null;
  }
}

customElements.define('arclight-favicon', ArclightFavicon);
