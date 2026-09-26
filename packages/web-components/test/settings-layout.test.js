/**
 * arc-settings-layout nav items (test-findings #120): active state from the URL
 * hash, section switching with `sections`, and a tab row on phones.
 * Booleans rather than DOM nodes in equalities (see the harness note, #119–#124).
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until } from './helpers.js';
import '../src/layout/settings-layout.register.js';
import '../src/layout/settings-nav-item.register.js';

afterEach(() => {
  cleanup();
  history.replaceState(null, '', location.pathname + location.search);
});

async function layout(attrs = 'sections', wrapped = true) {
  const items = `
    <arc-settings-nav-item href="#t-profile">Profile</arc-settings-nav-item>
    <arc-settings-nav-item href="#t-security">Security</arc-settings-nav-item>`;
  const nav = wrapped ? `<nav slot="nav" aria-label="Settings">${items}</nav>` : items.replaceAll('<arc-settings-nav-item', '<arc-settings-nav-item slot="nav"');
  const el = mount(`<arc-settings-layout ${attrs}>${nav}
    <section id="t-profile">Profile body</section>
    <section id="t-security">Security body</section></arc-settings-layout>`);
  await settle(el);
  for (const i of el.querySelectorAll('arc-settings-nav-item')) await settle(i);
  return el;
}
const items = (el) => [...el.querySelectorAll('arc-settings-nav-item')];
const link = (i) => i.shadowRoot.querySelector('[part~="base"]');
const shown = (el) => [...el.querySelectorAll('section')].filter((s) => !s.hidden).map((s) => s.id);
const go = async (el, hash) => {
  location.hash = hash;
  await until(() => location.hash === hash);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  await settle(el);
};

describe('arc-settings-layout nav', () => {
  it('marks the first item active when no hash matches', async () => {
    const el = await layout();
    expect(items(el).map((i) => i.active)).to.deep.equal([true, false]);
    expect(link(items(el)[0]).getAttribute('aria-current')).to.equal('page');
    expect(link(items(el)[1]).hasAttribute('aria-current')).to.equal(false);
  });

  it('follows the URL hash', async () => {
    const el = await layout();
    await go(el, '#t-security');
    expect(items(el).map((i) => i.active)).to.deep.equal([false, true]);
  });

  it('shows only the active section with `sections`', async () => {
    const el = await layout();
    expect(shown(el)).to.deep.equal(['t-profile']);
    await go(el, '#t-security');
    expect(shown(el)).to.deep.equal(['t-security']);
  });

  it('leaves every section on the page without `sections`', async () => {
    const el = await layout('');
    await go(el, '#t-security');
    expect(shown(el)).to.deep.equal(['t-profile', 't-security']);
    expect(items(el)[1].active).to.equal(true);
  });

  it('finds items slotted directly, without a wrapper', async () => {
    const el = await layout('sections', false);
    expect(items(el).map((i) => i.active)).to.deep.equal([true, false]);
  });

  it('draws the nav as a column on a wide screen', async () => {
    const el = await layout();
    const nav = el.shadowRoot.querySelector('[part~="nav"]');
    expect(getComputedStyle(nav).flexDirection).to.equal('column');
  });

  it('declares the phone tab row', async () => {
    // The runner's viewport is wide, so the narrow rule is asserted on the sheet.
    const el = await layout();
    const css = el.shadowRoot.adoptedStyleSheets.flatMap((s) => [...s.cssRules]).map((r) => r.cssText).join('\n');
    expect(css).to.match(/@media \(max-width: 768px\)[\s\S]*flex-direction: row[\s\S]*overflow-x: auto/);
  });
});
