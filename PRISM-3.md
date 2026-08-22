# Prism 3.0 — the release arc-ui v4.0 is waiting on

Reporter: `arc-ui`, against `@arclux/prism` **2.13.1**.
Target: **prism 3.0 ships alongside arc-ui v4.0.**

> **Status, 2026-08-22 — most of this has shipped.** prism **3.0.0** took §1.1,
> §1.2, §2.1, §2.2 and §2.3; **3.1.0** took §2.4 and §2.5. Four of the seven
> files in the frame table below are already deleted, which is what the
> sequencing table at the end said would happen. The per-section text is left as
> written — it is the specification each release was built against, and rewriting
> it in the past tense would lose the reason each item existed. Each landed
> section carries a status line; anything without one is still open.

**This file is read downstream as a specification, so a number asserted here
propagates.** §2.1 said "27 form controls"; prism took that figure into its own
code comments and changelog, and it was wrong — it counted files mentioning
`FormControlMixin` rather than classes applying it, and `arc-form` mentions it
while extending `DeclaredPropsMixin(LitElement)`. The real number is 26, and
`scripts/checks/angular-forms.js` had been printing it on every run the whole
time. The rule that follows: **a count in this document should come from a check
that computes it, and should name that check** — a number a check computes beats
a number a document asserts, and this one travelled into another repo before
anyone read the two side by side.

This is not a bug list. Every open bug is already in `prism-feedback.md` and
`prism-handoff.md`, and both are short. This is the other thing those files have
been accumulating without naming: **the work arc-ui does that prism should be
doing**, and the reason 3.0 is the release to move it.

## The frame

Seven files in this repo, about 1,235 lines, existed only because of prism.
**Four are gone as of prism 3.0**, each deleted by the item that replaced it:

| file | lines | what it is | now |
| --- | ---: | --- | --- |
| `scripts/generate/angular-cva.js` | 275 | **rewrites prism's output** | **deleted** — 3.0 emits accessors from `config.formAssociated` + `config.formValue` |
| `scripts/checks/wrapper-slots.js` | 231 | asserts prism forwards slots | stays (acceptance) |
| `scripts/checks/barrel-gating.js` | 222 | asserts `barrelExclude` round-trips | stays (acceptance) |
| `scripts/prism-props.js` | 205 | supplies prism a vocabulary it cannot read | **deleted** — 3.0 resolves from `Ctor.elementProperties` (§1.2) |
| `scripts/generate/wrapper-exports.js` | 126 | writes the wrapper packages' export maps | **deleted** — 3.0 writes them (§2.3) |
| `scripts/checks/prism-version.js` | 90 | stops an old prism silently reverting 235 files | stays, 115 lines |
| `scripts/checks/wrapper-types.js` | 86 | asserts the emitted types | stays (acceptance) |

