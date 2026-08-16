/**
 * props.js — the declared-contract vocabulary, tested directly.
 *
 * Until now this file was tested only by inference: `conformance.test.js` ran
 * every declaration on every adopted component, so a break in `normalizeValue`
 * surfaced as **238 failures across 86 components** rather than as one. That was
 * measured, by breaking the enum fallback on purpose. One bug reported 238 times
 * is not 238 tests' worth of information, and none of those 238 named the file
 * that was actually wrong.
 *
 * So the mechanism is pinned here, once, exhaustively — every kind against every
 * path — and conformance keeps only what is genuinely per-component: that the
 * declaration is *live* on each prop. See the header there.
 *
 * This is the spine 166 components sit on. Its mutation gate is deliberately
 * higher than the library's (≥90% vs ≥75%): a surviving mutant here is a hole
 * under everything at once.
 */
import { expect } from '@esm-bundle/chai';
import { LitElement, html } from 'lit';
import { mount, cleanup, settle } from './helpers.js';
import {
  ARC,
  flag,
  oneOf,
  num,
  int,
  list,
  normalizeValue,
  declaredProps,
  DeclaredPropsMixin,
} from '../src/shared/props.js';

afterEach(() => cleanup());

/** The metadata a helper attaches, which is what the mixin and the suites read. */
const meta = (decl) => decl[ARC];

// ---------------------------------------------------------------------------
// flag()
// ---------------------------------------------------------------------------

describe('flag()', () => {
  it('carries its declared default and kind', () => {
    expect(meta(flag(false))).to.include({ kind: 'flag', default: false });
  });

  it('refuses a true default with no negative attribute name', () => {
    // Not a style rule: a true-defaulting flag has no presence-based markup for
    // its false state, so without `negative` the value cannot round-trip at all.
    expect(() => flag(true)).to.throw(/negative/);
  });

  it('accepts a true default when given one', () => {
    expect(meta(flag(true, { negative: 'no-dots' }))).to.include({
      default: true,
      negative: 'no-dots',
    });
  });

  it('reflects by default, since the library styles off attributes', () => {
    expect(flag(false).reflect).to.equal(true);
  });

  it('defaults to false when called with no arguments', () => {
    expect(meta(flag()).default).to.equal(false);
  });

  it('is not derived unless said so', () => {
    // Load-bearing: conformance skips the enforcement test for a derived prop,
    // so a flipped default here would silently stop testing all 201 flags.
    expect(meta(flag(false)).derived).to.equal(false);
    expect(meta(flag(false, { derived: true })).derived).to.equal(true);
  });

  describe('the converter, which is the whole point of the helper', () => {
    const conv = (decl) => decl.converter;

    it('treats presence as true', () => {
      expect(conv(flag(false)).fromAttribute('')).to.equal(true);
    });

    for (const falsey of ['false', '0', 'off']) {
      it(`treats ${JSON.stringify(falsey)} as false`, () => {
        // Finding #48: Lit's stock converter is `value !== null`, so
        // `disabled="false"` produced a disabled control.
        expect(conv(flag(false)).fromAttribute(falsey)).to.equal(false);
      });
    }

    it('matches falsey strings case-insensitively', () => {
      expect(conv(flag(false)).fromAttribute('FALSE')).to.equal(false);
      expect(conv(flag(false)).fromAttribute('Off')).to.equal(false);
    });

    it('treats any other string as true', () => {
      expect(conv(flag(false)).fromAttribute('yes')).to.equal(true);
    });

    it('returns to the declared default when the attribute is removed', () => {
      // Not unconditionally false — that is the difference between a flag with
      // a true default round-tripping and silently flipping.
      expect(conv(flag(true, { negative: 'no-dots' })).fromAttribute(null)).to.equal(true);
      expect(conv(flag(false)).fromAttribute(null)).to.equal(false);
    });

    it('reflects as ordinary presence, never as ="false"', () => {
      // `:host([border])` must not match while the border is off — 14 components
      // depend on that, which is why the false state uses `negative` instead.
      expect(conv(flag(false)).toAttribute(true)).to.equal('');
      expect(conv(flag(false)).toAttribute(false)).to.equal(null);
    });
  });
});

