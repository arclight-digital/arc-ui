# The frame problem — why six obvious defects came in from use

**Status:** analysis complete; the batch it analyses is fixed. Written
2026-08-21 with six defects verified in source and nothing implemented. As of
2026-08-22 the arc-ui half is done and green — see `test-findings.md` #90–#99
for the batch as shipped, and §6 below for what is left of this file's own list.
The reasoning in §§1–3 is unchanged and is the reason the rest of it happened.

**Companion to** [`test-audit.md`](test-audit.md), which asked a different
question and got the right answer to it.

---

## 1. Bottom line

The audit went looking for padding — assertions that cannot fail — and reported
back: *"The suite is sound. I went looking for padding and did not find it."*
That was true then and is still true. 4,694 tests, a mutation run against the
shared core, and a VACUOUS count of four out of 712.

Then six defects arrived from someone building with the library, and every one
of them is the kind a user finds in the first hour. Not one is subtle. Not one
is caught.

So the problem is not padding. **It is frame.** A padded test asserts something
that cannot fail. A framed test asserts something real, in a situation the
consumer is never in. Padding is found by reading the assertion. Frame is only
found by reading what the assertion was *not* given the chance to see, and no
amount of staring at a passing test file reveals that.

The audit's §5 — "Five bugs a consumer would hit that the suite would not
catch" — was this same observation, arrived at by hand-picking five components
and reading their sources. It found real defects and stopped there. What it did
not do is generalize: those five, and these six, are not five plus six unrelated
misses. They are the same four frames, over and over.

---

## 2. The six

All verified in source on 2026-08-21. Numbering continues `test-findings.md`,
which ends at #89; these are proposed numbers, not yet written up there.

| # | Defect | Lands in | Frame it sits outside |
|---|---|---|---|
| 90 | `arc-top-bar` never gets `fixed` inside `arc-app-shell`, though `top-bar.js:18` documents it as automatic. Silent 128px gap. | arc-ui | composed |
| 91 | `app-shell.js:156-161` forces `::slotted(arc-sidebar) { height: auto !important }`, making `sidebar.js:71` `min-height: 100%` dead code — the divider stops at the last link. | arc-ui | composed |
| 92 | `arc-sidebar`'s `width` is declared (`:38`), defaulted to `'280px'` (`:363`), and never read. No `this.width`, no `[width]` selector. | arc-ui | promised |
| 93 | `AppShell.sidebarOpen` is one-way (`AppShell.svelte:49`) while the shell closes itself on Escape, backdrop and navigate. `SidebarSection.open` *is* `$bindable()`, so the generator can already do this — the rule keys off the prop name, not off "the component mutates this". | Prism | promised |
| 94 | Public methods are unreachable from the non-React wrappers. Svelte binds the element to a private `__el` it never exports; Vue has no `defineExpose` anywhere in the package. React is fine — `@lit/react` forwards refs. So `dismiss()`, `complete()`, `clear()` have no caller. | Prism | promised |
| 95 | `arc-dropdown-menu`'s closed panel is `position: absolute; inset-inline-start: 0; min-width: 200px` under `visibility: hidden`, which still contributes scrollable overflow. Anchored to a right-edge trigger it hangs 200px off the page. `dropdown-menu.js:172` only calls `PositionController.show()` on open, so the resting position is never corrected. Measured at 1680px viewport: `scrollWidth` 1800. | arc-ui | closed, alone, empty, self-relative |

Three more are documentation asks, not defects: `collapsed` is described as
icon-only but implemented as `width: 0` (the icon rail is `arc-rail`, a different
component); `arc-page-header` reserves margins for empty slots; `arc-inline-edit`
ignores `focus()` when `edit()` is the real entry point.

**#95's siblings are unmeasured.** `arc-popover` shares the shape exactly
(`popover.js:47-63`). `arc-toolbar`'s overflow panel is the same minus the inset.
`arc-menubar` is clean because it renders the panel only while open
(`${expanded ? this._renderMenu(...) : nothing}`) — the library already solves
this correctly one component over.

---

## 3. The four frames

### Only-one-state

The suite mounts components in the state the component is *for*. A menu is
tested open. #95 lives entirely in the closed state, which no assertion visits.

This is the one to sit with, because the file that should have caught it is
`menu-width.test.js` — twenty lines of header reasoning about `min-width`,
shrink-to-fit sizing, and why a hard 320px cap was wrong. It even carries the
comment *"Guard: an empty panel would sit at min-width and pass the width
assertions"*, so the author was actively alert to vacuous passes **in this
file**. Every assertion in it runs through a helper named `openMenubar`. The
`min-width: 200px` it so carefully defends is the exact declaration that makes
the closed panel 200px of off-page overflow.

