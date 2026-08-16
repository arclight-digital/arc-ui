import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, oneOf, int } from '../shared/props.js';

/**
 * Tabbed content navigation with keyboard support and ARIA roles.
 *
 * @tag arc-tabs
 * @status stable
 * @requires arc-tab
 * @prop {number} selected - Zero-based index of the currently active tab. Changing this value programmatically switches the visible panel and updates ARIA attributes. Out-of-range values are clamped to the nearest valid index.
 * @prop {'start' | 'center' | 'end'} align - Aligns the tab list. Options: 'start', 'center', 'end'.
 * @prop {'underline' | 'pills'} variant - Visual style of the tabs. Options: 'underline', 'pills'.
 * @prop {'horizontal' | 'vertical'} orientation - Layout direction of the tab list. Use 'vertical' to place tabs in a sidebar column with the panel to the right. Arrow-key navigation automatically switches to up/down in vertical mode.
 * @fires arc-change - Fired when the active tab changes
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart tabs
 */
export class ArcTabs extends DeclaredPropsMixin(LitElement) {
  /**
   * `max` names a getter rather than a literal, so the bound tracks the tab
   * count — this is what makes the "clamped to the nearest valid index" claim
   * in the JSDoc above true rather than aspirational (finding #1).
   */
  static properties = {
    selected: int({ default: 0, min: 0, max: '_maxIndex', clamp: 'toRange', reflect: true }),
    align: oneOf(['start', 'center', 'end']),
    variant: oneOf(['underline', 'pills']),
    orientation: oneOf(['horizontal', 'vertical']),
    _tabs: { state: true },
  };

  /** Upper bound for `selected`; undefined while there are no tabs to bound it. */
  get _maxIndex() {
    return this._tabs?.length ? this._tabs.length - 1 : undefined;
  }

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .tabs__list {
        display: flex;
        border-bottom: 1px solid var(--divider);
        gap: var(--space-xs);
        overflow-x: auto;
        overflow-y: hidden;
      }

      /* Alignment */
      :host([align="center"]) .tabs__list { justify-content: center; }
      :host([align="end"]) .tabs__list { justify-content: flex-end; }

