/**
 * Helpers for forwarding ARIA state onto slotted (light-DOM) trigger elements.
 *
 * ARIA attributes placed on an inert shadow-DOM wrapper <div> are never seen
 * by assistive technology — the element users actually focus is the slotted
 * light-DOM child. These helpers set/remove attributes directly on the first
 * assigned element of a trigger slot instead.
 */

/**
 * Sets (or removes) attributes on the first assigned element of a slot.
 * Call on `slotchange` and whenever the forwarded state changes.
 *
 * @param {HTMLSlotElement|null} slotEl - The trigger slot
 * @param {Record<string, string|null|undefined>} attrs - Attribute map; null/undefined/'' removes the attribute
 */
export function setTriggerAria(slotEl, attrs) {
  if (!slotEl) return;
  const target = slotEl.assignedElements({ flatten: true })[0];
  if (!target) return;
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === '') {
      target.removeAttribute(name);
    } else {
      target.setAttribute(name, value);
    }
  }
}

export { deepActiveElement } from './focus-trap.js';
