import { expect } from '@esm-bundle/chai';
import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../src/shared-styles.js';
import '../src/input/select.register.js';
import '../src/feedback/popover.register.js';
import '../src/feedback/tooltip.register.js';
import { PositionController } from '../src/shared/position-controller.js';
import { mount, cleanup, tick, until, observed } from './helpers.js';

/**
 * A minimal host so placement maths can be tested against a known anchor rect
 * without a real component's styling in the way. The anchor is positioned
 * absolutely by each test.
 */
class PositionProbe extends LitElement {
  // tokenStyles included because every real component has it, and it carries the
  // zero-specificity [popover] reset the measurements depend on.
  static styles = [
    tokenStyles,
    css`
      .anchor { position: fixed; width: 100px; height: 20px; }
      .panel { width: 120px; height: 80px; background: #000; }
      .panel:not([data-managed]) { position: absolute; top: 100%; left: 50%; }
    `,
  ];

  createController(opts = {}) {
    this.controller = new PositionController(this, {
      anchor: () => this.shadowRoot.querySelector('.anchor'),
      floating: () => this.shadowRoot.querySelector('.panel'),
      ...opts,
    });
    return this.controller;
  }

  placeAnchor({ top, left }) {
    const a = this.shadowRoot.querySelector('.anchor');
    a.style.top = `${top}px`;
    a.style.left = `${left}px`;
  }

  render() {
    return html`<div class="anchor"></div><div class="panel"></div>`;
  }
}
customElements.define('position-probe', PositionProbe);

async function probe(opts) {
  const el = mount('<position-probe></position-probe>');
  await el.updateComplete;
  el.createController(opts);
  return el;
}

function box(el) {
  return el.shadowRoot.querySelector('.panel').getBoundingClientRect();
}

/** Nodes appended outside mount(), torn down by the hook below. */
const cleanupNodes = [];
afterEach(() => {
  while (cleanupNodes.length) cleanupNodes.pop().remove();
  window.scrollTo(0, 0);
});

/**
 * A probe on a tall page with an anchor that scrolls with it.
 *
 * The default probe anchors to a `position: fixed` element on purpose — it
 * makes the placement arithmetic independent of scroll. That is exactly wrong
 * for testing the scroll listener, whose whole job is to notice the anchor
 * moving, so this variant puts the anchor in the page's coordinate space.
 */
async function scrollingPage(opts) {
  const spacer = document.createElement('div');
  spacer.style.height = '3000px';
  document.body.appendChild(spacer);
  cleanupNodes.push(spacer);

  const el = await probe(opts);
  el.shadowRoot.querySelector('.anchor').style.position = 'absolute';
  return el;
}

