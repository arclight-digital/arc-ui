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
- [The merges](#the-merges)
- [`size` is `sm | md | lg`, and dismissal is `dismissible`](#size-is-sm--md--lg-and-dismissal-is-dismissible)

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

## The merges

**Five components are deprecated in v4.0.0 and removed in v5.** They are
unchanged, still published, and still exported from `@arclux/arc-ui` — nothing
about them moved, and a v4 upgrade needs no action. What changed is that each
now has a survivor that can do its job, and `@arclux/arc-ui/dev` says so at the
console when it sees one.

| deprecated | use instead | what to change |
|---|---|---|
| `arc-separator` | `arc-divider` | `orientation="vertical"` → `vertical`; variants carry over unchanged |
| `arc-key-value` | `arc-description-list` | add `layout="horizontal"` to keep the old default |
| `arc-kv-pair` | `arc-description-item` | `label` → `term`; parts `key`/`value` → `term`/`detail` |
| `arc-cluster` | `arc-stack` | `direction="horizontal" wrap gap="sm" align="center"`; `justify` values `space-between`/`space-around` → `between`/`around` |
| `arc-otp-input` | `arc-pin-input` | part `otp` → `pin`; props carry over |

Deprecated components stay in the barrel on purpose. Taking them out is exactly
the break the deprecation period exists to postpone, so they are importable from
`@arclux/arc-ui` for all of v4 and only the docs treat them as gone: no card in
the catalog grid, and a notice on their page.

### The survivors gained what they were missing

Not renames. Four of the five needed the survivor to grow first, because the
merge list was drawn up from prop lists and the differences were in the styles:

- **`arc-divider` gained `line`, `dashed`, `dotted` and `fade`.** It had no
  dashed or dotted rule of any kind, and no flat one — `subtle`, its default, is
  the token *gradient*, which fades at both ends. `line` is the flat rule every
  unadorned `arc-separator` drew. All four work horizontally, vertically, and on
  both halves of a labelled divider.
- **`arc-description-list` gained `layout`.** `arc-key-value[layout=horizontal]`
  put the term beside the detail, and `arc-description-list` could only stack.
  It defaults to `stacked`, so existing description lists are unchanged — which
  is why migrating from `arc-key-value` means adding `layout="horizontal"`
  rather than nothing.
- **`arc-tag` gained `info`.** Every other status set in the library has one.
- **`arc-stack` needed nothing**, but the migration is four attributes rather
  than the two it looks like: `arc-cluster` also defaulted to `gap="sm"` and
  `align="center"`, where `arc-stack` defaults to `md` and `stretch`.

### The feedback family

Four more, on the same terms — deprecated in v4, removed in v5, unchanged and
still in the barrel until then.

| deprecated | use instead | what to change |
|---|---|---|
| `arc-callout` | `arc-alert` | `variant` carries over, `tip` included; the derived uppercase label has no equivalent — pass `heading` if you want one |
| `arc-snackbar` | `arc-toast` | `position` covers every value it had; `show({ message, action, actionLabel })` is unchanged |
| `arc-progress-toast` | `arc-toast` | pass `progress` to `show()`; `updateToast`, `complete` and the events keep their names |
| `arc-inline-message` | the control's own `error` prop | standing alone, `<arc-alert density="compact">` |

**`arc-alert` gained `tip`, an `icon` slot, and a `live` prop** — and `info`
changed behaviour, which is the one thing in this section that affects existing
`arc-alert` users who never touched `arc-callout`. See below.

**`arc-toast` gained a progress mode.** `show({ message, progress })` renders a
track, skips dedupe (two uploads of a file with the same name are two uploads),
and never auto-dismisses — a progress toast is finished by `complete(id)`, which
fires `arc-complete` rather than `arc-close`. `updateToast(id, { progress })`
moves the bar, `onCancel` renders a cancel button that fires `arc-cancel`. It
also fires `arc-action` when a toast's action button is clicked, alongside
calling the `action` callback, because a callback cannot be attached
declaratively and that is how `arc-snackbar` consumers were listening.

**`arc-inline-message` has no single replacement, on purpose.** Below a form
control, use that control's own `error` prop: every form control in the library
renders one, with its own `part="error"` and the aria wiring already done —
which is the thing a sibling element cannot do for it. Standing alone, it was an
alert in all but name.

### `arc-alert`: `info` is no longer announced

**This is a behaviour change for existing `arc-alert` users, not only for
`arc-callout`'s.** `variant="info"` used to render `role="status"`, which is a
polite live region. It now renders `role="note"`, which is not.

`arc-callout`'s default variant is `info` and it was a static `role="note"` box.
Merging the two without this correction would have upgraded every informational
callout on every page into an announcement — the exact regression the merge was
decided in order to prevent, landing on the single most common variant.

The full mapping, and it is what the component now derives:

| variant | role | announced |
|---|---|---|
| `error`, `warning` | `alert` | assertively |
| `success` | `status` | politely |
| `info`, `tip` | `note` | not at all |

**If you have an `arc-alert variant="info"` that genuinely needs announcing, set
`live`.** The new prop takes `auto` (the default, meaning the table above),
`off`, `polite` or `assertive`, and overrides in both directions — `live="off"`
on an `error` keeps `role="alert"` and stops the announcement.

It exists because severity and urgency are different questions. Severity asks
"how bad is this"; a live region asks "did this just appear", which no prop can
infer from markup. An `info` alert injected after a background save wants
`polite`; a `warning` rendered in the initial page probably wants `off`.

### Fixed on the way through: `arc-toast`'s action button

`arc-toast` documented a `part="action"` and rendered an action button when a
toast had an `actionLabel`. It never had one: `show()` has only ever stored the
payload on `entry.options`, and the render read `t.actionLabel`, so the
condition was `undefined` for every toast the component ever displayed. The
button has now appeared for the first time.

Nothing caught it because the derived CSS-parts sweep cannot: a conditional part
is exempt by construction, and it has no way to tell a part that is conditional
from one that is unreachable.

### The table family

The expensive row, and the only one where the column model itself changes.

| deprecated | use instead | what to change |
|---|---|---|
| `arc-table` | `arc-data-grid` | `columns: ['A','B']` → `[{ key:'a', label:'A' }, …]`; `rows: [['1','2']]` → `[{ a:'1', b:'2' }]` |
| `arc-data-table` | `arc-data-grid` | slotted `<arc-column>` children → a `columns` array of the same fields |
| `arc-column` | `arc-data-grid`'s `columns` | one array entry per element; there is no successor element |

```html
<!-- before -->
<arc-data-table sortable>
  <arc-column key="name" label="Name" sortable></arc-column>
  <arc-column key="role" label="Role" width="120px"></arc-column>
</arc-data-table>

<!-- after -->
<arc-data-grid></arc-data-grid>
<script>
  grid.columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', width: '120px' },
  ];
</script>
```

Sorting becomes the multi-sort `sort` array — a single entry behaves exactly as
`sort-column` plus `sort-direction` did, and `manualSort` is there for
server-side sorting. Selection, virtual scrolling and `rowHeight` are unchanged.

**`arc-data-grid` gained `density` and `striped`** from `arc-table`. `striped`
defaults **on**, because that is what this grid has always drawn and a merge is
not the place to restyle the survivor — pass `no-striped` for the plain look an
unstriped `arc-table` had.

**`arc-column` was listed as a keep in Phase 1 and is deprecated anyway.** That
verdict read it as an independent component; its only consumer is
`arc-data-table`, and `arc-data-grid` takes its columns as an array rather than
as slotted children, so there is no element for it to migrate to. It goes with
its parent.

### `overscan` is public on both tables

It was a public prop on `arc-virtual-list` and a hardcoded `5` inside
`arc-data-table` and `arc-data-grid`. All three now share one
`VirtualController` and all three expose it. Same default, so nothing changes
unless you set it — raise it to trade DOM nodes for fewer blank rows on a fling.

### Fixed on the way through: `arc-data-table` could render a blank table

Its windowing computed `visibleCount = end - start` with no floor, where the
other two implementations of the same five lines clamped at zero. `end` is
`min(total, …)` and `start` is `max(0, …)`, so any state where the row set
shrank below the current scroll offset — a filter applied, rows removed, `rows`
reassigned — inverted them. The slice that followed rendered nothing under a
full-height spacer: a table that scrolls and shows no rows.

The three copies of the arithmetic are now one, which is how this was found.

### `arc-badge` is **not** deprecated

It was on the merge list — `arc-tag` has `removable`, so `arc-tag` looked like
the superset. It is not, in the way that matters here: `arc-badge` is
`--font-mono`, normal letter-spacing and sentence case; `arc-tag` is
`--font-label`, 2px tracking, UPPERCASE, with a `min-height` of the touch
target. Merging as written would have re-set every badge on every page in an
uppercase label face — `v3.2.0` becoming `V3.2.0` in a taller box.

Resolving it means deciding whether ARC has one chip typography or two, which
is a design-language question rather than a catalog one. Both components stay
for now, and the row is reopened after the type-scale work.

## `size` is `sm | md | lg`, and dismissal is `dismissible`

The first two of v4's five API conventions. Both are small; the checks behind
them are the point, since a convention nothing enforces is a preference.

**`arc-toolbar` gains `lg` and reorders its scale.** It declared
`['md', 'sm']` — the right default, a reversed order, and no `lg` at all, so a
toolbar was the one control in the library that could not be made taller. It is
`['sm', 'md', 'lg']` now with `md` still the default, and `lg` is 60px, stepping
up from the 48px default by the same 12px that `sm` steps down.

**`arc-icon-button` and `arc-theme-toggle` reorder theirs**, from
`['xs', 'sm', 'md', 'lg']` to `['sm', 'md', 'lg', 'xs']`. `xs` is kept — the
library's own `arc-signature-pad` renders an icon button at that size — but it
now sits after the canon rather than in front of it. Both declare an explicit
`default: 'md'`, so **nothing changes at runtime**; the declaration simply reads
the way every other size does.

`arc-icon`, `arc-container`, `arc-qr-code` and `arc-resizable` keep their own
scales and are exempt with reasons: the first two are the type scale and the
layout scale respectively, and the last two are pixel dimensions that share the
word `size` and nothing else.

**`arc-modal.closable` becomes `arc-modal.dismissible`.** `closable` still works
for all of v4 as a two-way alias — set either and both move — and is removed in
v5. The `no-closable` attribute keeps working alongside `no-dismissible`.

```html
<!-- before, still works through v4 -->
<arc-modal no-closable></arc-modal>
<!-- after -->
<arc-modal no-dismissible></arc-modal>
```

**Only the spelling converges, not the default.** A modal is dismissible unless
you say otherwise; an alert is not dismissible unless you say so. Both defaults
are right for their component — an inescapable modal is the exception, an alert
with an X is the exception — so making them agree would trade a naming
inconsistency for a behavioural one, which is worse.

## Every array prop is `list()`, and every one of them has an attribute

**Affects 26 props across 19 components** — the rest of the sitewide migration
the two sections above began. Nothing here changes what a well-formed value
does; what changes is what a *malformed* one does, and what markup can reach.

### Six props gained an attribute

`arc-lightbox.images`, `arc-waveform.peaks`, `arc-terminal.lines`,
`arc-uptime.data`, `arc-activity-heatmap.data` and `arc-tree-select.items` were
declared `{ attribute: false }` and documented as property-only. Three of them
said so with a reason that was simply wrong — *"an array can't survive a round
trip through an attribute"* — which `list()` disproves: JSON is a round trip.

They all take a JSON attribute now, so a server-rendered page can set them:

```html
<arc-uptime data="[1, 0.97, 0.5]"></arc-uptime>
```

Setting them from script is unchanged. This is additive; nothing that worked
stops working.

### Twenty props stopped throwing on bad markup

The rest were `{ type: Array }`, which is Lit's stock converter — it calls
`JSON.parse` and lets it throw, from inside `attributeChangedCallback`, where a
custom-element reaction's exception is reported globally rather than propagated.
One malformed attribute and the element never rendered, with no way for the call
site to catch it. A malformed attribute now falls back to the declared default.

If you were relying on that throw to detect bad data — nobody was, since it
could not be caught — check `.length` instead.

### `arc-knob.detents` accepts both spellings

`detents="0,25,50,100"` was the library's last hand-rolled converter, kept
because a knob's detents read better as the comma list a patch file would carry
than as JSON. That spelling is now part of the vocabulary (`list({ of: Number })`)
rather than a one-off, and **both** spellings parse: `detents="0,25"` and
`detents="[0,25]"` are the same value. Non-numeric members are dropped rather
than kept as `NaN`, on the property path as well as the attribute path. The
generated wrapper type tightened from `number[] | string` to `number[]`.

### Constructor defaults are gone, and that is visible in one place

All 26 props dropped their `this.x = []` constructor line — the declaration is
the default now, and `DeclaredPropsMixin` seeds it at construction. One
consequence is worth knowing about if you read the generated Svelte wrappers:
`let { columns = [], rows = [] }` became `let { columns, rows }`, matching every
other declared prop in the library (`variant`, `dismissible` and friends have
been spelled that way since 2.2). The element still starts on `[]`.

**One real bug came out of this.** `arc-kanban.columns = 'oops'` used to throw
in `willUpdate` rather than falling back. It no longer does. The reason it could
happen at all is worth recording: Lit runs a component's own `willUpdate`
*before* a controller's `hostUpdate`, so a component that reads a declared prop
in `willUpdate` sees the raw assigned value, not the normalised one. Guard with
`Array.isArray`, not `|| []` — a string is truthy.
