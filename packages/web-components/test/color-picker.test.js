/**
 * arc-color-picker — saturation area, hue track, hex field, preset swatches.
 *
 * The headline contract is the edit/commit split documented on `_updateFromHSL`:
 * dragging fires `arc-input` per frame and `arc-change` exactly once, on release.
 * It is called out in the source as a past regression ("anything expensive on
 * that listener ran hundreds of times per drag"), so it gets the sharpest tests
 * here — a drag with several moves, asserting the *counts*, not just that both
 * events happened.
 *
 * Colour fixtures are chosen per branch of `_hslToHex`, which is a six-way `if`
 * on hue. Testing one mid-blue would leave five arms unexercised, so the round
 * trips below step 0/120/240 (the arm boundaries) plus a grey, which is the
 * `d === 0` short-circuit in `_parseHex` where hue is undefined and forced to 0.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, drag, record, only, keyOn } from './helpers.js';

import '../src/input/color-picker.register.js';

afterEach(() => cleanup());

async function picker(attrs = '', props = {}) {
  const el = mount(`<arc-color-picker ${attrs}></arc-color-picker>`);
  Object.assign(el, props);
  await settle(el);
  return el;
}

const area = (el) => el.shadowRoot.querySelector('.picker__area');
const hueTrack = (el) => el.shadowRoot.querySelector('.picker__hue-track');
const hexField = (el) => el.shadowRoot.querySelector('.picker__hex-input');
const preview = (el) => el.shadowRoot.querySelector('.picker__preview');
const crosshair = (el) => el.shadowRoot.querySelector('.picker__crosshair');
const hueThumb = (el) => el.shadowRoot.querySelector('.picker__hue-thumb');
const swatches = (el) => [...el.shadowRoot.querySelectorAll('.picker__swatch')];

/**
 * The HSL the picker is *showing*, read back out of the styles it renders.
 *
 * `_hue`/`_sat`/`_lit` are state, and state is not the contract: a picker that
 * parsed a hex perfectly and stopped positioning the crosshair or the hue thumb
 * would satisfy every assertion made against those fields and show the wrong
 * colour. The raw `style` attribute is read rather than the computed value
 * because the browser serialises `hsl()` to `rgb()`, which would throw away the
 * sub-integer precision finding #62 is about.
 */
