/**
 * arc-tabs / arc-tab — the tabbed-panel pair.
 *
 * What this pins: the tab bar is built from arc-tab children and nothing else,
 * `selected` drives both the visible panel and the ARIA state, the roving
 * tabindex leaves exactly one tab stop, the arrow keys follow `orientation`
 * and wrap, and arc-change carries the index on detail.value per the v3
 * contract — but only for user activation, not for a programmatic set.
 *
 * One test below is marked BUG: it asserts what the component does today, which
 * is not what its own documentation promises. See test-findings.md. Two others
 * were BUG pins until `selected` and `orientation` adopted the declared-props
 * vocabulary in shared/props.js, which fixed findings #1 and #3 outright.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, deepActive, record } from './helpers.js';

import '../src/navigation/tabs.register.js';

afterEach(() => cleanup());

const TABS = `
  <arc-tab label="First">One</arc-tab>
  <arc-tab label="Second">Two</arc-tab>
  <arc-tab label="Third">Three</arc-tab>
`;

/** Mount a tab group and settle the slotchange that builds the bar. */
async function tabs(attrs = '', children = TABS) {
  const el = mount(`<arc-tabs ${attrs}>${children}</arc-tabs>`);
  await settle(el);
  return el;
}

const buttons = (el) => [...el.shadowRoot.querySelectorAll('.tabs__tab')];
const labels = (el) => buttons(el).map((b) => b.textContent.trim());
const panel = (el) => el.shadowRoot.querySelector('.tabs__panel');
/**
 * The arc-tab children that are actually showing.
 *
 * Read off computed display rather than the `hidden` property: the component
 * sets `hidden`, but it is arc-tab's own `:host([hidden]) { display: none }`
 * that makes it mean anything, and a panel switch that sets the property
 * without hiding the content is the failure worth catching.
 */
const visible = (el) =>
  [...el.querySelectorAll('arc-tab')].filter((t) => getComputedStyle(t).display !== 'none');

describe('arc-tabs rendering', () => {
  it('renders one tab button per arc-tab child, labelled from the child', async () => {
    const el = await tabs();
    expect(labels(el)).to.deep.equal(['First', 'Second', 'Third']);
  });

  it('builds the bar from arc-tab children only', async () => {
    const el = await tabs('', `
      <p>not a tab</p>
      <arc-tab label="Real">content</arc-tab>
      <div label="Impostor"></div>
    `);
    expect(labels(el)).to.deep.equal(['Real']);
  });

  it('shows only the selected panel content', async () => {
    const el = await tabs();
    expect(visible(el).map((t) => t.label)).to.deep.equal(['First']);
    expect(visible(el)[0].textContent.trim()).to.equal('One');

    // All three are assigned to the one panel slot — the panel does not swap
    // its content, it relies on the others being hidden.
    const assigned = panel(el).querySelector('slot').assignedElements();
    expect(assigned).to.have.lengthOf(3);
  });

  it('renders an empty bar rather than throwing with no children', async () => {
    const el = await tabs('', '');
    expect(buttons(el)).to.have.lengthOf(0);
    expect(panel(el), 'the panel still renders').to.not.equal(null);
  });
});

describe('arc-tabs selected', () => {
  it('defaults to the first tab', async () => {
    const el = await tabs();
    expect(el.selected).to.equal(0);
    expect(buttons(el).map((b) => b.getAttribute('aria-selected')))
      .to.deep.equal(['true', 'false', 'false']);
  });

  it('honours a selected set in markup', async () => {
    const el = await tabs('selected="2"');
    expect(visible(el).map((t) => t.label)).to.deep.equal(['Third']);
    expect(buttons(el)[2].getAttribute('aria-selected')).to.equal('true');
  });

  it('switches the visible panel when set from script', async () => {
    const el = await tabs();
    el.selected = 1;
    await settle(el);
    expect(visible(el).map((t) => t.label)).to.deep.equal(['Second']);
    expect(visible(el)[0].textContent.trim()).to.equal('Two');
  });

  // Was pinned as a BUG. Fixed by declaring `selected` as
  // int({ clamp: 'toRange' }) — see shared/props.js and finding #1.
  it('clamps an out-of-range selected to the last tab', async () => {
    const el = await tabs('selected="7"');
    expect(el.selected, 'clamped to the last index').to.equal(2);
    expect(visible(el)).to.have.lengthOf(1);
    // Read the visible arc-tab, not `.tabs__panel` — that is a shadow node
    // wrapping a <slot>, so its textContent is always '' and an assertion
    // against it cannot fail. The pin this replaced asserted exactly that.
    expect(visible(el)[0].textContent.trim()).to.equal('Three');
  });

  it('clamps a negative selected to the first tab', async () => {
    const el = await tabs('selected="-1"');
    expect(el.selected).to.equal(0);
    expect(visible(el)).to.have.lengthOf(1);
  });
});

