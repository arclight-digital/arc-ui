/**
 * Phosphor, registered with ARC UI's icon registry.
 *
 *     import '@arclux/arc-ui-icons/phosphor';
 *
 * One import is the whole setup. It is side-effecting, and it owns the plain
 * `./phosphor` subpath deliberately: registering a pack is what almost everyone
 * wants, so it gets the name you would guess. The eager whole-library object
 * that used to live at this specifier is at `./all/phosphor` now — see the
 * default export at the bottom, which exists to say so.
 *
 * If no library has been selected yet this becomes the active one, so
 * `<arc-icon name="check">` works on the next line.
 *
 * ── What this costs ──
 *
 * `_resolver.js` is a map of 1,512 `() => import('./name.js')` thunks. Every one
 * is a static specifier, so a bundler emits 1,512 chunks and a page downloads
 * only the glyphs it renders — but it does have to *know about* 1,512 modules,
 * and that shows up in build time and in the chunk graph. That cost is the
 * reason this is an import a consumer writes rather than something the core
 * package does on their behalf; before v4 it sat in everyone's graph whether
 * they rendered an icon or not.
 *
 * An application that uses a dozen icons should skip this module entirely and
 * register those dozen directly, which pulls in a dozen modules and no resolver:
 *
 *     import { iconRegistry } from '@arclux/arc-ui';
 *     import check from '@arclux/arc-ui-icons/phosphor/check';
 *     import x from '@arclux/arc-ui-icons/phosphor/x';
 *     iconRegistry.set({ check, x });
 *
 * Note that `set()` icons are library-independent: they answer to their name
 * whatever `use()` is pointing at, and they win over a registered library.
 */
import { iconRegistry } from '@arclux/arc-ui/icon-registry';
import icons from './phosphor/_resolver.js';
import { aliases } from './aliases.js';

iconRegistry.register('phosphor', { icons, aliases: aliases.phosphor });

/**
 * The one migration this package can catch at runtime instead of in a document.
 *
 * `@arclux/arc-ui/icons/phosphor` was an eager map of every glyph, and the
 * mechanical way to update it is to change the package name and leave the rest —
 * which lands here, where there is no such map. Without this the default import
 * would be `undefined` and the first lookup would fail as "cannot read
 * properties of undefined", which is true and tells you nothing.
 *
 * Inert unless something actually reads it, and unreachable for the
 * side-effect-only import above.
 */
export default new Proxy(
  {},
  {
    get(_target, prop) {
      throw new Error(
        `@arclux/arc-ui-icons/phosphor registers the Phosphor pack; it has no icon map to read ` +
          `"${String(prop)}" from. For the whole library as one object, import ` +
          `'@arclux/arc-ui-icons/all/phosphor'. For one glyph, import ` +
          `'@arclux/arc-ui-icons/phosphor/${String(prop)}'.`,
      );
    },
  },
);
