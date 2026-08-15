# Test findings — defects surfaced while writing coverage

Per the agreed policy, **no source file is changed by this work.** Each finding
below is pinned by a test that asserts current behaviour, marked `// BUG:` at the
test. This file is the follow-up backlog.

Status legend: **doc-mismatch** (code contradicts its own JSDoc) · **a11y**
(invalid or unusable accessibility output) · **smell** (works, but fragile).

**Coverage so far:** all 25 Tier C (interactive) components. `arc-navigation-menu`
was the last and is now done (32 tests, findings #66 and #67) — the "Not covered"
note below is kept for its record of why the first attempt failed, not as an open
item. 47 findings across the first 24 new test files; 6 components came back with
nothing at all (`arc-collapsible`,
`arc-chip`, `arc-app-shell`, `arc-chart`, `arc-kanban`, `arc-event-calendar`).

## Triage

Ordered by what a consumer loses, not by discovery order.

**Closing pass (V4-PLAN 2.1), from 2026-08-15.** Each row below carries its
status. `FIXED` means the source changed and the `BUG:` pin was inverted into a
regression test — never deleted. `CLOSED` means the finding was answered without
a source change, with the reasoning recorded at the finding itself. Rows with no
marker are still open.

### Data and correctness — wrong results, silently

| # | Component | Finding |
|---|---|---|
| 26 | `arc-list` | a value containing a comma is recorded but never marked selected |
| 8 | `arc-rating` | **FIXED** — `required` was satisfied by an unrated control; the form submitted `"0"` |
| 21-23 | `arc-tree-view` | expansion and selection keyed on label, so same-named nodes share state |
| 31 | `arc-context-menu` | a second right-click while open leaves the menu at the old point |
| 19 | `arc-carousel` | an arrow key at the rails announces a move that did not happen |
| 14, 15 | `arc-theme-toggle` | setting `theme` from script does not sync the page; two toggles desync |

### Accessibility — invalid or unusable output

| # | Component | Finding |
|---|---|---|
| 16 | `arc-speed-dial` | closed actions stay focusable and clickable — invisible tab stops |
| 29 | `arc-command-bar` | the input has no accessible name and no way to give it one |
| 28, 27 | `arc-list` | items claim `role="option"` inside a plain `role="list"`; stray `aria-multiselectable` |
| 2 | `arc-tabs` | **FIXED** — `aria-controls` pointed at ids that do not exist |
| 24, 25 | five components | `aria-expanded=""` and four more attributes rendered empty instead of omitted |
| 9-12 | `arc-rating` | **FIXED** — ArrowLeft raised the rating; no route back to unrated; value below its own min; hardcoded name |
| 3 | `arc-tabs` | **FIXED** — an unknown `orientation` reached `aria-orientation` verbatim |

### API and documentation

| # | Scope | Finding |
|---|---|---|
| 20 | **library-wide** | 20 boolean props default `true` and cannot be disabled from markup |
| 6 | `arc-option` | **FIXED** — `disabled` was documented and read by *none* of its four consumers |
| 1 | `arc-tabs` | **FIXED** — `selected` documented as clamped; nothing clamped |
| 32 | `arc-menu-item` | `label` documented as a prop, implemented as a read-only getter |
| 17, 18 | `arc-speed-dial` | unknown `position` anchors nowhere; documented per-item `value` never emitted |
| 30 | `arc-command-bar` | Enter inside a form submits twice |
| 4, 5, 7, 13 | various | **4 FIXED, 5 CLOSED, 7 FIXED** — smaller doc/structure gaps, detailed below |

### Now enforced by a check

Two findings graduated into `scripts/checks/`, both baselined so they block new
occurrences without turning CI red:

- **#20** → `boolean-defaults.js` — 20 known, exempts the four components that
  already carry the `fromAttribute` escape hatch
- **#24, #25** → `empty-attributes.js` — 5 known of 578 attribute bindings

---

## arc-tabs

### 1. `selected` is documented as clamped, and is not — **doc-mismatch — FIXED**

**Fixed by the declared-props vocabulary.** `selected` is now
`int({ default: 0, min: 0, max: '_maxIndex', clamp: 'toRange' })`, where `max`
names a *getter* so the bound tracks the tab count instead of freezing at
whatever it was when the class was written. The pins inverted into
"clamps an out-of-range selected to the last tab" and its negative-index pair.

`navigation/tabs.js:10` declares:

> `@prop {number} selected` — … Out-of-range values are clamped to the nearest valid index.

Nothing clamps. `_syncVisibility()` (`tabs.js:171`) sets
`tab.hidden = i !== this.selected`, so `<arc-tabs selected="7">` with three tabs
hides **all three** and renders an empty panel. Same for a negative index.

- Pinned by: `test/tabs.test.js` — "BUG: an out-of-range selected hides every tab
  instead of clamping" and "BUG: a negative selected also hides every tab".
- Fix would be one line in `_syncVisibility`/`updated`; the tests then need their
  `BUG:` prefix removed and the assertion inverted to the documented clamp.
- Not caught by `scripts/checks/doc-claims.js`, which verifies that `@prop`
  *exists* as a reactive property, not that its prose is true.

### 2. `aria-controls` points at ids that do not exist — **a11y — FIXED**

**Fixed by giving the one panel one id.** The choice was between "a panel per
tab" and "one id, honestly referenced", and the second is the one that matches
what the component actually does: it does not swap panel elements, it unhides
one arc-tab child inside a single panel. Per-tab ids described an
implementation that was never built, and two of every three references dangled
as a result. Every tab now renders `aria-controls="panel"`, which resolves from
every tab and stays resolved across a selection change — both pinned.

Every tab renders `aria-controls="panel-${i}"` (`tabs.js:236`), but there is one
panel and its id is `panel-${this.selected}` (`tabs.js:246`). Only the selected
tab's reference resolves. From any other tab, a screen reader's
"move to controlled element" does nothing.

- Pinned by: `test/tabs.test.js` — "BUG: aria-controls on unselected tabs points
  at an id that does not exist" (asserts `[true, false, false]`).
- Fix is either a panel per tab, or dropping `aria-controls` from unselected tabs.
  The former is the standard tabs pattern and would also fix the fact that the
  panel is not re-announced on switch.

### 3. An unrecognised `orientation` reaches the accessibility tree verbatim — **a11y — FIXED**

**Fixed by the declared-props vocabulary.** `oneOf(['horizontal','vertical'])`
normalises on both the attribute and the property path, so the value the render
binds and the value `_handleKeydown` branches on are now the same value. The two
fallbacks could not disagree even if someone wanted them to.

`aria-orientation=${this.orientation}` (`tabs.js:227`) is bound straight from the
prop. `<arc-tabs orientation="diagonal">` emits `aria-orientation="diagonal"`,
which is not a valid ARIA value, so the platform falls back to the role default —
while `_handleKeydown` has already fallen back to *horizontal* key handling. The
two fallbacks do not have to agree, and here they need not.

- Pinned by: `test/tabs.test.js` — "BUG: an unknown orientation leaks into
  aria-orientation verbatim", alongside a test asserting the key handling does
  correctly fall back to horizontal.

### 4. `arc-tab` documents per-tab disabling it does not have — **doc-mismatch — FIXED**

**Fixed by building the property rather than deleting the sentence.** Two ways
to close a doc-mismatch, and here the docs were right about what a tab bar
should do: `arc-tab` gains `disabled: flag(false)`, and `arc-tabs` honours it on
every path in — the button renders `disabled`, `_select()` refuses, and the
arrow keys, Home and End walk past it via a bounded `_seek()` that terminates on
an all-disabled bar instead of spinning. The key stays `preventDefault`ed even
when no target survives the walk, or a fully disabled bar scrolls the page.

Two things this turned up that reading would not have:

- **A disabled tab is not a hidden tab.** If the selected tab is disabled after
  the fact, its panel stays visible. Hiding it would mean "disabled" silently
  moves the selection, which is a different feature.
- **The group renders its children's state but is not reactive to it.** `label`
  had the same latent gap and nobody had hit it. `arc-tab.updated()` now asks
  the group to re-render, guarded on the *previous* value being defined so the
  initial assignment — where the group is mid-render anyway — does not count.

`navigation/tab.js:5-6` says to use the sub-component "when you need fine-grained
control over individual tab behavior, such as **disabling a specific tab** or
attaching per-tab event listeners". `ArcTab` declares exactly one property,
`label` (`tab.js:13-15`). There is no `disabled`, and `arc-tabs` has no notion of
a disabled tab in its key handling or its click handler.

- Was not pinned by a test — there was no behaviour to pin. It was flagged here
  because the claim is in prose rather than a `@prop`, so `doc-claims.js` cannot
  see it. Now pinned by `arc-tabs disabled tabs`, seven tests.

### 5. `arc-tabs` schedules an update after its update completes — **smell — CLOSED, library-wide by design**

Running any `arc-tabs` test logs the Lit dev-mode warning:

> Element arc-tabs scheduled an update … after an update completed

`_onSlotChange` (`tabs.js:161`) sets `_tabs` during the first update cycle, so
every mount costs two renders. Harmless today; noted because it makes
`updateComplete` alone insufficient to settle the component — tests need the
double-pass `settle()` helper, and so would any consumer awaiting a render.

`arc-segmented-control` has the same shape, for the same reason.

**Closed as by-design, not fixed.** It is not an `arc-tabs` defect: it is what
slot-driven composition costs. A component that renders from its light-DOM
children learns what those children are from `slotchange`, which fires *during*
the first update — so the render that reads them is necessarily the second one.
One run of the suite logs the same warning for **ten** components
(`radio-group`, `search`, `select`, `sortable-list`, `tree-select`, `scroll-spy`,
`sidebar`, `tabs`, `truncate`, `typewriter`), and every one of them is this
shape. The alternatives are to stop rendering from children, or to make `_tabs`
non-reactive and re-render by hand — both worse than one extra dev-mode render.

What it costs is real and stays documented: `updateComplete` alone does not
settle these components, which is exactly why `helpers.js` exports the
two-pass `settle()` and why every test here uses it.

---

## arc-segmented-control / arc-option

### 6. A disabled `arc-option` is fully selectable — **doc-mismatch — FIXED**

**Fixed on all four paths the finding named, plus one it did not.** `_select()`
refuses a disabled option (by value lookup, so the programmatic path is covered
too, not just the click), `_handleKeydown` walks past it with the same bounded
`_seek()` as `arc-tabs`, and the button renders `disabled` when *either* the
group or the option says so.

The path the original write-up missed: **the auto-selection.** `_readOptions`
set `value` from `_options[0]`, so `<arc-option disabled>` in first position
became the initial selection — a guard on every path *in* is worthless if the
control starts out sitting on the thing it is guarding. It now takes the first
selectable option.

`_isDisabled()` reads the attribute as well as the property, because on the
slotchange that builds the bar an `arc-option` may not have upgraded yet, and an
un-upgraded element has no `disabled` property to read.

The same reactivity gap as #4 applies and is closed the same way: consumers
render an option's state into *their* shadow DOM (`arc-option` is
`display: none`), so `ArcOption.updated()` asks its nearest Lit ancestor to
re-render on a real change to `disabled`, `value` or `selected`.

`shared/option.js:12` declares:

> `@prop {boolean} disabled` — When true, dims this option and prevents it from being selected.

`arc-segmented-control` never reads it:

- `_readOptions` (`segmented-control.js:126`) filters on `tagName === 'ARC-OPTION'` only
- `_select` (`segmented-control.js:140`) guards on the *group's* `disabled`, not the option's
- `_handleKeydown` (`segmented-control.js:152`) walks by index and does not skip disabled options
- `render` (`segmented-control.js:205`) binds `?disabled=${this.disabled}` — the group's flag — onto every button

So `<arc-option value="week" disabled>` is selectable by click **and** reachable
by arrow key, and firing `arc-change` as it goes.

- Was pinned by: `test/segmented-control.test.js` — "BUG: a disabled arc-option
  is still selectable". Now `arc-segmented-control per-option disabled`, eight
  tests.
- The write-up's own suspicion was right, and it was the larger half of the
  finding: **all four `arc-option` consumers had it.** See below.

#### 6b. The same defect in the other three consumers — **FIXED**

`grep -rl ARC-OPTION src/` returns exactly four files, and `arc-select`,
`arc-combobox` and `arc-multi-select` had the identical gap — not one of them
read an option's own `disabled`. Verified against the source rather than
assumed: `select.js:_selectOption` set `value` unconditionally, and neither
combobox nor multi-select mentioned the word outside their *own* host flag.

**The keyboard half belongs to `ListboxController`, not to the components.**
All three route their keys through it, so the skip is one option —
`isItemDisabled(index)` — and one `_seek()` alongside the existing `_step()`.
Disabled options stay rendered and stay *counted*: filtering them out would
renumber every option after them, and `aria-activedescendant` is an index into
what is rendered. Arrow keys, Home, End, typeahead and the opening keypress all
walk past them; Enter on one selects nothing and still consumes the key, or a
refused selection falls through to a form submit.

**The click half belongs to each component**, because the controller never sees
a click — one guard each, plus `aria-disabled` and a dimmed class. Swept in one
place (`arc-option disabled: every consumer refuses the click`) with an
anti-vacuity click on the enabled sibling, so a listbox that ignored *every*
click could not pass it.

`arc-tag-input` uses `ListboxController` too but has no `arc-option` children —
its items come from a `suggestions` array — so it takes the controller change
and needs nothing else.

**One trap this turned up**, worth carrying: the manifest analyzer binds a
JSDoc block to *whatever declaration follows it*. Adding `isOptionDisabled`
between `arc-option`'s doc comment and its class silently moved the `@tag` onto
the function — `ArcOption` lost its `tagName`, vanished from `types/index.d.ts`,
and the React wrapper stopped compiling. Caught by `pnpm generate`'s wrapper
typecheck, not by the suite. A shared helper goes *above* the element's doc
block or below the class, never between them.

### 7. `value` does not participate in forms — **gap — FIXED**

`arc-segmented-control` had a reflected `value` and no `name`, and did not use
`FormControlMixin`. Putting one in a `<form>` submitted nothing — consistent
with its own docs, which is why this was filed as a gap rather than a bug, but
a surprise for a control that looks exactly like a radio group when every other
value-bearing input in the library is form-associated.

**Fixed by adopting the mixin**, which is three lines — `FormControlMixin` in
the composition, a `name` prop, and the doc. No `_updateFormValue()` calls: the
mixin's own `updated()` hook already syncs on a `value` change.

The one thing that was not free, and is the reusable part: **the reset baseline
is captured in `connectedCallback`, before the first `slotchange`.** A control
that derives its initial value from slotted children — this one auto-selects its
first selectable option — therefore baselines the *empty pre-slot state*, and
`form.reset()` cleared the bar instead of restoring it. The mixin gains a named
`_recaptureFormResetState()` for exactly this shape rather than the component
reaching into `__resetState`; it is pinned in `form-control-mixin.test.js`
next to the "baselines on first connect" trap it is the escape hatch for.

It also joins the derived sweeps for free: `form-data-sweep.test.js` derives its
subjects from `formAssociated` in the manifest, so the control appeared there
the moment the mixin landed and failed until someone said how to fill it.

---

## arc-rating — **ALL SIX FIXED**

Four findings, and they shared one root: **`value = 0` meant "unrated" to the
component's own rendering, and "a real value" to everything else.** Deciding
what 0 means would fix all four together, and it did — six, counting #12 and
#13, which came along in the same pass.

**The decision: 0 is a legal, reachable, unrated state of the control.** Every
fix below follows from it rather than from its own finding, which is why they
are recorded together:

| finding | what the decision implies |
|---|---|
| #8 | an unrated control submits **nothing** — `_formValue()` returns `null` at 0 |
| #9 | the decrement floor is 0, so "less" can never mean more |
| #10 | Home *is* the route back to unrated, because 0 is the minimum |
| #11 | `aria-valuemin="0"` — the unrated state is inside the declared range |
| #12 | a `label` prop, because a nameless control cannot be told from its neighbour |
| #13 | the dead ternary branch goes, and the one geometry becomes a constant |

Two things the decision forced that no single finding asked for:

- **`aria-valuetext`.** `aria-valuenow="0"` on a 0..5 scale is in range and says
  nothing useful. The control announces "No rating" at 0 and "3 of 5" otherwise
  — the reason 0 is legal is that it *means* something, so it has to say what.
- **A mouse route back.** #10 is titled as a keyboard finding, and its body
  names mouse users in passing: "Mouse users cannot either — there is no clear
  affordance." Clicking the already-selected star now clears. What it replaced
  was a genuine no-op — the click path had no equality guard, so re-clicking
  re-announced the value it already held, which `rating.test.js` pinned as
  current behaviour while flagging it as odd. Nothing was lost.

**And the exemption went with it.** `form-contract.test.js` excused rating from
its `required` sweep on the grounds that "number-valued controls have no
meaningful empty". That is right for slider and number-input and was wrong here
all along — the finding said so, and the sweep is the place that has to agree.
`arc-rating` is swept like every other control now.

### 8. `required` is satisfied by an unrated control — **doc-mismatch / data — FIXED**

`_formValue()` (`input/rating.js:112`) returns `String(this.value)`, so an
unrated rating submits `"0"`. `FormControlMixin._formValueIsEmpty` treats only
`null` and `''` as empty (`form-control-mixin.js:106`), so `"0"` counts as
filled: `<arc-rating required>` reports `checkValidity() === true` with nothing
rated, and `validity.valueMissing` is `false`.

`form-contract.test.js:15-16` deliberately exempts rating from its `required`
sweep — "number-valued controls … their defaults are real values, so 'empty' has
no meaning". For slider and number-input that is right. For rating it is not: 0
is *below the component's own `aria-valuemin` of 1*, so it is not a value the
control considers legal.

- Pinned by: `test/rating.test.js` — "BUG: required is satisfied by an unrated control".
- Fix is one line — `_formValue()` returning `null` at 0 — but it changes what an
  unrated rating submits, so it is a behaviour decision, not a typo.

### 9. ArrowLeft on an unrated control *raises* the rating — **a11y / usability — FIXED**

The decrement floor is 1 (`rating.js:150`: `Math.max(this.value - 1, 1)`). From
the default value of 0, ArrowLeft computes `Math.max(-1, 1) === 1`, so the key
meaning "less" increases the rating.

- Pinned by: `test/rating.test.js` — "BUG: ArrowLeft from unrated raises the
  rating instead of lowering it".

### 10. There is no keyboard route back to unrated — **a11y — FIXED, keyboard and mouse**

Same floor. Once any rating is set, neither ArrowLeft nor Home can return to 0, so
a keyboard user who mis-rates cannot clear it. Mouse users cannot either — there
is no clear affordance.

- Pinned by: `test/rating.test.js` — "BUG: no keyboard route back to unrated once
  a rating is set".

### 11. An unrated control reports a value outside its own declared range — **a11y — FIXED**

`aria-valuemin` is the literal `"1"` (`rating.js:215`) while `aria-valuenow` is
bound from `value`, which defaults to 0. `aria-valuenow="0"` against
`aria-valuemin="1"` is out of range; the announced value is undefined by spec.

- Pinned by: `test/rating.test.js` — "BUG: an unrated control reports a value
  below its own declared minimum".

### 12. The accessible name is hardcoded — **a11y — FIXED**

`aria-label="Rating"` is a literal (`rating.js:214`) and there is no `label`
prop. Several ratings on one page are indistinguishable to a screen reader, and
an author-supplied `aria-label` on the host does not reach the slider node.

- Pinned by: `test/rating.test.js` — "BUG: the accessible name is hardcoded and
  cannot be set".
- Every comparable control in the library takes a label — `arc-knob`
  (`knob.test.js:44`), `arc-gauge`, `arc-level-meter` — and falls back to a
  generic name only when unset. Rating is the outlier.

### 13. The two star paths are identical — **smell — FIXED**

`_renderStar` (`rating.js:185-187`) picks `starPath` from a ternary whose two
branches are the same string. Filled vs. empty is carried entirely by the `fill`
attribute. Harmless, but it reads as an unfinished intent and the dead branch
will survive any refactor untouched.

- Not pinned — there is no behavioural difference to assert. The tests read
  filled state off the `fill` attribute, which is what actually decides it.

---

## Clean components

Recorded so they are not re-investigated. Each was read in full against its
JSDoc and tested to the same depth as the components above; nothing was found.

- **arc-collapsible** — 20 tests. Notably gets the native-button double-toggle
  right: the trigger is a real `<button>`, and `_handleKeydown` calls
  `preventDefault()` before toggling, so Enter and Space do not also fire the
  synthesised click. `aria-controls` resolves to the region it names.
- **arc-chip** — 17 tests. Switches `role` between `option` and `button` on
  whether it sits in a listbox/group, and pairs each with the correct state
  attribute (`aria-selected` vs `aria-pressed`) rather than emitting both.

---

## arc-theme-toggle

### 14. Setting `theme` from script does not sync the page — **doc-mismatch**

`input/theme-toggle.js:10` declares:

> `@prop {'dark' | 'light' | 'auto'} theme` — … Automatically synced to localStorage and the document root `data-theme` attribute.

The sync lives inside `_cycle()` (`theme-toggle.js:156-157`) and nowhere else, so
it only happens on click or key press. Assigning the property — the documented way
to drive the component from application state, and the only way to restore a
user's saved preference — repaints the button and leaves the page on its old theme.

- Pinned by: `test/theme-toggle.test.js` — "BUG: setting theme from script does
  not sync the document or storage".
- Fix belongs in `updated()`, which is also what would fix #15.

### 15. A second toggle on the page silently desyncs — **correctness**

Each instance reads global state once, in `connectedCallback`
(`theme-toggle.js:138-146`), and `_cycle` updates only the instance that was
clicked. Two toggles on one page — a header one and a settings-panel one, say —
disagree the moment either is used: the page is on the new theme while the other
button still renders the old one.

- Pinned by: `test/theme-toggle.test.js` — "BUG: a second toggle on the page
  desyncs when the first is clicked".
- Both findings dissolve if the component observes `data-theme` on the root (or
  a `storage` event) rather than sampling it once.

**Checked and correct**, recorded so they are not re-investigated: the `size`
scale really does resolve to 28/32/36/44px and really does match
`arc-icon-button` at every step (asserted against a live peer, not against the
numbers alone); `icon-only` hides the label with `display: none`, which removes
it from the accessibility tree too, leaving the button's `aria-label` as the
name; a junk value in `localStorage` is correctly ignored.

---

## arc-speed-dial

### 16. Closed actions stay focusable and clickable — **a11y**

The closed state is `opacity: 0` plus a transform (`navigation/speed-dial.js:109`),
with no `visibility`, `pointer-events`, `inert` or `aria-hidden`. The action
buttons therefore remain in the tab order and remain hit-testable while
invisible. A keyboard user tabbing past a collapsed speed dial lands on N buttons
they cannot see; an invisible button sits over whatever is beneath it.

- Pinned by: `test/speed-dial.test.js` — "BUG: the actions are invisible but
  still focusable while closed" and "BUG: a closed action still fires arc-action
  when clicked".
- The opacity transition is why `display: none` was presumably avoided;
  `visibility: hidden` transitions fine and fixes focus, pointer and AT together.

### 17. An unrecognised `position` is not anchored to any corner — **enum fallback**

Both corner rules are exact-match selectors — `:host([position="bottom-right"])`
and `:host([position="bottom-left"])` (`speed-dial.js:58, 63`). An unrecognised
value matches neither, so `.speed-dial` keeps `position: absolute` with no
offsets and lands wherever static flow puts it.

This is the failure mode `scripts/checks/enum-fallbacks.js` was written for, in
its **exact-match** rather than its absence form — worth checking whether the
check covers that shape. `arc-speed-dial` is also absent from the `CASES` table
in `enum-fallback-sweep.test.js`.

- Pinned by: `test/speed-dial.test.js` — "BUG: an unrecognised position is not
  anchored to any corner".

### 18. The documented per-item `value` is never emitted — **doc-mismatch**

`items` is declared as `Array<{icon: string, label: string, value?: string}>`
(`speed-dial.js:14`), but nothing reads `value`: `render` uses `icon` and `label`
only, and `_onAction` (`speed-dial.js:174`) emits `{ index }` alone. A consumer
who sets the documented `value` cannot get it back — they must keep their own
array and index into it.

- Pinned by: `test/speed-dial.test.js` — "BUG: the documented per-item value is
  never emitted".
- Note `arc-action` is not required to carry `detail.value`; only `arc-select`,
  `arc-change` and `arc-input` are (`scripts/checks/event-conventions.js:94`).
  The defect is the unread item field, not the event shape.

**Checked and correct**: the v3 close contract holds on both paths — a cancelable
`arc-close` fires before the state flips, and `preventDefault()` keeps the dial
open, including after choosing an action. `direction` left/right map to
`row`/`row-reverse`, which is right: the actions container precedes the trigger
in DOM order, so `row` renders them to its left.

---

## arc-carousel

### 19. An arrow key at the rails announces a move that did not happen — **correctness**

The no-op guard in `_goTo` (`content/carousel.js:199`) is:

```js
if (next === this._current && index === next) return;
```

When clamping changes the index the second condition is false, so the guard does
not fire: `_goTo` re-assigns the same index, calls `scrollIntoView` again, and
dispatches `arc-change` reporting a change that did not happen. A consumer
counting slide views, or syncing a caption, sees a spurious event.

