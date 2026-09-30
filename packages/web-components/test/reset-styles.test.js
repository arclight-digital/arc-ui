/**
 * `resetStyles`: only the box-sizing reset, for an application's own Lit
 * components (test-findings #127). `tokenStyles` also zeroes margins and
 * padding, which a consumer could not adopt without restyling their components.
 */
import { expect } from '@esm-bundle/chai';
import { LitElement, html, css } from 'lit';
import { resetStyles, tokenStyles } from '../src/shared-styles.js';
import { mount, cleanup, settle } from './helpers.js';

class ResetProbe extends LitElement {
  static styles = [resetStyles, css`p { margin: 7px; padding: 3px; width: 50px; }`];
  render() {
    return html`<p>x</p>`;
  }
}
customElements.define('reset-probe', ResetProbe);

afterEach(cleanup);

describe('resetStyles', () => {
  it('sets border-box inside a shadow root, and leaves margins and padding alone', async () => {
    const el = mount('<reset-probe></reset-probe>');
    await settle(el);
    const p = getComputedStyle(el.shadowRoot.querySelector('p'));
    expect(p.boxSizing).to.equal('border-box');
    expect(p.marginTop).to.equal('7px');
    expect(p.paddingTop).to.equal('3px');
  });

  it('is only the reset: no margin zeroing and no tokens', () => {
    const text = resetStyles.cssText;
    expect(text).to.contain('box-sizing: border-box');
    expect(text).to.not.match(/margin|padding|--/);
    expect(tokenStyles.cssText, 'tokenStyles is unchanged').to.contain('margin: 0');
  });
});
