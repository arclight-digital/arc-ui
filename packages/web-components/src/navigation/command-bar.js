import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-command-bar
 */
export class ArcCommandBar extends LitElement {
  static properties = {
    placeholder: { type: String },
    value:       { type: String },
    icon:        { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-flex;
      }

      .command-bar {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        background: var(--bg-inset);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: var(--space-xs) var(--space-sm);
        min-width: 240px;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .command-bar:focus-within {
        border-color: var(--interactive);
        box-shadow: var(--interactive-focus);
      }

      .command-bar__icon {
        display: flex;
        align-items: center;
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .command-bar__icon arc-icon {
        display: flex;
      }

      .command-bar__input {
        background: none;
        border: none;
        outline: none;
        font: inherit;
        color: var(--text-primary);
        flex: 1;
        font-size: var(--text-sm);
      }

      .command-bar__input::placeholder {
        color: var(--text-ghost);
      }

      .command-bar__hint {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
    `,
  ];

  constructor() {
    super();
    this.placeholder = 'Search…';
    this.value = '';
    this.icon = 'magnifying-glass';
  }

  _onInput(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('arc-input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _onKeyDown(e) {
    if (e.key === 'Enter') {
      this.dispatchEvent(new CustomEvent('arc-submit', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    return html`
      <div class="command-bar" part="base">
        <span class="command-bar__icon" part="icon">
          <arc-icon name=${this.icon} size="sm"></arc-icon>
        </span>
        <input
          class="command-bar__input"
          part="input"
          type="text"
          .value=${this.value}
          placeholder=${this.placeholder}
          @input=${this._onInput}
          @keydown=${this._onKeyDown}
        />
        <span class="command-bar__hint" part="hint">
          <slot name="hint"></slot>
        </span>
      </div>
    `;
  }
}
