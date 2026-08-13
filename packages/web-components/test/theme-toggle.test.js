/**
 * arc-theme-toggle — the dark/light/auto cycler.
 *
 * This is the one component in the library that writes to global state on its
 * own: `document.documentElement[data-theme]` and `localStorage['arc-theme']`.
 * Every test here restores both, or the next file to read a theme token gets
 * whichever mode the last test happened to leave behind.
 *
 * What this pins: the cycle order and its wrap, that a click and a key press
 * each advance exactly one step, arc-change carrying the new theme on
 * detail.value, `disabled` muting the cycle, and the connect-time restore from
 * storage.
 *
 * Two tests are marked BUG: the documented "automatically synced" claim only
 * holds for the click path, not for the property. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

import '../src/input/theme-toggle.register.js';
import '../src/input/icon-button.register.js';

/** The component reads these on connect, so they must be pristine per test. */
let storedBefore;
let attrBefore;

beforeEach(() => {
  storedBefore = localStorage.getItem('arc-theme');
  attrBefore = document.documentElement.getAttribute('data-theme');
  localStorage.removeItem('arc-theme');
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  cleanup();
  if (storedBefore === null) localStorage.removeItem('arc-theme');
  else localStorage.setItem('arc-theme', storedBefore);
  if (attrBefore === null) document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', attrBefore);
});

async function toggle(attrs = '') {
  const el = mount(`<arc-theme-toggle ${attrs}></arc-theme-toggle>`);
  await settle(el);
  return el;
}

const button = (el) => el.shadowRoot.querySelector('[part="button"]');
const label = (el) => el.shadowRoot.querySelector('[part="label"]');
const docTheme = () => document.documentElement.getAttribute('data-theme');

describe('arc-theme-toggle rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await toggle();
    for (const part of ['button', 'icon', 'label']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('names the current theme in the label and the accessible name', async () => {
    const el = await toggle();
    expect(el.theme).to.equal('auto');
    expect(label(el).textContent.trim()).to.equal('auto');
    expect(button(el).getAttribute('aria-label')).to.contain('auto');
  });

  it('lights the icon matching the current theme', async () => {
    const el = await toggle();
    el.theme = 'light';
    await settle(el);
    const active = el.shadowRoot.querySelectorAll('svg.is-active');
    expect(active, 'exactly one glyph is active at a time').to.have.lengthOf(1);
  });

  it('hides the decorative glyphs from assistive tech', async () => {
    const el = await toggle();
    const svgs = [...el.shadowRoot.querySelectorAll('svg')];
    expect(svgs.length).to.be.greaterThan(0);
    expect(svgs.every((s) => s.getAttribute('aria-hidden') === 'true')).to.equal(true);
  });
});

describe('arc-theme-toggle cycling', () => {
  it('walks dark → light → auto → dark', async () => {
    const el = await toggle();
    el.theme = 'dark';
    await settle(el);

    button(el).click();
    await settle(el);
    expect(el.theme).to.equal('light');

    button(el).click();
    await settle(el);
    expect(el.theme).to.equal('auto');

    button(el).click();
    await settle(el);
    expect(el.theme, 'wraps back to the start').to.equal('dark');
  });

  it('advances one step per click, and announces it', async () => {
    const el = await toggle();
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    button(el).click();
    await settle(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].value, 'detail.value carries the new theme').to.equal(el.theme);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await toggle();
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    button(el).click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('cycles once for Enter and once for Space', async () => {
    for (const key of ['Enter', ' ']) {
      const el = await toggle();
      const before = el.theme;
      const seen = record(el, ['arc-change']);

      keyOn(button(el), key);
      await settle(el);

      expect(el.theme, `${key} advances one step`).to.not.equal(before);
      expect(seen, `${key} announces once`).to.have.lengthOf(1);
      cleanup();
    }
  });

  it('claims Enter and Space', async () => {
    const el = await toggle();
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      button(el).dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
    }
  });

  it('ignores other keys', async () => {
    const el = await toggle();
    const before = el.theme;
    const seen = record(el, ['arc-change']);

    keyOn(button(el), 'ArrowRight');
    await settle(el);

    expect(el.theme).to.equal(before);
    expect(seen).to.deep.equal([]);
  });
});

