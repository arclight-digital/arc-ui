/**
 * Documented compositions, asserted as compositions.
 *
 * Findings #90 and #91. Both are pairs of components that ship together, are
 * documented as composing, and visibly broke when composed — and both were
 * invisible to a suite that mounts components singly. `doc-claims` cannot reach
 * them either: it validates @csspart, @fires and @prop because those are
 * single-component surfaces, and "automatically applied when TopBar is placed
 * inside an AppShell" is a claim about two components in a relationship.
 *
 * The rule for adding here: the assertion must be a sentence from one
 * component's documentation that only the other component can make true.
 */
import { expect } from '@esm-bundle/chai';
import '../src/layout/app-shell.register.js';
import '../src/navigation/top-bar.register.js';
import '../src/navigation/sidebar.register.js';
import '../src/layout/page-header.register.js';
import '../src/input/inline-edit.register.js';
import '../src/feedback/toast.register.js';
import { mount, cleanup, tick, deepActive } from './helpers.js';

/**
 * The default application layout, as the docs write it.
 *
 * `breakpoint` is pinned below the runner's 800px window so the shell lays out
 * in its desktop mode. The mobile rail is a fixed overlay with its own
 * padding-top, which measures differently for reasons that have nothing to do
 * with what is under test here.
 */
const SHELL = `
  <arc-app-shell breakpoint="320">
    <arc-top-bar slot="topbar" heading="Dawn"></arc-top-bar>
    <arc-sidebar slot="sidebar">
      <arc-sidebar-section heading="Project">
        <a href="/one">One</a>
      </arc-sidebar-section>
    </arc-sidebar>
    <div style="height:2000px">Tall content</div>
  </arc-app-shell>`;

async function mountShell() {
  const shell = mount(SHELL);
  await shell.updateComplete;
  const bar = shell.querySelector('arc-top-bar');
  const sidebar = shell.querySelector('arc-sidebar');
  await bar.updateComplete;
  await sidebar.updateComplete;
  // Sections arrive by slotchange, which schedules a further update.
  await tick();
  await sidebar.updateComplete;
  return { shell, bar, sidebar };
}

describe('arc-top-bar inside arc-app-shell', () => {
  afterEach(() => cleanup());

  /**
   * The shell reserves --nav-height of padding on .shell__body for a bar it
   * expects to be out of flow. Nothing used to put it out of flow, so the
   * default composition rendered the bar *and* the space for it: a 128px gap at
   * the top of every page, with no error and nothing in the console.
   */
  it('is fixed, as top-bar.js documents', async () => {
    const { bar } = await mountShell();
    expect(bar.fixed, '@prop fixed says the shell applies this').to.equal(true);
    expect(getComputedStyle(bar).position).to.equal('fixed');
  });

  it('reserves the space for the bar exactly once', async () => {
    const { shell, bar } = await mountShell();
    const wrapper = shell.shadowRoot.querySelector('.shell__topbar');
    const body = shell.shadowRoot.querySelector('.shell__body');
    const barHeight = bar.getBoundingClientRect().height;

    expect(barHeight).to.be.greaterThan(0);
    // The 128px gap, as arithmetic: the bar's own 64px in normal flow, plus the
    // 64px of padding-top the shell reserves for a bar it expects to be out of
    // it. Fixed, the wrapper contributes nothing and only the padding remains.
    expect(wrapper.getBoundingClientRect().height, 'the bar is still in flow').to.equal(0);
    expect(parseFloat(getComputedStyle(body).paddingTop)).to.equal(barHeight);
  });

  it('does not overwrite a bar the consumer placed out of flow themselves', async () => {
    const shell = mount(SHELL.replace('slot="topbar"', 'slot="topbar" fixed'));
    await shell.updateComplete;
    const bar = shell.querySelector('arc-top-bar');
    await bar.updateComplete;
    expect(bar.fixed).to.equal(true);
  });

  it('applies to a bar slotted in later', async () => {
    const { shell } = await mountShell();
    shell.querySelector('arc-top-bar').remove();
    const late = document.createElement('arc-top-bar');
    late.setAttribute('slot', 'topbar');
    shell.appendChild(late);
    await tick();
    await late.updateComplete;
    expect(late.fixed).to.equal(true);
  });
});

