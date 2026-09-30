/**
 * Server-render ARC components into declarative shadow DOM, from HTML.
 *
 *   import { renderDeclarativeShadowDOM } from '@arclux/arc-ui/ssr';
 *
 *   const { html, stylesheets } = await renderDeclarativeShadowDOM(pageHtml);
 *   // write each stylesheet under /_arc, serve `html`
 *
 * **Server-only.** Requires `@lit-labs/ssr`, which is an optional peer: install
 * it alongside if you server-render, and nothing changes for anyone who does
 * not.
 *
 * ## Why this takes HTML rather than components
 *
 * Every framework integration for Lit SSR works from the component graph, which
 * is why only React has one and Vue, Svelte, Solid, Angular and Preact were
 * documented as unsupported. But nothing about the problem needs the graph. A
 * framework's server render produces HTML; every `<arc-*>` in it can be
 * rendered to a declarative shadow root by reading the markup alone.
 *
 * So this is HTML in, HTML out, and it does not care what produced the input:
 * Nuxt, SvelteKit, Angular Universal, Next, Astro, or a string you assembled by
 * hand. It is the same code that server-renders arcui.dev, where it runs over
 * 177 pages and 43,620 shadow roots on every build.
 *
 * ## What it does
 *
 * 1. Defines every component in this process, once.
 * 2. Resolves the icons the markup names: arc-icon can only render a glyph
 *    already in memory, since the icon sets are code-split per glyph.
 * 3. Renders the whole document through `@lit-labs/ssr`, giving each element a
 *    `<template shadowrootmode>` holding its rendered shadow tree.
 * 4. Skips anything inside a closed overlay, which no first paint can reach.
 * 5. Lifts each shadow root's stylesheet into a shared file and links it.
 * 6. Marks the document server-rendered and inlines the icons it used.
 *
 * ## Two things the caller must do
 *
 * Write the returned `stylesheets` to disk (or serve them) under the same
 * `stylesheetPath` they were linked with; the shadow roots reference them by
 * URL. And import `@arclux/arc-ui/hydrate` on the client *before any component
 * is defined*, or Lit renders over this markup instead of adopting it. On a
 * bundler that usually means forcing hydration support into its own chunk;
 * `docs/astro.config.mjs` in this repo shows why an import statement alone is
 * not enough.
 */
import { pathToFileURL } from 'node:url';
import { CLIENT_ONLY } from './ssr-client-only.js';

/**
 * Components closed until something opens them.
 *
 * The OverlayController set: everything rendered into the top layer and invisible
 * until asked for. Nothing inside one can appear in a first paint, so rendering
 * their contents spends bytes on markup no reader and no metric ever sees. On
 * arcui.dev that was 174 of a page's 427 roots (the whole ⌘K palette).
 *
 * arc-lightbox belongs here too. A gallery passed as a property renders empty
 * anyway, but the documented static form is a JSON `images` attribute, which
 * the server can read. Left out of this list (3.0 to 4.2), those pages shipped
 * a full figure, four icon-button roots and an eager fetch of a full-size
 * photograph inside a display:none dialog, on a paint that could never show
 * any of it. display:none does not stop an image from downloading.
 */
export const CLOSED_OVERLAYS = [
  'arc-command-palette',
  'arc-dialog',
  'arc-sheet',
  'arc-drawer',
  'arc-lightbox',
];

/**
 * Long repeated lists, and how many of each to render.
 *
 * A navigation sidebar listing every page is real, visible content (unlike a
 * closed overlay), but only the first screenful of it can be in a first paint,
 * and the rest scrolls inside its own container. On arcui.dev the sidebar is
 * 175 `arc-sidebar-link` roots and 30K of the 99K of shadow markup a component
 * page carries; the twenty-odd that are actually visible carry the paint.
 *
 * The remainder are marked `data-arc-defer`, which keeps the FOUC guard's
 * `opacity: 0`. Layout is held, so nothing shifts when they upgrade; they fade
 * in. That is the opposite treatment from a closed overlay, which must occupy
 * nothing, and getting the two confused is measurable: marking deferred
 * elements `display: none` would collapse a sidebar mid-paint.
 */
