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
 * 177 pages and 42,613 shadow roots on every build.
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
/**
 * Components closed until something opens them.
 *
 * The overlay-mixin set: everything rendered into the top layer and invisible
 * until asked for. Nothing inside one can appear in a first paint, so rendering
 * their contents spends bytes on markup no reader and no metric ever sees. On
 * arcui.dev that was 174 of a page's 427 roots — the whole ⌘K palette.
 */
export declare const CLOSED_OVERLAYS: string[];
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
 * @param {boolean} [options.inlineIcons=true] Embed the icons the page uses, so
 *   the client's first render matches the server's instead of falling back to
 *   an empty slot while a dynamic import resolves.
 * @returns {Promise<{html: string, stylesheets: Map<string, string>,
 *   roots: number, deferred: number}>}
 */
export declare function renderDeclarativeShadowDOM(source: string, options?: {
    lift?: boolean;
    stylesheetPath?: string;
    closedOverlays?: string[];
    inlineIcons?: boolean;
}): Promise<{
    html: string;
    stylesheets: Map<string, string>;
    roots: number;
    deferred: number;
}>;
