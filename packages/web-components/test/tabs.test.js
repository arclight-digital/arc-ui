/**
 * arc-tabs / arc-tab — the tabbed-panel pair.
 *
 * What this pins: the tab bar is built from arc-tab children and nothing else,
 * `selected` drives both the visible panel and the ARIA state, the roving
 * tabindex leaves exactly one tab stop, the arrow keys follow `orientation`
 * and wrap, and arc-change carries the index on detail.value per the v3
 * contract — but only for user activation, not for a programmatic set.
 *
 * No BUG pins remain here. Four were: `selected` clamping (#1) and the
 * `orientation` leak into ARIA (#3) fell to the declared-props vocabulary in
 * shared/props.js; the dangling `aria-controls` (#2) and arc-tab's undelivered
 * per-tab `disabled` (#4) are fixed below, each with the pin inverted into a
 * regression test. See test-findings.md.
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

  // Was a BUG pin: every tab rendered aria-controls="panel-${i}" against a
  // single panel whose id was panel-${selected}, so two of the three references
  // were dangling and "move to controlled element" did nothing from them.
  // Fixed by giving the one panel one stable id — finding #2.
  it('points every tab at the panel it actually controls', async () => {
    const el = await tabs();
    const targets = buttons(el).map((b) => b.getAttribute('aria-controls'));

    const resolves = targets.map((id) => el.shadowRoot.getElementById(id));
    expect(resolves.every((node) => node !== null), 'no dangling IDREF').to.equal(true);
    expect(new Set(resolves).size, 'and they all name the one panel').to.equal(1);
    expect(resolves[0]).to.equal(panel(el));
  });

  it('keeps the reference live across a selection change', async () => {
    const el = await tabs();
    el.selected = 2;
    await settle(el);
    const targets = buttons(el).map((b) => b.getAttribute('aria-controls'));
    expect(targets.every((id) => el.shadowRoot.getElementById(id) === panel(el))).to.equal(true);
  });
});

/**
 * arc-tab's own docs promised per-tab disabling ("such as disabling a specific
 * tab") against a component that declared nothing but `label` — finding #4.
 * These are the regression tests for the property that claim now has.
 */
