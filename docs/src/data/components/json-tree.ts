import type { ComponentDef } from './_types';

export const jsonTree: ComponentDef = {
  name: 'JSON Tree',
  slug: 'json-tree',
  tag: 'arc-json-tree',
  tier: 'data',
  interactivity: 'interactive',
  description:
    'Collapsible JSON explorer with syntax coloring, like a dev-tools inspector, for API payloads, configuration objects, and structured state.',
  searchKeywords: ['json', 'inspector', 'devtools', 'object', 'payload', 'viewer', 'explorer'],

  overview: `JSON Tree renders any JSON value as a collapsible tree, like the object inspector in browser dev tools. Unlike CodeBlock, it loads no highlighter and has no dependencies, so it ships in the standard register barrel.

Pass objects and arrays you already hold through the \`data\` property, or set the \`json\` attribute to a JSON string for markup-only use. When both are set, \`data\` wins. Invalid JSON renders a small inline error with the parser's message instead of throwing.

\`expanded\` sets how many levels start open. The default of 1 shows the root's children, and the bare attribute opens every level.

It's an inspector, not a data grid. Branches page at 100 children, and every row you reveal stays in the DOM, so for large data use VirtualList.`,

  features: [
    'Colors use the same tokens as CodeBlock: keys in the secondary accent, strings in the success hue, numbers in the primary accent, booleans and null in the warning hue. A theme that overrides those tokens recolors the tree',
    'Guide rails mark nesting depth in the divider color, whatever the value type',
    'A collapsed branch shows a muted summary, such as "3 keys" or "12 items"',
    'Strings longer than 100 characters truncate in the row, with the full value in the `title` tooltip',
    'A branch with more than 100 children shows the first 100 and a "show N more" row that reveals the next 100',
    'WAI-ARIA tree pattern with TreeView\'s keymap: ArrowDown and ArrowUp move between visible rows, ArrowRight expands, ArrowLeft collapses, and Enter or Space toggles',
  ],

  guidelines: {
    do: [
      'Use it to inspect API responses, configuration objects, event payloads and app state',
      'Set `expanded="2"` or more when the values you care about are below the first level',
      'Pass objects and arrays through `data`, and keep the `json` attribute for static markup',
      'Set `keys-quoted` when the output should read as strict JSON. Keys are bare by default, as in dev tools',
    ],
    dont: [
      'Don\'t use it to show source code. CodeBlock highlights whole files in any language',
      'Don\'t use it for navigation like file browsers or menus. TreeView handles selection and custom labels',
      'Don\'t rely on the hover tooltip for string content people need. Show long values another way too',
    ],
  },

  previewHtml: `<arc-json-tree expanded="2" style="min-width: min(480px, 100%)" json='{
  "id": "ord_8134",
  "status": "shipped",
  "total": 249.5,
  "paid": true,
  "coupon": null,
  "customer": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "verified": true
  },
  "items": [
    { "sku": "ARC-001", "qty": 2, "price": 89.75 },
    { "sku": "ARC-204", "qty": 1, "price": 70.0 }
  ]
}'></arc-json-tree>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- JSON string via attribute -->
<arc-json-tree expanded="2" json='{
  "id": "ord_8134",
  "status": "shipped",
  "paid": true,
  "customer": { "name": "Ada Lovelace", "verified": true }
}'></arc-json-tree>

<!-- Live objects via the data property -->
<arc-json-tree id="inspector" expanded keys-quoted></arc-json-tree>
<script>
  const inspector = document.getElementById('inspector');
  fetch('/api/orders/8134')
    .then((res) => res.json())
    .then((payload) => { inspector.data = payload; });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { JsonTree } from '@arclux/arc-ui-react';

const payload = {
  id: 'ord_8134',
  status: 'shipped',
  paid: true,
  customer: { name: 'Ada Lovelace', verified: true },
};

export default function Example() {
  return <JsonTree data={payload} expanded={2} />;
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { JsonTree } from '@arclux/arc-ui-vue';

const payload = {
  id: 'ord_8134',
  status: 'shipped',
  paid: true,
  customer: { name: 'Ada Lovelace', verified: true },
};
</script>

<template>
  <JsonTree :data="payload" :expanded="2" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { JsonTree } from '@arclux/arc-ui-svelte';

  const payload = {
    id: 'ord_8134',
    status: 'shipped',
    paid: true,
    customer: { name: 'Ada Lovelace', verified: true },
  };
</script>

<JsonTree data={payload} expanded={2} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { JsonTree } from '@arclux/arc-ui-angular';

@Component({
  imports: [JsonTree],
  template: \`
    <arc-json-tree [data]="payload" expanded="2"></arc-json-tree>
  \`,
})
export class MyComponent {
  payload = {
    id: 'ord_8134',
    status: 'shipped',
    paid: true,
    customer: { name: 'Ada Lovelace', verified: true },
  };
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { JsonTree } from '@arclux/arc-ui-solid';

const payload = {
  id: 'ord_8134',
  status: 'shipped',
  paid: true,
  customer: { name: 'Ada Lovelace', verified: true },
};

<JsonTree data={payload} expanded={2} />`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { JsonTree } from '@arclux/arc-ui-preact';

const payload = {
  id: 'ord_8134',
  status: 'shipped',
  paid: true,
  customer: { name: 'Ada Lovelace', verified: true },
};

<JsonTree data={payload} expanded={2} />`,
    },
  ],

  seeAlso: ['code-block', 'tree-view', 'diff', 'virtual-list'],
};