The test is not padded. It is not lazy. It is *framed*.

### Only-alone

#90 and #91 are both compositions. `arc-top-bar` inside `arc-app-shell`;
`arc-sidebar` inside `arc-app-shell`. Two components that ship together, are
documented as composing, and visibly break when composed. Every one of the 121
test files mounts components singly or in parent-child pairs the component
itself renders. Nothing mounts a documented *composition* and asserts the
documented result.

### Only-empty

#95 needed a project row to exist. The reporter's own earlier sweep came back
clean against an empty library. Fixtures are minimal because minimal fixtures
isolate the unit — and a right-edge trigger only exists once a row is wide
enough to push one there.

### Only-relative-to-self

Nothing in the suite measures any element against the document. `scrollWidth`
appears in ten test files, all of them measuring an element against its own
container. #95 is invisible to every one of them by construction: the panel is
correct relative to its trigger and wrong relative to the page.

### A fifth, added 2026-08-22: only-the-build-the-tests-load

Not from this batch — from prism, which shipped a defect its suite could not
have caught in any form. Its CLI resolved `lit`'s production build, where
`LitElement` is minified to `i`; vitest resolved the **`development` export
condition**, where the name is intact. A prototype walk that stopped on the name
worked in every test and overshot in every real run. A fixture using the real
package would have passed just as confidently, because the two were reading
different files.

**arc-ui is not exposed to that particular shape** — the only prototype walk here
is `findAccessor` in `shared/props.js`, which looks for a named property rather
than for a class, so nothing depends on a class name or on minified layout. But
the frame is real and this suite sits inside it: `web-test-runner` serves the
development build (the "Lit is in dev mode" banner in every run is the proof),
so every assertion in the 4,722 is against a `lit` that no consumer ships. The
things that differ are exactly the things this batch was fixing — the
`change-in-update` warning of #96 is dev-only, and so is the
`class-field-shadowing` guard that `props.js` patches prototypes to avoid.
Harmless where the difference is a warning; not harmless anywhere a test asserts
on identity, name, or shape.

**The exposure here, enumerated rather than assumed.** Four packages on this
repo's runtime path publish a `development` export condition, and every one of
them is resolved to its development file by `web-test-runner`, by Vite and by
vitest — while a plain `node` import and a consumer's production build take the
`default` branch:

| package | what reads it |
| --- | --- |
| `@lit/reactive-element` | every component's base class |
| `lit-element` | the same, one layer up |
| `lit-html` | every template in the library |
| `@lit/react` | the React wrapper package's entire runtime |

`lit` itself declares no condition — it re-exports the three above, which is why
the divergence is invisible from the dependency this repo actually names. The
last row is the one worth watching: `@lit/react` is what forwards refs, so the
wrapper-runtime harness (`pnpm test:wrappers`) is exercising a build no React
consumer installs.

**The check to write, when it is worth it:** a run of the suite against the
production condition. Not instead of the dev run — the dev warnings are worth
asserting — but beside it, because "passes in dev" is not "passes".

### And underneath all four: only-what-the-code-does

#92, #93 and #94 are not layout at all. They are the docs promising a surface
the code does not have. Tests are written from the implementation, so a prop
nothing reads gets no test, because there was never a behaviour to assert. The
assertions are derived from the same source as the defect.

The number that matters: **delete `@prop width` from `arc-sidebar`, make
`AppShell` one-way on purpose, drop `min-height: 100%` from the sidebar — and
the failing-test count is zero in all three cases.**

---

## 4. Guards

Ranked by how much judgment each needs. The first four are mechanical and belong
in `scripts/checks/`, in the idiom already there.

