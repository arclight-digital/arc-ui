import { tekturSubsetBase64 } from './tektur-font.js';
import { base64ToBlobUrl } from './blob-url.js';

let injected = false;

/** Inject Tektur @font-face into document scope (idempotent). */
export function injectTekturFont() {
  if (injected) return;
  injected = true;
  const url = base64ToBlobUrl(tekturSubsetBase64);
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Tektur Subset';
      src: url('${url}') format('woff2');
      font-weight: 400 900;
      font-display: block;
    }
  `;
  document.head.appendChild(style);
}
