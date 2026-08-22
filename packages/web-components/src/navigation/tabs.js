import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { observeResize } from '../shared/subscriptions.js';
import { DeclaredPropsMixin, oneOf, int } from '../shared/props.js';

/**
 * The smallest scroll offset that puts `[start, start + size]` inside a port of
 * `port` currently at `offset` — the one-axis form of "nearest".
 */
function nearestScroll(offset, port, start, size) {
  if (start < offset) return start;
  if (start + size > offset + port) return start + size - port;
  return offset;
}

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
 * @csspart indicator - The light that travels between tabs: the underline in the default variant, the ground behind the selection in `pills` and in vertical bars.
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
      :host {
        display: block;
        /* The indicator's light. A lobe shape substitutes its var()s at the
           element that declares it, and the shapes are declared on :host — an
           input set on the indicator itself would paint in the fallback color
           with nothing failing. */
        --lobe-rgb: var(--interactive-rgb);
        --lobe-alpha: 1;
      }

      .tabs__list {
        position: relative;
        display: flex;
        border-bottom: 1px solid var(--divider);
        gap: var(--space-xs);
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        /* A scrollbar here would lie directly on the divider and read as a
           second rule under the bar. Overflow announces itself through the
           half-cut tab at the edge, and the selection scrolls itself into
           view, so nothing depends on the bar being visible. */
        scrollbar-width: none;
      }

      .tabs__list::-webkit-scrollbar { display: none; }

      /* Alignment */
      :host([align="center"]) .tabs__list { justify-content: center; }
      :host([align="end"]) .tabs__list { justify-content: flex-end; }

      /* ── The indicator ──
         One element for every variant and orientation: the component hands it
         the selected button's box and CSS decides what to paint inside that
         box. This is what makes a selection *travel* — the tab you left and
         the tab you chose are connected by the same piece of light moving
         between them, which is the one authored moment here. Everything else
         in the bar stays quiet so the move stays legible. */
      .tabs__ind {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        width: var(--_ind-w, 0px);
        height: var(--_ind-h, 0px);
        transform: translate(var(--_ind-x, 0px), var(--_ind-y, 0px));
        pointer-events: none;
        opacity: 0;
        transition:
          transform var(--duration-base) var(--ease-out),
          width var(--duration-base) var(--ease-out),
          height var(--duration-base) var(--ease-out),
          opacity var(--transition-fast);
      }

      /* Measured for the first time, or re-measured after a resize. Neither is
         a selection, so neither travels — without this the indicator flies in
         from the list's origin on load and lurches on every reflow. */
      .tabs__ind.is-instant { transition: none; }

      .tabs__ind.is-on { opacity: 1; }

      /* Underline: a lobe laid along the divider, brightest under the label
         and thinning to nothing at both ends, rather than a 2px rectangle
         that starts and stops. */
      .tabs__ind::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        bottom: 0;
        height: 2px;
        background: var(--lobe-line);
        box-shadow: 0 0 10px rgba(var(--interactive-rgb), 0.45);
      }

      /* …and the light that line throws back up into the tab it marks. Glow
         over definition: the selected tab is lit, not outlined. */
      .tabs__ind::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(var(--interactive-rgb), 0.14),
          rgba(var(--interactive-rgb), 0) 72%
        );
      }

      .tabs__tab {
        position: relative;
        z-index: 1;
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: var(--label-spacing);
        text-transform: uppercase;
        color: var(--text-ghost);
        background: none;
        border: none;
        padding: var(--touch-pad) var(--space-md);
        min-height: var(--touch-min);
        cursor: pointer;
        /* Not a state — the gutter the indicator's line sits in, and the 1px
           of overlap that puts it on top of the divider rather than above it. */
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        transition:
          color var(--transition-fast),
          background var(--transition-fast),
          transform 150ms var(--ease-out);
        white-space: nowrap;
      }

      .tabs__tab:hover:not(:disabled):not([aria-selected="true"]) {
        color: var(--text-primary);
        background: rgba(var(--text-primary-rgb), 0.045);
      }

      .tabs__tab:active:not(:disabled) { transform: scale(0.97); }

      .tabs__tab:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* The selected tab lifts to the accent and stops there. Its ground, its
         underline and its glow all belong to the indicator, so that they can
         move. */
      .tabs__tab[aria-selected="true"] { color: var(--interactive); }

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

      :host([variant="pills"]) .tabs__tab:hover:not(:disabled):not([aria-selected="true"]) {
        background: rgba(var(--text-primary-rgb), 0.08);
      }

      /* The travelling line is an underline's device; a pill's is the ground
         itself, which the same element becomes. */
      :host([variant="pills"]) .tabs__ind::after { display: none; }

      :host([variant="pills"]) .tabs__ind::before {
        background: rgba(var(--interactive-rgb), 0.12);
        border-radius: var(--radius-sm);
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

      /* The panel does not cut — it arrives, once, on the switch that caused
         it. The docs have promised this transition since v2. */
      .tabs__panel.is-entering {
        animation: tabs-panel-in var(--duration-enter) var(--ease-out) both;
      }

      @keyframes tabs-panel-in {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
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
        margin-inline-end: var(--space-xs);
        border-radius: var(--radius-sm);
        text-align: start;
      }

      /* State is tint, glow and accent text. The colored edge this used to run
         down the side of the selected tab is the house's hardest ban, and the
         rail beside it is structure — one flat --divider that never changes
         colour — so the selection has to be carried by light instead. */
      :host([orientation="vertical"]) .tabs__ind::after { display: none; }

      :host([orientation="vertical"]) .tabs__ind::before {
        background: rgba(var(--interactive-rgb), 0.12);
        border-radius: var(--radius-sm);
        box-shadow: inset 0 0 14px -6px rgba(var(--interactive-rgb), 0.9);
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
        margin-inline-end: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        .tabs__list { scroll-behavior: auto; }
        .tabs__ind,
        .tabs__tab { transition: none; }
        .tabs__panel.is-entering { animation: none; }
      }
    `,
  ];

  constructor() {
    super();
    this._tabs = [];
    // Re-measure when the bar's width changes. Wrapping, a font landing late, a
    // pane being dragged — each of them moves every tab after the first, and an
    // indicator that only measured on selection would be left behind by all
    // three. Connection-scoped, so reparenting the bar does not silently end it.
    observeResize(this, '.tabs__list', () => this._syncIndicator({ instant: true }));
  }

  /**
   * Give the indicator the selected button's box. `instant` suppresses the
   * transition for the measurements that are not selections — the first one,
   * and every resize — so the indicator appears where it belongs instead of
   * travelling there from the list's origin.
   */
  _syncIndicator({ instant = false } = {}) {
    const root = this.shadowRoot;
    const indicator = root?.querySelector('.tabs__ind');
    if (!indicator) return;

    const button = root.querySelectorAll('.tabs__tab')[this.selected];
    if (!button) {
      indicator.classList.remove('is-on');
      return;
    }

    if (instant) indicator.classList.add('is-instant');

    indicator.style.setProperty('--_ind-x', `${button.offsetLeft}px`);
    indicator.style.setProperty('--_ind-y', `${button.offsetTop}px`);
    indicator.style.setProperty('--_ind-w', `${button.offsetWidth}px`);
    indicator.style.setProperty('--_ind-h', `${button.offsetHeight}px`);
    indicator.classList.add('is-on');

    if (instant) {
      // Flush the jump before motion is allowed back, or the class comes off
      // in the same frame and the jump animates after all.
      void indicator.offsetWidth;
      indicator.classList.remove('is-instant');
    }

    this._revealInBar(button, instant);
  }

  /**
   * Bring the selected button inside the bar's own scrollport — because the
   * arrow keys walked past the edge, or because the bar opened on a tab that
   * was never on screen, which is how a bar with more tabs than room used to
   * render with no visible selection at all.
   *
   * The bar scrolls and nothing else: `scrollIntoView` walks up through every
   * ancestor scroller, so on load it would drag the visitor down the page to a
   * tab bar they had not looked at yet. `behavior: 'auto'` defers to the list's
   * own `scroll-behavior`, which reduced motion turns off.
   */
  _revealInBar(button, instant) {
    const list = this.shadowRoot?.querySelector('.tabs__list');
    if (!list) return;

    const left = nearestScroll(
      list.scrollLeft,
      list.clientWidth,
      button.offsetLeft,
      button.offsetWidth,
    );
    const top = nearestScroll(
      list.scrollTop,
      list.clientHeight,
      button.offsetTop,
      button.offsetHeight,
    );
    if (left === list.scrollLeft && top === list.scrollTop) return;

    list.scrollTo({ left, top, behavior: instant ? 'instant' : 'auto' });
  }

  /** Restart the panel's entrance on the switch that caused it. */
  _playPanelEnter() {
    const panel = this.shadowRoot?.querySelector('.tabs__panel');
    if (!panel) return;

    panel.classList.remove('is-entering');
    void panel.offsetWidth;
    panel.classList.add('is-entering');
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
    const switched = changed.has('selected');

    if (switched) this._syncVisibility();

    // Any render can add, remove or rename a tab, so the box the indicator was
    // given may no longer be the one it marks. Only a switch travels.
    this._syncIndicator({ instant: !switched });

    // `changed.get` is undefined on the first update, which is how a bar that
    // opens on tab 3 is told apart from a visitor who moved to it.
    if (switched && changed.get('selected') !== undefined) this._playPanelEnter();
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
    this._syncIndicator({ instant: true });
  }

  render() {
    return html`
      <div class="tabs" part="base tabs">
        <div class="tabs__list" role="tablist" aria-orientation=${this.orientation} @keydown=${this._handleKeydown}>
          <!--
            Hidden from assistive tech rather than given a role: a tablist's
            children are tabs, and this one is light. What it marks is already
            said by aria-selected on the button underneath it.
          -->
          <div class="tabs__ind" part="indicator" aria-hidden="true"></div>
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
