/**
 * A DOM-less markup sanitizer.
 *
 * Two components need to sanitize untrusted markup — arc-icon for SVG and
 * arc-markdown for the HTML its parser emits — and both used `DOMParser`, which
 * does not exist in Node. That confined each of them to the browser: a page
 * that server-rendered either one threw.
 *
 * There is a second reason not to keep a browser implementation and a server
 * one. Hydration reconnects to the server's DOM rather than re-rendering it, so
 * the two have to agree byte for byte; a split would drift the first time they
 * disagreed about whitespace or attribute order. One scanner, run everywhere,
 * is the only version of this that stays correct.
 *
 * Scope: defence in depth, not a trust boundary. Icons come from the generated
 * Phosphor/Lucide sets or `iconRegistry.set()`, and arc-markdown's parser
 * escapes `<`, `>` and `&` in its source before emitting any tag — so neither
 * caller can normally be fed attacker-authored markup at all. This exists so
 * that a registry fed from a CMS, or a parser bug, is not instantly a script
 * injection.
 */

/** Whitespace and C0/C1 control characters, which browsers ignore in a scheme. */
const IGNORABLE = /[\s\u0000-\u001F\u007F-\u009F]+/g;

/**
 * Strip the characters a browser throws away before it resolves a scheme, so
 * `java\tscript:` is recognized for what it is.
 */
export function normalizeUrl(value) {
  return value.replace(IGNORABLE, '').toLowerCase();
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
  if (src[i] === '/') {
    selfClosing = true;
    i++;
  }
  while (i < src.length && src[i] !== '>') i++;
  return { name, closing, selfClosing, attributes, end: i + 1 };
}

/**
 * Sanitize a markup string.
 *
 * @param {string} source
 * @param {object} config
 * @param {Set<string>} config.banned      Tags dropped with their whole subtree.
 * @param {Set<string>} config.urlAttributes Attributes whose value is a URL.
 * @param {(value: string) => boolean} config.isSafeUrl
 * @param {string} [config.rootTag]        Keep only this element and its
 *   contents, discarding anything around it. Returns null when it is absent.
 * @param {(tag: {name: string, attributes: Array}) => void} [config.onTag]
 *   Last look at a surviving opening tag, for additions like `rel` on links.
 * @returns {string|null}
 */
export function sanitizeMarkup(source, config) {
  if (typeof source !== 'string') return null;
  const { banned, urlAttributes, isSafeUrl, rootTag, onTag } = config;

  const keep = (name, value) => {
    const lower = name.toLowerCase();
    // Event handlers, in every spelling the parser would accept.
    if (lower.startsWith('on')) return false;
    if (urlAttributes.has(lower) && !isSafeUrl(value ?? '')) return false;
    return true;
  };

  const serialize = (tag) => {
    if (onTag) onTag(tag);
    let out = `<${tag.name}`;
    for (const { name, value } of tag.attributes) {
      if (!keep(name, value)) continue;
      out += value === null ? ` ${name}` : ` ${name}="${value.replace(/"/g, '&quot;')}"`;
    }
    return `${out}${tag.selfClosing ? '/' : ''}>`;
  };

  let out = '';
  let depth = 0; // nesting depth inside rootTag, when there is one
  let skipDepth = 0; // >0 while inside a banned subtree
  let started = !rootTag;
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
      if (tag.name !== rootTag || tag.closing) continue;
      started = true;
      depth = 1;
      out += serialize(tag);
      if (tag.selfClosing) break;
      continue;
    }

    if (skipDepth > 0) {
      if (tag.closing) {
        if (banned.has(tag.name)) skipDepth--;
      } else if (banned.has(tag.name) && !tag.selfClosing) {
        skipDepth++;
      }
      continue;
    }

    if (tag.closing) {
      if (rootTag && tag.name === rootTag) {
        depth--;
        if (depth === 0) {
          out += `</${rootTag}>`;
          break;
        }
      }
      out += `</${tag.name}>`;
      continue;
    }

    if (banned.has(tag.name)) {
      if (!tag.selfClosing) skipDepth++;
      continue;
    }

    if (rootTag && tag.name === rootTag) depth++;
    out += serialize(tag);
  }

  return started ? out : null;
}
