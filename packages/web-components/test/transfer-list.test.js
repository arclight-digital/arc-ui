/**
 * arc-transfer-list — the dual-listbox.
 *
 * Derived from the `@prop` and `@fires` contract. Three claims in that prose
 * carry most of the weight and are where the tests concentrate:
 *
 *   - "kept in options order"          — `value` is not insertion-ordered
 *   - "Move-all respects the filter"   — and, by omission, move-checked does not
 *   - "Prevents moving items between panes while the lists stay focusable and
 *      filterable" — readonly is narrower than disabled
 *
 * Fixture note: the labels are chosen so that a filter can select a *middle*
 * item ("del" → Delta alone). Filtering to the first or last item would let an
 * off-by-one in the move/roving arithmetic pass, since those indices are the
 * clamp targets anyway.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until, keyOn, deepActive, record, only } from './helpers.js';

import '../src/input/transfer-list.register.js';

afterEach(() => cleanup());

// Charlie is disabled and sits in the *middle*: a disabled item at either end
// would be skipped by a plain slice as readily as by a real guard.
const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie', disabled: true },
  { value: 'd', label: 'Delta' },
  { value: 'e', label: 'Echo' },
];

async function list(attrs = '', props = {}) {
  const el = mount(`<arc-transfer-list ${attrs}></arc-transfer-list>`);
  el.options = OPTIONS.map((o) => ({ ...o }));
  Object.assign(el, props);
  await settle(el);
  return el;
}

const box = (el, pane) => el.shadowRoot.querySelector(`.tl__listbox[data-pane="${pane}"]`);
const opts = (el, pane) => [...box(el, pane).querySelectorAll('[role="option"]')];
const labels = (el, pane) => opts(el, pane).map((o) => o.textContent.trim());
const optFor = (el, pane, label) => opts(el, pane).find((o) => o.textContent.trim() === label);
const count = (el, pane) => el.shadowRoot.querySelectorAll('.tl__pane-count')[pane === 'source' ? 0 : 1];

// The four controls in DOM order. Named rather than indexed because "grouped by
// scope, not by direction" means the visual order is checked-pair then bulk-pair,
// which is easy to mis-read as right/left/right/left.
const CONTROLS = { checkedToTarget: 0, checkedToSource: 1, allToTarget: 2, allToSource: 3 };
const control = (el, which) => el.shadowRoot.querySelectorAll('arc-icon-button')[CONTROLS[which]];

const search = (el, pane) =>
  el.shadowRoot.querySelectorAll('.tl__search')[pane === 'source' ? 0 : 1];

async function filterTo(el, pane, query) {
  const input = search(el, pane);
  input.value = query;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await settle(el);
}

/** Click an option to mark it for moving (distinct from it being in `value`). */
async function check(el, pane, label) {
  optFor(el, pane, label).click();
  await settle(el);
}

describe('arc-transfer-list panes', () => {
  it('puts everything in Available when value is empty', async () => {
    const el = await list();
    expect(labels(el, 'source')).to.eql(['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo']);
    expect(labels(el, 'target')).to.eql([]);
  });

  it('splits the panes on value membership', async () => {
    const el = await list('', { value: ['b', 'd'] });
    expect(labels(el, 'source')).to.eql(['Alpha', 'Charlie', 'Echo']);
    expect(labels(el, 'target')).to.eql(['Bravo', 'Delta']);
  });

  it('renders the target pane in options order, not value order', async () => {
    // The `value` array is deliberately reversed relative to `options`.
    const el = await list('', { value: ['d', 'b'] });
    expect(labels(el, 'target'), 'pane followed value order').to.eql(['Bravo', 'Delta']);
  });

  it('uses the declared pane headings', async () => {
    const el = await list('source-label="Pool" target-label="Team"');
    const heads = [...el.shadowRoot.querySelectorAll('.tl__pane-label')].map((n) => n.textContent);
    expect(heads).to.eql(['Pool', 'Team']);
  });

  it('counts checked against the pane total', async () => {
    const el = await list();
    expect(count(el, 'source').textContent.trim()).to.equal('0 of 5');
    await check(el, 'source', 'Alpha');
    expect(count(el, 'source').textContent.trim()).to.equal('1 of 5');
  });
});

