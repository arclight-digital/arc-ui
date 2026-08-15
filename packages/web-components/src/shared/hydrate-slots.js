/**
 * hydrate-slots.js — deliver the slotchange that declarative shadow DOM eats.
 *
 * Under DSD the parser attaches the shadow root and assigns the light-DOM
 * children to their slots before any script runs. The element then upgrades
 * and Lit adopts that tree rather than constructing it, so no new slot element is
 * created and no assignment ever changes — and `slotchange`, which fires on
 * assignment changes, never fires at all.
 *
 * Components that mirror their children into their own markup and hide the
 * originals depend on that event for their content. Client-side they build
 * their own shadow root, the slot is new, the event arrives, everything works
 * — which is also why no test caught it. Server-rendered, they upgrade with
 * nothing and render an empty mirror over hidden children: arc-segmented-control
 * as an 8px sliver, arc-navigation-menu as a top bar with no navigation.
 *
 * Dispatching the event the component was already listening for is deliberately
 * dumber than calling its reader directly: there is one contract here, not one
 * per component, and a handler that changes shape keeps working. Handlers must
 * be idempotent — they are read-and-store, and re-reading the same assignment
 * is a no-op — which they are, since a real slotchange can fire any number of
 * times for reasons unrelated to hydration.
 *
 * Enforced by scripts/checks/slot-hydration.js: a component that hides its slot
 * host and reads only on slotchange fails the build.
 *
 * @param {import('lit').LitElement} host - Component whose first render just completed.
 */
export function hydrateSlots(host) {
  const fire = () => {
    const root = host.renderRoot;
    if (!root?.querySelectorAll) return;
    for (const slot of root.querySelectorAll('slot')) {
      slot.dispatchEvent(new Event('slotchange'));
    }
  };

  fire();

  /*
   * And again once parsing finishes, because first render is not always after
   * the children exist. A component near the top of the document can upgrade
   * while the parser is still working its way down to the light-DOM content it
   * is waiting for — arc-app-shell reached firstUpdated with its `toc` slot
   * empty, decided it had no table of contents, and collapsed the rail to
   * display:none. The docs scroll spy was gone from every page while the
   * markup sat right there in the HTML, assigned correctly, one dispatch away.
   *
   * Cheap: readyState is only 'loading' during initial parse, so this listener
   * exists for the one render where it can matter, and re-reading the same
   * assignment is a no-op in every handler it reaches.
   */
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fire, { once: true });
  }
}

/**
 * Tell the component that renders this element that its state moved.
 *
 * The other half of the same problem this file is about. A component that
 * mirrors its light-DOM children into its own markup reads their properties at
 * *its* render time — `arc-tabs` reads `label` and `disabled` off its arc-tab
 * children, `arc-segmented-control` reads `disabled` off its arc-options,
 * `arc-context-menu` reads `label` off its arc-menu-items. Those children are
 * light-DOM siblings, not reactive inputs of the owner, so changing one repaints
 * nothing: the tab stays clickable after being disabled, the menu row keeps its
 * old text.
 *
 * It was found three times in one pass (findings #4, #6 and #32) and is the
 * same three lines each time, so it lives here rather than in three components.
 *
 * Guarded on the previous value being **defined**, which is the part that is
 * easy to get wrong: on an element's first update every entry's old value is
 * `undefined`, and asking the owner to re-render then would add a second render
 * per child on every mount — during the owner's own render, at that.
 *
 * @param {Element} child - The element whose state changed.
 * @param {Map<string, unknown>} changed - Lit's changed-properties map.
 * @param {string[]} names - Properties the owner renders from.
 */
export function notifyOwner(child, changed, names) {
  const moved = names.some((name) => changed.has(name) && changed.get(name) !== undefined);
  if (!moved) return;

  // The nearest Lit ancestor, rather than a tag name: arc-option has four
  // different owners and arc-menu-item has two, so naming one would be wrong
  // for the others and a per-component list would be a table to keep in step.
  for (let node = child.parentElement; node; node = node.parentElement) {
    if (typeof node.requestUpdate === 'function') {
      node.requestUpdate();
      return;
    }
  }
}