export const LIST_BUDGETS = {
  'arc-sidebar-link': 25,
};

/**
 * Components that render the text they are given as light DOM, and the
 * property that carries it.
 *
 * Streaming SSR renders a host's shadow root before its children have been
 * parsed, so `this.textContent` is empty on the server, the one input the
 * client has that the server does not. Left alone, arc-markdown served an
 * empty prose block *and* threw on hydration, because the client's first
 * render parses the real text into a template the server never produced.
 * Hoisting the text into the component's own attribute before rendering gives
 * both sides the same source: the server renders the parsed content, and the
 * element upgrades with the attribute already set, so the client's first
 * render matches it. Same principle as the icon payload below: hydration is
 * only clean when the client's first render needs nothing the server had
 * exclusively.
 *
 * Only plain-text light DOM is hoisted: an attribute cannot carry elements,
 * and the components listed here treat their light DOM as text to parse, not
 * markup to slot.
 */
const TEXT_CONTENT_PROPS = { 'arc-markdown': 'content' };

/** Opening tag of a shadow root, used to find each root's byte span. */
const SHADOW_OPEN = /<template shadowroot(?:mode)?="[^"]*"[^>]*>/g;

/** A shadow root that opens with its stylesheet, which is all of them. */
const SHADOW_STYLE = /(<template shadowroot(?:mode)?="[^"]*"[^>]*>)<style>([\s\S]*?)<\/style>/g;

/** Every ARC tag a page opens. */
const ARC_TAG = /<(arc-[a-z0-9]+(?:-[a-z0-9]+)*)[\s>/]/g;

/** `<arc-icon name="…">`, the only attribute needing resolution before render. */
const ICON_NAME = /<arc-icon\b[^>]*\bname=["']([^"']+)["']/g;

/** The id of the inline icon payload, read by iconRegistry on first lookup. */
const ICON_PAYLOAD_ID = 'arc-icon-payload';

let lit;
let registered = false;

/** Load @lit-labs/ssr and define every component, once per process. */
async function prepare() {
  if (!lit) {
    let ssr;
    try {
      ssr = await import('@lit-labs/ssr');
    } catch (cause) {
      throw new Error(
        '@arclux/arc-ui/ssr needs @lit-labs/ssr, which is an optional peer ' +
          'dependency. Install it in the project that server-renders.',
        { cause },
      );
    }
    const { collectResult } = await import('@lit-labs/ssr/lib/render-result.js');
    const { LitElementRenderer } = await import('@lit-labs/ssr/lib/lit-element-renderer.js');
    const { html, unsafeStatic } = await import('lit/static-html.js');
    // parse5 is @lit-labs/ssr's dependency, not ours: resolve it from there.
    const { createRequire } = await import('node:module');
    const fromSsr = createRequire(import.meta.resolve('@lit-labs/ssr'));
    const { parse, parseFragment } = await import(pathToFileURL(fromSsr.resolve('parse5')).href);
    const lightDom = await import('./ssr-light-dom.js');
    LitElementRenderer.renderOptions.push(readServerSlots);
    lit = { render: ssr.render, collectResult, html, unsafeStatic, parse, parseFragment, lightDom };
  }
  if (!registered) {
    // The barrel is all-or-nothing, so a client-only component would be defined
    // here and then throw on the first page that contains it, while check-ssr,
    // which honours the same list, reported the build as clean. Failing loudly
    // is the only version of this that cannot drift quietly.
    const names = Object.keys(CLIENT_ONLY);
    if (names.length > 0) {
      throw new Error(
        `@arclux/arc-ui/ssr registers components through the ./register.js ` +
          `barrel, which cannot skip the ${names.length} client-only ` +
          `component(s): ${names.join(', ')}. Give it a registration path that ` +
          `omits them before adding an entry to src/ssr-client-only.js.`,
      );
    }
    // @lit-labs/ssr installs the DOM shim on import, so it has to be loaded
    // before any component class is defined, which the order here guarantees.
    await import('./register.js');
    registered = true;
  }
  const { iconRegistry } = await import('./content/icon-registry.js');
  return iconRegistry;
}

