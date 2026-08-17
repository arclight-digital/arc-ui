import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DismissController } from '../shared/dismiss-controller.js';
import { PositionController } from '../shared/position-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';
import { DeclaredPropsMixin, list } from '../shared/props.js';

/**
 * Desktop-application-style menu bar (File / Edit / View) with nested submenus, keyboard shortcuts
 * display, and full WAI-ARIA menubar keyboard navigation.
 *
 * @tag arc-menubar
 * @status beta
 * @prop {Array<{label:string,disabled?:boolean,items:Array<{label?:string,shortcut?:string,disabled?:boolean,divider?:boolean,items?:Array<{label:string,shortcut?:string,disabled?:boolean}>}>}>} items - The menu structure. Entries with an `items` array become submenus (one further nesting level supported); `{ divider: true }` renders a separator. Set as a property, or as a JSON attribute for a menu structure that is static.
 * @fires arc-select - Fired when a leaf menu item is activated. `detail.path` is the array of labels from the top-level menu to the selected leaf, e.g. `["File", "Export", "PNG"]`.
 * @slot none
 * @csspart base - The root element.
 * @csspart menu
 * @csspart divider
 * @csspart item
 * @csspart shortcut
 * @csspart bar
 * @csspart trigger
 */
export class ArcMenubar extends DeclaredPropsMixin(LitElement) {
  static properties = {
    items: list(),
    _openTop: { state: true },
    _focusedTop: { state: true },
    _activePath: { state: true },
    _expandedPath: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
      }

      /* No horizontal padding: the first trigger (and its flush-left panel)
         must line up with the bar's left edge. */
      .menubar {
        display: flex;
        align-items: stretch;
        gap: var(--space-xs);
        padding: var(--space-xs) 0;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: var(--_text-sm);
      }

      .top {
        position: relative;
        display: flex;
      }

      .trigger {
        display: inline-flex;
        align-items: center;
        padding: var(--space-sm) var(--space-md);
        min-height: var(--touch-min);
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font: inherit;
        border-radius: var(--radius-sm);
        cursor: pointer;
        white-space: nowrap;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .trigger:hover,
      .trigger.is-open {
        background: rgba(var(--interactive-rgb), 0.08);
        color: var(--text-primary);
      }

      .trigger:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      .trigger[aria-disabled='true'] {
        color: var(--text-muted);
        opacity: 0.5;
        cursor: default;
      }

      .trigger[aria-disabled='true']:hover {
        background: transparent;
        color: var(--text-muted);
      }

      .menu {
        position: absolute;
        z-index: var(--z-dropdown);
        /* 320px was too narrow for an ordinary label+shortcut row: labels are
           flex: 1 with text-overflow: ellipsis, so anything longer than the
           panel is truncated, and "Ask for a change  ⌘K" is not a long label.
           The cap is now both larger and overridable — it was a hard-coded
           number with no token behind it, so a consumer could only reach it
           through ::part(menu).

           width: max-content makes the panel size to its widest item rather
           than to whatever shrink-to-fit resolves against its containing block.
           An absolutely positioned box is sized
             min(max(min-content, available), max-content)
           where "available" comes from the nearest positioned ancestor — here
           the trigger — so the panel's width was a function of what it happened
           to be nested in rather than of what it contains. The viewport-relative
           max-width keeps it from overflowing a genuinely narrow screen. */
        width: max-content;
        min-width: 200px;
        max-width: var(--menu-max-width, min(420px, calc(100vw - 2 * var(--space-md))));
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm);
        box-shadow: var(--shadow-overlay);
        animation: menu-in 120ms var(--ease-out-expo);
      }

      /* Resting positions, for menus PositionController hasn't adopted — the
         static HTML export and anything pre-upgrade. Once managed, the panels
         are in the top layer at fixed coordinates and PositionController owns
         the flip that .menu--flipped used to encode. */
      .menu--top:not([data-managed]) {
        top: calc(100% + var(--space-xs));
        inset-inline-start: 0;
      }

