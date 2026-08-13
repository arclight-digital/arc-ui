/**
 * arc-guided-tour — the step-through product tour.
 *
 * What this pins: the tour renders nothing until opened, the spotlight ring
 * tracks the current step's target element, next/prev walk the steps and clamp,
 * arc-change carries the step index on detail.value, finishing the last step
 * completes rather than advancing, and the v3 close contract holds on the skip
 * path.
 *
 * Two tests are marked BUG: reopening a finished tour resumes on the last step
 * rather than the first, and `active` is documented read-only while being a
 * writable reactive property. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, record } from './helpers.js';

import '../src/feedback/guided-tour.register.js';

afterEach(() => cleanup());

const STEPS = [
  { target: '#one', title: 'First', content: 'Step one' },
  { target: '#two', title: 'Second', content: 'Step two' },
  { target: '#three', title: 'Third', content: 'Step three' },
];

/** Targets on the page plus a tour pointed at them. */
async function tour({ steps = STEPS, open = true } = {}) {
  mount(`
    <div>
      <div id="one" style="width:100px;height:40px">One</div>
      <div id="two" style="width:100px;height:40px">Two</div>
      <div id="three" style="width:100px;height:40px">Three</div>
    </div>
  `);
  const el = mount('<arc-guided-tour></arc-guided-tour>');
  el.steps = steps;
  el.open = open;
  await settle(el);
  return el;
}

const tooltip = (el) => el.shadowRoot.querySelector('[part="tooltip"]');
const ring = (el) => el.shadowRoot.querySelector('[part="ring"]');
const title = (el) => el.shadowRoot.querySelector('[part="title"]')?.textContent.trim() ?? null;
const counter = (el) => el.shadowRoot.querySelector('[part="counter"]')?.textContent.trim() ?? null;
const nextBtn = (el) => el.shadowRoot.querySelector('[part="next"]');
const prevBtn = (el) => el.shadowRoot.querySelector('[part="prev"]');

