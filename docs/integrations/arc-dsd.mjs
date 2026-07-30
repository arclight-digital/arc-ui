/**
 * Server-renders every ARC component in the built HTML, as declarative shadow DOM.
 *
 * ## Why this is a build pass and not @astrojs/lit
 *
 * Astro only routes *imported components* through a renderer. Raw `<arc-button>`
 * in a template is passed through as unknown HTML, and this site emits the large
 * majority of its component markup as HTML strings from `src/data/**` — which no
 * Astro renderer can ever see. Making @astrojs/lit cover the site would mean
 * rewriting every usage as an imported component, and would still leave the
 * data-driven examples out.
 *
 * (@astrojs/lit is also broken against its own dependency range at the time of
 * writing: its `render()` hand-builds a RenderInfo with four fields, and the
 * @lit-labs/ssr its `^3.2.2` resolves to also reads `eventTargetStack` and
 * `slotStack`. That is fixable; the coverage ceiling above is not.)
 *
 * Rendering the emitted HTML instead reaches every usage equally and needs no
 * source changes at all.
 *
 * ## What it does to a page
 *
 * 1. Resolves the icons the page names, since arc-icon can only render a glyph
 *    that is already in memory (see iconRegistry.getSync).
 * 2. Renders the whole document through @lit-labs/ssr, which gives every ARC
 *    element a `<template shadowrootmode>` containing its rendered shadow tree.
 * 3. Lifts each shadow root's stylesheet into a shared file and links it.
 * 4. Marks the page as server-rendered and inlines the icon payload.
 *
 * ## The stylesheet lift
 *
 * In a browser, every instance of a component shares one constructable
 * stylesheet — one object, parsed once. Declarative shadow DOM has no way to say
 * that, so lit-ssr serializes the entire sheet into every instance. Measured on
 * this site before the lift: 226 style blocks per page, **30 distinct**, and 89%
 * of all output bytes. The homepage went from 47K to 1002K.
 *
 * Linking one file per component type restores exactly the sharing the browser
 * already had. Per *type* and not one bundle: `:host` selectors resolve against
 * whichever host the sheet lands in, so arc-button's `:host([disabled])` rules
 * would start matching arc-card hosts.
 *
 * Measured over the whole site with the lift in place: raw 18.4M -> 37.1M
 * (2.0x), brotli 1.8M -> 2.7M (1.5x), median page 10K -> 15K brotli, plus 281K
 * of stylesheets shared across every page. The remaining growth is the rendered
 * shadow content itself, which is the thing being bought.
 *
 * ## Hydration depends on a chunking rule, not on import order
 *
 * Getting Lit to *adopt* this markup rather than render over it took three
 * fixes, and the load-bearing one is in `docs/astro.config.mjs`: hydration
 * support is forced into a chunk of its own via `manualChunks`. Without that
 * the module is small enough for Rollup to inline it into the entry chunk,
 * while the components stay separate chunks — and a chunk's cross-chunk imports
 * are hoisted above its own inlined code, so the hook landed after all 185
 * components had been defined. As its own chunk it is a cross-chunk import too,
 * and those keep their relative source order.
 *
 * Two things that look like fixes and are not: putting the import first inside
 * the script (Rollup hoists past it, 0 of 185 patched), and splitting it into a
 * second `<script>` (Astro does not preserve the source order of sibling script
 * blocks — it emitted the component block first).
 *
 * The symptom, worth recognising: elements end up holding the server's markers
 * *and* a second client-rendered copy above them, so each has two default slots
 * of which only the first is assigned, and axe reports buttons and links with
 * no accessible name. `<!--lit-part-->` comments surviving in a shadow root is
 * hydration working, not failing — hydration preserves them.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CLIENT_ONLY } from '../../scripts/ssr-client-only.js';

/** Where the lifted stylesheets are written, relative to the site root. */
const SHEET_DIR = '_arc';

/** Matches a shadow root that opens with its stylesheet, which is all of them. */
const SHADOW_STYLE = /(<template shadowroot(?:mode)?="[^"]*"[^>]*>)<style>([\s\S]*?)<\/style>/g;

/** `<arc-icon name="…">`, the only attribute that needs resolving before render. */
const ICON_NAME = /<arc-icon\b[^>]*\bname=["']([^"']+)["']/g;