/**
 * Render every ARC component in `source` to declarative shadow DOM.
 *
 * @param {string} source Complete HTML document, or a fragment.
 * @param {object} [options]
 * @param {boolean} [options.lift=true] Lift shadow stylesheets into shared
 *   files instead of inlining a copy per component instance. Strongly
 *   recommended: browsers share one constructable stylesheet per component
 *   type, declarative shadow DOM cannot express that, and inlining measured at
 *   89% of all output bytes.
 * @param {string} [options.stylesheetPath='/_arc'] URL prefix the lifted
 *   stylesheets are linked with. The caller serves them from here.
 * @param {string[]} [options.closedOverlays=CLOSED_OVERLAYS] Hosts whose
 *   contents are left for the client. Pass `[]` to render everything.
 * @param {Record<string, number>} [options.listBudgets=LIST_BUDGETS] How many
 *   of each repeated component to render before deferring the rest to the
 *   client. Pass {} to render every one.
 * @param {boolean} [options.inlineIcons=true] Embed the icons the page uses, so
 *   the client's first render matches the server's instead of falling back to
 *   an empty slot while a dynamic import resolves.
 * @returns {Promise<{html: string, stylesheets: Map<string, string>,
 *   roots: number, deferred: number}>}
 */
export async function renderDeclarativeShadowDOM(source, options = {}) {
  const {
    lift = true,
    stylesheetPath = '/_arc',
    closedOverlays = CLOSED_OVERLAYS,
    listBudgets = LIST_BUDGETS,
    inlineIcons = true,
    stylesheets = new Map(),
  } = options;

  const iconRegistry = await prepare();
  // Any custom element, not only ARC's: another Lit library defined in this
  // process (@arclux/brand's logos, a consumer's own) renders the same way,
  // and a page holding only those was passed through untouched.
  if (!/<[a-z][a-z0-9]*-[a-z0-9-]*[\s/>]/.test(source)) {
    return { html: source, stylesheets, roots: 0, deferred: 0 };
  }

  // Resolves against whatever the rendering process has registered, and since
  // 4.7 that is nobody by default. Core ships no icon packs. A server build
  // that wants glyphs in its HTML imports one first:
  //
  //     import '@arclux/arc-ui-icons/phosphor';
  //
  // Without it every name misses, the registry says so once, and each icon
  // renders its empty-slot fallback. That fallback is the *same* tree the
  // client produces under the same conditions, so the page still hydrates
  // cleanly: it is a page with no icons, not a broken one.
  await iconRegistry.preload([...source.matchAll(ICON_NAME)].map((m) => m[1]));
  await defineUsed(source);

  source = hoistTextContent(source);

  source = writeBackLightDom(source);

  const renderOnce = async () => {
    const marked = snapshotSlots(source);
    try {
      return (await lit.collectResult(lit.render(lit.html`${lit.unsafeStatic(marked)}`))).replace(
        SLOT_MARK,
        '',
      );
    } finally {
      SLOT_SNAPSHOTS.clear();
    }
  };
  let out = await renderOnce();

  // Icons a component draws itself (a carousel's chevrons, a player's play
  // glyph) are named in its shadow markup, never in the page, so the preload
  // above can't see them and they rendered as empty placeholders that popped
  // in after load. Their names are in the output: load them and render again,
  // which happens at most once, and only when a page has such an icon.
  const unseen = [...new Set([...out.matchAll(ICON_NAME)].map((m) => m[1]))].filter(
    (n) => !iconRegistry.getSync(n),
  );
  if (unseen.length) {
    await iconRegistry.preload(unseen);
    if (unseen.some((n) => iconRegistry.getSync(n))) out = await renderOnce();
  }

  // lit wraps its output in a part marker, and the opening one lands *before*
  // the doctype, enough to put the document in quirks mode.
  out = out.replace(/^\s*<!--lit-part [^>]*-->/, '').replace(/<!--\/lit-part-->\s*$/, '');

  const capped = closeOverlays(out, closedOverlays);
  const trimmed = trimLists(capped.html, listBudgets);
  out = trimmed.html;

  if (lift) {
    const used = new Set();
    out = liftStylesheets(out, stylesheets, used, stylesheetPath);
    out = preloadStylesheets(out, used, stylesheetPath);
  }
  out = markServerRendered(out);
  out = embedDocumentStyles(out);
  if (inlineIcons) out = embedIcons(out, iconRegistry);

  return {
    html: out,
    stylesheets,
    roots: (out.match(/shadowrootmode/g) || []).length,
    deferred: capped.deferred + trimmed.deferred,
  };
}

