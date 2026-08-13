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