Two checks joined them rather than replacing anything:
`scripts/checks/jsx-augmentations.js` (204 lines, compiles the augmentations
instead of asserting their text — §1.1's lesson) and
`scripts/checks/angular-forms.js` (120 lines, which now reads prism's own
accessors rather than guarding a script that wrote them).

Four of the seven are verification. That is the pattern worth naming: **arc-ui
has become prism's test suite.** Every fix in the ledger — the two 2.13.0 barrel
bugs, the three 2.13.0 emitter bugs, the `propsFrom` silent drop, and the Solid
defect in §1 below — was found here, by a check written here, against a catalog
of 202 components. The published prism tarball carries no tests, so from the
outside there is no other corpus exercising six generators.

That is a fine arrangement while it is deliberate and a bad one while it is
accidental. §4 is about making it deliberate.

One item, §2.1, is new and urgent in a different way: arc-ui v4.0 currently
ships a **275-line post-processor that regex-rewrites prism's emitted Angular
files**, because the row it implements is required for the v4 tag and prism has
no hook for it. That file is a bridge with a deletion trigger, not a design.

---

## 1. Breaking changes 3.0 should take

### 1.1 The Solid `IntrinsicElements` block is inert — **found 2026-08-16**

> **Landed in prism 3.0.0.** arc-ui compiles its augmentations rather than asserting them (`scripts/checks/jsx-augmentations.js`).

Every generated Solid wrapper carries:

```ts
declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'arc-input': Record<string, unknown>;
    }
  }
}
```

**It does nothing.** Under the standard Solid setup — `jsx: "preserve"`,
`jsxImportSource: "solid-js"` — TypeScript resolves `JSX.IntrinsicElements`
through the **`solid-js/jsx-runtime`** entry, which is `export * from
"./types/jsx"`. Augmenting the *main* `solid-js` entry declares a second,
unrelated `JSX` namespace that nothing consults, and because merging into an
unused namespace is not an error there is no diagnostic. All 201 wrappers in
this repo carry the block; none of it applies.

Verified by compiling the three candidate forms against a real fixture:

| augmented module | `<arc-activity-heatmap week-start="nope">` |
| --- | --- |
| `solid-js` — what prism emits | compiles: the tag is unknown, so nothing is typed |
| `solid-js/jsx-runtime` | **errors, correctly** |
| `solid-js/types/jsx.js` | errors, but that path is internal |

**Fix:** emit `declare module 'solid-js/jsx-runtime'`. One string.

**Why it is a breaking change:** the block currently types nothing, so turning
it on is the first time a Solid consumer's `<arc-*>` usage is checked. Anyone
passing a wrong enum value has been compiling clean and will stop.

Not visible in `packages/solid`'s own build, which compiles either way — the
wrappers render the tag inside a component whose props are typed separately, and
the intrinsic lookup only matters to a consumer writing the tag directly. This
is exactly the class of defect §4 is about.

### 1.2 Resolve properties from `Ctor.elementProperties` at runtime

> **Landed in prism 3.0.0.** `scripts/prism-props.js` is deleted, and with it the `propsFrom` hook and its partial-answer trap.

Already on your roadmap and already agreed in `prism-handoff.md` §4; restating
it here because 3.0 is where its strict half belongs.

Runtime resolution makes mixin props visible, returns `readonly` to the 14 React
wrappers that lost it, and removes arc-ui's need for `propsFrom` entirely — a
`flag()`-built declaration is an ordinary reactive property by the time the
class is constructed.

**Sequencing we would expect, unchanged:** additive in a 2.x minor, then
`doc-prop-undeclared` promoted to strict in 3.0 against a population near zero.
Keep `propsFrom` as an escape hatch; it is a small file and it is honest about
what it does, but the version that needs no hook is better.

---

## 2. Work arc-ui is doing that prism should do

### 2.1 Angular `ControlValueAccessor` — the big one

> **Landed in prism 3.0.0.** The 275-line post-processor is deleted; `scripts/checks/angular-forms.js` now asserts prism's own output against the elements' declarations, and reports **26** form-associated elements.

**`formControlName`, `formControl` and `ngModel` work on zero Angular
wrappers.** That is most of the reason an Angular wrapper package exists: an
Angular team reaching for a component library reaches for reactive forms in the
same breath, and `<arc-input formControlName="email">` binds nothing, reports
nothing, and fails silently — the control stays pristine and empty while the
element on screen holds the user's text.

arc-ui v4.0 ships this as a post-processing pass because 4.6 is required for the
tag. **The shape below is generated, compiles under `ng-packagr` with
`strictTemplates`, and covers 26 controls.** It is offered as a specification,
not a request to review our workaround.

#### Which components

Not "every component with a value". The precise set is **components that are
form-associated** — in arc-ui, the 26 that extend `FormControlMixin`
(`static formAssociated = true` + `attachInternals`). A general rule prism can
apply: *the element's class has `static formAssociated = true`.* That is the
platform's own definition and needs no configuration.

The count matters. arc-ui's own plan said "the 46 write-back controls", which
was the number of components emitting `arc-change` — it swept in `arc-tabs`,
`arc-theme-toggle`, `arc-waveform` and `arc-sortable-list`, none of which is a
form control.

#### The emitted shape

Additions to what prism already writes, in `packages/angular/src/input/Input.ts`:

```ts
import { Component, ElementRef, forwardRef, inject, Input as NgInput, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'arc-input',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '(arc-input)': '_onArcInput($event)',
    '(arc-change)': '_onArcChange($event)',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Input), multi: true },
  ],
})
export class Input implements ControlValueAccessor {
  private readonly _el: ArcInput = inject(ElementRef).nativeElement;

  // … the @Input accessors prism already emits …

  private _onChangeFn: (value: string) => void = () => {};
  private _onTouchedFn: () => void = () => {};

  constructor() {
    this._el.addEventListener('arc-change', () => {
      this._onChangeFn(this._el.value);
      this._onTouchedFn();
    });
  }

  writeValue(value: string | null | undefined): void {
    const next = value ?? '';
    this._el.value = next;
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._el.disabled = isDisabled;
  }
}
```

#### Five details that are not obvious, each of which cost something to find

1. **The listener goes in the constructor, not in `host`.** prism already maps
   `(arc-change)` there to the component's own `@Output`, and a host metadata
   object cannot carry two handlers for one event. Field initializers run before
   the constructor body, so `this._el` is available and `inject()` is still in
   an injection context.

2. **`writeValue` must not call `_onChangeFn`.** It is the form writing *into*
   the element; echoing it back marks the control dirty on every programmatic
   `setValue`. Easy to add "for symmetry" and wrong.

3. **The bound property is `checked`, not `value`, for two controls**
   (`arc-checkbox`, `arc-toggle`). Read it from the element rather than assuming
   — the accessor must not disagree with the `@Input` beside it.

4. **Two controls have no single value at all.** `arc-date-range-picker` binds
   `start`/`end`; `arc-range-slider` binds `low`/`high`. A `ControlValueAccessor`
   carries one value, so these need a composite:

   ```ts
   writeValue(value: { start: string; end: string } | null | undefined): void {
     const next = value ?? { start: '', end: '' };
     this._el.start = next.start;
     this._el.end = next.end;
   }
   ```

   Leaving them out would mean `formControlName` working on 24 of 26 — the kind
   of gap a consumer discovers rather than reads. A `FormGroup` with a control
   per `@Input` is the better shape for validating the two ends separately and
   works today without any of this; it just cannot be reached from `[(ngModel)]`.

5. **`@angular/forms` becomes a peer dependency** of the Angular wrapper
   package. It is first-party and present in any Angular app using forms, but it
   is a real requirement added to every consumer, and the import is a runtime
   value (`NG_VALUE_ACCESSOR`), not a type — so an optional peer would not work.
   Range matching `@angular/core`'s.

The null-coalescing default in `writeValue` follows the property's declared
type: `''` for string, `false` for boolean, `0` for number, `[]` for arrays.
Angular calls `writeValue(null)` on reset routinely.

### 2.2 The JSX type augmentations

> **Landed in prism 3.0.0.** The three-target block is out of `scripts/generate/types.js`.

prism generates six framework wrappers. It does not generate the *other* thing a
framework consumer needs: a declaration file that types the custom elements for
someone rendering `<arc-input>` directly, without a wrapper.

arc-ui hand-rolls three (`react-jsx.d.ts`, `preact-jsx.d.ts`, `solid-jsx.d.ts`)
from its own manifest in `scripts/generate/types.js`. These are per-framework
type output derived from Lit sources — prism's exact remit, and prism already
knows the per-framework attribute conventions from writing the wrappers.

**If prism takes this, take the trap with it.** The activation instruction in
arc-ui's React file was wrong for a whole release:

```jsonc
{ "compilerOptions": { "types": ["@arclux/arc-ui/react-jsx"] } }   // does nothing
/// <reference types="@arclux/arc-ui/react-jsx" />                  // does nothing
```

TypeScript resolves a `types` entry as a *package* — `node_modules/@types/<name>`
or `<name>/package.json#types` — and never follows an export-map subpath. The
name matches nothing, nothing is included, every tag stays untyped, and no
diagnostic is emitted, because a `types` entry that resolves to nothing is not an
error. Two forms that do work:

```jsonc
{ "include": ["src", "node_modules/@arclux/arc-ui/types/react-jsx.d.ts"] }
/// <reference path="./node_modules/@arclux/arc-ui/types/react-jsx.d.ts" />
```

A `files` entry pointing *outside* the consuming project is a third silent
no-op. Three ways to not apply an augmentation, none of them an error, which is
why arc-ui now **compiles** the instruction rather than asserting it
(`scripts/checks/jsx-augmentations.js`: a valid usage must compile, a bad enum
value must not).

The per-framework base attribute set is where the content is, and it is not one
shape copied three times:

- **Solid** carries `on:`, `prop:`, `attr:`, `use:` and `classList`. `on:` is
  the whole reason the native path is comfortable in Solid — it reaches
  `arc-change` from JSX with no ref.
- **Preact** must keep `on${string}` loose. Preact lowercases the part after
  `on`, so a dashed custom event name is not reachable from a plain prop at all.
  Typing it narrowly would promise what the framework cannot do — and it is
  precisely why the Preact wrapper package's `useLayoutEffect` +
  `addEventListener` is a real capability rather than boilerplate.
- **React** takes `className` and `tabIndex`; Solid takes neither.

### 2.3 Wrapper package export maps

> **Landed in prism 3.0.0.** `scripts/generate/wrapper-exports.js` is deleted.

`scripts/generate/wrapper-exports.js` (126 lines) writes the `exports` map for
each wrapper package from prism's own file tree: a subpath per component
(`@arclux/arc-ui-react/Button`), `dist/` targets for the built packages
(react, preact) and `src/` for the source-shipping ones (vue, svelte, solid,
angular).

prism knows every one of those facts — it decided the file tree and it knows
which packages compile. The map is currently derived from the output by a second
program that has to re-infer the build mode per package.

Lower priority than 2.1 and 2.2, and listed because it is the third case of the
same shape: prism produces a package and something else finishes it.

### 2.4 Two-way binding derived from behaviour, not from a prop's name

> **Landed in prism 3.1.0.** 8 props gain a binding; `arc-checkbox.value` loses one that was carrying a boolean into a string. Not yet regenerated here.

**Found 2026-08-21, from an application building on 4.0.1.**

`arc-app-shell`'s `sidebarOpen` is emitted as a one-way property on the Svelte
wrapper (`AppShell.svelte:49`), and the component owns that state as much as its
consumer does: it closes the drawer on Escape, on a backdrop click and on
navigation, announcing each with `arc-sidebar-toggle` carrying the new value. A
consumer's copy of the state therefore drifts the first time a user dismisses
the drawer by any route other than the hamburger — silently, and in the
direction that leaves a "close" button that reopens nothing.

`SidebarSection.open` **is** `$bindable()`, with a generated `arc-toggle`
handler mirroring it back, so the generator can already emit exactly what is
needed here. The rule appears to key off the prop's name rather than off what
the component does with it.

**The rule that would be right:** a prop is two-way when the component assigns
to it outside its constructor *and* fires an event carrying the new value. Both
halves are visible in the source prism already parses, and together they are
the definition of state the component shares rather than receives. Keying on
names cannot see `sidebarOpen`, and would keep needing new names — the same
shape reaches `arc-tabs`' `selected`, `arc-carousel`'s `index` and every
`open`-like prop that a dismiss path can move.

arc-ui's workaround is to mirror `arc-sidebar-toggle` by hand at each call site,
which is the shape of workaround that says the rule is wrong rather than the
component.

### 2.5 An imperative API needs a handle in every wrapper

> **Landed in prism 3.1.0**, with `wrapper-missing-handle` as a strict-failing check. Not yet regenerated here.

**Same report.** `arc-toast` is driven by methods — `show(options)` returns an
id, `dismiss(id)` takes it back, plus `updateToast()`, `complete()` and
`clear()`. The generated Svelte wrapper keeps the element in a private `__el`
and marks nothing `$bindable`, so `bind:this` on `<Toast>` yields the Svelte
component and the element is unreachable. Vue has no `defineExpose` anywhere in
the package. React is fine — `@lit/react` forwards refs — which is why this was
found in an app and not in a build.

Every capability of such a component sits on the far side of that gap, and the
manifest now carries the methods (55ce81cc), so the condition is mechanical:
**a component with public methods must expose an element handle in every
wrapper.** arc-ui has added `scripts/checks/` coverage for slots and types at
the output level; this belongs beside them, but the fix belongs in the
generator.

arc-ui has closed the arc-toast case from its own side by completing the
document-event route — `arc-toast-dismiss`, `arc-toast-update`,
`arc-toast-complete` and `arc-toast-clear` beside the `arc-toast` event that
already existed, with a caller-supplied `detail.id` so the id `show()` returns
is not the only way to name a toast. That is a better public contract
regardless, and it is not a general answer: it works because this component was
already designed to be driven from a distance. `arc-inline-edit.edit()`,
`arc-carousel.next()` and the rest are not, and should not each grow an event
bus to work around a missing handle.

---

## 3. Diagnostics

### 3.1 Stamp the generator version into generated output

`scripts/checks/prism-version.js` exists because the failure is silent and
total: `pnpm generate` rewrites all 235 wrapper files from whatever prism is
installed, so an **older prism does not error — it reverts.** Regenerating on
2.12.0 undid 205 Angular, 10 React, 10 Preact and 10 Solid files. The only
signal is a large diff in generated files nobody reads, and CI reports it as
"generated files are out of date", which reads as *stale committed output* and
invites the exact wrong fix: commit the revert.

The header prism already writes is the natural place:

```
// Auto-generated by @arclux/prism 2.13.1 — do not edit manually
```

A consumer can then diff versions rather than bytes, and a downgrade announces
itself in the first line of every file it touches.

### 3.2 A hook that under-reports is indistinguishable from a correct one

Already filed (`prism-handoff.md` §3); repeating for the 3.0 scope because the
cross-check is a behaviour change. prism knows the `@prop` tags — a `propsFrom`
hook that answers for a file and returns strictly fewer props than that file
documents is worth a finding even when its output is otherwise valid. Same
insight as `doc-prop-undeclared`, applied to hook output.

If 1.2 lands, this matters much less: there is no hook to under-report.

### 3.3 Ship a corpus, or say arc-ui is it

The published tarball has no tests. Every defect in the ledger was found by a
check in this repo, against 202 real components, and several — §1.1 above, the
Angular package registering no custom elements at all, Angular and Solid
discarding children on components whose slots are all named — are invisible to a
generator testing its own output for shape rather than for whether a consumer
can use it.

Two ways to make that deliberate rather than accidental:

- **A fixture corpus in prism** covering the shapes that broke: a component with
  only named slots, a form-associated element, an element with a dashed custom
  event, one behind `barrelExclude`, one in a multi-line barrel.
- **Or name arc-ui the acceptance suite** and run its `pnpm check` against a
  prism release candidate before publishing. It already has 33 checks and a
  browser suite that mounts all six wrapper packages. This is the cheaper of the
  two and it is what has actually been happening.

The second is fine. It just has to be a decision, because right now a prism
release is verified by whoever next runs `pnpm generate` in this repo.

---

## 4. What is working

A report of only defects is a misleading one, and most of prism is not in this
document.

- **`--prune` deleting orphaned output** rather than only reporting it is what
  let a five-component deletion be a two-command operation.
- **`--strict` plus `config.acknowledge`**, where a waived finding still prints
  and a stale acknowledgement is itself a failure, has held across a large
  catalog change without accumulating dead entries.
- **`barrelExclude` is the right shape.** Fifteen components moved onto
  subpaths across seven packages and every wrapper barrel pruned correctly.
- **`config.propsFrom`** lets a declared-props vocabulary answer for itself, and
  all six wrapper packages regenerate byte-identically through it.
- **`--report-json`** is the right interface and is how two silent hook bugs were
  diagnosed; the human report's summary line sat 200 lines below the failure.
- **The layout-preserving barrel rewrite in 2.13.1** was more than was asked for
  and is the part that keeps a prune out of a consumer's diff.

---

## Sequencing, and what arc-ui deletes

| prism lands | arc-ui v4 removes | status |
| --- | --- | --- |
| 2.1 Angular CVA | `scripts/generate/angular-cva.js` — 275 lines, and its generate step | **done, 3.0.0** |
| 2.2 JSX augmentations | the three-target block in `scripts/generate/types.js` | **done, 3.0.0** |
| 2.3 Wrapper export maps | `scripts/generate/wrapper-exports.js` — 126 lines | **done, 3.0.0** |
| 1.2 runtime `elementProperties` | `scripts/prism-props.js` — 205 lines | **done, 3.0.0** |
| 3.1 version stamping | `scripts/checks/prism-version.js` — 90 lines | open; the check stays for now |
| 2.4 behavioural two-way binding | the hand-written `arc-sidebar-toggle` mirrors at each consumer's call site | shipped 3.1.0, **not yet regenerated here** |
| 2.5 element handles on wrappers | nothing here — the cost is a consumer's, which is why it took an application to find it | shipped 3.1.0, **not yet regenerated here** |

**606 lines deleted from this repo so far**, and the two 3.1.0 items land in the
wrapper packages rather than in scripts: 8 props gain a two-way binding, one
loses a wrong one, and every component with public methods gains an element
handle in five packages.

The four checks (`wrapper-slots`, `wrapper-types`, `barrel-gating`,
`jsx-augmentations`) **stay** whatever happens. They are not workarounds; they
are the acceptance suite of §3.3, and they are how the next defect gets found.

`angular-cva.js` is the one with a real cost while it lives. It rewrites
prism's emitted text with patterns anchored on prism's exact formatting —
`import { Component, ElementRef, inject`, `}) \n export class` — so a change to
the Angular generator's layout breaks it. It fails loudly when a pattern stops
matching rather than silently emitting a wrapper with no accessor, but that is a
guard, not a design. **It should not survive prism 3.0.**
