import { expect } from '@esm-bundle/chai';
import '../src/input/select.register.js';
import '../src/input/combobox.register.js';
import '../src/input/multi-select.register.js';
import '../src/input/tag-input.register.js';
// arc-option must be a defined element, not just parsed markup: unupgraded, its
// `label` property doesn't exist and every option reads as blank.
import '../src/shared/option.register.js';
import { ListboxController } from '../src/shared/listbox-controller.js';
import { mount, cleanup, tick, deepActive } from './helpers.js';

/** Send a key to an element the way a real press reaches it. */
function key(el, k, init = {}) {
  el.dispatchEvent(new KeyboardEvent('keydown', {
    key: k, bubbles: true, composed: true, cancelable: true, ...init,
  }));
}

async function mountSelect(count = 12) {
  const options = Array.from({ length: count }, (_, i) =>
    `<arc-option value="v${i}">Option ${i}</arc-option>`).join('');
  const el = mount(`<arc-select label="Pick">${options}</arc-select>`);
  await el.updateComplete;
  await tick();
  await el.updateComplete;
  return el;
}

function trigger(el) {
  return el.shadowRoot.querySelector('.select__trigger');
}

function options(el) {
  return [...el.shadowRoot.querySelectorAll('.select__option')];
}

describe('ListboxController: opening with a direction key', () => {
  afterEach(cleanup);

  it('ArrowDown opens onto the first option', async () => {
    const el = await mountSelect();
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    await tick();
    await el.updateComplete;

    expect(el.open).to.equal(true);
    expect(el._listbox.activeIndex).to.equal(0);
  });

  it('ArrowUp opens onto the last option', async () => {
    // The bug this replaces: ArrowUp did not open a closed listbox at all, and
    // once open it clamped at 0, so the last option took N keypresses to reach.
    const el = await mountSelect();
    key(trigger(el), 'ArrowUp');
    await el.updateComplete;
    await tick();
    await el.updateComplete;

    expect(el.open).to.equal(true);
    expect(el._listbox.activeIndex).to.equal(11);
  });
});

describe('ListboxController: wrapping', () => {
  afterEach(cleanup);

  it('wraps from the last option to the first', async () => {
    const el = await mountSelect(3);
    el.open = true;
    await el.updateComplete;
    el._listbox.setActive(2);
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(0);
  });

  it('wraps from the first option to the last', async () => {
    const el = await mountSelect(3);
    el.open = true;
    await el.updateComplete;
    el._listbox.setActive(0);
    key(trigger(el), 'ArrowUp');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(2);
  });

  it('Home and End jump to the ends', async () => {
    const el = await mountSelect();
    el.open = true;
    await el.updateComplete;

    key(trigger(el), 'End');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(11);

    key(trigger(el), 'Home');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(0);
  });
});

describe('ListboxController: scroll-into-view', () => {
  afterEach(cleanup);

  it('scrolls a far-down active option into the panel', async () => {
    // The listbox caps at 240px, so past roughly the sixth option keyboard
    // navigation used to move an active marker nobody could see.
    const el = await mountSelect(40);
    el.open = true;
    await el.updateComplete;

    const panel = el.shadowRoot.querySelector('.select__dropdown');
    expect(panel.scrollTop, 'starts at the top').to.equal(0);

    key(trigger(el), 'End');
    await el.updateComplete;
    await tick();

    expect(panel.scrollTop).to.be.greaterThan(0);
    const active = el.shadowRoot.querySelector('.select__option--active');
    const p = panel.getBoundingClientRect();
    const a = active.getBoundingClientRect();
    expect(Math.round(a.bottom)).to.be.at.most(Math.round(p.bottom) + 1);
    expect(Math.round(a.top)).to.be.at.least(Math.round(p.top) - 1);
  });

  it('leaves the page scroll alone', async () => {
    // The panel is in the top layer; a naive scrollIntoView is specified to
    // scroll every scrollable ancestor, which would drag the page behind it.
    const spacer = document.createElement('div');
    spacer.style.height = '3000px';
    document.body.appendChild(spacer);
    const el = await mountSelect(40);
    el.open = true;
    await el.updateComplete;
    const before = window.scrollY;

    key(trigger(el), 'End');
    await el.updateComplete;
    await tick();

    expect(window.scrollY).to.equal(before);
  });
});

