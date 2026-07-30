import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/navigation/menubar.register.js';
import '../src/feedback/dropdown-menu.register.js';
import '../src/shared/menu-item.register.js';

/**
 * Menu item labels are `flex: 1` with `text-overflow: ellipsis`, so anything
 * wider than the panel is truncated — and the panel was capped at a hard-coded
 * 320px, which is not enough for an ordinary label plus a shortcut. "Ask for a
 * change  ⌘K" ellipsed with the shortcut gutter still visible beside it.
 *
 * The panels now size to their widest item (`width: max-content`) under a larger,
 * viewport-relative, overridable cap. `width: max-content` also decouples the
 * panel from shrink-to-fit sizing, where an absolutely positioned box is sized
 * min(max(min-content, available), max-content) against its containing block —
 * making the width a function of what the menu is nested in rather than of what
 * it contains.
 */

afterEach(cleanup);

const LONG = 'Ask for a change to the current selection';

/** Mount a menubar in a container of the given width, with one menu, and open it. */
async function openMenubar(containerWidth, items, extraStyle = '') {
  const wrap = mount(
    `<div style="width:${containerWidth};position:relative;${extraStyle}">
       <arc-menubar></arc-menubar>
     </div>`,
  );
  const bar = wrap.querySelector('arc-menubar');
  bar.items = items;
  await bar.updateComplete;

  const trigger = bar.shadowRoot.querySelector('.trigger');
  expect(trigger, 'expected a menubar trigger').to.exist;
  trigger.click();
  await bar.updateComplete;
  await tick();

  const panel = bar.shadowRoot.querySelector('.menu');
  expect(panel, 'expected an open .menu panel').to.exist;
  // Guard: an empty panel would sit at min-width and pass the width assertions
  // for the wrong reason.
  expect(
    bar.shadowRoot.querySelectorAll('.item__label').length,
    'expected rendered item labels',
  ).to.be.greaterThan(0);
  return { bar, panel };
}

const ONE_LONG = [{ label: 'File', items: [{ label: LONG, shortcut: '⌘K' }, { label: 'Short', shortcut: '⌘S' }] }];

describe('menu panels size to their content, not to their container', () => {
  it('fits an ordinary label-plus-shortcut row without truncating', async () => {
    const { panel } = await openMenubar('200px', ONE_LONG);
    const width = panel.getBoundingClientRect().width;
    // The old hard-coded ceiling. Passing this is necessary but not sufficient —
    // the clipping assertion below is the one that pins the actual symptom.
    expect(width, `panel was ${width}px`).to.be.greaterThan(320);
  });

  it('does not ellipsis a label its own panel has room for', async () => {
    const { bar } = await openMenubar('200px', ONE_LONG);
    const label = bar.shadowRoot.querySelector('.item__label');
    // scrollWidth > clientWidth is the definition of "this text is clipped".
    expect(
      label.scrollWidth,
      `label clipped: scrollWidth ${label.scrollWidth} vs clientWidth ${label.clientWidth}`,
    ).to.be.at.most(label.clientWidth + 1);
  });

  it('reaches the same width however narrow the container is', async () => {
    const narrow = (await openMenubar('120px', ONE_LONG)).panel.getBoundingClientRect().width;
    cleanup();
    const wide = (await openMenubar('900px', ONE_LONG)).panel.getBoundingClientRect().width;
    expect(Math.abs(narrow - wide), `narrow ${narrow}px vs wide ${wide}px`).to.be.at.most(1);
  });

  it('still honours the min-width floor for a short menu', async () => {
    const { panel } = await openMenubar('900px', [{ label: 'F', items: [{ label: 'Ok' }] }]);
    expect(panel.getBoundingClientRect().width).to.equal(200);
  });

  it('is still bounded — a runaway label does not produce an unbounded panel', async () => {
    const { panel } = await openMenubar('900px', [{ label: 'F', items: [{ label: 'x'.repeat(400) }] }]);
    const width = panel.getBoundingClientRect().width;
    expect(width, `panel grew to ${width}px`).to.be.at.most(420);
  });

  it('the cap is overridable with --menu-max-width', async () => {
    const { panel } = await openMenubar(
      '900px',
      [{ label: 'F', items: [{ label: 'y'.repeat(200) }] }],
      '--menu-max-width:260px',
    );
    expect(panel.getBoundingClientRect().width).to.equal(260);
  });
});

describe('arc-dropdown-menu has the same shape and the same fix', () => {
  it('is not squeezed by a narrow positioned ancestor', async () => {
    const wrap = mount(
      `<div style="width:180px;position:relative">
         <arc-dropdown-menu open>
           <button slot="trigger">Open</button>
           <arc-menu-item shortcut="⌘K">${LONG}</arc-menu-item>
         </arc-dropdown-menu>
       </div>`,
    );
    const menu = wrap.querySelector('arc-dropdown-menu');
    // Items arrive via slotchange, which schedules a further update.
    await menu.updateComplete;
    await tick();
    await menu.updateComplete;

    expect(
      menu.shadowRoot.querySelectorAll('.dropdown__item').length,
      'expected the slotted arc-menu-item to be picked up',
    ).to.be.greaterThan(0);

    const panel = menu.shadowRoot.querySelector('.dropdown__panel');
    const width = panel.getBoundingClientRect().width;
    expect(width, `panel was ${width}px inside a 180px container`).to.be.greaterThan(200);
  });
});
