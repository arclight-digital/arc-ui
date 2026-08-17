/**
 * props.js — the declared-contract vocabulary.
 *
 * The problem this solves: a component's contract currently exists four times,
 * hand-written — the JSDoc prose, the `static properties` literal, the docs
 * data, and the tests — and the four can disagree. `scripts/checks/` detects
 * some of that drift after the fact, but only ever that a thing *exists*:
 * `doc-claims.js` can verify `@prop selected` is a reactive property and cannot
 * verify "out-of-range values are clamped to the nearest valid index", which is
 * how arc-tabs shipped a `selected` that clamps nowhere.
 *
 * Here the constraint is a **value, not prose**. `int({ clamp: 'toRange' })`
 * implements the clamping rather than describing it, so the doc and the code
 * cannot disagree — there is only one of them. `oneOf()` gives every
 * unrecognised value a real fallback. `flag()` fixes the boolean-attribute
 * problem (findings #20, #48, #49) once instead of in 201 hand-written literals.
 *
 * Each helper returns a Lit property declaration with an extra `arc` key
 * carrying the machine-readable contract. Lit passes unknown keys through
 * untouched, and `test/conformance.test.js` reads them back at runtime to
 * derive its assertions — so the conformance suite is generated from the same
 * declaration the component runs on, and cannot drift from it either.
 *
 * Normalisation runs in `willUpdate` via DeclaredPropsMixin, which is what makes
 * the guarantee hold on *both* paths. A converter alone only sees the attribute
 * path; `el.orientation = 'diagonal'` from script bypasses it entirely, and that
 * property path is where several of the recorded findings actually live.
 */

/**
 * `derived: true` marks a prop the component computes and publishes rather than
 * one a consumer sets — arc-top-bar's `scrolled` is the case: its own docs say
 * "Set by the component, not by you", and it exists so CSS can select
 * `arc-top-bar[scrolled]`. It still reflects and still round-trips; what it does
 * not do is take a value from markup, so the conformance suite must not ask it
 * to. Without this the vocabulary quietly assumes every prop is an input.
 */

/** Marker for the metadata key, so the conformance sweep can find declarations. */
export const ARC = 'arc';

const FALSEY = new Set(['false', '0', 'off']);

/**
 * A boolean that can actually be turned off from markup.
 *
 * Lit's stock boolean converter is `value !== null` — presence, with the value
 * ignored — which is correct for native HTML boolean attributes and wrong for
 * configuration flags. It fails in three directions at once:
 *
 *   - `<arc-modal closable="false">` cannot express false      (finding #20)
 *   - `<arc-input disabled="false">` reads as **true**         (finding #48)
 *   - `el.loop = false` does not survive a serialise/re-parse  (finding #49)
 *
 * `negative` is the answer to the third. Reflection cannot write `="false"`,
 * because `:host([border])` would then match while the border is off — this
 * library styles off attributes heavily, which is why `enum-fallbacks.js`
 * exists. Instead a true-defaulting flag reflects its false state as a separate
 * presence-only attribute (`no-dots`), which round-trips and keeps CSS simple.
 *
 * **Not for `disabled` on a form-associated element.** A form-associated custom
 * element whose `disabled` content attribute is merely *present* is "actually
 * disabled" per the HTML spec, so the platform calls `formDisabledCallback(true)`
 * and FormControlMixin assigns the property straight back — no converter can
 * win that argument. `<arc-input disabled="false">` is a disabled control for
 * exactly the reason `<input disabled="false">` is. Those 27 components keep
 * `{ type: Boolean, reflect: true }` deliberately; native semantics are the
 * correct answer there, not a gap in this vocabulary.
 *
 * `blockedBy` states a constraint in terms of *another* prop: while the named
 * prop is truthy this one is held at its declared default, on both paths.
 * `open: flag(false, { blockedBy: 'disabled' })` is the case it was added for —
 * five components documented `disabled` as "preventing the calendar from
 * opening" while guarding only the toggle handler, so `el.open = true` opened a
 * disabled control in all five (finding #58). That is the same shape as findings
 * #1, #14 and #47: **a constraint enforced on the interaction rather than on the
 * state**, which is precisely the failure this file exists to remove. Stating it
 * here moves it onto the controller that already runs on every update, and
 * `conformance.test.js` derives the assertion from the declaration.
 *
 * It is a name, not a predicate. A `normalize: (v, host) => …` escape hatch was
 * considered and rejected: an opaque function is prose again — the conformance
 * suite could not derive anything from it, prism could not read it, and the
 * vocabulary's whole premise is that the constraint is a value.
 *
 * There is no override. A blocked prop cannot be forced; if it could, every
 * caller would have to be trusted to not use the escape hatch, which is the
 * situation before this option existed.
 *
 * @param {boolean} fallback   value when no attribute is present
 * @param {{negative?: string, attribute?: string, reflect?: boolean, blockedBy?: string}} opts
 */
