import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import { PositionController } from '../shared/position-controller.js';
import { ListboxController } from '../shared/listbox-controller.js';
import { managedPanelStyles } from '../shared/position-styles.js';

/**
 * Dropdown select whose panel is a hierarchical tree — categories, instrument banks, folder
 * pickers. Group nodes expand and collapse; only leaf nodes are selectable, which keeps
 * single-select semantics clean.
 *
 * @tag arc-tree-select
 * @prop {Array<{value: string, label: string, children?: Array<object>, disabled?: boolean}>} items - Recursive tree of nodes. A node with a non-empty `children` array is a group header: it expands and collapses but can never be selected. A node without children is a selectable leaf. `disabled` nodes render but cannot be reached by keyboard or selected, and a disabled group hides its children.
 * @prop {string} value - The selected leaf's value. Setting it programmatically updates the trigger's breadcrumb label, and the branches containing it auto-expand the next time the panel opens.
 * @prop {string[]} expandedValues - Values of group nodes to render initially expanded. Attribute: `expanded-values` (JSON array). Branches containing the selected value auto-expand on open regardless of this list.
 * @prop {string} placeholder - Hint text displayed inside the trigger when no leaf is selected. It disappears once a value is chosen.
 * @prop {string} label - Visible label rendered above the trigger. Also serves as the accessible name. Always provide one for accessibility compliance.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the trigger size.
 * @prop {string} name - Form field name submitted with the selected leaf value via ElementInternals.
 * @prop {boolean} disabled - When true, the trigger becomes non-interactive: it cannot be opened, focused, or clicked, and renders with reduced opacity.
 * @prop {string} error - Error message displayed below the trigger. When set, the trigger border turns red.
 * @prop {boolean} open - Controls whether the tree panel is visible. Automatically set to false when a leaf is selected, Escape is pressed, or the user clicks outside.
 * @fires arc-change - Fired when a leaf is selected. `detail.value` is the leaf value, `detail.label` its label, and `detail.path` the array of ancestor group values from root to parent.
 * @slot none
 * @csspart tree-select
 * @csspart label
 * @csspart trigger
 * @csspart panel
 * @csspart row
 * @csspart error
 */
export class ArcTreeSelect extends FormControlMixin(LitElement) {
  static properties = {
    items: { attribute: false },
    value: { type: String, reflect: true },
    expandedValues: { type: Array, attribute: 'expanded-values' },
    placeholder: { type: String },
    label: { type: String },
    name: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    error: { type: String },
    open: { type: Boolean, reflect: true },
    _expandedKeys: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; position: relative; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .tree-select__label {
        display: block;
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--space-xs);
      }

