import { expect } from '@esm-bundle/chai';
import '../src/content/lightbox.register.js';
import { mount, cleanup, tick, pressKey, deepActive } from './helpers.js';

const PX = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const IMAGES = [
  { src: PX, alt: 'First', caption: 'A river valley' },
  PX, // plain-string form, deliberately mixed in
  { src: PX, alt: 'Third' },
];

async function mountLightbox(images = IMAGES) {
  const el = mount('<arc-lightbox></arc-lightbox>');
  el.images = images;
  await el.updateComplete;
  return el;
}

async function openLightbox(index) {
  const el = await mountLightbox();
  el.show(index);
  await el.updateComplete;
  await tick();
  return el;
}

describe('arc-lightbox open/close lifecycle', () => {
  afterEach(cleanup);

  it('show() opens and fires arc-open once', async () => {
    const el = await mountLightbox();
    let opens = 0;
    el.addEventListener('arc-open', () => { opens++; });
    el.show();
    await el.updateComplete;
    expect(el.open).to.equal(true);
    expect(opens).to.equal(1);
  });

  it('show(index) opens at that image', async () => {
    const el = await openLightbox(2);
    expect(el.index).to.equal(2);
    expect(el.shadowRoot.querySelector('[part~="counter"]').textContent).to.contain('3 / 3');
  });

  it('is hidden while closed', async () => {
    // The viewer is a <dialog> since V4-PLAN 4.4, so "hidden" is the UA
    // stylesheet's display:none on a closed dialog rather than a visibility
    // transition of ours. Asserting the computed display keeps the claim while
    // dropping the mechanism.
    const el = await mountLightbox();
    const dialog = el.shadowRoot.querySelector('dialog');
    expect(dialog.open, 'not in the top layer').to.equal(false);
    expect(getComputedStyle(dialog).display).to.equal('none');
  });

  it('is usable the moment open is set, without waiting out a transition', async () => {
    // This existed because a delayed `visibility` made the viewer unfocusable
    // for the length of its own fade. The <dialog> equivalent of "usable now"
    // is being in the top layer now.
    const el = await mountLightbox();
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('dialog').open).to.equal(true);
  });

  it('close() fires arc-close before the state flips', async () => {
    const el = await openLightbox();
    let openDuringEvent = null;
    el.addEventListener('arc-close', () => { openDuringEvent = el.open; }, { once: true });
    el.close();
    await el.updateComplete;
    expect(openDuringEvent, 'listener must observe the still-open state').to.equal(true);
    expect(el.open).to.equal(false);
  });

  it('preventDefault() on arc-close vetoes the close', async () => {
    const el = await openLightbox();
    el.addEventListener('arc-close', (e) => e.preventDefault(), { once: true });
    el.close();
    await el.updateComplete;
    expect(el.open, 'vetoed close must leave the lightbox open').to.equal(true);

    el.close();
    await el.updateComplete;
    expect(el.open, 'unvetoed close must close').to.equal(false);
  });

  it('closes on Escape', async () => {
    // Escape reaches a modal <dialog> as the user agent's `cancel` event, which
    // no dispatched KeyboardEvent produces. What the library owns is what it
    // does with one; that Escape produces one is the platform's guarantee.
    const el = await openLightbox();
    el.shadowRoot.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });
});

