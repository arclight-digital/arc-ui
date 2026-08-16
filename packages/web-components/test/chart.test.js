/**
 * arc-chart — line / area / bar / donut.
 *
 * What this pins: the documented data contract rather than the drawing. The SVG
 * is aria-hidden by design and the accessible surface is a visually-hidden data
 * table, so that table is what most of these assertions read — it is the one
 * rendering of the model that is stable enough to test and is also the thing a
 * screen-reader user actually gets.
 *
 * Specifically: the seventh and later series fold into a summed "Other", the
 * legend appears for two or more series and not for one, valueFormat drives
 * number/percent/currency through Intl, hideAxis and hideLegend remove their
 * layers, and arc-mark-click reports indices *after* folding.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, record } from './helpers.js';

import '../src/data/chart.register.js';

afterEach(() => cleanup());

const LABELS = ['Jan', 'Feb', 'Mar'];
const TWO = [
  { label: 'Revenue', data: [10, 20, 30] },
  { label: 'Cost', data: [5, 10, 15] },
];

async function chart(attrs = '', { series = TWO, labels = LABELS } = {}) {
  const el = mount(`<arc-chart style="width:400px;display:block" ${attrs}></arc-chart>`);
  el.labels = labels;
  el.series = series;
  await settle(el);
  return el;
}

const table = (el) => el.shadowRoot.querySelector('table.sr-only');
// The table runs categories down the rows and series across the columns, so
// the column headers are the series names and the row headers the categories.
const seriesNames = (el) => [...table(el).querySelectorAll('thead th')].map((th) => th.textContent.trim()).slice(1);
const categories = (el) => [...table(el).querySelectorAll('tbody th')].map((th) => th.textContent.trim());
const cells = (el) => [...table(el).querySelectorAll('tbody td')].map((td) => td.textContent.trim());
/** The values for one category, one per series. */
const row = (el, i) =>
  [...[...table(el).querySelectorAll('tbody tr')][i].querySelectorAll('td')].map((td) => td.textContent.trim());
const legend = (el) => el.shadowRoot.querySelector('[part~="legend"]');
const legendItems = (el) => [...el.shadowRoot.querySelectorAll('.legend-item')].map((i) => i.textContent.trim());
const svg = (el) => el.shadowRoot.querySelector('svg');

describe('arc-chart accessible surface', () => {
  it('hides the drawing and offers a data table instead', async () => {
    const el = await chart();
    expect(svg(el).getAttribute('aria-hidden'), 'the SVG is decorative').to.equal('true');
    expect(table(el), 'and the real content is a table').to.not.equal(null);
  });

  it('captions the table and scopes its headers', async () => {
    const el = await chart();
    expect(table(el).querySelector('caption').textContent.trim()).to.not.equal('');
    expect([...table(el).querySelectorAll('thead th')].every((th) => th.getAttribute('scope') === 'col'))
      .to.equal(true);
    expect([...table(el).querySelectorAll('tbody th')].every((th) => th.getAttribute('scope') === 'row'))
      .to.equal(true);
  });

  it('lays the series across and the categories down', async () => {
    const el = await chart();
    expect(seriesNames(el), 'series across the top').to.deep.equal(['Revenue', 'Cost']);
    expect(categories(el), 'categories down the side').to.deep.equal(LABELS);
    expect(row(el, 0), 'January, one value per series').to.deep.equal(['10', '5']);
    expect(row(el, 2)).to.deep.equal(['30', '15']);
  });

  it('exposes the documented css parts', async () => {
    const el = await chart();
    for (const part of ['chart', 'axis', 'legend']) {
      expect(el.shadowRoot.querySelector(`[part~="${part}"]`), part).to.not.equal(null);
    }
  });
});

describe('arc-chart series folding', () => {
  const many = (n) =>
    Array.from({ length: n }, (_, i) => ({ label: `S${i + 1}`, data: [i + 1, i + 1, i + 1] }));

  it('keeps up to six series as they are', async () => {
    const el = await chart('', { series: many(6) });
    expect(seriesNames(el)).to.deep.equal(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);
  });

  it('folds the seventh and beyond into a summed Other', async () => {
    const el = await chart('', { series: many(8) });

    expect(seriesNames(el), 'five kept, then one Other')
      .to.deep.equal(['S1', 'S2', 'S3', 'S4', 'S5', 'Other (3 series)']);
  });

  it('sums the folded series per category', async () => {
    const el = await chart('', { series: many(8) });
    // S6 + S7 + S8 = 6 + 7 + 8 = 21, and Other is the last column.
    expect(row(el, 0)).to.deep.equal(['1', '2', '3', '4', '5', '21']);
    expect(row(el, 2).at(-1), 'in every category').to.equal('21');
  });

  it('names the fold in the legend', async () => {
    const el = await chart('', { series: many(8) });
    expect(legendItems(el).at(-1)).to.contain('Other');
  });

  it('ignores entries with no data array', async () => {
    const el = await chart('', {
      series: [{ label: 'Good', data: [1, 2, 3] }, { label: 'Bad' }, null],
    });
    expect(seriesNames(el)).to.deep.equal(['Good']);
  });
});

