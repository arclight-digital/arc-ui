# Handoff — arc-ui test coverage / v4 declaration layer

Read `test-findings.md` first; it is the state of the world and the follow-up
backlog. `test-audit.md` is the original authenticity audit. **The current
plan is `V4-PLAN.md` at the repo root** (2026-08-03, agent-verified — start
there for phases, gates, and the do-NOT list of refuted cuts). The older plan
at `~/.claude/plans/snoopy-growing-rose.md` is **substantially superseded**,
see "What changed under the plan" below.

## Where things stand

- **Suite: 4,664 passing, 0 failing, 2 skipped**, ~30s, clean (2026-08-15).
  `pnpm check` 22/22, `pnpm generate` diff-clean, `pnpm mutate:sample` green.
- **Per-component coverage is *nearly* closed, and the old claim here was too
  strong.** This file used to say the components with no dedicated suite "are
  all presentational primitives" and that "zero components with real behaviour
  are untested". 3.2 disproved it by walking into one: `arc-diff` is an LCS
  implementation with a backtrack and two render modes, and it had **no
  mention in any test file at all** — not a sweep, not a contract suite,
  nothing but the derived prop conformance every component gets. It has a suite
  now (`diff.test.js`, mutation pair 100%).

  The honest count, verified by grepping each `@tag` against the whole test
  directory rather than by eye: **44 tags are still not mentioned in any test
  file.** Most really are primitives (`arc-stack`, `arc-center`, `arc-kbd`,
  `arc-skeleton`, `arc-spinner`, `arc-separator`…), but not all of them.
  Worth a pass before or during Phase 4: **`arc-sparkline`** (scales data to a
  path), **`arc-masonry`** (column balancing), **`arc-animated-number`**
  (tweening), **`arc-number-format`** (Intl options — 2.3 already found a
  `RangeError` in it through the conformance probe), and
  **`arc-comparison`/`arc-comparison-column`**. `arc-table` is on the list too
  and 4.2 merges it away, so it does not need one.

  The general lesson matches ground rule 2: "all presentational" was a
  judgement made from a mental list, and the list was wrong. Breadth is *mostly*
  done; depth is what the mutation gate measures.
- **`pnpm generate` was NOT diff-clean, contrary to what this file used to
  claim.** Running it produced a large one-time catch-up: ~150 wrapper files
  across all six packages, plus the `packages/html` examples. The changes are
  all declaration-layer (`variant = 'default'` losing its default, enums
  gaining `''` as a member) — i.e. the *previous* session's vocabulary
  migration had updated `custom-elements.json` without regenerating the
  wrappers from it. A second `pnpm generate` is now a fixed point, so the tree
  is consistent again. **Phase 0's gate includes `pnpm generate` diff-clean —
  that catch-up is now sitting in the working tree and belongs in slice 0.5.**
- The older "4,565 passing / 18 skipped" figure in previous versions of this
  file is not a regression — the suite was deliberately reshaped from 4,629 to
  ~3,400 tests with the *same* detection, after fault injection showed one
  broken mechanism was being reported 238 times. See "Test posture" in
  test-findings.md before reading any test-count trend as progress.
- **Phase 3 is DONE (2026-08-15).** 3.2's two patch fixes landed: `arc-diff`'s
  LCS is memoised on the `(original, revised)` pair, and `arc-json-tree` has an
  **ancestor-scoped** cycle guard on both of its walks. Ancestor-scoped is the
  design, not an implementation detail — "have I seen this object anywhere in
  this render" would mark the second of two siblings sharing one object as
  circular and hide real data. The json-tree crash only fired with `expanded`
  unbounded, which is why an object containing itself looked fine in every
  casual test.
