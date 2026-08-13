/**
 * arc-stepper-nav — the linear gate, the back/next/skip controls, and the
 * completion event.
 *
 * `linear` is the whole reason this component is not a list of buttons: it is
 * documented as "prevents jumping to future steps — the user must complete
 * each step sequentially", and it is enforced in three separate places (the
 * indicator's `disabled`, `_goTo`'s guard, and whether Skip renders at all).
 * Three enforcement points for one rule is exactly the shape that goes out of
 * sync, and none of them was tested.
 *
 * Five steps rather than two or three: with two, "the step after the current
 * one" and "the last step" are the same index, and every off-by-one hides.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, record, only } from './helpers.js';
import '../src/navigation/stepper-nav.register.js';
// arc-button is what the controls actually are; unupgraded it has no
// `disabled` property and every control assertion below reads blank.
import '../src/input/button.register.js';

afterEach(cleanup);

const STEPS = ['Account', 'Profile', 'Billing', 'Review', 'Done'];

async function stepper(attrs = '', steps = STEPS) {
  const el = mount(`<arc-stepper-nav ${attrs}></arc-stepper-nav>`);
  el.steps = steps;
  await settle(el);
  return el;
}

const indicators = (el) => [...el.shadowRoot.querySelectorAll('[part="indicator"]')];
const controls = (el) => [...el.shadowRoot.querySelectorAll('[part="controls"] arc-button')];
const byText = (el, text) =>
  controls(el).find((b) => b.textContent.trim().toLowerCase() === text.toLowerCase());

// ---------------------------------------------------------------------------
// Rendering the track
// ---------------------------------------------------------------------------

describe('arc-stepper-nav: the track', () => {
  it('renders one indicator per step', async () => {
    const el = await stepper();
    expect(indicators(el).length).to.equal(5);
  });

  it('numbers upcoming steps and checks off completed ones', async () => {
    const el = await stepper('active="2"');
    const marks = indicators(el).map((b) => b.textContent.trim());

    expect(marks[0], 'completed steps show a check, not a number').to.equal('');
    expect(marks[1]).to.equal('');
    expect(marks[2], 'the active step shows its own number').to.equal('3');
    expect(marks[3]).to.equal('4');
    expect(marks[4]).to.equal('5');
  });

  it('marks exactly one step as current', async () => {
    const el = await stepper('active="2"');
    const current = indicators(el).filter((b) => b.getAttribute('aria-current') === 'step');

    expect(current.length).to.equal(1);
    expect(current[0].textContent.trim()).to.equal('3');
  });

  it('announces position and completion in the accessible name', async () => {
    // The visible label of a completed step is a checkmark glyph, so the only
    // thing carrying "which step is this, and is it done" is aria-label.
    const el = await stepper('active="2"');
    const labels = indicators(el).map((b) => b.getAttribute('aria-label'));

    expect(labels[0]).to.equal('Step 1: Account (completed)');
    expect(labels[2]).to.equal('Step 3: Billing');
    expect(labels[4]).to.equal('Step 5: Done');
  });

  it('renders one fewer connector than steps', async () => {
    const el = await stepper();
    expect(el.shadowRoot.querySelectorAll('[part="connector"]').length).to.equal(4);
  });

  it('renders nothing for an empty step list', async () => {
    const el = await stepper('', []);
    expect(indicators(el)).to.eql([]);
  });
});

// ---------------------------------------------------------------------------
// The linear gate — three enforcement points, one rule
// ---------------------------------------------------------------------------

describe('arc-stepper-nav: linear', () => {
  it('disables future steps', async () => {
    const el = await stepper('active="2" linear');
    const disabled = indicators(el).map((b) => b.disabled);

    expect(disabled).to.eql([false, false, false, true, true]);
  });

  it('refuses a jump forward even if the button is reached anyway', async () => {
    // The second enforcement point. `disabled` on the indicator is the visible
    // half; _goTo's own guard is what holds when the click arrives another way.
    const el = await stepper('active="1" linear');
    const seen = record(el, ['arc-change']);

    el._goTo(4);
    await settle(el);

    expect(el.active).to.equal(1);
    expect(only(seen, 'change')).to.eql([]);
  });

  it('still allows going back to a completed step', async () => {
    const el = await stepper('active="3" linear');
    const seen = record(el, ['arc-change']);

    indicators(el)[1].click();
    await settle(el);

    expect(el.active).to.equal(1);
    expect(only(seen, 'change')).to.eql([['change', 1]]);
  });

  it('hides Skip entirely', async () => {
    // The third enforcement point: a Skip button under `linear` would be a
    // one-click bypass of the rule the other two enforce.
    const el = await stepper('active="1" linear');
    expect(byText(el, 'Skip')).to.equal(undefined);
  });

  it('leaves every step reachable when not linear', async () => {
    const el = await stepper('active="0"');
    expect(indicators(el).map((b) => b.disabled)).to.eql([false, false, false, false, false]);

    indicators(el)[4].click();
    await settle(el);
    expect(el.active).to.equal(4);
  });
});

// ---------------------------------------------------------------------------
// The controls
// ---------------------------------------------------------------------------

describe('arc-stepper-nav: back, next, skip', () => {
  it('Next advances one step and announces it', async () => {
    const el = await stepper('active="1"');
    const seen = record(el, ['arc-change']);

    byText(el, 'Next').click();
    await settle(el);

    expect(el.active).to.equal(2);
    expect(only(seen, 'change')).to.eql([['change', 2]]);
  });

  it('Back retreats one step', async () => {
    const el = await stepper('active="2"');
    byText(el, 'Back').click();
    await settle(el);

    expect(el.active).to.equal(1);
  });

  it('Back is disabled on the first step', async () => {
    const el = await stepper('active="0"');
    expect(byText(el, 'Back').disabled).to.equal(true);
  });

  it('Next becomes Complete on the last step', async () => {
    const el = await stepper('active="4"');
    expect(byText(el, 'Next'), 'no Next remains').to.equal(undefined);
    expect(byText(el, 'Complete')).to.not.equal(undefined);
  });

  it('Complete fires arc-complete and does not move past the end', async () => {
    const el = await stepper('active="4"');
    let completed = 0;
    el.addEventListener('arc-complete', () => {
      completed += 1;
    });
    const seen = record(el, ['arc-change']);

    byText(el, 'Complete').click();
    await settle(el);

    expect(completed).to.equal(1);
    expect(el.active, 'still the last step').to.equal(4);
    expect(only(seen, 'change'), 'finishing is not a step change').to.eql([]);
  });

  it('Skip advances without visiting the step', async () => {
    const el = await stepper('active="1"');
    byText(el, 'Skip').click();
    await settle(el);

    expect(el.active).to.equal(2);
  });

  it('Skip disappears on the last step', async () => {
    const el = await stepper('active="4"');
    expect(byText(el, 'Skip')).to.equal(undefined);
  });
});

// ---------------------------------------------------------------------------
// The steps attribute
// ---------------------------------------------------------------------------

describe('arc-stepper-nav: the steps attribute', () => {
  it('parses a JSON array from the attribute', async () => {
    const el = mount(`<arc-stepper-nav steps='["One","Two","Three"]'></arc-stepper-nav>`);
    await settle(el);
    expect(indicators(el).length).to.equal(3);
  });

  it('falls back to an empty list on malformed JSON rather than throwing', async () => {
    // The hand-rolled converter's catch. V4-PLAN 2.2 migrates these six onto a
    // shared list() primitive; until then this is the behaviour to preserve.
    const el = mount(`<arc-stepper-nav steps='[not json'></arc-stepper-nav>`);
    await settle(el);

    expect(el.steps).to.eql([]);
    expect(indicators(el)).to.eql([]);
  });

  it('accepts object steps with a label', async () => {
    const el = await stepper('active="0"', [{ label: 'First' }, { label: 'Second' }]);
    expect(indicators(el)[0].getAttribute('aria-label')).to.equal('Step 1: First');
  });

  it('names a step by position when it has no label', async () => {
    const el = await stepper('active="0"', [{}, {}]);
    expect(indicators(el)[0].getAttribute('aria-label')).to.equal('Step 1');
  });
});

// ---------------------------------------------------------------------------
// An out-of-range `active`
// ---------------------------------------------------------------------------

describe('arc-stepper-nav: an out-of-range active', () => {
  // BUG (finding #78): `active` is documented as "zero-based index of the
  // currently active step" and is never bounded — not in the declaration
  // (`{ type: Number }`, no vocabulary), not in `_goTo`, not in the render.
  // Same family as #70 and #76, one step further along: here nothing clamps at
  // all, so the component renders a track with no active step *and* the
  // controls read the out-of-range value.
  it('BUG: an index past the end leaves no step marked current', async () => {
    const el = await stepper('active="99"');
    expect(indicators(el).filter((b) => b.getAttribute('aria-current') === 'step')).to.eql([]);
  });

  it('BUG: every step reads as completed past the end', async () => {
    const el = await stepper('active="99"');
    const labels = indicators(el).map((b) => b.getAttribute('aria-label'));
    expect(labels.every((l) => l.endsWith('(completed)'))).to.equal(true);
  });

  it('BUG: the button reads Next and fires arc-complete', async () => {
    // The two conditions disagree, which is the sharpest form of this bug.
    // The label asks `active === steps.length - 1` (99 === 4, false) so it says
    // **Next**; `_next()` asks `active < steps.length - 1` (99 < 4, false) so
    // it takes the *completion* branch. The user is told there is another step
    // and the form submits.
    const el = await stepper('active="99"');
    let completed = 0;
    el.addEventListener('arc-complete', () => {
      completed += 1;
    });

    const button = byText(el, 'Next');
    expect(button, 'the control still offers a next step').to.not.equal(undefined);

    button.click();
    await settle(el);
    expect(completed, 'and finishes the wizard instead').to.equal(1);
  });

  it('BUG: a negative index leaves Back enabled but inert', async () => {
    // `_back()` guards on `active > 0`, so it correctly refuses to walk further
    // below zero — but the button's own `?disabled=${active === 0}` only knows
    // about exactly zero, so it renders as available. A control that looks
    // usable and does nothing is the part worth pinning; the guard behind it
    // is doing its job.
    const el = await stepper('active="-3"');
    const back = byText(el, 'Back');
    expect(back.disabled, 'Back looks available below zero').to.equal(false);

    back.click();
    await settle(el);
    expect(el.active, 'and correctly refuses to move').to.equal(-3);
  });
});