describe('arc-transfer-list empty panes', () => {
  it('drops role=listbox when a pane has no options', async () => {
    // Documented in _renderPane: role="listbox" around nothing but an
    // empty-state message fails aria-required-children.
    const el = await list();
    expect(box(el, 'source').getAttribute('role')).to.equal('listbox');
    expect(box(el, 'target').hasAttribute('role'), 'empty pane kept the role').to.equal(false);
  });

  it('drops the listbox-only attributes with it', async () => {
    const el = await list();
    const empty = box(el, 'target');
    expect(empty.hasAttribute('aria-multiselectable')).to.equal(false);
    expect(empty.hasAttribute('aria-readonly')).to.equal(false);
    expect(empty.getAttribute('aria-label'), 'the label is not listbox-only').to.equal('Selected');
  });

  it('takes the role back as soon as it has options', async () => {
    const el = await list();
    el.value = ['a'];
    await settle(el);
    expect(box(el, 'target').getAttribute('role')).to.equal('listbox');
  });

  it('says "No items" when the pane is genuinely empty', async () => {
    const el = await list();
    expect(el.shadowRoot.querySelector('.tl__empty').textContent.trim()).to.equal('No items');
  });

  it('says "No matches" when a filter emptied it', async () => {
    const el = await list('searchable');
    await filterTo(el, 'source', 'zzz');
    expect(box(el, 'source').querySelector('.tl__empty').textContent.trim()).to.equal('No matches');
  });
});

describe('arc-transfer-list checking', () => {
  it('marks an option without moving it', async () => {
    const el = await list();
    await check(el, 'source', 'Alpha');
    expect(optFor(el, 'source', 'Alpha').getAttribute('aria-selected')).to.equal('true');
    expect(el.value, 'checking moved the item').to.eql([]);
  });

  it('unchecks on a second click', async () => {
    const el = await list();
    await check(el, 'source', 'Alpha');
    await check(el, 'source', 'Alpha');
    expect(optFor(el, 'source', 'Alpha').getAttribute('aria-selected')).to.equal('false');
  });

  it('refuses to check a disabled option', async () => {
    const el = await list();
    await check(el, 'source', 'Charlie');
    expect(optFor(el, 'source', 'Charlie').getAttribute('aria-selected')).to.equal('false');
    expect(count(el, 'source').textContent.trim(), 'disabled item reached the count').to.equal(
      '0 of 5',
    );
  });

  it('marks a disabled option as aria-disabled', async () => {
    const el = await list();
    expect(optFor(el, 'source', 'Charlie').getAttribute('aria-disabled')).to.equal('true');
    expect(optFor(el, 'source', 'Alpha').getAttribute('aria-disabled')).to.equal('false');
  });
});