export function flag(
  fallback = false,
  { negative = null, attribute, reflect = true, derived = false, blockedBy, nullable = false } = {},
) {
  if (nullable) fallback = fallback === false ? null : fallback;
  if (fallback && !negative) {
    throw new Error(
      'flag(true) needs a `negative` attribute name — a true default has no ' +
        'presence-based markup for its false state. e.g. flag(true, { negative: "no-dots" })',
    );
  }
  return {
    type: Boolean,
    reflect,
    ...(attribute ? { attribute } : {}),
    converter: {
      // Presence still means true, so `<arc-input disabled>` is unchanged.
      // An explicit falsey string now means false. Removal returns to the
      // declared default rather than unconditionally to false.
      fromAttribute: (v) => (v === null ? fallback : !FALSEY.has(v.toLowerCase())),
      // Ordinary presence reflection: the attribute is there when the value is
      // true, absent when false. This has to stay ordinary — 14 components
      // style a true-defaulting flag through `:host([border])`, `:host([open])`
      // and friends, and writing the attribute only for the non-default state
      // would leave every one of those rules unmatched in the default case.
      //
      // The false state of a true-defaulting flag is carried by the separate
      // `negative` attribute instead, set by the controller below. So both
      // states have a markup spelling, `:host([x])` and `:host([no-x])` both
      // work, and the value survives a serialise/re-parse either way.
      toAttribute: (v) => (v ? '' : null),
    },
    [ARC]: { kind: 'flag', default: fallback, negative, derived, blockedBy, nullable },
  };
}

/**
 * A string constrained to a known set, with a real fallback.
 *
 * An unrecognised value currently reaches wherever the prop is used —
 * `aria-orientation="diagonal"` (finding #3), a corner selector that matches
 * nothing (#17), or a JS ternary landing on the wrong branch (#37). All three
 * are the same missing normalisation.
 *
 * @param {string[]} values   the legal members; the first is the default unless
 *                            `default` says otherwise
 */
export function oneOf(
  values,
  { default: fallback = values[0], attribute, reflect = true, derived = false } = {},
) {
  if (!values?.length) throw new Error('oneOf() needs at least one value');

  // A set of *numbers* is a real contract and not the same thing as a range.
  // `arc-time-picker`'s `@prop step` documents "(1, 5, 15, or 30)"; `num({min,
  // max})` cannot express that — it would admit 7 — and prose could not enforce
  // it at all, which is how any 1-60 came to be accepted. Membership is the same
  // check either way, so the only difference is the Lit `type` and coercing an
  // attribute string back to a number before comparing.
  const numeric = values.every((v) => typeof v === 'number');
  if (!numeric && values.some((v) => typeof v === 'number')) {
    throw new Error('oneOf() values must be all strings or all numbers, not a mix');
  }
  // A computed default is resolved per element at normalisation time, so there
  // is nothing to check here — the throw stays for the literal case, which is
  // every other declaration in the library.
  if (typeof fallback !== 'function' && !values.includes(fallback)) {
    throw new Error(
      `oneOf() default ${JSON.stringify(fallback)} is not one of ${values.join('|')}`,
    );
  }
  return {
    type: numeric ? Number : String,
    reflect,
    ...(attribute ? { attribute } : {}),
    [ARC]: { kind: 'enum', values: [...values], default: fallback, derived, numeric },
  };
}

/**
 * A number, optionally clamped to a range.
 *
 * `clamp: 'toRange'` is the one that matters: it is the difference between
 * arc-tabs' JSDoc saying "out-of-range values are clamped to the nearest valid
 * index" and that being true. `min`/`max` may be numbers or the name of another
 * property to read the bound from at normalisation time, which is what a
 * `selected` bounded by the tab count needs.
 */
