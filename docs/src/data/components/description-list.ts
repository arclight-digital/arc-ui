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

  overview: `DescriptionList lays out term and detail pairs, for metadata, spec sheets and detail panels. Each child \`<arc-description-item>\` has a \`term\`, shown as an uppercase label, and its content is the detail.

Two props control the arrangement, on different axes. \`columns\` is how many items sit across (1 by default). \`layout\` is how each item arranges its own term and detail: \`stacked\`, the default, puts the term above the detail, and \`horizontal\` puts them side by side on a shared grid so the terms line up down the list. They combine, so a three-column list can use horizontal items. Below 640px every list drops to one column.

**\`layout\` came from \`arc-key-value\`, which merged into this component in v4.** Key Value put the term beside the detail by default, and this component defaults to \`stacked\`, so add \`layout="horizontal"\` to keep what you had. See [the Key Value removal note](/docs/components/key-value) for the full translation.

Dividers between rows and between columns are on by default. Set \`no-dividers\` to remove them. The list has \`role="list"\` and each item \`role="listitem"\`.`,

  features: [
    'Horizontal terms get at least 120px, and the detail takes the rest of the row',
    'CSS parts: `list`, `item`, `term`, `detail`',
  ],

  guidelines: {
    do: [
      'Use it for key and value metadata, such as profile details, order summaries or spec sheets',
      'Set `columns` to 2 or 3 when items are short',
      'Use `layout="horizontal"` when terms are short and you want them lined up in one column',
      'Keep terms to one to three words',
    ],
    dont: [
      'Don\'t use it for tabular data with many rows. Use `arc-data-grid`',
      'Don\'t combine `layout="horizontal"` with a high `columns` count. Each item needs room for two columns of its own, and both get squeezed to nothing',
      'Don\'t write paragraph-length terms. Put the long text in the detail',
      'Don\'t put anything but `arc-description-item` elements in the list. A `role="list"` should only contain list items',
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
        'One term and detail pair in a description list. `term` is the uppercase label, and the default slot is the detail.',
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
