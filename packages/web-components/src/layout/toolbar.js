import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { MenuKeyboardController } from '../shared/menu-keyboard.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import '../input/icon-button.js';

/**
 * Horizontal toolbar with start, center, and end slots.
 *
 * @tag arc-toolbar
 * @requires arc-icon-button
 * @prop {boolean} sticky - When set, the toolbar uses position: sticky with top: 0 and z-index: 50, keeping it visible as the user scrolls through content below.
 * @prop {'md' | 'sm'} size - Controls the toolbar height. The default md size is 48px for primary toolbars. The sm size is 36px for secondary or nested toolbars.
 * @prop {boolean} border - Renders a subtle bottom border (--border-subtle) to visually separate the toolbar from the content below. Enabled by default.
 * @prop {boolean} overflow - Enables responsive overflow collapse. A ResizeObserver measures available width; slotted items that do not fit are collapsed (hidden via the reversible hidden attribute) from the end of the item list, and a "More" trigger opens a menu of proxy items that re-dispatch clicks to the hidden originals. Note: because slotted nodes cannot be moved into the overflow panel, complex custom content is represented in the menu only by its text label (or the label attribute on arc-button / arc-icon-button).
 * @fires arc-overflow-change - Fired when the set of collapsed items changes (only with the overflow prop). detail: { hiddenCount: number }.
 * @slot start
 * @slot - Default content.
 * @slot end
 * @csspart more
 * @csspart overflow-panel
 * @csspart overflow-item
 * @csspart base
 * @csspart start
 * @csspart center
 * @csspart end
 */