export function num({
  default: fallback = 0,
  min,
  max,
  step,
  clamp = null,
  int = false,
  nullable = false,
  attribute,
  reflect = false,
} = {}) {
  // A nullable prop's "unset" state *is* its default, so `default: 0` would be
  // a real value rather than an absence. Overridable, for the rare case that
  // wants both a null state and a non-null starting point.
  if (nullable && fallback === 0) fallback = null;
  if (clamp && clamp !== 'toRange') throw new Error(`unknown clamp mode ${clamp}`);
  if (clamp && min === undefined && max === undefined) {
    throw new Error('clamp: "toRange" needs a min and/or a max to clamp to');
  }
  return {
    type: Number,
    reflect,
    ...(attribute ? { attribute } : {}),
    [ARC]: { kind: 'number', default: fallback, min, max, step, clamp, int, nullable },
  };
}

/** `num({ int: true })`, for indices and counts. */
export const int = (opts = {}) => num({ ...opts, int: true });

/**
 * An array-valued prop, parsed from a JSON attribute.
 *
 * The library had **four** spellings of this and no term for it, which is why
 * V4-PLAN 2.2 creates it before anything else in that item:
 *
 *   1. `{ type: Array }` — Lit's own converter, which calls `JSON.parse` and
 *      lets it **throw**. `<arc-chart series="oops">` raises during attribute
 *      processing, where a custom-element reaction's exception is reported
 *      globally rather than propagated (finding #79's shape).
 *   2. `{ attribute: false }` — property-only, so the prop has no markup form
 *      at all and static HTML cannot set it.
 *   3. A hand-rolled `converter.fromAttribute` with a try/catch — six copies of
 *      the same eight lines in `navigation/`.
 *   4. JSON-as-String — `arc-comparison.features` declared `{ type: String }`
 *      and parsed by hand at the point of use, so the property held a string
 *      and the component held an array.
 *
 * `list()` is the fifth spelling only in the sense that it is the one the other
 * four collapse into. What it settles:
 *
 * - **A malformed attribute falls back; it never throws.** That is the whole
 *   difference from dialect 1, and it is the reason this cannot be "just use
 *   `type: Array`".
 * - **A removed attribute returns to the declared default**, not to `null`.
 *   The six hand-rolled converters got this wrong together: `JSON.parse(null)`
 *   coerces to the string `"null"`, parses fine, and returns `null` — so
 *   removing the attribute left a non-array on a prop typed as an array.
 * - **Each element gets its own array.** The default is held as a factory, so
 *   two instances of a component cannot share one mutable list. A literal
 *   `default: [...]` is accepted and copied per element rather than shared.
 * - **`reflect` is off by default.** An array serialises to JSON, and writing a
 *   row set back into an attribute on every change is a lot of DOM churn for
 *   something no CSS selector can use. Pass `reflect: true` where a component
 *   genuinely wants it.
 * - **Every list has a markup form.** There is deliberately no
 *   `attribute: false` here. Dialect 2 is listed above as a *problem* — a prop
 *   static HTML cannot set — and a JSON attribute is the answer to it, so a
 *   list opting out of the attribute would be re-adopting the dialect this
 *   replaces. A prop that genuinely cannot round-trip is not a list: a render
 *   callback is a function, and stays a plain `{ attribute: false }`.
 *
 * ## `of: Number`, and why the vocabulary needs it
 *
 * `arc-knob.detents` is the one array prop whose attribute is not JSON: it
 * takes `detents="0,25,50,100"`, because a knob's detents read better as the
 * comma list a patch file would carry. That is a decision about *syntax*, not
 * a fifth dialect, and before this option the vocabulary could not express it —
 * so the component kept a hand-rolled converter and dialect 3 was not actually
 * retired.
 *
 * `of: Number` says every member is a number. The attribute then accepts
 * **either** spelling — `[0,25]` and `0,25` both parse — since JSON is tried
 * first and a comma list is what is left when it fails. Non-numeric members are
 * dropped rather than kept as `NaN`, on both the attribute path and the
 * property path, which is the same "the declaration is the contract on both
 * paths" rule the rest of this file states. It serialises back as the comma
 * list, so a reflected value round-trips to what was written.
 *
 * @param {object}   [opts]
 * @param {unknown[]|(() => unknown[])} [opts.default=[]] literal (copied per
 *   element) or factory
 * @param {NumberConstructor} [opts.of] member type; `Number` is the only one
 *   with a caller, and an unsupported value throws rather than being ignored
 */
