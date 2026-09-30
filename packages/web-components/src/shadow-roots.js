/**
 * Attach the declarative shadow roots of a document the parser didn't.
 *
 *   import { attachShadowRoots } from '@arclux/arc-ui/shadow-roots';
 *
 *   // Astro's <ClientRouter />:
 *   document.addEventListener('astro:before-swap', (e) => attachShadowRoots(e.newDocument));
 *
 * Only the HTML parser acting on a page, or setHTMLUnsafe / parseHTMLUnsafe,
 * turns `<template shadowrootmode>` into a shadow root. A client-side router
 * that fetches the next page and parses it with DOMParser, as Astro's
 * ClientRouter does, gets inert templates instead. Every server-rendered
 * component on the page it swaps in then arrives with no shadow root, and
 * Lit renders a fresh copy beside the dead template: an unstyled flash, and
 * hydration never happens. Found on arclight.build (4.9.0).
 *
 * Call this on that document before it is swapped in. Each template becomes
 * its host's shadow root, the way the parser would have done it, and nested
 * ones come along through setHTMLUnsafe. A host that already has a root is
 * left alone, so calling it twice is harmless.
 *
 * @param {Document | Element | DocumentFragment} root
 * @returns {number} How many shadow roots were attached.
 */
export function attachShadowRoots(root) {
  let attached = 0;
  const templates = root.querySelectorAll('template[shadowrootmode], template[shadowroot]');
  for (const template of templates) {
    const host = template.parentElement;
    if (!host) continue;
    if (host.shadowRoot) {
      template.remove();
      continue;
    }
    const mode = template.getAttribute('shadowrootmode') ?? template.getAttribute('shadowroot');
    if (mode !== 'open' && mode !== 'closed') continue;
    const shadow = host.attachShadow({
      mode,
      delegatesFocus: template.hasAttribute('shadowrootdelegatesfocus'),
      clonable: template.hasAttribute('shadowrootclonable'),
      serializable: template.hasAttribute('shadowrootserializable'),
    });
    shadow.setHTMLUnsafe(template.innerHTML);
    template.remove();
    attached++;
  }
  return attached;
}
