import { expect } from '@esm-bundle/chai';
import '../src/content/lightbox.register.js';
import { mount, cleanup, tick, pressKey, deepActive, until } from './helpers.js';

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
    el.addEventListener('arc-open', () => {
      opens++;
    });
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
    el.addEventListener(
      'arc-close',
      () => {
        openDuringEvent = el.open;
      },
      { once: true },
    );
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
    expect(el.shadowRoot.querySelector('[part~="image"]').style.transform).to.not.contain(
      'scale(2)',
    );
  });

  it('navigation resets the zoom', async () => {
    const el = await openLightbox(0);
    pressKey('+');
    await el.updateComplete;
    el.next();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[part~="image"]').style.transform).to.not.contain(
      'scale(2)',
    );
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
      if (el.contains(node) || el.shadowRoot.contains(node)) {
        inside = true;
        break;
      }
    }
    expect(inside, `active element <${active.tagName}> should be inside the lightbox`).to.equal(
      true,
    );
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
    expect(el.shadowRoot.querySelector('[part~="caption"]').textContent.trim()).to.equal(
      'A river valley',
    );
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

/* ---- v2: gestures, zoom, loading, chrome, declarative gallery ---- */

const figureOf = (el) => el.shadowRoot.querySelector('[part~="figure"]');
const imageOf = (el) => el.shadowRoot.querySelector('[part~="image"]');

function pointer(target, type, x, y, { id = 1, kind = 'touch' } = {}) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      pointerId: id,
      pointerType: kind,
      isPrimary: id === 1,
      clientX: x,
      clientY: y,
      button: 0,
    }),
  );
}

/** A one-finger drag across the stage, in a few steps. */
function swipe(el, from, to) {
  const fig = figureOf(el);
  pointer(fig, 'pointerdown', from[0], from[1]);
  for (let i = 1; i <= 4; i++) {
    pointer(
      fig,
      'pointermove',
      from[0] + ((to[0] - from[0]) * i) / 4,
      from[1] + ((to[1] - from[1]) * i) / 4,
    );
  }
  pointer(fig, 'pointerup', to[0], to[1]);
}

/** Entries that lay out at a real size, so zoomed pan limits are non-zero. */
const BIG = [
  { src: `${PX}#1`, alt: 'One', width: 800, height: 600 },
  { src: `${PX}#2`, alt: 'Two', width: 800, height: 600 },
  { src: `${PX}#3`, alt: 'Three', width: 800, height: 600 },
];

async function openBig(index = 0) {
  const el = mount('<arc-lightbox></arc-lightbox>');
  el.images = BIG;
  await el.updateComplete;
  el.show(index);
  await el.updateComplete;
  await tick();
  return el;
}

