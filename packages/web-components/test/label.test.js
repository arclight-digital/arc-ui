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

  // BUG (finding #77): the lookup is `querySelector('#' + this.for)`, so the
  // id is spliced into a CSS selector. HTML ids may be almost anything —
  // `2fa-code`, `user.email`, `field:1` are all legal and all common in
  // generated forms — but a CSS id selector may not start with a digit or
  // contain an unescaped `.` or `:`. querySelector throws SyntaxError, the
  // exception escapes the click handler, and the `document.getElementById`
  // fallback on the next line — which would have worked — never runs.
  //
  // Fix is one call: getElementById on the root, or CSS.escape(this.for).
  it('BUG: an id that is legal HTML but not a legal CSS selector throws', async () => {
    const wrap = mount(`
      <div>
        <arc-label for="2fa-code">Code</arc-label>
        <input id="2fa-code" />
      </div>`);
    const el = wrap.querySelector('arc-label');
    await settle(el);

    // getElementById, not querySelector — the assertion must not trip over the
    // same invalid selector it is testing for. (It did, first time round.)
    const target = document.getElementById('2fa-code');
    expect(target, 'the input is findable the correct way').to.not.equal(null);

    let thrown = null;
    try {
      el._onClick();
    } catch (error) {
      thrown = error;
    }

    expect(thrown, 'should focus the input instead of throwing').to.be.instanceOf(DOMException);
    expect(thrown.name).to.equal('SyntaxError');
    expect(deepActive() === target, 'and focus never moves').to.equal(false);
  });
});

// ---------------------------------------------------------------------------
// The required indicator
// ---------------------------------------------------------------------------

describe('arc-label: the required indicator', () => {
  it('is absent by default', async () => {
    const el = mount('<arc-label>Name</arc-label>');
    await settle(el);
    expect(el.shadowRoot.querySelector('.label__required')).to.equal(null);
  });

  it('appears when required, hidden from assistive tech', async () => {
    // The asterisk is decoration: the control itself carries `required`, and a
    // screen reader announcing "star" after every field name is noise.
    const el = mount('<arc-label required>Name</arc-label>');
    await settle(el);
    const star = el.shadowRoot.querySelector('.label__required');

    expect(star.textContent.trim()).to.equal('*');
    expect(star.getAttribute('aria-hidden')).to.equal('true');
  });

  it('required="false" leaves it off', async () => {
    // required is flag(), so the string "false" is false — see props.test.js.
    const el = mount('<arc-label required="false">Name</arc-label>');
    await settle(el);
    expect(el.shadowRoot.querySelector('.label__required')).to.equal(null);
  });
});

// ---------------------------------------------------------------------------
// The self-hiding slots
// ---------------------------------------------------------------------------

describe('arc-label: description and tooltip collapse when empty', () => {
  it('hides the description wrapper with nothing slotted', async () => {
    const el = mount('<arc-label>Name</arc-label>');
    await settle(el);

    expect(description(el).classList.contains('description--empty')).to.equal(true);
    expect(getComputedStyle(description(el)).display, 'and takes no space').to.equal('none');
  });

  it('shows it once content arrives', async () => {
    const el = mount('<arc-label>Name<span slot="description">Your work address</span></arc-label>');
    await settle(el);

    expect(description(el).classList.contains('description--empty')).to.equal(false);
    expect(getComputedStyle(description(el)).display).to.not.equal('none');
  });

  it('reacts to content added after first render', async () => {
    // slotchange, not a first-render snapshot: these labels are rendered from
    // data that arrives late as often as not.
    const el = mount('<arc-label>Name</arc-label>');
    await settle(el);
    expect(description(el).classList.contains('description--empty')).to.equal(true);

    const note = document.createElement('span');
    note.slot = 'description';
    note.textContent = 'added later';
    el.appendChild(note);
    await settle(el);

    expect(description(el).classList.contains('description--empty')).to.equal(false);
  });

  it('collapses again when the content is removed', async () => {
    const el = mount('<arc-label>Name<span slot="description">gone soon</span></arc-label>');
    await settle(el);
    expect(description(el).classList.contains('description--empty')).to.equal(false);

    el.querySelector('[slot="description"]').remove();
    await settle(el);

    expect(description(el).classList.contains('description--empty')).to.equal(true);
  });

  it('does the same for the tooltip slot', async () => {
    const el = mount('<arc-label>Name</arc-label>');
    await settle(el);
    const tip = el.shadowRoot.querySelector('.label__tooltip');
    expect(tip.classList.contains('label__tooltip--empty')).to.equal(true);

    const icon = document.createElement('span');
    icon.slot = 'tooltip';
    icon.textContent = '?';
    el.appendChild(icon);
    await settle(el);

    expect(tip.classList.contains('label__tooltip--empty')).to.equal(false);
  });
});
