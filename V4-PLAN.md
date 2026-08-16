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
      **Two release prerequisites before this can go green in CI**, in order:
      publish prism 2.13.0 (unpublished as of this writing — the registry's
      latest is 2.12.0), then bump arc-ui's devDependency and refresh the
      lockfile. Until then `pnpm install --frozen-lockfile` cannot resolve it,
      and `scripts/checks/prism-version.js` fails `pnpm generate` on purpose —
      because an older prism does not error, it silently reverts all 235 files.
- [ ] **3.2 (S, after the 1.2 decision)** True patch fixes (v3.2.x), only in
      components 1.2 keeps: memoize `data/diff.js`'s LCS off the render path
      (caller-invisible) and add `data/json-tree.js`'s WeakSet cycle guard
      (~6 LOC; turns a first-paint stack overflow into rendered output). The
      diff **size guard** is *not* patch-safe — above-threshold inputs
      produce different output — so it ships with v4 (or v3.3.0) with the
      threshold documented as a public constant.

---

## Phase 4 — The v4 release work

Order: **4.1 cuts → 4.2 merges → 4.3 dialect**, with 4.4 (platform) and 4.5
(style) starting once 4.1 lands and running in parallel with 4.3. Cuts run
before merges by this plan's own principle — never polish what the next step
deletes — and cutting first shrinks the tree every later workstream touches.

**Required before the v4.0.0 tag: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.11.**
Non-blocking, may trail into 4.x minors: 4.8 (ships `experimental`), 4.9,
4.10.

### 4.1 Cuts and satellites (M)

- [ ] Delete the broken four; move showcase/lab sets per V4-SCOPE.md. Every
      cut's docs page becomes a tombstone with a named alternative in
      MIGRATION.md (per ground rule 1, the guided-tour/spotlight tombstone
      names `arc-tour` as forthcoming and is updated when 4.8 lands it).
- [ ] Satellites peer-depend on core tokens and **inherit the derived
      conformance suite** (their manifests feed the same suites) — otherwise
      they become where components go to die.
- [ ] **`status` becomes required and barrel-gating lands here, early** —
      `docs/src/data/components/_types.ts` drops the `?` (set on 14 of 184
      pages today), the badge renders on the card grid, and `experimental` is
      gated out of the barrel (documented breaking change — subpath-only).
      Landing this before 4.8 means no experimental addition ever enters the
      barrel only to be removed from it.

### 4.2 Merges (L)

- [ ] The 12 non-dialog merges from 1.1 (the dialog family is 4.4's, built
      directly on `<dialog>` so it is not rewritten twice). Each: merge,
      `@deprecated` alias where cheap, MIGRATION.md entry, docs page folded,
      wrappers regenerate for free.
- [ ] Extract the shared `VirtualController` while merging the table family —
      the windowing math is implemented three times (`virtual-list`,
      `data-table`, `data-grid`); keep `overscan` public on the merged grid.

### 4.3 API dialect pass (L)

One release. The five conventions are enforced by five named checks —
**authored as rule functions on a shared source-walker utility built here**
(4.10 later migrates the existing five token linters and four parsers onto
the same walker, so nothing is written twice): `part-base.js`,
`side-slots.js`, `dismiss-prop.js`, `size-canon.js`, `array-dialect.js`.

- [ ] Root CSS part: every component's outermost part gains the `base` token
      **alongside** its semantic name (`part="base wrapper"` dual-token).
      Honest accounting: this still touches ~180 components' JSDoc — each
      needs `@csspart base` declared and `custom-elements.json` regenerated,
      or `conformance-surface.test.js:140-156` fails the render on the
      undocumented token. Cheaper for *consumers* than a rename (no
      `::part()` breaks); not free for us.
- [ ] Side slots: `prefix`/`suffix` canonical; alias `start/end`,
      `before/after`, `above/below` for one major.
- [ ] One dismissal prop name across callout/banner/alert/modal/tag.
- [ ] `size`: canonical `['sm','md','lg']`; fix the 5 verified outliers.
- [ ] Arrays: sitewide migration of the remaining array props onto the
      `list()` primitive created in 2.2 (the four dialects — `{type: Array}`,
      `attribute: false`, hand-rolled JSON.parse, JSON-as-String — all
      retire).

**Exit:** all five checks green in CI; `pnpm generate` diff-clean across all
wrapper packages.

### 4.4 Platform layer (XL) — *the engineering reason this is a major*