describe('arc-sidebar inside arc-app-shell', () => {
  afterEach(() => cleanup());

  /**
   * The shell's ::slotted(arc-sidebar) block forces height:auto — correctly,
   * since .shell__sidebar owns sticky and height — which left the sidebar host
   * at content height. The visible symptom was the rail's divider, a
   * .sidebar::after pinned top:0;bottom:0, stopping at the last link and
   * leaving the sidebar looking half-drawn down a tall page.
   */
  it('fills the height of the shell rail', async () => {
    const { shell, sidebar } = await mountShell();
    const rail = shell.shadowRoot.querySelector('.shell__sidebar');
    const railHeight = rail.getBoundingClientRect().height;
    expect(railHeight).to.be.greaterThan(0);
    expect(sidebar.getBoundingClientRect().height).to.be.at.least(railHeight - 1);
  });

  /**
   * Finding #92. `width` was declared, defaulted to '280px' in the constructor,
   * and read by nothing — the 280px a consumer saw came from .shell__sidebar,
   * so the prop looked like it worked until someone passed a different value.
   * Inside the shell the rail still wins, which is why the token is the handle
   * that moves both.
   */
  it('takes its width from --sidebar-width, wrapper and rail together', async () => {
    const shell = mount(SHELL.replace('breakpoint="320"', 'breakpoint="320" style="--sidebar-width:360px"'));
    await shell.updateComplete;
    const sidebar = shell.querySelector('arc-sidebar');
    await sidebar.updateComplete;
    const rail = shell.shadowRoot.querySelector('.shell__sidebar');

    expect(rail.getBoundingClientRect().width).to.equal(360);
    expect(sidebar.getBoundingClientRect().width).to.equal(360);
  });

  /**
   * The rail stretches what it is given, whatever that is.
   *
   * The shell documents `arc-sidebar` for this slot and a consumer's first
   * attempt is usually a plain `<nav>` — which is also what the docs preview
   * slots. Fixed for `arc-sidebar` alone, the rail left every other rail at
   * content height: a `<nav>` with a `border-right` drew its edge two links
   * down and stopped, in a box 500px taller.
   */
  it('stretches a plain element slotted into the rail', async () => {
    const shell = mount(`
      <arc-app-shell breakpoint="320">
        <arc-top-bar slot="topbar" heading="Dashboard"></arc-top-bar>
        <nav slot="sidebar" style="border-right:1px solid red">
          <a href="/one">Overview</a>
        </nav>
        <div style="height:1200px">Tall content</div>
      </arc-app-shell>`);
    await shell.updateComplete;
    await tick();
    const rail = shell.shadowRoot.querySelector('.shell__sidebar');
    const nav = shell.querySelector('nav');

    expect(rail.getBoundingClientRect().height).to.be.greaterThan(100);
    expect(nav.getBoundingClientRect().height).to.be.at.least(
      rail.getBoundingClientRect().height - 1,
    );
  });

  it('draws its divider the full height of the rail', async () => {
    const { shell, sidebar } = await mountShell();
    const rail = shell.shadowRoot.querySelector('.shell__sidebar');
    const nav = sidebar.shadowRoot.querySelector('.sidebar');
    expect(nav.getBoundingClientRect().height).to.be.at.least(
      rail.getBoundingClientRect().height - 1,
    );
  });
});

