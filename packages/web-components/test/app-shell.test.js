/**
 * arc-app-shell — the topbar / sidebar / content / toc frame.
 *
 * What this pins: the mobile breakpoint drives the drawer, an open drawer is a
 * modal surface (scroll locked, focus moved in, focus returned on close), and
 * the four ways it can be dismissed all announce arc-sidebar-toggle so the
 * hamburger in arc-top-bar stays in step.
 *
 * Viewport width is not controllable from a test, so `breakpoint` is moved
 * instead — the component compares `window.innerWidth <= this.breakpoint`, so a
 * huge breakpoint means mobile and a tiny one means desktop. That exercises the
 * real comparison rather than stubbing it out.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, nextFrame, record, deepActive, pressKey } from './helpers.js';

import '../src/layout/app-shell.register.js';

afterEach(() => {
  document.body.style.overflow = '';
  cleanup();
});

/** Mount a shell in mobile or desktop mode by moving the breakpoint. */
async function shell({ mobile = true } = {}) {
  const el = mount(`
    <arc-app-shell breakpoint="${mobile ? 100000 : 1}">
      <div slot="topbar">Top</div>
      <nav slot="sidebar"><a href="/a" id="nav-a">Alpha</a></nav>
      <main>Content</main>
    </arc-app-shell>
  `);
  await settle(el);
  return el;
}

const drawer = (el) => el.shadowRoot.querySelector('.shell__sidebar');
const backdrop = (el) => el.shadowRoot.querySelector('.shell__backdrop');

/** Open the drawer and let the focus move land. */
async function openDrawer(el) {
  el.sidebarOpen = true;
  await settle(el);
  await nextFrame();
}

describe('arc-app-shell rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await shell();
    for (const part of ['shell', 'body', 'sidebar', 'main', 'content', 'toc']) {
      expect(el.shadowRoot.querySelector(`[part~="${part}"]`), part).to.not.equal(null);
    }
  });

  it('projects all four slots', async () => {
    const el = await shell();
    const named = (sel) => el.shadowRoot.querySelector(sel).assignedElements();
    expect(named('slot[name="topbar"]')[0].textContent).to.equal('Top');
    expect(named('slot[name="sidebar"]')[0].tagName).to.equal('NAV');
    expect(named('slot:not([name])')[0].tagName).to.equal('MAIN');
  });

  it('marks an empty toc so the column can collapse', async () => {
    const el = await shell();
    expect(el.shadowRoot.querySelector('.shell__toc').classList.contains('shell__toc--empty'))
      .to.equal(true);
  });
});

describe('arc-app-shell breakpoint', () => {
  it('marks itself mobile below the breakpoint', async () => {
    const el = await shell({ mobile: true });
    expect(el.hasAttribute('mobile')).to.equal(true);
  });

  it('is not mobile above it', async () => {
    const el = await shell({ mobile: false });
    expect(el.hasAttribute('mobile')).to.equal(false);
  });

  it('re-evaluates on resize', async () => {
    const el = await shell({ mobile: true });
    expect(el.hasAttribute('mobile')).to.equal(true);

    el.breakpoint = 1;
    window.dispatchEvent(new Event('resize'));
    await settle(el);

    expect(el.hasAttribute('mobile'), 'crossing the breakpoint flips the mode').to.equal(false);
  });

  it('closes the drawer when the viewport grows past the breakpoint', async () => {
    const el = await shell({ mobile: true });
    await openDrawer(el);
    expect(el.sidebarOpen).to.equal(true);

    el.breakpoint = 1;
    window.dispatchEvent(new Event('resize'));
    await settle(el);

    expect(el.sidebarOpen, 'a desktop layout has no drawer to leave open').to.equal(false);
  });

  it('stops listening for resize once disconnected', async () => {
    const el = await shell({ mobile: true });
    el.remove();

    el.breakpoint = 1;
    window.dispatchEvent(new Event('resize'));
    await settle(el);

    expect(el.hasAttribute('mobile'), 'a detached shell must not keep measuring').to.equal(true);
  });
});