/** Snapshot id → the host's children by slot, for the render in progress. */
const SLOT_SNAPSHOTS = new Map();
const SLOT_ATTR = 'data-arc-ssr-slots';
const SLOT_MARK = new RegExp(` ${SLOT_ATTR}="\\d+"`, 'g');

/**
 * Give each host that builds its shadow tree from its children those
 * children, as the server can model them (see ssr-light-dom.js).
 *
 * A reader must compute only what the server can compute too: from the
 * children and their attributes, never from layout. On the render that adopts
 * the server's tree, Lit takes what the client computed as already on the
 * page; a class that depends on a measurement never arrives (arc-top-bar's
 * empty actions box, which measures, reads after hydration instead).
 *
 * A component opts in with `static slotReaders`, mapping a slot name (`''`
 * for the default slot) to the method its `@slotchange` calls, or to a
 * function called with the host as `this`. The server
 * calls that same method with a stand-in slot before the host renders, so
 * the server's shadow tree is the one the client draws, and the client does
 * the same from the declarative slots before its first render (see
 * DeclaredPropsMixin), so the two match and hydration adopts rather than
 * redraws. Each host is marked with an id attribute for the render and the
 * mark is stripped from the output.
 */
function snapshotSlots(page) {
  const edits = [];
  for (const host of readerHosts(page)) {
    const id = String(SLOT_SNAPSHOTS.size);
    SLOT_SNAPSHOTS.set(
      id,
      lit.lightDom.slottedNodes(page.slice(host.innerStart, host.innerEnd), lit.parseFragment),
    );
    const at = page[host.openEnd - 1] === '/' ? host.openEnd - 1 : host.openEnd;
    edits.push([at, ` ${SLOT_ATTR}="${id}"`]);
  }
  // Back to front, so earlier offsets stay valid.
  edits.sort((a, b) => b[0] - a[0]);
  for (const [at, text] of edits) page = page.slice(0, at) + text + page.slice(at);
  return page;
}

/**
 * What a reader does to the children themselves, written into the page.
 *
 * arc-tabs hides every panel but the selected one, arc-code-group every block
 * but the first, arc-sortable-list moves each item into its row's named slot.
 * On the client those are attribute changes on light DOM, made on upgrade;
 * lit-ssr renders a host's shadow root and has no way to change its children,
 * so the server paint showed every panel at once and the page shrank when
 * the script arrived. So each reader runs here first, against a stand-in of
 * the host built from its attributes, and any start tag of a direct child it
 * changed is rewritten in the source. The render then sees the page as the
 * client will leave it, and so does the reader again at render time.
 */
function writeBackLightDom(page) {
  const edits = [];
  for (const host of readerHosts(page)) {
    const snapshot = lit.lightDom.slottedNodes(
      page.slice(host.innerStart, host.innerEnd),
      lit.parseFragment,
    );
    let element;
    try {
      element = new host.Ctor();
      for (const { name, value } of host.attrs) {
        element.setAttribute(name, value);
        element.attributeChangedCallback?.(name, null, value);
      }
    } catch {
      continue;
    }
    runReaders(element, snapshot);
    for (const [from, to, text] of lit.lightDom.lightDomEdits(snapshot)) {
      edits.push([host.innerStart + from, host.innerStart + to, text]);
    }
  }
  edits.sort((a, b) => b[0] - a[0]);
  for (const [from, to, text] of edits) page = page.slice(0, from) + text + page.slice(to);
  return page;
}

