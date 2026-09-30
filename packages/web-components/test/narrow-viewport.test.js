/**
 * Fixed chrome at phone width: arc-top-bar and arc-toast inside a 360px iframe,
 * so their media queries see a phone viewport.
 *
 * Both bugs here were reported from getpulsar.dev at 360px: the toast stack ran
 * 24px past the right edge and widened the page, and the top bar's center slot
 * drew over its actions.
 */
import { expect } from '@esm-bundle/chai';
import { until } from './helpers.js';

const frames = [];
afterEach(() => {
  while (frames.length) frames.pop().remove();
});

/** A same-origin iframe of the given width running `body` with the listed modules loaded. */
async function phone(body, modules, width = 360) {
  const frame = document.createElement('iframe');
  frame.style.cssText = `width:${width}px;height:640px;border:0`;
  const scripts = modules.map((m) => `<script type="module" src="${m}"></script>`).join('');
  frame.srcdoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>body{margin:0}</style>${scripts}</head><body>${body}</body></html>`;
  frames.push(frame);
  document.body.append(frame);
  await new Promise((r) => frame.addEventListener('load', r, { once: true }));
  return frame.contentWindow;
}

const SRC = '/packages/web-components/src';

describe('narrow viewport', () => {
  it('keeps every toast position inside a 360px viewport', async () => {
    const win = await phone('<arc-toast></arc-toast>', [`${SRC}/feedback/toast.register.js`]);
    const toast = win.document.querySelector('arc-toast');
    await until(() => toast.shadowRoot?.querySelector('.toast-container'));
    for (const position of [
      'top-right',
      'top-left',
      'top-center',
      'bottom-right',
      'bottom-left',
      'bottom-center',
    ]) {
      toast.setAttribute('position', position);
      await toast.updateComplete;
      const box = toast.shadowRoot.querySelector('.toast-container').getBoundingClientRect();
      expect(box.left, position).to.be.at.least(0);
      expect(box.right, position).to.be.at.most(win.innerWidth);
    }
    expect(win.document.documentElement.scrollWidth).to.equal(win.innerWidth);
  });

  it('keeps the top bar center between the brand and the actions', async () => {
    const win = await phone(
      `<arc-top-bar contained="lg" mobile-menu="none">
        <span slot="logo" style="display:inline-block;width:115px;height:28px"></span>
        <button slot="center" style="width:40px;height:40px">s</button>
        <span slot="actions" style="display:inline-block;width:130px;height:32px"></span>
      </arc-top-bar>`,
      [`${SRC}/navigation/top-bar.register.js`],
      390,
    );
    const bar = win.document.querySelector('arc-top-bar');
    await until(() => bar.shadowRoot?.querySelector('.topbar__actions'));
    await bar.updateComplete;
    const rect = (sel) => bar.shadowRoot.querySelector(sel).getBoundingClientRect();
    const brand = rect('.topbar__brand');
    const actions = rect('.topbar__actions');
    const center = win.document.querySelector('[slot="center"]').getBoundingClientRect();
    expect(center.left).to.be.at.least(brand.right);
    expect(center.right).to.be.at.most(actions.left);
    expect(actions.right).to.be.at.most(win.innerWidth);
    // Phone gutter: 16px, not the desktop 24px.
    expect(brand.left).to.equal(16);
  });

  it('moves the center next to the actions with mobile-center="end", and hides it with "hidden"', async () => {
    const bar = (mc) => `<arc-top-bar mobile-menu="none" mobile-center="${mc}">
        <span slot="logo" style="display:inline-block;width:80px;height:28px"></span>
        <button slot="center" style="width:40px;height:40px">s</button>
        <span slot="actions" style="display:inline-block;width:90px;height:32px"></span>
      </arc-top-bar>`;
    const win = await phone(
      bar('end') + bar('hidden'),
      [`${SRC}/navigation/top-bar.register.js`],
      390,
    );
    const [end, hidden] = win.document.querySelectorAll('arc-top-bar');
    await until(
      () =>
        end.shadowRoot?.querySelector('.topbar__actions') &&
        hidden.shadowRoot?.querySelector('.topbar__center'),
    );
    await end.updateComplete;
    const center = end.querySelector('[slot="center"]').getBoundingClientRect();
    const actions = end.shadowRoot.querySelector('.topbar__actions').getBoundingClientRect();
    const gap = parseFloat(
      win.getComputedStyle(end.shadowRoot.querySelector('.topbar__content')).columnGap,
    );
    expect(Math.round(actions.left - center.right)).to.equal(Math.round(gap));
    expect(
      win.getComputedStyle(hidden.shadowRoot.querySelector('.topbar__center')).display,
    ).to.equal('none');
  });

  it('renders no hamburger for mobile-menu="none"', async () => {
    const win = await phone(
      '<arc-top-bar mobile-menu="none"></arc-top-bar><arc-top-bar id="b"></arc-top-bar>',
      [`${SRC}/navigation/top-bar.register.js`],
    );
    const [none, dflt] = win.document.querySelectorAll('arc-top-bar');
    await until(
      () =>
        none.shadowRoot?.querySelector('.topbar__content') &&
        dflt.shadowRoot?.querySelector('.topbar__content'),
    );
    expect(none.shadowRoot.querySelector('[part="menu-btn"]')).to.equal(null);
    expect(dflt.shadowRoot.querySelector('[part="menu-btn"]')).to.not.equal(null);
  });

  it('puts the center one extra-small step from the menu when the actions show nothing', async () => {
    // The getpulsar.dev bar on a phone: its actions are there but all hidden.
    const win = await phone(
      `<arc-top-bar mobile-menu="nav" menu-position="right" mobile-center="end">
        <span slot="logo" style="display:inline-block;width:100px;height:28px"></span>
        <button slot="center" style="width:36px;height:36px">s</button>
        <div slot="actions" id="acts"><span style="display:none">x</span></div>
      </arc-top-bar>`,
      [`${SRC}/navigation/top-bar.register.js`],
    );
    const bar = win.document.querySelector('arc-top-bar');
    await until(() => bar.shadowRoot?.querySelector('.topbar__actions--empty'));
    const step = () => {
      const center = win.document.querySelector('[slot="center"]').getBoundingClientRect();
      return (
        bar.shadowRoot.querySelector('[part="menu-btn"]').getBoundingClientRect().left -
        center.right
      );
    };
    const xs = parseFloat(win.getComputedStyle(bar).getPropertyValue('--space-xs'));
    expect(step()).to.be.closeTo(xs, 0.5);

    // Something showing again: the box takes its place back.
    const acts = win.document.getElementById('acts');
    acts.firstElementChild.style.display = 'inline-block';
    await until(() => !bar.shadowRoot.querySelector('.topbar__actions--empty'));
    const box = bar.shadowRoot.querySelector('[part="actions"]').getBoundingClientRect();
    const menu = bar.shadowRoot.querySelector('[part="menu-btn"]').getBoundingClientRect();
    expect(menu.left - box.right).to.be.closeTo(xs, 0.5);
  });

  it('docks a zoomed lightbox caption at the foot of the stage, not across the picture', async () => {
    // A landscape picture on a phone sits mid-screen with its caption just
    // under it; zoomed, that caption crossed the middle of the image.
    const px = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    const win = await phone(
      '<arc-lightbox></arc-lightbox>',
      [`${SRC}/content/lightbox.register.js`],
      390,
    );
    const box = win.document.querySelector('arc-lightbox');
    await until(() => box.shadowRoot);
    box.images = [
      {
        src: px,
        width: 1600,
        height: 900,
        caption: 'A valley at first light, from the east ridge.',
      },
    ];
    await box.updateComplete;
    box.show(0);
    await box.updateComplete;
    await until(() => box.shadowRoot.querySelector('[part~="caption"]'));
    const settle = () => box.shadowRoot.getAnimations().forEach((a) => a.finish());
    box.shadowRoot.querySelector('[part="zoom"]').click();
    await box.updateComplete;
    settle();
    const stage = box.shadowRoot.querySelector('[part~="figure"]').getBoundingClientRect();
    const caption = box.shadowRoot.querySelector('[part~="caption"]').getBoundingClientRect();
    expect(caption.bottom, 'at the foot').to.be.closeTo(stage.bottom - 8, 1);
    expect(caption.top, 'clear of the middle').to.be.greaterThan(stage.top + stage.height * 0.75);
  });

  it('keeps a long lightbox caption to three lines, with More to read the rest', async () => {
    const px = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    const win = await phone(
      '<arc-lightbox></arc-lightbox>',
      [`${SRC}/content/lightbox.register.js`],
      390,
    );
    const box = win.document.querySelector('arc-lightbox');
    await until(() => box.shadowRoot);
    const long =
      'A wide valley at first light, seen from the east ridge above the old mill road, with the river still in shadow and mist lifting off the water meadows where the herons feed before the walkers arrive. '.repeat(
        3,
      );
    box.images = [
      { src: px, width: 1600, height: 900, caption: long },
      { src: px, width: 1600, height: 900, caption: 'Short.' },
    ];
    await box.updateComplete;
    box.show(0);
    await box.updateComplete;
    const q = (sel) => box.shadowRoot.querySelector(sel);
    await until(() => q('[part="caption-toggle"]'));
    box.shadowRoot.getAnimations().forEach((a) => a.finish());

    const text = q('[part="caption-text"]');
    const lineHeight = parseFloat(win.getComputedStyle(text).lineHeight);
    expect(text.getBoundingClientRect().height, 'three lines at rest').to.be.at.most(
      lineHeight * 3 + 1,
    );
    expect(
      q('[part~="image"]').getBoundingClientRect().height,
      'the picture keeps the stage',
    ).to.be.greaterThan(150);

    const toggle = q('[part="caption-toggle"]');
    expect(toggle.getAttribute('aria-expanded')).to.equal('false');
    toggle.click();
    await box.updateComplete;
    expect(toggle.getAttribute('aria-expanded')).to.equal('true');
    expect(
      text.getBoundingClientRect().height,
      'opens, within two fifths of the screen',
    ).to.be.greaterThan(lineHeight * 3);
    expect(text.getBoundingClientRect().height).to.be.at.most(win.innerHeight * 0.4 + 1);
    expect(text.scrollHeight, 'the rest scrolls').to.be.greaterThan(text.clientHeight);

    box.next();
    await box.updateComplete;
    await new Promise((r) => win.requestAnimationFrame(() => win.requestAnimationFrame(r)));
    await box.updateComplete;
    expect(q('[part="caption-toggle"]'), 'a short caption offers nothing').to.equal(null);
  });

  it('collapses empty actions on a server-rendered bar too, once it hydrates', async function () {
    this.timeout(8000);
    // getpulsar.dev on 4.9.0-pre: the actions reader ran before the adopting
    // render, so its client-only answer ("nothing showing") was taken as
    // already rendered and the collapse never reached the page.
    const markup = `<arc-top-bar mobile-menu="nav" menu-position="right" mobile-center="end">
        <span slot="logo" style="display:inline-block;width:100px;height:28px"></span>
        <button slot="center" style="width:36px;height:36px">s</button>
        <div slot="actions" id="acts"><button>Install</button></div>
      </arc-top-bar>`;
    const { default: ssr } = await import(`/__ssr-render.js?m=${encodeURIComponent(btoa(markup))}`);
    const win = await phone(
      `<style>#acts > * { display: none }</style>${ssr}`,
      [`${SRC}/hydrate.js`, `${SRC}/navigation/top-bar.register.js`],
    );
    const bar = win.document.querySelector('arc-top-bar');
    expect(bar.shadowRoot, 'server-rendered').to.not.equal(null);
    expect(await until(() => bar.shadowRoot.querySelector('.topbar__actions--empty'), { timeout: 3000 }), 'collapsed').to.equal(true);
    const center = win.document.querySelector('[slot="center"]').getBoundingClientRect();
    const menu = bar.shadowRoot.querySelector('[part="menu-btn"]').getBoundingClientRect();
    const xs = parseFloat(win.getComputedStyle(bar).getPropertyValue('--space-xs'));
    expect(menu.left - center.right).to.be.closeTo(xs, 0.5);
  });
});
