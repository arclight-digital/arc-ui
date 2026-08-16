# V4-SCOPE — the catalog, decided

Companion to `V4-PLAN.md`. This file is the Phase 1 deliverable: every catalog
decision gets a verdict sentence here, and the mechanical gate at the end of
Phase 1 asserts that every tag in `custom-elements.json` has one.

**Status (2026-08-13): complete.** §1 the structural decision · §2 the open
product questions (V4-PLAN 1.3) · §3 the merge list (1.1) · §4 the per-tag
verdicts (enforced by `scripts/checks/scope-coverage.js`) · §5 the additions
(1.5) · §6 the non-goals (1.6) · §7 keep-and-freeze (1.4).

Phase 1's tag gate is live and green. The one gate half still unmechanized is
"every ratified addition has an intake-bar block" — §5 now has them, so that
check is writable whenever it is wanted.

---

## 1. The structural decision — domain groups, not deletions

**This supersedes V4-PLAN's "cut / satellite" framing for whole clusters.**

The plan asked, cluster by cluster, "delete or satellite?" That question had no
good answer because it was the wrong question. The marketing components are not
useless and the DAW components have a real consumer — they are **poorly
grouped**, on paper and architecturally. The catalog is flat: 207 tags with no
expression of "this is for a different kind of product", so the only tools
available were deletion and exile.

So the fix is a grouping axis, and then almost nothing needs deleting.

### 1.1 Mechanism: subpath tiers inside one package

- `@arclux/arc-ui` — the barrel exports **app** components only.
- `@arclux/arc-ui/marketing`, `@arclux/arc-ui/media` — domain groups, published
  normally, reachable by subpath, **absent from the default import**.

One package, one version, no install change for consumers, no new publishing
infrastructure. It reuses the barrel-gating machinery V4-PLAN 4.1 already
schedules for `status: experimental`.

Two properties that decided it:

- **Reversible.** A subpath group can be promoted to its own package later
  without moving a single source file. The reverse — un-splitting a published
  package — is not free.
- **They stay in the same repo, the same suite, and the same derived
  conformance run.** This is the direct answer to the plan's own warning that
  satellites "become where components go to die". A separate package is where
  that happens; a subpath is not.

### 1.2 Taxonomy: domain, not support level

Groups name **what kind of product a component is for**, not how much we
promise about it. Maturity already has its own axis (`status: 'stable' | 'beta'
| 'experimental'` in `docs/src/data/components/_types.ts`) and the two must not
be conflated — a marketing component can be perfectly stable.

| group | in the barrel | tags |
|---|---|---|
| **app** | yes | ~174 (everything not listed below) |
| **marketing** | no — `/marketing` | 12 |
| **media** | no — `/media` | 3 + `shared/time-scale` |

### 1.3 "Devtool" is retired as a category

`json-tree`, `diff`, `terminal` and `keyboard-map` are **app components**. A
JSON tree in an admin panel, a diff in a review tool, a terminal in a deploy
dashboard, a keyboard map in onboarding — these serve technical products, which
is not the same thing as being development tooling. They sit inside the product
sentence ("data-dense, form-heavy, keyboard-accessible product UI") and they
stay in core.

**Delete the "devtool tail" row from V4-PLAN 1.2.** It described a category that
does not exist.

### 1.4 The revised arithmetic

```
207 registered tags today
 − 13 merged away (§3, unchanged from V4-PLAN 1.1)
 −  5 deleted     (guided-tour, spotlight, speed-dial, dock, event-calendar)
─────
189 survive
 − 12 → /marketing
 −  3 → /media
─────
174 in the app barrel
 +  7 additions   (§5)
─────
181 app tags at v4.0, 196 shipped in total
```

Against V4-PLAN's original "≈176 core, ≈38 out": **the deletion list drops from
~25 tags to 5.** Everything else was a grouping problem.

---

## 2. The open product questions (V4-PLAN 1.3) — answered