/**
 * Every element in the page whose class declares slot readers, located by
 * parsing the page rather than by searching it: an attribute value can hold
 * markup (arc-copy-button's `value` carries HTML snippets, `<arc-button>`
 * and all), and a search found tags inside it. Offsets are into `page`.
 */
function readerHosts(page) {
  const registry = globalThis.customElements;
  const isDocument = /^\s*(<!doctype|<html)/i.test(page);
  const root = (isDocument ? lit.parse : lit.parseFragment)(page, { sourceCodeLocationInfo: true });
  const hosts = [];
  const walk = (node) => {
    for (const child of node.childNodes ?? []) {
      const Ctor = child.tagName?.includes('-') ? registry.get(child.tagName) : undefined;
      const loc = child.sourceCodeLocation;
      if (Ctor?.slotReaders && loc?.startTag) {
        hosts.push({
          Ctor,
          attrs: child.attrs,
          openEnd: loc.startTag.endOffset - 1,
          innerStart: loc.startTag.endOffset,
          innerEnd: loc.endTag ? loc.endTag.startOffset : loc.endOffset,
        });
      }
      walk(child);
    }
  };
  walk(root);
  return hosts;
}

/** Call each of a host's slot readers with its children, as slotchange would. */
function runReaders(element, snapshot) {
  // The children belong to this host: a reader that checks
  // `child.parentElement === this` has to see it.
  for (const nodes of snapshot.values()) {
    for (const node of nodes) {
      node.__arcParent = element;
      node.parentNode = element;
    }
  }
  // Readers commonly find a slot through their own shadow root
  // (`this.shadowRoot.querySelector('slot[name="nav"]')`), which the server
  // doesn't have. For the length of the calls it has one that answers slot
  // selectors from the page's children, and nothing else.
  const slots = new Map();
  const slotNamed = (name) => {
    if (!slots.has(name)) slots.set(name, lit.lightDom.serverSlot(name, snapshot.get(name) ?? []));
    return slots.get(name);
  };
  const querySlot = (selector) => {
    if (/^slot:not\(\[name\]\)$|^slot$/.test(selector)) return slotNamed('');
    const named = /^slot\[name=["']?([^"'\]]*)["']?\]$/.exec(selector);
    return named ? slotNamed(named[1]) : null;
  };
  const had = Object.getOwnPropertyDescriptor(element, 'shadowRoot');
  Object.defineProperty(element, 'shadowRoot', {
    configurable: true,
    value: {
      querySelector: querySlot,
      querySelectorAll: (selector) => [querySlot(selector)].filter(Boolean),
    },
  });
  try {
    for (const [name, reader] of Object.entries(element.constructor.slotReaders)) {
      try {
        const e = { target: slotNamed(name) };
        if (typeof reader === 'function') reader.call(element, e);
        else element[reader](e);
      } catch {
        // A reader that needs more of the DOM than the server models renders
        // as it did before this existed: empty, and filled on the client.
      }
    }
  } finally {
    if (had) Object.defineProperty(element, 'shadowRoot', had);
    else delete element.shadowRoot;
  }
}

/** lit-ssr's per-element hook, run after attributes and before willUpdate. */
function readServerSlots(element) {
  const id = element.getAttribute?.(SLOT_ATTR);
  const snapshot = id != null && SLOT_SNAPSHOTS.get(id);
  if (snapshot) runReaders(element, snapshot);
  return undefined;
}

