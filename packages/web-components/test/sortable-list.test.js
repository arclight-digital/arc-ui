/**
 * arc-sortable-list — the reorderable list.
 *
 * What this pins: one row per slotted child, reordering by HTML5 drag-and-drop
 * and by the keyboard, arc-change reporting the new order as original indices
 * on detail.value, and `disabled` muting both input paths.
 *
 * No BUG pins remain. The component hid its slotted children and rendered a
 * mirror of them, and the mirror was `item.node.textContent` — so every element
 * inside an item was discarded (#41); and the rows carried `aria-grabbed`,
 * deprecated in ARIA 1.1 and implemented by nothing (#42). Rows project their
 * child through a per-index named slot now, so read a row's content off the
 * assigned nodes rather than off the shadow node — `labels()` below does, and a
 * `<slot>` element's own textContent is always '', which is how an assertion
 * against it passes for the wrong reason. See test-findings.md.
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

const rows = (el) => [...el.shadowRoot.querySelectorAll('[part~="item"]')];

/**
 * What each row actually shows, read through its slot.
 *
 * The row's own textContent is '' — its content is a `<slot>`, and a slot
 * element never has text of its own. Reading it directly is the trap that makes
 * a rendering assertion unfalsifiable.
 */
const projected = (row) =>
  [...row.querySelectorAll('slot')].flatMap((slot) => slot.assignedNodes({ flatten: true }));
const labels = (el) =>
  rows(el).map((r) => projected(r).map((n) => n.textContent).join('').trim());

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
      expect(el.shadowRoot.querySelector(`[part~="${part}"]`), part).to.not.equal(null);
    }
  });

  it('renders one row per slotted child', async () => {
    const el = await list();
    expect(labels(el)).to.deep.equal(['Alpha', 'Bravo', 'Charlie']);
  });

  it('is a listbox of options, described as sortable', async () => {
    const el = await list();
    const box = el.shadowRoot.querySelector('[part~="list"]');
    expect(box.getAttribute('role')).to.equal('listbox');
    expect(box.getAttribute('aria-roledescription')).to.equal('sortable list');
    expect(rows(el).every((r) => r.getAttribute('role') === 'option')).to.equal(true);
  });

  it('hides the decorative grip from assistive tech', async () => {
    const el = await list();
    expect(el.shadowRoot.querySelector('[part~="handle"]').getAttribute('aria-hidden'))
      .to.equal('true');
  });

  it('survives having no items', async () => {
    const el = await list('', '');
    expect(rows(el)).to.have.lengthOf(0);
  });

  // Was a BUG pin (finding #41). The row content was
  // `${item.node?.textContent ?? ''}` — a text-only mirror of the slotted
  // child, so an avatar, a badge, a link or any nested arc-* component rendered
  // as a bare string. Nothing was lost permanently, since the original stayed
  // in the light DOM behind the hidden slot host; it simply never reached the
  // screen. check-slot-hydration.js describes exactly this hide-and-mirror
  // shape, and what it cannot see is that a mirror is lossy.
  it('projects the item itself, markup and all', async () => {
    const el = await list('', `
      <div><strong>Bold</strong> <em>and</em> more</div>
      <div>Plain</div>
    `);

    const assigned = projected(rows(el)[0]);
    expect(assigned, 'the real element is what the row shows').to.have.lengthOf(1);
    expect(assigned[0].querySelector('strong'), 'the markup survives').to.not.equal(null);
    expect(assigned[0].textContent.replace(/\s+/g, ' ').trim()).to.equal('Bold and more');
  });

  it('projects a nested component, not its text', async () => {
    // The case that actually motivated the finding: a component inside an item
    // used to be flattened to whatever text it happened to contain.
    const el = await list('', '<div><arc-tag>Draft</arc-tag></div><div>Plain</div>');
    const assigned = projected(rows(el)[0]);
    expect(assigned[0].querySelector('arc-tag')).to.not.equal(null);
  });

  it('keeps each row pointed at its own child after a reorder', async () => {
    // The slots are named by *original* index and the rows are drawn in the
    // current order, so a reorder must move the pairing rather than the names.
    const el = await list();
    await dragRow(el, 0, 2);
    expect(labels(el)).to.deep.equal(['Bravo', 'Charlie', 'Alpha']);
    expect(rows(el).every((r) => projected(r).length === 1), 'one child per row').to.equal(true);
  });

  it('adopts a child added after mount', async () => {
    // The handler is additive rather than a rebuild — naming a child takes it
    // out of the default slot, so the next slotchange reports an empty
    // assignment and a rebuild would empty the list one frame after filling it.
    const el = await list();
    el.insertAdjacentHTML('beforeend', '<div>Delta</div>');
    await settle(el);

    expect(labels(el)).to.deep.equal(['Alpha', 'Bravo', 'Charlie', 'Delta']);
  });

  it('drops the row for a child that is removed', async () => {
    const el = await list();
    el.removeChild(el.children[1]);
    await settle(el);

    expect(labels(el)).to.deep.equal(['Alpha', 'Charlie']);
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
  // Was two BUG pins (finding #42). aria-grabbed was deprecated in ARIA 1.1
  // along with the whole drag-and-drop module it belonged to, is implemented by
  // no current assistive technology, and was rendered on every row always.
  // Nothing else in the library used it.
  //
  // It has no replacement attribute, and it needs none here: the component
  // already announces every step of a keyboard move in a live region, and the
  // rows already carry aria-roledescription="sortable item".
  it('carries no aria-grabbed', async () => {
    const el = await list();
    expect(rows(el).some((r) => r.hasAttribute('aria-grabbed'))).to.equal(false);
  });

  // What replaces aria-grabbed, and the reason removing it was not enough on
  // its own: the attribute was dead, but it was the only ARIA state the rows
  // carried, so the whole keyboard reorder protocol was announced by nothing.
  // arc-kanban implements the identical protocol and announces every step.
  const live = (el) => el.shadowRoot.querySelector('[aria-live]');

  it('announces each step of a keyboard move', async () => {
    const el = await list();
    expect(live(el), 'there is a live region').to.not.equal(null);

    keyOn(rows(el)[1], ' ');
    await settle(el);
    expect(live(el).textContent).to.contain('Bravo').and.to.contain('selected');

    keyOn(rows(el)[1], 'Enter');
    await settle(el);
    expect(live(el).textContent).to.contain('picked up');

    keyOn(rows(el)[1], 'ArrowDown');
    await settle(el);
    keyOn(rows(el)[2], 'Enter');
    await settle(el);
    expect(live(el).textContent).to.contain('dropped').and.to.contain('Position 3 of 3');

    expect(rows(el).some((r) => r.hasAttribute('aria-grabbed'))).to.equal(false);
  });

  it('says a cancelled move was cancelled, and nothing about where', async () => {
    // Escape abandons the move and restores the original order, so there is no
    // position to report — saying one would be a lie about what happened.
    const el = await list();
    keyOn(rows(el)[1], ' ');
    await settle(el);
    keyOn(rows(el)[1], 'Enter');
    await settle(el);
    keyOn(rows(el)[1], 'Escape');
    await settle(el);

    expect(live(el).textContent.trim()).to.equal('Move cancelled.');
  });

  it('stays quiet until something happens', async () => {
    const el = await list();
    expect(live(el).textContent.trim(), 'no announcement on mount').to.equal('');
  });
});
