export declare const iconRegistry: {
    /** Select a built-in icon library: 'phosphor' (default) or 'lucide'. */
    use(library: any): void;
    /** Register additional custom icons (merged on top of the active library). */
    set(icons: any): void;
    /** Look up an icon by kebab-case name. Returns a Promise<string|null>. */
    get(name: any): Promise<any>;
    /** List all icon names in a library (defaults to active). Returns a Promise<string[]>. */
    list(library: any): Promise<string[]>;
};
