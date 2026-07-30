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
