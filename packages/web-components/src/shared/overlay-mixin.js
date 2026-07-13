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
export const OverlayMixin = (superClass) => class extends superClass {
  constructor() {
    super();
    this.__onKeyDown = this.__onKeyDown.bind(this);
  }

  __overlayPanel() {
    return this.shadowRoot?.querySelector('[role="dialog"]');
  }

  updated(changed) {
    super.updated?.(changed);
    if (changed.has('open')) {
      if (this.open) {
        this.__previousFocus = deepActiveElement();
        document.addEventListener('keydown', this.__onKeyDown);
        lockScroll(this);
        this.updateComplete.then(() => {
          const panel = this.__overlayPanel();
          if (panel && !panel.contains(deepActiveElement())) focusFirst(panel);
        });
      } else {
        document.removeEventListener('keydown', this.__onKeyDown);
        unlockScroll(this);
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
    document.removeEventListener('keydown', this.__onKeyDown);
    unlockScroll(this);
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
