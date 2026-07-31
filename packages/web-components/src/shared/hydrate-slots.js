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
  const root = host.renderRoot;
  if (!root?.querySelectorAll) return;
  for (const slot of root.querySelectorAll('slot')) {
    slot.dispatchEvent(new Event('slotchange'));
  }
}
