import { LitElement } from 'lit';
import { buildFaviconSvg } from '../favicon-svg.js';

const DEFAULT_SVG = buildFaviconSvg();

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
    const svgStr = this.svg || buildFaviconSvg({
      dark: this.dark,
      bg: this.bg,
      fg: this.fg,
    });

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
