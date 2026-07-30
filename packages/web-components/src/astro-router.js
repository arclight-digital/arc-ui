/**
 * Keep server-rendered shadow roots across Astro ClientRouter navigations.
 *
 *   import '@arclux/arc-ui/hydrate';        // FIRST
 *   import '@arclux/arc-ui/astro-router';   // then this, once, anywhere
 *
 * Only needed by sites that both server-render ARC components and use Astro's
 * `<ClientRouter />` (formerly `<ViewTransitions />`). Importing it is the whole
 * setup; it installs one listener and does nothing on a page without the router.
 *
 * ## What it fixes
 *
 * A server-rendered page carries its components as declarative shadow DOM —
 * `<template shadowrootmode="open">` that the HTML parser turns into a real,
 * already-painted shadow root, which Lit then adopts instead of rebuilding.
 *
 * A ClientRouter navigation fetched all of that and threw it away. The router
 * parses the next page with `DOMParser.parseFromString`, which does *not*
 * process declarative shadow roots — honouring them is opt-in, and the opt-in is
 * `Document.parseHTMLUnsafe`. The templates arrived, meant nothing, and every
 * component rendered from scratch. On the ARC docs site that measured as +6.4K
 * brotli per navigation (18.3K against 11.9K) fetched and discarded, plus a full
 * client render of ~430 components.
 *
 * Re-parsing the document the router has already built turns that cost into the
 * saving it was meant to be. Elements come out of `parseHTMLUnsafe` with shadow
 * roots attached but un-upgraded — an inert document has no custom element
 * registry — and upgrade when the swap adopts them into the live document, at
 * which point Lit finds a shadow root and hydrates.
 *
 * ## Why re-parse rather than re-fetch
 *
 * Serialising the router's document and parsing it again keeps every step the
 * router performs around the fetch — redirect handling, `<noscript>` removal,
 * the view-transitions-enabled check, stylesheet preloading — rather than
 * reimplementing them against internals. The cost is one extra parse of markup
 * already in memory, against a network round trip and a full re-render.
 *
 * ## On "unsafe"
 *
 * `parseHTMLUnsafe` is named for honouring declarative shadow roots in markup,
 * which is the entire point here. It does not execute script, and the input is
 * the same response the router already parsed.
 */

let installed = false;

/**
 * Install the listener. Safe to call more than once and on the server, where it
 * returns immediately.
 */
export function installAstroRouter() {
  if (installed || typeof document === 'undefined') return;
  // Without declarative parsing there is nothing to preserve, and re-parsing
  // would cost a parse to produce the same shadow-less document.
  if (typeof Document.parseHTMLUnsafe !== 'function') return;
  installed = true;

  document.addEventListener('astro:before-preparation', (event) => {
    const load = event.loader;
    if (typeof load !== 'function') return;

    event.loader = async () => {
      await load();

      const parsed = event.newDocument;
      // A page the build did not server-render has nothing to recover, and
      // re-parsing it would be pure cost.
      if (!parsed || !parsed.querySelector('template[shadowrootmode]')) return;

      event.newDocument = Document.parseHTMLUnsafe(
        `<!DOCTYPE html>${parsed.documentElement.outerHTML}`
      );
    };
  });
}

installAstroRouter();
