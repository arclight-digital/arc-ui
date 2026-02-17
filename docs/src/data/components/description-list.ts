import type { ComponentDef } from './_types';

export const descriptionList: ComponentDef = {
  name: 'Description List',
  slug: 'description-list',
  tag: 'arc-description-list',
  tier: 'data',
  interactivity: 'static',
  description: 'Structured term/detail pair list in a responsive grid layout with optional dividers.',

  overview: `Description List renders term/detail pairs in a grid layout, ideal for metadata displays, specification tables, and detail panels. Each child \`arc-description-item\` contains a term label and a detail slot, with the term displayed as an uppercase accent label and the detail rendered below it.

The \`columns\` prop controls the grid layout — set it to 2, 3, or 4 to arrange items side by side. Vertical dividers appear automatically between columns when \`dividers\` is enabled. On screens narrower than 640px the layout collapses to a single column for readability.

Dividers (bottom borders between items, and right borders between columns) are enabled by default and can be toggled off with the \`dividers\` attribute. The container uses \`role="list"\` and each item uses \`role="listitem"\` for assistive technology support.`,

  features: [
    'ARIA list/listitem roles for assistive technology support',
    'Responsive grid layout with configurable column count',
    'Automatic single-column fallback below 640px',
    'Optional horizontal and vertical dividers between items',
    'Uppercase accent-font term labels for visual hierarchy',
    'CSS parts: `list`, `item`, `term`, `detail` for deep customization',
    'Follows `prefers-reduced-motion` for reduced-motion users',
  ],

  guidelines: {
    do: [
      'Use for structured key/value metadata such as profile details, order summaries, or spec sheets',
      'Set `columns` to 2 or 3 for wider layouts where items are short and scannable',
      'Pair with cards or panels for contained metadata displays',
      'Keep term labels concise — one to three words is ideal',
    ],
    dont: [
      'Use for tabular data with many rows — use `arc-data-table` instead',
      'Nest description lists inside each other',
      'Use long paragraph-length terms — move verbose content to the detail slot',
      'Mix description items with non-`arc-description-item` children',
    ],
  },

  previewHtml: `<arc-description-list columns="2" style="max-width: 480px;">
  <arc-description-item term="Name">Arclight Platform</arc-description-item>
  <arc-description-item term="Status">Active</arc-description-item>
  <arc-description-item term="Region">US-West-2</arc-description-item>
  <arc-description-item term="Version">4.2.1</arc-description-item>
</arc-description-list>`,

  props: [
    { name: 'columns', type: 'number', default: '1', description: 'Number of grid columns for laying out items side by side.' },
    { name: 'dividers', type: 'boolean', default: 'true', description: 'Show horizontal dividers between rows and vertical dividers between columns.' },
  ],

  subComponents: [
    {
      name: 'Description Item',
      tag: 'arc-description-item',
      description: 'A single term/detail pair within a description list. The term is rendered as an uppercase label, and the default slot holds the detail content.',
      props: [
        { name: 'term', type: 'string', default: "''", description: 'The key or label for this description entry, displayed as an uppercase heading.' },
        { name: 'default slot', type: 'slot', description: 'The detail or value content for this entry.' },
      ],
    },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-description-list columns="2">
  <arc-description-item term="Name">Arclight Platform</arc-description-item>
  <arc-description-item term="Status">Active</arc-description-item>
  <arc-description-item term="Region">US-West-2</arc-description-item>
  <arc-description-item term="Version">4.2.1</arc-description-item>
</arc-description-list>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { DescriptionList, DescriptionItem } from '@arclux/arc-ui-react';

<DescriptionList columns={2}>
  <DescriptionItem term="Name">Arclight Platform</DescriptionItem>
  <DescriptionItem term="Status">Active</DescriptionItem>
  <DescriptionItem term="Region">US-West-2</DescriptionItem>
  <DescriptionItem term="Version">4.2.1</DescriptionItem>
</DescriptionList>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { DescriptionList, DescriptionItem } from '@arclux/arc-ui-vue';
</script>

<template>
  <DescriptionList :columns="2">
    <DescriptionItem term="Name">Arclight Platform</DescriptionItem>
    <DescriptionItem term="Status">Active</DescriptionItem>
    <DescriptionItem term="Region">US-West-2</DescriptionItem>
    <DescriptionItem term="Version">4.2.1</DescriptionItem>
  </DescriptionList>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { DescriptionList, DescriptionItem } from '@arclux/arc-ui-svelte';
</script>

<DescriptionList columns={2}>
  <DescriptionItem term="Name">Arclight Platform</DescriptionItem>
  <DescriptionItem term="Status">Active</DescriptionItem>
  <DescriptionItem term="Region">US-West-2</DescriptionItem>
  <DescriptionItem term="Version">4.2.1</DescriptionItem>
</DescriptionList>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { DescriptionList, DescriptionItem } from '@arclux/arc-ui-angular';

@Component({
  imports: [DescriptionList, DescriptionItem],
  template: \`
    <DescriptionList [columns]="2">
      <DescriptionItem term="Name">Arclight Platform</DescriptionItem>
      <DescriptionItem term="Status">Active</DescriptionItem>
      <DescriptionItem term="Region">US-West-2</DescriptionItem>
      <DescriptionItem term="Version">4.2.1</DescriptionItem>
    </DescriptionList>
  \`,
})
export class MetadataComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { DescriptionList, DescriptionItem } from '@arclux/arc-ui-solid';

<DescriptionList columns={2}>
  <DescriptionItem term="Name">Arclight Platform</DescriptionItem>
  <DescriptionItem term="Status">Active</DescriptionItem>
  <DescriptionItem term="Region">US-West-2</DescriptionItem>
  <DescriptionItem term="Version">4.2.1</DescriptionItem>
</DescriptionList>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { DescriptionList, DescriptionItem } from '@arclux/arc-ui-preact';

<DescriptionList columns={2}>
  <DescriptionItem term="Name">Arclight Platform</DescriptionItem>
  <DescriptionItem term="Status">Active</DescriptionItem>
  <DescriptionItem term="Region">US-West-2</DescriptionItem>
  <DescriptionItem term="Version">4.2.1</DescriptionItem>
</DescriptionList>`,
    },
  ],

  seeAlso: ['key-value', 'data-table', 'list'],
};