describe('arc-tabs disabled tabs', () => {
  const DISABLED = `
    <arc-tab label="First">One</arc-tab>
    <arc-tab label="Second" disabled>Two</arc-tab>
    <arc-tab label="Third">Three</arc-tab>
  `;

  it('marks the disabled tab button disabled', async () => {
    const el = await tabs('', DISABLED);
    expect(buttons(el).map((b) => b.disabled)).to.deep.equal([false, true, false]);
  });

  it('refuses a click on a disabled tab, silently', async () => {
    const el = await tabs('', DISABLED);
    const seen = record(el, ['arc-change']);

    buttons(el)[1].click();
    await settle(el);

    expect(el.selected, 'the selection does not move').to.equal(0);
    expect(seen, 'and no change is announced').to.deep.equal([]);
  });

  it('refuses a programmatic _select of a disabled tab', async () => {
    const el = await tabs('', DISABLED);
    el._select(1);
    await settle(el);
    expect(el.selected).to.equal(0);
  });

  it('steps over a disabled tab with the arrows, in both directions', async () => {
    const el = await tabs('', DISABLED);

    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);
    expect(el.selected, 'skips index 1').to.equal(2);

    keyOn(buttons(el)[2], 'ArrowLeft');
    await settle(el);
    expect(el.selected, 'and skips it going back too').to.equal(0);
  });

  it('lands Home and End on the nearest selectable tab', async () => {
    const el = await tabs('', `
      <arc-tab label="First" disabled>One</arc-tab>
      <arc-tab label="Second">Two</arc-tab>
      <arc-tab label="Third" disabled>Three</arc-tab>
    `);

    keyOn(buttons(el)[1], 'End');
    await settle(el);
    expect(el.selected, 'End skips the disabled last tab').to.equal(1);

    keyOn(buttons(el)[1], 'Home');
    await settle(el);
    expect(el.selected, 'Home skips the disabled first tab').to.equal(1);
  });

  it('does not spin or move when every tab is disabled', async () => {
    const el = await tabs('', `
      <arc-tab label="First" disabled>One</arc-tab>
      <arc-tab label="Second" disabled>Two</arc-tab>
    `);
    const seen = record(el, ['arc-change']);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    buttons(el)[0].dispatchEvent(event);
    await settle(el);

    expect(el.selected).to.equal(0);
    expect(seen).to.deep.equal([]);
    expect(event.defaultPrevented, 'the key is still ours — the page must not scroll').to.equal(true);
  });

  it('re-renders the bar when a tab is disabled after mount', async () => {
    const el = await tabs();
    el.querySelectorAll('arc-tab')[1].disabled = true;
    await settle(el);

    expect(buttons(el)[1].disabled, 'the group reads its children at render time').to.equal(true);
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

/**
 * The indicator — the one element that carries the selection in every variant
 * and orientation, positioned from the selected button's own box.
 *
 * Worth pinning as behaviour rather than as looks: the bar hands it four
 * measurements, and every failure mode here is a measurement that never
 * happened. It marked the wrong tab, it marked a tab that no longer exists, or
 * — the one that shipped in 4.1.0's predecessor of this component — it marked
 * a tab the visitor could not see, because a bar that opens on a tab outside
 * its own scrollport never scrolled to it.
 */
describe('arc-tabs indicator', () => {
  const indicator = (el) => el.shadowRoot.querySelector('.tabs__ind');
  const box = (el) => {
    const style = indicator(el).style;
    return {
      x: style.getPropertyValue('--_ind-x'),
      y: style.getPropertyValue('--_ind-y'),
      w: style.getPropertyValue('--_ind-w'),
      h: style.getPropertyValue('--_ind-h'),
    };
  };

  it('takes the selected button\'s box', async () => {
    const el = await tabs();
    const button = buttons(el)[0];
    expect(box(el)).to.deep.equal({
      x: `${button.offsetLeft}px`,
      y: `${button.offsetTop}px`,
      w: `${button.offsetWidth}px`,
      h: `${button.offsetHeight}px`,
    });
  });

  it('moves to the tab that was selected', async () => {
    const el = await tabs();
    const before = box(el);

    buttons(el)[2].click();
    await settle(el);

    expect(box(el).x, 'the indicator travelled').to.not.equal(before.x);
    expect(box(el).x).to.equal(`${buttons(el)[2].offsetLeft}px`);
  });

  it('is hidden while the bar holds no tabs', async () => {
    const el = await tabs('', '');
    expect(indicator(el).classList.contains('is-on')).to.be.false;
  });

  /**
   * `selected` is an index, not a tab, so inserting ahead of it hands the
   * selection to a different tab in a bar whose every button has also moved.
   * The indicator has to end up on the box that index now names — measuring
   * only on selection would leave it on neither.
   */
  it('re-measures when a tab is added ahead of the selection', async () => {
    const el = await tabs('selected="2"');
    const before = box(el).x;

    el.insertBefore(
      Object.assign(document.createElement('arc-tab'), { label: 'Zeroth' }),
      el.firstChild,
    );
    await settle(el);

    expect(labels(el)[2], 'the index now names the tab before the one it did')
      .to.equal('Second');
    expect(box(el).x, 'and the indicator moved with it').to.not.equal(before);
    expect(box(el).x).to.equal(`${buttons(el)[2].offsetLeft}px`);
  });

  /**
   * The scroll is the bar's own. `scrollIntoView` would walk up through every
   * ancestor scroller and drag the page to the bar on load, which is why this
   * pins the page having stayed put as well as the bar having moved.
   */
  it('scrolls a selection outside the scrollport into the bar, and not the page', async () => {
    const many = Array.from(
      { length: 12 },
      (_, i) => `<arc-tab label="Section number ${i}">Panel ${i}</arc-tab>`,
    ).join('');

    const pageScroll = document.scrollingElement.scrollTop;
    const el = await tabs('selected="11" style="max-width:240px"', many);
    const list = el.shadowRoot.querySelector('.tabs__list');

    expect(list.scrollWidth, 'the bar has to overflow for this to mean anything')
      .to.be.greaterThan(list.clientWidth);
    expect(list.scrollLeft, 'the bar scrolled to its selection').to.be.greaterThan(0);
    expect(document.scrollingElement.scrollTop, 'the page did not move')
      .to.equal(pageScroll);
  });
});