- **V4-PLAN Phase 2 is DONE (2026-08-15).** 2.5 climbed the two large mutation
  pairs — `listbox-controller` **50.00% → 98.68%** and `position-controller`
  **52.83% → 88.46%** — and both are now ratcheted and enforced in CI rather
  than skipped. Two transferable lessons, both in the 2.5 entry of V4-PLAN and
  in the testing rules below: **a shared module's return value is invisible
  through its consumers** (fifteen survivors were `handleKeydown`'s `return
  true`/`return false`, because every consumer falls through to its own switch),
  and **a measurement is only evidence if the thing measured can differ** (two
  position-controller tests asserted numbers that could not move).
  2.6 took the four earned trims. The private-field pass — ~150 assertions
  across 15 files moved onto rendered surface — found a live bug in the
  assertion it replaced: `_rafId` is set *before* the rAF body runs, so
  `expect(el._rafId).to.not.equal(null)` passes against a callback whose first
  line returns. Its first trim also had the wrong justification written down
  (`conformance.test.js` does *not* derive the `blockedBy` property-path case;
  `props.test.js` does), which is worth more than the trim.
- 2.3 closed the same day: every
  numeric prop in the library is declared, and the vocabulary gained
  **`nullable`** — a kind-agnostic option for props whose *unset* state is a
  third meaning rather than the default. Fourteen props needed it (arc-gauge and
  arc-meter's zone thresholds, number-input's bounds, waveform.duration,
  level-meter.peak, activity-heatmap.max, number-format.decimals, clock.hour12),
  and it retired `boolean-defaults.js`'s second exemption. The pattern gap
  (arc-aspect-ratio.ratio) is still one instance and did **not** earn a term.
- **Earlier the same day**, 2.2 closed:
  `list()` is the vocabulary's array term, the four array dialects are named in
  its docstring, and `boolean-defaults.js` now asserts that *every* boolean prop
  is declared through `flag()` — its BASELINE is gone rather than emptied, and
  the two exemptions carry a stated `// NOT flag():` reason in the source.
  **Three gaps in the vocabulary are now on the table for 2.3 together**: a
  string *pattern* (`arc-aspect-ratio.ratio`) and two *nullable sentinels*
  (`activity-heatmap.max`, `arc-clock.hour12`), each currently handled by hand.
- **Previously:** 2.0 (mutation
  referee in CI), 2.4a–e, and now **2.1 — the findings ledger is closed**
  (2026-08-15). Every finding in `test-findings.md` carries a disposition in
  its own heading; `BUG:` pins went **47 → 9**, and all nine are pinned by
  decision — six on `arc-speed-dial`/`arc-guided-tour`, which 4.1 deletes, plus
  #74 and #86. Read the 2.1 entry in V4-PLAN for the five lessons; the two that
  will bite again are that **findings under-count their own population** (three
  were filed against one component and had four, or filed as five instances and
  were nine) and that **a component cited as the reference has to be checked,
  not copied** (`arc-resizable` is named three times here as the working example
  and had #89 in it).
- **Two scanner traps, both live.** The manifest analyzer binds a JSDoc block to
  *whatever declaration follows it*, so inserting a shared helper between an
  element's doc comment and its class silently un-tags the element —
  `ArcOption` lost its `tagName` and the React wrapper stopped compiling.
  And `event-conventions.js` balances quotes across `new CustomEvent(...)`
  argument text **without skipping comments**, so one apostrophe in a comment
  inside those arguments makes every later dispatch in the file invisible to it.
  Both are caught by `pnpm generate`, neither by the suite.
- **`pnpm test` is now correct by construction** — a `pretest` hook regenerates
  the gitignored icon modules (0.13s), so the 17 "pre-existing failures" that
  used to be normal are gone. A red suite means something now.
- **Source is no longer frozen.** The pin-don't-fix policy was superseded when
  this became v4 work. Every behavioural change is described in
  `test-findings.md`, and 2.1 flipped each `BUG:` pin it fixed into a regression
  test rather than deleting it.
- **Three checks tightened, and one grew a runtime half.**
  `empty-attributes.js`'s BASELINE is **empty** and the rule is strict;
  `conformance-surface.test.js` gained the runtime sweep for the same class,
  because the static check reads source and states its own blind spots; and
  `form-contract.test.js` no longer excuses `arc-rating` from its `required`
  sweep.

Run everything with `pnpm` directly (it is on PATH now — older notes saying
`corepack pnpm exec` are stale).

## The big change: the declaration layer

`src/shared/props.js` makes a component's contract a **value rather than prose**:

```js
static properties = {
  selected:    int({ default: 0, min: 0, max: '_maxIndex', clamp: 'toRange' }),
  orientation: oneOf(['horizontal', 'vertical']),
  showDots:    flag(true, { attribute: 'show-dots', negative: 'no-dots' }),
  scrolled:    flag(false, { derived: true }),   // an output, not an input
};
```

Adopted by **165 of 207 components, 291 props**, via
`scripts/codemod-declared-props.js`. Normalisation runs through a **reactive
controller**, not `willUpdate`/`updated` overrides — deliberately, so a
component that forgets `super.updated()` cannot silently lose its contract.

Two derived suites read the declarations back at runtime and generate their own
assertions, so a component gains coverage by declaring itself and there is no
table to maintain:

| file | derives from | tests |
|---|---|---|
| `test/conformance.test.js` | `elementProperties` + `arc` metadata | 1,957 |
| `test/conformance-surface.test.js` | `custom-elements.json` (slots, parts) | 569 |

Both accept `globalThis.__ARC_CONFORMANCE_ONLY__ = ['arc-x']` to scope a run —
the unscoped suite imports 207 modules and takes ~40s.

**This fixed 10 recorded findings outright** (#1 ×2, #3, #17, #20, #48, #49, #50,
#52, #58) rather than pinning them.

### `blockedBy` — a constraint stated in terms of another prop

`open: flag(false, { blockedBy: 'disabled' })`. While the named prop is truthy,
this one is held at its declared default, on both paths. Added for finding #58,
which was the *fourth* instance of one shape (see #1, #14, #47): a constraint
enforced on the interaction rather than on the state. Five components documented
`disabled` as "preventing the calendar from opening" and guarded only the toggle
handler.

The check in `normalizeValue()` is kind-agnostic and sits above the enum/number
branches, so exposing it on `oneOf()`/`num()` is a one-word pass-through when a
case turns up — **do that rather than writing a second implementation**.

Deliberately *not* a `normalize: (v, host) => …` predicate. An opaque function is
prose again: the conformance suite can derive nothing from it and
`scripts/prism-props.js` cannot read it. There is no override, either.

**It is enforced twice on purpose** — the setter refuses a set made *while*
blocked (so nothing is scheduled at all), and `normalizeValue` catches the
blocker turning on *afterwards*, plus the attribute path where Lit may apply
`open` before `disabled`. Neither half covers the other's case.

**Do not move the accessor patch to the instance.** Lit's dev-mode
`class-field-shadowing` guard throws on any own property that shadows a reactive
accessor and cannot tell an own accessor from an own data field — it cost 172
conformance failures before it went onto the prototype. Full reasoning in
`test-findings.md` §58.

## The second shared layer: `src/shared/subscriptions.js`

Finding #55, fixed. Four components subscribed to a ResizeObserver or a scroll
listener in `firstUpdated` and unsubscribed in `disconnectedCallback`. Those two
lifecycles do not pair — the first runs once per *element*, the second once per
*connection* — so the first reparenting unsubscribed them silently, leaving a
component that still rendered and still answered every property but no longer
reacted.

`observeResize(host, target, cb)` and `listen(host, target, type, handler)` are
reactive controllers that attach on `hostConnected` **or** the first
`hostUpdated` after it (whichever is the first moment the target exists), detach
on `hostDisconnected`, and re-attach if the target element is replaced between
renders. Same argument as `props.js`: the rule is stated once rather than
restated per component, and a controller's hooks fire regardless of what the
host overrides.

**Use these for any new subscription.** The two-phase rule is the whole point —
`connectedCallback` alone runs before first render, so a shadow-DOM target is
not there yet, which is what made every hand-rolled version get it wrong.

Pinned by `test/reconnect-sweep.test.js` (7 tests, four components plus a
control that was already correct). `test/helpers.js` gained
`spyResizeObserver()`, which asks whether an element is under observation *now*
rather than reaching for a component's `_resizeObserver` field — prefer it for
anything observer-shaped. Full write-up in `test-findings.md` §55.

## Open-time work goes in a lifecycle hook, never in the toggle handler

Finding #59, fixed in `time-picker`, `date-picker` and `date-range-picker`. All
three prepared panel state (anchoring the calendar to `value`, syncing the time
columns, clearing a stale preview) inside `_toggleDropdown` — the *click* path —
while documenting `open` as settable programmatically. `el.open = true` opened a
panel that had skipped its own setup.

**Put it in `willUpdate(changed)` keyed on `changed.has('open')`.** `arc-select`
has always done it that way. `willUpdate` over `updated` because the values are
reactive state and Lit runs `willUpdate` → `hostUpdate` → `update`, so it folds
into the same render.

`test/open-parity-sweep.test.js` is the guard: it opens all five open-able
components both ways and compares the rendered panel markup, so a sixth
component acquiring the divergence fails without anyone writing a test for it.
**Add new open-able components to its `CASES` list.**

## The third shared layer: `src/shared/dismiss-controller.js`

Finding #60, fixed. Was `ClickOutsideController`; the rename is the point. An
overlay is abandoned two ways — a pointer lands elsewhere, or **focus** moves
elsewhere — and only the first was implemented, across 18 consumers. The three
components that open on *focus* (`multi-select`, `combobox`, `tag-input`) never
closed for a keyboard user at all. The ones that looked fine were fine only
because they open on a trigger click.

Both halves are on by default. Use it for any dismissable overlay.

Three things not to re-derive:

- **A null `focusout.relatedTarget` is deliberately ignored.** Reading through to
  `document.activeElement` (sync or deferred) was tried twice and broke 16 then
  11 tests: these panels rebuild their own contents, so focus falls to `<body>`
  mid-navigation. The focus half only handles focus moving to a *real element*
  outside; every other departure is a pointer, which the pointer half has.
- **Key `activate()` on whatever state can leak**, not on "is the panel open".
  `tag-input`'s focus ring outlives its panel, so it activates on
  `_open || _focused`.
- **A test holding two open overlays at once is now testing the harness** —
  opening the second pulls focus out of the first and correctly dismisses it.
  Read one fixture before building the next.

## A controller with `hostDisconnected` and no `hostConnected` is a one-way door

Findings #72, #73 and #75 — **all three controllers in `src/shared/` that had
not adopted `subscriptions.js` had the same defect**, and the direct suites
written for V4-PLAN 2.4c found them in an afternoon.

The shape every time: the controller tears its listeners down in
`hostDisconnected`, and the only thing that puts them back is the consumer's
`updated()`, keyed on an open-state **change**. Reparenting an element changes
no property and schedules no update, so an overlay that was open when it moved
came back *rendering normally and answering every property* while being
permanently dead — undismissable (`DismissController`, 17 consumers), deaf to
Escape and scrolling behind itself (`OverlayMixin`, 5), or answering no key at
all (`MenuKeyboardController`, 3). Twenty-five components, each individually
correct.

**When you add a controller, pair the hooks.** And note the fix is *not*
"activate on `hostConnected`":

- **Activation is state, not structure.** Most of these controllers are
  correctly inactive most of the time, so arming unconditionally re-arms every
  dismissable component on the page on every move. Record what was active in
  `hostDisconnected` and restore exactly that.
- **Decide what carries across.** `MenuKeyboardController.detach()` clears
  `focusedIndex`, which is right for a close and wrong for a reparent — losing
  your place mid-navigation is the visible half of that bug. It is carried
  across explicitly rather than by changing `detach()`.
- Each suite pins **both** directions: active comes back, inactive stays inert.

`scripts/checks/lifecycle-pairing.js` would have found all three without a
fixture, and covers files that do not exist yet — but its subject is the
`firstUpdated`/`disconnectedCallback` pair in *components*, not the
`hostConnected`/`hostDisconnected` pair in *controllers*. **Extending it is the
highest-value check left**; it belongs with 4.10's parser consolidation.

## Two platform rules that make tests pass without running

Both cost a debugging cycle in the 2.4c work.

1. **Event dispatch is skipped entirely on any node where the retargeted
   `target` and `relatedTarget` come out equal.** So a synthetic `focusout`
   fired *at a host* naming a shadow-internal `relatedTarget` never runs the
   host's listener — and the test passes whether the code works or not. Three
   tests in the first draft of `dismiss-controller.test.js` were green and
   empty. Fire `focusout` from a **slotted light-DOM child**, which is both the
   realistic shape and the only one that reaches the listener. (Corollary about
   the component, not the test: a focus move that begins and ends inside one
   shadow tree produces *no* `focusout` at the host at all.)

2. **A form-associated element that reflects `disabled` in
   `formDisabledCallback` disables itself out of ever hearing about being
   re-enabled** — the HTML spec makes a present `disabled` attribute
   self-disabling, so the computed state stops depending on the ancestor
   fieldset and the platform never calls `formDisabledCallback(false)`. This is
   live in all 27 form controls: **finding #74, pinned not fixed**, because
   every candidate fix changes the `disabled` contract across 27 components and
   the ~30 stylesheets keyed on `:host([disabled])`. Read §74 before touching
   `disabled` anywhere.

## Sweeps must derive their subjects, or they go blind

The single most repeated lesson of this batch. Four guards now exist; two derive
their subjects and two carry hand-written lists, and **both of the hand-written
ones missed a real component**:

| guard | subjects from | verdict |
|---|---|---|
| `conformance*.test.js` | declarations / manifest | derives |
| `disabled-focus-sweep.test.js` | `custom-elements.json` | derives |
| `scripts/checks/lifecycle-pairing.js` | the source tree | derives |
| `reconnect-sweep.test.js` | a hand list of 4 | **missed 3** (#64) |
| `open-parity-sweep.test.js` | a hand `CASES` list | at risk |

`lifecycle-pairing` found `arc-marquee` and `arc-infinite-scroll` within seconds
of being written — after I had manually grepped and concluded the cluster was
closed. Prefer a `scripts/checks/` static check when the defect is visible in the
source: it needs no fixture, runs in 56ms, and covers files that do not exist yet.

Two related traps, both of which cost real bugs here:

- **A sweep that mounts only the bare tag sees only the safe shape.** That is
  what `VARIANTS` in `disabled-focus-sweep` is for — `arc-button` renders a
  `<button>` bare and an `<a>` with an `href`, and only the second was broken.
- **Asserting a private field name cannot tell "working" from "constructed".**
  `arc-anchor-nav` passed its observer test for as long as it existed while
  observing nothing (#65). Use `spyResizeObserver()` /
  `spyIntersectionObserver()` from `test/helpers.js`, which ask what is under
  observation *now*.

## `disabled` is never a stylesheet rule alone

Finding #61, fixed in seven components. `:host([disabled]) { pointer-events: none }`
removes the pointer affordance and **nothing else** — not the tab stop, not the
keyboard, not drag-and-drop, not a dispatched event. Thirty components use that
rule; seven were relying on it.

When adding a `disabled` component, do all three:

1. `?disabled` on native controls, `tabindex=${d ? '-1' : '0'}` +
   `aria-disabled` on the div-with-a-role ones.
2. **Drop `href` on an `<a>`** — an anchor has no `disabled` attribute, so that
   is how the platform takes a link out of the tab order. Keep `role="link"`.
3. Guard the handlers in JS. CSS does not stop drag-and-drop or a dispatched
   pointer, and it is what a future stylesheet refactor leaves behind.

`test/disabled-focus-sweep.test.js` derives the guard from
`custom-elements.json`, so components are covered by existing. **Its `VARIANTS`
map is the part to maintain**: a component that renders a different element under
some prop (arc-button becomes an `<a>` given an `href`) needs an entry, or the
sweep only ever sees the safe shape. Adding the first entry immediately found a
second component nobody had reported.

## Five things that will bite you

1. **prism must be able to read your declarations.** `@arclux/prism` finds props
   by regex over `name: { … }`; a helper call is invisible to it and silently
   drops the prop from all six wrappers with a green exit code. 2.12.0 added
   `config.propsFrom`, implemented here in `scripts/prism-props.js`. **If you add
   a vocabulary helper, teach that file about it**, and re-run `pnpm generate`
   and diff the wrapper packages. `prism-feedback.md` tracks what is still open
   upstream (runtime resolution from `Ctor.elementProperties`, which would delete
   the hook entirely).

2. **`disabled` on a form-associated element cannot be tri-state.** The platform
   calls `formDisabledCallback(true)` for a *present* `disabled` attribute
   regardless of value, exactly as `<input disabled="false">` is disabled. Those
   27 components keep `{ type: Boolean, reflect: true }` on purpose.

3. **`flag(true)` needs a `negative` name and throws without one.** A true
   default has no presence-based markup for its false state. Do not "fix" this by
   reflecting `="false"` — 14 components style `:host([border])`, `:host([open])`
   and friends, and that would leave every such rule unmatched in the default
   case.

4. **Deleting a component needs `pnpm generate` run twice**, and the first run
   tells you so only by failing `wrapper-types` with a wall of TS2307. prism
   repairs barrels *before* it sweeps orphaned files (`cli.js:673` then `:677`),
   and the barrel repair decides what to remove by asking the filesystem — so on
   the first pass every specifier still resolves, nothing is pruned, and then the
   files it pointed at are deleted underneath it. The second run sees the gap and
   fixes it; the third is a no-op, so idempotence returns immediately. Reported
   upstream in `prism-feedback.md`.

   The same run will also fail `check-export-map` for the deleted component's
   subpath. That one is not a bug: removing a published subpath is a breaking
   change, so `generate/exports.js` never removes an entry — you delete it from
   `packages/web-components/package.json` by hand and write the MIGRATION entry
   that goes with it.

5. **A new component needs `@status`, and `pnpm generate` refuses without one.**
   Since 4.1 every component declares `stable`, `beta` or `experimental` in its
   JSDoc, and there is deliberately no default — a brand-new component silently
   inheriting `stable` is the one answer omission must not give. `@arc-group` is
   optional and validated the same way: an unknown value throws rather than
   quietly producing a component that is in no barrel at all.

   Both are read by `scripts/lib/component-tags.js` and composed into prism's
   `barrelExclude` by `scripts/lib/barrel-rule.js`, which is import-free so the
   browser suite can exercise it. **Do not hand-edit a barrel** — `barrel-gating`
   compares what is on disk against that rule in both directions and will say so.

## What changed under the plan

The plan sized Tiers A and B as hand-written per-prop tests. **That premise is
gone**: of 158 components with no hand-written test file, 123 are on the
vocabulary and only **1** has a contract that is props alone. Tier A's "enum
fallback" and "render + slot" sweeps are subsumed by the derived suites.

What is genuinely left is behaviour, which no declaration can derive.

## Next, in the order I would do it

1. **The eight large stateful inputs** — the highest expected findings yield, and
   they have the Tier C profile (interactive, stateful, untested).
   ~~`data-grid` (883 LOC)~~ **done** — 74 tests, findings #53 and #54.
   ~~`menubar` (758)~~ **done** — 50 tests, finding #56 (fixed).
   ~~`date-picker` (707)~~ **done** — 54 tests, findings #57 and #58, both fixed.
   ~~`transfer-list` (677)~~ **done** — 69 tests, **no findings**; it is the first
   component in this batch that was simply correct. Its `@prop` prose and its
   code agreed everywhere, including the two places they usually part company
   (`readonly` being narrower than `disabled`, and the empty-pane `role="listbox"`
   removal). Worth reading as the reference for what a clean one looks like.
   ~~`time-picker` (617)~~ **done** — 61 tests, finding #59 (fixed across three
   components) plus a `format` enum that fell through to the wrong member.
   ~~`multi-select` (558)~~ **done** — 57 tests, finding #60 (fixed in the shared
   dismiss layer, across three components).
   ~~`color-picker` (555)~~ **done** — 58 tests, findings #61 (fixed across
   seven components) and #62 (fixed).
   ~~`data-table` (542)~~ **done** — 47 tests, findings #63, #64, #65, all fixed.

   **All eight are done.** The remaining backlog is items 2-5 below.

   Two things from `data-grid` that will probably recur in the rest:
   *the roving-focus handler reads `this._focusRow/_focusCol`, not `e.target`* —
   so a test must walk focus there with arrow keys rather than dispatching at
   the cell it wants; and *the select-all `<th>` also carries
   `role="columnheader"`*, so any header index shifts by one under `selectable`.
   Both cost a debugging cycle here.
2. ~~**`arc-navigation-menu`**~~ **done** — 32 tests, findings #66 and #67, both
   fixed. The five recorded traps were all real; a **sixth** was what actually
   made the first attempt unstable, and it is the one worth carrying forward:
   the runner's viewport is 800px and this component collapses at 900px, so its
   desktop bar is `display: none` and unfocusable for the whole suite. See the
   `.to.equal()` note below — that is how it presented.
3. ~~**The scroll-listener group**~~ **done** — 30 tests, finding #68 (fixed).
   Confirmed `arc-scroll-spy` is **not** an IntersectionObserver component
   despite its comment; it measures geometry on purpose. All four are
   connection-scoped and survive reparenting — the shape to copy.
4. ~~**`arc-code-block`'s resize re-measure**~~ **done** — finding #69, fixed,
   10 tests. The suspicion recorded here (that the measurement was gated behind
   `_highlight()`) was **wrong**: resizes and short→long both worked. Only
   long→short was stuck, because it changes neither the body's box nor the
   highlighted markup.
5. **`num()`/`int()` rollout — started, finding #70.** Five components moved:
   `meter`, `gauge`, `level-meter` (`value` clamped to sibling `min`/`max` props)
   and `hotspot`, `image-compare` (0-100 percentages). All five clamped in the
   *render* and not in the value; meter and gauge announced the unclamped number
   on `aria-valuenow`, so the visual and accessible readings disagreed.

   **`oneOf` now takes numbers**, for documented sets rather than ranges —
   `step: oneOf([1, 5, 15, 30])`. Use it wherever the prose lists members; use
   `num({min, max, clamp})` only where it names a range.

   **Check the class extends `DeclaredPropsMixin` before adding a declaration.**
   `arc-meter` did not, and the declaration would have been inert — normalising
   nothing, with no error anywhere.

   What is left: the remaining ~70 prose constraints in `@prop` text. Worth
   surveying which the current vocabulary already covers before picking off more
   props one at a time — the yield so far has all been the same shape (a
   constraint on the render or the interaction rather than on the state), so
   grep for that pattern rather than for numeric props.

## Mutation testing

The plan's ≥75% gate has **not** been met: 61.45% → **67.52%** after the
declaration layer, and has not been re-measured since. The harness is real and
reproducible — Stryker 9.6.1 with the mandatory browser-activation bridge, config
in `test-audit.md`'s appendix, and a worked setup under the session scratchpad.

Three results worth carrying forward:

- **`arc-tree-view` is a clean control.** It is the one file of the three with no
  enum or flag props, and it did not move by a single mutant. That is what makes
  the movement on the other two attributable rather than noise.
- **Derived tests are real but modest** — about +5 points on an adopted
  component. The largest single gain in the whole exercise was still a
  hand-written fixture fix (+12 on `range-slider`). Both facts matter: derived
  conformance raises the floor cheaply across the library; it does not substitute
  for tests written against actual behaviour.
- I was **wrong** that the `static properties` block was depressing the score.
  Excluding it moves the number ±2 points in *both* directions. The gate is fair.

## Conventions that are earning their keep

- **A bulk edit needs a structural predicate, not a textual one.** Removing the
  295 constructor defaults took three attempts: matching `this.X = <literal>`
  anywhere deleted `dialog.js`'s close path; scoping to the constructor still
  caught `select.js`'s `onDismiss: () => { this.open = false }`, which lives at
  constructor depth. Only "brace depth 1" was right. Take the backup *before*
  the first run — that is what made both mistakes free.
- **Check that the thing you are about to delete is actually redundant.** The
  same 295 assignments were not, until the mixin seeded declared defaults at
  construction: normalisation runs in `hostUpdate`, too late for
  `document.createElement('arc-x').flag`. One deleted line and one purpose-written
  test settled it in a minute.
- **A derived test cannot kill a mutant in the declaration it derives from.**
  conformance asserts "starts on its declared default", so mutating the default
  moves the expectation with it. Any declared default that is a *product*
  decision — `arc-carousel` looping by default — needs a hand-written assertion.
  The fault-injection harness should gain a third fault (mutate a declaration)
  to make this measurable.
- **Run `pnpm mutate` on a file before believing its tests.** `data-table` had
  47 hand-written tests and killed 48% of mutants; two survivors were in guards
  added by this audit. Passing tests say the feature works, not that the
  branches are pinned.
- **Never read layout after `settle()`.** Use `stableRect()`. `settle()` is a
  fixed two-frame wait; a positioned or animated overlay is not stable then.
  This was the flake: `arc-context-menu` animates in over 100ms (~6 frames) and
  the test measured it after 2, so the position was read mid-animation. It had
  *two* races — placement and animation — and fixing only the first made it
  rarer while leaving it alive, which I initially reported as fixed.
- **Never run the suite through a pipe.** Use `pnpm test:log`. The flake has
  destroyed its own evidence three times: twice by re-running until green, once
  by piping the runner through `grep` for the summary line, which threw away the
  assertion message sitting under the ❌. All three were process failures, and
  "be careful next time" had already been tried. The script writes the full log
  first and derives the summary from the file.
- **Measure a test layer's value by breaking things, not by counting.** Fault
  injection sized the derived suite in two runs: a broken mechanism produced 238
  failures across 86 components, a component dropping the vocabulary produced 4.
  One bug reported 238 times is not 238 tests' worth of information. The suite
  went 4,629 -> 3,418 tests and 46.7s -> 24.7s with the same detection. See
  "Test posture" in test-findings.md.
- **Test the shared spine directly, once.** `props.js` carried 166 components and
  had no tests of its own — it was covered only by inference, 238 times over.
  Writing `props.test.js` found #71 within the hour. Anything this many
  components depend on gets its own suite and a higher mutation gate.
- **Derive tests from the JSDoc contract.** Testing `@prop` prose is where the
  yield is — most findings here are the docs and the code disagreeing.
- **The recurring shape is a constraint enforced somewhere other than on the
  state** — on the interaction (#1, #14, #47, #58, #59), on the stylesheet (#61),
  or on the render (#70). When reading a new component, grep for that rather than
  for a category of prop.
- **Pick fixture values where the arithmetic is observable.** `min` defaulting to
  0 made every arithmetic mutant in `range-slider` unkillable *regardless of the
  assertion*. Related: colours that sit on the integer-HSL lattice hid #62, and a
  filter matching the first or last item would have hidden an off-by-one in
  `transfer-list`.
- **Exercise both branches of every ternary.** Home was tested on the low thumb
  and End on the high thumb, never crossed, so both conditionals survived.
- **Assert the rendered surface, not the private field behind it.** `_current`,
  `_focusRow`, `_progress`, `_activeIndex` and friends are *state*; a component
  that tracks state perfectly and stops rendering it satisfies every assertion
  made against the field and is broken. Nearly always there is a surface: the
  selected dot's `aria-selected`, `[tabindex="0"]`, the fill's `scaleX`, the
  `aria-activedescendant` id, the class the frame writes. A handful stay
  private and each says why in place — the interval handle in
  `clock.test.js`, the subscription flag in `overlay-adoption.test.js`, the
  controller map in `menubar.test.js` and `position-controller.test.js`, and
  `_formValue()` in `form-data-sweep.test.js`. Every one is a claim about a
  *resource* rather than a behaviour, and that is the test for when the
  exception applies.
- **A measurement is only evidence if the thing measured can differ.**
  `position-controller`'s scroll test anchored to a `position: fixed` element,
  whose rect is scroll-invariant, and asserted the panel had *not* moved — true
  of a controller that registers no listener at all. Its sibling asserted a
  coordinate (`anchor.bottom + offset`) that a panel resize cannot change. Both
  read as thorough and detected nothing; every mutant under them survived.
  Before trusting a test, ask what value it would print if the code were
  deleted.
- **`ResizeObserver.observe()` schedules an initial delivery, and it lands after
  your synchronous test body.** So a test that observes, changes a size and
  polls gets its callback either way: the one it was promised, or the initial
  one arriving late. A missing re-observation is invisible. Put `await
  observed()` between setup and perturbation. Same trap for IntersectionObserver.
- **Poll with `until()`, never sleep a fixed time.** A fixed wait encodes a guess
  about machine load. Its default is 1200ms, deliberately under Mocha's 2000ms,
  so the assertion's message wins over a bare runner timeout.
- **Always include an anti-vacuity guard**, and make sure it can actually fail.
  `open-parity-sweep` needed a three-part one because two of its panels are
  always in the DOM; `disabled-focus-sweep` asserts its own manifest is non-empty;
  and `arc-anchor-nav` passed an observer test for as long as it existed while
  observing nothing (#65).
- **A comparison between two components is only evidence if both sides were
  exercised the same way.** Finding #46 was recorded as "date-range-picker never
  anchors, unlike date-picker" — but one was opened by property and the other by
  click. The real defect (#59) was in both.
- **Two harness traps that make tests pass vacuously.** `record()` strips the
  `arc-` prefix, so the key is `change` — `only(seen, 'arc-change')` silently
  returns `[]` and every `equal(0)` assertion passes. And `FormControlMixin`
  baselines its reset state on *first connect*, so a `value` assigned after
  `mount()` is not what `form.reset()` restores; build the element detached.
- **`arc-option` must be registered explicitly.** Unupgraded it has neither
  `label` nor `value`, so every option reads blank and every chip falls back to a
  raw value. The parent's `.register.js` pulls in the class, not the
  registration. It cost 22 failures once and 22 more later.
- **Assert through `[part=]`, ARIA, events and computed style.** Note the
  trade-off: class-name mutants survive by design, so a class-name typo breaks
  styling silently and no test here catches it.
- **Any `.to.equal()` between DOM nodes hangs the runner on failure** — chai
  walks live DOM references building a diff. This was recorded as being about
  `.to.equal(null)`; it is not that narrow. It cost a 120s timeout with **zero
  tests run and no failure message**, which reads as "the file is unstable"
  rather than "one assertion is wrong". Compare a boolean.
- **The runner's viewport is 800px.** Anything gated on a breakpoint above that
  is inert: `arc-navigation-menu` collapses at 900px, so its desktop bar is
  `display: none` for the whole suite and nothing in it can take focus. See
  `forceDesktop()` in `navigation-menu.test.js`.
- **Capture output on the run right after an edit.** A 1-test failure has been
  seen twice, both times on the *first* full run after source files were written,
  never reproducing afterwards (8 clean runs, 6/6 in isolation). The message was
  lost both times by re-running. Suspected transform-cache artifact, unresolved —
  see `test-findings.md`. Redirect to a file in a loop rather than re-running.
- **Three green runs is not a sample.** The carousel auto-play flake needed six
  to appear at all. Filter icon failures and run five or more.
