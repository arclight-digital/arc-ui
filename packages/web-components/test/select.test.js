/**
 * arc-select's trigger keeps its value on one line.
 *
 * Reported against 4.3.0 (test-findings #116): in a select about 100px wide,
 * "2026-09-10" wrapped as "2026-09-" / "10" and the trigger grew a line taller.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, tick } from './helpers.js';

import '../src/input/select.register.js';
import '../src/shared/option.register.js';

afterEach(cleanup);

async function narrow(value, placeholder = '') {
  const el = mount(`<arc-select size="sm" style="width: 100px" placeholder="${placeholder}">
    <arc-option value="d">2026-09-10 (Thursday)</arc-option>
    <arc-option value="s">Short</arc-option>
  </arc-select>`);
  await settle(el);
  await tick();
  if (value) el.value = value;
  await settle(el);
  return el;
}

const trigger = (el) => el.shadowRoot.querySelector('[part~="trigger"]');

describe('arc-select value on one line', () => {
  it('truncates a long value instead of wrapping it', async () => {
    const short = await narrow('s');
    const shortHeight = trigger(short).getBoundingClientRect().height;
    cleanup();

    const el = await narrow('d');
    const value = el.shadowRoot.querySelector('.select__value');
    expect(value.textContent).to.contain('2026-09-10');
    expect(trigger(el).getBoundingClientRect().height, 'the trigger does not grow').to.equal(shortHeight);
    expect(getComputedStyle(value).textOverflow).to.equal('ellipsis');
    expect(value.scrollWidth, 'and the text is really cut').to.be.greaterThan(value.clientWidth);
  });

  it('keeps the chevron inside the trigger', async () => {
    const el = await narrow('d');
    const chevron = el.shadowRoot.querySelector('.select__chevron').getBoundingClientRect();
    expect(chevron.right).to.be.at.most(trigger(el).getBoundingClientRect().right);
  });

  it('truncates a long placeholder too', async () => {
    const el = await narrow('', 'Choose a date for the session');
    const placeholder = el.shadowRoot.querySelector('.select__placeholder');
    expect(placeholder.scrollWidth).to.be.greaterThan(placeholder.clientWidth);
  });
});
