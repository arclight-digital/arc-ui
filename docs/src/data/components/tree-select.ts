import type { ComponentDef } from './_types';

export const treeSelect: ComponentDef = {
  name: 'Tree Select',
  slug: 'tree-select',
  tag: 'arc-tree-select',
  tier: 'input',
  interactivity: 'interactive',
  searchKeywords: ['dropdown', 'hierarchy', 'folder picker', 'nested', 'category'],
  description:
    'A Select whose dropdown is a tree of expandable groups, where only the leaves can be chosen.',

  overview: `TreeSelect has the trigger of Select and a tree in its panel. The dropdown shows groups that expand, and the leaves inside them are the choices. The trigger shows the chosen leaf after a muted path of its ancestors, so "Violin" reads as "Strings / Violin".

Only leaves can be selected. A node with children is a group header that expands and collapses but can't be chosen, so the submitted value is always a single leaf. When the panel opens, the branches containing the current value expand, so the selection is in view.

TreeSelect follows the ARIA combobox pattern with a tree popup. Enter, Space or an arrow key opens the panel. Arrow Up and Down move between rows, Arrow Right and Left expand and collapse groups, Enter picks a leaf and Escape closes. Typing jumps to the row that starts with those letters, as in Select. It takes part in native forms through ElementInternals and submits the selected leaf's value under its \`name\`.`,

  features: [
    '`expanded-values` lists the groups to show expanded at first',
    'Disabled nodes render, but the keyboard skips them and they can\'t be selected. A disabled group hides its children',
    'Supports `required` validation',
    'Neutral rails show nesting depth and carry no state',
  ],

  guidelines: {
    do: [
      'Use it when the options have a real hierarchy that readers think in, such as instrument families, product categories or folder trees',
      'Give every node a stable value, group headers included. Group values drive `expanded-values` and appear in the `path` of `arc-change`',
      'Keep the tree to two or three levels. A deeper tree belongs in a picker dialog',
      'Use `expanded-values` to open the branches readers need most',
      'Set a visible `label`. It\'s also the accessible name',
      'Disable a node that\'s temporarily unavailable instead of removing it, so the structure stays recognizable',
    ],
    dont: [
      'Don\'t use it for a flat list. Use Select',
      'Don\'t use it when readers need to type to filter a large set. Use Combobox, whose text field takes the keystrokes',
      'Don\'t use it for browsing or navigation outside a form. Use TreeView, a standalone tree with no trigger or form value',
      'Don\'t expect group headers to be selectable. If a branch must be a valid choice, add a leaf such as "All strings" inside it',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:320px">
  <arc-tree-select id="demo-tree-select" label="Instrument" placeholder="Pick an instrument..."></arc-tree-select>
</div>`,

  previewSetup: `const ts = el.querySelector('#demo-tree-select');
if (ts) ts.items = [
  { value: 'keys', label: 'Keys', children: [
    { value: 'grand-piano', label: 'Grand Piano' },
    { value: 'rhodes', label: 'Rhodes' },
    { value: 'clavinet', label: 'Clavinet' },
  ] },
  { value: 'strings', label: 'Strings', children: [
    { value: 'violin', label: 'Violin' },
    { value: 'cello', label: 'Cello' },
    { value: 'double-bass', label: 'Double Bass' },
  ] },
  { value: 'percussion', label: 'Percussion', children: [
    { value: 'timpani', label: 'Timpani' },
    { value: 'vibraphone', label: 'Vibraphone' },
  ] },
];`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-tree-select
  label="Instrument"
  name="instrument"
  placeholder="Pick an instrument..."
></arc-tree-select>

<script>
  const treeSelect = document.querySelector('arc-tree-select');

  // items is a property, not an attribute: assign the tree from script.
  treeSelect.items = [
    { value: 'keys', label: 'Keys', children: [
      { value: 'grand-piano', label: 'Grand Piano' },
      { value: 'rhodes', label: 'Rhodes' },
    ] },
    { value: 'strings', label: 'Strings', children: [
      { value: 'violin', label: 'Violin' },
      { value: 'cello', label: 'Cello' },
    ] },
    { value: 'percussion', label: 'Percussion', children: [
      { value: 'timpani', label: 'Timpani' },
    ] },
  ];

  // Pre-expand a branch, or let auto-expand follow the selected value.
  treeSelect.expandedValues = ['strings'];

  treeSelect.addEventListener('arc-change', (e) => {
    // e.detail.path holds the ancestor group values, root first.
    console.log('Selected:', e.detail.value, 'in', e.detail.path.join(' / '));
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { TreeSelect } from '@arclux/arc-ui-react';
import { useState } from 'react';

const instruments = [
  { value: 'keys', label: 'Keys', children: [
    { value: 'grand-piano', label: 'Grand Piano' },
    { value: 'rhodes', label: 'Rhodes' },
  ] },
  { value: 'strings', label: 'Strings', children: [
    { value: 'violin', label: 'Violin' },
    { value: 'cello', label: 'Cello' },
  ] },
  { value: 'percussion', label: 'Percussion', children: [
    { value: 'timpani', label: 'Timpani' },
  ] },
];

function InstrumentPicker() {
  const [instrument, setInstrument] = useState('');

  return (
    <TreeSelect
      label="Instrument"
      placeholder="Pick an instrument..."
      items={instruments}
      value={instrument}
      onArcChange={(e) => setInstrument(e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { TreeSelect } from '@arclux/arc-ui-vue';
import { ref } from 'vue';

const instrument = ref('');
const instruments = [
  { value: 'keys', label: 'Keys', children: [
    { value: 'grand-piano', label: 'Grand Piano' },
    { value: 'rhodes', label: 'Rhodes' },
  ] },
  { value: 'strings', label: 'Strings', children: [
    { value: 'violin', label: 'Violin' },
    { value: 'cello', label: 'Cello' },
  ] },
];
</script>

<template>
  <TreeSelect
    label="Instrument"
    placeholder="Pick an instrument..."
    :items="instruments"
    :value="instrument"
    @arc-change="instrument = $event.detail.value"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { TreeSelect } from '@arclux/arc-ui-svelte';

  let instrument = '';
  const instruments = [
    { value: 'keys', label: 'Keys', children: [
      { value: 'grand-piano', label: 'Grand Piano' },
      { value: 'rhodes', label: 'Rhodes' },
    ] },
    { value: 'strings', label: 'Strings', children: [
      { value: 'violin', label: 'Violin' },
      { value: 'cello', label: 'Cello' },
    ] },
  ];
</script>

<TreeSelect label="Instrument" placeholder="Pick an instrument..."
  items={instruments} value={instrument}
  on:arc-change={(e) => instrument = e.detail.value} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { TreeSelect } from '@arclux/arc-ui-angular';

@Component({
  imports: [TreeSelect],
  template: \`
    <arc-tree-select label="Instrument" placeholder="Pick an instrument..."
      [items]="instruments" [value]="instrument"
      (arc-change)="instrument = $event.detail.value">
    </arc-tree-select>
  \`,
})
export class InstrumentPickerComponent {
  instrument = '';
  instruments = [
    { value: 'keys', label: 'Keys', children: [
      { value: 'grand-piano', label: 'Grand Piano' },
      { value: 'rhodes', label: 'Rhodes' },
    ] },
    { value: 'strings', label: 'Strings', children: [
      { value: 'violin', label: 'Violin' },
      { value: 'cello', label: 'Cello' },
    ] },
  ];
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { TreeSelect } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

const instruments = [
  { value: 'keys', label: 'Keys', children: [
    { value: 'grand-piano', label: 'Grand Piano' },
    { value: 'rhodes', label: 'Rhodes' },
  ] },
  { value: 'strings', label: 'Strings', children: [
    { value: 'violin', label: 'Violin' },
    { value: 'cello', label: 'Cello' },
  ] },
];

function InstrumentPicker() {
  const [instrument, setInstrument] = createSignal('');

  return (
    <TreeSelect label="Instrument" placeholder="Pick an instrument..."
      items={instruments} value={instrument()}
      onArcChange={(e) => setInstrument(e.detail.value)} />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { TreeSelect } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

const instruments = [
  { value: 'keys', label: 'Keys', children: [
    { value: 'grand-piano', label: 'Grand Piano' },
    { value: 'rhodes', label: 'Rhodes' },
  ] },
  { value: 'strings', label: 'Strings', children: [
    { value: 'violin', label: 'Violin' },
    { value: 'cello', label: 'Cello' },
  ] },
];

function InstrumentPicker() {
  const [instrument, setInstrument] = useState('');

  return (
    <TreeSelect label="Instrument" placeholder="Pick an instrument..."
      items={instruments} value={instrument}
      onArcChange={(e) => setInstrument(e.detail.value)} />
  );
}`,
    },
  ],

  seeAlso: ['select', 'combobox', 'tree-view', 'multi-select'],
};
