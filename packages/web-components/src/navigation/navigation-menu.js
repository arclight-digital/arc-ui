import { LitElement, html, css, render as litRender } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { breakpoints } from '../generated/breakpoints.js';
import { lockScroll, unlockScroll } from '../shared/scroll-lock.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';

/**
 * Horizontal navigation bar with hover-triggered dropdown sub-menus and full keyboard
 * accessibility. Designed for marketing sites, documentation hubs, and product landing pages where
 * top-level sections expand into categorised link lists.
 *
 * @tag arc-navigation-menu
 * @requires arc-nav-item
 * @fires arc-navigate - Fired when a navigation item is selected
 * @fires {CustomEvent<{ value: boolean }>} arc-mobile-menu-toggle - Fired when the mobile hamburger button is clicked. Bubbles composed from the host, so listening on the element or on document both work.
 * @slot - Default content.
 * @csspart nav
 * @csspart item
 * @csspart trigger
 * @csspart dropdown
 * @csspart dropdown-item
 */
export class ArcNavigationMenu extends LitElement {
  static properties = {
    label: { type: String },
    _items: { state: true },
    _openIndex: { state: true },
    _mobileOpen: { state: true },
    _mobileClosing: { state: true },
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
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        --_trigger-ls: 2px;
        letter-spacing: var(--_trigger-ls);
        text-transform: uppercase;
        color: var(--text-muted);
        background: transparent;
        /* --border-default, not --border-subtle: this is a standalone control
           floating on a bar, not a hairline between rows, and subtle put its
           outline within a point of the background. */
        border: 1px solid var(--border-default);
        /* Pill, like every other standalone control in a top bar — the buttons,
           the version badge, the icon-only toggles. The dropdown rows and the
           mobile panel links below keep --radius-sm: those are rows inside a
           container, the same class of thing as a sidebar link, and rounding
           them would make a list read as a pile of separate objects. */
        border-radius: var(--radius-full);
        /* The inline padding is asymmetric by half the letter-spacing, which is
           what puts the word in the middle rather than merely putting its *box*
           there. letter-spacing adds its 2px after the final letter too, and
           that trailing space is inside the box being centered — so the glyphs
           end up sitting half of it, 1px, to the left. Derived from the same
           custom property the letter-spacing uses, so the two cannot drift. */
        padding-block: var(--space-sm);
        padding-inline:
          calc(var(--space-sm) + var(--space-xs) + var(--_trigger-ls) / 2)
          calc(var(--space-sm) + var(--space-xs) - var(--_trigger-ls) / 2);
        cursor: pointer;
        text-decoration: none;
        transition:
          color var(--transition-fast),
          background var(--transition-fast),
          border-color var(--transition-fast),
          box-shadow var(--transition-fast),
          transform 120ms var(--ease-out-expo);
        white-space: nowrap;
      }

      .nav__trigger:hover,
      .nav__trigger--open {
        color: var(--text-primary);
        background: var(--surface-hover);
        box-shadow: var(--glow-sm);
      }

      /* Press feedback. There was none: the trigger transitioned color,
         background, border and shadow but had no :active rule and no transform
         in its transition list, so it was the one control in the bar that did
         not move under the pointer while the buttons and icon buttons beside it
         did. 0.97 and 120ms are what arc-button uses for a wide control —
         arc-icon-button's 0.93 is pitched for a small square and reads as a
         lurch across something this long. */
      .nav__trigger:active {
        transform: scale(0.97);
      }

      .nav__trigger--active {
        color: var(--interactive);
        background: rgba(var(--interactive-rgb), 0.06);
        border-color: rgba(var(--interactive-rgb), 0.3);
        box-shadow: inset 0 0 8px rgba(var(--interactive-rgb), 0.06), 0 0 8px rgba(var(--interactive-rgb), 0.08);
      }

      .nav__trigger--active:hover {
        border-color: rgba(var(--interactive-rgb), 0.5);
        box-shadow: inset 0 0 8px rgba(var(--interactive-rgb), 0.08), 0 0 12px rgba(var(--interactive-rgb), 0.12);
      }

      .nav__trigger--muted {
        color: var(--text-muted);
        font-weight: 500;
        background: transparent;
        border-color: transparent;
      }

