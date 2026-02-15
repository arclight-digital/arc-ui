/**
 * Overlay mixin — provides backdrop click, Escape key, and scroll lock
 * for modal-like overlay components (sheet, drawer, etc.).
 *
 * The consuming component must:
 * - Have an `open` boolean reflected property
 * - Implement a `_close()` method
 */
export const OverlayMixin = (superClass) => class extends superClass {
  constructor() {
    super();
    this.__onKeyDown = this.__onKeyDown.bind(this);
  }

  updated(changed) {
    super.updated?.(changed);
    if (changed.has('open')) {
      if (this.open) {
        document.addEventListener('keydown', this.__onKeyDown);
        document.body.style.overflow = 'hidden';
      } else {
        document.removeEventListener('keydown', this.__onKeyDown);
        document.body.style.overflow = '';
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.__onKeyDown);
    document.body.style.overflow = '';
  }

  __onKeyDown(e) {
    if (e.key === 'Escape') {
      this._close();
    }
  }

  _handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      this._close();
    }
  }
};
