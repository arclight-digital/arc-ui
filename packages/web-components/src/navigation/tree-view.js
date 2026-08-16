import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';

/**
 * Hierarchical tree structure with expandable/collapsible nodes, selection tracking, keyboard
 * navigation, and indentation guide lines.
 *
 * @tag arc-tree-view
 * @status stable
 * @requires arc-tree-item
 * @fires {CustomEvent<{ item: { label: string, icon: string }, path: string[], expanded: boolean }>} arc-toggle - Fired when a tree node is expanded or collapsed. `path` is the node's label chain from the root and is what identifies it — two nodes may share a label.
 * @fires {CustomEvent<{ value: string, item: { label: string, icon: string }, path: string[] }>} arc-select - Fired when a tree item is selected. `path` is the node's label chain from the root, matching `arc-toggle`.
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart tree - The root list. The nested lists at deeper levels are `group`.
 * @csspart group - A nested list under an expanded branch.
 * @csspart item
 * @csspart row
 */
export class ArcTreeView extends LitElement {
  static properties = {
    _items: { state: true },
    _selected: { state: true },
    _focusedKey: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-body);
        color: var(--text-primary);
      }

      .tree {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .tree__group {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .tree__item {
        position: relative;
      }

      .tree__row {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        width: 100%;
        text-align: start;
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-secondary);
        background: none;
        border: none;
        padding-block: var(--space-xs);
        padding-inline: var(--nav-row-inset) var(--space-sm);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        white-space: nowrap;
      }

      .tree__row:hover {
        color: var(--text-primary);
        background: rgba(var(--interactive-rgb), 0.04);
      }

      .tree__row--selected {
        color: var(--interactive);
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .tree__row:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .tree__chevron {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        transition: transform var(--transition-fast);
      }

      .tree__chevron--expanded {
        transform: rotate(90deg);
      }

      .tree__chevron--placeholder {
        visibility: hidden;
      }

      .tree__icon {
        display: inline-flex;
        flex-shrink: 0;
        font-size: var(--_text-sm);
      }

      .tree__label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tree__line {
        position: absolute;
        inset-inline-start: 11px;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--divider);
      }

      .tree__slot-host { display: none; }
    `,
  ];

  constructor() {
    super();
    this._items = [];
    this._selected = null;
    this._focusedKey = null;
    this._expandedSet = new Set();
  }

  _onSlotChange(e) {
    this._items = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-TREE-ITEM');
  }

  /**
   * Expansion and selection are keyed on the node's **path**, not on its label
   * (findings #21-#23).
   *
   * The label is not an identity: `src/index.js` and `test/index.js` are two
   * nodes called `index.js`, and "General" under two different sections is one
   * form. Keyed on the label, selecting one marked both, and expanding one
   * `assets` folder opened every other. The component already computed a path
   * key for its roving focus — `_pathKey(path)` — so the identity existed and
   * two of the three state maps simply were not using it.
   */
  _isExpanded(item, key) {
    if (this._expandedSet.has(key)) return true;
    return item.expanded === true && !this._expandedSet.has(`collapsed:${key}`);
  }

  _toggleExpand(item, path, e) {
    e.stopPropagation();
    const key = this._pathKey(path);
    const wasExpanded = this._isExpanded(item, key);

    if (wasExpanded) {
      this._expandedSet.delete(key);
      this._expandedSet.add(`collapsed:${key}`);
    } else {
      this._expandedSet.add(key);
      this._expandedSet.delete(`collapsed:${key}`);
    }

    this.dispatchEvent(
      new CustomEvent('arc-toggle', {
        // `path` carries the identity, as the arc-select detail always did.
        // The two events used to disagree about what names a node, so a
        // consumer could not tell which of two same-named branches had moved
        // (#23). No apostrophes in here: event-conventions.js balances quotes
        // across the argument text and does not skip comments, so one turns
        // every later dispatch in the file invisible to it.
        detail: { item: { label: item.label, icon: item.icon }, path, expanded: !wasExpanded },
        bubbles: true,
        composed: true,
      }),
    );

    this.requestUpdate();
  }

  _selectItem(item, path) {
    this._selected = this._pathKey(path);

    this.dispatchEvent(
      new CustomEvent('arc-select', {
        detail: {
          value: item.value ?? item.label,
          item: { label: item.label, icon: item.icon },
          path,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onKeyDown(e, item, path, hasChildren) {
    const key = this._pathKey(path);
    switch (e.key) {
      case 'ArrowRight':
        if (hasChildren && !this._isExpanded(item, key)) {
          this._toggleExpand(item, path, e);
        }
        break;
      case 'ArrowLeft':
        if (hasChildren && this._isExpanded(item, key)) {
          this._toggleExpand(item, path, e);
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        const rows = [...this.shadowRoot.querySelectorAll('.tree__row')];
        const idx = rows.indexOf(e.target);
        if (e.key === 'ArrowDown' && idx < rows.length - 1) rows[idx + 1].focus();
        if (e.key === 'ArrowUp' && idx > 0) rows[idx - 1].focus();
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._selectItem(item, path);
        break;
    }
  }

  _pathKey(path) {
    return path.join('\u001F');
  }

  _collectVisibleKeys(items, parentPath = [], keys = []) {
    for (const item of items || []) {
      const path = [...parentPath, item.label];
      const key = this._pathKey(path);
      keys.push(key);
      if (item.items.length > 0 && this._isExpanded(item, key)) {
        this._collectVisibleKeys(item.items, path, keys);
      }
    }
    return keys;
  }

  _renderItems(items, level = 0, parentPath = [], focusKey = null) {
    return html`
      <ul class="${level === 0 ? 'tree' : 'tree__group'}" role="${level === 0 ? 'tree' : 'group'}" part="${level === 0 ? 'tree' : 'group'}">
        ${(items || []).map((item, idx) => {
          const children = item.items;
          const hasChildren = children.length > 0;
          const path = [...parentPath, item.label];
          const key = this._pathKey(path);
          const expanded = this._isExpanded(item, key);
          const isSelected = this._selected === key;

          return html`
            <li class="tree__item" role="none" part="item">
              ${level > 0 ? html`<div class="tree__line" style="inset-inline-start: ${level * 16 + 3}px"></div>` : ''}
              <button
                class="tree__row ${isSelected ? 'tree__row--selected' : ''}"
                style="padding-inline-start: calc(var(--nav-row-inset) + ${level * 16}px)"
                role="treeitem"
                aria-expanded=${hasChildren ? String(expanded) : nothing}
                aria-selected=${isSelected ? 'true' : 'false'}
                tabindex=${focusKey ? (key === focusKey ? '0' : '-1') : level === 0 && idx === 0 ? '0' : '-1'}
                @focus=${() => {
                  this._focusedKey = key;
                }}
                @click=${(e) => {
                  this._selectItem(item, path);
                  if (hasChildren) this._toggleExpand(item, path, e);
                }}
                @keydown=${(e) => this._onKeyDown(e, item, path, hasChildren)}
                part="row"
              >
                <span class="tree__chevron ${hasChildren ? (expanded ? 'tree__chevron--expanded' : '') : 'tree__chevron--placeholder'}">
                  ${
                    hasChildren
                      ? html`
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  `
                      : ''
                  }
                </span>
                ${item.icon ? html`<span class="tree__icon">${item.icon}</span>` : ''}
                <span class="tree__label">${item.label}</span>
              </button>
              ${hasChildren && expanded ? this._renderItems(children, level + 1, path, focusKey) : ''}
            </li>
          `;
        })}
      </ul>
    `;
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const visibleKeys = this._collectVisibleKeys(this._items);
    const focusKey = visibleKeys.includes(this._focusedKey) ? this._focusedKey : null;
    return html`
      <div part="base" class="tree__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      ${this._renderItems(this._items, 0, [], focusKey)}
    `;
  }
}
