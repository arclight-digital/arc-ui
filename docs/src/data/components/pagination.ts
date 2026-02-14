import type { ComponentDef } from './_types';

export const pagination: ComponentDef = {
    name: 'Pagination',
    slug: 'pagination',
    tag: 'arc-pagination',
    tier: 'navigation',
    interactivity: 'interactive',
    description: 'Page navigation control with previous/next arrows, numbered page buttons, and smart ellipsis truncation.',

    overview: `Pagination provides a compact navigation strip for moving between pages of content. It renders previous/next arrow buttons flanking a row of numbered page buttons, with ellipsis markers automatically inserted when the total page count exceeds what can be displayed. The first and last pages are always visible, and the \`siblings\` prop controls how many pages appear adjacent to the currently active page.

The component is entirely declarative -- set \`total\` for the number of pages, \`current\` for the active page, and \`siblings\` for the visible range. When the user clicks a page or arrow, an \`arc-change\` event fires with the new page number, letting you update your data source and re-render. Previous and next buttons are automatically disabled at the boundaries.

Pagination follows the WAI-ARIA pattern for navigation landmarks with \`role="navigation"\` and \`aria-label="Pagination"\`. Each page button carries \`aria-current="page"\` when active, and the arrow buttons include descriptive aria-labels. The active page receives a glowing accent-primary highlight consistent with ARC UI's design language.`,

    features: [
      'Smart ellipsis truncation that always shows the first page, last page, and siblings around the current page',
      'Configurable `siblings` prop to control how many page numbers appear next to the active page',
      'Previous and next arrow buttons that auto-disable at page boundaries',
      'Active page highlighted with accent-primary background and a subtle box-shadow glow',
      'Accessible navigation landmark with `role="navigation"` and `aria-current="page"` on the active button',
      'Hover and focus-visible states with border brightening and focus glow ring',
      'Fires `arc-change` with the new page number on every navigation action',
    ],

    guidelines: {
      do: [
        'Always set `total` to reflect the actual number of pages in your dataset',
        'Use `siblings="1"` for compact layouts or `siblings="2"` when space allows for easier scanning',
        'Listen to `arc-change` and update your data source to load the corresponding page',
        'Place Pagination below or adjacent to the content it controls for clear spatial association',
        'Combine with a page-size selector when users should control how many items appear per page',
      ],
      dont: [
        'Do not use Pagination for fewer than 3 pages -- inline previous/next links are simpler',
        'Do not set `current` to a value outside the 1..total range -- the component clamps internally but the intent is unclear',
        'Do not nest Pagination inside other interactive controls like buttons or links',
        'Do not use Pagination to navigate between unrelated sections -- use Tabs instead',
        'Avoid hiding the component when there is only one page -- instead disable or show a single page indicator so users understand the data scope',
      ],
    },

    previewHtml: `<arc-pagination total="12" current="4" siblings="1"></arc-pagination>`,

    props: [
      { name: 'total', type: 'number', default: '1', description: 'Total number of pages.' },
      { name: 'current', type: 'number', default: '1', description: 'The currently active page number (1-based). Reflected as an attribute.' },
      { name: 'siblings', type: 'number', default: '1', description: 'Number of page buttons to show on each side of the current page before ellipsis truncation kicks in.' },
      { name: 'compact', type: 'boolean', default: 'false', description: "Shows only previous/next buttons with a 'current / total' label. Hides individual page numbers." },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the current page changes' },
    ],
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

<Pagination total="10" current="3" siblings="1"></Pagination>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Pagination } from '@arclux/arc-ui-vue';
</script>

<template>
  <Pagination total="10" current="3" siblings="1"></Pagination>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Pagination } from '@arclux/arc-ui-svelte';
</script>

<Pagination total="10" current="3" siblings="1"></Pagination>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Pagination } from '@arclux/arc-ui-angular';

@Component({
  imports: [Pagination],
  template: \`
    <Pagination total="10" current="3" siblings="1"></Pagination>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Pagination } from '@arclux/arc-ui-solid';

<Pagination total="10" current="3" siblings="1"></Pagination>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Pagination } from '@arclux/arc-ui-preact';

<Pagination total="10" current="3" siblings="1"></Pagination>`,
      },
    ],
  
  seeAlso: ["data-table","breadcrumb","infinite-scroll"],
};