describe('arc-theme-toggle global state', () => {
  it('writes the new theme to the document root and to storage', async () => {
    const el = await toggle();
    button(el).click();
    await settle(el);

    expect(docTheme(), 'the page theme follows').to.equal(el.theme);
    expect(localStorage.getItem('arc-theme'), 'and persists').to.equal(el.theme);
  });

  it('restores a stored theme on connect, in preference to the document', async () => {
    localStorage.setItem('arc-theme', 'light');
    document.documentElement.setAttribute('data-theme', 'dark');

    const el = await toggle();
    expect(el.theme).to.equal('light');
  });

  it('falls back to the document theme when storage is empty', async () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const el = await toggle();
    expect(el.theme).to.equal('dark');
  });

  it('falls back to auto when neither is set', async () => {
    const el = await toggle();
    expect(el.theme).to.equal('auto');
  });

  it('ignores a junk value in storage', async () => {
    localStorage.setItem('arc-theme', 'neon');
    const el = await toggle();
    expect(el.theme, 'an unrecognised stored theme must not be adopted').to.equal('auto');
  });

  // BUG: theme-toggle.js:10 documents `theme` as "Automatically synced to
  // localStorage and the document root `data-theme` attribute." Only _cycle()
  // (theme-toggle.js:156-157) performs that sync, so assigning the property —
  // the documented way to drive the component from application state — updates
  // the button and nothing else. The page keeps its old theme.
  it('BUG: setting theme from script does not sync the document or storage', async () => {
    const el = await toggle();
    el.theme = 'dark';
    await settle(el);

    expect(label(el).textContent.trim(), 'the button updates').to.equal('dark');
    expect(docTheme(), 'but the page theme does not follow').to.equal(null);
    expect(localStorage.getItem('arc-theme'), 'and nothing is persisted').to.equal(null);
  });

  // BUG: two toggles on one page do not agree. Each reads global state once, on
  // connect, and _cycle updates only the instance that was clicked — so the
  // other keeps rendering the previous theme while the page is already on the
  // new one.
  it('BUG: a second toggle on the page desyncs when the first is clicked', async () => {
    const wrap = mount('<div><arc-theme-toggle></arc-theme-toggle><arc-theme-toggle></arc-theme-toggle></div>');
    const [first, second] = wrap.querySelectorAll('arc-theme-toggle');
    await settle(first);
    await settle(second);

    button(first).click();
    await settle(first);
    await settle(second);

    expect(docTheme(), 'the page moved').to.equal(first.theme);
    expect(second.theme, 'the other toggle still shows the old theme').to.equal('auto');
    expect(second.theme).to.not.equal(first.theme);
  });
});

describe('arc-theme-toggle disabled', () => {
  it('mutes the cycle and leaves global state alone', async () => {
    const el = await toggle('disabled');
    const seen = record(el, ['arc-change']);

    button(el).click();
    keyOn(button(el), 'Enter');
    await settle(el);

    expect(el.theme).to.equal('auto');
    expect(seen).to.deep.equal([]);
    expect(docTheme()).to.equal(null);
    expect(localStorage.getItem('arc-theme')).to.equal(null);
  });
});

describe('arc-theme-toggle icon-only', () => {
  it('hides the text label without losing the accessible name', async () => {
    const el = await toggle('icon-only');
    // The span stays in the tree and is hidden with display:none, which also
    // takes it out of the accessibility tree — so the button's aria-label is
    // the only thing naming the control.
    expect(getComputedStyle(label(el)).display).to.equal('none');
    expect(button(el).getAttribute('aria-label'), 'the name survives in ARIA').to.contain('auto');
  });

  it('keeps the label visible in the default form', async () => {
    const el = await toggle();
    expect(getComputedStyle(label(el)).display).to.not.equal('none');
  });

  it('sizes the box per the documented scale, matching arc-icon-button', async () => {
    // The scale is the point of the prop: theme-toggle.js:13 says to set both
    // controls to the same value when they sit side by side, so the assertion
    // is against arc-icon-button rather than against the numbers alone.
    const sizes = { xs: '28px', sm: '32px', md: '36px', lg: '44px' };
    for (const [size, expected] of Object.entries(sizes)) {
      const el = await toggle(`icon-only size="${size}"`);
      const peer = mount(`<arc-icon-button name="plus" label="Add" size="${size}"></arc-icon-button>`);
      await settle(peer);

      expect(getComputedStyle(button(el)).width, size).to.equal(expected);
      expect(
        getComputedStyle(peer.shadowRoot.querySelector('button, a') ?? peer).width,
        `${size}: the two controls must agree`,
      ).to.equal(expected);
      cleanup();
    }
  });

  it('an unrecognised size lands on the medium default', async () => {
    const unknown = await toggle('icon-only size="enormous"');
    expect(getComputedStyle(button(unknown)).width).to.equal('36px');
  });
});