export function list({
  default: fallback = [],
  of: member,
  attribute,
  reflect = false,
  derived = false,
} = {}) {
  if (member !== undefined && member !== Number) {
    throw new Error(
      'list({ of }) supports Number only. A member type that silently did ' +
        'nothing would be worse than not having the option: the declaration ' +
        'would read as a contract nothing enforces.',
    );
  }
  const numeric = member === Number;
  // Held as a factory so no two elements share one array. A literal is copied
  // rather than captured: `list({ default: ['a'] })` on two elements must give
  // two arrays, or a component that mutates its own default corrupts the next
  // instance to be created.
  const factory =
    typeof fallback === 'function'
      ? fallback
      : () => (Array.isArray(fallback) ? [...fallback] : []);

  return {
    type: Array,
    reflect,
    ...(attribute ? { attribute } : {}),
    converter: {
      fromAttribute: (v, type) => {
        if (v === null) return factory();
        let parsed = null;
        try {
          const json = JSON.parse(v);
          if (Array.isArray(json)) parsed = json;
        } catch {
          // The point of the helper. Lit's stock Array converter throws here,
          // and it throws inside attributeChangedCallback where nothing at the
          // call site can catch it.
        }
        // A comma list is what is left when JSON fails, so it is only tried
        // second — `[0,25]` stays an array of two rather than becoming the two
        // strings `[0` and `25]`.
        if (parsed === null && numeric) parsed = v.split(',');
        if (parsed === null) return factory();
        return numeric ? numericMembers(parsed) : parsed;
      },
      toAttribute: (v) => {
        if (!Array.isArray(v)) return null;
        return numeric ? numericMembers(v).join(',') : JSON.stringify(v);
      },
    },
    [ARC]: { kind: 'list', default: factory, derived, numeric },
  };
}

/**
 * The finite numbers in a list, as a new array.
 *
 * Dropping rather than coercing to `NaN`: a detent at `NaN` renders at an
 * undefined angle and compares false against everything, so it is a value that
 * cannot be right — the same reasoning `num()` applies when a non-finite value
 * falls back to the declared default.
 */
function numericMembers(values) {
  return values.map(Number).filter(Number.isFinite);
}

/** Whether a list is already exactly its numeric normalisation. */
function allNumeric(values) {
  return values.every((v) => typeof v === 'number' && Number.isFinite(v));
}

/**
 * Resolve a declared default, which may be computed.
 *
 * `arc-calendar` is the case: `month` and `year` default to the *current* month
 * and year, so there is no literal to put in the declaration. Before this, such
 * a prop could not adopt the vocabulary at all — a static default would fight
 * the constructor, and conformance's "starts on its declared default" assertion
 * would be wrong by construction.
 *
 * The function receives the element, so a default may depend on a sibling prop.
 * It is called at normalisation time rather than cached: "the current month" is
 * not a value to freeze at class-definition time.
 */
export function defaultOf(el, meta) {
  return typeof meta.default === 'function' ? meta.default(el) : meta.default;
}

/** Resolve a bound that may be a literal or the name of another property. */
function bound(el, spec) {
  if (spec === undefined) return undefined;
  if (typeof spec === 'number') return spec;
  const resolved = typeof el[spec] === 'function' ? el[spec]() : el[spec];
  return typeof resolved === 'number' ? resolved : undefined;
}

/**
 * Coerce one value to its declared contract. Exported so the conformance suite
 * can assert the component agrees with it, rather than re-implementing it.
 */
