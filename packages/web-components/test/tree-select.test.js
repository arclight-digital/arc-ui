import { expect } from '@esm-bundle/chai';
import '../src/input/tree-select.register.js';
import { mount, cleanup, tick, deepActive } from './helpers.js';

/** Send a key to an element the way a real press reaches it. */
function key(el, k, init = {}) {
  el.dispatchEvent(new KeyboardEvent('keydown', {
    key: k, bubbles: true, composed: true, cancelable: true, ...init,
  }));
}

/** An instrument bank: two-level tree with a disabled leaf. */
function sampleItems() {
  return [
    { value: 'keys', label: 'Keys', children: [
      { value: 'piano', label: 'Piano' },
      { value: 'rhodes', label: 'Rhodes', disabled: true },
    ] },
    { value: 'strings', label: 'Strings', children: [
      { value: 'violin', label: 'Violin' },
      { value: 'cello', label: 'Cello' },
    ] },
    { value: 'percussion', label: 'Percussion', children: [
      { value: 'timpani', label: 'Timpani' },
    ] },
  ];
}

async function mountTreeSelect(attrs = '') {
  const el = mount(`<arc-tree-select label="Instrument" ${attrs}></arc-tree-select>`);
  el.items = sampleItems();
  await el.updateComplete;
  return el;
}

function trigger(el) {
  return el.shadowRoot.querySelector('.tree-select__trigger');
}

function rows(el) {
  return [...el.shadowRoot.querySelectorAll('.tree-select__row')];
}

function rowLabels(el) {
  return rows(el).map((r) => r.querySelector('.tree-select__row-label').textContent.trim());
}

function rowByLabel(el, label) {
  return rows(el).find(
    (r) => r.querySelector('.tree-select__row-label').textContent.trim() === label
  );
}

