import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-image
 */
export class ArcImage extends LitElement {
  static properties = {
    src:       { type: String },
    alt:       { type: String },
    aspect:    { type: String, reflect: true },
    fit:       { type: String, reflect: true },
    loading:   { type: String },
    fallback:  { type: String },
    _state:    { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        overflow: hidden;
        position: relative;
        border-radius: var(--radius-md);
      }

      .image-wrapper {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: inherit;
      }

      /* Aspect ratios */
      :host([aspect="1/1"]) .image-wrapper { aspect-ratio: 1/1; }
      :host([aspect="4/3"]) .image-wrapper { aspect-ratio: 4/3; }
      :host([aspect="16/9"]) .image-wrapper { aspect-ratio: 16/9; }
      :host([aspect="21/9"]) .image-wrapper { aspect-ratio: 21/9; }
      :host([aspect="3/4"]) .image-wrapper { aspect-ratio: 3/4; }
      :host([aspect="9/16"]) .image-wrapper { aspect-ratio: 9/16; }

      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity var(--transition-slow);
      }

      :host([fit="contain"]) img { object-fit: contain; }
      :host([fit="fill"]) img { object-fit: fill; }
      :host([fit="none"]) img { object-fit: none; }
      :host([fit="scale-down"]) img { object-fit: scale-down; }

      img.loaded { opacity: 1; }

      /* Shimmer skeleton */
      .shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          var(--surface-overlay) 25%,
          var(--border-subtle) 37%,
          var(--surface-overlay) 63%
        );
        background-size: 200% 100%;
        animation: image-shimmer 1.8s ease-in-out infinite;
        transition: opacity var(--transition-slow);
      }

      .shimmer--hidden { opacity: 0; pointer-events: none; }

      @keyframes image-shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* Error fallback */
      .fallback {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-overlay);
        color: var(--text-muted);
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }

      .fallback__icon {
        width: 32px;
        height: 32px;
        opacity: 0.4;
      }

      @media (prefers-reduced-motion: reduce) {
        .shimmer { animation: none; }
        img { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.src = '';
    this.alt = '';
    this.aspect = '';
    this.fit = 'cover';
    this.loading = 'lazy';
    this.fallback = '';
    this._state = 'loading'; // loading | loaded | error
  }

  updated(changed) {
    if (changed.has('src')) {
      this._state = 'loading';
    }
  }

  _onLoad() {
    this._state = 'loaded';
    this.dispatchEvent(new CustomEvent('arc-load', {
      bubbles: true,
      composed: true,
    }));
  }

  _onError() {
    this._state = 'error';
    this.dispatchEvent(new CustomEvent('arc-error', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="image-wrapper" part="wrapper">
        ${this._state === 'error'
          ? html`
            <div class="fallback" part="fallback">
              ${this.fallback
                ? html`<img src=${this.fallback} alt=${this.alt} class="loaded" style="object-fit:contain;max-width:60%;max-height:60%;" />`
                : html`<svg class="fallback__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>`
              }
            </div>
          `
          : nothing
        }
        <div class="shimmer ${this._state !== 'loading' ? 'shimmer--hidden' : ''}" aria-hidden="true"></div>
        ${this._state !== 'error'
          ? html`
            <img
              src=${this.src}
              alt=${this.alt}
              loading=${this.loading}
              class=${this._state === 'loaded' ? 'loaded' : ''}
              @load=${this._onLoad}
              @error=${this._onError}
              part="image"
            />`
          : nothing
        }
      </div>
    `;
  }
}