- [ ] Top layer: `popover` attribute + CSS anchor positioning inside
      `PositionController`/`OverlayMixin` (current logic stays as the
      fallback path). Twenty consumers improve at once; kills the
      z-index/clipping/portal bug class (findings #31, #67, the context-menu
      re-anchoring flake, the `menu-width` sweep's reason to exist).
- [ ] `modal`/`sheet`/`drawer`/`lightbox`/`command-palette` (OverlayMixin's
      five consumers) on `<dialog>`: focus trapping, inert background, Escape
      from the browser instead of `focus-trap.js`.
- [ ] **The dialog-family consolidation happens here, once**: merged
      `arc-dialog` (today's modal, renamed per 1.3) built directly on
      `<dialog>`; `ArcConfirm.open(): Promise<boolean>` and the declarative
      instance-`confirm()` use case both preserved (the review's diff showed
      these are different shapes, not duplicates of each other — the
      duplicate was `dialog.js` vs `confirm.js`).
- [ ] Rework `OverlayMixin` off its `updated()`-override onto the controller
      pattern (the exact pattern `props.js`'s docstring rejects), and adopt
      overlay + dismiss contracts across every `open`-declaring component
      (~25 today; ~10 use neither contract — which is what made guided-tour
      and speed-dial possible).
- [ ] Container queries replace viewport breakpoints where the component,
      not the page, is the unit — starting with `navigation-menu` (the 900px
      viewport gate that made its desktop bar untestable and
      placement-fragile).
- [ ] **Deferred, on purpose:** the `static arc = {…}` declared-behavior
      axis. `subscriptions.js` already implements the controller the
      review's architect wanted to invent; revisit as v4.x once the overlay
      adoption has soaked. (Re-vibing guard.)

**Exit:** overlay adoption at 100% of `open`-declaring survivors; the 2.4d
central dismissal contract green across all of them; a11y-audit green.

### 4.5 The style pass (L) — *the design language, made homogeneous and adaptable*

Runs after 4.1 (style only survivors), parallel with 4.3/4.4; must land
before any docs screenshots, the beta, or 4.9's conformance statements.

- [ ] **Typography homogenization.** One type scale, expressed as font-role
      tokens; every component consumes roles, never raw font properties.
      `font-roles.test.js` / `font-weights.test.js` are the existing guards —
      extend them to assert *no component styles text outside a role* and let
      them enforce the pass.
- [ ] **The illumination vocabulary.** Codify "lobes of light and soft
      gradients" as first-class tokens — a small set of glow/light-lobe
      primitives (building on the existing glow scale) and gradient tokens
      with defined stops. Per-component ad-hoc gradients migrate onto them;
      `gradient-stops.js` and `pinned-schemes.js` are the guards (the
      14-gradients-darkened-to-black incident is the exact failure mode).
      The two hardcoded macOS traffic-light hex triplets (`code-block.js`,
      `terminal.js`) get tokens or their components left in 4.1.
- [ ] **The two-color theming contract.** The public theme surface is
      deliberately tiny: **two primary colors are the inputs**; neutral,
      radius, and density are optional *preferences*; everything else —
      surfaces, states, glows, gradients, all schemes — derives at build
      time through the existing OKLCH pipeline (`shared/color.js`
      solveContrast + the contrast contract from commit 21be4c70). ARC stays
      an opinionated design language; adaptation means changing the inputs,
      never the formula. Document it as *the* theming API. (Named the
      "two-color contract" everywhere — 4.9, 4.11, DESIGN.md.)
- [ ] **Scheme parity.** Light scheme becomes first-class alongside dark
      (dark-first stays the identity). `themes/high-contrast.css` **is
      folded into the generated pipeline** so its "7:1 AAA" claim is verified
      by the same build-time assertion as the generated schemes; dropping
      the claim is the fallback only if `solveContrast` demonstrably cannot
      reach 7:1 on the palette.
- [ ] **Density scale.** `compact`/`comfortable` via tokens — enterprise
      table stakes, nearly free once everything sits on the token pipeline.
- [ ] **DESIGN.md updated** to codify the language: type roles, illumination
      vocabulary, the two-color contract, the existing hard bans.

**Exit:** full `pnpm check` (token linters), the contrast contract, and a
complete a11y-audit run across both schemes — visual changes do not merge on
eyeball approval alone.

### 4.6 Wrapper matrix (L) — *gated on 2.4a green AND 4.1 landed*

(Don't build the wrapper matrix over a catalog about to shrink.)

- [ ] Drop Preact + Solid packages **with a registration story** (documented
      side-effect imports or a `register()` entry point — a `.d.ts` alone
      cannot define elements, and Preact lowercases `on*` props so wrapper
      event mapping is a real capability, not boilerplate). Ship generated
      `preact-jsx.d.ts` / `solid-jsx.d.ts` from core, mirroring
      `types/react-jsx.d.ts`. Migration entries, not silent breaks.
- [ ] Slim React: generate `*Props` from `elementProperties` instead of
      deleting published types outright (they are public API and
      `wrapper-slots.js`'s React probe reads them — deprecate across one
      major). Delete `create-component.ts` after a release with a
      deprecation notice.
- [ ] Angular: generated `ControlValueAccessor` + `NG_VALUE_ACCESSOR` for the
      46 write-back controls (`formControlName`/`ngModel` currently work on
      zero of them — the main reason an Angular wrapper exists).
- [ ] Per-package versioning (changesets or diff-gated publish) with a
      version-floor assertion in each wrapper, replacing lockstep
      `pnpm -r publish` + 9-file bump.
- [ ] Document the native paths (`react-jsx.d.ts`, `CUSTOM_ELEMENTS_SCHEMA`,
      Vue `isCustomElement`) in `docs/src/pages/docs/frameworks.astro` —
      built and shipped today, mentioned nowhere.

**Exit:** 2.4a runtime suites green against the *new* matrix (4 packages + 2
type augmentations); smoke-test-wrappers green on tarballs.

### 4.7 Icons split (M) — *after 4.1; independent otherwise*

- [ ] `@arclux/arc-ui-icons`: 16 MB of the 22 MB core tarball is 3,414 icon
      modules. Redesign `src/content/icon-registry.js`'s relative-path
      resolution into explicit registration; remove the 821 KB static
      `lucide.js` barrel and the per-icon dynamic-import resolver from the
      default graph. Preserve the `barrelExclude` discipline (the shiki
      lesson) in whatever shape replaces it. The `./icons/*` export
      wildcards are public subpaths — this is a documented breaking change
      with a MIGRATION entry, not a cleanup.

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

### 4.11 Docs & release posture (M) — *last before the tag*

- [ ] README: the `components-182` badge and the count-led hero replaced
      with the actual differentiator — *change framework without changing
      your design system*. The count is the incentive that produced the
      tail.
- [ ] MIGRATION.md complete before the tag: every merged/cut/renamed tag,
      the dialect aliases, the wrapper story, the icons split, the two-color
      theming contract, the barrel gating.

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
