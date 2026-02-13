import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcAvatar extends LitElement {
  static properties = {
    src:  { type: String },
    name: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }

      .avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-full);
        border: 1px solid var(--border-default);
        overflow: hidden;
        background: var(--bg-elevated);
        transition: border-color var(--transition-base), box-shadow var(--transition-base);
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
      }

      .avatar__initials {
        font-family: var(--font-accent);
        font-weight: 600;
        color: var(--text-primary);
        text-transform: uppercase;
        user-select: none;
      }

      :host([size="sm"]) .avatar__initials { font-size: var(--text-xs); }
      :host([size="md"]) .avatar__initials { font-size: var(--text-sm); }
      :host([size="lg"]) .avatar__initials { font-size: var(--text-lg); }

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.src = '';
    this.name = '';
    this.size = 'md';
  }

  /** @private */
  _getInitials() {
    return this.name ? this.name.charAt(0).toUpperCase() : '?';
  }

  render() {
    const content = this.src
      ? html`<img class="avatar__img" part="img" src=${this.src} alt=${this.name || 'Avatar'} />`
      : html`<span class="avatar__initials" part="initials">${this._getInitials()}</span>`;

    return html`
      <div class="avatar" part="avatar" role="img" aria-label=${this.name || 'Avatar'}>
        ${content}
      </div>
    `;
  }
}

customElements.define('arc-avatar', ArcAvatar);
