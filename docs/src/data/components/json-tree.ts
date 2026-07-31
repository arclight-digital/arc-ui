import type { ComponentDef } from './_types';

export const jsonTree: ComponentDef = {
  name: 'JSON Tree',
  slug: 'json-tree',
  tag: 'arc-json-tree',
  tier: 'data',
  interactivity: 'interactive',
  description:
    'Collapsible JSON explorer with house syntax coloring — the dev-tools inspector for API payloads, configuration objects, and structured state.',
  searchKeywords: ['json', 'inspector', 'devtools', 'object', 'payload', 'viewer', 'explorer'],

  overview: `JsonTree renders any JSON value as a collapsible tree, the way a browser's dev-tools inspector does. Objects and arrays become expandable branches with a rotating chevron, primitives render inline with per-type syntax coloring, and neutral guide rails trace the nesting depth. The coloring follows the same token mapping as CodeBlock — keys in the secondary accent, strings in the success hue, numbers in the primary accent, booleans and null in the warning hue — so a theme that overrides the base tokens recolors the tree along with everything else. Unlike CodeBlock, JsonTree loads no highlighter and has zero dependencies, so it registers with the rest of the library at no extra cost.

Data arrives one of two ways. Pass the \`data\` property for objects and arrays you already hold in JavaScript, or set the \`json\` attribute to a JSON string for markup-only use. The string is parsed defensively: invalid input renders a small inline error state with the parser's message instead of throwing. When both are set, the property wins.

The \`expanded\` prop controls how many levels open initially — the default of 1 shows the root's immediate children. As a bare boolean attribute it opens every level. Collapsed branches show a muted summary preview of what is inside, such as three keys or twelve items, and long strings truncate in the row with the full value available on hover via the title attribute.

The component follows the WAI-ARIA tree pattern with the same keymap as TreeView: ArrowDown and ArrowUp move between visible rows, ArrowRight expands a collapsed branch, ArrowLeft collapses an expanded one, and Enter or Space toggles the focused node. Objects and arrays with more than 100 children render the first 100 plus a "show N more" expander node rather than flooding the DOM — JsonTree is built for inspection, not for scale. When the data itself is large-scale, VirtualList is the right component.`,

  features: [
    'Renders any JSON value — objects, arrays, strings, numbers, booleans, and null — as a collapsible tree',
    'House syntax coloring from design tokens: keys in accent-secondary, strings in the success hue, numbers in accent-primary, booleans and null in the warning hue',
    'Accepts data as a JavaScript property or as a `json` string attribute, with a graceful inline error state for invalid JSON',
    'Configurable initial depth via `expanded`, from fully collapsed (0) to fully open (bare attribute)',
    'Collapsed branches show a muted summary preview of their contents, such as key or item counts',
    'Long string values truncate in the row and expose the full value through the title attribute',
    'Neutral depth guide rails drawn with the divider token, never tinted by value type or state',
    'Full WAI-ARIA tree pattern with the TreeView keymap: arrows to navigate and toggle, Enter or Space to activate',
    'A 100-child page boundary with a "show N more" expander keeps huge payloads from flooding the DOM',
    'Zero dependencies — no highlighter, no lazy chunks — so it ships in the standard register barrel',
  ],

  guidelines: {
    do: [
      'Use JsonTree to inspect structured data — API responses, configuration objects, event payloads, and application state',
      'Set `expanded="2"` or deeper when the interesting values live below the first level',
      'Pass objects and arrays through the `data` property; reserve the `json` attribute for static markup',
      'Use `keys-quoted` when the output should read as strict JSON rather than devtools-style bare keys',
      'Reach for VirtualList instead when the data is genuinely large-scale — JsonTree pages children at 100 per branch by design',
    ],
    dont: [
      'Do not use JsonTree to display source code — CodeBlock highlights whole files in any language, while JsonTree explores one structured value',
      'Do not use JsonTree for navigation hierarchies like file browsers or menus — TreeView handles selection and custom labels',
      'Do not feed it multi-megabyte payloads expecting virtualization — the show-more boundary caps the DOM but everything revealed stays rendered',
      'Do not rely on hover-only title text to communicate essential string content — truncated values should also be reachable another way',
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
