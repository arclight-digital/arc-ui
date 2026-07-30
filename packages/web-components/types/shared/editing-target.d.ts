/**
 * Is the user typing into something?
 *
 * Anything binding a bare-character keyboard shortcut needs to answer this, and
 * inside shadow DOM the obvious answer is wrong. A keypress in the `<textarea>`
 * of an `<arc-textarea>` is retargeted on the way out of the shadow root, so a
 * document-level listener sees `event.target` as `<arc-textarea>` — tag name
 * `ARC-TEXTAREA`, not `TEXTAREA`. The usual guard,
 *
 *   if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
 *
 * therefore lets the shortcut through, and typing a space into a textarea
 * toggles play/pause. `matches()` cannot rescue it either: there is no selector
 * that reaches across a shadow boundary, and no attribute on the host says
 * "there is a text field in here".
 *
 * `event.composedPath()[0]` is the real originating node — it is the one thing
 * that survives retargeting — so that is what this checks.
 *
 *   import { isEditingTarget } from '@arclux/arc-ui/shared/editing-target';
 *
 *   document.addEventListener('keydown', (e) => {
 *     if (isEditingTarget(e)) return;
 *     if (e.key === ' ') togglePlayback();
 *   });
 *
 * Components that want to be recognised without importing anything also carry
 * `data-arc-editing` on the host while their inner control holds focus, so
 * `e.target.matches('[data-arc-editing]')` works from plain CSS or a framework
 * template. `isEditingTarget` is the more reliable of the two: it needs no
 * cooperation from the element, so it is also right for a plain `<input>`, a
 * contenteditable, and third-party components.
 */
/**
 * True when `node` is an element the user types or selects text into.
 *
 * @param {EventTarget | null | undefined} node
 * @returns {boolean}
 */
export declare function isEditingNode(node: EventTarget | null | undefined): boolean;
/**
 * True when a keyboard event originated in a text-entry element, looking through
 * shadow boundaries.
 *
 * Accepts an event or a node, so it is usable both from an event handler and
 * against `document.activeElement`.
 *
 * @param {Event | EventTarget | null | undefined} eventOrNode
 * @returns {boolean}
 */
export declare function isEditingTarget(eventOrNode: Event | EventTarget | null | undefined): boolean;
/**
 * Marks `host` while one of its shadow-root controls holds focus, so code
 * outside can identify it with a selector.
 *
 * Wired by the input components themselves; consumers do not call this.
 *
 * @param {HTMLElement} host
 * @param {boolean} editing
 */
export declare function setEditingMarker(host: HTMLElement, editing: boolean): void;