describe('PositionController placement', () => {
  afterEach(cleanup);

  it('rests below the anchor when there is room', async () => {
    const el = await probe({ offset: 8 });
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();

    const panel = box(el);
    expect(el.controller.placement).to.equal('bottom');
    // anchor bottom (50 + 20) + offset
    expect(Math.round(panel.top)).to.equal(78);
    // centred: anchor centre 150, half panel width 60
    expect(Math.round(panel.left)).to.equal(90);
  });

  it('flips above the anchor when the panel would overflow the bottom edge', async () => {
    const el = await probe({ offset: 8 });
    el.placeAnchor({ top: window.innerHeight - 40, left: 100 });
    el.controller.show();

    expect(el.controller.placement).to.equal('top');
    expect(el.shadowRoot.querySelector('.panel').dataset.placement).to.equal('top');
  });

  it('stays on the requested side when neither side fits', async () => {
    // A panel taller than the viewport cannot fit above or below; flipping would
    // trade one bad fit for another and lose the author's intent.
    const el = await probe({ offset: 8 });
    el.shadowRoot.querySelector('.panel').style.height = `${window.innerHeight + 200}px`;
    el.placeAnchor({ top: window.innerHeight - 40, left: 100 });
    el.controller.show();

    expect(el.controller.placement).to.equal('bottom');
  });

  it('shifts along the cross axis to stay inside the left edge', async () => {
    const el = await probe({ offset: 8, padding: 8 });
    el.placeAnchor({ top: 50, left: 0 });
    el.controller.show();

    // Centring would put the panel at -10; the shift pass pulls it to padding.
    expect(Math.round(box(el).left)).to.equal(8);
  });

  it('shifts along the cross axis to stay inside the right edge', async () => {
    const el = await probe({ offset: 8, padding: 8 });
    el.placeAnchor({ top: 50, left: window.innerWidth - 100 });
    el.controller.show();

    expect(Math.round(box(el).right)).to.equal(window.innerWidth - 8);
  });

  it('keeps the start edge on screen when the panel is wider than the viewport', async () => {
    // clamp() biases to the minimum with an inverted range: the panel's first
    // focusable content is at its start edge, so that is the edge to save.
    const el = await probe({ offset: 8, padding: 8 });
    el.shadowRoot.querySelector('.panel').style.width = `${window.innerWidth + 200}px`;
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();

    expect(Math.round(box(el).left)).to.equal(8);
  });

  it('resolves an unrecognised placement exactly as the default', async () => {
    // Mirrors the CSS enum-fallback contract: position="sideways" behaves as if
    // the attribute were absent.
    const bogus = await probe({ placement: () => 'sideways', offset: 8 });
    bogus.placeAnchor({ top: 50, left: 100 });
    bogus.controller.show();

    const absent = await probe({ offset: 8 });
    absent.placeAnchor({ top: 50, left: 100 });
    absent.controller.show();

    expect(bogus.controller.placement).to.equal('bottom');
    expect(Math.round(box(bogus).top)).to.equal(Math.round(box(absent).top));
  });

  it('aligns to the anchor edges on request', async () => {
    const start = await probe({ align: () => 'start', offset: 8 });
    start.placeAnchor({ top: 50, left: 200 });
    start.controller.show();
    expect(Math.round(box(start).left)).to.equal(200);

    const end = await probe({ align: () => 'end', offset: 8 });
    end.placeAnchor({ top: 50, left: 200 });
    end.controller.show();
    // anchor right edge is 300; the panel's right edge meets it
    expect(Math.round(box(end).right)).to.equal(300);
  });

  it('matches the anchor width when asked', async () => {
    const el = await probe({ matchWidth: true });
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();
    expect(Math.round(box(el).width)).to.equal(100);
  });

  it('follows an anchor the page scrolled out from under it', async () => {
    // A top-layer panel is out of flow: nothing moves it with its anchor, so
    // without the scroll listener it hangs in place.
    //
    // This used to anchor to the probe's `position: fixed` element, whose rect
    // is scroll-invariant — so it asserted the panel had *not* moved, which is
    // equally true of a controller that never registered a listener at all.
    // Every mutant of that registration survived it.
    const el = await scrollingPage({ offset: 8 });
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();
    expect(Math.round(box(el).top), 'anchor bottom + offset').to.equal(78);
    // Let the ResizeObserver's first delivery land before the scroll. It calls
    // _update() on its own, and if it arrives after the scroll it repositions
    // the panel correctly whether or not a scroll listener exists — which is
    // how every mutant of that registration used to survive this file.
    await observed();

    window.scrollTo(0, 40);
    await until(() => Math.round(box(el).top) === 38);
    expect(Math.round(box(el).top), 'the panel came with it').to.equal(38);
  });

  it('re-arms the scroll listener after a hide/show cycle', async () => {
    // hide() removes the listeners; the next show() has to put them back, which
    // it decides from `_shown` having actually been cleared.
    const el = await scrollingPage({ offset: 8 });
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();
    el.controller.hide();
    el.controller.show();
    await observed();

    window.scrollTo(0, 40);
    await until(() => Math.round(box(el).top) === 38);
    expect(Math.round(box(el).top)).to.equal(38);
  });

  it('follows an anchor inside a scrolling ancestor', async () => {
    // scroll does not bubble, so only a capture-phase listener on window sees
    // an inner scroll container move. Without capture the page-level test above
    // still passes and this one does not.
    const scroller = document.createElement('div');
    scroller.style.cssText = 'height: 200px; overflow: auto; position: relative;';
    scroller.innerHTML = '<div style="height: 2000px"></div>';
    document.body.appendChild(scroller);
    cleanupNodes.push(scroller);

    const el = document.createElement('position-probe');
    scroller.prepend(el);
    await el.updateComplete;
    el.createController({ offset: 8 });
    el.shadowRoot.querySelector('.anchor').style.position = 'absolute';
    el.placeAnchor({ top: 40, left: 100 });
    el.controller.show();
    // Read rather than assumed: the scroll container sits at whatever the body
    // margin puts it at, and only the delta matters here.
    const anchorBottom = el.shadowRoot.querySelector('.anchor').getBoundingClientRect().bottom;
    const before = Math.round(box(el).top);
    expect(before, 'anchor bottom + offset').to.equal(Math.round(anchorBottom) + 8);
    await observed();

    scroller.scrollTop = 30;
    await until(() => Math.round(box(el).top) === before - 30);
    expect(Math.round(box(el).top)).to.equal(before - 30);
  });
});

