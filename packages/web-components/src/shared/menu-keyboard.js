/**
 * Shared keyboard navigation controller for menu-like components.
 * Handles ArrowUp/Down, Enter, Escape, Home, End.
 */
export class MenuKeyboardController {
  /**
   * @param {LitElement} host
   * @param {object} opts
   * @param {() => number} opts.getItemCount - Returns number of selectable items
   * @param {(index: number) => void} opts.onSelect - Called when Enter is pressed on focused item
   * @param {() => void} opts.onClose - Called when Escape is pressed
   */
  constructor(host, { getItemCount, onSelect, onClose }) {
    this.host = host;
    this._getItemCount = getItemCount;
    this._onSelect = onSelect;
    this._onClose = onClose;
    this.focusedIndex = -1;
    this._onKeyDown = this._onKeyDown.bind(this);
    host.addController(this);
  }

  attach() {
    document.addEventListener('keydown', this._onKeyDown);
  }

  detach() {
    document.removeEventListener('keydown', this._onKeyDown);
    this.focusedIndex = -1;
  }

  hostDisconnected() {
    this.detach();
  }

  reset() {
    this.focusedIndex = -1;
  }

  /** True when the key event originates in a text-entry element (search input, etc.). */
  _isEditableTarget(e) {
    const t = e.composedPath()[0];
    if (!t || !t.tagName) return false;
    return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
  }

  _onKeyDown(e) {
    // Escape must close even when there are no items (e.g. a search query
    // with zero matches) — check it before the count guard.
    if (e.key === 'Escape') {
      e.preventDefault();
      this._onClose();
      return;
    }

    const count = this._getItemCount();
    if (count === 0) return;

    const editable = this._isEditableTarget(e);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusedIndex = this.focusedIndex < count - 1 ? this.focusedIndex + 1 : 0;
        this.host.requestUpdate();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusedIndex = this.focusedIndex > 0 ? this.focusedIndex - 1 : count - 1;
        this.host.requestUpdate();
        break;
      case 'Home':
        if (editable) break; // let the caret move within the input
        e.preventDefault();
        this.focusedIndex = 0;
        this.host.requestUpdate();
        break;
      case 'End':
        if (editable) break;
        e.preventDefault();
        this.focusedIndex = count - 1;
        this.host.requestUpdate();
        break;
      case ' ':
        if (editable) break; // space types a space in search inputs
      // falls through
      case 'Enter':
        e.preventDefault();
        if (this.focusedIndex >= 0 && this.focusedIndex < count) {
          this._onSelect(this.focusedIndex);
        }
        break;
    }
  }
}