describe('arc-app-shell drawer as a modal surface', () => {
  it('locks page scroll while open and releases it on close', async () => {
    const el = await shell();

    await openDrawer(el);
    expect(document.body.style.overflow, 'locked').to.equal('hidden');

    el.sidebarOpen = false;
    await settle(el);
    expect(document.body.style.overflow, 'released').to.not.equal('hidden');
  });

  it('moves focus into the drawer on open', async () => {
    const el = await shell();
    await openDrawer(el);

    expect(deepActive(), 'the first focusable in the drawer').to.equal(
      el.querySelector('#nav-a'),
    );
  });

  it('returns focus to whatever had it before opening', async () => {
    const outside = mount('<button>hamburger</button>');
    const el = await shell();
    outside.focus();

    await openDrawer(el);
    expect(deepActive()).to.not.equal(outside);

    el.sidebarOpen = false;
    await settle(el);
    expect(deepActive()).to.equal(outside);
  });

  it('does none of that on desktop', async () => {
    const el = await shell({ mobile: false });
    el.sidebarOpen = true;
    await settle(el);
    await nextFrame();

    expect(document.body.style.overflow, 'no scroll lock on a static sidebar')
      .to.not.equal('hidden');
  });
});

describe('arc-app-shell dismissal announces itself', () => {
  it('closes on Escape and says so', async () => {
    const el = await shell();
    await openDrawer(el);
    const details = [];
    el.addEventListener('arc-sidebar-toggle', (e) => details.push(e.detail));

    pressKey('Escape');
    await settle(el);

    expect(el.sidebarOpen).to.equal(false);
    expect(details).to.deep.equal([{ value: false }]);
  });

  it('closes on a backdrop click and says so', async () => {
    const el = await shell();
    await openDrawer(el);
    const details = [];
    el.addEventListener('arc-sidebar-toggle', (e) => details.push(e.detail));

    backdrop(el).click();
    await settle(el);

    expect(el.sidebarOpen).to.equal(false);
    expect(details).to.deep.equal([{ value: false }]);
  });

  it('closes when a navigation happens inside it and says so', async () => {
    const el = await shell();
    await openDrawer(el);
    const details = [];
    el.addEventListener('arc-sidebar-toggle', (e) => details.push(e.detail));

    el.querySelector('#nav-a').dispatchEvent(
      new CustomEvent('arc-navigate', { bubbles: true, composed: true }),
    );
    await settle(el);

    expect(el.sidebarOpen).to.equal(false);
    expect(details).to.deep.equal([{ value: false }]);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await shell();
    await openDrawer(el);
    let event = null;
    document.body.addEventListener('arc-sidebar-toggle', (e) => { event = e; }, { once: true });

    pressKey('Escape');
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('stays silent when the state did not actually change', async () => {
    const el = await shell();
    const seen = record(el, ['arc-sidebar-toggle']);

    backdrop(el).click();
    await settle(el);

    expect(el.sidebarOpen).to.equal(false);
    expect(seen, 'closing an already-closed drawer announces nothing').to.deep.equal([]);
  });

  it('ignores Escape while closed', async () => {
    const el = await shell();
    const seen = record(el, ['arc-sidebar-toggle']);

    pressKey('Escape');
    await settle(el);

    expect(seen).to.deep.equal([]);
  });
});

describe('arc-app-shell toggle echo guard', () => {
  it('accepts a toggle raised by a descendant', async () => {
    const el = await shell();

    el.querySelector('[slot="topbar"]').dispatchEvent(
      new CustomEvent('arc-sidebar-toggle', {
        detail: { value: true },
        bubbles: true,
        composed: true,
      }),
    );
    await settle(el);

    expect(el.sidebarOpen, 'the hamburger drives the drawer').to.equal(true);
  });

  it('does not re-enter on its own notification', async () => {
    // _setOpen dispatches from the shell itself; _onToggle drops anything whose
    // target is the shell, or the two would ping-pong.
    const el = await shell();
    await openDrawer(el);
    const seen = record(el, ['arc-sidebar-toggle']);

    pressKey('Escape');
    await settle(el);

    expect(el.sidebarOpen).to.equal(false);
    expect(seen, 'exactly one notification, not a loop').to.have.lengthOf(1);
  });

  it('toggles when a descendant event carries no value', async () => {
    const el = await shell();

    el.querySelector('[slot="topbar"]').dispatchEvent(
      new CustomEvent('arc-sidebar-toggle', { bubbles: true, composed: true }),
    );
    await settle(el);

    expect(el.sidebarOpen).to.equal(true);
  });
});
