import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-pin-input
 */
export class ArcPinInput extends LitElement {
  static properties = {
    length:    { type: Number },
    value:     { type: String, reflect: true },
    disabled:  { type: Boolean, reflect: true },
    mask:      { type: Boolean, reflect: true },
    type:      { type: String, reflect: true },
    separator: { type: Number },
    label:     { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-block; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .pin {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .pin__label {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .pin__boxes {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .pin__separator {
        font-family: var(--font-mono);
        font-size: var(--text-lg);
        color: var(--text-ghost);
        user-select: none;
        line-height: 1;
        padding: 0 2px;
      }

      .pin__box {
        width: 42px;
        height: 48px;
        text-align: center;
        font-family: var(--font-mono);
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: 0;
        caret-color: var(--accent-primary);
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast),
          background var(--transition-fast);
        box-sizing: border-box;
        -moz-appearance: textfield;
      }

      .pin__box::-webkit-outer-spin-button,
      .pin__box::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .pin__box::placeholder {
        color: var(--text-ghost);
      }

      .pin__box:hover:not(:focus) {
        border-color: var(--border-bright);
      }

      .pin__box:focus {
        outline: none;
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
        background: var(--bg-surface);
      }

      .pin__box:focus-visible {
        outline: none;
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
      }

      .pin__box:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      :host([mask]) .pin__box {
        -webkit-text-security: disc;
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
    this.length = 4;
    this.value = '';
    this.disabled = false;
    this.mask = false;
    this.type = 'number';
    this.separator = 0;
    this.label = '';
  }

  get _chars() {
    const chars = (this.value || '').split('');
    return Array.from({ length: this.length }, (_, i) => chars[i] || '');
  }

  _getInputMode() {
    if (this.type === 'number') return 'numeric';
    return 'text';
  }

  _getPattern() {
    if (this.type === 'number') return '[0-9]';
    if (this.type === 'alphanumeric') return '[a-zA-Z0-9]';
    return null;
  }

  _isValidChar(ch) {
    if (this.type === 'number') return /^[0-9]$/.test(ch);
    if (this.type === 'alphanumeric') return /^[a-zA-Z0-9]$/.test(ch);
    return ch.length === 1;
  }

  _getBoxes() {
    return Array.from(this.shadowRoot.querySelectorAll('.pin__box'));
  }

  _focusBox(index) {
    const boxes = this._getBoxes();
    if (boxes[index]) boxes[index].focus();
  }

  _buildValue() {
    const boxes = this._getBoxes();
    return boxes.map(b => b.value).join('');
  }

  _emitChange() {
    const val = this._buildValue();
    this.value = val;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: val },
      bubbles: true,
      composed: true,
    }));

    if (val.length === this.length) {
      this.dispatchEvent(new CustomEvent('arc-complete', {
        detail: { value: val },
        bubbles: true,
        composed: true,
      }));
    }
  }

  _onInput(e, index) {
    const input = e.target;
    let ch = input.value;

    // Only take the last character if multiple were typed
    if (ch.length > 1) ch = ch.slice(-1);

    if (ch && !this._isValidChar(ch)) {
      input.value = this._chars[index] || '';
      return;
    }

    input.value = ch;
    this._emitChange();

    // Auto-advance
    if (ch && index < this.length - 1) {
      this._focusBox(index + 1);
    }
  }

  _onKeydown(e, index) {
    if (e.key === 'Backspace') {
      const input = e.target;
      if (!input.value && index > 0) {
        e.preventDefault();
        const boxes = this._getBoxes();
        boxes[index - 1].value = '';
        this._focusBox(index - 1);
        this._emitChange();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      this._focusBox(index - 1);
    } else if (e.key === 'ArrowRight' && index < this.length - 1) {
      e.preventDefault();
      this._focusBox(index + 1);
    } else if (e.key === 'Delete') {
      e.target.value = '';
      this._emitChange();
    }
  }

  _onPaste(e, index) {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
    if (!pasted) return;

    const boxes = this._getBoxes();
    let pos = index;
    for (const ch of pasted) {
      if (pos >= this.length) break;
      if (this._isValidChar(ch)) {
        boxes[pos].value = ch;
        pos++;
      }
    }

    this._emitChange();

    // Focus last filled or next empty box
    const focusIdx = Math.min(pos, this.length - 1);
    this._focusBox(focusIdx);
  }

  _onFocus(e) {
    // Select content on focus for easy replacement
    e.target.select();
  }

  _needsSeparator(index) {
    if (!this.separator || this.separator <= 0) return false;
    return (index + 1) < this.length && (index + 1) % this.separator === 0;
  }

  render() {
    const chars = this._chars;
    const pattern = this._getPattern();
    const inputMode = this._getInputMode();

    return html`
      <div class="pin" part="pin">
        ${this.label ? html`<span class="pin__label" part="label">${this.label}</span>` : ''}
        <div class="pin__boxes" role="group" aria-label=${this.label || 'PIN input'} part="boxes">
          ${chars.map((ch, i) => html`
            <input
              class="pin__box"
              type=${this.mask ? 'password' : 'text'}
              inputmode=${inputMode}
              maxlength="1"
              autocomplete="one-time-code"
              .value=${ch}
              ?disabled=${this.disabled}
              aria-label=${`${this.label || 'PIN'} digit ${i + 1}`}
              ${pattern ? html`pattern=${pattern}` : nothing}
              @input=${(e) => this._onInput(e, i)}
              @keydown=${(e) => this._onKeydown(e, i)}
              @paste=${(e) => this._onPaste(e, i)}
              @focus=${this._onFocus}
              part="box"
            />
            ${this._needsSeparator(i) ? html`<span class="pin__separator" aria-hidden="true">&ndash;</span>` : ''}
          `)}
        </div>
      </div>
    `;
  }
}
