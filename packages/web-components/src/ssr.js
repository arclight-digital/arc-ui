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
 * So this is HTML in, HTML out, and it does not care what produced the input —
 * Nuxt, SvelteKit, Angular Universal, Next, Astro, or a string you assembled by
 * hand. It is the same code that server-renders arcui.dev, where it runs over
 * 177 pages and 43,620 shadow roots on every build.
 *
 * ## What it does
 *
 * 1. Defines every component in this process, once.
 * 2. Resolves the icons the markup names — arc-icon can only render a glyph
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
 * `stylesheetPath` they were linked with — the shadow roots reference them by
 * URL. And import `@arclux/arc-ui/hydrate` on the client *before any component
 * is defined*, or Lit renders over this markup instead of adopting it. On a
 * bundler that usually means forcing hydration support into its own chunk;
 * `docs/astro.config.mjs` in this repo shows why an import statement alone is
 * not enough.
 */
import { CLIENT_ONLY } from './ssr-client-only.js';

/**
 * Components closed until something opens them.
 *
 * The OverlayController set: everything rendered into the top layer and invisible
 * until asked for. Nothing inside one can appear in a first paint, so rendering
 * their contents spends bytes on markup no reader and no metric ever sees. On
 * arcui.dev that was 174 of a page's 427 roots — the whole ⌘K palette.
 */
export const CLOSED_OVERLAYS = ['arc-command-palette', 'arc-dialog', 'arc-modal', 'arc-sheet', 'arc-drawer'];

/**
 * Long repeated lists, and how many of each to render.
 *
 * A navigation sidebar listing every page is real, visible content — unlike a
 * closed overlay — but only the first screenful of it can be in a first paint,
 * and the rest scrolls inside its own container. On arcui.dev the sidebar is
 * 175 `arc-sidebar-link` roots and 30K of the 99K of shadow markup a component
 * page carries; the twenty-odd that are actually visible carry the paint.
 *
 * The remainder are marked `data-arc-defer`, which keeps the FOUC guard's
 * `opacity: 0` — layout is held, so nothing shifts when they upgrade; they fade
 * in. That is the opposite treatment from a closed overlay, which must occupy
 * nothing, and getting the two confused is measurable: marking deferred
 * elements `display: none` would collapse a sidebar mid-paint.
 */
export const LIST_BUDGETS = {
  'arc-sidebar-link': 25,
};

/** Opening tag of a shadow root, used to find each root's byte span. */
const SHADOW_OPEN = /<template shadowroot(?:mode)?="[^"]*"[^>]*>/g;

/** A shadow root that opens with its stylesheet, which is all of them. */
const SHADOW_STYLE = /(<template shadowroot(?:mode)?="[^"]*"[^>]*>)<style>([\s\S]*?)<\/style>/g;

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
    const { html, unsafeStatic } = await import('lit/static-html.js');
    lit = { render: ssr.render, collectResult, html, unsafeStatic };
  }
  if (!registered) {
    // The barrel is all-or-nothing, so a client-only component would be defined
    // here and then throw on the first page that contains it — while check-ssr,
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
    // before any component class is defined — which the order here guarantees.
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
  if (!source.includes('<arc-')) {
    return { html: source, stylesheets, roots: 0, deferred: 0 };
  }

  // Resolves against whatever the rendering process has registered, and since
  // 4.7 that is nobody by default — core ships no icon packs. A server build
  // that wants glyphs in its HTML imports one first:
  //
  //     import '@arclux/arc-ui-icons/phosphor';
  //
  // Without it every name misses, the registry says so once, and each icon
  // renders its empty-slot fallback. That fallback is the *same* tree the
  // client produces under the same conditions, so the page still hydrates
  // cleanly — it is a page with no icons, not a broken one.
  await iconRegistry.preload([...source.matchAll(ICON_NAME)].map((m) => m[1]));

  let out = await lit.collectResult(lit.render(lit.html`${lit.unsafeStatic(source)}`));

  // lit wraps its output in a part marker, and the opening one lands *before*
  // the doctype — enough to put the document in quirks mode.
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
  if (inlineIcons) out = embedIcons(out, iconRegistry);

  return {
    html: out,
    stylesheets,
    roots: (out.match(/shadowrootmode/g) || []).length,
    deferred: capped.deferred + trimmed.deferred,
  };
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
 * distinction is the whole point. The FOUC guard's `opacity: 0` keeps an
 * element in layout, so marking descendants held 174 un-upgraded command items
 * in the page until JS collapsed them — LCP 784ms to 2540ms, three times worse
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
 * `as="style"` rather than a stylesheet link — these must warm the cache, not
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
 * dynamic import can finish and returns the empty-slot fallback instead — a
 * different tree from the one hydration is adopting.
 */
function embedIcons(page, iconRegistry) {
  const names = [...new Set([...page.matchAll(ICON_NAME)].map((m) => m[1]))];
  const icons = {};
  for (const name of names) {
    const svg = iconRegistry.getSync(name);
    if (svg) icons[name] = svg;
  }
  if (Object.keys(icons).length === 0 || !page.includes('</body>')) return page;

  // `<` is escaped so the payload cannot terminate its own script element.
  const json = JSON.stringify(icons).replace(/</g, '\\u003c');
  const tag = `<script type="application/json" id="${ICON_PAYLOAD_ID}">${json}</script>`;
  return page.replace('</body>', `${tag}</body>`);
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
