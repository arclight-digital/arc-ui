import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { observeResize } from '../shared/subscriptions.js';
import { DeclaredPropsMixin, flag, oneOf, num } from '../shared/props.js';

/**
 * Continuously scrolling content strip with configurable speed, direction, gap, and pause-on-hover
 * behavior for logos, testimonials, and announcements.
 *
 * @tag arc-marquee
 * @arc-group marketing
 * @status stable
 * @prop {number} speed - Scroll speed in pixels per second. The animation duration is calculated from the content width divided by this value.
 * @prop {'left' | 'right'} direction - Scroll direction. `left` scrolls content from right to left (default), `right` reverses the direction.
 * @prop {boolean} pauseOnHover - When true, the animation pauses while the cursor hovers over the marquee.
 * @prop {string} gap - CSS length value for the gap between slotted items. Accepts any valid CSS length or custom property.
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart track
 * @csspart group
 * @csspart group-duplicate
 */
export class ArcMarquee extends DeclaredPropsMixin(LitElement) {
  static properties = {
    speed: num({ default: 40, min: 0, clamp: 'toRange' }),
    direction: oneOf(['left', 'right']),
    pauseOnHover: flag(true, { attribute: 'pause-on-hover', negative: 'no-pause-on-hover' }),
    gap: { type: String },
    _animDuration: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        overflow: hidden;
      }

      .marquee {
        display: flex;
        width: max-content;
        will-change: transform;
      }

      .marquee--left {
        animation: marquee-scroll-left var(--marquee-duration, 10s) linear infinite;
      }

      .marquee--right {
        animation: marquee-scroll-right var(--marquee-duration, 10s) linear infinite;
      }

      :host([pause-on-hover]) .marquee:hover {
        animation-play-state: paused;
      }

      @media (prefers-reduced-motion: reduce) {
        .marquee {
          animation-play-state: paused !important;
        }
      }

      @keyframes marquee-scroll-left {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      @keyframes marquee-scroll-right {
        from { transform: translateX(-50%); }
        to   { transform: translateX(0); }
      }

      .marquee__group {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      ::slotted(*) {
        flex-shrink: 0;
      }
    `,
  ];

  constructor() {
    super();
    this.gap = 'var(--space-xl)';
    this._animDuration = '10s';
    // Was set up in firstUpdated and torn down in disconnectedCallback, which do
    // not pair: the first reparenting left the marquee no longer recalculating
    // its duration when its content resized (finding #64).
    observeResize(this, '.marquee__group--primary', () => this._recalcDuration());
  }

  firstUpdated() {
    hydrateSlots(this);
  }

  updated(changed) {
    if (changed.has('speed') || changed.has('gap')) {
      this._recalcDuration();
    }
  }

  _recalcDuration() {
    requestAnimationFrame(() => {
      const group = this.shadowRoot.querySelector('.marquee__group--primary');
      if (!group) return;
      const width = group.scrollWidth;
      if (width > 0 && this.speed > 0) {
        const seconds = width / this.speed;
        this._animDuration = `${seconds.toFixed(2)}s`;
      }
    });
  }

  _onSlotChange() {
    this._updateDuplicate();
    this._recalcDuration();
  }

  /**
   * Clone slotted light-DOM children into the shadow-DOM duplicate group
   * for seamless looping. The duplicate is aria-hidden since it's decorative.
   */
  _updateDuplicate() {
    const dupGroup = this.shadowRoot.querySelector('.marquee__group--duplicate');
    if (!dupGroup) return;

    // Clear previous clones
    while (dupGroup.firstChild) dupGroup.removeChild(dupGroup.firstChild);

    // Clone each assigned node from the primary slot
    const slot = this.shadowRoot.querySelector('slot:not([name])');
    if (!slot) return;
    const nodes = slot.assignedNodes({ flatten: true });
    for (const node of nodes) {
      dupGroup.appendChild(node.cloneNode(true));
    }
  }

  render() {
    const dirClass = this.direction === 'right' ? 'marquee--right' : 'marquee--left';

    return html`
      <div
        class="marquee ${dirClass}"
        style="--marquee-duration: ${this._animDuration}; gap: ${this.gap}"
        part="base track"
      >
        <div
          class="marquee__group marquee__group--primary"
          style="gap: ${this.gap}"
          part="group"
        >
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
        <div
          class="marquee__group marquee__group--duplicate"
          style="gap: ${this.gap}"
          aria-hidden="true"
          part="group-duplicate"
        ></div>
      </div>
    `;
  }
}
