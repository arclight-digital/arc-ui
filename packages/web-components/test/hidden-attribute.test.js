/**
 * The hidden attribute hides every component.
 *
 * A component's own `:host { display: … }` outranks the UA stylesheet's
 * `[hidden] { display: none }`, so before the shared `:host([hidden])` rule a
 * hidden element stayed on screen: filtering an arc-list by setting `hidden`
 * on its rows removed nothing. The rule lives once, in tokenStyles; these
 * cover hosts with each kind of display it has to beat.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';

import '../src/data/list.register.js';
import '../src/data/list-item.register.js';
import '../src/input/button.register.js';
import '../src/input/toggle.register.js';
import '../src/content/card.register.js';
import '../src/data/badge.register.js';

const TAGS = ['arc-list-item', 'arc-button', 'arc-toggle', 'arc-card', 'arc-badge'];

describe('the hidden attribute', () => {
  afterEach(cleanup);

  for (const tag of TAGS) {
    it(`hides ${tag}`, async () => {
      const box = mount(`<div><${tag}>x</${tag}></div>`);
      const el = box.querySelector(tag);
      await settle(el);
      expect(getComputedStyle(el).display, 'shown before').to.not.equal('none');
      el.hidden = true;
      expect(getComputedStyle(el).display).to.equal('none');
      el.hidden = false;
      expect(getComputedStyle(el).display, 'shown again').to.not.equal('none');
    });
  }

  it('hides a row of an arc-list', async () => {
    const box = mount('<arc-list><arc-list-item value="a">A</arc-list-item><arc-list-item value="b" hidden>B</arc-list-item></arc-list>');
    const [a, b] = box.querySelectorAll('arc-list-item');
    await settle(b);
    expect(getComputedStyle(a).display).to.not.equal('none');
    expect(b.getBoundingClientRect().height).to.equal(0);
  });
});
