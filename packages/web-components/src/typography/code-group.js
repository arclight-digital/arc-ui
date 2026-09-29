import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, int } from '../shared/props.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import '../input/copy-button.js';

/** Every connected group, for keeping groups that share a `sync-key` together. */
const groups = new Set();

const storageKey = (key) => `arc-code-group:${key}`;

function readChoice(key) {
  try {
    return localStorage.getItem(storageKey(key));
  } catch {
    return null;
  }
}

function writeChoice(key, label) {
  try {
    localStorage.setItem(storageKey(key), label);
  } catch {
    // Storage blocked or full: the choice still applies for this page.
  }
}

/**
 * One code block with tabs for its variants: npm, pnpm and yarn, or the same
 * command for two editions of a product.
 *
 * Each child `arc-code-block` is a tab, named by its `label` (or its
 * `filename`, or its `language`). The group draws the frame, the tab strip and
 * a single copy button that copies the visible block; the blocks drop their
 * own header. Groups with the same `sync-key` switch together across the page,
 * and the choice is remembered in localStorage under that key.
 *
 * Before the component upgrades, and without JavaScript, the blocks show one
 * after another with their own headers, so nothing is hidden from a reader.
 * A server render selects the first tab; a remembered choice applies once the
 * page is live.
 *
 * @tag arc-code-group
 * @status stable
 * @child arc-code-block
 * @requires arc-copy-button
 * @prop {number} selected - Index of the visible block. Out-of-range values fall back to the first block.
 * @prop {string} syncKey - Groups with the same key switch together, matched by tab name, and the choice is remembered in localStorage (`arc-code-group:<key>`).
 * @prop {string} label - Accessible name for the tab list, such as "Package manager".
 * @fires {CustomEvent<{ value: string, index: number }>} arc-change - The user picked a tab. `detail.value` is the tab's name, `detail.index` its position. Not fired on groups that follow along through `sync-key`.
 * @slot - `arc-code-block` elements, one per tab, in order.
 * @csspart base - The root element: the frame.
 * @csspart bar - The strip holding the tabs and the copy button.
 * @csspart tabs - The tab list.
 * @csspart tab - One tab. The selected one adds `tab-selected`.
 * @csspart tab-selected
 * @csspart copy - The copy button.
 * @csspart panel - The area holding the visible block.
 */
