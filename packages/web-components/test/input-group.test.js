/**
 * arc-input-group draws the field's box; the controls inside it do not
 * (test-findings #143). arc-input and arc-select draw their chrome inside their
 * shadow roots, where the group's old `::slotted(...) { border: none
 * !important }` never reached, so a grouped arc-input kept its border, radius
 * and inset shadow inside the group's. Found by check-slotted-overrides.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, useBaseCss } from './helpers.js';
import '../src/input/input-group.register.js';
import '../src/input/input.register.js';
import '../src/input/select.register.js';
import '../src/shared/option.register.js';

useBaseCss();
afterEach(cleanup);

const chrome = (el) => {
  const cs = getComputedStyle(el);
  return { border: cs.borderTopStyle, radius: cs.borderTopLeftRadius, shadow: cs.boxShadow };
};

describe('arc-input-group', () => {
  it('strips a grouped arc-input of its own box', async () => {
    const g = mount('<arc-input-group><span slot="prefix">https://</span><arc-input aria-label="URL"></arc-input></arc-input-group>');
    await settle(g);
    const input = g.querySelector('arc-input');
    await settle(input);
    expect(chrome(input.shadowRoot.querySelector('[part~="wrapper"]'))).to.deep.equal({ border: 'none', radius: '0px', shadow: 'none' });
  });

  it('strips a grouped arc-select of its own box', async () => {
    const g = mount('<arc-input-group><arc-select aria-label="Unit"><arc-option value="a">A</arc-option></arc-select></arc-input-group>');
    await settle(g);
    const select = g.querySelector('arc-select');
    await settle(select);
    expect(chrome(select.shadowRoot.querySelector('[part~="trigger"]'))).to.deep.equal({ border: 'none', radius: '0px', shadow: 'none' });
  });

  it('leaves an arc-input outside a group as it was', async () => {
    const input = mount('<arc-input aria-label="Name"></arc-input>');
    await settle(input);
    const c = chrome(input.shadowRoot.querySelector('[part~="wrapper"]'));
    expect(c.border).to.equal('solid');
    expect(c.radius).to.not.equal('0px');
  });

  it('still strips a native input', async () => {
    const g = mount('<arc-input-group><input aria-label="Plain"></arc-input-group>');
    await settle(g);
    expect(chrome(g.querySelector('input')).border).to.equal('none');
  });
});
