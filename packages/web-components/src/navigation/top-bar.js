import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { breakpoints } from '../generated/breakpoints.js';
import '../layout/container.register.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Fixed header bar that anchors every page with a brand slot on the left, an optional center
 * navigation area, and a right-aligned actions region for user controls, search, and settings.
 *
 * @tag arc-top-bar
 * @status stable
 * @requires arc-container
 * @prop {string} heading - Brand text displayed in the top-left corner next to the optional logo slot. Rendered uppercase with wide letter-spacing at the wordmark size. Keep this to one or two words that identify the application.
 * @prop {string} homeHref - Destination of the brand link. Defaults to `/`; set it when the app is mounted under a sub-path, or to an empty string to render the brand as plain text with no link at all.
 * @prop {boolean} scrolled - Reflects whether the page has scrolled past the bar's threshold. Set by the component, not by you — read it to style a scrolled state from outside, via `arc-top-bar[scrolled]`.
 * @prop {boolean} immersive - Renders the bar with no background, blur or border until the page is scrolled, so a hero shows through it. Requires `fixed`. Suits marketing pages whose first screen is one composed image; leave it off in an application layout, where the bar should be a fixed edge among the other panels rather than something that appears and disappears.
 * @prop {boolean} fixed - When true, the bar uses position: fixed so it stays at the top of the viewport while content scrolls underneath. Automatically applied when TopBar is placed inside an AppShell. Be sure to add matching top padding to the content below to prevent overlap.
 * @prop {boolean} menuOpen - Reflects whether the mobile hamburger menu is open. Toggling this value updates the aria-expanded attribute on the menu button. Typically managed by AppShell in response to the arc-sidebar-toggle event rather than set directly.
 * @prop {'left' | 'center' | 'right'} navAlign - Controls the alignment of content in the center slot. Pulls nav toward the brand or actions without reordering DOM.
 * @prop {string} contained - Sets a max-width containment on the top bar content area. Accepts any CSS length or named size.
 * @prop {string} mobileMenu - Controls the mobile menu behavior. When set to a value like "nav", the hamburger toggles an inline navigation panel instead of triggering sidebar toggle.
 * @prop {string} menuPosition - Position of the mobile menu panel when mobile-menu is active.
 * @fires arc-sidebar-toggle - Fired when the mobile menu toggle is clicked (sidebar mode)
 * @fires arc-mobile-menu-toggle - Fired when the mobile hamburger button is clicked and mobile-menu mode is active. Use this to toggle your own mobile navigation panel.
 * @slot logo
 * @slot subtitle
 * @slot center
 * @slot actions
 * @csspart menu-btn
 * @csspart content
 * @csspart brand
 * @csspart center
 * @csspart actions
 * @csspart topbar
 */
export class ArcTopBar extends DeclaredPropsMixin(LitElement) {
  static properties = {
    heading: { type: String },
    homeHref: { type: String, attribute: 'home-href' },
    /* Declared, not just toggled onto the host: it was written with
       toggleAttribute alone, so it styled correctly but appeared in no
       manifest, no wrapper type and no documentation — API that exists and
       cannot be found. */
    // Output, not input — see the @prop note above: the component sets this.
    scrolled: flag(false, { derived: true }),
    immersive: flag(false),
    fixed: flag(false),
    contained: { type: String, reflect: true },
    menuOpen: flag(false, { attribute: 'menu-open' }),
    mobileMenu: { type: String, attribute: 'mobile-menu' },
    menuPosition: { type: String, attribute: 'menu-position' },
    navAlign: oneOf(['left', 'center', 'right'], { default: 'center', attribute: 'nav-align', reflect: false }),
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
        inset-inline-start: 0;
        inset-inline-end: 0;
      }

      .topbar {
        position: relative;
        height: var(--nav-height);
        background: color-mix(in srgb, var(--surface-base) 85%, transparent);
        backdrop-filter: blur(12px) saturate(130%);
        -webkit-backdrop-filter: blur(12px) saturate(130%);
        border-bottom: 1px solid var(--divider);
        transition:
          background var(--transition-slow),
          backdrop-filter var(--transition-slow),
          border-color var(--transition-slow);
      }

