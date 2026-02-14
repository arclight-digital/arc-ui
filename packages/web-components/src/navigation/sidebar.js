import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-sidebar
 * @requires arc-sidebar-section
 * @requires arc-sidebar-link
 */
export class ArcSidebar extends LitElement {
  static properties = {
    active:    { type: String, reflect: true },
    collapsed: { type: Boolean, reflect: true },
    position:  { type: String, reflect: true },
    width:     { type: String },
    glow:      { type: Boolean, reflect: true },
    _sections: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        position: sticky;
        top: var(--nav-height);
        height: calc(100vh - var(--nav-height));
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
      }

      :host([collapsed]) { width: 0; overflow: hidden; }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        padding: var(--space-xl) var(--space-lg);
        min-height: 100%;
        position: relative;
        box-sizing: border-box;
      }

      /* Ambient glow — faint accent bleed from the right edge */
      :host([glow]) .sidebar::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 80%;
        height: 50%;
        background: radial-gradient(
          ellipse at 100% 10%,
          rgba(var(--accent-primary-rgb), 0.03),
          transparent 60%
        );
        pointer-events: none;
      }

      /* Border line — solid default (right edge) */
      .sidebar::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 1px;
        background: var(--border-subtle);
      }

      /* Right position — border on left edge */
      :host([position="right"]) .sidebar::after {
        right: auto;
        left: 0;
      }

      :host([position="right"][glow]) .sidebar::before {
        right: auto;
        left: 0;
        background: radial-gradient(
          ellipse at 0% 10%,
          rgba(var(--accent-primary-rgb), 0.03),
          transparent 60%
        );
      }

      /* Glow border variant */
      :host([glow]) .sidebar::after {
        background: var(--glow-line-blue);
        opacity: 0.6;
      }

      /* ── Section ── */
      .sidebar__section {
        display: flex;
        flex-direction: column;
      }

      /* ── Static heading (non-collapsible) ── */
      .sidebar__heading {
        display: block;
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        padding: var(--space-xs) var(--space-sm);
        margin-bottom: var(--space-xs);
      }

      /* ── Collapsible heading (toggle) ── */
      .sidebar__toggle {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        padding: var(--space-sm);
        margin-bottom: 2px; /* cosmetic micro-spacing */
        border-radius: var(--radius-sm);
        border: none;
        background: none;
        cursor: pointer;
        user-select: none;
        transition: background var(--transition-fast);
        width: 100%;
        text-align: left;
      }

      .sidebar__toggle:hover {
        background: var(--bg-hover);
      }

      .sidebar__toggle:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .sidebar__toggle-label {
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .sidebar__toggle-count {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        font-weight: 400;
        letter-spacing: 0;
        color: var(--text-ghost);
        -webkit-text-fill-color: var(--text-ghost);
        margin-left: auto;
      }

      .sidebar__chevron {
        color: var(--text-ghost);
        flex-shrink: 0;
        transition: transform 150ms ease;
        -webkit-text-fill-color: unset;
      }

      .sidebar__chevron--closed {
        transform: rotate(-90deg);
      }

      /* ── Links container ── */
      .sidebar__links {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      .sidebar__links--hidden {
        display: none;
      }

      /* ── Link ── */
      .sidebar__link {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: 400;
        color: var(--text-muted);
        text-decoration: none;
        padding: var(--touch-pad) var(--space-md) var(--touch-pad) calc(var(--space-sm) + 4px);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition:
          color var(--transition-fast),
          background var(--transition-fast),
          box-shadow var(--transition-fast);
        border: none;
        background: none;
        text-align: left;
      }

      .sidebar__link-arrow {
        opacity: 0;
        color: var(--text-ghost);
        font-size: var(--text-sm);
        flex-shrink: 0;
        transition: opacity var(--transition-fast), transform var(--transition-fast), color var(--transition-fast);
        transform: translateX(-2px);
      }

      .sidebar__link:hover .sidebar__link-arrow {
        opacity: 1;
        transform: translateX(0);
        color: var(--text-secondary);
      }

      .sidebar__link[aria-current="page"] .sidebar__link-arrow {
        opacity: 1;
        transform: translateX(0);
        color: var(--accent-primary);
      }

      .sidebar__link:hover {
        color: var(--text-primary);
        background: var(--bg-hover);
      }

      /* Active link */
      .sidebar__link[aria-current="page"] {
        color: var(--accent-primary);
        background: var(--accent-primary-subtle);
        font-weight: 500;
      }

      :host([glow]) .sidebar__link[aria-current="page"] {
        box-shadow: inset 6px 0 12px -6px rgba(var(--accent-primary-rgb), 0.15);
      }

      .sidebar__link:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .sidebar__slot-host { display: none; }

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
    this.active = '';
    this.collapsed = false;
    this.position = 'left';
    this.width = '260px';
    this.glow = false;
    this._sections = [];
  }

  _onSlotChange(e) {
    this._sections = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-SIDEBAR-SECTION');
    this.requestUpdate();
  }

  _handleClick(e, href) {
    this.active = href;
    const nav = new CustomEvent('arc-navigate', {
      detail: { href },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(nav);
    // If a listener handled navigation (e.g. SPA router), prevent the <a> default
    if (nav.defaultPrevented) {
      e.preventDefault();
    }
  }

  _toggleSection(section) {
    section.toggle();
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="sidebar__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <nav class="sidebar" part="sidebar" aria-label="Sidebar navigation">
        ${this._sections.map((section) => {
          const links = section.links;
          const isCollapsible = section.collapsible;
          const isOpen = section.open;

          return html`
            <div class="sidebar__section" part="section">
              ${section.heading
                ? isCollapsible
                  ? html`
                    <button
                      class="sidebar__toggle"
                      @click=${() => this._toggleSection(section)}
                      aria-expanded=${String(isOpen)}
                      part="toggle"
                    >
                      <span class="sidebar__toggle-label">${section.heading}</span>
                      <span class="sidebar__toggle-count">${links.length}</span>
                      <svg class="sidebar__chevron ${isOpen ? '' : 'sidebar__chevron--closed'}" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                        <path d="M4.5 6L8 9.5L11.5 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>`
                  : html`<div class="sidebar__heading" part="heading">${section.heading}</div>`
                : ''
              }
              <div class="sidebar__links ${!isOpen && isCollapsible ? 'sidebar__links--hidden' : ''}" part="links">
                ${links.map((link) => html`
                  <a
                    class="sidebar__link"
                    href=${link.href}
                    aria-current=${(this.active === link.href || link.active) ? 'page' : 'false'}
                    @click=${(e) => this._handleClick(e, link.href)}
                    part="link"
                  >
                    <span>${link.label}</span>
                    <svg class="sidebar__link-arrow" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                      <path d="M6 4L10 8L6 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </a>
                `)}
              </div>
            </div>
          `;
        })}
      </nav>
    `;
  }
}
