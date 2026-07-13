/**
 * ClickOutsideController — shared reactive controller for dismiss-on-outside-click.
 *
 * Attaches a single capture-phase pointerdown listener on the document only
 * while active (call activate()/deactivate() as the overlay opens/closes, or
 * pass `when` to derive it). Uses composedPath() so clicks inside shadow DOM
 * and slotted content are correctly treated as "inside".
 *
 *   this._clickOutside = new ClickOutsideController(this, {
 *     onClickOutside: () => this._close(),
 *     when: () => this._open,          // optional; defaults to always-on-while-activated
 *   });
 *   // in updated(): open ? this._clickOutside.activate() : this._clickOutside.deactivate()
 */
export class ClickOutsideController {
  constructor(host, { onClickOutside, when }) {
    this.host = host;
    this._onClickOutside = onClickOutside;
    this._when = when;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._active = false;
    host.addController(this);
  }

  activate() {
    if (this._active) return;
    this._active = true;
    document.addEventListener('pointerdown', this._onPointerDown, true);
  }

  deactivate() {
    if (!this._active) return;
    this._active = false;
    document.removeEventListener('pointerdown', this._onPointerDown, true);
  }

  hostDisconnected() {
    this.deactivate();
  }

  _onPointerDown(e) {
    if (this._when && !this._when()) return;
    if (e.composedPath().includes(this.host)) return;
    this._onClickOutside();
  }
}
