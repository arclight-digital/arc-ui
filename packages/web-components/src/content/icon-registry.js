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

const _custom = {};

/**
 * The active library, or null when nothing has been selected yet.
 *
 * `use()` records the name whether or not that library is registered, rather
 * than throwing on an unknown one as it did before v4. Registration is a module
 * side effect and selection is often a DOM attribute, so the two can arrive in
 * either order — and under a lazily-imported pack, `<arc-icon-library
 * name="lucide">` connects first as a matter of course. Throwing there was
 * finding #79: the call sits in `connectedCallback`, where a custom-element
 * reaction's exception is reported globally rather than propagated, so nothing
 * at the call site could catch it and the element's connect was abandoned
 * partway through.
 *
 * A typo is still loud, just one step later and from the place that can describe
 * it: `get('star')` under `use('lucid')` warns that "lucid" is not registered
 * and lists what is.
 */
let _libraryName = null;

/** Registered libraries: name → { icons, aliases }. See `register()`. */
const _libraries = new Map();

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
 *
 * A payload also stands in for a library entirely: a page whose icons are all
 * inlined resolves every one of them through `_custom` and needs no pack
 * installed, which is why `hasLibrary()` below is asked about the *library* and
 * `get()` checks `_custom` before it complains about one.
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
 * One line per unresolvable library, not one per icon.
 *
 * A page that upgrades to v4 without installing the icons package renders every
 * glyph as an empty slot, and arc-icon's per-name warning would say the wrong
 * thing about it fifty times over — "check the spelling" is bad advice when the
 * spelling was never the problem. This fires once and carries the fix, and
 * arc-icon defers to it (see `hasLibrary`).
 */
const _warnedLibraries = new Set();
function warnNoLibrary(name) {
  const key = name ?? '';
  if (_warnedLibraries.has(key)) return;
  _warnedLibraries.add(key);
  const registered = [..._libraries.keys()];
  console.warn(
    (name
      ? `[arc-ui] Icon library "${name}" is not registered, so every named icon renders as an empty slot.`
      : '[arc-ui] No icon library is selected, so every named icon renders as an empty slot.') +
      (registered.length
        ? ` Registered: ${registered.join(', ')}. Select one with iconRegistry.use("${registered[0]}").`
        : ' Icon packs moved out of @arclux/arc-ui in v4:\n' +
          '    npm i @arclux/arc-ui-icons\n' +
          "    import '@arclux/arc-ui-icons/phosphor';\n" +
          '  See MIGRATION.md — "Icons moved to @arclux/arc-ui-icons".'),
  );
}

/** The active library's entry, or null — warning once if it cannot be had. */
function activeLibrary() {
  const entry = _libraryName === null ? null : (_libraries.get(_libraryName) ?? null);
  if (!entry) warnNoLibrary(_libraryName);
  return entry;
}

export const iconRegistry = {
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
  register(name, library) {
    if (typeof name !== 'string' || !name) {
      throw new Error('iconRegistry.register: a library needs a name.');
    }
    if (!library?.icons || typeof library.icons !== 'object') {
      throw new Error(
        `iconRegistry.register("${name}"): expected { icons } mapping icon names to SVG ` +
          'sources or to functions that import them.',
      );
    }
    _libraries.set(name, { icons: library.icons, aliases: library.aliases ?? {} });
    if (_libraryName === null) _libraryName = name;
  },

  /** Names of every registered library, in registration order. */
  libraries() {
    return [..._libraries.keys()];
  },

  /**
   * Whether the active library is registered — the question arc-icon asks
   * before blaming a missing glyph on its name. False also means `get()` has
   * already said the useful thing about it.
   */
  hasLibrary() {
    return _libraryName !== null && _libraries.has(_libraryName);
  },

  /**
   * Select which registered library names resolve against.
   *
   * Takes any name, including one whose pack has not been imported yet — see
   * `_libraryName` above for why this no longer throws.
   */
  use(library) {
    if (typeof library !== 'string' || !library) {
      throw new Error('iconRegistry.use: expected a library name.');
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
    // 1. Custom icons first, and before any complaint about a library: a page
    //    whose icons are all registered by hand, or inlined by a server build,
    //    is a working page with no library at all.
    if (_custom[name]) return _custom[name];
    // 2. Otherwise the active library's entry for the name, aliased.
    const library = activeLibrary();
    if (!library) return null;
    try {
      const entry = library.icons[library.aliases[name] ?? name] ?? library.icons[name];
      if (!entry) return null;
      const svg = typeof entry === 'function' ? (await entry()).default : entry;
      if (typeof svg !== 'string') return null;
      _resolved.set(`${_libraryName}:${name}`, svg);
      return svg;
    } catch {
      return null;
    }
  },

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

  /**
   * List all icon names in a library (defaults to active). Returns a
   * Promise<string[]>.
   *
   * Async for compatibility rather than necessity — it used to import a
   * generated manifest, and now reads keys off a registration that is already in
   * memory. Callers all `await` it and would keep working if it were made
   * synchronous, but nothing is gained by making them change.
   */
  async list(library) {
    const name = library ?? _libraryName;
    const entry = name === null ? null : _libraries.get(name);
    if (!entry) {
      warnNoLibrary(name);
      return Object.keys(_custom);
    }
    return [...Object.keys(_custom), ...Object.keys(entry.icons)];
  },
};