/** Opening tag of a shadow root, used to find each root's byte span. */
const SHADOW_OPEN = /<template shadowroot(?:mode)?="[^"]*"[^>]*>/g;

/**
 * Components that are closed until something opens them.
 *
 * These are the overlay-mixin set — everything that renders into the top layer
 * and is invisible until a user asks for it. Nothing inside one can appear in a
 * first paint, so server-rendering their contents is bytes spent on markup no
 * measurement and no reader ever sees.
 *
 * On this site that is not a rounding error. A component page carries 427
 * shadow roots and 174 of them are `arc-command-item` inside the ⌘K palette —
 * 30K of the 99K of shadow markup, for a panel that is display:none until a
 * keystroke that cannot happen before the JS has loaded anyway.
 */
const DEFERRED_HOSTS = ['arc-command-palette', 'arc-modal', 'arc-sheet', 'arc-drawer'];

/**
 * `ARC_DSD=0 pnpm build` skips the pass, which is how the before/after numbers
 * above were taken; `ARC_DSD_LIFT=0` keeps the stylesheets inline, which is how
 * the lift was ruled out while diagnosing hydration. The dev server never runs
 * it either — this is an `astro:build:done` hook — so dev renders everything
 * client-side, as before.
 */
export default function arcDsd({
  enabled = process.env.ARC_DSD !== '0',
  lift = process.env.ARC_DSD_LIFT !== '0',
  deferredHosts = DEFERRED_HOSTS,
} = {}) {
  return {
    name: 'arc-dsd',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (!enabled) return logger.info('skipped (disabled)');

        const distDir = fileURLToPath(dir);
        // Resolve lit and the components from the web-components package, which
        // is where they are installed — not from the docs package.
        // `./package.json` is not in the package's exports map, so locate the
        // root from the main entry instead of asking for the manifest.
        const wcEntry = createRequire(import.meta.url).resolve('@arclux/arc-ui');
        const wcRoot = packageRootOf(wcEntry);
        const requireFromWc = createRequire(pathToFileURL(path.join(wcRoot, 'package.json')));
        const importFromWc = (spec) =>
          import(pathToFileURL(requireFromWc.resolve(spec)).href);

        // @lit-labs/ssr installs the DOM shim on import, so it has to come
        // before any component class is defined.
        const { render } = await importFromWc('@lit-labs/ssr');
        const { collectResult } = await importFromWc('@lit-labs/ssr/lib/render-result.js');
        const { html, unsafeStatic } = await importFromWc('lit/static-html.js');

        // Client-only components are deliberately left undefined: an unknown
        // element renders as a plain tag with its children intact, which is
        // exactly the pass-through we want, and the client upgrades it as
        // before. Registering one would instead crash the page it appears on.
        const registered = await registerComponents(wcRoot, new Set(Object.keys(CLIENT_ONLY)));
        const { iconRegistry } = await import(
          pathToFileURL(path.join(wcRoot, 'src/content/icon-registry.js')).href
        );

        const sheets = new Map(); // css -> filename
        const pages = htmlFiles(distDir);
        const failures = [];
        let rendered = 0;
        let roots = 0;
        let keptRoots = 0;
        let deferred = 0;
        let before = 0;
        let after = 0;

        for (const file of pages) {
          const source = fs.readFileSync(file, 'utf-8');
          if (!source.includes('<arc-')) continue;

          await iconRegistry.preload(
            [...source.matchAll(ICON_NAME)].map((m) => m[1])
          );

          let out;
          try {
            out = await collectResult(render(html`${unsafeStatic(source)}`));
          } catch (err) {
            failures.push({ file: path.relative(distDir, file), error: err });
            continue;
          }

          // lit wraps its output in a part marker. The opening one lands
          // *before* the doctype, which is enough to put the page in quirks
          // mode — the resulting layout differences are subtle and horrible.
          out = out
            .replace(/^\s*<!--lit-part [^>]*-->/, '')
            .replace(/<!--\/lit-part-->\s*$/, '');

          const capped = capShadowRoots(out, deferredHosts);
          out = capped.page;
          keptRoots += capped.kept;
          deferred += capped.dropped;

          if (lift) {
            const used = new Set();
            out = liftStylesheets(out, sheets, used);
            out = preloadStylesheets(out, used);
          }
          out = markServerRendered(out);
          out = inlineIcons(out, iconRegistry);

          roots += (out.match(/shadowrootmode/g) || []).length;
          before += source.length;
          after += out.length;
          rendered++;
          fs.writeFileSync(file, out);
        }

        const sheetDir = path.join(distDir, SHEET_DIR);
        fs.mkdirSync(sheetDir, { recursive: true });
        let sheetBytes = 0;
        for (const [css, name] of sheets) {
          fs.writeFileSync(path.join(sheetDir, name), css);
          sheetBytes += css.length;
        }

        const kb = (n) => `${(n / 1024).toFixed(0)}K`;
        logger.info(
          `${rendered} pages, ${keptRoots} shadow roots kept from ${registered} components; ` +
          `${deferred} deferred inside closed overlays`
        );
        logger.info(
          `html ${kb(before)} -> ${kb(after)}; ` +
          `${sheets.size} shared stylesheets, ${kb(sheetBytes)} total`
        );

        if (failures.length > 0) {
          for (const { file, error } of failures) {
            logger.error(`${file}: ${error?.message ?? error}`);
          }
          throw new Error(
            `arc-dsd: ${failures.length} page(s) failed to server-render. ` +
            'A component that throws here would have shipped as an empty tag.'
          );
        }
      },
    },
  };
}

