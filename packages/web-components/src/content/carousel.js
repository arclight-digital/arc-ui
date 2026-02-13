import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcCarousel extends LitElement {
  static properties = {
    autoPlay:   { type: Boolean, attribute: 'auto-play', reflect: true },
    interval:   { type: Number },
    loop:       { type: Boolean, reflect: true },
    showDots:   { type: Boolean, attribute: 'show-dots', reflect: true },
    showArrows: { type: Boolean, attribute: 'show-arrows', reflect: true },
    _current:   { state: true },
    _total:     { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; position: relative; }

      .carousel {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-md);
      }

      .carousel__viewport {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }

      .carousel__viewport::-webkit-scrollbar { display: none; }

      ::slotted(*) {
        flex: 0 0 100%;
        width: 100%;
        scroll-snap-align: start;
        scroll-snap-stop: always;
      }

      /* Arrows */
      .carousel__arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        border: 1px solid var(--border-default);
        background: var(--bg-surface);
        color: var(--text-primary);
        cursor: pointer;
        transition: background var(--transition-fast),
                    border-color var(--transition-fast),
                    box-shadow var(--transition-fast),
                    opacity var(--transition-fast);
        opacity: 0.85;
        font-size: var(--text-md);
        line-height: 1;
        padding: 0;
      }

      .carousel__arrow:hover {
        background: var(--bg-elevated);
        border-color: var(--border-bright);
        opacity: 1;
      }

      .carousel__arrow:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .carousel__arrow--prev { left: var(--space-sm); }
      .carousel__arrow--next { right: var(--space-sm); }

      .carousel__arrow[disabled] {
        opacity: 0.3;
        pointer-events: none;
      }

      /* Dots */
      .carousel__dots {
        display: flex;
        justify-content: center;
        gap: var(--space-sm);
        padding: var(--space-sm) 0;
      }

      .carousel__dot {
        width: 8px;
        height: 8px;
        border-radius: var(--radius-full);
        border: none;
        background: var(--border-default);
        cursor: pointer;
        padding: 0;
        transition: background var(--transition-fast), transform var(--transition-fast);
      }

      .carousel__dot:hover {
        background: var(--text-muted);
        transform: scale(1.25);
      }

      .carousel__dot--active {
        background: var(--accent-primary);
        transform: scale(1.25);
      }

      .carousel__dot:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .carousel__viewport { scroll-behavior: auto; }
      }
    `,
  ];

  constructor() {
    super();
    this.autoPlay = false;
    this.interval = 5000;
    this.loop = true;
    this.showDots = true;
    this.showArrows = true;
    this._current = 0;
    this._total = 0;
    this._autoPlayTimer = null;
    this._paused = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._startAutoPlay();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAutoPlay();
  }

  /* ---- Slide management ---- */

  _onSlotChange(e) {
    const slides = e.target.assignedElements({ flatten: true });
    this._total = slides.length;
    // Ensure current is still valid
    if (this._current >= this._total) {
      this._current = Math.max(0, this._total - 1);
    }
  }

  _slides() {
    const slot = this.shadowRoot?.querySelector('slot');
    return slot ? slot.assignedElements({ flatten: true }) : [];
  }

  _goTo(index) {
    const slides = this._slides();
    if (slides.length === 0) return;

    let next = index;
    if (this.loop) {
      next = (index + slides.length) % slides.length;
    } else {
      next = Math.max(0, Math.min(index, slides.length - 1));
    }

    if (next === this._current && index === next) return;
    this._current = next;

    const viewport = this.shadowRoot.querySelector('.carousel__viewport');
    if (viewport && slides[next]) {
      slides[next].scrollIntoView({ block: 'nearest', inline: 'start', behavior: 'smooth' });
    }

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { index: this._current },
      bubbles: true,
      composed: true,
    }));
  }

  _prev() { this._goTo(this._current - 1); }
  _next() { this._goTo(this._current + 1); }

  /* ---- Auto-play ---- */

  _startAutoPlay() {
    this._stopAutoPlay();
    if (!this.autoPlay) return;
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this._autoPlayTimer = setInterval(() => {
      if (!this._paused) this._next();
    }, this.interval);
  }

  _stopAutoPlay() {
    if (this._autoPlayTimer) {
      clearInterval(this._autoPlayTimer);
      this._autoPlayTimer = null;
    }
  }

  _onMouseEnter() { this._paused = true; }
  _onMouseLeave() { this._paused = false; }
  _onFocusIn()    { this._paused = true; }
  _onFocusOut()   { this._paused = false; }

  updated(changed) {
    if (changed.has('autoPlay') || changed.has('interval')) {
      this._startAutoPlay();
    }
  }

  /* ---- Keyboard ---- */

  _onKeydown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this._prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this._next();
    }
  }

  /* ---- Render ---- */

  render() {
    const canPrev = this.loop || this._current > 0;
    const canNext = this.loop || this._current < this._total - 1;
    const dots = Array.from({ length: this._total }, (_, i) => i);

    return html`
      <div
        class="carousel"
        part="carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Carousel"
        @keydown=${this._onKeydown}
        @mouseenter=${this._onMouseEnter}
        @mouseleave=${this._onMouseLeave}
        @focusin=${this._onFocusIn}
        @focusout=${this._onFocusOut}
      >
        <div class="carousel__viewport" part="viewport" tabindex="0">
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>

        ${this.showArrows ? html`
          <button
            class="carousel__arrow carousel__arrow--prev"
            part="arrow-prev"
            aria-label="Previous slide"
            ?disabled=${!canPrev}
            @click=${this._prev}
          >&#8249;</button>
          <button
            class="carousel__arrow carousel__arrow--next"
            part="arrow-next"
            aria-label="Next slide"
            ?disabled=${!canNext}
            @click=${this._next}
          >&#8250;</button>
        ` : ''}

        ${this.showDots && this._total > 1 ? html`
          <div class="carousel__dots" part="dots" role="tablist" aria-label="Slide controls">
            ${dots.map(i => html`
              <button
                class="carousel__dot ${i === this._current ? 'carousel__dot--active' : ''}"
                part="dot"
                role="tab"
                aria-selected=${i === this._current ? 'true' : 'false'}
                aria-label="Go to slide ${i + 1}"
                @click=${() => this._goTo(i)}
              ></button>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('arc-carousel', ArcCarousel);
