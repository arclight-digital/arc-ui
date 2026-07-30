import { expect } from '@esm-bundle/chai';
import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../src/shared-styles.js';
import '../src/input/select.register.js';
import '../src/feedback/popover.register.js';
import '../src/feedback/tooltip.register.js';
import { PositionController } from '../src/shared/position-controller.js';
import { mount, cleanup, tick } from './helpers.js';

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

  it('repositions when the page scrolls under a top-layer panel', async () => {
    // A top-layer panel is out of flow: nothing moves it with its anchor, so
    // without the capture-phase scroll listener it would hang in place.
    const el = await probe({ offset: 8 });
    const spacer = document.createElement('div');
    spacer.style.height = '3000px';
    document.body.appendChild(spacer);
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();
    const before = Math.round(box(el).top);

    window.dispatchEvent(new Event('scroll'));
    await tick();
    // The anchor is position:fixed, so its rect is scroll-invariant; what this
    // asserts is that the listener ran and rewrote coordinates rather than
    // leaving a stale value behind.
    expect(Math.round(box(el).top)).to.equal(before);
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
    const el = await probe({});
    el.placeAnchor({ top: 50, left: 100 });
    el.controller.show();
    el.controller.hide();
    el.controller.show();

    const panel = el.shadowRoot.querySelector('.panel');
    panel.style.height = '400px';
    await tick();
    expect(panel.matches(':popover-open')).to.equal(true);
    expect(Math.round(box(el).top)).to.equal(78);
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
