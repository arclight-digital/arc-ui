import type { ComponentDef } from './_types';

export const transferList: ComponentDef = {
    name: 'Transfer List',
    slug: 'transfer-list',
    tag: 'arc-transfer-list',
    tier: 'input',
    interactivity: 'interactive',
    status: 'beta',
    description: 'Dual-listbox for moving items between an available and a selected pane, ideal for permissions and settings UIs.',

    overview: `TransferList presents the full universe of options split across two panes -- everything not yet chosen on the left ("Available") and the current value on the right ("Selected"). Users mark items with a checkbox-style highlight, then move them across with the center controls, or move a single item instantly with a double-click or the Enter key. Pane titles are customisable via \`sourceLabel\` and \`targetLabel\`, and each pane header shows a live "checked of total" count.

Options are supplied as an array of \`{ value, label, disabled? }\` objects and the component's \`value\` is the array of values currently in the Selected pane, kept in options order. With the \`searchable\` flag each pane gains its own case-insensitive filter input that narrows only that pane, and the move-all buttons respect the active filter. Disabled options render dimmed and can never be moved.

The component is form-associated: give it a \`name\` and it submits one form entry per selected value, participates in \`form.reset()\`, and honours \`<fieldset disabled>\`. Both listboxes follow the WAI-ARIA multi-select listbox pattern -- one tab stop each with a roving tabindex, arrow-key navigation, Space to toggle, and Ctrl+A to check every visible item -- and moves are announced through a polite live region.`,

    features: [
      'Two labelled panes with live "checked of total" counts and customisable titles',
      'Checkbox-style multi-highlight: mark any number of items, then transfer them in one action',
      'Center controls to move checked items or all (filtered) items in either direction, auto-disabled when inapplicable',
      'Double-click or Enter moves a single item across instantly',
      'Optional per-pane case-insensitive filtering via the `searchable` flag',
      'Full APG listbox keyboard support: roving tabindex, ArrowUp/Down, Home/End, Space to check, Ctrl+A to check all visible items',
      'Focus stays in the same pane on the nearest remaining item after a move; moves are announced via a polite live region',
      'Form-associated: submits one entry per selected value under `name` and supports form reset',
      'Disabled options render dimmed and are excluded from every move operation',
      'Responsive: panes stack vertically and controls rotate horizontal below ~560px container width'
    ],

    guidelines: {
      do: [
        'Use for medium-sized sets (roughly 5-100 items) where users assign a subset, such as role permissions or report columns',
        'Enable `searchable` whenever a pane can hold more than a dozen items',
        'Keep option labels short -- one line each -- so they do not truncate in narrow panes',
        'Override `sourceLabel`/`targetLabel` with domain terms ("All permissions" / "Granted") for clearer context',
        'Listen to `arc-change` to persist the selection; the detail carries the full value array after every move'
      ],
      dont: [
        'Do not use for a handful of options -- a checkbox group or multi-select is lighter',
        'Do not use for thousands of items without server-side narrowing; all options render in the panes',
        'Do not repurpose the checked highlight as the selection itself -- only items in the right pane are the value',
        'Do not disable options without conveying elsewhere why they cannot be moved',
        'Avoid placing two transfer lists side by side; each already spans two panes and needs the width'
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
  ],

  seeAlso: ["multi-select","sortable-list","checkbox","switch-group"],
};