// ---------------------------------------------------------------------------
// oneOf()
// ---------------------------------------------------------------------------

describe('oneOf()', () => {
  it('defaults to the first member', () => {
    expect(meta(oneOf(['a', 'b']))).to.include({ default: 'a' });
  });

  it('takes an explicit default', () => {
    expect(meta(oneOf(['a', 'b'], { default: 'b' })).default).to.equal('b');
  });

  it('refuses a default that is not a member', () => {
    expect(() => oneOf(['a', 'b'], { default: 'c' })).to.throw(/not one of/);
  });

  it('refuses an empty set', () => {
    expect(() => oneOf([])).to.throw(/at least one/);
  });

  it('reflects by default, and is not derived', () => {
    expect(oneOf(['a', 'b']).reflect).to.equal(true);
    expect(meta(oneOf(['a', 'b'])).derived).to.equal(false);
  });

  it('copies the member list rather than aliasing the caller’s array', () => {
    // A shared array would let one component's mutation reach every other
    // declaration built from the same literal.
    const values = ['a', 'b'];
    const declared = meta(oneOf(values)).values;
    values.push('c');
    expect(declared).to.eql(['a', 'b']);
  });

  describe('numeric sets', () => {
    it('is typed Number and marked numeric', () => {
      const decl = oneOf([1, 5, 15, 30], { default: 1 });
      expect(decl.type).to.equal(Number);
      expect(meta(decl).numeric).to.equal(true);
    });

    it('is typed String for a string set', () => {
      expect(oneOf(['a', 'b']).type).to.equal(String);
      expect(meta(oneOf(['a', 'b'])).numeric).to.equal(false);
    });

    it('refuses a mixed set', () => {
      // Membership would then depend on which path the value arrived by.
      expect(() => oneOf([1, 'b'])).to.throw(/all strings or all numbers/);
    });
  });
});

// ---------------------------------------------------------------------------
// num() / int()
// ---------------------------------------------------------------------------

describe('num() and int()', () => {
  it('defaults to 0 and does not reflect', () => {
    expect(meta(num())).to.include({ kind: 'number', default: 0 });
    expect(num().reflect).to.equal(false);
  });

  it('refuses an unknown clamp mode', () => {
    expect(() => num({ clamp: 'toNearest', min: 0 })).to.throw(/unknown clamp/);
  });

  it('refuses a clamp with nothing to clamp to', () => {
    // Otherwise the declaration reads as constrained and enforces nothing.
    expect(() => num({ clamp: 'toRange' })).to.throw(/needs a min/);
  });

  it('accepts a clamp with only one bound', () => {
    expect(() => num({ clamp: 'toRange', min: 0 })).to.not.throw();
    expect(() => num({ clamp: 'toRange', max: 10 })).to.not.throw();
  });

  it('int() is num() with truncation', () => {
    expect(meta(int({ default: 2 }))).to.include({ int: true, default: 2 });
    expect(meta(num()).int).to.equal(false);
  });
});


// ---------------------------------------------------------------------------
// list()
// ---------------------------------------------------------------------------