/**
 * The `>` that closes the start tag opening at `start`, or -1.
 *
 * Not the first `>` after it: an attribute value can hold one. arc-copy-button
 * carries the code it copies in `value`, and a snippet of HTML there put the
 * slot mark in the middle of the attribute, which broke the page's markup and
 * every component after it on arcui.dev.
 */
function startTagEnd(page, start) {
  let quote = null;
  for (let i = start + 1; i < page.length; i++) {
    const c = page[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return i;
    }
  }
  return -1;
}

/**
 * Define the components a page uses that the barrel doesn't carry.
 *
 * ./register.js is the default barrel, which leaves out arc-code-block (its
 * highlighter is a heavy optional dependency), the domain groups and anything
 * experimental. Until 4.8.2 that meant the server never defined them, and an
 * undefined tag renders as nothing: every code block on arcui.dev and
 * getpulsar.dev reached readers, search engines and no-JS visitors as an empty
 * box, while the docs said every component server-renders. Each is loaded
 * through its own public entry, the same import a client makes for it, and
 * only when a page names it. A tag with no entry (a typo, or an element this
 * package doesn't ship) is left to render as it always did.
 */
async function defineUsed(source) {
  const registry = globalThis.customElements;
  const missing = new Set();
  for (const [, tag] of source.matchAll(ARC_TAG)) {
    if (!registry.get(tag)) missing.add(tag);
  }
  await Promise.all(
    [...missing].map((tag) =>
      import(/* @vite-ignore */ `@arclux/arc-ui/${tag.slice(4)}`).catch(() => {}),
    ),
  );
}

/**
 * Trim long repeated lists to their budget, marking what was dropped.
 *
 * Runs after the overlay pass, so anything already inside a closed overlay is
 * gone and does not spend budget. The host tag is read backwards from the
 * template, which lit-ssr emits immediately after its host's opening tag.
 */
function trimLists(page, budgets) {
  const tags = Object.keys(budgets);
  if (tags.length === 0) return { html: page, deferred: 0 };

  const roots = shadowRoots(page);
  const seen = new Map();
  const drop = [];
  for (const root of roots) {
    const before = page.slice(Math.max(0, root.start - 200), root.start);
    const tag = before.match(/<([a-z][a-z0-9-]*)[^<>]*>$/)?.[1];
    if (!tag || !(tag in budgets)) continue;
    const count = (seen.get(tag) ?? 0) + 1;
    seen.set(tag, count);
    if (count > budgets[tag]) drop.push(root);
  }
  if (drop.length === 0) return { html: page, deferred: 0 };

  let out = page;
  let marked = 0;
  // Back to front, so earlier offsets stay valid.
  for (let i = drop.length - 1; i >= 0; i--) {
    const { start, end } = drop[i];
    out = out.slice(0, start) + out.slice(end);
    if (out[start - 1] === '>') {
      out = `${out.slice(0, start - 1)} data-arc-defer${out.slice(start - 1)}`;
      marked++;
    }
  }
  return { html: out, deferred: marked };
}

/**
 * Hoist plain-text light DOM into the attribute a component reads it from.
 *
 * The light DOM stays in place: the attribute takes precedence on both
 * sides, and removing markup is a bigger intervention than adding to it. An
 * element that already carries the attribute is left alone: the author has
 * said what the content is. Light DOM containing markup is skipped rather
 * than flattened, since silently discarding elements would hide a mistake.
 */
