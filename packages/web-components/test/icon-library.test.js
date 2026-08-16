/**
 * arc-icon-library — the declarative form of `iconRegistry.use()`.
 *
 * This was the only one of 207 tags with **no coverage of any kind**: it
 * declared no props through the vocabulary, exposed no slots and no CSS parts,
 * so both derived suites had nothing to derive from, and no hand-written test
 * named it. Thirty-one lines, entirely side effect — `render()` returns
 * undefined and the element draws nothing.
 *
 * Finding #79 gave it a declared `name`, which put it back in front of the
 * derived suites; 4.7 took that away again, because the set of library names is
 * open now and `oneOf` would rewrite a consumer's own registered library to
 * `phosphor`. So `name` is a bare string, exactly as `arc-icon.name` is and for
 * the same reason — both are open-ended names looked up in a registry — and the
 * two conformance cases it used to derive are replaced below by hand, along
 * with the one that pins where the loudness went instead.
 *
 * Its whole observable contract is the call it makes, so that call is what is
 * asserted, by standing in for `iconRegistry.use`. The registry's active
 * library is module-level state with no getter, and it is global to the page —
 * hence the save/restore in afterEach. A leaked `lucide` here would change what
 * every later icon test resolves.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';
import { iconRegistry } from '../src/content/icon-registry.js';
import '../src/content/icon-library.register.js';

const realUse = iconRegistry.use;

/** Record every use() call, still applying it so the registry stays coherent. */
function spyUse() {
  const calls = [];
  iconRegistry.use = function (library) {
    calls.push(library);
    return realUse.call(this, library);
  };
  return calls;
}

afterEach(() => {
  iconRegistry.use = realUse;
  iconRegistry.use('phosphor');
  cleanup();
});

