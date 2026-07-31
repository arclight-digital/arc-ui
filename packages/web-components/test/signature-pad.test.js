/**
 * arc-signature-pad — rendering and a11y surface, drawing by pointer, the v3
 * edit/commit contract (a stroke is the edit unit: arc-input then arc-change
 * together at stroke end, nothing per point), clear(), constraint validation
 * for required, disabled/readonly inertness, and form participation with a
 * data-URL value.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/input/signature-pad.register.js';

afterEach(() => cleanup());

/** Record both contract events in fire order. */
function record(el) {
  const seen = [];
  el.addEventListener('arc-input', (e) => seen.push(['input', e.detail.value]));
  el.addEventListener('arc-change', (e) => seen.push(['change', e.detail.value]));
  return seen;
}

const only = (seen, kind) => seen.filter(([k]) => k === kind);

const canvasOf = (el) => el.shadowRoot.querySelector('canvas');
const hintOf = (el) => el.shadowRoot.querySelector('.pad__hint');
const clearButtonOf = (el) => el.shadowRoot.querySelector('.pad__clear');

/** One real pointer id (the mouse) so setPointerCapture accepts the gesture. */
const pointer = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse' };

/** Draw one stroke through the given canvas-relative points. */
async function stroke(el, points) {
  const canvas = canvasOf(el);
  const rect = canvas.getBoundingClientRect();
  const at = ([x, y]) => ({ ...pointer, clientX: rect.left + x, clientY: rect.top + y });

  canvas.dispatchEvent(new PointerEvent('pointerdown', at(points[0])));
  for (const p of points.slice(1)) {
    canvas.dispatchEvent(new PointerEvent('pointermove', at(p)));
  }
  canvas.dispatchEvent(new PointerEvent('pointerup', pointer));
  await el.updateComplete;
  await tick();
}

const SIGN = [[20, 100], [45, 60], [70, 110], [95, 55], [120, 90]];

/** A 1x1 PNG for programmatic-value tests. */
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('arc-signature-pad rendering', () => {
  it('renders a focusable role-img canvas, the label, and the empty-state placeholder', async () => {
    const el = mount('<arc-signature-pad label="Approval"></arc-signature-pad>');
    await el.updateComplete;

    const canvas = canvasOf(el);
    expect(canvas.getAttribute('role')).to.equal('img');
    expect(canvas.getAttribute('tabindex')).to.equal('0');
    expect(canvas.getAttribute('aria-label')).to.equal('Approval — empty');

    expect(el.shadowRoot.querySelector('.pad__label').textContent).to.equal('Approval');
    expect(hintOf(el).classList.contains('pad__hint--hidden')).to.equal(false);
    expect(hintOf(el).textContent).to.include('Sign here');
    expect(clearButtonOf(el), 'no clear button while blank').to.equal(null);
    expect(el.value).to.equal('');
  });

  it('falls back to "Signature" as the accessible name when unlabelled', async () => {
    const el = mount('<arc-signature-pad></arc-signature-pad>');
    await el.updateComplete;
    expect(canvasOf(el).getAttribute('aria-label')).to.equal('Signature — empty');
  });
});

