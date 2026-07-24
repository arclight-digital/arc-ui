import type { ComponentDef } from './_types';

export const dataTable: ComponentDef = {
    name: 'Data Table',
    slug: 'data-table',
    tag: 'arc-data-table',
    tier: 'data',
    interactivity: 'interactive',
    description: 'A data-driven table component that renders rows from a JavaScript array. Declarative column definitions via `arc-column` children control which fields appear, their headers, widths, and sort behavior. Built-in support for column sorting, row selection with checkboxes, and an empty-state fallback.',

    overview: `DataTable is the go-to component when you need to render structured, tabular data sourced from an array of objects. Instead of hand-writing \`<tr>\` and \`<td>\` elements, you pass a \`rows\` array to the component and declare columns as \`<arc-column>\` children — each column maps a \`key\` to a field in your data. The table handles rendering, alternating row backgrounds, hover highlighting, and sticky headers automatically.

Sorting is opt-in at two levels: the table must have the \`sortable\` attribute, and each column that should be sortable needs its own \`sortable\` flag. When a user clicks a sortable header, the table toggles between ascending and descending order and emits an \`arc-sort\` event with the active column and direction, making it easy to integrate with server-side sorting if needed.

Row selection adds a checkbox column to the left of the table. A "select all" checkbox in the header toggles every row, and individual row checkboxes emit \`arc-row-select\` events. The \`selectable\` attribute enables this mode. Selected rows receive a subtle blue highlight so the user always knows which rows are active. This is ideal for bulk-action patterns like "delete selected" or "export selected."`,

    features: [
      'Data-driven rendering from a rows array — no manual <tr>/<td> markup',
      'Declarative column definitions via <arc-column> children',
      'Client-side sorting with ascending/descending toggle per column',
      'Row selection with individual and select-all checkboxes',
      'Sticky table headers that remain visible during scroll',
      'Alternating row backgrounds for improved scanability',
      'Hover highlighting on rows for easy tracking',
      'Empty-state fallback when no data is available',
      'arc-sort, arc-row-select, and arc-select-all custom events',
      'Accessible ARIA attributes: aria-sort on headers, aria-label on checkboxes',
      'Configurable column widths via the width attribute',
      'CSS custom property theming via ARC design tokens'
    ],

    guidelines: {
      do: [
        'Use DataTable when your data is an array of objects with consistent keys',
        'Mark only the columns that benefit from sorting as sortable — not every column needs it',
        'Provide meaningful column labels that describe the data clearly',
        'Use the selectable attribute when users need to perform bulk actions on rows',
        'Set explicit column widths on columns that should remain fixed (e.g., status badges)',
        'Listen to arc-sort events to implement server-side sorting for large datasets'
      ],
      dont: [
        'Use DataTable for layout purposes — it is designed for data display, not page structure',
        'Put more than 8-10 columns in a single table; consider splitting into multiple views',
        'Make every column sortable by default — this creates unnecessary cognitive load',
        'Nest complex interactive components (modals, drawers) inside table cells',
        'Forget to set a key attribute on each arc-column — the table cannot render data without it',
        'Use DataTable for very small datasets (2-3 items) where a simple list would suffice'
      ],
    },

    previewLayout: 'scroll',

    previewHtml: `<div style="width:100%">
  <arc-data-table id="demo-dt-preview" sortable selectable>
    <arc-column key="name" label="Name" sortable></arc-column>
    <arc-column key="role" label="Role" sortable></arc-column>
    <arc-column key="department" label="Department"></arc-column>
    <arc-column key="status" label="Status" width="100px"></arc-column>
  </arc-data-table>
</div>`,

    previewSetup: `const dt = el.querySelector('#demo-dt-preview');
if (dt) dt.rows = [
  { name: 'Alice Chen', role: 'Senior Engineer', department: 'Engineering', status: 'Active' },
  { name: 'Bob Martinez', role: 'Product Designer', department: 'Design', status: 'Active' },
  { name: 'Charlie Kim', role: 'Engineering Manager', department: 'Engineering', status: 'Away' },
  { name: 'Diana Patel', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
  { name: 'Eve Johnson', role: 'UX Researcher', department: 'Design', status: 'Active' }
];`,


    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<div style="width:100%">
  <arc-data-table id="demo-dt-preview" sortable selectable>
    <arc-column key="name" label="Name" sortable></arc-column>
    <arc-column key="role" label="Role" sortable></arc-column>
    <arc-column key="department" label="Department"></arc-column>
    <arc-column key="status" label="Status" width="100px"></arc-column>
  </arc-data-table>
</div>

<script type="module">
  import '@arclux/arc-ui/data-table';
  import '@arclux/arc-ui/column';

  const dt = document.querySelector('#demo-dt-preview');
  dt.rows = [
    { name: 'Alice Chen', role: 'Senior Engineer', department: 'Engineering', status: 'Active' },
    { name: 'Bob Martinez', role: 'Product Designer', department: 'Design', status: 'Active' },
    { name: 'Charlie Kim', role: 'Engineering Manager', department: 'Engineering', status: 'Away' },
    { name: 'Diana Patel', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
    { name: 'Eve Johnson', role: 'UX Researcher', department: 'Design', status: 'Active' }
  ];
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { DataTable, Column } from '@arclux/arc-ui-react';

const employees = [
  { name: 'Alice Chen', role: 'Senior Engineer', department: 'Engineering', status: 'Active' },
  { name: 'Bob Martinez', role: 'Product Designer', department: 'Design', status: 'Active' },
  { name: 'Charlie Kim', role: 'Engineering Manager', department: 'Engineering', status: 'Away' },
  { name: 'Diana Patel', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
  { name: 'Eve Johnson', role: 'UX Researcher', department: 'Design', status: 'Active' }
];

export function EmployeeDirectory() {
  return (
    <DataTable rows={employees} sortable selectable>
      <Column key="name" label="Name" sortable />
      <Column key="role" label="Role" sortable />
      <Column key="department" label="Department" />
      <Column key="status" label="Status" width="100px" />
    </DataTable>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { DataTable, Column } from '@arclux/arc-ui-vue';

const employees = [
  { name: 'Alice Chen', role: 'Senior Engineer', department: 'Engineering', status: 'Active' },
  { name: 'Bob Martinez', role: 'Product Designer', department: 'Design', status: 'Active' },
  { name: 'Charlie Kim', role: 'Engineering Manager', department: 'Engineering', status: 'Away' },
  { name: 'Diana Patel', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
  { name: 'Eve Johnson', role: 'UX Researcher', department: 'Design', status: 'Active' }
];
</script>

<template>
  <DataTable :rows="employees" sortable selectable>
    <Column key="name" label="Name" sortable />
    <Column key="role" label="Role" sortable />
    <Column key="department" label="Department" />
    <Column key="status" label="Status" width="100px" />
  </DataTable>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { DataTable, Column } from '@arclux/arc-ui-svelte';

  const employees = [
    { name: 'Alice Chen', role: 'Senior Engineer', department: 'Engineering', status: 'Active' },
    { name: 'Bob Martinez', role: 'Product Designer', department: 'Design', status: 'Active' },
    { name: 'Charlie Kim', role: 'Engineering Manager', department: 'Engineering', status: 'Away' },
    { name: 'Diana Patel', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
    { name: 'Eve Johnson', role: 'UX Researcher', department: 'Design', status: 'Active' }
  ];
</script>

<DataTable rows={employees} sortable selectable>
  <Column key="name" label="Name" sortable />
  <Column key="role" label="Role" sortable />
  <Column key="department" label="Department" />
  <Column key="status" label="Status" width="100px" />
</DataTable>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { DataTable, Column } from '@arclux/arc-ui-angular';

@Component({
  imports: [DataTable, Column],
  template: \`
    <DataTable [rows]="employees" sortable selectable>
      <Column key="name" label="Name" sortable></Column>
      <Column key="role" label="Role" sortable></Column>
      <Column key="department" label="Department"></Column>
      <Column key="status" label="Status" width="100px"></Column>
    </DataTable>
  \`,
})
export class EmployeeDirectoryComponent {
  employees = [
    { name: 'Alice Chen', role: 'Senior Engineer', department: 'Engineering', status: 'Active' },
    { name: 'Bob Martinez', role: 'Product Designer', department: 'Design', status: 'Active' },
    { name: 'Charlie Kim', role: 'Engineering Manager', department: 'Engineering', status: 'Away' },
    { name: 'Diana Patel', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
    { name: 'Eve Johnson', role: 'UX Researcher', department: 'Design', status: 'Active' }
  ];
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { DataTable, Column } from '@arclux/arc-ui-solid';

const employees = [
  { name: 'Alice Chen', role: 'Senior Engineer', department: 'Engineering', status: 'Active' },
  { name: 'Bob Martinez', role: 'Product Designer', department: 'Design', status: 'Active' },
  { name: 'Charlie Kim', role: 'Engineering Manager', department: 'Engineering', status: 'Away' },
  { name: 'Diana Patel', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
  { name: 'Eve Johnson', role: 'UX Researcher', department: 'Design', status: 'Active' }
];

export function EmployeeDirectory() {
  return (
    <DataTable rows={employees} sortable selectable>
      <Column key="name" label="Name" sortable />
      <Column key="role" label="Role" sortable />
      <Column key="department" label="Department" />
      <Column key="status" label="Status" width="100px" />
    </DataTable>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { DataTable, Column } from '@arclux/arc-ui-preact';

const employees = [
  { name: 'Alice Chen', role: 'Senior Engineer', department: 'Engineering', status: 'Active' },
  { name: 'Bob Martinez', role: 'Product Designer', department: 'Design', status: 'Active' },
  { name: 'Charlie Kim', role: 'Engineering Manager', department: 'Engineering', status: 'Away' },
  { name: 'Diana Patel', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
  { name: 'Eve Johnson', role: 'UX Researcher', department: 'Design', status: 'Active' }
];

export function EmployeeDirectory() {
  return (
    <DataTable rows={employees} sortable selectable>
      <Column key="name" label="Name" sortable />
      <Column key="role" label="Role" sortable />
      <Column key="department" label="Department" />
      <Column key="status" label="Status" width="100px" />
    </DataTable>
  );
}`,
      }
    ],
    subComponents: [
      {
        name: 'Column',
        tag: 'arc-column',
        description: 'Defines a single column within a DataTable. Each Column maps a data field key to a visible table column with a header label. Columns are invisible DOM elements that act as declarative configuration — they do not render any visible content themselves.',
      }
    ],
  
  seeAlso: ["table","pagination","sortable-list"],
};