describe('arc-transfer-list moving', () => {
  it('moves a checked item when the control is pressed', async () => {
    const el = await list();
    await check(el, 'source', 'Bravo');
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(el.value).to.eql(['b']);
    expect(labels(el, 'target')).to.eql(['Bravo']);
  });

  it('keeps value in options order across separate moves', async () => {
    // Delta first, then Bravo — insertion order would give ['d', 'b'].
    const el = await list();
    await check(el, 'source', 'Delta');
    control(el, 'checkedToTarget').click();
    await settle(el);
    await check(el, 'source', 'Bravo');
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(el.value, 'value came out in insertion order').to.eql(['b', 'd']);
  });

  it('clears the checked marks of the items it moved', async () => {
    const el = await list();
    await check(el, 'source', 'Bravo');
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(optFor(el, 'target', 'Bravo').getAttribute('aria-selected')).to.equal('false');
    expect(count(el, 'target').textContent.trim()).to.equal('0 of 1');
  });

  it('moves back the other way', async () => {
    const el = await list('', { value: ['b', 'd'] });
    await check(el, 'target', 'Delta');
    control(el, 'checkedToSource').click();
    await settle(el);
    expect(el.value).to.eql(['b']);
    expect(labels(el, 'source')).to.eql(['Alpha', 'Charlie', 'Delta', 'Echo']);
  });

  it('moves an item on double-click', async () => {
    const el = await list();
    optFor(el, 'source', 'Delta').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await settle(el);
    expect(el.value).to.eql(['d']);
  });

  it('does not move a disabled item on double-click', async () => {
    const el = await list();
    optFor(el, 'source', 'Charlie').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await settle(el);
    expect(el.value).to.eql([]);
  });

  it('moves everything movable with move-all', async () => {
    const el = await list();
    control(el, 'allToTarget').click();
    await settle(el);
    expect(el.value, 'the disabled item was carried along').to.eql(['a', 'b', 'd', 'e']);
    expect(labels(el, 'source'), 'the disabled item did not stay put').to.eql(['Charlie']);
  });

  it('preserves values that are not in options, at the end', async () => {
    // Documented in _move: "Options order is canonical; unknown values are
    // preserved at the end."
    const el = await list('', { value: ['ghost', 'd'] });
    await check(el, 'source', 'Alpha');
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(el.value).to.eql(['a', 'd', 'ghost']);
  });

  it('is a no-op when nothing is checked', async () => {
    const el = await list();
    const seen = record(el, ['arc-change']);
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(el.value).to.eql([]);
    expect(only(seen, 'change').length, 'fired for an empty move').to.equal(0);
  });
});

describe('arc-transfer-list control enablement', () => {
  it('disables move-checked until something is checked', async () => {
    const el = await list();
    expect(control(el, 'checkedToTarget').disabled).to.equal(true);
    await check(el, 'source', 'Alpha');
    expect(control(el, 'checkedToTarget').disabled).to.equal(false);
  });

  it('disables move-all when the only items left are disabled', async () => {
    const el = await list('', { value: ['a', 'b', 'd', 'e'] });
    // Charlie alone remains in Available, and it cannot move.
    expect(labels(el, 'source')).to.eql(['Charlie']);
    expect(control(el, 'allToTarget').disabled, 'offered to move an unmovable item').to.equal(true);
  });

  it('disables every control while the host is disabled', async () => {
    const el = await list('disabled', { value: ['b'] });
    for (const which of Object.keys(CONTROLS)) {
      expect(control(el, which).disabled, `${which} stayed enabled`).to.equal(true);
    }
  });
});

describe('arc-transfer-list filtering', () => {
  it('has no filter inputs unless searchable', async () => {
    const el = await list();
    expect(el.shadowRoot.querySelectorAll('.tl__search').length).to.equal(0);
  });

  it('narrows one pane only', async () => {
    const el = await list('searchable', { value: ['b', 'd'] });
    await filterTo(el, 'source', 'ec');
    expect(labels(el, 'source')).to.eql(['Echo']);
    expect(labels(el, 'target'), 'the other pane was filtered too').to.eql(['Bravo', 'Delta']);
  });

  it('matches case-insensitively', async () => {
    const el = await list('searchable');
    await filterTo(el, 'source', 'ALPH');
    expect(labels(el, 'source')).to.eql(['Alpha']);
  });

  it('leaves the pane count on the unfiltered total', async () => {
    const el = await list('searchable');
    await filterTo(el, 'source', 'del');
    expect(count(el, 'source').textContent.trim(), 'the count followed the filter').to.equal(
      '0 of 5',
    );
  });

  it('move-all respects the filter', async () => {
    // The documented behaviour, and the reason the fixture filters to a middle
    // item: with 'del' the movable set is neither a prefix nor a suffix.
    const el = await list('searchable');
    await filterTo(el, 'source', 'del');
    control(el, 'allToTarget').click();
    await settle(el);
    expect(el.value).to.eql(['d']);
  });

  it('move-checked does NOT respect the filter', async () => {
    // Deliberate asymmetry: `@prop searchable` scopes the claim to move-all, and
    // _checkedIn reads the unfiltered pane. A mark the user made is not silently
    // dropped because they later typed in the filter box. Pinned because it
    // reads as a bug next to the test above, and is not one.
    const el = await list('searchable');
    await check(el, 'source', 'Alpha');
    await filterTo(el, 'source', 'del');
    expect(labels(el, 'source'), 'Alpha should be hidden').to.eql(['Delta']);

    expect(control(el, 'checkedToTarget').disabled, 'the control went dead').to.equal(false);
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(el.value, 'a hidden but checked item was dropped').to.eql(['a']);
  });

  it('filters while readonly', async () => {
    // "the lists stay focusable and filterable" — readonly is narrower than
    // disabled, and this is the half that must still work.
    const el = await list('searchable readonly');
    await filterTo(el, 'source', 'del');
    expect(labels(el, 'source')).to.eql(['Delta']);
  });
});

