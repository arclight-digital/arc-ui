import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-anchor-nav
 */
export class ArcAnchorNav extends LitElement {
  static properties = {
    orientation: { type: String, reflect: true },
    value:       { type: String, reflect: true },
    items: {
      converter: {
        fromAttribute: (v) => { try { return JSON.parse(v); } catch { return []; } },
      },
    },
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
        padding: var(--space-xs) var(--space-sm);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-muted);
        text-decoration: none;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
        cursor: pointer;
        background: none;
        border: none;
        text-align: left;
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
        padding: var(--space-xs) var(--space-sm);
        font-family: var(--font-body);
        font-size: var(--text-sm);
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
    this.orientation = 'horizontal';
    this.value = '';
    this.items = [];
    this._observer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._setupObserver();
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
            this.dispatchEvent(new CustomEvent('arc-change', {
              detail: { value: this.value },
              bubbles: true,
              composed: true,
            }));
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );
  }

  _onClick(val) {
    this.value = val;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: val },
      bubbles: true,
      composed: true,
    }));
    const el = document.getElementById(val);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  _onSlotChange(e) {
    const nodes = e.target.assignedElements({ flatten: true });
    for (const node of nodes) {
      const val = node.getAttribute('value');
      if (val) {
        node.addEventListener('click', () => this._onClick(val));
      }
    }
    this._updateSlottedActive();
  }

  render() {
    const hasItems = this.items && this.items.length > 0;
    return html`
      <nav class="anchor-nav" part="base" role="navigation" aria-label="Page sections">
        ${hasItems ? this.items.map(item => html`
          <button
            class="anchor-nav__link ${this.value === item.value ? 'is-active' : ''}"
            part="link"
            @click=${() => this._onClick(item.value)}
            aria-current=${this.value === item.value ? 'true' : 'false'}
          >
            ${item.label}
          </button>
        `) : ''}
        <slot @slotchange=${this._onSlotChange}></slot>
      </nav>
    `;
  }
}
