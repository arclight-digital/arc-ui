/**
 * The glyphs ARC UI's own chrome asks for, shipped inside the core package.
 *
 * Core ships no icon library (V4-PLAN 4.7), which left ARC's own chrome blank
 * on a page that had not imported a pack: the close buttons of arc-dialog,
 * arc-sheet, arc-drawer, arc-toast, arc-alert and arc-banner, arc-transfer-list's
 * move buttons, arc-toolbar's overflow. The component's own affordance,
 * missing for want of a dependency the consumer never chose (test-findings
 * #102). These are the fallback. They are consulted only when no library is
 * active or the active one has no glyph by that name, so a registered pack
 * still restyles them.
 *
 * Drawn here rather than copied from a pack, which keeps core's licence plain
 * MIT: vendored Lucide artwork would carry its ISC notice into this package and
 * its `license` field. Same 24px grid, 2px round stroke as Lucide, so a page
 * that later registers a pack sees the glyph change weight by nothing.
 *
 * Not a place to grow a library. A name belongs here only if a built-in
 * component renders it, and `scripts/checks/icon-names.js` holds that line in
 * both directions.
 */
const OPEN =
  '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';

export const builtinIcons = {
  x: `${OPEN}<path d="M6 6l12 12M18 6L6 18"/></svg>`,
  'chevron-left': `${OPEN}<path d="M15 6l-6 6 6 6"/></svg>`,
  'chevron-right': `${OPEN}<path d="M9 6l6 6-6 6"/></svg>`,
  'chevrons-left': `${OPEN}<path d="M11 6l-6 6 6 6M19 6l-6 6 6 6"/></svg>`,
  'chevrons-right': `${OPEN}<path d="M5 6l6 6-6 6M13 6l6 6-6 6"/></svg>`,
  'dots-three': `${OPEN}<path d="M5 12h.01M12 12h.01M19 12h.01"/></svg>`,
  pencil: `${OPEN}<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M13.5 7.5l3 3"/></svg>`,
  play: `${OPEN}<path d="M7 5l12 7-12 7z"/></svg>`,
  pause: `${OPEN}<path d="M8 5v14M16 5v14"/></svg>`,
};