      /* Anchored to the full-width item row: left 100% is the item's right
         edge, i.e. the panel's inner right edge. Add the panel's right
         padding + border so the submenu clears the parent panel, minus a
         4px overlap for visual continuity (never enough to reach item text:
         the panel padding alone is 8px). Top offset cancels the panel's own
         padding so the first submenu item aligns with the parent item.
         PositionController reproduces both numbers as offset/crossOffset. */
      .menu--sub:not([data-managed]) {
        top: calc(-1 * var(--space-sm) - 1px);
        inset-inline-start: calc(100% + var(--space-sm) + 1px - var(--space-xs));
      }

      @keyframes menu-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Containing block for .menu--sub. Must span the panel's full inner
         width so the submenu's left: 100% resolves to the panel's inner
         right edge rather than a shrink-wrapped item box. */
      .item-wrap {
        position: relative;
        width: 100%;
      }

      .item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--touch-pad) var(--space-md);
        min-height: var(--touch-min);
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font: inherit;
        text-align: start;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .item:hover,
      .item.is-active {
        background: rgba(var(--interactive-rgb), 0.08);
        color: var(--text-primary);
      }

      .item:focus-visible {
        outline: none;
        box-shadow: inset var(--interactive-focus);
      }

      .item.is-disabled,
      .item.is-disabled:hover {
        background: transparent;
        color: var(--text-muted);
        opacity: 0.5;
        cursor: default;
      }

      .item__label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* gap + margin keeps at least var(--space-lg) between label and shortcut */
      .item__shortcut {
        flex-shrink: 0;
        margin-inline-start: var(--space-md);
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        color: var(--text-ghost);
      }

      .item__caret {
        flex-shrink: 0;
        color: var(--text-muted);
        line-height: var(--glyph-lh);
      }

      .divider {
        height: 1px;
        margin: var(--space-xs) 0;
        background: var(--border-subtle);
      }
    `,
    // animate: false — menus are created and destroyed rather than toggled, and
    // they have their own menu-in keyframes.
    managedPanelStyles('menu', { animate: false }),
  ];

  constructor() {
    super();
    this._openTop = -1;
    this._focusedTop = 0;
    this._activePath = [];
    this._expandedPath = [];
    // menu key -> PositionController. One per open menu: a menubar has the
    // top-level menu and every expanded submenu on screen at once.
    this._positions = new Map();
    this._focusAfterUpdate = null;
    this._hoverTimer = null;
    this._dismiss = new DismissController(this, {
      onDismiss: () => this._closeAll(false),
      when: () => this._openTop >= 0,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cancelHoverTimer();
  }

  /**
   * The hydrating render has to be the *server's* render, not the page's.
   *
   * @lit-labs/ssr renders a host from its attributes alone, so a bar whose
   * `items` arrive as a property — the common half of the documented contract
   * — is rendered as an empty bar on the server. The page assigns them before
   * the register barrel upgrades this element, which parks them in Lit's
   * pre-upgrade instance properties and applies them at the top of the very
   * first update: the one that has to adopt the server's markup. Four triggers
   * against the server's none is "unexpected longer than expected iterable",
   * and hydration abandons the whole tree there.
   *
   * So the first render uses what the attribute said — which is exactly what
   * the server rendered from, JSON attribute included — and the script-set
   * structure is handed over in `firstUpdated`, once that markup has been
   * adopted. Nothing is held back without a server-rendered shadow root, so a
   * client-only menubar still paints on the first frame.
   */
  connectedCallback() {
    // Before super: ReactiveElement attaches the render root here, so a shadow
    // root that already exists is the server's `<template shadowrootmode>`.
    const hydrating = !this.hasUpdated && this.shadowRoot !== null;
    super.connectedCallback();
    if (hydrating) this._ssrItems = this.items;
  }

  firstUpdated() {
    // See connectedCallback: the server's markup is adopted, so the page's menu
    // structure can land now, as an ordinary second update.
    if (this._heldItems !== undefined) {
      this.items = this._heldItems;
      this._heldItems = undefined;
    }
  }

  willUpdate(changed) {
    // See connectedCallback. Swapping here rather than in `render()` keeps the
    // open/focus bookkeeping below in step with whichever structure is on show.
    if (this._ssrItems !== undefined) {
      this._heldItems = this.items;
      this.items = this._ssrItems;
      this._ssrItems = undefined;
    }
    if (changed.has('items')) {
      this._openTop = -1;
      this._activePath = [];
      this._expandedPath = [];
      this._cancelHoverTimer();
      const enabled = this._enabledTop();
      this._focusedTop = enabled.length ? enabled[0] : 0;
    }
  }

  updated() {
    if (this._openTop >= 0) this._dismiss.activate();
    else this._dismiss.deactivate();

    this._positionOpenMenus();

    if (this._focusAfterUpdate) {
      const el = this.shadowRoot.getElementById(this._focusAfterUpdate);
      this._focusAfterUpdate = null;
      el?.focus();
    }
  }

  /**
   * Position every open menu, and retire the controllers of menus that closed.
   *
   * A menubar has several panels open at once — the top-level menu plus one
   * submenu per level of the expanded path — so it keeps one PositionController
   * per menu key rather than the single controller every other floating
   * component needs. Each is anchored to its own parent: a top-level menu to the
   * `.top` cell holding its trigger, a submenu to the `.item-wrap` row that
   * opened it.
   *
   * This replaces a hand-rolled two-pass measure: menus used to render
   * visibility:hidden, get measured for a right-edge overflow, then re-render
   * with a `menu--flipped` class. The controller writes coordinates before the
   * browser paints, so there is no invisible first pass to hide and no extra
   * render to schedule — and submenus now flip on the vertical axis too, which
   * the old logic never did.
   */
  _positionOpenMenus() {
    const live = new Set();

    for (const menu of this.shadowRoot.querySelectorAll('.menu[data-menu-key]')) {
      const key = menu.dataset.menuKey;
      live.add(key);

      let controller = this._positions.get(key);
      if (!controller) {
        const sub = menu.classList.contains('menu--sub');
        controller = new PositionController(this, {
          floating: () => this.shadowRoot?.querySelector(`.menu[data-menu-key="${key}"]`),
          anchor: () =>
            this.shadowRoot?.querySelector(`.menu[data-menu-key="${key}"]`)?.parentElement,
          // Submenus fly out sideways; top-level menus drop down.
          placement: () => (sub ? 'right' : 'bottom'),
          align: () => 'start',
          // Both carried over from the resting CSS these replace: a submenu sits
          // 5px clear of the parent panel's inner edge (padding + border, less a
          // 4px overlap for continuity) and 9px above the item row, cancelling
          // the parent panel's own padding so the first submenu item lines up
          // with the item that opened it.
          offset: sub ? 5 : 4,
          crossOffset: sub ? -9 : 0,
        });
        this._positions.set(key, controller);
      }
      controller.show();
    }

    for (const [key, controller] of this._positions) {
      if (!live.has(key)) {
        controller.hide();
        // removeController is the other half of the addController that
        // PositionController's constructor makes. Dropping the map entry alone
        // leaves Lit holding the controller for the life of the element, so
        // every reopen of a menu accumulated one more (finding #56).
        this.removeController(controller);
        this._positions.delete(key);
      }
    }
  }

  /* ---------------------------------------------------------- item helpers */

  get _topItems() {
    return Array.isArray(this.items) ? this.items : [];
  }

  _menuItemsAt(basePath) {
    let arr = this._topItems[this._openTop]?.items || [];
    for (const idx of basePath) arr = arr[idx]?.items || [];
    return arr;
  }

  _itemAt(path) {
    return this._menuItemsAt(path.slice(0, -1))[path[path.length - 1]];
  }

  _isSelectable(item) {
    return !!item && !item.divider && !item.disabled;
  }

  _hasSub(item) {
    return Array.isArray(item?.items) && item.items.length > 0;
  }

  _enabledIndices(arr) {
    return arr.map((it, i) => (this._isSelectable(it) ? i : -1)).filter((i) => i >= 0);
  }

  _enabledTop() {
    return this._topItems.map((it, i) => (it && !it.disabled ? i : -1)).filter((i) => i >= 0);
  }

  _isPrefix(p, q) {
    return p.length <= q.length && p.every((v, i) => q[i] === v);
  }

  _pathEquals(a, b) {
    return a.length === b.length && a.every((v, i) => b[i] === v);
  }

  _triggerId(t) {
    return `mb-top-${t}`;
  }

  _itemId(path) {
    return `mb-item-${this._openTop}-${path.join('-')}`;
  }

  /* ------------------------------------------------------- state mutations */

  _cancelHoverTimer() {
    if (this._hoverTimer) {
      clearTimeout(this._hoverTimer);
      this._hoverTimer = null;
    }
  }

  _setActive(path) {
    this._activePath = path;
    this._expandedPath = path.slice(0, -1);
    this._focusAfterUpdate = this._itemId(path);
  }

  _openMenu(t, entry = 'none', focusTrigger = false) {
    const item = this._topItems[t];
    if (!item || item.disabled) return;
    this._cancelHoverTimer();
    this._openTop = t;
    this._focusedTop = t;
    this._activePath = [];
    this._expandedPath = [];
    if (entry === 'first' || entry === 'last') this._enterMenu(entry);
    else if (focusTrigger) this._focusAfterUpdate = this._triggerId(t);
  }

  _closeAll(restoreFocus = true) {
    this._cancelHoverTimer();
    if (this._openTop < 0) return;
    const t = this._openTop;
    this._openTop = -1;
    this._activePath = [];
    this._expandedPath = [];
    this._focusedTop = t;
    if (restoreFocus) this._focusAfterUpdate = this._triggerId(t);
  }

  _enterMenu(which) {
    const enabled = this._enabledIndices(this._menuItemsAt([]));
    if (!enabled.length) return;
    this._setActive([which === 'last' ? enabled[enabled.length - 1] : enabled[0]]);
  }

  _expandSub(path) {
    const enabled = this._enabledIndices(this._menuItemsAt(path));
    if (!enabled.length) return;
    this._activePath = [...path, enabled[0]];
    this._expandedPath = path;
    this._focusAfterUpdate = this._itemId(this._activePath);
  }

  _collapseSub() {
    this._setActive(this._activePath.slice(0, -1));
  }

  _select(path) {
    const labels = [this._topItems[this._openTop]?.label];
    let arr = this._topItems[this._openTop]?.items || [];
    for (const idx of path) {
      labels.push(arr[idx]?.label);
      arr = arr[idx]?.items || [];
    }
    this.dispatchEvent(
      new CustomEvent('arc-select', {
        detail: { value: labels[labels.length - 1], path: labels },
        bubbles: true,
        composed: true,
      }),
    );
    this._closeAll(true);
  }

  /* --------------------------------------------------------------- keyboard */

  _onKeydown(e) {
    if (!this._topItems.length || e.defaultPrevented) return;
    const key = e.key;

    if (key.length === 1 && key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      this._typeahead(key);
      return;
    }

    const menuOpen = this._openTop >= 0;
    const inMenu = menuOpen && this._activePath.length > 0;

    switch (key) {
      case 'ArrowRight':
        e.preventDefault();
        this._navHorizontal(1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this._navHorizontal(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (inMenu) this._moveVertical(1);
        else if (menuOpen) this._enterMenu('first');
        else this._openMenu(this._focusedTop, 'first');
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (inMenu) this._moveVertical(-1);
        else if (menuOpen) this._enterMenu('last');
        else this._openMenu(this._focusedTop, 'last');
        break;
      case 'Home':
        e.preventDefault();
        if (inMenu) this._jumpEdge('first');
        else if (menuOpen) this._enterMenu('first');
        else this._focusTopEdge('first');
        break;
      case 'End':
        e.preventDefault();
        if (inMenu) this._jumpEdge('last');
        else if (menuOpen) this._enterMenu('last');
        else this._focusTopEdge('last');
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        this._activate();
        break;
      case 'Escape':
        if (menuOpen) {
          e.preventDefault();
          if (this._activePath.length > 1) this._collapseSub();
          else this._closeAll(true);
        }
        break;
      case 'Tab':
        this._closeAll(false); // no preventDefault: let focus move on
        break;
    }
  }

  _navHorizontal(dir) {
    if (this._openTop >= 0 && this._activePath.length) {
      const item = this._itemAt(this._activePath);
      if (dir > 0 && this._isSelectable(item) && this._hasSub(item)) {
        this._expandSub(this._activePath);
        return;
      }
      if (dir < 0 && this._activePath.length > 1) {
        this._collapseSub();
        return;
      }
    }
    this._moveTop(dir);
  }

  _moveTop(dir) {
    const enabled = this._enabledTop();
    if (!enabled.length) return;
    const wasOpen = this._openTop >= 0;
    const wasInMenu = wasOpen && this._activePath.length > 0;
    const cur = enabled.indexOf(wasOpen ? this._openTop : this._focusedTop);
    const next = enabled[cur < 0 ? 0 : (cur + dir + enabled.length) % enabled.length];
    if (wasOpen) {
      this._openMenu(next, wasInMenu ? 'first' : 'none', !wasInMenu);
    } else {
      this._focusedTop = next;
      this._focusAfterUpdate = this._triggerId(next);
    }
  }

  _focusTopEdge(which) {
    const enabled = this._enabledTop();
    if (!enabled.length) return;
    const t = which === 'last' ? enabled[enabled.length - 1] : enabled[0];
    this._focusedTop = t;
    this._focusAfterUpdate = this._triggerId(t);
  }

  _moveVertical(dir) {
    const parent = this._activePath.slice(0, -1);
    const enabled = this._enabledIndices(this._menuItemsAt(parent));
    if (!enabled.length) return;
    const cur = enabled.indexOf(this._activePath[this._activePath.length - 1]);
    const next =
      cur < 0 ? (dir > 0 ? 0 : enabled.length - 1) : (cur + dir + enabled.length) % enabled.length;
    this._setActive([...parent, enabled[next]]);
  }

  _jumpEdge(which) {
    const parent = this._activePath.slice(0, -1);
    const enabled = this._enabledIndices(this._menuItemsAt(parent));
    if (!enabled.length) return;
    this._setActive([...parent, which === 'last' ? enabled[enabled.length - 1] : enabled[0]]);
  }

  _activate() {
    if (this._openTop < 0) {
      this._openMenu(this._focusedTop, 'first');
      return;
    }
    if (!this._activePath.length) {
      this._enterMenu('first');
      return;
    }
    const item = this._itemAt(this._activePath);
    if (!this._isSelectable(item)) return;
    if (this._hasSub(item)) this._expandSub(this._activePath);
    else this._select(this._activePath);
  }

  _typeahead(char) {
    const c = char.toLowerCase();
    if (this._openTop >= 0) {
      const parent = this._activePath.slice(0, -1);
      const arr = this._menuItemsAt(parent);
      const enabled = this._enabledIndices(arr);
      if (!enabled.length) return;
      const start = this._activePath.length
        ? enabled.indexOf(this._activePath[this._activePath.length - 1])
        : -1;
      for (let s = 1; s <= enabled.length; s++) {
        const idx = enabled[(start + s + enabled.length) % enabled.length];
        if ((arr[idx].label || '').toLowerCase().startsWith(c)) {
          this._setActive([...parent, idx]);
          return;
        }
      }
    } else {
      const enabled = this._enabledTop();
      if (!enabled.length) return;
      const start = enabled.indexOf(this._focusedTop);
      for (let s = 1; s <= enabled.length; s++) {
        const t = enabled[(start + s + enabled.length) % enabled.length];
        if ((this._topItems[t].label || '').toLowerCase().startsWith(c)) {
          this._focusedTop = t;
          this._focusAfterUpdate = this._triggerId(t);
          return;
        }
      }
    }
  }

  /* ---------------------------------------------------------------- pointer */

  _onTriggerClick(t) {
    const item = this._topItems[t];
    if (!item || item.disabled) return;
    if (this._openTop === t) this._closeAll(true);
    else this._openMenu(t, 'none');
  }

  _onTriggerEnter(t) {
    if (this._openTop < 0 || this._openTop === t) return;
    const item = this._topItems[t];
    if (!item || item.disabled) return;
    // Hover-open only steals focus if the user is already interacting with us.
    this._openMenu(t, 'none', !!this.shadowRoot.activeElement);
  }

  _onItemEnter(path, item) {
    if (item.divider) return;
    this._cancelHoverTimer();
    // Close submenu branches that don't contain the hovered item.
    if (!this._isPrefix(path, this._expandedPath)) {
      this._expandedPath = path.slice(0, -1);
    }
    if (item.disabled) return;
    this._activePath = path;
    if (this.shadowRoot.activeElement) this._focusAfterUpdate = this._itemId(path);
    if (this._hasSub(item) && !this._isPrefix(path, this._expandedPath)) {
      this._hoverTimer = setTimeout(() => {
        this._hoverTimer = null;
        this._expandedPath = path;
      }, 150);
    }
  }

  _onItemClick(e, path, item) {
    e.stopPropagation();
    if (!this._isSelectable(item)) return;
    if (this._hasSub(item)) {
      this._cancelHoverTimer();
      this._activePath = path;
      this._expandedPath = this._isPrefix(path, this._expandedPath) ? path.slice(0, -1) : path;
      return;
    }
    this._select(path);
  }

  _onFocusOut(e) {
    const rt = e.relatedTarget;
    // Null relatedTarget also happens when a collapsing submenu removes the
    // focused node (focus falls to body before we restore it) — ignore it;
    // outside clicks are handled by DismissController.
    if (!rt || this.contains(rt) || this.shadowRoot.contains(rt)) return;
    this._closeAll(false);
  }

  /* ----------------------------------------------------------------- render */

  _renderMenu(items, basePath, label) {
    const sub = basePath.length > 0;
    const key = `${sub ? 's' : 't'}${this._openTop}${sub ? '-' + basePath.join('-') : ''}`;
    return html`
      <div
        class="menu ${sub ? 'menu--sub' : 'menu--top'}"
        role="menu"
        part="menu"
        aria-label=${label || nothing}
        data-menu-key=${key}
      >
        ${items.map((item, i) => this._renderItem(item, [...basePath, i]))}
      </div>
    `;
  }

  _renderItem(item, path) {
    if (item.divider) {
      return html`<div class="divider" role="separator" part="divider"></div>`;
    }
    const hasSub = this._hasSub(item);
    const active = this._pathEquals(path, this._activePath);
    const expanded = hasSub && this._isPrefix(path, this._expandedPath);
    const button = html`
      <button
        id=${this._itemId(path)}
        class="item ${active ? 'is-active' : ''} ${item.disabled ? 'is-disabled' : ''}"
        part="item"
        role="menuitem"
        tabindex=${active ? '0' : '-1'}
        aria-disabled=${item.disabled ? 'true' : 'false'}
        aria-haspopup=${hasSub ? 'menu' : nothing}
        aria-expanded=${hasSub ? (expanded ? 'true' : 'false') : nothing}
        @click=${(e) => this._onItemClick(e, path, item)}
        @pointerenter=${() => this._onItemEnter(path, item)}
      >
        <span class="item__label">${item.label}</span>
        ${item.shortcut ? html`<span class="item__shortcut" part="shortcut">${item.shortcut}</span>` : nothing}
        ${hasSub ? html`<span class="item__caret" aria-hidden="true">›</span>` : nothing}
      </button>
    `;
    return hasSub
      ? html`
          <div class="item-wrap" role="none">
            ${button}
            ${expanded ? this._renderMenu(item.items, path, item.label) : nothing}
          </div>
        `
      : button;
  }

  render() {
    return html`
      <div
        class="menubar"
        role="menubar"
        part="base bar"
        @keydown=${this._onKeydown}
        @focusout=${this._onFocusOut}
      >
        ${this._topItems.map((item, t) => {
          const open = this._openTop === t;
          return html`
            <div class="top" role="none">
              <button
                id=${this._triggerId(t)}
                class="trigger ${open ? 'is-open' : ''}"
                part="trigger"
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded=${open ? 'true' : 'false'}
                aria-disabled=${item.disabled ? 'true' : nothing}
                tabindex=${t === this._focusedTop && !this._activePath.length ? '0' : '-1'}
                @click=${() => this._onTriggerClick(t)}
                @pointerenter=${() => this._onTriggerEnter(t)}
              >${item.label}</button>
              ${open ? this._renderMenu(item.items || [], [], item.label) : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }
}