The arrow **buttons** are safe — they carry `?disabled` at the rails
(`carousel.js:313, 320`). `_onKeydown` (`carousel.js:270`) has no such guard and
calls `_prev()`/`_next()` directly, so the keyboard reaches it.

- Pinned by: `test/carousel.test.js` — "BUG: an arrow key at the rails announces
  a change that did not happen".
- Dropping the `&& index === next` clause fixes it.

---

## Library-wide — 20 boolean props cannot be turned off from markup

### 20. `type: Boolean` + a `true` default is not disableable by attribute — **API**

Lit's boolean converter maps attribute **presence** to `true`, and an absent
attribute never fires `attributeChangedCallback`, so the constructor default
stands. For a prop defaulting to `true` that means:

| markup | result |
|---|---|
| `<arc-carousel>` | `true` (constructor default) |
| `<arc-carousel show-dots>` | `true` |
| `<arc-carousel show-dots="false">` | **`true`** — the attribute is present |

There is no attribute value that yields `false`. The prop is settable only from
script, which rules out static HTML, the docs' own examples, and any framework
wrapper that forwards booleans as attributes.

**The library already knows this and fixes it in four components** with an
explicit escape hatch:

```js
legend: { type: Boolean, converter: { fromAttribute: (v) => v !== 'false' } },
```

— `data/activity-heatmap.js:68` (`legend`), `data/uptime.js:31` (`summary`),
`content/video.js` (`controls`), `typography/keyboard-map.js` (`labels`).
`activity-heatmap` even documents it: *"default true; set the attribute to the
string `false` to disable from markup"*.

**Twenty props in eighteen components default to `true` without it:**

`content/carousel.js` — `loop`, `showDots`, `showArrows` ·
`content/marquee.js` — `pauseOnHover` ·
`data/description-list.js` — `dividers` ·
`data/gauge.js` — `showValue` ·
`data/key-value.js` — `dividers` ·
`feedback/conversation.js` — `autoScroll` ·
`feedback/modal.js` — `closable` ·
`feedback/toast.js` — `dedupe` ·
`input/form.js` — `errorSummary` ·
`input/range-slider.js` — `showValues` ·
`input/tag-input.js` — `allowCustom` ·
`layout/toolbar.js` — `border` ·
`navigation/footer.js` — `border` ·
`navigation/scroll-to-top.js` — `smooth` ·
`navigation/sidebar-section.js` — `open` ·
`typography/terminal.js` — `autoplay` ·
`typography/time-ago.js` — `live` ·
`typography/typewriter.js` — `cursor`

`feedback/modal.js`'s `closable` is the one worth looking at first — the
documented way to make a modal non-dismissable is an attribute that cannot
express `false`.

- Pinned by: `test/carousel.test.js` — "BUG: show-dots=\"false\" turns the dots
  on, not off". The other nineteen are not yet pinned; each will get the same
  assertion as I reach its component.
- Two ways out: apply the existing converter to all twenty, or invert the props
  (`no-dots`, `no-border`) so the default is `false`. The converter is
  consistent with what already ships and needs no doc changes beyond the note
  `activity-heatmap` already carries.
**A check now enforces this.** `scripts/checks/boolean-defaults.js` flags any
`type: Boolean` prop that defaults to `true` without a converter, and runs in the
"Assert sources" stage of `pnpm generate` alongside `doc-claims` and
`event-conventions` — it reads only hand-written source, so it fails before the
35s prism step rather than after it.

It ships with the twenty known props in a `BASELINE` array, the same device as
the `ALLOWED` list in `rtl-intl.test.js`: the rule is worth having the moment it
stops the *next* one, and holding it back until the backlog is burned down means
it lands never. So it is green today and fails on:

- a **new** true-by-default boolean prop, and
- a **BASELINE entry that no longer violates** — fixing one means deleting its
  line, so the list shrinks with the work instead of drifting out of date.

Emptying `BASELINE` makes the rule strict. Caveat worth knowing: `check.js`
discards a passing check's stdout, so `pnpm check` shows only `ok`; run
`node scripts/checks/boolean-defaults.js` to print the outstanding twenty.

Verified end-to-end rather than assumed: applying the prescribed converter to
`arc-carousel`'s `showDots` in a scratch copy makes `show-dots="false"` genuinely
yield `false`, flips the pinning test in `carousel.test.js` to failing (as it
should — it pins the broken behaviour), and leaves the other 25 carousel tests
green.

### 48. The same defect turns *on* every false-defaulting boolean — **API, 197 props**

#20 framed this as a problem with the twenty true-defaulting props. It is not.
Lit's stock boolean `fromAttribute` is `value !== null` — **presence**, with the
value ignored — so it misreads every explicit negation in the library:

| markup | `el.disabled` |
|---|---|
| `<arc-input>` | `false` |
| `<arc-input disabled>` | `true` |
| `<arc-input disabled="false">` | **`true`** |
| `<arc-input disabled="0">` | **`true`** |

An author writing `disabled="false"` gets a **disabled** input. This is worse
than #20, because #20 fails to turn something off while this actively turns
something on, and it reaches **all 201 `type: Boolean` props** rather than
twenty. Verified in a browser against `arc-input`, `arc-modal` and
`arc-carousel`; `="0"` and `="off"` behave identically.

To be fair to Lit: this is exactly how HTML's own boolean attributes work
(`<input disabled="false">` is disabled). The mismatch is that ARC UI's booleans
are mostly *configuration* — `showDots`, `dividers`, `legend`, `closable` — not
native mirrors, and they are written from framework templates where
`disabled={false}` forwards as the string `"false"`.

### 49. A non-default boolean does not survive a serialise → re-parse round trip — **SSR / hydration**

188 of the 201 boolean props carry `reflect: true`. Reflection writes presence
for `true` and removes the attribute for `false`, so for a **true-defaulting**
prop the `false` state has no markup representation at all:

```js
el.loop = false;          // arc-carousel, default true
el.outerHTML;             // → '<arc-carousel>' — the attribute is gone
mount(el.outerHTML).loop; // → true. The false is lost.
```

Verified in a browser. Any boundary that serialises to markup and parses back
loses the state: **SSR → hydration**, a framework re-render from `outerHTML`,
copy-paste out of DevTools. `scripts/checks/ssr.js` cannot see it — it proves no
crash, not correct output — and it is the same class as audit bug 5.

This is the finding that makes the boolean situation a correctness bug rather
than an ergonomics complaint, and it is why the fix cannot be "add the existing
converter to twenty props": that converter only changes `fromAttribute`, so the
round trip stays broken.

---

## v4 — the declaration layer (built, prototyped, measured)

The boolean problem below turned out to be one instance of a larger one, and the
larger one is what got built. Recorded here because it supersedes the "three
ways out" analysis that follows: **option C is implemented, as one entry in a
general vocabulary rather than as a boolean-specific fix.**

**The diagnosis.** A component's contract exists four times, hand-written — the
JSDoc prose, the `static properties` literal, the docs data, and the tests — and
`scripts/checks/` detects drift between the copies after the fact. Those checks
can only ever verify that something *exists*: `doc-claims.js` confirms
`@prop selected` is a reactive property and cannot confirm "out-of-range values
are clamped", which is how #1 shipped. Of 833 `@prop` declarations, **495 (59%)
are nothing but a type, a default and a set of legal values** — 155 enums, 214
booleans, 126 numbers — plus 78 prose constraints that are unenforceable English
generating six framework wrappers and 184 docs files.

**The change.** `src/shared/props.js` makes the constraint a *value rather than
prose*:

```js
selected:    int({ default: 0, min: 0, max: '_maxIndex', clamp: 'toRange' }),
orientation: oneOf(['horizontal', 'vertical']),
showDots:    flag(true, { attribute: 'show-dots', negative: 'no-dots' }),
```

`clamp: 'toRange'` *implements* the clamping. `oneOf` gives every unrecognised
value a real fallback. `flag` is the boolean fix. `max` may name another
property, so a bound can track the tab count.

Normalisation runs in `willUpdate` via `DeclaredPropsMixin`, which is the part
that matters: a converter only sees the attribute path, and
`el.orientation = 'diagonal'` from script bypasses it — and the property path is
where several recorded findings actually live.

**The conformance suite is derived, not generated to disk.**
`test/conformance.test.js` reads the `arc` metadata off `elementProperties` at
runtime and derives its assertions. It contains no per-component knowledge and
no `CASES` table — a component gains coverage by adopting the vocabulary, not by
someone remembering to add a row. Fixtures come from the declared range, which
is the direct answer to the degenerate-`min` problem the mutation run found.

**Prototyped on three components** — `arc-tabs`, `arc-carousel`,
`arc-speed-dial`. 74 conformance tests derived from their declarations alone.

**The result, and it is the proof the layer works:** adopting the vocabulary
made **five `BUG:` pinning tests fail, and nothing else.** Every one was a
recorded finding, fixed by the declaration rather than by hand:

| finding | was | now |
|---|---|---|
| #1 | `selected="7"` hides every tab | clamps to the last index |
| #1 | `selected="-1"` hides every tab | clamps to 0 |
| #3 | `orientation="diagonal"` reaches `aria-orientation` | normalised to `horizontal` |
| #17 | unknown `position` anchors nowhere | anchors to the default corner |
| #20 | `show-dots="false"` shows the dots | hides them; `no-dots` also works |

The five pins are inverted, `boolean-defaults.js` lost three BASELINE entries by
its own designed mechanism (a baseline entry that no longer violates fails the
check), and the suite is **1,449 passing, 0 failing, 17/17 checks green**.

**One vacuous assertion found on the way.** The #1 pin asserted
`panel(el).textContent.trim() === ''`. `.tabs__panel` is a shadow node wrapping a
`<slot>`, so its `textContent` is *always* `''` — that assertion could not fail
under any behaviour. The audit's grep for vacuity patterns could not see it,
because it is only vacuous given what the selector resolves to.

### The prism collision — resolved in 2.12.0

`@arclux/prism` 2.11.1 found props by regex over `name: { … }`. Writing
`loop: flag(true)` in `static properties` was invisible to it, and
`pnpm generate` **silently dropped all five of `arc-carousel`'s props from all
six framework wrappers** — exit code 0, `tsc` still green, visible only in
`git diff`. The interim workaround was a parallel `static contract`.

**2.12.0 removed the need for it**, along both axes reported in
`prism-feedback.md`:

- **`config.propsFrom`** — a hook letting this repo answer for its own
  vocabulary. `scripts/prism-props.js` reads the declarations; the semantics stay
  next to `src/shared/props.js` instead of being re-implemented inside prism,
  where they would drift.
- **The silence is fixed.** `unparsed-prop-declaration` (strict) and
  `doc-prop-undeclared` (report-only) close the gap from both directions.

So the bridge is gone: `static contract` and the `finalize()` override are
deleted, and the vocabulary lives in `static properties` as originally intended.
**Verified: all six wrapper packages and the docs data regenerate byte-identically
to what shipped before the declaration layer, and `pnpm generate` exits 0.**

### Two real defects the new diagnostics found on their first run

Neither was introduced by this work; both were shipped.

**`arc-knob`'s `detents` reached none of the six wrappers.** Its declaration
carries a custom `converter` and no `type:` key, so prism could not type it —
`unparsed-prop-declaration`, a strict failure. The prop is documented in a full
paragraph (`@prop {number[] | string} detents`) and appeared **zero** times in
the React wrapper. Fixed by stating `type: Array` alongside the converter; it now
reaches all six.

**`readonly` is missing from 14 React wrappers that document it.** This is the
`doc-prop-undeclared` population: 22 findings, 16 of them props contributed by
`FormControlMixin`, which prism cannot see because it reads a component's own
source. `required` reaches wrappers only because several components re-declare it
locally, shadowing the mixin; `readonly` does not, so it is absent. Also
`arc-date-range-picker`'s `value` (an accessor pair) and `arc-knob`'s `format`.

These stay report-only and are **not** actionable from this repo — prism's
planned move to resolving from `Ctor.elementProperties` makes mixin props visible
and returns the missing wrapper props at the same time. Tracked in
`prism-feedback.md`.

### A hook is a place to lose props quietly, too

Writing `propsFrom` reproduced the exact failure it exists to prevent, twice:

- The entry matcher handled `/* */` but not `//`, so a line comment above a
  declaration dropped `arc-speed-dial`'s `direction` from six wrappers.
- The depth scanner split on commas **inside comments** — "…exact-match CSS
  selectors, so an unrecognised position…" split the block mid-sentence.

Both were caught by diffing generated output, which is exactly the review step
that catches nothing when it passes. `scripts/prism-props.js` now strips comments
before scanning and **throws on any entry it cannot read**, which prism reports as
`invalid-props-from` — a strict failure — rather than absorbing. A hook that
guesses silently is worse than no hook.

### Rolled out — 164 components, 284 props

`scripts/codemod-declared-props.js` did it in two staged passes, each verified
before the next. **The suite went from 1,449 to 3,273 tests**, almost all of it
derived rather than written: `conformance.test.js` now discovers adopted
components from `custom-elements.json` at runtime, so there is no list to
maintain and a component cannot be adopted-but-unverified.

| | files | props |
|---|---:|---:|
| `flag()` | ~120 | 166 |
| `oneOf()` | 85 | 118 |

`boolean-defaults.js` is now **strict** — its BASELINE is empty. All twenty
entries were cleared by the migration, and the check reported each one as it
stopped violating, which is how the migration could not quietly half-finish.

Verified after every stage: `pnpm check` 17/17, `pnpm generate` exit 0, and
**zero drift in all six wrapper packages and the docs data** — the public API
surface is unchanged while the attribute semantics are fixed. Four consecutive
full runs at 3,273 passing.

### Four things the rollout found that reading would not have

**1. `disabled` cannot be tri-state on a form-associated element.** The codemod
converted it on 27 form controls and the tests still passed — but
`<arc-input disabled="false">` was still disabled. A form-associated custom
element whose `disabled` content attribute is merely *present* is "actually
disabled" per the HTML spec, so the platform calls `formDisabledCallback(true)`
and `FormControlMixin` assigns the property straight back. No converter wins
that. All 27 were reverted to `{ type: Boolean, reflect: true }`, which is the
correct answer: `<input disabled="false">` is disabled natively too.

**2. Reflecting only the non-default state would have broken styling
library-wide.** The first `flag()` wrote the attribute only when the value
differed from the default, so a true-defaulting flag had *no* attribute in its
default state — and **14 components style exactly that case** through
`:host([border])`, `:host([open])`, `:host([cursor])`. Caught by grepping for
the pattern before running the codemod, not after. `flag()` now reflects
positively as normal and carries the false state on the separate negative
attribute, so `:host([x])` and `:host([no-x])` both work and the value still
round-trips.

**3. `arc-icon`'s `size` is documented narrower than it behaves.** Its JSDoc
declares a closed five-member union, and the code also accepts any positive
number as a pixel size (`icon.js:102`). `oneOf()` normalised `size="18"` away.
Reverted, and worth noting as the mirror image of most findings here: the docs
understate rather than overstate. A sweep for the same shape across all 118
converted enums found no others.

**4. `arc-theme-toggle` discarded a `theme` set in markup.** `connectedCallback`
sampled `localStorage` and the document root unconditionally, so
`<arc-theme-toggle theme="dark">` rendered as whatever was stored. Found by the
derived conformance suite on a component whose hand-written tests were already
thorough — nobody had thought to set the prop from markup. Fixed: an explicit
attribute wins.

**And one gap in the vocabulary itself.** `arc-top-bar`'s `scrolled` is an
*output* — its own docs say "Set by the component, not by you" — and conformance
was asking it to accept a value from markup. `flag()`/`oneOf()` now take
`derived: true`, and conformance skips the settability assertions for it. Left
unfixed, the vocabulary would have quietly assumed every prop is an input.

## The declared *surface* — slots and parts

`conformance-surface.test.js` is the second derived suite, reading
`custom-elements.json` rather than `elementProperties`: every declared `@slot`
must actually project content, every component must mount and attach a shadow
root without a console error, and every `part=` in the rendered output must be
documented. **568 more derived tests, taking the suite to 3,842.**

It is the runtime half of what `doc-claims.js` checks statically. That check
verifies a documented part or slot *appears in the source*; nothing verified it
reached the output — which is precisely how 2.11.0 shipped wrappers with the
default slot deleted.

**Assertion direction is the whole design.** Slots are asserted forward
(declared → works); a component that documents a slot and drops the content is
broken by any reading. Parts are asserted **backwards** (rendered → declared),
because "every declared part renders" fails honestly-conditional parts —
`arc-carousel`'s `dot` needs slides, `arrow-prev` needs `showArrows` — and a
suite that cries wolf gets deleted. The inverse has no such failure mode, and it
is the direction nothing else covers.

### 50. `arc-fieldset`'s `legend` and `actions` slots cannot be used at all — **correctness**

Found by the surface suite on its first run.

```js
const showLegend = this.legend || this._hasLegend;   // fieldset.js:139
```

`_hasLegend` is set only by `_onLegendSlotChange`, bound to the
`<slot name="legend">` — which lives *inside* the block that `showLegend` gates.
The slot never renders, so `slotchange` never fires, so `_hasLegend` stays
`false`, so the slot never renders. `<arc-fieldset><span slot="legend">Title
</span></arc-fieldset>` displays nothing.

`actions` is trapped in the same block, which is worse: it has nothing to do
with the legend, and is invisible unless an unrelated prop is set.

**Fixed**, and the component already contained the intended design — the CSS
carries `.legend__slot--empty { display: none }` and
`.fieldset__actions--empty { display: none }`, i.e. render the slots always and
hide them when empty. Only the outer conditional was wrong. The `<legend>` now
renders unconditionally with a `--empty` class, so the slots exist for
`slotchange` to fire on and the visual result is unchanged.

### 51. `doc-claims.js` could not see a part whose name is chosen at render time

`arc-tree-view` renders `part="${level === 0 ? 'tree' : 'group'}"`. The check's
literal pattern excludes `$` deliberately, and its dynamic-part escape hatch
matches `part=${…}` unquoted — so this quoted-interpolated form matched neither,
and documenting the two real parts made the check fail with "nothing renders
part=tree".

Fixed by harvesting the string literals out of the expression rather than
skipping it: the names a ternary can produce are exactly its quoted literals, so
it stays a check rather than becoming a guess. Only a genuinely computed name
falls back to not-knowable. `arc-tree-view` now documents `tree` and `group`,
which were undocumented and unstylable before.

### Two general rules, rather than an exception list

The suite carries no per-component waivers — that would reintroduce the
maintained-table problem it exists to avoid. Two cases needed general answers:

- **`@slot item-${index}`** (`arc-virtual-list`) is a *pattern*, not a name. Slot
  names containing `${` are skipped. Worth knowing the template syntax reaches
  `custom-elements.json` and the docs site verbatim.
- **`arc-auth-shell`'s `aside` only exists when `variant="split"`.** Rather than
  waive it, the suite retries across each declared enum value — which it can do
  precisely because `variant` is an adopted `oneOf`. The claim tested is that a
  documented slot works in *some* documented configuration, not in the default
  one.

---

### What remains

164 of 207 components have adopted it. The rest is a codemod plus review, and
it is genuinely v4-scale. `flag(true)` deliberately throws without a `negative`
name, so the migration cannot half-land.

Not covered by this and still needing hand-written tests: drag gestures,
keyboard protocols, focus management, the v3 close contract — roughly the 40% of
the surface that is bespoke, and exactly where mutation score is the right
instrument.

---

## v4 — solving the root of the boolean problem (superseded by the above)

**The root cause, stated once.** ARC UI declares 201 boolean props with Lit's
stock `type: Boolean` and treats them all as HTML-native boolean attributes,
where presence means true and the value is ignored. Only a minority actually are
native mirrors. For the rest, presence-only semantics fail in three separate
directions — #20 (cannot express false), #48 (explicit false reads as true),
#49 (false does not round-trip). One cause, three symptoms, 201 props.

The four `fromAttribute` escape hatches already in the tree treat symptom #20 on
four props and leave #48 and #49 untouched everywhere.

**What a real fix has to do:** accept `="false"` as false; keep presence meaning
true; give the non-default state a markup representation that survives a round
trip; and keep CSS attribute selectors workable, since `enum-fallbacks.js`
exists precisely because this library styles off attributes.

That last constraint rules out the obvious tri-state reflection. If a
true-defaulting `border` reflected its false state as `border="false"`, then
`:host([border])` — the natural selector — would match while the border is
**off**. Every such rule in the library would need
`:host([border]:not([border='false']))`.

### The three ways out, with what each costs