describe('arc-sidebar on its own', () => {
  afterEach(() => cleanup());

  it('fills its container when no width is given', async () => {
    const box = mount('<div style="width:300px"><arc-sidebar></arc-sidebar></div>');
    const sidebar = box.querySelector('arc-sidebar');
    await sidebar.updateComplete;
    expect(sidebar.getBoundingClientRect().width).to.equal(300);
  });

  it('honours the width it was given', async () => {
    const box = mount('<div style="width:300px"><arc-sidebar width="220px"></arc-sidebar></div>');
    const sidebar = box.querySelector('arc-sidebar');
    await sidebar.updateComplete;
    expect(sidebar.getBoundingClientRect().width).to.equal(220);
  });

  it('follows a width set after mount', async () => {
    const box = mount('<div style="width:300px"><arc-sidebar></arc-sidebar></div>');
    const sidebar = box.querySelector('arc-sidebar');
    await sidebar.updateComplete;
    sidebar.width = '18rem';
    await sidebar.updateComplete;
    expect(sidebar.getBoundingClientRect().width).to.equal(288);
  });
});

/**
 * Not a composition, but the same frame: what a component reserves for content
 * that never arrives. Finding, from the same report, on arc-page-header.
 */
describe('arc-page-header reserves space only for slots that have content', () => {
  afterEach(() => cleanup());

  async function header(markup) {
    const el = mount(markup);
    await el.updateComplete;
    await tick();
    await el.updateComplete;
    return el;
  }

  it('adds nothing below a heading-and-description header', async () => {
    const el = await header(
      '<arc-page-header heading="Projects" description="Everything you own"></arc-page-header>',
    );
    const row = el.shadowRoot.querySelector('.page-header__title-row');
    const description = el.shadowRoot.querySelector('.page-header__description');
    const headerBottom = el.getBoundingClientRect().bottom;
    const lastInk = Math.max(
      row.getBoundingClientRect().bottom,
      description.getBoundingClientRect().bottom,
    );
    // What remains below the last line of text is .page-header's own
    // padding-bottom, and nothing else — no room held for three empty slots.
    const padding = parseFloat(
      getComputedStyle(el.shadowRoot.querySelector('.page-header')).paddingBottom,
    );
    expect(headerBottom - lastInk).to.be.closeTo(padding, 1);
  });

  it('still reserves the space once a slot is filled', async () => {
    const el = await header(
      `<arc-page-header heading="Projects">
         <div style="height:20px">Tabs</div>
       </arc-page-header>`,
    );
    const content = el.shadowRoot.querySelector('.page-header__content');
    expect(parseFloat(getComputedStyle(content).marginTop)).to.be.greaterThan(0);
  });

  it('picks the space back up when content arrives later', async () => {
    const el = await header('<arc-page-header heading="Projects"></arc-page-header>');
    const content = el.shadowRoot.querySelector('.page-header__content');
    expect(parseFloat(getComputedStyle(content).marginTop)).to.equal(0);

    el.append(document.createElement('div'));
    await tick();
    await el.updateComplete;
    expect(parseFloat(getComputedStyle(content).marginTop)).to.be.greaterThan(0);
  });

  it('does not count the whitespace between tags as content', async () => {
    const el = await header(`<arc-page-header heading="Projects">
       </arc-page-header>`);
    const content = el.shadowRoot.querySelector('.page-header__content');
    expect(parseFloat(getComputedStyle(content).marginTop)).to.equal(0);
  });
});

/**
 * The obvious call, landing where a caller expects. From the same report:
 * arc-inline-edit sets no delegatesFocus and everything focusable is in its
 * shadow root, so `el.focus()` did nothing and said nothing.
 */
describe('arc-inline-edit answers focus()', () => {
  afterEach(() => cleanup());

  it('focuses the display row when not editing', async () => {
    const el = mount('<arc-inline-edit label="Name" value="Dawn"></arc-inline-edit>');
    await el.updateComplete;
    el.focus();
    expect(deepActive()).to.equal(el.shadowRoot.querySelector('.inline-edit__display'));
  });

  it('focuses the field while editing', async () => {
    const el = mount('<arc-inline-edit label="Name" value="Dawn"></arc-inline-edit>');
    await el.updateComplete;
    el.edit();
    await el.updateComplete;
    el.focus();
    expect(deepActive()).to.equal(el.shadowRoot.querySelector('.inline-edit__field'));
  });
});

