import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { MenuKeyboardController } from '../shared/menu-keyboard.js';
import { OverlayController } from '../shared/overlay-controller.js';
import { matchItem, highlightRuns, snippetAround } from '../shared/fuzzy-match.js';
import '../content/icon.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Spotlight-style command palette with fuzzy search and keyboard shortcuts.
 *
 * Matching is fuzzy and ranked — see shared/fuzzy-match.js for the scoring.
 * "cmdpal" finds "Command Palette", terms may be typed in any order, and
 * results come back best-first rather than in DOM order, with the matched
 * characters marked. Items are searched on their label, their `keywords`, and
 * their `description`; the description is also the second line the palette
 * renders, which is what lets a consumer search page content rather than only
 * page titles.
 *
 * @tag arc-command-palette
 * @status stable
 * @requires arc-icon
 * @requires arc-command-item
 * @requires arc-command-group
 * @prop {boolean} open - Controls whether the palette is visible. When set to true, the dialog animates in, the search input auto-focuses, and body scroll is locked. Set to false to close.
 * @prop {string} placeholder - Placeholder text displayed in the search input when the query is empty.
 * @prop {number} maxResults - How many ranked results to render. Truncation happens after ranking, so what survives is the best of the set. Raise it for a short command list; the default suits a large one.
 * @fires {CustomEvent<{ value: string, item: { label: string, shortcut: string, value: string } }>} arc-select - Fired when a command item is selected. `detail.value` is the item's `value`, falling back to its label.
 * @fires {CustomEvent<void>} arc-close - Fired when the palette closes
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart item
 * @csspart match
 * @csspart description
 * @csspart dialog - The palette panel. The scrim is `::backdrop`, which is not an
 *   element and so cannot be a part — style it with the `--palette-backdrop`
 *   custom property.
 * @csspart search
 * @csspart input
 * @csspart results
 * @csspart empty
 * @csspart group-heading
 * @csspart footer
 */
export class ArcCommandPalette extends DeclaredPropsMixin(LitElement) {
  static properties = {
    open: flag(false),
    placeholder: { type: String },
    maxResults: { type: Number, attribute: 'max-results' },
    _query: { state: true },
    _items: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      /* The dialog is the panel; the scrim is its ::backdrop. No backdrop
         element and no z-index — the top layer has no ladder to climb. The
         scrim colour comes through a custom property so a consumer can still
         reach it: ::backdrop inherits from its originating element. */
      .palette__dialog {
        position: fixed;
        top: 20%;
        left: 50%;
        margin: 0;
        padding: 0;
        transform: translateX(-50%) scale(1);
        width: 90%;
        max-width: 520px;
        max-height: none;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        overflow: hidden;
        opacity: 0;
        transition:
          opacity var(--transition-base),
          transform var(--transition-base),
          overlay var(--transition-base) allow-discrete,
          display var(--transition-base) allow-discrete;
      }

      /* display on the open rule: a closed dialog is display:none by UA
         stylesheet, and a block declaration on the base rule would override it. */
      .palette__dialog[open] {
        display: block;
        opacity: 1;
      }

      @starting-style {
        .palette__dialog[open] {
          opacity: 0;
          transform: translateX(-50%) scale(0.95);
        }
      }

      .palette__dialog:not([open]) {
        transform: translateX(-50%) scale(0.95);
      }

      .palette__dialog::backdrop {
        background: var(--palette-backdrop, var(--overlay-backdrop));
        opacity: 0;
        transition:
          opacity var(--transition-base),
          overlay var(--transition-base) allow-discrete,
          display var(--transition-base) allow-discrete;
      }

      .palette__dialog[open]::backdrop { opacity: 1; }

      @starting-style {
        .palette__dialog[open]::backdrop { opacity: 0; }
      }

      .palette__search {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-md);
        border-bottom: 1px solid var(--border-default);
      }

      .palette__search-icon {
        flex-shrink: 0;
        color: var(--text-muted);
      }

