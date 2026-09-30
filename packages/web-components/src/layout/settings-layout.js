import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import './settings-nav-item.js';

/**
 * Settings page with side navigation and content area.
 *
 * Put `arc-settings-nav-item` links in the `nav` slot, one per section, each
 * pointing at a section's hash. The layout marks the item for the current URL hash
 * as active, and follows the hash as it changes. On a phone the nav becomes a
 * scrolling row of tabs above the content. With `sections`, it also shows only the
 * content section whose `id` matches the active item, so the page behaves like
 * tabs, with the URL to share and the back button to return.
 *
 * @tag arc-settings-layout
 * @status stable
 * @child arc-settings-nav-item nav
 * @requires arc-settings-nav-item
 * @prop {'left' | 'top'} navPosition - Controls whether the navigation panel appears as a left sidebar (220px wide, CSS Grid) or a top bar (full-width, flexbox column). Below 768px either becomes a scrolling row of tabs.
 * @prop {boolean} sections - Show only the content section whose `id` matches the active nav item (`href="#profile"` shows `id="profile"`), and hide the others with `hidden`. Off, every section stays on the page, as for one long page the nav scrolls through.
 * @slot nav - `arc-settings-nav-item` links, directly or inside a wrapper such as `<nav>`.
 * @slot - The settings content: with `sections`, one child per section, each with the `id` its nav item points to.
 * @csspart base - The root element.
 * @csspart layout
 * @csspart nav
 * @csspart content
 */
export class ArcSettingsLayout extends DeclaredPropsMixin(LitElement) {
  static properties = {
    navPosition: oneOf(['left', 'top'], { attribute: 'nav-position' }),
    sections: flag(false),
  };

  static styles = [
    tokenStyles,
    css`
      /* min-width: 0 on everything that could otherwise carry the tab row's
         unwrapped width upward. Without it, on a phone, the row set the
         layout's min-content width, and inside a grid or flex parent the whole
         page grew to it (827px on a 390px screen) and scrolled sideways
         (finding #131). */
      :host {
        display: block;
        box-sizing: border-box;
        min-width: 0;
      }

      /* Left nav layout */
      .settings-layout--left {
        display: grid;
        grid-template-columns: 220px minmax(0, 1fr);
        min-height: 100%;
      }

      .nav,
      .content { min-width: 0; }

      /* Sections are hidden with the hidden attribute, and a page rule that
         sets display on a section used to beat it and show every section at
         once (finding #132). An important declaration from inside a shadow
         root outranks the page's, important or not. */
      ::slotted([hidden]) { display: none !important; }

      .nav,
      .nav ::slotted([slot='nav']:not(arc-settings-nav-item)) {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .settings-layout--left .nav {
        padding: var(--space-lg);
        background: var(--surface-raised);
        border-inline-end: 1px solid var(--divider);
      }

      .settings-layout--left .content {
        padding: var(--space-xl);
        flex: 1;
      }

      /* Top nav layout */
      .settings-layout--top {
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }

      .settings-layout--top .nav {
        padding: var(--space-lg);
        background: var(--surface-raised);
        border-bottom: 1px solid var(--divider);
      }

      .settings-layout--top .content {
        padding: var(--space-xl);
        flex: 1;
      }

      @media (max-width: 768px) { /* --breakpoint-md */
        .settings-layout--left {
          display: flex;
          flex-direction: column;
        }

        .settings-layout--left .nav {
          border-inline-end: none;
          border-bottom: 1px solid var(--divider);
        }

        /* A row of tabs rather than a stack above the content, which pushed
           the content a screen down on a phone (finding #120). */
        .nav,
        .nav ::slotted([slot='nav']:not(arc-settings-nav-item)) {
          flex-direction: row;
          gap: 0;
        }
        .nav {
          overflow-x: auto;
          scrollbar-width: none;
          padding-block: 0;
          padding-inline: var(--space-sm);
        }
      }
    `,
  ];

  /** @internal Slots read on the server and before hydration; see ssr.js. */
  static slotReaders = { nav: '_sync', '': '_sync' };

  constructor() {
    super();
    this._onHashChange = this._onHashChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this._onHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._onHashChange);
  }

  firstUpdated() {
    hydrateSlots(this);
  }

  updated(changed) {
    if (changed.has('sections')) this._sync();
  }

  /** The nav items, whether slotted directly or inside a wrapper. */
  get _items() {
    const slot = this.shadowRoot?.querySelector('slot[name="nav"]');
    if (!slot) return [];
    return slot
      .assignedElements({ flatten: true })
      .flatMap((el) =>
        el.localName === 'arc-settings-nav-item'
          ? [el]
          : [...el.querySelectorAll('arc-settings-nav-item')],
      );
  }

  _onHashChange() {
    this._sync();
  }

  /**
   * Mark the item for the current hash active, or the first item when no item
   * matches, and with `sections` show only its section. The URL is the state:
   * a shared link or the back button lands on the right section with nothing
   * else to restore.
   */
  _sync() {
    const items = this._items;
    if (!items.length) return;
    const hash = typeof location === 'undefined' ? '' : location.hash;
    const current = items.find((i) => i.href && i.href === hash) ?? items[0];
    for (const item of items) item.active = item === current;
    if (hash) this._revealInNav(current);
    if (!this.sections) return;
    const id = current.href?.startsWith('#') ? current.href.slice(1) : null;
    const slot = this.shadowRoot.querySelector('slot:not([name])');
    for (const el of slot?.assignedElements({ flatten: true }) ?? []) {
      if (el.id) el.hidden = el.id !== id;
    }
  }

  /**
   * Scroll the phone tab row, and only the tab row, to show the active item.
   * `scrollIntoView` scrolled every scrollable ancestor, which is to say the
   * page as well (finding #131).
   */
  _revealInNav(item) {
    const nav = this.shadowRoot?.querySelector('.nav');
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const r = item.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    if (r.left < n.left) nav.scrollLeft -= n.left - r.left;
    else if (r.right > n.right) nav.scrollLeft += r.right - n.right;
  }

  render() {
    const layoutClass =
      this.navPosition === 'top' ? 'settings-layout--top' : 'settings-layout--left';

    return html`
      <div class="${layoutClass}" part="base layout">
        <div class="nav" part="nav">
          <slot name="nav" @slotchange=${this._sync}></slot>
        </div>
        <div class="content" part="content">
          <slot @slotchange=${this._sync}></slot>
        </div>
      </div>
    `;
  }
}
