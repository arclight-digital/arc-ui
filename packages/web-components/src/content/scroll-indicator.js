import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';
import { listen } from '../shared/subscriptions.js';

/**
 * Thin progress bar that tracks scroll position of the page or a target container. Sticks to the
 * top or bottom edge with accent or gradient fill.
 *
 * @tag arc-scroll-indicator
 * @status stable
 * @prop {string} target - CSS selector for the scroll container to track. Defaults to the window when empty.
 * @prop {'top' | 'bottom'} position - Which edge the indicator sticks to.
 * @prop {'sm' | 'md' | 'lg'} size - Bar thickness: sm (2px), md (3px), lg (4px).
 * @prop {'accent' | 'gradient'} color - Fill color mode. Accent uses `--accent-primary`. Gradient blends from primary to secondary.
 * @slot none
 * @csspart base - The root element.
 * @csspart bar
 * @csspart fill
 */
export class ArcScrollIndicator extends DeclaredPropsMixin(LitElement) {
  static properties = {
    target: { type: String },
    position: oneOf(['top', 'bottom']),
    size: oneOf(['sm', 'md', 'lg']),
    color: oneOf(['accent', 'gradient']),
    _progress: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        position: sticky;
        top: 0;
        z-index: 100;
        pointer-events: none;
      }

      :host([position="bottom"]) {
        top: auto;
        bottom: 0;
      }

      .bar {
        height: 2px;
        width: 100%;
        background: var(--surface-overlay);
        overflow: hidden;
      }

      :host([size="sm"]) .bar { height: 2px; }
      :host([size="md"]) .bar { height: 3px; }
      :host([size="lg"]) .bar { height: 4px; }

      .bar__fill {
        height: 100%;
        background: var(--accent-primary);
        transform-origin: left;
        /* Deliberately not a motion token: this bar maps to scroll position, so
           it has to track the finger linearly. An eased curve would make it lag
           the scroll and then catch up, and any token duration is long enough to
           read as drift. */
        transition: transform 60ms linear;
        will-change: transform;
      }

      :host([color="gradient"]) .bar__fill {
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      }

      @media (prefers-reduced-motion: reduce) {
        .bar__fill { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.target = '';
    this._progress = 0;
    this._rafId = null;
    this._onScroll = this._onScroll.bind(this);
    // `listen` remembers the element it attached to, which hand-rolled teardown
    // did not: `_detachListener` re-resolved the selector, so changing `target`
    // unsubscribed from the *new* container and left the old one listening for
    // the life of the page (finding #68). Nothing on screen showed it —
    // `_updateProgress` re-reads the current target either way — so the damage
    // was a retained reference to a detached container and wasted frames.
    listen(this, () => this._getTarget(), 'scroll', this._onScroll, { passive: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // The subscription belongs to the controller; this only drops the pending
    // frame so a queued measurement cannot land on a detached element.
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  updated(changed) {
    // The controller re-binds the listener itself when the resolver starts
    // returning a different element; this only re-reads the new container so the
    // bar is correct before the next scroll rather than after it.
    if (changed.has('target')) this._updateProgress();
  }

  _getTarget() {
    if (!this.target) return window;
    return document.querySelector(this.target) || window;
  }

  _onScroll() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._updateProgress();
    });
  }

  _updateProgress() {
    const el = this._getTarget();
    let scrollTop, scrollHeight, clientHeight;

    if (el === window) {
      scrollTop = window.scrollY;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    } else {
      scrollTop = el.scrollTop;
      scrollHeight = el.scrollHeight;
      clientHeight = el.clientHeight;
    }

    const max = scrollHeight - clientHeight;
    this._progress = max > 0 ? Math.min(scrollTop / max, 1) : 0;
  }

  render() {
    return html`
      <div
        class="bar"
        role="progressbar"
        aria-valuenow=${Math.round(this._progress * 100)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Scroll progress"
        part="base bar"
      >
        <div
          class="bar__fill"
          style="transform:scaleX(${this._progress})"
          part="fill"
        ></div>
      </div>
    `;
  }
}