      .nav__trigger--muted:hover,
      .nav__trigger--muted.nav__trigger--open {
        color: var(--text-primary);
        background: rgba(var(--text-primary-rgb), 0.12);
        border-color: transparent;
        box-shadow: 0 0 12px rgba(var(--text-primary-rgb), 0.06);
      }

      .nav__trigger--muted.nav__trigger--active {
        color: var(--text-primary);
        background: rgba(var(--interactive-rgb), 0.08);
        border-color: transparent;
        box-shadow: 0 0 12px rgba(var(--interactive-rgb), 0.1);
      }

      .nav__trigger--muted.nav__trigger--active:hover {
        background: rgba(var(--interactive-rgb), 0.12);
        box-shadow: 0 0 16px rgba(var(--interactive-rgb), 0.14);
      }

      .nav__trigger--primary {
        color: var(--interactive);
        border-color: rgba(var(--interactive-rgb), 0.2);
        background: rgba(var(--interactive-rgb), 0.04);
      }

      .nav__trigger--primary:hover,
      .nav__trigger--primary.nav__trigger--open {
        color: var(--interactive);
        background: rgba(var(--interactive-rgb), 0.1);
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--interactive-hover);
      }

      .nav__trigger--primary.nav__trigger--active {
        color: var(--interactive);
        background: rgba(var(--interactive-rgb), 0.1);
        border-color: rgba(var(--interactive-rgb), 0.5);
        box-shadow: inset 0 0 10px rgba(var(--interactive-rgb), 0.1), 0 0 14px rgba(var(--interactive-rgb), 0.15);
      }

      .nav__trigger--primary.nav__trigger--active:hover {
        border-color: rgba(var(--interactive-rgb), 0.6);
        box-shadow: inset 0 0 12px rgba(var(--interactive-rgb), 0.12), 0 0 18px rgba(var(--interactive-rgb), 0.2);
      }

      .nav__trigger:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
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
        inset-inline-start: 0;
        min-width: 280px;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm);
        box-shadow: var(--shadow-overlay);
        z-index: var(--z-dropdown);
        opacity: 0;
        visibility: hidden;
        transform: translateY(4px);
        pointer-events: none;
        transition: opacity var(--transition-fast), visibility var(--transition-fast), transform var(--transition-fast);
      }

      .nav__dropdown--open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        pointer-events: auto;
      }

      .nav__dropdown-item {
        display: block;
        text-align: start;
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
        background: rgba(var(--interactive-rgb), 0.08);
      }

      .nav__dropdown-item:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .nav__dropdown-label {
        display: block;
        font-size: var(--_text-sm);
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 2px; /* cosmetic micro-spacing */
      }

      .nav__dropdown-desc {
        display: block;
        font-size: var(--_text-sm);
        color: var(--text-muted);
        line-height: 1.4;
      }

      .nav__slot-host { display: none; }

      /* ── Mobile panel ── */
      /* nav-collapse: keep in step with tokens.breakpoint.navCollapse.
         Literal for prism's sake — see the note in arc-top-bar. Guarded by
         check-breakpoint-drift.js. */
      @media (max-width: 900px) {
        .nav { display: none; }
      }

      .mobile-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        top: var(--nav-height);
        background: var(--overlay-backdrop);
        z-index: var(--z-overlay);
      }

      .mobile-backdrop--open {
        display: block;
        animation: mobile-fade-in var(--duration-enter) var(--ease-out-expo) both;
      }

      .mobile-backdrop--closing {
        display: block;
        animation: mobile-fade-out var(--duration-exit) var(--ease-in) both;
      }

      .mobile-panel {
        display: none;
        position: fixed;
        top: var(--nav-height);
        inset-inline-start: 0;
        inset-inline-end: 0;
        max-height: calc(100dvh - var(--nav-height));
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        background:
          radial-gradient(120% 80% at 50% 0%, rgba(var(--accent-primary-rgb), 0.07), transparent 70%),
          color-mix(in srgb, var(--surface-base) 92%, transparent);
        backdrop-filter: blur(12px) saturate(130%);
        -webkit-backdrop-filter: blur(12px) saturate(130%);
        box-shadow: var(--shadow-lg);
        z-index: var(--z-overlay);
        will-change: clip-path, opacity;
      }

      /* The lit hairline every other v3 surface ends on — the footer's horizon,
         the tooltip's top edge — rather than a flat --divider. The panel hangs
         from the bar, so its own bottom edge is where it meets the page. */
      .mobile-panel::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        bottom: 0;
        height: 1px;
        background: var(--divider-glow);
      }

      .mobile-panel--open {
        display: block;
        animation: mobile-slide-in var(--duration-enter) var(--ease-out-expo) both;
      }

      .mobile-panel--closing {
        display: block;
        animation: mobile-slide-out var(--duration-exit) var(--ease-in) both;
      }

      .mobile-panel--open .mobile-item {
        animation: mobile-item-in 400ms var(--ease-out-expo) both;
      }

      .mobile-panel--closing .mobile-item {
        animation: mobile-item-out var(--duration-exit) var(--ease-in) both;
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
        from { clip-path: inset(0 0 100% 0); opacity: 0; }
        to { clip-path: inset(0 0 0 0); opacity: 1; }
      }

      @keyframes mobile-slide-out {
        from { clip-path: inset(0 0 0 0); opacity: 1; }
        to { clip-path: inset(0 0 100% 0); opacity: 0; }
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
        background: var(--divider-glow);
      }

      .mobile-list {
        list-style: none;
        margin: 0;
        padding: var(--space-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .mobile-item {}

      .mobile-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--space-md) var(--space-lg);
        min-height: var(--touch-min);
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-family: var(--font-label);
        font-size: var(--section-title-size);
        font-weight: var(--section-title-weight);
        letter-spacing: var(--section-title-spacing);
        text-transform: uppercase;
        text-decoration: none;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: color var(--transition-fast), background var(--transition-fast),
          border-color var(--transition-fast), box-shadow var(--transition-fast),
          transform 80ms var(--ease-standard);
      }

      .mobile-trigger:hover {
        color: var(--text-primary);
        background: var(--surface-hover);
        box-shadow: var(--glow-sm);
      }

      .mobile-trigger:active {
        transform: scale(0.98);
        background: rgba(var(--interactive-rgb), 0.08);
        border-color: rgba(var(--interactive-rgb), 0.25);
        transition-duration: 0ms;
      }

      /* One row is marked, and it is marked the way v3 marks state everywhere
         else: tint, glow, accent text. Every row used to carry its own fill and
         border, which ranks none of them — the same thing the API tables were
         doing before they stopped. The color goes through the theme's solved
         text mix, so the label holds AA on the tint in both themes. */
      .mobile-trigger--active {
        color: color-mix(in srgb, var(--interactive), var(--text-primary) var(--accent-text-mix, 0%));
        background: rgba(var(--interactive-rgb), 0.08);
        border-color: rgba(var(--interactive-rgb), 0.28);
        box-shadow: var(--glow-sm);
      }

      .mobile-trigger--active:hover {
        border-color: rgba(var(--interactive-rgb), 0.45);
        box-shadow: var(--glow-md);
      }

      .mobile-trigger--muted {
        color: var(--text-muted);
        font-weight: 400;
        border-color: transparent;
        background: transparent;
      }

      .mobile-trigger--muted:hover {
        color: var(--text-primary);
        background: rgba(var(--text-primary-rgb), 0.06);
        box-shadow: var(--glow-sm);
      }

      .mobile-trigger--muted.mobile-trigger--active {
        color: var(--text-primary);
        background: rgba(var(--interactive-rgb), 0.06);
        border-color: rgba(var(--interactive-rgb), 0.2);
        box-shadow: 0 0 8px rgba(var(--interactive-rgb), 0.08);
      }

      .mobile-trigger--muted.mobile-trigger--active:hover {
        background: rgba(var(--interactive-rgb), 0.1);
        box-shadow: var(--interactive-hover);
      }

      .mobile-trigger--primary {
        color: var(--interactive);
        border-color: rgba(var(--interactive-rgb), 0.2);
        background: rgba(var(--interactive-rgb), 0.04);
      }

      .mobile-trigger--primary:hover {
        color: var(--interactive);
        background: rgba(var(--interactive-rgb), 0.1);
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--interactive-hover);
      }

      .mobile-trigger--primary.mobile-trigger--active {
        color: var(--interactive);
        background: rgba(var(--interactive-rgb), 0.1);
        border-color: rgba(var(--interactive-rgb), 0.5);
        box-shadow: inset 0 0 10px rgba(var(--interactive-rgb), 0.1),
          0 0 14px rgba(var(--interactive-rgb), 0.15);
      }

      .mobile-trigger--primary.mobile-trigger--active:hover {
        border-color: rgba(var(--interactive-rgb), 0.6);
        box-shadow: inset 0 0 12px rgba(var(--interactive-rgb), 0.12),
          0 0 18px rgba(var(--interactive-rgb), 0.2);
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
        display: grid;
        grid-template-rows: 0fr;
        visibility: hidden;
        transition: grid-template-rows var(--transition-slow), visibility var(--transition-slow);
      }

      .mobile-children--open {
        grid-template-rows: 1fr;
        visibility: visible;
      }

      .mobile-children__inner {
        overflow: hidden;
        padding: 0 var(--space-sm);
      }

      .mobile-child {
        display: block;
        padding: var(--space-sm) var(--space-md);
        min-height: var(--touch-min);
        text-decoration: none;
        color: var(--text-primary);
        font-weight: 400;
        font-size: var(--body-size);
        border-radius: var(--radius-sm);
        -webkit-tap-highlight-color: transparent;
        transition: background var(--transition-fast), transform 80ms var(--ease-standard);
        cursor: pointer;
      }

      .mobile-child:hover {
        background: rgba(var(--interactive-rgb), 0.08);
      }

      .mobile-child:active {
        transform: scale(0.98);
        background: rgba(var(--interactive-rgb), 0.12);
        transition-duration: 0ms;
      }

      .mobile-child-label {
        display: block;
      }

      .mobile-child-desc {
        display: block;
        font-size: var(--_text-sm);
        color: var(--text-muted);
        line-height: 1.4;
        margin-top: 2px;
      }
    `,
  ];

  constructor() {
    super();
    this.label = 'Navigation menu';
    this._items = [];
    this._openIndex = -1;
    this._mobileOpen = false;
    this._mobileClosing = false;
    this._mobileExpandedIndex = -1;
    this._closeTimeout = null;
    this._touchStartY = null;
    this._panelAtTop = false;
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

  /**
   * Read the items once the first render has a slot to read from.
   *
   * slotchange alone is not enough under declarative shadow DOM: the parser
   * attaches the shadow root and assigns the slot before Lit adopts the tree,
   * so the assignment has already happened by the time this listener exists
   * and the event never arrives. This component mirrors its children into its
   * own nav and hides the light DOM with `.nav__slot-host { display: none }`,
   * so upgrading with zero items doesn't degrade to the plain link list — it
   * renders an empty bar and hides the real links behind it. The site's whole
   * top-bar nav disappeared on the first server-rendered deploy.
   *
   * Same fix, same reason, as arc-segmented-control.
   */
  firstUpdated() {
    hydrateSlots(this);
    this._readItems(this.shadowRoot?.querySelector('.nav__slot-host slot'));
  }

  _onSlotChange(e) {
    this._readItems(e.target);
  }

  _readItems(slot) {
    if (!slot) return;
    const items = slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-NAV-ITEM');
    if (!items.length && !this._items.length) return;
    this._items = items;
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
      detail: {
        href,
        item: { label: item.label, href: item.resolvedHref, description: item.description },
      },
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
    } else if (item.resolvedHref) {
      this._navigate(e, item.resolvedHref, item);
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
    if (window.innerWidth > breakpoints.navCollapse && this._mobileOpen) {
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
    this.dispatchEvent(
      new CustomEvent('arc-mobile-menu-toggle', {
        detail: { value: false },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onPanelAnimEnd(e) {
    if (e.animationName === 'mobile-slide-out') {
      this._mobileOpen = false;
      this._mobileClosing = false;
      this._unlockScroll();
    }
  }

  _lockScroll() {
    lockScroll(this);
  }

  _unlockScroll() {
    unlockScroll(this);
  }

  _onBackdropClick() {
    this._closeMobile();
  }

  /* ── Swipe-to-close ── */

  _onPanelTouchStart(e) {
    if (!this._mobileOpen || this._mobileClosing) return;
    const panel = this._portalRoot?.querySelector('.mobile-panel');
    this._touchStartY = e.touches[0].clientY;
    this._panelAtTop = panel ? panel.scrollTop <= 0 : false;
  }

  _onPanelTouchEnd(e) {
    if (this._touchStartY === null || !this._panelAtTop) {
      this._touchStartY = null;
      return;
    }
    const endY = e.changedTouches[0].clientY;
    const delta = this._touchStartY - endY;
    this._touchStartY = null;

    if (delta > 80) {
      this._closeMobile();
    }
  }

  updated() {
    super.updated();
    this._renderPortal();
  }

  _renderPortal() {
    if (!this._portalRoot) return;
    if (!this._portalStyled) {
      const sheet = new CSSStyleSheet();
      const cssTexts = (this.constructor.elementStyles || []).map((s) => s.cssText ?? s.toString());
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
    } else if (item.resolvedHref) {
      this._navigate(e, item.resolvedHref, item);
    }
  }

  render() {
    return html`
      <div class="nav__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <nav class="nav" part="nav" aria-label=${this.label}>
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
              ${
                hasChildren
                  ? html`
                <button
                  class="nav__trigger nav__trigger--has-children ${isOpen ? 'nav__trigger--open' : ''} ${item.active ? 'nav__trigger--active' : ''} ${item.variant && item.variant !== 'default' ? `nav__trigger--${item.variant}` : ''}"
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
              `
                  : html`
                <a
                  class="nav__trigger ${item.active ? 'nav__trigger--active' : ''} ${item.variant && item.variant !== 'default' ? `nav__trigger--${item.variant}` : ''}"
                  href=${item.resolvedHref}
                  @click=${(e) => this._handleTriggerClick(e, item, i)}
                  part="trigger"
                >
                  ${item.label}
                </a>
              `
              }

              ${
                hasChildren
                  ? html`
                <div
                  class="nav__dropdown ${isOpen ? 'nav__dropdown--open' : ''}"
                  @mouseenter=${() => this._cancelClose()}
                  @mouseleave=${() => this._scheduleClose()}
                  role="menu"
                  part="dropdown"
                >
                  ${item.subItems.map(
                    (child) => html`
                    <a
                      class="nav__dropdown-item"
                      href=${child.resolvedHref}
                      role="menuitem"
                      @click=${(e) => this._navigate(e, child.resolvedHref, child)}
                      part="dropdown-item"
                    >
                      <span class="nav__dropdown-label">${child.label}</span>
                      ${
                        child.description
                          ? html`
                        <span class="nav__dropdown-desc">${child.description}</span>
                      `
                          : ''
                      }
                    </a>
                  `,
                  )}
                </div>
              `
                  : ''
              }
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
        role="dialog"
        aria-modal="true"
        aria-label=${this.label}
        @animationend=${this._onPanelAnimEnd}
        @touchstart=${this._onPanelTouchStart}
        @touchend=${this._onPanelTouchEnd}
      >
        <div class="mobile-glow"></div>
        <ul class="mobile-list">
          ${this._items.map((item, i) => {
            const hasChildren = item.hasChildren;
            const isExpanded = this._mobileExpandedIndex === i;

            return html`
              <li class="mobile-item" style="animation-delay: ${i * 60}ms">
                ${
                  hasChildren
                    ? html`
                  <button
                    class="mobile-trigger ${item.active ? 'mobile-trigger--active' : ''} ${item.variant && item.variant !== 'default' ? `mobile-trigger--${item.variant}` : ''}"
                    @click=${() => this._toggleMobileDropdown(i)}
                    aria-expanded=${String(isExpanded)}
                  >
                    ${item.label}
                    <svg class="mobile-chevron ${isExpanded ? 'mobile-chevron--open' : ''}" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <div class="mobile-children ${isExpanded ? 'mobile-children--open' : ''}">
                    <div class="mobile-children__inner">
                      ${item.subItems.map(
                        (child) => html`
                        <a
                          class="mobile-child"
                          href=${child.resolvedHref}
                          @click=${(e) => this._navigate(e, child.resolvedHref, child)}
                        >
                          <span class="mobile-child-label">${child.label}</span>
                          ${
                            child.description
                              ? html`
                            <span class="mobile-child-desc">${child.description}</span>
                          `
                              : ''
                          }
                        </a>
                      `,
                      )}
                    </div>
                  </div>
                `
                    : html`
                  <a
                    class="mobile-trigger ${item.active ? 'mobile-trigger--active' : ''} ${item.variant && item.variant !== 'default' ? `mobile-trigger--${item.variant}` : ''}"
                    href=${item.resolvedHref}
                    @click=${(e) => this._handleMobileTriggerClick(e, item, i)}
                  >
                    ${item.label}
                  </a>
                `
                }
              </li>
            `;
          })}
        </ul>
      </div>
    `;
  }
}
