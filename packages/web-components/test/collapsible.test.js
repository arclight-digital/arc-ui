/**
 * arc-collapsible — the disclosure row.
 *
 * What this pins: `open` drives both the rendered state and aria-expanded, the
 * trigger is a real button whose aria-controls resolves to the region it
 * controls, clicking and keying toggle exactly once each, and arc-toggle
 * reports the new state.
 *
 * The single-toggle assertions are the point of this file. The trigger is a
 * native <button>, which synthesises a click from Enter and Space by itself, so
 * a keydown handler that toggles without preventing the default would fire
 * twice — open then immediately closed, looking like nothing happened.
 *
 * arc-toggle carries `{ open }` rather than `detail.value`; that is correct —
 * scripts/checks/event-conventions.js requires detail.value only for
 * arc-select / arc-change / arc-input.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

import '../src/content/collapsible.register.js';

afterEach(() => cleanup());

async function collapsible(attrs = 'heading="Details"', body = '<p>Body text</p>') {
  const el = mount(`<arc-collapsible ${attrs}>${body}</arc-collapsible>`);
  await settle(el);
  return el;
}

const trigger = (el) => el.shadowRoot.querySelector('.collapsible__trigger');
const region = (el) => el.shadowRoot.querySelector('[role="region"]');

describe('arc-collapsible rendering', () => {
  it('renders the heading in the trigger', async () => {
    const el = await collapsible();
    expect(el.shadowRoot.querySelector('[part="heading"]').textContent.trim()).to.equal('Details');
  });

  it('exposes the documented css parts', async () => {
    const el = await collapsible();
    for (const part of ['collapsible', 'trigger', 'heading', 'body']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('starts closed', async () => {
    const el = await collapsible();
    expect(el.open).to.equal(false);
    expect(trigger(el).getAttribute('aria-expanded')).to.equal('false');
  });

  it('honours open set in markup', async () => {
    const el = await collapsible('heading="Details" open');
    expect(el.open).to.equal(true);
    expect(trigger(el).getAttribute('aria-expanded')).to.equal('true');
  });

  it('reflects open so [open] selectors see it', async () => {
    const el = await collapsible();
    el.open = true;
    await settle(el);
    expect(el.hasAttribute('open')).to.equal(true);
  });
});

describe('arc-collapsible accessibility', () => {
  it('uses a real button for the trigger', async () => {
    const el = await collapsible();
    expect(trigger(el).tagName, 'so it is focusable and activates natively').to.equal('BUTTON');
  });

  it('points aria-controls at the region it actually controls', async () => {
    const el = await collapsible();
    const id = trigger(el).getAttribute('aria-controls');
    expect(id).to.be.a('string').and.not.empty;
    expect(el.shadowRoot.getElementById(id), 'aria-controls must resolve').to.equal(region(el));
  });

  it('names the region from the heading, with a fallback', async () => {
    const el = await collapsible();
    expect(region(el).getAttribute('aria-label')).to.equal('Details');

    const bare = await collapsible('');
    expect(region(bare).getAttribute('aria-label')).to.equal('Collapsible content');
  });

  it('hides the decorative chevron from assistive tech', async () => {
    const el = await collapsible();
    expect(el.shadowRoot.querySelector('.collapsible__chevron').getAttribute('aria-hidden'))
      .to.equal('true');
  });
});

describe('arc-collapsible toggling', () => {
  it('opens and closes on click, announcing the new state each time', async () => {
    const el = await collapsible();
    const details = [];
    el.addEventListener('arc-toggle', (e) => details.push(e.detail));

    trigger(el).click();
    await settle(el);
    expect(el.open).to.equal(true);
    expect(trigger(el).getAttribute('aria-expanded')).to.equal('true');

    trigger(el).click();
    await settle(el);
    expect(el.open).to.equal(false);

    expect(details).to.deep.equal([{ open: true }, { open: false }]);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await collapsible();
    let event = null;
    document.body.addEventListener('arc-toggle', (e) => { event = e; }, { once: true });

    trigger(el).click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('toggles exactly once for Enter, not once per synthesised click', async () => {
    const el = await collapsible();
    const seen = record(el, ['arc-toggle']);

    keyOn(trigger(el), 'Enter');
    await settle(el);

    expect(el.open, 'a double toggle would land back on closed').to.equal(true);
    expect(seen).to.have.lengthOf(1);
  });

  it('toggles exactly once for Space', async () => {
    const el = await collapsible();
    const seen = record(el, ['arc-toggle']);

    keyOn(trigger(el), ' ');
    await settle(el);

    expect(el.open).to.equal(true);
    expect(seen).to.have.lengthOf(1);
  });

  it('claims Enter and Space so the page does not scroll under it', async () => {
    const el = await collapsible();
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      trigger(el).dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
    }
  });

  it('ignores other keys', async () => {
    const el = await collapsible();
    const seen = record(el, ['arc-toggle']);

    keyOn(trigger(el), 'ArrowDown');
    keyOn(trigger(el), 'a');
    await settle(el);

    expect(el.open).to.equal(false);
    expect(seen).to.deep.equal([]);
  });

  it('stays silent when open is set from script', async () => {
    const el = await collapsible();
    const seen = record(el, ['arc-toggle']);

    el.open = true;
    await settle(el);

    expect(trigger(el).getAttribute('aria-expanded'), 'the state still updates').to.equal('true');
    expect(seen, 'a programmatic set is not a user toggle').to.deep.equal([]);
  });
});

describe('arc-collapsible content', () => {
  it('projects its slotted body', async () => {
    const el = await collapsible('heading="Details" open');
    const assigned = el.shadowRoot.querySelector('slot').assignedElements();
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('Body text');
  });

  it('renders without a body or a heading rather than throwing', async () => {
    const el = await collapsible('', '');
    expect(trigger(el)).to.not.equal(null);
    expect(region(el)).to.not.equal(null);
  });
});