export class ArcToolbar extends LitElement {
  static properties = {
    sticky: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    border: { type: Boolean, reflect: true },
    overflow: { type: Boolean, reflect: true },
    _overflowItems: { state: true },
    _menuOpen: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-body);
      }

      :host([sticky]) {
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .toolbar {
        display: flex;
        align-items: center;
        height: 48px;
        padding: 0 var(--space-md);
        background: var(--surface-raised);
        gap: var(--space-sm);
      }

      :host([size='sm']) .toolbar {
        height: 36px;
        padding: 0 var(--space-sm);
      }

      :host([border]) .toolbar {
        border-bottom: 1px solid var(--divider);
      }

      .toolbar__start {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      .toolbar__center {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex: 1;
        justify-content: center;
      }

      .toolbar__end {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
        margin-left: auto;
      }

      /* Overflow collapse prevents slotted items from forcing the row wider */
      :host([overflow]) .toolbar {
        min-width: 0;
        overflow: hidden;
      }
      :host([overflow]) .toolbar__center {
        min-width: 0;
      }

      .toolbar__overflow {
        position: relative;
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      .overflow__panel {
        position: absolute;
        z-index: var(--z-dropdown);
        top: calc(100% + var(--space-xs));
        right: 0;
        min-width: 200px;
        display: flex;
        flex-direction: column;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-xs) 0;
        box-shadow: var(--shadow-overlay);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-4px);
        transition:
          opacity var(--transition-base),
          visibility var(--transition-base),
          transform var(--transition-base);
      }

      .overflow__panel.is-open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .overflow__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--touch-pad) var(--space-md);
        min-height: var(--touch-min);
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        cursor: pointer;
        text-align: left;
        transition: background var(--transition-fast), color var(--transition-fast);
        outline: none;
      }

      .overflow__item:hover,
      .overflow__item.is-focused {
        background: var(--surface-hover);
        color: var(--text-primary);
      }

      .overflow__item:focus-visible {
        box-shadow: inset var(--interactive-focus);
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
    this.sticky = false;
    this.size = 'md';
    this.border = true;
    this.overflow = false;
    this._overflowItems = [];
    this._menuOpen = false;
    this._widthCache = new WeakMap();
    this._raf = 0;
    this._resizeObserver = null;
    this._lastFocusedIndex = -1;
    this._menuKb = new MenuKeyboardController(this, {
      getItemCount: () => this._overflowItems.length,
      onSelect: (i) => this._activateItem(i),
      onClose: () => this._closeMenu(true),
    });
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => this._closeMenu(false),
      when: () => this._menuOpen,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = 0;
    }
  }

  updated(changed) {
    if (changed.has('overflow')) {
      if (this.overflow) {
        if (!this._resizeObserver) {
          this._resizeObserver = new ResizeObserver(() => this._scheduleMeasure());
          this._resizeObserver.observe(this);
        }
        this._scheduleMeasure();
      } else {
        if (this._resizeObserver) {
          this._resizeObserver.disconnect();
          this._resizeObserver = null;
        }
        this._restoreAll();
      }
    }

    if (changed.has('_menuOpen')) {
      if (this._menuOpen) {
        this._menuKb.reset();
        requestAnimationFrame(() => {
          if (!this._menuOpen) return;
          this._menuKb.attach();
          this._clickOutside.activate();
        });
      } else {
        this._menuKb.detach();
        this._clickOutside.deactivate();
      }
    }

    // Roving focus: move real focus to the highlighted proxy item.
    const idx = this._menuOpen ? this._menuKb.focusedIndex : -1;
    if (idx >= 0 && idx !== this._lastFocusedIndex) {
      this.shadowRoot.querySelector(`#overflow-item-${idx}`)?.focus();
    }
    this._lastFocusedIndex = idx;
  }

  /** Slotted elements across start/center/end slots, in visual order. Skips items the consumer hid themselves. */
  get _slottedItems() {
    const slots = this.shadowRoot?.querySelectorAll('slot') || [];
    const items = [];
    for (const slot of slots) {
      for (const el of slot.assignedElements()) {
        if (el.hasAttribute('hidden') && !el.hasAttribute('data-arc-overflow-hidden')) continue;
        items.push(el);
      }
    }
    return items;
  }

  _onSlotChange() {
    if (this.overflow) this._scheduleMeasure();
  }

  _scheduleMeasure() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      this._raf = 0;
      this._measure();
    });
  }

  _measure() {
    if (!this.overflow || !this.isConnected) return;
    const toolbar = this.shadowRoot.querySelector('.toolbar');
    if (!toolbar) return;

    const items = this._slottedItems;
    // Widths of currently-collapsed items are 0, so cache each item's width while visible.
    for (const el of items) {
      if (!el.hasAttribute('hidden')) this._widthCache.set(el, el.offsetWidth);
    }

    const cs = getComputedStyle(toolbar);
    const avail = toolbar.clientWidth
      - (parseFloat(cs.paddingLeft) || 0)
      - (parseFloat(cs.paddingRight) || 0);
    const gap = parseFloat(cs.columnGap) || 0;
    const widths = items.map((el) => this._widthCache.get(el) || 0);
    const totalOf = (n) => widths.slice(0, n).reduce((a, w) => a + w, 0) + gap * Math.max(0, n - 1);

    let visibleCount = items.length;
    if (totalOf(items.length) > avail) {
      const moreEl = this.shadowRoot.querySelector('.toolbar__overflow');
      const reserve = (moreEl?.offsetWidth || 36) + gap;
      while (visibleCount > 0 && totalOf(visibleCount) + reserve > avail) visibleCount -= 1;
    }

    this._applyHidden(items, items.slice(visibleCount));
  }

  _applyHidden(items, hiddenItems) {
    const toHide = new Set(hiddenItems);
    let changed = false;
    for (const el of items) {
      const collapsedByUs = el.hasAttribute('data-arc-overflow-hidden');
      if (toHide.has(el) && !collapsedByUs) {
        // We never own slotted light DOM, so we hide via the reversible `hidden`
        // attribute (plus a data marker so we only ever un-hide what we hid) —
        // never style.display, which would clobber consumer inline styles.
        el.setAttribute('data-arc-overflow-hidden', '');
        el.setAttribute('hidden', '');
        changed = true;
      } else if (!toHide.has(el) && collapsedByUs) {
        el.removeAttribute('hidden');
        el.removeAttribute('data-arc-overflow-hidden');
        changed = true;
      }
    }
    if (!changed) return;

    this._overflowItems = hiddenItems;
    if (hiddenItems.length === 0 && this._menuOpen) this._closeMenu(false);
    this.dispatchEvent(new CustomEvent('arc-overflow-change', {
      detail: { hiddenCount: hiddenItems.length },
      bubbles: true,
      composed: true,
    }));
  }

  _restoreAll() {
    this._applyHidden(this._slottedItems, []);
  }

  /** Label shown for a collapsed item's proxy menu entry. */
  _itemLabel(el, index) {
    const tag = el.tagName;
    if (tag === 'ARC-BUTTON' || tag === 'ARC-ICON-BUTTON') {
      const label = el.getAttribute('label');
      if (label) return label;
    }
    return el.textContent.trim()
      || el.getAttribute('aria-label')
      || el.getAttribute('title')
      || `Item ${index + 1}`;
  }

  _toggleMenu() {
    this._menuOpen = !this._menuOpen;
  }

  _closeMenu(restoreFocus = true) {
    if (!this._menuOpen) return;
    this._menuOpen = false;
    if (restoreFocus) {
      const more = this.shadowRoot.querySelector('.overflow__more');
      // arc-icon-button doesn't delegate focus, so target its inner button.
      (more?.shadowRoot?.querySelector('button') || more)?.focus?.();
    }
  }

  _activateItem(index) {
    const original = this._overflowItems[index];
    this._closeMenu(true);
    // Proxy pattern: the hidden original stays slotted in the light DOM
    // (nodes can't be reparented into our shadow overlay), so the panel shows
    // a text-label proxy and re-dispatches the click to the real element.
    // Limitation: complex custom content is represented only by its text label.
    original?.click();
  }

  _renderOverflow() {
    if (!this.overflow || this._overflowItems.length === 0) return null;
    return html`
      <div class="toolbar__overflow">
        <arc-icon-button
          class="overflow__more"
          name="dots-three"
          label="More actions"
          size=${this.size === 'sm' ? 'sm' : 'md'}
          aria-haspopup="menu"
          aria-expanded=${this._menuOpen ? 'true' : 'false'}
          part="more"
          @click=${this._toggleMenu}
        ></arc-icon-button>
        <div
          class="overflow__panel ${this._menuOpen ? 'is-open' : ''}"
          role="menu"
          aria-hidden=${this._menuOpen ? 'false' : 'true'}
          part="overflow-panel"
        >
          ${this._overflowItems.map((el, i) => html`
            <button
              id="overflow-item-${i}"
              class="overflow__item ${i === this._menuKb.focusedIndex ? 'is-focused' : ''}"
              role="menuitem"
              tabindex=${i === this._menuKb.focusedIndex ? '0' : '-1'}
              part="overflow-item"
              @click=${() => this._activateItem(i)}
              @mouseenter=${() => { this._menuKb.focusedIndex = i; this.requestUpdate(); }}
            >${this._itemLabel(el, i)}</button>
          `)}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="toolbar" part="base" role="toolbar">
        <div class="toolbar__start" part="start">
          <slot name="start" @slotchange=${this._onSlotChange}></slot>
        </div>
        <div class="toolbar__center" part="center">
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
        <div class="toolbar__end" part="end">
          <slot name="end" @slotchange=${this._onSlotChange}></slot>
        </div>
        ${this._renderOverflow()}
      </div>
    `;
  }
}