describe('list()', () => {
  const from = (decl, v) => decl.converter.fromAttribute(v);

  it('is an Array-typed prop that does not reflect', () => {
    expect(list().type).to.equal(Array);
    expect(list().reflect, 'an array serialises to JSON — not a selector CSS can use')
      .to.equal(false);
    expect(meta(list())).to.include({ kind: 'list' });
  });

  it('reflects when asked to', () => {
    expect(list({ reflect: true }).reflect).to.equal(true);
  });

  it('parses a JSON array from the attribute', () => {
    expect(from(list(), '["a","b"]')).to.eql(['a', 'b']);
    expect(from(list(), '[1,2,3]')).to.eql([1, 2, 3]);
  });

  it('falls back instead of throwing on malformed JSON', () => {
    // The whole difference from `{ type: Array }`, whose converter lets
    // JSON.parse throw — from inside attributeChangedCallback, where a custom
    // element reaction's exception is reported globally and nothing at the call
    // site can catch it.
    expect(() => from(list(), 'oops')).to.not.throw();
    expect(from(list(), 'oops')).to.eql([]);
    expect(from(list(), '{ unterminated')).to.eql([]);
  });

  it('falls back for valid JSON that is not an array', () => {
    // `JSON.parse('{"a":1}')` succeeds and returns an object, which would leave
    // a non-array on a prop the whole library types as an array.
    expect(from(list(), '{"a":1}')).to.eql([]);
    expect(from(list(), '"a string"')).to.eql([]);
    expect(from(list(), '42')).to.eql([]);
    expect(from(list(), 'null')).to.eql([]);
  });

  it('returns to the declared default when the attribute is removed', () => {
    // The bug all six hand-rolled converters shared: `JSON.parse(null)` coerces
    // to the string "null", parses fine and returns null — so removing the
    // attribute left a non-array behind rather than restoring the default.
    expect(from(list(), null)).to.eql([]);
    expect(from(list({ default: ['x'] }), null)).to.eql(['x']);
  });

  it('gives every element its own array', () => {
    // A shared default would let one component mutate the list every later
    // instance starts with.
    const decl = list({ default: ['x'] });
    const a = from(decl, null);
    const b = from(decl, null);
    expect(a).to.eql(b);
    expect(a, 'same contents, different arrays').to.not.equal(b);

    a.push('mutated');
    expect(from(decl, null), 'the declaration is unchanged').to.eql(['x']);
  });

  it('takes a factory default', () => {
    const decl = list({ default: () => [1, 2] });
    expect(from(decl, null)).to.eql([1, 2]);
  });

  it('serialises back to JSON when reflected', () => {
    const decl = list({ reflect: true });
    expect(decl.converter.toAttribute(['a', 'b'])).to.equal('["a","b"]');
    expect(decl.converter.toAttribute('not an array')).to.equal(null);
  });

  it('is an input unless declared derived', () => {
    // `derived` marks a prop the component computes and publishes rather than
    // accepts. conformance.test.js skips its "enforces its declaration on both
    // paths" probe for those, because handing a value to an output tests the
    // wrong direction — so a list that defaulted to derived would silently opt
    // every list prop in the library out of half its coverage.
    expect(meta(list()).derived).to.equal(false);
    expect(meta(list({ derived: true })).derived).to.equal(true);
  });

  it('renames the attribute when asked', () => {
    expect(list({ attribute: 'expanded-values' }).attribute).to.equal('expanded-values');
    expect(list().attribute, 'and derives it from the name otherwise').to.equal(undefined);
  });

  describe('of: Number — the comma-list attribute', () => {
    // `arc-knob.detents` takes `detents="0,25,50,100"`, and before this option
    // it was the one array prop in the library that kept a hand-rolled
    // converter — the vocabulary had no way to say "comma list", so dialect 3
    // was not actually retired. See props.js.
    const nums = () => list({ of: Number });

    it('parses a comma list', () => {
      expect(from(nums(), '0,25,50,100')).to.eql([0, 25, 50, 100]);
      expect(from(nums(), ' 1 , 2 ')).to.eql([1, 2]);
    });

    it('still parses JSON, because JSON is tried first', () => {
      // Order matters: split first and `[0,25]` becomes the two strings `[0`
      // and `25]`, which coerce to NaN and get dropped — so the attribute the
      // rest of the library writes would silently parse as empty.
      expect(from(nums(), '[0,25]')).to.eql([0, 25]);
    });

    it('drops members that are not finite numbers', () => {
      // Rather than keeping NaN: a detent at NaN renders at an undefined angle
      // and compares false against everything, so it cannot be right.
      expect(from(nums(), '0,oops,50')).to.eql([0, 50]);
      expect(from(nums(), '["a", 3]')).to.eql([3]);
      expect(from(nums(), 'oops')).to.eql([]);
    });

    it('returns to the declared default when the attribute is removed', () => {
      expect(from(nums(), null)).to.eql([]);
      expect(from(list({ of: Number, default: [50] }), null)).to.eql([50]);
    });

    it('serialises back as the comma list that was written', () => {
      expect(nums().converter.toAttribute([0, 25, 50])).to.equal('0,25,50');
      expect(nums().converter.toAttribute('not an array')).to.equal(null);
    });

    it('holds on the property path too', () => {
      const decl = nums();
      expect(normalizeValue({}, meta(decl), [1, 'x', 3])).to.eql([1, 3]);
    });

    it('preserves identity for an already-numeric list', () => {
      // conformance.test.js's fixed-point probe asserts
      // `normalizeValue(el, meta, el[name]) === el[name]`, so returning a fresh
      // copy of a list that was already correct would fail it for every
      // `of: Number` prop.
      const decl = nums();
      const value = [1, 2, 3];
      expect(normalizeValue({}, meta(decl), value)).to.equal(value);
    });

    it('rejects a member type it cannot enforce', () => {
      // A declaration that reads as a contract and enforces nothing is worse
      // than no option at all.
      expect(() => list({ of: String })).to.throw(/Number only/);
    });
  });
});