/**
 * The horizontal axis, which nothing above reached.
 *
 * Every placement assertion in this file was `top` or `bottom`, so the whole
 * `else` arm of the main-axis branch — the side maths and both cross-axis
 * alignments on it — was written and never run. Six mutants lived there.
 */
describe('PositionController placement: left and right', () => {
  afterEach(cleanup);

  it('rests to the right of the anchor, centred on it', async () => {
    const el = await probe({ placement: () => 'right', offset: 8 });
    el.placeAnchor({ top: 200, left: 200 });
    el.controller.show();

    expect(el.controller.placement).to.equal('right');
    // anchor right (200 + 100) + offset
    expect(Math.round(box(el).left)).to.equal(308);
    // centred on a 20px anchor with an 80px panel: 200 + (20 - 80) / 2
    expect(Math.round(box(el).top)).to.equal(170);
  });

  it('rests to the left of the anchor', async () => {
    const el = await probe({ placement: () => 'left', offset: 8 });
    el.placeAnchor({ top: 200, left: 300 });
    el.controller.show();

    expect(el.controller.placement).to.equal('left');
    expect(Math.round(box(el).right)).to.equal(292);
  });

  it('aligns to the anchor top and bottom on a side placement', async () => {
    const start = await probe({ placement: () => 'right', align: () => 'start', offset: 8 });
    start.placeAnchor({ top: 200, left: 200 });
    start.controller.show();
    expect(Math.round(box(start).top), 'start meets the anchor top').to.equal(200);

    const end = await probe({ placement: () => 'right', align: () => 'end', offset: 8 });
    end.placeAnchor({ top: 200, left: 200 });
    end.controller.show();
    expect(Math.round(box(end).bottom), 'end meets the anchor bottom').to.equal(220);
  });
});

/**
 * The flip decision at its boundary.
 *
 * `_flip` asks whether the space available is `>= h`. Every fit test above is
 * comfortably inside or comfortably outside, and a `>` reads identically to a
 * `>=` everywhere except at the exact fit — so all four comparisons survived.
 * Each case here places the anchor so the preferred side fits to the pixel,
 * and its pair moves it one pixel to prove the fixture can fail.
 */
