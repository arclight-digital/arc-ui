# Migration notes

A for-posterity record of every breaking change, one section per change, each
with what changed, why, and the mechanical fix. Commit hashes point at the full
story.

**v3 → v4 is in progress.** Its sections are collected under
[v4 breaking changes](#v4-breaking-changes) at the bottom and are written as the
work lands, not at tag time — V4-PLAN 4.11 completes and orders them, it does not
discover them.

## v2 → v3

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

**v4:**

- [Array props take arrays, not JSON strings](#array-props-take-arrays-not-json-strings)
- [Malformed array attributes fall back instead of throwing](#malformed-array-attributes-fall-back-instead-of-throwing)
- [Domain groups: marketing and media leave the default barrel](#domain-groups-marketing-and-media-leave-the-default-barrel)
- [The five cuts](#the-five-cuts)
- [Every component declares a status, and experimental leaves the barrel](#every-component-declares-a-status-and-experimental-leaves-the-barrel)

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

---

# v4 breaking changes

## Array props take arrays, not JSON strings

**Affects `arc-comparison.features` and `arc-comparison-column.values`.**

Both were declared `{ type: String }` and documented as *"JSON array of …"*, so
the property held a string and the component parsed it at the point of use. They
are declared `list()` now, which means the **property** takes a real array:

```js
// before
el.features = '["Storage","Bandwidth"]';

// after
el.features = ['Storage', 'Bandwidth'];
```

**Markup is unchanged.** `features='["Storage","Bandwidth"]'` works exactly as
before — the JSON spelling is what an attribute is *for*, and `list()` parses it.
Only the property path changed, and only for these two props.

Assigning a string now normalises to the declared default (an empty list) rather
than being parsed, so the failure is a component that renders nothing rather than
a thrown error. If you set these from script, the mechanical fix is to delete the
`JSON.stringify` you were doing — or the string literal's quotes.

The generated wrapper types moved with it: `features?: string` became
`features?: string[]` in all six packages, so TypeScript consumers get a compile
error rather than the silent empty render.

**Why:** the library had four spellings of "this prop is an array" and no term
for it. `list()` is the term. See V4-PLAN 2.2 and the `list()` docstring in
`shared/props.js` for what each dialect got wrong; the sitewide migration of the
remaining array props is 4.3, and each will be recorded here as it lands.

## Malformed array attributes fall back instead of throwing

**Affects the six `navigation/` components that took a JSON `items`/`steps`
attribute:** `arc-anchor-nav`, `arc-bottom-nav`, `arc-breadcrumb-menu`,
`arc-rail`, `arc-speed-dial`, `arc-stepper-nav`.

Each carried its own copy of a try/catch `JSON.parse` converter. They all now
use `list()`, which behaves the same on a well-formed attribute and differs in
one case they all got wrong: **removing the attribute** used to leave `null` on
the property (`JSON.parse(null)` coerces to the string `"null"`, parses fine, and
returns `null`), and now returns the declared default. Code that tested
`items === null` to mean "unset" should test `items.length === 0`.

This is a fix rather than a break for anything that iterated the value, which
previously threw on `null`.

## Domain groups: marketing and media leave the default barrel

**Affects 15 components and one shared module.** They are all still published,
still supported, still in this package and this test suite. What changed is
which import reaches them.

`@arclux/arc-ui/marketing` — `arc-carousel`, `arc-comparison`,
`arc-comparison-column`, `arc-countdown-timer`, `arc-cta-banner`,
`arc-feature-card`, `arc-gradient-text`, `arc-hotspot`, `arc-image-compare`,
`arc-image-hotspots`, `arc-marquee`, `arc-typewriter`.

`@arclux/arc-ui/media` — `arc-knob`, `arc-level-meter`, `arc-waveform`, and the
`shared/time-scale` module that the last two are built on.

```js
// before
import { ArcCarousel, ArcWaveform } from '@arclux/arc-ui';
import { createScale } from '@arclux/arc-ui/shared/time-scale';

// after
import { ArcCarousel } from '@arclux/arc-ui/marketing';
import { ArcWaveform, createScale } from '@arclux/arc-ui/media';
```

**Per-component subpaths are unchanged** — `@arclux/arc-ui/carousel` works
exactly as before, in this release and after it. If that is how you import, this
change is invisible to you. Framework wrapper consumers are in the same
position: every wrapper component has had its own subpath since v3
(`@arclux/arc-ui-react/Carousel`), and that is unaffected. Only the wrapper
*barrels* — `@arclux/arc-ui-react` and its per-tier barrels — stop carrying
these 15 names.

**HTML and CSS consumers are unaffected.** `arc-carousel.css`, the standalone
examples, and `@arclux/arc-ui/register` all still cover every component.

**Why.** The catalog was flat: 200-odd tags with no way to express "this one is
for a different kind of product". So every question about the marketing cluster
and the DAW primitives came out as *delete or exile?*, and both answers were
wrong — they are good components for a product this kit is not. A domain axis
says that precisely, and once it existed the v4 deletion list fell from about 25
tags to 5.

The practical effect is that a default `import { … } from '@arclux/arc-ui'` in
an admin dashboard no longer puts a landing-page carousel and a rotary synth
knob in the module graph. Same mechanism `arc-code-block` has used since v3.

They are subpaths of this package rather than separate packages on purpose, and
that is the part meant to last: a satellite package is where components go to
die — different version, different CI, different suite, quietly rotting. These
share all three. A subpath can also be promoted to its own package later without
moving a source file; un-splitting a published package cannot. See V4-SCOPE §1.

## The five cuts

**`arc-guided-tour`, `arc-spotlight`, `arc-speed-dial`, `arc-dock` and
`arc-event-calendar` are removed.** Their tags no longer resolve, their
subpaths (`@arclux/arc-ui/dock` and the rest) are gone from the export map, and
their wrappers are gone from all six framework packages.

Each keeps its docs page as a tombstone — `/docs/components/dock` still answers,
with the reason and the alternative — so an existing link explains itself rather
than 404ing.

This is the whole v4 deletion list. It started at roughly 25 tags and ended at
five, because most of what looked like a value problem was a grouping problem;
see [Domain groups](#domain-groups-marketing-and-media-leave-the-default-barrel)
for where the other twenty went. These five are here on their own merits.

### `arc-guided-tour` → `arc-tour` (forthcoming), or `arc-popover`

Shipped as stable while broken in the two ways that matter for a tour. A
finished tour reopened on its last step instead of the first, because nothing
reset the step index on close (`arc-change` was documented as the progress
signal, and writing `active` directly moved the tour without firing it). And the
backdrop it drew over the page had no keyboard dismissal at all — no Escape, no
key handling of any kind.

Underneath both: steps were addressed by CSS selector through
`document.querySelector`, which cannot cross a shadow boundary. A tour over a
web-component UI could not point at anything inside one, which includes every
component in this library.

**`arc-tour` (V4-PLAN 4.8) is the rebuild** — the same job on the v4 overlay
contract, taking **element references** rather than selectors, which is the fix
for shadow-DOM targeting by API design rather than by workaround. It is not
shipped yet; the tombstone says so and will be updated when it lands. For a
single anchored explanation rather than a sequence, `arc-popover` is what you
want and always was.

### `arc-spotlight` → `arc-tour` (forthcoming)

Half of a tour with no tour around it, and it addressed its target by selector
for the same reason and with the same consequence. `arc-tour` absorbs it: a
one-step tour is a spotlight.

`DismissController`'s `boundary` option was built for this component — it is what
lets an overlay treat a *separate* element as "inside" so a click on the
highlighted target does not dismiss it. The option stays, with no consumer, for
`arc-tour` to pick up; it is pinned directly by `dismiss-controller.test.js`
rather than through a component.

### `arc-speed-dial` → `arc-dropdown-menu`, or `arc-float-bar`

Three defects, all in the first thing a consumer would touch:

- **Closed actions stayed focusable and clickable.** The closed state was
  `opacity: 0` and a transform, so the buttons were invisible and still in the
  tab order — a keyboard user could activate a control they could not see.
- **An unrecognised `position` anchored it nowhere.** The CSS keyed on
  `bottom-right` and `bottom-left` with no fallback rule, so any other value
  left `position: absolute` with no offsets and the fan landed wherever the
  containing block happened to be.
- **The documented per-item `value` was never emitted.** `arc-action` carried
  `{ index }` only, so a handler could not tell which action fired without
  keeping its own copy of the array.

On top of that it had no dismissal of any kind — no controller, no backdrop, no
key handling — so once open the only way to close it was clicking the trigger
again.

`arc-dropdown-menu` is a trigger with a set of actions and has the dismissal and
keyboard contracts the fan never had. Use `arc-float-bar` when the actions
should be visible rather than behind a trigger.

### `arc-dock` → `arc-drawer`, or `arc-toolbar`

With `auto-hide` set, the reveal was a bare CSS `:hover` rule and nothing else.
No keyboard path, no touch path — on a phone or from a keyboard the panel and
everything in it were unreachable.

The API described a component that was never built. `open` was documented as
reflecting the hover-reveal state and `arc-open`/`arc-close` as firing on it, but
nothing wrote `open` on hover, so neither happened; a `_hovered` state property
was declared, assigned once in the constructor, and never read. Fixing it means
giving it a trigger, at which point it is `arc-drawer`.

Note that `auto-hide` defaulted to `false`, so a dock without it was a fixed
panel. If that is what you were using, `arc-toolbar` or a plain `position: fixed`
container is the direct replacement and you lose nothing.

### `arc-event-calendar` → `arc-calendar`, or a real scheduler

No time-of-day support of any kind. Events were whole-day blocks: no start time,
no end time, no week or day view, no overlap handling. A calendar that cannot
express "Tuesday at 2pm" cannot express an appointment.

This is a scope failure, not a bug list. The missing part is the hard part, and
building it properly is a component in its own right rather than a fix — so ARC
does not intend to ship a scheduler.

- **Date selection** — `arc-calendar` is what most reaches for a calendar
  actually wanted, and it is unaffected.
- **Per-day density over a long span** — `arc-activity-heatmap`.
- **Real scheduling** — drive a dedicated calendar library (FullCalendar,
  Schedule-X, or similar) and use ARC for everything around it. The recipe is
  the ordinary one: give the library a container, pass it your events, and let
  ARC own the surrounding chrome — `arc-toolbar` for the view switcher and
  navigation, `arc-modal` for the event editor, `arc-select` and
  `arc-date-picker` inside it, `arc-tag` for categories. ARC's tokens are CSS
  custom properties, so the embedded calendar can be themed from the same
  variables the rest of the page uses.

## Every component declares a status, and experimental leaves the barrel

**Two changes, and only the second can break anything today.**

`@status` is now a required annotation on all 202 components — `stable`, `beta`
or `experimental`, with no default. It rides `custom-elements.json` with the
rest of the derived API surface, so editors, the docs and any tool reading the
manifest can see maturity for every component rather than for the fourteen that
happened to have it written on their docs page.

**`experimental` components are absent from the default barrel.** They are
published and reachable by their own subpath — `@arclux/arc-ui/tree-grid` — and
absent from `import { … } from '@arclux/arc-ui'` and from every framework
package's barrel. Nothing is experimental as of v4.0.0, so this breaks nothing
right now; it is here early on purpose. Everything V4-PLAN 4.8 adds ships
experimental, and gating at the point a component is born means no addition
ever enters the barrel only to be removed from it inside one major — removing a
barrel entry is a breaking change even when the component was never meant to be
there.

**`beta` deliberately does not gate.** Beta says the API may still move, not
that the component should be hard to find; a beta nobody can import is a beta
nobody evaluates. Ten components are beta in v4.0.0 — `arc-chart`,
`arc-data-grid`, `arc-date-range-picker`, `arc-image-cropper`, `arc-kanban`,
`arc-menubar`, `arc-password-input`, `arc-qr-code`, `arc-tag-input`,
`arc-transfer-list` — and all ten are in the barrel exactly as before.

If you consume the manifest, note that every custom element now carries
`status` and `group`. `status` is always present; `group` is `null` for the app
catalog.