/**
 * The declarative route to an imperative API, completed.
 *
 * arc-toast's document listener existed for `show()` alone, which left a
 * consumer whose wrapper exposes no element handle able to raise a toast and
 * unable to do anything else with it — `show()` returns the id that
 * `dismiss()`, `updateToast()` and `complete()` take, and the return value of a
 * method you did not call goes nowhere. Reported against the Svelte wrapper,
 * where the element sits in a private `__el`; the wrapper half is Prism's, this
 * half is not.
 */
describe('arc-toast is drivable without a reference to it', () => {
  afterEach(() => cleanup());

  const fire = (name, detail) =>
    document.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));

  async function host() {
    const el = mount('<arc-toast></arc-toast>');
    await el.updateComplete;
    return el;
  }

  it('raises a toast under an id the caller chose', async () => {
    const el = await host();
    fire('arc-toast', { id: 'save', message: 'Saving' });
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.contain('Saving');
  });

  it('dismisses the toast it named', async () => {
    const el = await host();
    const closed = new Promise((resolve) =>
      el.addEventListener('arc-close', (e) => resolve(e.detail.id), { once: true }),
    );
    fire('arc-toast', { id: 'save', message: 'Saving' });
    await el.updateComplete;
    fire('arc-toast-dismiss', { id: 'save' });
    // The row animates out before it leaves the DOM, so the close event is the
    // signal rather than the markup.
    expect(await closed).to.equal('save');
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.not.contain('Saving');
  });

  it('completes a progress toast, and says so', async () => {
    const el = await host();
    const completed = [];
    el.addEventListener('arc-complete', (e) => completed.push(e.detail.id));
    fire('arc-toast', { id: 'upload', message: 'Uploading', progress: 0 });
    await el.updateComplete;
    fire('arc-toast-update', { id: 'upload', progress: 80 });
    await el.updateComplete;
    fire('arc-toast-complete', { id: 'upload' });
    await el.updateComplete;
    expect(completed).to.deep.equal(['upload']);
  });

  it('clears everything', async () => {
    const el = await host();
    fire('arc-toast', { message: 'One' });
    fire('arc-toast', { message: 'Two' });
    await el.updateComplete;
    const emptied = new Promise((resolve) =>
      el.addEventListener('arc-queue-change', (e) => {
        if (e.detail.visible === 0 && e.detail.queued === 0) resolve();
      }),
    );
    fire('arc-toast-clear');
    await emptied;
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.not.contain('One');
    expect(el.shadowRoot.textContent).to.not.contain('Two');
  });
});

/**
 * Every route out of the open drawer announces itself.
 *
 * The shell closes its own drawer four ways — the hamburger, the backdrop,
 * Escape, and the viewport widening past the breakpoint — and the fourth used
 * to be a plain assignment. Invisible while the wrappers held `sidebarOpen`
 * one-way; the moment they bind it (prism 3.1), a silent close is exactly the
 * drift the binding exists to prevent.
 */
describe('arc-app-shell announces every close it performs', () => {
  afterEach(() => cleanup());

  it('fires arc-sidebar-toggle when the viewport widens past the breakpoint', async () => {
    // Breakpoint above the runner's window, so the shell starts in mobile mode.
    const shell = mount(`<arc-app-shell breakpoint="${window.innerWidth + 100}">
        <div>content</div>
      </arc-app-shell>`);
    await shell.updateComplete;
    shell.sidebarOpen = true;
    await shell.updateComplete;

    const seen = [];
    shell.addEventListener('arc-sidebar-toggle', (e) => seen.push(e.detail.value));

    // Widening: the drawer is gone, and the state that says it is open goes too.
    shell.breakpoint = 1;
    shell.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
    await shell.updateComplete;

    expect(shell.sidebarOpen, 'the shell closed itself').to.equal(false);
    expect(seen, 'and said so').to.deep.equal([false]);
  });
});

