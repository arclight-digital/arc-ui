import { tekturSubsetBase64 } from './tektur-font.js';
import { base64ToBlobUrl } from './blob-url.js';

let injected = false;

/**
 * Register the Tektur subset on the document's FontFaceSet (idempotent).
 *
 * Uses the FontFace API rather than a `<style>` appended to <head> so the
 * font survives Astro view-transition swaps — those replace <head>/<body>,
 * discarding runtime-injected style elements, but leave document.fonts intact.
 */
export function injectTekturFont() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const url = base64ToBlobUrl(tekturSubsetBase64);
  const face = new FontFace('Tektur Subset', `url(${url}) format('woff2')`, {
    weight: '400 900',
    display: 'block',
  });
  face
    .load()
    .then((f) => document.fonts.add(f))
    .catch(() => {
      injected = false;
    });
}
