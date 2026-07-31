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
