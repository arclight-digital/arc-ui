/**
 * arc-dropdown-menu: the trigger's width, group labels, disabled items, and the
 * `index` it reports.
 *
 * Reported against 4.3.0 by the same application as #100–#113 (test-findings
 * #114, #115, #117). The disabled finding was reported as styling only.
 * Reading the component showed it was behaviour too: `disabled` was read
 * nowhere, so a disabled item could be clicked, reached by keyboard and
 * selected.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, pressKey, nextFrame, record } from './helpers.js';

import '../src/feedback/dropdown-menu.register.js';
import '../src/feedback/context-menu.register.js';
import '../src/shared/menu-item.register.js';
import '../src/shared/menu-divider.register.js';
import '../src/shared/menu-label.register.js';

afterEach(cleanup);

async function menu(items, attrs = '', trigger = '<button slot="trigger">Open</button>') {
  const el = mount(`<arc-dropdown-menu ${attrs}>${trigger}${items}</arc-dropdown-menu>`);
  await settle(el);
  return el;
}

async function open(el) {
  el.open = true;
  await settle(el);
  await nextFrame(); // the keyboard controller attaches a frame after opening
}

const rendered = (el) => [...el.shadowRoot.querySelectorAll('[role="menuitem"]')];
const byText = (el, text) => rendered(el).find((b) => b.textContent.includes(text));

describe('arc-dropdown-menu trigger width', () => {
  it('shrinks to its content by default', async () => {
    const el = await menu('<arc-menu-item>A</arc-menu-item>', '', '<span slot="trigger">Open</span>');
    const trigger = el.shadowRoot.querySelector('[part~="trigger"]');
    const content = el.querySelector('[slot="trigger"]');
    expect(trigger.getBoundingClientRect().width).to.be.closeTo(content.getBoundingClientRect().width, 1);
  });

  it('fills a host given a width', async () => {
    const el = await menu('<arc-menu-item>A</arc-menu-item>', 'style="display: block; width: 300px"', '<span slot="trigger">Open</span>');
    const trigger = el.shadowRoot.querySelector('[part~="trigger"]');
    expect(trigger.getBoundingClientRect().width).to.equal(300);
  });
});

describe('arc-dropdown-menu disabled items', () => {
  const ITEMS = `
    <arc-menu-item value="a">Alpha</arc-menu-item>
    <arc-menu-item value="b" disabled>Beta</arc-menu-item>
    <arc-menu-item value="c">Gamma</arc-menu-item>`;

  it('draws them muted, with a default cursor', async () => {
    const el = await menu(ITEMS);
    await open(el);
    const beta = getComputedStyle(byText(el, 'Beta'));
    const alpha = getComputedStyle(byText(el, 'Alpha'));
    expect(beta.opacity).to.equal('0.5');
    expect(beta.cursor).to.equal('default');
    expect(alpha.cursor).to.equal('pointer');
  });

  it('marks them disabled for assistive tech', async () => {
    const el = await menu(ITEMS);
    await open(el);
    expect(byText(el, 'Beta').getAttribute('aria-disabled')).to.equal('true');
    expect(byText(el, 'Beta').disabled).to.equal(true);
  });

  it('never selects one on click', async () => {
    const el = await menu(ITEMS);
    await open(el);
    const events = record(el, ['arc-select'], { whole: true });
    byText(el, 'Beta').click();
    await settle(el);
    expect(events).to.have.length(0);
    expect(el.open, 'and the menu stays open').to.equal(true);
  });

  it('skips them from the keyboard', async () => {
    const el = await menu(ITEMS);
    await open(el);
    const events = record(el, ['arc-select'], { whole: true });
    pressKey('ArrowDown'); // Alpha
    pressKey('ArrowDown'); // Gamma, not Beta
    pressKey('Enter');
    await settle(el);
    expect(events.map(([, d]) => d.value)).to.deep.equal(['c']);
  });
});

describe('arc-dropdown-menu group labels', () => {
  const ITEMS = `
    <arc-menu-label>Physics</arc-menu-label>
    <arc-menu-item value="p1">Kinematics</arc-menu-item>
    <arc-menu-item value="p2">Optics</arc-menu-item>
    <arc-menu-label label="Chemistry"></arc-menu-label>
    <arc-menu-item value="c1">Bonds</arc-menu-item>`;

  it('wraps each label\'s items in a named group', async () => {
    const el = await menu(ITEMS);
    await open(el);
    const groups = [...el.shadowRoot.querySelectorAll('[role="group"]')];
    expect(groups.map((g) => g.getAttribute('aria-label'))).to.deep.equal(['Physics', 'Chemistry']);
    expect([...groups[0].querySelectorAll('[role="menuitem"]')].map((b) => b.textContent.trim()))
      .to.deep.equal(['Kinematics', 'Optics']);
  });

  it('draws the heading, but not as an item', async () => {
    const el = await menu(ITEMS);
    await open(el);
    const headings = [...el.shadowRoot.querySelectorAll('[part~="label"]')];
    expect(headings.map((h) => h.textContent.trim())).to.deep.equal(['Physics', 'Chemistry']);
    expect(rendered(el)).to.have.length(3);
    expect(headings[0].getAttribute('aria-hidden'), 'the group name already says it').to.equal('true');
  });

  it('keeps the keyboard on items, across groups', async () => {
    const el = await menu(ITEMS);
    await open(el);
    const events = record(el, ['arc-select'], { whole: true });
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    pressKey('Enter');
    await settle(el);
    expect(events.map(([, d]) => d.value)).to.deep.equal(['c1']);
  });

  it('redraws when a label changes', async () => {
    const el = await menu(ITEMS);
    await open(el);
    el.querySelector('arc-menu-label[label]').label = 'Biology';
    await settle(el);
    expect(el.shadowRoot.querySelectorAll('[role="group"]')[1].getAttribute('aria-label')).to.equal('Biology');
  });
});

describe('arc-dropdown-menu arc-select index', () => {
  it('is the same for a click and for the keyboard', async () => {
    const items = `
      <arc-menu-item>One</arc-menu-item>
      <arc-menu-divider></arc-menu-divider>
      <arc-menu-item>Two</arc-menu-item>`;
    const el = await menu(items);
    await open(el);
    const clicks = record(el, ['arc-select'], { whole: true });
    byText(el, 'Two').click();
    await settle(el);

    await open(el);
    const keys = record(el, ['arc-select'], { whole: true });
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    pressKey('Enter');
    await settle(el);

    expect(clicks[0][1].index).to.equal(2);
    expect(keys[0][1].index, 'the child position, as arc-context-menu reports it').to.equal(2);
  });
});

describe('arc-context-menu group labels', () => {
  it('names its groups the same way', async () => {
    const host = mount(`<div id="t">Target<arc-context-menu>
      <arc-menu-label>Edit</arc-menu-label>
      <arc-menu-item>Cut</arc-menu-item>
      <arc-menu-item>Copy</arc-menu-item>
    </arc-context-menu></div>`);
    const el = host.querySelector('arc-context-menu');
    await settle(el);
    host.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }));
    await settle(el);
    const group = el.shadowRoot.querySelector('[role="group"]');
    expect(group.getAttribute('aria-label')).to.equal('Edit');
    expect(group.querySelectorAll('[role="menuitem"]')).to.have.length(2);
  });
});
