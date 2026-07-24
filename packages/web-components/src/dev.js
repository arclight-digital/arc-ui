/**
 * Opt-in development warnings for ARC UI.
 *
 *   import '@arclux/arc-ui/dev';
 *
 * Watches the document for arc-* elements and warns in the console about
 * common mistakes, with a pointer to the right docs page:
 *   - attribute values outside a component's allowed set
 *     (`<arc-button variant="primry">`)
 *   - camelCase property names used as attributes
 *     (`confirmLabel="…"` instead of `confirm-label="…"`)
 *   - attribute-name typos one edit away from a known attribute
 *     (`vairant`, `laoding`)
 *
 * Import it in development only — it costs a document-wide MutationObserver
 * and ships no warnings logic in your production bundle if you gate the
 * import (e.g. `if (import.meta.env.DEV) import('@arclux/arc-ui/dev')`).
 * Elements inside shadow roots are not observed, so ARC UI's own internal
 * composition never triggers warnings.
 */
import schema from './dev-schema.js';

const DOCS_BASE = 'https://arcui.dev/docs/components/';

// Attributes that are legitimate on any element.
const GLOBAL_ATTRS = new Set([
  'class', 'style', 'id', 'slot', 'part', 'exportparts', 'role', 'tabindex',
  'hidden', 'dir', 'lang', 'title', 'translate', 'autofocus', 'inert',
  'popover', 'draggable', 'spellcheck', 'contenteditable', 'is', 'itemid',
  'itemprop', 'itemref', 'itemscope', 'itemtype', 'nonce', 'accesskey',
]);

const warned = new WeakMap(); // element → Set of "attr=value" already reported

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

function warn(el, key, message) {
  let seen = warned.get(el);
  if (!seen) warned.set(el, (seen = new Set()));
  if (seen.has(key)) return;
  seen.add(key);
  const entry = schema[el.localName];
  const docs = entry?.slug ? ` Docs: ${DOCS_BASE}${entry.slug}` : '';
  console.warn(`[arc-ui] <${el.localName}>: ${message}${docs}`);
}

function checkAttr(el, entry, name) {
  if (GLOBAL_ATTRS.has(name) || name.startsWith('data-') || name.startsWith('aria-') || name.startsWith('on')) return;

  const value = el.getAttribute(name);

  if (entry.enums && name in entry.enums && value !== null && !entry.enums[name].includes(value)) {
    warn(el, `${name}=${value}`, `"${value}" is not a valid ${name} — expected ${entry.enums[name].join(' | ')}.`);
    return;
  }

  if (!entry.attrs.includes(name)) {
    // camelCase property written as an attribute (HTML lowercases it)
    const dekebabed = entry.attrs.find((a) => a.includes('-') && a.replace(/-/g, '') === name);
    if (dekebabed) {
      warn(el, `attr:${name}`, `attribute "${name}" looks like the ${dekebabed.replace(/-(\w)/g, (_, c) => c.toUpperCase())} property — attributes are kebab-case: use "${dekebabed}".`);
      return;
    }
    const near = entry.attrs.find((a) => editDistance(a, name) <= (name.length > 4 ? 2 : 1));
    if (near) {
      warn(el, `attr:${name}`, `unknown attribute "${name}" — did you mean "${near}"?`);
    }
  }
}

function checkElement(el) {
  const entry = schema[el.localName];
  if (!entry) return;
  for (const { name } of el.attributes) checkAttr(el, entry, name);
}

function scan(root) {
  if (root.localName?.startsWith('arc-')) checkElement(root);
  if (root.querySelectorAll) {
    for (const el of root.querySelectorAll('*')) {
      if (el.localName.startsWith('arc-')) checkElement(el);
    }
  }
}

if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') {
        const el = r.target;
        if (el.localName?.startsWith('arc-')) {
          const entry = schema[el.localName];
          if (entry && el.hasAttribute(r.attributeName)) checkAttr(el, entry, r.attributeName);
        }
      } else {
        for (const node of r.addedNodes) {
          if (node.nodeType === 1) scan(node);
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scan(document.documentElement), { once: true });
  } else {
    scan(document.documentElement);
  }

  console.info('[arc-ui] dev warnings active — do not import @arclux/arc-ui/dev in production.');
}
