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
 * ## Not done yet — why this is off by default
 *
 * The markup is right and every page renders, but Lit is **not adopting it**.
 * On a built page 425 of 426 elements end up holding the server's markers *and*
 * a second, client-rendered copy of the same template above them — so each has
 * two default slots, only the first is assigned, and the server's slotted
 * children go unassigned. axe sees the result as buttons and links with no
 * accessible name: 9 critical and 41 serious violations against a gate that is
 * otherwise at zero.
 *
 * Ruled out so far, each empirically:
 * - Not the stylesheet lift. `ARC_DSD_LIFT=0` fails identically.
 * - Not a missing hydration bundle. It was missing — `src/hydrate.js` was not
 *   in the package's `sideEffects`, so bundlers dropped the import — and fixing
 *   that changed nothing here.
 * - Not the documented import-order rule. Splitting hydrate into its own module
 *   script, which is the only ordering guarantee bundler chunking does not
 *   reorder, changed nothing either.
 * - Not two copies of lit. One `lit@3.3.2` in the tree, one lit-element chunk
 *   in the bundle.
 *
 * What the evidence says: `createRenderRoot` is demonstrably the patched
 * version, yet elements take the non-hydrating branch — which is only reachable
 * if `this.shadowRoot` was falsy when they first updated. Next step is a
 * genuine minimal reproduction: DSD plus hydrate plus one component, served
 * without Astro or a bundler. The first attempt at that did not resolve its
 * bare specifiers and so proved nothing.
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

/**
 * **Opt-in until hydration adoption is proven.** Run it with `ARC_DSD=1 pnpm
 * build`; a default build skips it entirely, which is how the before/after
 * numbers above were taken. The dev server never runs it either — this is an
 * `astro:build:done` hook — so dev renders everything client-side, as before.
 *
 * The reason for the gate is in the module comment under "Not done yet": the
 * markup this produces is correct, but Lit is not yet adopting it, and shipping
 * unadopted DSD is worse than shipping none.
 *
 * `ARC_DSD_LIFT=0` keeps the stylesheets inline, which is how the lift was
 * ruled out as the cause of that.
 */
export default function arcDsd({
  enabled = process.env.ARC_DSD === '1',
  lift = process.env.ARC_DSD_LIFT !== '0',
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
          `${rendered} pages, ${roots} shadow roots from ${registered} components`
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