describe('ListboxController: typeahead', () => {
  afterEach(cleanup);

  it('jumps to the option starting with the typed letter', async () => {
    const el = mount(`
      <arc-select label="Pick">
        <arc-option value="a">Apple</arc-option>
        <arc-option value="b">Banana</arc-option>
        <arc-option value="c">Cherry</arc-option>
      </arc-select>
    `);
    await el.updateComplete;
    await tick();
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;

    key(trigger(el), 'c');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(2);
  });

  it('cycles through options sharing a first letter', async () => {
    const el = mount(`
      <arc-select label="Pick">
        <arc-option value="a1">Apple</arc-option>
        <arc-option value="a2">Apricot</arc-option>
        <arc-option value="b">Banana</arc-option>
      </arc-select>
    `);
    await el.updateComplete;
    await tick();
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;

    key(trigger(el), 'a');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(0);

    key(trigger(el), 'a');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(1);
  });

  it('ignores modifier combinations', async () => {
    const el = await mountSelect();
    el.open = true;
    await el.updateComplete;
    key(trigger(el), 'o', { metaKey: true });
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(-1);
  });

  it('stays off where a text field owns the keystrokes', async () => {
    // Typing in a combobox filters; typeahead would fight the query.
    const el = mount('<arc-combobox label="Search"></arc-combobox>');
    await el.updateComplete;
    expect(el._listbox.opts.typeahead).to.not.equal(true);
  });
});

describe('ListboxController: virtual focus is the only focus', () => {
  afterEach(cleanup);

  it('keeps DOM focus on the trigger while arrowing', async () => {
    // The pattern this replaces moved real focus onto option buttons while also
    // setting aria-activedescendant — two mutually exclusive patterns at once.
    const el = await mountSelect();
    trigger(el).focus();
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    await tick();
    await el.updateComplete;

    expect(deepActive()).to.equal(trigger(el));
  });

  it('renders options as non-focusable elements', async () => {
    const el = await mountSelect(3);
    el.open = true;
    await el.updateComplete;

    for (const opt of options(el)) {
      expect(opt.localName, 'option element').to.not.equal('button');
      expect(opt.hasAttribute('tabindex'), 'no tab stop').to.equal(false);
      expect(opt.getAttribute('role')).to.equal('option');
    }
  });

  it('points aria-activedescendant at the active option', async () => {
    const el = await mountSelect(3);
    el.open = true;
    await el.updateComplete;
    el._listbox.setActive(1);
    await el.updateComplete;

    const id = trigger(el).getAttribute('aria-activedescendant');
    expect(id).to.be.a('string').and.not.empty;
    expect(el.shadowRoot.getElementById(id)).to.equal(options(el)[1]);
  });

  it('never leaves aria-activedescendant pointing at a removed option', async () => {
    const el = mount(`
      <arc-combobox label="Search">
        <arc-option value="a">Alpha</arc-option>
        <arc-option value="b">Bravo</arc-option>
        <arc-option value="c">Charlie</arc-option>
      </arc-combobox>
    `);
    await el.updateComplete;
    await tick();
    await el.updateComplete;

    const input = el.shadowRoot.querySelector('.combobox__input');
    el._open = true;
    el._listbox.setActive(2);
    await el.updateComplete;
    expect(input.getAttribute('aria-activedescendant')).to.be.a('string').and.not.empty;

    // Filter down to fewer options than the active index.
    el._query = 'Alp';
    await el.updateComplete;

    const id = input.getAttribute('aria-activedescendant');
    if (id) expect(el.shadowRoot.getElementById(id), 'points at a live option').to.not.equal(null);
  });
});

