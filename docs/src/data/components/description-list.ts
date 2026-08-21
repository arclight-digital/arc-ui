import type { ComponentDef } from './_types';

export const descriptionList: ComponentDef = {
  name: 'Description List',
  slug: 'description-list',
  tag: 'arc-description-list',
  tier: 'data',
  interactivity: 'static',
  searchKeywords: ['key value', 'metadata', 'definition list', 'dl', 'spec sheet'],
  description:
    'Structured term/detail pair list in a responsive grid layout with optional dividers.',

  overview: `DescriptionList renders term/detail pairs in a grid layout, ideal for metadata displays, specification tables, and detail panels. Each child \`arc-description-item\` contains a term label and a detail slot, with the term displayed as an uppercase accent label and the detail rendered below it.

**Two props control arrangement and they are about different axes.** \`columns\` is how many *items* sit across — set it to 2, 3, or 4 to arrange pairs side by side. \`layout\` is how each item arranges its own term and detail: \`stacked\` (the default) puts the term above the detail, and \`horizontal\` puts them side by side on a shared two-column grid so terms align down the list. They compose — one item can be horizontal inside a three-column list. Vertical dividers appear automatically between columns when \`dividers\` is enabled, and on screens narrower than 640px the grid collapses to a single column for readability.

**\`layout\` arrived with \`arc-key-value\`, which merged in here in v4.** A term beside its detail was that component's whole reason to exist as a separate element, so absorbing it meant absorbing the arrangement. One thing to watch when migrating: Key Value defaulted to the horizontal arrangement and this component defaults to \`stacked\`, so add \`layout="horizontal"\` to keep what you had. The survivor's default is unchanged deliberately — a merge is not the place to restyle the component that survived. See [the tombstone](/docs/components/key-value) for the full translation.

Dividers (bottom borders between items, and right borders between columns) are enabled by default and can be toggled off with the \`dividers\` attribute. The container uses \`role="list"\` and each item uses \`role="listitem"\` for assistive technology support.`,

  features: [
    'ARIA list/listitem roles for assistive technology support',
    'Responsive grid layout with configurable column count',
    '`layout="horizontal"` puts each term beside its detail on a shared grid, so terms align down the list',
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
      'Use `layout="horizontal"` when terms are short and you want them to align down a single column of pairs',
      'Pair with cards or panels for contained metadata displays',
      'Keep term labels concise — one to three words is ideal',
    ],
    dont: [
      'Do not use for tabular data with many rows — use `arc-data-grid` instead',
      'Do not nest description lists inside each other',
      'Do not combine `layout="horizontal"` with a high `columns` count — each item then needs room for two columns of its own, and both collapse to nothing',
      'Do not use long paragraph-length terms — move verbose content to the detail slot',
      'Do not mix description items with non-`arc-description-item` children',
    ],
  },

  previewHtml: `<div style="display:flex;flex-direction:column;gap:var(--space-xl);max-width:480px;width:100%">
  <arc-description-list columns="2">
    <arc-description-item term="Name">Arclight Platform</arc-description-item>
    <arc-description-item term="Status">Active</arc-description-item>
    <arc-description-item term="Region">US-West-2</arc-description-item>
    <arc-description-item term="Version">4.2.1</arc-description-item>
  </arc-description-list>
  <arc-description-list layout="horizontal">
    <arc-description-item term="Name">Arclight Platform</arc-description-item>
    <arc-description-item term="Status">Active</arc-description-item>
    <arc-description-item term="Region">US-West-2</arc-description-item>
  </arc-description-list>
</div>`,

  subComponents: [
    {
      name: 'Description Item',
      tag: 'arc-description-item',
      description:
        'A single term/detail pair within a description list. The term is rendered as an uppercase label, and the default slot holds the detail content.',
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
</arc-description-list>

<!-- Term beside detail. This is what arc-key-value defaulted to. -->
<arc-description-list layout="horizontal">
  <arc-description-item term="Name">Arclight Platform</arc-description-item>
  <arc-description-item term="Status">Active</arc-description-item>
</arc-description-list>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { DescriptionList, DescriptionItem } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <DescriptionList columns={2}>
      <DescriptionItem term="Name">Arclight Platform</DescriptionItem>
      <DescriptionItem term="Status">Active</DescriptionItem>
      <DescriptionItem term="Region">US-West-2</DescriptionItem>
      <DescriptionItem term="Version">4.2.1</DescriptionItem>
    </DescriptionList>
  );
}`,
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
    <arc-description-list [columns]="2">
      <arc-description-item term="Name">Arclight Platform</arc-description-item>
      <arc-description-item term="Status">Active</arc-description-item>
      <arc-description-item term="Region">US-West-2</arc-description-item>
      <arc-description-item term="Version">4.2.1</arc-description-item>
    </arc-description-list>
  \`,
})
export class MetadataComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { DescriptionList, DescriptionItem } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <DescriptionList columns={2}>
      <DescriptionItem term="Name">Arclight Platform</DescriptionItem>
      <DescriptionItem term="Status">Active</DescriptionItem>
      <DescriptionItem term="Region">US-West-2</DescriptionItem>
      <DescriptionItem term="Version">4.2.1</DescriptionItem>
    </DescriptionList>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { DescriptionList, DescriptionItem } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <DescriptionList columns={2}>
      <DescriptionItem term="Name">Arclight Platform</DescriptionItem>
      <DescriptionItem term="Status">Active</DescriptionItem>
      <DescriptionItem term="Region">US-West-2</DescriptionItem>
      <DescriptionItem term="Version">4.2.1</DescriptionItem>
    </DescriptionList>
  );
}`,
    },
  ],

  seeAlso: ['data-grid', 'list'],
};
