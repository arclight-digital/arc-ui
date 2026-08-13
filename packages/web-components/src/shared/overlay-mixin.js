import { lockScroll, unlockScroll } from './scroll-lock.js';
import { trapTabKey, focusFirst, deepActiveElement } from './focus-trap.js';

/**
 * Overlay mixin — provides backdrop click, Escape key, scroll lock, focus
 * trapping, and focus restore for modal-like overlay components (sheet,
 * drawer, etc.).
 *
 * The consuming component must:
 * - Have an `open` boolean reflected property
 * - Implement a `_close()` method
 * - Render its panel with role="dialog"
 */
export const OverlayMixin = (superClass) =>
  class extends superClass {
    constructor() {
      super();
      this.__onKeyDown = this.__onKeyDown.bind(this);
    }

    __overlayPanel() {
      return this.shadowRoot?.querySelector('[role="dialog"]');
    }

    /**
     * The connection-scoped half of being open: a document listener and a body
     * lock, both of which belong to *this connection* rather than to the
     * element. Split out because `updated()` alone could not restore them —
     * see connectedCallback below. Both halves are idempotent (the same
     * listener reference de-duplicates, and scroll-lock tracks by owner), so
     * arming twice on the open-while-connecting path costs nothing.
     */
    __armOverlay() {
      document.addEventListener('keydown', this.__onKeyDown);
      lockScroll(this);
    }

    __disarmOverlay() {
      document.removeEventListener('keydown', this.__onKeyDown);
      unlockScroll(this);
    }

    /**
     * Re-arm after a reparent — finding #73, the same shape as #55, #64 and
     * #72. All the arming used to live in `updated()`, keyed on an `open`
     * *change*; moving an element in the DOM changes no property and schedules
     * no update, so `disconnectedCallback` was a one-way door. An open modal
     * that got reparented came back looking exactly like a modal while the
     * page scrolled behind it and Escape did nothing.
     */
    connectedCallback() {
      super.connectedCallback();
      if (this.open) this.__armOverlay();
    }

    updated(changed) {
      super.updated?.(changed);
      if (changed.has('open')) {
        if (this.open) {
          this.__previousFocus = deepActiveElement();
          this.__armOverlay();
          this.updateComplete.then(() => {
            const panel = this.__overlayPanel();
            if (panel && !panel.contains(deepActiveElement())) focusFirst(panel);
          });
        } else {
          this.__disarmOverlay();
          // changed.get('open') distinguishes a real close (was true) from the
          // initial render, where restoring focus would be wrong.
          if (changed.get('open') && this.__previousFocus?.isConnected) {
            this.__previousFocus.focus();
          }
          this.__previousFocus = null;
        }
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.__disarmOverlay();
    }

    __onKeyDown(e) {
      if (e.key === 'Escape') {
        this._close();
        return;
      }
      if (e.key === 'Tab') {
        const panel = this.__overlayPanel();
        if (panel) trapTabKey(e, panel);
      }
    }

    _handleBackdropClick(e) {
      if (e.target === e.currentTarget) {
        this._close();
      }
    }
  };
