# Spec: Docs Site Search via `arc-command-palette` (⌘K)

**Status:** Phase 1 implemented (`src/components/SiteSearch.astro`, 2026-07-23) · Phase 2 proposed · **Target:** docs site (arcui.dev) · **Depends on:** a small WC enhancement for Phase 2

## Goal

Site-wide search over 164 components + 11 guides, opened with ⌘K / Ctrl+K from any docs page, built on our own `arc-command-palette`. This is both the docs site's biggest UX gap (only discovery today is the sidebar) and a permanent live demo of the flagship interactive component.

**Success criteria**

- ⌘K / Ctrl+K opens search on every page using `DocsLayout`, plus a visible trigger in the top bar for discoverability.
- Typing a component name (or fragment) and hitting Enter lands on its page in ≤ 3 keystrokes + Enter for common cases.
- Zero new runtime dependencies, no search service, no client-side index fetch.
- Works with view transitions (palette survives `astro:after-swap`).

## Non-goals (out of scope)

- Full-text search of page *content* (props tables, guide prose). Names + descriptions cover the realistic query space; revisit only if analytics say otherwise.
- Algolia/Pagefind/etc. — external services and WASM indexes are overkill for ~175 titled records.
- Fuzzy matching beyond what the component ships. Phase 2 adds keyword aliases, not edit-distance scoring.

## UX

- **Trigger:** a search button in the `DocsLayout` top bar (magnifier icon + "Search" + `⌘K` hint rendered with `arc-hotkey`), and a global `keydown` listener for ⌘K/Ctrl+K. `/` is deliberately *not* bound (conflicts with type-to-find expectations inside inputs).
- **Open behavior:** `arc-command-palette.open = true` — the component already auto-focuses the input, traps focus (shared `focus-trap.js`), and locks scroll (`scroll-lock.js`).
- **Items:** flat list (the WC has no native grouping — see Phase 2):
  - Components: icon = tier-representative icon, text = component name, `shortcut` slot repurposed as a right-aligned kicker showing the tier (`Input`, `Feedback`, …).
  - Guides: icon = `book-open`, kicker `Guide`.
- **Select:** navigate via `location.assign(item.dataset.href)` on `arc-select`. Astro view transitions make this feel instant.
- **Recents (nice-to-have, same PR):** store last 5 selected hrefs in `localStorage['arc-docs-recents']`; render them at the top of the list when the query is empty.

## Architecture

**No JSON index, no fetch.** The item list is rendered statically at build time — the data already lives in `src/data/components/index` and the guide list mirrors `src/lib/og-pages.ts`.

1. **`src/components/SiteSearch.astro`** (new)
   - Server-renders one `<arc-command-palette id="site-search" placeholder="Search components and guides…">` containing ~175 `<arc-command-item data-href="…">` children.
   - Includes an `is:inline` script that: binds ⌘K/Ctrl+K on `document`, opens the palette, handles `arc-select` → navigate, and re-binds nothing after swaps because…
2. **Placement:** rendered once in `DocsLayout` (and optionally `BaseLayout` so the landing page gets it too). With Astro `<ViewTransitions/>`, use `transition:persist` on the palette wrapper so the element (and its listeners) survives `astro:after-swap` — same class of issue we hit with brand fonts, solved at the element level instead of re-init.
3. **Registration:** `command-palette` + `command-item` registers are already available via `@arclux/arc-ui/command-palette` etc.; import them in the component's module script.

**Payload cost:** ~175 statically rendered items ≈ 15–20 KB of HTML per page (pre-gzip; ~3–4 KB gzipped, and it's identical on every page so it compresses/caches well). Accept for Phase 1. If it bothers us later: ship the items in a `<template>` and stamp them on first open.

## Filtering & ranking

- **Phase 1:** the component's built-in filter (matches on item text / `label`). Component names are the dominant query type; this ships value with zero WC changes.
- **Phase 2 (WC enhancement, in `packages/web-components`):** add a `keywords` attribute to `arc-command-item` that participates in filtering but not display (e.g. Modal: `keywords="dialog popup overlay"`, Select: `keywords="dropdown"`). Also consider `arc-command-group` with a heading for Components/Guides/Recents sections. Both are generally useful component features, not docs hacks — they ride a normal minor release (edit WC source → `pnpm generate` → release), and the docs adopt them when published. Keyword aliases live in the component data files (`src/data/components/*.ts`, new optional `searchKeywords` field) so they stay next to the component they describe.
- Ranking within Phase 1 is the component's DOM order: **Recents → Guides (11) → Components (alphabetical within tier order)** — the same order as the sidebar, so muscle memory transfers.

## Accessibility

- The palette already passes the axe gate (dialog semantics, focus trap, scroll lock). New surface area to check:
  - Top-bar trigger: real `<button>` with `aria-label="Search docs"` + `aria-keyshortcuts="Meta+K Control+K"`.
  - Re-run `pnpm audit:a11y` — the palette now exists on all 175+ pages, so any regression multiplies.
- No left-accent-border styling anywhere (hard ban), including the recents treatment.

## Test plan

- Keyboard: ⌘K opens; Esc closes and returns focus to the trigger; arrow keys + Enter navigate.
- The ⌘K listener must not fire when focus is inside an input/textarea/contenteditable **unless** it's our own palette input.
- View transitions: open palette → navigate → ⌘K again on the new page (listener survived); verify with `transition:persist` both in dev and build.
- Mobile: trigger button opens palette; on-screen keyboard doesn't obscure the input (palette is top-anchored).
- Build-size sanity: `dist` page size delta < 25 KB pre-gzip.

## Estimate

- Phase 1 (SiteSearch.astro + top-bar trigger + recents): ~half a day, docs-only change, ships with next push to main.
- Phase 2 (`keywords` attr + optional `arc-command-group` in the WC + docs adoption): ~a day across both repos, rides the next minor release.
