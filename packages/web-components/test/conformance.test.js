/**
 * Conformance — assertions derived from each component's declared contract.
 *
 * This file contains no per-component knowledge and no CASES table. It reads
 * the `arc` metadata that shared/props.js attaches to each declaration and
 * derives the assertions from it, so a component gains coverage by adopting the
 * vocabulary rather than by someone remembering to add a row here. A
 * hand-maintained table is complete only insofar as it is maintained; this is
 * complete by construction.
 *
 * It also fixes the second thing the mutation run found. Fixtures are derived
 * from the declared range, so an `int({ min: 0, max: 'count' })` is probed at
 * values where the arithmetic is observable — never at a degenerate min of 0,
 * which is what silently made every arithmetic mutant in range-slider.test.js
 * unkillable regardless of how the assertion was written.
 *
 * What it deliberately does NOT cover: bespoke behaviour — drag gestures,
 * keyboard protocols, focus management, the v3 close contract. Those have no
 * declaration to derive from and stay hand-written, which is where mutation
 * score is the right instrument.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';
import { declaredProps, normalizeValue, defaultOf } from '../src/shared/props.js';

// Discover which components carry declared props, rather than listing them.
// There is nothing to maintain here: a component joins this suite by adopting
// the vocabulary, and cannot be adopted-but-unverified.
//
// Modules are imported one at a time rather than through src/register.js,
// which cannot load in a browser — arc-qr-code depends on a CommonJS package
// that has no ESM default export. Failures are collected and asserted on below
// instead of being swallowed, so a component that stops importing is a test
// failure rather than a quietly smaller suite.
const manifest = await fetch(new URL('../custom-elements.json', import.meta.url)).then((r) =>
  r.json(),
);

// Optional scope, set by the page before this module loads. Importing all 207
// component modules costs ~40s, which is fine once and impossible per mutant —
// the Stryker harness sets this to the components under mutation. Also handy
// for debugging one component without waiting for the rest.
const ONLY = globalThis.__ARC_CONFORMANCE_ONLY__ ?? null;

const modules = manifest.modules
  .map((m) => ({ path: m.path, tags: (m.declarations ?? []).map((d) => d.tagName).filter(Boolean) }))
  .filter((m) => m.tags.length)
  .filter((m) => !ONLY || m.tags.some((t) => ONLY.includes(t)));

const unimportable = [];
for (const { path } of modules) {
  try {
    // The manifest points at the class module; the custom element is defined by
    // its `.register.js` sibling, and customElements.get() is how a component is
    // discovered below.
    const registerPath = path.replace(/\.js$/, '.register.js');
    await import(/* @vite-ignore */ new URL(`../${registerPath}`, import.meta.url).href);
  } catch (error) {
    unimportable.push(`${path}: ${error.message.slice(0, 80)}`);
  }
}

const ADOPTED = modules
  .flatMap((m) => m.tags)
  .filter((tag) => {
    const Ctor = customElements.get(tag);
    return Ctor && declaredProps(Ctor).length > 0;
  });

describe('conformance discovery', () => {
  it('discovers the adopted components', () => {
    // Guards the whole file against silently becoming a no-op: derived tests
    // that run against an empty list still report green.
    // Scoped runs verify only what they were pointed at; the unscoped suite
    // must find the whole library or it has silently stopped testing.
    expect(ADOPTED.length, 'no components with declared props were discovered').to.be.greaterThan(
      ONLY ? 0 : 100,
    );
  });

  it('every component module imports', () => {
    // arc-qr-code is the known exception; anything else is a real regression.
    const unexpected = unimportable.filter((u) => !u.includes('qr-code'));
    expect(unexpected, `modules failed to import:\n${unexpected.join('\n')}`).to.have.lengthOf(0);
  });
});

afterEach(() => cleanup());

/** A value that is definitely not a member of the declared set. */
const NOT_A_MEMBER = '__not_a_declared_value__';

async function make(tag, attrs = '') {
  const el = mount(`<${tag} ${attrs}></${tag}>`);
  await settle(el);
  return el;
}

