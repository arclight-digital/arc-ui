import type { ComponentDef } from './_types';

export const transferList: ComponentDef = {
  name: 'Transfer List',
  slug: 'transfer-list',
  tag: 'arc-transfer-list',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Dual listbox for moving items between an available and a selected pane, for permission and settings screens.',

  overview: `TransferList shows every option in two panes: the ones not chosen on the left ("Available") and the current value on the right ("Selected"). The reader checks items, then moves them across with the buttons between the panes, or moves one item at once with a double-click or Enter. \`sourceLabel\` and \`targetLabel\` rename the panes, and each pane header shows a live "checked of total" count.

\`options\` is an array of \`{ value, label, disabled? }\` objects, and \`value\` is the array of values in the Selected pane, in options order. With \`searchable\`, each pane gets its own case-insensitive filter, and the move-all buttons move only what the filter shows. Disabled options are dimmed and can't be moved.

It's form-associated. Give it a \`name\` and it submits one entry per selected value, resets with \`form.reset()\`, and is disabled by \`<fieldset disabled>\`. Both panes follow the WAI-ARIA multi-select listbox pattern, and moves are announced through a polite live region.`,

  features: [
    'Keyboard: one tab stop per pane with a roving tabindex, ArrowUp and ArrowDown, Home and End, Space to check, and Ctrl+A to check every visible item',
    'After a move, focus stays in the same pane on the nearest remaining item',
    "The move buttons turn off when there's nothing for them to move",
    'Below a container width of about 560px the panes stack and the controls turn horizontal',
  ],

  guidelines: {
    do: [
      'Use it for sets of about 5 to 100 items where the reader picks a subset, such as role permissions or report columns',
      'Set `searchable` when a pane can hold more than a dozen items',
      "Keep option labels to one short line so they don't truncate in narrow panes",
      'Rename the panes with terms from your domain, such as "All permissions" and "Granted"',
      'Listen to `arc-change` to save the selection. Its detail carries the full value array after every move',
    ],
    dont: [
      "Don't use it for a handful of options. Use a checkbox group or MultiSelect",
      "Don't give it thousands of items without narrowing them on the server first. Every option renders",
      "Don't treat checked items as the selection. Only items in the right pane are the value",
      "Don't disable options without saying somewhere why they can't be moved",
      "Don't put two transfer lists side by side. Each one needs the width for its two panes",
    ],
  },

  previewLayout: 'block',

  previewHtml: `<arc-transfer-list
  searchable
  source-label="Available"
  target-label="Granted"
></arc-transfer-list>`,

  previewSetup: `const tl = el.querySelector('arc-transfer-list');
tl.options = [
  { value: 'read', label: 'Read content' },
  { value: 'write', label: 'Write content' },
  { value: 'publish', label: 'Publish content' },
  { value: 'comment', label: 'Moderate comments' },
  { value: 'users', label: 'Manage users' },
  { value: 'billing', label: 'Manage billing' },
  { value: 'audit', label: 'View audit log' },
  { value: 'root', label: 'Superadmin', disabled: true },
];
tl.value = ['read', 'comment'];`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-transfer-list
  id="permissions"
  name="permissions"
  searchable
  source-label="Available"
  target-label="Granted"
></arc-transfer-list>

<script>
  const tl = document.getElementById('permissions');
  tl.options = [
    { value: 'read', label: 'Read content' },
    { value: 'write', label: 'Write content' },
    { value: 'admin', label: 'Administer', disabled: true },
  ];
  tl.value = ['read'];
  tl.addEventListener('arc-change', (e) => {
    console.log(e.detail.value);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { TransferList } from '@arclux/arc-ui-react';

const options = [
  { value: 'read', label: 'Read content' },
  { value: 'write', label: 'Write content' },
  { value: 'admin', label: 'Administer', disabled: true },
];

<TransferList
  options={options}
  value={['read']}
  searchable
  sourceLabel="Available"
  targetLabel="Granted"
  onArcChange={(e) => console.log(e.detail.value)}
/>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { TransferList } from '@arclux/arc-ui-vue';

const options = [
  { value: 'read', label: 'Read content' },
  { value: 'write', label: 'Write content' },
];
</script>

<template>
  <TransferList
    :options="options"
    :value="['read']"
    searchable
    source-label="Available"
    target-label="Granted"
    @arc-change="(e) => console.log(e.detail.value)"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { TransferList } from '@arclux/arc-ui-svelte';

  const options = [
    { value: 'read', label: 'Read content' },
    { value: 'write', label: 'Write content' },
  ];
</script>

<TransferList
  {options}
  value={['read']}
  searchable
  source-label="Available"
  target-label="Granted"
  on:arc-change={(e) => console.log(e.detail.value)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { TransferList } from '@arclux/arc-ui-angular';

@Component({
  imports: [TransferList],
  template: \`
    <arc-transfer-list
      [options]="options"
      [value]="['read']"
      searchable
      sourceLabel="Available"
      targetLabel="Granted"
      (arcChange)="onChange($event)"
    ></arc-transfer-list>
  \`,
})
export class PermissionsComponent {
  options = [
    { value: 'read', label: 'Read content' },
    { value: 'write', label: 'Write content' },
  ];

  onChange(e: CustomEvent) {
    console.log(e.detail.value);
  }
}`,
    },
  ],

  seeAlso: ['multi-select', 'sortable-list', 'checkbox', 'switch-group'],
};
