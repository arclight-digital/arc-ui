import { expect } from '@esm-bundle/chai';
import '../src/feedback/modal.register.js';
import '../src/feedback/command-palette.register.js';
import '../src/feedback/popover.register.js';
import '../src/feedback/dropdown-menu.register.js';
import '../src/feedback/spotlight.register.js';
import '../src/feedback/notification-panel.register.js';
import '../src/input/date-picker.register.js';
import { mount, cleanup, tick, pressKey, deepActive } from './helpers.js';

/** A pointerdown where ClickOutsideController listens for it. */
function clickAt(target) {
  target.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true, composed: true, cancelable: true,
  }));
}

describe('OverlayMixin adoption: arc-modal', () => {
  afterEach(cleanup);

  async function openModal() {
    const el = mount('<arc-modal heading="Test"><button>Inside</button></arc-modal>');
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await tick();
    return el;
  }

  it('locks page scroll while open and releases it on close', async () => {
    const el = await openModal();
    expect(document.body.style.overflow, 'locked').to.equal('hidden');
    el.open = false;
    await el.updateComplete;
    expect(document.body.style.overflow, 'released').to.not.equal('hidden');
  });

  it('closes on Escape', async () => {
    const el = await openModal();
    pressKey('Escape');
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('does not close on Escape when closable is false', async () => {
    // Consolidating dismissal into _close() has to preserve this: an
    // undismissable modal must stay put on every path, not just the X button.
    const el = await openModal();
    el.closable = false;
    await el.updateComplete;

    pressKey('Escape');
    await el.updateComplete;
    expect(el.open).to.equal(true);
  });

  it('does not close on a backdrop click when closable is false', async () => {
    const el = await openModal();
    el.closable = false;
    await el.updateComplete;

    const backdrop = el.shadowRoot.querySelector('.modal__backdrop');
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).to.equal(true);
  });

  it('closes on a backdrop click when closable', async () => {
    const el = await openModal();
    const backdrop = el.shadowRoot.querySelector('.modal__backdrop');
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('restores focus to whatever was focused before it opened', async () => {
    const outside = document.createElement('button');
    outside.textContent = 'Opener';
    document.body.appendChild(outside);
    outside.focus();

    const el = await openModal();
    expect(deepActive(), 'focus moved inside').to.not.equal(outside);

    el.open = false;
    await el.updateComplete;
    expect(deepActive()).to.equal(outside);
  });

  it('still emits arc-open, which the mixin knows nothing about', async () => {
    const el = mount('<arc-modal heading="Test"><button>Inside</button></arc-modal>');
    await el.updateComplete;
    let fired = 0;
    el.addEventListener('arc-open', () => { fired++; });
    el.open = true;
    await el.updateComplete;
    expect(fired).to.equal(1);
  });
});

describe('OverlayMixin adoption: arc-command-palette', () => {
  afterEach(cleanup);

  async function openPalette() {
    const el = mount(`
      <arc-command-palette>
        <arc-command-item label="Alpha"></arc-command-item>
        <arc-command-item label="Bravo"></arc-command-item>
      </arc-command-palette>
    `);
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await tick();
    return el;
  }

  it('locks page scroll while open', async () => {
    const el = await openPalette();
    expect(document.body.style.overflow).to.equal('hidden');
    el.open = false;
    await el.updateComplete;
    expect(document.body.style.overflow).to.not.equal('hidden');
  });

  it('lands focus on the search input', async () => {
    // The explicit focus call is gone: the input is the dialog's first focusable
    // child, so the mixin's focusFirst reaches it.
    const el = await openPalette();
    expect(deepActive()).to.equal(el.shadowRoot.querySelector('.palette__input'));
  });

  it('closes once on Escape, not twice', async () => {
    // Escape now has two listeners — OverlayMixin's and MenuKeyboardController's
    // onClose — so _close() has to be idempotent or arc-close fires twice.
    const el = await openPalette();
    let closes = 0;
    el.addEventListener('arc-close', () => { closes++; });

    pressKey('Escape');
    await el.updateComplete;

    expect(el.open).to.equal(false);
    expect(closes).to.equal(1);
  });
});

describe('ClickOutsideController adoption', () => {
  afterEach(cleanup);

  const cases = [
    ['arc-popover', '<arc-popover><button slot="trigger">Open</button>Body</arc-popover>',
      (el) => { el.open = true; }, (el) => el.open],
    ['arc-dropdown-menu',
      '<arc-dropdown-menu label="Menu"><arc-menu-item label="One"></arc-menu-item></arc-dropdown-menu>',
      (el) => { el.open = true; }, (el) => el.open],
    ['arc-notification-panel', '<arc-notification-panel></arc-notification-panel>',
      (el) => { el.open = true; }, (el) => el.open],
    ['arc-date-picker', '<arc-date-picker label="When"></arc-date-picker>',
      (el) => { el.open = true; }, (el) => el.open],
  ];

  for (const [tag, markup, open, isOpen] of cases) {
    it(`${tag} closes on an outside pointerdown`, async () => {
      const el = mount(markup);
      await el.updateComplete;
      open(el);
      await el.updateComplete;
      await tick();
      expect(isOpen(el), 'opened').to.equal(true);

      clickAt(document.body);
      await el.updateComplete;
      expect(isOpen(el)).to.equal(false);
    });

    it(`${tag} stays open for a pointerdown inside itself`, async () => {
      const el = mount(markup);
      await el.updateComplete;
      open(el);
      await el.updateComplete;
      await tick();

      clickAt(el);
      await el.updateComplete;
      expect(isOpen(el)).to.equal(true);
    });

    it(`${tag} does not listen while closed`, async () => {
      // The hand-rolled versions attached on connect and filtered inside the
      // handler; the controller only subscribes while open.
      const el = mount(markup);
      await el.updateComplete;
      expect(el._clickOutside._active).to.equal(false);
    });
  }

  it('needs no requestAnimationFrame to survive its own opening click', async () => {
    // pointerdown rather than click is what removed the deferral: a
    // click-triggered open completes on pointerup, so the listener that gets
    // attached never sees the gesture that created it.
    const el = mount('<arc-popover><button slot="trigger">Open</button>Body</arc-popover>');
    await el.updateComplete;

    const trigger = el.shadowRoot.querySelector('.popover__trigger');
    trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(el.open, 'opened and stayed open').to.equal(true);
  });
});

describe('ClickOutsideController boundary: arc-spotlight', () => {
  afterEach(cleanup);

  async function mountSpotlight() {
    const target = document.createElement('button');
    target.id = 'spot-target';
    target.textContent = 'Target';
    document.body.appendChild(target);

    const el = mount('<arc-spotlight target="#spot-target"></arc-spotlight>');
    await el.updateComplete;
    el.active = true;
    await el.updateComplete;
    await tick();
    return { el, target };
  }

  it('stays active for a click on the element it highlights', async () => {
    // The boundary option exists for exactly this: "inside" is the target, not
    // the spotlight host, which draws nothing clickable of its own.
    const { el, target } = await mountSpotlight();
    clickAt(target);
    await el.updateComplete;
    expect(el.active).to.equal(true);
  });

  it('dismisses on a click anywhere else', async () => {
    const { el } = await mountSpotlight();
    clickAt(document.body);
    await el.updateComplete;
    expect(el.active).to.equal(false);
  });

  it('dismisses when its target has gone away', async () => {
    const { el, target } = await mountSpotlight();
    target.remove();
    clickAt(document.body);
    await el.updateComplete;
    expect(el.active).to.equal(false);
  });
});

describe('no component hand-rolls an outside-click listener', () => {
  it('has no document click listeners left in the source', async () => {
    // A regression guard on the whole point of this pass. Any new component that
    // reaches for document.addEventListener('click') to dismiss itself is
    // re-creating the eight listeners this replaced.
    // web-test-runner serves the source over HTTP, so this fetches the files
    // rather than reaching for a filesystem it doesn't have.
    const paths = [
      'feedback/popover.js', 'feedback/dropdown-menu.js', 'feedback/notification-panel.js',
      'feedback/spotlight.js', 'input/date-picker.js', 'input/time-picker.js',
      'input/search.js', 'navigation/breadcrumb-menu.js',
    ];

    for (const path of paths) {
      const res = await fetch(new URL(`../src/${path}`, import.meta.url));
      const src = await res.text();
      expect(src, path).to.not.match(/document\.addEventListener\(\s*['"](?:click|mousedown|pointerdown)['"]/);
    }
  });
});
