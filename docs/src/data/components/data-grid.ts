import type { ComponentDef } from './_types';

export const dataGrid: ComponentDef = {
  name: 'Data Grid',
  slug: 'data-grid',
  tag: 'arc-data-grid',
  tier: 'data',
  interactivity: 'interactive',
  status: 'beta',
  description: 'A spreadsheet-grade grid for working with tabular data: inline cell editing, multi-column sorting, pinned columns, row selection, and virtualized rendering. Columns are defined as a JavaScript array, and the grid implements the full WAI-ARIA grid keyboard pattern with a single tab stop.',

  overview: `DataGrid is the tier above DataTable — reach for it when users need to *work* with the data rather than just read it. Columns are configured through a \`columns\` array property (not child elements), where each entry can opt into sorting, inline editing, alignment, a fixed width, and left-edge pinning.

Sorting is multi-column: clicking a sortable header cycles ascending → descending → off, and Shift+clicking appends the column as a secondary sort. When more than one sort is active, each sorted header shows its direction arrow plus a priority number. The grid sorts a copy of your data internally and also emits \`arc-sort\` with the full sort array — set \`manual-sort\` to skip internal sorting and drive it from a server instead.

Editable columns turn cells into inline editors: press Enter or double-click a cell to open a token-styled input, Enter or blur commits (emitting \`arc-cell-change\`), Escape cancels. The grid mutates only its own display copy — your source array stays untouched, so you remain the owner of the data. Pinned columns stay stuck to the left edge during horizontal scroll with an elevation shadow, and the \`virtual\` mode renders only visible rows for large datasets.

Keyboard support follows the WAI-ARIA grid pattern: one tab stop for the whole grid, arrow keys move a roving cell focus, Home/End jump to row ends, Ctrl+Home/End jump to the grid corners, Enter activates (sorts a header, edits a cell), and Space toggles row selection.`,

  features: [
    'Column configuration via a plain JavaScript array — width, alignment, sortable, editable, pinned per column',
    'Multi-column sorting: click cycles asc/desc/none, Shift+click adds secondary sorts with priority indicators',
    'manual-sort mode for server-side sorting driven by the arc-sort event',
    'Inline cell editing with Enter/double-click to open, Enter/blur to commit, Escape to cancel',
    'Grid mutates only its internal display copy — consumer data stays the source of truth',
    'Pinned columns stick to the left edge with an elevation shadow while scrolling horizontally',
    'Row selection with select-all checkbox including indeterminate state',
    'Virtualized rendering for large datasets via the virtual and row-height props',
    'Full WAI-ARIA grid keyboard pattern: roving cell focus, one tab stop, arrow/Home/End/Ctrl navigation',
    'arc-sort, arc-cell-change, and arc-selection-change custom events',
    'Sticky header row that stays visible during vertical scroll',
    'CSS custom property theming via ARC design tokens, plus ::part hooks for table, header, row, cell, and editor',
  ],

  guidelines: {
    do: [
      'Use DataGrid when users edit, multi-sort, or bulk-select data; use DataTable for read-mostly display',
      'Listen to arc-cell-change and write edits back to your own data store — the grid only updates its display copy',
      'Set manual-sort and handle arc-sort yourself when the dataset is paginated or sorted server-side',
      'Pin only one or two key identifier columns (IDs, names) so unpinned data stays readable',
      'Give pinned columns an explicit width — pinned offsets are computed from column widths',
      'Enable virtual with an accurate row-height for datasets beyond a few hundred rows',
    ],
    dont: [
      'Mark every column editable — restrict editing to fields users genuinely need to change inline',
      'Rely on the grid to persist edits; it never mutates the rows array you passed in',
      'Pin so many columns that unpinned content has no room on narrow screens',
      'Mix virtual mode with rows of varying heights — virtualization assumes a fixed row-height',
      'Nest complex interactive components (modals, drawers) inside grid cells',
      'Use DataGrid for simple read-only lists — DataTable or List are lighter choices',
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
  grid.addEventListener('arc-selection-change', (e) => console.log('selected', e.detail.selectedIndices));
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
  ],

  seeAlso: ['data-table', 'table', 'pagination'],
};