describe('arc-transfer-list readonly', () => {
  it('refuses to move', async () => {
    const el = await list('readonly');
    await check(el, 'source', 'Alpha');
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(el.value).to.eql([]);
  });

  it('refuses to move on double-click too', async () => {
    const el = await list('readonly');
    optFor(el, 'source', 'Delta').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await settle(el);
    expect(el.value).to.eql([]);
  });

  it('announces itself on the listboxes', async () => {
    const el = await list('readonly', { value: ['b'] });
    expect(box(el, 'source').getAttribute('aria-readonly')).to.equal('true');
    expect(box(el, 'target').getAttribute('aria-readonly')).to.equal('true');
  });

  it('says aria-readonly=false when it is not readonly', async () => {
    const el = await list();
    expect(box(el, 'source').getAttribute('aria-readonly')).to.equal('false');
  });

  it('still marks items, so the intent survives leaving readonly', async () => {
    const el = await list('readonly');
    await check(el, 'source', 'Alpha');
    expect(optFor(el, 'source', 'Alpha').getAttribute('aria-selected')).to.equal('true');
    el.readonly = false;
    await settle(el);
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(el.value).to.eql(['a']);
  });
});

describe('arc-transfer-list roving tabindex', () => {
  it('gives each pane exactly one tab stop', async () => {
    const el = await list('', { value: ['b', 'd'] });
    for (const pane of ['source', 'target']) {
      const stops = opts(el, pane).filter((o) => o.getAttribute('tabindex') === '0');
      expect(stops.length, `${pane} had ${stops.length} tab stops`).to.equal(1);
    }
  });

  it('starts on the first item of the pane', async () => {
    const el = await list();
    expect(opts(el, 'source')[0].getAttribute('tabindex')).to.equal('0');
  });

  it('has no tab stop at all while disabled', async () => {
    const el = await list('disabled');
    const stops = opts(el, 'source').filter((o) => o.getAttribute('tabindex') === '0');
    expect(stops.length).to.equal(0);
  });

  it('follows the click', async () => {
    const el = await list();
    await check(el, 'source', 'Delta');
    expect(optFor(el, 'source', 'Delta').getAttribute('tabindex')).to.equal('0');
    expect(optFor(el, 'source', 'Alpha').getAttribute('tabindex')).to.equal('-1');
  });

  it('falls back to the first visible item when the active one is filtered out', async () => {
    const el = await list('searchable');
    await check(el, 'source', 'Alpha');
    await filterTo(el, 'source', 'del');
    expect(optFor(el, 'source', 'Delta').getAttribute('tabindex')).to.equal('0');
  });
});

