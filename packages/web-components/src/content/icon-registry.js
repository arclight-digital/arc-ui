const _custom = {};
let _libraryName = 'phosphor';

/**
 * Cross-library icon aliases.
 *
 * Phosphor and Lucide disagree about what common glyphs are called, and no
 * single spelling exists in both: Phosphor has `caret-right` and no
 * `chevron-right`; Lucide has `chevron-right` and no `caret-right`. A component
 * that hard-codes either name therefore renders *nothing* under the other
 * library — `get()` returns null and arc-icon draws an empty box, with no error.
 * arc-transfer-list shipped exactly that: four Lucide names under the Phosphor
 * default, so its move buttons were blank.
 *
 * ARC UI's own components use the Lucide spelling as the canonical name and
 * this maps it to whatever the active library calls it. Consumer names are
 * unaffected: an unaliased name still resolves directly, so `iconRegistry.use()`
 * never changes what a name means for anyone else.
 *
 * Covered by scripts/check-icon-names.js, which fails the build if a component
 * asks for a name that is missing from either library after aliasing.
 */
const ALIASES = {
  phosphor: {
    'chevron-left': 'caret-left',
    'chevron-right': 'caret-right',
    'chevron-up': 'caret-up',
    'chevron-down': 'caret-down',
    'chevrons-left': 'caret-double-left',
    'chevrons-right': 'caret-double-right',
  },
  lucide: {
    'dots-three': 'ellipsis',
  },
};

function aliasFor(name) {
  return ALIASES[_libraryName]?.[name] ?? name;
}

// Lazy-loaded resolvers — each is a map of { name: () => import('./name.js') }
// Using static import paths so Vite/Rollup can analyze and chunk them.
let _phosphorResolver;
let _lucideResolver;

async function getResolver(lib) {
  if (lib === 'phosphor') {
    if (!_phosphorResolver) {
      const mod = await import('../icons/phosphor/_resolver.js');
      _phosphorResolver = mod.default;
    }
    return _phosphorResolver;
  }
  if (lib === 'lucide') {
    if (!_lucideResolver) {
      const mod = await import('../icons/lucide/_resolver.js');
      _lucideResolver = mod.default;
    }
    return _lucideResolver;
  }
  return null;
}

async function getManifest(lib) {
  if (lib === 'phosphor') {
    const mod = await import('../icons/phosphor/_manifest.js');
    return mod.default;
  }
  if (lib === 'lucide') {
    const mod = await import('../icons/lucide/_manifest.js');
    return mod.default;
  }
  return [];
}

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
    // 2. Load resolver, then dynamic-import the single icon file
    try {
      const resolver = await getResolver(_libraryName);
      const load = resolver?.[aliasFor(name)] ?? resolver?.[name];
      if (!load) return null;
      const mod = await load();
      return mod.default;
    } catch {
      return null;
    }
  },

  /** List all icon names in a library (defaults to active). Returns a Promise<string[]>. */
  async list(library) {
    const lib = library || _libraryName;
    const names = await getManifest(lib);
    return [...Object.keys(_custom), ...names];
  },
};
