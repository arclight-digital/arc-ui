import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../data/tag.js';

/**
 * @tag arc-chip
 */
export class ArcChip extends LitElement {
  static properties = {
    selected:   { type: Boolean, reflect: true },
    disabled:   { type: Boolean, reflect: true },
    value:      { type: String },
    _inListbox: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
      }
      :host([disabled]) { pointer-events: none; }

      arc-tag {
        pointer-events: none;
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
    this.selected = false;
    this.disabled = false;
    this.value = '';
    this._inListbox = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // role="option" is only valid inside a listbox/group ancestor;
    // standalone chips act as toggle buttons instead.
    this._inListbox = !!this.closest('[role="listbox"], [role="group"]');
  }

  _toggle() {
    if (this.disabled) return;
    this.selected = !this.selected;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value, selected: this.selected },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggle();
    }
  }

  render() {
    return html`
      <arc-tag
        variant=${this.selected ? 'primary' : 'default'}
        ?disabled=${this.disabled}
        exportparts="tag: chip, label"
        role=${this._inListbox ? 'option' : 'button'}
        aria-selected=${this._inListbox ? (this.selected ? 'true' : 'false') : nothing}
        aria-pressed=${this._inListbox ? nothing : (this.selected ? 'true' : 'false')}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this._toggle}
        @keydown=${this._handleKeydown}
        part="chip"
      >
        <slot></slot>
      </arc-tag>
    `;
  }
}