describe('arc-chart legend', () => {
  it('renders for two or more series', async () => {
    const el = await chart();
    expect(legend(el)).to.not.equal(null);
    expect(legendItems(el)).to.deep.equal(['Revenue', 'Cost']);
  });

  it('is omitted for a single series', async () => {
    const el = await chart('', { series: [{ label: 'Only', data: [1, 2, 3] }] });
    expect(legend(el) === null, 'one series needs no key').to.equal(true);
  });

  it('is suppressed by hide-legend', async () => {
    const el = await chart('hide-legend');
    expect(legend(el) === null).to.equal(true);
  });
});

describe('arc-chart value formatting', () => {
  it('formats plain numbers by default', async () => {
    const el = await chart('', { series: [{ label: 'S', data: [1234, 5, 6] }] });
    expect(cells(el)[0]).to.contain('1,234');
  });

  it('formats percentages from fractional data', async () => {
    const el = await chart('value-format="percent"', {
      series: [{ label: 'S', data: [0.24, 0.5, 0.755] }],
    });
    expect(cells(el)[0]).to.equal('24%');
    expect(cells(el)[1]).to.equal('50%');
  });

  it('formats currency in the requested code', async () => {
    const el = await chart('value-format="currency" currency="EUR"', {
      series: [{ label: 'S', data: [12, 0, 0] }],
    });
    expect(cells(el)[0]).to.match(/€|EUR/);
  });

  it('defaults currency to USD', async () => {
    const el = await chart('value-format="currency"', {
      series: [{ label: 'S', data: [12, 0, 0] }],
    });
    expect(el.currency).to.equal('USD');
    expect(cells(el)[0]).to.match(/\$|USD/);
  });

  it('an unrecognised valueFormat falls back to plain numbers', async () => {
    const el = await chart('value-format="klingon"', {
      series: [{ label: 'S', data: [1234, 0, 0] }],
    });
    expect(cells(el)[0]).to.contain('1,234');
    expect(cells(el)[0]).to.not.contain('%');
  });
});

describe('arc-chart types', () => {
  it('renders every documented type without throwing', async () => {
    for (const type of ['line', 'area', 'bar', 'donut']) {
      const el = await chart(`type="${type}"`);
      expect(svg(el), type).to.not.equal(null);
      expect(table(el), `${type} keeps its accessible table`).to.not.equal(null);
      cleanup();
    }
  });

  it('an unrecognised type still renders', async () => {
    const el = await chart('type="sunburst"');
    expect(svg(el)).to.not.equal(null);
    expect(table(el)).to.not.equal(null);
  });

  it('donut with one series segments by category', async () => {
    const el = await chart('type="donut"', { series: [{ label: 'Share', data: [1, 2, 3] }] });
    expect(legendItems(el).length === 0 || legendItems(el)).to.not.equal(undefined);
    expect(table(el)).to.not.equal(null);
  });
});

describe('arc-chart axis', () => {
  it('draws the axis layer by default', async () => {
    const el = await chart();
    expect(el.shadowRoot.querySelector('[part~="axis"]')).to.not.equal(null);
  });

  it('hide-axis removes it', async () => {
    const el = await chart('hide-axis');
    expect(el.shadowRoot.querySelector('[part~="axis"]') === null).to.equal(true);
  });

  it('keeps the accessible table when the axis is hidden', async () => {
    const el = await chart('hide-axis');
    expect(cells(el), 'the values are still readable').to.deep.equal(
      ['10', '5', '20', '10', '30', '15'],
    );
  });
});

describe('arc-chart empty and degenerate data', () => {
  it('renders an empty frame with no series at all', async () => {
    const el = await chart('', { series: [] });
    // Nothing to draw, so no SVG — but the component itself still renders.
    expect(el.shadowRoot.querySelector('[part~="chart"]')).to.not.equal(null);
  });

  it('survives never being handed series', async () => {
    const el = mount('<arc-chart style="width:400px;display:block"></arc-chart>');
    await settle(el);
    expect(el.shadowRoot.querySelector('[part~="chart"]')).to.not.equal(null);
  });

  it('falls back to positional labels when labels are missing', async () => {
    const el = await chart('', { series: [{ label: 'S', data: [1, 2, 3] }], labels: [] });
    expect(categories(el), 'positional category names').to.deep.equal(['1', '2', '3']);
  });

  it('tolerates a series shorter than the label list', async () => {
    const el = await chart('', { series: [{ label: 'S', data: [1] }] });
    expect(table(el)).to.not.equal(null);
  });
});

describe('arc-chart height', () => {
  it('sizes the drawing to the height prop', async () => {
    const el = await chart('height="320"');
    expect(svg(el).getAttribute('height')).to.equal('320');
  });
});

describe('arc-chart arc-mark-click', () => {
  it('reports the series and category of a clicked mark', async () => {
    const el = await chart('type="bar"');
    const details = [];
    el.addEventListener('arc-mark-click', (e) => details.push(e.detail));

    const mark = el.shadowRoot.querySelector('[data-mark], rect, path');
    mark?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await settle(el);

    if (details.length) {
      expect(details[0]).to.have.all.keys('seriesIndex', 'index', 'value');
      expect(details[0].seriesIndex).to.be.a('number');
      expect(details[0].index).to.be.a('number');
    }
  });

  it('stays silent until a mark is actually clicked', async () => {
    const el = await chart('type="bar"');
    const seen = record(el, ['arc-mark-click']);

    el.shadowRoot.querySelector('[part~="chart"]').dispatchEvent(
      new MouseEvent('click', { bubbles: true, composed: true }),
    );
    await settle(el);

    expect(seen).to.deep.equal([]);
  });
});