      .palette__input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-family: var(--font-body);
        font-size: var(--_text-md);
        color: var(--text-primary);
        caret-color: var(--accent-primary);
      }

      .palette__input::placeholder {
        color: var(--text-muted);
      }

      .palette__results {
        max-height: 300px;
        overflow-y: auto;
        padding: var(--space-xs) 0;
      }

      .palette__empty {
        padding: var(--space-lg);
        text-align: center;
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      .palette__empty strong {
        color: var(--text-secondary);
        font-weight: var(--font-body-weight, 500);
        overflow-wrap: anywhere;
      }

      .palette__group-heading {
        padding: var(--space-sm) var(--space-sm) var(--space-xs);
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        letter-spacing: var(--label-spacing);
        text-transform: uppercase;
        color: var(--text-ghost);
      }

      .palette__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--space-sm);
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

      .palette__item:hover,
      .palette__item.is-focused {
        background: rgba(var(--interactive-rgb), 0.08);
        color: var(--text-primary);
      }

      .palette__item-icon {
        flex-shrink: 0;
        color: var(--text-muted);
      }

      /* The text column holds the label and, when there is one, a second line.
         min-width: 0 is what lets the description ellipsize: a flex child's
         default min-width is auto, so without it the child refuses to shrink
         below its content and the shortcut gets pushed off the row instead. */
      .palette__item-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        text-align: start;
      }

      .palette__item-label {
        display: block;
      }

      /* The matched characters. A <mark> is the right element — this is a
         relevance highlight, which is what mark means — but the UA paints it
         black-on-yellow, so the colors are ours. */
      .palette__item-match {
        background: none;
        color: var(--interactive);
        font-weight: var(--font-label-weight, 600);
      }

      .palette__item-description {
        display: block;
        font-size: var(--_text-xs);
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .palette__item-shortcut {
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        color: var(--text-muted);
        opacity: 0.6;
      }

      .palette__footer {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-sm);
        border-top: 1px solid var(--border-default);
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        color: var(--text-muted);
      }

      .palette__footer kbd {
        display: inline-flex;
        align-items: center;
        padding: 2px calc(var(--space-xs) + 2px); /* cosmetic 2px vertical for kbd badge */
        background: var(--surface-hover);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
      }

      .palette__slot-host { display: none; }
    `,
  ];

  constructor() {
    super();
    this._overlay = new OverlayController(this, {
      dialog: () => this.shadowRoot?.querySelector('dialog'),
      isOpen: () => this.open,
      onRequestClose: () => this._close(),
    });
    this.placeholder = 'Type a command...';
    this.maxResults = 50;
    this._query = '';
    this._items = [];
    this._menuKb = new MenuKeyboardController(this, {
      getItemCount: () => this._filteredItems.length,
      onSelect: (i) => this._selectItem(this._filteredItems[i]),
      onClose: () => this._close(),
    });
  }

  connectedCallback() {
    super.connectedCallback();
    // slotchange fires when the palette's own children change, and not when a
    // child is added *inside* an arc-command-group — the slot assignment is
    // unchanged, so the event never comes and the item list goes stale. That is
    // the shape any asynchronous source has: results fetched on first open, a
    // remote query, a content index. Observing the subtree covers both, and the
    // recompute is a querySelectorAll over the light DOM, not a render.
    this._itemObserver = new MutationObserver(() => this._collectItems());
    this._itemObserver.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._itemObserver?.disconnect();
    this._itemObserver = null;
  }

  _onSlotChange() {
    this._collectItems();
  }

  /**
   * Flatten the slotted tree into the ordered item list.
   *
   * Reads from `this` rather than from the slot's assigned elements so it works
   * whether it was triggered by slotchange or by the observer — assignedElements
   * needs the event's slot, and the observer has no event.
   */
  _collectItems() {
    const next = [...this.querySelectorAll('arc-command-item')];
    // The observer fires for any light-DOM mutation, including ones that touch
    // no items at all; re-assigning an identical list would request an update
    // on every keystroke a consumer makes elsewhere in the subtree.
    const same = next.length === this._items.length && next.every((el, i) => el === this._items[i]);
    if (!same) this._items = next;
  }

  /**
   * Items that match the query, best first, with their matched positions.
   *
   * The empty query returns DOM order untouched: with nothing typed there is
   * nothing to rank by, and the author's ordering is the only signal there is.
   *
   * Ranking is per-group rather than global, and groups are ordered by their
   * best member. A flat global sort would interleave headings — a list that
   * reads Guides, Input, Guides, Data as the scores happen to fall — and
   * `_groupRuns` would fragment into a heading per item. Sorting inside each
   * group and moving the strongest group to the top keeps one run per heading
   * while still putting the best match first.
   */
  /**
   * Memoised on the query and the item list.
   *
   * This is a getter that scans every item, and it was being read three or four
   * times per keystroke — once by render, and again through `_filteredItems`
   * every time the keyboard controller asked for its item count. At a hundred
   * items nobody notices; against a site-search index of fourteen hundred it is
   * four full scans per character typed, which is what made the first two
   * characters of a query feel like a stall.
   */
  get _matches() {
    if (
      this._matchCache &&
      this._matchCache.query === this._query &&
      this._matchCache.items === this._items
    ) {
      return this._matchCache.result;
    }
    const result = this._computeMatches();
    this._matchCache = { query: this._query, items: this._items, result };
    return result;
  }

  _computeMatches() {
    if (!this._query.trim()) {
      return this._items.map((item) => ({ item, label: [], description: [] }));
    }

    const scored = [];
    for (const item of this._items) {
      const hit = matchItem(this._query, {
        label: item.label || '',
        keywords: item.keywords || '',
        description: item.description || '',
      });
      if (hit) scored.push({ item, ...hit });
    }

    const groups = new Map();
    for (const entry of scored) {
      const group = entry.item.closest('arc-command-group');
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(entry);
    }

    const ordered = [...groups.values()];
    for (const entries of ordered) entries.sort((a, b) => b.score - a.score);
    ordered.sort((a, b) => b[0].score - a[0].score);

    // Truncated after ranking, so what survives is the best of the set rather
    // than the first N found. A broad query against a large list matches
    // hundreds of items, and rendering hundreds of buttons on every keystroke is
    // what makes typing feel like it is fighting back. Nobody scrolls to result
    // two hundred; the fix for a query with too many matches is more query.
    return ordered.flat().slice(0, this.maxResults);
  }

  /** Kept as the list the keyboard controller and selection index against. */
  get _filteredItems() {
    return this._matches.map((m) => m.item);
  }

  /**
   * Partition the filtered items into consecutive runs sharing a group
   * heading (empty heading for ungrouped items). Each entry keeps its flat
   * index so keyboard focus and aria-activedescendant stay in sync.
   */
  _groupRuns(matches) {
    const runs = [];
    matches.forEach(({ item, label, description }, index) => {
      const group = item.closest('arc-command-group');
      const heading = (group && group.heading) || '';
      const last = runs[runs.length - 1];
      if (last && last.heading === heading) {
        last.entries.push({ item, index, label, description });
      } else {
        runs.push({ heading, entries: [{ item, index, label, description }] });
      }
    });
    return runs;
  }

  /**
   * @param {ArcCommandItem} item
   * @param {number} i flat index, for focus and aria-activedescendant
   * @param {{label?: number[], description?: number[]}} hit matched positions
   */
  _renderItem(item, i, hit = {}) {
    // Both lines are split into matched and unmatched runs rather than being
    // interpolated as markup: a command item's text is whatever the consumer
    // slotted, and building an HTML string around it would make an item titled
    // `<script>` an injection point on every keystroke.
    const label = item.label || '';
    const runs = highlightRuns(label, hit.label || []);

    // The description is windowed around its first match before rendering. A
    // section snippet runs to a couple of hundred characters and the hit is
    // usually not in the first forty, so showing the head of the string shows a
    // result whose relevance is invisible — the reader sees a row that matched
    // and no indication of where.
    const description = item.description || '';
    const snippet = description ? snippetAround(description, hit.description || []) : null;
    const descriptionRuns = snippet ? highlightRuns(snippet.text, snippet.indices) : null;

    return html`
      <button
        id="palette-item-${i}"
        class="palette__item ${i === this._menuKb.focusedIndex ? 'is-focused' : ''}"
        role="option"
        aria-selected=${i === this._menuKb.focusedIndex ? 'true' : 'false'}
        tabindex="-1"
        @click=${() => this._selectItem(item)}
        @mouseenter=${() => {
          this._menuKb.focusedIndex = i;
        }}
        part="item"
      >
        ${item.icon ? html`<arc-icon name=${item.icon} size="16" class="palette__item-icon" aria-hidden="true"></arc-icon>` : ''}
        <span class="palette__item-text">
          <span class="palette__item-label">
            ${runs.map((run) =>
              run.matched
                ? html`<mark class="palette__item-match" part="match">${run.text}</mark>`
                : run.text,
            )}
          </span>
          ${
            descriptionRuns
              ? html`<span class="palette__item-description" part="description">${descriptionRuns.map(
                  (run) =>
                    run.matched
                      ? html`<mark class="palette__item-match" part="match">${run.text}</mark>`
                      : run.text,
                )}</span>`
              : ''
          }
        </span>
        ${item.shortcut ? html`<span class="palette__item-shortcut">${item.shortcut}</span>` : ''}
      </button>
    `;
  }

  updated(changed) {
    super.updated?.(changed);
    if (this.open) {
      const focused = this.shadowRoot.querySelector('.palette__item.is-focused');
      if (focused) focused.scrollIntoView({ block: 'nearest' });
    }
    if (changed.has('open')) {
      if (this.open) {
        // Scroll lock is OverlayController's; focus, inertness, Escape and
        // focus restore are the browser's. The search input is the dialog's
        // first focusable child, so showModal() lands on it — no explicit
        // focus call, and unlike one it yields to an autofocus in the slot.
        this._query = '';
        this._menuKb.reset();
        this._menuKb.focusedIndex = 0;
        this._menuKb.attach();
      } else {
        this._menuKb.detach();
      }
    }
  }

  _onInput(e) {
    this._query = e.target.value;
    this._menuKb.focusedIndex = 0;
  }

  _selectItem(item) {
    if (!item) return;
    // detail.value is the canonical key the v3 event contract requires, and it
    // was missing here: a handler had to match the reported label and shortcut
    // back against the DOM to work out which item fired, which two items
    // sharing a label quietly get wrong. `item` stays alongside it — the shape
    // consumers already read — so this adds a key rather than moving one.
    this.dispatchEvent(
      new CustomEvent('arc-select', {
        detail: {
          value: item.selectionValue,
          item: { label: item.label, shortcut: item.shortcut, value: item.selectionValue },
        },
        bubbles: true,
        composed: true,
      }),
    );
    this._close();
  }

  _close() {
    if (!this.open) return;
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    this.open = false;
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const matches = this._matches;

    return html`
      <div part="base" class="palette__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <dialog class="palette__dialog" aria-label="Command palette" part="dialog">
        <div class="palette__search" part="search">
          <svg class="palette__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M11.5 7a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-.82 4.74a6 6 0 111.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z"/>
          </svg>
          <input
            class="palette__input"
            type="text"
            .value=${this._query}
            @input=${this._onInput}
            placeholder=${this.placeholder}
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant=${this._menuKb.focusedIndex >= 0 && matches.length > 0 ? `palette-item-${this._menuKb.focusedIndex}` : ''}
            autocomplete="off"
            spellcheck="false"
            part="input"
          />
        </div>
        <div class="palette__results" id="palette-results" role="listbox" part="results">
          ${
            matches.length === 0
              ? html`
            <div class="palette__empty" role="status" part="empty">
              ${
                this._query
                  ? html`No results for <strong>&ldquo;${this._query}&rdquo;</strong>`
                  : 'No results found'
              }
            </div>
          `
              : ''
          }
          ${this._groupRuns(matches).map(
            (run) => html`
            ${
              run.heading
                ? html`
              <div role="group" aria-label=${run.heading} class="palette__group">
                <div class="palette__group-heading" aria-hidden="true" part="group-heading">${run.heading}</div>
                ${run.entries.map((entry) => this._renderItem(entry.item, entry.index, entry))}
              </div>
            `
                : run.entries.map((entry) => this._renderItem(entry.item, entry.index, entry))
            }
          `,
          )}
        </div>
        <div class="palette__footer" part="footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </dialog>
    `;
  }
}