// ---------------------------------------------------------------------------
// nullable — "unset" as a third state, across kinds
// ---------------------------------------------------------------------------

describe('nullable', () => {
  const host = {};

  it('makes a number default to null rather than 0', () => {
    // 0 is a real value for a number, so a nullable prop cannot keep it as the
    // "unset" default — arc-gauge.low at 0 would draw a zone nobody asked for.
    expect(meta(num({ nullable: true })).default).to.equal(null);
    expect(meta(num()).default, 'and an ordinary one is unchanged').to.equal(0);
  });

  it('lets a nullable number keep an explicit non-null default', () => {
    // The override the implicit-null rule has to leave room for: a prop with
    // both a null state and a real starting point.
    expect(meta(num({ nullable: true, default: 5 })).default).to.equal(5);
  });

  it('makes a flag default to null rather than false', () => {
    expect(meta(flag(false, { nullable: true })).default).to.equal(null);
    expect(meta(flag()).default, 'and an ordinary one is unchanged').to.equal(false);
  });

  it('carries the option into the metadata for both kinds', () => {
    expect(meta(num({ nullable: true })).nullable).to.equal(true);
    expect(meta(flag(false, { nullable: true })).nullable).to.equal(true);
    expect(meta(num()).nullable).to.equal(false);
    expect(meta(flag()).nullable).to.equal(false);
  });

  it('passes null, undefined and the empty attribute through as null', () => {
    // All three spell "nobody set this". The empty string is the one that is
    // easy to miss: `<arc-gauge low="">` arrives as '', and Number('') is 0 —
    // a real value, and the wrong one.
    for (const kind of [num({ nullable: true }), flag(false, { nullable: true })]) {
      for (const unset of [null, undefined, '']) {
        expect(normalizeValue(host, meta(kind), unset), String(unset)).to.equal(null);
      }
    }
  });

  it('still normalises a value that is present', () => {
    // Anti-vacuity: a nullable prop that returned null for *everything* would
    // pass every test above.
    const decl = num({ nullable: true, min: 0, max: 10, clamp: 'toRange' });
    expect(normalizeValue(host, meta(decl), 5)).to.equal(5);
    expect(normalizeValue(host, meta(decl), 99), 'bounds still apply').to.equal(10);
    expect(normalizeValue(host, meta(decl), 'junk'), 'and so does the fallback').to.equal(null);

    const bool = flag(false, { nullable: true });
    expect(normalizeValue(host, meta(bool), true)).to.equal(true);
    expect(normalizeValue(host, meta(bool), false)).to.equal(false);
  });

  it('does not swallow zero, false or the empty string on a non-nullable prop', () => {
    // The guard is behind `meta.nullable` for a reason: 0 and false are
    // ordinary values everywhere else, and '' has to keep falling through to
    // each kind's own coercion.
    expect(normalizeValue(host, meta(num()), 0)).to.equal(0);
    expect(normalizeValue(host, meta(num()), '')).to.equal(0);
    expect(normalizeValue(host, meta(flag()), false)).to.equal(false);
    expect(normalizeValue(host, meta(flag(true, { negative: 'no-x' })), undefined)).to.equal(true);
  });
});

