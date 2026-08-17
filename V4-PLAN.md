# V4-PLAN — arc-ui v4: curation, contracts, platform, light

**The product, in one sentence:** ARC UI is an application UI kit — data-dense,
form-heavy, keyboard-accessible product UI, usable from any framework without
changing your design system — with an opinionated visual language (dark-first,
illuminated by lobes of light and soft gradients) that adapts to a brand
through a deliberately tiny theming contract.

**The catalog, in one line of arithmetic** (final, per `V4-SCOPE.md` §1.4 —
Phase 1 is closed): 207 registered tags today → 13 merged away + **5 deleted**
+ 15 moved to domain subpaths (12 `/marketing`, 3 `/media`) + 7 additions in →
**181 tags in the app barrel at v4.0, 196 shipped in total.**

The earlier estimate here was "~25 cut or satellited → ~176 core". **The
deletion list is 5, not ~25.** The rest was a grouping problem, not a value
problem: the catalog had no way to say "this is for a different kind of
product", so deletion and exile were the only tools available. Adding a domain
axis (subpath tiers in one package) made most of the cut list unnecessary.

**Sources.** The independent 14-agent review of 2026-08-03 (eight readers +
three adversarially-critiqued architecture proposals), reconciled with the
in-flight ledgers `HANDOFF.md`, `test-findings.md` (findings #1–#71),
`test-audit.md`, then this document itself was fact-checked, sequence-checked,
and completeness-checked by three further verification agents against the
working tree. Cited counts and line numbers reflect that verification.

**How to read this.** Phases 0–2 finish the current work. Phase 3 is releases
that should not wait for v4. Phase 4 is the v4 work, as ordered workstreams.
Phase 5 ships. Sizing: **S** = one sitting, **M** = a day or two, **L** = up
to a week, **XL** = multi-week. Checkboxes are the tracking mechanism — this
file is a ledger, like the others.

---

## Ground rules (every phase, every PR)

1. **Nothing is deleted until its replacement is green in CI** — for internal
   replacements (a check superseding a sweep, a controller superseding a
   mixin). A *cut* component instead ships a tombstone naming its alternative
   at cut time; if the alternative is a planned arc component (4.8's
   `arc-tour`), the tombstone names it as forthcoming and is updated when it
   lands.
2. **"Zero importers" is verified against the package export maps, not a
   `src/` grep.** The `cssVariables` near-miss (all three review architects
   proposed deleting the token source of truth on the strength of a
   cross-file grep) and the two already-broken subpaths are the standing
   proof.
3. **Every test cut names its mutation pair — a `--source` file and a
   `--tests` file — and runs `pnpm mutate` on that pair before and after; an
   unchanged kill-rate is the merge condition.** `scripts/mutate.js` takes
   exactly one source and one test file, so "the affected source" must be
   named per cut, not assumed. LOC is not a referee.
4. **Every commit lands with the suite green** — `pnpm test` (0 failing;
   latest logged run: **3,994 passing**), `pnpm check` (**all 20** — 19 plus
   `scope-coverage`), `pnpm generate` diff-clean. A red suite means something
   now; keep it that way.
5. **`pnpm generate` diff-clean is a check, not a claim.** It was asserted in
   HANDOFF for weeks while ~150 wrapper files sat unregenerated. Run it; do not
   cite it.

---

## Phase 0 — Land the in-flight work

Strictly a landing operation — no new authored behavior. The working tree
holds the declaration layer, findings #48–#71 fixes, and four new checks, all
uncommitted. The only *new* files under `packages/web-components/src` are the
three shared modules in 0.1; everything else is modification of long-committed
code. Land in reviewable slices, each independently green.

- [x] **0.1 (M)** The spine — `props.js`, `subscriptions.js`,
      `dismiss-controller.js`, `helpers.js`, `props.test.js`,
      `dismiss-controller.test.js`. **Landed without the `click-outside.js`
      deletion** (see below).
- [x] **0.2 + 0.3 + 0.4 (L)** **Landed as one commit, because they are not
      separable.** The migration (171 components, 347 props), the findings
      #53–#79 source fixes, both derived suites, the four new checks, the
      generate pipeline (`prism-props.js`, `codemod-declared-props.js`,
      `doc-claims`, `manifest.js`) and the generated output.
- [x] **0.5 (M)** The behavioural suites, `mutate.js` / `mutate-sample.js` /
      `test-run.sh`, the runner configs, the ledgers, `package.json`,
      `pnpm-lock.yaml` and the CI mutation job.
- [x] **0.6 (S)** Housekeeping: 430 `.svelte-kit` artifacts untracked and
      ignored; the two dead export subpaths and the orphan
      `types/shared/click-outside.d.ts` removed; `packages/html` `files` **and**
      `./examples/*` both fixed; the stale `brand/` line deleted.
- [x] **0.7 (S)** `scripts/checks/export-map.js` — 680 targets across 8
      published packages. Verified by reintroducing both original defects.
      Skips build outputs when a package is unbuilt: the first draft reported
      2,332 failures because the wrapper packages export `./dist/...`, which
      does not exist in a source checkout.

### What the slicing got wrong, and why it matters for the next phase

**The plan's 0.1 → 0.2 → 0.3 → 0.4 order does not execute.** Four dependencies
were only visible by trying it, each caught by running the suite at that
commit rather than by reading:

1. **0.1's `click-outside.js` deletion breaks that commit** — 17 components at
   HEAD still imported it. It can only be deleted by the migration that stops
   them.
2. **`conformance.test.js` cannot precede the migration.** It asserts
   `ADOPTED.length > 0` (`:76`), and with unmigrated components it derives
   nothing and fails its own anti-vacuity guard.
3. **`conformance-surface.test.js` cannot either.** It derives from
   `custom-elements.json`, and the part/slot documentation it checks is fixed
   *by* the migration — at HEAD, `arc-tree-view` renders a `part="tree"` the
   HEAD manifest does not document.
4. **`generate.js` invokes the four 0.4 checks**, so the generate pipeline does
   not run without them — and those checks in turn report on defects the
   migration fixes, so they cannot land first either.

`helpers.js` also had to move from 0.2 into 0.1, because `props.test.js`
imports `settle()` and HEAD's `helpers.js` has no such export.

The general lesson, and the one to carry into Phase 4: **a slice plan written
from a file list is a guess about the dependency graph.** Every one of these
was found in seconds by checking out the slice and running the suite, and none
of them was visible in the diff. Phase 4's workstreams are ordered by the same
kind of reasoning — verify each boundary by building it, not by reading it.

**Gate: MET (2026-08-13).** Landed on `v4-phase-0` in five commits, each
verified green at that commit: 806 → 907 → 2,431 → 3,994 passing, 0 failing
throughout. `pnpm check` 21/21, `pnpm generate` diff-clean and idempotent.
The branch tip differs from the pre-landing snapshot only by the six files of
new 0.6/0.7 work, so nothing was dropped across the slices.

---

## Phase 1 — Decide the catalog on paper (`V4-SCOPE.md`)

Half a day, no code. Every entry gets one keep/cut sentence — the
`prism.config.js` interactivity block is the house style for what that looks
like. **Additions are ratified here too**: every 4.8 candidate gets an
intake-bar block in V4-SCOPE.md, so catalog decisions in both directions pass
through the same gate.

- [x] **1.1 The merge list (13 tags)** — **ratified in `V4-SCOPE.md` §3**
      (2026-08-13), each row specified with its survivor and what absorbs the
      difference. Three things surfaced while writing it:
      - **The table family is the only expensive merge.** `arc-table` and
        `arc-data-table` must give up their column models for the object
        array — breaking for anyone on the slot-based form. The other twelve
        are aliases and docs.
      - **The dialog rows collided.** "dialog+confirm consolidated" plus
        "`arc-modal` → `arc-dialog`" silently reuse a live tag name for a
        different component: today's `arc-dialog` is a *confirm prompt*
        wrapping `arc-modal`, so a consumer would upgrade into a bare overlay
        that ignores `heading`/`message`/`confirmLabel` and renders blank.
        Resolved in §3.3 (modal→dialog as the primitive, today's dialog→
        confirm), **with a required dev-mode error** on the reused name.
      - **`callout→alert` — role follows severity, RATIFIED** (§3.2).
        `arc-alert` already implements the policy (`alert.js:120`), so this is
        mostly ratification — **except that `info` must become non-live**.
        Alert maps `info` to `role="status"` today; callout's default variant
        is `info` and it is a static `role="note"` box, so a naive merge would
        turn every informational callout on every page into an announcement.
        That makes it a documented behaviour change for **existing alert
        users**, not only for callout adopters. A `live` prop
        (`auto|off|polite|assertive`) is the escape hatch, because severity
        answers "how bad is this" while a live region asks "did this just
        appear" — which no prop can infer.

      Original list, for reference:
      otp-input→pin-input · separator→divider · badge→tag · cluster→stack ·
      key-value+kv-pair→description-list+description-item ·
      table+data-table→data-grid (one column model: the object array) ·
      snackbar+progress-toast→toast (`placement`/`progress` props) ·
      callout→alert (decide the role-per-variant policy first — this is an
      ARIA merge, not a visual one) · inline-message→the per-control error
      surface · dialog+confirm consolidated (executed in 4.4 on `<dialog>`,
      decided here).
- [x] **1.2 The cut/satellite list — SUPERSEDED by `V4-SCOPE.md` §1.**
      The cluster-level question was answered structurally: the catalog gains a
      **domain grouping axis** (subpath tiers in one package — `/marketing`,
      `/media`, absent from the barrel), and with it **the deletion list drops
      from ~25 tags to 5**. Resolved 2026-08-13:
      - Delete (broken-as-stable, verified): `guided-tour`, `spotlight`,
        `speed-dial`, `dock`. Plus `event-calendar` (no time-of-day). **Five.**
      - `keyboard-map` — **kept**, it pairs with `arc-hotkey` and 4.8's
        `arc-shortcut-help` as a three-part keyboard family (V4-SCOPE §2.6).
      - `qr-code` — **kept**, with its static `qrcode-generator` import made
        lazy and the dependency moved to `optionalDependencies`; it gets its
        first test in the same change (V4-SCOPE §2.5).
      - Devtool tail — **the category is retired.** `json-tree`, `diff`,
        `terminal` are app components for technical products and stay core
        (V4-SCOPE §1.3).
      - Marketing cluster (12 tags) → **`/marketing` subpath**, published,
        out of the barrel.
      - DAW tail (`waveform`, `knob`, `level-meter`, `shared/time-scale.js`) →
        **`/media` subpath**, published normally. The `time-scale` move is a
        documented breaking change.
- [x] **1.3 Open product questions — ANSWERED in `V4-SCOPE.md` §2**
      (2026-08-13):
      - **The DAW downstream is real** → `/media`, published normally, out of
        the barrel. `shared/time-scale` moves with it (breaking, documented).
      - **Chat is on-product** → `conversation` + `message` stay core, and
        `arc-prompt-input` is ratified into 4.8.
      - **`arc-modal` → `arc-dialog`: yes**, executed in 4.4 with a
        `@deprecated` alias for one major.
      - **Marketing cluster: neither satellite nor delete** → `/marketing`
        subpath. Answering this is what produced the structural decision in
        1.2 — the cluster questions were unanswerable because the catalog had
        no way to say "for a different kind of product".
- [x] **1.4 The keep-and-freeze list — RATIFIED in `V4-SCOPE.md` §7.**
      Counts verified against the tree: the event contract is **186/186**
      `bubbles`+`composed` with zero exceptions, and the vocabulary is at 171
      components / 347 declared props. Frozen means not open for redesign
      during v4 — a change needs its own argument rather than riding along
      with a workstream. Original list: the event contract (186/186
      `bubbles`+`composed`, `arc-*`, `detail.value` first), the props
      vocabulary, the select family, meter/gauge/progress family,
      kanban/chart/data-grid, `packages/html`, the docs prose architecture,
      the sub-component docs pattern.
- [x] **1.5 Additions — RATIFIED in `V4-SCOPE.md` §5**, each with an
      intake-bar block. **Chip collision resolved:** `arc-filter-chip`
      composes `arc-tag[removable]`. `arc-tag` and `arc-chip` turned out not
      to be duplicates — tag is a label (`removable` → `arc-remove`), chip is
      a toggle (`selected` → `arc-change {value, selected}`) — and a filter
      token is the label plus a click action, not the toggle. Original item: (each with an intake-bar block):
      `arc-tree-grid`, `arc-filter-bar` + `arc-filter-chip` (**resolve the
      chip-family collision here**: post-merge the catalog holds
      `arc-tag[removable]` and `arc-chip`; filter-chip must compose `arc-tag`
      the way `arc-chip` does, or be a `arc-tag` variant — three unrelated
      chip implementations is the tail regrowing), `arc-tour`,
      `arc-shortcut-help`, `arc-field-list` (tier 2), `arc-prompt-input`
      (chat-gated). Backlog acknowledged but not ratified:
      `arc-datetime-picker`, `arc-query-builder` (satellite/lab candidate).
      **The intake bar:** every addition must (1) fit the product sentence,
      (2) do the hard 20% of its domain or not ship, (3) be born on the
      contract layer — vocabulary declarations, shared controllers, derived
      conformance on day one, `status: experimental` until proven, (4) touch
      component + test + docs page and nothing else.
- [x] **1.6 Named non-goals — RATIFIED in `V4-SCOPE.md` §6**, each with a
      named alternative. **QR is withdrawn as a non-goal** — it was one only
      because `arc-qr-code` was being deleted, and §2.5 keeps it with the
      dependency made lazy and optional. Original item: (so they can't accrete back):
      rich-text editor, PDF/file preview, dockable panel layouts, pivot
      tables, real scheduling calendar (integration recipe instead), QR
      (name the ESM library in MIGRATION.md), intl phone / credit-card
      inputs, mobile swipe/pull gestures.

**Gate (mechanical): the tag half is LIVE.**
`scripts/checks/scope-coverage.js` (kept for the v4 cycle, delete it with
V4-SCOPE.md) asserts every tagName in `custom-elements.json` has **exactly
one** verdict row in V4-SCOPE.md §4 — not "at least one", because merge
survivors are cross-referenced from their merge rows and a substring count
reports 21 false duplicates. It runs in `pnpm check` (now 20) and currently
reports:

> all 207 tags have a verdict — 173 keep, 13 merge, 5 delete, 1 rename,
> 12 /marketing, 3 /media

**Still open:** the intake-bar half (every ratified addition has a block) is
not yet mechanized, because 1.5 is not finished. The arithmetic line at the top
of this file is restated in V4-SCOPE §1.4 with the revised numbers —
**the deletion list is 5 tags, not ~25**; the rest was a grouping problem.

---

## Phase 2 — Finish the test work (survivors only)

- [x] **2.0 (S)** Wire the mutation referee **first**, everything else in
      this phase depends on it: `pnpm mutate:props --gate 90` into the CI
      verify job. Then re-baseline the library-wide score **in
      `scripts/mutate.js`'s own units** — its header says outright that its
      scores are not comparable to the Stryker-era 61.45%→67.52% readings in
      the ledgers, so no percentage target is named until the re-baseline
      exists. The library gate is defined as a **sampled set**: an explicit
      list of `--source`/`--tests` pairs (the merged grid, the select family
      spine, form-control-mixin, dismiss-controller, and each 2.6 trim
      target), each gated at the re-baselined threshold.
      **Done 2026-08-13** — `scripts/mutate-sample.js` + `pnpm mutate:sample`,
      wired as its **own CI job** (mutate.js rewrites source in place, so it
      must not share a working tree with the generate-diff step or the suite).
      Eight pairs baselined and gated as ratchets: props 91.18% (≥90),
      form-control-mixin 100%, menu-keyboard 100%, scroll-lock 100%,
      dismiss-controller 92%, focus-trap 87.5%, overlay-mixin 83.33%,
      subscriptions 83.33%. `listbox-controller` and `position-controller` are
      in the set but **not yet baselined** — the two large ones; they are
      skipped explicitly in CI rather than passing silently at `gate: null`,
      and are the obvious next pass. The merged-grid pair is post-Phase-1 and
      the 2.6 trim targets are post-Phase-1 by definition. Readings and the
      equivalent-mutant analysis are in test-findings.md.
- [x] **2.1 (L)** Close the findings ledger. Every unfixed finding in
      `test-findings.md`'s triage tables: **fix it** if the component survives
      Phase 1, **close as resolved-by-removal** if it doesn't. Each fix flips
      its `it('BUG: …')` pin into a regression test — converted or moved to
      issues, never just deleted.

      **DONE 2026-08-15, in twelve commits.** Every finding in the file carries
      a disposition in its own heading; there is none whose status is "not
      looked at". Pins went **47 → 9**, and all nine are pinned by decision:
      six on `arc-speed-dial`/`arc-guided-tour`, which 4.1 deletes — kept until
      then, because ground rule 1 says a pin removed ahead of the deletion
      leaves the component unguarded in between — plus #74 and #86.

      Suite **4,108 → 4,436 passing, 0 failing**; `pnpm check` 22/22 and
      `pnpm generate` diff-clean at every commit; `pnpm mutate:sample` green,
      with `subscriptions` ratcheting 83.33% → 87.50% on the way.

      Four findings were opened *by* the closing pass and closed with it: **#87**
      (four more empty ARIA attributes, found by generalising #24/#25/#36),
      **#88** (the light-DOM-child reactivity gap behind #4, #6 and #32, now
      `notifyOwner()`), **#89** (both resize handles reported the axis they
      resize rather than the axis they are), and #53's rediscovery — filed as a
      new finding before a search of the ledger turned up the original.

      **Five things the pass taught, in the order they cost the most:**

      1. **Findings under-count their own population.** #6 was filed against one
         consumer and had all four. #24/#25/#36 were filed as five bindings and
         were nine. #53 was already in the ledger when it was found again. Before
         closing one, ask what the population is and *derive* the answer.
      2. **Fix the root, not the finding.** arc-rating's six dissolved into one
         decision about what `value = 0` means. #78's two disagreeing guards were
         fixed by bounding the value they both read — editing either would have
         left the pair free to drift again.
      3. **Removing a wrong thing can leave a gap it was standing in front of.**
         `aria-grabbed` was dead, and it was also the only ARIA state
         `arc-sortable-list` rows carried; deleting it left the whole keyboard
         reorder protocol silent. Check what a defect was doing before deleting
         it.
      4. **A component cited as the reference has to be checked, not copied.**
         `arc-resizable` is named three times in the ledger as the working
         example; building `arc-split-pane`'s divider against it surfaced #89 in
         the reference itself.
      5. **A static check and a runtime sweep catch different halves.**
         `empty-attributes.js` reads source, states its blind spots, and fails
         before the 35s prism step; the new `conformance-surface` sweep sees what
         reached the DOM. Neither found all nine alone. Its BASELINE is empty and
         the rule is strict now.

      Two traps worth carrying out of the pass: the manifest analyzer binds a
      JSDoc block to **whatever declaration follows it**, so a shared helper
      inserted between an element's doc comment and its class silently un-tags
      the element (`ArcOption` lost its `tagName` and the React wrapper stopped
      compiling). And `event-conventions.js` balances quotes across
      `new CustomEvent(...)` argument text **without skipping comments**, so one
      apostrophe in a comment inside the arguments makes every later dispatch in
      the file invisible to it — comment-skipping belongs in **4.10**'s shared
      scanner, not in a rule.

- [x] **2.2 (M)** Finish vocabulary adoption on survivors. **This item creates
      the `list()` array primitive** in `shared/props.js` and teaches
      `scripts/prism-props.js` about it in the same PR (HANDOFF trap #1: a
      helper prism can't read silently drops the prop from all six wrappers).
      The 6 hand-rolled JSON.parse converters in `navigation/` and
      `comparison.js`'s JSON-as-String props migrate onto it here; the
      *sitewide* dialect migration of the remaining array props is 4.3.

      **DONE 2026-08-15, in two commits.** Suite **4,455 → 4,492 passing**,
      `pnpm check` 22/22, `pnpm generate` diff-clean, `props.js` mutation pair
      **91.18% → 91.78%** (67/73, gate ≥90) — all five of `list()`'s mutants
      die.

      **`list()` landed with all four scripts taught in the same commit** —
      prism-props, inert-declarations, manifest — and the wrapper half verified
      by reading `items` back out of all six generated `BottomNav` files rather
      than by trusting the hook. It settles three things the four dialects each
      got wrong: a malformed attribute **falls back rather than throwing**
      (which is why this could not be "just use `type: Array`" — Lit's converter
      throws inside `attributeChangedCallback`, where nothing at the call site
      can catch it); a **removed** attribute returns to the declared default
      (all six hand-rolled converters returned `null`, because
      `JSON.parse(null)` coerces to the string `"null"` and parses fine); and
      the default is a **factory**, so two elements cannot share one mutable
      array.

      `conformance.test.js` needed two changes for it, both stated at the site:
      the default assertion is deep rather than strict — a factory default
      returns a fresh array per call, so strict would fail every list prop for
      the reason the factory exists — and `normalizeValue` passes a valid array
      through **by identity**, which the suite's fixed-point check depends on.

      **The adoption half was a survey, not a sweep.** 27 components had a
      `static properties` block and no vocabulary; **ten props** across five of
      them carried a real constraint, and the rest are free-form strings where a
      declaration enforces nothing. Same ratio as the earlier uncovered-sweep
      (31 components, 7 constraints), and the same lesson: adopting on principle
      is ceremony.

      **`boolean-defaults.js` is rewritten to the end-state finding #20 wrote
      down** while the vocabulary was still a proposal — assert that *every*
      boolean prop is declared through `flag()`, and name the only two reasons
      one may not be. Its BASELINE is **gone rather than emptied**. Exemptions
      carry a `// NOT flag(): <reason>` comment in the source rather than being
      inferred from a shape, because a check that guesses at intent is one a
      component can satisfy by accident. Verified by fault injection.

      Two things worth carrying:

      1. **The rewrite found a defect the old rule could not see.**
         `arc-clock.hour12` is a documented tri-state — 12-hour / 24-hour /
         *let the locale decide* — and `flag()` collapses a non-boolean onto its
         default, which would have deleted the third state. A rule that asks
         "is this declared correctly?" finds things a rule that asks "is this
         one known bad shape?" cannot.
      2. **Two props were surveyed and deliberately not adopted**, both nullable
         sentinels the vocabulary cannot express (`activity-heatmap.max`,
         `arc-clock.hour12`). Two instances is the same bar `oneOf`'s numeric
         members cleared, so a `nullable` option is a **candidate for 2.3**
         rather than speculation now. `arc-aspect-ratio.ratio` is the third of
         these — a *pattern*, normalised by hand in 2.1 — which makes three
         distinct gaps for 2.3's survey to weigh together.

      **Breaking changes recorded in MIGRATION.md as they landed**, not left for
      4.11 to discover: `arc-comparison`'s `features`/`values` take real arrays
      on the property path (markup unchanged), and the six navigation props
      return their default rather than `null` when the attribute is removed.

- [x] **2.3 (M)** Finish the prose-constraint survey: ~70 remaining `@prop`
      prose constraints. Survey first (the uncovered-sweep discipline), adopt
      only real constraints; grep for the recurring shape — a constraint
      enforced on the interaction, render, or stylesheet instead of the state
      (#1, #14, #47, #58, #59, #61, #70).

      **DONE 2026-08-15.** Suite **4,492 → 4,607 passing**, `pnpm check` 22/22,
      `pnpm generate` diff-clean, `props.js` mutation pair **91.78% → 92.94%**
      (79/85, gate ≥90).

      The survey: 844 `@prop` lines, 125 stating a constraint, **95 numeric
      props still on raw `{ type: Number }`**. Rather than adopt all 95 on
      principle, I searched for the shape this item names and found **47**.
      Both surveys now report **zero** — there is no numeric prop left in the
      library whose contract is enforced somewhere other than where the value
      is held. The scripts are in the session scratchpad; they are three
      screenfuls and worth rewriting rather than keeping.

      **The item's real finding was one it did not anticipate: `nullable`.**
      Fourteen props were stuck on raw declarations for the same reason — their
      *unset* state is a **third meaning**, not a synonym for the default.
      `arc-gauge`/`arc-meter` `low`/`high`/`optimum` derive their zones from the
      range when unset; `arc-number-input` `min`/`max` mean unbounded;
      `arc-waveform.duration` and `arc-level-meter.peak` mean nothing to show;
      `arc-activity-heatmap.max` means quartile mapping rather than a linear
      scale; `arc-number-format.decimals` means a per-format default; and
      `arc-clock.hour12` means *let the viewer's locale decide*. The vocabulary
      would have collapsed every one onto its declared default — making every
      clock 24-hour and every gauge draw zones nobody asked for.

      `nullable` is kind-agnostic and sits ahead of every branch in
      `normalizeValue`, because what it expresses is not about numbers or
      booleans. Fourteen instances, well past the bar `oneOf`'s numeric members
      cleared. **It also retires `boolean-defaults.js`'s second exemption** —
      `clock.hour12` is declared now, so that check is back to one.

      **The other two gaps 2.2 flagged did *not* earn a term**, and saying so is
      part of the deliverable:

      - A string **pattern** (`arc-aspect-ratio.ratio`) is still one instance.
        Normalised by hand in 2.1, with the reasoning at the call site. Invent
        `pattern()` when a second prop wants it.
      - **0-as-sentinel** (`maxTags`, `maxlength`, `maxSize`, `separator`,
        `aspect`, `segments`, `duration`) needs nothing: 0 is inside
        `min: 0`, so the existing vocabulary already says it.

      **One real defect surfaced by declaring rather than by reading.**
      `arc-number-format.decimals` had no upper bound, and `Intl.NumberFormat`
      throws a `RangeError` above 20 — from a getter the render calls, so
      `<arc-number-format decimals="30">` took the component down. The ceiling
      belonged to a library the component happens to call, and nothing checked
      it. The conformance probe found it by assigning 9999.

      And the bounds pass is **the other half of finding #70**: that item fixed
      `value` on `arc-meter` and `arc-gauge` and left `min`/`max` behind, so
      `<arc-meter min="abc">` still rendered `aria-valuemin="NaN"`. Worth
      remembering as a shape — fixing the obvious prop of a pair and leaving its
      siblings is how a finding half-closes.

- [x] **2.4a (L)** **Wrapper runtime harness** — its own workstream, not a
      bullet: nothing in the repo mounts a wrapper and no framework test
      toolchain exists anywhere in the monorepo (no vitest/jest/karma/
      testing-library in any package.json), so this is six harnesses + CI
      wiring, then ~300 LOC of test bodies per framework. Four representative
      components each: `top-bar` (named slots), `time-picker` (two-way
      binding), `activity-heatmap` (array props), `card` (default slot) —
      asserting prop reached the element, event fired, binding wrote back,
      slot content landed. **Blocks 3.1 and every 4.6 decision.** Catches the
      live Angular bug and answers the Preact/Solid undefined-clobber
      question on day one.
      **Done 2026-08-13** — but not in the shape costed above. Six framework
      test toolchains were rejected for one harness
      (`scripts/wrapper-runtime.js`) that packs the real tarballs, builds a
      scratch consumer per framework with that framework's own toolchain, and
      runs **one shared probe set** (`test/wrapper-runtime/contract.js`)
      against all six in a real browser. Six hand-written suites drift, and a
      matrix whose rows assert different things cannot be read as a matrix.
      15 probes × 6 packages: 81 green, 9 pinned across findings #80–#82.
      The undefined-clobber question is answered **no** — Preact and Solid both
      keep the element's default for an unpassed prop, as do Vue and Svelte.
      Four findings, of which two rewrite items elsewhere in this plan:
      **#80** `@arclux/arc-ui-angular` registers **no custom elements at all** —
      the `import { ArcCard }` in all 207 wrappers is type-only and TypeScript
      elides it, so an Angular consumer gets `HTMLUnknownElement` and the
      documented docs example produces an inert page. Bigger than the slot bug
      and previously unrecorded.
      **#81/#82** the projection bug is **not Angular-only** — Solid's emitter
      has the identical rule and the identical gap in the identical 10
      components (see the 3.1 corrections below).
      **#83** 18 published subpaths in `vue` and `solid` resolved to files no
      build produced (every tier barrel plus `./CodeBlock`); fixed by deriving
      build entries from each package's own `exports` map.
      **#84** a Phase 0 regression the harness caught before push: the
      declared-props migration stripped `type` from 84 manifest entries and
      `reflects` from 359, which broke the Angular package's build. See
      test-findings.md §80–84.
- [x] **2.4b (M)** **FormData sweep**: `form-contract.test.js` never calls
      `new FormData`; fix the mislabeled :102-109, sweep all 26
      `FormControlMixin` controls, subsume the 12 ad-hoc per-component
      FormData blocks. Keep :71-82 until `name` declaration is actually
      centralized (it is hand-declared in 20+ files — the "declared once in
      the mixin" premise is false).
      **Done 2026-08-13** — `form-data-sweep.test.js`, 68 tests, no findings.
      Subjects derived from the `formAssociated` member in
      `custom-elements.json` (not a hand list); :102-109 now reads FormData and
      gained its `disabled` counterpart; :71-82 kept. **The 12 ad-hoc blocks
      are deliberately left in place** — removing them is a cut under ground
      rule 3 and needs a named mutation pair each, measured before and after.
- [x] **2.4c (M)** **Direct suites for the widest-blast-radius shared
      modules**: `dismiss-controller`, `focus-trap`, `overlay-mixin`,
      `form-control-mixin`, `menu-keyboard`, `scroll-lock`. Today 6 of 27
      shared modules have a direct suite — and **none of them is one of
      these six** (the tested six are props, position-controller,
      listbox-controller, editing-target, anchor-adoption, time-scale).
      House rule: anything this many components depend on gets its own suite.
      **Done 2026-08-13** — 113 tests, four findings. #72/#73/#75 (all three
      controllers in `src/shared/` lost their subscriptions on reparent, the
      same shape as #55/#64) fixed; **#74 pinned not fixed** —
      `<fieldset disabled>` is a one-way door for all 27 form controls, and
      every candidate fix changes the `disabled` contract across ~30
      stylesheets. See test-findings.md §72–75.
- [x] **2.4d (M)** **Central dismissal contract** (Escape is asserted in ~20
      files, centrally in zero) — derive subjects from components declaring
      `open`; same pass converts `open-parity-sweep`'s hand `CASES` list to
      derived subjects (flagged "at risk" in HANDOFF's own table).
      **Done 2026-08-13** — `dismissal-contract.test.js`, 24 subjects derived
      from the manifest, 114 new tests, two findings. The expectations are
      derived too: each component's *documented* claims become its assertions
      (`@prop open` saying "closes on Escape" **is** the test), with a hand
      `POLICY` table for what the docs omit whose **completeness** is
      guard-enforced — a new `open`-declaring component fails until someone
      states whether it is dismissible.
      **#85** an empty `arc-context-menu` cannot be dismissed by the keyboard —
      an arrow-key guard (`if (selectable.length === 0) return`) swallows
      Escape. **#86 pinned** — `arc-guided-tour`, `arc-notification-panel` and
      `arc-speed-dial` have no keydown handling at all; deliberately left for
      4.4 to fix by adopting `OverlayMixin` rather than hand-rolling three more
      listeners.
      **`open-parity-sweep` went from 5 cases to 10** with the same
      derived-coverage guard; the five additions (dropdown-menu, popover,
      hotspot, notification-panel, speed-dial) all pass, so #59's shape has not
      spread — a measured negative, not an assumption. The other 14 are exempt
      with a stated reason each.
      **The lesson worth carrying into 4.4:** 15 of the 26 initial failures
      were the *probe*, not the library. A central sweep replaces per-component
      gestures with one gesture, and Escape has an origin (the focused node,
      not `document`) while "outside" is two different geometries (document
      pointerdown vs. backdrop click, derived from whether the component renders
      a backdrop). See test-findings.md §85–86.
- [x] **2.4e (S)** Document the conditional-skip sites: 3 constructs
      (`conformance.test.js:161` derived-props, `icon-aliases.test.js:21` and
      `sanitize-svg.test.js:10-11` gated on generated icon modules) expand to
      the runtime skip count. None is a parked TODO; the deliverable is a
      paragraph in test-findings.md saying why each is correct, not
      re-enablement.
      **Done 2026-08-13.** The arithmetic: only `conformance.test.js:161`
      skips anything in a normal run, and it skips exactly 2 — one per derived
      prop (`arc-sticky.stuck`, `arc-top-bar.scrolled`). The two icon gates
      skip **zero**, because the `pretest` hook regenerates the modules; they
      exist for a fresh checkout run without it, where the alternative is a
      wall of `ERR_MODULE_NOT_FOUND` that reads as a broken suite.
- [x] **2.5 (M–L)** The library mutation climb, against the 2.0 re-baseline,
      on the sampled-set pairs — using the fixture rules already in HANDOFF
      (observable arithmetic, both ternary branches, non-default `min`).
      Sized honestly: the old 67.52% reading is not the yardstick.

      **DONE 2026-08-15.** The two pairs 2.0 left ungated:
      `listbox-controller` **50.00% → 98.68%** and `position-controller`
      **52.83% → 88.46%**, both now ratcheted and no longer skipped in CI.
      Every remaining survivor is analysed as equivalent in test-findings.md —
      one in listbox, six in position — which is the form the result should
      take, per 1.5's note that a score is worth less than "no non-equivalent
      survivors".

      **The two modules failed for opposite reasons, and that is the lesson.**

      `listbox-controller` had a *blind spot the architecture creates*: fifteen
      of its 39 survivors were `return true`/`return false` inside
      `handleKeydown`, because every consumer is `if (handleKeydown(e)) return;`
      followed by its own switch — so a component behaves correctly even when
      the controller wrongly declines a key, and no assertion made through
      `arc-select` can tell the two apart. The contract the whole shared-spine
      design rests on was the one thing only a direct test could see. A
      stand-in host fixed it and reached the states a rendered select never
      sits in: zero options, a shrinking option set, and the three option
      combinations no consumer sets.

      `position-controller` had *two tests that were wrong in a way that reads
      as thorough*. The scroll test anchored to a `position: fixed` element and
      asserted the panel had **not** moved — equally true of a controller with
      no listener at all. The re-observe test asserted a coordinate that is the
      same before and after the resize it was testing. Both are HANDOFF's "a
      comparison is only evidence if both sides were exercised the same way",
      one step on: **a measurement is only evidence if the thing measured can
      differ.** Worth a sweep of the suite for assertions whose expected value
      does not depend on the code under test.

      **A new harness trap, recorded in HANDOFF:** `ResizeObserver.observe()`
      schedules an initial delivery for every element, and it lands *after* a
      synchronous test body. A test that observes, perturbs and polls gets its
      `_update()` either way — so a missing re-observation is invisible.
      `await observed()` between setup and perturbation is what makes it show.

      **Two source changes fell out**, both of the "one guard written twice"
      shape: `_step`'s non-wrapping clamp was dead (`_seek` already refuses an
      out-of-range index when `wrap` is false), and the window listener options
      are now module constants so `addEventListener` and `removeEventListener`
      cannot drift — a remove keyed on a different `capture` flag removes
      nothing and says nothing. Also deleted `selectOnClose`, a `@param` for a
      feature with no implementation and no consumer.
- [x] **2.6 (M)** The earned trims — only cuts that survived adversarial
      verification, each with its named mutation pair (ground rule 3):
      - `disabled-open-sweep.test.js:74-87` only (**keep :88-119** — the
        setter-refusal test at :88-105 asserts `isUpdatePending === false`,
        which no declaration derives, and :106-119 is its anti-vacuity pair).
        Pair: `shared/props.js` ↔ `props.test.js` + the sweep.
      - Shrink `reconnect-sweep.test.js` to the behavioural anchors + the
        `arc-scroll-indicator` control (lifecycle-pairing.js is now the
        authoritative detector). Pair: `shared/subscriptions.js` ↔
        `reconnect-sweep.test.js`.
      - Dedupe `input-commit-contract.test.js:31-39`'s local
        `record()`/`only()` (diverged copies of helpers.js exports). Pair:
        n/a (pure harness dedupe; suite-green suffices).
      - Re-express the ~180 private-field assertions against public surface
        (`_focusRow` → `[tabindex="0"]` + `shadowRoot.activeElement`;
        `_rafId` → the observable class flip; `_listbox.activeIndex` →
        `aria-activedescendant`). Pair: each component's source ↔ its own
        test file.

      **DONE 2026-08-15.** All four, and the fourth found a live bug.

      **The first trim's stated justification was wrong, and that is worth more
      than the trim.** The plan said `conformance.test.js` derives the
      property-path case from `blockedBy`. It does not — it checks that
      `blockedBy` names a real property, which is declaration validity, not
      mechanism. The real replacement is `props.test.js`'s own `blockedBy`
      block, which covers refusal-while-blocked, the attribute path, reversion
      when the blocker turns on afterwards, and the allowed-default case. The
      cut still stands, on the correct grounds, and the file header now records
      both. A trim justified by coverage that turns out not to exist is exactly
      what ground rule 1 is for; the only reason it was caught is that the rule
      says to go and look.

      **The `reconnect-sweep` shrink was 3 of its 9 tests** — the ResizeObserver
      call-count tests for truncate, code-block and image-cropper. Their job was
      catching a component that subscribes from `firstUpdated`, from a
      hand-written list of the four known cases, which is precisely how finding
      #64 got past them nine components later. `lifecycle-pairing.js` reads
      every component and needs no list. What stays is behavioural, because that
      is what pins the *controllers* a static check cannot see into.

      **The private-field pass covered ~150 assertions across 15 files** and is
      the item that paid. Re-expressing arc-data-grid's `_rafId` as the class
      its frame writes killed a mutant the old assertion could not: `_rafId` is
      set *before* the rAF body runs, so `expect(el._rafId).to.not.equal(null)`
      passes against a callback whose first line is `if (wrapper) return;`. The
      mutation harness had that exact inversion live in the working tree when
      the rewritten test failed against it. A private field asserted at the
      wrong moment is not a weaker test — it is a test of something else.

      Four assertions stay private, each saying why in place: the interval
      handle in `clock.test.js` (the observable version needs two 1s waits, past
      Mocha's timeout), the subscription flag in `overlay-adoption.test.js` (a
      listener firing on a closed panel does nothing anyone can see), the
      position map in `menubar.test.js` (a leak), and `_formValue()` in
      `form-data-sweep.test.js` (an unnamed control is not submitted at all).
      All four are claims about a **resource** rather than a behaviour, which is
      the test for when the exception applies. The rule and its exceptions are
      in HANDOFF.

**Gate:** findings ledger empty (fixed or closed-by-removal); vocabulary at
100% of survivors (achievable — `list()` landed in 2.2); `props.js` mutation
gate ≥90 enforced in CI and the sampled-set library gate enforced at the
re-baselined threshold; wrapper runtime tests green against the **current**
six packages.

---

## Phase 3 — Releases that don't wait for v4

- [x] **3.1 (M) → ships as v3.3.0, not a patch — gated on 2.4a's Angular
      runtime test being green first.** Prism emits `<ng-content />` whenever
      the component renders **any** `<slot>` — fixes the 10 wrappers that
      silently drop all projected content (`top-bar`, `input`,
      `masked-input`, `empty-state`, `feature-card`, `image-compare`,
      `value-card`, `split-pane`, `command-bar`, `speed-dial`). It is a minor
      because previously-swallowed content will now render — a behavior
      change in consumer apps, and today no test tooling exists that could
      prove the fix. Fix `scripts/checks/wrapper-slots.js` with the
      Angular-specific rule "any declared slot ⇒ template contains
      `<ng-content>`" — **not** `namedSlotOutlets: true` (which would fail
      the correct fix and false-pass on loose name matching), and not
      deletion. Applies to the v3 catalog regardless of Phase 1 verdicts —
      the fix is one prism rule, so per-component cost is zero.
      **Ungated as of 2026-08-13: 2.4a exists and the Angular row is red and
      pinned.** Three corrections it forces:
      (a) **The rule is right.** A bare `<ng-content />` is sufficient for
      named slots too — Angular's job is to put the children in the host's
      light DOM with their `slot` attributes intact, and assignment is the
      custom element's job. Confirmed against `arc-card`, which already emits
      one and places both its default and `footer` children correctly.
      (b) **It is two emitters, not one.** Solid has the identical defect in
      the identical 10 components (#82). An Angular-only fix leaves half of it
      shipped.
      (c) **`arc-virtual-list` is not one of the 10.** Its slots are dynamic
      (`item-${index}`) and React's wrapper is hand-written around a
      `renderItem` API; a catch-all outlet is the wrong fix there and it needs
      its own decision.
      **And 3.1 is no longer the biggest Angular bug** — #80 is. A consumer
      who applies 3.1 alone still gets an inert page, because the package
      registers no custom elements at all. Ship them together or #80 first.
      **Done 2026-08-13, shipped together with #80 as one prism release.**
      `@arclux/prism` 2.13.0 carries all three emitter fixes and the wrappers
      here are regenerated from it: 235 files across angular (205), react (10),
      preact (10) and solid (10). The harness that gated this item is now
      **6 packages × 15 probes, `PINNED` empty**. Each of (a), (b) and (c) above
      held up under the fix — one bare `<ng-content />` is sufficient for named
      slots, both emitters needed the change, and `arc-virtual-list` stayed out
      of the sweep (hand-authored per package; the Angular one took the #80
      import fix by hand). See test-findings.md §80–82.
      **Both release prerequisites are now met (verified 2026-08-15):**
      `@arclux/prism` 2.13.0 is published (registry latest), arc-ui's
      devDependency is `^2.13.0` and the lockfile resolves it, so
      `pnpm install --frozen-lockfile` works and
      `scripts/checks/prism-version.js` passes. That check exists because an
      older prism does not error — it silently reverts all 235 files.
- [x] **3.2 (S, after the 1.2 decision)** True patch fixes (v3.2.x), only in
      components 1.2 keeps: memoize `data/diff.js`'s LCS off the render path
      (caller-invisible) and add `data/json-tree.js`'s WeakSet cycle guard
      (~6 LOC; turns a first-paint stack overflow into rendered output). The
      diff **size guard** is *not* patch-safe — above-threshold inputs
      produce different output — so it ships with v4 (or v3.3.0) with the
      threshold documented as a public constant.

      **DONE 2026-08-15.** Both, plus the suite `arc-diff` never had.

      **`arc-diff` had no test file at all**, which is the first thing the item
      turned up: it is not a presentational primitive — it is an LCS
      implementation — and it was in the 38 components without a dedicated
      suite. Changing an untested algorithm's call pattern is not a patch, so
      `diff.test.js` landed first and pinned the output: which lines, in what
      order, with which of the two number series and which prefix, in both
      modes. Only then the memo, keyed on the `(original, revised)` pair rather
      than on a dirty flag — reverting `revised` to a value it held two renders
      ago has to be a miss, and that is the only reading that cannot go stale.

      **The suite's own fixtures had a blind spot the mutation pair found.**
      Every one of them either ended on a matching line or happened to agree
      whichever way the backtrack went, so none read the last column of the LCS
      table for a real decision — `j <= n` mutated to `j < n` survived all of
      them. A line deleted from the *end* of a file, which is about as ordinary
      as a diff gets, distinguishes them: without that column the component
      reports `-a +a` and never mentions the deleted line. Same rule as
      HANDOFF's "pick fixture values where the arithmetic is observable", one
      step subtler — these fixtures were not degenerate, they were unanimous.
      Pair now **100% (24/24)**.

      **The cycle guard is ancestor-scoped, and that distinction is the whole
      design.** "Have I seen this object anywhere in this render" is a
      different and wrong rule: two sibling keys pointing at one shared object
      is an ordinary shape, and marking the second circular would silently hide
      data. A WeakSet added and removed around the children gives exactly
      "is this value among its own ancestors". Both walks needed it —
      `_renderNode` and `_collectVisibleKeys` — and they have to agree, because
      the second decides which rows can hold the roving tabindex and a rendered
      row it does not know about cannot be focused.

      **One nuance worth stating, because "patch-safe" was the item's premise.**
      The crash only fires with the expansion depth unbounded (`expanded` as a
      bare attribute); at the default depth of one the recursion stopped before
      it ever recursed, which is why this survived so long. At a *finite* depth
      above one the old code did not crash — it rendered `self > self > self`
      five levels deep. So this changes output for cyclic input at finite
      depths as well as fixing the crash. That is still patch-safe in the sense
      that matters: nobody can depend on a cycle rendering as nested
      repetition, and the alternative at higher depths is no render at all.

---

## Phase 4 — The v4 release work

Order: **4.1 cuts → 4.2 merges → 4.3 dialect**, with 4.4 (platform) and 4.5
(style) starting once 4.1 lands and running in parallel with 4.3. Cuts run
before merges by this plan's own principle — never polish what the next step
deletes — and cutting first shrinks the tree every later workstream touches.

**Required before the v4.0.0 tag: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.11.**
Non-blocking, may trail into 4.x minors: 4.8 (ships `experimental`), 4.9,
4.10.

**Status (2026-08-17): every row the v4.0.0 tag requires is done** — 4.1
through 4.7, and 4.11 — **and prism 3.0.0 has shipped** (`PRISM-3.md` in full;
arc-ui regenerated on it in `7fc51b2b`, deleting the 784 lines of generator work
that existed only because prism could not do it). What remains before the tag is
Phase 5: the branch has never been pushed and CI has never run on any of its 67
commits, then the beta and its soak. 4.5's two
recorded non-goals — the docs site has never been measured against
`type-roles` or the extended `gradient-stops`, and the four per-component
`density` props stay — are follow-ups, not gaps in the row.

### 4.1 Cuts and satellites (M) — **DONE (2026-08-15)**

- [x] Delete the broken **five** (the plan said four; V4-SCOPE §1.4 settled the
      list at five); move showcase/lab sets per V4-SCOPE.md. Every cut's docs
      page becomes a tombstone with a named alternative in MIGRATION.md (per
      ground rule 1, the guided-tour/spotlight tombstone names `arc-tour` as
      forthcoming and is updated when 4.8 lands it).
- [x] ~~Satellites peer-depend on core tokens and inherit the derived
      conformance suite~~ — **moot, and that is the result**. V4-SCOPE §1.1
      replaced satellite packages with subpaths inside this one, so there is no
      peer dependency to declare and no separate suite to feed: `/marketing`
      and `/media` are the same package, the same version, the same tests and
      the same derived conformance run. The bullet's own fear — "otherwise they
      become where components go to die" — is the argument that chose subpaths.
- [x] **`status` becomes required and barrel-gating lands here, early** — with
      one correction to where it lives, below. The badge renders on the card
      grid and the component page, and `experimental` is gated out of the
      barrel.

**Landed in three commits**, each green at that commit: the group axis, the
five deletions, the status axis.

**Correction: `status` is declared on the component, not on the docs page.**
The plan had `docs/src/data/components/_types.ts` drop the `?`. That does not
build. The barrel gates on status, `barrelExclude` is computed in
`prism.config.js` during `pnpm generate`, and the docs data layer is TypeScript
in a different workspace package — so making the published package's exports a
function of the documentation site inverts the dependency. `@status` is a
required JSDoc annotation on all 202 components (`findComponents` throws
without it, and there is no default: a new component silently inheriting
`stable` is the one answer omission must not give), it rides the manifest with
everything else derived, and `_types.ts` loses the field entirely rather than
losing its `?`. Ten components carry `beta`; nothing is experimental yet.

**The two catalog axes are one derivation.** `@arc-group` and `@status` are read
by `scripts/lib/component-tags.js`; `scripts/lib/barrel-rule.js` composes them
with the heavy-dependency case into the one list prism is given;
`generate/group-barrels.js` writes `src/marketing/index.js` and
`src/media/index.js`; `generate/manifest.js` carries both onto every
declaration. `scripts/checks/barrel-gating.js` asserts the round trip against
the barrels **as written to disk**, in all seven packages, in both directions —
including the direction nothing else covers, that every *un*-excluded component
is actually in the root barrel, since a prune that removed too much looks
identical to one that worked.

**Where 4.1 is deliberately untested by its own tree, and what covers it.**
There are zero experimental components, so the status branch of the barrel rule
is unreachable from the real catalog — landing the gate before 4.8 is the whole
point, and it means the check that reads the real catalog asserts nothing about
it. `barrel-rule.js` is therefore free of every import, including `node:fs`, so
`test/barrel-gating.test.js` can hand it fabricated catalogs (8 cases,
including that `beta` deliberately does *not* gate). The check prints "the
status half is vacuous here" rather than letting a clean line read as coverage.

**Four defects found by executing it, none of them in the plan:**

1. **prism's `barrelExclude` could not remove a name from the web-component
   root barrel.** `pruneBarrels` matches one line at a time; that barrel had
   been pretty-printed into multi-line blocks, and the prune is the only
   removal path — the other enforcement point is a gate on the *append*.
   Invisible for as long as the only excluded component was `arc-code-block`,
   which was excluded before it was ever added and so never needed removing.
   Reformatted to the shape prism writes; reported upstream.
2. **prism repairs barrels before it sweeps orphans** (`cli.js:673` then
   `:677`), and the repair decides by asking the filesystem — so deleting a
   component leaves every wrapper barrel naming files that are removed four
   lines later. All six packages stopped compiling. Loud and self-healing on a
   second run; deleting a component needs `pnpm generate` twice. Reported
   upstream, recorded in HANDOFF.
3. **`generate/exports.js` had a dead assertion.** Its header claims every
   export target must exist on disk; the check ran only on bare-string entries,
   which an entry is for exactly one pass before the script attaches its types
   condition. Restored and verified by breaking `./alert` deliberately.
   `check-export-map` is what actually caught the five dead subpaths, from the
   other side, which is why nothing shipped broken.
4. **`arc-dock` was worse than the ledger recorded.** Beyond the hover-only
   reveal: `open` was documented as tracking the hover state and
   `arc-open`/`arc-close` as firing on it, and nothing wrote `open` on hover, so
   neither happened; its `_hovered` state property was assigned once in the
   constructor and never read. Two speed-dial details in the ledger were also
   corrected against the source while writing its tombstone.

`check-scope-coverage` now distinguishes an **executed** verdict from a stale
one — delete/merge/rename for an absent tag is the plan working and is counted;
a `keep` for an absent tag is still a failure. Both halves verified by
fabricating each case.

**Arithmetic, measured:** 207 tags → 202 registered, 186 in the default barrel
(15 grouped, 1 heavy-dependency). The 13 merges and 1 rename are 4.2 and 4.4.

**Gate: MET.** `pnpm test` 4,550 passing / 0 failing / 2 skipped (was 4,666;
−124 with the three deleted suites, +8 for barrel-gating). `pnpm check` 23/23,
with `group-gating` renamed to `barrel-gating` as it grew the status half.
`pnpm generate` diff-clean and idempotent. Docs build green, 201 pages
including five tombstones.

### 4.2 Merges (L) — **DONE (2026-08-15), 11 of 12 rows**

- [x] The 12 non-dialog merges from 1.1 (the dialog family is 4.4's, built
      directly on `<dialog>` so it is not rewritten twice). Each: merge,
      `@deprecated` alias where cheap, MIGRATION.md entry, docs page folded,
      wrappers regenerate for free. **11 rows landed; `arc-badge → arc-tag` is
      deferred, see below.** A twelfth tag was added: `arc-column`, which Phase
      1 listed as a keep.
- [x] Extract the shared `VirtualController` while merging the table family —
      the windowing math is implemented three times (`virtual-list`,
      `data-table`, `data-grid`); keep `overscan` public on the merged grid.

**"Alias where cheap" resolved to "leave the component alone".** The cheapest
possible alias is the original, unchanged: a deprecated component keeps working,
stays in the barrel for the whole major — taking it out is the break the
deprecation exists to postpone — and only leaves the *catalog*: no card in the
docs grid, a notice on its page, a dev-mode warning. So the work was never the
alias. It was making each survivor able to do the job, and that is where the
plan turned out to be wrong.

**V4-SCOPE §3 was drawn from prop lists, and the differences were in the
styles.** Four rows of six in the first batch needed the survivor to grow, and
one did not survive contact at all:

- `arc-divider` had no dashed rule, no dotted rule, and no flat one — `subtle`,
  its default, is the token *gradient*. It gains `line`/`dashed`/`dotted`/`fade`.
- `arc-description-list` could only stack; `arc-key-value`'s whole reason to
  exist was term-beside-detail. It gains `layout`, which has to cross a shadow
  boundary via a custom property.
- `arc-tag` gains `info`; `arc-alert` gains `tip` and an `icon` slot;
  `arc-toast` gains a progress mode; `arc-data-grid` gains `density` and
  `striped`.
- `arc-stack` needed nothing, but the migration is four attributes rather than
  the two §3 claimed.

**`arc-badge → arc-tag` is deferred, on a stated finding.** §3 row 3 reads
"arc-tag is the superset (it has `removable`) … no new prop needed", true of the
props and false of the styles: badge is `--font-mono`, normal tracking, sentence
case; tag is `--font-label`, 2px tracking, UPPERCASE, `min-height:
var(--touch-min)`. Merging as written re-sets every badge on every page —
`v3.2.0` becomes `V3.2.0` in a taller box — which is the "quietly delete a
visual capability" failure §3.2 rules out by name for arc-callout's accent bar.
Resolving it means deciding whether ARC has one chip typography or two, and
**4.5 owns typography**; deciding it here would mean re-deciding it three
workstreams later. The reasoning sits at arc-badge's own source and a test pins
the measurement that will fail if the two ever converge.

**Two defects fixed by the extraction, both invisible before it:**

1. **`arc-data-table` could render a blank table.** Its windowing computed
   `visibleCount = end - start` with no floor, where the other two copies of the
   same five lines clamped at zero. `end` is `min(total, …)` and `start` is
   `max(0, …)`, so any state where the row set shrank below the current scroll
   offset inverted them and the slice rendered nothing under a full-height
   spacer.
2. **`arc-toast`'s action button has never rendered.** `show()` has only ever
   stored the payload on `entry.options` and the render read `t.actionLabel`, so
   the condition was `undefined` for every toast the component ever displayed
   and the documented `part="action"` could not be delivered. The derived parts
   sweep cannot catch this — a conditional part is exempt by construction, and
   it has no way to tell one that is conditional from one that is unreachable.

**Also corrected:** `arc-callout → arc-alert` forced `info` to lose its live
region, which is a behaviour change for existing `arc-alert` users and not only
for callout's — §3.2 predicted exactly this and it is why the row needed a
decision. `arc-alert` gained `live` as the escape hatch.

New: `scripts/checks/css-backticks.js`. A backtick inside a `css` template ends
the template, and the SyntaxError names an identifier from the CSS several lines
later. It cost two debugging rounds in one afternoon. The defect cannot ship —
`check-ssr` and `module-types` both fail on it — so this is diagnosis rather
than a gate: it runs before the 18s prism step and names the line. Implemented
as `node --check` after a hand-written scanner reported three files that were
entirely fine.

**Gate: MET.** `pnpm test` 4,623 passing / 0 failing / 2 skipped (+73 across the
three commits). `pnpm check` 24/24. `pnpm generate` diff-clean. Docs build green.
12 tags deprecated, 0 removed — they all go in v5.

### 4.3 API dialect pass (L)

One release. The five conventions are enforced by five named checks —
**authored as rule functions on a shared source-walker utility built here**
(4.10 later migrates the existing five token linters and four parsers onto
the same walker, so nothing is written twice): `part-base.js`,
`side-slots.js`, `dismiss-prop.js`, `size-canon.js`, `array-dialect.js`.

**Status: the walker is built.**
`scripts/lib/source-walker.js` is the shared reader 4.10 migrates nine existing
checks onto — the intersection of what they already do (balanced regions,
comment-blanked source with offsets preserved, the properties block, CSS rules,
docblock tags, method bodies), with the two lessons each of them had rediscovered
separately kept as properties of the reader: a regex over a nested object matches
the nesting, and a comment quoting the banned thing fails the rule that bans it.
Rules are functions; `run()` owns iteration, reporting and the anti-vacuity
guard, so a rule stays the size of its idea and every check reports identically.

Landed: **`size-canon`** and **`dismiss-prop`**, both with their exception lists
audited for rot (an entry naming a tag that no longer exists is a decision about
nothing). Both were proved to fire by reintroducing the defects they claim to
catch.

- Size had **7** divergences, not the 5 the plan counted, and they split three
  ways rather than one: two pixel dimensions that share the word and nothing
  else, two scales that are genuinely a different axis (the type scale on
  `arc-icon`, the layout scale on `arc-container`), two that extend the canon
  downward with a load-bearing `xs`, and exactly one real outlier —
  `arc-toolbar`, which declared `['md','sm']` and so was the only control in the
  library that could not be made larger. So the check has two lists rather than
  one: NOT_A_SCALE (the convention does not apply) and EXTENDS (it does, and the
  canon is still enforced in front of the extension).
- Dismissal was **one** component, not the five the plan lists — `close` and
  `dismiss` on the others are methods, and `removable` on `arc-tag` is a
  different concept. The finding is that the two dialects differed in *polarity*
  as well as spelling: `closable` defaults true, `dismissible` false. Only the
  spelling converges; forcing one default on both would trade a naming
  inconsistency for a behavioural one.
- prism caught the one mistake made along the way — `lg` styled on `arc-toolbar`
  while its documented union still said `md | sm`.

**Status (2026-08-16): 4.3 is complete — all five conventions have landed.** `array-dialect` is
done — 26 props across 19 components, all four dialects retired, and the check
that keeps them retired is three rules with one exemption entry between them.

- The row said ~28 props. It was 26 that are lists and **3 that are not**: two
  render callbacks and one parsed object, all three declared `{ attribute:
  false }` in exactly the same three words a property-only array uses. That is
  why the check reads the JSDoc — the declaration cannot tell them apart and the
  documented type can.
- Six props **gained** an attribute. Three of them were property-only with a
  stated reason that was false: *"an array can't survive a round trip through
  one."* JSON is a round trip; that is the whole premise of `list()`. The
  vocabulary deliberately has no `attribute: false`, because dialect 2 is listed
  in its own docstring as a problem and opting back into it would be re-adopting
  what the helper replaces.
- `arc-knob.detents` needed the vocabulary to grow, not an exemption. It took a
  comma list rather than JSON — a real decision about syntax, recorded in the
  source — and kept a hand-rolled converter only because `list()` could not say
  it. `list({ of: Number })` says it, accepts both spellings, and drops
  non-finite members on both paths. Dialect 3 is now actually gone rather than
  exempted.
- **Two latent defects surfaced.** `arc-kanban.columns = 'oops'` threw in
  `willUpdate` — because Lit runs a host's `willUpdate` *before* a controller's
  `hostUpdate`, so the mixin's normalisation is not in effect there. That is not
  a gap a controller can close, and it is now recorded in the mixin's docstring
  next to the reason the mixin is a controller at all. Separately, `manifest.js`
  published every list default as the *string* `'[]'`; four props had it and the
  migration made it 56, which is the only reason anybody looked.
- Conformance now probes 26 props it could not see before — the suite grew by 61
  cases without a line being written for it, because a declared prop is one the
  contract suite knows how to interrogate.

**`part-base` landed 2026-08-16 — 175 of 202 components, and it was not the
mechanical row it was filed as.** Three things the estimate did not contain:

- **86 distinct spellings** of the root part, not a handful. That number is the
  case for the convention rather than an obstacle to it.
- **The root element is not always singular, and not always first.** Fourteen
  components render a *different root element* depending on a prop (`arc-text`
  is eight branches, `arc-button` two, `arc-qr-code` two), so `base` had to go
  on every branch — and a codemod that put it on one branch of thirteen
  components produced source that read as correct. It was caught by mounting all
  202 in a browser and reading `shadowRoot.firstElementChild`, which is now the
  method: **a static scan cannot answer "what is the root element".** Two more
  (`arc-sheet`, `arc-drawer`) render the scrim first and the panel second as
  siblings, so first-child is the wrong rule too.
- **27 components have no root box**, and forcing one on them would have added
  an element to the page to satisfy a naming rule. 21 are a bare `<slot>`; two
  are peer boxes with the host as their only container; four render nothing.
  Each is in `EXEMPT` with its reason.
- One collision: `arc-waveform.base` was the unplayed layer. Renamed `unplayed`,
  beside its `played` sibling — the one `::part()` break in the row.
- **`[part="x"]` is not `::part(x)`.** The dual token broke 226 exact attribute
  selectors in our own tests while breaking no CSS at all, because `::part()`
  matches on tokens and `[part=]` does not. Worth knowing before the next dual
  token; `[part~=]` is the equivalent.

The check is three rules: the part is declared, it is rendered, and it is
rendered in *every* branch that renders that root — the third exists because of
the codemod mistake above. The runtime half is one forward assertion in
`conformance-surface.test.js`, deliberately breaking that file's
parts-are-asserted-backwards rule, with the reason recorded there: `base` is the
only part every component is supposed to have and the only one that is not
conditional. It is driven off the docblock, so the exemption list lives in one
place.

**`side-slots` landed 2026-08-16, as one pair over two components rather than
three pairs over four.** The row proposed aliasing `start/end`, `before/after`
and `above/below` onto `prefix/suffix`, and two of the three are not side slots:
`arc-image-compare`'s before/after are the two images being compared — a
sequence, with one layered over the other — and `arc-page-header`'s above/below
are the block axis, where prefix/suffix are the inline one. Folding either in
would have described the wrong thing in the wrong dimension, so both are
unchanged and the check records why.

That left `start/end` (arc-toolbar, arc-status-bar) against `prefix/suffix`
(five components). It converged on `prefix/suffix` — the larger group, and the
name the rest of the ecosystem uses for a control's leading slot. Both old names
work through v4: the region renders two slots, and the part carries both tokens,
so `::part(start)` costs nothing to keep. The check's job is not the rename,
which is done; it is stopping the *next* component inventing a sixth spelling,
which is how the library got two in the first place — neither component chose
`start` over `prefix`, each was written without knowing the other existed.

- [x] Root CSS part: every component's outermost part gains the `base` token
      **alongside** its semantic name (`part="base wrapper"` dual-token).
      Honest accounting: this still touches ~180 components' JSDoc — each
      needs `@csspart base` declared and `custom-elements.json` regenerated,
      or `conformance-surface.test.js:140-156` fails the render on the
      undocumented token. Cheaper for *consumers* than a rename (no
      `::part()` breaks); not free for us.
- [x] Side slots: `prefix`/`suffix` canonical; alias `start/end` for one
      major. `before/after` and `above/below` struck from this row — neither
      is a side slot.
- [x] One dismissal prop name across callout/banner/alert/modal/tag.
- [x] `size`: canonical `['sm','md','lg']`; fix the 5 verified outliers.
- [x] Arrays: sitewide migration of the remaining array props onto the
      `list()` primitive created in 2.2 (the four dialects — `{type: Array}`,
      `attribute: false`, hand-rolled JSON.parse, JSON-as-String — all
      retire).

**Exit:** all five checks green in CI; `pnpm generate` diff-clean across all
wrapper packages.

### 4.4 Platform layer (XL) — *the engineering reason this is a major*

**Status (2026-08-16): the exit criteria are met.** Overlay adoption is at 100%
of `open`-declaring survivors, the 2.4d dismissal contract is green across all
of them, and the a11y audit is 182/182 clean. Row 1 is partly banked and partly
open — see below.

- [~] Top layer: `popover` attribute + CSS anchor positioning inside
      `PositionController`/`OverlayMixin` (current logic stays as the
      fallback path). Twenty consumers improve at once; kills the
      z-index/clipping/portal bug class (findings #31, #67, the context-menu
      re-anchoring flake, the `menu-width` sweep's reason to exist).

      **The `popover` half was already done before 4.4 opened** — the twenty
      `PositionController` consumers have been promoting with
      `popover="manual"` and viewport-fixed coordinates since 2.4, and the row
      was never reconciled against the code. So the benefit this row is sold on
      — "kills the z-index/clipping bug class" — was already banked for the
      anchored panels, and 4.4's `<dialog>` work banked it for the five modals
      too. What is left is genuinely two smaller things, neither of which is a
      correctness fix:

      - **CSS anchor positioning** (`anchor-name` / `position-area` /
        `position-try`) as the preferred path. The win is real but narrow:
        positioning that survives a scroll with no listeners, no
        `ResizeObserver` and no per-frame measurement. The cost is two
        positioning engines that must agree, permanently — the JS path cannot
        be removed while a major engine lacks support, and several
        `PositionController` features map unevenly onto CSS
        (`arc-context-menu` anchors to a *pointer*, which has no
        `anchor-name`). **Recommend deferring to v4.x** under the same
        re-vibing guard this section already applies to `static arc = {…}`:
        the correctness is banked, and what remains is smoothness bought with
        a second implementation.
      - **`arc-navigation-menu`'s portal (finding #67).** This is the last
        instance of the bug class the row names, and the only one left that
        the top layer would actually delete rather than improve. The mobile
        overlay renders into a second shadow root appended to `document.body`,
        with the component's whole stylesheet copied into it and the whole
        thing built and torn down on every connect — roughly 30 lines that
        exist for no reason except escaping ancestor stacking and clipping.
        `popover` would remove all of it. Not done here because the component
        is 991 lines with two animation state machines around that overlay, and
        it is the site's own navigation; it wants its own change rather than
        the tail of a large one.
- [x] `modal`/`sheet`/`drawer`/`lightbox`/`command-palette` (OverlayMixin's
      five consumers) on `<dialog>`: focus trapping, inert background, Escape
      from the browser instead of `focus-trap.js`.

      Landed with `shared/overlay-controller.js`, which replaced the mixin
      outright. The row undersells what changed: `trapTabKey` moved focus back
      when Tab would have left the panel, which is a keyboard behaviour and
      only a keyboard behaviour — it did nothing about a click landing behind
      the scrim or a screen reader's virtual cursor. `inert` does, and a modal
      dialog applies it to the whole document without the library keeping a
      list. Initial focus now honours `autofocus`, including on a consumer's
      slotted content, which the manual `focusFirst` call silently overrode.

      Two things the migration cost, both worth knowing before the next one:
      `::part(backdrop)` cannot survive (`::backdrop` is a pseudo-element, so
      the scrim is reachable only through custom properties), and **a synthetic
      `KeyboardEvent` no longer tests Escape at all** — the user agent fires
      `cancel`, so a fake key press would keep passing if the handling were
      deleted outright. Three suites had to change their drivers.
- [x] **The dialog-family consolidation happens here, once**: merged
      `arc-dialog` (today's modal, renamed per 1.3) built directly on
      `<dialog>`; `ArcConfirm.open(): Promise<boolean>` and the declarative
      instance-`confirm()` use case both preserved (the review's diff showed
      these are different shapes, not duplicates of each other — the
      duplicate was `dialog.js` vs `confirm.js`).
- [x] Rework `OverlayMixin` off its `updated()`-override onto the controller
      pattern (the exact pattern `props.js`'s docstring rejects), and adopt
      overlay + dismiss contracts across every `open`-declaring component
      (~25 today; ~10 use neither contract — which is what made guided-tour
      and speed-dial possible).

      The census was 20, not ~25, and **one** used neither contract rather than
      ten: `arc-context-menu`, which caught outside clicks with a full-viewport
      invisible `<div class="backdrop">`. Of the four that still use neither,
      two are disclosures (`arc-collapsible`, `arc-sidebar-section`), one is a
      layout affordance whose visibility tracks a selection (`arc-float-bar`),
      and `arc-confirm` delegates to `arc-dialog`. All four are recorded with
      their reason in `dismissal-contract.test.js`'s policy table, which is
      what makes "100% adoption" a checked statement rather than a claim.
- [x] Container queries replace viewport breakpoints where the component,
      not the page, is the unit — starting with `navigation-menu` (the 900px
      viewport gate that made its desktop bar untestable and
      placement-fragile).

      "Untestable" was exact: whether the desktop bar rendered depended on the
      size of the window running the suite, so every assertion about it was
      really an assertion about the machine's screen. The two halves also
      disagreed — CSS gated on the viewport, JS read `window.innerWidth` — so a
      nav in a narrow column had its bar hidden while the JS insisted the
      mobile panel should close, leaving no navigation at all. The container is
      a wrapper rather than `:host`, because containment is public: it lands
      `contain: layout style inline-size` on whatever carries it, and on the
      host that is the custom element a consumer wrote.
- [ ] **Deferred, on purpose:** the `static arc = {…}` declared-behavior
      axis. `subscriptions.js` already implements the controller the
      review's architect wanted to invent; revisit as v4.x once the overlay
      adoption has soaked. (Re-vibing guard.)

**Exit:** overlay adoption at 100% of `open`-declaring survivors; the 2.4d
central dismissal contract green across all of them; a11y-audit green.

### 4.5 The style pass (L) — *the design language, made homogeneous and adaptable* — **DONE**

Runs after 4.1 (style only survivors), parallel with 4.3/4.4; must land
before any docs screenshots, the beta, or 4.9's conformance statements.

Six commits: `dd932e46` (type contexts), `1d41ce90` (lobes), `7eac6ced` (the
AAA preset), `9f0e239d` (density + the two-color contract), with DESIGN.md
rewritten across them.

- [x] **Typography homogenization.** A census, then a rule that keeps it at
      zero. The row assumed the gap was the type *scale*; it was the
      properties nobody had named — `font-family` was 3 raw of 262 and
      `line-height` was 80 of 98. The tree published three leadings and the
      components used ten. `font-weight: 600` appeared 39 times: the label
      role's own weight, written out in components that could not follow it
      when a face arrives without a semibold, which is exactly what the role
      weight exists to prevent.

      Four contexts added for treatments the tree used everywhere and named
      nowhere: `--ui-lh` (running text in a control), `--glyph-lh` (a box
      holding one mark), `--numeral-*` (the large figure a stat or clock
      displays — arc-clock and arc-countdown-timer had independently arrived
      at the same clamp, character for character), and `--label-*` (the
      uppercase tracked label, with the older `--section-title-*` now pointing
      at it). 207 declarations moved by codemod, the rest by hand.

      **Where two spellings disagreed the pass converged them**, and
      `shared/tokens.js` had already recorded which value was deliberate: 2px
      is the tracking chosen for the current label face, and the comment there
      names 1px as the retired Azeret-era value and 3px/4px as Tektur's. All
      three were still in the tree. arc-table's `th` and arc-data-grid's `th`
      differed by exactly this — the same element, in a component and its own
      designated replacement. MIGRATION lists every site that moved on screen.

      New check `type-roles` replaces the "extend the existing guards" plan:
      the two font-role suites prove an override *reaches* a component and say
      nothing about the components that never asked. Its second rule paid for
      itself immediately — `--weight-medium`, read by arc-command-palette and
      declared by nothing, rendering at its fallback since it was written.

- [x] **The illumination vocabulary.** The row is right that the vocabulary
      was missing; what it could not know is that most of it was *published
      and bypassed*. `--glow-line-white` and arc-divider's `line-white`
      variant were character for character identical apart from one thing: the
      token fades to zero alpha and the copy faded to `transparent`.

      That difference is the row's real content, and `gradient-stops.js` was
      already the check for it — scoped to `shared/tokens.js` on the stated
      grounds that component CSS needed "a real parse". **That was wrong.**
      The balanced scan it already used walks from a gradient's open paren to
      its matching close, so a flat `background: transparent` is never inside
      one; it could have covered the components from the day it was written.
      Extended, it found **42 against the token file's 14**, 24 of them in
      arc-divider. Every one is invisible on a near-black page and a hard grey
      rectangle on a near-white one, which is what makes it a scheme-parity
      bug rather than a tidy-up.

      The published three could not have absorbed them: a lobe varies on three
      axes and enumerating them is eighteen tokens. `--lobe-line` /
      `--lobe-start` / `--lobe-end` / `--lobe-ambient` take their arguments
      instead, and through one of them the fade cannot be spelled wrong.

      **Two sharp edges, both built wrong first, both silent** — the CSS
      correct, the components correct, every divider grey. A custom property
      substitutes its own `var()`s at the element that *declares* it, so the
      inputs must sit on `:host`. And base.css's forwarding rule wins the
      cascade against `:host` from the outer tree, which is how a `:root`
      override reaches shadow DOM and also how it would beat a component's own
      inputs; `--lobe-*` joins the role slots in `NOT_FORWARDED`. An input set
      anywhere but `:host` is now a build failure.

      Traffic lights and presets tokenised as the row asked: `--orb-close` /
      `-minimize` / `-maximize` shared by arc-code-block and arc-terminal, and
      `--gradient-sunset` / `--gradient-ocean` for arc-gradient-text.

- [x] **The two-color theming contract.** Named, documented as *the* theming
      API in DESIGN.md, and given a check — which is the row's own lesson
      applied to itself, one commit after the AAA preset showed what an
      unverified header is worth. Two colors in, four declarations (CSS cannot
      turn a color back into a bare channel list), 35 tokens following.

      Three rules, because the first two share a blind spot: both read the
      accent-dependent set out of `:root`, so a token baked *at* `:root`
      leaves the set and takes its violation with it. A union across every
      block was tried and is wrong — a surface is a literal neutral at `:root`
      and accent-derived inside a softened region, which is what "softened"
      means. Rule 3 is a floor on the count instead.

- [x] **Scheme parity.** `themes/high-contrast.css` claimed "WCAG AAA
      compliance (7:1+ contrast ratios)" in its header. **Ten of its thirty
      foreground pairings missed it** — text-ghost at 6.37 and 6.71, error at
      6.86 and 6.88, accent-secondary at 6.73, and in light mode success at
      4.87 and warning at 4.86, which is AA and nothing more. Nothing was
      wrong with the solver; the file never went through it. It is generated
      now, from the same `solvePalette` the four shipped schemes use.

      The text ramp is **lifted, not floored**. Dark's steps sit at 7.17, 6.37
      and 5.71, so `max(r, 7)` yields 7.17, 7.00, 7.00 — three levels
      collapsed into one, which the base contract's own comment warns about
      and which the first version of this did. Every step is multiplied
      instead by whatever the lowest needs.

      `solveContrast` had a rounding gap worth its own line: it searched in
      continuous OKLCH lightness and shipped three 8-bit channels, so an
      answer could round back under its own target. That is how the first
      generated preset came out at 6.97, 6.98 and 6.99 under a header
      promising 7. **The same gap was in the four shipped schemes** — fixing
      it moved 24 tokens in base.css by one channel, and the 5.5 contract they
      carry is now true of the file rather than of the search.

      New check `contrast-contract` measures the emitted stylesheets rather
      than the tree, because `solvePalette` proves the solver was asked for
      the right ratio and cannot see a color that never went through it.

- [x] **Density scale.** `[data-density="compact" | "comfortable"]` restates
      the spacing scale at 0.75x and 1.25x, on the page or on a region. It
      restates rather than multiplies, and that is load-bearing: base.css
      forwards `--space-*` with `inherit`, which carries the parent's computed
      value, so `calc(16px * var(--density))` would have worked on `<html>`
      and silently done nothing on a section — the lobe trap again, caught
      this time before it shipped.

      Touch targets and type deliberately do not move: `--touch-min` stays at
      the WCAG 2.2 24x24 minimum, and shrinking text is a different decision
      from tightening layout.

- [x] **DESIGN.md updated** — the two-color contract leads it, and the type
      contexts, the illumination vocabulary and the density rule each carry
      the name of the check that enforces them.

**Exit — met.** `pnpm check` 33/33 including the four new linters
(`type-roles`, `contrast-contract`, `two-color-contract`, and `gradient-stops`
extended over the component tree); `pnpm generate` diff-clean; 4,929 tests
across 124 files; a11y-audit 182/182 clean across both schemes.

**What this row did not do.** Nothing was cut, but two things are worth
recording as *not* attempted rather than as done:

- **The docs site was not swept.** `type-roles` and the extended
  `gradient-stops` are scoped to `packages/web-components/src`. DESIGN.md says
  docs pages are part of the design language, and `docs/src` has never been
  measured against either rule. That is a contained follow-up and belongs with
  4.9 or 4.11 rather than here.
- **The four per-component `density` props stay.** arc-data-grid, arc-table,
  arc-alert and arc-footer each tighten themselves regardless of the page,
  which is a different capability from the page-level scale and not obviously
  redundant. Folding them into `[data-density]` would be an API break for no
  gain until someone wants it.

### 4.6 Wrapper matrix (L) — *gated on 2.4a green AND 4.1 landed* — **DONE**

(Don't build the wrapper matrix over a catalog about to shrink.)

- [ ] ~~Drop Preact + Solid packages.~~ **Refuted (2026-08-16) — all six
      packages stay.** Six framework bindings generated from one set of Lit
      components is the product claim; the packages are what makes it a fact
      rather than an assertion, and prism is Arclight's own tool with arc-ui
      as its only real-world corpus. Drop two and two of prism's six
      generators are proven by nothing. See the do-NOT list.

      What survives from the row, now **additive**: ship generated
      `preact-jsx.d.ts` / `solid-jsx.d.ts` from core, mirroring
      `types/react-jsx.d.ts` — React already has *both* a package and a JSX
      augmentation, and that is the model. It serves the consumer who wants
      `<arc-input>` natively without giving up the wrapper for the consumer
      who wants `<Input>`. No migration entry, no break, nothing to remove.

      The one asymmetry worth knowing while maintaining them: the Solid
      wrapper is a `splitProps` pass-through over `on:arc-input`, which is
      Solid's own native syntax, so it is typed convenience. The Preact
      wrapper hand-rolls `addEventListener` per custom event in a
      `useLayoutEffect`, because Preact's `on*` handling cannot address a
      dashed custom event name. That is a real capability and the reason a
      `.d.ts` could never have replaced it.
- [x] **Slim React — mostly already true.** prism generates `*Props` from the
      declared props via `config.propsFrom`, and the 99 components with custom
      events already get typed `onArc*` handlers through `@lit/react`'s events
      map. The do-NOT list's reason for keeping the types also still holds:
      `wrapper-slots.js` reads the React props interface for
      `children?: React.ReactNode`.

      `create-component.ts` has its deprecation notice for the v5 removal. The
      notice is nearly ceremonial: the file is in neither `index.ts` nor any of
      the export map's 207 entries, and the map carries no wildcard, so under
      `node16` or `bundler` resolution it is already unreachable. The one
      population that can reach it is a deep import under legacy `node`
      resolution, which ignores `exports` — and that is who it is addressed to.
- [x] **Angular `ControlValueAccessor` — done, and it belongs upstream.**
      27 controls, not 46. The row's number was the count of components
      emitting `arc-change`, which sweeps in arc-tabs, arc-theme-toggle,
      arc-waveform and arc-sortable-list. The library already had the precise
      answer: `FormControlMixin` is what makes a component form-associated, and
      27 extend it. Derived from source every run, so a 28th is covered by
      writing it.

      Two of the 27 have no single value: arc-date-range-picker binds
      `start`/`end` and arc-range-slider binds `low`/`high`. Both get a
      composite accessor rather than being left out, because
      `formControlName` working on 25 of 27 is a gap a consumer discovers
      rather than reads.

      **`scripts/generate/angular-cva.js` is a bridge, not a design.** It
      regex-rewrites prism's emitted Angular files, because generating
      framework-native bindings is prism's remit and prism has exactly one
      extension point (`config.propsFrom`) which answers a different question.
      The pass is deterministic and idempotent, `pnpm generate` stays
      diff-clean, and it fails loudly rather than silently when a pattern stops
      matching — but it is coupled to prism's formatting.

      **Superseded by PRISM-3.md §2.1**, where the generated shape is written
      up as a specification along with the five non-obvious details it cost
      something to find. This file goes the release prism ships it.

      Verified by `ng-packagr` building all 27 under `strictTemplates`, and by
      `check angular-forms`, which reads the finished Angular sources against
      the elements' own declarations — the generator failing loudly covers the
      pass not running, not it running wrong.

      **Not covered by a runtime test.** `test/wrapper-runtime/contract.js` is
      one expectations table across six frameworks, and a `formControlName`
      probe is Angular-only; bolting an asymmetric case into it would cost more
      than it proves. The compile and the structural check are what stands
      behind this row.
- [x] **Diff-gated publish, lockstep versions.** Only the half that was
      costing something. Releases put nine tarballs on npm whether or not
      anything in eight of them had moved; publishing is now scoped by pnpm's
      own `[<since>]` filter against the previous tag — without the `...`
      dependents prefix, because a wrapper whose files did not change does not
      need republishing when core moves. Except across a major, where a caret
      does not accept the new core, so a major publishes everything.

      Per-package *version numbers* were deliberately not taken: a single
      version line is what makes the tag mean something (the workflow gates on
      core's version matching it), and per-package numbers want per-package
      changelogs and a decision per package per release. Recorded in
      `bump-versions.js` rather than left as an omission.

      `check version-floor` is what makes the diff-gating safe: every wrapper
      declares core as a peer spelled `workspace:^`, which pnpm stamps at pack
      time. A literal reads identically in the repo and cannot follow a release.
- [x] **The native paths are documented** — registration, Vue's
      `isCustomElement`, Angular's `CUSTOM_ELEMENTS_SCHEMA`, the three JSX
      declaration files, and what you give up, which is not the same in every
      framework.

**Exit:** 2.4a runtime suites green across all **six** packages plus the two
new type augmentations; smoke-test-wrappers green on tarballs.

**Status (2026-08-16): all five rows landed.** `pnpm check` 37/37 including
four new linters (`jsx-augmentations`, `version-floor`, `angular-forms`, and
`type-roles`/`contrast-contract`/`two-color-contract` from 4.5); generate
diff-clean and idempotent; 4,929 tests; `ng-packagr` builds the Angular package
clean; a11y-audit 182/182.

**Paired release: prism 3.0 ships with arc-ui v4.0.** `PRISM-3.md` collects the
scope — two breaking changes prism 3.0 should take (the Solid
`IntrinsicElements` block being inert in all 201 wrappers, found here on
2026-08-16; runtime `elementProperties` resolution), three jobs arc-ui is
currently doing on prism's behalf (Angular CVA, the JSX augmentations, the
wrapper export maps), the diagnostics, and a table of what arc-ui deletes as
each lands — 696 of the ~1,235 lines that exist here only because of prism.

The four wrapper *checks* stay whatever prism does. They are not workarounds;
they are the acceptance suite, and they are how the next defect gets found —
every fix in prism's ledger was found by one of them.

### 4.7 Icons split (M) — *after 4.1; independent otherwise* — **DONE**

- [x] **`@arclux/arc-ui-icons`.** Both packs left the core package. Core is
      **3,895 files → 476** and **8.5 MB → 4.8 MB unpacked**, 1.70 MB → 0.88 MB
      packed; the icons package is the 3,423 files and 3.70 MB that came out.

      **The row's premise was measured with `du` and is 4× high.** 3,408
      per-icon modules average ~500 bytes against a 4 KB filesystem block, so
      `du` reports 15.6 MB for 3.7 MB of actual content. "16 MB of 22 MB" was
      never in a tarball. The number that holds up is the *file count* — icons
      were **88% of everything core published** — and the build cost below,
      which is the part that was actually hurting.

      **The relative path was the whole problem.** `icon-registry.js` reached
      for `../icons/phosphor/_resolver.js`, and a relative import is a hard
      edge: no export map, no dependency declaration and no `barrelExclude`
      entry can cut it. That is why the row is a package split and not a
      configuration change. Each resolver is ~1,900 static `import()`
      specifiers — the thing that makes per-icon code splitting work, and worth
      paying for *if you render icons*; it sat in every consumer's bundle graph
      by default.

      **Explicit registration, and it is now the only door.** `iconRegistry
      .register(name, { icons, aliases })`; Phosphor and Lucide arrive through
      exactly the door a consumer's own set would. The alias table moved to the
      icons package, where the libraries it describes live, and is part of the
      registration payload so a custom library can make built-in components
      resolve against it.

      **No default library.** `_libraryName` starts null rather than
      `'phosphor'`, because after the split that string is a promise core cannot
      keep. Registration selects when nothing is selected, so one import is
      still a complete setup. A page that upgrades without installing gets one
      console line carrying the two-line fix — not fifty per-name warnings, and
      not silence.

      **Two consequences that reverse earlier decisions, both deliberate.**
      `use()` no longer throws on an unknown name: registration is a module side
      effect and selection is often a DOM attribute, so the two arrive in either
      order. And `arc-icon-library.name` goes back to a bare string — finding
      #79's `oneOf(['phosphor','lucide'])` fixed a throw that no longer exists,
      and would now rewrite a consumer's own registered library to `phosphor`,
      which is #79's failure aimed the other way. The loudness moved to `get()`,
      which is the only place that can list what *is* registered. The two
      conformance cases the enum used to derive are replaced by hand.

      **The ergonomics were wrong on the first pass and got fixed.** `./phosphor`
      was the eager 876 KB barrel and registration was shoved onto
      `./phosphor.register`, which reads as two imports for one job. The plain
      subpath now registers — `import '@arclux/arc-ui-icons/phosphor'` — and the
      barrel moved to `./all/phosphor`. That changes the *meaning* of a v3
      subpath rather than its location, so the register modules default-export a
      Proxy that throws naming both replacements: a mechanical rename fails with
      the fix instead of `undefined`.

      **`scripts/checks/icon-independence.js`** is the shiki lesson pointed at
      the second heavy dependency — no core module reaches a pack by path or
      specifier, core declares no non-dev dependency on the package, and the
      `./icons/` subpaths stay gone from the export map. Proved against all
      three defects. Its scanner skips string literals as well as comments,
      because icon-registry.js's own docstring *and* its console warning spell
      out the import it bans, and the first version reported the file for
      carrying its own fix.

- [x] **Attribution, which was missing and is a compliance defect.** Both packs
      are permissive — Phosphor MIT, Lucide ISC with Feather-derived portions
      under MIT — and both require the copyright and permission notice to
      travel with copies. 3,408 vendored glyphs shipped inside `@arclux/arc-ui`
      from v1.9.0 with only ARC's own MIT beside them. Nothing here was ever
      disallowed; the notices were simply absent, which is the kind of thing a
      downstream legal review finds rather than anyone here.

      `packages/icons/LICENSE` is **generated** from the installed upstream
      packages by `generate/icons.js`, so it is a copy rather than a
      transcription and an upstream relicense shows up as a diff.
      `scripts/checks/icon-attribution.js` asserts it still matches what is
      being shipped, names the installed versions, and that the `license` field
      is `MIT AND ISC` — the field every automated scanner reads instead of the
      file. Proved against a hand-edited notice, a stale version, and the plain
      `"MIT"` a new package gets by default.

      **Not audited beyond these two.** Core's own `LICENSE` and the docs site's
      credits were not reviewed for other third-party material; the row's scope
      was the packs it moved.

Exit criteria met: `pnpm check` green across 37 checks, `pnpm generate`
diff-clean and idempotent, 4,929 tests across 124 files, docs site builds with
198 pages and 19,539 shadow roots and its icons back in the pre-rendered HTML
(+812 KB), and all three public subpath shapes exercised through the real export
map.

### 4.8 Additions (XL) — *after 4.3 + 4.4; visual language from 4.5; ratified in 1.5*

Born on the final conventions; all ship `status: experimental` (already
barrel-gated by 4.1); each passed the intake bar in Phase 1. Targets v4.0 but
does not block the tag — additions may trail into 4.x minors. These are the
proof that adding a component now touches component + test + docs and nothing
else.

- [ ] **`arc-tree-grid`** — WAI-ARIA treegrid (expand/collapse rows,
      `aria-level`/`posinset`/`setsize`, Left/Right collapse-expand on the
      roving 2-D focus), sharing `VirtualController` with the merged grid
      (4.2 dependency). Sibling vs. grid-mode decided by whether the
      `grid`/`treegrid` role split contaminates the flat grid (lean:
      sibling, per the select-family composition pattern). Column manager
      and expandable-row-detail land here as grid capabilities.
- [ ] **`arc-filter-bar` + `arc-filter-chip`** — add-filter control, applied
      filters as dismissible chips (field:operator:value), clear-all,
      per-type editors (select/date-range/text/number) in anchored popovers
      (4.4 dependency). Filter-chip composes `arc-tag` per the 1.5 decision.
      Keyboard through the chip set, announced filter changes, overflow —
      the hard 20%.
- [ ] **`arc-tour`** — the correct rebuild replacing guided-tour/spotlight:
      ~150 LOC on the 4.4 overlay contract, taking **element references, not
      just selectors** (fixes shadow-DOM targeting by API design). Update
      the 4.1 tombstones to point here on landing.
- [ ] **`arc-shortcut-help`** — searchable cheat-sheet dialog that
      enumerates `arc-hotkey[description]` elements from the document (the
      registry is the DOM — derived, not speculative). Makes the
      keyboard-first identity visible.
- [ ] **`arc-field-list`** (tier 2) — repeating form rows: add/remove/
      reorder, indexed FormData names (`items[0].email`), focus to the new
      row on add and to a survivor on remove, live-region announcements.
      Design the naming contract before committing.
- [ ] **`arc-prompt-input`** (only if 1.3 kept chat) — auto-growing composer,
      Enter-to-send/Shift+Enter, attach slot, streaming/stop state,
      form-associated. Completes conversation/message as a family.

### 4.9 Conformance & AI surface (L) — *trails 4.5; non-blocking for the tag*

- [ ] Per-component accessibility & conformance statement on each docs page,
      generated from artifacts that already exist: the ARIA pattern
      implemented, the keyboard map, axe results from `a11y-audit.js`, what
      the derived suites pin. VPAT-shaped; converts the verification layer
      into the sales pitch.
- [ ] `llms.txt` + an MCP server generated from `custom-elements.json` + the
      docs manifest (context7.json already exists — extend the same
      surface). An agent should be able to query the catalog, props, and
      do/don't guidance directly.
- [ ] Three starter templates wired from `app-shell` / `auth-shell` /
      `settings-layout`.
- [ ] **The theme synthesizer** — a docs-site mini app on the 4.5 two-color
      contract: pick the two colors (+ neutral/radius/density preferences),
      watch all schemes and the illumination vocabulary derive live with the
      contrast contract validating in view, export a drop-in CSS/token file.
      Same `shared/color.js` pipeline, zero new theming machinery — the
      playground *is* the documentation for "ARC is a design language that
      adapts," and it doubles as the dogfood page.
- [ ] **Rebuild the docs site on the two-color contract (M, sized here, not
      hidden in Phase 5)** — the library's own biggest consumer is the
      proof.

### 4.10 Tooling consolidation (M) — *after 4.3 (which builds the shared walker); anytime before the tag; non-blocking*

- [ ] Migrate the 5 token-discipline linters (`breakpoint-drift`,
      `gradient-stops`, `motion-tokens`, `focus-ring`, `pinned-schemes`)
      onto 4.3's shared walker as 5 rule functions. **Non-negotiable: every
      incident comment survives verbatim as its rule's docstring.**
- [ ] Migrate the 4 brace-balancing source parsers (`boolean-defaults`,
      `empty-attributes`, `inert-declarations`, `lifecycle-pairing`) onto
      the same scanner utility.
- [ ] Split `scripts/checks/ssr.js` (402 LOC): CLIENT_ONLY/UPSTREAM_BLOCKED
      bookkeeping stays a check (keep the deliberately-empty
      UPSTREAM_BLOCKED postmortem map); the enum-variant fuzzer +
      PROPERTY_SAMPLES move to a new `test/ssr-fuzz.test.js` (leaving
      `helpers.js` untouched per the do-NOT list's additive-only rule).
- [ ] `pnpm verify` alias = generate → checks → tests → typecheck, with a
      staleness guard (local DX only — CI already runs everything; today
      `pnpm generate` exercises 13 of the 19 check files, and 4 checks
      silently assert against stale wrapper output on an ungenerated tree).
- [ ] Move `web-test-runner.jitter.mjs` / `.startprobe.mjs` to
      `scripts/debug/` with a README pointer.

### 4.11 Docs & release posture (M) — *last before the tag* — **DONE**

- [x] **README leads with the claim, not the count.** The subtitle is now the
      differentiator verbatim — *change framework without changing your design
      system* — and the opening states the problem it answers before naming a
      technology: a component library is a bet on a framework, and rewriting
      the app rewrites the design system with it.

      The claim is backed by the two things that have to be true for it, both
      already enforced: 2.4a's runtime harness mounts every wrapper package in
      a real browser against one contract (which is how three defects that had
      shipped since the wrapper packages existed were found), and the visual
      system is custom properties end to end, so the zero-JS HTML/CSS package
      gets the same design as the React one.

      **The count badge stays, demoted below `frameworks-7`.** The row said to
      replace it; the count is still a real fact a reader wants, and hiding it
      would be a different kind of dishonesty. What changed is that it no
      longer *leads*, and the catalog section now says outright that the count
      is a consequence rather than the pitch — v4 cut five components that
      existed to make it bigger.

      Also: an **Upgrading** section pointing at MIGRATION.md's v4 contents
      list, the icons package in the structure block and the framework table,
      Angular's `ControlValueAccessor` in the prism description, and the
      third-party icon licences named beside ARC's own.

- [x] **`readme-stats.js` fails instead of no-opping.** Rewriting the intro
      sentence broke its anchor in the same edit that changed the number it
      exists to keep current — `String.replace` with no match returns the
      string unchanged and says nothing, so the generator would have gone on
      printing "README stats synced" while doing nothing. Every one of its
      seven replacements now asserts it matched. Proved by moving an anchor.

- [x] **MIGRATION.md is complete, and its contents list is generated.**

      Five sections were missing, four of them the row's own "wrapper story":
      **Wrappers: four defects that were shipping** (Angular defined no custom
      elements at all across 207 wrappers; Angular and Solid discarded children
      of named-slot components; 18 Vue/Solid subpaths threw
      `ERR_MODULE_NOT_FOUND`; `createComponent` deprecated), **Angular form
      controls bind to `@angular/forms`**, **JSX typings for `<arc-*>`, and the
      React instruction that never worked**, and **Props that documented a rule
      now enforce it** (2.1's two slices — per-item `disabled`, and five bounds
      that moved from the render onto the declaration).

      The fifth was found by auditing the commit log rather than the plan.
      **Event details that named the wrong thing** covers three changes that
      landed unmarked because the old behaviour was a defect —
      `arc-date-range-picker`'s `detail.value` changing from `{ start, end }`
      to the ISO interval string is a *type* change on a payload consumers
      read, and "it was broken" is no comfort to someone whose code read it.
      Also `arc-tree-view` keying nodes by path rather than label, and
      `arc-list`'s selection round-tripping through a comma.

      Everything else on the row's list was already present: merged/cut/renamed
      tags, the dialect aliases (`start`/`end` → `prefix`/`suffix` and
      `closable` → `dismissible`, both two-way through v4 and removed in v5),
      the icons split, the two-color contract, and the barrel gating.

      **`scripts/generate/migration-toc.js`** derives the v4 contents list and
      enforces section order. The list had drifted to **seven of eighteen**
      entries — the failure a hand-maintained index always eventually has, and
      one nobody notices, because a missing entry looks exactly like a section
      that does not exist. A section without a place in `ORDER` now fails the
      build rather than being appended silently; both directions of that guard
      are proved, and the reorder was verified lossless (same 23 sections,
      byte-identical bodies, the v2 → v3 half untouched). It also rejects two
      titles that normalise to one anchor, which GitHub resolves by silently
      suffixing the second.

Exit criteria met: `pnpm check` green across 37 checks, `pnpm generate`
diff-clean and idempotent, 4,929 tests across 124 files, and every `!`-marked
commit on the branch traced to a MIGRATION section.

---

## Phase 5 — Ship

- [ ] `v4.0.0-beta.1` with MIGRATION.md, once 4.1–4.7 + 4.11 are done.
- [ ] Soak: observation only — the rebuilt docs site (4.9) running on the
      beta, plus at least one external consumer if one exists.
- [ ] `v4.0.0`. v3 branch receives patches for one quarter.

---

## The do-NOT list (cuts that were proposed and refuted — keep with reasons)

- **`shared/tokens.js` `cssVariables`** — the token source of truth, consumed
  at `:1605` and `:2098` (and named in a diagnostic at `:1666`); deleting it
  empties `:root` and unstyles the library.
- **The 23 hand-listed CSS-parts tests** — the proposed derived forward
  assertion cannot work: conditional parts are gated on flags and light-DOM
  content, not enums (`conformance-surface.test.js:16-28` names the cases).
- **`enum-fallback-sweep.test.js:34-107`** — the computed-style table catches
  a codemod mis-widening the static check structurally cannot see; the
  static check only matches the original `:host(:not([prop]))` source form.
- **`disabled-open-sweep.test.js:88-119`** — :88-105 asserts
  refuse-at-the-setter (`isUpdatePending === false`), which no declaration
  derives; :106-119 is its anti-vacuity pair.
- **`form-contract.test.js:71-82`** — `name` is hand-declared in 20+ files,
  not once in the mixin; keep until actually centralized.
- **React `*Props` interfaces (silent deletion)** — published API, and
  `wrapper-slots.js`'s React probe reads them; deprecate via generation from
  `elementProperties` instead (4.6).
- **The Preact and Solid packages** — 4.6 proposed dropping them to types.
  Refuted: **numbers sell.** "Six framework bindings from one set of web
  components" is the product claim, and six published packages are what makes
  it a fact rather than a pitch. prism is Arclight's own generator and arc-ui
  is the only real-world catalog exercising it — drop these two and
  `preact.js` and `solid.js` are proven by nothing. The cost of *generating*
  them is a prism run; the cost is all in the support commitment, and 2.4a's
  runtime suite already closed the failure mode that argued for the cut (all
  six shipped without forwarding children and nobody noticed — the suite that
  found it now covers all six). The JSX augmentations still ship, additively,
  the way `react-jsx.d.ts` does beside the React package.
- **`wrapper-slots.js` deletion or `namedSlotOutlets: true` for Angular** —
  the fix is the any-slot ⇒ `<ng-content>` rule (3.1).
- **`static arc = { subscriptions }` axis** — re-vibing;
  `shared/subscriptions.js` already is that controller (4.4 defers the whole
  axis).
- **The anti-vacuity discipline, `helpers.js`, `menubar.test.js`,
  `props.test.js`, the derived suites** — frozen against deletion or
  dilution; additive extension is allowed (0.2 updates helpers.js; new
  fuzz/tests go in new files).

---

## Dependencies (stated as rules, not art)

- **Strictly sequential:** Phase 0 → Phase 1 → Phase 2 → Phase 4.
- **Phase 3:** 3.1 needs 2.4a (its runtime proof); 3.2 needs only the 1.2
  decision and can ship the moment it exists.
- **Inside Phase 4:** 4.1 → 4.2 → 4.3. 4.4 and 4.5 start after 4.1, parallel
  with 4.3. 4.6 needs 2.4a **and** 4.1. 4.7 needs 4.1. 4.8 needs 4.3 + 4.4
  (+ 4.2's VirtualController for tree-grid; 4.5 for visual language). 4.9
  needs 4.5. 4.10 needs 4.3's shared walker. 4.11 is last.
- **The v4.0.0 tag requires:** 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.11.
  **Non-blocking:** 4.8 (experimental, barrel-gated), 4.9, 4.10.
- The two rules that matter most: **Phase 1 before Phase 2** — never polish
  tests for components the next phase deletes; and **2.4a before any wrapper
  decision** — every wrapper claim in the review that sounded free turned
  out to carry a runtime capability.