      .tabs__tab {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-ghost);
        background: none;
        border: none;
        padding: var(--touch-pad) var(--space-md);
        min-height: var(--touch-min);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast), transform 150ms var(--ease-out-expo);
        white-space: nowrap;
      }

      .tabs__tab:hover:not(:disabled) { color: var(--text-primary); }
      .tabs__tab:active:not(:disabled) { transform: scale(0.95); }

      .tabs__tab:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .tabs__tab[aria-selected="true"] {
        color: var(--interactive);
        border-bottom-color: var(--interactive);
        box-shadow: 0 2px 12px rgba(var(--interactive-rgb), 0.2);
      }

      /* Pills variant */
      :host([variant="pills"]) .tabs__list {
        border-bottom: none;
        gap: var(--space-xs);
      }

      :host([variant="pills"]) .tabs__tab {
        border-bottom: none;
        margin-bottom: 0;
        border-radius: var(--radius-sm);
      }

      :host([variant="pills"]) .tabs__tab:hover {
        background: rgba(var(--text-primary-rgb), 0.08);
      }

      :host([variant="pills"]) .tabs__tab[aria-selected="true"] {
        background: rgba(var(--interactive-rgb), 0.1);
        color: var(--interactive);
        box-shadow: var(--interactive-hover);
      }
      .tabs__tab:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
        border-radius: var(--radius-sm);
      }

      .tabs__panel {
        padding: var(--space-lg) 0;
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: var(--body-lh);
      }

      .tabs__panel[hidden] { display: none; }

      /* ── Vertical orientation ── */
      :host([orientation="vertical"]) .tabs {
        display: flex;
        flex-direction: row;
      }

      :host([orientation="vertical"]) .tabs__list {
        flex-direction: column;
        border-bottom: none;
        border-inline-end: 1px solid var(--divider);
        overflow-y: auto;
        overflow-x: hidden;
        min-width: 180px;
      }

      :host([orientation="vertical"]) .tabs__tab {
        border-bottom: none;
        margin-bottom: 0;
        border-inline-end: 2px solid transparent;
        margin-inline-end: -1px;
        text-align: start;
      }

      :host([orientation="vertical"]) .tabs__tab[aria-selected="true"] {
        border-bottom-color: transparent;
        border-inline-end-color: var(--interactive);
      }

      :host([orientation="vertical"]) .tabs__panel {
        padding: 0 0 0 var(--space-lg);
        flex: 1;
        min-width: 0;
      }

      /* Vertical + Pills variant */
      :host([orientation="vertical"][variant="pills"]) .tabs__list {
        border-inline-end: none;
      }

      :host([orientation="vertical"][variant="pills"]) .tabs__tab {
        border-inline-end: none;
        margin-inline-end: 0;
      }
    `,
  ];

  constructor() {
    super();
    this._tabs = [];
  }

  _onSlotChange(e) {
    const slot = e.target;
    const children = slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-TAB');
    this._tabs = children;
    this._syncVisibility();
  }

  _syncVisibility() {
    this._tabs.forEach((tab, i) => {
      tab.hidden = i !== this.selected;
    });
  }

  /** Whether the tab at `index` refuses selection (finding #4). */
  _isDisabled(index) {
    return this._tabs[index]?.disabled === true;
  }

  /**
   * The next selectable index walking `step` from `from`, wrapping, or
   * `undefined` when every tab is disabled. Written as a bounded walk rather
   * than a `while` so a fully disabled bar terminates instead of spinning.
   */
  _seek(from, step) {
    const n = this._tabs.length;
    for (let i = 1; i <= n; i += 1) {
      const candidate = (from + step * i + n * i) % n;
      if (!this._isDisabled(candidate)) return candidate;
    }
    return undefined;
  }

  _select(index) {
    if (this._isDisabled(index)) return;

    this.selected = index;
    this._syncVisibility();

    const label = this._tabs[index]?.label;

    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: index, label },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleKeydown(e) {
    const tabs = [...this.shadowRoot.querySelectorAll('.tabs__tab')];
    const current = tabs.indexOf(e.target);
    let next;

    const isVertical = this.orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    if (e.key === nextKey) next = this._seek(current, 1);
    else if (e.key === prevKey) next = this._seek(current, -1);
    else if (e.key === 'Home') next = this._seek(-1, 1);
    else if (e.key === 'End') next = this._seek(tabs.length, -1);
    else return;

    // The key is ours whether or not a target survives the disabled filter —
    // an all-disabled bar must not scroll the page instead.
    e.preventDefault();
    if (next === undefined) return;
    tabs[next].focus();
    this._select(next);
  }

  updated(changed) {
    if (changed.has('selected')) {
      this._syncVisibility();
    }
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    return html`
      <div class="tabs" part="base tabs">
        <div class="tabs__list" role="tablist" aria-orientation=${this.orientation} @keydown=${this._handleKeydown}>
          ${this._tabs.map(
            (tab, i) => html`
            <button
              class="tabs__tab"
              role="tab"
              aria-selected=${i === this.selected ? 'true' : 'false'}
              ?disabled=${tab.disabled === true}
              tabindex=${i === this.selected ? '0' : '-1'}
              id="tab-${i}"
              aria-controls="panel"
              @click=${() => this._select(i)}
            >${tab.label}</button>
          `,
          )}
        </div>

        <!--
          One panel, one id. Every tab's aria-controls points at it because
          every tab controls it — the panel does not swap elements, it swaps
          which arc-tab child is unhidden inside it. Per-tab ids were the
          defect: only the selected tab's reference resolved (finding #2).
        -->
        <div
          class="tabs__panel"
          role="tabpanel"
          id="panel"
          aria-labelledby="tab-${this.selected}"
        >
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
      </div>
    `;
  }
}
