import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import './tab.js';

export class ArcTabs extends LitElement {
  static properties = {
    /** @deprecated Use <arc-tab> children instead */
    items:    { type: Array },
    selected: { type: Number, reflect: true },
    align:    { type: String, reflect: true },
    variant:  { type: String, reflect: true },
    _tabs:    { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .tabs__list {
        display: flex;
        border-bottom: 1px solid var(--border-subtle);
        gap: var(--space-xs);
        overflow-x: auto;
        overflow-y: hidden;
      }

      /* Alignment */
      :host([align="center"]) .tabs__list { justify-content: center; }
      :host([align="end"]) .tabs__list { justify-content: flex-end; }

      .tabs__tab {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
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
        transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
        white-space: nowrap;
      }

      .tabs__tab:hover { color: var(--text-primary); }
      .tabs__tab[aria-selected="true"] {
        color: var(--accent-primary);
        border-bottom-color: var(--accent-primary);
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
        background: rgba(255, 255, 255, 0.08);
      }

      :host([variant="pills"]) .tabs__tab[aria-selected="true"] {
        background: rgba(var(--accent-primary-rgb), 0.1);
        color: var(--accent-primary);
      }
      .tabs__tab:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
        border-radius: var(--radius-sm);
      }

      .tabs__panel {
        padding: var(--space-lg) 0;
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: var(--body-lh);
      }

      .tabs__panel[hidden] { display: none; }

      /* Hide the default slot — panels are shown via named wrapping */
      .tabs__slot-host {
        display: none;
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
    this.items = [];
    this.selected = 0;
    this.align = 'start';
    this.variant = 'underline';
    this._tabs = [];
  }

  get _useSlotted() {
    return this._tabs.length > 0;
  }

  _onSlotChange(e) {
    const slot = e.target;
    const children = slot.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-TAB');
    this._tabs = children;
    this._syncVisibility();
  }

  _syncVisibility() {
    this._tabs.forEach((tab, i) => {
      tab.hidden = i !== this.selected;
    });
  }

  _select(index) {
    const prev = this.selected;
    this.selected = index;

    if (this._useSlotted) {
      this._syncVisibility();
    }

    const label = this._useSlotted
      ? this._tabs[index]?.label
      : this.items?.[index]?.label;

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: index, label },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e) {
    const tabs = [...this.shadowRoot.querySelectorAll('.tabs__tab')];
    const current = tabs.indexOf(e.target);
    let next;

    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;

    e.preventDefault();
    tabs[next].focus();
    this._select(next);
  }

  updated(changed) {
    if (changed.has('selected') && this._useSlotted) {
      this._syncVisibility();
    }
  }

  _renderTabButtons(labels) {
    return labels.map((label, i) => html`
      <button
        class="tabs__tab"
        role="tab"
        aria-selected=${i === this.selected ? 'true' : 'false'}
        tabindex=${i === this.selected ? '0' : '-1'}
        id="tab-${i}"
        aria-controls="panel-${i}"
        @click=${() => this._select(i)}
      >${label}</button>
    `);
  }

  render() {
    const slotted = this._useSlotted;
    const items = this.items || [];
    const labels = slotted
      ? this._tabs.map(t => t.label)
      : items.map(t => t.label);

    return html`
      <div class="tabs" part="tabs">
        <div class="tabs__list" role="tablist" @keydown=${this._handleKeydown}>
          ${this._renderTabButtons(labels)}
        </div>

        <!-- Slotted mode: arc-tab children are shown/hidden directly -->
        <div
          class="tabs__panel"
          role="tabpanel"
          id="panel-${this.selected}"
          aria-labelledby="tab-${this.selected}"
          style="${!slotted && items.length ? 'display:none' : ''}"
        >
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>

        ${!slotted && items.length ? html`
          <!-- Legacy items mode: render content strings -->
          ${items.map((item, i) => html`
            <div
              class="tabs__panel"
              role="tabpanel"
              id="panel-${i}"
              aria-labelledby="tab-${i}"
              ?hidden=${i !== this.selected}
            >${item.content}</div>
          `)}
        ` : ''}
      </div>
    `;
  }
}

customElements.define('arc-tabs', ArcTabs);
