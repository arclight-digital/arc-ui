/**
 * arc-sortable-list — the reorderable list.
 *
 * What this pins: one row per slotted child, reordering by HTML5 drag-and-drop
 * and by the keyboard, arc-change reporting the new order as original indices
 * on detail.value, and `disabled` muting both input paths.
 *
 * Two tests are marked BUG. The component hides its slotted children and
 * renders a mirror of them — but the mirror is `item.node.textContent`, so all
 * markup inside an item is discarded; and the rows carry `aria-grabbed`, which
 * ARIA 1.1 deprecated. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

import '../src/input/sortable-list.register.js';

afterEach(() => cleanup());

const ITEMS = `
  <div>Alpha</div>
  <div>Bravo</div>
  <div>Charlie</div>
`;

async function list(attrs = '', items = ITEMS) {
  const el = mount(`<arc-sortable-list ${attrs}>${items}</arc-sortable-list>`);
  await settle(el);
  return el;
}

const rows = (el) => [...el.shadowRoot.querySelectorAll('[part="item"]')];
const labels = (el) => rows(el).map((r) => r.textContent.trim());

/** Drag row `from` onto row `to`, as the browser sequences it. */
async function dragRow(el, from, to) {
  const dt = new DataTransfer();
  rows(el)[from].dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
  await settle(el);
  rows(el)[to].dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
  await settle(el);
  rows(el)[to].dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
  await settle(el);
}

describe('arc-sortable-list rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await list();
    for (const part of ['list', 'item', 'handle', 'content']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('renders one row per slotted child', async () => {
    const el = await list();
    expect(labels(el)).to.deep.equal(['Alpha', 'Bravo', 'Charlie']);
  });

  it('is a listbox of options, described as sortable', async () => {
    const el = await list();
    const box = el.shadowRoot.querySelector('[part="list"]');
    expect(box.getAttribute('role')).to.equal('listbox');
    expect(box.getAttribute('aria-roledescription')).to.equal('sortable list');
    expect(rows(el).every((r) => r.getAttribute('role') === 'option')).to.equal(true);
  });

  it('hides the decorative grip from assistive tech', async () => {
    const el = await list();
    expect(el.shadowRoot.querySelector('[part="handle"]').getAttribute('aria-hidden'))
      .to.equal('true');
  });

  it('survives having no items', async () => {
    const el = await list('', '');
    expect(rows(el)).to.have.lengthOf(0);
  });

  // BUG: the row content is `${item.node?.textContent ?? ''}`
  // (sortable-list.js:350). The component hides the slotted children and
  // renders a mirror of them, but the mirror is text only — every element
  // inside an item is discarded. An item carrying an avatar, a badge, a link or
  // any nested arc-* component renders as a bare string.
  //
  // check-slot-hydration.js describes exactly this hide-and-mirror shape; what
  // it cannot see is that the mirror is lossy.
  it('BUG: markup inside an item is discarded, leaving only its text', async () => {
    const el = await list('', `
      <div><strong>Bold</strong> <em>and</em> more</div>
      <div>Plain</div>
    `);

    const content = el.shadowRoot.querySelector('[part="content"]');
    expect(content.textContent.replace(/\s+/g, ' ').trim()).to.equal('Bold and more');
    expect(content.querySelector('strong') === null, 'the markup did not survive').to.equal(true);
    expect(content.children.length, 'the row holds text, no elements at all').to.equal(0);

    // And the original markup is still in the light DOM, just hidden — so the
    // information is present and simply not rendered.
    expect(el.querySelector('strong'), 'the real item is intact underneath').to.not.equal(null);
  });
});

describe('arc-sortable-list drag reordering', () => {
  it('moves an item and reports the new order', async () => {
    const el = await list();
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    await dragRow(el, 0, 2);

    expect(labels(el)).to.deep.equal(['Bravo', 'Charlie', 'Alpha']);
    expect(details).to.have.lengthOf(1);
    expect(details[0].value, 'original indices in their new order').to.deep.equal([1, 2, 0]);
    expect(details[0].order).to.deep.equal([1, 2, 0]);
  });

  it('moves an item backwards too', async () => {
    const el = await list();
    await dragRow(el, 2, 0);
    expect(labels(el)).to.deep.equal(['Charlie', 'Alpha', 'Bravo']);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await list();
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    await dragRow(el, 0, 1);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('stays silent when an item is dropped on itself', async () => {
    const el = await list();
    const seen = record(el, ['arc-change']);

    await dragRow(el, 1, 1);

    expect(labels(el)).to.deep.equal(['Alpha', 'Bravo', 'Charlie']);
    expect(seen, 'no movement, no announcement').to.deep.equal([]);
  });

  it('claims dragover and drop so the browser does not handle them', async () => {
    const el = await list();
    const dt = new DataTransfer();
    rows(el)[0].dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
    await settle(el);

    for (const type of ['dragover', 'drop']) {
      const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt });
      rows(el)[1].dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, type).to.equal(true);
    }
  });
});

