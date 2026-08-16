# Feedback for `@arclux/prism`

## Status against 2.12.0 — both original items resolved

The two issues reported from `arc-ui` against 2.11.1 are closed:

- **`config.propsFrom`** lets this repo answer for its own vocabulary.
  `scripts/prism-props.js` implements it; `prism.config.js` wires it in.
  `arc-tabs`, `arc-carousel` and `arc-speed-dial` now declare with
  `flag`/`oneOf`/`int` and **all six wrapper packages regenerate
  byte-identically** to what shipped before the declaration layer.
- **The silent drop is fixed.** `unparsed-prop-declaration` and
  `doc-prop-undeclared` cover it from both directions.

Splitting strict/report-only the way 2.12.0 did was the right call, and the
first run proves both halves earned their place — see below.

Adopting it required no workaround. The interim `static contract` split arc-ui
was carrying is deleted.

---

## What the new diagnostics caught immediately

**`unparsed-prop-declaration` earned its strict status on the first run.**
`arc-knob` declares `detents` with a custom converter and no `type:` key:

```js
detents: {
  attribute: 'detents',
  converter: { fromAttribute: (v) => /* comma list, not JSON */ },
},
```

Prism could not type it, so it reached **none of the six wrappers** — despite a
full paragraph of `@prop` documentation. Nobody had noticed. Exactly the class of
silent loss the code exists for, found on a component nobody was touching.

**`doc-prop-undeclared` is reporting 22 in arc-ui**, and the shape matches the
prediction in your changelog: 16 from `FormControlMixin`, with `readonly` absent
from 14 React wrappers that document it. Confirming a detail worth keeping —
`required` *does* reach wrappers, but only because several components re-declare
it locally and shadow the mixin. So the population is genuinely mixin-visibility,
not a documentation error, and report-only is the right setting until runtime
resolution lands.

---

## New: two notes on `propsFrom` from implementing one

Both are about the hook being a new place to lose props quietly. Neither is a
bug in prism — the contract behaved as documented — but the ergonomics could
steer implementers away from the trap.

### 1. A hook that under-reports is indistinguishable from a correct one

Our first implementation dropped `arc-speed-dial`'s `direction`, because the
entry matcher handled `/* */` but not `//` and a line comment sat above that
declaration. The second dropped it again, because the scanner split on commas
*inside* a comment — the prose "…exact-match CSS selectors, so an unrecognised
position…" contains one.

Both produced a **well-formed array that prism accepted**, and both silently
removed a prop from six wrappers. The validation in 2.12.0 is thorough about
entries the hook *returns* — unknown type, missing name, non-array, throws — but
there is by construction nothing to validate about an entry it never returned.

We fixed it on our side by throwing on any unreadable entry, so prism reports
`invalid-props-from` rather than absorbing a partial answer. Two things that
might help the next implementer:

- **Say this in the `propsFrom` docs.** One line — "an entry your hook omits is
  indistinguishable from a prop that does not exist; prefer throwing to
  returning a partial array" — would have saved us both rounds.
- **Consider a cross-check.** Prism knows the `@prop` tags. When a hook answers
  for a file and returns strictly fewer props than it has documented `@prop`
  names, that is worth a finding even if the hook is otherwise valid. It is the
  same insight as `doc-prop-undeclared`, applied to hook output.

### 2. `--report-json` was how we diagnosed both

Worth recording as a success: the human report says "1 issue(s) reported above"
but the strict failure was 200 lines up, past a large classification digest.
`--report-json` gave `{ code, tag, prop, file }` directly and turned a hunt into
a lookup. It is the right interface and we would not have found `detents` as
quickly without it.

One small thing: `pnpm generate` surfaced the failure as `prism FAIL` with
prism's own summary line scrolled well off. That is our wrapper's problem, not
prism's — noting it only because the JSON report is the answer and other
consumers may not know to reach for it.

---

## Both 2.13.0 barrel defects: **fixed in 2.13.1, verified here**

