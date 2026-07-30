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
 *
 * ## Why pointerdown, and why no requestAnimationFrame
 *
 * Components that hand-rolled this listened for `click` and had to defer the
 * subscription by a frame, or the very click that opened them closed them again.
 * pointerdown avoids that entirely: a click-triggered open happens on pointerup,
 * so by the time the listener exists the opening gesture is already over and the
 * next pointerdown is a genuinely new interaction. Any adopter can drop its
 * rAF dance.
 */
export declare class ClickOutsideController {
    host: import("lit").ReactiveElement;
    _onClickOutside: () => void;
    _when: (() => boolean) | undefined;
    _boundary: (() => Element | null | undefined) | undefined;
    _active: boolean;
    /**
     * @param {import('lit').ReactiveElement} host
     * @param {object} opts
     * @param {() => void} opts.onClickOutside
     * @param {() => boolean} [opts.when] - Extra guard, checked per event.
     * @param {() => Element | null | undefined} [opts.boundary] - What counts as
     *   "inside", when that isn't the host. arc-spotlight highlights a *separate*
     *   target element and must stay open for clicks on it, not on itself.
     */
    constructor(host: import('lit').ReactiveElement, { onClickOutside, when, boundary }: {
        onClickOutside: () => void;
        when?: () => boolean;
        boundary?: () => Element | null | undefined;
    });
    activate(): void;
    deactivate(): void;
    hostDisconnected(): void;
    _onPointerDown(e: any): void;
}
