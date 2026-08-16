import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { breakpoints } from '../generated/breakpoints.js';
import { lockScroll, unlockScroll } from '../shared/scroll-lock.js';
import { trapTabKey, focusFirst, deepActiveElement } from '../shared/focus-trap.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Full-page layout scaffold that composes a TopBar, Sidebar, and scrollable content area into a
 * cohesive application frame. Handles responsive collapse, sidebar toggling, and optional
 * table-of-contents rail out of the box.
 *
 * @tag arc-app-shell
 * @status stable
 * @prop {boolean} sidebarOpen - Controls whether the sidebar is visible on mobile viewports (below 768 px). On desktop the sidebar is always shown regardless of this attribute. Toggle it from a hamburger button in your TopBar to give mobile users access to navigation.
 * @prop {number} breakpoint - Viewport width in pixels at which the layout switches between mobile and desktop modes.
 * @fires {CustomEvent<{ value: boolean }>} arc-sidebar-toggle - Fired when the shell itself opens or closes the mobile sidebar — on a backdrop click, on Escape, or on navigation. Listened to by arc-top-bar so its hamburger stays in step. Not fired for a toggle the shell merely received, so the two cannot echo each other.
 * @slot topbar
 * @slot sidebar
 * @slot - Default content.
 * @slot toc
 * @csspart shell
 * @csspart body
 * @csspart sidebar
 * @csspart main
 * @csspart content
 * @csspart toc
 */
export class ArcAppShell extends DeclaredPropsMixin(LitElement) {
  static properties = {
    sidebarOpen: flag(false, { attribute: 'sidebar-open' }),
    breakpoint: { type: Number },
    _mobile: { state: true },
    _hasToc: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        min-height: 100vh;
        background: var(--surface-base);
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
        width: 280px;
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
        max-width: 280px;
        position: sticky;
        top: calc(var(--nav-height) + var(--space-xl));
        align-self: flex-start;
        max-height: calc(100vh - var(--nav-height) - 2 * var(--space-xl));
        overflow-y: auto;
        /* Zero, not --space-md on the bottom only. The border below is drawn
           down the padding box, so an unmatched bottom pad made the line
           overhang the last entry with nothing balancing it above. Evened up by
           removing the pad rather than by adding one on top, which would have
           pushed the panel out of line with the article beside it. */
        padding-block: 0;
        padding-inline: 0 var(--space-lg);
        margin-bottom: var(--space-xl);
        border-inline-start: 1px solid var(--border-subtle);
      }

      .shell__toc--empty { display: none; }

      @media (max-width: 1280px) { /* --breakpoint-xl */
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
        inset-inline-start: 0;
        bottom: 0;
        z-index: 99;
        height: auto;
        width: 300px;
        max-width: 85vw;
        transform: translateX(-100%);
        /* visibility, not transform alone. Translated off-screen the drawer is
           still visible to the browser, so its links stay in the tab order and
           in the accessibility tree — 176 of them on a docs page, all invisible,
           every one of them ahead of the content on a mobile keyboard.
           Transitioned rather than set flat so the discrete flip lands at the
           *end* of the slide out and at the start of the slide in, which is the
           same delay-hide the overlays use for their backdrops. */
        visibility: hidden;
        transition:
          transform 250ms var(--ease-out-expo),
          visibility 250ms var(--ease-out-expo);
        background: var(--surface-primary);
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
        visibility: visible;
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
        background: var(--overlay-backdrop);
        opacity: 0;
        visibility: hidden;
        transition:
          opacity var(--transition-base),
          visibility var(--transition-base);
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
    // The same width the top bar reveals its hamburger at, and the nav menu
    // collapses at — this shell's sidebar has to switch to its drawer on the
    // same line, or the button is there with nothing to open.
    this.breakpoint = breakpoints.navCollapse;
    this._mobile = false;
    this._hasToc = false;
    this._returnFocus = null;
    this._onToggle = this._onToggle.bind(this);
    this._onNavigate = this._onNavigate.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('arc-sidebar-toggle', this._onToggle);
    this.addEventListener('arc-navigate', this._onNavigate);
    document.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._onResize);
    this._checkMobile();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('arc-sidebar-toggle', this._onToggle);
    this.removeEventListener('arc-navigate', this._onNavigate);
    document.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onResize);
    unlockScroll(this);
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
        if (this.sidebarOpen) {
          lockScroll(this);
          // Remember where focus came from before moving it, so closing can put
          // it back on the hamburger rather than at the top of the document.
          this._returnFocus = deepActiveElement();
          const drawer = this.shadowRoot?.querySelector('.shell__sidebar');
          // After the visibility flip, or there is nothing focusable to land on.
          if (drawer) requestAnimationFrame(() => focusFirst(drawer));
        } else {
          unlockScroll(this);
          this._returnFocus?.focus?.();
          this._returnFocus = null;
        }
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
    // Fired by arc-top-bar's hamburger — and, on the way back out, by us. The
    // guard is what stops _setOpen's notification from re-entering here.
    if (e.target === this) return;
    this.sidebarOpen = e.detail?.value ?? !this.sidebarOpen;
  }

  /**
   * Close (or open) and say so.
   *
   * The drawer can be dismissed four ways — the hamburger, the backdrop,
   * Escape, following a link — and only the first of them used to be visible to
   * arc-top-bar. Dismiss it any other way and the button kept `menu-open`: it
   * reported aria-expanded="true" with nothing expanded, and sat there showing
   * a close icon for a drawer that had already gone.
   */
  _setOpen(value) {
    if (this.sidebarOpen === value) return;
    this.sidebarOpen = value;
    this.dispatchEvent(
      new CustomEvent('arc-sidebar-toggle', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onNavigate(e) {
    // Auto-close sidebar on navigation in mobile mode
    if (this._mobile && this.sidebarOpen) {
      this._setOpen(false);
    }
  }

  _onKeyDown(e) {
    if (!this._mobile || !this.sidebarOpen) return;
    if (e.key === 'Escape') {
      this._setOpen(false);
      return;
    }
    // An open drawer is a modal surface: it has a backdrop, it locks scroll and
    // Escape dismisses it. Tab has to stay inside it, or focus walks off into
    // the page behind the backdrop, where it cannot be seen.
    if (e.key === 'Tab') {
      const drawer = this.shadowRoot?.querySelector('.shell__sidebar');
      if (drawer) trapTabKey(e, drawer);
    }
  }

  _backdropClick() {
    this._setOpen(false);
  }

  _onTocSlotChange(e) {
    const nodes = e.target.assignedElements({ flatten: true });
    this._hasToc = nodes.some((n) => n.children.length > 0 || n.textContent.trim());
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
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
