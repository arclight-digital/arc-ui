import { LitElement, html, css, render as litRender } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import './nav-item.js';

export class ArcNavigationMenu extends LitElement {
  static properties = {
    _items:              { state: true },
    _openIndex:          { state: true },
    _mobileOpen:         { state: true },
    _mobileClosing:      { state: true },
    _mobileExpandedIndex: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        position: relative;
        font-family: var(--font-body);
      }

      .nav {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .nav__item {
        position: relative;
        display: flex;
        align-items: center;
      }

      .nav__trigger {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
        background: transparent;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: var(--space-sm) calc(var(--space-sm) + var(--space-xs));
        cursor: pointer;
        text-decoration: none;
        transition: color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        white-space: nowrap;
      }

      .nav__trigger:hover,
      .nav__trigger--open {
        color: var(--text-primary);
        background: var(--bg-hover);
        border-color: var(--border-default);
      }

      .nav__trigger--active {
        color: var(--accent-primary);
        background: rgba(var(--accent-primary-rgb), 0.06);
        border-color: rgba(var(--accent-primary-rgb), 0.3);
        box-shadow: inset 0 0 8px rgba(var(--accent-primary-rgb), 0.06), 0 0 8px rgba(var(--accent-primary-rgb), 0.08);
      }

      .nav__trigger--active:hover {
        border-color: rgba(var(--accent-primary-rgb), 0.5);
        box-shadow: inset 0 0 8px rgba(var(--accent-primary-rgb), 0.08), 0 0 12px rgba(var(--accent-primary-rgb), 0.12);
      }

      .nav__trigger--muted {
        color: var(--text-muted);
        font-weight: 500;
        border-color: transparent;
      }

      .nav__trigger--muted:hover {
        color: var(--text-secondary);
        background: transparent;
        border-color: transparent;
      }

      .nav__trigger:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .nav__chevron {
        display: inline-block;
        width: 10px;
        height: 10px;
        transition: transform var(--transition-fast);
      }

      .nav__chevron--open {
        transform: rotate(180deg);
      }

      .nav__dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        min-width: 280px;
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm);
        box-shadow: var(--shadow-overlay);
        z-index: 1000;
        opacity: 0;
        transform: translateY(4px);
        pointer-events: none;
        transition: opacity var(--transition-fast), transform var(--transition-fast);
      }

      .nav__dropdown--open {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .nav__dropdown-item {
        display: block;
        text-align: left;
        background: none;
        border: none;
        padding: var(--touch-pad) var(--space-md);
        min-height: var(--touch-min);
        border-radius: var(--radius-sm);
        cursor: pointer;
        text-decoration: none;
        color: var(--text-primary);
        transition: background var(--transition-fast);
      }

      .nav__dropdown-item:hover {
        background: rgba(var(--accent-primary-rgb), 0.08);
      }

      .nav__dropdown-item:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .nav__dropdown-label {
        display: block;
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 2px; /* cosmetic micro-spacing */
      }

      .nav__dropdown-desc {
        display: block;
        font-size: var(--text-sm);
        color: var(--text-muted);
        line-height: 1.4;
      }

      .nav__slot-host { display: none; }

      /* ── Mobile panel ── */
      @media (max-width: 900px) {
        .nav { display: none; }
      }

      .mobile-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        top: var(--nav-height);
        background: var(--overlay-backdrop);
        z-index: 98;
      }

      .mobile-backdrop--open {
        display: block;
        animation: mobile-fade-in var(--duration-enter) var(--ease-out-expo) both;
      }

      .mobile-backdrop--closing {
        display: block;
        animation: mobile-fade-out var(--duration-exit) ease-in both;
      }

      .mobile-panel {
        display: none;
        position: fixed;
        top: var(--nav-height);
        left: 0;
        right: 0;
        max-height: 0;
        overflow: hidden;
        overscroll-behavior: contain;
        background: color-mix(in srgb, var(--bg-deep) 92%, transparent);
        backdrop-filter: blur(12px) saturate(130%);
        -webkit-backdrop-filter: blur(12px) saturate(130%);
        border-bottom: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-lg);
        z-index: 99;
      }

      .mobile-panel--open {
        display: block;
        overflow-x: hidden;
        overflow-y: auto;
        animation: mobile-slide-in var(--duration-enter) var(--ease-out-expo) both;
      }

      .mobile-panel--closing {
        display: block;
        animation: mobile-slide-out var(--duration-exit) ease-in both;
      }

      .mobile-panel--open .mobile-item {
        animation: mobile-item-in 400ms var(--ease-out-expo) both;
      }

      .mobile-panel--closing .mobile-item {
        animation: mobile-item-out var(--duration-exit) ease-in both;
      }

      @keyframes mobile-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes mobile-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @keyframes mobile-slide-in {
        from { max-height: 0; opacity: 0; }
        to { max-height: calc(100dvh - var(--nav-height)); opacity: 1; }
      }

      @keyframes mobile-slide-out {
        from { max-height: calc(100dvh - var(--nav-height)); opacity: 1; }
        to { max-height: 0; opacity: 0; }
      }

      @keyframes mobile-item-in {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes mobile-item-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-8px); }
      }

      .mobile-glow {
        height: 2px;
        background: var(--glow-line-gradient);
      }

      .mobile-list {
        list-style: none;
        margin: 0;
        padding: var(--space-sm) 0;
      }

      .mobile-item {
        border-bottom: 1px solid var(--border-subtle);
      }

      .mobile-item:last-child {
        border-bottom: none;
      }

      .mobile-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--space-md) var(--space-lg);
        min-height: var(--touch-min);
        background: none;
        border: none;
        color: var(--text-primary);
        font-family: var(--font-accent);
        font-size: var(--section-title-size);
        font-weight: var(--section-title-weight);
        letter-spacing: var(--section-title-spacing);
        text-transform: uppercase;
        text-decoration: none;
        cursor: pointer;
        transition: background var(--transition-fast);
      }

      .mobile-trigger:hover {
        background: var(--bg-hover);
      }

      .mobile-trigger--active {
        color: var(--accent-primary);
        background: rgba(var(--accent-primary-rgb), 0.06);
      }

      .mobile-trigger--active:hover {
        background: rgba(var(--accent-primary-rgb), 0.1);
      }

      .mobile-trigger--muted {
        color: var(--text-muted);
        font-weight: 400;
      }

      .mobile-trigger--muted:hover {
        color: var(--text-secondary);
      }

      .mobile-chevron {
        width: 12px;
        height: 12px;
        transition: transform var(--transition-fast);
        flex-shrink: 0;
      }

      .mobile-chevron--open {
        transform: rotate(180deg);
      }

      .mobile-children {
        max-height: 0;
        overflow: hidden;
        transition: max-height var(--transition-slow);
      }

      .mobile-children--open {
        max-height: 500px;
      }

      .mobile-child {
        display: block;
        padding: var(--space-sm) var(--space-lg) var(--space-sm) var(--space-xl);
        min-height: var(--touch-min);
        text-decoration: none;
        color: var(--text-primary);
        font-weight: 400;
        font-size: var(--body-size);
        transition: background var(--transition-fast);
        cursor: pointer;
      }

      .mobile-child:hover {
        background: rgba(var(--accent-primary-rgb), 0.08);
      }

      .mobile-child-label {
        display: block;
      }

      .mobile-child-desc {
        display: block;
        font-size: var(--text-sm);
        color: var(--text-muted);
        line-height: 1.4;
        margin-top: 2px; /* cosmetic micro-spacing */
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
    this._items = [];
    this._openIndex = -1;
    this._mobileOpen = false;
    this._mobileClosing = false;
    this._mobileExpandedIndex = -1;
    this._closeTimeout = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onMobileToggle = this._onMobileToggle.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onPanelAnimEnd = this._onPanelAnimEnd.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('arc-mobile-menu-toggle', this._onMobileToggle);
    window.addEventListener('resize', this._onResize);
    this._createPortal();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('arc-mobile-menu-toggle', this._onMobileToggle);
    window.removeEventListener('resize', this._onResize);
    clearTimeout(this._closeTimeout);
    this._unlockScroll();
    this._destroyPortal();
  }

  _createPortal() {
    this._portal = document.createElement('div');
    this._portal.setAttribute('data-arc-nav-portal', '');
    this._portalRoot = this._portal.attachShadow({ mode: 'open' });
    document.body.appendChild(this._portal);
  }

  _destroyPortal() {
    if (this._portal?.parentNode) {
      this._portal.parentNode.removeChild(this._portal);
    }
    this._portal = null;
    this._portalRoot = null;
  }

  _onSlotChange(e) {
    this._items = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-NAV-ITEM');
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') {
      if (this._mobileOpen) {
        this._closeMobile();
        return;
      }
      if (this._openIndex >= 0) {
        this._close();
        const triggers = this.shadowRoot.querySelectorAll('.nav__trigger');
        triggers[this._openIndex]?.focus();
      }
    }
  }

  /* ── Desktop dropdown ── */

  _open(index) {
    clearTimeout(this._closeTimeout);
    this._openIndex = index;
  }

  _close() {
    this._openIndex = -1;
  }

  _scheduleClose() {
    clearTimeout(this._closeTimeout);
    this._closeTimeout = setTimeout(() => this._close(), 150);
  }

  _cancelClose() {
    clearTimeout(this._closeTimeout);
  }

  _navigate(e, href, item) {
    this._close();
    if (this._mobileOpen) this._closeMobile();
    const nav = new CustomEvent('arc-navigate', {
      detail: { href, item: { label: item.label, href: item.href, description: item.description } },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(nav);
    if (nav.defaultPrevented) {
      e.preventDefault();
    }
  }

  _handleTriggerClick(e, item, index) {
    if (item.hasChildren) {
      if (this._openIndex === index) {
        this._close();
      } else {
        this._open(index);
      }
    } else if (item.href) {
      this._navigate(e, item.href, item);
    }
  }

  /* ── Mobile panel ── */

  _onMobileToggle(e) {
    const shouldOpen = e.detail?.value ?? !this._mobileOpen;
    if (shouldOpen) {
      this._openMobile();
    } else {
      this._closeMobile();
    }
  }

  _onResize() {
    if (window.innerWidth > 900 && this._mobileOpen) {
      this._closeMobile();
    }
  }

  _openMobile() {
    if (this._mobileOpen) return;
    this._mobileOpen = true;
    this._lockScroll();
  }

  _closeMobile() {
    if (!this._mobileOpen || this._mobileClosing) return;
    this._mobileClosing = true;
    this._mobileExpandedIndex = -1;
    document.dispatchEvent(new CustomEvent('arc-mobile-menu-toggle', {
      detail: { value: false },
    }));
  }

  _onPanelAnimEnd(e) {
    if (e.animationName === 'mobile-slide-out') {
      this._mobileOpen = false;
      this._mobileClosing = false;
      this._unlockScroll();
    }
  }

  _lockScroll() {
    document.body.style.overflow = 'hidden';
  }

  _unlockScroll() {
    document.body.style.overflow = '';
  }

  _onBackdropClick() {
    this._closeMobile();
  }

  updated() {
    super.updated();
    this._renderPortal();
  }

  _renderPortal() {
    if (!this._portalRoot) return;
    if (!this._portalStyled) {
      const sheet = new CSSStyleSheet();
      const cssTexts = (this.constructor.elementStyles || [])
        .map(s => s.cssText ?? s.toString());
      sheet.replaceSync(cssTexts.join('\n'));
      this._portalRoot.adoptedStyleSheets = [sheet];
      this._portalStyled = true;
    }
    litRender(this._renderMobileOverlay(), this._portalRoot);
  }

  _toggleMobileDropdown(index) {
    this._mobileExpandedIndex = this._mobileExpandedIndex === index ? -1 : index;
  }

  _handleMobileTriggerClick(e, item, index) {
    if (item.hasChildren) {
      this._toggleMobileDropdown(index);
    } else if (item.href) {
      this._navigate(e, item.href, item);
    }
  }

  render() {
    return html`
      <div class="nav__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <nav class="nav" part="nav" aria-label="Navigation menu">
        ${this._items.map((item, i) => {
          const hasChildren = item.hasChildren;
          const isOpen = this._openIndex === i;

          return html`
            <div
              class="nav__item"
              @mouseenter=${hasChildren ? () => this._open(i) : null}
              @mouseleave=${hasChildren ? () => this._scheduleClose() : null}
              part="item"
            >
              ${hasChildren ? html`
                <button
                  class="nav__trigger nav__trigger--has-children ${isOpen ? 'nav__trigger--open' : ''} ${item.active ? 'nav__trigger--active' : ''} ${item.muted ? 'nav__trigger--muted' : ''}"
                  @click=${(e) => this._handleTriggerClick(e, item, i)}
                  aria-expanded=${String(isOpen)}
                  aria-haspopup="true"
                  part="trigger"
                >
                  ${item.label}
                  <svg class="nav__chevron ${isOpen ? 'nav__chevron--open' : ''}" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              ` : html`
                <a
                  class="nav__trigger ${item.active ? 'nav__trigger--active' : ''} ${item.muted ? 'nav__trigger--muted' : ''}"
                  href=${item.href}
                  @click=${(e) => this._handleTriggerClick(e, item, i)}
                  part="trigger"
                >
                  ${item.label}
                </a>
              `}

              ${hasChildren ? html`
                <div
                  class="nav__dropdown ${isOpen ? 'nav__dropdown--open' : ''}"
                  @mouseenter=${() => this._cancelClose()}
                  @mouseleave=${() => this._scheduleClose()}
                  role="menu"
                  part="dropdown"
                >
                  ${item.children.map(child => html`
                    <a
                      class="nav__dropdown-item"
                      href=${child.href}
                      role="menuitem"
                      @click=${(e) => this._navigate(e, child.href, child)}
                      part="dropdown-item"
                    >
                      <span class="nav__dropdown-label">${child.label}</span>
                      ${child.description ? html`
                        <span class="nav__dropdown-desc">${child.description}</span>
                      ` : ''}
                    </a>
                  `)}
                </div>
              ` : ''}
            </div>
          `;
        })}
      </nav>

    `;
  }

  _renderMobileOverlay() {
    return html`
      <div
        class="mobile-backdrop ${this._mobileOpen && !this._mobileClosing ? 'mobile-backdrop--open' : ''} ${this._mobileClosing ? 'mobile-backdrop--closing' : ''}"
        @click=${this._onBackdropClick}
      ></div>
      <div
        class="mobile-panel ${this._mobileOpen && !this._mobileClosing ? 'mobile-panel--open' : ''} ${this._mobileClosing ? 'mobile-panel--closing' : ''}"
        @animationend=${this._onPanelAnimEnd}
      >
        <div class="mobile-glow"></div>
        <ul class="mobile-list">
          ${this._items.map((item, i) => {
            const hasChildren = item.hasChildren;
            const isExpanded = this._mobileExpandedIndex === i;

            return html`
              <li class="mobile-item" style="animation-delay: ${i * 60}ms">
                ${hasChildren ? html`
                  <button
                    class="mobile-trigger ${item.active ? 'mobile-trigger--active' : ''} ${item.muted ? 'mobile-trigger--muted' : ''}"
                    @click=${() => this._toggleMobileDropdown(i)}
                    aria-expanded=${String(isExpanded)}
                  >
                    ${item.label}
                    <svg class="mobile-chevron ${isExpanded ? 'mobile-chevron--open' : ''}" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <div class="mobile-children ${isExpanded ? 'mobile-children--open' : ''}">
                    ${item.children.map(child => html`
                      <a
                        class="mobile-child"
                        href=${child.href}
                        @click=${(e) => this._navigate(e, child.href, child)}
                      >
                        <span class="mobile-child-label">${child.label}</span>
                        ${child.description ? html`
                          <span class="mobile-child-desc">${child.description}</span>
                        ` : ''}
                      </a>
                    `)}
                  </div>
                ` : html`
                  <a
                    class="mobile-trigger ${item.active ? 'mobile-trigger--active' : ''} ${item.muted ? 'mobile-trigger--muted' : ''}"
                    href=${item.href}
                    @click=${(e) => this._handleMobileTriggerClick(e, item, i)}
                  >
                    ${item.label}
                  </a>
                `}
              </li>
            `;
          })}
        </ul>
      </div>
    `;
  }
}

customElements.define('arc-navigation-menu', ArcNavigationMenu);