describe('PositionController flip: the exact fit', () => {
  afterEach(cleanup);

  // The probe's panel is 120x80 and its anchor 100x20; offset and padding are
  // 8 each, so a side fits exactly when the gap is 80 (or 120) + 16.
  const EXACT = [
    { placement: 'bottom', opposite: 'top', at: () => ({ top: window.innerHeight - 116, left: 200 }), tighter: { top: 1 } },
    { placement: 'top', opposite: 'bottom', at: () => ({ top: 96, left: 200 }), tighter: { top: -1 } },
    { placement: 'right', opposite: 'left', at: () => ({ top: 200, left: window.innerWidth - 236 }), tighter: { left: 1 } },
    { placement: 'left', opposite: 'right', at: () => ({ top: 200, left: 136 }), tighter: { left: -1 } },
  ];

  for (const { placement, opposite, at, tighter } of EXACT) {
    it(`stays on ${placement} when it fits to the pixel`, async () => {
      const el = await probe({ placement: () => placement, offset: 8, padding: 8 });
      el.placeAnchor(at());
      el.controller.show();
      expect(el.controller.placement).to.equal(placement);
    });

    it(`flips off ${placement} one pixel short`, async () => {
      const el = await probe({ placement: () => placement, offset: 8, padding: 8 });
      const spot = at();
      el.placeAnchor({
        top: spot.top + (tighter.top ?? 0),
        left: spot.left + (tighter.left ?? 0),
      });
      el.controller.show();
      expect(el.controller.placement).to.equal(opposite);
    });
  }
});

describe('PositionController: the opt-outs', () => {
  afterEach(cleanup);

  it('flip: false keeps the requested side even where it does not fit', async () => {
    // The same fixture as "flips above the anchor when the panel would overflow
    // the bottom edge", which is this one's anti-vacuity pair.
    const el = await probe({ offset: 8, flip: false });
    el.placeAnchor({ top: window.innerHeight - 40, left: 100 });
    el.controller.show();
    expect(el.controller.placement).to.equal('bottom');
  });

  it('shift: false leaves the panel hanging off the cross-axis edge', async () => {
    // Pairs with "shifts along the cross axis to stay inside the left edge",
    // which is the same anchor with shifting left on.
    const el = await probe({ offset: 8, padding: 8, shift: false });
    el.placeAnchor({ top: 50, left: 0 });
    el.controller.show();
    // Centring on a 100px anchor puts a 120px panel at -10, and nothing pulls
    // it back: the main-axis clamp below only touches the other axis.
    expect(Math.round(box(el).left)).to.equal(-10);
  });

  it('constrainSize caps the panel to the room below it', async () => {
    const el = await probe({ offset: 8, padding: 8, constrainSize: true, flip: false });
    el.placeAnchor({ top: 100, left: 100 });
    el.controller.show();
    const panel = el.shadowRoot.querySelector('.panel');
    // viewport height less the anchor bottom, the offset and the padding
    expect(panel.style.maxHeight).to.equal(`${window.innerHeight - 120 - 16}px`);
  });

  it('constrainSize caps the panel to the room above it', async () => {
    const el = await probe({
      placement: () => 'top', offset: 8, padding: 8, constrainSize: true, flip: false,
    });
    el.placeAnchor({ top: 300, left: 100 });
    el.controller.show();
    const panel = el.shadowRoot.querySelector('.panel');
    expect(panel.style.maxHeight).to.equal('284px');
  });
});

describe('PositionController: an anchor that is not there', () => {
  afterEach(cleanup);

  it('does nothing at all when the anchor callback returns nothing', async () => {
    const el = await probe({ anchor: () => null });
    el.controller.show();
    expect(el.shadowRoot.querySelector('.panel').style.top, 'never positioned').to.equal('');
  });

  it('freezes rather than re-measuring an anchor that left the document', async () => {
    // A detached element measures as a zero rect at the origin, which would
    // teleport the panel to the top-left corner mid-close.
    const el = mount('<position-probe></position-probe>');
    await el.updateComplete;
    const anchor = el.shadowRoot.querySelector('.anchor');
    el.createController({ offset: 8, anchor: () => anchor });
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();
    expect(Math.round(box(el).top)).to.equal(78);

    anchor.remove();
    el.controller.show();
    expect(Math.round(box(el).top), 'held its last good position').to.equal(78);
  });
});

