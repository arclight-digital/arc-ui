/**
 * SVG sanitizing for arc-icon, over the shared DOM-less scanner.
 *
 * This replaced a `new DOMParser().parseFromString(...)` implementation, which
 * worked but confined arc-icon to the browser: DOMParser does not exist in
 * Node, so any page that server-rendered an `<arc-icon name="…">` threw. That
 * was invisible for a long time because check-ssr renders bare tags, and a bare
 * `<arc-icon>` never reaches this code — only a named one does.
 *
 * The scanner itself lives in ../shared/sanitize-markup.js, which explains why
 * there is exactly one implementation rather than a browser and a server one.
 */
import { sanitizeMarkup, normalizeUrl } from '../shared/sanitize-markup.js';

/**
 * Elements dropped along with their entire subtree.
 *
 * `foreignObject` is here because it re-enters HTML parsing inside SVG, which
 * puts `<iframe>`, `<object>` and friends back on the table.
 */
const BANNED_ELEMENTS = new Set([
  'script',
  'foreignobject',
  'iframe',
  'embed',
  'object',
  'handler',
  'annotation-xml',
]);

/** Attributes carrying a URL, where a `javascript:` value would execute. */
const URL_ATTRIBUTES = new Set(['href', 'xlink:href', 'src', 'from', 'to', 'values']);

/**
 * Whether a URL attribute value is safe to keep.
 *
 * Only same-document references and scheme-less paths survive. A
 * `<use href="https://evil.example/#x">` pulls a remote document into the icon,
 * and `java\tscript:` is a scheme to a browser — so the check happens after
 * stripping the characters browsers throw away.
 */
function isSafeUrl(value) {
  const normalized = normalizeUrl(value);
  if (normalized.startsWith('#')) return true;
  return !/^[a-z][a-z0-9+.-]*:/.test(normalized);
}

const _cache = new Map();

/**
 * Sanitize an SVG source string, returning markup safe to pass to `unsafeHTML`,
 * or `null` if it contains no `<svg>` root.
 *
 * Everything outside the outermost `<svg>…</svg>` is discarded, which drops the
 * XML declaration and doctype that some icon sets ship with.
 */
export function sanitizeSvg(source) {
  if (typeof source !== 'string') return null;
  const cached = _cache.get(source);
  if (cached !== undefined) return cached;

  const result = sanitizeMarkup(source, {
    banned: BANNED_ELEMENTS,
    urlAttributes: URL_ATTRIBUTES,
    isSafeUrl,
    rootTag: 'svg',
  });
  _cache.set(source, result);
  return result;
}
