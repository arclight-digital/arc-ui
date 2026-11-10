/**
 * arc-sparkline: `color` across every mark type.
 *
 * What this pins: `color` takes any CSS color (hex, named, var()) and the
 * legacy "r, g, b" triplet, and every mark (line stroke, area fill, bar fill)
 * comes out in that color. The bug this guards: area and bar fills were
 * `rgba(var(--color), a)`, which is only valid for a triplet, so a hex or named
 * color made the declaration invalid and the fill fell back to black.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, useBaseCss } from './helpers.js';

import '../src/data/sparkline.register.js';

useBaseCss();
afterEach(() => cleanup());

const DATA = '10,25,18,30,22';

async function spark(attrs) {
  const el = mount(`<arc-sparkline data="${DATA}" ${attrs}></arc-sparkline>`);
  await settle(el);
  return el;
}

/**
 * A computed color as [r, g, b, a] with channels 0-255, from either
 * serialisation Chromium uses: `rgb()/rgba()`, or `color(srgb …)` for the
 * result of color-mix().
 */
function rgba(value) {
  let m = value.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
  if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  m = value.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
  if (m) return [m[1] * 255, m[2] * 255, m[3] * 255, m[4] === undefined ? 1 : +m[4]];
  throw new Error(`unparsed color: ${value}`);
}

function expectColor(value, [r, g, b, a]) {
  const got = rgba(value);
  const msg = `${value} should be rgba(${r}, ${g}, ${b}, ${a})`;
  expect(got[0], msg).to.be.closeTo(r, 1);
  expect(got[1], msg).to.be.closeTo(g, 1);
  expect(got[2], msg).to.be.closeTo(b, 1);
  expect(got[3], msg).to.be.closeTo(a, 0.01);
}

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);

const FORMS = [
  ['hex', '#ff0000'],
  ['named', 'red'],
  ['rgb()', 'rgb(255, 0, 0)'],
  ['triplet', '255, 0, 0'],
];

describe('arc-sparkline color', () => {
  for (const [kind, color] of FORMS) {
    it(`colors the line stroke with a ${kind} color`, async () => {
      const el = await spark(`type="line" color="${color}"`);
      expectColor(getComputedStyle(part(el, 'line')).stroke, [255, 0, 0, 1]);
    });

    it(`colors the area fill with a ${kind} color`, async () => {
      const el = await spark(`type="line" fill color="${color}"`);
      expectColor(getComputedStyle(part(el, 'area')).fill, [255, 0, 0, 0.1]);
    });

    it(`colors the bar fill with a ${kind} color`, async () => {
      const el = await spark(`type="bar" color="${color}"`);
      expectColor(getComputedStyle(part(el, 'bar')).fill, [255, 0, 0, 0.3]);
    });
  }

  it('uses --accent-primary for every mark when color is unset', async () => {
    const line = await spark('type="line" fill');
    const accent = rgba(getComputedStyle(part(line, 'line')).stroke);
    expect(accent[3]).to.equal(1);
    expectColor(getComputedStyle(part(line, 'area')).fill, [...accent.slice(0, 3), 0.1]);

    const bar = await spark('type="bar"');
    expectColor(getComputedStyle(part(bar, 'bar')).fill, [...accent.slice(0, 3), 0.3]);
  });

  it('follows a color change after first render', async () => {
    const el = await spark('type="bar" color="red"');
    // The bar fill transitions; read the end state, not a mid-flight one.
    el.style.setProperty('--transition-fast', '0s');
    el.color = '#0000ff';
    await settle(el);
    expectColor(getComputedStyle(part(el, 'bar')).fill, [0, 0, 255, 0.3]);
  });
});
