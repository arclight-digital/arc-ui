# Test suite authenticity audit — `@arclux/arc-ui`

**Scope:** `packages/web-components/test/` — 55 test files, 806 tests as executed.
Written as 712 `it()` blocks; the gap is loop-generated cases (37 files build
tests from a table, e.g. `form-contract.test.js` generates 28 across 14 controls).
**Method:** full read of every test file, static classification of every `it()`
block, and a Stryker mutation run against the shared core.
**Constraint honoured:** no test or source file was modified. Everything below is
a finding, not a fix.

---

## Bottom line

**The suite is sound.** I went looking for padding and did not find it.

Of 712 test blocks, **0 are vacuous in the strict sense** — no `expect(true)`, no
mocking of the unit under test, no assertion on a mock's return value, no
snapshot-without-semantics, no swallowing try/catch, no bare await-and-no-throw.
I grepped for every one of those patterns across all 55 files and got zero hits.
Four tests assert conditionally and can pass with nothing asserted; those are
listed below and they are the whole of that category.

The ~500-test growth is not filler. The nineteen component test files added in
`15ffeca7` average 2.4 assertions per test against real computed geometry, real
ARIA state, real event ordering, and real form participation. Several files
contain explicit anti-vacuity guards written by the author — `enum-fallback-sweep.test.js:111-114`
fails the test if the property being measured turns out not to be driven by the
attribute under test, and `menu-width.test.js:45-50` fails if the panel it is
measuring rendered empty. That is the opposite of padding.

**The real problem is not authenticity, it is reach.** 207 components are
registered and exported; **72 are ever mounted in a test and 109 are never
mentioned in any test file at all** — including `arc-tabs`, `arc-pagination`,
`arc-carousel`, `arc-tree-view`, `arc-table`, `arc-chart`, `arc-rating`,
`arc-range-slider`, `arc-file-upload` and `arc-sortable-list`. The six generated
framework wrapper packages contain **zero tests**. Everything real I found in
Step 4 lives in that gap, and all five bugs are in components or code paths the
suite does not touch at all — not in code it tests badly.

**One thing reading could not tell me, and mutation testing did.** Scoped Stryker
run over the two pure-logic core modules: `time-scale.js` scores **85.6%**
(and 9 of its 16 survivors are equivalent or cosmetic mutants, so the real miss
count is 3). `fuzzy-match.js` scores **52.3%** — 153 survivors out of 321. The
two files read as equally careful; they are 33 points apart. Three whole
behaviours in `fuzzy-match.js` are unconstrained: the camelCase word-boundary
rule can be deleted or inverted, the single-character-term rule can be deleted
wholesale, and the consecutive-match bonus can have its **sign flipped**, all
with 31 tests pointed at the module and none failing. That is
under-specification rather than fakery — the tests catch the regression they
were written for — but it is a real hole and §2 names it precisely.

Two secondary findings worth acting on:

- **17 of 806 tests fail on a clean checkout** (`icon-aliases.test.js`,
  `sanitize-svg.test.js`). Not flaky, not environmental noise in the usual sense:
  they depend on `src/icons/{phosphor,lucide}/`, which is gitignored and
  generated. `pnpm test` is red until `pnpm generate:icons` has been run, and
  nothing says so.
- `web-test-runner` exits 1 correctly, so CI does catch this — but a developer
  running `pnpm test` on a fresh clone sees 17 red tests that have nothing to do
  with their change.

---

## 1. Verdict counts

| Verdict | Count | % of 712 |
|---|---:|---:|
| CONTRACT | 692 | 97.2% |
| IMPLEMENTATION | 16 | 2.2% |
| VACUOUS | 4 | 0.6% |
| REDUNDANT | 10 | 1.4% |

(REDUNDANT overlaps CONTRACT — the duplicated overlay tests are individually
sound, they are just asserted twice. Percentages therefore exceed 100%.)

### On the IMPLEMENTATION count

The mechanical number is higher than 16: **162 of 712 tests touch either a
`_private` field or a shadow-internal CSS class selector.** I am not counting all
162, because for most of them the internal selector is only the *route* to a
public assertion — `knob.test.js:75` reaches `.knob__dial` in order to assert
`el.value === 52` and the `arc-input`/`arc-change` fire order, which is the
documented contract. A class rename would break the test, but the test is still
asserting behaviour.

The 16 counted below are tests where the **internal detail is the entire
assertion**: rename the class or the private field and the test has nothing left
to say.

Worth stating plainly: this library ships `part=` on most components and the
suite uses it (70 `[part=...]` assertions). Where a component exposes a part, the
tests use it. The internal-class assertions cluster in components that don't
expose parts for the thing being asserted — that is a component API gap as much
as a test-quality one.

---

## 2. Surviving mutants

### Was mutation testing viable? Yes — but only after fixing a silent trap

No mutation testing is configured in this repo. I set up a throwaway Stryker 9.6.1
run in a scratch directory (`/tmp/.../scratchpad/mut`, a copy of the repo with
`node_modules` symlinked — nothing was written into the working tree, and no
Stryker config was committed).