const scaleOf = (el) => {
  const m = /scale\(([\d.]+)\)/.exec(imageOf(el).style.transform);
  return m ? Number(m[1]) : 1;
};
const panXOf = (el) => {
  const m = /translate\((-?[\d.]+)px/.exec(imageOf(el).style.transform);
  return m ? Number(m[1]) : 0;
};

describe('arc-lightbox v2 touch gestures', () => {
  afterEach(cleanup);

  it('a sideways swipe steps through the gallery and fires arc-change', async () => {
    const el = await openBig(0);
    const seen = [];
    el.addEventListener('arc-change', (e) => seen.push(e.detail.value));
    swipe(el, [400, 300], [100, 300]);
    await el.updateComplete;
    expect(el.index).to.equal(1);
    swipe(el, [100, 300], [400, 300]);
    await el.updateComplete;
    expect(el.index).to.equal(0);
    expect(seen).to.deep.equal([1, 0]);
  });

  it('a short swipe snaps back instead of navigating', async () => {
    const el = await openBig(0);
    swipe(el, [400, 300], [385, 300]);
    await el.updateComplete;
    expect(el.index).to.equal(0);
    expect(imageOf(el).style.transform).to.equal('none');
  });

  it('a swipe down closes through the cancelable arc-close', async () => {
    const el = await openBig(0);
    el.addEventListener('arc-close', (e) => e.preventDefault(), { once: true });
    swipe(el, [400, 200], [400, 450]);
    await el.updateComplete;
    expect(el.open, 'vetoed').to.equal(true);
    swipe(el, [400, 200], [400, 450]);
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('pinch zoom is clamped to 4x', async () => {
    const el = await openBig(0);
    const fig = figureOf(el);
    pointer(fig, 'pointerdown', 380, 300, { id: 1 });
    pointer(fig, 'pointerdown', 420, 300, { id: 2 });
    pointer(fig, 'pointermove', 100, 300, { id: 1 });
    pointer(fig, 'pointermove', 700, 300, { id: 2 });
    expect(scaleOf(el)).to.equal(4);
    pointer(fig, 'pointerup', 100, 300, { id: 1 });
    pointer(fig, 'pointerup', 700, 300, { id: 2 });
    await el.updateComplete;
    expect(scaleOf(el)).to.equal(4);
  });
});

describe('arc-lightbox v2 zoom', () => {
  afterEach(cleanup);

  it('ctrl + wheel zooms toward the pointer and stays between 1x and 4x', async () => {
    const el = await openBig(0);
    const fig = figureOf(el);
    for (let i = 0; i < 10; i++) {
      fig.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -200,
          ctrlKey: true,
          clientX: 200,
          clientY: 200,
          bubbles: true,
          cancelable: true,
        }),
      );
    }
    expect(scaleOf(el)).to.equal(4);
    expect(panXOf(el), 'anchored left of centre, so the image moved right').to.be.greaterThan(0);
    for (let i = 0; i < 10; i++) {
      fig.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: 200,
          ctrlKey: true,
          clientX: 200,
          clientY: 200,
          bubbles: true,
          cancelable: true,
        }),
      );
    }
    expect(imageOf(el).style.transform).to.equal('none');
  });

  it('with a caption, a zoomed image pans to both edges and the caption docks at the foot', async () => {
    const el = mount('<arc-lightbox></arc-lightbox>');
    el.images = [{ ...BIG[0], caption: 'A caption long enough to take a line of its own.' }];
    await el.updateComplete;
    el.show(0);
    await el.updateComplete;
    await tick();
    pressKey('+');
    await el.updateComplete;
    const fig = figureOf(el);
    const img = imageOf(el);
    const caption = el.shadowRoot.querySelector('[part~="caption"]');
    // Everything in the viewer eases, the stage's own open scale included.
    const settle = () => el.shadowRoot.getAnimations().forEach((a) => a.finish());
    settle();
    const top = fig.getBoundingClientRect().top;
    for (let i = 0; i < 40; i++) pressKey('ArrowUp');
    await el.updateComplete;
    settle();
    expect(img.getBoundingClientRect().top, 'top edge reachable').to.be.closeTo(top, 1);
    for (let i = 0; i < 40; i++) pressKey('ArrowDown');
    await el.updateComplete;
    settle();
    // Docked at the foot of the stage, not across the middle of the picture.
    const docked = caption.getBoundingClientRect();
    expect(docked.bottom, 'caption docked at the foot').to.be.closeTo(
      fig.getBoundingClientRect().bottom - 8,
      1,
    );
    expect(img.getBoundingClientRect().bottom, 'bottom edge clears the caption').to.be.closeTo(
      docked.top,
      1,
    );
    expect(getComputedStyle(caption).zIndex).to.equal('1');
  });

  it('the arrow keys pan while zoomed, and navigate again at 1x', async () => {
    const el = await openBig(0);
    pressKey('+');
    await el.updateComplete;
    pressKey('ArrowLeft');
    await el.updateComplete;
    expect(el.index, 'no navigation while zoomed').to.equal(0);
    expect(panXOf(el)).to.be.greaterThan(0);
    pressKey('0');
    await el.updateComplete;
    expect(imageOf(el).style.transform).to.equal('none');
    pressKey('ArrowRight');
    await el.updateComplete;
    expect(el.index).to.equal(1);
  });

  it('+ steps up to 4x and no further', async () => {
    const el = await openBig(0);
    for (let i = 0; i < 6; i++) pressKey('+');
    await el.updateComplete;
    expect(scaleOf(el)).to.equal(4);
  });
});

describe('arc-lightbox v2 keyboard', () => {
  afterEach(cleanup);

  it('Home and End jump to the first and last image', async () => {
    const el = await openBig(1);
    pressKey('End');
    await el.updateComplete;
    expect(el.index).to.equal(2);
    pressKey('Home');
    await el.updateComplete;
    expect(el.index).to.equal(0);
  });
});