1. **`dead-props`** (#92) — every entry in `static properties` needs a read
   somewhere other than its constructor default and its `@prop` line: a
   `this.x`, a template binding, or a `:host([x])` selector. No judgment, no
   plausible false positive, generalizes past `width`.

2. **`wrapper-methods`** (#94) — **mostly delivered by prism 3.1.0**, which
   emits a handle wherever a component has public methods and fails `--strict`
   on a missing one (`wrapper-missing-handle`). Do not rebuild it here.

   What remains is a sliver prism cannot reach and arc-ui can: **hand-authored
   wrappers**. Prism refuses to touch a file that does not carry its header —
   correctly, and its own source says so on the line that returns early: *manual
   file — not ours to judge*. So a hand-written wrapper gets no handle and no
   finding, in the same silent direction as everything else in this file. There
   is exactly one such file today (`packages/*/…/VirtualList`, whose host
   element *is* the `arc-virtual-list`, so its template renders into that
   element's light DOM). The guard worth having is one line of assertion: a
   component with public methods whose wrapper is hand-authored must still
   expose the element, and the check must name the file as ours rather than
   report it as prism's. It buys nothing today and buys something the day
   `arc-virtual-list` grows a second method and nobody remembers the wrapper is
   hand-written.

3. **`bindable-mutations`** (#93) — derive two-way from behaviour rather than
   from a name. If a component assigns to its own prop outside the constructor
   *and* fires an event about it, every wrapper must bind it.

4. **`slotted-overrides`** (#91) — `!important` inside `::slotted(arc-*)` is
   precisely the mechanism for reaching into another component and overriding
   rules it depends on. Require each to name the property and carry a reason,
   the way `type-roles` handles its `EXEMPT` map. The block in `app-shell.js`
   has four, each an unvalidated claim about another component's internals.

5. **Composition tests** (#90, #91) — the frame fix, and the one no static check
   reaches. "Automatically applied when TopBar is placed inside an AppShell" is a
   claim about two components in a relationship; `doc-claims` can validate
   `@csspart`, `@fires` and `@prop` because those are single-component surfaces,
   and cannot validate this. Roughly a dozen documented pairings across the
   library. Mount each, assert the documented behaviour.

6. **A closed-state pass** (#95) — for every component with an `open` flag,
   mount it closed inside a realistic-width container and assert
   `document.scrollingElement.scrollWidth` is unchanged. One loop over the
   overlay list, and it covers `arc-popover` and `arc-toolbar` at the same time,
   which are currently unmeasured.

Beyond the checks, two habits are worth naming because no tooling enforces them:
**fixtures should be furnished, not empty**, and **at least one assertion per
overlay should be page-relative rather than parent-relative**.

---

## 5. What this does not claim

The suite is not bad, and this is not a retraction of the audit. The mutation
run was real, the VACUOUS count of four was honest, and the assertions do work.
121 test files against 189 registered components is *not* a coverage ratio —
several files are cross-cutting sweeps covering many components at once, and
`arc-dropdown-menu`, `arc-popover` and `arc-toolbar` are each reached by three or
four of them despite having no file of their own.

That is the uncomfortable part. #95 is not in an untested component. It is in a
component covered by four test files, one of which is about the very declaration
that causes it.

---

## 6. Open

Closed since this was written, all of it on 2026-08-22:

- ~~Write #90–#95 into `test-findings.md` properly.~~ Done, as #90–#99 — the
  batch grew by the three items this file had set aside as documentation asks
  plus the `change-in-update` family, which turned out to be seven components
  from one line rather than five from a pattern.
- ~~Measure `arc-popover` and `arc-toolbar` for #95's shape.~~ Measured by
  `closed-overflow.test.js`: **arc-popover 59px, arc-hover-card 61px** of page
  overflow, both fixed. `arc-toolbar`'s panel is `inset-inline-end: 0` and so
  overflows leftward — no scrollbar in LTR, an RTL case only; fixed with the
  others rather than left as a known-quiet instance. `arc-navigation-menu`
  measured clean.
- ~~#95's fix is not free — decide which route.~~ `display: none` plus
  `transition-behavior: allow-discrete` and `@starting-style`, keeping both
  transitions. The deciding argument was not the transition: it is that
  `shared/position-styles.js` has carried exactly this pairing for the *managed*
  panels since they moved to the top layer, for exactly this reason. The resting
  rules were the half that never got it, and matching them to their own
  stylesheet's other half beats introducing a second policy.
- ~~Decide what lands in arc-ui and what goes to Prism.~~ #93 and #94 are
  PRISM-3 §2.4 and §2.5, sent to that repo. #94 has an arc-ui half — arc-toast's
  document route, now complete — which is a better contract on its own terms and
  explicitly not the general answer.

Still open, and now the whole of what this file is asking for:

- **The four unbuilt guards from §4**, in value order: `dead-props`,
  `wrapper-methods` (now only its hand-authored-wrapper sliver — prism 3.1.0
  took the rest), `bindable-mutations` (**taken by prism 3.1.0**, keyed off
  behaviour exactly as proposed), `slotted-overrides`. The two that
  needed judgment — composition tests and a closed-state pass — are built, which
  is the reverse of the order they were ranked in, because they were the two the
  batch could be written against directly.
- **The habits nothing enforces**, restated because they are the actual lesson:
  fixtures should be furnished rather than empty, and at least one assertion per
  overlay should be page-relative rather than parent-relative.