### 2.1 Is the DAW downstream real? — **Yes. Group it, publish it.**

`waveform` (381 LOC), `knob` (447), `level-meter` (307) and
`shared/time-scale.js` (234) have a real consumer, and they do not belong in an
application UI kit's default surface.

**Verdict: → `/media`, published normally.** Out of the barrel, so a default
import never sees them; fully supported for the consumer that needs them.
`shared/time-scale` moves under the same subpath — it is a published export
today, so this is a documented breaking change with a MIGRATION entry, but no
capability is lost and nobody has to vendor anything.

### 2.2 Is chat on-product? — **Yes, and complete the family.**

`arc-conversation` (189 LOC) and `arc-message` (244) stay **core/app**, and
**`arc-prompt-input` is ratified into 4.8**: auto-growing composer,
Enter-to-send / Shift+Enter, attach slot, streaming and stop states,
form-associated. Without it the family has no way to send a message, which is
not a family.

### 2.3 Marketing cluster: satellite or delete? — **Neither. → `/marketing`.**

Twelve tags, 2,451 LOC: `cta-banner`, `feature-card`, `marquee`, `typewriter`,
`gradient-text`, `image-compare`, `hotspot`, `image-hotspots`, `comparison`,
`comparison-column`, `countdown-timer`, `carousel`.

They are good components for a product this kit is not. Grouping says that
precisely; deletion says something false.

### 2.4 `arc-modal` → `arc-dialog`? — **Yes, executed in 4.4.**

Aligns with the `<dialog>` element the family is about to be rebuilt on, and
with every peer system. Done as part of the platform rebuild so it is one
migration rather than two. `@deprecated arc-modal` alias for one major.

### 2.5 `qr-code` — **kept, with its dependency defused**

Not a domain problem. `qr-code` is 147 LOC with a **static**
`import qrcode from 'qrcode-generator'`, and that is one of exactly **two**
runtime dependencies in the published package — so every consumer of all 207
components installs a QR library.

**Verdict: keep it in app/core; make the dependency lazy and optional.**
Dynamic `import()` on the render path, `qrcode-generator` moved to
`optionalDependencies`, degrading to an empty box with a dev warning when it is
absent. Roughly 10 LOC, the same shape as the icon resolver. It is also the
library's only zero-coverage component, so **it gets a test as part of this
work** — the fix and the coverage land together.

### 2.6 `keyboard-map` vs `arc-shortcut-help` — **both, they are different jobs**

`keyboard-map` (590 LOC) is a *visualiser*: a physical keyboard with chords lit
up, for onboarding and "here is the shortcut". `arc-shortcut-help` (4.8) is an
*index*: a searchable dialog enumerating the `arc-hotkey[description]` elements
actually registered in the document.

With `arc-hotkey` that is a coherent three-part keyboard family, which is the
right shape for a kit whose stated identity is keyboard-first. **Remove
`keyboard-map` from V4-PLAN's delete list.**

---

## 3. The merge list (V4-PLAN 1.1) — DRAFTED

Thirteen tags disappear. Each row names the survivor, what absorbs the
difference, and what a consumer has to do.

