import { LitElement, html, css, unsafeCSS } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { logoWordmarkInline, logoWordmarkStacked } from '../assets/logo.js';

const SIZES = { sm: 120, md: 240, lg: 400 };

/**
 * Build a data URI from a Lit svg template result for use in CSS ::after.
 */
/** Works only for fully-static svg`` templates with no interpolated expressions. */
function svgTemplateToDataUri(tmpl) {
  const parts = tmpl.strings;
  if (!parts || !parts.length) {
    console.warn('[arclight-watermark] svgTemplateToDataUri: expected a Lit svg template result');
    return '';
  }
  return `data:image/svg+xml,${encodeURIComponent(parts.join(''))}`;
}

const STACKED_URI = svgTemplateToDataUri(logoWordmarkStacked);
const INLINE_URI = svgTemplateToDataUri(logoWordmarkInline);

/** @tag arclight-watermark */
export class ArclightWatermark extends LitElement {
  static properties = {
    /** Watermark mode: "logo" (single logo-wordmark), "tiled" (repeating wordmark pattern). */
    mode: { type: String, reflect: true },
    size: { type: String, reflect: true },
    opacity: { type: Number, reflect: true },
    animated: { type: Boolean, reflect: true },
    position: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        position: absolute;
        pointer-events: none;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-primary, #e8e8ec);
      }

      :host([position="center"]) {
        inset: 0;
      }

      :host([position="bottom-right"]) {
        bottom: 0;
        right: 0;
        padding: var(--space-md);
      }

      :host([mode="tiled"]) {
        inset: 0;
        overflow: hidden;
      }

      /*
       * CSS-only fallback watermark via ::after pseudo-element.
       * Can't be selected or deleted individually in DevTools.
       * Sits behind the DOM-rendered watermark as a safety net.
       */
      :host(:not([mode="tiled"]))::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: ${unsafeCSS(`url("${STACKED_URI}")`)};
        background-repeat: no-repeat;
        background-position: center;
        background-size: var(--_wm-size, 240px) auto;
        opacity: var(--_wm-opacity, 0.04);
        pointer-events: none;
      }

      :host([mode="tiled"])::after {
        content: '';
        position: absolute;
        inset: -100%;
        background-image: ${unsafeCSS(`url("${INLINE_URI}")`)};
        background-repeat: repeat;
        background-size: 240px auto;
        opacity: var(--_wm-opacity, 0.04);
        pointer-events: none;
        transform: rotate(-30deg);
        transform-origin: center center;
      }

      .tiled-wrapper {
        position: absolute;
        inset: -100%;
        display: flex;
        flex-direction: column;
        gap: 40px;
        transform: rotate(-30deg);
        transform-origin: center center;
      }

      .tiled-row {
        display: flex;
        gap: 60px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .tiled-row:nth-child(even) {
        margin-left: 150px;
      }

      .tiled-row svg {
        flex-shrink: 0;
      }

      @keyframes pulse-expand {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.15); opacity: 1; }
      }

      @keyframes pulse-contract {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.92); opacity: 0.5; }
      }

      :host([animated]) .pulse-out {
        animation: pulse-expand 4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }

      :host([animated]) .pulse-in {
        animation: pulse-contract 4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
    `,
  ];

  constructor() {
    super();
    this.mode = 'logo';
    this.size = 'md';
    this.opacity = 0.04;
    this.animated = false;
    this.position = 'center';
    this._observer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._setupGuard();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._hostGuard) {
      this._hostGuard.disconnect();
      this._hostGuard = null;
    }
  }

  /**
   * MutationObserver that watches for shadow DOM children being removed
   * (e.g. via DevTools "Delete element") and re-renders immediately.
   */
  _setupGuard() {
    // Tear down any existing observers before creating new ones
    // (prevents accumulation on re-insertion from the host guard)
    if (this._observer) { this._observer.disconnect(); }
    if (this._hostGuard) { this._hostGuard.disconnect(); }

    this._observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.removedNodes.length > 0) {
          // Something was deleted from shadow root — force re-render
          this.requestUpdate();
          break;
        }
      }
    });

    // Observe the shadow root for child removals
    this._observer.observe(this.renderRoot, {
      childList: true,
      subtree: true,
    });

    // Also watch the host element itself — if someone removes the
    // <arclight-watermark> from the light DOM, re-insert it.
    const parent = this.parentElement;
    if (parent) {
      const hostGuard = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.removedNodes) {
            if (node === this) {
              // Re-insert ourselves
              parent.appendChild(this);
              return;
            }
          }
        }
      });
      hostGuard.observe(parent, { childList: true });

      // Store so we can disconnect later
      this._hostGuard = hostGuard;
    }
  }

  render() {
    if (this.mode === 'tiled') {
      return this._renderTiled();
    }
    const px = SIZES[this.size] || SIZES.md;
    // Set CSS custom properties for the ::after fallback
    this.style.setProperty('--_wm-size', `${px}px`);
    this.style.setProperty('--_wm-opacity', String(this.opacity));
    return html`
      <div style="opacity: ${this.opacity}; width: ${px}px; height: auto;">
        ${logoWordmarkStacked}
      </div>
    `;
  }

  _renderTiled() {
    this.style.setProperty('--_wm-opacity', String(this.opacity));
    const rows = 20;
    const cols = 12;
    return html`
      <div class="tiled-wrapper" style="opacity: ${this.opacity};">
        ${Array.from({ length: rows }, (_, i) => html`
          <div class="tiled-row">
            ${Array.from({ length: cols }, () => html`
              <div style="width: 240px; height: auto; flex-shrink: 0;">${logoWordmarkInline}</div>
            `)}
          </div>
        `)}
      </div>
    `;
  }

  updated() {
    if (!this.animated || this.mode === 'tiled') return;

    const svg = this.renderRoot.querySelector('svg');
    if (!svg) return;

    const circles = svg.querySelector('#Circles');
    if (!circles) return;

    const children = [...circles.children];
    if (children[1]) { children[1].classList.add('pulse-out'); children[1].style.animationDelay = '0s'; }
    if (children[2]) { children[2].classList.add('pulse-in'); children[2].style.animationDelay = '-1s'; }
    if (children[3]) { children[3].classList.add('pulse-out'); children[3].style.animationDelay = '-2s'; }
  }
}

customElements.define('arclight-watermark', ArclightWatermark);