const styleOf = (node) => node.getAttribute('style') ?? '';
const shownHue = (el) => Number(/hsl\(\s*([-\d.]+)/.exec(styleOf(hueThumb(el)))[1]);
const shownSat = (el) => Number(/left:\s*([-\d.]+)%/.exec(styleOf(crosshair(el)))[1]);
const shownLit = (el) => 100 - Number(/top:\s*([-\d.]+)%/.exec(styleOf(crosshair(el)))[1]);
const shownHsl = (el) => [shownHue(el), shownSat(el), shownLit(el)];

/** Type into the hex field and commit the way the component defines it. */
async function typeHex(el, text, { commit = 'blur' } = {}) {
  const f = hexField(el);
  // Focus first: the Enter path works by calling `blur()` on the field, which
  // only emits a blur event if the field actually held focus.
  f.focus();
  f.value = text;
  f.dispatchEvent(new Event('input', { bubbles: true }));
  await settle(el);
  if (commit === 'blur') f.dispatchEvent(new Event('blur', { bubbles: true }));
  else keyOn(f, 'Enter');
  await settle(el);
}

/** A point at (fx, fy) as fractions of an element's box. */
function at(el, fx, fy) {
  const r = el.getBoundingClientRect();
  return { clientX: r.left + r.width * fx, clientY: r.top + r.height * fy };
}

describe('arc-color-picker colour conversion', () => {
  // Colours that survive the trip exactly. All of them sit on an HSL lattice
  // point, which is the tell: see the rounding finding below.
  const EXACT = ['#ff0000', '#00ff00', '#0000ff', '#808080', '#000000', '#ffffff'];

  for (const hex of EXACT) {
    it(`round-trips ${hex} through HSL and back`, async () => {
      const el = await picker('', { value: hex });
      // _parseHex ran on the value; rebuilding from the HSL *the picker
      // rendered* must land on the same colour, or the area and the swatch
      // disagree about what is set. `_hslToHex` is used here as the tool, not
      // as the subject — the numbers going into it are the ones that reached
      // the DOM, so this closes the hex → HSL → styles → hex loop.
      expect(el._hslToHex(...shownHsl(el))).to.equal(hex);
    });
  }

  /**
   * Finding #62, fixed. `_parseHex` used to round hue, saturation and lightness
   * to whole numbers, so the internal state could not represent most of the
   * 16.7M hex colours it accepts — `#4d7ef7`, the component's **own default**,
   * came back as `#507ff7`. Visible as a colour that jumped to a neighbour it
   * had never been on as soon as the hue slider moved a pixel.
   *
   * The colours in EXACT above all sit on the integer-HSL lattice, which is why
   * they round-tripped even while this was broken. These two do not.
   */
  it('round-trips a colour off the integer-HSL lattice', async () => {
    const el = await picker('', { value: '#4d7ef7' });
    expect(el._hslToHex(...shownHsl(el))).to.equal('#4d7ef7');
  });

  it('round-trips its own default value', async () => {
    const el = await picker();
    expect(el.value).to.equal('#4d7ef7');
    expect(el._hslToHex(...shownHsl(el))).to.equal(el.value);
  });

  it('keeps sub-integer precision rather than snapping', async () => {
    // The anti-regression for the fix itself: if these were rounded again, the
    // round trips above would be the only thing failing and it would be easy to
    // read them as a conversion-arithmetic problem instead.
    const el = await picker('', { value: '#4d7ef7' });
    const whole = shownHsl(el).every((n) => Number.isInteger(n));
    expect(whole, 'HSL state was rounded to integers').to.equal(false);
  });

  it('reads hue from a pure red', async () => {
    const el = await picker('', { value: '#ff0000' });
    expect(shownHue(el)).to.equal(0);
    expect(shownSat(el)).to.equal(100);
    expect(shownLit(el)).to.equal(50);
  });

  it('reads hue from a pure green', async () => {
    const el = await picker('', { value: '#00ff00' });
    expect(shownHue(el)).to.equal(120);
  });

  it('reads hue from a pure blue', async () => {
    const el = await picker('', { value: '#0000ff' });
    expect(shownHue(el)).to.equal(240);
  });

  it('gives an achromatic colour zero saturation', async () => {
    // The `d === 0` branch: hue is genuinely undefined for grey and is pinned
    // to 0 rather than left as NaN.
    const el = await picker('', { value: '#808080' });
    expect(shownSat(el)).to.equal(0);
    expect(shownHue(el)).to.equal(0);
  });

  it('ignores a malformed value rather than rendering NaN', async () => {
    const el = await picker('', { value: '#4d7ef7' });
    const before = shownHsl(el);
    el.value = 'not-a-colour';
    await settle(el);
    expect(shownHsl(el), 'garbage reached the HSL state').to.eql(before);
  });

  it('ignores a three-digit shorthand, which it does not claim to accept', async () => {
    const el = await picker('', { value: '#4d7ef7' });
    const before = shownHue(el);
    el.value = '#f00';
    await settle(el);
    expect(shownHue(el)).to.equal(before);
  });
});

describe('arc-color-picker rendering', () => {
  it('paints the preview and crosshair with the current value', async () => {
    const el = await picker('', { value: '#ff0000' });
    expect(preview(el).getAttribute('style')).to.contain('#ff0000');
    expect(crosshair(el).getAttribute('style')).to.contain('#ff0000');
  });

  it('places the crosshair from saturation and lightness', async () => {
    const el = await picker('', { value: '#ff0000' }); // s=100, l=50
    const style = crosshair(el).getAttribute('style');
    expect(style).to.contain('left: 100%');
    expect(style, 'top is 100 minus lightness').to.contain('top: 50%');
  });

  it('places the hue thumb along the track', async () => {
    const el = await picker('', { value: '#0000ff' }); // h=240 of 360
    expect(hueThumb(el).getAttribute('style')).to.contain('left: 66.66');
  });

  it('shows the hex value in the field', async () => {
    const el = await picker('', { value: '#4d7ef7' });
    expect(hexField(el).value).to.equal('#4d7ef7');
  });

  it('renders the label when given one', async () => {
    const el = await picker('label="Brand"');
    expect(el.shadowRoot.querySelector('.picker__label').textContent.trim()).to.equal('Brand');
  });

  it('renders no preset rail without presets', async () => {
    const el = await picker();
    expect(el.shadowRoot.querySelector('.picker__presets') === null).to.equal(true);
  });
});

describe('arc-color-picker the edit/commit contract', () => {
  it('fires arc-input per move and arc-change once, on release', async () => {
    // The regression named in _updateFromHSL: arc-change used to fire on every
    // frame, so anything expensive on that listener ran hundreds of times.
    const el = await picker('', { value: '#ff0000' });
    const seen = record(el);

    drag(
      area(el),
      [at(area(el), 0.1, 0.5), at(area(el), 0.4, 0.5), at(area(el), 0.7, 0.5)],
      { moveTarget: window },
    );
    await settle(el);

    expect(only(seen, 'input').length, 'one arc-input per pointer event').to.equal(3);
    expect(only(seen, 'change').length, 'arc-change fired per frame').to.equal(1);
  });

  it('commits the value the drag ended on', async () => {
    const el = await picker('', { value: '#ff0000' });
    const seen = record(el);
    drag(area(el), [at(area(el), 0.5, 0.5), at(area(el), 1, 0)], { moveTarget: window });
    await settle(el);
    expect(only(seen, 'change').at(-1)[1]).to.equal(el.value);
  });

  it('orders the whole gesture input-first, change-last', async () => {
    const el = await picker('', { value: '#ff0000' });
    const seen = record(el);
    drag(area(el), [at(area(el), 0.2, 0.2), at(area(el), 0.8, 0.8)], { moveTarget: window });
    await settle(el);
    expect(seen.map(([kind]) => kind)).to.eql(['input', 'input', 'change']);
  });

  it('does the same for the hue track', async () => {
    const el = await picker('', { value: '#ff0000' });
    const seen = record(el);
    drag(hueTrack(el), [at(hueTrack(el), 0.1, 0.5), at(hueTrack(el), 0.6, 0.5)], {
      moveTarget: window,
    });
    await settle(el);
    expect(only(seen, 'input').length).to.equal(2);
    expect(only(seen, 'change').length).to.equal(1);
  });

  it('does not commit a pointerup that never dragged', async () => {
    // _onPointerUp is a window listener and is reached by unrelated releases.
    const el = await picker('', { value: '#ff0000' });
    const seen = record(el);
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    await settle(el);
    expect(only(seen, 'change').length).to.equal(0);
  });
});

describe('arc-color-picker area and hue interaction', () => {
  it('reads saturation from the horizontal position', async () => {
    const el = await picker('', { value: '#ff0000' });
    drag(area(el), [at(area(el), 0.25, 0.5)], { moveTarget: window });
    await settle(el);
    // Not exactly 25: the drag rounds to whole percent, then the release
    // re-parses the committed hex and lands on that colour's *true* saturation.
    // Since #62 that is a float, and the small drift is the 8-bit hex grid
    // rather than a rounding bug.
    expect(shownSat(el)).to.be.closeTo(25, 0.5);
  });

  it('reads lightness from the inverted vertical position', async () => {
    const el = await picker('', { value: '#ff0000' });
    drag(area(el), [at(area(el), 1, 0.25)], { moveTarget: window });
    await settle(el);
    expect(shownLit(el), 'top of the area should be light').to.be.closeTo(75, 0.5);
  });

  it('clamps a drag that leaves the area', async () => {
    const el = await picker('', { value: '#ff0000' });
    const r = area(el).getBoundingClientRect();
    drag(
      area(el),
      [at(area(el), 0.5, 0.5), { clientX: r.left - 500, clientY: r.top - 500 }],
      { moveTarget: window },
    );
    await settle(el);
    expect(shownSat(el)).to.equal(0);
    expect(shownLit(el)).to.equal(100);
  });

  it('reads hue from the horizontal position on the track', async () => {
    const el = await picker('', { value: '#ff0000' });
    drag(hueTrack(el), [at(hueTrack(el), 0.5, 0.5)], { moveTarget: window });
    await settle(el);
    expect(shownHue(el)).to.equal(180);
  });

  it('keeps saturation and lightness while the hue changes', async () => {
    const el = await picker('', { value: '#4d7ef7' });
    const [s, l] = [shownSat(el), shownLit(el)];
    drag(hueTrack(el), [at(hueTrack(el), 0.25, 0.5)], { moveTarget: window });
    await settle(el);
    expect([shownSat(el), shownLit(el)], 'the hue drag disturbed S/L').to.eql([s, l]);
  });

  it('stops tracking the pointer once released', async () => {
    const el = await picker('', { value: '#ff0000' });
    drag(area(el), [at(area(el), 0.5, 0.5)], { moveTarget: window });
    await settle(el);
    const after = el.value;

    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, ...at(area(el), 0.9, 0.9) }),
    );
    await settle(el);
    expect(el.value, 'a move after release still changed the colour').to.equal(after);
  });
});

