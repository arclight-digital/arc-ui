/**
 * Read a server-rendered element's slots before its first render.
 *
 * Imported by hydrate.js, straight after Lit's hydration support, and named
 * for the same chunk rule (see hydrate.js). Like that module it must not
 * import anything that reaches lit-element: it works by chaining
 * `globalThis.litElementHydrateSupport`, which lit-element reads once while it
 * evaluates.
 *
 * A component that builds its shadow tree from its children (arc-breadcrumb,
 * arc-navigation-menu, arc-tabs) declares `static slotReaders`, slot name to
 * the method its `@slotchange` calls (or a function). The server calls those
 * with the page's children before rendering (ssr.js), so its shadow tree
 * carries the items. The client has to match it on the render that adopts
 * that tree, and the slotchange that would fill the items in arrives only
 * after it: the parser assigned the declarative slots before any script ran
 * (see shared/hydrate-slots.js). Rendering the empty frame first is a
 * mismatch, and hydration discards the server's tree.
 *
 * So on the first update of an element with a shadow root already in place,
 * each reader gets the server's own slot before the update renders. Only for
 * an element in the document itself: the server reads the children of hosts
 * in the page, not of hosts a component renders inside its own template (an
 * arc-button in arc-copy-button's shadow root), so for those the client
 * doesn't either, and both first renders agree.
 *
 * And that first update waits for the ARC children to be defined. A reader
 * reads their properties (a menu item's `disabled`, a tab's `label`), and an
 * element its class hasn't reached yet has none: arc-dropdown-menu hydrated
 * before arc-menu-item was defined, took a disabled item for an enabled one,
 * and its render no longer matched the server's. The server always had the
 * instances. The wait is capped, so a child whose module a page never loads
 * costs one short delay rather than the component.
 */
const slotOf = (host, name) =>
  host.shadowRoot.querySelector(name ? `slot[name="${name}"]` : 'slot:not([name])');

/** Readers to run for this element's first update, if any. */
const readersFor = (el) =>
  !el.hasUpdated &&
  el.shadowRoot &&
  el.constructor.slotReaders &&
  typeof document !== 'undefined' &&
  el.getRootNode() === document
    ? el.constructor.slotReaders
    : null;

const install = globalThis.litElementHydrateSupport;
globalThis.litElementHydrateSupport = (arg) => {
  install?.(arg);
  const proto = arg.LitElement.prototype;
  globalThis.__arcSlotReaders = true;

  const scheduleUpdate = proto.scheduleUpdate;
  proto.scheduleUpdate = function scheduleUpdate_() {
    const readers = readersFor(this);
    if (readers && typeof customElements !== 'undefined') {
      const waiting = new Set();
      for (const name of Object.keys(readers)) {
        for (const el of slotOf(this, name)?.assignedElements({ flatten: true }) ?? []) {
          if (el.localName.startsWith('arc-') && !customElements.get(el.localName)) {
            waiting.add(el.localName);
          }
        }
      }
      if (waiting.size) {
        const defined = Promise.all([...waiting].map((tag) => customElements.whenDefined(tag)));
        const capped = new Promise((resolve) => setTimeout(resolve, 200));
        return Promise.race([defined, capped]).then(() => scheduleUpdate.call(this));
      }
    }
    return scheduleUpdate.call(this);
  };

  const update = proto.update;
  proto.update = function update_(changed) {
    const readers = readersFor(this);
    if (readers) {
      for (const [name, reader] of Object.entries(readers)) {
        const slot = slotOf(this, name);
        if (!slot) continue;
        if (typeof reader === 'function') reader.call(this, { target: slot });
        else this[reader]({ target: slot });
      }
    }
    return update.call(this, changed);
  };
};
