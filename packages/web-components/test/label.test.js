/**
 * arc-label — the `for` → focus bridge, and the two self-hiding slots.
 *
 * The interesting part is `_onClick`. A native `<label for>` cannot reach a
 * control outside its own root, and this label's `<label>` lives in a shadow
 * tree while the input it names lives in the page — so the association the
 * attribute *implies* does not exist and the component re-implements it by
 * hand. That hand-written lookup is the whole contract and had no test.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, tick, deepActive } from './helpers.js';
import '../src/input/label.register.js';

afterEach(cleanup);

const labelEl = (el) => el.shadowRoot.querySelector('[part="label"]');
const description = (el) => el.shadowRoot.querySelector('[part="description"]');

// ---------------------------------------------------------------------------
// The for → focus bridge
// ---------------------------------------------------------------------------

describe('arc-label: clicking focuses the control it names', () => {
  it('focuses a control by id', async () => {
    const wrap = mount(`
      <div>
        <arc-label for="email">Email</arc-label>
        <input id="email" />
      </div>`);
    const el = wrap.querySelector('arc-label');
    await settle(el);

    labelEl(el).click();
    await tick();

    expect(deepActive() === wrap.querySelector('#email')).to.equal(true);
  });

  it('does nothing when it names no control', async () => {
    const wrap = mount(`
      <div>
        <arc-label>Standalone</arc-label>
        <input id="email" />
      </div>`);
    const el = wrap.querySelector('arc-label');
    await settle(el);
    const before = deepActive();

    expect(() => labelEl(el).click()).to.not.throw();
    await tick();
    expect(deepActive() === before, 'focus is left alone').to.equal(true);
  });

  it('does nothing when the named control is not there', async () => {
    const el = mount('<arc-label for="missing">Ghost</arc-label>');
    await settle(el);

    expect(() => labelEl(el).click()).to.not.throw();
  });

  it('survives a target that cannot take focus', async () => {
    // `target?.focus?.()` — the optional call is load-bearing, since an id can
    // name anything at all.
    const wrap = mount(`
      <div>
        <arc-label for="plain">Label</arc-label>
        <template id="plain"></template>
      </div>`);
    const el = wrap.querySelector('arc-label');
    await settle(el);

    expect(() => labelEl(el).click()).to.not.throw();
  });

  // Was a BUG pin (finding #77). The lookup was `querySelector('#' + this.for)`,
  // splicing the id into a CSS selector. HTML ids may be almost anything —
  // `2fa-code`, `user.email`, `field:1` are all legal and all routine in
  // generated forms — while a CSS id selector may not begin with a digit or
  // carry an unescaped `.` or `:`. querySelector threw SyntaxError, the
  // exception escaped the click handler, and the document-level fallback on
  // the same line — which would have worked — never ran.
  const AWKWARD_IDS = ['2fa-code', 'user.email', 'field:1'];

  for (const id of AWKWARD_IDS) {
    it(`focuses a control whose id is legal HTML but not a legal CSS selector: ${id}`, async () => {
      const wrap = mount(`
        <div>
          <arc-label for="${id}">Code</arc-label>
          <input id="${id}" />
        </div>`);
      const el = wrap.querySelector('arc-label');
      await settle(el);

      // getElementById, not querySelector — the assertion must not trip over
      // the same invalid selector it is testing for. (It did, first time round.)
      const target = document.getElementById(id);
      expect(target, 'the input is findable the correct way').to.not.equal(null);

      let thrown = null;
      try {
        el._onClick();
      } catch (error) {
        thrown = error;
      }

      expect(thrown, 'no exception escapes the handler').to.equal(null);
      expect(deepActive() === target, 'and focus lands on the named control').to.equal(true);
    });
  }
});
