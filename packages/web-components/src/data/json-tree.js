import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * How many children of one object or array render before the tree inserts a
 * "show N more" expander. json-tree is an inspector, not a data grid: the
 * boundary keeps a pathological payload from minting tens of thousands of DOM
 * nodes, and each activation of the expander reveals the next page. For data
 * that is genuinely large-scale, arc-virtual-list is the right component.
 */
const PAGE_SIZE = 100;

/** Strings longer than this truncate in the row; the full value moves to title. */
const STRING_MAX = 100;

/** Path-segment separator for expansion bookkeeping keys. */
const SEP = '\u001F';

/**
 * Collapsible JSON explorer with house syntax coloring — the dev-tools
 * inspector for API payloads, configuration objects, and structured state.
 * Pure recursive rendering with zero dependencies: unlike arc-code-block it
 * loads no highlighter, so it ships in the register barrel.
 *
 * @tag arc-json-tree
 * @prop {object} data - The value to render. Set as a property for objects and arrays; takes precedence over the json attribute when both are set.
 * @prop {string} json - JSON string alternative to the data property, for attribute-only use. Parsed with try/catch; invalid input renders a small inline error state instead of throwing.
 * @prop {number | boolean} expanded - How many levels open initially (default 1). As a bare boolean attribute, every level opens.
 * @prop {boolean} keysQuoted - Render object keys with quotes. Off by default, matching devtools.
 * @fires arc-toggle - Fired when a node is expanded or collapsed, with the node path and new expanded state
 * @slot none
 * @csspart container
 * @csspart item
 * @csspart row
 * @csspart key
 * @csspart value
 * @csspart preview
 * @csspart error
 */
