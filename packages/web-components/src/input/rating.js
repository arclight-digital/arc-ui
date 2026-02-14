import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-rating
 */
export class ArcRating extends LitElement {
  static properties = {
    value:    { type: Number, reflect: true },
    max:      { type: Number, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }
      :host([readonly]) { pointer-events: none; }

      .rating {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        outline: none;
        border-radius: var(--radius-sm);
        padding: var(--space-xs);
      }

      .rating:focus-visible {
        box-shadow: var(--focus-glow);
      }

      .rating__star {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        background: none;
        border: none;
        color: var(--border-default);
        transition:
          color var(--transition-fast),
          transform var(--transition-fast),
          filter var(--transition-fast);
        flex-shrink: 0;
        position: relative;
      }

      .rating__star--filled {
        color: var(--accent-primary);
        filter: drop-shadow(0 0 4px rgba(var(--accent-primary-rgb), 0.4))
               drop-shadow(0 0 10px rgba(var(--accent-primary-rgb), 0.2));
      }

      .rating__star--hovered {
        color: var(--accent-primary);
        filter: drop-shadow(0 0 6px rgba(var(--accent-primary-rgb), 0.5))
               drop-shadow(0 0 16px rgba(var(--accent-primary-rgb), 0.3));
      }

      .rating__star:not(.rating__star--filled):not(.rating__star--hovered):hover {
        color: var(--border-bright);
      }

      .rating__star svg {
        width: 28px;
        height: 28px;
        pointer-events: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .rating__star { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.value = 0;
    this.max = 5;
    this.disabled = false;
    this.readonly = false;
    this._hoverValue = 0;
  }

  _onStarClick(index) {
    if (this.disabled || this.readonly) return;
    this.value = index;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _onStarEnter(index) {
    if (this.disabled || this.readonly) return;
    this._hoverValue = index;
    this.requestUpdate();
  }

  _onStarLeave() {
    if (this.disabled || this.readonly) return;
    this._hoverValue = 0;
    this.requestUpdate();
  }

  _onKeydown(e) {
    if (this.disabled || this.readonly) return;

    let newValue = this.value;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(this.value + 1, this.max);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = Math.max(this.value - 1, 1);
        break;
      case 'Home':
        e.preventDefault();
        newValue = 1;
        break;
      case 'End':
        e.preventDefault();
        newValue = this.max;
        break;
      default:
        return;
    }

    if (newValue !== this.value) {
      this.value = newValue;
      this.dispatchEvent(new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }));
    }
  }

  _renderStar(index) {
    const displayValue = this._hoverValue || this.value;
    const filled = index <= displayValue;
    const hovered = this._hoverValue > 0 && index <= this._hoverValue;

    const starPath = filled
      ? 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z'
      : 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z';

    return html`
      <span
        class="rating__star ${filled ? 'rating__star--filled' : ''} ${hovered ? 'rating__star--hovered' : ''}"
        @click=${() => this._onStarClick(index)}
        @mouseenter=${() => this._onStarEnter(index)}
        @mouseleave=${this._onStarLeave}
        part="star"
      >
        <svg viewBox="0 0 24 24" fill=${filled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d=${starPath} />
        </svg>
      </span>
    `;
  }

  render() {
    const stars = [];
    for (let i = 1; i <= this.max; i++) {
      stars.push(this._renderStar(i));
    }

    return html`
      <div
        class="rating"
        role="slider"
        aria-label="Rating"
        aria-valuemin="1"
        aria-valuemax=${this.max}
        aria-valuenow=${this.value}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        aria-readonly=${this.readonly ? 'true' : 'false'}
        tabindex=${this.disabled ? '-1' : '0'}
        @keydown=${this._onKeydown}
        part="rating"
      >
        ${stars}
      </div>
    `;
  }
}