describe('arc-transfer-list keyboard', () => {
  const press = (el, pane, key, init) => keyOn(box(el, pane), key, init);

  it('moves the active item down with ArrowDown', async () => {
    const el = await list();
    press(el, 'source', 'ArrowDown');
    await settle(el);
    expect(optFor(el, 'source', 'Bravo').getAttribute('tabindex')).to.equal('0');
  });

  it('stops at the end rather than wrapping', async () => {
    const el = await list();
    for (let i = 0; i < 8; i += 1) press(el, 'source', 'ArrowDown');
    await settle(el);
    expect(optFor(el, 'source', 'Echo').getAttribute('tabindex'), 'it wrapped').to.equal('0');
  });

  it('stops at the start rather than wrapping', async () => {
    const el = await list();
    press(el, 'source', 'ArrowDown');
    await settle(el);
    for (let i = 0; i < 5; i += 1) press(el, 'source', 'ArrowUp');
    await settle(el);
    expect(optFor(el, 'source', 'Alpha').getAttribute('tabindex')).to.equal('0');
  });

  it('End goes to the last item and Home back to the first', async () => {
    const el = await list();
    press(el, 'source', 'End');
    await settle(el);
    expect(optFor(el, 'source', 'Echo').getAttribute('tabindex')).to.equal('0');
    press(el, 'source', 'Home');
    await settle(el);
    expect(optFor(el, 'source', 'Alpha').getAttribute('tabindex')).to.equal('0');
  });

  it('travels over the disabled item rather than stopping on it', async () => {
    // Charlie is index 2. Roving is allowed to land on it — only moving is
    // guarded — so this asserts arrowing past it reaches Delta.
    const el = await list();
    press(el, 'source', 'End');
    await settle(el);
    press(el, 'source', 'ArrowUp');
    await settle(el);
    expect(optFor(el, 'source', 'Delta').getAttribute('tabindex')).to.equal('0');
  });

  it('Space checks the active item', async () => {
    const el = await list();
    press(el, 'source', 'ArrowDown');
    await settle(el);
    press(el, 'source', ' ');
    await settle(el);
    expect(optFor(el, 'source', 'Bravo').getAttribute('aria-selected')).to.equal('true');
  });

  it('Enter moves the active item', async () => {
    const el = await list();
    press(el, 'source', 'ArrowDown');
    await settle(el);
    press(el, 'source', 'Enter');
    await settle(el);
    expect(el.value).to.eql(['b']);
  });

  it('Enter on a disabled item does nothing', async () => {
    const el = await list();
    press(el, 'source', 'ArrowDown');
    press(el, 'source', 'ArrowDown');
    await settle(el);
    expect(optFor(el, 'source', 'Charlie').getAttribute('tabindex'), 'not on Charlie').to.equal('0');
    press(el, 'source', 'Enter');
    await settle(el);
    expect(el.value).to.eql([]);
  });

  it('Ctrl+A checks every enabled item in the pane', async () => {
    const el = await list();
    press(el, 'source', 'a', { ctrlKey: true });
    await settle(el);
    expect(count(el, 'source').textContent.trim(), 'Charlie was included').to.equal('4 of 5');
  });

  it('Ctrl+A only reaches the filtered items', async () => {
    const el = await list('searchable');
    await filterTo(el, 'source', 'del');
    press(el, 'source', 'a', { ctrlKey: true });
    await settle(el);
    expect(count(el, 'source').textContent.trim()).to.equal('1 of 5');
  });

  it('accepts Meta+A as well, for macOS', async () => {
    const el = await list();
    press(el, 'source', 'A', { metaKey: true });
    await settle(el);
    expect(count(el, 'source').textContent.trim()).to.equal('4 of 5');
  });

  it('leaves a bare "a" to type into the pane rather than select-all', async () => {
    const el = await list();
    press(el, 'source', 'a');
    await settle(el);
    expect(count(el, 'source').textContent.trim()).to.equal('0 of 5');
  });

  it('ignores keys on an empty pane', async () => {
    const el = await list();
    press(el, 'target', 'ArrowDown');
    await settle(el);
    expect(el.value).to.eql([]);
  });
});

describe('arc-transfer-list focus after a move', () => {
  it('lands on the item that took the moved one’s place', async () => {
    // Alpha leaves; Bravo slides into index 0, so focus should follow the
    // position rather than the item. Asserting the *label* is what makes this
    // distinguishable from "focus stayed on index 0 by accident".
    const el = await list();
    keyOn(box(el, 'source'), 'Enter');
    await settle(el);
    expect(el.value).to.eql(['a']);
    expect(await until(() => deepActive()?.textContent?.trim() === 'Bravo')).to.equal(true);
  });

  it('clamps to the last item when the end of the pane was moved', async () => {
    const el = await list();
    keyOn(box(el, 'source'), 'End');
    await settle(el);
    keyOn(box(el, 'source'), 'Enter');
    await settle(el);
    expect(el.value).to.eql(['e']);
    expect(await until(() => deepActive()?.textContent?.trim() === 'Delta')).to.equal(true);
  });

  it('crosses to the other pane when the origin pane empties', async () => {
    const el = await list('', { value: ['b'] });
    keyOn(box(el, 'target'), 'Enter');
    await settle(el);
    expect(el.value).to.eql([]);
    // Nothing left in the target pane, so focus has to go somewhere real.
    expect(await until(() => box(el, 'source').contains(deepActive()))).to.equal(true);
  });
});

