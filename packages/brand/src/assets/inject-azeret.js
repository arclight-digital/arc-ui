import { azeretSubsetBase64 } from './azeret-font.js';
import { base64ToBlobUrl } from './blob-url.js';

let injected = false;

/**
 * Register the Azeret Mono subset on the document's FontFaceSet (idempotent).
 *
 * Uses the FontFace API rather than a `<style>` appended to <head> so the
 * font survives Astro view-transition swaps — those replace <head>/<body>,
 * discarding runtime-injected style elements, but leave document.fonts intact.
 */
export function injectAzeretFont() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const url = base64ToBlobUrl(azeretSubsetBase64);
  const face = new FontFace('Azeret Mono Subset', `url(${url}) format('woff2')`, {
    weight: '100 900',
    display: 'block',
  });
  face
    .load()
    .then((f) => document.fonts.add(f))
    .catch(() => {
      injected = false;
    });
}
