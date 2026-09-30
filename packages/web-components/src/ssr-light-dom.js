/**
 * A component's light DOM, as the server can offer it.
 *
 * Server-only; imported by ssr.js after @lit-labs/ssr has installed its DOM
 * shim. lit-ssr renders a host from its attributes and nothing else: the
 * children in the page are markup it writes out after the host's shadow root,
 * never objects the host can read. A component that builds its shadow tree
 * from its children (arc-breadcrumb from its items, arc-navigation-menu from
 * its nav items, arc-tabs from its tabs) therefore rendered an empty frame on
 * the server and filled it in on the client, which is a layout shift on every
 * page and, for navigation, no navigation at all without JavaScript.
 *
 * So ssr.js parses each such host's children out of the page and builds
 * these nodes from them. A child that is a defined custom element is a real
 * instance of its class, with its attributes applied the way lit-ssr applies
 * a host's, so a getter like arc-breadcrumb-item's `label` runs its own code.
 * What the shim lacks (childNodes, textContent, a small querySelectorAll) is
 * added here, and only as much of it as a component reading its children
 * needs: tag, class and attribute selectors, descendant and `:scope >`
 * combinators.
 */
// parse5 comes in with @lit-labs/ssr, not with this package, so ssr.js
// resolves it from there and passes its parseFragment in.

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

class ServerText {
  constructor(value, parent) {
    this.nodeType = TEXT_NODE;
    this.textContent = value;
    this.nodeValue = value;
    this.parentNode = parent;
  }
}

/** The DOM surface a reader walks, on any server node. */
const TREE = {
  get childNodes() {
    return this.__arcChildNodes;
  },
  get children() {
    return this.__arcChildNodes.filter((n) => n.nodeType === ELEMENT_NODE);
  },
  get firstElementChild() {
    return this.children[0] ?? null;
  },
  get textContent() {
    return this.__arcChildNodes.map((n) => n.textContent).join('');
  },
  get parentElement() {
    return this.__arcParent ?? null;
  },
  querySelectorAll(selector) {
    return queryAll(this, selector);
  },
  querySelector(selector) {
    return queryAll(this, selector)[0] ?? null;
  },
  matches(selector) {
    return selector.split(',').some((s) => matchesCompound(this, s.trim()));
  },
  closest(selector) {
    for (let n = this; n; n = n.__arcParent) if (n.matches?.(selector)) return n;
    return null;
  },
  // The two properties a reader sets on its children: arc-tabs hides the
  // panels it isn't showing, arc-sortable-list moves each item into a row's
  // named slot. Backed by the attribute, so the change can be written back
  // into the page (see lightDomEdits).
  get hidden() {
    return this.hasAttribute('hidden');
  },
  set hidden(value) {
    if (value) this.setAttribute('hidden', '');
    else this.removeAttribute('hidden');
  },
  get slot() {
    return this.getAttribute('slot') ?? '';
  },
  set slot(value) {
    this.setAttribute('slot', value);
  },
  // arc-description-list draws its dividers as inline borders on its items.
  get style() {
    return (this.__arcStyle ??= inlineStyle(this));
  },
};

/**
 * Enough of CSSStyleDeclaration for a reader that sets properties on a
 * child: camelCase or dashed names, '' to remove, setProperty and
 * getPropertyValue. It writes through to the `style` attribute.
 */
function inlineStyle(el) {
  const read = () =>
    new Map(
      (el.getAttribute('style') ?? '')
        .split(';')
        .map((d) => d.split(':'))
        .filter(([k, ...v]) => k.trim() && v.length)
        .map(([k, ...v]) => [k.trim(), v.join(':').trim()]),
    );
  const write = (map) => {
    const text = [...map].map(([k, v]) => `${k}: ${v}`).join('; ');
    if (text) el.setAttribute('style', text);
    else el.removeAttribute('style');
  };
  const dashed = (name) =>
    name.startsWith('--') ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  const set = (name, value) => {
    const map = read();
    if (value === '' || value == null) map.delete(dashed(name));
    else map.set(dashed(name), String(value));
    write(map);
  };
  const api = {
    setProperty: set,
    removeProperty: (name) => set(name, ''),
    getPropertyValue: (name) => read().get(dashed(name)) ?? '',
  };
  return new Proxy(api, {
    get: (target, key) =>
      key in target
        ? target[key]
        : typeof key === 'string'
          ? (read().get(dashed(key)) ?? '')
          : undefined,
    set: (target, key, value) => {
      set(key, value);
      return true;
    },
  });
}

