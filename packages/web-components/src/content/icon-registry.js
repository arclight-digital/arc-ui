import phosphorIcons from '../icons/phosphor.js';
import lucideIcons from '../icons/lucide.js';

const packs = { phosphor: phosphorIcons, lucide: lucideIcons };

let _active = null;

export const iconRegistry = {
  /** Select a built-in icon library: 'phosphor' (default) or 'lucide'. */
  use(library) {
    const pack = packs[library];
    if (!pack) throw new Error(`Unknown icon library "${library}". Use "phosphor" or "lucide".`);
    _active = pack;
  },

  /** Register additional custom icons (merged on top of the active library). */
  set(icons) {
    if (!_active) _active = { ...packs.phosphor };
    for (const [key, val] of Object.entries(icons)) {
      const kebab = key
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      _active[kebab] = val;
    }
  },

  /** Look up an icon by kebab-case name. */
  get(name) {
    if (!_active) _active = packs.phosphor;
    return _active[name] ?? null;
  },

  /** List all icon names in a library (defaults to active). */
  list(library) {
    const pack = library ? packs[library] : (_active || packs.phosphor);
    return Object.keys(pack);
  },
};