Turned around the same day. Verified against the reproductions rather than
taken from the changelog, per this repo's ground rule 5:

- **Multi-line barrels.** Wrapped every export block in
  `packages/web-components/src/index.js` across lines, reinjected `ArcCarousel`
  (a `barrelExclude` entry) into one of them, ran `prism --strict --prune`. It
  removed the name, *reported* the removal — `barrel: … (removed ArcCarousel)` —
  and left the wrapping exactly as it found it, one name per line with the
  trailing comma. The layout-preserving half matters as much as the fix: a
  prune that reflowed would land in a consumer's diff as noise their next format
  undoes.
- **Deletion in one run.** Deleted `arc-marquee` and ran `pnpm generate` once.
  `check-wrapper-types` passed and all seven barrels were clean of the name.
  Previously this took two runs and the first one failed with `TS2307` across
  all six wrapper packages.

Regenerating the whole tree on 2.13.1 is byte-identical to 2.13.0, so neither
fix moved any output.

The two original reports follow, kept for the record.

## Fixed in 2.13.1 — `barrelExclude` cannot remove a name from a wrapped barrel

**`pruneBarrels` matches one line at a time.** `repairBarrel` tests each line
against

```js
/^export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"](\.[^'"]*)['"];?\s*$/
```

so an export block written across several lines — the shape any formatter
produces once a tier barrel passes a print width — matches nothing and is
copied through untouched. `updateRootBarrel`'s root-merge pattern has the same
constraint, for the same reason.

The consequence is one-directional and quiet. **Appending still works**: an
unmatched tier line simply gets a new single-line `export … from './tier/index.js';`
appended beside it, so nothing looks wrong and no diagnostic fires. **Removal
stops working entirely**: `barrelExclude` is enforced at two points — a gate on
the append (`cli.js:390`) and the prune — and only the prune can take out a name
that is already there.

That combination hides the bug for as long as every excluded component was
excluded *before* it was first generated, which was true here for the whole life
of `arc-code-block`. We hit it adding 15 components to `barrelExclude` at once
(a v4 catalog change that moves a marketing cluster and three DAW primitives out
of the default barrel and onto subpaths). All six wrapper packages pruned
correctly — their barrels are single-line. `packages/web-components/src/index.js`
had been pretty-printed at some point, and prism silently kept all 15 names in
it. Our own check caught it, not prism.

**Suggested fix:** parse the barrel by export statement rather than by line —
joining continuation lines before matching would be enough, since the specifier
already terminates each statement. Failing that, a `--strict` diagnostic when a
`barrelExclude` tag's name is still present in a barrel after the prune would
turn a silent no-op into a loud one; that is the property we actually needed.

**Our workaround:** the root barrel is reformatted to one statement per line —
the shape prism writes — with a comment saying why it must stay that way, and a
repo check (`scripts/checks/group-gating.js`) asserts the exclusions actually
took effect in every barrel rather than trusting that they did.

---

## Fixed in 2.13.1 — the barrel prune runs before the orphan sweep

`cli.js` calls `pruneBarrels` at :673 and `sweepOrphans` at :677. `repairBarrel`
decides what to remove by *resolution* — asking the filesystem whether a
specifier still points at a file — which is the right call and the reason it
does not delete working exports. But at :673 the orphaned wrapper files are all
still on disk, so every specifier resolves and nothing is removed. Four lines
later they are deleted, and the barrels that name them are left broken.

Deleting five components made all six wrapper packages stop compiling:

```
packages/react/src/index.ts(487,28): error TS2307:
  Cannot find module './feedback/GuidedTour.js' or its corresponding type declarations.
```

The failure is loud rather than silent, which is much better than the
`barrelExclude` case above — our `wrapper-types` check catches it immediately.
It is also self-healing: a second `prism --prune` sees the files gone and
repairs the barrels, and a third is a no-op. So the practical cost is that
**deleting a component requires running generate twice**, and the first run's
failure does not say so.

