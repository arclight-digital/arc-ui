import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DismissController } from '../shared/dismiss-controller.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Dims the entire page except a targeted element, which gets an accent-primary glow ring and
 * elevated z-index. For onboarding and feature discovery.
 *
 * @tag arc-spotlight
 * @prop {string} target - CSS selector for the element to highlight. The first matching element will be spotlighted with a glow ring and elevated z-index.
 * @prop {boolean} active - Controls whether the spotlight overlay is visible. Set to true to activate the dimming overlay and highlight the target element.
 * @prop {number} padding - Padding in pixels around the target element cutout. Increase for larger glow rings or to give the target more breathing room.
 * @fires {CustomEvent<void>} arc-close - Fired when the user clicks outside the highlighted element to dismiss the spotlight
 * @slot none
 * @csspart ring
 */
export class ArcSpotlight extends DeclaredPropsMixin(LitElement) {
  static properties = {
    target: { type: String },
    active: flag(false),
    padding: { type: Number },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .spotlight__ring {
        position: fixed;
        z-index: var(--z-max);
        border-radius: var(--radius-md);
        box-shadow:
          0 0 0 4000px var(--overlay-backdrop),
          0 0 0 3px rgba(var(--accent-primary-rgb), 0.5),
          0 0 24px rgba(var(--accent-primary-rgb), 0.4),
          0 0 48px rgba(var(--accent-primary-rgb), 0.2);
        transition: all var(--transition-base) var(--ease-out-expo);
        pointer-events: none;
      }
    `,
  ];

  constructor() {
    super();
    this.target = '';
    this.padding = 8;
    this._rect = null;
    this._dismiss = new DismissController(this, {
      // The spotlight is a ring drawn around some *other* element, so "inside"
      // is that element rather than this host. A target that has gone away
      // leaves no inside at all, and the next click dismisses.
      boundary: () => (this.target ? document.querySelector(this.target) : null),
      onDismiss: () => this._close(),
    });
    this._onScroll = () => this._updatePosition();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('scroll', this._onScroll, true);
  }

  updated(changed) {
    if (changed.has('active') || changed.has('target')) {
      this._updatePosition();
      if (this.active) {
        this._dismiss.activate();
        document.addEventListener('scroll', this._onScroll, { capture: true, passive: true });
      } else {
        this._dismiss.deactivate();
        document.removeEventListener('scroll', this._onScroll, true);
      }
    }
  }

  _updatePosition() {
    if (!this.active || !this.target) {
      this._rect = null;
      this.requestUpdate();
      return;
    }
    const el = document.querySelector(this.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      this._rect = {
        top: rect.top - this.padding,
        left: rect.left - this.padding,
        width: rect.width + this.padding * 2,
        height: rect.height + this.padding * 2,
      };
    } else {
      this._rect = null;
    }
    this.requestUpdate();
  }

  /** Cancelable close: `arc-close` can preventDefault to keep the spotlight up. */
  _close() {
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', { bubbles: true, composed: true, cancelable: true }),
      )
    )
      return;
    this.active = false;
  }

  render() {
    if (!this.active || !this._rect) return html``;

    const ringStyle = `top:${this._rect.top}px;left:${this._rect.left}px;width:${this._rect.width}px;height:${this._rect.height}px;`;

    return html`
      <div class="spotlight__ring" style=${ringStyle} part="ring"></div>
    `;
  }
}
