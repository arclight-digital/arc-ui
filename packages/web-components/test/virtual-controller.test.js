import { expect } from '@esm-bundle/chai';
import { LitElement } from 'lit';
import { mount, cleanup, nextFrame } from './helpers.js';
import { VirtualController } from '../src/shared/virtual-controller.js';

import '../src/content/virtual-list.register.js';
import '../src/data/data-grid.register.js';

/**
 * The shared windowing layer, tested directly.
 *
 * Three components implemented this and none of them tested the arithmetic —
 * it was covered only through whichever consumer's suite happened to scroll.
 * That is what let the three copies drift, and one of the drifts was a bug:
 * `arc-data-table` computed its visible count without a zero-clamp, so any
 * state where the row set shrank below the current scroll offset produced a
 * *negative* count and rendered nothing under a full-height spacer.
 *
 * The direct cases use a purpose-built probe rather than a real component, so a
 * failure names the controller. The consumer cases at the bottom assert that
 * all three actually adopted it, which is the half a probe cannot show.
 */

class Probe extends LitElement {
  createRenderRoot() {
    return this;
  }
}
customElements.define('vc-probe', Probe);

/** A stand-in scroller: whatever numbers the test wants to hand the controller. */
const viewport = (scrollTop, clientHeight) => ({ scrollTop, clientHeight });

function harness({ scrollTop = 0, clientHeight = 100, total = 1000, rowHeight = 10, overscan = 0 } = {}) {
  const host = mount('<vc-probe></vc-probe>');
  const state = { scrollTop, clientHeight, total, rowHeight, overscan, changes: [] };
  state.controller = new VirtualController(host, {
    getViewport: () => viewport(state.scrollTop, state.clientHeight),
    getTotal: () => state.total,
    getRowHeight: () => state.rowHeight,
    getOverscan: () => state.overscan,
    onChange: (range) => state.changes.push(range),
  });
  return state;
}