// ---------------------------------------------------------------------------
// normalizeValue() — the coercion every adopted component runs on
// ---------------------------------------------------------------------------

describe('normalizeValue()', () => {
  const host = {};

  it('passes an array through by identity', () => {
    // Identity, not contents: conformance.test.js asserts a fixed point —
    // `normalizeValue(el, meta, el[name])` must *equal* `el[name]` — and
    // returning a fresh copy of an already-valid array would fail that for
    // every list prop in the library.
    const decl = list();
    const value = ['a'];
    expect(normalizeValue(host, meta(decl), value)).to.equal(value);
  });

  it('replaces a non-array with the declared default', () => {
    const decl = list({ default: ['fallback'] });
    for (const bad of ['a string', 42, null, undefined, { a: 1 }]) {
      expect(normalizeValue(host, meta(decl), bad), String(bad)).to.eql(['fallback']);
    }
  });

  describe('enums', () => {
    const m = meta(oneOf(['a', 'b'], { default: 'b' }));

    it('passes a member through', () => {
      expect(normalizeValue(host, m, 'a')).to.equal('a');
    });

    it('falls back for a non-member', () => {
      expect(normalizeValue(host, m, 'zzz')).to.equal('b');
    });

    it('falls back for undefined', () => {
      expect(normalizeValue(host, m, undefined)).to.equal('b');
    });

    it('coerces an attribute string before testing membership', () => {
      // `[1,5].includes('5')` is false, so without this every attribute-set
      // numeric enum would silently fall back to its default.
      const numeric = meta(oneOf([1, 5, 15], { default: 1 }));
      expect(normalizeValue(host, numeric, '15')).to.equal(15);
    });

    it('still rejects a non-member numeric string', () => {
      const numeric = meta(oneOf([1, 5, 15], { default: 1 }));
      expect(normalizeValue(host, numeric, '7')).to.equal(1);
    });

    it('does not coerce strings for a string set', () => {
      // '1' must not become 1 and match a numeric-looking member.
      const strings = meta(oneOf(['1', '2']));
      expect(normalizeValue(host, strings, 1)).to.equal('1');
    });
  });

  describe('numbers', () => {
    it('parses a numeric string', () => {
      expect(normalizeValue(host, meta(num()), '42')).to.equal(42);
    });

    it('falls back for a non-numeric value', () => {
      expect(normalizeValue(host, meta(num({ default: 50 })), 'left')).to.equal(50);
    });

    it('falls back for Infinity', () => {
      expect(normalizeValue(host, meta(num({ default: 3 })), Infinity)).to.equal(3);
    });

    it('truncates toward zero when int', () => {
      expect(normalizeValue(host, meta(int()), 2.9)).to.equal(2);
      expect(normalizeValue(host, meta(int()), -2.9)).to.equal(-2);
    });

    it('leaves a float alone when not int', () => {
      expect(normalizeValue(host, meta(num()), 2.5)).to.equal(2.5);
    });

    it('does not clamp unless asked', () => {
      expect(normalizeValue(host, meta(num({ min: 0, max: 10 })), 99)).to.equal(99);
    });

    describe('clamp: toRange', () => {
      const m = meta(num({ min: 0, max: 10, clamp: 'toRange' }));

      it('holds an over-range value at max', () => {
        expect(normalizeValue(host, m, 99)).to.equal(10);
      });

      it('holds an under-range value at min', () => {
        expect(normalizeValue(host, m, -5)).to.equal(0);
      });

      it('leaves an in-range value alone', () => {
        expect(normalizeValue(host, m, 4)).to.equal(4);
      });

      it('clamps to a bound named by another property', () => {
        // What a `selected` bounded by the tab count needs: the bound is itself
        // reactive, so it cannot be a literal.
        const named = meta(int({ min: 0, max: 'count', clamp: 'toRange' }));
        expect(normalizeValue({ count: 3 }, named, 9)).to.equal(3);
      });

      it('reads a bound from a method when the name resolves to one', () => {
        const named = meta(int({ min: 0, max: 'lastIndex', clamp: 'toRange' }));
        expect(normalizeValue({ lastIndex: () => 2 }, named, 9)).to.equal(2);
      });

      it('ignores a named bound that is not a number yet', () => {
        // During first render the sibling prop may be undefined; clamping to
        // NaN would wipe the value instead of leaving it for the next pass.
        const named = meta(int({ min: 0, max: 'count', clamp: 'toRange' }));
        expect(normalizeValue({ count: undefined }, named, 9)).to.equal(9);
      });

      it('clamps with only a min', () => {
        expect(normalizeValue(host, meta(num({ min: 5, clamp: 'toRange' })), 1)).to.equal(5);
      });

      it('clamps with only a max', () => {
        expect(normalizeValue(host, meta(num({ max: 5, clamp: 'toRange' })), 9)).to.equal(5);
      });
    });
  });

  describe('blockedBy', () => {
    const m = meta(flag(false, { blockedBy: 'disabled' }));

    it('returns the default while the blocker is set', () => {
      expect(normalizeValue({ disabled: true }, m, true)).to.equal(false);
    });

    it('passes the value through while the blocker is clear', () => {
      expect(normalizeValue({ disabled: false }, m, true)).to.equal(true);
    });

    it('is kind-agnostic, not flag-specific', () => {
      // The check sits above the kind switch on purpose, so extending the
      // option to oneOf()/num() needs no second implementation.
      const enumMeta = { ...meta(oneOf(['a', 'b'])), blockedBy: 'locked' };
      expect(normalizeValue({ locked: true }, enumMeta, 'b')).to.equal('a');
    });
  });
});

