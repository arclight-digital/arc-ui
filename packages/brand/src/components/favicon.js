import { LitElement } from 'lit';

const BASE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><style>:root{--f:#e8e8ec;--s:#e8e8f4;--m:#adadb0}@media(prefers-color-scheme:light){:root{--f:#1a1a2e;--s:#1a1a2e;--m:#4a4a5a}}</style><g><path d="M64.393,1538.856c0,0 305.399,-541.018 735.607,-541.018c430.207,0 735.607,541.018 735.607,541.018" style="fill:none;stroke:var(--s);stroke-width:103.09px;"/><g id="Circles"><circle cx="800" cy="489.573" r="118.659" style="fill:var(--f);"/><circle cx="800" cy="489.573" r="305.035" style="fill:var(--f);fill-opacity:0.07;"/><circle cx="800" cy="489.573" r="489.573" style="fill:url(#_Radial1);"/><circle cx="800" cy="489.573" r="305.035" style="fill:url(#_Radial2);"/></g></g><defs><radialGradient id="_Radial1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(489.573495,0,0,489.573495,800,489.573495)"><stop offset="0" style="stop-color:var(--f);stop-opacity:0.21"/><stop offset="0.49" style="stop-color:var(--m);stop-opacity:0.16"/><stop offset="1" style="stop-color:#000;stop-opacity:0"/></radialGradient><radialGradient id="_Radial2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(305.034636,0,0,305.034636,800,489.573495)"><stop offset="0" style="stop-color:var(--f);stop-opacity:0.14"/><stop offset="0.49" style="stop-color:var(--m);stop-opacity:0.1"/><stop offset="1" style="stop-color:#000;stop-opacity:0"/></radialGradient></defs></svg>`;

/** @tag arclight-favicon */
export class ArclightFavicon extends LitElement {
  static properties = {
    dark: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.dark = false;
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
    let svg = BASE_SVG;

    if (this.dark) {
      svg = svg.replace(/@media\(prefers-color-scheme:light\)\{:root\{[^}]*\}\}/, '');
    }

    const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;

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
