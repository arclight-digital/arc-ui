import { LitElement } from 'lit';

/**
 * Default favicon SVG — squircle background with branded Arclight logo.
 * Uses CSS custom properties for light/dark mode adaptation.
 * Gradient circles use hardcoded brand colors so they render correctly
 * as a favicon (CSS vars in gradients have spotty browser support in favicons).
 */
const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600">
<style>
  :root { --bg: #0f0f1a; --fg: #e8e8ec; --st: #c8c8d8 }
  @media (prefers-color-scheme: light) { :root { --bg: #f0f0f4; --fg: #1a1a2e; --st: #2a2a3e } }
</style>
<defs>
  <!-- Wide soft glow for background atmosphere -->
  <filter id="bg-wash" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="160"/>
  </filter>
  <!-- Ambient glow behind the whole logo -->
  <filter id="ambient" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="80"/>
  </filter>
  <!-- Background vignette — darkens corners -->
  <radialGradient id="vignette" cx="800" cy="700" r="900" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#0f0f1a" stop-opacity="0"/>
    <stop offset="0.6" stop-color="#0f0f1a" stop-opacity="0"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.5"/>
  </radialGradient>
  <!-- Deep bg color layer — subtle blue shift in the center -->
  <radialGradient id="bg-depth" cx="800" cy="600" r="700" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#161630" stop-opacity="1"/>
    <stop offset="0.5" stop-color="#111124" stop-opacity="0.6"/>
    <stop offset="1" stop-color="#0f0f1a" stop-opacity="0"/>
  </radialGradient>
  <!-- Tight glow for the core dot -->
  <filter id="core-glow" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="40"/>
  </filter>
  <!-- Arc glow -->
  <filter id="arc-glow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="25"/>
  </filter>
  <!-- Outer orbital gradient fill -->
  <radialGradient id="orb1" cx="800" cy="510" r="420" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#4d7ef7" stop-opacity="0.4"/>
    <stop offset="0.5" stop-color="#a855f7" stop-opacity="0.2"/>
    <stop offset="1" stop-color="#0f0f1a" stop-opacity="0"/>
  </radialGradient>
  <!-- Inner orbital gradient fill -->
  <radialGradient id="orb2" cx="800" cy="510" r="260" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#a855f7" stop-opacity="0.45"/>
    <stop offset="0.4" stop-color="#4d7ef7" stop-opacity="0.2"/>
    <stop offset="1" stop-color="#0f0f1a" stop-opacity="0"/>
  </radialGradient>
  <!-- Core dot — blazing white-to-blue -->
  <radialGradient id="core" cx="800" cy="510" r="110" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
    <stop offset="0.35" stop-color="#e8e8f4" stop-opacity="0.95"/>
    <stop offset="0.65" stop-color="#4d7ef7" stop-opacity="0.85"/>
    <stop offset="1" stop-color="#a855f7" stop-opacity="0.7"/>
  </radialGradient>
  <!-- Arc gradient stroke -->
  <linearGradient id="arc-grad" x1="200" y1="1200" x2="1400" y2="1200" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#4d7ef7" stop-opacity="0.6"/>
    <stop offset="0.5" stop-color="var(--st)" stop-opacity="1"/>
    <stop offset="1" stop-color="#a855f7" stop-opacity="0.6"/>
  </linearGradient>
  <!-- Orbital ring gradients -->
  <linearGradient id="ring1" x1="380" y1="100" x2="1220" y2="920" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#4d7ef7" stop-opacity="0.5"/>
    <stop offset="0.5" stop-color="#a855f7" stop-opacity="0.3"/>
    <stop offset="1" stop-color="#4d7ef7" stop-opacity="0.15"/>
  </linearGradient>
  <linearGradient id="ring2" x1="500" y1="200" x2="1100" y2="820" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#a855f7" stop-opacity="0.55"/>
    <stop offset="0.5" stop-color="#4d7ef7" stop-opacity="0.35"/>
    <stop offset="1" stop-color="#a855f7" stop-opacity="0.2"/>
  </linearGradient>
</defs>
<!-- Background squircle -->
<rect width="1600" height="1600" rx="320" fill="var(--bg)"/>
<!-- Background depth — subtle blue shift in center, gives dimensionality -->
<rect width="1600" height="1600" rx="320" fill="url(#bg-depth)"/>
<!-- Deep color wash — large diffused brand color pools in the background -->
<circle cx="500" cy="400" r="500" fill="#4d7ef7" opacity="0.07" filter="url(#bg-wash)"/>
<circle cx="1100" cy="600" r="400" fill="#a855f7" opacity="0.06" filter="url(#bg-wash)"/>
<circle cx="800" cy="1100" r="450" fill="#4d7ef7" opacity="0.04" filter="url(#bg-wash)"/>
<!-- Vignette — darken corners for depth -->
<rect width="1600" height="1600" rx="320" fill="url(#vignette)"/>
<!-- Ambient glow — focused brand light around the orbital -->
<circle cx="800" cy="510" r="450" fill="#4d7ef7" opacity="0.18" filter="url(#ambient)"/>
<circle cx="800" cy="510" r="280" fill="#a855f7" opacity="0.14" filter="url(#ambient)"/>
<!-- Outer orbital: gradient fill + visible gradient stroke ring -->
<circle cx="800" cy="510" r="420" fill="url(#orb1)"/>
<circle cx="800" cy="510" r="420" fill="none" stroke="url(#ring1)" stroke-width="12"/>
<!-- Inner orbital: gradient fill + visible gradient stroke ring -->
<circle cx="800" cy="510" r="260" fill="url(#orb2)"/>
<circle cx="800" cy="510" r="260" fill="none" stroke="url(#ring2)" stroke-width="12"/>
<!-- Core glow layer — soft blue/purple halo behind the dot -->
<circle cx="800" cy="510" r="130" fill="#4d7ef7" opacity="0.5" filter="url(#core-glow)"/>
<circle cx="800" cy="510" r="80" fill="#a855f7" opacity="0.35" filter="url(#core-glow)"/>
<!-- Core dot — bright, blazing -->
<circle cx="800" cy="510" r="105" fill="url(#core)"/>
<!-- Arc — thick stroke with gradient, plus glow underneath -->
<path d="M200,1300 Q800,750 1400,1300" fill="none" stroke="#4d7ef7" stroke-width="80" stroke-linecap="round" opacity="0.3" filter="url(#arc-glow)"/>
<path d="M200,1300 Q800,750 1400,1300" fill="none" stroke="url(#arc-grad)" stroke-width="80" stroke-linecap="round"/>
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