// ---------------------------------------------------------------------------
// declaredProps()
// ---------------------------------------------------------------------------

describe('declaredProps()', () => {
  it('returns nothing for a class with no declarations', () => {
    expect(declaredProps(class {})).to.eql([]);
  });

  it('ignores plain Lit declarations alongside declared ones', () => {
    const Ctor = { elementProperties: new Map([['plain', { type: String }], ['tone', oneOf(['a'])]]) };
    expect(declaredProps(Ctor).map(([name]) => name)).to.eql(['tone']);
  });
});

// ---------------------------------------------------------------------------
// DeclaredPropsMixin — the same contract, through a real element
// ---------------------------------------------------------------------------

class Probe extends DeclaredPropsMixin(LitElement) {
  static properties = {
    tone: oneOf(['neutral', 'accent', 'danger']),
    dots: flag(true, { negative: 'no-dots' }),
    open: flag(false, { blockedBy: 'disabled' }),
    disabled: { type: Boolean, reflect: true },
    count: int({ default: 0, min: 0, max: 'limit', clamp: 'toRange' }),
    limit: { type: Number },
  };

  constructor() {
    super();
    this.disabled = false;
    this.limit = 10;
  }

  render() {
    return html`<slot></slot>`;
  }
}
if (!customElements.get('arc-props-probe')) customElements.define('arc-props-probe', Probe);

const probe = async (attrs = '') => {
  const el = mount(`<arc-props-probe ${attrs}></arc-props-probe>`);
  await settle(el);
  return el;
};

