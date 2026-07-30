const _custom = {};
let _libraryName = 'phosphor';

/**
 * Icons already resolved through `get()`, keyed by library and name so that
 * switching libraries cannot serve the wrong glyph. Read by `getSync()`, which
 * is what makes server-side rendering of a named icon possible at all.
 */
const _resolved = new Map();

/**
 * The id of a JSON payload a server-side build may inline into the page:
 * `{ "check": "<svg…>", … }` for exactly the icons that page renders.
 *
 * Without it, a server-rendered icon hydrates wrong. The server resolves the
 * glyph and paints it; the client's first render happens before any dynamic
 * import can finish, finds nothing in the cache, and returns the empty-slot
 * fallback instead — a different tree from the one hydration is adopting.
 * Reading a payload the page already carries makes the two identical, and
 * removes the icon round-trips from load as a side effect.
 *
 * Read lazily rather than at module load, so it does not matter whether the
 * payload tag comes before or after the bundle that registers the components.
 *
 * Keyed on the payload *element*, not on a read-once flag. Under a client-side
 * router the document is replaced without the module being re-evaluated, so a
 * flag would leave every page after the first reading the payload of the page
 * that happened to load first — and any icon only the new page uses resolves to
 * null. On a server-rendered page that is not a missing glyph but a hydration
 * mismatch: the server painted the SVG and the client renders the empty-slot
 * fallback into the DOM being adopted. Comparing node identity re-reads exactly
 * when the document brings a new payload, and costs one getElementById
 * otherwise.
 */
const ICON_PAYLOAD_ID = 'arc-icon-payload';
let _payloadNode = null;

function readInlinePayload() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(ICON_PAYLOAD_ID);
  if (!el || el === _payloadNode) return;
  _payloadNode = el;
  try {
    const icons = JSON.parse(el.textContent);
    // Anything registered by hand wins: a consumer overriding an icon should
    // not be undone by the build's snapshot of what the page happened to use.
    for (const [name, svg] of Object.entries(icons)) {
      if (!(name in _custom)) _custom[name] = svg;
    }
  } catch {
    // A malformed payload should cost the icons their fast path, nothing more.
  }
}

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
    readInlinePayload();
    // 1. Check custom icons first (instant)
    if (_custom[name]) return _custom[name];
    // 2. Load resolver, then dynamic-import the single icon file
    try {
      const resolver = await getResolver(_libraryName);
      const load = resolver?.[aliasFor(name)] ?? resolver?.[name];
      if (!load) return null;
      const mod = await load();
      _resolved.set(`${_libraryName}:${name}`, mod.default);
      return mod.default;
    } catch {
      return null;
    }
  },

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
  getSync(name) {
    if (!name) return null;
    readInlinePayload();
    if (_custom[name]) return _custom[name];
    return _resolved.get(`${_libraryName}:${name}`) ?? null;
  },

  /**
   * Resolve icons into the synchronous cache, for rendering that cannot await.
   *
   * Names that do not exist are skipped rather than throwing: a page listing
   * the icons it uses should not fail to build over one typo.
   */
  async preload(names) {
    await Promise.all([...new Set(names)].filter(Boolean).map((name) => this.get(name)));
  },

  /** List all icon names in a library (defaults to active). Returns a Promise<string[]>. */
  async list(library) {
    const lib = library || _libraryName;
    const names = await getManifest(lib);
    return [...Object.keys(_custom), ...names];
  },
};
