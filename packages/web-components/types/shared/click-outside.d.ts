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
export declare class ClickOutsideController {
    host: any;
    _onClickOutside: any;
    _when: any;
    _active: boolean;
    constructor(host: any, { onClickOutside, when }: {
        onClickOutside: any;
        when: any;
    });
    activate(): void;
    deactivate(): void;
    hostDisconnected(): void;
    _onPointerDown(e: any): void;
}