describe('DeclaredPropsMixin', () => {
  it('normalises a bad value arriving by attribute', async () => {
    expect((await probe('tone="diagonal"')).tone).to.equal('neutral');
  });

  it('normalises a bad value assigned from script', async () => {
    // The path a converter never sees, and where several findings lived.
    const el = await probe();
    el.tone = 'diagonal';
    await settle(el);
    expect(el.tone).to.equal('neutral');
  });

  it('clamps against a bound that is another live property', async () => {
    const el = await probe('count="99"');
    expect(el.count).to.equal(10);
  });

  it('re-clamps when the bound moves under a legal value', async () => {
    const el = await probe('count="8"');
    el.limit = 5;
    await settle(el);
    expect(el.count, 'a narrowed bound left the value outside it').to.equal(5);
  });

  describe('the negative attribute', () => {
    it('is absent while a true-defaulting flag is at its default', async () => {
      const el = await probe();
      expect(el.dots).to.equal(true);
      expect(el.hasAttribute('no-dots')).to.equal(false);
    });

    it('is written when the flag goes false', async () => {
      // Lit's reflection cannot express this: one property, two attribute names.
      const el = await probe();
      el.dots = false;
      await settle(el);
      expect(el.hasAttribute('no-dots')).to.equal(true);
    });

    it('is removed again when the flag returns to its default', async () => {
      const el = await probe();
      el.dots = false;
      await settle(el);
      el.dots = true;
      await settle(el);
      expect(el.hasAttribute('no-dots')).to.equal(false);
    });

    it('parses on the way in, so the value round-trips', async () => {
      // Finding #49: without this, serialise/re-parse silently flipped the flag.
      expect((await probe('no-dots')).dots).to.equal(false);
    });

    it('writes nothing at all for a flag that declared no negative name', async () => {
      // Most flags have no `negative`, and the loop must skip them rather than
      // fall through to setAttribute(null, ''), which stamps a literal `null`
      // attribute on the host. Nothing else in the suite looks for stray
      // attributes, so without this the guard can be inverted undetected.
      const el = await probe();
      const before = [...el.attributes].map((a) => a.name);
      el.open = true;
      await settle(el);
      const after = [...el.attributes].map((a) => a.name);
      expect(after.filter((n) => !before.includes(n) && n !== 'open')).to.eql([]);
    });
  });

  describe('blockedBy', () => {
    it('refuses an assignment made while already blocked', async () => {
      const el = await probe('disabled');
      el.open = true;
      await settle(el);
      expect(el.open).to.equal(false);
    });

    it('schedules no update for the refused assignment', async () => {
      // Why the setter is patched as well as the controller: reverting in
      // hostUpdate would still leave `open` in changedProperties, so the host
      // would run its close-side effects for a change that never happened.
      const el = await probe('disabled');
      await el.updateComplete;
      el.open = true;
      expect(el.isUpdatePending, 'a refused assignment still scheduled a render').to.equal(false);
    });

    it('reverts when the blocker turns on afterwards', async () => {
      // The other moment, which the setter cannot see: the value was legal when
      // it was assigned.
      const el = await probe();
      el.open = true;
      await settle(el);
      expect(el.open).to.equal(true);

      el.disabled = true;
      await settle(el);
      expect(el.open).to.equal(false);
    });

    it('allows assigning the default while blocked', async () => {
      // Refusing this would make `el.open = false` fail on a disabled element.
      const el = await probe('disabled');
      el.open = false;
      await settle(el);
      expect(el.open).to.equal(false);
    });

    it('blocks on the attribute path too', async () => {
      expect((await probe('disabled open')).open).to.equal(false);
    });
  });

  it('tolerates a blocked prop with no generated accessor to wrap', async () => {
    // `noAccessor` means Lit defines nothing, so there is no setter to patch.
    // The installer must leave it alone rather than replace someone else's
    // definition — and must not reach for `desc.get` on a descriptor that does
    // not exist, which is what the short-circuit in that guard is for.
    class BareProbe extends DeclaredPropsMixin(LitElement) {
      static properties = {
        open: { ...flag(false, { blockedBy: 'disabled' }), noAccessor: true },
        disabled: { type: Boolean },
      };
      render() {
        return html``;
      }
    }
    if (!customElements.get('arc-props-bare')) customElements.define('arc-props-bare', BareProbe);

    const el = mount('<arc-props-bare></arc-props-bare>');
    await settle(el);
    expect(el.open, 'construction should still normalise to the declared default').to.equal(false);
  });

  it('leaves undeclared properties alone', async () => {
    const el = await probe();
    el.limit = 999;
    await settle(el);
    expect(el.limit, 'the mixin normalised a property it does not declare').to.equal(999);
  });
});