describe('arc-transfer-list events', () => {
  it('fires arc-change with the new value', async () => {
    const el = await list();
    const seen = record(el, ['arc-change'], { whole: true });
    await check(el, 'source', 'Bravo');
    control(el, 'checkedToTarget').click();
    await settle(el);

    const fired = only(seen, 'change');
    expect(fired.length).to.equal(1);
    expect(fired[0][1].value).to.eql(['b']);
  });

  it('fires once per move, not once per item', async () => {
    const el = await list();
    const seen = record(el, ['arc-change']);
    control(el, 'allToTarget').click();
    await settle(el);
    expect(only(seen, 'change').length).to.equal(1);
  });

  it('escapes the shadow root', async () => {
    const el = await list();
    let caught = 0;
    document.addEventListener('arc-change', () => (caught += 1));
    await check(el, 'source', 'Bravo');
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(caught, 'the event did not compose out').to.equal(1);
  });

  it('does not fire while readonly', async () => {
    const el = await list('readonly');
    const seen = record(el, ['arc-change']);
    await check(el, 'source', 'Bravo');
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(only(seen, 'change').length).to.equal(0);
  });
});

describe('arc-transfer-list announcements', () => {
  const live = (el) => el.shadowRoot.querySelector('[aria-live="polite"]').textContent.trim();

  it('announces a single move in the singular', async () => {
    const el = await list();
    await check(el, 'source', 'Bravo');
    control(el, 'checkedToTarget').click();
    await settle(el);
    expect(live(el)).to.equal('1 item moved to Selected');
  });

  it('announces a bulk move in the plural, with the count', async () => {
    const el = await list();
    control(el, 'allToTarget').click();
    await settle(el);
    expect(live(el), 'Charlie should not be in the count').to.equal('4 items moved to Selected');
  });

  it('names the destination pane by its label', async () => {
    const el = await list('source-label="Pool" target-label="Team"', { value: ['b'] });
    await check(el, 'target', 'Bravo');
    control(el, 'checkedToSource').click();
    await settle(el);
    expect(live(el)).to.equal('1 item moved to Pool');
  });
});

describe('arc-transfer-list form participation', () => {
  it('submits one entry per selected value', async () => {
    const form = mount('<form><arc-transfer-list name="perms"></arc-transfer-list></form>');
    const el = form.querySelector('arc-transfer-list');
    el.options = OPTIONS.map((o) => ({ ...o }));
    el.value = ['b', 'd'];
    await settle(el);

    const data = new FormData(form);
    expect(data.getAll('perms')).to.eql(['b', 'd']);
  });

  it('submits nothing when nothing is selected', async () => {
    const form = mount('<form><arc-transfer-list name="perms"></arc-transfer-list></form>');
    const el = form.querySelector('arc-transfer-list');
    el.options = OPTIONS.map((o) => ({ ...o }));
    await settle(el);
    expect(new FormData(form).getAll('perms')).to.eql([]);
  });

  it('restores its value on form reset', async () => {
    // FormControlMixin captures the reset baseline on *first connect*, so the
    // value has to be set on a detached element. Building it with mount() and
    // assigning afterwards baselines `[]` and makes the assertion pass for the
    // wrong reason.
    const form = mount('<form></form>');
    const el = document.createElement('arc-transfer-list');
    el.name = 'perms';
    el.options = OPTIONS.map((o) => ({ ...o }));
    el.value = ['b'];
    form.appendChild(el);
    await settle(el);

    control(el, 'allToTarget').click();
    await settle(el);
    expect(el.value.length, 'nothing moved, so reset would be vacuous').to.be.greaterThan(1);

    form.reset();
    await settle(el);
    expect(el.value).to.eql(['b']);
  });
});