describe('ListboxController: selection', () => {
  afterEach(cleanup);

  it('Enter selects the active option', async () => {
    const el = await mountSelect(3);
    el.open = true;
    await el.updateComplete;
    el._listbox.setActive(1);
    await el.updateComplete;

    let detail = null;
    el.addEventListener('arc-change', (e) => { detail = e.detail; });
    key(trigger(el), 'Enter');
    await el.updateComplete;

    expect(detail?.value).to.equal('v1');
    expect(el.open).to.equal(false);
  });

  it('Escape closes without selecting', async () => {
    const el = await mountSelect(3);
    el.open = true;
    await el.updateComplete;
    el._listbox.setActive(1);

    let fired = false;
    el.addEventListener('arc-change', () => { fired = true; });
    key(trigger(el), 'Escape');
    await el.updateComplete;

    expect(el.open).to.equal(false);
    expect(fired).to.equal(false);
    expect(el._listbox.activeIndex).to.equal(-1);
  });

  it('opens onto the already-selected option', async () => {
    const el = await mountSelect(5);
    el.value = 'v3';
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;

    expect(el._listbox.activeIndex).to.equal(3);
  });

  it('leaves tag-input free to commit typed text on Enter', async () => {
    // The controller declines Enter when nothing is active, which is what keeps
    // tag-input's "commit whatever was typed" path reachable.
    const el = mount('<arc-tag-input label="Tags"></arc-tag-input>');
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.value = 'alpha';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await el.updateComplete;

    key(input, 'Enter');
    await el.updateComplete;
    expect(el.value).to.deep.equal(['alpha']);
  });
});

describe('ListboxController: all four inputs share it', () => {
  afterEach(cleanup);

  const cases = [
    ['arc-select', '<arc-select label="a"></arc-select>'],
    ['arc-combobox', '<arc-combobox label="a"></arc-combobox>'],
    ['arc-multi-select', '<arc-multi-select label="a"></arc-multi-select>'],
    ['arc-tag-input', '<arc-tag-input label="a"></arc-tag-input>'],
  ];

  for (const [tag, markup] of cases) {
    it(`${tag} has no keyboard state of its own`, async () => {
      const el = mount(markup);
      await el.updateComplete;
      expect(el._listbox, 'uses ListboxController').to.be.an('object');
      // The four copies of the same switch each kept their own _activeIndex;
      // the controller is now the single source of truth.
      expect(el._activeIndex, 'no private active index').to.equal(undefined);
    });
  }
});

/**
 * Per-option `disabled` — finding #6.
 *
 * arc-option has always declared it; all four consumers read the *group's*
 * flag and never the option's, so a disabled option was reachable by arrow
 * key, by typeahead and by Enter. The skip is the controller's job because
 * the keyboard is; refusing the click is each component's own, and pinned in
 * their suites.
 */
