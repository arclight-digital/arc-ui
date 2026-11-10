/**
 * arc-radio-group: per-option `disabled`.
 *
 * What this pins: a disabled `<arc-radio>` behaves like a disabled native
 * radio. A click does not select it, the arrow keys step over it, Space on it
 * does nothing, it is never the group's Tab stop, and it is announced as
 * disabled. The bug this guards: the group read only its own `disabled` and
 * never the option's, so a disabled option was selectable every way.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, deepActive, record } from './helpers.js';

import '../src/input/radio-group.register.js';
import '../src/input/radio.register.js';

afterEach(() => cleanup());

const OPTIONS = `
  <arc-radio value="a">A</arc-radio>
  <arc-radio value="b" disabled>B</arc-radio>
  <arc-radio value="c">C</arc-radio>
`;

async function group(attrs = '', children = OPTIONS) {
  const el = mount(`<arc-radio-group ${attrs}>${children}</arc-radio-group>`);
  await settle(el);
  return el;
}

const radios = (el) => [...el.shadowRoot.querySelectorAll('[role="radio"]')];

describe('arc-radio-group disabled option', () => {
  it('does not select a disabled option on click', async () => {
    const el = await group('value="a"');
    const seen = record(el, ['arc-change']);
    radios(el)[1].click();
    await settle(el);
    expect(el.value).to.equal('a');
    expect(seen).to.have.lengthOf(0);
  });

  it('marks a disabled option aria-disabled and takes it out of the Tab order', async () => {
    const el = await group('value="a"');
    const [a, b, c] = radios(el);
    expect(b.getAttribute('aria-disabled')).to.equal('true');
    expect(a.hasAttribute('aria-disabled')).to.equal(false);
    expect(c.hasAttribute('aria-disabled')).to.equal(false);
    expect(b.getAttribute('tabindex')).to.equal('-1');
  });

  it('steps over a disabled option with ArrowDown', async () => {
    const el = await group('value="a"');
    radios(el)[0].focus();
    keyOn(radios(el)[0], 'ArrowDown');
    await settle(el);
    expect(el.value).to.equal('c');
    expect(deepActive()).to.equal(radios(el)[2]);
  });

  it('steps over a disabled option with ArrowUp', async () => {
    const el = await group('value="c"');
    radios(el)[2].focus();
    keyOn(radios(el)[2], 'ArrowUp');
    await settle(el);
    expect(el.value).to.equal('a');
    expect(deepActive()).to.equal(radios(el)[0]);
  });

  it('steps over a disabled option when wrapping', async () => {
    const el = await group('value="a"', `
      <arc-radio value="a">A</arc-radio>
      <arc-radio value="b">B</arc-radio>
      <arc-radio value="c" disabled>C</arc-radio>
    `);
    keyOn(radios(el)[0], 'ArrowUp');
    await settle(el);
    expect(el.value).to.equal('b');
  });

  it('ignores Space on a focused disabled option', async () => {
    const el = await group('value="a"');
    keyOn(radios(el)[1], ' ');
    await settle(el);
    expect(el.value).to.equal('a');
  });

  it('makes the first enabled option the Tab stop when nothing is selected', async () => {
    const el = await group('', `
      <arc-radio value="a" disabled>A</arc-radio>
      <arc-radio value="b">B</arc-radio>
    `);
    expect(radios(el).map((r) => r.getAttribute('tabindex'))).to.deep.equal(['-1', '0']);
  });

  it('re-renders when an option is disabled after first render', async () => {
    const el = await group('value="a"', `
      <arc-radio value="a">A</arc-radio>
      <arc-radio value="b">B</arc-radio>
    `);
    el.querySelector('[value="b"]').disabled = true;
    await settle(el.querySelector('[value="b"]'));
    await settle(el);
    expect(radios(el)[1].getAttribute('aria-disabled')).to.equal('true');
    radios(el)[1].click();
    await settle(el);
    expect(el.value).to.equal('a');
  });

  it('still selects enabled options by click and arrow key', async () => {
    const el = await group('value="a"', `
      <arc-radio value="a">A</arc-radio>
      <arc-radio value="b">B</arc-radio>
    `);
    keyOn(radios(el)[0], 'ArrowDown');
    await settle(el);
    expect(el.value).to.equal('b');
    radios(el)[0].click();
    await settle(el);
    expect(el.value).to.equal('a');
  });
});