describe('PositionController top-layer adoption', () => {
  afterEach(cleanup);

  it('applies popover="manual" on first show, not at construction', async () => {
    const el = await probe({});
    const panel = el.shadowRoot.querySelector('.panel');
    expect(panel.hasAttribute('popover'), 'before show').to.equal(false);

    el.controller.show();
    expect(panel.getAttribute('popover')).to.equal('manual');
    expect(panel.matches(':popover-open')).to.equal(true);
  });

  it('marks the panel data-managed so the CSS fallback stands down', async () => {
    const el = await probe({});
    expect(el.shadowRoot.querySelector('.panel').dataset.managed).to.equal(undefined);
    el.controller.show();
    expect(el.shadowRoot.querySelector('.panel').dataset.managed).to.equal('');
  });

  it('leaves the top layer on hide', async () => {
    const el = await probe({});
    el.controller.show();
    el.controller.hide();
    expect(el.shadowRoot.querySelector('.panel').matches(':popover-open')).to.equal(false);
    expect(el.controller.placement).to.equal(null);
  });

  it('hides when the host disconnects', async () => {
    const el = await probe({});
    el.controller.show();
    const panel = el.shadowRoot.querySelector('.panel');
    el.remove();
    await tick();
    expect(panel.matches(':popover-open')).to.equal(false);
  });

  it('tolerates repeated show() calls', async () => {
    const el = await probe({});
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();
    el.controller.show();
    expect(el.shadowRoot.querySelector('.panel').matches(':popover-open')).to.equal(true);
  });

  it('leaves a popover value it did not write alone', async () => {
    // The attribute is only ever *added*. A panel that already declares its own
    // mode keeps it — the controller has no business rewriting a value it did
    // not set, and re-setting one it did is churn on every reposition.
    const el = await probe({});
    const panel = el.shadowRoot.querySelector('.panel');
    panel.setAttribute('popover', 'auto');
    el.controller.show();
    expect(panel.getAttribute('popover')).to.equal('auto');
  });

  it('hides cleanly when something else already closed the popover', async () => {
    // hidePopover() on a popover that is not showing throws. The guard is what
    // keeps a component closing mid-frame from taking hide() down with it.
    const el = await probe({});
    el.controller.show();
    const panel = el.shadowRoot.querySelector('.panel');
    panel.hidePopover();

    el.controller.hide();
    expect(panel.matches(':popover-open')).to.equal(false);
  });
});

describe('PositionController virtual anchors', () => {
  afterEach(cleanup);

  it('positions against a bare point, for a pointer-anchored menu', async () => {
    const el = await probe({ anchor: () => ({ x: 120, y: 60 }), align: () => 'start', offset: 0 });
    el.controller.show();

    const panel = box(el);
    expect(Math.round(panel.left)).to.equal(120);
    expect(Math.round(panel.top)).to.equal(60);
  });

  it('flips a point-anchored panel up near the bottom edge', async () => {
    const el = await probe({
      anchor: () => ({ x: 120, y: window.innerHeight - 10 }),
      align: () => 'start',
      offset: 0,
    });
    el.controller.show();
    expect(el.controller.placement).to.equal('top');
  });

  it('applies crossOffset along the cross axis', async () => {
    // Menubar's submenus use a negative crossOffset to cancel the parent
    // panel's padding.
    const el = await probe({ placement: () => 'right', align: () => 'start', crossOffset: -9 });
    el.placeAnchor({ top: 100, left: 100 });
    el.controller.show();
    expect(Math.round(box(el).top)).to.equal(91);
  });
});

