# Prism feedback from arc-ui — v4 Phase 4.1 / 4.2

Reporter: `arc-ui` @ `@arclux/prism` **2.13.0**. Two new bugs, both in barrel
maintenance, both found by the same piece of work: a catalog change that added
15 tags to `barrelExclude` and deleted 5 components.

Neither ships a broken package — arc-ui's own checks caught both — but one is
silent inside prism and the other reports as somebody else's error. Ordered by
how hard they are to notice.

> **Status: both fixed in 2.13.1**, same day, and verified here against the
> reproductions below rather than from the changelog. Wrapping every export
> block across lines and reinjecting an excluded name: prism removes it, reports
> the removal, and preserves the wrapping. Deleting a component and running
> generate once: wrapper-types passes and all seven barrels are clean. A full
> regenerate on 2.13.1 is byte-identical to 2.13.0. §3 and §4 below are still
> open. Thank you — the layout-preserving rewrite was more than we asked for and
> is the part that keeps a prune out of a consumer's diff.

---

## 1. `barrelExclude` cannot remove a name from a multi-line barrel — **silent**

**Severity: high.** Nothing in prism reports it; the config entry simply has no
effect.

### What happens

`pruneBarrels` → `repairBarrel` (`src/generators/barrel.js:383`) matches each
line against

```js
/^export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"](\.[^'"]*)['"];?\s*$/
```

An export statement written across several lines — what any formatter produces
once a barrel passes its print width — matches nothing and is copied through
untouched. `updateRootBarrel`'s root-merge pattern (`barrel.js:174`) has the
same single-line constraint.

### Why it is silent

`barrelExclude` is enforced at two points and only one of them can remove:

- a gate on the append (`src/cli.js:390`) — stops a new excluded component from
  entering a barrel;
- `pruneBarrels` — the only path that takes out a name already there.

So the bug is invisible for as long as every excluded component was excluded
*before* it was first generated. That was true for the entire life of our only
excluded component (`arc-code-block`, kept out because shiki + grammars is
13.6 MB and a bundler resolves the dynamic imports of anything in the barrel's
module graph).

### Reproduction

1. Take a project whose web-component root barrel has been prettier-formatted:

   ```js
   export {
     ArcAccordion,
     ArcCarousel,
   } from './content/index.js';
   ```

2. Add `arc-carousel` to `config.barrelExclude`.
3. Run `prism --strict --prune`.
4. `ArcCarousel` is still exported from the root barrel. No warning, exit 0.

The wrapper packages in the same run pruned correctly — their barrels are
single-line — so the failure is per-file and looks like nothing at all.

### Suggested fix

Parse the barrel by **export statement** rather than by line. Joining
continuation lines before matching would be enough; the specifier already
terminates each statement.

Failing that, a `--strict` diagnostic when a `barrelExclude` tag's name is still
present in a barrel after the prune would convert a silent no-op into a loud
one. That is the property we actually needed — we ended up writing that check
ourselves.

### Our workaround

Reformatted the barrel to one statement per line (the shape prism writes) with a
comment saying it must stay that way, plus a repo check that asserts exclusions
actually took effect in all seven packages, in both directions.

---

## 2. The barrel prune runs before the orphan sweep — **loud, self-healing**

**Severity: medium.** Fails loudly and fixes itself on a second run, so the cost
is confusion rather than a broken publish.

### What happens

`src/cli.js` calls `pruneBarrels` at `:673` and `sweepOrphans` at `:677`.

`repairBarrel` decides what to remove by **resolution** — asking the filesystem
whether a specifier still points at a file. That is the right design and the
reason it does not delete working exports. But at `:673` the orphaned wrapper
files are all still on disk, so every specifier resolves and nothing is removed.
Four lines later they are deleted, and the barrels naming them are left broken.

### Reproduction

1. Delete a component's source file.
2. Run `prism --strict --prune`.
3. Every framework wrapper package stops compiling:

   ```
   packages/react/src/index.ts(487,28): error TS2307:
     Cannot find module './feedback/GuidedTour.js' or its corresponding type declarations.
   ```

4. Run it again. The barrels are repaired. A third run is a no-op.

We deleted five components at once and all six wrapper packages broke.

### Suggested fix

Swap the two calls. `sweepOrphans` does not read barrels, and `pruneBarrels`
wants to run against the post-sweep tree — which is exactly the state its
resolution check is designed to be correct about.

### Practical impact

Deleting a component requires running generate twice, and the first run's
failure does not say so. We have documented it in our own handoff; it would be
better as a fix or, failing that, as a note in the prune docs.

---

## 3. Still open, from earlier — `propsFrom` ergonomics

Not bugs; the contract behaved as documented. Repeating them because they are
cheap and would have saved us two debugging rounds.

**A hook that under-reports is indistinguishable from a correct one.** Our first
`propsFrom` implementation dropped a prop because its entry matcher handled
`/* */` but not `//`; the second dropped the same prop because the scanner split
on a comma *inside* a comment. Both returned a well-formed array prism accepted,
and both silently removed a prop from six wrappers. 2.12.0's validation is
thorough about entries the hook *returns* — unknown type, missing name,
non-array, throws — and there is by construction nothing to validate about an
entry it never returned.

- **One line in the docs** would have caught it: "an entry your hook omits is
  indistinguishable from a prop that does not exist; prefer throwing to
  returning a partial array."
- **A cross-check is possible.** Prism knows the `@prop` tags. A hook that
  answers for a file and returns strictly fewer props than that file has
  documented `@prop` names is worth a finding even when the hook is otherwise
  valid — the same insight as `doc-prop-undeclared`, applied to hook output.

**`--report-json` is the right interface** and is how we diagnosed both. The
human report's "1 issue(s) reported above" sat 200 lines below the actual
failure, past the classification digest; the JSON gave `{ code, tag, prop, file }`
directly.

---

## 4. Still open, already on your roadmap

**Resolve properties at runtime from `Ctor.elementProperties`.** It is the fix
for the `doc-prop-undeclared` population rather than a rule change: mixin props
become visible, the findings quiet down because the bug is gone, and `readonly`
returns to 14 React wrappers at the same time. It would also remove our need for
`propsFrom` entirely — runtime resolution sees a `flag()`-built declaration as an
ordinary reactive property, since by then it is one.

Sequencing we would expect: additive in a 2.x minor, promotion of
`doc-prop-undeclared` to strict in 3.0.0 against a population near zero.

---

## What is working

Recorded because a report of only defects is a misleading one.

- `barrelExclude` itself is the right shape. Fifteen components moved onto
  subpaths across seven packages and every wrapper barrel pruned correctly.
- `--prune` deleting orphaned output rather than only reporting it is what let a
  five-component deletion be a two-command operation.
- `--strict` plus `config.acknowledge` — where a waived finding still prints and
  a stale acknowledgement is itself a failure — has held up across a large
  catalog change without accumulating dead entries.
- `config.propsFrom` continues to let our declared-props vocabulary answer for
  itself. All six wrapper packages regenerate byte-identically through it.

Full running ledger: `prism-feedback.md` at the arc-ui repo root.

---

**Superseded for planning purposes by `PRISM-3.md`** (repo root), which collects
this file's open items — §3's `propsFrom` cross-check and §4's runtime
`elementProperties` resolution — into the prism 3.0 scope alongside the work
arc-ui is doing on prism's behalf. This file stays as the record of the two
2.13.0 barrel bugs and their reproductions.
