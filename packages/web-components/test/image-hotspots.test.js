/**
 * arc-image-hotspots / arc-hotspot — the annotated-image pair.
 *
 * What is pinned here: pins land at their percentage coordinates (the whole
 * point of the component, and pure attribute-to-CSS so it must also hold
 * server-side), the parent's one-open-at-a-time rule on the keyboard path that
 * click-outside cannot cover, the two dismissal routes, the event contract
 * (arc-open/arc-close with detail.value = label, or index without one), and
 * that a bare arc-hotspot outside any parent neither crashes nor loses its
 * own open/close behaviour.
 */
import { expect } from '@esm-bundle/chai';
import '../src/content/image-hotspots.register.js';
import '../src/content/hotspot.register.js';
import { mount, cleanup, tick, pressKey, deepActive } from './helpers.js';

const SURFACE = `
  <arc-image-hotspots style="width: 400px">
    <div style="width: 400px; height: 300px"></div>
    <arc-hotspot x="25" y="75" label="First">One</arc-hotspot>
    <arc-hotspot x="60" y="10" label="Second">Two</arc-hotspot>
    <arc-hotspot x="150" y="-4">Unlabeled</arc-hotspot>
  </arc-image-hotspots>
`;

/** The pin <button> inside a hotspot's shadow root. */
const pin = (hotspot) => hotspot.shadowRoot.querySelector('.hotspot__pin');

async function mountSurface() {
  const el = mount(SURFACE);
  const hotspots = [...el.querySelectorAll('arc-hotspot')];
  await el.updateComplete;
  await Promise.all(hotspots.map((h) => h.updateComplete));
  await tick(); // let the slotchange scan assign indices
  return { el, hotspots };
}

describe('arc-hotspot positioning', () => {
  afterEach(cleanup);

  it('places each pin anchor at its x/y percentage coordinates', async () => {
    const { hotspots } = await mountSurface();
    const anchor = hotspots[0].shadowRoot.querySelector('.hotspot');
    expect(anchor.style.left).to.equal('25%');
    expect(anchor.style.top).to.equal('75%');
  });

  it('clamps out-of-range coordinates into 0-100', async () => {
    const { hotspots } = await mountSurface();
    const anchor = hotspots[2].shadowRoot.querySelector('.hotspot');
    expect(anchor.style.left, 'x=150 must clamp to the right edge').to.equal('100%');
    expect(anchor.style.top, 'y=-4 must clamp to the top edge').to.equal('0%');
  });

  it('centres a coordinate that does not parse as a number', async () => {
    const el = mount('<arc-hotspot x="wat" label="p">body</arc-hotspot>');
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.hotspot').style.left).to.equal('50%');
  });
});

describe('one popover at a time', () => {
  afterEach(cleanup);

  it('opening a second pin closes the first (keyboard path, no pointerdown)', async () => {
    const { hotspots } = await mountSurface();
    pin(hotspots[0]).click();
    await hotspots[0].updateComplete;
    expect(hotspots[0].open).to.equal(true);

    pin(hotspots[1]).click();
    await Promise.all(hotspots.map((h) => h.updateComplete));
    expect(hotspots[1].open, 'the clicked pin must open').to.equal(true);
    expect(hotspots[0].open, 'the previously open pin must close').to.equal(false);
  });

  it('routes the coordinated close through arc-close, so a veto holds', async () => {
    const { hotspots } = await mountSurface();
    pin(hotspots[0]).click();
    await hotspots[0].updateComplete;

    hotspots[0].addEventListener('arc-close', (e) => e.preventDefault(), { once: true });
    pin(hotspots[1]).click();
    await Promise.all(hotspots.map((h) => h.updateComplete));
    expect(hotspots[0].open, 'a vetoed close must leave the popover open').to.equal(true);
  });
});

describe('dismissal', () => {
  afterEach(cleanup);

  it('Escape closes the open popover', async () => {
    const { hotspots } = await mountSurface();
    pin(hotspots[0]).click();
    await hotspots[0].updateComplete;

    pressKey('Escape');
    await hotspots[0].updateComplete;
    expect(hotspots[0].open).to.equal(false);
  });

  it('a pointerdown outside the hotspot closes it', async () => {
    const { hotspots } = await mountSurface();
    pin(hotspots[0]).click();
    await hotspots[0].updateComplete;

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await hotspots[0].updateComplete;
    expect(hotspots[0].open).to.equal(false);
  });
});

describe('event contract', () => {
  afterEach(cleanup);

  it('arc-open bubbles to the parent with detail.value = label', async () => {
    const { el, hotspots } = await mountSurface();
    const details = [];
    el.addEventListener('arc-open', (e) => details.push(e.detail));

    pin(hotspots[1]).click();
    await hotspots[1].updateComplete;
    expect(details.length).to.equal(1);
    expect(details[0].value).to.equal('Second');
  });

  it('arc-close carries the same value, and fires before the state flips', async () => {
    const { el, hotspots } = await mountSurface();
    pin(hotspots[0]).click();
    await hotspots[0].updateComplete;

    let detail = null;
    let openDuringEvent = null;
    el.addEventListener('arc-close', (e) => {
      detail = e.detail;
      openDuringEvent = hotspots[0].open;
    }, { once: true });

    pin(hotspots[0]).click();
    await hotspots[0].updateComplete;
    expect(detail.value).to.equal('First');
    expect(openDuringEvent, 'listener must observe the still-open state').to.equal(true);
    expect(hotspots[0].open).to.equal(false);
  });

  it('an unlabeled hotspot falls back to its index as detail.value', async () => {
    const { el, hotspots } = await mountSurface();
    const details = [];
    el.addEventListener('arc-open', (e) => details.push(e.detail));

    pin(hotspots[2]).click();
    await hotspots[2].updateComplete;
    expect(details[0].value).to.equal(2);
  });
});

describe('keyboard access', () => {
  afterEach(cleanup);

  it('each pin is a real button that takes focus', async () => {
    const { hotspots } = await mountSurface();
    for (const hotspot of hotspots) {
      const button = pin(hotspot);
      expect(button.tagName).to.equal('BUTTON');
      button.focus();
      expect(deepActive()).to.equal(button);
    }
  });

  it('exposes popover semantics on the pin', async () => {
    const { hotspots } = await mountSurface();
    const button = pin(hotspots[0]);
    expect(button.getAttribute('aria-haspopup')).to.equal('dialog');
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    expect(button.getAttribute('aria-label')).to.equal('First');

    button.click();
    await hotspots[0].updateComplete;
    expect(button.getAttribute('aria-expanded')).to.equal('true');
  });
});

describe('bare arc-hotspot', () => {
  afterEach(cleanup);

  it('renders and opens safely outside any parent', async () => {
    const el = mount('<arc-hotspot x="10" y="10" label="Solo">body</arc-hotspot>');
    await el.updateComplete;

    pin(el).click();
    await el.updateComplete;
    expect(el.open).to.equal(true);

    pressKey('Escape');
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });
});
