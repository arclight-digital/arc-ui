import type { ComponentDef } from './_types';

export const table: ComponentDef = {
    name: 'Table',
    slug: 'table',
    tag: 'arc-table',
    tier: 'content',
    interactivity: 'static',
    description: 'Data-driven table with striped and compact variants, powered by columns and rows props.',

    overview: `Table renders a fully styled data table from two simple props: \`columns\` (an array of header strings) and \`rows\` (an array of arrays, one per row). All markup is generated inside the shadow DOM, so headers, cells, striping, and hover states are styled consistently without any slotted HTML duplication.

The \`striped\` prop adds alternating row backgrounds for improved scanability, and \`compact\` reduces padding for data-dense displays. The wrapper applies \`overflow-x: auto\` for responsive horizontal scrolling on narrow viewports. CSS parts are exposed on every structural element for external customization.`,

    features: [
      'Data-driven: pass `columns` and `rows` arrays — no manual `<table>` markup needed',
      'Striped rows via the `striped` boolean for improved visual tracking',
      'Compact mode via the `compact` boolean for dense data displays',
      'Horizontal overflow scrolling for wide tables on narrow viewports',
      'Tektur uppercase headers with letter-spacing for consistent design language',
      'Row hover highlight for interactive feel',
      'CSS parts on wrapper, table, head, body, row, and cell for external customization',
    ],

    guidelines: {
      do: [
        'Pass columns as a flat array of strings for header labels',
        'Pass rows as an array of arrays, with values in the same order as columns',
        'Enable striped for tables with more than five rows to aid visual tracking',
        'Use compact for data-dense tables like API reference or token listings',
        'Use arc-data-table instead when you need sorting, selection, or column configuration',
      ],
      dont: [
        'Use arc-table for non-tabular data — use a list or card grid instead',
        'Nest tables — use a single flat table or restructure your data',
        'Use arc-table when you need sortable columns or row selection — use arc-data-table for that',
        'Hardcode HTML table elements inside arc-table — pass data via props instead',
      ],
    },

    previewHtml: `<arc-table striped style="width:100%;"
  columns='["Component", "Tier", "Status"]'
  rows='[["Button","Input","Stable"],["Card","Content","Stable"],["Modal","Feedback","Beta"],["DatePicker","Input","Experimental"]]'
></arc-table>`,

    props: [
      { name: 'columns', type: 'string[]', default: '[]', description: 'Array of column header strings.' },
      { name: 'rows', type: 'string[][]', default: '[]', description: 'Array of row arrays. Each inner array contains cell values in column order.' },
      { name: 'striped', type: 'boolean', default: 'false', description: 'Alternating row backgrounds for improved scanability.' },
      { name: 'compact', type: 'boolean', default: 'false', description: 'Reduced cell padding for dense data displays.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-table striped
  columns='["Name", "Role", "Status"]'
  rows='[["Alice","Engineer","Active"],["Bob","Designer","Away"]]'
></arc-table>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Table } from '@arclux/arc-ui-react';

<Table
  striped
  columns={['Name', 'Role', 'Status']}
  rows={[
    ['Alice', 'Engineer', 'Active'],
    ['Bob', 'Designer', 'Away'],
  ]}
/>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Table } from '@arclux/arc-ui-vue';

const columns = ['Name', 'Role', 'Status'];
const rows = [
  ['Alice', 'Engineer', 'Active'],
  ['Bob', 'Designer', 'Away'],
];
</script>

<template>
  <Table striped :columns="columns" :rows="rows" />
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Table } from '@arclux/arc-ui-svelte';

  const columns = ['Name', 'Role', 'Status'];
  const rows = [
    ['Alice', 'Engineer', 'Active'],
    ['Bob', 'Designer', 'Away'],
  ];
</script>

<Table striped {columns} {rows} />`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Table } from '@arclux/arc-ui-angular';

@Component({
  imports: [Table],
  template: \`
    <Table striped [columns]="columns" [rows]="rows" />
  \`,
})
export class MyComponent {
  columns = ['Name', 'Role', 'Status'];
  rows = [
    ['Alice', 'Engineer', 'Active'],
    ['Bob', 'Designer', 'Away'],
  ];
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Table } from '@arclux/arc-ui-solid';

const columns = ['Name', 'Role', 'Status'];
const rows = [
  ['Alice', 'Engineer', 'Active'],
  ['Bob', 'Designer', 'Away'],
];

<Table striped columns={columns} rows={rows} />`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Table } from '@arclux/arc-ui-preact';

const columns = ['Name', 'Role', 'Status'];
const rows = [
  ['Alice', 'Engineer', 'Active'],
  ['Bob', 'Designer', 'Away'],
];

<Table striped columns={columns} rows={rows} />`,
      },
    ],
  };
