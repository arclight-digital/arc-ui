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
 * Components that want to be recognized without importing anything also carry
 * `data-arc-editing` on the host while their inner control holds focus, so
 * `e.target.matches('[data-arc-editing]')` works from plain CSS or a framework
 * template. `isEditingTarget` is the more reliable of the two: it needs no
 * cooperation from the element, so it is also right for a plain `<input>`, a
 * contenteditable, and third-party components.
 */

/**
 * `<input>` types that take typed characters. The rest — checkbox, radio,
 * button, range and friends — are controls you operate rather than type into,
 * and a shortcut firing while one has focus is usually correct.
 */
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

/**
 * True when `node` is an element the user types or selects text into.
 *
 * @param {EventTarget | null | undefined} node
 * @returns {boolean}
 */
export function isEditingNode(node) {
  if (!node || typeof node !== 'object') return false;

  // contenteditable, including inherited from an ancestor.
  if (node.isContentEditable) return true;

  switch (node.tagName) {
    case 'TEXTAREA':
      return true;
    // A focused <select> consumes typeahead and arrow keys of its own.
    case 'SELECT':
      return true;
    case 'INPUT':
      return !NON_TEXT_INPUT_TYPES.has((node.type || 'text').toLowerCase());
    default:
      return false;
  }
}

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
export function isEditingTarget(eventOrNode) {
  if (!eventOrNode) return false;

  // An event: the composed path's first entry is the pre-retargeting node.
  // Fall back to `target` for synthetic events built without a path.
  if (typeof eventOrNode.composedPath === 'function') {
    const path = eventOrNode.composedPath();
    if (path.length) return isEditingNode(path[0]);
    return isEditingNode(eventOrNode.target);
  }
  if ('target' in eventOrNode && 'type' in eventOrNode && !eventOrNode.tagName) {
    return isEditingNode(eventOrNode.target);
  }

  return isEditingNode(eventOrNode);
}

/**
 * Marks `host` while one of its shadow-root controls holds focus, so code
 * outside can identify it with a selector.
 *
 * Wired by the input components themselves; consumers do not call this.
 *
 * @param {HTMLElement} host
 * @param {boolean} editing
 */
export function setEditingMarker(host, editing) {
  if (editing) host.setAttribute('data-arc-editing', '');
  else host.removeAttribute('data-arc-editing');
}