describe('arc-tabs ARIA', () => {
  it('exposes a tablist whose orientation follows the prop', async () => {
    const el = await tabs();
    const list = el.shadowRoot.querySelector('.tabs__list');
    expect(list.getAttribute('role')).to.equal('tablist');
    expect(list.getAttribute('aria-orientation')).to.equal('horizontal');

    const vertical = await tabs('orientation="vertical"');
    expect(vertical.shadowRoot.querySelector('.tabs__list').getAttribute('aria-orientation'))
      .to.equal('vertical');
  });

  it('marks every button role=tab and the panel role=tabpanel', async () => {
    const el = await tabs();
    expect(buttons(el).map((b) => b.getAttribute('role'))).to.deep.equal(['tab', 'tab', 'tab']);
    expect(panel(el).getAttribute('role')).to.equal('tabpanel');
  });

  it('leaves exactly one tab stop, on the selected tab', async () => {
    const el = await tabs('selected="1"');
    expect(buttons(el).map((b) => b.getAttribute('tabindex'))).to.deep.equal(['-1', '0', '-1']);
  });

  it('labels the panel with the selected tab', async () => {
    const el = await tabs('selected="1"');
    expect(panel(el).getAttribute('aria-labelledby')).to.equal(buttons(el)[1].id);
  });

  // BUG: every tab renders aria-controls="panel-${i}" (tabs.js:236) but there is
  // only one panel, and its id is panel-${selected} (tabs.js:246). So only the
  // selected tab's aria-controls resolves; the others point at ids that are not
  // in the document, and assistive tech's "move to controlled element" does
  // nothing from them.
  it('BUG: aria-controls on unselected tabs points at an id that does not exist', async () => {
    const el = await tabs();
    const targets = buttons(el).map((b) => b.getAttribute('aria-controls'));
    expect(targets).to.deep.equal(['panel-0', 'panel-1', 'panel-2']);

    const resolves = targets.map((id) => el.shadowRoot.getElementById(id) !== null);
    expect(resolves, 'only the selected tab points at a live panel').to.deep.equal([true, false, false]);
  });
});

describe('arc-tabs keyboard', () => {
  it('walks the bar with the horizontal arrows and selects as it goes', async () => {
    const el = await tabs();

    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);
    expect(el.selected).to.equal(1);
    expect(visible(el).map((t) => t.label)).to.deep.equal(['Second']);

    keyOn(buttons(el)[1], 'ArrowLeft');
    await settle(el);
    expect(el.selected).to.equal(0);
  });

  it('wraps at both ends', async () => {
    const el = await tabs('selected="2"');
    keyOn(buttons(el)[2], 'ArrowRight');
    await settle(el);
    expect(el.selected, 'last → first').to.equal(0);

    keyOn(buttons(el)[0], 'ArrowLeft');
    await settle(el);
    expect(el.selected, 'first → last').to.equal(2);
  });

  it('Home and End jump to the ends', async () => {
    const el = await tabs('selected="1"');
    keyOn(buttons(el)[1], 'End');
    await settle(el);
    expect(el.selected).to.equal(2);

    keyOn(buttons(el)[2], 'Home');
    await settle(el);
    expect(el.selected).to.equal(0);
  });

  it('moves DOM focus onto the newly selected tab', async () => {
    const el = await tabs();
    buttons(el)[0].focus();
    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);
    expect(deepActive()).to.equal(buttons(el)[1]);
  });

  it('swaps to the block-axis arrows when vertical', async () => {
    const el = await tabs('orientation="vertical"');

    keyOn(buttons(el)[0], 'ArrowDown');
    await settle(el);
    expect(el.selected).to.equal(1);

    keyOn(buttons(el)[1], 'ArrowUp');
    await settle(el);
    expect(el.selected).to.equal(0);

    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);
    expect(el.selected, 'the inline arrows are inert in vertical mode').to.equal(0);
  });

  it('ignores keys it does not handle, and leaves them for the page', async () => {
    const el = await tabs();
    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    buttons(el)[0].dispatchEvent(event);
    await settle(el);

    expect(el.selected).to.equal(0);
    expect(event.defaultPrevented, 'an unrelated key must not be swallowed').to.equal(false);
  });

  it('claims the keys it does handle', async () => {
    const el = await tabs();
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    buttons(el)[0].dispatchEvent(event);
    await settle(el);
    expect(event.defaultPrevented, 'or the tab bar scrolls under the selection').to.equal(true);
  });
});

