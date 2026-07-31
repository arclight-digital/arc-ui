import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { MenuKeyboardController } from '../shared/menu-keyboard.js';
import { PositionController } from '../shared/position-controller.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import { managedPanelStyles } from '../shared/position-styles.js';
import { setTriggerAria, deepActiveElement } from '../shared/trigger-aria.js';
import '../shared/menu-item.js';
import '../shared/menu-divider.js';
import '../content/separator.js';

/**
 * Menu dropdown triggered by a button with keyboard navigation.
 *
 * @tag arc-dropdown-menu
 * @requires arc-separator
 * @prop {boolean} open - Controls whether the menu panel is visible. Toggled by clicking the trigger. Set to false when the user selects an item, clicks outside, or presses Escape.
 * @fires {CustomEvent<void>} arc-close - Fired when the dropdown closes
 * @fires arc-select - Fired when a menu item is selected
 * @slot - Default content.
 * @slot trigger
 * @csspart divider
 * @csspart item
 * @csspart shortcut
 * @csspart trigger
 * @csspart panel
 */
export class ArcDropdownMenu extends LitElement {
  static properties = {
    open:          { type: Boolean, reflect: true },
    _children:     { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }

      .dropdown__trigger {
        display: inline-block;
        cursor: pointer;
      }

      /* Resting position for a panel PositionController hasn't adopted — the
         static HTML export and anything pre-upgrade. Once managed the panel is
         in the top layer at fixed viewport coordinates, and flips above the
         trigger when there's no room below. */
      .dropdown__panel {
        position: absolute;
        z-index: 100;
        top: calc(100% + var(--space-xs));
        inset-inline-start: 0;
        /* max-content rather than shrink-to-fit — an abspos panel otherwise sizes
           against the width available from its positioned ancestor, so a narrow
           container squeezes it to min-width and the items truncate. See the
           longer note in navigation/menubar.js. */
        width: max-content;
        min-width: 200px;
        max-width: var(--menu-max-width, min(420px, calc(100vw - 2 * var(--space-md))));
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

      :host([open]) .dropdown__panel {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown__item {
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
        font-size: var(--_text-sm);
        cursor: pointer;
        text-align: start;
        transition: background var(--transition-fast), color var(--transition-fast);
        outline: none;
      }

      .dropdown__item:hover,
      .dropdown__item.is-focused {
        background: var(--surface-hover);
        color: var(--text-primary);
      }

      .dropdown__item:focus-visible {
        box-shadow: inset var(--interactive-focus);
      }

      .dropdown__item-label {
        flex: 1;
      }

      .dropdown__item-shortcut {
        font-family: var(--font-mono);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        opacity: 0.6;
      }

      arc-separator {
        margin: var(--space-xs) 0;
      }

      .dropdown__slot-host { display: none; }
    `,
    // The menu slides down rather than scaling; closedTransform keeps that
    // entrance instead of normalising it to the default scale.
    managedPanelStyles('dropdown__panel', { closedTransform: 'translateY(-4px)' }),
  ];

  constructor() {
    super();
    this.open = false;
    this._children = [];
    this._openedFrom = null;
    this._lastFocusedIndex = -1;
    this._clickOutside = new ClickOutsideController(this, {
      // _close(false): the pointer chose a new target, so don't yank focus back.
      onClickOutside: () => this._close(false),
    });
    this._menuKb = new MenuKeyboardController(this, {
      getItemCount: () => this._menuItems.length,
      onSelect: (i) => this._selectItem(this._menuItems[i], i),
      onClose: () => this._close(),
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.dropdown__trigger'),
      floating: () => this.shadowRoot?.querySelector('.dropdown__panel'),
      // Left-aligned with the trigger, matching the resting CSS (left: 0).
      align: () => 'start',
      offset: 4,
    });
  }

  _onSlotChange(e) {
    this._children = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-MENU-ITEM' || el.tagName === 'ARC-MENU-DIVIDER');
  }

  get _menuItems() {
    return this._children.filter(el => el.tagName === 'ARC-MENU-ITEM');
  }

  updated(changed) {
    if (changed.has('open')) {
      this.open ? this._position.show() : this._position.hide();
    }
    // Items arriving from the slot change the panel's height, and with it
    // whether the panel still fits below the trigger.
    if (changed.has('_children') && this.open) this._position.show();
    if (changed.has('open')) {
      this._syncTriggerAria();
      if (this.open) {
        this._openedFrom = deepActiveElement();
        this._menuKb.reset();
        this._clickOutside.activate();
        // The keyboard controller still waits a frame: it attaches a keydown
        // listener, and the Enter or Space that opened the menu would otherwise
        // arrive at the freshly opened menu as an item activation.
        requestAnimationFrame(() => this._menuKb.attach());
      } else {
        this._clickOutside.deactivate();
        this._menuKb.detach();
      }
    }

    // Roving focus: move real focus to the highlighted item as the
    // keyboard controller's index changes.
    const idx = this.open ? this._menuKb.focusedIndex : -1;
    if (idx >= 0 && idx !== this._lastFocusedIndex) {
      this.shadowRoot.querySelector(`#dropdown-item-${idx}`)?.focus();
    }
    this._lastFocusedIndex = idx;
  }

  _syncTriggerAria() {
    setTriggerAria(
      this.shadowRoot.querySelector('slot[name="trigger"]'),
      {
        'aria-haspopup': 'menu',
        'aria-expanded': this.open ? 'true' : 'false',
      }
    );
  }

  _toggle() {
    this.open = !this.open;
  }

  _close(restoreFocus = true) {
    if (!this.open) return;
    if (!this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
      cancelable: true,
    }))) return;
    this.open = false;
    if (restoreFocus && this._openedFrom && this._openedFrom.isConnected) {
      this._openedFrom.focus();
    }
    this._openedFrom = null;
  }

  _selectItem(item, index) {
    this.dispatchEvent(new CustomEvent('arc-select', {
      detail: { item: { label: item.label, shortcut: item.shortcut }, index },
      bubbles: true,
      composed: true,
    }));
    this._close();
  }

  _renderChild(child, globalIndex) {
    if (child.tagName === 'ARC-MENU-DIVIDER') {
      return html`<arc-separator part="divider"></arc-separator>`;
    }

    const selectableIndex = this._menuItems.indexOf(child);

    return html`
      <button
        id="dropdown-item-${selectableIndex}"
        class="dropdown__item ${selectableIndex === this._menuKb.focusedIndex ? 'is-focused' : ''}"
        role="menuitem"
        tabindex=${selectableIndex === this._menuKb.focusedIndex ? '0' : '-1'}
        @click=${() => this._selectItem(child, globalIndex)}
        @mouseenter=${() => { this._menuKb.focusedIndex = selectableIndex; this.requestUpdate(); }}
        part="item"
      >
        <span class="dropdown__item-label">${child.label || ''}</span>
        ${child.shortcut ? html`<span class="dropdown__item-shortcut" part="shortcut">${child.shortcut}</span>` : ''}
      </button>
    `;
  }

  render() {
    return html`
      <div class="dropdown__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div
        class="dropdown__trigger"
        @click=${this._toggle}
        part="trigger"
      >
        <slot name="trigger" @slotchange=${this._syncTriggerAria}></slot>
      </div>
      <div
        class="dropdown__panel"
        role="menu"
        aria-hidden=${this.open ? 'false' : 'true'}
        part="panel"
      >
        ${this._children.map((child, i) => this._renderChild(child, i))}
      </div>
    `;
  }
}
