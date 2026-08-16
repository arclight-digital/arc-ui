# ARC UI Design Language

The rules that make ARC UI look like one thing instead of many. Read this before
writing any component surface, docs page, or demo. If a rule here forces an ugly
result, raise it — don't quietly invent an alternative, because a second pattern
is how a design language dies.

## State

- State is marked with **tint, glow, and accent text**. Never with a colored
  left border — no border-left indicators, no active-state left edges, no
  colored bar down the side of an alert or callout. This is the house's hardest
  ban; do not propose exceptions.
- A *neutral* left edge expressing structure alone (a nesting rail, an indent
  guide, one flat `--divider` that never changes color) is not state and is
  allowed — but prefer plain indentation when only a link or two is nested.

## Color and hierarchy

- Text hierarchy is built by **lifting to `--text-primary`, then by hue** — not
  by stepping down the gray ramp. `--text-secondary`, `--text-muted`, and
  `--text-ghost` sit within 17 RGB points of each other; adjacent steps do not
  read as different levels.
- Accent color enters through the two base pairs (`--accent-primary`,
  `--accent-secondary`, plus their `-rgb` channels). Compound tokens (gradients,
  glows, focus rings) must reference them via `var()` — never a hard-coded
  channel triplet — so a consumer overriding four tokens recolors everything.

## Tokens, not literals

- Every color, spacing, radius, size, and font in component or docs styling is
  a `var(--*)` reference. A literal value is a fork of the design language that
  no theme override can reach.
- Typefaces are **roles**, never names: `var(--font-body)`, `--font-label`,
  `--font-mono`, `--font-display`, `--font-quote`. Writing a typeface name into
  a stylesheet escapes the role system. (`--font-accent` is a legacy alias of
  `--font-label`; don't use it in new work.)
- Text is described by a **type context**, never spelled out. A context is a
  complete treatment — `--<name>-size`, `-weight`, `-spacing`, `-lh` — and a
  component picks one rather than assembling its own:

  | context | what wears it |
  | --- | --- |
  | `display-xl`, `heading`, `wordmark` | display type |
  | `body` | prose |
  | `ui` (`--ui-lh`) | running text inside a control: a field, a row, a menu item, a cell |
  | `glyph` (`--glyph-lh`) | a box whose whole content is one mark — an icon, a badge, a kbd cap |
  | `numeral` | the large figure a stat, clock, countdown or gauge displays |
  | `label` | the uppercase tracked label; `section-title` is its older name |
  | `label-inline` | the small label attached to a form field |
  | `ui-accent`, `code` | an emphasised UI string; monospace |

  `scripts/checks/type-roles.js` fails the build on a literal `font-size`,
  `font-weight`, `font-family`, `line-height` or `letter-spacing`, and on a
  `var()` naming a token nothing declares. A value derived from a context —
  `calc(var(--label-inline-size) - 1px)` — is using the scale and passes.
  Genuine one-offs go in that file's `EXEMPT` map **with a reason**.

## Motion and effects

- Glow over definition: depth and emphasis come from light, not from outlines
  and hard shadows.
- Motion must be motivated — it communicates a state change or directs
  attention, or it doesn't exist. Everything honors `prefers-reduced-motion`.
- Every effect is checked in **both themes** before it ships; dark-first never
  means light-broken. Effects stay inside the performance budget: no per-frame
  layout, compositor-friendly properties only.

## Docs pages are part of the design language

- Section headings use the one house pattern:
  `<h2 class="docs-heading">` followed by
  `<arc-divider align="left" variant="line-gradient" style="max-width:48px;…">`.
  No page rolls its own divider — a scoped `border-top` hairline on a heading
  is the exact drift that motivated this file.
- New pages start from an existing guide page's anatomy (`page-title`,
  `page-desc`, `section id=` matching the `headings` array), not from scratch.
- Show, don't tell: the docs site loads the library, so a rendered `arc-*`
  element demonstrating a claim beats a paragraph asserting it. Cut redundancy,
  not readability — complete sentences, no telegraphic fragments.
- Visual change comes from what a page or component fails at, never from a
  stock widget bolted alongside it.

## Known traps

- `background-clip: text` with tight line-height chops descenders; pair it with
  em-based `padding-block`/`margin-block` (arc-gradient-text already does).
- A token declared on `:host` in shared-styles.js beats a `:root` override and
  silently breaks consumer theming — only the role slots may be inherited there.

## Illumination

- Light is a **lobe**, and its shape is a token: `var(--lobe-line)` (lit in the
  middle, fading both ways), `--lobe-start` / `--lobe-end` (anchored to one
  edge), `--lobe-ambient` (the soft wash behind a section). Drive them with
  `--lobe-rgb`, `--lobe-alpha`, `--lobe-axis`, and for the wash `--lobe-shape`
  / `--lobe-extent`.
- **Set the inputs on `:host`.** A custom property substitutes its own `var()`s
  at the element that declares it, and the shapes are declared on `:host` — an
  input on an inner node paints in the fallback color with nothing failing.
  `check gradient-stops` enforces it.
- **Never `transparent` in a stop list.** It is `rgba(0, 0, 0, 0)`, so the fade
  darkens on its way out and leaves a hard edge where it meets its box —
  invisible on a near-black page, a grey rectangle on a near-white one. Use the
  adjacent stop's color at zero alpha, or a lobe, which cannot be spelled wrong.
  Checked across the token file *and* the components.
- A color that is not on the scale still gets a name: the mock window lights
  (`--orb-close` / `--orb-minimize` / `--orb-maximize`) and arc-gradient-text's
  presets (`--gradient-sunset`, `--gradient-ocean`) are tokens, not hexes,
  because a hex in a stylesheet is a color no theme can reach.