      .tree-select__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm);
        width: 100%;
        min-height: var(--touch-min);
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: var(--field-weight, 400);
        color: var(--text-primary);
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-sizing: border-box;
        box-shadow: var(--shadow-inset);
      }

      .tree-select__trigger:hover:not(:focus-visible) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }
      .tree-select__trigger:focus-visible {
        outline: none;
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      :host([open]) .tree-select__trigger {
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      .tree-select__value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* The ancestor path stays one clear step below the leaf label. The leaf
         reads at trigger-default text-primary; the crumbs drop to muted, not to
         an adjacent gray, so the two levels actually read as two levels. */
      .tree-select__crumbs { color: var(--text-muted); }

      .tree-select__placeholder { color: var(--text-ghost); }

      .tree-select__chevron {
        font-size: var(--_text-xs);
        color: var(--text-muted);
        flex-shrink: 0;
        transition: transform var(--transition-fast) var(--ease-out-expo);
      }
      :host([open]) .tree-select__chevron { transform: rotate(180deg); }

      @keyframes panel-in {
        from { opacity: 0; transform: translateY(-4px) scale(0.96); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Resting position for a panel PositionController has not adopted:
         pre-upgrade and in prism's static HTML export. Once managed, the
         controller writes fixed viewport coordinates and the panel paints in
         the top layer. */
      .tree-select__panel {
        position: absolute;
        top: 100%;
        inset-inline-start: 0;
        inset-inline-end: 0;
        margin-top: var(--space-xs);
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        max-height: 240px;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: var(--z-dropdown);
        display: none;
      }

      :host([open]) .tree-select__panel {
        display: block;
        animation: panel-in var(--transition-fast);
      }

      .tree-select__panel::before {
        content: '';
        display: block;
        height: 1px;
        background: var(--divider-glow);
      }

      .tree-select__row {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        width: 100%;
        min-height: var(--touch-min);
        padding-block: var(--touch-pad);
        padding-inline-end: var(--space-md);
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-secondary);
        cursor: pointer;
        text-align: start;
        box-sizing: border-box;
        transition: background var(--transition-fast), color var(--transition-fast);
        white-space: nowrap;
      }

      .tree-select__row:hover,
      .tree-select__row--active {
        background: rgba(var(--interactive-rgb), 0.08);
        color: var(--text-primary);
        outline: none;
      }

      /* Selection is tint plus accent text, per the house rule. Never an edge. */
      .tree-select__row[aria-selected="true"] {
        background: rgba(var(--interactive-rgb), 0.1);
        color: var(--interactive);
      }

      .tree-select__row--disabled {
        opacity: 0.45;
        cursor: default;
      }
      .tree-select__row--disabled:hover {
        background: none;
        color: var(--text-secondary);
      }

      /* Depth rail: neutral structure only. One flat divider that never changes
         color, never carries state. */
      .tree-select__rail {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--divider);
        pointer-events: none;
      }

      .tree-select__twist {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        color: var(--text-muted);
        transition: transform var(--transition-fast);
      }
      .tree-select__twist--expanded { transform: rotate(90deg); }
      .tree-select__twist--placeholder { visibility: hidden; }

      .tree-select__row-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Sizes */
      :host([size="sm"]) .tree-select__trigger { padding: var(--space-xs) var(--space-sm); font-size: var(--_text-sm); }
      :host([size="sm"]) .tree-select__label { font-size: calc(var(--label-inline-size) - 1px); }
      :host([size="lg"]) .tree-select__trigger { padding: var(--space-md) var(--space-lg); font-size: var(--_text-md); }

      /* Error state */
      .tree-select--error .tree-select__trigger {
        border-color: var(--color-error);
      }

      .tree-select--error .tree-select__trigger:focus-visible,
      :host([open]) .tree-select--error .tree-select__trigger {
        border-color: var(--color-error);
        box-shadow: var(--interactive-focus-error);
      }

      .tree-select__error {
        font-size: var(--_text-xs);
        color: var(--color-error);
        line-height: 1.4;
        margin-top: var(--space-xs);
      }
    `,
    // animate: false — the panel has its own panel-in keyframes, and a declared
    // transform beside them is redundant at best.
    managedPanelStyles('tree-select__panel', { animate: false }),
  ];

  static _idCounter = 0;

  constructor() {
    super();
    this._treeSelectId = `tree-select-${++ArcTreeSelect._idCounter}`;
    this.items = [];
    this.value = '';
    this.expandedValues = [];
    this.placeholder = 'Select...';
    this.label = '';
    this.name = '';
    this.disabled = false;
    this.size = 'md';
    this.error = '';
    this.open = false;
    this._expandedKeys = new Set();
    // Flattened render model, rebuilt in willUpdate: every visible row, and the
    // keyboard-reachable subset (disabled rows render but are not navigable).
    this._rows = [];
    this._navRows = [];
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => {
        this.open = false;
      },
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.tree-select__trigger'),
      floating: () => this.shadowRoot?.querySelector('.tree-select__panel'),
      // The panel belongs directly under its trigger and spans its width, so
      // there is no cross-axis alignment choice to make — only whether it has
      // room below, which flip decides.
      matchWidth: true,
      offset: 4,
    });
    this._listbox = new ListboxController(this, {
      getItemCount: () => this._navRows.length,
      isOpen: () => this.open,
      onOpen: () => {
        this.open = true;
      },
      onClose: () => {
        this.open = false;
        // Virtual focus means the trigger never lost real focus, so there is
        // nothing to restore — but a click-opened panel may not have had it.
        this.shadowRoot.querySelector('.tree-select__trigger')?.focus();
      },
      // Enter lands here for group headers too: activating a group toggles it
      // rather than selecting, which is the leaf-only rule doing its job.
      onSelect: (i) => this._activateRow(this._navRows[i]),
      optionId: (i) => `${this._treeSelectId}-row-${i}`,
      scrollContainer: () => this.shadowRoot?.querySelector('.tree-select__panel'),
      // No text field of its own, so letter keys mean "jump to the row starting
      // with this" — groups and leaves alike, as a native select would.
      typeahead: true,
      getItemLabel: (i) => this._navRows[i]?.node.label ?? '',
    });
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    if (changed.has('expandedValues') && Array.isArray(this.expandedValues)) {
      const next = new Set(this._expandedKeys);
      for (const v of this.expandedValues) next.add(v);
      this._expandedKeys = next;
    }
    // Opening must reveal the current selection, whatever the user collapsed
    // last time: the branches containing it auto-expand.
    if (changed.has('open') && this.open && this.value) {
      const path = this._findPath(this.value);
      if (path && path.length > 1) {
        const next = new Set(this._expandedKeys);
        for (const node of path.slice(0, -1)) next.add(node.value);
        this._expandedKeys = next;
      }
    }
    this._computeRows();
    // Open onto the selected leaf, so arrowing starts from where the user
    // already is rather than from the top of the tree. Set here rather than in
    // updated() so the active row lands in *this* render: virtual focus is
    // render-time state, and moving it after the pass paints one frame from the
    // top of the tree and schedules a second update to correct it.
    if (changed.has('open') && this.open) {
      const selected = this._navRows.findIndex(
        (r) => !r.hasChildren && r.node.value === this.value,
      );
      if (selected >= 0) this._listbox.setActive(selected);
    }
  }

  updated(changed) {
    super.updated(changed);
    if (changed.has('open')) {
      if (this.open) {
        this._clickOutside.activate();
        this._position.show();
      } else {
        this._clickOutside.deactivate();
        this._position.hide();
        this._listbox.reset();
      }
    }
    // Expanding or collapsing a branch changes the panel's height, which can
    // change whether it still fits below the trigger.
    if (changed.has('_expandedKeys') || changed.has('items')) {
      this._listbox.clampToCount();
      if (this.open) this._position.show();
    }
  }

  /** Rebuild the flattened visible-row model from items + expansion state. */
  _computeRows() {
    const rows = [];
    const walk = (nodes, level, path) => {
      for (const node of Array.isArray(nodes) ? nodes : []) {
        const children = Array.isArray(node.children) ? node.children : null;
        const hasChildren = !!(children && children.length > 0);
        const disabled = !!node.disabled;
        const expanded = hasChildren && !disabled && this._expandedKeys.has(node.value);
        rows.push({ node, level, path, hasChildren, expanded, disabled });
        if (expanded) walk(children, level + 1, [...path, node.value]);
      }
    };
    walk(this.items, 0, []);
    this._rows = rows;
    this._navRows = rows.filter((r) => !r.disabled);
  }

  /** Nodes from root to the node carrying `value`, or null when absent. */
  _findPath(value, nodes = this.items, trail = []) {
    for (const node of Array.isArray(nodes) ? nodes : []) {
      const path = [...trail, node];
      if (node.value === value) return path;
      if (Array.isArray(node.children)) {
        const found = this._findPath(value, node.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  _toggleOpen() {
    if (this.disabled || this.readonly) return;
    this.open = !this.open;
  }

  _toggleExpand(groupValue) {
    const next = new Set(this._expandedKeys);
    if (next.has(groupValue)) next.delete(groupValue);
    else next.add(groupValue);
    this._expandedKeys = next;
  }

  /** Click or Enter on a row: groups toggle, leaves select, disabled inert. */
  _activateRow(row) {
    if (!row || row.disabled) return;
    if (row.hasChildren) {
      this._toggleExpand(row.node.value);
      return;
    }
    this.value = row.node.value;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: row.node.value, label: row.node.label, path: row.path },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleTriggerKeydown(e) {
    if (this._listbox.handleKeydown(e)) return;

    // Space and Enter open a closed panel, and activate the active row in an
    // open one. Enter-when-open is already handled above.
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!this.open) {
        this.open = true;
      } else if (this._listbox.activeIndex >= 0) {
        this._activateRow(this._navRows[this._listbox.activeIndex]);
      }
      return;
    }

    // The tree half of the keymap, mirroring arc-tree-view: ArrowRight expands
    // a collapsed group, ArrowLeft collapses an expanded one.
    if (!this.open) return;
    const active = this._navRows[this._listbox.activeIndex];
    if (!active || !active.hasChildren) return;
    if (e.key === 'ArrowRight' && !active.expanded) {
      e.preventDefault();
      this._toggleExpand(active.node.value);
    } else if (e.key === 'ArrowLeft' && active.expanded) {
      e.preventDefault();
      this._toggleExpand(active.node.value);
    }
  }

  render() {
    const pathNodes = this.value ? this._findPath(this.value) : null;
    const leaf = pathNodes?.[pathNodes.length - 1];
    const crumbs =
      pathNodes && pathNodes.length > 1
        ? pathNodes
            .slice(0, -1)
            .map((n) => n.label)
            .join(' / ')
        : '';

    const hasError = !!this.error;
    const treeId = `${this._treeSelectId}-tree`;
    const labelId = `${this._treeSelectId}-label`;
    const triggerId = `${this._treeSelectId}-trigger`;

    // Ids and the active marker index into the navigable subset, so
    // aria-activedescendant can never land on a disabled row.
    let navIndex = -1;

    return html`
      <div class="tree-select ${hasError ? 'tree-select--error' : ''}" part="tree-select">
        ${this.label ? html`<span id=${labelId} class="tree-select__label" part="label">${this.label}</span>` : ''}
        <button
          id=${triggerId}
          class="tree-select__trigger"
          role="combobox"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-haspopup="tree"
          aria-controls=${treeId}
          aria-activedescendant=${this._listbox.activeDescendantId || nothing}
          aria-labeledby=${this.label ? labelId : nothing}
          aria-label=${this.label ? nothing : this.placeholder || 'Select an option'}
          @click=${this._toggleOpen}
          @keydown=${this._handleTriggerKeydown}
          part="trigger"
        >
          ${
            leaf
              ? html`<span class="tree-select__value">${
                  crumbs ? html`<span class="tree-select__crumbs">${crumbs} / </span>` : ''
                }${leaf.label}</span>`
              : html`<span class="tree-select__placeholder">${this.placeholder}</span>`
          }
          <span class="tree-select__chevron" aria-hidden="true">&#9662;</span>
        </button>
        <div id=${treeId} class="tree-select__panel" role="tree" part="panel" aria-labeledby=${this.label ? labelId : nothing}>
          ${this._rows.map((row) => {
            if (!row.disabled) navIndex++;
            const isActive = !row.disabled && navIndex === this._listbox.activeIndex;
            const isSelected = !row.hasChildren && !row.disabled && row.node.value === this.value;
            return html`
              <div
                id=${row.disabled ? nothing : `${this._treeSelectId}-row-${navIndex}`}
                class="tree-select__row ${isActive ? 'tree-select__row--active' : ''} ${row.disabled ? 'tree-select__row--disabled' : ''}"
                style="padding-inline-start: calc(var(--space-md) + ${row.level * 16}px)"
                role="treeitem"
                aria-level=${row.level + 1}
                aria-expanded=${row.hasChildren ? String(row.expanded) : nothing}
                aria-selected=${row.hasChildren ? nothing : isSelected ? 'true' : 'false'}
                aria-disabled=${row.disabled ? 'true' : nothing}
                @click=${() => this._activateRow(row)}
                part="row"
              >
                ${Array.from(
                  { length: row.level },
                  (_, d) => html`
                  <span
                    class="tree-select__rail"
                    style="inset-inline-start: calc(var(--space-md) + ${d * 16 + 7}px)"
                    aria-hidden="true"
                  ></span>
                `,
                )}
                <span class="tree-select__twist ${row.hasChildren ? (row.expanded ? 'tree-select__twist--expanded' : '') : 'tree-select__twist--placeholder'}" aria-hidden="true">
                  ${
                    row.hasChildren
                      ? html`
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  `
                      : ''
                  }
                </span>
                <span class="tree-select__row-label">${row.node.label}</span>
              </div>
            `;
          })}
        </div>
        ${hasError ? html`<span class="tree-select__error" role="alert" part="error">${this.error}</span>` : ''}
      </div>
    `;
  }
}
