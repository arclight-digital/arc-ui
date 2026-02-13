import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcMarquee extends LitElement {
  static properties = {
    speed:            { type: Number },
    direction:        { type: String, reflect: true },
    'pause-on-hover': { type: Boolean, reflect: true, attribute: 'pause-on-hover' },
    gap:              { type: String },
    _animDuration:    { state: true },
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
    this.speed = 40;
    this.direction = 'left';
    this['pause-on-hover'] = true;
    this.gap = 'var(--space-xl)';
    this._animDuration = '10s';
    this._resizeObserver = null;
  }

  firstUpdated() {
    this._updateDuplicate();
    this._setupResizeObserver();
  }

  updated(changed) {
    if (changed.has('speed') || changed.has('gap')) {
      this._recalcDuration();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  _setupResizeObserver() {
    this._resizeObserver = new ResizeObserver(() => this._recalcDuration());
    const group = this.shadowRoot.querySelector('.marquee__group--primary');
    if (group) this._resizeObserver.observe(group);
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
        part="track"
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

customElements.define('arc-marquee', ArcMarquee);