/**
 * Every top-level shadow root in the page, in document order, with its span.
 *
 * Top-level because a root's content can hold further roots, and those belong
 * to it — dropping the outer one takes them with it.
 */
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
      if (open !== -1 && open < close) { depth++; i = open + 9; }
      else { depth--; i = close + 11; }
    }
    roots.push({ start: match.index, end: i });
    SHADOW_OPEN.lastIndex = i;
  }
  return roots;
}

/** Byte spans of every `<tag>…</tag>` in the page, nesting-aware. */
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
      if (nextOpen !== -1 && nextOpen < nextClose) { depth++; i = nextOpen + tag.length + 1; }
      else { depth--; i = nextClose + close.length; }
    }
    spans.push([match.index, i]);
    open.lastIndex = i;
  }
  return spans;
}

/**
 * Drop the shadow roots that cannot contribute to a first paint, marking the
 * elements that lost one so the FOUC guard still covers them.
 *
 * The rule is what is *visible*, not where it sits in the document. An earlier
 * attempt cut by position — shell plus the first N examples — and the numbers
 * said it was aimed at the wrong thing: 393 of a component page's 427 roots are
 * already before its first section heading, so a positional cut recovered 22K
 * of 104K. The weight is not a below-the-fold tail. It is two dense lists, and
 * one of them is inside a closed overlay.
 *
 * Deferring what is closed is free in a way a positional cut is not: nothing
 * about the first screen changes, because none of it was on the first screen.
 */
function capShadowRoots(page, deferredHosts) {
  const hidden = deferredHosts.flatMap((tag) => elementSpans(page, tag));
  if (hidden.length === 0) return { page, kept: shadowRoots(page).length, dropped: 0 };

  const roots = shadowRoots(page);
  const drop = roots.filter(({ start }) =>
    hidden.some(([from, to]) => start >= from && start < to)
  );
  if (drop.length === 0) return { page, kept: roots.length, dropped: 0 };

  // Only the overlay hosts get marked, not everything beneath them: a closed
  // overlay is display:none, so one mark hides its whole subtree. Marking the
  // descendants instead was measurably wrong — the FOUC guard's `opacity: 0`
  // keeps an element in layout, so 174 un-upgraded command items still occupied
  // the page until JS collapsed them, and LCP went from 784ms to 2540ms.
  //
  // An overlay's own root is the first one at or after its opening tag.
  const ownRoots = new Set();
  for (const [from] of hidden) {
    const own = roots.find(({ start }) => start >= from);
    if (own) ownRoots.add(own.start);
  }

  // Back to front, so earlier offsets stay valid.
  let out = page;
  let marked = 0;
  for (let i = drop.length - 1; i >= 0; i--) {
    const { start, end } = drop[i];
    out = out.slice(0, start) + out.slice(end);
    if (!ownRoots.has(start)) continue;
    // lit-ssr emits the template immediately after its host's opening tag, so
    // the character before it closes that tag. Marking there avoids parsing an
    // attribute list that legitimately contains '>' (the examples carry setup
    // scripts full of arrow functions).
    if (out[start - 1] === '>') {
      out = `${out.slice(0, start - 1)} data-arc-closed${out.slice(start - 1)}`;
      marked++;
    }
  }
  return { page: out, kept: roots.length - drop.length, dropped: marked };
}

