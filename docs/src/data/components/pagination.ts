import type { ComponentDef } from './_types';

export const pagination: ComponentDef = {
  name: 'Pagination',
  slug: 'pagination',
  tag: 'arc-pagination',
  tier: 'navigation',
  interactivity: 'interactive',
  searchKeywords: ['pager', 'page numbers'],
  description:
    'Previous and next buttons around numbered page buttons, with ellipses when there are too many pages to show.',

  overview: `Pagination renders previous and next buttons around a row of page numbers. The first and last pages always show, \`siblings\` sets how many pages show on each side of the current one, and an ellipsis stands in for the rest.

Set \`total\` to the number of pages and \`current\` to the active page (1-based). Clicking a page or an arrow fires \`arc-change\` with the new page number, and you load that page's data. Previous disables itself on the first page and next on the last.

The control is a \`<nav>\` landmark labelled "Pagination". The active page button has \`aria-current="page"\`, and the arrow buttons are labelled "Previous page" and "Next page".`,

  features: [
    'The active page has an accent-primary background and a glow',
    '`current` is clamped to 1 through `total`, and lowering `total` re-clamps it',
  ],

  guidelines: {
    do: [
      'Use `siblings="1"` where space is tight and `siblings="2"` where it isn\'t',
      'Place it directly below or beside the content it pages',
      'Add a page-size selector when readers should choose how many items a page shows',
    ],
    dont: [
      'Don\'t use it for fewer than 3 pages. Plain previous and next links are simpler',
      'Don\'t use it to move between unrelated sections. Use Tabs',
    ],
  },

  previewHtml: `<arc-pagination total="12" current="4" siblings="1"></arc-pagination>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-pagination total="10" current="3" siblings="1"></arc-pagination>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Pagination } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Pagination total="10" current="3" siblings="1" />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Pagination } from '@arclux/arc-ui-vue';
</script>

<template>
  <Pagination total="10" current="3" siblings="1" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Pagination } from '@arclux/arc-ui-svelte';
</script>

<Pagination total="10" current="3" siblings="1" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Pagination } from '@arclux/arc-ui-angular';

@Component({
  imports: [Pagination],
  template: \`
    <arc-pagination total="10" current="3" siblings="1"></arc-pagination>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Pagination } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Pagination total="10" current="3" siblings="1" />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Pagination } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Pagination total="10" current="3" siblings="1" />
  );
}`,
    },
  ],

  seeAlso: ['data-grid', 'breadcrumb', 'infinite-scroll'],
};
