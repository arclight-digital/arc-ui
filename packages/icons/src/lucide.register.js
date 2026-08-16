/**
 * Lucide, registered with ARC UI's icon registry.
 *
 *     import '@arclux/arc-ui-icons/lucide';
 *
 * One import is the whole setup. If no library has been selected yet this
 * becomes the active one, so `<arc-icon name="check">` works on the next line.
 *
 * Importing both packs leaves the *first* one active — registration selects only
 * when nothing is selected, so it cannot silently take the choice back from a
 * page that made one. Say which you want rather than relying on import order:
 * `iconRegistry.use('lucide')`, or `<arc-icon-library name="lucide">`.
 *
 * See phosphor.register.js for what the resolver costs, how to skip it, and why
 * the default export below throws.
 */
import { iconRegistry } from '@arclux/arc-ui/icon-registry';
import icons from './lucide/_resolver.js';
import { aliases } from './aliases.js';

iconRegistry.register('lucide', { icons, aliases: aliases.lucide });

export default new Proxy(
  {},
  {
    get(_target, prop) {
      throw new Error(
        `@arclux/arc-ui-icons/lucide registers the Lucide pack; it has no icon map to read ` +
          `"${String(prop)}" from. For the whole library as one object, import ` +
          `'@arclux/arc-ui-icons/all/lucide'. For one glyph, import ` +
          `'@arclux/arc-ui-icons/lucide/${String(prop)}'.`,
      );
    },
  },
);