/**
 * Per-prop wiring — two assertions, not twelve.
 *
 * What is genuinely per-component is whether the declaration is *live* on this
 * prop. The vocabulary's behaviour is not: it is one shared implementation, and
 * exercising it once per prop per member told us the same thing 238 times (see
 * the header). So the mechanics moved to props.test.js and what stays here is:
 *
 *   1. the prop starts on its declared default   — catches a component that
 *      initialises it to something else, which is real: every flag(true) also
 *      hand-writes its default in a constructor, and the two can disagree
 *      (finding #71).
 *   2. the prop still satisfies its declaration after being handed an illegal
 *      value — catches the mixin being dropped, an accessor overridden, or the
 *      controller not running for this prop.
 *
 * (2) is written as a fixed-point check rather than an expected value:
 * `normalizeValue(el, meta, el[name])` must equal `el[name]`, i.e. the value the
 * component settled on already satisfies its own contract. That is kind-agnostic,
 * needs no per-kind expectation table, and cannot be satisfied by a component
 * that simply ignored the assignment — an un-normalised value is not a fixed
 * point.
 */

/** An input no declaration accepts, per kind. */
function illegalFor(meta) {
  if (meta.kind === 'enum') return NOT_A_MEMBER;
  if (meta.kind === 'flag') return '__not_a_boolean__';
  // A list is probed with a scalar rather than a malformed array literal: the
  // markup half of this test spells the probe into an attribute, and
  // `items="__not_a_list__"` is exactly the JSON.parse failure list() exists to
  // absorb without throwing.
  if (meta.kind === 'list') return '__not_a_list__';
  // A clamped number is probed out of range, which exercises the clamp wiring;
  // an unclamped one is probed with a non-number, which exercises the fallback.
  return meta.clamp === 'toRange' ? 9999 : '__not_a_number__';
}

for (const tag of ADOPTED) {
  const Ctor = customElements.get(tag);

  describe(`${tag} — declared contract`, () => {
    it('is registered and carries at least one declared prop', () => {
      expect(Ctor, `${tag} is not registered`).to.be.a('function');
      expect(declaredProps(Ctor).length, `${tag} declares no arc props`).to.be.greaterThan(0);
    });

    for (const [name, meta] of declaredProps(Ctor ?? {})) {
      const attr = name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

      it(`${name} starts on its declared default`, () => {
        // Deliberately read before the element is mounted or rendered.
        // Normalisation in hostUpdate would cover for a missing initial value
        // and this must not depend on it: a consumer reading
        // `document.createElement('arc-x').someFlag` gets the value now, not
        // after a render that may never happen. The mixin seeds declared
        // defaults at construction so this holds (see finding #71).
        const el = document.createElement(tag);
        // Resolved, not read raw: a computed default (arc-calendar's month and
        // year) is a function on the declaration and a value on the element.
        //
        // Deep rather than strict, which matters for exactly one kind: a
        // `list()` default is a *factory*, so two elements never share one
        // array and `defaultOf` returns a fresh one on every call. Strict
        // equality would fail every list prop in the library for the reason the
        // factory exists. Deep equality is identical to strict for every scalar
        // kind, so this stays one assertion rather than a per-kind branch.
        expect(el[name], `${tag}.${name} does not start on its declared default`).to.eql(
          defaultOf(el, meta),
        );
      });

      // A derived prop is an output the component computes and publishes, so
      // handing it a value tests the wrong direction.
      const settable = meta.derived ? it.skip : it;

      settable(`${name} enforces its declaration on both paths`, async () => {
        const illegal = illegalFor(meta);

        const fromScript = await make(tag);
        fromScript[name] = illegal;
        await settle(fromScript);
        expect(
          normalizeValue(fromScript, meta, fromScript[name]),
          `${tag}.${name} kept a value its declaration rejects, set from script`,
        ).to.equal(fromScript[name]);

        const fromMarkup = await make(tag, `${attr}="${illegal}"`);
        expect(
          normalizeValue(fromMarkup, meta, fromMarkup[name]),
          `${tag}.${name} kept a value its declaration rejects, set from markup`,
        ).to.equal(fromMarkup[name]);
      });

      if (meta.blockedBy) {
        it(`${name} names a real property in blockedBy (${meta.blockedBy})`, async () => {
          // Declaration validity, not mechanism: a typo here would never block
          // anything and never fail, because an undefined property is falsey.
          // The constraint would silently not exist.
          const el = await make(tag);
          expect(
            Ctor.elementProperties.has(meta.blockedBy),
            `${tag} declares ${name} blockedBy "${meta.blockedBy}", which is not a property`,
          ).to.equal(true);
          expect(el[meta.blockedBy], `${meta.blockedBy} should start falsey`).to.not.equal(true);
        });
      }
    }
  });
}