describe('arc-tabs arc-change', () => {
  it('fires on click with the index on detail.value and the label alongside', async () => {
    const el = await tabs();
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    buttons(el)[2].click();
    await settle(el);

    expect(el.selected).to.equal(2);
    expect(details).to.have.lengthOf(1);
    expect(details[0].value, 'detail.value is canonical').to.equal(2);
    expect(details[0].label).to.equal('Third');
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await tabs();
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    buttons(el)[1].click();
    await settle(el);

    expect(event, 'only a bubbling, composed event reaches the body').to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('stays silent when selected is set from script', async () => {
    const el = await tabs();
    const seen = record(el, ['arc-change']);

    el.selected = 2;
    await settle(el);

    expect(visible(el).map((t) => t.label), 'the panel still switches').to.deep.equal(['Third']);
    expect(seen, 'a programmatic set is not a user change').to.deep.equal([]);
  });

  it('fires on every keyboard move, since activation follows focus', async () => {
    const el = await tabs();
    const seen = record(el, ['arc-change']);

    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);
    keyOn(buttons(el)[1], 'ArrowRight');
    await settle(el);

    expect(seen).to.deep.equal([['change', 1], ['change', 2]]);
  });
});

describe('arc-tabs enum fallbacks', () => {
  it('an unknown variant still paints the default tab treatment', async () => {
    const known = await tabs();
    const unknown = await tabs('variant="neon"');
    const weight = (el) => getComputedStyle(buttons(el)[0]).fontWeight;
    expect(weight(unknown)).to.equal(weight(known));
  });

  it('an unknown align lays out like the default', async () => {
    const known = await tabs();
    const unknown = await tabs('align="sideways"');
    const justify = (el) => getComputedStyle(el.shadowRoot.querySelector('.tabs__list')).justifyContent;
    expect(justify(unknown)).to.equal(justify(known));
    // Guard: the property must actually be driven by the attribute, or the
    // assertion above passes for the wrong reason.
    const end = await tabs('align="end"');
    expect(justify(end), 'align must move justify-content').to.not.equal(justify(known));
  });

  it('an unknown orientation behaves as horizontal', async () => {
    const el = await tabs('orientation="diagonal"');
    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);
    expect(el.selected, 'the inline arrows still drive it').to.equal(1);
  });

  // BUG: aria-orientation is bound straight from the prop (tabs.js:227), so an
  // unrecognised value reaches the accessibility tree verbatim. ARIA defines
  // only "horizontal" and "vertical"; anything else is invalid and the platform
  // falls back to the role default, which no longer matches the key handling.
  // Was pinned as a BUG. Fixed by declaring `orientation` as oneOf(), which
  // normalises on both the attribute and the property path — finding #3. The
  // key-handling fallback asserted above now agrees with the ARIA value.
  it('normalises an unknown orientation to the default before it reaches ARIA', async () => {
    const el = await tabs('orientation="diagonal"');
    expect(el.orientation, 'property normalised').to.equal('horizontal');
    expect(el.shadowRoot.querySelector('.tabs__list').getAttribute('aria-orientation'))
      .to.equal('horizontal');
  });
});