| | **A. Tri-state converter everywhere** | **B. Invert the prop names** | **C. Positive property, negative attribute** |
|---|---|---|---|
| Declaration | `showDots: flag(true)` | `noDots: { type: Boolean }` | `showDots: flag(true)` |
| Markup off | `show-dots="false"` | `no-dots` | `no-dots` *or* `show-dots="false"` |
| JS property | `showDots` (positive) | `noDots` (double negative in use) | `showDots` (positive) |
| CSS selector | `:host([show-dots='false'])` | `:host([no-dots])` | `:host([no-dots])` |
| Round-trips (#49) | yes | yes | yes |
| Fixes #48 | yes | n/a — no true-default left | yes |
| Churn | converter on 201 props | renames 20 public props **and** every CSS rule and doc example | converter on 201 props, one extra attribute name on the 20 |

**Recommendation: C.** It is B's clean CSS story without B's double negatives —
`if (!el.noDots)` is the kind of thing that reads wrong in review forever, and
renaming twenty public props costs a migration codemod either way. C keeps every
JS property name and every doc example as they are, and the only new public
surface is one negative attribute alias per true-defaulting prop.

Sketch, as one shared declaration helper rather than 201 hand-written literals:

```js
// shared/props.js
export const flag = (fallback = false, negative = null) => ({
  type: Boolean,
  reflect: true,
  converter: {
    // Presence still means true. An explicit falsey string means false.
    // Removal returns to the *declared default*, not to false.
    fromAttribute: (v) =>
      v === null ? fallback : !(v === 'false' || v === '0' || v === 'off'),
    // Only the non-default state is written, and for a true default it is
    // written as the negative attribute, so `:host([no-dots])` keeps working.
    toAttribute: (v) => (v === fallback ? null : v ? '' : null),
  },
  ...(negative ? { attribute: negative } : {}),
});
```

The `negative` half needs a second declared property to carry the alias — worth
prototyping before committing, which is the next concrete step on this.

**Why this belongs in v4 and not in a patch.** `disabled="false"` changes meaning
from `true` to `false`. That is a fix, and it is exactly the kind of silent
behaviour change a major release exists for. A codemod can find every
`bool="false"` in consumer markup; nothing can find it at runtime.

**What this changes for the remaining test work.** Per the decision on this
question, Tier B and Tier A tests keep pinning current behaviour with `// BUG:`
and do not assume any of the above. `boolean-defaults.js` stays baselined at 20;
when C lands it is rewritten to flag any `type: Boolean` not declared through
`flag()`, which turns its BASELINE from a list of twenty into a list of one rule.

---

## arc-tree-view

### 21-23. Expansion and selection are keyed on the label, not the path — **correctness**

`_isExpanded` (`navigation/tree-view.js:141`), `_toggleExpand` (`:148`) and
`_selected` (`:171`) all key on `item.label`. Two nodes anywhere in the tree that
share a label share state. This is not exotic — it is `src/index.js` and
`test/index.js`, or "General" under two different sections.

- **Selecting one node marks every same-named node.** Clicking `src/index.js`
  leaves two rows with `aria-selected="true"`.
- **Expanding one branch expands every branch with that label.** Two `assets`
  folders open and close together from one click.
- **`arc-toggle` carries no path**, only `{ label, icon }`, so a consumer cannot
  even tell which of the two moved. `arc-select` does carry `path` — the two
  events disagree about what identifies a node.

Pinned by three tests in `test/tree-view.test.js` under "arc-tree-view duplicate
labels". The fix is the path key the component already computes for focus —
`_pathKey(path)` (`:215`) — used for expansion and selection too.

### 24. Every leaf ships `aria-expanded=""` — **a11y**

`aria-expanded=${hasChildren ? String(expanded) : undefined}` (`:248`). In Lit
only `nothing` removes an attribute; `undefined` is stringified, so the attribute
is present and empty on every leaf. An empty string is not a valid value for an
enumerated ARIA state, and its presence advertises leaves as expandable.

- Pinned by: `test/tree-view.test.js` — "BUG: a leaf renders aria-expanded=\"\"
  instead of omitting the attribute".
- `arc-chip:83` already does this correctly with `nothing`, and five other
  components import it — the idiom is established, this file just missed it.

### 25. The same `undefined`-instead-of-`nothing` slip in three more components

Verified by rendering each and reading the attribute back, not inferred:

| file | binding | renders |
|---|---|---|
| `input/textarea.js:227` | `maxlength` | `maxlength=""` |
| `input/textarea.js:228` | `aria-labelledby` | `aria-labelledby=""` |
| `input/textarea.js:230` | `aria-describedby` | `aria-describedby=""` |
| `layout/resizable.js:219` | `aria-valuemax` | `aria-valuemax=""` |

The empty `aria-labelledby`/`aria-describedby` on an unlabelled `arc-textarea`
are the ones worth a look — they are IDREF lists pointing at nothing, on a form
control, and `arc-textarea` is in the `form-contract.test.js` sweep so it is
otherwise well covered.

`navigation/menu.js`'s `@mouseenter=${… : null}` pattern is fine by contrast —
a null *listener* is a genuine no-op; only attribute positions have this problem.

**A check now enforces this too.** `scripts/checks/empty-attributes.js`, added
alongside `boolean-defaults.js` in the "Assert sources" stage of
`pnpm generate`. It reads every attribute binding in the component sources (578
of them) and flags any whose expression falls back to `undefined` or `null`
rather than `nothing`.

It deliberately ignores the three forms where a nullish fallback is correct:

- `@mouseenter=${cond ? fn : null}` — a null *listener* is a genuine no-op, and
  `arc-navigation-menu` does this on purpose
- `.value=${… : undefined}` — a property assignment, not a rendered attribute
- `?disabled=${…}` — presence is already driven by truthiness

Same baseline device as `boolean-defaults.js`: the five known bindings are
listed, so it is green today and fails on a new occurrence or on a BASELINE
entry that has been fixed. Verified end-to-end — applying `nothing` (plus the
import) to `arc-tree-view` in a scratch copy removes the attribute entirely,
flips the pinning test to failing as it should, and leaves the other 24
tree-view tests green.

---

## arc-list / arc-list-item

### 26. A value containing a comma cannot be tracked — **correctness**

`value` is a single comma-joined string (`data/list.js:101`), split apart again
on every read (`:117`). A value that itself contains a comma — `"Smith, John"`,
a locale-formatted number, a tag list — cannot survive the round trip:
`_syncSelection` looks for the whole string among the split fragments, never
finds it, and the item is recorded in `value` while never being marked selected
on screen.

- Pinned by: `test/list.test.js` — "BUG: an item whose value contains a comma
  cannot be tracked".
- An array-valued `value` would fix it, at the cost of the attribute form.
  `arc-multi-select` and `arc-tag-input` both take arrays (`form-contract.test.js:42, 50`),
  so there is precedent either way.

### 27. A non-selectable list still carries `aria-multiselectable` — **a11y**

`aria-multiselectable` is bound unconditionally (`list.js:194`), so a plain list
renders `role="list" aria-multiselectable="false"`. That attribute is defined
only for `listbox`, `grid`, `tree` and `tablist`; on `role="list"` it is not
allowed, which is what axe's `aria-allowed-attr` rule reports.

- Pinned by: `test/list.test.js` — "BUG: a non-selectable list carries
  aria-multiselectable anyway".
- `nothing` is the fix, and this file already imports it for `aria-label`.

### 28. Items claim `role="option"` even inside a plain list — **a11y**

`arc-list-item` renders `role="option"` and `aria-selected` unconditionally
(`data/list-item.js:190, 202`), regardless of its parent. A non-selectable
`arc-list` is therefore a `role="list"` containing `role="option"` children — a
list with no `listitem` in it, and options outside any listbox. Both halves are
invalid; screen readers announce item counts and positions from these roles.

- Pinned by: `test/list.test.js` — "BUG: items claim role=option even inside a
  plain list".
- `arc-chip` solves exactly this by checking its ancestor before choosing a role
  (`input/chip.js:54`) — the same fix applies, keyed on the parent list's
  `selectable`.

---

## arc-command-bar

### 29. The input has no accessible name — **a11y**

The field carries no `aria-label`, no `aria-labelledby` and no associated
`<label>` (`navigation/command-bar.js:124-133`) — only a placeholder. A
placeholder is explicitly not an accessible name: it is announced inconsistently
and disappears the moment the user types. There is no `label` prop to supply
one, and an `aria-label` on the host does not reach into the shadow root.

- Pinned by: `test/command-bar.test.js` — "BUG: the input has no accessible
  name, only a placeholder".
- Every other input in the library takes a label; this one has no way to accept
  it. Adding a `label` prop is the fix, defaulting the `aria-label` to something
  like "Search" rather than leaving it unnamed.

### 30. Enter inside a form submits twice — **correctness**

`_onKeyDown` (`command-bar.js:106`) dispatches `arc-submit` and never calls
`preventDefault`. Inside a `<form>`, Enter in a text input also triggers the
form's implicit submission, so one key press produces both an `arc-submit` and a
native `submit`.

- Pinned by: `test/command-bar.test.js` — "BUG: Enter inside a form submits the
  form as well as firing arc-submit".
- `arc-form` already handles the equivalent case deliberately for `arc-input`
  (`form.test.js:73-91` pins submit-on-Enter for single-line and *not* for
  multiline), so the intended behaviour is decided; this component just does not
  claim the key.

---

## arc-context-menu / arc-menu-item

### 31. A second right-click while open leaves the menu behind — **correctness**

`_x` and `_y` are plain fields, not reactive properties, and `updated()` only
repositions when `open` itself changes (`feedback/context-menu.js:178-184`).
Right-clicking somewhere else while the menu is already open records the new
coordinates and never re-runs the PositionController, so the menu stays where it
was — now pointing at the wrong target.

Reproducing it needs no unusual sequence: right-click, then right-click
elsewhere without dismissing first.

- Pinned by: `test/context-menu.test.js` — "BUG: a second right-click while open
  leaves the menu at the old point".
- Declaring `_x`/`_y` as reactive state, or calling `this._position.show()` from
  `_handleContextMenu`, fixes it.

### 32. `arc-menu-item`'s `label` is documented as a prop but cannot be set — **doc-mismatch**

`shared/menu-item.js:7` declares `@prop {string} label - Display text for the
menu item.` It is a getter over `this.textContent` (`menu-item.js:33`) with no
setter and no attribute. `<arc-menu-item label="Cut"></arc-menu-item>` renders a
blank item, silently — the correct form is `<arc-menu-item>Cut</arc-menu-item>`.

This cost me a debugging pass while writing the tests above, which is a fair
proxy for what it costs a consumer reading the same docs.

- Not pinned as a BUG test — the component's real contract (label from slotted
  text) is what the file now exercises throughout. Recorded because the docs
  advertise a settable prop that is read-only.
- `scripts/checks/doc-claims.js` cannot catch it: its header explicitly allows a
  prop implemented as an accessor, which is right — the gap is that a
  getter-only accessor is documented identically to a settable one. The six
  generated framework wrappers will expose `label` as a writable prop that
  does nothing.

**Checked and correct**, recorded so they are not re-investigated: the v3 close
contract holds on all three dismissal paths (Escape, backdrop, selection) and a
`preventDefault()` veto holds on each; focus moves into the menu on open and
returns to the previous element on Escape, while a backdrop dismissal
deliberately leaves focus alone; keyboard navigation skips both dividers and
disabled items and wraps at each end; `aria-activedescendant` is omitted via
`nothing` until something is active and always resolves to a live element.

---

## arc-split-pane

Read this section against `arc-resizable`, which solves the same problem in the
same directory and gets three of the four right.

### 33. The divider is not operable by keyboard and invisible to assistive tech — **a11y**

The handle is a bare `<div>` with a single `@mousedown` (`layout/split-pane.js:164-168`):
no `role`, no `tabindex`, no `aria-orientation`, no `aria-valuenow/min/max`, and
no keydown handler anywhere in the file. A keyboard user cannot move the divider
at all, and a screen reader has nothing to announce.

`arc-resizable`'s handle (`layout/resizable.js:213-222`) is
`role="separator" tabindex="0"` with the full `aria-value*` set, an
`aria-label`, and an arrow-key handler with a Shift-modified step. It is a
working reference sitting one file away.

- Pinned by: `test/split-pane.test.js` — "BUG: the divider has no separator role
  and is not focusable" and "BUG: the divider cannot be moved by keyboard".

### 34. Mouse-only, so it cannot be dragged on a touch device — **correctness**

The drag is wired to `mousedown` / `mousemove` / `mouseup`
(`split-pane.js:99-131`). Touch and pen never produce those events.

Every other draggable control in the library uses pointer events — `arc-knob`,
`arc-waveform`, `arc-image-compare`, `arc-signature-pad` and `arc-resizable`.
This is the only one that does not.

- Pinned by: `test/split-pane.test.js` — "BUG: a pointer (touch) drag does nothing".

### 35. `arc-resize` is documented as firing during the drag; it fires only on release — **doc-mismatch**

`split-pane.js:12` declares *"Fired during divider drag with { ratio } detail"*.
The dispatch is in `_onMouseUp` (`split-pane.js:134`). `ratio` changes on every
mousemove with no event at all, so a consumer syncing a layout live gets nothing
until the user lets go.

`arc-resizable` fires per move (`resizable.js:152`), which is what the shared
docs describe.

- Pinned by: `test/split-pane.test.js` — "BUG: arc-resize is documented as
  firing during the drag but fires only on release".

**Checked and correct**: ratio maths against the container box, min/max clamping,
teardown of the window listeners on release *and* on disconnect mid-drag.

---

## arc-resizable

### 36. An unbounded panel renders `aria-valuemax=""` — **a11y**

`aria-valuemax=${isFinite(this.maxSize) ? this.maxSize : undefined}`
(`resizable.js:219`), and `maxSize` defaults to `Infinity` — so the *common*
case takes the falsy branch and ships an empty attribute. Same root as #24/#25,
and already covered by `scripts/checks/empty-attributes.js`.

- Pinned by: `test/resizable.test.js` — "BUG: an unbounded panel renders
  aria-valuemax=\"\" instead of omitting it".

**Otherwise clean, and worth saying so**: separator semantics, tab stop, live
`aria-valuenow`, arrow keys with a Shift step, clamping on both input paths,
`arc-resize` only when the size actually changed, pointer capture, and teardown
after release. 23 tests, one finding.

---

## 37. Enum defaults chosen by exact match in JS — **enum fallback, 3 instances**

`scripts/checks/enum-fallbacks.js` catches a default selected by attribute
*absence* in CSS. The same mistake in a JavaScript ternary is not covered:

```js
this.direction === 'horizontal' ? /* inline axis */ : /* block axis */
```

The default is `'horizontal'`, so every unrecognised value falls through to the
**vertical** branch rather than to the default. `<arc-resizable direction="diagonal">`
resizes vertically; `<arc-split-pane orientation="diagonal">` splits vertically.

Swept across the component sources — three occurrences, all two-member enums:

| file | prop | default | unknown value behaves as |
|---|---|---|---|
| `layout/resizable.js` | `direction` | `horizontal` | vertical |
| `layout/split-pane.js` | `orientation` | `horizontal` | vertical |
| `input/otp-input.js` | `type` | `number` | text |

- Pinned by: `test/resizable.test.js` and `test/split-pane.test.js` — "BUG: an
  unrecognised … behaves as vertical, not as the default", each paired with a
  test asserting the documented default still works.
- **Not proposed as a fourth check.** Three instances, all two-member enums
  where the fallback lands on the other member rather than on nothing — a
  smaller blast radius than the CSS form, and too thin a seam to justify another
  script. The cheaper fix is to invert the tests (`=== 'vertical' ? block : inline`)
  so the default catches everything, or to extend `enum-fallbacks.js`, which
  already parses `@prop` unions and would only need the ternary pattern added.

---

## arc-range-slider

### 38. A key press at a rail announces a change that did not happen — **correctness**

`_onKeyDown` (`input/range-slider.js:325-332`) clamps the new value and then
calls `_fireInput()` and `_fireChange()` unconditionally — nothing checks that
the value actually moved. Pressing ArrowLeft with `low` already at `min` emits a
full edit-and-commit pair for an unchanged range.

`arc-change` is the expensive half of the v3 contract — its own docs say
*"Use for persisting to a database or triggering an expensive operation"*
(`range-slider.js:20`). Holding a key against a rail fires one per repeat.