**StrykerJS has no runner for `@web/test-runner`.** Its supported runners are
Jest, Mocha, Karma, Vitest, Jasmine and Cucumber. The route that works here is
`testRunner: "command"`, which runs an arbitrary shell command and reads its exit
code — `web-test-runner` exits 1 on failure, so that part is sound. Combined with
`inPlace: true` (the pnpm workspace's per-package `node_modules` do not survive
Stryker's sandbox, so lit cannot resolve there) it runs, sequentially.

**The trap, and it is worth writing down.** Stryker's command runner activates a
mutant by setting `process.env.__STRYKER_ACTIVE_MUTANT__`, and the instrumented
code reads it off `globalThis.process.env`. There is no `process` in a browser.
My first run therefore had **no mutant ever activate** — 1044 mutants would all
have been reported as survived, and the report would have read as a catastrophic
indictment of a suite that is actually fine. I caught it 4 minutes in by reading
the instrumented output rather than trusting the numbers.

The fix is a `testRunnerHtml` hook in the web-test-runner config that reads the
env var in Node (where it exists) and stamps
`globalThis.__stryker__.activeMutant` into the browser page before the tests
load. With that bridge in place mutants started dying immediately.

**If you adopt mutation testing here, this bridge is mandatory** — and it is
invisible when wrong, because "everything survived" is indistinguishable from
"the suite is worthless". Any browser-based Stryker setup in this repo needs a
canary: mutate a line you know is covered and confirm it dies.

**Scope, and why it is two files.** `inPlace` forces `concurrency: 1`, and the
command runner has no per-test coverage analysis, so every mutant costs a full
suite run (~4s). A five-file run over the whole `shared/` directory generates
1044 mutants — over 70 minutes before timeouts, and infinite-loop mutants in the
grid maths pushed the ETA past that. I scoped down to the two modules where
mutation score is actually diagnostic: pure functions with dedicated,
deep test files (`time-scale.test.js`, 44 tests; `fuzzy-search.test.js`, 31).
`listbox-controller.js`, `editing-target.js` and `sanitize-markup.js` were not
mutation-tested — noted as a gap, not a result.

Baseline was green: the two icon test files were excluded (they depend on the
gitignored generated icon modules — see §5), leaving 789 passing tests in 2.4s.

### Results

| File | Mutants | Killed | Survived | Timeout | Score |
|---|---:|---:|---:|---:|---:|
| `shared/time-scale.js` | 111 | 93 | **16** | 2 | **85.6%** |
| `shared/fuzzy-match.js` | 321 | 164 | **153** | 4 | **52.3%** |
| **Total** | **432** | 257 | **169** | 6 | **60.9%** |

**`time-scale.js` is genuinely well tested and `fuzzy-match.js` is not.** That is
the single most useful thing mutation testing said here, and neither number was
predictable from reading the tests — both files look equally careful.

Note before the rankings: **9 of the 16 `time-scale.js` survivors are equivalent
or cosmetic mutants**, not test gaps. `dir(scale)` returns `+1` or `-1`, so
`* dir(scale)` → `/ dir(scale)` (lines 72, 83, 124) is a semantic no-op; line 109
`a <= b` → `a < b` returns identical values when `a === b`; and five
`StringLiteral` mutants only alter `RangeError` message text, which the tests
deliberately do not assert (except `gridLines`, which checks `/visibleRange/`).
The real `time-scale.js` gap is **3 mutants**, listed below. I am counting them
that way rather than quoting 85.6% as if it were 16 misses.

### Survivors ranked by blast radius

#### 1. `fuzzy-match.js:47` — the camelCase word-boundary rule is entirely unverified (17 survivors)

```js
const isBoundary = (text, i) =>
  i === 0 || BOUNDARY_BEFORE.test(text[i - 1]) ||
  (text[i] >= 'A' && text[i] <= 'Z' && text[i - 1] >= 'a' && text[i - 1] <= 'z');
```

Every mutant on this line survives, including `ConditionalExpression → false`
(delete the camelCase clause outright) and `ConditionalExpression → true` (treat
**every** character as a word boundary, which flattens ranking across the whole
index). The comparison operators can all be inverted; the character literals can
be emptied.

**Should have been caught by:** `fuzzy-search.test.js:46` ("ranks by kind of
match, not by whether one exists") and `:52` ("prefers an acronym to an
incidental subsequence"). Both are boundary-ranking tests. Neither uses a
camelCase string — every label in the file is space-separated (`Command Palette`,
`Number Input`, `Data Table`), so the clause never executes with a distinguishing
input. Add one case with a `camelCase`/`PascalCase` label and 17 mutants die.

#### 2. `fuzzy-match.js:254-270` — `snippetAround`'s window trimming (≈48 survivors)

The four tests at `fuzzy-search.test.js:218-250` all use one string, one match
position and one width, so every branch resolves the same way each time. Survivors
include:

- `:256` `space - start < 15` → `<= 15`, `>= 15`, and the whole guard → `true`/`false`
- `:261` `space > start && end - space < 15` → `||`, `>=`, `<=` — the trailing
  word-boundary snap can be disabled entirely
- `:265` `end < text.length` → `<=`/`>=`, and the tail ellipsis string → `""`
- `:270` `indices.filter(...)` → `indices` — **the index filter can be removed
  and no test notices**, meaning out-of-window highlight positions would be
  returned and rendered against a shorter string

**Should have been caught by:** `fuzzy-search.test.js:239` ("re-bases the
positions onto the returned text") is the right test for `:270` — it just never
supplies an index outside the window. `:246` ("marks where it cut") asserts only
the *leading* ellipsis, which is why every trailing-ellipsis mutant lives.

#### 3. `fuzzy-match.js:192-194` — dropping single-character terms is dead code as far as the suite knows (15 survivors)

`BlockStatement → {}` survives: the entire five-line rule, documented by an
eight-line comment explaining why `"override a token"` must not require the
letter `a`, can be deleted with no test failing. So can every operator in it.

**Should have been caught by:** nothing that exists. The nearest are
`fuzzy-search.test.js:57` ("accepts terms in any order") and `:62` ("requires
every term to match something") — the latter actually asserts the *opposite*
policy for multi-character terms. One test with a multi-word query containing a
single-character word closes this.

#### 4. `fuzzy-match.js:133,135` — the scoring bonuses' magnitude *and sign* are unpinned (12 survivors)

`score += 40` → `score -= 40` survives. So does
`score -= Math.min(20, gap)` → `score += Math.min(20, gap)`. The consecutive-run
bonus and the gap penalty can be inverted — rewarding scattered matches and
punishing contiguous ones — and every ranking assertion still passes.

**Should have been caught by:** the `beats()` assertions at
`fuzzy-search.test.js:47-49` and `:54`. This is the documented design choice at
`fuzzy-search.test.js:1-8` ("orderings, not exact scores") reaching its limit:
the four orderings chosen are all decided by the `SCORE.exact`/`prefix`/`boundary`
tier constants (1,000,000 / 100,000 / 10,000), which dwarf the ±40 adjustments,
so the fine-grained scoring is never the deciding factor in any test. The
principle is right; the case set is too small to exercise it. Two same-tier
comparisons — contiguous vs. scattered within the same match kind — would kill all
12 without pinning a single number.

#### 5. `time-scale.js:231` — `chooseStep`'s spacing comparison is off-by-one-safe by accident (1 survivor)

`spanToPixels(scale, step) >= minPixelSpacing` → `>` survives. The four tests at
`time-scale.test.js:255-269` use `minPixelSpacing: 20` against spacings of 192,
48, 24 and 12 — never exactly 20, so the boundary is untested. A consumer whose
candidate lands exactly on the minimum gets a coarser ruler than asked for.

#### 6. `time-scale.js:188` — the inverted-range guard (2 survivors)

`if (to < from) return []` → `to <= from`, and → `false`. `gridLines(from, from, step)`
— a zero-width visible range, which is what a collapsed panel produces — is
never tested. **Should have been caught by:** `time-scale.test.js:226` ("returns
empty when the range is inverted or holds no boundary"), which tests
`(100, 50)` and `(241, 479)` but not `(100, 100)`.

#### 7. `time-scale.js:189` — the `MAX_GRID_LINES` count arithmetic (3 survivors)

`Math.floor(to / step) - Math.ceil(from / step) + 1` can become `- 1`,
`+ Math.ceil(...)`, or `from * step` and still throw for the one input tested.
**Should have been caught by:** `time-scale.test.js:231` ("throws rather than
silently allocating for a full-project range"), which uses `gridLines(0, 787_200, 1)`
— 787,200 lines against a limit it exceeds by orders of magnitude, so any count
formula trips it. A case just above and just below the limit would pin it.

### What this does and does not say

It does **not** say these tests are fake. Every one of them would catch the
regression it was written for — `fuzzy-search.test.js` exists because the palette
once filtered with `String.includes`, and all 31 tests fail if you put that back.
The survivors are **under-specification**, not vacuity: the tests pin the
behaviour the author was worried about and leave the surrounding mechanics free.

It does say that the "assert orderings, not scores" policy at the top of
`fuzzy-search.test.js` — which is good policy — is currently implemented with a
case set too coarse to constrain half the module. And it says the two files' test
quality differs by 33 percentage points despite reading identically, which is
precisely the thing you cannot get by reading.

---

## 3. The worst offenders

VACUOUS first, then IMPLEMENTATION. There are only 20 findings in the whole
suite that I would call offenders, and none of them are serious.

### VACUOUS (4)

| # | Location | Why it cannot meaningfully fail |
|---|---|---|
| 1 | `token-drift.test.js:118-125` | `if (reads) expect(...)`. Generates 4 tests. When a component stops reading the token — the *other* half of the intended either/or — the body executes zero assertions and passes. The test cannot distinguish "token exists" from "nobody looks for it". |
| 2 | `size-tokens.test.js:142` (guard at `:152`) | `if (!res.ok) continue;` over 5 fetched source paths. If a path is renamed, that file is silently skipped. All 5 renamed ⇒ a green test with no assertions. |
| 3 | `rtl-intl.test.js:180-183` | `if (!r.ok) return [];` per file inside the sweep. An unfetchable component contributes zero violations rather than failing. Partly guarded by `expect(paths.length).to.be.greaterThan(20)` at line 177, which is why this is #3 and not #1. |
| 4 | `icon.test.js:28-33` | "supports numeric pixel sizes" uses `size="16"` — identical to the documented 16px default. Passes unchanged if numeric sizes are dropped entirely and the component falls back. Use a size no named step produces (e.g. `size="37"`). |

Two near-misses that I decided are *not* vacuous but sit close:

- `clock.test.js:71` — "falls back to local time when the timezone is not
  recognized" asserts only `/\d{1,2}:\d{2}/`, which any successful render
  satisfies. It distinguishes throw-from-render and nothing more.
- `clock.test.js:25` — "renders a plausible time string" is a smoke test. Fine as
  the first test in a file; carries no weight.

### IMPLEMENTATION (16)

Each of these would fail on a correct refactor and asserts nothing a consumer can
observe.

| # | Location | What it pins |
|---|---|---|
| 5 | `conversation.test.js:182` | `el._distanceFromEnd` — private scroll bookkeeping. The contract is `scroller.scrollTop`, which line 212 already knows how to assert. |
| 6 | `conversation.test.js:197` | same |
| 7 | `conversation.test.js:224` | same |
| 8 | `conversation.test.js:238` | same |
| 9 | `conversation.test.js:248,251` | same, in `scrollToEnd()` |
| 10 | `level-meter.test.js:67-72` | `zone--success` / `zone--warning` / `zone--error` class names. The observable is the segment's computed colour. |
| 11 | `level-meter.test.js:78-80` | same |
| 12 | `waveform.test.js:54` | `.wave__bar` element count |
| 13 | `waveform.test.js:60` | `.wave__path` count |
| 14 | `keyboard-map.test.js:36-37` | `.key--hit` class as the definition of "highlighted" |
| 15 | `keyboard-map.test.js:171` | same |
| 16 | `anchor-adoption.test.js:135` | `.card--linked` class. The contract is that a linked card gets the hover treatment, which is a computed style. |
| 17 | `anchor-adoption.test.js:140` | same |
| 18 | `toast-queue.test.js:165` | `el._toasts.some(...)` — private queue array |
| 19 | `gauge.test.js:24-25` | `.gauge__track` / `.gauge__arc` exist. Existence-only, on internal classes, in a component that uses no parts. |
| 20 | `tooltip.test.js:20` | `.is-managed` class. Defensible — it *is* the documented handshake with the no-JS CSS fallback — but it is a private name with no consumer-visible effect, and `tooltip.test.js:34` already guards the same invariant structurally. |

### REDUNDANT (10, low priority)

The overlay behaviours are asserted twice: once per component, once in the shared
`overlay-adoption.test.js` sweep that proves the mixin.

- "locks page scroll while open and releases it on close" —
  `overlay-adoption.test.js:30`, `lightbox.test.js:195`
- "restores focus to whatever was focused before it opened" —
  `overlay-adoption.test.js:76`, `lightbox.test.js:177`, `command-palette.test.js:81`
- "closes on Escape" — `overlay-adoption.test.js:38`, `lightbox.test.js:83`,
  `command-palette.test.js:55`
- "moves focus into the dialog when opened" — `modal.test.js:19`, `lightbox.test.js:164`
- "is immediately visible when opened (no visibility transition on open)" —
  `modal.test.js:36`, `command-palette.test.js:36`, `lightbox.test.js:53`

This is defensible duplication (mixin vs. wiring), which is why it is listed last
and marked low priority. If you parameterize anything, parameterize this: one
table of `[tag, open, isOpen]` in `overlay-adoption.test.js` covering
modal / lightbox / palette / sheet / drawer would replace all ten and pick up the
overlays that currently have none.

---

## 4. Coverage topology

### The numbers

| Surface | Tests | Components reached |
|---|---:|---:|
| Core components (`packages/web-components/`) | 806 | 72 of 207 mounted; 125 of 207 mentioned |
| Prism-generated wrappers (React/Vue/Svelte/Angular/Solid/Preact) | **0** | 0 |
| Cross-framework boundary (events, slots, prop reflection, SSR/hydration) | 7 | 1 component hydrated |

### (a) Core components

**109 of 207 registered components appear in no test file at all.** The full
list is at the end of this section. The ones that matter, ranked by how much
untested behaviour they contain:

`arc-tabs` (254 LOC, keyboard nav + ARIA + panel switching), `arc-carousel`
(351), `arc-range-slider` (395), `arc-table` (140), `arc-pagination` (214),
`arc-rating` (228), `arc-tree-view`, `arc-sortable-list`, `arc-file-upload`,
`arc-kanban`, `arc-chart`, `arc-event-calendar`, `arc-date-range-picker`,
`arc-split-pane`, `arc-resizable`, `arc-countdown-timer`, `arc-infinite-scroll`,
`arc-segmented-control`, `arc-radio`.

`arc-data-table` is nominally reached, but only through `column-alias.test.js`,
which tests the `field`/`key` alias and nothing else. **Its sorting and its row
selection — 541 lines including a client-side sort and a selection Set — are
entirely untested.** See bug #2 below.

The tested 72 are tested *well*. This is a depth-vs-breadth suite: it goes very
deep on the components that had bugs, and does not touch the rest.

### (b) Framework wrappers

Zero tests in `packages/{react,vue,svelte,angular,solid,preact}`. Nothing
imports a wrapper anywhere in the repo.

To be fair to the repo: **it knows this.** `scripts/checks/` contains four static
checks written specifically for the wrapper blind spot —
`wrapper-slots.js` (every declared slot reaches every wrapper),
`wrapper-types.js` (React wrappers compile under `tsc`),
`prop-unions.js` (string-literal unions survive generation),
`enum-fallbacks.js` — plus `scripts/smoke-test-wrappers.js`, which packs real
tarballs and production-builds a scratch Vite app per framework. The headers on
those files describe the exact 2.11.0 regression that motivated them.

What none of that covers is **runtime behaviour**. The smoke test proves a
wrapper imports and builds. It does not render, does not click, does not listen.
So:

- No test anywhere asserts that `<ArcButton onArcChange={...}>` receives the
  event. Event forwarding is generated code and is verified by nobody.
- No test asserts that a prop set from React reaches the element as the right
  type (the `.prop` vs `attribute` distinction that breaks arrays and objects).
- No test asserts that a default-slot child renders through a wrapper — the exact
  failure that shipped in 2.11.0. `check-wrapper-slots.js` catches it in the
  *generated source*, which is the right place, but nothing catches it in a
  running app.

### (c) Cross-framework boundary

| Concern | Coverage |
|---|---|
| Event contract | `scripts/checks/event-conventions.js` (static, all components) + per-component runtime tests in core. Not tested through any wrapper. |
| Slots | `check-wrapper-slots.js` (static) + `check-slot-hydration.js` (static). `hydrate-slots.js` has no direct runtime test. |
| Prop reflection | `form-contract.test.js:71-82` sweeps `name` reflection across 14 form controls. No general reflection sweep, none through wrappers. |
| SSR | `scripts/checks/ssr.js` server-renders every component and reports throws. That is a smoke test — it proves no crash, not correct output. |
| Hydration | **`hydration.test.js` covers exactly one component: `arc-feature-card`.** `hydrate-order.test.js` covers the load-order warning, not per-component hydration. |

The hydration gap is the sharpest one. The file's own comment explains why node
identity across upgrade is the assertion that matters — and then makes it for one
component out of 207, chosen because it is simple. The components most likely to
break hydration are precisely the ones that read a slot in `firstUpdated` via
`hydrateSlots()`, and none of those is hydration-tested. See bug #5.

### Components with core behaviour and no wrapper verification

Since no component's behaviour is verified through any wrapper, this is all 207.
Stated more usefully: **every event, slot and prop contract asserted by the 806
core tests is re-implemented by six code generators and verified by static
analysis alone.**

<details>
<summary>The 109 components with no test mention</summary>

`arc-accordion-item` `arc-animated-number` `arc-announcement` `arc-app-shell`
`arc-aspect-grid` `arc-aspect-ratio` `arc-auth-shell` `arc-avatar`
`arc-avatar-group` `arc-bottom-nav` `arc-breadcrumb` `arc-breadcrumb-menu`
`arc-callout` `arc-carousel` `arc-center` `arc-chart` `arc-chip` `arc-cluster`
`arc-collapsible` `arc-color-swatch` `arc-command-bar` `arc-comparison`
`arc-comparison-column` `arc-connection-status` `arc-container`
`arc-context-menu` `arc-copy-button` `arc-countdown-timer` `arc-cta-banner`
`arc-dashboard-grid` `arc-date-range-picker` `arc-description-item`
`arc-description-list` `arc-diff` `arc-empty-state` `arc-event-calendar`
`arc-file-upload` `arc-footer` `arc-guided-tour` `arc-highlight` `arc-hotspot`
`arc-icon-library` `arc-image` `arc-image-cropper` `arc-infinite-scroll`
`arc-input-group` `arc-kanban` `arc-kbd` `arc-key-value` `arc-kv-pair`
`arc-label` `arc-list` `arc-list-item` `arc-loading-overlay` `arc-marquee`
`arc-masonry` `arc-menu-divider` `arc-navigation-menu` `arc-number-format`
`arc-page-header` `arc-page-indicator` `arc-page-layout` `arc-pagination`
`arc-progress-toast` `arc-qr-code` `arc-radio` `arc-rail` `arc-range-slider`
`arc-rating` `arc-resizable` `arc-responsive-switcher` `arc-scroll-indicator`
`arc-scroll-spy` `arc-section` `arc-segmented-control` `arc-separator`
`arc-settings-layout` `arc-sidebar` `arc-sidebar-section` `arc-skeleton`
`arc-skip-link` `arc-snackbar` `arc-sortable-list` `arc-sparkline`
`arc-speed-dial` `arc-spinner` `arc-split-pane` `arc-spy-link` `arc-stack`
`arc-stat` `arc-status-bar` `arc-step` `arc-stepper` `arc-stepper-nav`
`arc-sticky` `arc-switch-group` `arc-tab` `arc-table` `arc-tabs` `arc-tag`
`arc-theme-toggle` `arc-timeline` `arc-timeline-item` `arc-toolbar` `arc-top-bar`
`arc-tree-item` `arc-tree-view` `arc-truncate` `arc-typewriter` `arc-value-card`

</details>

---

## 5. Five bugs a consumer would hit that the suite would not catch

I picked the five components with the largest consumer blast radius, then read
their sources looking for behaviour no test constrains. All five are real defects
in shipped code, not hypotheticals.

### Bug 1 — `arc-data-table`: row selection is keyed by display position, so sorting silently reassigns it

`data-table.js:489` renders `this._sortedRows`, `data-table.js:459` maps them to
`_renderRow(row, i)`, and `_renderRow` at line 462 uses `i` — the index in
**sorted** order. But `_handleSelectAll` at line 335 builds the selection from
`this.rows.map((_, i) => i)` — **unsorted** indices — and `_handleRowSelect` at
line 356 stores the display index it was handed.

Consumer sequence:

1. `<arc-data-table sortable selectable>` with rows `[Ada, Grace, Hopper]`.
2. Click the "name" header to sort descending → display order `[Hopper, Grace, Ada]`.
3. Tick the first row's checkbox. The user has selected **Hopper**.
4. `arc-select` fires with `detail.value === [0]`, and `detail.row` is Hopper.
5. The consumer — following the documented "`detail.value` is the current
   selection" contract at `data-table.js:15` — does `rows[0]`, which is **Ada**.
   The wrong record is deleted.
6. Worse without any consumer error: click the header again to re-sort. The
   checkbox is still on display index 0, which is now Ada. The selection followed
   the *row position*, not the row.

`_handleSelectAll` (line 335) compounds it: it emits unsorted indices while the checkboxes
render against sorted ones, so "select all" then "sort" leaves a checked set that
does not correspond to what is ticked on screen.

**Why nothing catches it:** `column-alias.test.js` is the only file that mounts
`arc-data-table`, and it asserts cell text for three column-alias cases. Neither
`sortable` nor `selectable` is exercised anywhere in the suite.

### Bug 2 — `arc-button`/`arc-icon-button`/`arc-link`: `disabled` does nothing to an adopted anchor

`button.js:237` applies `?disabled` to the inner `<button>`. But the two anchor
paths — explicit `href` (line 231) and adopted slotted anchor (line 234) — render
an `<a>`, and the only thing `disabled` does there is the host rule at
`button.js:42-43`, `pointer-events: none`.

`pointer-events` does not affect the keyboard. So:

```html
<arc-button disabled><a href="/account/delete">Delete account</a></arc-button>
```

is still in the tab order, still activates on Enter, and still navigates. It also
carries no `aria-disabled`, so a screen reader announces an ordinary enabled
link. Same for `loading` — a spinner appears and the link stays fully live, which
is the double-submit case the `loading` prop exists to prevent.

**Why nothing catches it:** `anchor-adoption.test.js` covers all four adopting
components thoroughly (19 tests) but never sets `disabled` or `loading` on any of
them. `enum-fallback.test.js` and `font-weights.test.js` touch `arc-button` for
styling only.

### Bug 3 — `arc-tabs`: `aria-controls` points at an id that only exists while the tab is selected

`tabs.js:236` renders `aria-controls="panel-${i}"` on **every** tab, but line 246
gives the single panel `id="panel-${this.selected}"`. Only the selected tab's
`aria-controls` resolves; every other tab points at an element that is not in the
document.

A screen-reader user tabbing through `<arc-tabs>` gets "tab, 1 of 3" with no
associated panel for two of the three, and JAWS/NVDA's "move to controlled
element" does nothing. The `role="tablist"` markup looks correct in devtools,
which is why this survives review.

Second, in the same file: the `selected` prop is documented at `tabs.js:10` as
"Out-of-range values are clamped to the nearest valid index." Nothing clamps.
`_syncVisibility()` at line 171 does `tab.hidden = i !== this.selected`, so
`<arc-tabs selected="7">` with three tabs hides **all three** and renders an empty
panel. `scripts/checks/doc-claims.js` validates `@csspart` and `@slot` claims, not
`@prop` prose, so the documented-but-absent clamp is invisible to it too.

**Why nothing catches it:** `arc-tabs` appears in no test file.

### Bug 4 — `FormControlMixin`: leaving a `<fieldset disabled>` clobbers an author's own `disabled`

`form-control-mixin.js:156`:

```js
formDisabledCallback(disabled) {
  this.disabled = disabled;
}
```

The platform calls this whenever the *ancestor* fieldset's disabled state
changes. It has no memory of the control's own `disabled`.

```html
<form>
  <fieldset disabled>
    <arc-input name="plan" value="enterprise" disabled></arc-input>
  </fieldset>
</form>
```

The author disabled that input deliberately — a read-only plan field, say. A
wizard step later removes `disabled` from the fieldset. The platform calls
`formDisabledCallback(false)`, the mixin sets `this.disabled = false`, and a field
that was never meant to be editable becomes editable and submits a user-supplied
value.

Related and equally untested: `formStateRestoreCallback` at line 167 only handles
`typeof state === 'string'`. Every boolean control (`arc-checkbox`, `arc-toggle`)
and every array-valued control (`arc-multi-select`, `arc-tag-input`) silently
drops its bfcache/autofill restore.

**Why nothing catches it:** `formDisabledCallback` and `formStateRestoreCallback`
appear in no test file. `form-contract.test.js` sweeps 14 controls for
`required`, `name` reflection and `readonly`; `form-aggregation.test.js` covers
`arc-form`'s discovery through `arc-fieldset` — but only the *aggregation* side,
never the fieldset's own disabled propagation.

### Bug 5 — SSR emits `<a>` inside `<button>` for the anchor-adoption form, then throws the shadow tree away on hydrate

`button.js:234` switches to the adopted-anchor render path only when
`_slottedAnchor` is true, and `_slottedAnchor` is set from `_onDefaultSlotChange`
— a `slotchange` handler, backstopped by `hydrateSlots(this)` in `firstUpdated`
(line 224). Neither runs on the server.

So `@lit-labs/ssr` renders the *button* branch for
`<arc-button><a href="/x">Go</a></arc-button>`: the initial HTML contains a
`<button>` whose slot is filled by an `<a>`. That is interactive content nested
inside a button — invalid HTML, and precisely the nested-link accessibility
problem the adoption path exists to avoid, per the comment at `button.js:196-203`.

Then on the client, `firstUpdated` → `hydrateSlots` sets `_slottedAnchor = true`,
which changes what `render()` returns, so Lit discards the hydrated tree and
re-renders. That is exactly the failure `hydration.test.js:50` was written to
catch — "survives upgrade rather than being re-rendered" — asserted for
`arc-feature-card` and no one else.

**Why nothing catches it:** `scripts/checks/ssr.js` only reports components that
*throw* during server rendering; this one renders happily and wrongly.
`hydration.test.js` covers one component, and it is not one that uses
`hydrateSlots`. **49 source files call `hydrateSlots()`** and every one of them
has the same shape: first render, then a synthetic `slotchange` that may change
what `render()` returns. `scripts/checks/slot-hydration.js` enforces that such a
component *reads* its slot on first render — it cannot see whether the resulting
re-render throws away the server's DOM.

---

## 6. Remediation, ranked

### Delete

Nothing. There is no test here whose removal would improve the suite. The four
VACUOUS findings should be **repaired**, not deleted — each is guarding something
real, just not guarding it.

### Fix (small, high value)

1. **`icon.test.js:28`** — change `size="16"` to a value no named step produces,
   e.g. `size="37"`. One-character-class change; turns a tautology into a test.
2. **`token-drift.test.js:118`** — replace `if (reads) expect(...)` with an
   assertion on both branches, or drop the conditional and assert that the
   component still reads the token *and* the token exists. As written it can pass
   with nothing checked.
3. **`size-tokens.test.js:152`** — replace `if (!res.ok) continue` with
   `expect(res.ok, path).to.equal(true)`. A renamed source path should fail the
   sweep, not shrink it.
4. **`rtl-intl.test.js:182`** — same shape; collect unfetchable paths and assert
   the list is empty.
5. **Green the checkout.** Either commit the generated icon modules, or make
   `icon-aliases.test.js` / `sanitize-svg.test.js` skip with a clear message when
   `src/icons/phosphor/_resolver.js` is absent, or add a `pretest` hook that runs
   `generate:icons`. 17 red tests on a fresh clone trains people to ignore red.

### Rewrite (medium)

6. **Replace private-state assertions with the observable they proxy.** The 16
   IMPLEMENTATION findings, in priority order: `conversation.test.js`
   `_distanceFromEnd` (5 tests — assert `scroller.scrollTop` relative to
   `scrollHeight - clientHeight`, which line 212 already demonstrates);
   `toast-queue.test.js:165` `_toasts`; `level-meter` and `waveform` zone/bar
   classes.
7. **Expose `part=` where tests currently reach for a class.** `arc-gauge`,
   `arc-waveform`, `arc-keyboard-map` and `arc-level-meter` are asserted through
   internal class names because they publish no parts for those nodes. Adding the
   parts fixes the test coupling and the component API in one move.
8. **Parameterize the overlay sweep.** One table in `overlay-adoption.test.js`
   over `[modal, lightbox, command-palette, sheet, drawer, dialog, confirm]`
   covering open-visibility, Escape, backdrop, scroll lock and focus restore.
   Replaces the 10 REDUNDANT tests and, more importantly, extends the same
   guarantees to the overlays that currently have none.

### Add (this is where the value is)

Ranked by expected bugs caught per test written.

9. **Close the `fuzzy-match.js` mutation gaps — five tests, 92 mutants.** This is
   the cheapest high-value item in the document because §2 already names the
   inputs. One camelCase label case (kills 17); one multi-word query containing a
   single-character word (kills 15); two same-tier `beats()` comparisons —
   contiguous vs. scattered within one match kind (kills 12); two
   `snippetAround` cases — an index outside the window, and a match near the end
   of the string so the trailing ellipsis is exercised (kills ~48). None of them
   requires pinning a score, so the file's stated policy survives intact.
10. **Mutation-test the rest of `shared/`.** `listbox-controller.js`,
    `editing-target.js` and `sanitize-markup.js` were not covered by this run
    (wall-clock, see §2). `sanitize-markup.js` is security-relevant and should be
    first. Budget ~40 minutes sequential, or invest in a Stryker sandbox that
    resolves the pnpm workspace so concurrency > 1 becomes possible.
11. **`arc-data-table` sorting + selection.** Bug 1 is a data-loss bug in a
   flagship component with 541 lines and one alias test. Assert that
   `arc-select`'s `detail.value` identifies the same record before and after a
   sort. Highest priority item in this document.
12. **A `disabled`/`loading` sweep across every interactive component.** One
    parameterized file: for each tag, `disabled` must remove it from the tab
    order, must not activate on Enter, and must emit no events. This catches
    bug 2 and would very likely catch siblings of it across the 109 untested
    components.
13. **`arc-tabs`, `arc-pagination`, `arc-carousel`, `arc-tree-view`,
    `arc-range-slider`, `arc-rating`.** Six components with real keyboard and
    ARIA logic and zero tests. Roving tabindex, `aria-selected`/`aria-current`,
    arrow/Home/End, and `aria-controls` resolving to a live id (bug 3).
14. **`FormControlMixin` lifecycle.** `formDisabledCallback` (bug 4) and
    `formStateRestoreCallback` for boolean and array-valued controls. Both are
    platform callbacks with no coverage at all; `form-contract.test.js` already
    has the sweep harness to hang them on.
15. **Widen `hydration.test.js` to the `hydrateSlots()` cohort.** The one existing
    test is the right test; it is applied to one component. Run the same node-
    identity assertion over the 49 source files that call `hydrateSlots()`
    (bug 5). Cheap — the harness exists, and `scripts/checks/ssr.js` already
    knows how to produce real `@lit-labs/ssr` payloads for every component.
16. **One runtime test per framework wrapper.** Not a suite — one file per
    package: mount a component, fire an event, assert the wrapper's handler ran;
    pass an array prop, assert it arrived as a property not an attribute; render
    default-slot children, assert they appear. Six small files close the entire
    category the four static `scripts/checks/wrapper-*.js` were written to
    approximate, and would have caught the 2.11.0 default-slot regression at
    runtime as well as in the generated source.

---

## Appendix — method notes

**Static classification.** Every `it()` block was extracted by brace depth and
scored for: assertion count, assertions reachable only under a conditional,
references to `_private` fields, shadow-internal class selectors, and
public-surface signals (`[part=]`, ARIA attributes, `arc-*` event listeners,
`detail`, `FormData`/validity, computed style, geometry, public props). The
machine pass produced a first cut; every flagged block was then read and
hand-adjudicated, which moved 12 of 28 machine-flagged IMPLEMENTATION blocks back
to CONTRACT (the classifier does not recognise `:popover-open` or `el.position`
as public surface). The counts in §1 are the hand-adjudicated ones.

**Vacuity patterns grepped for, all zero hits:** `expect(true|false|1|'...')`,
`.to.be.ok` as a sole assertion, `to.not.throw`/`doesNotThrow`, `try`/`catch`
anywhere in a test body, mocking of the unit under test, snapshot assertions.
The suite uses no mocking library at all; the only stubs are
`terminal.test.js:39` (`window.matchMedia`, to force reduced motion) and
`dev-warnings.test.js:11` / `hydrate-order.test.js:31` (`console.warn`, to
capture output) — all three stub the environment, never the unit.

**Baseline.** `pnpm test` on a clean checkout: 806 tests, 789 pass, 17 fail, 2.5s
in headless Chromium. All 17 failures are the icon-generation dependency
described above.

**Reproducing the mutation run.** Stryker 9.6.1, installed outside the repo. Run
from a copy of the repo with `node_modules` symlinked (including each
`packages/*/node_modules`, or lit will not resolve). `stryker.conf.json`:

```json
{
  "testRunner": "command",
  "commandRunner": {
    "command": "node node_modules/@web/test-runner/dist/bin.js --config wtr-mut.config.mjs"
  },
  "inPlace": true,
  "coverageAnalysis": "off",
  "timeoutMS": 12000,
  "timeoutFactor": 2,
  "concurrency": 1,
  "mutate": [
    "packages/web-components/src/shared/time-scale.js",
    "packages/web-components/src/shared/fuzzy-match.js"
  ]
}
```

and the activation bridge that makes it mean anything, in `wtr-mut.config.mjs`:

```js
const active = process.env.__STRYKER_ACTIVE_MUTANT__;

export default {
  // …files, nodeResolve, browsers as in web-test-runner.config.mjs…
  testRunnerHtml: (testFramework) => `<!DOCTYPE html>
<html><head><script>
  globalThis.__stryker__ = globalThis.__stryker__ || {};
  ${active === undefined ? '' : `globalThis.__stryker__.activeMutant = ${JSON.stringify(active)};`}
</script></head>
<body><script type="module" src="${testFramework}"></script></body></html>`,
};
```

The mutant id is compared with `===` against a **string** in Stryker's generated
`isActive(id)`, so `JSON.stringify` on the raw env value is correct — do not
coerce it to a number. Wall clock: 432 mutants in 23 minutes.
