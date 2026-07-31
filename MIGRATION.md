# v2 → v3 migration notes

A for-posterity record of every breaking change on the v3 line, one section per
change, each with what changed, why, and the mechanical fix. Commit hashes point
at the full story.

- [Event contract](#event-contract)
- [arc-input for edits, arc-change for commits](#arc-input-for-edits-arc-change-for-commits)
- [Form-control contract](#form-control-contract)
- [arc-form delegates to its controls](#arc-form-delegates-to-its-controls)
- [arc-toast-manager folded into arc-toast](#arc-toast-manager-folded-into-arc-toast)
- [Virtual list: renderItem and windowed rows](#virtual-list-renderitem-and-windowed-rows)
- [Motion tokens: real curves, one reduced-motion guard](#motion-tokens-real-curves-one-reduced-motion-guard)
- [Shared layers: top-layer positioning, listbox, tokens, RTL](#shared-layers-top-layer-positioning-listbox-tokens-rtl)
- [shiki optional, code-block opt-in](#shiki-optional-code-block-opt-in)
- [Wrapper prop renames](#wrapper-prop-renames)
- [65 wrappers stop accepting children](#65-wrappers-stop-accepting-children)
- [Wrapper build outputs and subpaths](#wrapper-build-outputs-and-subpaths)
- [Peer-dependency ranges](#peer-dependency-ranges)

## Event contract

`4c41ff1`

**What changed.** User-initiated closes (Escape, backdrop, close button, outside
click) now fire a cancelable `arc-close` *before* closing and honor
`preventDefault()`, across the 14 dismissible overlays; the 8 components that
emitted `arc-dismiss` emit `arc-close` instead. The four selection events
(`arc-item-select`, `arc-row-select`, `arc-select-all`, `arc-selection-change`)
collapse into one `arc-select` with the selection in `detail.value`, and every
`arc-change` gains a canonical `detail.value` alongside its component-specific
keys. Calendar's month navigation is now `arc-month-change` (it previously
impersonated the router's `arc-navigate`), and navigation-menu dispatches from
its host instead of `document`.

**Why.** Five names for "something was selected" and a close you could not veto
meant every consumer learned a per-component dialect.

**Fix.** Rename listeners: `arc-dismiss` → `arc-close`, any of the four
selection names → `arc-select`. Read `detail.value` in generic handlers. If you
must keep an overlay open, `preventDefault()` the `arc-close`. Calendar month
listeners move to `arc-month-change`. `check-event-conventions` bans the retired
names, so grep will not miss one.

## arc-input for edits, arc-change for commits

`37039aa`

**What changed.** The last four controls that fired `arc-change` per keystroke
or per pointermove now split the two events. `arc-number-input`: typing emits
`arc-input` alone, blur/Enter commits `arc-change`; a stepper click or arrow key
emits both. `arc-otp-input` and `arc-pin-input`: `arc-input` per character,
`arc-change` once the code is complete (`arc-complete` stays on pin-input).
`arc-color-picker`: `arc-input` on every drag frame, `arc-change` on release;
preset clicks and typed hex emit both.

**Why.** `arc-change` is the committed-value name everywhere else in the
library; expensive work on it ran per character, and code inputs submitted every
incomplete prefix.

**Fix.** Listeners that wanted every edit move to `arc-input`; leave the
expensive work on `arc-change`.

## Form-control contract

`ac5760e`

**What changed.** FormControlMixin gives all 21 consumers `required` and
`readonly` and wires constraint validation — `required` + empty sets
`valueMissing`, so `checkValidity()` stops returning true unconditionally.
Programmatic value changes now sync to the form. Renames in the same pass:
`compact` becomes `density="compact"` on alert, footer, and table (pagination
keeps `compact`); `danger` becomes `error` on tag, callout, dialog, and confirm,
and the `note`/`danger` status aliases are retired; `_open` becomes public
reflected `open` on date-picker, time-picker, search, and date-range-picker;
`name` reflects on every control and date-picker's `value` reflects.

**Why.** 19 controls never called `setValidity`, and the leftover v2 names
(`danger`, `compact`, `_open`) were one-off dialects.

**Fix.** Replace `variant="danger"` with `variant="error"`, `compact` with
`density="compact"` on the three renamed components, and any `_open` poking with
the public `open` prop. Controls marked `required` now actually fail validation
when empty — remove any hand-rolled required checks.

## arc-form delegates to its controls

`806a898`

**What changed.** Control discovery no longer skips elements with shadow roots
(controls nested in fieldsets or layout components are now found), validation
calls each control's `checkValidity()` instead of re-deriving `required` with a
string trim, and `reset()` delegates to `formResetCallback` — restoring initial
state instead of blanking every control.

**Why.** Three parallel re-implementations of what the controls already knew,
each wrong in its own way (nested controls invisible, empty date ranges passing
validation, reset erasing defaults).

**Fix.** A form whose markup carries default values now resets to those
defaults; clear controls explicitly if a blank form was intended. Consumer-set
error messages survive submits — only messages the form wrote are cleared.

## arc-toast-manager folded into arc-toast

`a6f933e`

**What changed.** `arc-toast-manager` is removed. `arc-toast` absorbs
`max-visible`, `dedupe`, `queue-limit`, the `arc-queue-change` /
`arc-queue-overflow` events, and the document-level `arc-toast` event channel.

**Why.** Queueing belongs in the component that owns the render state; as a
separate layer the manager had to dismiss-and-reshow a visible toast just to
update its "(×N)" counter.

**Fix.** Delete the manager element, set the queue props on `arc-toast`
directly. `maxVisible` now defaults to 3 — set `max-visible="0"` to keep
unbounded stacking.

## Virtual list: renderItem and windowed rows

`ddda870`, `e8aaf58`

**What changed.** `arc-virtual-list` actually windows now. Rows come from either
`renderItem(item, index)` (only visible rows are mounted) or windowed `item-N`
slots for just the visible range, announced via `arc-range-change`
(`{value: {start, end}, start, end}`, fired only when the range changes).
`scrollToIndex()` added; `visibleRange.end` is exclusive. The six framework
wrappers are hand-authored and render the window in their own idiom — a
`renderItem` prop in React/Preact/Solid, a `row` scoped slot in Vue, a `row`
snippet in Svelte, a `rowTemplate` in Angular — and no longer accept arbitrary
children. Angular gains `@angular/common` as a peer.

**Why.** v2 built all N rows in the light DOM and hid all but a dozen — the
scroll was virtual, the cost was not.

**Fix.** Supply `items` + `renderItem` (or the framework equivalent) instead of
N children. Hand-slotted `item-N` children into a wrapper no longer do anything.

## Motion tokens: real curves, one reduced-motion guard

`7ebb495`

**What changed.** Duration and curve are separate scales composed into the
`--transition-*` shorthands: `--duration-fast/base/slow/enter/exit` (120/200/
400/500/300ms) and `--ease-standard/out/in/spring`. `--transition-enter` and
`--transition-exit` are new; all three legacy transitions swap the browser-
default `ease` keyword for `--ease-standard`. `--ease-out-expo` and
`--ease-in-out` survive as aliases of `--ease-out` and `--ease-standard`. The
`prefers-reduced-motion` guard moves into shared-styles.js (shortening to
0.01ms, not cancelling, so `animationend` still fires).

**Why.** 356 transition sites used the browser default while the two published
curves were referenced four times; fifteen animating components had no
reduced-motion guard at all.

**Fix.** Consumers retune motion by overriding the `--duration-*` and
`--ease-*` bases. The `--transition-*` shorthands are `var()`-compositions of
those bases (`var(--duration-base) var(--ease-standard)` and so on) — the
base tokens are forwarded past `:host` via the `:where(arc-*)` inherit block,
so a `:root` override of either scale reaches every composition.
`check-motion-tokens.js` now fails the build on bare timing keywords and
literal cubic-beziers.

## Shared layers: top-layer positioning, listbox, tokens, RTL

`fbe1a08`

**What changed.** Fifteen floating components position through a shared
controller and promote their panels with the native popover API, so they render
in the top layer. Listbox options are no longer focusable `<button>` elements —
virtual focus keeps DOM focus on the control. The `:host` token layer is
generated from `shared/tokens.js` (19 of 81 values had drifted; `--text-3xl`,
`--radius-xs`, and `--label-inline-size` change rendered output), and base.css
forwards 71 tokens into shadow DOM so `:root` overrides finally reach
components. 194 of 295 physical CSS declarations became logical for RTL, and
date names come from `Intl` with `locale` / `first-day-of-week` props.

**Why.** Panels were clipped by `overflow:hidden` ancestors and fought the
`--z-*` ladder; four components each hand-rolled the same broken listbox; the
`:host` token copy was maintained by hand.

**Fix.** Layouts relying on a panel being clipped by an ancestor will see it
escape — that is the feature. Keyboard interaction happens on the input or
trigger, not on option elements. A `:root` override of the forwarded tokens now
takes effect where it was silently ignored; re-check any override you thought
was a no-op.

## shiki optional, code-block opt-in

`1bea5f1`

**What changed.** `shiki` and `@shikijs/langs` move to optional peer
dependencies, and `arc-code-block` leaves every barrel and the register-
everything entry. It is reached only by `@arclux/arc-ui/code-block`.

**Why.** 13.6 MB of highlighter in every consumer's module graph for one
component most of them never render.

**Fix.** `import '@arclux/arc-ui/code-block'` where code is rendered, and
install `shiki` + `@shikijs/langs`. Missing shiki is a supported state — code
renders uncoloured, with a one-time warning saying how to fix it.

## Wrapper prop renames

`f0bf1d7`

**What changed.** Three props that shadowed DOM APIs were renamed: arc-diff
`before`/`after` → `original`/`revised`, arc-nav-item `children` → `subItems`,
arc-gradient-text `animate` → `animated`.

**Why.** A prop shadowing an HTMLElement member makes the element structurally
not an HTMLElement; `@lit/react`'s `createComponent` rejected the class, hard-
blocking compiled React output.

**Fix.** Rename the three props at call sites; behavior is unchanged.

## 65 wrappers stop accepting children

`b741064`

**What changed.** The 65 components with no slot of any kind are annotated
`@slot none`, and their wrappers no longer advertise a `children` prop in React,
Preact, Solid, Svelte, and Angular.

**Why.** `<Spinner>hello</Spinner>` type-checked while the content landed
unassigned in the light DOM and disappeared.

**Fix.** It is a type error now; the content was already discarded at runtime,
so deleting it changes nothing rendered.

## Wrapper build outputs and subpaths

`d780c03`, `9ade764`

**What changed.** All six wrappers compile real outputs — Svelte via
svelte-package, Vue via a Vite lib build with declarations, Solid with a
compiled fallback plus a `solid` condition, Angular via ng-packagr APF, React
and Preact via tsc to `dist/`. Exports maps are generated per framework with
per-component subpaths; the `'./*'` wildcard that published every internal file
as unversioned API is gone.

**Why.** Raw-TS entry points shipped for years and forced consumers to
transpile `node_modules`; nothing verified a packed tarball actually built in a
consumer until `pnpm smoke:wrappers` existed.

**Fix.** Deep imports must use the published per-component subpaths; anything
that reached into internal paths through the old wildcard needs the public
subpath instead.

## Peer-dependency ranges

`3d2d4a2`

**What changed.** `@arclux/arc-ui` moves from an exact-pinned hard dependency to
a peer of all six wrappers, and `lit` becomes a peer of the WC package.
Framework peers get real bounds (react `^18||^19`, vue `^3.3`, svelte `^5`,
solid `^1.8`, preact `^10.19`, `@angular/core >=17 <22`).
`@arclux/arc-ui-html` ships `css/` only and declares CSS side effects.

**Why.** The exact pin guaranteed dual installs and dual Lit registries on any
version skew, with `@lit/react` holding a class identity from the copy the DOM
didn't upgrade.

**Fix.** Install `@arclux/arc-ui` (and `lit`, if your package manager does not
auto-install peers) alongside a wrapper. Consumers of the HTML package that
relied on published examples fetch them from the docs site instead.
