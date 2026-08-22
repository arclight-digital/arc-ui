/**
 * Finding #95 — a closed panel that is still in flow.
 *
 * Every overlay here hides its resting panel with `opacity` and `visibility`
 * so the open transition has two rendered states to run between. Neither of
 * those properties takes the box out of layout, so an absolutely-positioned
 * panel anchored to the *start* edge of a trigger that sits at the *end* edge
 * of a full-width row hangs its `min-width` past the document and the page
 * gains a permanent horizontal scrollbar. Nothing is visibly off-screen, which
 * is the whole difficulty: the symptom is a scrollbar and the cause is a
 * component two levels down that is closed.
 *
 * Reported against 4.0.1 from an application's projects listing — a table's
 * row-action menu, which is the canonical placement for the shape. Measured
 * there at a 1680px viewport: `scrollWidth` 1800 against a `clientWidth` of
 * 1680.
 *
 * The library already had the answer one component over. `arc-menubar` renders
 * its panel only while open, and `shared/position-styles.js` has carried
 * `allow-discrete` + `@starting-style` since the panels moved to the top layer
 * — for exactly this reason, on the managed half of the same stylesheet. What
 * was missing is the resting half.
 *
 * Two frames made this invisible to the rest of the suite, and both are worth
 * keeping in mind when adding to this file: every other overlay test mounts its
 * subject *open*, and every other measurement in the suite is of an element
 * against its own container. This panel is correct relative to its trigger and
 * wrong relative to the page.
 */
import { expect } from '@esm-bundle/chai';
import '../src/feedback/dropdown-menu.register.js';
import '../src/feedback/popover.register.js';
import '../src/feedback/hover-card.register.js';
import '../src/navigation/navigation-menu.register.js';
import '../src/navigation/nav-item.register.js';
import '../src/navigation/menubar.register.js';
import '../src/shared/menu-item.register.js';
import { mount, cleanup, tick } from './helpers.js';

/**
 * The trigger at the inline-end edge of a full-width row — the placement a
 * table's row actions produce, and the one the panel's `inset-inline-start: 0`
 * turns into overflow.
 */
function inRow(markup) {
  return `<div style="width:100%;display:flex;justify-content:flex-end">${markup}</div>`;
}

/** How far the document scrolls past its own viewport. Zero on a sound page. */
function pageOverflow() {
  const doc = document.scrollingElement;
  return doc.scrollWidth - doc.clientWidth;
}

const CASES = [
  {
    tag: 'arc-dropdown-menu',
    markup: `<arc-dropdown-menu>
       <button slot="trigger">Actions</button>
       <arc-menu-item>Rename project</arc-menu-item>
       <arc-menu-item>Duplicate</arc-menu-item>
     </arc-dropdown-menu>`,
  },
  {
    tag: 'arc-popover',
    markup: `<arc-popover>
       <button slot="trigger">Details</button>
       <p>Panel body</p>
     </arc-popover>`,
  },
  {
    tag: 'arc-hover-card',
    markup: `<arc-hover-card>
       <button>Profile</button>
       <div slot="content">Card body</div>
     </arc-hover-card>`,
  },
  {
    tag: 'arc-navigation-menu',
    markup: `<arc-navigation-menu>
       <arc-nav-item label="Products">
         <a href="/one">One</a>
         <a href="/two">Two</a>
       </arc-nav-item>
     </arc-navigation-menu>`,
  },
];

describe('a closed overlay adds no page overflow', () => {
  afterEach(() => cleanup());

  it('starts from a page that does not scroll horizontally', () => {
    expect(pageOverflow()).to.equal(0);
  });

  for (const { tag, markup } of CASES) {
    it(`${tag}, closed at the inline-end edge`, async () => {
      const row = mount(inRow(markup));
      const el = row.querySelector(tag);
      await el.updateComplete;
      // Items arrive by slotchange, which schedules a further update — and it
      // is the item widths that size the panel.
      await tick();
      await el.updateComplete;

      expect(el.open, `${tag} should still be closed`).to.not.equal(true);
      expect(pageOverflow(), `${tag} closed panel overflows the document`).to.equal(0);
    });
  }

  /**
   * The control, and the reason this is a fix rather than a redesign:
   * arc-menubar renders the panel only while open, so it has never had a closed
   * box to overflow. The four above now reach the same resting state by a
   * different route.
   */
  it('arc-menubar, the component that already did this correctly', async () => {
    const row = mount(inRow('<arc-menubar></arc-menubar>'));
    const bar = row.querySelector('arc-menubar');
    bar.items = [{ label: 'File', items: [{ label: 'Open recent project\u2026' }] }];
    await bar.updateComplete;

    expect(bar.shadowRoot.querySelector('.menu')).to.not.exist;
    expect(pageOverflow()).to.equal(0);
  });
});
