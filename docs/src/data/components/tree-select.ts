import type { ComponentDef } from './_types';

export const treeSelect: ComponentDef = {
  name: 'Tree Select',
  slug: 'tree-select',
  tag: 'arc-tree-select',
  tier: 'input',
  interactivity: 'interactive',
  searchKeywords: ['dropdown', 'hierarchy', 'folder picker', 'nested', 'category'],
  description:
    'Dropdown select whose panel is a hierarchical tree — categories, instrument banks, folder pickers. Group nodes expand and collapse; only leaf nodes are selectable.',

  overview: `Tree Select combines the trigger anatomy of Select with a hierarchical tree panel. Instead of a flat list of options, the dropdown presents expandable groups whose leaves are the actual choices: an instrument bank organized by family, a category taxonomy, a folder structure. The trigger shows the chosen leaf together with a muted breadcrumb of its ancestor path, so "Violin" reads as "Strings / Violin" and never loses its context.

Selection is leaf-only by design. Nodes with children act as group headers — they expand and collapse but can never be chosen — which keeps single-select semantics clean: the submitted value is always one unambiguous leaf, never a branch that might mean "everything under it". Branches containing the current value expand automatically when the panel opens, so the selection is always visible without hunting.

Tree Select implements the ARIA combobox pattern with a tree popup. Keyboard users open the panel with Enter, Space, or an arrow key, walk rows with Arrow Up and Down, expand and collapse groups with Arrow Right and Left, confirm a leaf with Enter, and dismiss with Escape. Typing jumps to the row starting with those letters, exactly as in Select. The component participates in native forms through ElementInternals, submitting the selected leaf value under its \`name\`.`,

  features: [
    'Hierarchical tree panel with expandable, collapsible group headers',
    'Leaf-only selection keeps single-select semantics unambiguous',
    'Trigger breadcrumb shows the ancestor path muted beside the leaf label',
    'Branches containing the selected value auto-expand when the panel opens',
    'Initially expanded branches via the expanded-values property',
    'Full keyboard support: arrows navigate and expand, Enter selects, Escape closes',
    'Type-ahead jumps to rows by their first letters, as in a native select',
    'Disabled nodes render but are skipped by keyboard and cannot be selected',
    'Native form participation via ElementInternals, including required validation',
    'Neutral depth rails mark nesting structure without carrying state',
  ],

  guidelines: {
    do: [
      'Use Tree Select when the options have a real hierarchy the user thinks in — instrument families, product categories, folder trees',
      'Give every node a stable value, including group headers — group values drive expanded-values and appear in the arc-change path detail',
      'Keep the tree shallow; two or three levels is comfortable inside a dropdown panel',
      'Pre-expand the branches users need most via expanded-values instead of making them dig',
      'Always provide a visible label so users understand what they are choosing',
      'Use disabled nodes for temporarily unavailable choices rather than removing them, so the structure stays recognizable',
    ],
    dont: [
      'Do not use Tree Select for a flat list — use Select, which is simpler for both hands and screen readers',
      'Do not use it when users need to type to filter a large set — use Combobox, whose text field owns the keystrokes',
      'Do not use it for browsing or navigation outside a form — use Tree View, which is a standalone tree without a trigger or form value',
      'Do not expect group headers to be selectable — if a branch itself must be a valid choice, add an explicit leaf such as "All Strings" inside it',
      'Do not nest deeper than three levels — a dropdown panel is the wrong home for a deep tree; consider a dedicated picker dialog instead',
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
