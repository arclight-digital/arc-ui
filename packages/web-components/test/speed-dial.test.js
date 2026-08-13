/**
 * arc-speed-dial — the fan-out action button.
 *
 * What this pins: `items` drives the action buttons, the trigger toggles open
 * and closed, the v3 close contract holds (a cancelable arc-close fires before
 * the state flips, and a veto keeps it open) on both the trigger and the action
 * paths, and arc-action reports which item was chosen.
 *
 * Two tests are marked BUG. The closed state is a pure opacity fade, so the
 * actions stay in the tab order and stay clickable while invisible; and the
 * `value` documented on each item is never emitted. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, record } from './helpers.js';

import '../src/navigation/speed-dial.register.js';

afterEach(() => cleanup());

const ITEMS = [
  { icon: 'plus', label: 'New file', value: 'new' },
  { icon: 'pencil', label: 'Edit', value: 'edit' },
  { icon: 'trash', label: 'Delete', value: 'delete' },
];

async function dial(attrs = '', items = ITEMS) {
  const el = mount(`<arc-speed-dial ${attrs}></arc-speed-dial>`);
  el.items = items;
  await settle(el);
  return el;
}

const actions = (el) => [...el.shadowRoot.querySelectorAll('[part="action"]')];
const trigger = (el) => el.shadowRoot.querySelector('[part="trigger"]');

describe('arc-speed-dial rendering', () => {
  it('renders one button per item', async () => {
    const el = await dial();
    expect(actions(el)).to.have.lengthOf(3);
  });

  it('names each action from its label', async () => {
    const el = await dial();
    expect(actions(el).map((b) => b.getAttribute('aria-label')))
      .to.deep.equal(['New file', 'Edit', 'Delete']);
  });

  it('gives each action a title tooltip as well as a name', async () => {
    const el = await dial();
    expect(actions(el)[0].getAttribute('title')).to.equal('New file');
  });

  it('passes the icon name through to arc-icon', async () => {
    const el = await dial();
    expect(actions(el)[0].querySelector('arc-icon').getAttribute('name')).to.equal('plus');
  });

  it('exposes the documented css parts', async () => {
    const el = await dial();
    for (const part of ['base', 'actions', 'action', 'trigger']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('renders a default trigger that is itself keyboard-operable', async () => {
    const el = await dial();
    const fallback = trigger(el).querySelector('slot[name="trigger"]');
    expect(fallback, 'a trigger slot with a default').to.not.equal(null);
    // The default is an arc-icon-button — a real button, so Enter and Space
    // activate it and its click bubbles to the trigger wrapper's handler.
    expect(el.shadowRoot.querySelector('arc-icon-button')).to.not.equal(null);
  });

  it('renders nothing but the trigger with no items', async () => {
    const el = await dial('', []);
    expect(actions(el)).to.have.lengthOf(0);
    expect(trigger(el)).to.not.equal(null);
  });

  it('survives never being handed items at all', async () => {
    const el = mount('<arc-speed-dial></arc-speed-dial>');
    await settle(el);
    expect(actions(el)).to.have.lengthOf(0);
  });
});

describe('arc-speed-dial opening and closing', () => {
  it('starts closed and opens on the trigger', async () => {
    const el = await dial();
    expect(el.open).to.equal(false);

    trigger(el).click();
    await settle(el);
    expect(el.open).to.equal(true);
    expect(el.hasAttribute('open'), 'reflects for the CSS').to.equal(true);
  });

  it('fires arc-open when it expands', async () => {
    const el = await dial();
    let event = null;
    document.body.addEventListener('arc-open', (e) => { event = e; }, { once: true });

    trigger(el).click();
    await settle(el);

    expect(event, 'bubbles and is composed').to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('closes on a second trigger click', async () => {
    const el = await dial('open');
    trigger(el).click();
    await settle(el);
    expect(el.open).to.equal(false);
  });

  it('fires arc-close before the state flips', async () => {
    const el = await dial('open');
    let openDuringEvent = null;
    el.addEventListener('arc-close', () => { openDuringEvent = el.open; }, { once: true });

    trigger(el).click();
    await settle(el);

    expect(openDuringEvent, 'a listener must observe the still-open state').to.equal(true);
    expect(el.open).to.equal(false);
  });

  it('preventDefault() on arc-close vetoes the close', async () => {
    const el = await dial('open');
    el.addEventListener('arc-close', (e) => e.preventDefault(), { once: true });

    trigger(el).click();
    await settle(el);
    expect(el.open, 'a vetoed close must leave it open').to.equal(true);

    trigger(el).click();
    await settle(el);
    expect(el.open, 'and the next close must work').to.equal(false);
  });

  it('does not fire arc-close when it opens', async () => {
    const el = await dial();
    const seen = record(el, ['arc-open', 'arc-close']);

    trigger(el).click();
    await settle(el);

    expect(seen.map(([k]) => k)).to.deep.equal(['open']);
  });
});

describe('arc-speed-dial actions', () => {
  it('reports which action was chosen and then closes', async () => {
    const el = await dial('open');
    const details = [];
    el.addEventListener('arc-action', (e) => details.push(e.detail));

    actions(el)[1].click();
    await settle(el);

    expect(details).to.deep.equal([{ index: 1 }]);
    expect(el.open, 'choosing an action dismisses the dial').to.equal(false);
  });

  it('fires arc-action before arc-close', async () => {
    const el = await dial('open');
    const seen = record(el, ['arc-action', 'arc-close']);

    actions(el)[0].click();
    await settle(el);

    expect(seen.map(([k]) => k)).to.deep.equal(['action', 'close']);
  });

  it('a vetoed close leaves the dial open after an action', async () => {
    const el = await dial('open');
    el.addEventListener('arc-close', (e) => e.preventDefault(), { once: true });
    const details = [];
    el.addEventListener('arc-action', (e) => details.push(e.detail));

    actions(el)[2].click();
    await settle(el);

    expect(details, 'the action is still reported').to.deep.equal([{ index: 2 }]);
    expect(el.open, 'but the dial stays open').to.equal(true);
  });

  // BUG: the items contract (speed-dial.js:14) is
  // `Array<{icon: string, label: string, value?: string}>`, but nothing ever
  // reads `value` — render uses only `icon` and `label`, and _onAction
  // (speed-dial.js:174) emits `{ index }` alone. A consumer who sets the
  // documented `value` on each item cannot get it back out; they have to keep
  // their own array and index into it.
  it('BUG: the documented per-item value is never emitted', async () => {
    const el = await dial('open');
    const details = [];
    el.addEventListener('arc-action', (e) => details.push(e.detail));

    actions(el)[0].click();
    await settle(el);

    expect(details[0], 'value is documented on the item but not carried').to.deep.equal({ index: 0 });
    expect(details[0].value, 'and detail.value is absent entirely').to.equal(undefined);
  });
});

describe('arc-speed-dial closed-state reachability', () => {
  // BUG: the closed state is opacity 0 plus a transform (speed-dial.js:109),
  // with no visibility, pointer-events, inert or aria-hidden. The action
  // buttons therefore stay in the tab order and stay clickable while invisible:
  // a keyboard user tabbing past a closed dial lands on N buttons they cannot
  // see, and an invisible button sits over whatever is beneath it.
  it('BUG: the actions are invisible but still focusable while closed', async () => {
    const el = await dial();
    expect(el.open).to.equal(false);

    const first = actions(el)[0];
    expect(getComputedStyle(first).opacity, 'visually hidden').to.equal('0');
    expect(getComputedStyle(first).visibility, 'but not hidden from layout').to.equal('visible');
    expect(getComputedStyle(first).pointerEvents).to.not.equal('none');
    expect(first.hasAttribute('disabled'), 'and not disabled').to.equal(false);

    first.focus();
    expect(el.shadowRoot.activeElement, 'an invisible button took focus').to.equal(first);
  });

  it('BUG: a closed action still fires arc-action when clicked', async () => {
    const el = await dial();
    const details = [];
    el.addEventListener('arc-action', (e) => details.push(e.detail));

    actions(el)[1].click();
    await settle(el);

    expect(details, 'an invisible control was activated').to.deep.equal([{ index: 1 }]);
  });

  it('becomes fully opaque once open', async () => {
    const el = await dial('open');
    expect(getComputedStyle(actions(el)[0]).opacity).to.equal('1');
  });
});

describe('arc-speed-dial layout enums', () => {
  const actionsBox = (el) => getComputedStyle(el.shadowRoot.querySelector('[part="actions"]'));

  it('fans out upward by default', async () => {
    const el = await dial();
    expect(el.direction).to.equal('up');
    expect(actionsBox(el).flexDirection).to.equal('column-reverse');
  });

  it('each direction picks its own axis', async () => {
    // The actions container precedes the trigger in DOM order, so `row` lays
    // the actions out before it — i.e. to its left — and `row-reverse` after.
    expect(actionsBox(await dial('direction="down"')).flexDirection).to.equal('column');
    expect(actionsBox(await dial('direction="left"')).flexDirection).to.equal('row');
    expect(actionsBox(await dial('direction="right"')).flexDirection).to.equal('row-reverse');
  });

  it('an unrecognised direction falls back to the default axis', async () => {
    const unknown = await dial('direction="sideways"');
    const def = await dial();
    expect(actionsBox(unknown).flexDirection).to.equal(actionsBox(def).flexDirection);
    // Guard: the property must actually be driven by the attribute.
    const down = await dial('direction="down"');
    expect(actionsBox(down).flexDirection).to.not.equal(actionsBox(def).flexDirection);
  });

  // BUG: both corner rules are exact-match selectors —
  // `:host([position="bottom-right"])` and `:host([position="bottom-left"])`
  // (speed-dial.js:58, 63). An unrecognised value matches neither, so
  // `.speed-dial` keeps `position: absolute` with no offsets at all and lands
  // wherever static flow puts it instead of in a corner. This is the failure
  // mode scripts/checks/enum-fallbacks.js exists for, in its exact-match rather
  // than its absence form; arc-speed-dial is also absent from the CASES table
  // in enum-fallback-sweep.test.js.
  // Was pinned as a BUG. Fixed by declaring `position` as oneOf(): the value is
  // normalised before it reaches the exact-match CSS selectors, so an
  // unrecognised corner lands on the default rather than nowhere — finding #17.
  it('anchors an unrecognised position to the default corner', async () => {
    const box = (el) => getComputedStyle(el.shadowRoot.querySelector('.speed-dial'));

    const right = await dial('position="bottom-right"');
    const left = await dial('position="bottom-left"');
    expect(box(left).bottom, 'both corners share the offset token').to.equal(box(right).bottom);

    const unknown = await dial('position="top-left"');
    expect(unknown.position, 'normalised to the default').to.equal('bottom-right');
    expect(box(unknown).bottom, 'and is anchored like it').to.equal(box(right).bottom);
  });
});