describe('arc-lightbox v2 loading', () => {
  afterEach(cleanup);

  it('shows an error state in place of an image that fails', async () => {
    const el = mount('<arc-lightbox></arc-lightbox>');
    el.images = [{ src: '/definitely-missing-lightbox-image.png', alt: 'A missing photo' }];
    await el.updateComplete;
    el.show(0);
    await el.updateComplete;
    expect(await until(() => el.shadowRoot.querySelector('[part~="error"]'))).to.equal(true);
    const error = el.shadowRoot.querySelector('[part~="error"]');
    expect(error.getAttribute('aria-label')).to.contain('A missing photo');
    expect(getComputedStyle(imageOf(el)).display).to.equal('none');
  });

  it('preloads the images either side of the current one', async () => {
    const requested = [];
    const Real = window.Image;
    window.Image = class extends Real {
      set src(v) {
        requested.push(v);
        super.src = v;
      }
    };
    try {
      await openBig(0);
    } finally {
      window.Image = Real;
    }
    expect(requested).to.have.members([BIG[1].src, BIG[2].src]);
  });

  it('passes srcset, sizes, width and height through to the image', async () => {
    const el = mount('<arc-lightbox></arc-lightbox>');
    el.images = [{ src: PX, srcset: `${PX} 1x`, sizes: '100vw', width: 640, height: 480 }];
    await el.updateComplete;
    el.show(0);
    await el.updateComplete;
    const img = imageOf(el);
    expect(img.getAttribute('srcset')).to.equal(`${PX} 1x`);
    expect(img.getAttribute('sizes')).to.equal('100vw');
    expect(img.getAttribute('width')).to.equal('640');
    expect(img.getAttribute('height')).to.equal('480');
  });
});

describe('arc-lightbox v2 chrome', () => {
  afterEach(cleanup);

  it('announces position and alt text in the live region', async () => {
    const el = await openLightbox(0);
    const counter = el.shadowRoot.querySelector('[part~="counter"]');
    expect(counter.getAttribute('aria-live')).to.equal('polite');
    expect(counter.querySelector('.lightbox__sr').textContent).to.equal('1 of 3: First');
    expect(counter.querySelector('[aria-hidden="true"]').textContent).to.equal('1 / 3');
  });

  it('puts slotted actions in the bar before zoom and close', async () => {
    const el = mount(
      '<arc-lightbox><button slot="actions" id="dl">Download</button></arc-lightbox>',
    );
    el.images = IMAGES;
    await el.updateComplete;
    el.show(0);
    await el.updateComplete;
    const slot = el.shadowRoot.querySelector('slot[name="actions"]');
    expect(slot.assignedElements().map((n) => n.id)).to.deep.equal(['dl']);
    expect(slot.nextElementSibling.getAttribute('part')).to.equal('zoom');
  });

  it('hides the controls when idle, and a move brings them back', async () => {
    const el = await openLightbox(0);
    // Take focus off the controls so the idle rule is free to apply.
    el.shadowRoot.activeElement?.blur?.();
    el._sleep();
    await el.updateComplete;
    const dialog = el.shadowRoot.querySelector('dialog');
    expect(dialog.classList.contains('lightbox--idle')).to.equal(true);
    pointer(dialog, 'pointermove', 10, 10, { kind: 'mouse' });
    await el.updateComplete;
    expect(dialog.classList.contains('lightbox--idle')).to.equal(false);
  });
});