describe('arc-tree-select: open and close', () => {
  afterEach(cleanup);

  it('opens on trigger click and closes on selection', async () => {
    const el = await mountTreeSelect();
    trigger(el).click();
    await el.updateComplete;
    expect(el.open).to.equal(true);

    rowByLabel(el, 'Keys').click();
    await el.updateComplete;
    rowByLabel(el, 'Piano').click();
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('shows only root rows while every branch is collapsed', async () => {
    const el = await mountTreeSelect();
    el.open = true;
    await el.updateComplete;
    expect(rowLabels(el)).to.deep.equal(['Keys', 'Strings', 'Percussion']);
  });

  it('Escape closes without selecting', async () => {
    const el = await mountTreeSelect();
    el.open = true;
    await el.updateComplete;

    let fired = false;
    el.addEventListener('arc-change', () => { fired = true; });
    key(trigger(el), 'Escape');
    await el.updateComplete;

    expect(el.open).to.equal(false);
    expect(fired).to.equal(false);
    expect(el.value).to.equal('');
  });
});

describe('arc-tree-select: leaf-only selection', () => {
  afterEach(cleanup);

  it('selecting a leaf fires arc-change with value and ancestor path', async () => {
    const el = await mountTreeSelect();
    el.open = true;
    await el.updateComplete;

    let detail = null;
    el.addEventListener('arc-change', (e) => { detail = e.detail; });

    rowByLabel(el, 'Strings').click();
    await el.updateComplete;
    rowByLabel(el, 'Violin').click();
    await el.updateComplete;

    expect(detail.value).to.equal('violin');
    expect(detail.label).to.equal('Violin');
    expect(detail.path).to.deep.equal(['strings']);
    expect(el.value).to.equal('violin');
    expect(el.open).to.equal(false);
  });

  it('clicking a group header expands it but never selects it', async () => {
    const el = await mountTreeSelect();
    el.open = true;
    await el.updateComplete;

    let fired = false;
    el.addEventListener('arc-change', () => { fired = true; });
    rowByLabel(el, 'Keys').click();
    await el.updateComplete;

    expect(fired).to.equal(false);
    expect(el.value).to.equal('');
    expect(el.open, 'panel stays open').to.equal(true);
    expect(rowLabels(el)).to.include('Piano');
    expect(rowByLabel(el, 'Keys').getAttribute('aria-expanded')).to.equal('true');

    rowByLabel(el, 'Keys').click();
    await el.updateComplete;
    expect(rowLabels(el)).to.not.include('Piano');
  });

  it('group headers carry aria-expanded, leaves carry aria-selected', async () => {
    const el = await mountTreeSelect();
    el.value = 'violin';
    el.open = true;
    await el.updateComplete;

    const group = rowByLabel(el, 'Strings');
    expect(group.getAttribute('aria-expanded')).to.equal('true');
    expect(group.hasAttribute('aria-selected'), 'groups are not selectable').to.equal(false);

    const leaf = rowByLabel(el, 'Violin');
    expect(leaf.hasAttribute('aria-expanded')).to.equal(false);
    expect(leaf.getAttribute('aria-selected')).to.equal('true');
  });
});

describe('arc-tree-select: expansion state', () => {
  afterEach(cleanup);

  it('expanded-values renders those branches open from the start', async () => {
    const el = await mountTreeSelect();
    el.expandedValues = ['percussion'];
    el.open = true;
    await el.updateComplete;
    expect(rowLabels(el)).to.deep.equal(['Keys', 'Strings', 'Percussion', 'Timpani']);
  });

  it('auto-expands the branches containing the selected value on open', async () => {
    const el = await mountTreeSelect();
    el.value = 'cello';
    await el.updateComplete;
    expect(rowLabels(el), 'still collapsed while closed').to.deep.equal(['Keys', 'Strings', 'Percussion']);

    el.open = true;
    await el.updateComplete;
    expect(rowLabels(el)).to.include('Cello');
    expect(rowByLabel(el, 'Cello').getAttribute('aria-selected')).to.equal('true');
  });

  it('opens onto the selected leaf so arrowing starts from it', async () => {
    const el = await mountTreeSelect();
    el.value = 'cello';
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;

    const active = el.shadowRoot.querySelector('.tree-select__row--active');
    expect(active, 'an active row exists').to.exist;
    expect(active.querySelector('.tree-select__row-label').textContent.trim()).to.equal('Cello');
  });
});

describe('arc-tree-select: keyboard', () => {
  afterEach(cleanup);

  it('ArrowDown opens onto the first row and keeps DOM focus on the trigger', async () => {
    const el = await mountTreeSelect();
    trigger(el).focus();
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    await tick();
    await el.updateComplete;

    expect(el.open).to.equal(true);
    expect(el._listbox.activeIndex).to.equal(0);
    expect(deepActive()).to.equal(trigger(el));
  });

  it('walks the tree: ArrowRight expands, arrows descend, Enter selects', async () => {
    const el = await mountTreeSelect();
    trigger(el).focus();
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    await tick();
    await el.updateComplete;

    // Active on Keys — expand it.
    key(trigger(el), 'ArrowRight');
    await el.updateComplete;
    expect(rowByLabel(el, 'Keys').getAttribute('aria-expanded')).to.equal('true');

    // Down into the branch: Piano is the first child.
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;

    let detail = null;
    el.addEventListener('arc-change', (e) => { detail = e.detail; });
    key(trigger(el), 'Enter');
    await el.updateComplete;

    expect(detail.value).to.equal('piano');
    expect(detail.path).to.deep.equal(['keys']);
    expect(el.open).to.equal(false);
  });

  it('ArrowLeft collapses an expanded group', async () => {
    const el = await mountTreeSelect();
    trigger(el).focus();
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    await tick();
    await el.updateComplete;

    key(trigger(el), 'ArrowRight');
    await el.updateComplete;
    expect(rowLabels(el)).to.include('Piano');

    key(trigger(el), 'ArrowLeft');
    await el.updateComplete;
    expect(rowLabels(el)).to.not.include('Piano');
    expect(rowByLabel(el, 'Keys').getAttribute('aria-expanded')).to.equal('false');
  });

  it('Enter on a group header toggles it without selecting or closing', async () => {
    const el = await mountTreeSelect();
    trigger(el).focus();
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    await tick();
    await el.updateComplete;

    let fired = false;
    el.addEventListener('arc-change', () => { fired = true; });
    key(trigger(el), 'Enter');
    await el.updateComplete;

    expect(fired).to.equal(false);
    expect(el.open).to.equal(true);
    expect(rowLabels(el)).to.include('Piano');
  });

  it('typeahead jumps to the row starting with the typed letter', async () => {
    const el = await mountTreeSelect();
    el.open = true;
    await el.updateComplete;

    key(trigger(el), 'p');
    await el.updateComplete;
    const active = el.shadowRoot.querySelector('.tree-select__row--active');
    expect(active.querySelector('.tree-select__row-label').textContent.trim()).to.equal('Percussion');
  });
});

describe('arc-tree-select: disabled nodes', () => {
  afterEach(cleanup);

  it('renders disabled leaves but keyboard navigation skips them', async () => {
    const el = await mountTreeSelect();
    el.expandedValues = ['keys'];
    el.open = true;
    await el.updateComplete;

    expect(rowLabels(el), 'disabled row still renders').to.include('Rhodes');
    expect(rowByLabel(el, 'Rhodes').getAttribute('aria-disabled')).to.equal('true');

    // Nav order with Keys expanded: Keys, Piano, Strings, ... — Rhodes absent.
    const navLabels = Array.from(
      { length: el._navRows.length },
      (_, i) => el._navRows[i].node.label
    );
    expect(navLabels).to.not.include('Rhodes');
  });

  it('clicking a disabled leaf does nothing', async () => {
    const el = await mountTreeSelect();
    el.expandedValues = ['keys'];
    el.open = true;
    await el.updateComplete;

    let fired = false;
    el.addEventListener('arc-change', () => { fired = true; });
    rowByLabel(el, 'Rhodes').click();
    await el.updateComplete;

    expect(fired).to.equal(false);
    expect(el.value).to.equal('');
    expect(el.open).to.equal(true);
  });
});

describe('arc-tree-select: breadcrumb trigger label', () => {
  afterEach(cleanup);

  it('shows the ancestor path muted before the leaf label', async () => {
    const el = await mountTreeSelect();
    el.value = 'violin';
    await el.updateComplete;

    const valueEl = el.shadowRoot.querySelector('.tree-select__value');
    expect(valueEl.textContent.replace(/\s+/g, ' ').trim()).to.equal('Strings / Violin');
    const crumbs = valueEl.querySelector('.tree-select__crumbs');
    expect(crumbs.textContent).to.contain('Strings');
    expect(crumbs.textContent, 'leaf label is outside the crumbs').to.not.contain('Violin');
  });

  it('shows the placeholder while nothing is selected', async () => {
    const el = await mountTreeSelect('placeholder="Pick an instrument..."');
    const ph = el.shadowRoot.querySelector('.tree-select__placeholder');
    expect(ph.textContent.trim()).to.equal('Pick an instrument...');
  });
});

describe('arc-tree-select: form participation', () => {
  afterEach(cleanup);

  it('submits the selected leaf value under its name', async () => {
    const form = mount('<form><arc-tree-select name="instrument" label="Instrument"></arc-tree-select></form>');
    const el = form.querySelector('arc-tree-select');
    el.items = sampleItems();
    await el.updateComplete;

    el.value = 'timpani';
    await el.updateComplete;
    expect(new FormData(form).get('instrument')).to.equal('timpani');
  });

  it('required with no selection is invalid, and selecting fixes it', async () => {
    const form = mount('<form><arc-tree-select name="instrument" label="Instrument" required></arc-tree-select></form>');
    const el = form.querySelector('arc-tree-select');
    el.items = sampleItems();
    await el.updateComplete;

    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);

    el.value = 'piano';
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(true);
  });

  it('form.reset() restores the initial value', async () => {
    const form = mount('<form><arc-tree-select name="instrument" label="Instrument"></arc-tree-select></form>');
    const el = form.querySelector('arc-tree-select');
    el.items = sampleItems();
    await el.updateComplete;

    el.value = 'cello';
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('');
    // The mixin resubmits the restored value; empty means no leaf chosen.
    expect(new FormData(form).get('instrument')).to.be.oneOf([null, '']);
  });
});
