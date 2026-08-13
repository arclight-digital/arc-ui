/**
 * The `num()` rollout — the props whose prose promised clamping.
 *
 * `conformance.test.js` derives the clamping assertions from the declarations
 * themselves, so this file deliberately does *not* re-test "500 becomes 100".
 * What it tests is the thing a declaration cannot know: that the clamped value
 * is the one the component then **uses**, everywhere it is read.
 *
 * That distinction is the finding. Every component here already clamped — in the
 * arithmetic that drew the bar, the arc, or the pin. None clamped the property,
 * and `arc-meter` and `arc-gauge` pass `this.value` straight to `aria-valuenow`.
 * So an out-of-range value drew a full bar and announced the raw number: the
 * visual and the accessible readings disagreed, which is the failure that
 * actually reaches a user.
 *
 * Same shape as findings #1 and #47 — a constraint enforced on the render rather
 * than on the state — and the fourth place it has turned up.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';

import '../src/data/meter.register.js';
import '../src/data/gauge.register.js';
import '../src/data/level-meter.register.js';
import '../src/content/hotspot.register.js';
import '../src/content/image-compare.register.js';
import '../src/input/time-picker.register.js';

afterEach(() => cleanup());

async function make(markup) {
  const el = mount(markup);
  await settle(el);
  return el;
}

const ariaNow = (el) =>
  el.shadowRoot.querySelector('[aria-valuenow]')?.getAttribute('aria-valuenow');

describe('value clamped against its sibling bounds', () => {
  const CASES = [
    ['arc-meter', 'arc-meter'],
    ['arc-gauge', 'arc-gauge'],
  ];

  for (const [name, tag] of CASES) {
    it(`${name} holds an over-range value at max`, async () => {
      const el = await make(`<${tag} min="0" max="100" value="500"></${tag}>`);
      expect(el.value).to.equal(100);
    });

    it(`${name} holds an under-range value at min`, async () => {
      const el = await make(`<${tag} min="10" max="100" value="-5"></${tag}>`);
      expect(el.value).to.equal(10);
    });

    it(`${name} announces the value it draws, not the one it was given`, async () => {
      // The half a declaration cannot check: `aria-valuenow` read `this.value`
      // directly, so a full bar was announced as "500 of 100".
      const el = await make(`<${tag} min="0" max="100" value="500"></${tag}>`);
      expect(ariaNow(el)).to.equal('100');
    });

    it(`${name} clamps on the property path too`, async () => {
      const el = await make(`<${tag} min="0" max="100" value="50"></${tag}>`);
      el.value = 999;
      await settle(el);
      expect(el.value).to.equal(100);
      expect(ariaNow(el)).to.equal('100');
    });

    it(`${name} re-clamps when the bounds move under it`, async () => {
      // The reason `min`/`max` are given as property *names* rather than
      // literals: the bound is itself reactive, and a value that was legal can
      // stop being so without anyone touching it.
      const el = await make(`<${tag} min="0" max="100" value="80"></${tag}>`);
      el.max = 50;
      await settle(el);
      expect(el.value, 'a narrowed range left the value outside it').to.equal(50);
    });

    it(`${name} leaves an in-range value alone`, async () => {
      const el = await make(`<${tag} min="0" max="100" value="42"></${tag}>`);
      expect(el.value).to.equal(42);
      expect(ariaNow(el)).to.equal('42');
    });
  }

  it('arc-level-meter clamps against its own defaults of 0 and 1', async () => {
    const el = await make('<arc-level-meter value="5"></arc-level-meter>');
    expect(el.value).to.equal(1);
  });

  it('arc-level-meter follows a dB range when given one', async () => {
    const el = await make('<arc-level-meter min="-60" max="0" value="-90"></arc-level-meter>');
    expect(el.value).to.equal(-60);
  });
});

describe('percentage positions', () => {
  it('arc-hotspot clamps x and y to the image', async () => {
    const el = await make('<arc-hotspot x="500" y="-20"></arc-hotspot>');
    expect([el.x, el.y]).to.eql([100, 0]);
  });

  it('arc-hotspot falls back to centre for a non-numeric value', async () => {
    // The other half of its documented sentence: "a non-numeric value falls
    // back to 50".
    const el = await make('<arc-hotspot x="left"></arc-hotspot>');
    expect(el.x).to.equal(50);
  });

  it('arc-hotspot positions the pin from the clamped value', async () => {
    const el = await make('<arc-hotspot x="500" y="500"></arc-hotspot>');
    const style = el.shadowRoot.querySelector('.hotspot').getAttribute('style');
    expect(style).to.contain('left: 100%');
    expect(style).to.contain('top: 100%');
  });

  it('arc-image-compare clamps its divider', async () => {
    const el = await make('<arc-image-compare position="150"></arc-image-compare>');
    expect(el.position).to.equal(100);
  });

  it('arc-image-compare clamps on the property path', async () => {
    const el = await make('<arc-image-compare></arc-image-compare>');
    el.position = -40;
    await settle(el);
    expect(el.position).to.equal(0);
  });
});

describe('arc-time-picker step is a set, not a range', () => {
  // `num({min, max})` cannot express "1, 5, 15 or 30" — it would admit 7. The
  // documented union is a set, so it is `oneOf` with numeric members, which the
  // vocabulary gained for this case.
  it('accepts a declared member', async () => {
    const el = await make('<arc-time-picker step="15"></arc-time-picker>');
    expect(el.step).to.equal(15);
  });

  it('rejects a plausible non-member', async () => {
    // 7 is inside any range you would write and outside the documented set —
    // which is the whole reason this is not `num({ min: 1, max: 60 })`.
    const el = await make('<arc-time-picker step="7"></arc-time-picker>');
    expect(el.step).to.equal(1);
  });

  it('coerces the attribute string before testing membership', async () => {
    // `[1, 5, 15, 30].includes('15')` is false, so without coercion every
    // attribute-set numeric enum would silently fall back to its default.
    const el = await make('<arc-time-picker step="30"></arc-time-picker>');
    expect(el.step).to.equal(30);
    expect(typeof el.step).to.equal('number');
  });

  it('falls back from the property path too', async () => {
    const el = await make('<arc-time-picker></arc-time-picker>');
    el.step = 7;
    await settle(el);
    expect(el.step).to.equal(1);
  });
});