export class ArcJsonTree extends LitElement {
  static properties = {
    data: { type: Object, attribute: false },
    json: { type: String },
    expanded: {
      converter: {
        fromAttribute: (v) => {
          if (v === null) return 1;
          if (v === '' || v === 'true') return true;
          const n = Number(v);
          return Number.isFinite(n) ? n : true;
        },
      },
    },
    keysQuoted: { type: Boolean, attribute: 'keys-quoted' },
    _focusedKey: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .json-tree {
        font-family: var(--font-mono);
        font-size: var(--code-size);
        line-height: var(--code-lh);
        background: var(--surface-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: var(--space-sm);
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
      }

      .json-tree__list,
      .json-tree__group {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      /* Motivated motion: a branch opening directs the eye to what appeared.
         Opacity and transform only, and the global reduced-motion clamp in
         tokenStyles makes it instant. */
      .json-tree__group {
        animation: json-tree-reveal var(--duration-fast) var(--ease-out) backwards;
      }

      @keyframes json-tree-reveal {
        from {
          opacity: 0;
          transform: translateY(-2px);
        }
      }

      .json-tree__item {
        position: relative;
      }

      .json-tree__row {
        display: flex;
        align-items: center;
        width: 100%;
        text-align: start;
        font: inherit;
        color: var(--text-secondary);
        background: none;
        border: none;
        padding-block: 1px;
        padding-inline-end: var(--space-sm);
        border-radius: var(--radius-sm);
        cursor: default;
        transition: background var(--transition-fast);
      }

      .json-tree__row--branch,
      .json-tree__row--more {
        cursor: pointer;
      }

      .json-tree__row:hover {
        background: rgba(var(--interactive-rgb), 0.04);
      }

      .json-tree__row:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .json-tree__chevron {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-inline-end: var(--space-xs);
        flex-shrink: 0;
        color: var(--text-muted);
        transition: transform var(--transition-fast);
      }

      .json-tree__chevron--expanded {
        transform: rotate(90deg);
      }

      .json-tree__chevron--placeholder {
        visibility: hidden;
      }

      .json-tree__text {
        white-space: pre;
      }

      /* Structural depth rail: one flat divider that never carries color or
         state. Value types tint the text, never this line. */
      .json-tree__line {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--divider);
      }

      .json-tree__key {
        color: var(--accent-secondary);
      }

      .json-tree__index {
        color: var(--text-muted);
      }

      .json-tree__punct {
        color: var(--text-muted);
      }

      /* Value colors follow the shiki-variables mapping in arc-code-block:
         strings take the success hue, numbers the primary accent, keys the
         secondary accent — booleans and null get the warning hue so absence
         and flags read at a glance. All base tokens, so themes recolor them. */
      .json-tree__value--string {
        color: var(--color-success);
      }

      .json-tree__value--number {
        color: var(--accent-primary);
      }

      .json-tree__value--boolean,
      .json-tree__value--null {
        color: var(--color-warning);
      }

      .json-tree__preview {
        color: var(--text-muted);
      }

      .json-tree__closer {
        color: var(--text-muted);
        padding-block: 1px;
        white-space: pre;
      }

      .json-tree__more {
        color: var(--interactive);
      }

      .json-tree__row--more:hover .json-tree__more {
        text-decoration: underline;
      }

      .json-tree__error {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs);
        align-items: baseline;
      }

      .json-tree__error-label {
        color: color-mix(in srgb, var(--color-error), var(--text-primary) 40%);
      }

      .json-tree__error-detail {
        color: var(--text-muted);
      }
    `,
  ];

  constructor() {
    super();
    this.data = undefined;
    this.json = '';
    this.expanded = 1;
    this.keysQuoted = false;
    this._focusedKey = null;
    this._overrides = new Map();
    this._shown = new Map();
    this._parsed = undefined;
    this._parseError = '';
  }

  willUpdate(changed) {
    if (changed.has('json')) {
      this._parsed = undefined;
      this._parseError = '';
      if (this.json) {
        try {
          this._parsed = JSON.parse(this.json);
        } catch (err) {
          this._parseError = err instanceof Error ? err.message : String(err);
        }
      }
    }
    // A new value or a new depth default invalidates per-node bookkeeping.
    if (changed.has('data') || changed.has('json') || changed.has('expanded')) {
      this._overrides = new Map();
      this._shown = new Map();
    }
  }

  /** The value being inspected: the property wins, the parsed attribute follows. */
  _value() {
    return this.data !== undefined ? this.data : this._parsed;
  }

  /** Initial-expansion depth. `true` (bare attribute) means every level. */
  _depth() {
    if (this.expanded === true || this.expanded === Infinity) return Infinity;
    const n = Number(this.expanded);
    return Number.isFinite(n) && n >= 0 ? n : 1;
  }

  _pathKey(path) {
    return path.join(SEP);
  }

  _entriesOf(value) {
    return Array.isArray(value) ? value.map((v, i) => [i, v]) : Object.entries(value);
  }

  _isExpanded(pathKey, level) {
    return this._overrides.has(pathKey) ? this._overrides.get(pathKey) : level < this._depth();
  }

  _toggle(node) {
    const next = !this._isExpanded(node.pathKey, node.level);
    this._overrides.set(node.pathKey, next);

    this.dispatchEvent(
      new CustomEvent('arc-toggle', {
        detail: { path: node.path, expanded: next },
        bubbles: true,
        composed: true,
      }),
    );

    this.requestUpdate();
  }

  _revealMore(node) {
    const shown = this._shown.get(node.parentKey) ?? PAGE_SIZE;
    this._shown.set(node.parentKey, shown + PAGE_SIZE);

    // The expander may disappear once everything is shown; hand focus to the
    // first newly revealed row so keyboard users are not dropped on the floor.
    const nextKey = this._pathKey([...node.path, String(node.nextChildKey)]);
    this._focusedKey = nextKey;
    this.requestUpdate();
    this.updateComplete.then(() => {
      for (const row of this.shadowRoot?.querySelectorAll('.json-tree__row') ?? []) {
        if (row.dataset.key === nextKey) {
          row.focus();
          break;
        }
      }
    });
  }

  _activate(node) {
    if (node.more) this._revealMore(node);
    else if (node.branch) this._toggle(node);
  }

  /* Keyboard mirrors the arc-tree-view keymap: Down/Up walk visible rows,
     Right opens a closed branch, Left closes an open one, Enter and Space
     activate — which for json-tree means toggle. */
  _onKeyDown(e, node) {
    switch (e.key) {
      case 'ArrowRight':
        if (node.branch && !node.open) this._toggle(node);
        break;
      case 'ArrowLeft':
        if (node.branch && node.open) this._toggle(node);
        break;
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        const rows = [...this.shadowRoot.querySelectorAll('.json-tree__row')];
        const idx = rows.indexOf(e.target);
        if (e.key === 'ArrowDown' && idx < rows.length - 1) rows[idx + 1].focus();
        if (e.key === 'ArrowUp' && idx > 0) rows[idx - 1].focus();
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._activate(node);
        break;
    }
  }

  /** Visible-row keys under current expansion, for roving-tabindex recovery. */
  _collectVisibleKeys(value, path = [], keys = []) {
    const pathKey = this._pathKey(path);
    keys.push(pathKey);
    if (value === null || typeof value !== 'object') return keys;
    const entries = this._entriesOf(value);
    if (entries.length > 0 && this._isExpanded(pathKey, path.length)) {
      const shown = this._shown.get(pathKey) ?? PAGE_SIZE;
      for (const [k, v] of entries.slice(0, shown)) {
        this._collectVisibleKeys(v, [...path, String(k)], keys);
      }
      if (entries.length > shown) keys.push(pathKey + SEP + SEP + 'more');
    }
    return keys;
  }

  _renderPrimitive(value) {
    if (typeof value === 'string') {
      const truncated = value.length > STRING_MAX;
      const shown = truncated ? `${value.slice(0, STRING_MAX)}…` : value;
      return html`<span
        class="json-tree__value json-tree__value--string"
        part="value"
        title=${truncated ? value : nothing}
      >"${shown}"</span>`;
    }
    if (typeof value === 'number' || typeof value === 'bigint') {
      return html`<span class="json-tree__value json-tree__value--number" part="value">${String(value)}</span>`;
    }
    if (typeof value === 'boolean') {
      return html`<span class="json-tree__value json-tree__value--boolean" part="value">${String(value)}</span>`;
    }
    // null, plus anything non-JSON that arrives via the property (undefined).
    return html`<span class="json-tree__value json-tree__value--null" part="value">${String(value)}</span>`;
  }

  _renderKey(key) {
    if (key === null) return nothing;
    if (typeof key === 'number') {
      return html`<span class="json-tree__index" part="key">${key}</span><span class="json-tree__punct">: </span>`;
    }
    return html`<span class="json-tree__key" part="key">${this.keysQuoted ? `"${key}"` : key}</span><span class="json-tree__punct">: </span>`;
  }

  _renderChevron(branch, open) {
    if (!branch)
      return html`<span class="json-tree__chevron json-tree__chevron--placeholder"></span>`;
    return html`
      <span class="json-tree__chevron ${open ? 'json-tree__chevron--expanded' : ''}">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    `;
  }

  _renderMore(entries, shown, level, parentPath, parentKey, focusKey) {
    const remaining = entries.length - shown;
    const moreKey = parentKey + SEP + SEP + 'more';
    const node = {
      pathKey: moreKey,
      parentKey,
      path: parentPath,
      level,
      more: true,
      nextChildKey: entries[shown][0],
    };
    const tab = focusKey !== null ? (moreKey === focusKey ? '0' : '-1') : '-1';

    return html`
      <li class="json-tree__item" role="none" part="item">
        <div class="json-tree__line" style="inset-inline-start: calc(var(--space-xs) + ${(level - 1) * 16 + 8}px)"></div>
        <button
          class="json-tree__row json-tree__row--more"
          style="padding-inline-start: calc(var(--space-xs) + ${level * 16}px)"
          role="treeitem"
          aria-level=${level + 1}
          data-key=${moreKey}
          tabindex=${tab}
          part="row"
          @focus=${() => {
            this._focusedKey = moreKey;
          }}
          @click=${() => this._activate(node)}
          @keydown=${(e) => this._onKeyDown(e, node)}
        >
          <span class="json-tree__chevron json-tree__chevron--placeholder"></span>
          <span class="json-tree__text"><span class="json-tree__more">show ${remaining} more…</span></span>
        </button>
      </li>
    `;
  }

  _renderNode(value, key, level, path, focusKey, isFirst) {
    const pathKey = this._pathKey(path);
    const container = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);
    const entries = container ? this._entriesOf(value) : null;
    const branch = container && entries.length > 0;
    const open = branch && this._isExpanded(pathKey, level);
    const node = { pathKey, path, level, branch, open };
    // The root row's path key is the empty string, so compare against null
    // rather than truthiness or the focused root would fall through.
    const tab = focusKey !== null ? (pathKey === focusKey ? '0' : '-1') : isFirst ? '0' : '-1';

    let valuePart;
    if (!container) {
      valuePart = this._renderPrimitive(value);
    } else if (!branch) {
      valuePart = html`<span class="json-tree__preview" part="preview">${isArray ? '[]' : '{}'}</span>`;
    } else if (open) {
      valuePart = html`<span class="json-tree__punct">${isArray ? '[' : '{'}</span>`;
    } else {
      const n = entries.length;
      const unit = isArray ? (n === 1 ? 'item' : 'items') : n === 1 ? 'key' : 'keys';
      valuePart = html`<span class="json-tree__preview" part="preview">${isArray ? '[…]' : '{…}'} ${n} ${unit}</span>`;
    }

    let children = nothing;
    let closer = nothing;
    if (open) {
      const shown = this._shown.get(pathKey) ?? PAGE_SIZE;
      const visible = entries.slice(0, shown);
      children = html`
        <ul class="json-tree__group" role="group">
          ${visible.map(([k, v]) => this._renderNode(v, k, level + 1, [...path, String(k)], focusKey, false))}
          ${
            entries.length > shown
              ? this._renderMore(entries, shown, level + 1, path, pathKey, focusKey)
              : nothing
          }
        </ul>
      `;
      closer = html`<div class="json-tree__closer" style="padding-inline-start: calc(var(--space-xs) * 2 + ${level * 16 + 16}px)">${isArray ? ']' : '}'}</div>`;
    }

    return html`
      <li class="json-tree__item" role="none" part="item">
        ${
          level > 0
            ? html`<div class="json-tree__line" style="inset-inline-start: calc(var(--space-xs) + ${(level - 1) * 16 + 8}px)"></div>`
            : nothing
        }
        <button
          class="json-tree__row ${branch ? 'json-tree__row--branch' : ''}"
          style="padding-inline-start: calc(var(--space-xs) + ${level * 16}px)"
          role="treeitem"
          aria-level=${level + 1}
          aria-expanded=${branch ? String(open) : nothing}
          data-key=${pathKey}
          tabindex=${tab}
          part="row"
          @focus=${() => {
            this._focusedKey = pathKey;
          }}
          @click=${() => this._activate(node)}
          @keydown=${(e) => this._onKeyDown(e, node)}
        >
          ${this._renderChevron(branch, open)}
          <span class="json-tree__text">${this._renderKey(key)}${valuePart}</span>
        </button>
        ${children}
        ${closer}
      </li>
    `;
  }

  render() {
    if (this._parseError && this.data === undefined) {
      return html`
        <div class="json-tree" part="container">
          <div class="json-tree__error" part="error" role="status">
            <span class="json-tree__error-label">Invalid JSON</span>
            <span class="json-tree__error-detail">${this._parseError}</span>
          </div>
        </div>
      `;
    }

    const value = this._value();
    if (value === undefined) return nothing;

    const visibleKeys = this._collectVisibleKeys(value);
    const focusKey = visibleKeys.includes(this._focusedKey) ? this._focusedKey : null;

    return html`
      <div class="json-tree" part="container">
        <ul class="json-tree__list" role="tree">
          ${this._renderNode(value, null, 0, [], focusKey, true)}
        </ul>
      </div>
    `;
  }
}