describe('arc-icon-library', () => {
  it('selects its library on connect, before any render', async () => {
    // connectedCallback rather than firstUpdated, deliberately: an arc-icon
    // elsewhere on the page may resolve during the same task, and a library
    // chosen a render later would resolve the first icons from the wrong one.
    const calls = spyUse();
    const el = mount('<arc-icon-library name="lucide"></arc-icon-library>');

    expect(calls, 'called during upgrade, not on first update').to.eql(['lucide']);
    await settle(el);
  });

  it('selects nothing when it has no name', async () => {
    // 4.7: core ships no icons and names no default library, so an
    // `<arc-icon-library>` with no attribute has nothing to say. Selecting a
    // default here would be worse than doing nothing — it would silently
    // *deselect* a library the page had already chosen, which is the exact
    // shape of the bug this element exists to prevent.
    const calls = spyUse();
    const el = mount('<arc-icon-library></arc-icon-library>');
    await settle(el);

    expect(el.name).to.equal('');
    expect(calls).to.eql([]);
  });

  it('re-selects when the name changes', async () => {
    const el = mount('<arc-icon-library></arc-icon-library>');
    await settle(el);
    const calls = spyUse();

    el.name = 'lucide';
    await settle(el);

    expect(calls).to.eql(['lucide']);
  });

  it('does not re-select when some other property updates', async () => {
    // The `changed.has('name')` guard. use() resets nothing today, but it is
    // the seam every future registry change goes through.
    const el = mount('<arc-icon-library name="lucide"></arc-icon-library>');
    await settle(el);
    const calls = spyUse();

    el.requestUpdate();
    await settle(el);

    expect(calls).to.eql([]);
  });

  it('re-selects on reconnect, so a moved element still owns the library', async () => {
    const el = mount('<arc-icon-library name="lucide"></arc-icon-library>');
    await settle(el);
    const calls = spyUse();

    const host = document.createElement('div');
    document.body.appendChild(host);
    el.remove();
    host.appendChild(el);
    await settle(el);

    expect(calls).to.eql(['lucide']);
  });

  it('renders nothing', async () => {
    const el = mount('<arc-icon-library name="lucide"></arc-icon-library>');
    await settle(el);

    expect(el.shadowRoot.textContent.trim()).to.equal('');
    expect(el.shadowRoot.children.length).to.equal(0);
  });

  it('reflects its name for styling and inspection', async () => {
    const el = document.createElement('arc-icon-library');
    document.body.appendChild(el);
    el.name = 'lucide';
    await settle(el);
    expect(el.getAttribute('name')).to.equal('lucide');
  });

  /*
   * Finding #79, and 4.7's deliberate reversal of half of it.
   *
   * #79 was that `name` was a bare `{ type: String }` while
   * `iconRegistry.use()` threw on anything that was not 'phosphor' or 'lucide'
   * — from inside `connectedCallback`, where a custom-element reaction's
   * exception is reported *globally* rather than propagated. One typo in
   * markup raised during element upgrade, nothing at the call site could catch
   * it, and the element's connect was abandoned partway through.
   * `oneOf(['phosphor', 'lucide'])` fixed it by normalising the typo away.
   *
   * 4.7 removed the throw at the source: libraries register themselves, so the
   * set of valid names is open and `use()` records whatever it is given. That
   * makes the enum wrong rather than merely redundant — it would rewrite a
   * consumer's own registered library to `phosphor`. So the enum is gone and
   * these two tests pin what has to survive without it: nothing escapes the
   * upgrade, and the name is *not* quietly changed.
   *
   * The loudness #79 cared about did not go anywhere; it moved to `get()`,
   * which is the place that knows what is registered. That is the test below.
   */
  it('passes an unknown library name through without throwing on upgrade', async () => {
    // The reaction is invoked directly rather than by putting the tag in
    // markup: a custom-element reaction that throws is reported as a *global*
    // error, and the runner's own uncaught handler is registered before any
    // listener a test can add, so it would claim the failure no matter what
    // this test then asserted. Calling the callback is the same code path with
    // a catchable stack.
    const calls = spyUse();
    const el = document.createElement('arc-icon-library');
    el.name = 'feather';

    let thrown = null;
    try {
      el.connectedCallback();
    } catch (error) {
      thrown = error;
    }

    expect(thrown, 'no exception escapes the upgrade').to.equal(null);
    expect(calls, 'and the name reaches the registry unaltered').to.eql(['feather']);
  });

  it('keeps an unknown name assigned after mount', async () => {
    const el = mount('<arc-icon-library name="lucide"></arc-icon-library>');
    await settle(el);
    const calls = spyUse();

    let thrown = null;
    try {
      el.name = 'feather';
      await settle(el);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).to.equal(null);
    expect(el.name, 'the typo is not rewritten to something that works').to.equal('feather');
    expect(calls).to.eql(['feather']);
  });

  it('makes an unregistered library loud, once, from the registry', async () => {
    // What replaces the enum. A typo used to be normalised into silence; now it
    // is carried through and reported by the one place that can name the
    // alternatives. Without this the reversal above would be a pure regression.
    //
    // A stub library rather than a real pack, for two reasons: this file must
    // not depend on generated icons, and the message has two branches — "here
    // is what is registered" and "here is how to install a pack" — of which
    // only the first is under test. Asserting on the string 'phosphor' would
    // have passed against the *other* branch, whose install line names it.
    iconRegistry.register('stub-library', { icons: { check: '<svg></svg>' } });

    const warnings = [];
    const realWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));
    try {
      const el = mount('<arc-icon-library name="feather"></arc-icon-library>');
      await settle(el);
      expect(await iconRegistry.get('check'), 'nothing resolves').to.equal(null);
      await iconRegistry.get('circle');
    } finally {
      console.warn = realWarn;
    }

    expect(warnings.length, 'once per library, not once per icon').to.equal(1);
    expect(warnings[0], 'names the library that is missing').to.contain('feather');
    expect(warnings[0], 'and what it could have used instead').to.contain(
      'Registered: stub-library',
    );
  });

  it('still honours a name it does know', async () => {
    // Anti-vacuity: a component that normalised *everything* to phosphor would
    // pass both tests above.
    const el = mount('<arc-icon-library name="lucide"></arc-icon-library>');
    await settle(el);
    expect(el.name).to.equal('lucide');
  });
});
