const _custom = {};
let _libraryName = 'phosphor';

export const iconRegistry = {
  /** Select a built-in icon library: 'phosphor' (default) or 'lucide'. */
  use(library) {
    if (library !== 'phosphor' && library !== 'lucide') {
      throw new Error(`Unknown icon library "${library}". Use "phosphor" or "lucide".`);
    }
    _libraryName = library;
  },

  /** Register additional custom icons (merged on top of the active library). */
  set(icons) {
    for (const [key, val] of Object.entries(icons)) {
      const kebab = key
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      _custom[kebab] = val;
    }
  },

  /** Look up an icon by kebab-case name. Returns a Promise<string|null>. */
  async get(name) {
    // 1. Check custom icons first (instant)
    if (_custom[name]) return _custom[name];
    // 2. Dynamic import of single icon file
    try {
      const mod = await import(`../icons/${_libraryName}/${name}.js`);
      return mod.default;
    } catch {
      return null;
    }
  },

  /** List all icon names in a library (defaults to active). Returns a Promise<string[]>. */
  async list(library) {
    const lib = library || _libraryName;
    const manifest = await import(`../icons/${lib}/_manifest.js`);
    return [...Object.keys(_custom), ...manifest.default];
  },
};