describe('ListboxController: disabled options', () => {
  afterEach(cleanup);

  /** A select whose options at `disabledIndexes` refuse selection. */
  async function mountWithDisabled(count, disabledIndexes) {
    const options = Array.from({ length: count }, (_, i) =>
      `<arc-option value="v${i}" ${disabledIndexes.includes(i) ? 'disabled' : ''}>Option ${i}</arc-option>`).join('');
    const el = mount(`<arc-select label="Pick">${options}</arc-select>`);
    await el.updateComplete;
    await tick();
    await el.updateComplete;
    return el;
  }

  async function opened(count, disabledIndexes) {
    const el = await mountWithDisabled(count, disabledIndexes);
    el.open = true;
    await el.updateComplete;
    await tick();
    await el.updateComplete;
    return el;
  }

  it('ArrowDown steps over a disabled option', async () => {
    const el = await opened(4, [1, 2]);
    el._listbox.setActive(0);
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(3);
  });

  it('ArrowUp steps over a disabled option', async () => {
    const el = await opened(4, [1, 2]);
    el._listbox.setActive(3);
    key(trigger(el), 'ArrowUp');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(0);
  });

  it('Home and End land on the nearest selectable option', async () => {
    const el = await opened(4, [0, 3]);

    key(trigger(el), 'Home');
    await el.updateComplete;
    expect(el._listbox.activeIndex, 'not the disabled index 0').to.equal(1);

    key(trigger(el), 'End');
    await el.updateComplete;
    expect(el._listbox.activeIndex, 'not the disabled index 3').to.equal(2);
  });

  it('opens onto the first selectable option, not the first option', async () => {
    const el = await mountWithDisabled(4, [0]);
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    await tick();
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(1);
  });

  it('opens upward onto the last selectable option', async () => {
    const el = await mountWithDisabled(4, [3]);
    key(trigger(el), 'ArrowUp');
    await el.updateComplete;
    await tick();
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(2);
  });

  it('typeahead skips a disabled match', async () => {
    // Both options start with "O"; the first refuses, so the letter has to
    // reach past it rather than parking virtual focus on something inert.
    const el = await opened(3, [0, 1]);
    key(trigger(el), 'O');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(2);
  });

  it('Enter on a disabled option selects nothing, and still eats the key', async () => {
    const el = await opened(3, [1]);
    el._listbox.setActive(1);
    await el.updateComplete;

    const event = new KeyboardEvent('keydown', {
      key: 'Enter', bubbles: true, composed: true, cancelable: true,
    });
    trigger(el).dispatchEvent(event);
    await el.updateComplete;

    expect(el.value, 'nothing was selected').to.equal('');
    expect(el.open, 'and the listbox stayed open').to.equal(true);
    expect(event.defaultPrevented, 'or Enter falls through to a form submit').to.equal(true);
  });

  it('does not move or spin when every option is disabled', async () => {
    const el = await opened(3, [0, 1, 2]);
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    expect(el._listbox.activeIndex).to.equal(-1);
  });

  it('keeps disabled options rendered and counted', async () => {
    // Filtering them out would renumber every option after them, and
    // aria-activedescendant is an index into what is rendered.
    const el = await opened(4, [1]);
    expect(options(el)).to.have.lengthOf(4);
    expect(options(el)[1].getAttribute('aria-disabled')).to.equal('true');
    expect(options(el)[0].hasAttribute('aria-disabled'), 'only where it applies').to.equal(false);
  });
});

/**
 * The controller driven directly, without a component in front of it.
 *
 * Everything above goes through `arc-select`, which is the right shape for
 * "does the keyboard work" and the wrong one for the *consumption* contract.
 * Every consumer runs `if (this._listbox.handleKeydown(e)) return;` and then
 * handles the same key in its own switch, so an assertion made through the
 * component cannot tell "the controller consumed the key" from "the component
 * did it anyway" — which is why mutating every `return true` and `return
 * false` in `handleKeydown` to its opposite changed nothing any test could
 * see. Fifteen survivors from one return value nobody read.
 *
 * The same harness reaches the states a rendered select never sits in: zero
 * options, an option set that shrinks between renders, and the three option
 * combinations no consumer sets (`wrap: false`, no `optionId`, `typeahead`
 * without `getItemLabel`).
 */

/**
 * A ListboxController on a stand-in host. `addController` and `requestUpdate`
 * are the only two hooks it uses, plus `updateComplete` for the settle after
 * an opening keypress.
 *
 * Returns the mutable state, so a test can change `labels` mid-flight the way
 * a filtering combobox does.
 */
