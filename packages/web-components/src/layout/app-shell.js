import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-app-shell
 */
export class ArcAppShell extends LitElement {
  static properties = {
    sidebarOpen:  { type: Boolean, reflect: true, attribute: 'sidebar-open' },
    breakpoint:   { type: Number },
    _mobile:      { state: true },
    _hasToc:      { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        min-height: 100vh;
        background: var(--bg-deep);
        color: var(--text-primary);
      }

      .shell {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      /* Topbar sits above everything */
      .shell__topbar {
        position: relative;
        z-index: 200;
      }

      .shell__body {
        display: flex;
        flex: 1;
        padding-top: var(--nav-height);
      }

      /* ── Desktop sidebar ── */
      .shell__sidebar {
        flex-shrink: 0;
        width: 260px;
        position: sticky;
        top: var(--nav-height);
        height: calc(100vh - var(--nav-height));
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 1;
      }

      .shell__main {
        flex: 1;
        min-width: 0;
        display: flex;
      }

      .shell__content {
        flex: 3;
        min-width: 0;
        padding: var(--space-xl) var(--space-xl);
      }

      .shell__toc {
        flex: 1;
        min-width: 0;
        max-width: 260px;
        position: sticky;
        top: calc(var(--nav-height) + var(--space-xl));
        align-self: flex-start;
        max-height: calc(100vh - var(--nav-height) - 2 * var(--space-xl));
        overflow-y: auto;
        padding: 0 var(--space-lg) var(--space-md) 0;
        margin-bottom: var(--space-xl);
        border-left: 1px solid var(--border-subtle);
      }

      .shell__toc--empty { display: none; }

      @media (max-width: 1280px) {
        .shell__toc { display: none; }
      }

      :host([mobile]) .shell__toc {
        margin-bottom: var(--space-xl);
      }

      :host([mobile]) .shell__content {
        padding: var(--space-lg);
      }

      /* ── Mobile overlay ── */
      :host([mobile]) .shell__sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 99;
        height: auto;
        width: 300px;
        max-width: 85vw;
        transform: translateX(-100%);
        transition: transform 250ms var(--ease-out-expo);
        background: var(--bg-surface);
        padding-top: var(--nav-height);
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
      }

      /* Override arc-sidebar's own sticky/height — the shell wrapper handles it */
      ::slotted(arc-sidebar) {
        position: static !important;
        height: auto !important;
        overflow: visible !important;
        width: 100% !important;
      }

      :host([mobile][sidebar-open]) .shell__sidebar {
        transform: translateX(0);
      }

      /* Backdrop */
      .shell__backdrop {
        display: none;
      }

      :host([mobile]) .shell__backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 97;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 200ms ease,
          visibility 200ms ease;
        -webkit-backdrop-filter: blur(2px);
        backdrop-filter: blur(2px);
      }

      :host([mobile][sidebar-open]) .shell__backdrop {
        opacity: 1;
        visibility: visible;
      }

      /* Body scroll lock when open */
      @media (prefers-reduced-motion: reduce) {
        :host([mobile]) .shell__sidebar {
          transition: none;
        }
        :host([mobile]) .shell__backdrop {
          transition: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.sidebarOpen = false;
    this.breakpoint = 900;
    this._mobile = false;
    this._hasToc = false;
    this._onToggle = this._onToggle.bind(this);
    this._onNavigate = this._onNavigate.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('arc-toggle', this._onToggle);
    this.addEventListener('arc-navigate', this._onNavigate);
    document.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._onResize);
    this._checkMobile();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('arc-toggle', this._onToggle);
    this.removeEventListener('arc-navigate', this._onNavigate);
    document.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onResize);
    document.body.style.overflow = '';
  }

  updated(changed) {
    if (changed.has('_mobile')) {
      if (this._mobile) {
        this.setAttribute('mobile', '');
      } else {
        this.removeAttribute('mobile');
        // Close sidebar when switching to desktop
        this.sidebarOpen = false;
      }
    }
    if (changed.has('sidebarOpen')) {
      if (this._mobile) {
        document.body.style.overflow = this.sidebarOpen ? 'hidden' : '';
      }
    }
  }

  _checkMobile() {
    this._mobile = window.innerWidth <= this.breakpoint;
  }

  _onResize() {
    this._checkMobile();
  }

  _onToggle(e) {
    // Fired by arc-top-bar hamburger
    this.sidebarOpen = !this.sidebarOpen;
  }

  _onNavigate(e) {
    // Auto-close sidebar on navigation in mobile mode
    if (this._mobile && this.sidebarOpen) {
      this.sidebarOpen = false;
    }
  }

  _onKeyDown(e) {
    if (e.key === 'Escape' && this._mobile && this.sidebarOpen) {
      this.sidebarOpen = false;
    }
  }

  _backdropClick() {
    this.sidebarOpen = false;
  }

  _onTocSlotChange(e) {
    const nodes = e.target.assignedElements({ flatten: true });
    this._hasToc = nodes.some(n => n.children.length > 0 || n.textContent.trim());
  }

  render() {
    return html`
      <div class="shell" part="shell">
        <div class="shell__topbar"><slot name="topbar"></slot></div>
        <div class="shell__body" part="body">
          <div class="shell__backdrop" @click=${this._backdropClick}></div>
          <div class="shell__sidebar" part="sidebar">
            <slot name="sidebar"></slot>
          </div>
          <div class="shell__main" part="main">
            <div class="shell__content" part="content">
              <slot></slot>
            </div>
            <div class="shell__toc ${this._hasToc ? '' : 'shell__toc--empty'}" part="toc">
              <slot name="toc" @slotchange=${this._onTocSlotChange}></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