export class ArcCodeGroup extends DeclaredPropsMixin(LitElement) {
  static properties = {
    selected: int({ default: 0, min: 0 }),
    syncKey: { type: String, attribute: 'sync-key', reflect: true },
    label: { type: String },
    _tabs: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .code-group {
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      /* The same 36px bar as arc-code-block's header. */
      .code-group__bar {
        display: flex;
        align-items: stretch;
        gap: 2px;
        min-height: 36px;
        box-sizing: border-box;
        padding-inline: 4px;
        border-bottom: 1px solid var(--divider);
        background: var(--surface-raised);
      }

      .code-group__tabs {
        display: flex;
        align-items: stretch;
        gap: 2px;
        min-width: 0;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .code-group__tab {
        position: relative;
        flex: none;
        padding: 0 var(--space-sm);
        border: 0;
        background: none;
        cursor: pointer;
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        white-space: nowrap;
        transition: color var(--transition-fast);
      }

      .code-group__tab:hover {
        color: var(--text-secondary);
      }

      .code-group__tab[aria-selected='true'] {
        color: var(--text-primary);
      }

      /* The underline sits on the divider, lit like the accent it is. */
      .code-group__tab[aria-selected='true']::after {
        content: '';
        position: absolute;
        inset-inline: var(--space-sm);
        bottom: -1px;
        height: 2px;
        border-radius: 1px;
        background: var(--accent-primary);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.6);
      }

      .code-group__tab:focus-visible {
        outline: none;
        box-shadow: inset var(--interactive-focus);
        border-radius: var(--radius-sm);
      }

      .code-group__copy {
        display: flex;
        align-items: center;
        margin-inline-start: auto;
      }

      @media (prefers-reduced-motion: reduce) {
        .code-group__tab { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.syncKey = '';
    this.label = '';
    this._tabs = [];
    this._blocks = [];
    this._adopted = false;
  }

  connectedCallback() {
    super.connectedCallback();
    groups.add(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    groups.delete(this);
  }

  /** The index actually shown: `selected`, or 0 when it is out of range. */
  get _index() {
    return this.selected < this._blocks.length ? this.selected : 0;
  }

  _nameOf(block, i) {
    return (
      block.label ||
      block.getAttribute('label') ||
      block.getAttribute('filename') ||
      block.getAttribute('language') ||
      `Tab ${i + 1}`
    );
  }

  /**
   * Adopt the slotted blocks. The tabs are state set here rather than in the
   * first render, because a server render cannot see the light DOM: the first
   * client render has to match the server's empty tab list, and the tabs
   * arrive one update later.
   */
  _onSlotChange(e) {
    this._blocks = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.localName === 'arc-code-block');
    this._blocks.forEach((block) => block.setAttribute('data-grouped', ''));
    this._tabs = this._blocks.map((block, i) => this._nameOf(block, i));
    if (!this._adopted && this.syncKey) {
      this._adopted = true;
      const stored = readChoice(this.syncKey);
      const at = stored === null ? -1 : this._tabs.indexOf(stored);
      if (at >= 0) this.selected = at;
    }
    this._showSelected();
  }

  _showSelected() {
    const index = this._index;
    this._blocks.forEach((block, i) => {
      block.hidden = i !== index;
    });
  }

  firstUpdated() {
    // Under declarative shadow DOM the slot is already assigned and no
    // slotchange arrives; this delivers it.
    hydrateSlots(this);
  }

  updated(changed) {
    super.updated?.(changed);
    if (changed.has('selected')) this._showSelected();
  }

  /** Select by position; `user` picks fire arc-change, remember, and sync. */
  _select(index, { user = false, focus = false } = {}) {
    const count = this._tabs.length;
    if (!count) return;
    const next = ((index % count) + count) % count;
    const changed = next !== this._index;
    this.selected = next;
    if (focus) {
      this.updateComplete.then(() => this.shadowRoot.querySelector(`#tab-${next}`)?.focus());
    }
    if (!user || !changed) return;
    const name = this._tabs[next];
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: name, index: next },
        bubbles: true,
        composed: true,
      }),
    );
    if (this.syncKey) {
      writeChoice(this.syncKey, name);
      for (const group of groups) {
        if (group !== this && group.syncKey === this.syncKey) group._follow(name);
      }
    }
  }

  /** Switch to the tab with this name, if there is one. No event. */
  _follow(name) {
    const at = this._tabs.indexOf(name);
    if (at >= 0) this.selected = at;
  }

  _onKeyDown(e) {
    const i = this._index;
    const moves = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: this._tabs.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    this._select(moves[e.key], { user: true, focus: true });
  }

  /**
   * Hand the copy button the visible block's code just before it copies. A
   * binding would go stale: the group re-renders on its own changes, not when
   * a block's `code` is set.
   */
  _primeCopy(e) {
    e.currentTarget.value = this._blocks[this._index]?.code ?? '';
  }

  render() {
    const index = this._index;
    return html`
      <div class="code-group" part="base">
        <div class="code-group__bar" part="bar">
          <div
            class="code-group__tabs"
            role="tablist"
            aria-label=${this.label || 'Code variants'}
            part="tabs"
            @keydown=${this._onKeyDown}
          >
            ${this._tabs.map(
              (name, i) => html`<button
                class="code-group__tab"
                id="tab-${i}"
                type="button"
                role="tab"
                aria-selected=${i === index ? 'true' : 'false'}
                tabindex=${i === index ? '0' : '-1'}
                part=${['tab', i === index ? 'tab-selected' : ''].join(' ').trim()}
                @click=${() => this._select(i, { user: true })}
              >
                ${name}
              </button>`,
            )}
          </div>
          <div class="code-group__copy">
            <arc-copy-button
              icon-only
              label="Copy code"
              part="copy"
              @pointerdown=${this._primeCopy}
              @keydown=${this._primeCopy}
              @focusin=${this._primeCopy}
            ></arc-copy-button>
          </div>
        </div>
        <div
          class="code-group__panel"
          role="tabpanel"
          aria-labelledby=${this._tabs.length ? `tab-${index}` : nothing}
          part="panel"
        >
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
      </div>
    `;
  }
}