| # | merged away | into | what absorbs the difference |
|---|---|---|---|
| 1 | `arc-otp-input` | `arc-pin-input` | Same control, two names. `length` already covers 4-vs-6; `mask` covers the obscured variant. Alias for one major. |
| 2 | `arc-separator` | `arc-divider` | Pure duplicate. Keep `orientation`; the survivor is the one the docs already lead with. |
| 3 | `arc-badge` | `arc-tag` | `arc-tag` is the superset (it has `removable`). Badge becomes `arc-tag` with no remove affordance — no new prop needed. |
| 4 | `arc-cluster` | `arc-stack` | `arc-stack[direction=horizontal][wrap]` is exactly what cluster is. Merge is a docs change plus an alias. |
| 5 | `arc-key-value` | `arc-description-list` | Same semantics, worse name. The survivor is the one matching `<dl>`. |
| 6 | `arc-kv-pair` | `arc-description-item` | Child of the above; merges with its parent. |
| 7 | `arc-table` | `arc-data-grid` | **One column model: the object array.** This is the substantive merge — see the note below. |
| 8 | `arc-data-table` | `arc-data-grid` | Same. `arc-data-grid` keeps `overscan` public and gains the shared `VirtualController` (4.2). |
| 9 | `arc-snackbar` | `arc-toast` | Absorbed by a `placement` prop. |
| 10 | `arc-progress-toast` | `arc-toast` | Absorbed by a `progress` prop. |
| 11 | `arc-callout` | `arc-alert` | Role follows severity, ratified in §3.2. Variant union of five; `info` becomes non-live, which is a behaviour change for **existing alert users** too. |
| 12 | `arc-inline-message` | the per-control error surface | Not a component merge: this is a capability every form control already has. The tag goes, the behaviour stays. |
| 13 | `arc-dialog` (today's) | `arc-confirm` | **Collision — see below.** |

### 3.1 The table family is the only expensive one

Three components implement windowing (`virtual-list`, `data-table`,
`data-grid`) and two implement columns. The merge is not a rename: `arc-table`
and `arc-data-table` have to give up their column models for the object array,
which is a breaking change for anyone using the slot-based form. 4.2 extracts
the shared `VirtualController` while doing it. Budget this as the real work in
the merge list; the other twelve are aliases and docs.

### 3.2 `callout → alert`: role follows severity — **RATIFIED 2026-08-13**

This is an accessibility merge wearing a visual one's clothes. Today:

| | role today | variants |
|---|---|---|
| `arc-alert` | `error`/`warning` → `role="alert"`, else `role="status"` (`alert.js:120`) | info, success, warning, error |
| `arc-callout` | `role="note"` always (`callout.js:126`) | info, tip, warning, error |

**`arc-alert` already implements role-follows-severity.** The policy is
therefore mostly a ratification of existing behaviour — with one correction
that the merge forces, and it is the whole reason this row needed a decision.

#### The mapping

| severity | role | live region |
|---|---|---|
| `error`, `warning` | `role="alert"` | assertive |
| `success` | `role="status"` | polite |
| `info`, `tip` | `role="note"` | **none** |

Merged variant set: **`info · tip · success · warning · error`** — the union.
`tip` comes from callout, `success` from alert; both earn their place.

#### The correction: `info` loses its live region

`arc-alert` currently maps `info` to `role="status"`, which *is* a polite live
region. `arc-callout`'s default variant is `info`, and it is a static
`role="note"` box. So a naive merge upgrades every informational callout on
every page into an announcement — precisely the regression this decision
exists to prevent, and it would land on the single most common variant.

So `info` maps to `role="note"`, and **this is a behaviour change for existing
`arc-alert` users**, not just for callout. It goes in MIGRATION.md as such.
The reasoning: `info` is the variant most likely to be static page furniture,
and an alert that needs announcing has two ways to say so — pick a severity
that carries one, or set `live` explicitly.

#### The escape hatch

`live: oneOf(['auto', 'off', 'polite', 'assertive'])`, default `auto` = the
table above. It exists because the severity heuristic answers "how bad is
this", and the question a live region actually asks is "did this just appear" —
which no prop can infer. An `info` alert injected after a background save
should be `live="polite"`; a `warning` rendered in the initial page should
probably be `live="off"`.

Declared through the vocabulary (`oneOf`), so `conformance.test.js` derives its
enum coverage and `scripts/prism-props.js` carries it into all six wrappers.

#### Also to preserve

`arc-callout`'s top accent bar is a visual affordance `arc-alert` has no
equivalent for. It survives as a boolean on the merged component rather than
being dropped — a merge should not quietly delete a visual capability. Its
name is a 4.3 dialect question, not a Phase 1 one.

### 3.3 The dialog collision — three levels, not three peers

The plan listed "dialog+confirm consolidated" alongside "`arc-modal` →
`arc-dialog`", and those two together silently reuse a live tag name for a
different component. Reading the sources settles what the shapes actually are:

```
arc-confirm  (141 LOC)  "Programmatic confirmation API that wraps dialog"
   └── arc-dialog (123)  "Small centered confirmation dialog wrapping arc-modal"
          └── arc-modal (235)  the real primitive — OverlayMixin, focus trap, backdrop, size
```

So `arc-modal` is the primitive and `arc-dialog`/`arc-confirm` are two skins on
the same confirmation prompt — which is the duplicate the review identified.
The resolution:

- **`arc-modal` → renamed `arc-dialog`**, rebuilt on native `<dialog>` in 4.4.
- **today's `arc-dialog` → merged into `arc-confirm`**, which keeps *both* the
  `ArcConfirm.open(): Promise<boolean>` imperative API and the declarative
  element form. Those are different shapes, not duplicates of each other.
- Net: three tags become two.

**The name `arc-dialog` is reused for a different component, and that must not
be silent.** Anyone using today's `arc-dialog` — a confirm prompt with
`heading`/`message`/`confirmLabel` — would upgrade into a bare overlay
primitive that ignores all three and renders an empty panel. A deprecation
notice in MIGRATION.md is not enough for a failure that quiet.

**Required: `arc-dialog` throws a dev-mode error when it receives
`message` or `confirmLabel`**, naming `arc-confirm`. Cheap, and it converts a
silent blank dialog into a one-line fix.

---

## 4. Per-tag verdicts

Every one of the 207 tags has a verdict here, which is what the Phase 1 gate
checks. Default is **keep — app**; only the tags that are not that carry a
clause.

Arithmetic check: 13 merged + 5 deleted + 12 `/marketing` + 3 `/media` = 33
non-default, leaving **174 in the app barrel**.

**Executed so far (V4-PLAN 4.1, 2026-08-15):** the 5 deletions and the 15 group
moves. 202 tags are registered today. Rows for the five deleted tags stay here —
they are the record of why, and both the docs tombstones and MIGRATION.md point
back at them. `scripts/checks/scope-coverage.js` reads the verdict text and
counts a delete/merge/rename verdict for an absent tag as *executed* rather than
stale; a `keep` verdict for an absent tag is still a failure, because nothing in
this plan removes a keep. The 13 merges and 1 rename are 4.2 and 4.4.

### content (33)

| tag | verdict |
|---|---|
| `arc-carousel`, `arc-cta-banner`, `arc-feature-card`, `arc-hotspot`, `arc-image-compare`, `arc-image-hotspots`, `arc-marquee` | **`/marketing`** — landing-page components |
| `arc-callout` | **merge → `arc-alert`** (§3.2) |
| `arc-separator` | **merge → `arc-divider`** |
| `arc-qr-code` | **keep — app**, with the dependency made lazy + optional and a first test (§2.5) |
| `arc-icon-library` | **keep — app**; needs `name: oneOf([...])` (finding #79) |
| `arc-divider` | **keep — app**, absorbs `arc-separator` |
| `arc-stack` | **keep — app**, absorbs `arc-cluster` |
| `arc-accordion`, `arc-accordion-item`, `arc-aspect-ratio`, `arc-avatar`, `arc-avatar-group`, `arc-card`, `arc-collapsible`, `arc-color-swatch`, `arc-column`, `arc-empty-state`, `arc-icon`, `arc-image`, `arc-infinite-scroll`, `arc-lightbox`, `arc-scroll-area`, `arc-scroll-indicator`, `arc-skeleton`, `arc-spinner`, `arc-video`, `arc-virtual-list` | keep — app |

### data (34)

| tag | verdict |
|---|---|
| `arc-comparison`, `arc-comparison-column`, `arc-countdown-timer` | **`/marketing`** |
| `arc-level-meter`, `arc-waveform` | **`/media`** — DAW primitives (§2.1) |
| `arc-event-calendar` | **delete** — no time-of-day support; a calendar that cannot express an appointment is defective by design. MIGRATION names an integration recipe. |
| `arc-table`, `arc-data-table` | **merge → `arc-data-grid`** (§3.1) |
| `arc-badge` | **merge → `arc-tag`** |
| `arc-key-value` | **merge → `arc-description-list`** |
| `arc-kv-pair` | **merge → `arc-description-item`** |
| `arc-data-grid` | **keep — app**, the merged grid; gains `VirtualController` in 4.2 |
| `arc-tag` | **keep — app**, absorbs `arc-badge`; see the chip-family collision in §5 |
| `arc-json-tree`, `arc-diff` | **keep — app** — reclassified from "devtool" (§1.3). `json-tree` needs its WeakSet cycle guard (3.2); `diff` needs its LCS memoised and a size guard. |
| `arc-activity-heatmap`, `arc-animated-number`, `arc-chart`, `arc-clock`, `arc-description-item`, `arc-description-list`, `arc-gauge`, `arc-kanban`, `arc-list`, `arc-list-item`, `arc-meter`, `arc-sparkline`, `arc-stat`, `arc-step`, `arc-stepper`, `arc-timeline`, `arc-timeline-item`, `arc-uptime`, `arc-value-card` | keep — app |

### feedback (27)

| tag | verdict |
|---|---|
| `arc-guided-tour`, `arc-spotlight` | **delete** — broken as stable; both tombstones name `arc-tour` (4.8) as forthcoming |
| `arc-dialog` (today's) | **merge → `arc-confirm`**; the name is then reused by the renamed `arc-modal` (§3.3) |
| `arc-modal` | **rename → `arc-dialog`** in 4.4, on native `<dialog>`; `@deprecated` alias one major |
| `arc-confirm` | **keep — app**, absorbs today's `arc-dialog`; keeps both the imperative and declarative APIs |
| `arc-snackbar` | **merge → `arc-toast`** via `placement` |
| `arc-progress-toast` | **merge → `arc-toast`** via `progress` |
| `arc-inline-message` | **merge → the per-control error surface** |
| `arc-alert` | **keep — app**, absorbs `arc-callout` once §3.2 is ratified |
| `arc-conversation`, `arc-message` | **keep — app** — chat is on-product; `arc-prompt-input` completes the family (§2.2) |
| `arc-announcement`, `arc-banner`, `arc-command-group`, `arc-command-item`, `arc-command-palette`, `arc-connection-status`, `arc-context-menu`, `arc-dropdown-menu`, `arc-hover-card`, `arc-loading-overlay`, `arc-notification-panel`, `arc-popover`, `arc-progress`, `arc-sheet`, `arc-toast`, `arc-tooltip` | keep — app |

### input (46)

| tag | verdict |
|---|---|
| `arc-knob` | **`/media`** — DAW primitive |
| `arc-otp-input` | **merge → `arc-pin-input`** |
| `arc-chip` | **keep — app**, but **resolve the chip family in §5** before `arc-filter-chip` is built: the catalog would otherwise hold `arc-tag[removable]`, `arc-chip` and `arc-filter-chip` as three unrelated implementations of one idea |
| `arc-label` | **keep — app**; fix the CSS-selector injection (finding #77) |
| `arc-hotkey` | **keep — app**; one third of the keyboard family with `arc-keyboard-map` and `arc-shortcut-help` (§2.6) |
| `arc-button`, `arc-button-group`, `arc-calendar`, `arc-checkbox`, `arc-color-picker`, `arc-combobox`, `arc-copy-button`, `arc-date-picker`, `arc-date-range-picker`, `arc-fieldset`, `arc-file-upload`, `arc-form`, `arc-icon-button`, `arc-image-cropper`, `arc-inline-edit`, `arc-input`, `arc-input-group`, `arc-masked-input`, `arc-multi-select`, `arc-number-input`, `arc-password-input`, `arc-pin-input`, `arc-radio`, `arc-radio-group`, `arc-range-slider`, `arc-rating`, `arc-search`, `arc-segmented-control`, `arc-select`, `arc-signature-pad`, `arc-slider`, `arc-sortable-list`, `arc-suggestion`, `arc-switch-group`, `arc-tag-input`, `arc-textarea`, `arc-theme-toggle`, `arc-time-picker`, `arc-toggle`, `arc-transfer-list`, `arc-tree-select` | keep — app (the select family and the form-control set are both on the keep-and-freeze list) |

### layout (21)

| tag | verdict |
|---|---|
| `arc-dock` | **delete** — broken as stable |
| `arc-cluster` | **merge → `arc-stack`** |
| `arc-app-shell`, `arc-aspect-grid`, `arc-auth-shell`, `arc-center`, `arc-container`, `arc-dashboard-grid`, `arc-float-bar`, `arc-inset`, `arc-masonry`, `arc-page-header`, `arc-page-layout`, `arc-resizable`, `arc-responsive-switcher`, `arc-section`, `arc-settings-layout`, `arc-split-pane`, `arc-status-bar`, `arc-sticky`, `arc-toolbar` | keep — app |

### navigation (29)

| tag | verdict |
|---|---|
| `arc-speed-dial` | **delete** — broken as stable |
| `arc-pagination` | **keep — app**; bound `current` in the declaration (finding #76) |
| `arc-stepper-nav` | **keep — app**; bound `active` and reconcile the two disagreeing guards (finding #78) |
| `arc-navigation-menu` | **keep — app**; container queries replace its 900px viewport gate (4.4) |
| `arc-anchor-nav`, `arc-bottom-nav`, `arc-breadcrumb`, `arc-breadcrumb-item`, `arc-breadcrumb-menu`, `arc-command-bar`, `arc-drawer`, `arc-footer`, `arc-link`, `arc-menubar`, `arc-nav-item`, `arc-page-indicator`, `arc-rail`, `arc-scroll-spy`, `arc-scroll-to-top`, `arc-sidebar`, `arc-sidebar-link`, `arc-sidebar-section`, `arc-skip-link`, `arc-spy-link`, `arc-tab`, `arc-tabs`, `arc-top-bar`, `arc-tree-item`, `arc-tree-view` | keep — app |

### shared (3)

| tag | verdict |
|---|---|
| `arc-menu-divider`, `arc-menu-item`, `arc-option` | keep — app. Sub-components of the menu and select families; on the keep-and-freeze list. `arc-option` must stay explicitly registerable — its parent's `.register.js` pulls in the class, not the registration. |

### typography (14)

| tag | verdict |
|---|---|
| `arc-gradient-text`, `arc-typewriter` | **`/marketing`** |
| `arc-keyboard-map` | **keep — app** — removed from the delete list; pairs with `arc-hotkey` and `arc-shortcut-help` (§2.6) |
| `arc-terminal` | **keep — app** — reclassified from "devtool"; its hardcoded macOS traffic-light hex triplets get tokens in 4.5 |
| `arc-code-block` | **keep — app** — the docs site depends on it; same 4.5 token fix |
| `arc-blockquote`, `arc-highlight`, `arc-kbd`, `arc-markdown`, `arc-number-format`, `arc-prose`, `arc-text`, `arc-time-ago`, `arc-truncate` | keep — app |

## 5. Additions (V4-PLAN 1.5) — RATIFIED

**The intake bar.** Every addition must (1) fit the product sentence, (2) do
the hard 20% of its domain or not ship, (3) be born on the contract layer —
vocabulary declarations, shared controllers, derived conformance on day one,
`status: experimental` until proven — and (4) touch component + test + docs page
and nothing else.

Seven tags, six components. All ship `status: experimental`, which 4.1 gates out
of the barrel, so none of them can enter the barrel only to be removed from it.
4.8 targets v4.0 but does not block the tag.

### 5.1 `arc-tree-grid`

- **Product fit.** A treegrid is the canonical data-dense enterprise control and
  the most-requested thing this catalog lacks.
- **The hard 20%.** WAI-ARIA treegrid: expand/collapse rows,
  `aria-level`/`posinset`/`setsize`, Left/Right as collapse/expand on a roving
  2-D focus. Without the keyboard protocol it is a styled table and should not
  ship.
- **Contract layer.** Shares `VirtualController` with the merged grid (4.2
  dependency — it must not be a fourth windowing implementation).
- **Open sub-decision:** sibling component vs. a mode on the merged grid, decided
  by whether the `grid`/`treegrid` role split contaminates the flat grid. Lean
  sibling, following the select family's composition pattern. Column manager and
  expandable-row detail land here as grid capabilities.

### 5.2 `arc-filter-bar` + `arc-filter-chip`

- **Product fit.** Data-dense product UI without a filter surface is a table you
  can only read.
- **The hard 20%.** Keyboard traversal across the chip set, announced filter
  changes, and overflow behaviour. Per-type editors (select / date-range / text /
  number) in anchored popovers — a 4.4 dependency.
- **Chip family — RATIFIED 2026-08-13.** `arc-filter-chip` **composes
  `arc-tag[removable]`**. The three names then mean three things and nothing is
  reimplemented:

  | tag | job | signal |
  |---|---|---|
  | `arc-tag` | label, optionally removable (absorbs `arc-badge`) | `arc-remove` |
  | `arc-chip` | toggle — selected state | `arc-change {value, selected}` |
  | `arc-filter-chip` | filter token: `field:operator:value`, dismissible, click-to-edit | composes the above |

  Recorded because the reflex reading — "three chip components, collapse them" —
  is wrong: `arc-tag` and `arc-chip` are a label and a toggle, and a filter token
  is shaped like the label plus a click action, not like the toggle. Collapsing
  them into one pill with three mutually-exclusive interaction modes is the shape
  that regrows into three components a year later.

### 5.3 `arc-tour`

- **Product fit.** Replaces `guided-tour` and `spotlight`, both deleted as
  broken-as-stable. **This is the only replacement obligation among the five
  deletions**, and their tombstones name it as forthcoming (ground rule 1).
- **The hard 20%.** Takes **element references, not just selectors** — that is
  the API decision that fixes shadow-DOM targeting by design rather than by
  workaround, and it is why the rebuild is correct where the originals were not.
- **Contract layer.** ~150 LOC on the 4.4 overlay contract. If it needs more than
  that, the overlay contract is wrong, not the tour.

### 5.4 `arc-shortcut-help`

- **Product fit.** Makes the keyboard-first identity visible, which is otherwise
  a claim nobody can see.
- **The hard 20%.** Searchable cheat-sheet dialog that enumerates
  `arc-hotkey[description]` elements **from the document** — the registry is the
  DOM, so the content is derived rather than a second list to maintain.
- **Family.** Third of three with `arc-hotkey` and `arc-keyboard-map` (§2.6):
  hotkey binds, keyboard-map visualises a chord, shortcut-help indexes what is
  registered.

### 5.5 `arc-field-list` (tier 2)

- **Product fit.** Repeating form rows are form-heavy product UI by definition.
- **The hard 20%.** Indexed FormData names (`items[0].email`), focus to the new
  row on add and to a survivor on remove, live-region announcements.
- **Design the naming contract before committing** — the indexed-name scheme is
  the public API and cannot be changed later without breaking every backend that
  parses it. It should also be swept by `form-data-sweep.test.js`, which now
  derives its subjects from `formAssociated` in the manifest.

### 5.6 `arc-prompt-input`

Ratified in §2.2 (chat is on-product). Auto-growing composer,
Enter-to-send / Shift+Enter, attach slot, streaming and stop states,
form-associated. Completes `conversation` + `message` as a family — without it
there is no way to send a message.

### 5.7 Backlog — acknowledged, not ratified

`arc-datetime-picker` and `arc-query-builder`. The latter is a satellite or lab
candidate rather than a core tag; neither has passed the intake bar and neither
is scheduled.

---

## 6. Named non-goals (V4-PLAN 1.6) — RATIFIED

So they cannot accrete back. Each names what to use instead:

| non-goal | instead |
|---|---|
| Rich-text editor | Integrate TipTap/ProseMirror; ARC styles the chrome around it. |
| PDF / file preview | Browser-native `<embed>`; `arc-file-upload` handles the input half. |
| Dockable panel layouts | `arc-split-pane` + `arc-resizable` compose to most of it; the rest is an app concern. |
| Pivot tables | Aggregate server-side, render with the merged `arc-data-grid`. |
| Real scheduling calendar | Integration recipe in the docs. `arc-event-calendar` is deleted precisely because a half-calendar is worse than none (§4). |
| Intl phone input | `arc-masked-input` + libphonenumber. |
| Credit-card input | Use the processor's hosted fields — owning a PCI surface is not a design-system job. |
| Mobile swipe / pull gestures | Out of scope for a keyboard-first product kit; `arc-carousel` moves to `/marketing` rather than growing gestures. |

**Withdrawn: QR.** It was a non-goal on the strength of `arc-qr-code` being
deleted. §2.5 keeps the component with its dependency made lazy and optional, so
the "name an ESM library in MIGRATION.md" line no longer applies.

---

## 7. Keep-and-freeze (V4-PLAN 1.4) — RATIFIED

Frozen means: **not open for redesign during v4**, and a change here needs its
own argument rather than riding along with a workstream. Counts verified against
the tree 2026-08-13.

| frozen | state | why it is frozen |
|---|---|---|
| **The event contract** | **186/186** `CustomEvent`s carry `bubbles: true` + `composed: true`, all `arc-*` prefixed, `detail.value` first | Zero exceptions across the whole library — a contract this uniform is a genuine asset and any deviation is a regression, not a variation. (An earlier crude grep suggested 176/182; a proper paren-balanced parse confirms 186/186.) |
| **The props vocabulary** | 171 components, 347 declared props on `flag`/`oneOf`/`num`/`int` | The spine two derived suites read back at runtime. Its own gate is ≥90% mutation, the highest in the sampled set. Extend it (`list()` in 2.2); do not redesign it. |
| **The select family** | `select`, `combobox`, `multi-select`, `tree-select` + `arc-option` on `ListboxController` | The composition pattern the rest of the catalog is measured against, and the model 5.1 follows for tree-grid. |
| **meter / gauge / progress** | all three on `num({min,max,clamp})` after finding #70 | Recently corrected; re-opening them re-introduces the render-clamp bug. |
| **kanban / chart / data-grid** | the data-dense core | These *are* the product sentence. The merge in §3.1 changes data-grid's column model and nothing else. |
| **`packages/html`** | 188 example files + the CSS | The proof the library works without a framework. Its `files`/exports bug is fixed in Phase 0.6 — that is a packaging fix, not a redesign. |
| **The docs prose architecture** | per-component pages with do/don't guidance | 4.9 generates *more* from it (conformance statements, `llms.txt`, MCP surface); the structure it generates from stays. |
| **The sub-component docs pattern** | children documented on the parent's page | `arc-option`, `arc-list-item`, `arc-timeline-item`, `arc-breadcrumb-item` and the rest. Splitting them into their own pages doubles the page count for no reader benefit. |