export function normalizeValue(el, meta, value) {
  // A constraint stated in terms of *another* prop. The check is deliberately
  // kind-agnostic even though only flag() exposes the option today — extending
  // it to oneOf()/num() is a one-word pass-through when a case turns up, and
  // there is no second implementation to keep in step. See flag()'s docstring.
  if (meta.blockedBy && el[meta.blockedBy]) return defaultOf(el, meta);

  // `nullable` is deliberately kind-agnostic and sits ahead of every branch,
  // because the thing it expresses is not about numbers or booleans: it is that
  // **unset is a third state with its own meaning**, distinct from the default.
  //
  // Thirteen numeric props had it and were each handling it by hand —
  // arc-gauge's and arc-meter's `low`/`high`/`optimum` (unset ⇒ derive the zone
  // from the range), `arc-number-input`'s `min`/`max` (unset ⇒ unbounded),
  // `arc-waveform.duration` and `arc-level-meter.peak` (unset ⇒ nothing to
  // show), `arc-activity-heatmap.max` (unset ⇒ quartile mapping rather than a
  // linear scale), `arc-number-format.decimals` (unset ⇒ per-format default) —
  // plus `arc-clock.hour12`, where unset means "let the viewer's locale
  // decide". Without this, every one of them had to stay a raw
  // `{ type: Number }` or `{ type: Boolean }`, because the vocabulary would
  // have collapsed the third state onto the declared default. That is a real
  // defect and not a stylistic one: it would have made every clock 24-hour and
  // every gauge draw zones nobody asked for.
  if (meta.nullable && (value === null || value === undefined || value === '')) return null;

  // A flag that was never initialised is `undefined`, not its declared default.
  // Every other kind already lands on its default here — an enum because
  // undefined is not a member, a number because it is not finite — and flags
  // were the one kind that did not, which is why all 201 of them hand-write the
  // default a second time in a constructor. Stating it twice is the drift this
  // file exists to remove: the declaration is the contract, so it is also the
  // initial value (finding #71).
  if (meta.kind === 'flag') {
    return typeof value === 'boolean' ? value : defaultOf(el, meta);
  }

  if (meta.kind === 'enum') {
    // A numeric member arriving from an attribute is a string by the time a
    // converter-less path sees it, and `[1,5].includes('5')` is false — so the
    // value is coerced before the membership test rather than after, or every
    // attribute-set numeric enum would silently fall back to its default.
    const candidate = meta.numeric && typeof value === 'string' ? Number(value) : value;
    return meta.values.includes(candidate) ? candidate : defaultOf(el, meta);
  }
  if (meta.kind === 'list') {
    // Identity-preserving on the way through, which the conformance suite's
    // fixed-point check depends on: `normalizeValue(el, meta, el[name])` has to
    // equal `el[name]`, and returning a fresh copy of an already-valid array
    // would fail that for every list prop in the library.
    if (!Array.isArray(value)) return defaultOf(el, meta);
    // `of: Number` has to hold on the property path too, or `el.detents =
    // ['a']` keeps a member the attribute path would have dropped. The
    // already-normal case returns the same array rather than a copy, so the
    // fixed point survives.
    if (meta.numeric && !allNumeric(value)) return numericMembers(value);
    return value;
  }

  if (meta.kind === 'number') {
    let next = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(next)) return defaultOf(el, meta);
    if (meta.int) next = Math.trunc(next);
    if (meta.clamp === 'toRange') {
      const lo = bound(el, meta.min);
      const hi = bound(el, meta.max);
      if (lo !== undefined) next = Math.max(lo, next);
      if (hi !== undefined) next = Math.min(hi, next);
    }
    return next;
  }
  return value;
}

/** Every declared prop on a class, as [name, meta] pairs. */
export function declaredProps(Ctor) {
  const out = [];
  // elementProperties is Lit's finalised map and includes inherited declarations.
  for (const [name, decl] of Ctor.elementProperties ?? []) {
    if (decl?.[ARC]) out.push([name, decl[ARC]]);
  }
  return out;
}

/** The nearest descriptor for `name` on a prototype chain. */
function findAccessor(proto, name) {
  for (let p = proto; p; p = Object.getPrototypeOf(p)) {
    const desc = Object.getOwnPropertyDescriptor(p, name);
    if (desc) return desc;
  }
  return null;
}

/** Marks an accessor as one of ours, so a subclass does not re-wrap it. */
const PATCHED = Symbol('arc.blocked');

/**
 * Wrap the Lit-generated accessor of every `blockedBy` prop, so a blocked
 * assignment is refused at the setter and never reaches `requestUpdate`.
 *
 * **On the prototype, once per class — not on the instance.** An instance-level
 * `defineProperty` is the obvious implementation and Lit rejects it: its
 * dev-mode `class-field-shadowing` guard scans own properties against
 * `elementProperties` and throws, and it cannot tell an own accessor from the
 * own data field it is actually looking for. Patching the prototype is what Lit
 * itself does, so it raises nothing.
 *
 * This is the *other half* of the `blockedBy` check in `normalizeValue`, not a
 * replacement for it, and the two cover different moments:
 *
 *   - **Setter** — the prop is assigned *while already blocked*
 *     (`el.disabled = true; el.open = true`). Reverting this in `hostUpdate`
 *     would still leave Lit with `open` in `changedProperties`, so the host's
 *     `updated()` would run its close-side effects and schedule a second render
 *     for a value that never actually changed. Refusing at the setter means no
 *     update is scheduled at all.
 *   - **Controller** — the *blocker* turns on afterwards
 *     (`el.open = true; el.disabled = true`), and on the attribute path, where
 *     Lit may apply `open` before `disabled` on the same element. Here the
 *     change is real and the re-render is warranted, so `normalizeValue` doing
 *     it in `hostUpdate` is correct.
 *
 * Neither alone is sufficient.
 */
