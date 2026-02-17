import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-scroll-indicator
 */
export class ArcScrollIndicator extends LitElement {
  static properties = {
    target:   { type: String },
    position: { type: String, reflect: true },
    size:     { type: String, reflect: true },
    color:    { type: String, reflect: true },
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
    this.position = 'top';
    this.size = 'sm';
    this.color = 'accent';
    this._progress = 0;
    this._rafId = null;
    this._onScroll = this._onScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._attachListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._detachListener();
  }

  updated(changed) {
    if (changed.has('target')) {
      this._detachListener();
      this._attachListener();
    }
  }

  _getTarget() {
    if (!this.target) return window;
    return document.querySelector(this.target) || window;
  }

  _attachListener() {
    const el = this._getTarget();
    (el === window ? window : el).addEventListener('scroll', this._onScroll, { passive: true });
    this._updateProgress();
  }

  _detachListener() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    const el = this._getTarget();
    (el === window ? window : el).removeEventListener('scroll', this._onScroll);
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
        part="bar"
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