describe('declared defaults are available before the first render', () => {
  // The guarantee that makes the hand-written constructor defaults redundant.
  // Normalisation alone runs in hostUpdate, which is too late for a value read
  // off a freshly created element — and a consumer doing
  // `document.createElement('arc-x').someFlag` never waits for a render.
  it('seeds a flag at construction', () => {
    expect(document.createElement('arc-props-probe').dots).to.equal(true);
  });

  it('seeds an enum at construction', () => {
    expect(document.createElement('arc-props-probe').tone).to.equal('neutral');
  });

  it('seeds a number at construction', () => {
    expect(document.createElement('arc-props-probe').count).to.equal(0);
  });

  it('lets a component override the seeded default in its own constructor', () => {
    // The mixin constructor runs first, so a subclass body still wins — which
    // is what keeps this safe to apply to every adopted component at once.
    class Overriding extends Probe {
      constructor() {
        super();
        this.tone = 'danger';
      }
    }
    if (!customElements.get('arc-props-override')) {
      customElements.define('arc-props-override', Overriding);
    }
    expect(document.createElement('arc-props-override').tone).to.equal('danger');
  });
});

describe('computed defaults', () => {
  // Added for arc-calendar, whose month and year default to the current month
  // and year. Before this a prop with no literal default could not adopt the
  // vocabulary at all: a static default would fight the constructor, and
  // conformance's "starts on its declared default" would be wrong by design.
  it('resolves a function default through normalizeValue', () => {
    const m = meta(num({ default: () => 7 }));
    expect(normalizeValue({}, m, 'not-a-number')).to.equal(7);
  });

  it('passes the element in, so a default can depend on a sibling prop', () => {
    const m = meta(num({ default: (el) => el.fallbackTo }));
    expect(normalizeValue({ fallbackTo: 12 }, m, 'nope')).to.equal(12);
  });

  it('resolves per call rather than freezing at declaration time', () => {
    let n = 0;
    const m = meta(num({ default: () => (n += 1) }));
    expect(normalizeValue({}, m, 'x')).to.equal(1);
    expect(normalizeValue({}, m, 'x'), 'the default was cached').to.equal(2);
  });

  it('works for an enum, where the member list cannot be checked statically', () => {
    // oneOf() throws on a literal default outside its set; a computed one has
    // nothing to check at declaration time, so the throw is skipped.
    expect(() => oneOf(['a', 'b'], { default: () => 'b' })).to.not.throw();
    const m = meta(oneOf(['a', 'b'], { default: () => 'b' }));
    expect(normalizeValue({}, m, 'zzz')).to.equal('b');
  });

  it('still refuses a literal default outside the set', () => {
    expect(() => oneOf(['a', 'b'], { default: 'c' })).to.throw(/not one of/);
  });

  it('seeds a computed default at construction', async () => {
    class Computed extends DeclaredPropsMixin(LitElement) {
      static properties = { n: num({ default: () => 41 + 1 }) };
      render() {
        return html``;
      }
    }
    if (!customElements.get('arc-props-computed')) {
      customElements.define('arc-props-computed', Computed);
    }
    expect(document.createElement('arc-props-computed').n).to.equal(42);
  });
});