/**
 * The two modes, and the difference between them stated as measurements.
 *
 * The default is a page layout: viewport-tall, the page scrolls, the rail is
 * sticky and the top bar is fixed. `embedded` is the same layout sized by its
 * container: it fills the box it is given, its content area scrolls instead of
 * the page, the rail is stretched by the body rather than sized from the
 * screen, and the bar is in flow — a fixed bar would leave the container and
 * pin itself to the top of the screen, which is a bar floating over the page
 * from a component in a card.
 *
 * This started as a `--shell-height` token and was reverted: the rail's own
 * viewport height forced the shell past any smaller box whatever the host
 * declared, so the token was honoured everywhere except the case it existed
 * for. The difference is behavioural — what scrolls, what sticky means, whether
 * the bar is in flow — so it is a declared prop rather than a length that has
 * to guess.
 */
describe('arc-app-shell as a page layout', () => {
  afterEach(() => cleanup());

  it('is the height of the viewport', async () => {
    const shell = mount('<arc-app-shell><div>content</div></arc-app-shell>');
    await shell.updateComplete;
    expect(shell.getBoundingClientRect().height).to.equal(window.innerHeight);
  });

  it('keeps the sticky rail and the fixed bar', async () => {
    const { shell, bar } = await mountShell();
    const rail = shell.shadowRoot.querySelector('.shell__sidebar');
    expect(getComputedStyle(bar).position).to.equal('fixed');
    expect(getComputedStyle(rail).position).to.equal('sticky');
  });
});

describe('arc-app-shell embedded', () => {
  afterEach(() => cleanup());

  const BOX = 400;

  async function embed(extra = '') {
    const box = mount(`<div style="width:600px;height:${BOX}px;position:relative">
        <arc-app-shell embedded breakpoint="320" style="height:100%" ${extra}>
          <arc-top-bar slot="topbar" heading="Dashboard"></arc-top-bar>
          <nav slot="sidebar" style="width:200px;border-right:1px solid red">
            <a href="/one">Overview</a>
          </nav>
          <div style="height:1500px">Tall content</div>
        </arc-app-shell>
      </div>`);
    const shell = box.querySelector('arc-app-shell');
    await shell.updateComplete;
    await tick();
    await shell.updateComplete;
    return { box, shell, part: (c) => shell.shadowRoot.querySelector(c) };
  }

  it('fills the container instead of the viewport', async () => {
    const { shell } = await embed();
    expect(shell.getBoundingClientRect().height).to.equal(BOX);
  });

  it('puts the top bar in flow and reserves nothing for it', async () => {
    const { shell, part } = await embed();
    const bar = shell.querySelector('arc-top-bar');
    expect(bar.hasAttribute('fixed'), 'a fixed bar would pin itself to the screen').to.equal(false);
    expect(getComputedStyle(bar).position).to.equal('static');
    expect(parseFloat(getComputedStyle(part('.shell__body')).paddingTop)).to.equal(0);
    expect(Math.round(part('.shell__body').getBoundingClientRect().height)).to.equal(
      BOX - Math.round(bar.getBoundingClientRect().height),
    );
  });

  it('stretches the rail to the body, statically', async () => {
    const { shell, part } = await embed();
    const body = part('.shell__body').getBoundingClientRect().height;
    expect(getComputedStyle(part('.shell__sidebar')).position).to.equal('static');
    expect(part('.shell__sidebar').getBoundingClientRect().height).to.be.closeTo(body, 1);
    expect(shell.querySelector('nav').getBoundingClientRect().height).to.be.closeTo(body, 1);
  });

  it('scrolls its own content and leaves the page alone', async () => {
    const { part } = await embed();
    const content = part('.shell__content');
    expect(content.scrollHeight, 'the content area is the scroll context').to.be.greaterThan(
      content.clientHeight,
    );
    const doc = document.scrollingElement;
    expect(doc.scrollHeight - doc.clientHeight, 'nothing escapes to the page').to.equal(0);
  });

  it('takes the bar back out of flow if the mode is turned off', async () => {
    const { shell } = await embed();
    const bar = shell.querySelector('arc-top-bar');
    expect(bar.hasAttribute('fixed')).to.equal(false);

    shell.embedded = false;
    await shell.updateComplete;
    expect(bar.hasAttribute('fixed'), 'the page layout needs it fixed again').to.equal(true);
  });
});