describe('arc-signature-pad drawing', () => {
  it('a stroke fills value with a PNG data-URL and flips the a11y state to signed', async () => {
    const el = mount('<arc-signature-pad></arc-signature-pad>');
    await el.updateComplete;

    await stroke(el, SIGN);

    expect(el.value).to.match(/^data:image\/png/);
    expect(canvasOf(el).getAttribute('aria-label')).to.equal('Signature — signed');
    expect(hintOf(el).classList.contains('pad__hint--hidden'), 'placeholder hides').to.equal(true);
    expect(clearButtonOf(el), 'clear button appears once signed').to.not.equal(null);
  });

  it('a stroke is the edit unit: arc-input then arc-change fire once at stroke end, nothing per point', async () => {
    const el = mount('<arc-signature-pad></arc-signature-pad>');
    await el.updateComplete;
    const seen = record(el);
    const canvas = canvasOf(el);
    const rect = canvas.getBoundingClientRect();

    canvas.dispatchEvent(new PointerEvent('pointerdown', { ...pointer, clientX: rect.left + 20, clientY: rect.top + 80 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { ...pointer, clientX: rect.left + 60, clientY: rect.top + 60 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { ...pointer, clientX: rect.left + 100, clientY: rect.top + 90 }));
    await tick();
    expect(seen.length, 'silent while the pen is down').to.equal(0);

    canvas.dispatchEvent(new PointerEvent('pointerup', pointer));
    await tick();

    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);
    expect(only(seen, 'input')[0][1]).to.match(/^data:image\/png/);
    expect(only(seen, 'change')[0][1]).to.equal(el.value);
  });

  it('each stroke of a multi-stroke signature fires its own input+change pair', async () => {
    const el = mount('<arc-signature-pad></arc-signature-pad>');
    await el.updateComplete;
    const seen = record(el);

    await stroke(el, [[20, 80], [60, 40]]);
    await stroke(el, [[30, 110], [90, 100]]);

    expect(only(seen, 'input').length).to.equal(2);
    expect(only(seen, 'change').length).to.equal(2);
  });

  it('setting value from script marks the pad signed and hides the placeholder', async () => {
    const el = mount('<arc-signature-pad></arc-signature-pad>');
    await el.updateComplete;

    el.value = TINY_PNG;
    await el.updateComplete;

    expect(canvasOf(el).getAttribute('aria-label')).to.equal('Signature — signed');
    expect(hintOf(el).classList.contains('pad__hint--hidden')).to.equal(true);
  });
});

describe('arc-signature-pad clear', () => {
  it('clear() empties the value, fires arc-clear, and restores the placeholder', async () => {
    const el = mount('<arc-signature-pad></arc-signature-pad>');
    await el.updateComplete;
    await stroke(el, SIGN);
    expect(el.value).to.not.equal('');

    const clears = [];
    el.addEventListener('arc-clear', () => clears.push(1));
    el.clear();
    await el.updateComplete;

    expect(el.value).to.equal('');
    expect(clears.length).to.equal(1);
    expect(hintOf(el).classList.contains('pad__hint--hidden')).to.equal(false);
    expect(canvasOf(el).getAttribute('aria-label')).to.equal('Signature — empty');
    expect(clearButtonOf(el), 'clear button leaves with the ink').to.equal(null);
  });

  it('the clear button clears the pad', async () => {
    const el = mount('<arc-signature-pad></arc-signature-pad>');
    await el.updateComplete;
    await stroke(el, SIGN);

    const button = clearButtonOf(el);
    expect(button).to.not.equal(null);
    button.click();
    await el.updateComplete;

    expect(el.value).to.equal('');
  });
});

describe('arc-signature-pad validation', () => {
  it('required and blank is valueMissing; a stroke makes it valid; clearing invalidates again', async () => {
    const el = mount('<arc-signature-pad name="sig" required></arc-signature-pad>');
    await el.updateComplete;

    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);

    await stroke(el, SIGN);
    expect(el.checkValidity()).to.equal(true);

    el.clear();
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(false);
  });
});

describe('arc-signature-pad disabled and readonly', () => {
  it('disabled leaves the tab order and ignores every gesture', async () => {
    const el = mount('<arc-signature-pad disabled></arc-signature-pad>');
    await el.updateComplete;
    const seen = record(el);

    expect(canvasOf(el).getAttribute('tabindex')).to.equal('-1');

    await stroke(el, SIGN);
    expect(el.value).to.equal('');
    expect(seen.length).to.equal(0);
  });

  it('readonly stays focusable but inert, and the value still submits', async () => {
    const form = mount('<form><arc-signature-pad name="sig" readonly></arc-signature-pad></form>');
    const el = form.querySelector('arc-signature-pad');
    await el.updateComplete;
    el.value = TINY_PNG;
    await el.updateComplete;
    const seen = record(el);

    expect(canvasOf(el).getAttribute('tabindex')).to.equal('0');
    expect(clearButtonOf(el), 'no clear button under readonly').to.equal(null);

    await stroke(el, SIGN);
    expect(el.value, 'drawing is blocked').to.equal(TINY_PNG);
    expect(seen.length).to.equal(0);
    expect(new FormData(form).get('sig')).to.equal(TINY_PNG);
  });
});

describe('arc-signature-pad form participation', () => {
  it('submits the data-URL under its name, tracks programmatic changes, and resets to blank', async () => {
    const form = mount('<form><arc-signature-pad name="sig"></arc-signature-pad></form>');
    const el = form.querySelector('arc-signature-pad');
    await el.updateComplete;

    expect(new FormData(form).get('sig'), 'blank pad submits empty').to.equal(null);

    await stroke(el, SIGN);
    const submitted = new FormData(form).get('sig');
    expect(submitted).to.equal(el.value);
    expect(submitted).to.match(/^data:image\/png/);

    el.value = TINY_PNG;
    await el.updateComplete;
    expect(new FormData(form).get('sig'), 'programmatic set reaches the form').to.equal(TINY_PNG);

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(new FormData(form).get('sig')).to.equal(null);
  });
});