describe('PositionController panel identity', () => {
  afterEach(cleanup);

  it('adopts a replacement panel element', async () => {
    // breadcrumb-menu renders a fresh dropdown for whichever crumb is open, so
    // the panel is a different element each time. A once-only adoption flag
    // would leave every panel after the first in the normal layer.
    const el = await probe({});
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();
    const first = el.shadowRoot.querySelector('.panel');

    const replacement = first.cloneNode();
    first.replaceWith(replacement);
    el.controller.show();

    expect(replacement.getAttribute('popover')).to.equal('manual');
    expect(replacement.matches(':popover-open')).to.equal(true);
    expect(replacement.dataset.managed).to.equal('');
  });

  it('re-observes the panel after a hide/show cycle', async () => {
    // hide() disconnects the ResizeObserver; reopening has to wire it back up or
    // the panel stops tracking its own size changes.
    //
    // Placed above the anchor deliberately: `top = anchor.top - h - offset` is
    // the one coordinate that moves when the panel's height changes. This used
    // to assert a bottom placement, whose top is the same number before and
    // after the resize — so it passed whether or not the observer was wired up,
    // and every mutant of that wiring survived it.
    const el = await probe({ placement: () => 'top', offset: 8 });
    el.placeAnchor({ top: 300, left: 100 });
    el.controller.show();
    await observed();
    el.controller.hide();
    el.controller.show();
    await observed();
    expect(Math.round(box(el).top), 'positioned on reopen').to.equal(212);

    const panel = el.shadowRoot.querySelector('.panel');
    panel.style.height = '200px';
    await until(() => Math.round(box(el).top) === 92);
    expect(panel.matches(':popover-open')).to.equal(true);
  });

  it('re-observes a replacement panel', async () => {
    // The observer has to move to the new element as well as the popover
    // attribute: left watching the panel that was replaced, it reports sizes
    // for an element nobody can see.
    const el = await probe({ placement: () => 'top', offset: 8 });
    el.placeAnchor({ top: 300, left: 100 });
    el.controller.show();
    await observed();

    const first = el.shadowRoot.querySelector('.panel');
    const replacement = first.cloneNode();
    first.replaceWith(replacement);
    el.controller.show();
    await observed();
    expect(Math.round(box(el).top), 'positioned on adoption').to.equal(212);

    replacement.style.height = '200px';
    await until(() => Math.round(box(el).top) === 92);
    expect(Math.round(box(el).top)).to.equal(92);
  });
});

describe('the popover attribute never reaches a template', () => {
  // A [popover] element in a page where JS never runs is display:none forever.
  // Prism exports static HTML from these templates, so baking the attribute in
  // would silently blank every static panel example and kill tooltip's no-JS
  // :hover fallback. The attribute must only ever be applied imperatively.
  it('is absent from every floating component render', async () => {
    const modules = await Promise.all([
      import('../src/input/select.js'),
      import('../src/feedback/popover.js'),
      import('../src/feedback/tooltip.js'),
    ]);

    for (const mod of modules) {
      const [name, Ctor] = Object.entries(mod).find(([k]) => k.startsWith('Arc'));
      const strings = new Ctor().render().strings.join('');
      expect(strings, `${name} template`).to.not.match(/\bpopover\s*=/);
    }
  });
});

