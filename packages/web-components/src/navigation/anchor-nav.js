import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, oneOf, list } from '../shared/props.js';

/**
 * Vertical or horizontal in-page link bar with active highlight. Active link gets accent-primary
 * background pill or underline glow.
 *
 * @tag arc-anchor-nav
 * @prop {'vertical' | 'horizontal'} orientation - Layout direction. Vertical renders a column of links; horizontal renders a row.
 * @prop {string} value - The value of the currently active link. Controls which item is highlighted.
 * @prop {Array<{label: string, value: string}>} items - Declarative list of items to render. Each object needs a label (display text) and value (identifier). Alternative to slotting children.
 * @fires arc-change - Fired when a link is selected with detail: { value }.
 * @slot - Default content.
 * @csspart base
 * @csspart link
 */
export class ArcAnchorNav extends DeclaredPropsMixin(LitElement) {
  static properties = {
    orientation: oneOf(['vertical', 'horizontal'], { default: 'horizontal' }),
    value: { type: String, reflect: true },
    items: list(),
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .anchor-nav {
        display: flex;
        gap: var(--space-xs);
      }

      :host([orientation="vertical"]) .anchor-nav {
        flex-direction: column;
      }

      .anchor-nav__link {
        padding-block: var(--space-xs);
        padding-inline: var(--nav-row-inset) var(--space-sm);
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        text-decoration: none;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
        cursor: pointer;
        background: none;
        border: none;
        text-align: start;
      }

      .anchor-nav__link:hover {
        color: var(--text-primary);
      }

      .anchor-nav__link.is-active {
        color: var(--interactive);
        background: rgba(var(--interactive-rgb), 0.08);
      }

      :host(:not([orientation="vertical"])) .anchor-nav__link.is-active {
        background: none;
        box-shadow: inset 0 -2px 0 var(--interactive);
      }

      /* Slotted children styling */
      ::slotted(*) {
        padding-block: var(--space-xs);
        padding-inline: var(--nav-row-inset) var(--space-sm);
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        text-decoration: none;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast);
        cursor: pointer;
        display: block;
      }

      ::slotted(*:hover) {
        color: var(--text-primary);
      }

      ::slotted([active]) {
        color: var(--interactive);
        background: rgba(var(--interactive-rgb), 0.08);
      }

      :host(:not([orientation="vertical"])) ::slotted([active]) {
        background: none;
        box-shadow: inset 0 -2px 0 var(--interactive);
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.items = [];
    this._observer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._setupObserver();
    this._observeSections();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  updated(changed) {
    if (changed.has('value')) {
      this._updateSlottedActive();
    }
    // The sections to watch come from the items, so a changed list means a
    // different set of targets.
    if (changed.has('items')) this._observeSections();
  }

  /**
   * Point the observer at the sections the links refer to.
   *
   * This was missing entirely: `_setupObserver` built an IntersectionObserver
   * and nothing ever called `observe()` on it, so the documented active-link
   * highlight only ever moved on click and never on scroll. The teardown test
   * passed throughout because it asked whether an observer *object* existed,
   * not whether it was watching anything (finding #65).
   */
  _observeSections() {
    if (!this._observer) return;
    this._observer.disconnect();
    for (const value of this._sectionValues()) {
      const section = document.getElementById(value);
      if (section) this._observer.observe(section);
    }
  }

  /** Item values, from the `items` property or from slotted children. */
  _sectionValues() {
    if (this.items?.length) return this.items.map((item) => item.value).filter(Boolean);
    return [...this.querySelectorAll('[value]')].map((el) => el.getAttribute('value'));
  }

  _updateSlottedActive() {
    const children = this.querySelectorAll('[value]');
    for (const child of children) {
      if (child.getAttribute('value') === this.value) {
        child.setAttribute('active', '');
      } else {
        child.removeAttribute('active');
      }
    }
  }

  _setupObserver() {
    if (typeof IntersectionObserver === 'undefined') return;
    this._observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.value = entry.target.id;
            this.dispatchEvent(
              new CustomEvent('arc-change', {
                detail: { value: this.value },
                bubbles: true,
                composed: true,
              }),
            );
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
  }

  _onClick(val) {
    this.value = val;
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: val },
        bubbles: true,
        composed: true,
      }),
    );
    const el = document.getElementById(val);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  _onSlotChange(e) {
    const nodes = e.target.assignedElements({ flatten: true });
    // Slotted items arrive after connectedCallback, so the sections they name
    // are only knowable here.
    this._observeSections();
    for (const node of nodes) {
      const val = node.getAttribute('value');
      if (val) {
        node.addEventListener('click', () => this._onClick(val));
      }
    }
    this._updateSlottedActive();
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const hasItems = this.items && this.items.length > 0;
    return html`
      <nav class="anchor-nav" part="base" role="navigation" aria-label="Page sections">
        ${
          hasItems
            ? this.items.map(
                (item) => html`
          <button
            class="anchor-nav__link ${this.value === item.value ? 'is-active' : ''}"
            part="link"
            @click=${() => this._onClick(item.value)}
            aria-current=${this.value === item.value ? 'true' : 'false'}
          >
            ${item.label}
          </button>
        `,
              )
            : ''
        }
        <slot @slotchange=${this._onSlotChange}></slot>
      </nav>
    `;
  }
}