describe('arc-color-picker hex field', () => {
  it('commits a valid hex on blur', async () => {
    const el = await picker('', { value: '#ff0000' });
    const seen = record(el);
    await typeHex(el, '#00ff00');
    expect(el.value).to.equal('#00ff00');
    expect(only(seen, 'change').length, 'typing is edit-and-commit in one').to.equal(1);
    expect(only(seen, 'input').length).to.equal(1);
  });

  it('commits on Enter', async () => {
    const el = await picker('', { value: '#ff0000' });
    await typeHex(el, '#00ff00', { commit: 'enter' });
    expect(el.value).to.equal('#00ff00');
  });

  it('does not commit per keystroke', async () => {
    const el = await picker('', { value: '#ff0000' });
    const seen = record(el);
    const f = hexField(el);
    for (const text of ['#0', '#00', '#00f', '#00ff', '#00ff0']) {
      f.value = text;
      f.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await settle(el);
    expect(seen.length, 'a partial hex was committed').to.equal(0);
    expect(el.value).to.equal('#ff0000');
  });

  it('adds a missing leading hash', async () => {
    const el = await picker('', { value: '#ff0000' });
    await typeHex(el, '00ff00');
    expect(el.value).to.equal('#00ff00');
  });

  it('lowercases what it accepts', async () => {
    const el = await picker('', { value: '#ff0000' });
    await typeHex(el, '#00FF00');
    expect(el.value).to.equal('#00ff00');
  });

  it('reverts an invalid entry to the current value', async () => {
    const el = await picker('', { value: '#ff0000' });
    await typeHex(el, 'nonsense');
    expect(el.value).to.equal('#ff0000');
    expect(hexField(el).value, 'the field kept the bad text').to.equal('#ff0000');
  });

  it('fires nothing for an invalid entry', async () => {
    const el = await picker('', { value: '#ff0000' });
    const seen = record(el);
    await typeHex(el, '#gggggg');
    expect(seen.length).to.equal(0);
  });

  it('moves the crosshair to match a typed colour', async () => {
    const el = await picker('', { value: '#808080' });
    await typeHex(el, '#ff0000');
    expect(crosshair(el).getAttribute('style')).to.contain('left: 100%');
  });
});

describe('arc-color-picker presets', () => {
  const PRESETS = ['#ff0000', '#00ff00', '#0000ff'];

  it('renders a swatch per preset', async () => {
    const el = await picker('', { presets: PRESETS });
    expect(swatches(el).length).to.equal(3);
  });

  it('exposes them as a listbox', async () => {
    const el = await picker('', { presets: PRESETS });
    const rail = el.shadowRoot.querySelector('.picker__presets');
    expect(rail.getAttribute('role')).to.equal('listbox');
    expect(swatches(el)[0].getAttribute('role')).to.equal('option');
    expect(swatches(el)[0].getAttribute('aria-label')).to.equal('#ff0000');
  });

  it('marks the one matching the current value', async () => {
    const el = await picker('', { presets: PRESETS, value: '#00ff00' });
    expect(swatches(el).map((s) => s.getAttribute('aria-selected'))).to.eql([
      'false',
      'true',
      'false',
    ]);
  });

  it('selects on click, firing both events once', async () => {
    const el = await picker('', { presets: PRESETS, value: '#ffffff' });
    const seen = record(el);
    swatches(el)[2].click();
    await settle(el);
    expect(el.value).to.equal('#0000ff');
    expect(seen.map(([kind]) => kind), 'a discrete pick is edit and commit').to.eql([
      'input',
      'change',
    ]);
  });

  it('syncs the area to the preset it picked', async () => {
    const el = await picker('', { presets: PRESETS, value: '#ffffff' });
    swatches(el)[2].click();
    await settle(el);
    expect(shownHue(el)).to.equal(240);
  });

  it('matches an uppercase preset against the lowercase value', async () => {
    const el = await picker('', { presets: ['#FF0000'], value: '#ff0000' });
    expect(swatches(el)[0].getAttribute('aria-selected')).to.equal('true');
  });
});

describe('arc-color-picker readonly', () => {
  it('refuses a drag on the area', async () => {
    const el = await picker('readonly', { value: '#ff0000' });
    drag(area(el), [at(area(el), 0.2, 0.2)], { moveTarget: window });
    await settle(el);
    expect(el.value).to.equal('#ff0000');
  });

  it('refuses a drag on the hue track', async () => {
    const el = await picker('readonly', { value: '#ff0000' });
    drag(hueTrack(el), [at(hueTrack(el), 0.5, 0.5)], { moveTarget: window });
    await settle(el);
    expect(el.value).to.equal('#ff0000');
  });

  it('refuses a preset click', async () => {
    const el = await picker('readonly', { presets: ['#00ff00'], value: '#ff0000' });
    swatches(el)[0].click();
    await settle(el);
    expect(el.value).to.equal('#ff0000');
  });

  it('marks the hex field read-only rather than merely ignoring it', async () => {
    const el = await picker('readonly', { value: '#ff0000' });
    expect(hexField(el).readOnly).to.equal(true);
  });

  it('still submits its value', async () => {
    const form = mount('<form></form>');
    const el = document.createElement('arc-color-picker');
    el.name = 'brand';
    el.readonly = true;
    el.value = '#00ff00';
    form.appendChild(el);
    await settle(el);
    expect(new FormData(form).get('brand')).to.equal('#00ff00');
  });
});

describe('arc-color-picker disabled', () => {
  it('refuses a dispatched pointer on the area', async () => {
    // Previously `:host([disabled]) { pointer-events: none }` was the *entire*
    // enforcement — `_onAreaPointerDown` guarded `readonly` and never looked at
    // `disabled` — so a synthetic pointer, which CSS cannot intercept, dragged
    // it happily. Real users were fine; the constraint was just in the
    // stylesheet instead of in the component (finding #61).
    const el = await picker('disabled', { value: '#ff0000' });
    drag(area(el), [at(area(el), 0.2, 0.2)], { moveTarget: window });
    await settle(el);
    expect(el.value).to.equal('#ff0000');
  });

  it('takes the hex field out of the tab order', async () => {
    const el = await picker('disabled', { value: '#ff0000' });
    expect(hexField(el).disabled, 'a disabled picker kept a tab stop').to.equal(true);
  });

  it('takes the preset swatches out of the tab order', async () => {
    const el = await picker('disabled', { presets: ['#00ff00'], value: '#ff0000' });
    expect(swatches(el).every((s) => s.disabled)).to.equal(true);
  });

  it('ignores a hex typed into it', async () => {
    const el = await picker('disabled', { value: '#ff0000' });
    expect(el.disabled, 'not actually disabled, so this is vacuous').to.equal(true);
    await typeHex(el, '#00ff00');
    expect(el.value, 'a disabled picker was recoloured').to.equal('#ff0000');
  });
});

describe('arc-color-picker form participation', () => {
  it('submits the hex under its name', async () => {
    const form = mount('<form><arc-color-picker name="brand" value="#00ff00"></arc-color-picker></form>');
    const el = form.querySelector('arc-color-picker');
    await settle(el);
    expect(new FormData(form).get('brand')).to.equal('#00ff00');
  });

  it('restores its value on reset', async () => {
    const form = mount('<form></form>');
    const el = document.createElement('arc-color-picker');
    el.name = 'brand';
    el.value = '#00ff00';
    form.appendChild(el);
    await settle(el);

    await typeHex(el, '#0000ff');
    expect(el.value, 'nothing changed, so reset would be vacuous').to.equal('#0000ff');

    form.reset();
    await settle(el);
    expect(el.value).to.equal('#00ff00');
  });

  it('reflects its value as an attribute', async () => {
    const el = await picker('', { value: '#00ff00' });
    expect(el.getAttribute('value')).to.equal('#00ff00');
  });
});
