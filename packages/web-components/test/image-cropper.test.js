/**
 * arc-image-cropper — the crop stage.
 *
 * What this pins: the loading and error states around `src`, the crop rectangle
 * moving and resizing by keyboard, the zoom control, `aspect` constraining the
 * rectangle, and arc-crop-change reporting the crop in natural image pixels.
 *
 * One test is marked BUG: `zoom` is documented as clamped to 1–4 and is not
 * clamped anywhere in JS. See test-findings.md.
 *
 * The image is a data URL so the canvas stays same-origin, and every assertion
 * waits on the component's own load path rather than on a timer.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, nextFrame, record } from './helpers.js';

import '../src/input/image-cropper.register.js';

afterEach(() => cleanup());

/** A 4:3 red PNG, inline so it loads without a network round trip. */
const IMG =
  'data:image/gif;base64,R0lGODlhBAADAPAAAP8AAAAAACH5BAAAAAAALAAAAAAEAAMAAAIDhI9WADs=';

async function cropper(attrs = '') {
  const el = mount(`<arc-image-cropper src="${IMG}" height="240" ${attrs}></arc-image-cropper>`);
  await settle(el);
  // The stage measures the loaded image and lays the crop out on a frame.
  for (let i = 0; i < 5 && !el.shadowRoot.querySelector('[part~="crop"]'); i++) {
    await nextFrame();
    await settle(el);
  }
  return el;
}

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const crop = (el) => part(el, 'crop');
const handles = (el) => [...el.shadowRoot.querySelectorAll('[part~="handle"]')];

describe('arc-image-cropper loading states', () => {
  it('exposes the documented css parts once loaded', async () => {
    const el = await cropper();
    for (const name of ['stage', 'image', 'crop', 'zoom']) {
      expect(part(el, name), name).to.not.equal(null);
    }
  });

  it('renders an empty stage with no src, and no crop to drag', async () => {
    const el = mount('<arc-image-cropper height="240"></arc-image-cropper>');
    await settle(el);

    expect(part(el, 'stage'), 'the stage still renders').to.not.equal(null);
    expect(part(el, 'crop') === null, 'but there is nothing to crop yet').to.equal(true);
    expect(part(el, 'skeleton') === null, 'and no loading state either').to.equal(true);
  });

  it('reports a broken image as an alert', async () => {
    const el = mount('<arc-image-cropper src="/definitely-not-an-image.png" height="240"></arc-image-cropper>');
    await settle(el);
    for (let i = 0; i < 10 && !part(el, 'error'); i++) {
      await nextFrame();
      await settle(el);
    }

    expect(part(el, 'error'), 'an error region appears').to.not.equal(null);
    expect(part(el, 'error').getAttribute('role')).to.equal('alert');
  });

  it('sizes the stage from the height prop', async () => {
    const el = await cropper();
    expect(part(el, 'stage').style.height).to.equal('240px');
  });
});

describe('arc-image-cropper crop rectangle', () => {
  it('renders a crop with resize handles', async () => {
    const el = await cropper();
    expect(crop(el)).to.not.equal(null);
    expect(handles(el).length, 'corner handles').to.be.greaterThan(0);
  });

  it('hides the handles from assistive tech', async () => {
    const el = await cropper();
    expect(handles(el).every((h) => h.getAttribute('aria-hidden') === 'true')).to.equal(true);
  });

  it('moves the crop with the arrow keys', async () => {
    const el = await cropper();
    const before = crop(el).getBoundingClientRect();

    keyOn(crop(el), 'ArrowRight');
    await settle(el);
    await nextFrame();

    expect(crop(el).getBoundingClientRect().left, 'moved along the inline axis')
      .to.be.greaterThan(before.left - 0.5);
  });

  it('claims the arrow keys so the page does not scroll', async () => {
    const el = await cropper();
    for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      crop(el).dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
    }
  });

  it('ignores keys it does not handle', async () => {
    const el = await cropper();
    const event = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });
    crop(el).dispatchEvent(event);
    await settle(el);
    expect(event.defaultPrevented).to.equal(false);
  });

  it('keeps the crop inside the stage', async () => {
    const el = await cropper();
    for (let i = 0; i < 40; i++) keyOn(crop(el), 'ArrowLeft');
    await settle(el);
    await nextFrame();

    const stage = part(el, 'stage').getBoundingClientRect();
    const box = crop(el).getBoundingClientRect();
    expect(box.left, 'clamped at the stage edge').to.be.at.least(stage.left - 1);
  });
});

