/**
 * hydrate-images.js: deliver the `load` that declarative shadow DOM already spent.
 *
 * The sibling of hydrate-slots.js, and the same shape of problem: an event the
 * component is listening for has already happened by the time it can listen.
 *
 * Every image component here paints in two steps: the `<img>` starts at
 * `opacity: 0` (or `visibility: hidden`) behind a shimmer, and the `load`
 * handler stores `_loaded`/`_state` and fades it in. Client-side the element is
 * created by Lit with its listener already attached, so the event always
 * arrives.
 *
 * Server-rendered, the parser creates that `<img>` from the declarative shadow
 * root and starts fetching immediately (a display:none `<dialog>` does not
 * stop it) while the listener does not exist until the hydrate bundle runs.
 * A cached, small or preloaded image finishes first, `load` fires into nothing,
 * and the flag never flips: arc-image and arc-avatar hold a transparent picture
 * under a shimmer that never stops, arc-lightbox opens onto its chrome with no
 * photograph in it, and arc-image-cropper keeps every control disabled. Nothing
 * errors, and it is timing-dependent, so it reads as flaky rather than broken:
 * navigating to another image and back re-keys the element, Lit builds that one,
 * and it works.
 *
 * Like hydrateSlots, this dispatches the event the component was already
 * listening for rather than calling its handler: one contract for four
 * components, and a handler that changes shape keeps working. Handlers are
 * read-and-store, so a second `load` for an image that also fires its own is a
 * no-op.
 *
 * A complete image with pixels in it is unambiguous, and says so synchronously.
 * The 0×0 case is the one that needs `decode()`: an image that failed measures
 * 0×0, but so does a sizeless SVG that loaded perfectly well, and calling that
 * an error would send every one of them to the fallback.
 *
 * Call from `connectedCallback`, which is where the parser's shadow root can
 * still be told apart from one Lit is about to build.
 *
 * @param {import('lit').LitElement} host - Component that renders `<img>` and gates paint on its load.
 */
export function hydrateImages(host) {
  // Pre-first-update, a shadow root that already exists came from the parser.
  // Client-side there is nothing to repair: the listener is attached before
  // the element exists, and firing anyway would double a public arc-load.
  if (host.hasUpdated || host.shadowRoot === null) return;

  // After the update, not inside it: these handlers write reactive state, which
  // is Lit's change-in-update warning if it lands during the render that
  // attached them. Same reasoning as hydrate-slots.js, one cycle later.
  host.updateComplete.then(() => {
    const root = host.renderRoot;
    if (!root?.querySelectorAll) return;

    for (const img of root.querySelectorAll('img')) {
      // Still in flight: the browser's own event is coming, and is the one to
      // wait for. An image with no src was never owed an event at all.
      if (!img.complete) continue;
      if (!(img.currentSrc || img.getAttribute('src'))) continue;

      if (img.naturalWidth > 0) {
        img.dispatchEvent(new Event('load'));
      } else if (typeof img.decode === 'function') {
        img.decode().then(
          () => img.dispatchEvent(new Event('load')),
          () => img.dispatchEvent(new Event('error')),
        );
      } else {
        img.dispatchEvent(new Event('error'));
      }
    }
  });
}
