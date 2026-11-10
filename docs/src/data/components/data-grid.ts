import type { ComponentDef } from './_types';

export const dataGrid: ComponentDef = {
  name: 'Data Grid',
  slug: 'data-grid',
  tag: 'arc-data-grid',
  tier: 'data',
  interactivity: 'interactive',
  searchKeywords: ['table', 'data table', 'spreadsheet', 'striped', 'density'],
  description:
    'Grid for tabular data with inline editing, multi-column sorting, pinned columns, row selection and virtual scrolling. Columns are a JavaScript array, and the whole grid is one tab stop with the WAI-ARIA grid keyboard pattern.',

  overview: `DataGrid renders \`rows\`, an array of objects, under \`columns\`, an array of \`{ key, label }\` entries. Both are set as JavaScript properties, not child elements. Each column can add \`sortable\`, \`editable\`, \`pinned\`, a fixed \`width\` and \`align\`. With none of those and \`selectable\` off, it's a plain read-only table.

**It absorbed \`arc-table\` and \`arc-data-table\` in v4.** Three props came from them. \`density="compact"\` tightens cell padding. \`striped\` draws alternating row backgrounds and is on by default, so a plain Table migrates with \`no-striped\`. \`overscan\` sets how many rows render above and below the visible window when \`virtual\` is on (5 by default).

Migrating: Table's positional \`columns: ["A"]\` and \`rows: [["1"]]\` become named keys (\`[{ key, label }]\`) and one object per row, so a column can move without every row moving with it. Data Table's slotted \`<arc-column>\` children become one \`columns\` entry each with the same field names, and its \`sort-column\`/\`sort-direction\` pair becomes a single entry in the multi-sort \`sort\` array, which behaves the same. Selection, virtual scrolling and \`overscan\` are unchanged. See the removal notes for [Table](/docs/components/table), [Data Table](/docs/components/data-table) and [Column](/docs/components/column).

Clicking a sortable header cycles ascending, descending and off, and Shift+click adds the column as a secondary sort. With more than one sort active, each sorted header shows its arrow and a priority number. The grid sorts its own copy of the rows and fires \`arc-sort\` with the whole sort array. With \`manual-sort\`, it leaves the row order alone so you can sort on the server.

In an editable column, Enter or a double-click opens an input in the cell. Enter or blur commits and fires \`arc-cell-change\` with \`{ rowIndex, key, value, row }\`, and Escape cancels. The grid works on a shallow copy, so sorting and edits never change the array you passed in: write edits back to your own data. Reassigning \`rows\` resets the selection and closes any open editor.

The grid is one tab stop. Arrow keys move focus between cells, Home and End go to the ends of a row, Ctrl+Home and Ctrl+End to the corners, Enter sorts a header or edits a cell, and Space toggles row selection.`,

  features: [
    'Pinned columns always come first and stick to the inline-start edge, with a shadow once the grid scrolls sideways',
    '`selectable` adds a checkbox column. The header checkbox selects all and shows an indeterminate state for a partial selection, and `arc-select` sends indices into your original array',
    '`virtual` renders only the visible rows plus the overscan buffer. `row-height` (40 by default) has to match the real row height',
    'The header row stays in view while the body scrolls',
    'CSS parts: `wrapper`, `table`, `header`, `header-cell`, `body`, `row`, `cell`, `editor`',
  ],

  guidelines: {
    do: [
      'For a display-only table, set `no-striped`. That\'s what the removed `arc-table` looked like',
      'Set `manual-sort` and handle `arc-sort` when the data is paginated or sorted on the server',
      'Pin one or two identifying columns, such as an ID or a name',
      'Give pinned columns a `width`. Pinned offsets are computed from it',
      'Turn on `virtual`, with an accurate `row-height`, for long datasets',
      'Raise `overscan` if fast scrolling shows blank rows, and lower it if the number of rows in the DOM is the problem',
    ],
    dont: [
      'Don\'t make every column editable. Limit editing to fields people need to change in place',
      'Don\'t pin so many columns that the rest have no room on narrow screens',
      'Don\'t use `virtual` with rows of different heights. It assumes every row is `row-height` tall',
      'Don\'t raise `overscan` to cover a wrong `row-height`. The blank rows go away, but every scroll position stays slightly off',
      'Don\'t use it for a list of one thing per row. Use `arc-list`, since grid semantics are wrong for that',
    ],
  },

  previewLayout: 'scroll',
  previewHtml: `<div style="width:100%">
  <arc-data-grid id="demo-grid-preview" selectable></arc-data-grid>
</div>`,

  previewSetup: `const grid = el.querySelector('#demo-grid-preview');
if (grid) {
  grid.columns = [
    { key: 'ticker', label: 'Ticker', width: '90px', pinned: true, sortable: true },
    { key: 'name', label: 'Company', width: '180px', sortable: true },
    { key: 'sector', label: 'Sector', sortable: true },
    { key: 'price', label: 'Price', align: 'right', sortable: true, editable: true },
    { key: 'change', label: 'Change %', align: 'right', sortable: true, editable: true }
  ];
  grid.rows = [
    { ticker: 'ARC', name: 'Arclight Systems', sector: 'Technology', price: 142.5, change: 2.4 },
    { ticker: 'LUM', name: 'Lumen Dynamics', sector: 'Energy', price: 87.2, change: -1.1 },
    { ticker: 'NVA', name: 'Nova Materials', sector: 'Industrials', price: 56.8, change: 0.7 },
    { ticker: 'HLX', name: 'Helix Biotech', sector: 'Healthcare', price: 203.1, change: 4.9 },
    { ticker: 'QNT', name: 'Quanta Finance', sector: 'Financials', price: 34.6, change: -0.3 }
  ];
  grid.sort = [{ key: 'price', direction: 'desc' }];
}`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-data-grid id="positions-grid" selectable></arc-data-grid>

<!-- Read-mostly, the way a plain arc-table looked: no selection, no
     editable columns, tighter rows, no stripes. -->
<arc-data-grid id="positions-readonly" density="compact" no-striped></arc-data-grid>

<script type="module">
  import '@arclux/arc-ui/data-grid';

  const grid = document.querySelector('#positions-grid');

  grid.columns = [
    { key: 'ticker', label: 'Ticker', width: '90px', pinned: true, sortable: true },
    { key: 'name', label: 'Company', width: '180px', sortable: true },
    { key: 'sector', label: 'Sector', sortable: true },
    { key: 'price', label: 'Price', align: 'right', sortable: true, editable: true },
    { key: 'change', label: 'Change %', align: 'right', sortable: true, editable: true }
  ];

  grid.rows = [
    { ticker: 'ARC', name: 'Arclight Systems', sector: 'Technology', price: 142.5, change: 2.4 },
    { ticker: 'LUM', name: 'Lumen Dynamics', sector: 'Energy', price: 87.2, change: -1.1 },
    { ticker: 'NVA', name: 'Nova Materials', sector: 'Industrials', price: 56.8, change: 0.7 }
  ];

  grid.addEventListener('arc-cell-change', (e) => {
    const { rowIndex, key, value } = e.detail;
    // write the edit back to your own data store
    console.log('edited', rowIndex, key, value);
  });

  grid.addEventListener('arc-sort', (e) => console.log('sort', e.detail.sort));
  grid.addEventListener('arc-select', (e) => console.log('selected', e.detail.selectedIndices));
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { DataGrid } from '@arclux/arc-ui-react';

const columns = [
  { key: 'ticker', label: 'Ticker', width: '90px', pinned: true, sortable: true },
  { key: 'name', label: 'Company', width: '180px', sortable: true },
  { key: 'sector', label: 'Sector', sortable: true },
  { key: 'price', label: 'Price', align: 'right', sortable: true, editable: true },
  { key: 'change', label: 'Change %', align: 'right', sortable: true, editable: true }
];

const positions = [
  { ticker: 'ARC', name: 'Arclight Systems', sector: 'Technology', price: 142.5, change: 2.4 },
  { ticker: 'LUM', name: 'Lumen Dynamics', sector: 'Energy', price: 87.2, change: -1.1 },
  { ticker: 'NVA', name: 'Nova Materials', sector: 'Industrials', price: 56.8, change: 0.7 }
];

export function PositionsGrid() {
  return (
    <DataGrid
      columns={columns}
      rows={positions}
      selectable
      onArcCellChange={(e) => console.log('edited', e.detail)}
      onArcSort={(e) => console.log('sort', e.detail.sort)}
      onArcSelectionChange={(e) => console.log('selected', e.detail.selectedIndices)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { DataGrid } from '@arclux/arc-ui-vue';

const columns = [
  { key: 'ticker', label: 'Ticker', width: '90px', pinned: true, sortable: true },
  { key: 'name', label: 'Company', width: '180px', sortable: true },
  { key: 'sector', label: 'Sector', sortable: true },
  { key: 'price', label: 'Price', align: 'right', sortable: true, editable: true },
  { key: 'change', label: 'Change %', align: 'right', sortable: true, editable: true }
];

const positions = [
  { ticker: 'ARC', name: 'Arclight Systems', sector: 'Technology', price: 142.5, change: 2.4 },
  { ticker: 'LUM', name: 'Lumen Dynamics', sector: 'Energy', price: 87.2, change: -1.1 },
  { ticker: 'NVA', name: 'Nova Materials', sector: 'Industrials', price: 56.8, change: 0.7 }
];
</script>

<template>
  <DataGrid
    :columns="columns"
    :rows="positions"
    selectable
    @arc-cell-change="(e) => console.log('edited', e.detail)"
    @arc-sort="(e) => console.log('sort', e.detail.sort)"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { DataGrid } from '@arclux/arc-ui-svelte';

  const columns = [
    { key: 'ticker', label: 'Ticker', width: '90px', pinned: true, sortable: true },
    { key: 'name', label: 'Company', width: '180px', sortable: true },
    { key: 'sector', label: 'Sector', sortable: true },
    { key: 'price', label: 'Price', align: 'right', sortable: true, editable: true },
    { key: 'change', label: 'Change %', align: 'right', sortable: true, editable: true }
  ];

  const positions = [
    { ticker: 'ARC', name: 'Arclight Systems', sector: 'Technology', price: 142.5, change: 2.4 },
    { ticker: 'LUM', name: 'Lumen Dynamics', sector: 'Energy', price: 87.2, change: -1.1 },
    { ticker: 'NVA', name: 'Nova Materials', sector: 'Industrials', price: 56.8, change: 0.7 }
  ];
</script>

<DataGrid
  {columns}
  rows={positions}
  selectable
  on:arc-cell-change={(e) => console.log('edited', e.detail)}
  on:arc-sort={(e) => console.log('sort', e.detail.sort)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { DataGrid } from '@arclux/arc-ui-angular';

@Component({
  imports: [DataGrid],
  template: \`
    <arc-data-grid
      [columns]="columns"
      [rows]="positions"
      selectable
      (arcCellChange)="onCellChange($event)"
      (arcSort)="onSort($event)"
    ></arc-data-grid>
  \`,
})
export class PositionsGridComponent {
  columns = [
    { key: 'ticker', label: 'Ticker', width: '90px', pinned: true, sortable: true },
    { key: 'name', label: 'Company', width: '180px', sortable: true },
    { key: 'sector', label: 'Sector', sortable: true },
    { key: 'price', label: 'Price', align: 'right', sortable: true, editable: true },
    { key: 'change', label: 'Change %', align: 'right', sortable: true, editable: true }
  ];

  positions = [
    { ticker: 'ARC', name: 'Arclight Systems', sector: 'Technology', price: 142.5, change: 2.4 },
    { ticker: 'LUM', name: 'Lumen Dynamics', sector: 'Energy', price: 87.2, change: -1.1 },
    { ticker: 'NVA', name: 'Nova Materials', sector: 'Industrials', price: 56.8, change: 0.7 }
  ];

  onCellChange(e: CustomEvent) {
    console.log('edited', e.detail);
  }

  onSort(e: CustomEvent) {
    console.log('sort', e.detail.sort);
  }
}`,
    },
  ],

  seeAlso: ['pagination'],
};
