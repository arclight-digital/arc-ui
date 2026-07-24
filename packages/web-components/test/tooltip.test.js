import { expect } from '@esm-bundle/chai';
import '../src/feedback/tooltip.register.js';
import { mount, cleanup } from './helpers.js';

async function mountTooltip() {
  const el = mount('<arc-tooltip content="Helpful hint"><button>Trigger</button></arc-tooltip>');
  await el.updateComplete;
  return el;
}

describe('arc-tooltip no-JS fallback marker', () => {
  afterEach(cleanup);

  // The static HTML export relies on a :hover rule that is disabled by the
  // .is-managed class the component adds at runtime. If the marker is ever
  // missing (or lost to a re-render), the JS show-delay is silently bypassed.
  it('marks the popup .is-managed at first render', async () => {
    const el = await mountTooltip();
    const popup = el.shadowRoot.querySelector('.tooltip__popup');
    expect(popup.classList.contains('is-managed')).to.equal(true);
  });

  it('keeps the marker through visibility re-renders', async () => {
    const el = await mountTooltip();
    const popup = el.shadowRoot.querySelector('.tooltip__popup');
    el._visible = true;
    await el.updateComplete;
    expect(popup.classList.contains('is-managed'), 'while visible').to.equal(true);
    el._visible = false;
    await el.updateComplete;
    expect(popup.classList.contains('is-managed'), 'after hiding').to.equal(true);
  });

  it('never bakes the marker into the template', async () => {
    // Guard against someone "simplifying" by putting is-managed in the static
    // class attribute — that would leak into the prism HTML export and kill
    // the no-JS fallback.
    const { ArcTooltip } = await import('../src/feedback/tooltip.js');
    const rendered = new ArcTooltip().render();
    const strings = rendered.strings.join('');
    expect(strings).to.not.include('is-managed');
  });
});
