/**
 * arc-icon-library — the declarative form of `iconRegistry.use()`.
 *
 * This was the only one of 207 tags with **no coverage of any kind**: it
 * declared no props through the vocabulary, exposed no slots and no CSS parts,
 * so both derived suites had nothing to derive from, and no hand-written test
 * named it. Thirty-one lines, entirely side effect — `render()` returns
 * undefined and the element draws nothing. It has a declared `name` now
 * (finding #79), so the derived suites see it too.
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

  it('defaults to phosphor', async () => {
    const calls = spyUse();
    const el = mount('<arc-icon-library></arc-icon-library>');
    await settle(el);

    expect(el.name).to.equal('phosphor');
    // Twice, not once: connectedCallback selects it, and the first update sees
    // `name` in `changed` (the constructor set it) and selects it again.
    // Harmless — use() is a plain assignment — but pinned as observed rather
    // than tidied away, so anyone who makes use() do more work finds this here
    // instead of in production.
    expect(calls).to.eql(['phosphor', 'phosphor']);
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
    const el = mount('<arc-icon-library></arc-icon-library>');
    await settle(el);
    expect(el.getAttribute('name')).to.equal('phosphor');
  });

  // Was two BUG pins (finding #79). `name` was a bare `{ type: String }` and
  // `iconRegistry.use()` throws on anything that is not 'phosphor' or
  // 'lucide' — from inside `connectedCallback`, where a custom-element
  // reaction's exception is reported *globally* rather than propagated. One
  // typo in markup therefore raised during element upgrade, nothing at the
  // call site could catch it, and the element's connect was abandoned partway
  // through. `oneOf(['phosphor', 'lucide'])` normalises the typo instead,
  // which is what every other enum in the library already does.
  it('normalises an unknown library name instead of throwing on upgrade', async () => {
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
    expect(calls, 'and the registry is asked for the default').to.eql(['phosphor']);
  });

  it('normalises an unknown name assigned after mount', async () => {
    const el = mount('<arc-icon-library></arc-icon-library>');
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
    expect(el.name, 'the property lands on the default, not on the typo').to.equal('phosphor');
    expect(calls.every((c) => c === 'phosphor')).to.equal(true);
  });

  it('still honours a name it does know', async () => {
    // Anti-vacuity: a component that normalised *everything* to phosphor would
    // pass both tests above.
    const el = mount('<arc-icon-library name="lucide"></arc-icon-library>');
    await settle(el);
    expect(el.name).to.equal('lucide');
  });
});