function harness({ labels = ['Apple', 'Apricot', 'Banana'], open = true, ...opts } = {}) {
  const state = { labels, open, updates: 0, opened: 0, closed: 0, selected: [] };
  const host = {
    addController() {},
    requestUpdate() { state.updates += 1; },
    updateComplete: Promise.resolve(true),
  };
  state.controller = new ListboxController(host, {
    getItemCount: () => state.labels.length,
    isOpen: () => state.open,
    onOpen: () => { state.opened += 1; state.open = true; },
    onClose: () => { state.closed += 1; state.open = false; },
    onSelect: (i) => state.selected.push(i),
    optionId: (i) => `opt-${i}`,
    getItemLabel: (i) => state.labels[i],
    typeahead: true,
    ...opts,
  });
  return state;
}

/** Press a key at the controller; the return value is the whole point. */
function press(state, k, init = {}) {
  const event = new KeyboardEvent('keydown', { key: k, cancelable: true, ...init });
  return { consumed: state.controller.handleKeydown(event), event };
}

describe('ListboxController: which keys it consumes', () => {
  it('consumes the keys it acts on', () => {
    for (const k of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape']) {
      expect(press(harness(), k).consumed, k).to.equal(true);
    }
  });

  it('declines the keys that belong to the host while closed', () => {
    for (const k of ['Home', 'End', 'Enter', 'Escape']) {
      expect(press(harness({ open: false }), k).consumed, `${k} while closed`).to.equal(false);
    }
  });

  it('consumes a direction key that opens the listbox', async () => {
    const s = harness({ open: false });
    expect(press(s, 'ArrowDown').consumed).to.equal(true);
    expect(s.opened, 'the host was asked to open').to.equal(1);
    await tick();
    expect(s.controller.activeIndex).to.equal(0);
  });

  it('declines Home and End when the listbox is open but empty', () => {
    const s = harness({ labels: [] });
    expect(press(s, 'Home').consumed, 'Home').to.equal(false);
    expect(press(s, 'End').consumed, 'End').to.equal(false);
  });

  it('declines Enter while closed even with an option already active', () => {
    // Both halves of `!open || activeIndex < 0` matter: a listbox that closed
    // without resetting still holds an active index, and Enter then belongs to
    // the form, not to a listbox nobody can see.
    const s = harness();
    s.controller.setActive(1);
    s.open = false;
    const { consumed } = press(s, 'Enter');
    expect(consumed).to.equal(false);
    expect(s.selected, 'and selects nothing').to.deep.equal([]);
  });

  it('declines Enter when nothing is active', () => {
    const s = harness();
    expect(s.controller.activeIndex, 'nothing active').to.equal(-1);
    expect(press(s, 'Enter').consumed).to.equal(false);
  });

  it('consumes Enter on an active option, and selects it', () => {
    const s = harness();
    s.controller.setActive(2);
    const { consumed, event } = press(s, 'Enter');
    expect(consumed).to.equal(true);
    expect(s.selected).to.deep.equal([2]);
    expect(event.defaultPrevented).to.equal(true);
  });

  it('consumes Escape on an open listbox, and closes it', () => {
    const s = harness();
    s.controller.setActive(1);
    expect(press(s, 'Escape').consumed).to.equal(true);
    expect(s.closed, 'the host was asked to close').to.equal(1);
    expect(s.controller.activeIndex).to.equal(-1);
  });
});

describe('ListboxController: wrap', () => {
  it('wraps past the end to reach the only selectable option', () => {
    // Four options with the two ahead of the active one disabled: the only way
    // to move is round the end. Every other arrow test passes just as well
    // against a controller that clamps, which is why wrapping survived.
    const s = harness({
      labels: ['a', 'b', 'c', 'd'],
      isItemDisabled: (i) => i === 2 || i === 3,
    });
    s.controller.setActive(1);
    press(s, 'ArrowDown');
    expect(s.controller.activeIndex).to.equal(0);
  });

  it('wrap: false runs off the end instead of round it', () => {
    const s = harness({
      labels: ['a', 'b', 'c', 'd'],
      isItemDisabled: (i) => i === 2 || i === 3,
      wrap: false,
    });
    s.controller.setActive(1);
    press(s, 'ArrowDown');
    expect(s.controller.activeIndex, 'no selectable option forward').to.equal(1);
  });

  it('wrap: false holds both ends', () => {
    const s = harness({ labels: ['a', 'b', 'c'], wrap: false });
    s.controller.setActive(2);
    press(s, 'ArrowDown');
    expect(s.controller.activeIndex, 'last stays last').to.equal(2);

    s.controller.setActive(0);
    press(s, 'ArrowUp');
    expect(s.controller.activeIndex, 'first stays first').to.equal(0);
  });
});