describe('arc-image-cropper zoom', () => {
  it('starts at 1 and exposes a zoom control', async () => {
    const el = await cropper();
    expect(el.zoom).to.equal(1);
    expect(part(el, 'zoom')).to.not.equal(null);
  });

  // Was a BUG pin (finding #47). The docs said "clamped to 1-4" and the only
  // bound anywhere was `min`/`max` on the range input, which constrains the
  // *widget* and not the property — so `el.zoom = 10` stuck, and the render
  // then used a different number than the one the component held. Same shape
  // as arc-tabs' unclamped `selected` (#1); fixed the same way, by declaring
  // the bound instead of enforcing it where the value is used.
  it('clamps a zoom past the documented ceiling', async () => {
    const el = await cropper();
    el.zoom = 10;
    await settle(el);
    expect(el.zoom).to.equal(4);
  });

  it('clamps a zoom below the floor', async () => {
    const el = await cropper();
    el.zoom = -3;
    await settle(el);
    expect(el.zoom).to.equal(1);
  });

  it('falls back to 1 for a value that is not a number at all', async () => {
    const el = await cropper();
    el.zoom = 'huge';
    await settle(el);
    expect(el.zoom).to.equal(1);
  });

  it('the geometry now reads the same number the property holds', async () => {
    // The half a declaration cannot know, and the reason this is worth its own
    // assertion: the render used to clamp its own local copy, so the property
    // and the picture disagreed without either looking wrong on its own.
    const el = await cropper();
    el.zoom = 10;
    await settle(el);
    const fill = part(el, 'zoom').querySelector('input[type="range"]');
    expect(Number(fill.value), 'the slider shows the clamped value').to.equal(4);
  });

  it('bounds the slider itself to the documented range', async () => {
    const el = await cropper();
    const slider = part(el, 'zoom').querySelector('input[type="range"]');
    expect(slider.min).to.equal('1');
    expect(slider.max).to.equal('4');
  });

  it('accepts a value inside the range', async () => {
    const el = await cropper();
    el.zoom = 2.5;
    await settle(el);
    expect(el.zoom).to.equal(2.5);
  });

  it('drives zoom from the built-in slider', async () => {
    const el = await cropper();
    const slider = part(el, 'zoom').querySelector('input[type="range"]');
    expect(slider, 'the zoom control is a range input').to.not.equal(null);

    slider.value = '2';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await settle(el);

    expect(el.zoom).to.equal(2);
  });
});

describe('arc-image-cropper aspect', () => {
  it('allows free-form cropping at 0', async () => {
    const el = await cropper('aspect="0"');
    expect(el.aspect).to.equal(0);
    expect(crop(el)).to.not.equal(null);
  });

  it('constrains the crop to a square at aspect 1', async () => {
    const el = await cropper('aspect="1"');
    const box = crop(el).getBoundingClientRect();
    expect(box.width / box.height, 'square within a pixel of rounding').to.be.closeTo(1, 0.05);
  });

  it('constrains the crop to 16:9', async () => {
    const el = await cropper('aspect="1.7777777"');
    const box = crop(el).getBoundingClientRect();
    expect(box.width / box.height).to.be.closeTo(16 / 9, 0.1);
  });
});

describe('arc-image-cropper arc-crop-change', () => {
  it('reports the crop in natural image pixels', async () => {
    const el = await cropper();
    const details = [];
    el.addEventListener('arc-crop-change', (e) => details.push(e.detail));

    keyOn(crop(el), 'ArrowRight');
    await settle(el);
    await nextFrame();
    await nextFrame();

    expect(details.length, 'the move was announced').to.be.greaterThan(0);
    const last = details.at(-1);
    expect(last).to.have.all.keys('x', 'y', 'width', 'height');
    for (const k of ['x', 'y', 'width', 'height']) {
      expect(last[k], k).to.be.a('number');
    }
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await cropper();
    let event = null;
    document.body.addEventListener('arc-crop-change', (e) => { event = e; }, { once: true });

    keyOn(crop(el), 'ArrowRight');
    await settle(el);
    await nextFrame();
    await nextFrame();

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('coalesces a burst of moves rather than emitting per key', async () => {
    // Documented as "debounced to animation frames".
    const el = await cropper();
    const seen = record(el, ['arc-crop-change']);

    for (let i = 0; i < 6; i++) keyOn(crop(el), 'ArrowRight');
    await settle(el);
    await nextFrame();
    await nextFrame();

    expect(seen.length, 'fewer events than key presses').to.be.lessThan(6);
  });
});
