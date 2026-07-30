export declare const iconRegistry: {
    /** Select a built-in icon library: 'phosphor' (default) or 'lucide'. */
    use(library: any): void;
    /** Register additional custom icons (merged on top of the active library). */
    set(icons: any): void;
    /** Look up an icon by kebab-case name. Returns a Promise<string|null>. */
    get(name: any): Promise<any>;
    /**
     * Look up an icon without awaiting — the source string if it is already in
     * memory, otherwise null.
     *
     * `get()` is async because the icon sets are code-split one file per glyph,
     * and 1,500 icons have no business being in anyone's bundle. But rendering is
     * synchronous, and on the server there is no second chance: `updated()` never
     * runs there, so an icon that is not resolvable *during render* is an icon
     * that does not appear in the server's HTML at all.
     *
     * So this reads the cache that `get()` fills, plus anything registered
     * through `set()`. Server-side, warm it with `preload()` first. Client-side
     * it is a fast path — and, on a hydrated page whose icons were inlined at
     * build time, the thing that makes the client's first render match the
     * server's.
     */
    getSync(name: any): any;
    /**
     * Resolve icons into the synchronous cache, for rendering that cannot await.
     *
     * Names that do not exist are skipped rather than throwing: a page listing
     * the icons it uses should not fail to build over one typo.
     */
    preload(names: any): Promise<void>;
    /** List all icon names in a library (defaults to active). Returns a Promise<string[]>. */
    list(library: any): Promise<string[]>;
};