describe('ListboxController: the option set changing underneath it', () => {
  it('clamps the active index into a shrunken set', () => {
    const s = harness({ labels: ['a', 'b', 'c'] });
    s.controller.setActive(2);
    s.labels = ['a', 'b'];
    s.controller.clampToCount();
    expect(s.controller.activeIndex).to.equal(1);
  });

  it('drops the active index when the set empties', () => {
    const s = harness({ labels: ['a', 'b', 'c'] });
    s.controller.setActive(2);
    s.labels = [];
    s.controller.clampToCount();
    expect(s.controller.activeIndex).to.equal(-1);
  });

  it('empties activeDescendantId the moment the option leaves the set', () => {
    // The render that shrinks the list runs before the host gets to clamp, so
    // this range check is what stops that one frame naming an option it has
    // just stopped drawing. Asserted without calling clampToCount, because the
    // frame in question is the one before it runs.
    const s = harness({ labels: ['a', 'b', 'c'] });
    s.controller.setActive(2);
    expect(s.controller.activeDescendantId).to.equal('opt-2');
    s.labels = ['a', 'b'];
    expect(s.controller.activeDescendantId, 'before any clamp').to.equal('');
  });

  it('has no activeDescendantId for a consumer that supplies no optionId', () => {
    const s = harness({ optionId: undefined });
    s.controller.setActive(1);
    expect(s.controller.activeDescendantId).to.equal('');
  });
});

describe('ListboxController: typeahead edges', () => {
  it('starts the search after the active option', () => {
    // Apple then Apricot: with index 0 already active, "a" has to advance
    // rather than re-matching the option virtual focus is already on.
    const s = harness({ labels: ['Apple', 'Apricot', 'Banana'] });
    s.controller.setActive(0);
    const { consumed, event } = press(s, 'a');
    expect(consumed).to.equal(true);
    expect(event.defaultPrevented).to.equal(true);
    expect(s.controller.activeIndex).to.equal(1);
  });

  it('declines a letter that matches nothing', () => {
    const s = harness();
    expect(press(s, 'z').consumed).to.equal(false);
    expect(s.controller.activeIndex).to.equal(-1);
  });

  it('declines each modifier combination on its own', () => {
    // One at a time: a single test holding all three down passes against a
    // controller that checks only the one it happens to look at first.
    for (const mod of ['altKey', 'ctrlKey', 'metaKey']) {
      const s = harness();
      expect(press(s, 'a', { [mod]: true }).consumed, mod).to.equal(false);
      expect(s.controller.activeIndex, mod).to.equal(-1);
    }
  });

  it('declines a key that is not a single character', () => {
    expect(press(harness(), 'Tab').consumed).to.equal(false);
  });

  it('leaves a leading Space to the host, and takes it inside a buffer', () => {
    // Space on an empty buffer is the host's key — in a select it toggles the
    // listbox. Once a search is in progress it is a character like any other.
    const s = harness({ labels: ['a b', 'ab'] });
    expect(press(s, ' ').consumed, 'leading').to.equal(false);
    press(s, 'a');
    expect(press(s, ' ').consumed, 'inside a buffer').to.equal(true);
    expect(s.controller.activeIndex).to.equal(0);
  });

  it('declines when there are no options to search', () => {
    expect(press(harness({ labels: [] }), 'a').consumed).to.equal(false);
  });

  it('declines when the consumer never enabled it', () => {
    expect(press(harness({ typeahead: false }), 'a').consumed).to.equal(false);
  });

  it('declines when it was enabled without a label reader', () => {
    // typeahead needs getItemLabel; asking for one without the other has to be
    // inert rather than a call into undefined.
    expect(press(harness({ getItemLabel: undefined }), 'a').consumed).to.equal(false);
  });

  it('opens a closed listbox to show what it matched', () => {
    const s = harness({ open: false });
    expect(press(s, 'b').consumed).to.equal(true);
    expect(s.opened, 'the host was asked to open').to.equal(1);
    expect(s.controller.activeIndex).to.equal(2);
  });
});