/** Plain elements (an `<a>`, a `<span>`) that no component class owns. */
class ServerElement {
  constructor(localName) {
    this.nodeType = ELEMENT_NODE;
    this.localName = localName;
    this.tagName = localName.toUpperCase();
    this.__arcAttrs = new Map();
  }
  getAttribute(name) {
    return this.__arcAttrs.has(name) ? this.__arcAttrs.get(name) : null;
  }
  hasAttribute(name) {
    return this.__arcAttrs.has(name);
  }
  setAttribute(name, value) {
    this.__arcAttrs.set(name, String(value));
  }
  removeAttribute(name) {
    this.__arcAttrs.delete(name);
  }
  get attributes() {
    return [...this.__arcAttrs].map(([name, value]) => ({ name, value }));
  }
  get id() {
    return this.getAttribute('id') ?? '';
  }
  get className() {
    return this.getAttribute('class') ?? '';
  }
}
Object.defineProperties(ServerElement.prototype, Object.getOwnPropertyDescriptors(TREE));

/**
 * Build one node from a parse5 node. Custom elements get their own class,
 * constructed as lit-ssr constructs a host, and the tree surface on top.
 */
function build(p5, parent) {
  if (p5.nodeName === '#text') return new ServerText(p5.value, parent);
  if (p5.tagName) p5.attrs = p5.attrs ?? [];
  if (!p5.tagName) return null;
  const name = p5.tagName;
  const Ctor = name.includes('-') ? globalThis.customElements?.get(name) : undefined;
  let el;
  if (Ctor) {
    el = new Ctor();
    el.nodeType = ELEMENT_NODE;
    for (const { name: attr, value } of p5.attrs) {
      el.setAttribute(attr, value);
      el.attributeChangedCallback?.(attr, null, value);
    }
    for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(TREE))) {
      Object.defineProperty(el, key, { ...desc, configurable: true });
    }
  } else {
    el = new ServerElement(name);
    for (const { name: attr, value } of p5.attrs) el.setAttribute(attr, value);
  }
  el.__arcParent = parent?.nodeType === ELEMENT_NODE ? parent : null;
  el.__arcSource = p5.sourceCodeLocation?.startTag;
  el.__arcAttrsBefore = attrList(el);
  // A <template>'s children live in its content fragment, which no reader
  // walks; leave it empty rather than half-modelled.
  const kids = p5.nodeName === 'template' ? [] : (p5.childNodes ?? []);
  el.__arcChildNodes = kids.map((k) => build(k, el)).filter(Boolean);
  return el;
}

/**
 * The host's children, grouped by the slot each is assigned to: `''` for the
 * default slot, otherwise the `slot` attribute's value. Only direct children
 * are assigned, as in the browser; whitespace-only text is kept, as
 * assignedNodes keeps it.
 *
 * @param {string} innerHtml The host's inner HTML, as it appears in the page.
 * @param {(html: string) => object} parseFragment parse5's.
 * @returns {Map<string, object[]>}
 */
export function slottedNodes(innerHtml, parseFragment) {
  const fragment = parseFragment(innerHtml, { sourceCodeLocationInfo: true });
  const bySlot = new Map();
  for (const p5 of fragment.childNodes) {
    const node = build(p5, null);
    if (!node) continue;
    const slot = node.nodeType === ELEMENT_NODE ? (node.getAttribute('slot') ?? '') : '';
    if (!bySlot.has(slot)) bySlot.set(slot, []);
    bySlot.get(slot).push(node);
  }
  return bySlot;
}

/**
 * Start tags to rewrite, for the children whose attributes a reader changed:
 * `[start, end, tag]`, offsets into the inner HTML the nodes were built from.
 */