describe('arc-menubar nested menus on the top layer', () => {
  afterEach(cleanup);

  async function mountMenubar() {
    await import('../src/navigation/menubar.register.js');
    const el = document.createElement('arc-menubar');
    el.items = [
      { label: 'File', items: [
        { label: 'New' },
        { label: 'Export', items: [{ label: 'PNG' }, { label: 'SVG' }] },
      ] },
    ];
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('puts an open top-level menu in the top layer below its trigger', async () => {
    const el = await mountMenubar();
    el._openTop = 0;
    await el.updateComplete;

    const menu = el.shadowRoot.querySelector('.menu--top');
    expect(menu.matches(':popover-open')).to.equal(true);
    // Anchored to the .top cell, which is the containing block the resting CSS
    // measured its `top: calc(100% + var(--space-xs))` against — so the managed
    // position lands where the unmanaged one did.
    const cell = el.shadowRoot.querySelector('.top');
    // The written coordinate, not a rect: menu-in opens from translateY(-4px),
    // so a rect read on the opening frame is 4px high.
    expect(parseFloat(menu.style.top))
      .to.be.closeTo(cell.getBoundingClientRect().bottom + 4, 1);
  });

  it('holds a menu and its submenu open at once, each positioned', async () => {
    // One controller per menu key: the old code kept a flip Map for the same
    // reason, and a single controller could only place one of the two.
    const el = await mountMenubar();
    el._openTop = 0;
    el._expandedPath = [1];
    await el.updateComplete;

    const menus = [...el.shadowRoot.querySelectorAll('.menu')];
    expect(menus.length, 'menu + submenu').to.equal(2);
    for (const m of menus) {
      expect(m.matches(':popover-open'), m.className).to.equal(true);
      expect(getComputedStyle(m).position).to.equal('fixed');
    }
  });

  it('retires the controller of a menu that closed', async () => {
    const el = await mountMenubar();
    el._openTop = 0;
    await el.updateComplete;
    expect(el._positions.size).to.equal(1);

    el._openTop = -1;
    await el.updateComplete;
    expect(el._positions.size).to.equal(0);
  });
});

describe('arc-select on the top layer', () => {
  afterEach(cleanup);

  async function mountSelect() {
    const el = mount(`
      <arc-select label="Team">
        <arc-option value="a" label="Alpha"></arc-option>
        <arc-option value="b" label="Bravo"></arc-option>
      </arc-select>
    `);
    await el.updateComplete;
    await tick();
    return el;
  }

  it('promotes its dropdown to the top layer when opened', async () => {
    const el = await mountSelect();
    const dropdown = el.shadowRoot.querySelector('.select__dropdown');
    expect(dropdown.hasAttribute('popover'), 'while closed').to.equal(false);

    el.open = true;
    await el.updateComplete;
    expect(dropdown.matches(':popover-open')).to.equal(true);
  });

  it('sizes the dropdown to its trigger', async () => {
    const el = await mountSelect();
    el.open = true;
    await el.updateComplete;

    const trigger = el.shadowRoot.querySelector('.select__trigger');
    const dropdown = el.shadowRoot.querySelector('.select__dropdown');
    // offsetWidth, not a rect: the dropdown-in keyframes open from scale(0.96),
    // so a rect read on the frame it opens reports 96% of the real width. Same
    // reason the controller measures the layout box rather than the visual one.
    expect(dropdown.offsetWidth).to.equal(trigger.offsetWidth);
  });

  it('drops out of the top layer when closed', async () => {
    const el = await mountSelect();
    el.open = true;
    await el.updateComplete;
    el.open = false;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.select__dropdown').matches(':popover-open'))
      .to.equal(false);
  });

  it('escapes an overflow:hidden ancestor', async () => {
    // The whole point of the top layer: a dropdown inside a clipping ancestor
    // used to be cut off at its edge.
    const wrap = document.createElement('div');
    wrap.style.cssText = 'overflow: hidden; height: 40px; width: 200px;';
    document.body.appendChild(wrap);
    const el = document.createElement('arc-select');
    el.label = 'Team';
    wrap.appendChild(el);
    await el.updateComplete;

    el.open = true;
    await el.updateComplete;

    const dropdown = el.shadowRoot.querySelector('.select__dropdown');
    // Painting in the top layer means it is no longer a descendant box of the
    // clipping ancestor as far as layout is concerned: fixed, not absolute.
    expect(getComputedStyle(dropdown).position).to.equal('fixed');
    expect(dropdown.matches(':popover-open')).to.equal(true);
  });
});
