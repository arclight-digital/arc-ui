import { expect } from '@esm-bundle/chai';
import '../src/input/select.register.js';
import '../src/input/combobox.register.js';
import '../src/input/multi-select.register.js';
import '../src/input/tag-input.register.js';
// arc-option must be a defined element, not just parsed markup: unupgraded, its
// `label` property doesn't exist and every option reads as blank.
import '../src/shared/option.register.js';
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