function installBlockedAccessors(Ctor) {
  if (Object.prototype.hasOwnProperty.call(Ctor, PATCHED)) return;
  Object.defineProperty(Ctor, PATCHED, { value: true });

  for (const [name, meta] of declaredProps(Ctor)) {
    if (!meta.blockedBy) continue;
    const desc = findAccessor(Ctor.prototype, name);
    // No setter means the component hand-rolled a read-only accessor; leave it
    // alone rather than silently replacing someone else's definition. An
    // already-patched one was inherited from a base class and still applies.
    if (!desc?.set || !desc?.get || desc.get[PATCHED]) continue;

    const get = function () {
      return desc.get.call(this);
    };
    get[PATCHED] = true;

    Object.defineProperty(Ctor.prototype, name, {
      configurable: true,
      enumerable: desc.enumerable,
      get,
      set(value) {
        // Assigning the default is always allowed: it is the value blocking
        // would produce anyway, and refusing it would make `el.open = false`
        // fail on a disabled element, which is nonsense.
        if (this[meta.blockedBy] && value !== meta.default) return;
        desc.set.call(this, value);
      },
    });
  }
}

/**
 * Applies the declared contract on every update, for both the attribute path
 * and the property path.
 *
 * The work runs through a **reactive controller**, not through `willUpdate`
 * and `updated` overrides. That is deliberate, and it is what makes rolling
 * this out across 200+ components safe: a mixin hook only runs if every
 * component that overrides the same method remembers `super.updated(changed)`,
 * and a component that forgets loses its normalisation *silently* — the
 * declaration still reads correctly and simply stops being enforced. There is
 * no such failure mode here. A controller's hooks run regardless of what the
 * host overrides; the only requirement is the `super()` call every class makes
 * anyway.
 */
export const DeclaredPropsMixin = (superClass) =>
  class extends superClass {
    constructor(...args) {
      super(...args);
      // Idempotent and per-class: everything after the first construction of a
      // given component is one hasOwnProperty check.
      installBlockedAccessors(this.constructor);

      // Seed every declared default at construction, not at first update.
      //
      // Normalisation in `hostUpdate` is too late for a value read before the
      // element renders: `document.createElement('arc-marquee').pauseOnHover`
      // would be `undefined` rather than `true`. That is why all 201 flags —
      // and the enums and numbers beside them — hand-write their default a
      // second time in a constructor, which is the duplication finding #71 is
      // about. Seeding here is what makes those assignments genuinely
      // redundant rather than merely repetitive.
      //
      // A subclass constructor body runs *after* this one, so a component that
      // wants a different initial value still wins.
      for (const [name, meta] of declaredProps(this.constructor)) {
        if (this[name] === undefined) this[name] = defaultOf(this, meta);
      }

      this.addController({
        // Before render: normalise, so the contract holds on both the attribute
        // path and the property path. Assigning here is folded into the same
        // update rather than costing a second render.
        //
        // Before *render*, and after the host's own `willUpdate` — Lit calls
        // `willUpdate` first and controllers second. So a component that reads
        // a declared prop in its own `willUpdate` still sees whatever was
        // assigned, and has to guard. That is not a gap a controller can close:
        // `hostUpdate` is the earliest per-update hook there is, and the
        // alternative — an `updated()`/`willUpdate()` override in the mixin —
        // is the mechanism this comment block exists to reject. `arc-kanban`
        // is the worked example; `Array.isArray` there, not `|| []`.
        hostUpdate: () => {
          for (const [name, meta] of declaredProps(this.constructor)) {
            const current = this[name];
            const next = normalizeValue(this, meta, current);
            if (next !== current && !Number.isNaN(next)) this[name] = next;
          }
        },
        // After render: the negative attribute for a true-defaulting flag. Lit's
        // reflection cannot express this, since one property drives two
        // attribute names.
        hostUpdated: () => {
          for (const [name, meta] of declaredProps(this.constructor)) {
            if (meta.kind !== 'flag' || !meta.negative) continue;
            if (this[name] === meta.default) this.removeAttribute(meta.negative);
            else this.setAttribute(meta.negative, '');
          }
        },
      });
    }

    /** Read the negative attribute on the way in, so `<x no-dots>` parses. */
    connectedCallback() {
      super.connectedCallback();
      for (const [name, meta] of declaredProps(this.constructor)) {
        if (meta.kind === 'flag' && meta.negative && this.hasAttribute(meta.negative)) {
          this[name] = !meta.default;
        }
      }
    }
  };