Every sibling control guards this. `arc-knob` has a dedicated test for it —
"a step against a rail clamps and stays silent" (`knob.test.js:101`) — and
`arc-rating` does the same. This is the third instance of the same shape
after `arc-carousel` (#19) and it is the most costly, because here it is the
commit event rather than a notification.

- Pinned by: `test/range-slider.test.js` — "BUG: a key press at a rail still
  announces an input and a change".

### 39. The canonical `detail.value` is undocumented — **doc gap**

Both events carry `detail.value` as `[low, high]` alongside the named keys
(`range-slider.js:241, 252`), which is what `scripts/checks/event-conventions.js`
requires. But the `@fires` annotations declare only
`{CustomEvent<{ low: number, high: number }>}` (`range-slider.js:19-20`), so the
generated wrappers, the manifest and the docs site all describe a detail shape
missing its canonical key. A consumer following the docs writes
`e.detail.low` and never learns the generic handler would have worked.

- Not pinned as a BUG — the runtime behaviour is correct and is asserted
  throughout the file. Recorded because the docs understate the contract.

**Checked and correct**, and worth recording given how much of this component is
bespoke: thumbs bound each other rather than crossing on both input paths;
`_snap` fixes float drift by rounding to the step's decimal places; the track
click moves the *nearer* thumb and focuses it; and — unusually — the control
overrides `formStateRestoreCallback` to split its comma-joined pair back apart,
which is exactly the gap the base mixin leaves open (audit bug 4). 25 tests.

---

## arc-file-upload

### 40. `disabled` is drawn in CSS only, so the keyboard path stays live — **a11y / correctness**

`:host([disabled]) { opacity: .5; pointer-events: none }` (`input/file-upload.js:36`)
is the whole of it. The dropzone's `tabindex="0"` is hardcoded
(`file-upload.js:292`), no `aria-disabled` is set, and neither `_handleKeydown`
nor `_handleClick` (`file-upload.js:244, 278`) checks the flag.

`pointer-events` does not affect the keyboard. A disabled dropzone is therefore
still a tab stop, still announces as an ordinary button, and **still opens the
file picker on Enter or Space**. It also still accepts a programmatic drop.

- Pinned by: `test/file-upload.test.js` — "BUG: a disabled dropzone is still
  focusable and still opens the picker" and "BUG: a disabled dropzone still
  accepts a drop".
- Same shape as the disabled-anchor case in `arc-button` (`test-audit.md` §5,
  bug 2), reached by a different mechanism.

**Swept for a wider pattern; there isn't one.** Five components looked like
candidates statically — CSS-only `disabled` plus an unconditional `tabindex="0"`
— but on inspection:

| component | verdict |
|---|---|
| `input/file-upload.js` | **confirmed** — keyboard fully live |
| `input/date-picker.js` | false positive — has no tab stop when disabled (verified in a browser) |
| `input/date-range-picker.js` | false positive — same |
| `input/range-slider.js` | keyboard handler *does* guard on `this.disabled`; asserted in `range-slider.test.js` |
| `input/sortable-list.js` | keyboard handler *does* guard on `this.disabled` |

So this is **two instances via two different mechanisms**, not a pattern — no
check proposed. Recorded here mainly so the next person who spots the
`pointer-events: none` idiom does not re-run the sweep.

**Checked and correct**: single vs. multiple semantics, `maxSize` rejecting only
the oversized files while letting the rest through with an inline error, the
remove path emitting `arc-remove` then `arc-change` in that order, and the
native input being cleared so the same file can be picked twice.

---

## arc-sortable-list

### 41. The rendered mirror is text-only, so item markup is discarded — **correctness**

The component hides its slotted children and renders a mirror of them, but the
mirror is `${item.node?.textContent ?? ''}` (`input/sortable-list.js:350`). Every
element inside an item is dropped: an avatar, a badge, a link, a nested `arc-*`
component — all render as a bare string.

The original markup is still in the light DOM, just hidden, so nothing is lost
permanently — it simply never reaches the screen.

`scripts/checks/slot-hydration.js` describes exactly this hide-and-mirror shape
and exists to make sure the mirror is *populated*. What it cannot see is that the
mirror is **lossy**.

- Pinned by: `test/sortable-list.test.js` — "BUG: markup inside an item is
  discarded, leaving only its text".
- Rendering the node itself, or a `<slot name="item-N">` per row the way
  `arc-virtual-list` does (`virtual-list.test.js:108-116`), would preserve it.

### 42. Rows carry the deprecated `aria-grabbed` — **a11y**

`aria-grabbed` (`sortable-list.js:337`) was deprecated in ARIA 1.1 along with the
whole drag-and-drop module, and is not implemented by current assistive
technology. It is rendered on every row, always. Nothing else in the library
uses it.

- Pinned by: `test/sortable-list.test.js` — "BUG: rows carry the deprecated
  aria-grabbed attribute".

**Checked and correct**: the keyboard reorder path is real and complete — Space
selects, Enter picks up, arrows move, Enter confirms, Escape abandons without
announcing — and it commits only on confirmation rather than on each step. That
matters here because the drag path is HTML5 drag-and-drop, which has no touch
equivalent; the keyboard path is what makes the component usable at all on a
tablet.

---

## arc-guided-tour

### 43. Reopening a finished tour resumes on the last step — **doc-mismatch**

`feedback/guided-tour.js:12` documents `open` as *"Set to true to start the tour
from the first step."* Nothing resets `active` — not `_complete`
(`guided-tour.js:185`), not `_dismiss`, and not the `open` observer. A tour that
was finished or skipped and is then reopened resumes wherever it stopped, so a
user re-running the tour lands on the final step with Next already meaning
Finish.

- Pinned by: `test/guided-tour.test.js` — "BUG: reopening a finished tour resumes
  on the last step, not the first" and the equivalent after a skip.

### 44. `active` is documented read-only but is writable and silent — **doc-mismatch**

`guided-tour.js:11` declares *"Read-only property reflecting the zero-based index
of the currently active step."* It is an ordinary reactive property with no
setter guard, so it is writable — and writing it moves the tour **without firing
`arc-change`**, which is the only signal a consumer has for tracking progress.

- Pinned by: `test/guided-tour.test.js` — "BUG: active is documented read-only
  but is writable, and silent when written".
- Same class as `arc-menu-item`'s `label` (#32), inverted: there a getter was
  documented as a settable prop; here a settable prop is documented as read-only.

**Checked and correct**: the spotlight ring tracks the target's box with its 8px
inset on every step; the Prev button is not rendered on the first step; finishing
the last step completes rather than advancing and does *not* fire `arc-close`;
and the skip path honours a cancelable `arc-close` veto.

---

## Clean — arc-app-shell

21 tests, nothing found. Recorded because it is the most intricate component
covered so far and every part of it holds up: the mobile breakpoint is a real
`window.innerWidth <= breakpoint` comparison that re-evaluates on resize and
tears the listener down on disconnect; an open drawer is a genuine modal surface
(scroll locked, focus moved in, focus returned to the element that opened it);
growing past the breakpoint closes the drawer rather than stranding it; all four
dismissal routes announce `arc-sidebar-toggle`; and the echo guard
(`_onToggle` dropping events whose target is the shell) means the shell and
`arc-top-bar` cannot ping-pong.

---

## Clean — arc-chart

30 tests, nothing found. Worth recording in detail because the accessibility
approach is the best in the library and should be the reference for the other
data-visualisation components:

The SVG is `aria-hidden="true"` by design, and the accessible surface is a
visually-hidden `<table class="sr-only">` with a `<caption>`, `scope="col"` on
every column header and `scope="row"` on every row header — categories down the
rows, series across the columns. It survives `hide-axis`, so the values stay
readable even in the compact trend-panel form.

The documented data contract also holds exactly as written: the seventh and later
series fold into a summed `Other (N series)` that is named in the legend; the
legend appears for two or more series and is omitted for one; `valueFormat`
drives `Intl.NumberFormat` for number, percent (fractional input, `0.24 → 24%`)
and currency, defaulting to USD; an unrecognised `type` or `valueFormat` still
renders; and entries with no `data` array are dropped rather than throwing.

Contrast with `arc-gauge` (#19-era finding) and `arc-level-meter`, which are
asserted through internal class names because they publish no equivalent
accessible rendering.

---

## Clean — arc-kanban

21 tests, nothing found. The component that most deserved a finding and did not.

It is the counter-example to `arc-split-pane` (#33-35): the pointer path is a
bespoke drag, which would have made the board mouse-only — so it ships a
complete keyboard move protocol instead. Space grabs, arrows move within and
across columns, Space drops, Escape cancels and restores the original order, and
each step is announced in a live region. `arc-card-move` reports the final
clamped position, and a move that would be a no-op returns early rather than
announcing.

Two details worth noting for anyone testing it later:

- `arc-card-click` is dispatched from `_onCardPointerUp` (`data/kanban.js:349`)
  and only when no drag occurred, so `element.click()` never triggers it — a
  `pointerdown`/`pointerup` pair is required.
- The component works on an internal copy of `columns`, as documented, and the
  caller's array is genuinely left unmutated. Asserted directly.

---

## arc-date-range-picker

### 45. `detail.value` is an object while the `value` property is a string — **contract**

`arc-change` carries `detail.value` as `{ start, end }`
(`input/date-range-picker.js:509`), but the `value` property it is named after is
an ISO 8601 interval **string**, `"2026-03-01/2026-03-08"`
(`date-range-picker.js:403`). Reading `e.detail.value` and reading `el.value` on
the same component gives two different shapes.

The stated point of the canonical key, per
`scripts/checks/event-conventions.js:88`, is that *"one generic handler could read
detail.value on every emitter"* — which only holds if `detail.value` means the
control's value. The check passes because it verifies the key **exists**, not
that it agrees with the property.

The `@fires` annotation (`date-range-picker.js:28`) also omits `value` entirely,
declaring only `{ start, end }` — the same documentation gap as
`arc-range-slider` (#39).

- Pinned by: `test/date-range-picker.test.js` — "BUG: detail.value is an object
  while the value property is a string".

### 46. The panel opens on the current month, not on the selected range — **MISDIAGNOSED; the real cause is #59, now fixed**

The symptom was real: a picker with a pre-selected range from last quarter opened
on today, with its own selection off-screen.

The diagnosis below was wrong, and worth leaving visible rather than deleting.

> Nothing navigates the calendar to `start`. `arc-date-picker` and `arc-calendar`
> both accept the month to display; this one derives it from the clock only.

Nothing about it was clock-derived. The anchoring existed all along, in
`_toggleDropdown` — so it ran on the field click and **not** on `el.open = true`.
The `open()` helper in `date-range-picker.test.js` uses the property, so every
observation behind this entry came through the broken path while the working one
sat two lines away in the same file.

What made it look like a whole-component defect was comparing against
`arc-date-picker`, which *did* anchor in my spot check — because I happened to
open that one by clicking. Two components, two paths, one conclusion drawn across
them. The lesson is narrower than "check both paths": it is that **a comparison
between components is only evidence if both sides were exercised the same way.**

Reclassified as one instance of #59. Fixed there, for all three components.

- Pinned by: `test/date-range-picker.test.js` — "opens on the month the range
  starts in, however it was opened", and `test/open-parity-sweep.test.js`.

**Checked and correct**: the derived `value` is empty until *both* ends are set
and round-trips through assignment; selection commits on the second click and
not the first; `required` is unsatisfied by a half range; `form.reset()` restores
both ends; and presets select the last N days and close.

---

## arc-image-cropper

### 47. `zoom` is documented as clamped to 1-4 and is clamped nowhere — **doc-mismatch — FIXED**

**Fixed by the declaration**, as #70 fixed its five: `zoom: num({ default: 1,
min: 1, max: 4, clamp: 'toRange' })`, and the `_zoomClamped` getter the render
used is deleted — the render now reads `this.zoom`, which is the same number the
component holds. `arc-image-cropper` was **not on `DeclaredPropsMixin`**, so the
declaration would have been inert; that is #70's own stated trap, and it applied
here too.

`input/image-cropper.js:20` declares *"Image zoom factor, clamped to 1-4."*
There is no setter guard, and `_onZoomInput` (`image-cropper.js:574`) simply
assigns `Number(e.target.value)`. The only bound anywhere is `min`/`max` on the
range input, which constrains the **slider UI** and not the property — so
`el.zoom = 10` sticks, and so does `el.zoom = -3`.

This is the third instance of one shape: documented behaviour that holds on the
interaction path and not on the property. See also `arc-tabs`' unclamped
`selected` (#1) and `arc-theme-toggle`'s unsynced `theme` (#14). All three would
be fixed by a setter or an `updated()` guard rather than relying on the widget.

- Pinned by: `test/image-cropper.test.js` — "BUG: zoom is documented as clamped
  to 1-4 but accepts anything", paired with a test asserting the slider itself
  *is* correctly bounded.

**Checked and correct**: a broken `src` renders `role="alert"`; the crop
rectangle moves by keyboard, claims the arrow keys, and clamps at the stage
edge; `aspect` genuinely constrains the rectangle at 1 and 16:9 and frees it at
0; and `arc-crop-change` reports `{x, y, width, height}` and coalesces a burst of
key presses into fewer events, as its "debounced to animation frames"
documentation claims.

---

## Clean — arc-event-calendar

23 tests, nothing found. `date` anchors the visible period so the component is
testable without depending on the clock; multi-day events span every covered day
and stop at `end`; the locale and an explicit `first-day-of-week` both move the
weekday headers; the month/week toggle keeps the anchored day on screen and
announces `arc-period-change` with both the new view and the new date; and the
three events carry exactly what their docs promise (`detail.event`,
`detail.date`, `{view, date}`).

---

## arc-navigation-menu — covered, 32 tests, three findings

The one Tier C component without a test file. A previous attempt was written,
could not be stabilised, and was removed; the five traps recorded then were all
real and are honoured in the file. A **sixth** was what actually made it
unstable, and it was never diagnosed:

### The viewport is 800px and this component collapses at 900px

`.nav { display: none }` below 900px, and the test runner's window is 800.
So the entire desktop bar is hidden for the whole suite. Structural assertions
still pass — the elements exist and carry their classes and ARIA — but nothing
in it can take focus, because a `display: none` subtree is not focusable.

A focus assertion therefore fails for a reason that has nothing to do with the
component, and it fails in the worst possible way: **comparing two DOM nodes with
`.to.equal()` makes chai walk live DOM references building a diff, and the runner
hangs.** The file timed out at 120s having run *zero* tests, with no failure
message naming anything. That is almost certainly what "could not get it stable"
was.

Two lessons, both now in the handoff:

- The `expect(domNode).to.equal(null)` warning already recorded was too narrow.
  It is **any** `.to.equal()` between DOM nodes. Compare a boolean.
- `forceDesktop()` in the test file re-enables `.nav` via an injected adopted
  stylesheet, for the tests that need real focus. Worth knowing for every other
  breakpoint-gated component: their responsive behaviour is inert in this suite.

### 66. Escape closes the dropdown and drops focus — **FIXED**

```js
if (this._openIndex >= 0) {
  this._close();                       // sets _openIndex = -1
  const triggers = this.shadowRoot.querySelectorAll('.nav__trigger');
  triggers[this._openIndex]?.focus();  // triggers[-1] → undefined
}
```

The index is cleared and then read. The optional chaining is what makes it
silent: no error, focus simply stays where it was — for a keyboard user, back at
the top of the document after every Escape. Fixed by capturing the index first.

### 67. The portal loses its styles on reconnect — **FIXED**

The mobile overlay renders into a *portal*: a separate element appended to
`document.body` with its own shadow root. `_createPortal()` runs on every
`connectedCallback` and builds a **new** root, but "already styled" was an
instance flag that survived the reconnect — so the second portal was never
styled, and a portal shadow root inherits nothing from its host, so there is no
degraded state to fall back to. The overlay rendered as unstyled markup over the
page.

Same family as #55 and #64 — state outliving the thing it describes — with a
third mechanism: not a mismatched lifecycle but a cached *done* flag. Now keyed
on the portal root's own `adoptedStyleSheets`.

The first fix was **incomplete and the test caught it**: `_renderPortal()` is
otherwise only called from `updated()`, and a reconnect does not by itself
request an update, so the fresh portal stayed empty *and* unstyled until
something unrelated re-rendered. `_createPortal()` now fills it directly.

### Checked and correct

The reduced-motion path, which looked like a hazard and is not.
`_closeMobile()` completes only on `animationend` for `mobile-slide-out`, so a
suppressed animation would leave the menu permanently open — and
`_closeMobile()` early-returns while `_mobileClosing`, so there would be no way
back. `shared-styles.js` sets `animation-duration: 0.01ms` under
`prefers-reduced-motion` rather than `animation: none`, **with a comment naming
exactly this failure mode** for the toast and snackbar. A cancelled animation
fires no event; a 0.01ms one does. It was already thought through.

---

## arc-data-grid

74 tests, two findings. The first of the eight large stateful inputs. The
documented ownership boundary — *"the grid works on an internal shallow copy —
sorting and inline edits never mutate the array you pass in"* — holds, including
the harder half of the claim: every index that leaves the component (`arc-select`'s
`selectedIndices`, `arc-cell-change`'s `rowIndex`) indexes the **original** array
even while the grid is displaying a sorted view. That is the kind of promise
that is usually only half-true, and here it is not.

### 53. Space in the header row selects every row from any column — **inconsistency**

`data/data-grid.js:559` handles Space by checking the row only:

```js
case ' ': {
  if (!this.selectable) return;
  e.preventDefault();
  if (r === 0) { this._toggleAll(); }
  …
```

`_activateCell` (`data-grid.js:579`), which handles **Enter**, checks the column
as well — `if (this.selectable && c === 0)`. So on the *same* header cell of an
ordinary data column, Enter sorts and Space selects all four rows. The checkbox
column is at `c === 0`; nothing about "Score" or "Team" has anything to do with
selection, and the APG grid pattern puts Space's meaning on the cell it lands
in.

The fix is one condition — `if (r === 0 && c === 0)` for the toggle-all branch,
with the `r === 0` case otherwise falling through — which would also make the
two activation paths read the same way.

- Pinned by: `test/data-grid.test.js` — "BUG: Space on a non-checkbox header
  selects every row", with an anti-vacuity assertion that focus really did leave
  the checkbox column first. Paired with the two tests that pin the *correct*
  behaviour, so a fix flips exactly one of the three.

### 54. The scroll listener is not restored after a reconnect — **lifecycle**

`firstUpdated` (`data-grid.js:299`) binds the wrapper's `scroll` listener and
`disconnectedCallback` (`data-grid.js:319`) removes it. Nothing rebinds it:
`firstUpdated` runs once per element for its lifetime, not once per connection.

A grid that is moved in the DOM — reparented, or brought back from a detached
fragment, both ordinary in a virtual-DOM host — therefore comes back silently
degraded. It renders correctly and answers every property, but `_scrolledX`
never updates again, so pinned columns lose their scroll shadow; and under
`virtual` the window stops recalculating, so scrolling past the initial ~10 rows
shows blank space.

This is the same shape as the teardown findings in the leak sweep, inverted:
those components cleaned up too little, this one cleans up correctly and cannot
set itself back up. The fix is to move the binding into `connectedCallback` (or
re-bind in `updated` when the wrapper changes identity) and keep the removal
where it is.

- Pinned by: `test/data-grid.test.js` — "BUG: does not restore the scroll
  listener after reconnecting". The two tests either side of it pin that the
  pending frame *is* cancelled on disconnect and that a disconnected grid
  correctly ignores scroll, so the bug test is the only one that changes when
  this is fixed.

**Checked and correct**: the multi-sort cycle (asc → desc → none, Shift+click
appending, a plain click replacing the whole stack, and a shift-cycle dropping
one column without disturbing the others); empties sort last in *both*
directions rather than flipping with the comparator; equal rows keep their
original order; a column of mixed `7`/`'12'` numeric strings compares
numerically, which is the per-column mode decision at `data-grid.js:404` doing
its job — a per-pair `typeof` check there would be non-transitive; pinned
columns render first and offset along the inline axis, reserving the checkbox
width; `align: 'left'`/`'right'` map to `start`/`end`; the select-all checkbox
is indeterminate only while partially selected and is *not* checked on an empty
grid; reassigning `rows` clears both selection and any open editor; inline edits
coerce to a number only when the previous value was one; Enter-then-blur commits
once rather than twice; and the grid keeps exactly one tab stop, clamps at all
four edges rather than wrapping, and returns focus to the originating cell after
an edit.

---

## 55. Connection-scoped subscriptions are bound once per *element*, not once per *connection* — **architectural — FIXED**

This started as #54, a single lifecycle slip in `arc-data-grid`. It is not
single. A survey of all 38 components that subscribe to anything outside
themselves found **four with the identical defect**, in three different
spellings, and the shape of the mistake says the problem is the pattern rather
than the four authors.

| component | subscription | created in | torn down in |
|---|---|---|---|
| `data/data-grid.js:301` | wrapper `scroll` listener | `firstUpdated` | `disconnectedCallback` |
| `typography/code-block.js:391` | ResizeObserver on `.code-block__body` | `firstUpdated` | `disconnectedCallback` |
| `input/image-cropper.js:293` | ResizeObserver on `.stage` | `firstUpdated` | `disconnectedCallback` |
| `typography/truncate.js:90` | ResizeObserver on `.truncate__content` | **`connectedCallback` + `firstUpdated`** | `disconnectedCallback` |

`firstUpdated` runs **once per element for its entire lifetime**. `disconnectedCallback`
runs **once per disconnection**. Pairing them is a slow leak in reverse: the
teardown is correct and repeatable, the setup is not, so the first reparenting
permanently unsubscribes the component. It keeps rendering and keeps answering
every property, so nothing looks wrong — `arc-truncate` simply stops noticing
that it no longer overflows, `arc-code-block` stops re-measuring, and a virtual
`arc-data-grid` shows blank space past its initial window.

**`arc-truncate` is the one to read.** Its `connectedCallback` deliberately
constructs a *fresh* `ResizeObserver` on every connection — the author was
thinking about reconnection — but the matching `.observe()` sits in
`firstUpdated` and is never reached again. The result is a live, correctly-built
observer watching nothing. Getting half of it right is evidence that the split
between "create the subscription" and "point it at a shadow-DOM target" is the
thing generating the bug, because that split is exactly where the two lifecycles
diverge.

### Why this is not four one-line fixes

The obvious patch — move `.observe()` into `connectedCallback` — does not work,
and that is the whole point. `connectedCallback` runs **before first render**, so
`this.shadowRoot.querySelector('.stage')` is null on the initial connection.
Every one of these components therefore needs the target resolved *after* render
on the first pass and *on connection* thereafter. That is a genuinely fiddly
two-phase rule, it has to be restated correctly in every component, and there is
currently nothing in the codebase that states it once.

The library already has the right primitive and already trusts it. Lit's
`ReactiveController` has `hostConnected()`/`hostDisconnected()`, which fire on
**every** connection cycle, and `props.js` already routes normalisation through
a reactive controller instead of `willUpdate`/`updated` overrides — chosen, per
the handoff, precisely so that "a component that forgets `super.updated()`
cannot silently lose its contract". This is the same argument applied to
subscriptions:

```js
// src/shared/subscriptions.js
export function observeResize(host, selector, callback) { … }   // ResizeObserver
export function listen(host, selector, type, handler, opts) { … } // addEventListener
```

Each resolves its target lazily against the host's shadow root, subscribes on
`hostConnected` *or* first render (whichever completes the pair), and
unsubscribes on `hostDisconnected`. The four call sites collapse to one line
each, the 23 components already doing it correctly by hand could migrate
opportunistically, and the rule stops being something each component has to
remember.

This is worth doing as architecture rather than as four patches because the
defect is invisible in review — every one of these files *looks* symmetrical,
with a subscribe and an unsubscribe plainly present — and invisible at runtime,
because nothing throws. It is only visible from a test that reconnects, which is
not a thing anyone writes per component.

- Pinned by: `test/reconnect-sweep.test.js` — 7 tests. Four BUG cases, one per
  component; one behavioural anchor on `arc-truncate` proving the failure is
  user-visible and not merely an internal call count; and a **control**,
  `arc-scroll-indicator`, which subscribes in `connectedCallback` and survives
  the identical move. Without the control the four failures could be describing
  a harness that does not really reconnect.
- The ResizeObserver cases are instrumented by patching
  `ResizeObserver.prototype.observe` rather than the constructor, so the
  components still receive real browser delivery.
- Note this sweep is the **inverse** of the leak sweep in "Clean: nothing leaks",
  which asked whether teardown happens. Teardown was never the problem here.
  Both questions need asking; only one of them was.

### The fix, as landed

`src/shared/subscriptions.js` — one private `ConnectedSubscription` controller
and two exported helpers, `observeResize(host, target, cb)` and
`listen(host, target, type, handler, opts)`. Both attach on `hostConnected` *or*
the first `hostUpdated` after it, whichever is the first moment the target
exists; detach on `hostDisconnected`; and re-attach if the host re-renders the
target into a different element, which closes the stale-closure variant of the
same bug. `observeResize` hands the observed element back to the callback for
that reason — `arc-image-cropper` had closed over its stage.

All four call sites collapsed to one line in the constructor, and three
`disconnectedCallback` bodies lost their observer branch entirely. Net −38 lines
across the four components. `pnpm generate` produces no wrapper or
`custom-elements.json` drift: none of this touches `static properties`, so prism
never sees it.

### What the refactor broke, and why that was the right kind of break

`resize-observers.test.js`'s teardown sweep failed for `arc-truncate` and
`arc-code-block` — it asserted `el._resizeObserver` was non-null and then null,
which is a *field name*, not a behaviour. Ownership moving into a controller
changed nothing a user could observe and broke the test anyway.

Rewritten against the mechanism instead: `spyResizeObserver()` in `helpers.js`
patches `ResizeObserver.prototype`'s `observe`/`unobserve`/`disconnect` and
tracks which elements are under observation *right now*, so the sweep asks "is
this still being observed?" — true regardless of where the observer is held.
`reconnect-sweep.test.js` uses the same probe.

That rewrite immediately paid for itself: scoping the probe to
`el.shadowRoot.contains(target)` reported **`arc-toolbar` as observing nothing**,
because it observes `this` — the host — rather than anything in its shadow root.
The old field-based assertion could never have noticed, and a mechanism probe
that only looked inside the shadow root would have quietly made that case
vacuous. `within()` now counts the host and its light children too.

- One unrelated flake was seen in six full-suite runs:
  `arc-context-menu` → "re-anchors when reopened at a new point". It passed 3/3
  in isolation and the following five full runs were clean at 3,962. Recorded
  rather than dismissed; `context-menu.js` is untouched by this change.

---

## arc-menubar

50 tests, one finding. The APG menubar pattern is implemented properly and the
navigation rules — which are almost all rules about *what gets skipped* — hold:
ArrowDown/ArrowUp open on the first/last **selectable** entry (so a trailing
disabled item is not landed on), the divider is stepped over, a disabled
top-level menu is skipped by ArrowRight and by first-letter typeahead, Escape
collapses one level at a time rather than closing everything, and Tab closes
without `preventDefault` so focus can leave. `detail.path` is the full label
chain to the leaf, through two levels, exactly as documented.

### 56. Each reopened menu registers a PositionController that is never released — **leak — FIXED**

`_positionOpenMenus` (`navigation/menubar.js:290`) keeps one `PositionController`
per open menu — correct, since a menubar has the top-level panel and every
expanded submenu on screen at once. On close it did:

```js
controller.hide();
this._positions.delete(key);
```

`PositionController`'s constructor calls `host.addController(this)`. Deleting the
map entry does not undo that: Lit holds its own array, so **every reopen of a
menu added another controller that was never released for the life of the
element**. Five open/close cycles of one menu → five `addController`, zero
`removeController`.

Retired controllers have no per-render hook — `PositionController`'s only Lit
hook is `hostDisconnected` — so this costs memory rather than time. But it is
unbounded, and a menubar is exactly the kind of component that lives for the
whole session and is opened hundreds of times.

Fixed by adding the other half of the pair, `this.removeController(controller)`.
One line; the `hide()` already there does the real teardown.

- Pinned by: `test/menubar.test.js` — "releases each menu's PositionController
  when the menu closes", counting `addController`/`removeController` calls. Those
  are **public `ReactiveElement` API**; the first attempt read Lit's
  `__controllers`, which is a declared-but-undefined field until first use and so
  reported zero controllers on a component that plainly had one. The assertion is
  a balance (5 added, 5 removed) rather than a zero, so it cannot pass by nothing
  happening.
- `menubar.js` is the only component that creates controllers dynamically —
  `grep -rn removeController src/` returns nothing else — so this is a genuine
  one-off, not the cluster #55 turned out to be.

**A harness note worth keeping**: the menubar's keydown listener is on
`[part="bar"]` inside the shadow root, so a key event dispatched at the *host*
bubbles outward and never reaches it. A `press()` helper that falls back to the
host therefore looks like the component ignoring every key. The fallback must be
the bar.

---

## arc-date-picker

54 tests, two findings — one of them shared with two other components and one
shared with four.

Correct and worth not re-testing: the three-mode header (days → months → years)
and what "previous"/"next" mean in each (a month, a year, twelve years), month
picking returning to days while year picking steps down only to months, the
six-week grid that never resizes between months, min/max as independent bounds
enforced on both the click and the arrow-key paths, the roving tab stop
preferring selection → today → first enabled day and never landing on a disabled
one, and arrow keys paging the view when they cross a month boundary.

### 57. Home/End assume a Sunday-start week in three calendars — **correctness — FIXED**

`input/date-picker.js:566`, `input/date-range-picker.js:670` and
`data/event-calendar.js:534` each computed the ends of the focused row as:

```js
d.setDate(d.getDate() - d.getDay());          // Home
d.setDate(d.getDate() + (6 - d.getDay()));    // End
```

`getDay()` is Sunday-based. All three components lay their grid out from
`firstDayOfWeek`, whose documented default is the *locale's* convention — Monday
for most of the world. On a Monday-start calendar the row containing Wed 15 July
2026 runs Mon 13 → Sun 19, but Home landed on **Sun 12**, the last cell of the
*previous* row, and End on **Sat 18**, one short of the row's end.

The damning detail is that `shared/date-names.js` already exports the correct
helper, and its docstring already names this exact mistake:

> *"Doing it here rather than in each calendar is the point: `date.getDay()` is
> Sunday-based, and every component that mixed it with a non-Sunday first day
> got the offset wrong."*

All three components **import `weekdayOffset` already** and use it to lay out the
grid. Only the keyboard path bypassed it. So this is not a missing abstraction —
it is a correct abstraction that three keyboard handlers were written around,
which is why a `grep` for the helper's name would have shown all three as
compliant.

Fixed by routing all six sites through `weekdayOffset(d, this._firstDay)`.
`arc-calendar` is unaffected: it uses the helper for layout and has no
Home/End handling at all.

- Pinned by: `test/date-picker.test.js`, `test/date-range-picker.test.js` and
  `test/event-calendar.test.js`, each asserting both conventions — a
  Monday-start case *and* a Sunday-start case. The Sunday case passed before the
  fix and still passes, which is what makes the Monday case a bug report rather
  than a preference.
- Every one uses a mid-week Wednesday anchor, so the two conventions give
  different answers. A Sunday or Monday anchor would have made the two
  implementations agree and the test vacuous.

### 58. `disabled` is enforced on the click path and not on the state — **doc-mismatch — FIXED, and the vocabulary grew for it**

Five components document both of these, and they collide:

> `@prop disabled` — "…preventing the calendar from opening"
> `@prop open` — "Reflected so it can be opened programmatically"

`arc-date-picker`, `arc-date-range-picker`, `arc-time-picker`, `arc-select` and
`arc-tree-select` all guard inside their toggle handler (`if (this.disabled ||
this.readonly) return;`), which is only reached from the field click. Nothing
reconciles `open` against `disabled` anywhere else, so `el.open = true` on a
disabled control opens it in all five.

This is the **fourth recorded instance of one shape**: a documented constraint
that holds on the interaction path and not on the property path. See arc-tabs'
unclamped `selected` (#1), arc-theme-toggle's unsynced `theme` (#14) and
arc-image-cropper's unclamped `zoom` (#47). Every previous instance was fixed
locally, and the shape keeps coming back.

**Why this one is worth answering architecturally.** `props.js` exists precisely
to make a constraint "a value, not prose", and it already normalises on *both*
paths through its reactive controller — that is the stated reason it was built.
What the vocabulary cannot currently express is a constraint on one prop in terms
of another. A `flag(false, { blockedBy: 'disabled' })` (or a general
`normalize: (v, host) => …`) would fold this class of bug into the layer that
already runs on every update, and `conformance.test.js` would derive the
assertion for free across all five components rather than needing this sweep.

**The decision, and what was built.** It was escalated rather than patched,
because it changes the observable behaviour of five public components: `el.open =
true` on a disabled control used to open it, and now silently does nothing. Call
made — *"there is no reason to be able to force a disabled element open"* — so
`flag()` gained a `blockedBy` option and all five now declare:

```js
open: flag(false, { blockedBy: 'disabled' }),
```

`normalizeValue()` returns the declared default whenever `el[meta.blockedBy]` is
truthy. That check is deliberately **kind-agnostic** — it sits above the
enum/number branches — even though only `flag()` exposes the option today, so
extending it to `oneOf()`/`num()` is a one-word pass-through with no second
implementation to keep in step.

**Rejected: `normalize: (v, host) => …`.** The general form was the other
candidate in the write-up above, and it is the wrong shape for this file. An
opaque function is prose again wearing a callback's clothes: `conformance.test.js`
could derive nothing from it, `scripts/prism-props.js` could not read it, and the
premise of the whole vocabulary is that the constraint is a *value*. `blockedBy`
is a name, which both readers can inspect. There is no override, either — an
escape hatch would put us back to trusting every caller not to use it, which is
the situation `blockedBy` exists to end.

**What it bought, measured.** `conformance.test.js` went 1,900 → **1,920**:
exactly four derived tests × five components, with no table to maintain. They
are the property path, the markup path, a release check (blocking must not be a
one-way latch, which would otherwise let a permanently-inert prop pass), and an
anti-vacuity guard that `blockedBy` names a real declared property — a typo there
would never block anything and never fail, since an undefined property is falsey.

**Enforced in two places, and both are needed.** The first cut put the check only
in `normalizeValue`, running from the controller's `hostUpdate`. That works, but
forcing the value back mid-update leaves Lit with `open` still in
`changedProperties`, so the host's `updated()` runs its close-side effects and
schedules a second render for a value that never actually changed — visible as
Lit's `scheduled an update after an update completed` in `arc-select` and
`arc-tree-select`. `flag()` now also wraps the accessor, so the two halves cover
different moments:

| moment | example | enforced by |
|---|---|---|
| set *while already blocked* | `el.disabled = true; el.open = true` | the setter — refused, nothing scheduled |
| blocker turns on *afterwards* | `el.open = true; el.disabled = true` | `normalizeValue` in `hostUpdate` |
| attribute path | `<arc-select open disabled>` | `normalizeValue` — Lit may apply `open` first |

Neither alone is sufficient, which is why both are there.

**The accessor goes on the prototype, once per class.** The obvious version —
`Object.defineProperty(this, name, …)` in the constructor — is *rejected by Lit*:
its dev-mode `class-field-shadowing` guard scans own properties against
`elementProperties` and throws, because it cannot distinguish an own accessor
from the own data field it is actually hunting for. That surfaced as 172
conformance failures, all of them the same thrown error. Patching
`Ctor.prototype` is what Lit itself does and raises nothing; the install is
idempotent per class and marks its own getter so a subclass does not re-wrap it.

Pinned by `${tag} does not even schedule a render for a refused set`, which
asserts `el.isUpdatePending === false` immediately after a blocked assignment,
with an allowed assignment on the same element as the anti-vacuity guard.

- Pinned by: `test/disabled-open-sweep.test.js` — now 20 tests. The property-path
  and markup cases moved into the derived suite, so what stays is the two things
  a declaration cannot state: that clicking the field is the documented way in,
  and that *these five specific components* carry the constraint. A sixth
  component acquiring the same `@prop` prose without the declaration is the
  regression this list catches and the derived suite structurally cannot.
  One test per component asserts the *declaration* rather than the behaviour, so
  a revert to a hand-written guard fails there while still looking correct.

---

### 59. Open-time state preparation lived in the toggle handler — **FIXED, three components**

`_toggleDropdown()` did more than flip `open`:

| component | done only on the click path |
|---|---|
| `arc-time-picker` | `_syncFromValue()`, `_focusedColumn = 'hour'` |
| `arc-date-picker` | clears `_focusedIso`; anchors `_viewMonth`/`_viewYear` to `value`; resets `_mode` on close |
| `arc-date-range-picker` | clears `_focusedIso`/`_previewIso`; anchors the view to `start ?? end` |

All three document `open` as *"Reflected so it can be opened programmatically"*.
So `el.open = true` rendered a panel that had skipped its own setup: a time
picker with nothing highlighted despite having a value, a date picker showing
today's month instead of the month its value is in.

This is the **fifth appearance of one shape** — behaviour attached to the
interaction rather than to the state (#1, #14, #47, #58). `blockedBy` answered
the *constraint* half of it. This is the *preparation* half, and no declaration
can express it: the work is component-specific and only its **placement** is
general.

**The correct pattern was already in the repo.** `arc-select` and
`arc-tree-select` have bare toggle handlers and do their open-side work from a
lifecycle hook, which runs on both paths. The fix moves the three bodies into
`willUpdate(changed)` keyed on `changed.has('open')`.

`willUpdate` rather than `updated`: every value involved is reactive state, and
Lit runs `willUpdate` → controllers' `hostUpdate` → `update`, so computing it
there folds into the same render instead of scheduling a second one. The one
ordering wrinkle is that `blockedBy` normalisation runs in `hostUpdate`, i.e.
*after* `willUpdate` — so a same-tick `el.open = true; el.disabled = true` would
prepare state for a panel that then does not render. It is inert and
self-correcting, and the accessor half of `blockedBy` (see §58) already stops the
common path from scheduling an update at all.

**Guarded by a sweep, not by three tests.** `test/open-parity-sweep.test.js`
renders each of the five open-able components both ways and compares the
resulting panel markup, so a *sixth* component acquiring this divergence fails
without anyone thinking to write a test for it. That matters here specifically:
the shape came back four times while each previous instance was being fixed one
at a time. Ids and inline positioning are normalised out; the anti-vacuity guard
is three-part, because two of these panels are always in the DOM and merely
hidden, so "the node exists" proves nothing and two empty panels would otherwise
compare equal and report parity.

Finding #46 was an instance of this and was **misdiagnosed** — see its entry.

### Also in arc-time-picker

- **`format` accepted anything and fell through to the wrong member.** Declared
  `{ type: String }`, so `format="bogus"` left the value intact and every
  `this.format === '12h'` test read false — rendering the **24h** layout, which
  is the member it is documented *not* to default to. Now `oneOf(['12h','24h'])`,
  which is the vocabulary doing what it was built for (#3/#17/#37 shape).
- **`@prop step` still says "(1, 5, 15, or 30)" and any 1–60 is accepted.** Left
  alone: the documented set is not a range, so `num({min,max})` cannot express
  it, and a numeric `oneOf` is a vocabulary question rather than a patch. Filed
  against the `num()`/`int()` rollout in the handoff.

### 60. Dismissal had two triggers and one implementation — **FIXED, shared layer**

`ClickOutsideController` answered "a pointer landed somewhere else". It did not
answer "focus moved somewhere else", by name and by design. Eighteen components
were built on it.

For the three that **open on focus** that was not untidy, it was fatal: there is
no pointer event anywhere in the interaction, so a keyboard user could open a
panel and never close it. Probed rather than assumed:

| component | opens on focus | after tabbing away |
|---|---|---|
| `arc-multi-select` | yes | `_open` **and** `_focused` both stuck true |
| `arc-combobox` | yes | `_open` stuck true |
| `arc-tag-input` | no | `_focused` stuck — focus ring on an unfocused control |
| `arc-search`, `arc-select`, `arc-tree-select` | no | clean |

The clean ones are clean because they open on a trigger click, not because they
handle blur. **That is why the gap survived**: every component you would think to
test by hand behaved perfectly.

Same shape as #55 — a shared layer covering part of a lifecycle, every consumer
inheriting the gap — so the fix went there. `ClickOutsideController` became
`DismissController` (`src/shared/dismiss-controller.js`), with both halves on by
default, because the failure mode was precisely that a component *believed* it
had dismissal handled. All 18 consumers migrated; `onClickOutside` → `onDismiss`,
`this._clickOutside` → `this._dismiss`.

**A null `relatedTarget` is not an answer, and two attempts to make it one both
failed.**

1. *Read through to `document.activeElement` synchronously.* Broke **16 tests**
   across date-picker, date-range-picker and menubar. These panels rebuild their
   own contents — switching arc-date-picker from days to months destroys the
   button just clicked — so focus falls to `<body>` for an instant and the panel
   dismissed on its own navigation.
2. *Defer a task, then re-read it.* Fixed the window-blur case and **not** the
   re-render one, because a panel that orphans focus without restoring it leaves
   `activeElement` on `<body>` indefinitely. Still 11 failures.

The answer is that the focus half should decline to answer. The only case it
uniquely sees is focus moving to a *real element* elsewhere — the keyboard
tab-away that started this — and `relatedTarget` names that precisely. Every
other departure is a pointer landing somewhere, which the pointer half already
has. Cost: tabbing into browser chrome does not dismiss, which is arguably right.

**`activate()` must be keyed on whatever state can leak, not on "is a panel
open".** `arc-tag-input` subscribed only while its suggestion list was open, but
its focus ring lives on `_focused`, which outlives the panel — so the ring stuck
on a control the user had already left. Now keyed on `_open || _focused`.

- Pinned by `test/overlay-adoption.test.js` → "DismissController adoption —
  focus": each component both lets go when focus leaves *and* holds on while
  focus moves within itself. The second half is the counterweight — `focusout`
  fires for internal moves too, so a dismiss that ignored `relatedTarget` would
  pass the first test and still be useless.

**Two test files were wrong, not the components.** `open-parity-sweep` and one
date-picker case held two live pickers side by side; opening the second moves
focus into it, which now correctly dismisses the first. Both rewritten to read
one fixture before the next exists. Worth knowing: **any test holding two open
overlays at once is now testing the harness.**

One more, unfixed: `multi-select.js` tests `changed.has('suggestions')` and has
no `suggestions` property — dead copy-paste from `arc-combobox`, always false.

### 61. `disabled` enforced in the stylesheet, which the keyboard does not read — **FIXED, 7 components**

Thirty components enforce `disabled` with
`:host([disabled]) { pointer-events: none }`. That rule removes the *pointer*
affordance and nothing else. Swept all 42 form controls for anything still
keyboard-reachable while disabled:

| component | leaked | changed state? | fix |
|---|---|---|---|
| `arc-color-picker` | hex `input`, swatches | **yes** — typed hex committed | `?disabled` + guards in all four handlers |
| `arc-file-upload` | dropzone `div` | **yes** — Enter opened the picker, and drops were accepted | `tabindex`/`aria-disabled` + guards in `_handleClick`/`_handleDrop` |
| `arc-range-slider` | two thumb `div`s | no | `tabindex`/`aria-disabled` |
| `arc-select`, `arc-tree-select` | trigger `button` | no | `?disabled` |
| `arc-button`, `arc-icon-button` | `<a href>` | **yes** — followable | drop `href`, add `role="link"` + `aria-disabled` |

This is #58's shape with a different mechanism: the constraint attached to the
**presentation** rather than to the state. It also had the longest history of any
finding here — `arc-file-upload`'s was already written up as a `BUG:` test, and
its comment already pointed at `arc-button` via `test-audit.md` §5. Both had been
known for two audits and fixed in neither, because nothing connected them.

`arc-color-picker` shows the other face of it: `_onAreaPointerDown` guarded
`readonly` and never looked at `disabled`, so the stylesheet was the *entire*
enforcement for the area and hue track. Real users were fine — no events are
generated — but a dispatched pointer walked straight through, and so would any
future refactor of that CSS.

**The guard is derived, not a list.** `test/disabled-focus-sweep.test.js` reads
the tags out of `custom-elements.json`, mounts each one disabled, and asserts
nothing in its shadow root is a tab stop. A component gains the coverage by
existing. Two anti-vacuity guards, because a sweep that silently matches nothing
is worse than no sweep: the manifest must yield >20 tags, and >20 of them must
actually accept `disabled`.

**`VARIANTS` is the part worth keeping.** Bare, `arc-button` renders a
`<button>`, which takes `?disabled` and was never the problem; given an `href` it
renders an `<a>`, which has no `disabled` attribute at all. A sweep that only
mounts the bare tag reports it clean — which is precisely how that bug survived
being written up. Adding one variant entry immediately turned up `arc-icon-button`
with the same defect, which nobody had reported.

### 62. The colour picker could not represent its own default — **FIXED**

`_parseHex` rounded hue, saturation and lightness to integers. Integer HSL has
far fewer points than the 16.7M hex colours the component accepts, so most values
could not survive the trip: `#4d7ef7` — **the shipped default** — came back as
`#507ff7`.

Visible as a colour that jumps to a neighbour it was never on the moment the hue
slider moves a pixel, and a crosshair sitting at the rounded position rather than
the real one.

Fixed by keeping `_hue`/`_sat`/`_lit` as floats. The pointer handlers still
round, and should: those values come from pixels and are quantised already.

Worth noting how it hid. Pure and achromatic colours — red, green, blue, grey,
black, white, the obvious things to test — all sit *on* the integer-HSL lattice
and round-tripped perfectly throughout. The test file keeps them as `EXACT` with
that noted, plus a guard asserting the state is **not** integral, so a
re-introduction fails as "it was rounded again" rather than as a conversion
arithmetic puzzle.

### 63. Selection meant "row position", and sorting moved the rows — **FIXED**

`arc-data-table` stored selection as a positional index into the *rendered*
order, and sorting re-rendered in a different order without touching the set.
Check Carol at position 0, sort by name, and the highlight is on Alice.

Worse than the highlight: `arc-select` reported `detail.value` as indices and
sent `detail.row` only at click time, so a consumer trusting `value` after a sort
acted on the wrong records.

Now keyed by row identity. `detail.value` is **the selected row objects
themselves, in `rows` order** — the one ordering that does not change when the
user sorts. Selections are pruned in `willUpdate` when `rows` is replaced, or
identity-keyed entries would pin the old objects alive and report them forever.

This is a deliberate breaking change to a public event, made on the way to v4.

### 64. `firstUpdated` + `disconnectedCallback` again — **FIXED, and now checked**

Finding #55 fixed four components that subscribed in `firstUpdated` and
unsubscribed in `disconnectedCallback` — lifecycles that do not pair, so the
first reparenting unsubscribes them permanently and they silently stop reacting.

Nine components later, `arc-data-table` had exactly the same code and had never
been touched, because the guard for #55 was `test/reconnect-sweep.test.js`, which
carries **a hand-written list of the four that were already known**. A list
cannot catch the case nobody thought of, which is the only case that matters.

`scripts/checks/lifecycle-pairing.js` is the guard that needs no list: it reads
every component in the tree and flags any subscription reachable from
`firstUpdated`, resolving one level of `this._helper()` indirection — which the
real case needed, since `arc-data-table` called `this._attachScrollListener()`
and a direct-text scan reported it clean.

**It immediately found two more that my own manual grep had missed**:
`arc-marquee` (stopped recalculating its duration on resize) and
`arc-infinite-scroll` (stopped loading more, permanently). Three components, and
I had convinced myself the cluster was closed after finding one.

`observeIntersect()` joins `observeResize()`/`listen()` in
`src/shared/subscriptions.js` for the infinite-scroll case. One thing it adds is
worth knowing: **a target resolver that returns `null` releases the observation
without tearing the subscription down**, and returning an element re-attaches it.
That is how a component expresses "stop watching" for a *state* rather than a
*lifecycle* — arc-infinite-scroll stops once `finished` or `disabled` — with no
second teardown path that then has to pair correctly.

### 65. arc-anchor-nav never observed anything — **FIXED**

`_setupObserver()` constructed an IntersectionObserver, complete with a callback
that sets `value` and fires `arc-change`, and **nothing ever called `observe()`
on it**. The documented active-link highlight had never followed the scroll; it
moved only on click.

It survived because the one test that touched the observer asked
`el._observer != null`. An observer object existed. It was watching nothing.

That is the same lesson as the `resize-observers` breakage in #55, sharpened:
asserting on a private *field name* couples the test to an implementation detail
**and** cannot tell "working" from "constructed". `test/helpers.js` gained
`spyIntersectionObserver()` — the twin of `spyResizeObserver()` — plus
`isObserved(node)` for components that watch elements *outside* themselves, which
is why anchor-nav's host-scoped count read zero and looked like nothing to fix.

Fixed by observing the sections the items name, re-synced when `items` changes
and on `slotchange` (slotted items arrive after `connectedCallback`, so that is
the first moment the sections are knowable). Pinned by four tests that scroll a
real page and assert `value` follows, `arc-change` fires, and a named-but-absent
section is skipped rather than thrown on.

## The scroll-listener group — 30 tests, one finding

`arc-scroll-spy`, `arc-top-bar`, `arc-scroll-to-top`, `arc-scroll-indicator`.
Confirmed: **arc-scroll-spy is not an IntersectionObserver component** despite
the comment. It measures geometry deliberately, and the reason is recorded in its
own source — the observer version took whichever entry the browser listed second
and settled on the wrong section when scrolling up. Pinned by a scroll-up test.

All four subscribe in `connectedCallback` and unsubscribe in
`disconnectedCallback`. Both run once per *connection*, so they pair and survive
reparenting — the control that findings #55/#64 lacked, now asserted rather than
assumed for three of them.

Two behaviours pinned because they look wrong and are not: `arc-scroll-spy`
fires `arc-change` on scroll but **not** on click (`@fires` scopes it to "during
scroll", and the silence stops a consumer echoing back a navigation it just
performed); and the last section activates on bottoming out even though it never
crosses the line, because a short final section could otherwise never be reached.

### 68. Teardown re-resolved the target instead of remembering it — **FIXED**

`arc-scroll-indicator._detachListener()` called `_getTarget()`, which re-runs
`document.querySelector(this.target)`. `updated()` invoked it *after*
`this.target` had already changed — so it unsubscribed from the **new** container
and the old one kept its listener for the life of the page.

Same family as #55/#64 seen from the other end: not a mismatched lifecycle, but
teardown that recomputes what to release rather than remembering what it
attached to. `ConnectedSubscription` stores `_target` for exactly this reason, so
the fix was migrating to `listen()`.

**The first version of this test passed while the bug was live.** Asserting
through `_progress` proves nothing: `_updateProgress()` re-reads the current
target, so a stray scroll on the old container recomputes from the new one and
the number looks right. The leak is a retained reference to a detached container
and wasted frames — nothing on screen says so. The test now watches the old
element's own `removeEventListener`.

### An unidentified 1-test flake — what is actually known

Seen **twice**, and worth writing down precisely because the obvious conclusion
is probably wrong.

Both times: exactly one test of ~4,500 failed, and both times it was the **first
full run immediately after source files were written**. Every subsequent run was
clean — 8 consecutive after the second occurrence, plus 6/6 in isolation for the
file suspected the first time. The failure name was never captured; by the time a
capturing run was set up, it would not reproduce.

The first time I attributed it to a load-sensitive assertion in the new scroll
file — `moves the line with offset` read `active` two frames after scrolling
instead of polling, and `_measure` is rAF-coalesced. That was a genuine defect
against the conventions and is fixed. **But it does not explain the second
occurrence**, which came after edits to `props.js` and five unrelated components.

The better hypothesis is the common factor: the runner's transform cache serving
a file that was still being written. That would be a harness artifact rather than
a component or a test problem, and it would explain why it never survives into a
second run.

Not resolved. What a future session should do is capture output on *every* run
(`> run.txt 2>&1` in a loop) starting from the first run after an edit, rather
than re-running until green and losing the message — which is what happened here,
twice.

### 69. The code block never re-measured when its code shrank — **FIXED**

`arc-code-block` picks between two presentations of its copy button from one
measurement — `scrollWidth > clientWidth` on the body. It had two triggers: the
ResizeObserver, and `_highlightedHtml` changing.

Replacing long code with short code fires **neither**. The body's *box* is
unchanged — same height, same container-constrained width — so no resize; and
with no `language` the highlighted markup stays `''`, so no change there either.
`_overflows` stayed true and the button stayed in its quiet state on a block that
now fits comfortably. Fixed by re-measuring on `code`/`language` too.

Two things about how this was found are worth keeping:

- **The handoff recorded it as a suspicion about `_highlight()` gating the
  measurement, and that was wrong.** Short → long works fine, and so does every
  container resize. Only the shrink direction is stuck. Probing both directions
  before writing anything is what separated them.
- **No `language` is the revealing fixture.** With one, the re-highlight masks
  the bug entirely. The test file runs the whole overflow group without a
  language on purpose, and says so.

Now covered by `test/code-block.test.js` — 10 tests, one per independent trigger
rather than a single "it measures overflow", since the three cover different ways
the answer can change and only one of them was broken.

### 70. Clamping lived in the render, not in the value — **FIXED, 5 components**

The `num()`/`int()` rollout, and it turned up the same shape a fourth time
(#1, #47, #58): a constraint enforced where the value is *used* rather than where
it is *held*.

| component | prop | prose | what actually happened |
|---|---|---|---|
| `arc-meter` | `value` | "Clamped between `min` and `max`" | bar arithmetic clamped; `aria-valuenow` did not |
| `arc-gauge` | `value` | same | same |
| `arc-level-meter` | `value` | "Values outside the range are clamped" | render clamped, property kept the raw number |
| `arc-hotspot` | `x`, `y` | "0 to 100… clamped; a non-numeric value falls back to 50" | `_pct()` clamped at render only |
| `arc-image-compare` | `position` | "0 to 100" | clamped on every path it owned, not the property path |

**`arc-meter` and `arc-gauge` are the ones that reach a user.** Both pass
`this.value` straight to `aria-valuenow`, so `<arc-meter min="0" max="100"
value="500">` drew a full bar and announced *"500"*. The visual and the
accessible readings disagreed — and each half looked right in isolation, which is
why neither a screenshot nor a unit test of the geometry would have caught it.

All five now declare `num({ min: 'min', max: 'max', clamp: 'toRange' })` or a
literal-bounded equivalent. `min`/`max` as **property names** matters here beyond
tidiness: the bound is itself reactive, so narrowing `max` under a legal value
has to re-clamp it, and that is now derived rather than remembered.

`arc-meter` was not on `DeclaredPropsMixin` at all — the declaration would have
been inert and silently normalised nothing. Caught before it landed; **check the
class extends the mixin whenever adding a declaration to a component that had
none.**

`test/clamped-numbers.test.js` deliberately does *not* re-test "500 becomes 100",
which `conformance.test.js` already derives from the declarations. It tests the
half a declaration cannot know: that the clamped value is the one the component
then uses, everywhere it is read.

### `oneOf` now accepts numbers

`arc-time-picker`'s `@prop step` documents "(1, 5, 15, or 30)" and accepted any
1–60. That is a **set**, not a range: `num({ min: 1, max: 60 })` would admit 7,
and there is no clamp that expresses it. So `oneOf` gained numeric members —
`step: oneOf([1, 5, 15, 30], { default: 1 })` — which is the same membership test
it already did, with two differences: the Lit `type` becomes `Number`, and
`normalizeValue` coerces an attribute string *before* testing membership, since
`[1, 5].includes('5')` is false and every attribute-set numeric enum would
otherwise fall back silently.

Mixed string/number sets throw at declaration time rather than half-working.
`scripts/prism-props.js` reads the first member to pick the wrapper type, so the
six framework packages now type it as `step?: 1 | 5 | 15 | 30` rather than
`number` — the same payoff `format?: '12h' | '24h'` got earlier.

## arc-transfer-list — no findings

69 tests, and nothing to report. The first component in this batch whose `@prop`
prose and code agreed everywhere, including the two seams where they usually
part: `readonly` is genuinely narrower than `disabled` (moves refused, filtering
and focus intact, `aria-readonly` announced), and the empty pane really does drop
`role="listbox"` along with `aria-multiselectable`/`aria-readonly` while keeping
`aria-label`, exactly as its own comment claims.

Two behaviours are pinned because they *look* like bugs and are not:

- **Move-all respects the filter; move-checked does not.** `@prop searchable`
  scopes the claim to move-all, and `_checkedIn()` reads the unfiltered pane on
  purpose — a mark the user already made is not silently dropped because they
  later typed in the filter box.
- **Roving focus may land on a disabled option.** Only *moving* is guarded, so
  arrowing travels over `Charlie` rather than skipping it. That is the right
  reading of the listbox pattern (a disabled option is perceivable), and the test
  says so, so a later "fix" has to argue with it.

The two mistakes it cost me are both about the test harness, not the component,
and both would have produced silently-passing tests:

- `record()` strips the `arc-` prefix, so the log key is `change`, not
  `arc-change`. `only(seen, 'arc-change')` matches nothing and returns `[]` —
  which makes every `expect(...).to.equal(0)` assertion pass vacuously. Four of
  mine did until an `equal(1)` case failed and exposed it.
- `FormControlMixin` captures its reset baseline on **first connect**. Setting
  `value` after `mount()` baselines the *empty* array, so a reset test passes for
  the wrong reason. Build the element detached and assign before appending.

## A note on suite stability

Across eleven consecutive full-suite runs while finishing this batch, ten
reported 17 failures and one reported 18. Every extra failure was inside the
pre-existing icon group (`icon-aliases.test.js` / `sanitize-svg.test.js`), which
resolves icons over `fetch` against modules that are not present — so the count
varies with request timing. Filtering to non-icon failures gives **0 across all
eleven runs**.

Worth fixing along with the rest of the icon situation: an intermittently-red
suite is worse than a reliably-red one, because it trains people to re-run
rather than look.

### Resolved — a red suite now means something

**Done, and the numbers came out better than the estimate.** All three parts of
the recommendation below are implemented; the suite is **1,367 passing, 0
failing**, across ten consecutive runs with zero variance.

- **`"pretest": "pnpm run generate:icons"`** in the root `package.json`. The cost
  question the recommendation flagged as unmeasured is answered: the generator
  takes **0.13s** for all 3,408 modules, so the conditional-regeneration fallback
  is unnecessary. Verified from a genuine clean-checkout state — both generated
  directories moved away, `pnpm test` regenerates and goes green on its own.
- **Skip-with-reason guards** via `generatedIconsPresent()` in `helpers.js`.
  `icon-aliases.test.js` gates its whole file; `sanitize-svg.test.js` gates only
  the two blocks that resolve a real glyph, so its 10 string-scanner tests — the
  ones guarding `>` inside a quoted attribute — still run on a fresh checkout.
  Verified with the modules absent: 10 passed, 20 skipped, green, with
  `↷ … run \`pnpm generate:icons\` first` in the log.
- **`scripts/checks/icon-names.js`** now exits 1 with that same message instead
  of a raw `readFileSync` ENOENT stack. `pnpm check` is 17 of 17 green.

**The predicted side effect held.** The intermittency documented above is gone —
it was the tests racing `fetch` against files that 404, and the files now exist.

**One cost worth knowing.** The suite went from ~4.6s to **9.4s**, over the
plan's ~8s budget. This is not a regression: the icon tests previously failed
fast, and now genuinely resolve two 1,500-entry lazy resolvers (~2s for those two
files alone), while every component rendering an `arc-icon` now does real
resolution instead of getting `null` immediately. It is work that was always
supposed to happen and never was. Revisit only if it grows further.

### Original recommendation, for the record

**The situation.** On a clean checkout `pnpm test` reports 17 failures and
`pnpm check` fails `icon-names`. Neither is a real defect. Both depend on
`packages/web-components/src/icons/{phosphor,lucide}/`, which `.gitignore:26-27`
excludes and `pnpm generate:icons` produces.

**Why "just commit them" is the wrong answer.** The generator writes one module
per icon per library — **1,512 Phosphor + 1,914 Lucide = 3,426 files**, plus a
`_resolver.js`, `_manifest.js` and `_manifest.d.ts` each. Committing that puts a
3,400-file diff on every icon-library bump. The `.gitignore` decision is right;
the fallout is what needs handling.

**Recommended: a `pretest` hook, plus the guard the repo already uses.**

1. **`"pretest": "pnpm generate:icons"`** in the root `package.json`. npm and pnpm
   run `pretest` automatically before `test`, so `pnpm test` becomes correct by
   construction and CI needs no change. This is the piece that makes red mean
   red. Cost is one generator pass per test run — unmeasured here, since
   generating icons was not something this read-only audit could run, so time it
   before committing to it. If it is slow, make the generator no-op when
   `_resolver.js` is newer than the source package.

2. **A skip-with-reason guard** in `icon-aliases.test.js` and
   `sanitize-svg.test.js`, for anyone who invokes `web-test-runner` directly — an
   IDE runner, a watch task, a single-file run — where `pretest` never fires:

   ```js
   const generated = await fetch(
     new URL('../src/icons/phosphor/_resolver.js', import.meta.url),
   ).then((r) => r.ok, () => false);

   (generated ? describe : describe.skip)('icon names …', () => { … });
   ```

   This is the pattern `scripts/smoke-test-wrappers.js:38-42` already establishes
   — it checks for `_resolver.js` and exits with
   *"✗ generated icon modules missing — run `pnpm generate:icons` first"*. The
   test suite should fail the same way rather than with seventeen assertion
   errors about chevrons.

3. **`scripts/checks/icon-names.js`** currently dies with an unhandled
   `readFileSync` ENOENT (a raw stack trace, not a message). Give it the same
   guard and message as the smoke test.

**Expected side effect, unverified.** The intermittency documented above should
disappear once the modules exist, because it comes from the tests racing `fetch`
against files that 404. That is the expectation, not a measured result — the
generator was never run during this work.

**Priority.** Higher than most of the 44 findings above. Every one of those is a
defect someone can schedule; this one degrades the signal that would tell them
whether their fix worked.

---

## Tier C mutation spot-check — the gate failed at 61%

Run per the plan's verification step 5, with the Stryker 9.6.1 setup and the
browser-activation bridge from `test-audit.md`'s appendix. Three of the newly
covered components, 581 mutants, `concurrency: 4`, ~9 minutes.

| file | score | killed | survived |
|---|---:|---:|---:|
| `content/carousel.js` | 63.53% | 108 | 62 |
| `input/range-slider.js` | 60.19% | 130 | 86 |
| `navigation/tree-view.js` | 61.03% | 119 | 76 |
| **all three** | **61.45%** | **357** | **224** |

**Target was ≥75%. This misses it, and the number is real.** The bridge worked —
357 mutants died, so this is not the silent 0% failure the audit warns about.
Only 3 of the 581 mutants fall inside a `static styles` block, so it is not an
artefact of mutating CSS either: 61% is a genuine logic score.

This is the audit's own thesis landing on the new tests. `fuzzy-match.js` scored
52% with 31 careful-looking tests pointed at it; these files scored 61% with 76.
**Reading the tests cannot tell you this.** They are contract-derived, assert
through `[part=]` and ARIA, and carry anti-vacuity guards — and they still let
two mutants in five through.

### The single biggest cause: every test used the default `min` of 0

`min` defaults to 0, and **every** range-slider test ran on the default range. At
`min === 0`, `x - this.min` and `x + this.min` are the same expression, so every
`ArithmeticOperator` mutant touching `min` is *equivalent under the test suite* —
unkillable, not because the assertion is weak but because the fixture is
degenerate. The same holds for `value + this.low` in the track-click hit test,
which used `low="0"`.

That one fixture choice accounts for the percent maths (`_lowPercent`,
`_highPercent`), `_snap`, the track-click nearest-thumb test and both Home/End
delta expressions.

**Generalise it:** a fixture built from defaults silently disables every mutant
whose operands are zero or empty. This is a convention to add — *pick fixture
values where the arithmetic is observable*: non-zero `min`, non-empty prefix,
non-default `step`. It costs nothing and it is invisible without measuring.

### The other survivor clusters

- **Ternary branches exercised in one direction only.** `Home` was tested on the
  low thumb and `End` on the high thumb — never the crossed pair — so
  `ConditionalExpression → true/false` survived on both lines. Four assertions
  where there were two.
- **`bubbles: true` / `composed: true` asserted per *file*, not per *event*.**
  21 of the 24 new files do assert them (`chart`, `range-slider` and `resizable`
  did not) — but on one representative event each. `arc-tree-view` checks
  `arc-toggle` and leaves `arc-select` unchecked, and that is the one whose
  mutants survived. A listener bound on the host receives an event that neither
  bubbles nor composes, so the omission is invisible without a `document`-level
  listener. This is the strongest candidate for a **sweep** over every emitter
  rather than more per-component tests.
- **Accessible-name strings.** `'Range low'`, `'Range high'`,
  `Go to slide ${i + 1}` — all mutable without a failure. Ironic given how many
  a11y findings this work produced.
- **Class-name strings in templates** (`'carousel__dot--active'`,
  `'tree__row--selected'`, `tree__chevron--*`). These survive *by design*: the
  stated convention is to assert through `[part=]` and ARIA, not class names. It
  is a deliberate trade, but it is worth naming — a class-name typo breaks
  styling silently and no test in this suite would catch it.
- **`_pathKey`'s whole body is removable** (`tree-view.js:215`, `BlockStatement`
  survived). Worth knowing, since findings #21-23 propose `_pathKey` as *the fix*
  for the label-keying bug — the fix's own helper is unpinned.
- **Genuinely equivalent, not worth chasing:** `reflect: true` on props whose
  reflection nothing needs, `assignedElements({ flatten: true })`, and the
  `scrollIntoView` option strings.

### Remediation, measured rather than assumed

`range-slider.test.js` was taken from 25 tests to 32, targeting the clusters
above — an offset `min="10" max="110"` range, all four Home/End combinations,
track clicks on both sides, a fractional step, thumb position asserted from
computed style, `document`-level listeners for bubbles/composed, and the two
accessible names.

Re-measured on `range-slider.js` alone, same config:

| | tests | score | killed | survived |
|---|---:|---:|---:|---:|
| before | 25 | 60.19% | 130 | 86 |
| after | 32 | **72.22%** | 156 | 60 |

**+12 points for seven tests**, and no source file changed — the suite stayed
green at 1,374. Most of that came from the offset range alone, which is the
cheapest change on the list.

It is still short of 75%. The remaining 60 survivors in this file are dominated
by template class-name strings and the `reflect: true` descriptors, which are
the two categories argued above to be deliberate or equivalent. **Reaching 75%
on a Lit component may require excluding `static styles` and the `properties`
block from the mutated set** rather than writing more tests — otherwise the
target is partly measuring things the conventions say not to assert. Worth
settling before the same gate is applied to Tier B.

### Re-measured after the declaration layer — 61.45% → 67.52%

Same three components, same config, 585 mutants.

| file | before | after | adopted? |
|---|---:|---:|---|
| `content/carousel.js` | 63.53% | **68.21%** | yes |
| `input/range-slider.js` | 60.19% | **72.81%** | yes |
| `navigation/tree-view.js` | 61.03% | **61.03%** | **no** |
| all three | 61.45% | **67.52%** | |

**`arc-tree-view` is the control, and it did not move by a single mutant** —
61.03%, 119 killed, 76 survived, identical to the first run. It is the one file
of the three with no enum or flag props, so it never adopted the vocabulary and
gained no derived tests. That it is *exactly* unchanged is what makes the other
two attributable: the movement is the declaration layer, not noise.

**What that says, plainly.** The 2,392 derived tests are not vacuous — they kill
mutants that survived before. But the effect is **modest, roughly +5 points on an
adopted component**, and the single largest gain in this whole exercise is still
the hand-written fixture fix on `range-slider` (+12 on its own). Derived
conformance raises the floor across 164 components for almost no per-component
cost; it does not substitute for tests written against a component's actual
behaviour. Both of those are worth holding at once.

**Still short of the ≥75% gate**, and the answer to whether that gate is fair:

| file | score | excluding the `static properties` block |
|---|---:|---:|
| carousel | 68.02% | 66.23% |
| range-slider | 72.81% | **75.13%** |
| tree-view | 61.03% | 62.96% |

So the earlier suspicion was wrong, and worth correcting: the `properties` block
is **not** meaningfully depressing the score. It is 6–20 mutants per file, and
excluding it moves the number by ±2 points in both directions. The gate is fair
as written; these files simply have not earned it yet. Only `range-slider` — the
one that got targeted hand-written work — is anywhere near.

### Where this leaves the plan

The gate is a tier-level gate, and it failed. Carousel (63.53%) and tree-view
(61.03%) have had no remediation at all, and the other 21 Tier C files have
never been measured. Two of the three causes found here — degenerate fixtures
and one-directional ternary coverage — are *conventions*, so they are almost
certainly present across all 24 files and will be reproduced in Tier B and Tier A
unless the conventions change first.

Recommended before Tier B starts:
1. Add the two fixture conventions to the working notes (non-degenerate values;
   exercise both branches of every ternary).
2. Write the bubbles/composed sweep over every emitter — one file, kills a
   survivor class library-wide.
3. Decide the `static styles` / `properties` exclusion question above, then
   re-measure carousel and tree-view to confirm the pattern generalises.

---

## Tier B — the mechanism sweeps

Two sweeps, 30 tests, covering the shared failure modes of components that wrap
a browser API rather than the behaviour each one layers on top.

### 52. `arc-sticky`'s `[stuck]` attribute never existed — **correctness / a11y of its own CSS**

```js
stuck: { type: Boolean, reflect: true, state: true },   // sticky.js:17
```

In Lit, `state: true` means **no attribute at all**, so the `reflect: true`
beside it is dead. The consequences compound:

- The `@prop` documentation says *"Read-only attribute set by the
  IntersectionObserver… Use the `[stuck]` CSS selector to style the stuck
  state."* That selector could never match, for any consumer.
- `sticky.js:31` is the component's **own** `:host([stuck])` rule — so the entire
  stuck visual treatment, the reason the component exists, never applied.
- `state: true` also keeps a prop out of prism's output, so `stuck` was absent
  from all six framework wrappers despite being documented — another instance of
  the `doc-prop-undeclared` population.

Fixed as `flag(false, { derived: true })`: it is an output, not an input, which
is exactly what `derived` was added for. `stuck` now reflects, the component's
own styling works, and it reaches all six wrappers.

It is the **only** `state: true` + `reflect: true` pair in the library, so there
is no sweep to write — but it is worth knowing the combination reads as
deliberate and does the opposite of what it says.

### A grouping error the tests caught

`arc-scroll-spy` was in the IntersectionObserver group on the strength of a
grep. It drives off a `document` scroll listener and only *mentions*
IntersectionObserver in a comment. The teardown sweep failed on it immediately —
"never created an observer to leak" — which is the anti-vacuity guard doing its
job on the test author rather than on the component.

### Clean: nothing leaks

Ten timer-driven components — snackbar, progress-toast, hover-card,
countdown-timer, time-ago, typewriter, hotkey, copy-button, connection-status,
toast — leave **no timer running and no global listener bound** after removal.
Recorded because it is the quietest leak a component library can ship: nothing
fails, nothing logs, and an app that routes accumulates one per visit.

The sweep counts what the browser actually holds, by wrapping the global
scheduling functions, so it catches a timer started anywhere rather than only
the ones a component stored on a field it also remembered to clear.

**Verified to have teeth, which it did not on the first attempt.** Disabling
`arc-time-ago`'s teardown had to make it fail, and the first attempt at that
check edited the wrong lines — the component clears through `_stopTimer()`, not
a `clearInterval` inside `disconnectedCallback` — so the suite "passed" against
a component that had not actually been broken. With the real teardown disabled
it reports *"left 2 timer(s) running"*.

The harness now waits through the *real* `setTimeout` so its own scheduling
never lands in the count, which is what lets each case assert the component
scheduled something at all. Without that, a component that quietly stopped
scheduling would keep passing a teardown test that no longer tested teardown.

### ResizeObserver sweep — 7 tests, four components

Teardown for all four (truncate, marquee, code-block, toolbar), plus re-measure
behaviour for truncate, marquee and toolbar. Two of these took a wrong turn
worth recording, because both were the test asserting a bug rather than a
contract:

- **`arc-marquee`'s duration does not depend on host width**, and the obvious
  test asserts that it does. It is `group.scrollWidth / speed`
  (`marquee.js:126`) — *content* width — and the content is a nowrap group, so
  narrowing the host correctly changes nothing. The test now pins both halves:
  host width must **not** move it, and `speed` must.
- **`arc-toolbar` only creates its observer when `overflow` is set.** Without
  the attribute there is no observer to tear down and the case tests nothing;
  the anti-vacuity assertion caught it.

**Not covered: `arc-code-block`'s re-measure on resize.** `_overflows`
(`code-block.js:413`) never flipped when the host went 900px → 140px, despite
the body being `white-space: pre`. The measurement looks gated behind
`_highlight()`, which wants a `code` property and the shiki grammar rather than
slotted text — so the probe was probably never measuring rendered code. Recorded
as a gap rather than shipped as an assertion written against a setup I could not
confirm. Its teardown *is* covered.

**A helper bug found the same way.** `until()` defaulted to a 2000ms timeout —
exactly Mocha's — so the runner killed the test first and the failure arrived as
`Timeout of 2000ms exceeded` with no indication of which condition never came
true. Now 1200ms, so the assertion's own message wins.

## A flake found by running the suite enough times

`carousel.test.js` — "advances on its own" failed roughly 2 in 6 full-suite runs
under load, and passed 10 out of 10 when the file was run alone. The test is
older than the declaration layer and its source was unchanged by it; what
changed is the environment, since the icon fix means the suite now does real
resolution work and competes harder for the main thread.

The assertion slept a fixed 120ms against `interval="30"` and expected at least
one advance. Four nominal intervals sounds generous and is not — a real
`setInterval` sharing the thread with 79 other test files misses that window
occasionally, and the failure reads as "auto-play is broken" rather than "the
machine was busy".

Now it polls for the condition with a 2s ceiling, which is what the test actually
means: *it advances without help*, not *it advances within 120ms*. **14
consecutive full-suite runs clean since.** One uncaptured failure occurred in the
first run after the change and I did not record which test it was, so it is not
attributed — worth watching rather than declared fixed.

The general lesson matches the icon one: three green runs is not a sample. This
needed six to show up at all.

## A testing note worth keeping

`expect(someDomNode).to.equal(null)` **hangs the browser runner** when it fails —
chai builds a diff by serialising the element, and walking a live DOM node's
references does not terminate quickly. It surfaced here as a 120s
`testsFinishTimeout` with no failure message, which is a slow thing to diagnose.

The existing suite uses that idiom widely and it is harmless while green. For new
assertions about absence, prefer a stringifiable comparison:

```js
expect(el.shadowRoot.querySelector(sel) === null, 'no panel').to.equal(true);
// or assert the observable instead
expect(getComputedStyle(node).display).to.equal('none');
```

## #71 — `flag()` declared a default the mixin never applied

Surfaced by writing `props.test.js`, which is itself the point: the vocabulary
had no direct tests, so this sat under 166 components without a single failure.

`normalizeValue()` falls an enum back to its default when the value is not a
member, and a number back when it is not finite. Flags had **no branch at all** —
the function fell through to `return value`. So a flag whose property was never
initialised stayed `undefined` rather than becoming its declared default.

Nothing was visibly broken, because all 201 flags hand-write the default a second
time in a constructor:

```js
pauseOnHover: flag(true, { negative: 'no-pause-on-hover' }),   // the declaration
this.pauseOnHover = true;                                       // and again, by hand
```

That is precisely the drift this file exists to remove — the contract stated
twice, in two places that can disagree, with only a derived test standing between
them. The declaration is now also the initial value.

**Status: fixed.** One branch in `normalizeValue`. The 201 constructor
assignments are now redundant and can be removed component-by-component; they are
harmless while they agree.

Worth noting *how* it was found. The per-component conformance test
`defaults as declared` was the only thing covering this, which is a live argument
for keeping a per-prop default assertion when the rest of the per-prop repetition
was cut — and the fault-injection run confirmed it: with the flag branch removed,
the reshaped suite reports exactly **1 failure, in `props.test.js`**.

## Test posture — measured, then reshaped

The suite had grown to 4,629 tests, of which ~1,957 were derived from 452 lines.
Rather than argue from taste about whether that was over-engineered, both halves
were measured by fault injection:

| fault injected | before | after |
|---|---|---|
| shared mechanism (`props.js` enum fallback) | 238 failures / 86 components | 7 failures, 6 in `props.test.js` |
| flag default not applied (#71) | not detectable | 1 failure, in `props.test.js` |
| one component drops `DeclaredPropsMixin` | 4 failures / 1 component | 3 failures, naming the component |

One bug reported 238 times is not 238 tests' worth of information, and none of
those 238 named the file that was wrong. The reshape:

- **`props.test.js`** — the vocabulary tested directly and exhaustively, once.
  64 tests, 0.5s. Mutation gate ≥90%, higher than the library's ≥75%: a surviving
  mutant here is a hole under every adopted component at once.
- **`conformance.test.js`** — only what is per-component: the prop starts on its
  declared default, and still satisfies its declaration after being handed an
  illegal value. The second is a **fixed-point check** —
  `normalizeValue(el, meta, el[name]) === el[name]` — which is kind-agnostic and
  cannot be satisfied by a component that ignored the assignment.

Result: **4,629 → 3,418 tests, 46.7s → 24.7s**, same fault detection, better
diagnosis. The cut is safe *only because* enum membership is a plain array check
with no per-member code path; if a future version gives members individual
behaviour, that breadth stops being redundant.

**The metric changes with it.** Test count was never a posture measure — it made a
shared mechanism look like coverage. Report hand-written coverage and mutation
score separately from the derived floor.

### The ≥90% gate on `props.js` — measured, met, and the survivors classified

`pnpm mutate:props` — a committed harness (`scripts/mutate.js`), so this is
reproducible, unlike the throwaway Stryker setup whose config was never kept.

**82.81% on the first run — the gate I had written in a comment was not met.**
That was the useful outcome: the survivors were specific enough to act on, and
three of the five real gaps were not in the interesting machinery at all but in
the **declaration defaults** — that `flag()` defaults to `false`, that `oneOf()`
reflects, that neither is `derived`. Trivia in appearance only: flipping the
`derived` default would make `conformance.test.js` skip the enforcement test for
all 201 flags and stay green. Same silent-hole shape as `arc-meter` not extending
the mixin.

The other two were behavioural: a flag with no `negative` name falling through to
`setAttribute(null, '')` and stamping a stray attribute on the host, and a blocked
prop whose accessor Lit never generated.

**90.63% after (58/64).** All six remaining survivors are equivalent or
unreachable:

| line | mutant | why it cannot be killed |
|---|---|---|
| 295 | `value: true` → `false` | the guard reads `hasOwnProperty`, never the value |
| 311 | `configurable: true` → `false` | unobservable without a later redefine |
| 354 | `&&` → `\|\|` | the NaN guard is defensive; `normalizeValue` already returns finite |
| 308 | `get[PATCHED] = true` → `false` | re-wrapping is redundant, not different |
| 303 | `\|\|` → `&&` (×2) | short-circuits before the dereference either way; killing it needs a setter-only accessor, which no component has |

So the score is effectively 100% of killable mutants, and **the gate is better
stated as "no non-equivalent survivors" than as a percentage** — a bare number
invites writing tests that assert implementation details in order to reach it.
A test written to kill an unkillable mutant is a worse test than the survivor.

One correction worth keeping: I predicted the `noAccessor` test would kill the
line-303 pair by making the guard dereference `desc.get` on a null descriptor.
It does not — flipping either `||` on its own still short-circuits first. The
test earns its place for pinning the tolerance, not for the reason given.

### #71 follow-through — the 295 duplicate defaults are gone

The constructor assignments turned out **not** to be redundant as they stood, and
checking that first is the only reason this did not ship a regression.
Normalisation runs in `hostUpdate`, which is too late for a value read off a
freshly created element: with the assignment deleted,
`document.createElement('arc-marquee').pauseOnHover` was `undefined` rather than
`true`. Proven by deleting one line and watching a purpose-written test fail —
not by reasoning about it.

So the fix came first: `DeclaredPropsMixin` now **seeds every declared default in
its constructor**, which is what makes the duplication genuinely redundant. A
subclass constructor body still runs afterwards, so a component that wants a
different initial value keeps winning.

Then **295 assignments across 156 files** were removed mechanically. The suite,
all 18 checks and lint are unchanged, and conformance's default assertion was
tightened at the same time: it now reads each prop off `document.createElement`
*before* any render, so it covers the seeding rather than depending on it.

**Two near-misses in the tooling, both worth keeping.** The first version of the
script matched `this.X = <literal>` anywhere in the file and deleted
`dialog.js`'s close path — `_close() { this.open = false; }` looks exactly like a
redundant default. Restored from a backup taken before the run.

The second version scoped to the constructor and was *still* wrong: `select.js`
builds its controllers inside its constructor, so
`onDismiss: () => { this.open = false; }` lives at constructor depth, matches the
declared default exactly, and is the dismiss-to-close path. Only accepting
assignments at **brace depth 1** fixed it — 336 candidates fell to 304, then to
295, and each drop was a real behavioural line saved.

The general lesson: *"looks like an initialisation" is not the same predicate as
"is an initialisation"*, and a bulk edit needs a structural test, not a textual
one. Take the backup before the run, not after the first surprise.

## The uncovered-components sweep — 31 components, 7 real constraints

Surveying the 71 props **before writing anything** was the step that paid. Most
are free-form strings — `label`, `heading`, `href`, `description` — where the
vocabulary has nothing to enforce and adoption buys zero assertions. Adopting all
31 on principle would have been ceremony.

Seven props carried a real constraint, and every one was the recurring shape — a
constraint on the render, or nowhere:

| component | prop | what went wrong |
|---|---|---|
| `arc-stepper` | `active` | unbounded; past the last step **no step was current**, so a screen reader announced a workflow with no position |
| `arc-timeline` | `heading-level` | unbounded; `aria-level="0"` is invalid and is discarded, silently dropping the heading semantics the prop exists to provide |
| `arc-calendar` | `first-day-of-week` | `9` is truthy, reached `weekdayOffset()` and reordered the week arbitrarily |
| `arc-stat` | `trend` | a bogus value drew an *uncoloured* dash — the else branch renders, and `:host([trend="sideways"])` matches no rule |
| `arc-spy-link` | `level` | a nesting depth that accepted negatives |
| `arc-dashboard-grid` | `columns` | NaN and negatives reached the grid template |
| `arc-aspect-ratio` | `ratio` | documented fallback applied in the render; `el.ratio` keeps the invalid value |

All but the last are now declared. `ratio` is a **pattern**, not a set or a
range, which the vocabulary cannot express — pinned as current behaviour.

**The sentinel insight, which recurs three times.** `trend: ''`, `columns: 0` and
`firstDayOfWeek: 0` each looked like a prop the vocabulary could not express,
because each has an "absent" state that is not the same as any listed member.
Each became expressible the moment the sentinel was read as *a member of the
set*: `oneOf(['', 'up', 'down', 'neutral'])`, `oneOf([0,1,…,7])`. Worth trying
before concluding a prop needs new vocabulary — I nearly recorded an
architectural gap that was not there.

**`arc-calendar`'s docs were wrong about its own default.** `@prop
firstDayOfWeek` documented "1 = Monday … 7 = Sunday" and the default is `0`,
which the prose never mentioned. 0 is the auto sentinel. Documented now.

**Two things not adopted, deliberately.** `arc-calendar`'s `month` and `year`
default to the *current* month and year. The vocabulary assumes a static default,
so declaring them would either fight the constructor or make conformance's
"starts on its declared default" assertion wrong. A `default: () => …` form would
cover it; not added on one case.

**Near-miss worth recording:** I applied the declaration to `arc-calendar` and
forgot the mixin on the class line. The declaration would have been **inert** —
normalising nothing, with no error anywhere. That is exactly the `arc-meter` trap
from #70, already written down in the handoff, and I still walked into it. Caught
by grepping for `DeclaredPropsMixin(LitElement)` across the four files I had just
edited rather than by any test. **The check belongs in `scripts/checks/`**, not in
a handoff note.

### Computed defaults — and a regression the sweep uncovered in my own work

**`default:` now takes a function.** `arc-calendar`'s `month` and `year` default
to the *current* month and year, so there is no literal to put in a declaration.
Before this such a prop could not adopt the vocabulary at all: a static default
would fight the constructor, and conformance's "starts on its declared default"
would be wrong by construction. `defaultOf(el, meta)` resolves it, the element is
passed in so a default may depend on a sibling, and it resolves per call rather
than freezing "the current month" at class-definition time. `oneOf()` skips its
static member check for a computed default — there is nothing to check until an
element exists — and still throws for a literal one outside the set.

That closed a real defect: `month="15"` reached `new Date(year, 15)`, which is
April of the *following* year, so the grid showed a different year than the
`year` prop and the header claimed. Now clamped to 0-11.

**The regression, which I caused and did not notice for an hour.** Deleting the
295 constructor defaults broke manifest generation. `prism-props.js` says it
deliberately answers only name/type/reflect because "every component in this
library assigns its defaults in its constructor" — that sentence stopped being
true the moment the dedupe landed, and the custom-elements analyzer reads
defaults from constructor assignments and cannot evaluate `flag(true, …)`.

Regenerating dropped **588 `default` entries (1870 → 1282)** across the manifest,
which feeds the docs tables, the VS Code and JetBrains data, and prism. The suite
was green throughout: nothing in the test suite reads the manifest's defaults,
and the committed manifest was stale, so the loss was invisible until
`pnpm generate` ran.

Fixed at the right layer — `scripts/generate/manifest.js` now fills a missing
default by statically parsing the declaration, so the declaration is the single
source of truth for downstream readers too. Verified by diffing against the
pre-dedupe manifest: **1843 defaults, 0 missing, 0 spurious**, and one
improvement (`arc-confirm`'s `open` attribute had no default before and now
reads `false`).

**The lesson is about blast radius.** A green suite and 19 passing checks did not
cover a generated artifact that no test reads. When a refactor removes a *source
of information* rather than changing behaviour, ask what else was reading it —
grep for consumers, not just for callers.

### A second flake instance — lost to my own filtering

A full-suite run during verification reported **1 failed test** and I never
learned which: the command piped the runner through `grep -E "test files \|"`,
which keeps the summary line and discards the assertion message underneath the
❌. Four immediate re-runs were clean, so the evidence is gone.

That is the third time this repo's flake has destroyed its own evidence — twice
by re-running until green, once by filtering — and the second time it was me,
*after* I had written the warning down twice.

So it is now a script rather than a discipline: **`pnpm test:log`**
(`scripts/test-run.sh`) always writes the full log to `.test-logs/` first and
derives the summary from the file, printing failures with 20 lines of context
and the log path. Validated against a deliberately failing test to confirm the
assertion message survives.

**Status of the flake itself: one instance identified and fixed**
(`arc-context-menu` re-anchor, a layout read racing `settle()`'s two-frame
wait), **one instance unidentified**. It is not safe to assume they are the same
defect. The context-menu fix is correct on its own terms regardless.

## The prose-constraint sweep — surveyed, not read one at a time

The handoff's advice was to grep for *the shape* rather than for a category of
prop, and the survey that worked was: **of 109 numeric props not yet on the
vocabulary, 12 state an explicit range in their prose** ("0 to 1", "a fraction
of the range", "from 0 to 100"). Those 12 are the ones where a documented claim
can be checked against the code. Five were enforced in the render or nowhere.

| component | prop | where the constraint actually lived |
|---|---|---|
| `arc-split-pane` | `ratio` | **the drag handler only** |
| `arc-progress` | `value` | the render (`Math.max(0, Math.min(100, …))`) |
| `arc-waveform` | `position` | nowhere |
| `arc-level-meter` | `warn` | `Number.isFinite()` — the wrong property of the value |
| `arc-level-meter` | `clip` | same |

**`arc-split-pane` is the one worth reading.** Its drag handler clamps to
`minRatio`..`maxRatio`, so dragging always respected the bounds and
`el.ratio = 0.99` bypassed them completely — producing a layout the component
would never let a user drag to. Finding #58's shape exactly: *a constraint
enforced on the interaction rather than on the state*, now the sixth instance.

It is also the case that justifies named bounds. The declaration is
`num({ min: 'minRatio', max: 'maxRatio', clamp: 'toRange' })`, not a hardcoded
0..1 — the real contract is the one the drag obeys, and both bounds are
themselves reactive props a consumer can change.

**`arc-progress` is the interesting near-miss.** Its render clamped *and*
`aria-valuenow` used the clamped local, so unlike `arc-meter` (#70) the visual
and accessible readings agreed. Only the state lied: `el.value` read back 500.
Worth noting because it shows the #70 defect and this one are the same root
cause with different blast radii — clamping at the point of use is correct
everywhere it is applied, and silently absent everywhere it is not.

**`arc-level-meter`'s guard checked the wrong thing.** `Number.isFinite(this.warn)`
rejects NaN and accepts 5, so a warn threshold of 5 put the warning zone
off-scale and silently disabled it. A finite check reads like validation and is
not one.

The render-side guards are now deleted rather than left in place: with the
constraint on the state, `const clampedValue = this.value` and
`const warn = this.warn`. Leaving both would be two sources of truth again.

## The flake, properly diagnosed — it had two races, not one

The second capture is what settled it, and it only existed because `pnpm test:log`
had just been written. The failure was the *same test* as before with a *different*
symptom:

```
❌ arc-context-menu opening > re-anchors when reopened at a new point
   AssertionError: the menu tracks the click delta: expected 123.09358215332031 to be close to 120 +/- 2
```

Not a delta of ~0 this time — a delta 3.09px out. So the earlier diagnosis was
**incomplete**. `getBoundingClientRect()` read once after `settle()` races two
independent things:

1. **Placement.** PositionController may not have positioned the panel yet, which
   gives a delta of ~0. This is what the first fix addressed.
2. **Animation.** `.menu` has `animation: menu-in 100ms` — `scale(0.95)` to
   `scale(1)`. That is roughly six frames; `settle()` waits two. A rect read
   mid-animation is a few pixels off, and *how many* depends on how busy the
   machine was.

The first fix polled for "the menu moved", which covers (1) and is blind to (2).
It made the flake rarer and left it alive — the worst outcome, and I reported it
as fixed.

**`stableRect(getNode)`** in helpers.js is the real fix: poll until two
consecutive reads of the box agree, then return it. It costs one extra frame on
an idle machine, waits as long as it must on a busy one, and encodes no frame
count. It takes a getter rather than a node because an overlay is often torn down
and rebuilt between opens.

**Rules that follow:**

- **Never read layout after `settle()`.** `settle()` is two frames; it is a guess.
  For anything positioned by a controller or animated by CSS, use `stableRect()`.
- **An animated element has no stable geometry until the animation ends.** Any
  test measuring an overlay is exposed to this. `arc-context-menu` is not
  special — it is the one that happened to be measured with a ±2px tolerance,
  which is what made it fail visibly instead of silently.
- **A tight tolerance is a feature.** A ±10px assertion here would have hidden
  the animation race indefinitely. The sibling test `opens at the pointer` uses
  ±10 and has never failed — not because it is correct, but because it is loose
  enough to absorb the bug. It now uses `stableRect()` too.

**Status: three occurrences, all explained.** Two identified as this test (delta
~0, delta +3.09) and the third — the one lost to my own output filtering — is
consistent with the same defect but cannot be attributed. Four full runs clean
after the real fix, which proves little on its own; the reason to believe it now
is the mechanism, not the run count.

## Mutation baseline for the library — and the derived layer's blind spot

Five components, sampled with `scripts/mutate.js`. **These numbers are not
comparable to the 67.52% on record**: that was Stryker, whose operator set is
larger. This is a new baseline for future runs of this tool.

| component | killed | score |
|---|---|---|
| `time-picker` | 68/86 | 79.07% |
| `range-slider` | 24/31 | 77.42% |
| `carousel` | 25/35 | 71.43% |
| `tree-view` | 18/29 | 62.07% |
| `data-table` | 26/54 | **48.15%** |
| **weighted** | **161/235** | **68.51%** |

### The blind spot, which matters more than the score

Three carousel survivors are `true-to-false` on the **declarations themselves** —
`loop`, `showDots`, `showArrows`. That is structural, not an oversight:

> **A derived test cannot kill a mutant in the declaration it derives from.**

`conformance.test.js` asserts "starts on its declared default". Mutate the
declared default and the expectation moves with it — the declaration is
simultaneously the code under test and the oracle.

The fault-injection experiment that justified reshaping conformance **did not
catch this**, because faults were injected into the *mechanism* (props.js) and
into *adoption* (removing a mixin), never into a *declaration*. That is a gap in
the experiment design, and it means the derived layer is blind precisely where I
claimed it had coverage.

What follows: a declared default that matters behaviourally needs a hand-written
assertion. `arc-carousel` looping by default is a product decision, not a detail
of props.js, and nothing currently pins it. Adding a third fault to the
redundancy harness — mutate a declaration, confirm only hand-written tests
notice — would make this measurable rather than argued.

### What `data-table` exposed

47 hand-written tests and the lowest score of the five. Two clusters survived:

- **numeric-vs-text sort detection** — the whole-column mode decision, empty
  handling, and the mixed `10 / '9' / 100 / '99'` case the comment says it exists
  for
- **the selection-pruning guards added earlier in this same audit** (#63/#64).
  The feature was tested; `!changed.has('rows')` and `kept.size !== size` were
  not, so both could be inverted with every existing test green.

Nine tests added, written against surviving mutants rather than against the docs.
**Re-measured after: 48.15% -> 55.56%** (26/54 -> 30/54). Four more mutants dead,
which is the honest yield: nine tests aimed at ten survivors killed four of them.
The rest of that file's survivors are in virtual-scroll windowing, which has no
coverage at all and is the next place to look.

**Three of those drafts failed for reasons that were mine, not the component's:**
the click target is the `.sort-button` inside the header rather than the `th`,
and `_handleSort` requires the *table* to carry `sortable`, not only the column.
Every failure showed rows in their original order, which reads exactly like
"sorting is broken" — a phantom finding avoided only by checking against the
tests that already passed.

### A procedural note: never run the suite while `mutate.js` is running

A "final verification" run reported `3668 passed, 0 failed` **and** contained a
❌ — `data-table.test.js` hit the 120s finish-timeout because the mutation
harness was rewriting `data-table.js` underneath it. The summary line and the
failure marker disagreed, which is its own warning sign worth remembering: the
runner counts a file that never finished as neither passed nor failed.

The harness restores its file in a `finally`, so the fix is to *wait* rather than
kill it — a SIGTERM mid-write would leave a mutant on disk. Verified restored
before the real run.

---

## The shared-module suites — six modules, four findings

V4-PLAN 2.4c. Six of the 27 shared modules had a direct suite; **none of the six
widest-blast-radius ones did**. `form-control-mixin` (26 importers),
`dismiss-controller` (17), `overlay-mixin` (5), `menu-keyboard` (3),
`focus-trap` and `scroll-lock` were covered only by inference, through whichever
consumer's own suite happened to exercise them. That is the posture `props.js`
was in before `props.test.js`, and it produced the same result: writing the
suites found four findings, three of them the same shape as #55 and #64 — the
reconnect defect turned out to be in **every** controller in the shared layer
that had not adopted `subscriptions.js`, which was all three of them.

### 72. Dismissal did not survive a reparent — **lifecycle — FIXED**

`DismissController` had `hostDisconnected() { this.deactivate() }` and no
`hostConnected`. All seventeen consumers activate from `updated()`, keyed on an
open-state **change** (`notification-panel:196`, `popover:99`, `spotlight:69`,
`dropdown-menu:180`, `hotspot:232`, `tag-input:353`, `date-picker:616`,
`multi-select:320`, `combobox:303`, `search:232`, …). Moving an element in the
DOM changes no property and schedules no update, so `hostDisconnected` was a
one-way door: an overlay that was open when it moved came back **rendering
normally, answering every property, and permanently undismissable by pointer and
by focus at once**.

This is #55 for the third time — a subscription bound once per *element* where
the lifecycle it belongs to is once per *connection*. `subscriptions.js` was
written for exactly this and the dismiss layer never adopted it.

The fix is not "activate on `hostConnected`". Activation here is **state, not
structure** — most of these controllers are correctly inactive most of the time
— so arming unconditionally would re-arm every dismissable component on the page
on every move. `hostDisconnected` records whether it was active and
`hostConnected` restores that, which is why the suite pins *both* directions:
an active controller must come back, and an inactive one must stay inert.

### 73. The overlay layer lost Escape and the scroll lock on a reparent — **lifecycle — FIXED**

The identical defect one module over, found by looking for it. `OverlayMixin`
did all of its arming inside `updated()` behind `changed.has('open')`, and tore
it down in `disconnectedCallback`. Reparent an open modal and it came back with
**the page scrolling behind it and Escape doing nothing**, while still looking
exactly like a modal. Five components inherit this: modal, sheet, drawer,
lightbox, command-palette.

Fixed by splitting the connection-scoped half (`__armOverlay` /
`__disarmOverlay` — the document keydown listener and the body lock) out of the
state-scoped half (focus capture, focus restore, the panel focus), and pairing
it with `connectedCallback`/`disconnectedCallback` keyed on `this.open`. Both
halves are idempotent by construction — the same listener reference
de-duplicates, and `scroll-lock` tracks by owner — so the open-while-connecting
path arming twice costs nothing.

**This does not close V4-PLAN 4.4's rework of the mixin off its `updated()`
override.** It is the minimum correct fix for a live defect; the contract is now
pinned by a suite that asserts behaviour (Escape closes, the body is locked,
focus comes back) rather than mechanism, which is what makes the 4.4 move safe
to attempt.

### The platform rule that made three tests pass vacuously

Worth carrying forward, because it cost the first draft of
`dismiss-controller.test.js` three green-but-empty tests. **Event dispatch is
skipped entirely on any node where the retargeted `target` and `relatedTarget`
come out equal.** So a synthetic `focusout` fired *at the host* naming a
shadow-internal `relatedTarget` never runs the host's listener at all — and a
test written that way passes whether the controller works or not.

The same rule means a focus move that begins and ends inside one shadow tree
produces **no `focusout` at the host**, which is a fact about the component, not
about the test: `_holds()` never sees that case. What it actually protects is
focus moving between *slotted light-DOM* children, and from a light child into
the shadow tree (where `relatedTarget` retargets to the host and the
`inside === node` branch catches it). The fixture therefore fires from a slotted
child, which is both the realistic shape and the only one that reaches the
listener.

`_holds()`'s third branch — `inside.shadowRoot?.contains(node)` — is **not
covered and is not reachable** through a real event on a host listener, since
retargeting resolves a shadow-internal `relatedTarget` to the host before the
listener sees it. Recorded rather than faked: a test that reached it would have
to construct an event the platform does not produce.

### What the other four modules pinned

No findings, which is worth recording as such (`arc-transfer-list` and the
scroll-listener group are both on record the same way).

- **`scroll-lock`** — the refcount holds: two owners, first release keeps the
  lock, last one restores; a stranger's unlock cannot release someone else's
  lock; the pre-existing `body` overflow round-trips. That last test uses
  `overflow: scroll` rather than the default, on the range-slider rule — `''`
  in and `''` out is a round-trip that cannot fail.
- **`focus-trap`** — composed-order collection across slots and nested shadow
  roots, the `[disabled]` / `tabindex="-1"` / no-box exclusions, and
  `trapTabKey` in **both directions plus the middle of both**. The middle cases
  are the ones the range-slider Home/End lesson says get skipped.

### 74. `<fieldset disabled>` is a one-way door — **correctness, all 27 form controls — PINNED, not fixed**

Found by `form-control-mixin.test.js` on the first run. Disable a fieldset and
re-enable it, and every ARC control inside stays disabled **for the life of the
page** — property, reflected attribute, and the native `<input>` underneath.
Confirmed on `arc-input` and `arc-checkbox`, not just on the probe.

The mechanism is a genuine platform interaction, not a slip:

```js
formDisabledCallback(disabled) {
  this.disabled = disabled;   // reflect: true on all 27 consumers
}
```

Per the HTML spec a form-associated custom element is disabled if **its own
`disabled` attribute is present _or_ an ancestor fieldset is disabled**. So
reflecting in response to the callback makes the element *self*-disabled; its
computed disabled state stops depending on the fieldset; and the platform
therefore never calls `formDisabledCallback(false)`. The element disables
itself out of ever hearing that it was re-enabled.

**Measured rather than reasoned.** Two otherwise identical form-associated
elements under the same fieldset toggle:

| element | callbacks received |
|---|---|
| records the call, writes no attribute | `[true, false]` |
| records the call, writes `disabled` | `[true]` |

So the platform does fire the re-enable; the reflection eats it. That also rules
out "Chromium doesn't support this", which was the first suspicion.

**Why it is pinned rather than fixed.** Every candidate fix changes the
`disabled` contract itself, which is spread across 27 components and the 30
stylesheets that match `:host([disabled])`:

1. *Stop reflecting from the form path* — correct, and immediately unstyles
   every form-disabled control, because the CSS is attribute-keyed.
2. *Style off `:host(:disabled)` or an internal state
   (`_internals.states`)* — the platform already matches `:disabled` on
   form-associated elements, so this is the clean answer, but it is a
   stylesheet edit in ~30 files plus a decision about what `this.disabled`
   means to component JS.
3. *MutationObserver on the ancestor fieldset* — contained to the mixin and
   needs no stylesheet changes, but it is a hand-rolled reimplementation of a
   platform signal the platform is already willing to send us, and it has to
   handle the element being moved or the fieldset removed.

(2) is the right one and it belongs with a deliberate pass over the disabled
contract — HANDOFF's "three things that will bite you" #2 already records that
these 27 keep `{ type: Boolean, reflect: true }` **on purpose**, and finding #61
already established that `disabled` is never a stylesheet rule alone. Doing it
as a side effect of writing a test suite would be exactly the kind of unreviewed
architectural drift the ground rules exist to prevent.

Pinned as `it('BUG: re-enabling the fieldset does not re-enable the control')`,
which asserts today's behaviour *and* the attribute that causes it, so the fix
flips it rather than deleting it. It is the highest-severity open item in the
ledger: unlike most findings here it needs no unusual API use to hit — a
multi-step form that disables a section and re-enables it is the ordinary case.

### 75. The menu keyboard did not survive a reparent either — **lifecycle — FIXED**

Found by looking for it, which is the point. After #72 and #73 the question was
no longer "is this module correct" but "which controllers in `src/shared/` have
a `hostDisconnected` and no `hostConnected`". `MenuKeyboardController` was the
third and last. All three consumers call `attach()`/`detach()` from `updated()`
keyed on an open-state change (`dropdown-menu:184`, `command-palette:478`,
`toolbar:227`), so an open menu that was reparented came back rendering
normally and **answering no key at all** — not Escape, not the arrows.

One difference worth keeping: `detach()` clears `focusedIndex`, and that is
correct for a close (reopening a menu should start from the top) and wrong for
a reparent (losing your place mid-navigation is the visible half of the bug).
So the index is carried across `hostDisconnected` → `hostConnected` explicitly
rather than by leaving `detach()` alone. The suite pins both: `detach()` still
forgets, a reparent still remembers.

### The rule this batch actually establishes

Three controllers, three instances, one shape — and `subscriptions.js` has had
the correct implementation of it since finding #55. The lesson is not "check
`hostDisconnected`" but the one already in HANDOFF, now with a fourth data
point: **a shared layer that covers part of a lifecycle hands the gap to every
consumer, and the consumers cannot see it.** Seventeen components, then five,
then three — twenty-five in total — each individually correct, all broken by
the same missing hook.

`scripts/checks/lifecycle-pairing.js` derives its subjects from the source tree
and found `arc-marquee`/`arc-infinite-scroll` in seconds. It does **not**
currently catch this: its subject is the `firstUpdated`/`disconnectedCallback`
pair in components, not the `hostConnected`/`hostDisconnected` pair in
controllers. Extending it to flag any class in `src/shared/` with a
`hostDisconnected` and no `hostConnected` would have found all three of these
without a fixture, and would cover controllers that do not exist yet — the
derive-your-subjects argument, one more time. Recorded as the obvious next
check rather than written here, because it belongs with V4-PLAN 4.10's parser
consolidation.

## The FormData sweep — 26 controls, no findings

V4-PLAN 2.4b. `form-contract.test.js` never called `new FormData` once. It
swept `checkValidity()`, `validity.valueMissing` and the reflected `name` — all
of which a control can satisfy while submitting nothing at all — across a
**hand-written list of 14** of the 26 form-associated controls. Twelve
components carried their own ad-hoc FormData block, so the remaining fourteen
had no submission assertion anywhere, including every control that overrides
`_formValue()`, which is exactly where submission stops being obvious.

`form-data-sweep.test.js` derives its subjects instead: `custom-elements.json`
records a `formAssociated` member on precisely the 26 classes that participate
in forms, so the subject list is a property of the catalog rather than of
somebody's memory. The one thing that cannot be derived — *how* to give a given
control a value — is a `FILL` map, checked against the derived list **in both
directions**: a new control with no fill is a failure rather than a silent skip,
and a fill naming a control that no longer exists is also a failure.

**68 tests, no findings.** All 26 submit correctly, including the three
multi-entry controls (`multi-select`, `tag-input`, `transfer-list`, which append
once per selection so `name="tags"` arrives as a list rather than as `"a,b"`)
and the two whose submitted state lives outside `value` (`range-slider`'s
low/high, `date-range-picker`'s interval). That is worth recording as a result:
the layer was untested, not broken.

Three things the sweep's construction is worth copying for:

- **The assertion is differential, not absolute.** Each control serializes
  differently, so the shared contract is "the form submits something different
  once the control has a value" — which is precisely what a control that never
  calls `_updateFormValue()` fails, and it needs no per-component expectation.
- **The negative sweep is the anti-vacuity pair.** "A control with no name
  submits nothing" runs over the same 26; without it, the positive sweep would
  pass on a control that submitted under some key of its own choosing.
- **It caught its own fixture on the first run.** `arc-color-picker`'s fill was
  `#4d7ef7` — which is its default, making the differential assertion
  unfalsifiable. This is the range-slider `min: 0` lesson reappearing in a test
  written *by* someone who had just read it, which is the argument for the
  differential form: an absolute assertion would have passed and hidden it.

`form-contract.test.js:102-109` is also fixed. It was titled *"readonly does not
exclude the value from submission"* and asserted `checkValidity() === true`,
which is not submission — the distinction between `readonly` and `disabled`
**is** the value being submitted, so the test asserted the one thing that could
not tell them apart. It now reads the FormData, and gained the `disabled`
counterpart that makes it non-vacuous.

The 12 ad-hoc per-component FormData blocks are **left in place**. Removing them
is a cut under ground rule 3 and needs a named mutation pair per component,
measured before and after; duplicated coverage costs seconds, and a cut that
silently drops a branch costs a finding.

## The conditional-skip sites — three constructs, two runtime skips, no debt

V4-PLAN 2.4e. The suite reports `2 skipped` on every run, and three
`.skip`-bearing constructs exist in the test tree. Both numbers are correct and
neither is a parked TODO; this is the paragraph saying why, so the next person
to count them does not go looking for work that is not there.

**The arithmetic.** Three constructs, but only one of them skips anything in a
normal run:

| site | construct | skips in a normal run |
|---|---|---|
| `conformance.test.js:161` | `meta.derived ? it.skip : it` | **2** |
| `icon-aliases.test.js:21` | `icons ? describe : describe.skip` | 0 |
| `sanitize-svg.test.js:10-11` | `icons ? it : it.skip` (+ describe) | 0 |

**1. The derived-prop skip is a statement about direction, not a gap.**
`conformance` derives an "enforces its declaration on both paths" test from
each declaration, which sets an illegal value and asserts it is normalised. A
prop declared `derived: true` is an *output* — the component computes and
publishes it — so assigning to it tests the wrong direction entirely. There are
exactly two in the library (`arc-sticky.stuck`, `arc-top-bar.scrolled`), which
is where the 2 comes from; the count moves only when a component declares
another derived prop. Note the *default* test immediately above it is **not**
skipped: a derived prop still has to start on its declared default, and that is
asserted for both.

**2 and 3. The icon gates skip nothing, and are not supposed to.** The per-icon
modules are generated and gitignored, and the `pretest` hook regenerates them
(0.13s) before every `pnpm test` — so on any tree that ran the suite the normal
way, `generatedIconsPresent()` is true and both files run in full. The gate
exists for the other tree: a fresh checkout where someone runs the runner
directly, where the alternative is not a skip but a wall of `ERR_MODULE_NOT_FOUND`
that reads as a broken suite rather than as an ungenerated one. Both sites warn
to the console when they trip, so a skip is never silent.

`sanitize-svg.test.js` is the one worth reading closely, because it is gated
**per block rather than per file**: its scanner tests are string in, string out
and keep running on a fresh checkout, since they are the ones guarding against a
`>` inside a quoted attribute. Only the blocks that resolve a real glyph are
behind the gate. That is the shape to copy — gate the narrowest thing that
actually needs the artifact.

**Nothing here should be re-enabled.** Deleting the derived branch would assert
a contract backwards on two props; deleting the icon gates would trade a
readable skip for an unreadable failure on exactly the checkout where a
newcomer meets the suite for the first time.

## The sampled mutation gate — baselined and enforced

V4-PLAN 2.0. The referee existed (`scripts/mutate.js`) and was wired to nothing:
`pnpm mutate:props --gate 90` was in `package.json` and in no CI job, so the
number was true only on whatever afternoon someone last typed it.

`scripts/mutate-sample.js` makes the gate a list of `--source`/`--tests` pairs
rather than a library-wide percentage. A single library number is unaffordable
here (every mutant re-runs a test file) and would not be useful either — it
moves for reasons nobody can attribute. Pairs are chosen for **blast radius**.

**Baselines, 2026-08-13.** These are in `mutate.js`'s own units and are **not**
comparable to the Stryker-era 61.45% → 67.52% readings in `test-audit.md`; that
harness had a much larger operator set. Compare runs of this tool to each other
and to nothing else.

| pair | score | mutants | gate |
|---|---|---|---|
| `props` | 91.18% | 68 | ≥90 |
| `form-control-mixin` | 100.00% | 27 | ≥95 |
| `dismiss-controller` | 92.00% | 25 | ≥88 |
| `menu-keyboard` | 100.00% | 9 | ≥88 |
| `scroll-lock` | 100.00% | 3 | ≥95 |
| `focus-trap` | 87.50% | 16 | ≥85 |
| `overlay-mixin` | 83.33% | 6 | ≥80 |
| `subscriptions` | 83.33% | 6 | ≥80 |
| `listbox-controller` | — | ~59 sites | not baselined |
| `position-controller` | — | ~50 sites | not baselined |

Gates sit just under each measured score, so they ratchet: a real regression
fails, and a threshold can only ever move up. The last two are in the set but
skipped in CI rather than passing silently at `gate: null` — they are the large
ones, against test files that mount real components, and deserve their own pass.

**Three mutants were worth killing, and the exercise paid for itself twice.**
The first measurement put `overlay-mixin` at 66.67% and `menu-keyboard` at
88.89% on suites written the same afternoon; three tests took them to 83.33%
and 100%, and each one pinned a contract worth having:

- *Opening an overlay must not steal focus already inside the panel* — a
  command palette that puts the caret in its own search field was one flipped
  condition away from having that overruled, with every existing test green.
- *A menu detached before a reparent must stay detached* — distinct from the
  never-attached case, and it exercises the flag `detach()` clears.
- *A collapsed-but-rendered element is still focusable* — every earlier
  visibility test used `display: none`, which zeroes all three of `isVisible`'s
  measurements at once and so cannot tell them apart.

**The fixture for that last one had to be chosen against the mutants, not by
eye.** `width: 0; height: 20px` is the obvious "collapsed on one axis" case and
kills nothing, because `&&` binds tighter than `||`: the mutant reads
`(offsetWidth && offsetHeight) || rects.length`, which is still truthy. Only
zero on *both* axes separates `offsetHeight || rects` from
`offsetHeight && rects`. Worth remembering — an operator-swap mutant is not
always the predicate you think you are testing.

**Five survivors are equivalent, and saying so is part of the result.** Chasing
them would produce tests that assert nothing:

- `props.js:315` — `defineProperty(Ctor, PATCHED, { value: true })` → `false`.
  The guard above it uses `hasOwnProperty`, which tests presence, not value.
- `props.js:391` — `next !== current && !Number.isNaN(next)` → `||`, whose only
  effect is a redundant self-assignment.
- `dismiss-controller.js:158` ×2 — `_holds()`'s `if (!inside || !node) return
  false` guard is unreachable: both early-returns in `_onFocusOut` already
  exclude the cases that would reach it. Dead defensive code, correctly
  undetectable.
- `focus-trap.js:10` — the first `||`, equivalent by the precedence argument
  above.
- `subscriptions.js:135` — `typeof IntersectionObserver === 'undefined'`, which
  needs an environment without it.

One real gap is left and recorded rather than papered over: `focus-trap.js:24`'s
`assignedElements({ flatten: true })`. Killing it needs a slot assigned to
another slot — the slot-forwarding pattern, where a component's shadow places a
`<slot>` inside another component's light DOM. That is a legitimate fixture, not
an equivalent mutant, and it is the next thing to write here.

**The referee was fault-injected too.** A gate raised above its measured score
fails with exit 1 and names the pair; `form-data-sweep.test.js`, which has no
mutation pair because its subject is 26 components rather than one module, was
verified by breaking `multi-select`'s `_formValue()` and watching it go red.
A gate nobody has watched fail is an assumption.

## A ledger correction: `pnpm generate` was not diff-clean

Caught during this batch's final verification, and it matters for Phase 0
because "generate diff-clean" is one of its gates.

`HANDOFF.md` recorded "`pnpm generate` exits 0 with zero drift in the six
wrapper packages and the docs data". It did not. Running it produced a
**one-time catch-up of roughly 150 wrapper files** across all six packages plus
the `packages/html` examples.

Every change is declaration-layer: `variant = 'default'` losing its default in
the Svelte props destructure, `status` gaining `''` as an enum member in the
Angular accessors, and so on. In other words the previous session's vocabulary
migration regenerated `custom-elements.json` but never regenerated the wrappers
*from* it, and nothing noticed because the claim had been written down and the
command had not been re-run.

Two things worth taking from it:

- **A second `pnpm generate` is a fixed point.** The tree is consistent again;
  this was staleness, not a generator bug. It is now in the working tree and
  belongs in Phase 0 slice 0.5 with the rest of the generated output.
- **It was not caused by this batch.** The three shared modules edited here
  (`dismiss-controller.js`, `overlay-mixin.js`, `menu-keyboard.js`) declare no
  `static properties`, and wrapper generation reads component prop
  declarations — there is no path from a controller's lifecycle hook to a
  Svelte destructure. Verified by the shape of the diff, which is entirely
  defaults and enum members on components this batch never opened.

The general lesson is the one this repo keeps relearning in new costumes: **a
ledger entry is a claim about the past, not a check.** HANDOFF's own header
already warned that its suite figures were stale against `.test-logs/`; the
generate claim was stale in exactly the same way and had no warning on it. CI
runs `pnpm generate` and diffs, so this would have been caught the moment
anything was pushed — the gap is only ever on an uncommitted tree, which is
precisely where this work has been living.

## The last five uncovered components — 85 tests, four findings

The coverage gap, measured rather than remembered: of 207 tags, **one** had no
coverage of any kind (`arc-icon-library` — no vocabulary props, no slots, no
parts, so both derived suites had nothing to derive from) and **four** had real
behaviour with no hand-written test. The other 38 in the gap are presentational
primitives — `arc-stack`, `arc-center`, `arc-skeleton`, `arc-kbd` — whose entire
contract is props plus slots plus parts, which conformance already derives.

All five are Phase-1 survivors, so the work was safe to do before the catalog
decisions. Four findings, and **three of them are the same shape**.

### 76. `arc-pagination` strands itself on an out-of-range `current` — **doc-mismatch — FIXED**

**Fixed, and all three of `_getPageRange()`'s bounds moved with it**, not just
`current`. That was not tidiness: `current` names `total` as its `max`, so
`total` needed its own floor first — otherwise `total="0"` would clamp `current`
to 0, below its own documented 1-based range. `siblings` had the third
`Math.max` and came along. `_getPageRange()` is now a destructure.

Naming `total` as a *property* bound rather than a literal is what makes
shrinking the page count under a legal `current` pull it back down — pinned,
because a remembered bound would pass every other test in the file.

`current` is documented as "the currently active page number (1-based)" and is
clamped in `_getPageRange()` — the *render* — while the property keeps whatever
it was handed. Finding #70's shape exactly. The consequence is not cosmetic:
with `total=5, current=99` no page carries `aria-current`, and because
`_goToPage` guards on `page > this.total`, **Previous is enabled and does
nothing** — the control cannot get back into range. The component displays one
page and holds another.

`current: int({ default: 1, min: 1, max: 'total', clamp: 'toRange' })` fixes it
in the declaration rather than the render, which is what the vocabulary is for.

### 77. `arc-label` splices an id into a CSS selector — **correctness — FIXED**

**Fixed with `getElementById` on the root**, not `CSS.escape` — the fallback
line already called `document.getElementById`, so the selector was the odd one
out rather than the thing to preserve. Guarded with a `typeof` check because a
`DocumentFragment` that is neither a document nor a shadow root has no
`getElementById`, and `||` rather than `??` so a root that simply does not
contain the id still falls through to the document, as it always did.

Pinned across all three id shapes the finding named (`2fa-code`, `user.email`,
`field:1`) rather than the one it happened to use.

`_onClick` does `getRootNode().querySelector('#' + this.for)`. HTML ids may be
almost anything — `2fa-code`, `user.email`, `field:1` are all legal and all
routine in generated forms — but a CSS id selector may not begin with a digit or
contain an unescaped `.` or `:`. `querySelector` throws `SyntaxError`, the
exception escapes the click handler, and the `document.getElementById` fallback
on the very next line — **which would have worked** — never runs.

One call fixes it: `getElementById` on the root, or `CSS.escape(this.for)`.

### 78. `arc-stepper-nav` has no bound on `active`, and its two guards disagree — **correctness — FIXED**

**Neither guard changed.** `active` is
`int({ min: 0, max: '_lastStep', clamp: 'toRange' })`, and the value can no
longer reach a state where the button's `active === steps.length - 1` and
`_next()`'s `active < steps.length - 1` disagree. Fixing the disagreement by
editing one of the two conditions would have left the other free to drift
again; bounding the value they both read is what makes them agree by
construction.

The below-zero half dissolved the same way: `?disabled=${active === 0}` only
ever knew about exactly zero, which is now the only below-zero state there is.

`active` is documented as "zero-based index of the currently active step" and is
bounded nowhere — not in the declaration (`{ type: Number }`, no vocabulary),
not in `_goTo`, not in the render. Past the end, every step reads
"(completed)" and none is current.

The sharp part is a disagreement between two conditions on the same value. The
button's label asks `active === steps.length - 1` (99 === 4 → false) so it reads
**"Next"**; `_next()` asks `active < steps.length - 1` (99 < 4 → false) so it
takes the **completion** branch. The user is told there is another step, clicks
Next, and the wizard finishes.

Below zero the halves split the other way and it is only cosmetic: `_back()`'s
`active > 0` guard correctly refuses to move, while the button's
`?disabled=${active === 0}` only knows about exactly zero — so Back renders as
available and is inert. Pinned as such rather than as a state bug.

### 79. `arc-icon-library` throws during upgrade on a typo — **correctness — FIXED**

**Fixed by `name: oneOf(['phosphor', 'lucide'])`**, and the component joined
`DeclaredPropsMixin` to make it real — it was the one component in the library
with no declared contract at all, which is why it had no derived coverage
either. It has both now.

One ordering detail worth keeping: the mixin normalises in `hostUpdate`, which
runs *after* `connectedCallback` — so the connect-time `use()` call reads a
`_resolvedName` getter rather than the raw property. A declaration alone would
still have thrown on the very call the finding is about.

The one component with no declared contract is also the one whose untested path
throws. `name` is a bare `{ type: String }`; `iconRegistry.use()` throws on
anything that is not `'phosphor'` or `'lucide'`; and the call sits in
`connectedCallback`. So `<arc-icon-library name="feather">` raises during
element upgrade, where a custom-element reaction's exception is **reported
globally rather than propagated** — nothing at the call site can catch it, and
the element is left with its connect abandoned partway through.

`name: oneOf(['phosphor', 'lucide'])` normalises the unknown value to the
default, which is what every other enum in the library already does. This is the
inverse of #70's family: not a constraint enforced in the wrong place, but a
constraint that never reached the declaration at all.

### The pattern, stated once

**#76, #78 and #79 are one defect wearing three hats: a numeric or enumerated
prop with no declared bound.** Each was found the same way — set the prop past
its documented range and look at what the component does with it — and each is
fixed by moving the constraint into the declaration rather than by adding a
guard. That is V4-PLAN 2.3's whole thesis, and it now has three more instances
to point at.

**All three fixed together with #47, in one pass, 2026-08-15** — and the batch
sharpened the thesis rather than merely confirming it. Three things it taught
that the individual write-ups did not:

- **A bound that names another prop has to be declared bottom-up.** `current`
  could not name `total` as its `max` until `total` had its own floor, or
  `total="0"` would have clamped `current` below its documented range. A
  declared bound is only as sound as the thing it points at.
- **Fix the value both guards read, not either guard.** #78's two conditions
  disagreed; editing one to match the other would have left the pair free to
  drift again. Neither guard changed and they now agree by construction.
- **The constraint has to be reachable at the moment it is needed.**
  `arc-icon-library` throws from `connectedCallback`, and the mixin normalises
  in `hostUpdate` — *after* connect. The declaration alone would still have
  thrown on exactly the call the finding is about; it needed a resolved-value
  getter beside it.

And #70's own trap held for the fourth time: `arc-image-cropper` and
`arc-icon-library` were both off `DeclaredPropsMixin`, so the declarations would
have been inert. **Check the class extends the mixin whenever adding a
declaration to a component that had none.**

### Two traps this batch re-taught

- **An assertion can trip over the bug it is testing.** The first draft of the
  `arc-label` test located the target with `querySelector('#2fa-code')` — the
  exact call that throws — so the test failed for its own reason rather than the
  component's. It now uses `getElementById`.
- **A runner's uncaught handler wins over a test's.** Reproducing #79 through
  markup fails the file no matter what the test asserts: mocha registers its
  global error listener before any listener a test can add, so it claims the
  reaction's error first. Invoking `connectedCallback()` directly is the same
  code path with a catchable stack.

---

## The wrapper runtime harness — six packages, four findings

**Nothing in this repo had ever mounted a wrapper.** Every wrapper check was
static: `wrapper-slots.js` reads generated source, `smoke-test-wrappers.js`
proves a packed tarball *builds* inside a real consumer, and the component suite
tests the custom element the wrappers wrap. All three were green while one
published package registered no custom elements at all.

V4-PLAN 2.4a costed this as six framework test toolchains (none exists anywhere
in the monorepo) plus ~300 LOC of test bodies each. That shape was rejected:
six hand-written suites drift, and a matrix whose rows assert different things
cannot be read as a matrix — the same reasoning that made the FormData sweep
derive its subjects instead of listing them. It is one harness instead
(`scripts/wrapper-runtime.js`), packing the real tarballs, scaffolding one
scratch consumer per framework, building each with that framework's real
toolchain, and running **one shared probe set** (`test/wrapper-runtime/
contract.js`) against all six. The fixture apps hold no assertions; they render
the DOM the contract describes, each in its own framework's idiom — `v-model:value`
for Vue, `bind:value` for Svelte, `[(value)]` for Angular, `onArcChange` for the
rest — because a capability a consumer cannot reach the normal way is not a
capability.

15 probes × 6 packages. 81 green, 9 pinned across three findings.

|                            | react | preact | solid | vue | svelte | angular |
|----------------------------|-------|--------|-------|-----|--------|---------|
| element defined + upgraded  | ok    | ok     | ok    | ok  | ok     | **#80** |
| props (string, array, number, camelCase, unset-default) | ok | ok | ok | ok | ok | **#80** |
| default slot, named `footer` | ok   | ok     | ok    | ok  | ok     | **#80** |
| named slots, no default slot | ok   | ok     | **#82** | ok | ok    | **#81** |
| event out + state written back | ok | ok     | ok    | ok  | ok     | ok      |

### 80. The Angular package registers no custom elements — **correctness, all 207 wrappers — FIXED**

`@arclux/arc-ui-angular` contains **zero imports of `@arclux/arc-ui`** in its
built output. Every wrapper opens

```ts
import { ArcCard } from '@arclux/arc-ui/card';
```

and then uses `ArcCard` **only in type position** (`private readonly _el: ArcCard
= inject(ElementRef).nativeElement`). TypeScript elides an import whose every
use is erased, so the side effect that calls `customElements.define` never
reaches the bundle. `grep -c '@arclux/arc-ui' dist/fesm2022/*.mjs` → `0`.

What an Angular consumer gets is an `HTMLUnknownElement`: no shadow root, no
styles, no behaviour. The docs page for Angular
(`docs/src/pages/docs/frameworks.astro:109-137`) shows exactly this usage and
never mentions importing anything else, so the documented path produces an inert
page.

The other five packages are unaffected for two different reasons, both
accidental rather than designed: React binds the class as a *value*
(`elementClass: ArcCard` in `createComponent`), and Vue/Svelte/Solid/Preact emit
a bare `import '@arclux/arc-ui/card'` with no binding to erase.

**This is why the harness probes `defined` and `upgraded` first, and why they
are their own verdicts.** On a non-upgraded element `el.padding = 'lg'` writes
an expando to a plain object and reads back `'lg'` — so *every prop probe passes
against a package that registers nothing*. Without those two probes the Angular
column would have read eleven greens and one slot failure, and the diagnosis
would have been "a slot bug".

### 81. Angular projects no content unless the component has a *default* slot — **correctness, 10 components — FIXED**

Prism emits `template: '<ng-content />'` only when the component declares a
default `@slot`. `arc-top-bar` declares four named slots and no default, so its
wrapper is `template: ''` and every child an Angular consumer writes is
discarded — the probe reports `ABSENT FROM LIGHT DOM`.

This is V4-PLAN 3.1, which is gated on exactly this runtime proof and now has
it. Two corrections to that item from the measurement:

- **A bare `<ng-content />` is sufficient for named slots too**, which confirms
  3.1's proposed rule (any declared slot ⇒ `<ng-content>`) over the
  `namedSlotOutlets: true` alternative. Angular's job is to put the children in
  the host's light DOM with their `slot` attributes intact; assignment is the
  custom element's job. `arc-card` — which *does* get an `<ng-content />` —
  places both its default and its `footer` child correctly, once #80 is out of
  the way.
- 3.1's list of 10 is right, but `arc-virtual-list` is an **eleventh, different**
  case and must not be swept in with them. Its slots are dynamic
  (`item-${index}`) and React's wrapper is hand-written around a `renderItem`
  API; a catch-all outlet is not the fix there.

### 82. The Solid package has the same defect as Angular, in the same 10 components — **correctness — FIXED**

Not mentioned anywhere in V4-PLAN, which treats the projection bug as
Angular-only. `Solid`'s emitter has the identical rule and the identical gap:

```tsx
export const TopBar: Component<TopBarProps> = (props) => {
  const [local, rest] = splitProps(props, ['heading', /* … */]);
  return <arc-top-bar heading={local.heading} /* … */ {...rest}></arc-top-bar>;
};
```

No `children` in `TopBarProps`, no `{local.children}` in the body, and Solid's
spread does not insert children the way Preact's `h(tag, props)` does — which is
the only reason Preact survives the same generated shape. `Card`, which has a
default slot, gets both.

**The fix for #81 and #82 is one rule applied to two emitters**, and #82 says
the 3.1 change cannot be Angular-only.

### 83. 18 published subpaths in two packages resolve to files no build produces — **packaging**

Found by the harness's own `pnpm pack`: once anything builds, `export-map.js`
stops skipping `./dist/...` and immediately names them. Every tier barrel
(`./content`, `./data`, `./input`, `./layout`, `./navigation`, `./feedback`,
`./typography`, `./shared`) in both `@arclux/arc-ui-vue` and
`@arclux/arc-ui-solid`, plus `./CodeBlock` in each.

Both build with Vite `lib` + `preserveModules` from the single entry
`src/index.ts`, and `preserveModules` preserves only what the entry graph
*reaches*. `src/index.ts` re-exports components directly
(`export { default as Card } from './content/Card.vue'`), never through the tier
barrels — so `src/content/index.ts` and its seven siblings were compiled by
nothing. `./CodeBlock` went the same way for the opposite reason: it is
`barrelExclude`d so the root barrel never imports it (shiki is 13.6 MB), which
also meant nothing did — and that subpath is the *only* documented way to reach
it.

Fixed by deriving the build entries from the package's own `exports` map
(`scripts/lib/wrapper-entries.js`) rather than listing them, so the build and
the export map are the same statement. A subpath with no source behind it now
throws at build time, naming itself.

**The check was right and nobody was running it in a tree where it could speak.**
`export-map.js` skips unbuilt `./dist/...` targets — correct for a source
checkout, and it meant that half of the export map was verified nowhere, because
`pnpm check` runs in `verify`, which never builds the wrappers. It now also runs
in `wrapper-builds`, after the build. Against a fully built tree it verifies
3,012 targets across 8 packages.

### 84. The declared-props migration stripped `type` and `reflects` from the manifest — **regression, caught before push**

`custom-elements.json` is generated by an analyzer that reads `static
properties` **statically**. A vocabulary declaration is a *function call*
(`nowrap: flag(false)`), which it cannot evaluate — so the migration silently
dropped metadata for every migrated prop. Phase 0 found and patched one third of
this (588 lost `default` entries, backfilled in `scripts/generate/manifest.js`)
and missed the rest: **34 members and 50 attributes lost `type.text`, and 359
members lost `reflects`.**

Nothing in the repo could see it. `pnpm generate` is diff-clean because the
manifest is generated; `pnpm check` reads the manifest and therefore agrees with
whatever it says; the derived suites derive from it too. The one thing that
noticed was `ng-packagr`: `types/index.d.ts` degraded `nowrap: boolean` to
`nowrap: unknown` while the Angular wrapper's generated getter still returned
`boolean`, and **the Angular package stopped compiling** — which is how the
wrapper runtime harness found it, being unable to pack a tarball that will not
build.

The fix extends the existing backfill to carry `type` and `reflects` alongside
`default`, from the same parse. Two things it had to learn:

- `reflects` is a **member-only** key. The analyzer never writes it on the
  attribute entry, and writing it in both places adds 359 keys no
  pre-vocabulary manifest ever had.
- A **mixin's** declarations appear in none of its consumers' sources.
  `required` and `readonly` are declared once in `FormControlMixin` and
  inherited by 27 controls — 76 of the 84 remaining gaps after the first pass.

Verified by diffing every public field and attribute against the
pre-vocabulary manifest: **0 lost types, 0 lost `reflects`, 0 lost defaults.**
The residue is 14 types *widened* by Phase 0's deliberate JSDoc corrections
(`status: '' | 'online' | …`, where `''` is the real default and the old union
omitted it) and 4 props that genuinely reflect now because `oneOf`/`flag` reflect
by default (`arc-time-picker.step`, `.format`, `arc-calendar.firstDayOfWeek`,
`arc-confirm.open`).

### How #80–#82 were fixed — `@arclux/prism` 2.13.0

All three were emitter defects, so none was fixable from this repo. Prism 2.13.0
fixes them and the wrappers here are regenerated from it.

**#80** — every Angular wrapper now emits the side-effect import next to the
type-only one:

```ts
import '@arclux/arc-ui/card';
import type { ArcCard } from '@arclux/arc-ui/card';
```

The bare import is what survives type erasure, and it is the line that carries
`customElements.define`. `arc-virtual-list` is hand-authored in each package
rather than generated — its slots are dynamic (`item-${index}`) — so the Angular
one needed the same two lines written by hand.

**#81/#82** — the rule is now "any declared slot means the wrapper forwards
children", replacing "only a default slot does". Angular emits
`template: `<ng-content />``; Solid takes `children` through `splitProps` and
renders `{local.children}`. The single bare `<ng-content />` was confirmed
sufficient for named slots, so `namedSlotOutlets: true` stayed rejected.

React and Preact were already correct at runtime; their exported `*Props`
interfaces gained the `children` they had always accepted, which closes a
type/runtime disagreement nobody had noticed.

**The harness is now 6 packages × 15 probes with `PINNED` empty.** It held nine
entries for less than a day. That is the ratchet doing its job: a pinned probe
that starts passing fails the run, so a fix upstream cannot be shipped and
forgotten, and the pin cannot outlive the defect.

### One trap the fix created, and the guard for it

`pnpm generate` rewrites all 235 wrapper files from whatever prism is installed.
An older prism therefore does not fail — **it reverts.** Regenerating on 2.12.0
undoes 205 Angular, 10 React, 10 Preact and 10 Solid files, and the only signal
is a large unexplained diff in generated files nobody reads. Measured, not
assumed: it was run once on purpose to see exactly what came back.

CI would have caught it, but as *"generated files are out of date"* — which
reads as stale committed output and invites the precise wrong fix, committing
the revert. `scripts/checks/prism-version.js` now asserts a version floor as the
first step of `pnpm generate`, before the prism step it guards, and names the
real cause.

### What this batch establishes

**A wrapper that compiles is not a wrapper that works.** Every one of #80–#83
survives `tsc`, `ng-packagr --strictTemplates`, a production Vite build, and a
scratch consumer that imports the package and renders a component. Four of the
six checks this repo already had are static readers of generated source, and the
fifth builds without mounting. The capability gap was invisible to all of them.

**And the pins are a ratchet, not a suppression.** A pinned probe that starts
*passing* fails the run as loudly as an unpinned one that fails, so #80–#82
cannot be quietly fixed-and-forgotten upstream, and cannot regress further
without a name. That is what lets the harness enter CI at all: a permanently red
job stops being read.

---

## The dismissal contract — 24 subjects, two findings

Escape was asserted in 22 test files and centrally in none. That is not 22
redundant tests; it is 22 *different* tests, which is why the library has four
answers to "what closes an overlay" and no statement of what the answer should
be: `OverlayMixin` handles Escape for five components, `DismissController`
handles pointer and focus for eleven, six hand-roll a keydown listener, and
three have no dismissal mechanism at all.

`dismissal-contract.test.js` states it once, for every component with a public
`open` member. The population comes from the manifest (24), the close event each
one must fire comes from its own `@fires`, and — the part worth copying — **the
dismissal affordances each one must honour come from its own documented
description.** A component whose `@prop open` says "closes on Escape" is
asserted to close on Escape, and nobody typed that expectation into the test.

That rule is deliberately one-way. Documentation is trustworthy when it *claims*
a capability and not when it omits one: `arc-modal` closes on Escape and its
`open` description never mentions it. So a claim is a test, an omission is not a
licence, and the omitted cases live in a hand-written `POLICY` table whose
*completeness* is derived — a subject with no row fails the coverage guard
instead of being silently skipped. Same shape as `scripts/checks/scope-coverage.js`.

### The probe was wrong before the components were

26 assertions failed on the first run. **Fifteen of them were the harness, not
the library**, and that ratio is the main methodological lesson here — a central
sweep replaces per-component gestures with one gesture, and one gesture is
exactly what a heterogeneous population does not have.

- **Escape has an origin.** Dispatching on `document` — the obvious first
  draft — reaches only the five components whose handler `OverlayMixin` put on
  `document`, and misses every component that binds `@keydown` inside its own
  template. A real Escape starts at the focused node and bubbles through all of
  them. Fixing the origin fixed eleven failures at once. A subtlety inside the
  subtlety: several of these are focusable *hosts*, so `el.focus()` leaves the
  host active, and dispatching there still misses a listener on a descendant.
- **"Outside" is two geometries.** An anchored panel is dismissed by a
  pointerdown elsewhere in the document. A backdrop overlay covers the viewport,
  so there is no "elsewhere" — the gesture is a click on its own backdrop, and a
  document pointerdown is not something a user can perform on it at all. Which
  applies is derived from whether the open component renders a backdrop, and the
  search for one has to cross shadow boundaries: `arc-confirm` and `arc-dialog`
  wrap `arc-modal`, so their backdrop is two roots down.
- **An empty fixture is not an open panel.** `arc-search` arms its
  `DismissController` only when it has suggestions to show (search.js:230), so
  dismissing an empty one proves nothing.

The three real findings survived that filtering. The discipline that mattered
was refusing to relax an expectation until the probe had been proven right —
every one of the fifteen would have been a plausible-looking "known limitation".

### 85. An empty `arc-context-menu` cannot be dismissed by the keyboard — **correctness**

`_handleKeydown` opens with a guard belonging to the arrow-key cases below it:

```js
const selectable = this._selectableItems;
if (selectable.length === 0) return;   // ArrowDown/Up/Home/End index into this
```

Escape needs none of that and is blocked by it anyway. A context menu with no
items still renders a full-viewport backdrop, so it is dismissible by mouse (the
backdrop's own click handler is independent) and not by keyboard.

Narrower than it first looked, and the boundary is worth stating because it
inverts the obvious guess: **disabled items still count as selectable**, so the
common "every command is disabled in this context" menu is fine. The reachable
case is a menu whose items have not arrived yet. Pinned with both halves of the
boundary asserted, so a future "fix" that narrows `_selectableItems` to enabled
items reintroduces the bug for the most common context-menu state there is.

The fix is to move the `Escape` case above the guard. This is the same shape as
#78 — two conditions on one value that disagree — and of the family in #1, #14,
#47, #58, #59: a constraint enforced where it is convenient rather than where it
belongs.

### 86. Three overlays have no keyboard dismissal at all — **a11y — PINNED, not fixed**

`arc-guided-tour`, `arc-notification-panel` and `arc-speed-dial` contain no
keydown handling of any kind. They open, and Escape does nothing.

- `arc-notification-panel` has a `DismissController`, so pointer and focus
  dismissal work; only the keyboard is missing.
- `arc-speed-dial` has **nothing** — no controller, no backdrop, no key
  handling. Once open, the only way to close it is clicking the trigger again.
  Pinned on both axes.
- `arc-guided-tour` renders a backdrop over the page with no way to leave it
  from the keyboard.

None of the three traps focus, so this is not a keyboard trap — you can Tab
away. It is still three overlays a keyboard user cannot dismiss.

Pinned rather than fixed because the fix is three components' dismissal
behaviour, and V4-PLAN 4.4 converges all of them onto `OverlayMixin` — which
supplies Escape for free and is where this should land, rather than three more
hand-rolled listeners. The pins assert the broken behaviour and name the
finding, so they flip the moment 4.4 touches them.

### `open-parity-sweep`'s hand list, converted

HANDOFF's table flagged `CASES` as "at risk". It was: the sweep exists because
one shape came back four times, and it was guarding **5 of the 24 components
that can open**, with nothing recording which 24 — so nothing could notice the
other 19.

The population is now derived, and every openable component must appear either
as a case or as an exemption *with a reason*. The cases themselves still cannot
be derived — panel and trigger selectors are per-component facts — but their
completeness now is, and a new component that opens fails the suite until
someone decides which it is.

**Five cases became ten.** The additions are exactly the components that render
their own trigger and were simply never listed: `arc-dropdown-menu`,
`arc-popover`, `arc-hotspot`, `arc-notification-panel`, `arc-speed-dial`. All
five pass, so #59's shape has not spread — which is worth recording as a
measured negative rather than an assumption. The remaining fourteen are exempt
for a stated reason: eight have no trigger of their own, `arc-context-menu`
opens from a `contextmenu` event on a separate target, `arc-search` opens on
typing, two are disclosures whose heading click is the only path there is, and
two are layout affordances driven by hover or selection.
