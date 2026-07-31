/**
 * Anchor adoption — progressive enhancement for link-bearing components.
 *
 * An `href` on the host cannot produce a working link without JavaScript: the
 * attribute lives on the custom element and the real `<a>` only exists in a
 * shadow root that is never created. Authoring the anchor in light DOM instead
 * puts a real link in the initial HTML, so it works with JS disabled and before
 * the element upgrades:
 *
 *     <arc-button variant="primary"><a href="/start">Get started</a></arc-button>
 *
 * On upgrade the component adopts that anchor as its control rather than
 * rendering a second one — nesting `<a>` inside `<a>` is invalid and would put
 * nested links in the accessibility tree.
 *
 * Nothing here mutates light DOM. Framework wrappers re-render their children,
 * and a component that rewrote them would fight the reconciler.
 */

/** Nodes that carry meaning — everything but whitespace-only text. */
function meaningfulNodes(nodes) {
  return nodes.filter((n) => n.nodeType !== Node.TEXT_NODE || n.textContent.trim() !== '');
}

/**
 * True when a slot's only meaningful content is a single `<a>`.
 *
 * Deliberately strict: `<arc-button>Read <a href="/x">this</a></arc-button>` is
 * an incidental inline link, not a link button, and must stay on the normal
 * render path. Checking assigned *nodes* rather than assigned elements is what
 * makes that distinction — `assignedElements()` drops the surrounding text and
 * would report a lone anchor.
 *
 * @param {HTMLSlotElement} slot
 * @returns {boolean}
 */
export function isLoneSlottedAnchor(slot) {
  const nodes = meaningfulNodes(slot.assignedNodes({ flatten: true }));
  return (
    nodes.length === 1 && nodes[0].nodeType === Node.ELEMENT_NODE && nodes[0].localName === 'a'
  );
}

/**
 * The lone anchor child of a light-DOM carrier element, if there is one.
 *
 * Used by the nav carriers (arc-nav-item, arc-breadcrumb-item,
 * arc-sidebar-link), which hold data their parent reads rather than rendering
 * a control themselves. They have no slot to inspect at the time the parent
 * asks for `href`/`label`, so this walks child nodes directly.
 *
 * @param {Element} host
 * @returns {HTMLAnchorElement | null}
 */
export function loneAnchorChild(host) {
  const nodes = meaningfulNodes([...host.childNodes]);
  const first = nodes[0];
  return nodes.length === 1 && first.nodeType === Node.ELEMENT_NODE && first.localName === 'a'
    ? /** @type {HTMLAnchorElement} */ (first)
    : null;
}

/**
 * Resolve a carrier's destination, preferring the explicit attribute.
 *
 * Returns the anchor's literal `href` attribute rather than the resolved
 * `.href` property, so a relative path stays relative — the parent renders it
 * back into an `<a>` and the browser resolves it there.
 *
 * @param {Element} host
 * @param {string} explicitHref
 * @returns {string}
 */
export function resolveCarrierHref(host, explicitHref) {
  if (explicitHref) return explicitHref;
  return loneAnchorChild(host)?.getAttribute('href') ?? '';
}