describe('ListboxController: the scroll is queued, not continuous', () => {
  afterEach(cleanup);

  it('scrolls back to the top when the first option becomes active', async () => {
    // `_pendingScroll = next >= 0`: index 0 is a real active option, and a `>`
    // here leaves Home moving the marker to somewhere off screen.
    const el = await mountSelect(40);
    el.open = true;
    await el.updateComplete;

    key(trigger(el), 'End');
    await el.updateComplete;
    await tick();
    const panel = el.shadowRoot.querySelector('.select__dropdown');
    expect(panel.scrollTop, 'scrolled down first').to.be.greaterThan(0);

    key(trigger(el), 'Home');
    await el.updateComplete;
    await tick();
    // Not exactly 0: the scroll targets the option's offsetTop, and the panel
    // has a 1px inset above the first one.
    expect(panel.scrollTop).to.be.at.most(2);
  });

  it('leaves the scroll alone on a render that did not move the active option', async () => {
    const el = await mountSelect(40);
    el.open = true;
    await el.updateComplete;
    key(trigger(el), 'End');
    await el.updateComplete;
    await tick();

    const panel = el.shadowRoot.querySelector('.select__dropdown');
    panel.scrollTop = 0;
    el.requestUpdate();
    await el.updateComplete;
    await tick();
    expect(panel.scrollTop, 'a hand-scrolled panel survives an unrelated render').to.equal(0);
  });
});

/**
 * The click path is each component's own — the controller never sees a click.
 * Swept across all three arc-option consumers here rather than in three files,
 * because the defect was identical in all three and a shared assertion is what
 * makes "all three" checkable.
 */
describe('arc-option disabled: every consumer refuses the click', () => {
  afterEach(cleanup);

  const cases = [
    {
      tag: 'arc-select',
      optionSelector: '.select__option',
      open: (el) => { el.open = true; },
      read: (el) => el.value,
      empty: '',
    },
    {
      tag: 'arc-combobox',
      optionSelector: '.combobox__option',
      open: (el) => { el._open = true; },
      read: (el) => el.value,
      empty: '',
    },
    {
      tag: 'arc-multi-select',
      optionSelector: '.ms__option',
      open: (el) => { el._open = true; },
      read: (el) => [...(el.value || [])].join(','),
      empty: '',
    },
  ];

  for (const { tag, optionSelector, open, read, empty } of cases) {
    it(`${tag} ignores a click on a disabled option`, async () => {
      const el = mount(`<${tag} label="Pick">
        <arc-option value="a">Alpha</arc-option>
        <arc-option value="b" disabled>Bravo</arc-option>
      </${tag}>`);
      await el.updateComplete;
      await tick();
      open(el);
      await el.updateComplete;
      await tick();
      await el.updateComplete;

      const rendered = [...el.shadowRoot.querySelectorAll(optionSelector)];
      expect(rendered, 'the disabled option is still drawn').to.have.lengthOf(2);

      rendered[1].click();
      await el.updateComplete;
      expect(read(el), 'the disabled option must not become the value').to.equal(empty);

      // Anti-vacuity: the enabled sibling must still be clickable, or this
      // whole block would pass against a listbox that ignores every click.
      rendered[0].click();
      await el.updateComplete;
      expect(read(el)).to.equal('a');
    });
  }
});