      /* A pinned region has to be one color, not two.
         arc-footer paints --surface-base flat, while this bar mixes it 85% with
         transparent. When the region's scheme matches the page that costs
         nothing — 15% of a near-black page bleeds through as near-black. When
         it doesn't, the 15% is 15% of the opposite ground, so the identical
         token renders one color up here and another down there, and two regions
         pinned to the same scheme visibly disagree. Opaque when the region is
         pinned; the translucency stays for bars that follow the page, which are
         the ones with something worth seeing behind them. The blur goes with
         it, and loses nothing: it was already imperceptible behind an
         85%-opaque fill. */
      :host(.theme-fixed-dark) .topbar,
      :host(.theme-fixed-light) .topbar {
        background: var(--surface-base);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      /* Immersive: at the top of the document the bar carries no chrome at all,
         and takes on the blur, the fill and the border only once content is
         actually passing underneath and the boundary starts doing work.
         Opt-in, because it suits a page whose first screen is one designed
         image — a hero, a landing page — and actively hurts an application
         layout, where the bar is one panel among several defined panels and is
         expected to be a fixed edge rather than something that comes and goes.
         Also gated on [fixed]: a bar in the flow scrolls away with the page and
         never overlays anything, so it has nothing to earn. */
      /* :not([menu-open]) because an open mobile panel is content passing
         underneath in every sense that matters — it is a filled, blurred sheet
         hanging directly below a bar that is still showing the hero through
         itself, so the panel reads as floating loose under nothing. The bar
         earns its chrome the moment it has something to sit on top of. */
      :host([immersive][fixed]:not([scrolled]):not([menu-open])) .topbar {
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        border-bottom-color: transparent;
      }

      @media (prefers-reduced-motion: reduce) {
        .topbar { transition: none; }
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
        inset-inline-start: 20%;
        inset-inline-end: 20%;
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
        min-width: 0;
      }

      .topbar__actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      /* Centered nav means centered in the *bar*, not in whatever space the brand
         and the actions happen to leave over. With the flex row alone the nav
         sits at the midpoint of the gap between them, which is the middle of
         the viewport only when those two are identically wide — they never are.
         Giving both sides an equal flex basis of zero makes them claim the same
         width whatever they contain, so the middle column's centre is the bar's
         centre. Only for nav-align=center: left and right alignment want the
         brand to keep its natural width.

         Keyed on "not the other two" as well as on the value itself: nav-align
         defaults to center in the constructor and is not reflected, so
         :host([nav-align="center"]) alone matches nothing in the default case —
         the very failure check-enum-fallbacks.js exists to catch. The explicit
         selector stays beside it so prism can still infer the union. */
      :host(:not([nav-align="left"]):not([nav-align="right"])) .topbar__brand,
      :host(:not([nav-align="left"]):not([nav-align="right"])) .topbar__actions,
      :host([nav-align="center"]) .topbar__brand,
      :host([nav-align="center"]) .topbar__actions {
        flex: 1 1 0;
        min-width: 0;
      }

      :host(:not([nav-align="left"]):not([nav-align="right"])) .topbar__actions,
      :host([nav-align="center"]) .topbar__actions {
        justify-content: flex-end;
      }

      :host(:not([nav-align="left"]):not([nav-align="right"])) .topbar__center,
      :host([nav-align="center"]) .topbar__center {
        flex: 0 1 auto;
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
        /* Circular and border-less, like the icon buttons it shares the bar
           with. It was a --radius-sm square with a visible edge, which the
           round-icon-button pass left behind — the one square control in a row
           of circles, and the only one outlined. The open state still takes an
           accent border, so the affordance is kept where it means something. */
        border: 1px solid transparent;
        color: var(--text-primary);
        cursor: pointer;
        padding: 0;
        border-radius: var(--radius-full);
        transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .topbar__menu-btn:hover {
        background: var(--surface-hover);
        box-shadow: var(--glow-sm);
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
        transition: transform 400ms var(--ease-out), opacity 250ms var(--ease-standard), width 400ms var(--ease-out);
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

      /* nav-collapse: keep in step with tokens.breakpoint.navCollapse.
         A literal, not an interpolation. prism reads these css templates as
         text to generate the standalone CSS package, and cannot evaluate an
         interpolation; doing it here compiled fine and dropped this query from
         arc-ui.css entirely. The JS side reads the token directly, and
         check-breakpoint-drift.js asserts this number still matches it.
         Separately, and the reason this comment is worth reading: a comment
         sitting directly above an at-rule used to make prism scope it, emitting
         the component selector in front of the @media — invalid CSS, so the
         rule stopped applying in the standalone package the moment this note
         was added. Fixed in prism (v3, "don't scope an at-rule whose prelude a
         comment precedes"); if a media query ever goes missing from arc-ui.css
         again, check the emitted CSS before trusting that it compiled. */
      @media (max-width: 900px) {
        .topbar__menu-btn { display: flex; }
      }
    `,
  ];

  constructor() {
    super();
    this.heading = '';
    this.homeHref = '/';
    this.contained = null;
    this.mobileMenu = 'sidebar';
    this.menuPosition = 'left';
    this._rafId = null;
    this._onExternalToggle = this._onExternalToggle.bind(this);
    this._onScroll = this._onScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('arc-mobile-menu-toggle', this._onExternalToggle);
    document.addEventListener('arc-sidebar-toggle', this._onExternalToggle);
    // Capture phase on the document, not the window: an app that scrolls a
    // container rather than the page never fires a window scroll event, and the
    // bar simply never learned it had been scrolled past.
    document.addEventListener('scroll', this._onScroll, { capture: true, passive: true });
    this._measure();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('arc-mobile-menu-toggle', this._onExternalToggle);
    document.removeEventListener('arc-sidebar-toggle', this._onExternalToggle);
    document.removeEventListener('scroll', this._onScroll, { capture: true });
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  /** Coalesce a burst of scroll events into one measurement per frame. */
  _onScroll() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._measure();
    });
  }

  _measure() {
    const doc = document.scrollingElement || document.documentElement;
    this.scrolled = doc.scrollTop > 20;
  }

  /**
   * Adopt menu state someone else changed.
   *
   * Both modes need this, and only the nav one had it. In sidebar mode the
   * drawer belongs to arc-app-shell, which also closes it on Escape, on a
   * backdrop click and on navigation — none of which came back here, so the
   * hamburger went on reporting aria-expanded="true" and showing its close icon
   * for a drawer that had already slid away.
   */
  _onExternalToggle(e) {
    if (e.target === this) return;
    const forNav = e.type === 'arc-mobile-menu-toggle';
    if (forNav !== (this.mobileMenu === 'nav')) return;
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
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { value: this.menuOpen },
        bubbles: true,
        composed: true,
      }),
    );
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

  /** Brand contents, shared by the linked and unlinked forms. */
  _renderBrand() {
    return html`
      <slot name="logo"></slot>
      ${this.heading ? html`<span class="topbar__heading">${this.heading}</span>` : ''}
      <slot name="subtitle"></slot>
    `;
  }

  _renderContent(menuLeft) {
    return html`
      <div class="topbar__content" part="content">
        ${menuLeft ? this._renderMenuButton() : ''}
        ${
          this.homeHref
            ? html`
            <a class="topbar__brand" href=${this.homeHref} part="brand">
              ${this._renderBrand()}
            </a>`
            : html`<div class="topbar__brand" part="brand">${this._renderBrand()}</div>`
        }
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
        ${
          size
            ? html`<arc-container size=${size}>${this._renderContent(menuLeft)}</arc-container>`
            : this._renderContent(menuLeft)
        }
        <div class="topbar__glow"></div>
      </header>
    `;
  }
}