describe('arc-lightbox navigation', () => {
  afterEach(cleanup);

  it('next() advances and fires arc-change with the index on detail.value', async () => {
    const el = await openLightbox(0);
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));
    el.next();
    await el.updateComplete;
    expect(el.index).to.equal(1);
    expect(details.length).to.equal(1);
    expect(details[0].value, 'detail.value must exist').to.equal(1);
    expect(details[0].index, 'specific key must ride alongside').to.equal(1);
  });

  it('wraps forward past the last image', async () => {
    const el = await openLightbox(2);
    el.next();
    await el.updateComplete;
    expect(el.index).to.equal(0);
  });

  it('wraps backward past the first image', async () => {
    const el = await openLightbox(0);
    el.prev();
    await el.updateComplete;
    expect(el.index).to.equal(2);
  });

  it('navigates with the arrow keys while open', async () => {
    const el = await openLightbox(0);
    pressKey('ArrowRight');
    await el.updateComplete;
    expect(el.index).to.equal(1);
    pressKey('ArrowLeft');
    await el.updateComplete;
    expect(el.index).to.equal(0);
  });

  it('ignores the arrow keys while closed', async () => {
    const el = await mountLightbox();
    pressKey('ArrowRight');
    await el.updateComplete;
    expect(el.index).to.equal(0);
  });
});

describe('arc-lightbox zoom', () => {
  afterEach(cleanup);

  it('+ zooms to 2x and - zooms back out', async () => {
    const el = await openLightbox(0);
    pressKey('+');
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[part~="image"]').style.transform).to.contain('scale(2)');
    pressKey('-');
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[part~="image"]').style.transform).to.not.contain('scale(2)');
  });

  it('navigation resets the zoom', async () => {
    const el = await openLightbox(0);
    pressKey('+');
    await el.updateComplete;
    el.next();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[part~="image"]').style.transform).to.not.contain('scale(2)');
  });
});

describe('arc-lightbox focus management', () => {
  afterEach(cleanup);

  it('moves focus into the dialog when opened', async () => {
    const el = await openLightbox();
    const active = deepActive();
    expect(active).to.not.equal(document.body);
    // Containment must follow the composed tree: first focus lands inside a
    // composed arc-icon-button's shadow root, which contains() can't see.
    let inside = false;
    for (let node = active; node; node = node.getRootNode().host ?? null) {
      if (el.contains(node) || el.shadowRoot.contains(node)) { inside = true; break; }
    }
    expect(inside, `active element <${active.tagName}> should be inside the lightbox`).to.equal(true);
  });

  it('restores focus to whatever was focused before it opened', async () => {
    const outside = document.createElement('button');
    outside.textContent = 'Opener';
    document.body.appendChild(outside);
    outside.focus();

    const el = await openLightbox();
    expect(deepActive(), 'focus moved inside').to.not.equal(outside);

    el.open = false;
    await el.updateComplete;
    expect(deepActive()).to.equal(outside);
  });
});

describe('arc-lightbox scroll lock', () => {
  afterEach(cleanup);

  it('locks page scroll while open and releases it on close', async () => {
    const el = await openLightbox();
    expect(document.body.style.overflow, 'locked').to.equal('hidden');
    el.open = false;
    await el.updateComplete;
    expect(document.body.style.overflow, 'released').to.not.equal('hidden');
  });
});

describe('arc-lightbox images forms', () => {
  afterEach(cleanup);

  it('renders an object entry with alt and caption', async () => {
    const el = await openLightbox(0);
    const img = el.shadowRoot.querySelector('[part~="image"]');
    expect(img.getAttribute('src')).to.equal(PX);
    expect(img.getAttribute('alt')).to.equal('First');
    expect(el.shadowRoot.querySelector('[part~="caption"]').textContent.trim()).to.equal('A river valley');
  });

  it('renders a plain-string entry with no caption', async () => {
    const el = await openLightbox(1);
    const img = el.shadowRoot.querySelector('[part~="image"]');
    expect(img.getAttribute('src')).to.equal(PX);
    expect(el.shadowRoot.querySelector('[part~="caption"]')).to.equal(null);
  });

  it('shows the counter in "n / total" form', async () => {
    const el = await openLightbox(1);
    expect(el.shadowRoot.querySelector('[part~="counter"]').textContent).to.contain('2 / 3');
  });

  it('hides prev/next for a single image', async () => {
    const el = await mountLightbox([PX]);
    el.show();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[part~="prev"]')).to.equal(null);
    expect(el.shadowRoot.querySelector('[part~="next"]')).to.equal(null);
  });
});