function hoistTextContent(page) {
  for (const [tag, attr] of Object.entries(TEXT_CONTENT_PROPS)) {
    if (!page.includes(`<${tag}`)) continue;
    const spans = elementSpans(page, tag);
    const close = `</${tag}>`;
    // Back to front, so earlier offsets stay valid.
    for (let i = spans.length - 1; i >= 0; i--) {
      const [start, end] = spans[i];
      const openEnd = startTagEnd(page, start);
      if (openEnd === -1 || openEnd >= end) continue;
      if (new RegExp(`\\s${attr}\\s*=`).test(page.slice(start, openEnd + 1))) continue;
      const inner = page.slice(openEnd + 1, end - close.length);
      if (!inner.trim() || inner.includes('<')) continue;
      // The inner text is already entity-encoded HTML; an attribute decodes
      // entities the same way a text node does, so only the quote needs care.
      const value = inner.replace(/"/g, '&quot;');
      page = `${page.slice(0, openEnd)} ${attr}="${value}"${page.slice(openEnd)}`;
    }
  }
  return page;
}

/** Every top-level shadow root, in document order, with its byte span. */
function shadowRoots(page) {
  const roots = [];
  SHADOW_OPEN.lastIndex = 0;
  let match;
  while ((match = SHADOW_OPEN.exec(page)) !== null) {
    let depth = 1;
    let i = match.index + match[0].length;
    while (depth > 0) {
      const open = page.indexOf('<template', i);
      const close = page.indexOf('</template>', i);
      if (close === -1) break;
      if (open !== -1 && open < close) {
        depth++;
        i = open + 9;
      } else {
        depth--;
        i = close + 11;
      }
    }
    roots.push({ start: match.index, end: i });
    SHADOW_OPEN.lastIndex = i;
  }
  return roots;
}

/** Byte spans of every `<tag>…</tag>`, nesting-aware. */
function elementSpans(page, tag) {
  const spans = [];
  const open = new RegExp(`<${tag}(?=[\\s/>])`, 'g');
  const close = `</${tag}>`;
  let match;
  while ((match = open.exec(page)) !== null) {
    let depth = 1;
    let i = match.index + tag.length + 1;
    while (depth > 0) {
      const nextOpen = page.indexOf(`<${tag}`, i);
      const nextClose = page.indexOf(close, i);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        i = nextOpen + tag.length + 1;
      } else {
        depth--;
        i = nextClose + close.length;
      }
    }
    spans.push([match.index, i]);
    open.lastIndex = i;
  }
  return spans;
}

/**
 * Drop the shadow roots inside closed overlays, marking each overlay host.
 *
 * Only the hosts are marked, never the elements beneath them, and that
 * distinction is what matters. The FOUC guard's `opacity: 0` keeps an
 * element in layout, so marking descendants held 174 un-upgraded command items
 * in the page until JS collapsed them: LCP 784ms to 2540ms, three times worse
 * than rendering the lot. `[data-arc-closed]:not(:defined)` is `display: none`,
 * because closed means occupying nothing.
 */
function closeOverlays(page, hosts) {
  const hidden = hosts.flatMap((tag) => elementSpans(page, tag));
  if (hidden.length === 0) return { html: page, deferred: 0 };

  const roots = shadowRoots(page);
  const drop = roots.filter(({ start }) =>
    hidden.some(([from, to]) => start >= from && start < to),
  );
  if (drop.length === 0) return { html: page, deferred: 0 };

  // An overlay's own root is the first one at or after its opening tag.
  const ownRoots = new Set();
  for (const [from] of hidden) {
    const own = roots.find(({ start }) => start >= from);
    if (own) ownRoots.add(own.start);
  }

  let out = page;
  let marked = 0;
  // Back to front, so earlier offsets stay valid.
  for (let i = drop.length - 1; i >= 0; i--) {
    const { start, end } = drop[i];
    out = out.slice(0, start) + out.slice(end);
    if (!ownRoots.has(start)) continue;
    // lit-ssr emits the template immediately after its host's opening tag, so
    // the character before it closes that tag. Marking there avoids parsing an
    // attribute list that can legitimately contain '>'.
    if (out[start - 1] === '>') {
      out = `${out.slice(0, start - 1)} data-arc-closed${out.slice(start - 1)}`;
      marked++;
    }
  }
  return { html: out, deferred: marked };
}

/**
 * Replace each shadow root's inline `<style>` with a link to a shared file.
 *
 * One file per component type, so N instances cost one fetch and one parse.
 * Per type and not one bundle: `:host` resolves against whichever host the
 * sheet lands in, so arc-button's `:host([disabled])` would start matching
 * arc-card hosts.
 */