describe('arc-lightbox v2 declarative gallery', () => {
  afterEach(cleanup);

  async function mountGallery() {
    const wrap = mount(`<div>
      <div id="lb-g">
        <a href="/one.jpg"><img alt="One"></a>
        <a href="/two.jpg" data-caption="The second"><img alt="Two"></a>
      </div>
      <arc-lightbox gallery="#lb-g a"></arc-lightbox>
    </div>`);
    const el = wrap.querySelector('arc-lightbox');
    await el.updateComplete;
    return { wrap, el };
  }

  it('opens on the clicked link, with alt and caption read from the markup', async () => {
    const { wrap, el } = await mountGallery();
    const link = wrap.querySelectorAll('#lb-g a')[1];
    // On window, which the click reaches after the lightbox's document listener.
    let prevented = null;
    const record = (e) => {
      prevented = e.defaultPrevented;
      e.preventDefault();
    };
    window.addEventListener('click', record);
    link.click();
    window.removeEventListener('click', record);
    await el.updateComplete;
    expect(prevented).to.equal(true);
    expect(el.open).to.equal(true);
    expect(el.index).to.equal(1);
    expect(imageOf(el).getAttribute('src')).to.contain('/two.jpg');
    expect(imageOf(el).getAttribute('alt')).to.equal('Two');
    expect(el.shadowRoot.querySelector('[part~="caption"]').textContent.trim()).to.equal(
      'The second',
    );
    el.close();
  });

  it('picks up a link added after connect', async () => {
    const { wrap, el } = await mountGallery();
    const added = document.createElement('a');
    added.href = '/three.jpg';
    added.innerHTML = '<img alt="Three">';
    wrap.querySelector('#lb-g').append(added);
    added.click();
    await el.updateComplete;
    expect(el.index).to.equal(2);
    expect(el.shadowRoot.querySelector('[part~="counter"]').textContent).to.contain('3 / 3');
    el.close();
  });

  it('leaves modified clicks and an explicit images list alone', async () => {
    const { wrap, el } = await mountGallery();
    const link = wrap.querySelector('#lb-g a');
    const results = [];
    // Recorded on window, after the lightbox has had its turn; then cancelled
    // so the test page doesn't navigate.
    const listen = (e) => {
      results.push(e.defaultPrevented);
      e.preventDefault();
    };
    window.addEventListener('click', listen);
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
    el.images = [PX];
    await el.updateComplete;
    link.click();
    await el.updateComplete;
    window.removeEventListener('click', listen);
    expect(results).to.deep.equal([false, false]);
    expect(el.open).to.equal(false);
  });
});

/* ---- v2: filmstrip and motion ---- */

/** Script animations only; CSS transitions come and go on their own. */
const scripted = (node) =>
  node.getAnimations().filter((a) => !(a instanceof CSSTransition) && !(a instanceof CSSAnimation));

/** A visible element on the page for the viewer to grow out of and shrink into. */
function originEl() {
  const thumb = document.createElement('img');
  thumb.src = PX;
  thumb.alt = '';
  thumb.style.cssText = 'display:block;width:60px;height:40px';
  document.body.append(thumb);
  return thumb;
}

async function openWithOrigin(index = 0) {
  const origin = originEl();
  const el = mount('<arc-lightbox></arc-lightbox>');
  el.images = BIG.map((e) => ({ ...e, origin }));
  await el.updateComplete;
  el.show(index);
  await el.updateComplete;
  await until(() => el._loaded);
  return el;
}

describe('arc-lightbox v2 thumbnails', () => {
  afterEach(cleanup);

  it('renders a labelled button per image, marks the current one, and jumps on click', async () => {
    const el = mount('<arc-lightbox thumbnails></arc-lightbox>');
    el.images = [{ src: PX, alt: 'First', thumb: `${PX}#small` }, PX, { src: PX, alt: 'Third' }];
    await el.updateComplete;
    el.show(0);
    await el.updateComplete;
    const thumbs = [...el.shadowRoot.querySelectorAll('[part~="thumbnail"]')];
    expect(thumbs.map((t) => t.getAttribute('aria-label'))).to.deep.equal([
      'First',
      'Image 2',
      'Third',
    ]);
    expect(thumbs[0].querySelector('img').getAttribute('src')).to.equal(`${PX}#small`);
    expect(thumbs[0].querySelector('img').getAttribute('loading')).to.equal('lazy');
    expect(thumbs.map((t) => t.hasAttribute('aria-current'))).to.deep.equal([true, false, false]);

    const seen = [];
    el.addEventListener('arc-change', (e) => seen.push(e.detail.value));
    thumbs[2].click();
    await el.updateComplete;
    expect(el.index).to.equal(2);
    expect(seen).to.deep.equal([2]);
    const after = [...el.shadowRoot.querySelectorAll('[part~="thumbnail"]')];
    expect(after[2].getAttribute('aria-current')).to.equal('true');
    expect(after[0].hasAttribute('aria-current')).to.equal(false);
  });

  it('renders no strip without the attribute', async () => {
    const el = await openLightbox(0);
    expect(el.shadowRoot.querySelector('[part~="thumbnails"]')).to.equal(null);
  });
});

