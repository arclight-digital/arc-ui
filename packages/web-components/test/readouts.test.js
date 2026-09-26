/**
 * The 4.5 readout changes, reported by an application drawing its own versions
 * of each (test-findings #121–#123).
 *
 * - arc-meter / arc-gauge `mode`: `plain` for a quantity that is not good or
 *   bad, `diverging` for a lean either way around `center`.
 * - arc-stat `size` and `plain`, for a strip of vitals.
 * - arc-empty-state is no longer a live region unless asked (`announce`).
 *
 * base.css is loaded because the colours under test are root tokens.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, useBaseCss } from './helpers.js';

import '../src/data/meter.register.js';
import '../src/data/gauge.register.js';
import '../src/data/stat.register.js';
import '../src/content/empty-state.register.js';

useBaseCss();
afterEach(cleanup);

async function el(markup) {
  const node = mount(markup);
  await settle(node);
  return node;
}

/** A token resolved to the colour the browser computes for it. */
function tokenColor(name, prop = 'color') {
  const probe = document.createElement('span');
  probe.style[prop] = `var(${name})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe)[prop];
  probe.remove();
  return value;
}

describe('arc-meter mode', () => {
  const fills = (m) => [...m.shadowRoot.querySelectorAll('[part~="fill"]')];

  it('zones by default, as before', async () => {
    const m = await el('<arc-meter value="90" low="20" high="60" optimum="100"></arc-meter>');
    expect(fills(m)[0].className).to.contain('meter__fill--success');
  });

  it('draws one plain colour, whatever the thresholds say', async () => {
    const m = await el(
      '<arc-meter mode="plain" value="90" low="20" high="60" optimum="0"></arc-meter>',
    );
    expect(getComputedStyle(fills(m)[0]).backgroundColor).to.equal(tokenColor('--accent-primary'));
    expect(fills(m)[0].style.width).to.equal('90%');
  });

  it('fills from the centre toward a value above it', async () => {
    const m = await el('<arc-meter mode="diverging" min="-1" max="1" value="0.5"></arc-meter>');
    const [f] = fills(m);
    expect(f.className).to.contain('meter__fill--above');
    expect(f.style.insetInlineStart).to.equal('50%');
    expect(f.style.width).to.equal('25%');
    expect(getComputedStyle(f).backgroundColor).to.equal(tokenColor('--chart-2'));
  });

  it('fills from the value up to the centre below it, in the other colour', async () => {
    const m = await el('<arc-meter mode="diverging" min="-1" max="1" value="-0.5"></arc-meter>');
    const [f] = fills(m);
    expect(f.className).to.contain('meter__fill--below');
    expect(f.style.insetInlineStart).to.equal('25%');
    expect(f.style.width).to.equal('25%');
    expect(getComputedStyle(f).backgroundColor).to.equal(tokenColor('--chart-1'));
  });

  it('draws no fill at the centre, only the tick', async () => {
    const m = await el('<arc-meter mode="diverging" min="-1" max="1" value="0"></arc-meter>');
    expect(fills(m)).to.have.length(0);
    expect(m.shadowRoot.querySelector('[part~="center"]').style.insetInlineStart).to.equal('50%');
  });

  it('takes an explicit centre', async () => {
    const m = await el(
      '<arc-meter mode="diverging" min="0" max="10" center="2" value="6"></arc-meter>',
    );
    const [f] = fills(m);
    expect(f.style.insetInlineStart).to.equal('20%');
    expect(f.style.width).to.equal('40%');
  });

  it('shows and announces the signed value, not a percentage', async () => {
    const m = await el(
      '<arc-meter mode="diverging" label="Lean" min="-1" max="1" value="-0.4"></arc-meter>',
    );
    expect(m.shadowRoot.querySelector('[part~="value"]').textContent.trim()).to.equal('−0.4');
    expect(m.shadowRoot.querySelector('[role="meter"]').getAttribute('aria-valuetext')).to.equal(
      '−0.4',
    );
    m.value = 0.4;
    await settle(m);
    expect(m.shadowRoot.querySelector('[part~="value"]').textContent.trim()).to.equal('+0.4');
  });

  it('honours custom side colours', async () => {
    const m = await el(
      '<arc-meter mode="diverging" min="-1" max="1" value="0.5" style="--meter-above: rgb(1, 2, 3)"></arc-meter>',
    );
    expect(getComputedStyle(fills(m)[0]).backgroundColor).to.equal('rgb(1, 2, 3)');
  });
});

describe('arc-gauge mode', () => {
  const arc = (g) => g.shadowRoot.querySelector('[part~="arc"]');

  it('draws a plain arc in the fill colour', async () => {
    const g = await el(
      '<arc-gauge mode="plain" value="90" low="20" high="60" optimum="0"></arc-gauge>',
    );
    expect(arc(g).getAttribute('class')).to.contain('gauge__arc--plain');
    expect(getComputedStyle(arc(g)).stroke).to.equal(tokenColor('--accent-primary'));
  });

  it('draws a diverging arc from the centre, each side its own colour', async () => {
    const above = await el('<arc-gauge mode="diverging" min="-1" max="1" value="0.5"></arc-gauge>');
    expect(arc(above).getAttribute('class')).to.contain('gauge__arc--above');
    expect(getComputedStyle(arc(above)).stroke).to.equal(tokenColor('--chart-2'));
    cleanup();
    const below = await el(
      '<arc-gauge mode="diverging" min="-1" max="1" value="-0.5"></arc-gauge>',
    );
    expect(arc(below).getAttribute('class')).to.contain('gauge__arc--below');
    expect(getComputedStyle(arc(below)).stroke).to.equal(tokenColor('--chart-1'));
  });

  it('spans a quarter of the sweep for half the distance to an end', async () => {
    const g = await el('<arc-gauge mode="diverging" min="-1" max="1" value="1"></arc-gauge>');
    const full = g.shadowRoot.querySelector('[part~="track"]').getTotalLength();
    expect(arc(g).getTotalLength() / full).to.be.closeTo(0.5, 0.02);
    g.value = 0.5;
    await settle(g);
    expect(arc(g).getTotalLength() / full).to.be.closeTo(0.25, 0.02);
  });

  it('draws only the tick at the centre', async () => {
    const g = await el('<arc-gauge mode="diverging" min="-1" max="1" value="0"></arc-gauge>');
    // Booleans, not elements: a failing equality on a DOM node makes chai print
    // it, and printing a live node never finishes. The run hangs instead of failing.
    expect(arc(g) === null, 'no arc').to.equal(true);
    expect(g.shadowRoot.querySelector('[part~="center"]') !== null, 'a tick').to.equal(true);
  });

  it('reads out the signed value', async () => {
    const g = await el('<arc-gauge mode="diverging" min="-1" max="1" value="0.25"></arc-gauge>');
    expect(g.shadowRoot.querySelector('[part~="value"]').textContent.trim()).to.equal('+0.25');
    expect(g.shadowRoot.querySelector('[role="meter"]').getAttribute('aria-valuetext')).to.equal(
      '+0.25',
    );
  });
});

describe('arc-stat size and plain', () => {
  const value = (s) => s.shadowRoot.querySelector('[part~="value"]');

  it('is smaller at sm and larger at lg than the default', async () => {
    const wrap = await el(`<div style="width: 1200px">
      <arc-stat value="42" label="A" size="sm"></arc-stat>
      <arc-stat value="42" label="A"></arc-stat>
      <arc-stat value="42" label="A" size="lg"></arc-stat></div>`);
    const [sm, md, lg] = [...wrap.querySelectorAll('arc-stat')];
    for (const s of [sm, md, lg]) await settle(s);
    const px = (s) => parseFloat(getComputedStyle(value(s)).fontSize);
    expect(md.size).to.equal('md');
    expect(px(sm)).to.be.lessThan(px(md));
    expect(px(lg)).to.be.greaterThan(px(md));
    expect(px(sm)).to.be.at.most(26);
  });

  it('drops the gradient, glow and rule when plain', async () => {
    const s = await el('<arc-stat value="42" label="A" plain></arc-stat>');
    const cs = getComputedStyle(value(s));
    expect(cs.backgroundImage).to.equal('none');
    expect(cs.filter).to.equal('none');
    expect(cs.color).to.equal(tokenColor('--text-primary'));
    expect(getComputedStyle(s.shadowRoot.querySelector('.stat__rule')).display).to.equal('none');
  });
});

describe('arc-empty-state live region', () => {
  const box = (e) => e.shadowRoot.querySelector('[part~="container"]');

  it('is not a live region by default', async () => {
    const e = await el('<arc-empty-state heading="Nothing here"></arc-empty-state>');
    expect(box(e).hasAttribute('role')).to.equal(false);
  });

  it('becomes a polite status region with announce', async () => {
    const e = await el('<arc-empty-state heading="No results" announce></arc-empty-state>');
    expect(box(e).getAttribute('role')).to.equal('status');
    e.announce = false;
    await settle(e);
    expect(box(e).hasAttribute('role')).to.equal(false);
  });
});
