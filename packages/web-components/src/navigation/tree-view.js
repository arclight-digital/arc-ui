import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-tree-view
 * @requires arc-tree-item
 */
export class ArcTreeView extends LitElement {
  static properties = {
    _items:    { state: true },
    _selected: { state: true },
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
        text-align: left;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        background: none;
        border: none;
        padding: var(--space-xs) var(--space-sm);
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
        font-size: var(--text-sm);
      }

      .tree__label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tree__line {
        position: absolute;
        left: 11px;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--divider);
      }

      .tree__slot-host { display: none; }

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
    this._items = [];
    this._selected = null;
    this._expandedSet = new Set();
  }

  _onSlotChange(e) {
    this._items = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-TREE-ITEM');
  }

  _isExpanded(item) {
    const key = item.label;
    if (this._expandedSet.has(key)) return true;
    return item.expanded === true && !this._expandedSet.has(`collapsed:${key}`);
  }

  _toggleExpand(item, e) {
    e.stopPropagation();
    const key = item.label;
    const wasExpanded = this._isExpanded(item);

    if (wasExpanded) {
      this._expandedSet.delete(key);
      this._expandedSet.add(`collapsed:${key}`);
    } else {
      this._expandedSet.add(key);
      this._expandedSet.delete(`collapsed:${key}`);
    }

    this.dispatchEvent(new CustomEvent('arc-toggle', {
      detail: { item: { label: item.label, icon: item.icon }, expanded: !wasExpanded },
      bubbles: true,
      composed: true,
    }));

    this.requestUpdate();
  }

  _selectItem(item, path) {
    this._selected = item.label;

    this.dispatchEvent(new CustomEvent('arc-select', {
      detail: { item: { label: item.label, icon: item.icon }, path },
      bubbles: true,
      composed: true,
    }));
  }

  _onKeyDown(e, item, path, hasChildren) {
    switch (e.key) {
      case 'ArrowRight':
        if (hasChildren && !this._isExpanded(item)) {
          this._toggleExpand(item, e);
        }
        break;
      case 'ArrowLeft':
        if (hasChildren && this._isExpanded(item)) {
          this._toggleExpand(item, e);
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

  _renderItems(items, level = 0, parentPath = []) {
    return html`
      <ul class="${level === 0 ? 'tree' : 'tree__group'}" role="${level === 0 ? 'tree' : 'group'}" part="${level === 0 ? 'tree' : 'group'}">
        ${(items || []).map((item, idx) => {
          const children = item.items;
          const hasChildren = children.length > 0;
          const expanded = this._isExpanded(item);
          const isSelected = this._selected === item.label;
          const path = [...parentPath, item.label];

          return html`
            <li class="tree__item" role="treeitem" aria-expanded=${hasChildren ? String(expanded) : undefined} part="item">
              ${level > 0 ? html`<div class="tree__line" style="left: ${level * 16 + 3}px"></div>` : ''}
              <button
                class="tree__row ${isSelected ? 'tree__row--selected' : ''}"
                style="padding-left: ${level * 16 + 8}px"
                tabindex=${level === 0 && idx === 0 ? '0' : '-1'}
                @click=${(e) => { this._selectItem(item, path); if (hasChildren) this._toggleExpand(item, e); }}
                @keydown=${(e) => this._onKeyDown(e, item, path, hasChildren)}
                part="row"
              >
                <span class="tree__chevron ${hasChildren ? (expanded ? 'tree__chevron--expanded' : '') : 'tree__chevron--placeholder'}">
                  ${hasChildren ? html`
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  ` : ''}
                </span>
                ${item.icon ? html`<span class="tree__icon">${item.icon}</span>` : ''}
                <span class="tree__label">${item.label}</span>
              </button>
              ${hasChildren && expanded ? this._renderItems(children, level + 1, path) : ''}
            </li>
          `;
        })}
      </ul>
    `;
  }

  render() {
    return html`
      <div class="tree__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      ${this._renderItems(this._items)}
    `;
  }
}
