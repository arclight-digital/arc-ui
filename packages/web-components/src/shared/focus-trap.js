/**
 * Composed-tree focus utilities for modal overlays (modal, sheet, drawer,
 * command palette). Unlike shadowRoot.querySelectorAll, these walk slotted
 * light-DOM content and nested shadow roots, so traps see the consumer's
 * buttons/inputs inside header/body/footer slots.
 */
const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

/**
 * Collect focusable elements under `node` in composed-tree order.
 * Walks into shadow roots and follows slot assignments.
 */
export function collectFocusable(node, out = []) {
  if (node.nodeType !== Node.ELEMENT_NODE) return out;

  if (node.matches(FOCUSABLE) && !node.hasAttribute('disabled') && isVisible(node)) {
    out.push(node);
  }
  if (node.tagName === 'SLOT') {
    for (const assigned of node.assignedElements({ flatten: true })) {
      collectFocusable(assigned, out);
    }
    return out;
  }
  const root = node.shadowRoot ?? node;
  for (const child of root.children) {
    collectFocusable(child, out);
  }
  return out;
}

/** The actually-focused element, descending through nested shadow roots. */
export function deepActiveElement() {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/**
 * Handle a Tab keydown so focus cycles within `container`.
 * Call from the overlay's keydown handler when open.
 */
export function trapTabKey(e, container) {
  const focusable = collectFocusable(container);
  if (focusable.length === 0) {
    e.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const idx = focusable.indexOf(deepActiveElement());

  if (e.shiftKey && idx <= 0) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (idx === -1 || idx === focusable.length - 1)) {
    e.preventDefault();
    first.focus();
  }
}

/** Focus the first focusable element under `container`, else the container. */
export function focusFirst(container) {
  const focusable = collectFocusable(container);
  if (focusable.length > 0) {
    focusable[0].focus();
  } else if (container.focus) {
    container.tabIndex = -1;
    container.focus();
  }
}
