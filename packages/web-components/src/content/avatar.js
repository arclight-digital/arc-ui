import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-avatar
 */
export class ArcAvatar extends LitElement {
  static properties = {
    src:       { type: String },
    name:      { type: String, reflect: true },
    size:      { type: String, reflect: true },
    shape:     { type: String, reflect: true },
    status:    { type: String, reflect: true },
    _imgState: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; position: relative; }

      .avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-full);
        border: 1px solid var(--border-default);
        overflow: hidden;
        background: var(--bg-elevated);
        transition: border-color var(--transition-base), box-shadow var(--transition-base);
        position: relative;
      }

      .avatar:hover {
        border-color: var(--border-bright);
        box-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.15);
      }

      :host([size="sm"]) .avatar { width: 32px; height: 32px; }
      :host([size="md"]) .avatar { width: 40px; height: 40px; }
      :host([size="lg"]) .avatar { width: 56px; height: 56px; }

      .avatar__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--radius-full);
        opacity: 0;
        transition: opacity var(--transition-slow);
      }

      .avatar__img.loaded { opacity: 1; }

      .avatar__shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          var(--bg-elevated) 25%,
          var(--border-subtle) 37%,
          var(--bg-elevated) 63%
        );
        background-size: 200% 100%;
        animation: avatar-shimmer 1.8s ease-in-out infinite;
        border-radius: inherit;
        transition: opacity var(--transition-slow);
      }

      .avatar__shimmer--hidden { opacity: 0; pointer-events: none; }

      @keyframes avatar-shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .avatar__initials {
        font-family: var(--font-accent);
        font-weight: 600;
        color: var(--text-primary);
        text-transform: uppercase;
        user-select: none;
      }

      /* Shape variants */
      :host([shape="square"]) .avatar,
      :host([shape="square"]) .avatar__img { border-radius: var(--radius-md); }
      :host([shape="rounded"]) .avatar,
      :host([shape="rounded"]) .avatar__img { border-radius: var(--radius-lg); }

      :host([size="sm"]) .avatar__initials { font-size: var(--text-xs); }
      :host([size="md"]) .avatar__initials { font-size: var(--text-sm); }
      :host([size="lg"]) .avatar__initials { font-size: var(--text-lg); }

      /* Status indicator */
      .avatar__status {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-radius: var(--radius-full);
        border: 2px solid var(--bg-deep);
        box-sizing: border-box;
      }

      :host([size="sm"]) .avatar__status { width: 8px; height: 8px; }
      :host([size="lg"]) .avatar__status { width: 14px; height: 14px; border-width: 3px; }

      :host([status="online"]) .avatar__status { background: var(--color-success); }
      :host([status="offline"]) .avatar__status { background: var(--text-ghost); }
      :host([status="busy"]) .avatar__status { background: var(--color-error); }
      :host([status="away"]) .avatar__status { background: var(--color-warning); }

      @media (prefers-reduced-motion: reduce) {
        .avatar__shimmer { animation: none; }
        .avatar__img { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.src = '';
    this.name = '';
    this.size = 'md';
    this.shape = 'circle';
    this.status = '';
    this._imgState = 'loading';
  }

  updated(changed) {
    if (changed.has('src') && this.src) {
      this._imgState = 'loading';
    }
  }

  /** @private */
  _getInitials() {
    return this.name ? this.name.charAt(0).toUpperCase() : '?';
  }

  _onImgLoad() {
    this._imgState = 'loaded';
  }

  _onImgError() {
    this._imgState = 'error';
  }

  render() {
    const showImg = this.src && this._imgState !== 'error';

    const content = showImg
      ? html`
        <div class="avatar__shimmer ${this._imgState === 'loaded' ? 'avatar__shimmer--hidden' : ''}" aria-hidden="true"></div>
        <img
          class="avatar__img ${this._imgState === 'loaded' ? 'loaded' : ''}"
          part="img"
          src=${this.src}
          alt=${this.name || 'Avatar'}
          @load=${this._onImgLoad}
          @error=${this._onImgError}
        />`
      : html`<span class="avatar__initials" part="initials">${this._getInitials()}</span>`;

    return html`
      <div class="avatar" part="avatar" role="img" aria-label=${this.name || 'Avatar'}>
        ${content}
      </div>
      ${this.status ? html`<span class="avatar__status" part="status" aria-label=${this.status}></span>` : ''}
    `;
  }
}