export function lightDomEdits(bySlot) {
  const edits = [];
  for (const nodes of bySlot.values()) {
    for (const node of nodes) {
      if (node.nodeType !== ELEMENT_NODE || !node.__arcSource) continue;
      // Only what readers set on children. A component instance also sets
      // attributes of its own while it's constructed (a reflected default),
      // which the page never had and the client wouldn't write either.
      const before = new Map(node.__arcAttrsBefore);
      const after = new Map(before);
      let changed = false;
      const names = new Set([
        ...WRITTEN,
        ...[...before.keys(), ...attrList(node).map(([k]) => k)].filter(isData),
      ]);
      for (const name of names) {
        const was = before.get(name);
        const now = node.getAttribute(name) ?? undefined;
        if (was === now) continue;
        changed = true;
        if (now === undefined) after.delete(name);
        else after.set(name, now);
      }
      if (!changed) continue;
      const attrs = [...after]
        .map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`))
        .join('');
      edits.push([
        node.__arcSource.startOffset,
        node.__arcSource.endOffset,
        `<${node.localName}${attrs}>`,
      ]);
    }
  }
  return edits;
}

/**
 * The attributes a reader may change on a child, and so the server writes:
 * these three, and any `data-*` (arc-code-group marks its blocks
 * `data-grouped`). A component never reflects a default of its own as one.
 */
const WRITTEN = ['hidden', 'slot', 'style'];
const isData = (name) => name.startsWith('data-');

function attrList(el) {
  return (el.attributes ?? []).map(({ name, value }) => [name, value]);
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * A stand-in for an HTMLSlotElement, enough for a slotchange handler:
 * `assignedElements`, `assignedNodes`, `name`.
 */
export function serverSlot(name, nodes) {
  return {
    name,
    localName: 'slot',
    assignedNodes: () => nodes.slice(),
    assignedElements: () => nodes.filter((n) => n.nodeType === ELEMENT_NODE),
  };
}

/* ---- the selector subset ---- */

function queryAll(root, selector) {
  const out = [];
  for (const part of selector.split(',')) {
    const s = part.trim();
    const direct = s.startsWith(':scope >');
    const chain = (direct ? s.slice(':scope >'.length) : s)
      .trim()
      .split(/\s*(>)\s*|\s+/)
      .filter(Boolean);
    walk(root, (el, depth) => {
      if (direct && depth !== 1) return;
      if (matchesChain(el, chain) && !out.includes(el)) out.push(el);
    });
  }
  return out;
}

function walk(root, visit, depth = 0) {
  for (const child of root.childNodes ?? []) {
    if (child.nodeType !== ELEMENT_NODE) continue;
    visit(child, depth + 1);
    walk(child, visit, depth + 1);
  }
}

/** `a b > c`, right to left, against the element and its ancestors. */
function matchesChain(el, chain) {
  let i = chain.length - 1;
  if (!matchesCompound(el, chain[i])) return false;
  let node = el;
  i--;
  while (i >= 0) {
    const child = chain[i] === '>';
    if (child) i--;
    const want = chain[i];
    if (child) {
      node = node.__arcParent;
      if (!node || !matchesCompound(node, want)) return false;
    } else {
      node = node.__arcParent;
      while (node && !matchesCompound(node, want)) node = node.__arcParent;
      if (!node) return false;
    }
    i--;
  }
  return true;
}

const COMPOUND = /([a-z][a-z0-9-]*|\*)?((?:[.#][\w-]+|\[[^\]]+\])*)$/i;

function matchesCompound(el, compound) {
  const m = COMPOUND.exec(compound);
  if (!m || m.index !== 0) return false;
  const [, tag, rest] = m;
  if (tag && tag !== '*' && el.localName !== tag.toLowerCase()) return false;
  for (const piece of rest.match(/[.#][\w-]+|\[[^\]]+\]/g) ?? []) {
    if (piece[0] === '.') {
      if (!(el.getAttribute('class') ?? '').split(/\s+/).includes(piece.slice(1))) return false;
    } else if (piece[0] === '#') {
      if (el.getAttribute('id') !== piece.slice(1)) return false;
    } else {
      const [, name, value] =
        /^\[\s*([\w-]+)\s*(?:=\s*["']?([^"'\]]*)["']?)?\s*\]$/.exec(piece) ?? [];
      if (!name || !el.hasAttribute(name)) return false;
      if (value !== undefined && el.getAttribute(name) !== value) return false;
    }
  }
  return true;
}