describe('arc-guided-tour rendering', () => {
  it('renders nothing while closed', async () => {
    const el = await tour({ open: false });
    expect(el.shadowRoot.querySelector('[part="tooltip"]') === null).to.equal(true);
  });

  it('renders nothing with no steps, even when open', async () => {
    const el = await tour({ steps: [] });
    expect(el.shadowRoot.querySelector('[part="tooltip"]') === null).to.equal(true);
  });

  it('exposes the documented css parts once open', async () => {
    const el = await tour();
    for (const part of ['ring', 'tooltip', 'counter', 'title', 'content', 'controls', 'next']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('opens on the first step', async () => {
    const el = await tour();
    expect(el.active).to.equal(0);
    expect(title(el)).to.equal('First');
  });

  it('counts the steps', async () => {
    const el = await tour();
    expect(counter(el)).to.contain('1');
    expect(counter(el)).to.contain('3');
  });

  it('spotlights the current step target', async () => {
    const el = await tour();
    const target = document.querySelector('#one').getBoundingClientRect();
    const box = ring(el).getBoundingClientRect();

    // The ring is inset by 8px of padding on every side.
    expect(box.left).to.be.closeTo(target.left - 8, 2);
    expect(box.width).to.be.closeTo(target.width + 16, 2);
  });

  it('survives a step whose target is not on the page', async () => {
    const el = await tour({ steps: [{ target: '#nope', title: 'Ghost', content: 'x' }] });
    expect(title(el), 'the tooltip still renders').to.equal('Ghost');
  });
});

describe('arc-guided-tour navigation', () => {
  it('advances and reports the new index on detail.value', async () => {
    const el = await tour();
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    nextBtn(el).click();
    await settle(el);

    expect(el.active).to.equal(1);
    expect(title(el)).to.equal('Second');
    expect(details).to.deep.equal([{ value: 1, step: 1 }]);
  });

  it('goes back', async () => {
    const el = await tour();
    nextBtn(el).click();
    await settle(el);
    prevBtn(el).click();
    await settle(el);

    expect(el.active).to.equal(0);
    expect(title(el)).to.equal('First');
  });

  it('offers no way back from the first step', async () => {
    const el = await tour();
    expect(prevBtn(el) === null, 'no Prev button on step one').to.equal(true);

    nextBtn(el).click();
    await settle(el);
    expect(prevBtn(el) === null, 'and it appears once there is somewhere to go back to')
      .to.equal(false);
  });

  it('stays put and silent if asked to go back from the first step', async () => {
    const el = await tour();
    const seen = record(el, ['arc-change']);

    el._prev();
    await settle(el);

    expect(el.active).to.equal(0);
    expect(seen, 'nothing before the first step').to.deep.equal([]);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await tour();
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    nextBtn(el).click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('moves the spotlight to the new target', async () => {
    const el = await tour();
    nextBtn(el).click();
    await settle(el);

    const target = document.querySelector('#two').getBoundingClientRect();
    expect(ring(el).getBoundingClientRect().top).to.be.closeTo(target.top - 8, 2);
  });
});

describe('arc-guided-tour completion', () => {
  const toLastStep = async (el) => {
    for (let i = 0; i < STEPS.length - 1; i++) {
      nextBtn(el).click();
      await settle(el);
    }
  };

  it('completes rather than advancing past the last step', async () => {
    const el = await tour();
    await toLastStep(el);
    expect(el.active).to.equal(2);

    const seen = record(el, ['arc-complete', 'arc-change']);
    nextBtn(el).click();
    await settle(el);

    expect(seen.map(([k]) => k), 'completes, does not advance').to.deep.equal(['complete']);
    expect(el.open).to.equal(false);
  });

  it('does not fire arc-close on completion', async () => {
    const el = await tour();
    await toLastStep(el);
    const seen = record(el, ['arc-close']);

    nextBtn(el).click();
    await settle(el);

    expect(seen, 'completing is not skipping').to.deep.equal([]);
  });

  it('fires a cancelable arc-close when skipped, before the state flips', async () => {
    const el = await tour();
    let openDuringEvent = null;
    el.addEventListener('arc-close', () => { openDuringEvent = el.open; }, { once: true });

    el._dismiss();
    await settle(el);

    expect(openDuringEvent, 'a listener must observe the still-open tour').to.equal(true);
    expect(el.open).to.equal(false);
  });

  it('preventDefault() on arc-close keeps the tour running', async () => {
    const el = await tour();
    const veto = (e) => e.preventDefault();
    el.addEventListener('arc-close', veto);

    el._dismiss();
    await settle(el);
    expect(el.open, 'vetoed').to.equal(true);

    el.removeEventListener('arc-close', veto);
    el._dismiss();
    await settle(el);
    expect(el.open).to.equal(false);
  });

  // BUG: guided-tour.js:12 documents `open` as "Set to true to start the tour
  // from the first step." Nothing resets `active` — not _complete
  // (guided-tour.js:185), not _dismiss, and not the open observer. A tour that
  // was finished or skipped and is then reopened resumes on whatever step it
  // stopped at, so a user who reruns the tour lands on the last step with the
  // Next button already meaning Finish.
  it('BUG: reopening a finished tour resumes on the last step, not the first', async () => {
    const el = await tour();
    await toLastStep(el);
    nextBtn(el).click();
    await settle(el);
    expect(el.open).to.equal(false);

    el.open = true;
    await settle(el);

    expect(el.active, 'documented behaviour is to start from the first step').to.equal(2);
    expect(title(el)).to.equal('Third');
  });

  it('BUG: reopening after a skip also resumes mid-tour', async () => {
    const el = await tour();
    nextBtn(el).click();
    await settle(el);
    el._dismiss();
    await settle(el);

    el.open = true;
    await settle(el);

    expect(el.active).to.equal(1);
  });
});

describe('arc-guided-tour active', () => {
  // BUG: guided-tour.js:11 documents `active` as "Read-only property reflecting
  // the zero-based index of the currently active step." It is an ordinary
  // reactive property with no setter guard, so it is writable — and writing it
  // moves the tour without firing arc-change, which is the one way a consumer
  // has to track where the user is.
  it('BUG: active is documented read-only but is writable, and silent when written', async () => {
    const el = await tour();
    const seen = record(el, ['arc-change']);

    el.active = 2;
    await settle(el);

    expect(title(el), 'the write took effect').to.equal('Third');
    expect(seen, 'and announced nothing').to.deep.equal([]);
  });
});
