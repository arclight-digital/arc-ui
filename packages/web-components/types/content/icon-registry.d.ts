/**
 * The icon registry: what a name resolves to, and who decides.
 *
 * ── What changed in v4 (V4-PLAN 4.7) ──
 *
 * This module used to reach for `../icons/phosphor/_resolver.js` by relative
 * path, which is the line that kept 3,408 generated icon modules inside the core
 * package: 88% of its published files and 44% of its unpacked bytes, in every
 * install, whether or not a single icon was ever rendered. Worse than the
 * tarball, the resolver is 1,896 static `import()` specifiers — a bundler must
 * walk all of them and emit a chunk each, so the cost landed in every consumer's
 * build graph by default.
 *
 * So the relative paths are gone and nothing here knows an icon library exists.
 * A library registers itself:
 *
 *     import '@arclux/arc-ui-icons/phosphor';
 *
 * and that is the whole contract. It is also what makes a *custom* library a
 * first-class citizen rather than a special case — Phosphor and Lucide now
 * arrive through exactly the door a consumer's own set would.
 *
 * ── There is no default library any more ──
 *
 * `_libraryName` starts null rather than `'phosphor'`, because after the split
 * that string would have been a promise this package cannot keep: core ships no
 * icons, so naming a default would only mean every named icon resolving to null
 * with nothing to say about why. Registration selects when nothing is selected,
 * so one import still needs no `use()` call.
 *
 * The failure this replaces is the one arc-transfer-list shipped — a blank box
 * and silence. `get()` warns once per unresolvable library, with the two lines
 * that fix it, so "I upgraded and my icons vanished" is a console message rather
 * than a bug report.
 */
export declare const iconRegistry: {
    /**
     * Register an icon library under a name.
     *
     * @param {string} name - What `use()` and `<arc-icon-library>` will call it.
     * @param {object} library
     * @param {Record<string, string | (() => Promise<{default: string}>)>} library.icons -
     *   Name → SVG source, or a thunk that imports it. A thunk is what the built-in
     *   packs pass, one per glyph, so a bundler can split them; a plain string is
     *   the easy shape for a small hand-rolled set.
     * @param {Record<string, string>} [library.aliases] - ARC UI's canonical icon
     *   name → this library's spelling. Built-in components ask for Lucide names;
     *   supply this and they resolve against a library that calls them something
     *   else. See @arclux/arc-ui-icons/aliases.
     *
     * Selects this library if nothing is selected yet, so a single
     * `import '@arclux/arc-ui-icons/phosphor'` is a complete setup.
     * Registering a second pack never takes the choice back from a page that has
     * already made one — which does mean that importing both packs and calling
     * neither `use()` nor `<arc-icon-library>` leaves the first-imported one
     * active. Say which you want.
     */
    register(name: string, library: {
        icons: Record<string, string | (() => Promise<{
            default: string;
        }>)>;
        aliases?: Record<string, string>;
    }): void;
    /** Names of every registered library, in registration order. */
    libraries(): any[];
    /**
     * Whether the active library is registered — the question arc-icon asks
     * before blaming a missing glyph on its name. False also means `get()` has
     * already said the useful thing about it.
     */
    hasLibrary(): boolean;
    /**
     * Select which registered library names resolve against.
     *
     * Takes any name, including one whose pack has not been imported yet — see
     * `_libraryName` above for why this no longer throws.
     */
    use(library: any): void;
    /** Register additional custom icons (merged on top of the active library). */
    set(icons: any): void;
    /** Look up an icon by kebab-case name. Returns a Promise<string|null>. */
    get(name: any): Promise<any>;
    /**
     * Look up an icon without awaiting — the source string if it is already in
     * memory, otherwise null.
     *
     * `get()` is async because the icon packs are code-split one file per glyph,
     * and 1,900 icons have no business being in anyone's bundle. But rendering is
     * synchronous, and on the server there is no second chance: `updated()` never
     * runs there, so an icon that is not resolvable *during render* is an icon
     * that does not appear in the server's HTML at all.
     *
     * So this reads the cache that `get()` fills, plus anything registered
     * through `set()`. Server-side, warm it with `preload()` first. Client-side
     * it is a fast path — and, on a hydrated page whose icons were inlined at
     * build time, the thing that makes the client's first render match the
     * server's.
     *
     * Never warns: a miss here is the ordinary "not loaded yet" case, which
     * happens once per icon on every page that works correctly.
     */
    getSync(name: any): any;
    /**
     * Resolve icons into the synchronous cache, for rendering that cannot await.
     *
     * Names that do not exist are skipped rather than throwing: a page listing
     * the icons it uses should not fail to build over one typo.
     */
    preload(names: any): Promise<void>;
    /**
     * List all icon names in a library (defaults to active). Returns a
     * Promise<string[]>.
     *
     * Async for compatibility rather than necessity — it used to import a
     * generated manifest, and now reads keys off a registration that is already in
     * memory. Callers all `await` it and would keep working if it were made
     * synchronous, but nothing is gained by making them change.
     */
    list(library: any): Promise<string[]>;
};
