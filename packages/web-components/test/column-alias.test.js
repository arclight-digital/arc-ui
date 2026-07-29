import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/data/data-table.register.js';
import '../src/content/column.register.js';

const ROWS = [
  { name: 'Ada', role: 'Engineer' },
  { name: 'Grace', role: 'Admiral' },
];

/** Text of every body cell, row-major. */
function cells(table) {
  return [...table.shadowRoot.querySelectorAll('td')].map((td) => td.textContent.trim());
}

afterEach(cleanup);

describe('arc-column field/key alias', () => {
  it('reads rows through `field`', async () => {
    const table = mount(`
      <arc-data-table>
        <arc-column field="name" label="Name"></arc-column>
      </arc-data-table>
    `);
    table.rows = ROWS;
    await table.updateComplete;
    await tick();
    await table.updateComplete;
    expect(cells(table)).to.deep.equal(['Ada', 'Grace']);
  });

  it('still reads rows through the legacy `key`', async () => {
    const table = mount(`
      <arc-data-table>
        <arc-column key="name" label="Name"></arc-column>
      </arc-data-table>
    `);
    table.rows = ROWS;
    await table.updateComplete;
    await tick();
    await table.updateComplete;
    expect(cells(table)).to.deep.equal(['Ada', 'Grace']);
  });

  it('prefers `field` when both are set', async () => {
    const table = mount(`
      <arc-data-table>
        <arc-column field="role" key="name" label="Which"></arc-column>
      </arc-data-table>
    `);
    table.rows = ROWS;
    await table.updateComplete;
    await tick();
    await table.updateComplete;
    expect(cells(table)).to.deep.equal(['Engineer', 'Admiral']);
  });

  it('exposes the resolved name on the column element', () => {
    const col = mount('<arc-column field="role" key="name"></arc-column>');
    expect(col.fieldName).to.equal('role');

    const legacy = mount('<arc-column key="name"></arc-column>');
    expect(legacy.fieldName).to.equal('name');

    const empty = mount('<arc-column></arc-column>');
    expect(empty.fieldName).to.equal('');
  });
});