**Suggested fix:** swap the two calls. `sweepOrphans` does not read barrels, and
`pruneBarrels` wants to run against the post-sweep tree — which is exactly the
state the resolution check is designed to be correct about.

---

## Still open (unchanged, and already on your roadmap)

**Resolve properties at runtime from `Ctor.elementProperties`.** It is the fix
for the `doc-prop-undeclared` population rather than a rule change: mixin props
become visible, the 22 findings quiet down because the bug is gone, and
`readonly` returns to those 14 wrappers at the same time.

It would also remove the need for `propsFrom` in our case — runtime resolution
sees a `flag()`-built declaration as an ordinary reactive property, since by then
it is one. We are happy to keep the hook either way; it is a small file and it is
honest about what it does. But the version that needs no hook is better, and the
notes above about partial answers stop mattering entirely.

Confirming the sequencing from our side: additive in a 2.x minor, promotion of
`doc-prop-undeclared` to strict in 3.0.0, against a population near zero.

### One more reason for runtime resolution: wrapper defaults

**2026-08-16, during 4.3's array migration.** Not a bug, and not new — but the
population just grew enough to be worth quantifying.

Prism reads a prop's default from its constructor assignment. Our declared-props
vocabulary puts the default in the *declaration* and deletes the constructor
line, so prism sees no default and the generated wrapper drops it:

```svelte
- let { columns = [], rows = [], striped, density, ...rest }: Props = $props();
+ let { columns, rows, striped, density, ...rest }: Props = $props();
```

Every `flag()`, `oneOf()` and `num()` prop in the library has looked like this
since 2.2 — `variant`, `dismissible`, `density` in the line above are all
defaulted props with no visible default. Migrating 26 array props onto `list()`
added those to the same list, which is what made us look.

The behaviour is correct either way: the element seeds its own declared default,
and a wrapper passing `undefined` gets normalised. What is lost is the *reader's*
view — the Svelte wrapper no longer shows what a prop starts as, and neither do
the React prop types.

We already compensate in `scripts/generate/manifest.js`, which parses the
declaration and backfills `default` into `custom-elements.json` after prism runs.
That is 588 entries of ours reconstructing something the source states plainly.
`Ctor.elementProperties` at runtime would make both the hook and the backfill
unnecessary: by then a `list()` declaration is an ordinary reactive property with
an ordinary initial value.

No action requested — recording it so the roadmap item has one more concrete
consumer behind it.

## The Solid wrappers' `IntrinsicElements` block is inert (found in 4.6)

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

**That does nothing** under the standard Solid TypeScript setup
(`jsx: "preserve"`, `jsxImportSource: "solid-js"`). TypeScript resolves
`JSX.IntrinsicElements` through the **`solid-js/jsx-runtime`** entry, which
`export * from "./types/jsx"`. Augmenting the main `solid-js` entry declares a
second, unrelated `JSX` namespace that nothing consults — and because an
augmentation that merges into an unused namespace is not an error, there is no
diagnostic. All 201 wrappers in this repo carry the block; none of it applies.

Verified by compiling the three forms against a real fixture:

| augmented module | `<arc-activity-heatmap week-start="nope">` |
| --- | --- |
| `solid-js` (what prism emits) | compiles — tag unknown, no typing at all |
| `solid-js/jsx-runtime` | **errors, correctly** |
| `solid-js/types/jsx.js` | errors, but that path is internal |

The fix is one string: emit `declare module 'solid-js/jsx-runtime'`.

Two things worth noting for the generator's own tests. First, this is not
visible in `packages/solid`'s build — it compiles clean either way, because the
wrappers render `<arc-input>` inside a component whose props are typed
separately, and the intrinsic lookup only matters to a *consumer* writing the
tag directly. Second, an augmentation is inert in more than one way: a `files`
entry pointing outside the project root also loads nothing and reports nothing.
Neither is catchable by reading the emitted file, which is why `arc-ui` now
compiles its JSX augmentations rather than asserting them
(`scripts/checks/jsx-augmentations.js`).