describe('arc-lightbox v2 motion', () => {
  afterEach(cleanup);

  it('grows the image out of its origin on open', async () => {
    const el = await openWithOrigin(0);
    const dialog = el.shadowRoot.querySelector('dialog');
    expect(dialog.dataset.motion).to.equal('grow');
    expect(await until(() => scripted(imageOf(el)).length > 0)).to.equal(true);
    // One uniform scale, so the photo is never stretched, and a clip to the thumbnail's crop.
    const [first] = scripted(imageOf(el))[0].effect.getKeyframes();
    const m = /scale\(([^)]+)\)/.exec(first.transform);
    const parts = m[1].split(',').map(Number);
    const [sx, sy = sx] = parts;
    expect(parts.length, 'a single scale factor').to.equal(1);
    expect(Math.abs(sx - sy)).to.be.below(1e-6);
    expect(first.clipPath).to.match(/^inset\(/);
    const origin = el.images[0].origin.getBoundingClientRect();
    const rest = imageOf(el);
    expect(sx).to.be.closeTo(
      Math.max(origin.width / rest.offsetWidth, origin.height / rest.offsetHeight),
      1e-6,
    );
  });

  it('asks arc-close first, and animates only once the close is not vetoed', async () => {
    const el = await openWithOrigin(0);
    await until(() => scripted(imageOf(el)).length === 0, { timeout: 1500 });
    el.addEventListener('arc-close', (e) => e.preventDefault(), { once: true });
    el.close();
    await el.updateComplete;
    expect(el.open, 'vetoed').to.equal(true);
    expect(scripted(imageOf(el)), 'no shrink after a veto').to.have.length(0);

    let order = [];
    el.addEventListener('arc-close', () => order.push(`event:${scripted(imageOf(el)).length}`), {
      once: true,
    });
    el.close();
    order.push(`after:${scripted(imageOf(el)).length}`);
    expect(order).to.deep.equal(['event:0', 'after:1']);
    expect(el.open, 'open until the shrink ends').to.equal(true);
    el.close();
    expect(await until(() => !el.open, { timeout: 1500 })).to.equal(true);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('dialog').open).to.equal(false);
  });

  it('show() during the shrink keeps the viewer open', async () => {
    const el = await openWithOrigin(0);
    el.close();
    el.show();
    await new Promise((r) => setTimeout(r, 450));
    expect(el.open).to.equal(true);
    expect(el.shadowRoot.querySelector('dialog').dataset.motion).to.not.equal('gone');
  });

  it('rapid steps leave one sliding copy at most, and none once they settle', async () => {
    const el = await openWithOrigin(0);
    const fig = figureOf(el);
    for (let i = 0; i < 4; i++) {
      el.next();
      await el.updateComplete;
      expect(fig.querySelectorAll('.lightbox__ghost').length).to.be.at.most(1);
    }
    expect(
      await until(() => fig.querySelectorAll('.lightbox__ghost').length === 0, { timeout: 1500 }),
    ).to.equal(true);
    expect(await until(() => scripted(imageOf(el)).length === 0, { timeout: 1500 })).to.equal(true);
    expect(fig.querySelectorAll('img').length).to.equal(1);
  });

  it('with reduced motion: no grow, no slide, and close is immediate', async () => {
    const real = window.matchMedia;
    window.matchMedia = (q) => ({
      ...real.call(window, q),
      matches: /reduce/.test(q) || real.call(window, q).matches,
    });
    try {
      const el = await openWithOrigin(0);
      expect(el.shadowRoot.querySelector('dialog').dataset.motion).to.equal(undefined);
      expect(scripted(imageOf(el))).to.have.length(0);
      el.next();
      await el.updateComplete;
      expect(figureOf(el).querySelectorAll('.lightbox__ghost')).to.have.length(0);
      expect(scripted(imageOf(el))).to.have.length(0);
      el.close();
      await el.updateComplete;
      expect(el.open).to.equal(false);
    } finally {
      window.matchMedia = real;
    }
  });
});