describe('VirtualController', () => {
  afterEach(cleanup);

  it('windows to the visible rows', () => {
    const s = harness({ scrollTop: 200, clientHeight: 100, rowHeight: 10 });
    s.controller.measure();
    expect(s.controller.start).to.equal(20);
    expect(s.controller.count).to.equal(10);
    expect(s.controller.end).to.equal(30);
  });

  it('pads both edges by the overscan', () => {
    const s = harness({ scrollTop: 200, clientHeight: 100, rowHeight: 10, overscan: 5 });
    s.controller.measure();
    expect(s.controller.start).to.equal(15);
    expect(s.controller.end).to.equal(35);
  });

  it('does not window before the start', () => {
    const s = harness({ scrollTop: 0, overscan: 5 });
    s.controller.measure();
    expect(s.controller.start).to.equal(0);
  });

  it('does not window past the end', () => {
    const s = harness({ scrollTop: 9900, clientHeight: 100, rowHeight: 10, total: 1000, overscan: 5 });
    s.controller.measure();
    expect(s.controller.end).to.be.at.most(1000);
  });

  it('never reports a negative count when the rows shrink under the scroll', () => {
    // The arc-data-table bug, in the state that produced it: scrolled well down
    // a long list, then the list is filtered to a handful of rows. `end` clamps
    // to the new total while `start` is still derived from the old offset, so
    // an unclamped `end - start` inverts.
    const s = harness({ scrollTop: 5000, clientHeight: 100, rowHeight: 10, total: 1000 });
    s.controller.measure();
    expect(s.controller.count).to.be.greaterThan(0);

    s.total = 3;
    s.controller.measure();
    expect(s.controller.count, 'count is clamped at zero').to.equal(0);
    expect(s.controller.start).to.be.at.most(3);
    expect(s.controller.end).to.be.at.least(s.controller.start);
  });

  it('keeps the spacers consistent with the window', () => {
    // The two offsets and the window are three views of one number, and a
    // renderer that trusted them separately would leave a gap or an overlap.
    const s = harness({ scrollTop: 200, clientHeight: 100, rowHeight: 10, total: 1000 });
    s.controller.measure();
    const c = s.controller;
    expect(c.offsetBefore).to.equal(c.start * 10);
    expect(c.offsetBefore + c.count * 10 + c.offsetAfter).to.equal(1000 * 10);
  });

  it('survives a row height of zero rather than rendering NaN rows', () => {
    // rowHeight is a divisor. arc-virtual-list declares `min: 1`; the two tables
    // declare no minimum, which is why the guard is here and not in a prop.
    const s = harness({ rowHeight: 0, scrollTop: 100, clientHeight: 100 });
    s.controller.measure();
    expect(Number.isFinite(s.controller.start)).to.be.true;
    expect(Number.isFinite(s.controller.count)).to.be.true;
  });

  it('reports movement only when the window actually moves', () => {
    // The scroll handler fires every frame of a drag. A host that re-rendered
    // on each one would rebuild an unchanged window sixty times a second.
    const s = harness({ scrollTop: 200, clientHeight: 100, rowHeight: 10 });
    expect(s.controller.measure(), 'first measure moves from nothing').to.be.true;
    expect(s.controller.measure(), 'same numbers, no movement').to.be.false;
    expect(s.changes).to.have.lengthOf(1);

    s.scrollTop = 205; // still inside the same row
    expect(s.controller.measure()).to.be.false;
    expect(s.changes, 'a sub-row scroll is not a window change').to.have.lengthOf(1);

    s.scrollTop = 260;
    expect(s.controller.measure()).to.be.true;
    expect(s.changes).to.have.lengthOf(2);
  });

  it('is a no-op until the viewport exists', () => {
    // The two tables scroll an inner wrapper that is not there until the first
    // render, and the controller is constructed in their constructor.
    const host = mount('<vc-probe></vc-probe>');
    let el = null;
    const c = new VirtualController(host, {
      getViewport: () => el,
      getTotal: () => 100,
      getRowHeight: () => 10,
    });
    expect(c.measure()).to.be.false;
    expect(c.count).to.equal(0);
    el = viewport(0, 50);
    expect(c.measure()).to.be.true;
    // Five visible rows plus the default overscan of five below them; nothing
    // above, since the window is already at the start.
    expect(c.count).to.equal(10);
  });

  it('defaults the overscan to 5 when the host does not supply one', () => {
    const host = mount('<vc-probe></vc-probe>');
    const c = new VirtualController(host, {
      getViewport: () => viewport(200, 100),
      getTotal: () => 1000,
      getRowHeight: () => 10,
    });
    c.measure();
    expect(c.start).to.equal(15);
  });

  it('cancels a scheduled frame on disconnect', async () => {
    const s = harness();
    s.controller.schedule();
    expect(s.controller._rafId).to.not.equal(undefined);
    s.controller.hostDisconnected();
    expect(s.controller._rafId).to.equal(undefined);
    await nextFrame();
    expect(s.controller.count, 'the cancelled frame did not measure').to.equal(0);
  });
});

describe('VirtualController: its consumers use it', () => {
  afterEach(cleanup);

  // The half the probe cannot show. Each of these was its own copy of the
  // arithmetic until 4.2, and an extraction that left one behind would look
  // exactly like one that did not. arc-data-table was the third consumer —
  // and the source of the zero-clamp bug the direct cases pin — until it was
  // removed with the merges; the bug's reproduction stays above because the
  // controller is where it lived, not the component.
  const cases = [
    ['arc-virtual-list', '<arc-virtual-list></arc-virtual-list>'],
    ['arc-data-grid', '<arc-data-grid virtual></arc-data-grid>'],
  ];

  for (const [tag, markup] of cases) {
    it(`${tag} windows through the shared controller`, async () => {
      const el = mount(markup);
      await el.updateComplete;
      expect(el._window, `${tag} has a VirtualController`).to.be.instanceOf(VirtualController);
    });
  }

  it('exposes overscan on the grid, not only on the list', async () => {
    // V4-PLAN 4.2 requires it on the merged grid. It was public on
    // arc-virtual-list and hardcoded to 5 in both of the tables the grid
    // replaced — a divergence that survived because the copies of the
    // arithmetic never met.
    const el = mount('<arc-data-grid></arc-data-grid>');
    await el.updateComplete;
    expect(el.overscan).to.equal(5);
    el.overscan = 12;
    await el.updateComplete;
    expect(el._window.opts.getOverscan()).to.equal(12);
  });
});
