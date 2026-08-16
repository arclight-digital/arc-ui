/**
 * Cross-library icon aliases: ARC UI's canonical name → what this library calls it.
 *
 * Phosphor and Lucide disagree about what common glyphs are called, and for the
 * carets they disagree completely — no single spelling exists in both. Phosphor
 * has `caret-right` and no `chevron-right`; Lucide has `chevron-right` and no
 * `caret-right`. A component that hard-codes either name therefore renders
 * *nothing* under the other library: `iconRegistry.get()` returns null, arc-icon
 * draws an empty box, and no error appears anywhere. arc-transfer-list shipped
 * exactly that — four Lucide names under the Phosphor default, so its move
 * buttons were blank from the day it shipped.
 *
 * ARC UI's own components use the Lucide spelling as the canonical name, and
 * this maps it to whatever the active library calls it. Consumer names are
 * unaffected: an unaliased name resolves directly, so a table here never changes
 * what a name means for anyone else.
 *
 * ── Why this lives in the icons package ──
 *
 * It is knowledge about two specific libraries, and after the v4 split the core
 * package has none. A table naming `caret-right` cannot sit beside a registry
 * that has never heard of Phosphor. It travels with the library it describes,
 * which is also what makes a *custom* library expressible — `register()` takes
 * an `aliases` map for exactly this reason, so a consumer registering Material
 * or Feather can make ARC's built-in components resolve against it without
 * patching anything.
 *
 * Covered by scripts/checks/icon-names.js, which fails the build if a built-in
 * component asks for a name that is missing from either library after aliasing.
 */
export const aliases = {
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