describe('arc-sortable-list keyboard reordering', () => {
  /** Space selects, Enter picks up — the component's two-stage entry. */
  async function pickUp(el, index) {
    keyOn(rows(el)[index], ' ');
    await settle(el);
    keyOn(rows(el)[index], 'Enter');
    await settle(el);
  }

  it('moves an item down with ArrowDown once picked up', async () => {
    const el = await list();
    await pickUp(el, 0);

    keyOn(rows(el)[0], 'ArrowDown');
    await settle(el);

    expect(labels(el)).to.deep.equal(['Bravo', 'Alpha', 'Charlie']);
  });

  it('moves an item up with ArrowUp', async () => {
    const el = await list();
    await pickUp(el, 2);

    keyOn(rows(el)[2], 'ArrowUp');
    await settle(el);

    expect(labels(el)).to.deep.equal(['Alpha', 'Charlie', 'Bravo']);
  });

  it('announces the order only on confirmation, not on each step', async () => {
    const el = await list();
    const seen = record(el, ['arc-change']);
    await pickUp(el, 0);

    keyOn(rows(el)[0], 'ArrowDown');
    await settle(el);
    expect(seen, 'moving is not committing').to.deep.equal([]);

    keyOn(rows(el)[1], 'Enter');
    await settle(el);
    expect(seen).to.have.lengthOf(1);
    expect(seen[0][1]).to.deep.equal([1, 0, 2]);
  });

  it('does not move anything before the item is picked up', async () => {
    const el = await list();

    keyOn(rows(el)[0], 'ArrowDown');
    await settle(el);

    expect(labels(el), 'arrows are inert until pick-up').to.deep.equal(['Alpha', 'Bravo', 'Charlie']);
  });

  it('Escape abandons the move without announcing', async () => {
    const el = await list();
    const seen = record(el, ['arc-change']);
    await pickUp(el, 0);

    keyOn(rows(el)[0], 'Escape');
    await settle(el);
    keyOn(rows(el)[0], 'ArrowDown');
    await settle(el);

    expect(labels(el)).to.deep.equal(['Alpha', 'Bravo', 'Charlie']);
    expect(seen).to.deep.equal([]);
  });

  it('stops at both ends rather than wrapping', async () => {
    const el = await list();
    await pickUp(el, 0);

    keyOn(rows(el)[0], 'ArrowUp');
    await settle(el);
    expect(labels(el), 'held at the top').to.deep.equal(['Alpha', 'Bravo', 'Charlie']);
  });

  it('claims the keys it handles', async () => {
    const el = await list();
    for (const key of [' ', 'Escape', 'ArrowUp', 'ArrowDown']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      rows(el)[0].dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
    }
  });
});

describe('arc-sortable-list disabled', () => {
  it('mutes the drag path', async () => {
    const el = await list('disabled');
    const seen = record(el, ['arc-change']);

    await dragRow(el, 0, 2);

    expect(labels(el)).to.deep.equal(['Alpha', 'Bravo', 'Charlie']);
    expect(seen).to.deep.equal([]);
  });

  it('mutes the keyboard path', async () => {
    const el = await list('disabled');
    const seen = record(el, ['arc-change']);

    keyOn(rows(el)[0], ' ');
    keyOn(rows(el)[0], 'Enter');
    keyOn(rows(el)[0], 'ArrowDown');
    await settle(el);

    expect(labels(el)).to.deep.equal(['Alpha', 'Bravo', 'Charlie']);
    expect(seen).to.deep.equal([]);
  });

  it('takes the list out of the pointer path', async () => {
    const el = await list('disabled');
    expect(getComputedStyle(el).pointerEvents).to.equal('none');
  });
});

describe('arc-sortable-list ARIA state', () => {
  // BUG: aria-grabbed (sortable-list.js:337) was deprecated in ARIA 1.1 and is
  // not implemented by current assistive technology — the drag-and-drop module
  // it belonged to was withdrawn. It is rendered on every row, always, as
  // "true" or "false".
  //
  // The accessible replacement is what this component already does elsewhere:
  // announce the state in the row's text or a live region. Nothing else in the
  // library uses aria-grabbed.
  it('BUG: rows carry the deprecated aria-grabbed attribute', async () => {
    const el = await list();
    expect(rows(el).map((r) => r.getAttribute('aria-grabbed')))
      .to.deep.equal(['false', 'false', 'false']);
  });

  it('flips aria-grabbed on the picked-up row', async () => {
    const el = await list();
    keyOn(rows(el)[1], ' ');
    await settle(el);
    keyOn(rows(el)[1], 'Enter');
    await settle(el);

    expect(rows(el)[1].getAttribute('aria-grabbed')).to.equal('true');
  });
});