function liftStylesheets(page, sheets, used, prefix) {
  return page.replace(SHADOW_STYLE, (_match, open, css) => {
    let name = sheets.get(css);
    if (!name) {
      name = `s-${hash(css)}.css`;
      sheets.set(css, name);
    }
    used.add(name);
    return `${open}<link rel="stylesheet" href="${prefix}/${name}">`;
  });
}

/**
 * Preload the lifted stylesheets from the document head.
 *
 * Without this the lift trades one problem for another: the links sit inside
 * `<template>` elements, which the browser's preload scanner does not read, so
 * nothing would start fetching until the parser reached each shadow root.
 * `as="style"` rather than a stylesheet link; these must warm the cache, not
 * apply to the document.
 */
function preloadStylesheets(page, used, prefix) {
  if (used.size === 0 || !page.includes('</head>')) return page;
  const links = [...used]
    .sort()
    .map((name) => `<link rel="preload" as="style" href="${prefix}/${name}">`)
    .join('');
  return page.replace('</head>', `${links}</head>`);
}

/**
 * Flag the document for base.css's FOUC guard.
 *
 * That guard hides ARC elements until they upgrade, which is right for a page
 * whose elements are empty until JS runs and exactly wrong here: a
 * server-rendered element is un-upgraded but *finished*, so the guard would
 * hide the content this exists to produce.
 */
function markServerRendered(page) {
  if (/<html[^>]*\bdata-arc-ssr\b/.test(page)) return page;
  return page.replace(/<html\b/, '<html data-arc-ssr');
}

/**
 * Embed the icons this document renders.
 *
 * Without it a server-rendered icon hydrates wrong: the server resolves the
 * glyph and paints it, while the client's first render happens before any
 * dynamic import can finish and returns the empty-slot fallback instead, a
 * different tree from the one hydration is adopting.
 */
function embedIcons(page, iconRegistry) {
  const names = [...new Set([...page.matchAll(ICON_NAME)].map((m) => m[1]))];
  const icons = {};
  for (const name of names) {
    const svg = iconRegistry.getSync(name);
    if (svg) icons[name] = svg;
  }
  if (Object.keys(icons).length === 0) return page;

  // `<` is escaped so the payload cannot terminate its own script element.
  const json = JSON.stringify(icons).replace(/</g, '\\u003c');
  const tag = `<script type="application/json" id="${ICON_PAYLOAD_ID}">${json}</script>`;
  // A fragment has no </body>; the payload goes at its end. It was dropped,
  // which left every icon in a server-rendered fragment to mismatch on
  // hydration: the server drew the glyph, the client's first render had none.
  return page.includes('</body>') ? page.replace('</body>', `${tag}</body>`) : page + tag;
}

/**
 * The light-DOM styles of the components the page uses (`static
 * documentStyles`, see shared/document-styles.js), into <head>, or at the
 * start of a fragment. The client finds them there and doesn't add its own.
 */
function embedDocumentStyles(page) {
  const registry = globalThis.customElements;
  const tags = [...new Set([...page.matchAll(ARC_TAG)].map((m) => m[1]))].sort();
  const styles = tags
    .map((tag) => [tag, registry.get(tag)?.documentStyles])
    .filter(([, css]) => css)
    .map(([tag, css]) => `<style data-arc-document-styles="${tag}">${css}</style>`)
    .join('');
  if (!styles) return page;
  if (page.includes('</head>')) return page.replace('</head>', `${styles}</head>`);
  // A document with no <head>: at the top of <body>, never ahead of the
  // doctype, where it would put the page in quirks mode.
  const body = /<body\b[^>]*>/i.exec(page);
  if (body)
    return (
      page.slice(0, body.index + body[0].length) + styles + page.slice(body.index + body[0].length)
    );
  return styles + page;
}

/** Stable short name for a stylesheet, without pulling in node:crypto. */
function hash(text) {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca6b);
  }
  return ((h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)).padStart(13, '0');
}
