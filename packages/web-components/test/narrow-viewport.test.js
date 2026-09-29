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
    for (const position of ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center']) {
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
    const win = await phone(bar('end') + bar('hidden'), [`${SRC}/navigation/top-bar.register.js`], 390);
    const [end, hidden] = win.document.querySelectorAll('arc-top-bar');
    await until(() => end.shadowRoot?.querySelector('.topbar__actions') && hidden.shadowRoot?.querySelector('.topbar__center'));
    await end.updateComplete;
    const center = end.querySelector('[slot="center"]').getBoundingClientRect();
    const actions = end.shadowRoot.querySelector('.topbar__actions').getBoundingClientRect();
    const gap = parseFloat(win.getComputedStyle(end.shadowRoot.querySelector('.topbar__content')).columnGap);
    expect(Math.round(actions.left - center.right)).to.equal(Math.round(gap));
    expect(win.getComputedStyle(hidden.shadowRoot.querySelector('.topbar__center')).display).to.equal('none');
  });

  it('renders no hamburger for mobile-menu="none"', async () => {
    const win = await phone('<arc-top-bar mobile-menu="none"></arc-top-bar><arc-top-bar id="b"></arc-top-bar>', [
      `${SRC}/navigation/top-bar.register.js`,
    ]);
    const [none, dflt] = win.document.querySelectorAll('arc-top-bar');
    await until(() => none.shadowRoot?.querySelector('.topbar__content') && dflt.shadowRoot?.querySelector('.topbar__content'));
    expect(none.shadowRoot.querySelector('[part="menu-btn"]')).to.equal(null);
    expect(dflt.shadowRoot.querySelector('[part="menu-btn"]')).to.not.equal(null);
  });
});
