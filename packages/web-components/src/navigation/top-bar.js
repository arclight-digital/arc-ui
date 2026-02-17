import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../layout/container.register.js';

/**
 * @arc-prism hybrid — display works without JS; mobile menu toggle requires JS
 */
/**
 * @tag arc-top-bar
 */
export class ArcTopBar extends LitElement {
  static properties = {
    heading:      { type: String },
    fixed:        { type: Boolean, reflect: true },
    contained:    { type: String, reflect: true },
    menuOpen:     { type: Boolean, attribute: 'menu-open', reflect: true },
    mobileMenu:   { type: String, attribute: 'mobile-menu' },
    menuPosition: { type: String, attribute: 'menu-position' },
    navAlign:     { type: String, attribute: 'nav-align' },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        width: 100%;
        z-index: 100;
      }

      :host([fixed]) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
      }

      .topbar {
        position: relative;
        height: var(--nav-height);
        background: color-mix(in srgb, var(--surface-base) 85%, transparent);
        backdrop-filter: blur(12px) saturate(130%);
        -webkit-backdrop-filter: blur(12px) saturate(130%);
        border-bottom: 1px solid var(--divider);
      }

      .topbar__content {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        height: 100%;
        padding-inline: var(--space-lg);
      }

      arc-container { height: 100%; }
      arc-container::part(container) { height: 100%; }

      :host([contained]) .topbar__content {
        padding-inline: 0;
      }

      .topbar__glow {
        position: absolute;
        bottom: -1px;
        left: 20%;
        right: 20%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(var(--accent-secondary-rgb), 0.2), rgba(var(--accent-primary-rgb), 0.15), transparent);
        opacity: 0;
        transition: opacity var(--transition-slow);
        pointer-events: none;
      }

      :host([scrolled]) .topbar__glow {
        opacity: 1;
      }

      .topbar__brand {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        color: var(--text-primary);
        text-decoration: none;
        flex: 0 0 auto;
        overflow: visible;
      }

      .topbar__heading {
        font-family: var(--font-body);
        font-size: var(--wordmark-size);
        font-weight: var(--wordmark-weight);
        letter-spacing: var(--wordmark-spacing);
        text-transform: uppercase;
      }

      .topbar__center {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .topbar__actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      .topbar__menu-btn {
        display: none;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        min-width: 36px;
        aspect-ratio: 1;
        background: none;
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        cursor: pointer;
        padding: 0;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .topbar__menu-btn:hover {
        background: var(--surface-hover);
        border-color: var(--border-default);
      }

      .topbar__menu-btn:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .topbar__menu-btn--open {
        border-color: rgba(var(--interactive-rgb), 0.3);
        background: rgba(var(--interactive-rgb), 0.06);
      }

      .topbar__hamburger {
        width: 16px;
        height: 12px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .topbar__hamburger-line {
        display: block;
        width: 100%;
        height: 1.5px;
        background: currentColor;
        border-radius: 1px; /* cosmetic rounding on 1.5px hamburger lines -- intentionally not tokenized */
        transition: transform 400ms var(--ease-out-expo), opacity 250ms ease, width 400ms var(--ease-out-expo);
        transform-origin: center;
      }

      .topbar__hamburger-line:nth-child(2) {
        width: 100%;
      }

      .topbar__menu-btn--open .topbar__hamburger-line:nth-child(1) {
        transform: translateY(5.25px) rotate(45deg);
      }

      .topbar__menu-btn--open .topbar__hamburger-line:nth-child(2) {
        opacity: 0;
        width: 0;
      }

      .topbar__menu-btn--open .topbar__hamburger-line:nth-child(3) {
        transform: translateY(-5.25px) rotate(-45deg);
      }

      @media (max-width: 900px) {
        .topbar__menu-btn { display: flex; }
      }

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
    this.heading = '';
    this.fixed = false;
    this.contained = null;
    this.menuOpen = false;
    this.mobileMenu = 'sidebar';
    this.menuPosition = 'left';
    this.navAlign = 'center';
    this._onExternalToggle = this._onExternalToggle.bind(this);
    this._onScroll = this._onScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('arc-mobile-menu-toggle', this._onExternalToggle);
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._onScroll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('arc-mobile-menu-toggle', this._onExternalToggle);
    window.removeEventListener('scroll', this._onScroll);
  }

  _onScroll() {
    this.toggleAttribute('scrolled', window.scrollY > 20);
  }

  _onExternalToggle(e) {
    if (this.mobileMenu !== 'nav') return;
    if (e.target === this) return;
    this.menuOpen = e.detail?.value ?? !this.menuOpen;
  }

  get _navJustify() {
    if (this.navAlign === 'left') return 'flex-start';
    if (this.navAlign === 'right') return 'flex-end';
    return 'center';
  }

  _toggleMenu() {
    this.menuOpen = !this.menuOpen;
    const eventName = this.mobileMenu === 'nav' ? 'arc-mobile-menu-toggle' : 'arc-sidebar-toggle';
    this.dispatchEvent(new CustomEvent(eventName, {
      detail: { value: this.menuOpen },
      bubbles: true,
      composed: true,
    }));
  }

  _renderMenuButton() {
    return html`
      <button
        class="topbar__menu-btn ${this.menuOpen ? 'topbar__menu-btn--open' : ''}"
        @click=${this._toggleMenu}
        aria-label="Toggle menu"
        aria-expanded=${this.menuOpen ? 'true' : 'false'}
        part="menu-btn"
      >
        <span class="topbar__hamburger">
          <span class="topbar__hamburger-line"></span>
          <span class="topbar__hamburger-line"></span>
          <span class="topbar__hamburger-line"></span>
        </span>
      </button>
    `;
  }

  get _containerSize() {
    if (!this.contained && this.contained !== '') return null;
    const size = this.contained || 'md';
    return ['sm', 'md', 'lg', 'xl', 'full'].includes(size) ? size : 'md';
  }

  _renderContent(menuLeft) {
    return html`
      <div class="topbar__content" part="content">
        ${menuLeft ? this._renderMenuButton() : ''}
        <a class="topbar__brand" href="/" part="brand">
          <slot name="logo"></slot>
          ${this.heading ? html`<span class="topbar__heading">${this.heading}</span>` : ''}
          <slot name="subtitle"></slot>
        </a>
        <div class="topbar__center" part="center" style="justify-content:${this._navJustify}">
          <slot name="center"></slot>
        </div>
        <div class="topbar__actions" part="actions">
          <slot name="actions"></slot>
        </div>
        ${!menuLeft ? this._renderMenuButton() : ''}
      </div>
    `;
  }

  render() {
    const menuLeft = this.menuPosition !== 'right';
    const size = this._containerSize;

    return html`
      <header class="topbar" part="topbar">
        ${size
          ? html`<arc-container size=${size}>${this._renderContent(menuLeft)}</arc-container>`
          : this._renderContent(menuLeft)
        }
        <div class="topbar__glow"></div>
      </header>
    `;
  }
}
