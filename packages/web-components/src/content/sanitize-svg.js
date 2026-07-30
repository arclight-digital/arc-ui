/**
 * A DOM-less SVG sanitizer.
 *
 * This replaced a `new DOMParser().parseFromString(...)` implementation, which
 * worked but confined arc-icon to the browser: DOMParser does not exist in
 * Node, so any page that server-rendered an `<arc-icon name="…">` threw. That
 * was invisible for a long time because check-ssr renders bare tags, and a bare
 * `<arc-icon>` never reaches this code — only a named one does.
 *
 * There is a second, subtler reason not to keep two implementations and pick by
 * environment. Hydration reconnects to the server's DOM rather than re-rendering
 * it, so server and client output have to be identical, byte for byte. One code
 * path is the only way to guarantee that; a "sanitize with DOMParser in the
 * browser, regex on the server" split would drift the first time the two
 * disagreed about whitespace.
 *
 * Scope: this is defence in depth, not a trust boundary. Icons come from the
 * generated Phosphor/Lucide sets or from `iconRegistry.set()`, which is the
 * consumer's own code — neither is attacker-controlled in any normal setup. It
 * exists so that a registry fed from a CMS or an API is not instantly a script
 * injection.
 */

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

/** Whitespace and C0/C1 control characters, which browsers ignore in a scheme. */
const IGNORABLE = /[\s\u0000-\u001F\u007F-\u009F]+/g;

/**
 * Whether a URL attribute value is safe to keep.
 *
 * Only same-document references and scheme-less paths survive. A
 * `<use href="https://evil.example/#x">` pulls a remote document into the icon,
 * and `java\tscript:` is a scheme to a browser — so the check has to happen
 * after stripping the characters browsers throw away.
 */
function isSafeUrl(value) {
  const normalized = value.replace(IGNORABLE, '').toLowerCase();
  if (normalized.startsWith('#')) return true;
  return !/^[a-z][a-z0-9+.-]*:/.test(normalized);
}

function isSafeAttribute(name, value) {
  const lower = name.toLowerCase();
  // Event handlers, in every spelling the parser would accept.
  if (lower.startsWith('on')) return false;
  if (URL_ATTRIBUTES.has(lower) && !isSafeUrl(value)) return false;
  return true;
}

/**
 * Scan one tag starting at `<`, returning what it is and where it ends.
 *
 * Attribute values are read quote-aware, because `>` inside a quoted value is
 * data — splitting on the next `>` would truncate `<svg data-x="a>b">` mid-tag.
 */
function readTag(src, start) {
  const closing = src[start + 1] === '/';
  let i = start + (closing ? 2 : 1);
  const nameStart = i;
  while (i < src.length && /[^\s/>]/.test(src[i])) i++;
  const name = src.slice(nameStart, i).toLowerCase();

  const attributes = [];
  for (;;) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length || src[i] === '>' || src[i] === '/') break;

    const attrStart = i;
    while (i < src.length && /[^\s=/>]/.test(src[i])) i++;
    const attrName = src.slice(attrStart, i);
    if (!attrName) break;

    let j = i;
    while (j < src.length && /\s/.test(src[j])) j++;
    if (src[j] !== '=') {
      attributes.push({ name: attrName, value: null });
      continue;
    }
    i = j + 1;
    while (i < src.length && /\s/.test(src[i])) i++;

    const quote = src[i];
    let value;
    if (quote === '"' || quote === "'") {
      i++;
      const valueStart = i;
      while (i < src.length && src[i] !== quote) i++;
      value = src.slice(valueStart, i);
      i++;
    } else {
      const valueStart = i;
      while (i < src.length && /[^\s>]/.test(src[i])) i++;
      value = src.slice(valueStart, i);
    }
    attributes.push({ name: attrName, value });
  }

  let selfClosing = false;
  if (src[i] === '/') { selfClosing = true; i++; }
  while (i < src.length && src[i] !== '>') i++;
  return { name, closing, selfClosing, attributes, end: i + 1 };
}

/** Re-serialize a tag, keeping only the attributes that survived the filter. */
function serializeTag({ name, selfClosing, attributes }) {
  let out = `<${name}`;
  for (const { name: attrName, value } of attributes) {
    if (value === null) {
      if (isSafeAttribute(attrName, '')) out += ` ${attrName}`;
      continue;
    }
    if (!isSafeAttribute(attrName, value)) continue;
    out += ` ${attrName}="${value.replace(/"/g, '&quot;')}"`;
  }
  return `${out}${selfClosing ? '/' : ''}>`;
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

  let out = '';
  let depth = 0;      // nesting depth inside the root <svg>
  let skipDepth = 0;  // >0 while inside a banned subtree
  let started = false;
  let i = 0;

  while (i < source.length) {
    const next = source.indexOf('<', i);
    if (next === -1) {
      if (started && skipDepth === 0) out += source.slice(i);
      break;
    }

    if (started && skipDepth === 0) out += source.slice(i, next);

    // Comments, CDATA, declarations and processing instructions carry no
    // element content worth keeping, and each has its own terminator.
    if (source.startsWith('<!--', next)) {
      const close = source.indexOf('-->', next);
      i = close === -1 ? source.length : close + 3;
      continue;
    }
    if (source.startsWith('<![CDATA[', next)) {
      const close = source.indexOf(']]>', next);
      i = close === -1 ? source.length : close + 3;
      continue;
    }
    if (source.startsWith('<!', next) || source.startsWith('<?', next)) {
      const close = source.indexOf('>', next);
      i = close === -1 ? source.length : close + 1;
      continue;
    }

    const tag = readTag(source, next);
    i = tag.end;

    if (!started) {
      // Skip anything before the root element.
      if (tag.name !== 'svg' || tag.closing) continue;
      started = true;
      depth = 1;
      out += serializeTag(tag);
      if (tag.selfClosing) break;
      continue;
    }

    if (skipDepth > 0) {
      if (tag.closing) {
        if (BANNED_ELEMENTS.has(tag.name)) skipDepth--;
      } else if (BANNED_ELEMENTS.has(tag.name) && !tag.selfClosing) {
        skipDepth++;
      }
      continue;
    }

    if (tag.closing) {
      if (tag.name === 'svg') {
        depth--;
        if (depth === 0) { out += '</svg>'; break; }
      }
      out += `</${tag.name}>`;
      continue;
    }

    if (BANNED_ELEMENTS.has(tag.name)) {
      if (!tag.selfClosing) skipDepth++;
      continue;
    }

    if (tag.name === 'svg') depth++;
    out += serializeTag(tag);
  }

  const result = started ? out : null;
  _cache.set(source, result);
  return result;
}
