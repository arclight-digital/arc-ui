/** Convert a base64 string to a same-origin blob URL (bypasses font-src 'self' CSP). */
export function base64ToBlobUrl(b64, mime = 'font/woff2') {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([buf], { type: mime }));
}