/** Walk up from a resolved file to the directory holding its package.json. */
function packageRootOf(entry) {
  let dir = path.dirname(entry);
  while (!fs.existsSync(path.join(dir, 'package.json'))) {
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error(`No package.json above ${entry}`);
    dir = parent;
  }
  return dir;
}

/** Define every ARC component in this Node process, except `skip`. Returns how many. */
async function registerComponents(wcRoot, skip) {
  const src = path.join(wcRoot, 'src');
  let count = 0;
  for (const tier of fs.readdirSync(src, { withFileTypes: true })) {
    if (!tier.isDirectory() || tier.name === 'icons' || tier.name === 'generated') continue;
    for (const file of fs.readdirSync(path.join(src, tier.name))) {
      if (!file.endsWith('.register.js')) continue;
      const full = path.join(src, tier.name, file);
      const tag = fs.readFileSync(full, 'utf-8')
        .match(/customElements\.define\(\s*['"]([a-z0-9-]+)['"]/)?.[1];
      if (tag && skip.has(tag)) continue;
      await import(pathToFileURL(full).href);
      count++;
    }
  }
  return count;
}

function htmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * Replace each shadow root's inline `<style>` with a link to a shared file.
 *
 * Identical CSS gets one file, so N instances of a component cost one fetch and
 * one parse for the whole site rather than one copy per instance.
 */
function liftStylesheets(page, sheets, used) {
  return page.replace(SHADOW_STYLE, (_match, open, css) => {
    let name = sheets.get(css);
    if (!name) {
      name = `s-${crypto.createHash('sha256').update(css).digest('hex').slice(0, 16)}.css`;
      sheets.set(css, name);
    }
    used.add(name);
    return `${open}<link rel="stylesheet" href="/${SHEET_DIR}/${name}">`;
  });
}

/**
 * Preload the lifted stylesheets from the document head.
 *
 * Without this the lift trades one problem for another. The links live inside
 * `<template>` elements, and the browser's preload scanner does not look inside
 * a template — so nothing would start fetching until the parser reached each
 * shadow root, leaving components briefly unstyled. That flash is the thing
 * server rendering is supposed to remove.
 *
 * `as="style"` rather than a stylesheet link: these must not apply to the
 * document, only warm the cache for the in-shadow links that do.
 */
function preloadStylesheets(page, used) {
  if (used.size === 0) return page;
  const links = [...used]
    .sort()
    .map((name) => `<link rel="preload" as="style" href="/${SHEET_DIR}/${name}">`)
    .join('');
  return page.replace('</head>', `${links}</head>`);
}

/**
 * Flag the page for base.css's FOUC guard.
 *
 * That guard hides ARC elements until they upgrade, which is right for a page
 * whose elements are empty until JS runs and exactly wrong here: a
 * server-rendered element is un-upgraded but finished, so the guard would hide
 * the content this pass exists to produce.
 */
function markServerRendered(page) {
  if (/<html[^>]*\bdata-arc-ssr\b/.test(page)) return page;
  return page.replace(/<html\b/, '<html data-arc-ssr');
}

/**
 * Inline the icons this page renders, so the client's first render matches the
 * server's instead of falling back to an empty slot while a dynamic import
 * resolves. Read by iconRegistry on first lookup.
 */
function inlineIcons(page, iconRegistry) {
  const names = [...new Set([...page.matchAll(ICON_NAME)].map((m) => m[1]))];
  const icons = {};
  for (const name of names) {
    const svg = iconRegistry.getSync(name);
    if (svg) icons[name] = svg;
  }
  if (Object.keys(icons).length === 0) return page;

  // `<` is escaped so the payload cannot terminate its own script element.
  const json = JSON.stringify(icons).replace(/</g, '\\u003c');
  const tag = `<script type="application/json" id="arc-icon-payload">${json}</script>`;
  return page.replace('</body>', `${tag}</body>`);
}
