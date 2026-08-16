/**
 * arc-pagination — page range arithmetic, bounds, and the change contract.
 *
 * Until now it was covered only by the derived suites, which pin its declared
 * props and its slots/parts and can say nothing about `_getPageRange()` — the
 * ellipsis truncation that is the entire reason this component is 214 lines
 * rather than 40.
 *
 * Fixture totals are deliberately large and odd (10, 11) with the current page
 * off-centre. A total of 3 makes every branch of the range arithmetic collapse
 * to the same answer, which is the degenerate-fixture trap that made every
 * arithmetic mutant in range-slider unkillable.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, record, only } from './helpers.js';
import '../src/navigation/pagination.register.js';

afterEach(cleanup);

const page = async (attrs = '') => {
  const el = mount(`<arc-pagination ${attrs}></arc-pagination>`);
  await settle(el);
  return el;
};

const pages = (el) => [...el.shadowRoot.querySelectorAll('[part~="page"]')].map((b) => b.textContent.trim());
const rendered = (el) =>
  [...el.shadowRoot.querySelectorAll('[part~="page"], [part~="ellipsis"]')].map((n) =>
    n.getAttribute('part') === 'ellipsis' ? '…' : n.textContent.trim()
  );
const prev = (el) => el.shadowRoot.querySelector('[part~="prev"]');
const next = (el) => el.shadowRoot.querySelector('[part~="next"]');
const active = (el) => el.shadowRoot.querySelector('[aria-current="page"]');

// ---------------------------------------------------------------------------
// The page range
// ---------------------------------------------------------------------------

describe('arc-pagination: the page range', () => {
  it('lists every page when they all fit', async () => {
    const el = await page('total="5" current="3" siblings="5"');
    expect(pages(el)).to.eql(['1', '2', '3', '4', '5']);
  });

  it('truncates both sides when the current page is in the middle', async () => {
    const el = await page('total="10" current="5" siblings="1"');
    expect(rendered(el)).to.eql(['1', '…', '4', '5', '6', '…', '10']);
  });

  it('truncates only the far side near the start', async () => {
    const el = await page('total="10" current="2" siblings="1"');
    expect(rendered(el)).to.eql(['1', '2', '3', '…', '10']);
  });

  it('truncates only the near side at the end', async () => {
    const el = await page('total="10" current="9" siblings="1"');
    expect(rendered(el)).to.eql(['1', '…', '8', '9', '10']);
  });

  it('always keeps the first and last page reachable', async () => {
    const el = await page('total="99" current="50" siblings="0"');
    const shown = rendered(el);
    expect(shown[0], 'first page').to.equal('1');
    expect(shown[shown.length - 1], 'last page').to.equal('99');
  });

  it('widens with siblings', async () => {
    const el = await page('total="11" current="6" siblings="2"');
    expect(rendered(el)).to.eql(['1', '…', '4', '5', '6', '7', '8', '…', '11']);
  });

  it('never emits an ellipsis standing in for a single page', async () => {
    // page - prev > 1 rather than >= 1: with exactly one page hidden, the
    // ellipsis would be wider than the number it replaced and unclickable.
    const el = await page('total="5" current="3" siblings="1"');
    expect(rendered(el)).to.eql(['1', '2', '3', '4', '5']);
  });

  it('renders a single page with no duplicate', async () => {
    // pages is a Set precisely so first and last collapsing to 1 yields one
    // button, not two.
    const el = await page('total="1" current="1"');
    expect(pages(el)).to.eql(['1']);
  });
});

// ---------------------------------------------------------------------------
// Navigation and the change contract
// ---------------------------------------------------------------------------

describe('arc-pagination: navigating', () => {
  it('clicking a page selects it and announces the new value', async () => {
    const el = await page('total="10" current="5" siblings="1"');
    const seen = record(el, ['arc-change']);

    [...el.shadowRoot.querySelectorAll('[part~="page"]')].find((b) => b.textContent.trim() === '6').click();
    await settle(el);

    expect(el.current).to.equal(6);
    expect(only(seen, 'change')).to.eql([['change', 6]]);
  });

  it('clicking the page you are on changes nothing and says nothing', async () => {
    const el = await page('total="10" current="5" siblings="1"');
    const seen = record(el, ['arc-change']);

    active(el).click();
    await settle(el);

    expect(el.current).to.equal(5);
    expect(only(seen, 'change'), 'no event for a no-op').to.eql([]);
  });

  it('previous and next step by one', async () => {
    const el = await page('total="10" current="5" siblings="1"');
    const seen = record(el, ['arc-change']);

    next(el).click();
    await settle(el);
    expect(el.current).to.equal(6);

    prev(el).click();
    await settle(el);
    expect(el.current).to.equal(5);

    expect(only(seen, 'change')).to.eql([['change', 6], ['change', 5]]);
  });

  it('previous is disabled on the first page', async () => {
    const el = await page('total="10" current="1"');
    expect(prev(el).disabled).to.equal(true);
    expect(next(el).disabled).to.equal(false);
  });

  it('next is disabled on the last page', async () => {
    const el = await page('total="10" current="10"');
    expect(next(el).disabled).to.equal(true);
    expect(prev(el).disabled).to.equal(false);
  });

  it('both are disabled when there is only one page', async () => {
    const el = await page('total="1" current="1"');
    expect(prev(el).disabled).to.equal(true);
    expect(next(el).disabled).to.equal(true);
  });

  it('marks exactly one page as current for assistive tech', async () => {
    const el = await page('total="10" current="4" siblings="1"');
    const marked = el.shadowRoot.querySelectorAll('[aria-current="page"]');

    expect(marked.length, 'exactly one').to.equal(1);
    expect(marked[0].textContent.trim()).to.equal('4');
  });
});

// ---------------------------------------------------------------------------
// Compact
// ---------------------------------------------------------------------------

describe('arc-pagination: compact', () => {
  it('replaces the page buttons with a position label', async () => {
    const el = await page('total="10" current="3" compact');
    expect(pages(el), 'no numbered buttons').to.eql([]);
    expect(el.shadowRoot.querySelector('[part~="label"]').textContent.replace(/\s+/g, ' ').trim())
      .to.equal('3 / 10');
  });

  it('still steps with previous and next', async () => {
    const el = await page('total="10" current="3" compact');
    next(el).click();
    await settle(el);

    expect(el.current).to.equal(4);
    expect(el.shadowRoot.querySelector('[part~="label"]').textContent.replace(/\s+/g, ' ').trim())
      .to.equal('4 / 10');
  });
});

// ---------------------------------------------------------------------------
// Out-of-range `current`
// ---------------------------------------------------------------------------

describe('arc-pagination: an out-of-range current', () => {
  // Was three BUG pins (finding #76). `current` is documented as "the currently
  // active page number (1-based)" and was clamped in `_getPageRange()` — the
  // *render* — while the property kept whatever it was handed. Finding #70's
  // shape exactly, and here it stranded the control: nothing carried
  // aria-current, and `_goToPage`'s `page > this.total` guard then refused to
  // walk back in. All three bounds are declarations now.
  it('clamps a page past the end onto the last page', async () => {
    const el = await page('total="5" current="99"');
    expect(el.current, 'the property, not just the render').to.equal(5);
    expect(active(el).textContent.trim(), 'and it is marked current').to.equal('5');
  });

  it('clamps a page below the start onto the first page', async () => {
    const el = await page('total="5" current="0"');
    expect(el.current).to.equal(1);
    expect(active(el).textContent.trim()).to.equal('1');
  });

  it('leaves the control operable rather than stranded', async () => {
    const el = await page('total="5" current="99"');
    const seen = record(el, ['arc-change']);

    expect(prev(el).disabled, 'Previous is available').to.equal(false);
    prev(el).click();
    await settle(el);

    expect(el.current, 'and moves').to.equal(4);
    expect(only(seen, 'change')).to.eql([['change', 4]]);
  });

  it('re-clamps when total shrinks under a legal current', async () => {
    // Why `max` names the `total` *property* rather than a literal: the bound
    // is itself reactive, so narrowing the page count has to pull `current`
    // down with it. A remembered bound could not.
    const el = await page('total="10" current="9"');
    expect(el.current).to.equal(9);

    el.total = 3;
    await settle(el);
    expect(el.current).to.equal(3);
  });

  it('holds total and siblings to their own floors', async () => {
    // `_getPageRange()` clamped these two as well, on its local copies.
    const el = await page('total="0" siblings="-4" current="1"');
    expect(el.total, 'a pager with no pages is still page 1 of 1').to.equal(1);
    expect(el.siblings).to.equal(0);
    expect(rendered(el)).to.eql(['1']);
  });

  it('renders the range from the clamped current', async () => {
    // The render used to compute from a clamped 5 while `el.current` stayed 99
    // — the component displayed one page and held another. Now they agree.
    const el = await page('total="5" current="99" siblings="1"');
    expect(rendered(el)).to.eql(['1', '…', '4', '5']);
    expect(el.current).to.equal(5);
  });
});
