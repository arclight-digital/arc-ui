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
 * A slotted `arc-top-bar` is put out of flow for you — the body already
 * reserves `--nav-height` of padding for it — and whatever is slotted into the
 * sidebar is stretched to the full height of the rail, `arc-sidebar` or a plain
 * `<nav>` alike, so anything drawing an edge draws it the whole way down. The
 * rail is 280px wide; set `--sidebar-width` on the shell to change it, which
 * moves the wrapper and the sidebar inside it together.
 *
 * By default the shell is a page layout: at least `100vh` tall, with the page
 * as the scroll context and a sticky sidebar rail. Set `embedded` to put the
 * same layout inside a box — a card, a dashboard cell, a split pane, a preview
 * — where it takes its height from the container you give it and scrolls
 * inside itself instead of moving the page.
 *
 * @tag arc-app-shell
 * @status stable
 * @prop {boolean} sidebarOpen - Controls whether the sidebar is visible on mobile viewports (below 768 px). On desktop the sidebar is always shown regardless of this attribute. Toggle it from a hamburger button in your TopBar to give mobile users access to navigation.
 * @prop {boolean} embedded - Fills the container instead of the viewport. The shell takes the height you give it (`height: 100%` of a bounded parent, or any length), its content area becomes the scroll context rather than the page, and the sidebar rail is stretched by the body rather than sized from the screen — a sticky rail has nothing to stick against once the page is not what scrolls. Use it for a shell inside a card, a dashboard cell, a split pane, or a documentation preview; leave it off for the full-page layout, which is what the component is for.
 * @prop {number} breakpoint - Viewport width in pixels at which the layout switches between mobile and desktop modes.
 * @fires {CustomEvent<{ value: boolean }>} arc-sidebar-toggle - Fired when the shell itself opens or closes the mobile sidebar — on a backdrop click, on Escape, on navigation, or when the viewport widens past the breakpoint and the drawer stops existing. Listened to by arc-top-bar so its hamburger stays in step, and by any wrapper binding `sidebarOpen`. Not fired for a toggle the shell merely received, so the two cannot echo each other.
 * @slot topbar
 * @slot sidebar
 * @slot - Default content.
 * @slot toc
 * @csspart base - The root element.
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
    embedded: flag(false),
    breakpoint: { type: Number },
    _mobile: { state: true },
    _hasToc: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        /* A page layout's height is the viewport, and the page is what scrolls.
           See :host([embedded]) below for the other half — the same layout
           sized by its container, scrolling inside itself. A CSS-only version
           of that was tried first (a --shell-height token) and reverted: the
           rail's own viewport height forced the shell past any smaller box
           whatever :host declared, so the token was honoured everywhere except
           the case it existed for. Which half you are in is a real difference
           in behaviour — what scrolls, and what sticky means — so it is a
           declared prop rather than a token that has to guess. */
        min-height: 100vh;
        background: var(--surface-base);
        color: var(--text-primary);
      }

      .shell {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      /* ── Embedded: the container is the viewport ──────────────────────────
         Everything here is the same layout measured against the host box
         instead of the screen. The host takes its container's height, .shell
         fills the host, and the body becomes the scroll context that the page
         was — which is why min-height: 0 appears on the flex items: without
         it a flex item refuses to shrink below its content and the inner
         scrollers never engage.

         The consumer supplies the height, exactly as they would for any other
         element: <arc-app-shell embedded style="height:100%"> inside a box
         that has one. Nothing here invents a number. */
      :host([embedded]) {
        min-height: 0;
        height: 100%;
        display: grid;
        grid-template-rows: 1fr;
        overflow: hidden;
      }

      :host([embedded]) .shell {
        min-height: 0;
        height: 100%;
      }

      :host([embedded]) .shell__body {
        min-height: 0;
        /* The bar is in flow here rather than fixed to the viewport, so there
           is nothing to reserve room for. */
        padding-top: 0;
      }

      :host([embedded]) .shell__sidebar {
        /* Stretched by the body rather than sized from the screen, and static
           rather than sticky: the body is the scroll context now, so there is
           no page scroll for the rail to hold still against. */
        position: static;
        top: auto;
        height: auto;
        min-height: 0;
      }

      :host([embedded]) .shell__main {
        min-height: 0;
      }

      :host([embedded]) .shell__content {
        overflow-y: auto;
        min-height: 0;
      }

      :host([embedded]) .shell__toc {
        position: static;
        max-height: none;
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
        /* grid, so the slotted rail fills the full height of this box rather
           than stopping at its own content. It matters to anything that draws
           an edge — arc-sidebar's divider, or a plain <nav> with a
           border-right, which is what the docs preview slots and what a
           consumer reaches for first. Finding #91 was the arc-sidebar case of
           this and was fixed with a ::slotted rule naming that one tag; the box
           is the right place for it, and covers content the shell has never
           heard of. */
        display: grid;
        flex-shrink: 0;
        /* The rail's width lives here rather than on the slotted arc-sidebar,
           which the ::slotted block below forces to 100% of it. --sidebar-width
           is the one handle that moves both: set it on the shell (or anywhere
           above it) and the wrapper and its contents follow. arc-sidebar's own
           width prop is for a standalone rail — see navigation/sidebar.js. */
        width: var(--sidebar-width, 280px);
        position: sticky;
        top: var(--nav-height);
        /* Two things were tried here and both failed, which is why this is a
           plain viewport figure: calc(100% - …) resolves against .shell__body,
           whose height comes from a min-height and is therefore not definite, so
           the rail collapsed to the height of one link; and stretching the rail
           to the body makes it as tall as the page, which leaves sticky nothing
           to do. */
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
      this.toggleAttribute('mobile', this._mobile);
    }
    if (changed.has('embedded')) this._syncTopbar();
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
    const mobile = window.innerWidth <= this.breakpoint;
    // The drawer is a mobile affordance; on the way back to desktop it stops
    // existing and the state that says it is open has to go with it. Closed
    // here rather than in `updated()`, where it used to be: a state write from
    // inside the update is Lit's change-in-update warning, and this transition
    // is detected out here anyway — on connect and on resize, both outside the
    // cycle. The same shape as the slot readers in shared/hydrate-slots.js.
    //
    // Through _setOpen, so it is announced. This is the fourth way the drawer
    // closes without the consumer asking, and it used to be the one that said
    // nothing — a plain assignment. That was invisible while the wrappers held
    // `sidebarOpen` one-way; now that they bind it (prism 3.1's rule keys off
    // "assigns to it and announces it"), a silent close is precisely the drift
    // the binding exists to prevent: the consumer's copy would stay `true`
    // against a shell that had closed.
    if (!mobile && this.sidebarOpen) this._setOpen(false);
    this._mobile = mobile;
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

  /**
   * Put the slotted top bar out of flow, because the shell has already reserved
   * the space for it.
   *
   * `.shell__body` carries `padding-top: var(--nav-height)` on the assumption
   * that the bar above it is `position: fixed`. arc-top-bar only becomes fixed
   * under `:host([fixed])`, and nothing set it — so the default composition
   * rendered the bar in normal flow *and* the padding reserving room for it: a
   * 128px gap at the top of every page, with no error and nothing in the
   * console. arc-top-bar's own JSDoc has always described the behaviour that
   * was missing — "Automatically applied when TopBar is placed inside an
   * AppShell" — which is what makes this a defect rather than a gotcha.
   * Finding #90.
   *
   * The attribute rather than the property, so it also lands on a bar that has
   * not upgraded yet, and so the reason a consumer's bar is fixed is legible in
   * the DOM. Idempotent, as every hydrate-slots handler must be.
   */
  _onTopbarSlotChange() {
    this._syncTopbar();
  }

  /**
   * `fixed` follows the mode, because the two disagree about what the bar is
   * anchored to.
   *
   * A page shell reserves --nav-height for a bar that is out of flow, so the bar
   * must be fixed. An embedded shell has no such claim on the viewport: a fixed
   * bar leaves the container entirely and pins itself to the top of the screen,
   * which is a bar floating over the page from a component in a card. Embedded
   * therefore takes the attribute back off — and takes the reserved padding
   * with it, since an in-flow bar occupies its own space.
   */
  _syncTopbar() {
    const slot = this.shadowRoot?.querySelector('slot[name="topbar"]');
    for (const el of slot?.assignedElements({ flatten: true }) ?? []) {
      if (el.localName !== 'arc-top-bar') continue;
      el.toggleAttribute('fixed', !this.embedded);
    }
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
      <div class="shell" part="base shell">
        <div class="shell__topbar">
          <slot name="topbar" @slotchange=${this._onTopbarSlotChange}></slot>
        </div>
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
