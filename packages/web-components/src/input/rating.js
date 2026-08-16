import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { DeclaredPropsMixin, flag, oneOf, int } from '../shared/props.js';

/**
 * One star outline. Filled and empty are the same geometry — the `fill`
 * attribute is what carries the difference. It used to be a ternary whose two
 * branches were the identical string, which read as an unfinished intent that
 * any refactor would have preserved untouched (finding #13).
 */
const STAR_PATH =
  'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z';

/**
 * A star-based rating input with hover preview, keyboard navigation, filled/unfilled SVG stars,
 * and configurable max value.
 *
 * @tag arc-rating
 * @status stable
 * @prop {number} value - Current rating value, 0 to `max`. **0 means unrated** — it is a legal state of the control, not a rating of zero: it submits nothing, announces as "No rating", and is what Home and a left-arrow at the first star return to. Clicking the star that is already selected also clears back to it. Reflected as an attribute and updated on user interaction.
 * @prop {number} max - Maximum number of stars to render. Determines the upper bound of the rating scale.
 * @prop {boolean} disabled - Disables interaction, reducing opacity to 40% and blocking pointer events.
 * @prop {boolean} readonly - Prevents interaction while maintaining full visual appearance. Useful for displaying existing ratings.
 * @prop {'sm' | 'md' | 'lg'} size - Control size. `md` is the default; `sm` and `lg` scale the star glyphs.
 * @prop {string} label - Accessible name for the control. Several ratings on one page are indistinguishable without it. Defaults to "Rating".
 * @fires {CustomEvent<{ value: number }>} arc-change - Fired when the rating value changes
 * @slot none
 * @csspart base - The root element.
 * @csspart star
 * @csspart rating
 */
export class ArcRating extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    value: int({ default: 0, min: 0, max: 'max', clamp: 'toRange', reflect: true }),
    max: int({ default: 5, min: 1, clamp: 'toRange', reflect: true }),
    name: { type: String, reflect: true },
    label: { type: String },
    // NOT flag(): a form-associated custom element whose `disabled` content
    // attribute is merely *present* is "actually disabled" per the HTML spec,
    // so the platform calls formDisabledCallback(true) and the mixin sets the
    // property back. `disabled="false"` is a disabled control here for exactly
    // the reason it is on a native <input>. Native semantics win; see
    // shared/props.js.
    disabled: { type: Boolean, reflect: true },
    readonly: flag(false),
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }
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
        box-shadow: var(--interactive-focus);
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
        color: var(--interactive);
        filter: drop-shadow(0 0 4px rgba(var(--interactive-rgb), 0.4))
               drop-shadow(0 0 10px rgba(var(--interactive-rgb), 0.2));
      }

      .rating__star--hovered {
        color: var(--interactive);
        filter: drop-shadow(0 0 6px rgba(var(--interactive-rgb), 0.5))
               drop-shadow(0 0 16px rgba(var(--interactive-rgb), 0.3));
      }

      .rating__star:not(.rating__star--filled):not(.rating__star--hovered):hover {
        color: var(--border-bright);
      }

      .rating__star svg {
        width: 28px;
        height: 28px;
        pointer-events: none;
      }

      /* Sizes — the glyph, since the control is nothing but glyphs. md is the
         base rule above, so an unrecognized value lands on it. */
      :host([size="sm"]) .rating__star svg { width: 20px; height: 20px; }
      :host([size="lg"]) .rating__star svg { width: 36px; height: 36px; }

      @media (prefers-reduced-motion: reduce) {
        .rating__star { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.name = '';
    this.label = '';
    this.disabled = false;
    this._hoverValue = 0;
  }

  /**
   * An unrated control submits nothing (finding #8).
   *
   * `String(0)` is `"0"`, and `_formValueIsEmpty` counts only `null` and `''`
   * as empty — so `<arc-rating required>` reported `checkValidity() === true`
   * with nothing rated. The exemption in `form-contract.test.js` ("number-valued
   * controls have no meaningful empty") is right for slider and number-input
   * and wrong here: 0 is not a rating, it is the absence of one.
   */
  _formValue() {
    if (this.value == null || this.value === 0) return null;
    return String(this.value);
  }

  _onStarClick(index) {
    if (this.disabled || this.readonly) return;
    // Clicking the star that is already selected clears the rating — the mouse
    // half of finding #10. Without it, 0 is a state the control can start in
    // and no gesture can return to, which is what made `required` look
    // satisfiable and the whole family of #8-#12 possible.
    this.value = index === this.value ? 0 : index;
    this._updateFormValue();
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
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
        // Floor 0, not 1 (findings #9 and #10). From the unrated default,
        // `Math.max(0 - 1, 1)` was 1 — the key meaning "less" raised the
        // rating — and once any rating was set nothing could clear it.
        newValue = Math.max(this.value - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        // The minimum, per the slider pattern, and the minimum is unrated.
        newValue = 0;
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
      this._updateFormValue();
      this.dispatchEvent(
        new CustomEvent('arc-change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  _renderStar(index) {
    const displayValue = this._hoverValue || this.value;
    const filled = index <= displayValue;
    const hovered = this._hoverValue > 0 && index <= this._hoverValue;

    return html`
      <span
        class="rating__star ${filled ? 'rating__star--filled' : ''} ${hovered ? 'rating__star--hovered' : ''}"
        @click=${() => this._onStarClick(index)}
        @mouseenter=${() => this._onStarEnter(index)}
        @mouseleave=${this._onStarLeave}
        part="star"
      >
        <svg viewBox="0 0 24 24" fill=${filled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d=${STAR_PATH} />
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
        aria-label=${this.label || 'Rating'}
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.value}
        aria-valuetext=${this.value === 0 ? 'No rating' : `${this.value} of ${this.max}`}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        aria-readonly=${this.readonly ? 'true' : 'false'}
        tabindex=${this.disabled ? '-1' : '0'}
        @keydown=${this._onKeydown}
        part="base rating"
      >
        ${stars}
      </div>
    `;
  }
}
