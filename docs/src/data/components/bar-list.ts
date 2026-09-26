import type { ComponentDef } from './_types';

export const barList: ComponentDef = {
  name: 'Bar List',
  slug: 'bar-list',
  tag: 'arc-bar-list',
  tier: 'data',
  interactivity: 'static',
  description: 'Labelled horizontal bars with their values, ranked.',

  overview: `BarList shows "which of these, and by how much" in less room than a chart: one row per item, a label and a value above a bar whose length is the value's share of the largest. It suits a top-N breakdown in a tile, a card or a sidebar, where \`arc-chart\` is dashboard-sized and \`arc-sparkline\` has no labels.

Rows are ranked largest first unless you set \`unsorted\`, and \`limit\` keeps the top few. Set \`max\` to put several lists on one scale. The list is a real ordered list: each row reads as its label and value, and the bar is decoration hidden from assistive tech, so nothing depends on seeing its length.`,

  features: [
    'Ranked by value, largest first, or in the given order with `unsorted`',
    '`limit` for a top-N view, and `max` to share one scale across lists',
    'Per-row `display` text for formatted values, rendered identically on server and client',
    'Rows can link (`href`), and the fill colour comes from `--bar-list-fill`',
    'An ordered list with a label per row: accessible without seeing the bars',
  ],

  guidelines: {
    do: [
      'Give the list a `label` naming what is being compared',
      'Use `display` for formatted numbers ("1.2k", "38%") and keep `value` numeric for the bar',
      'Use `limit` and a "see all" link rather than a long list in a small tile',
    ],
    dont: [
      'Do not use it for values that can be negative; a diverging arc-meter shows a lean either way',
      'Do not rely on bar length alone to carry the number; keep the value visible',
    ],
  },

  previewHtml: `<arc-bar-list label="Traffic sources" style="width: 280px;" items='[{"label":"Search","value":482},{"label":"Direct","value":311},{"label":"Social","value":97},{"label":"Email","value":64}]'></arc-bar-list>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-bar-list label="Traffic sources"></arc-bar-list>

<script>
  document.querySelector('arc-bar-list').items = [{ label: "Search", value: 482 }, { label: "Direct", value: 311 }, { label: "Social", value: 97 }];
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { BarList } from '@arclux/arc-ui-react';

const sources = [{ label: "Search", value: 482 }, { label: "Direct", value: 311 }, { label: "Social", value: 97 }];

export default function Example() {
  return <BarList label="Traffic sources" items={sources} />;
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { BarList } from '@arclux/arc-ui-vue';
const sources = [{ label: "Search", value: 482 }, { label: "Direct", value: 311 }, { label: "Social", value: 97 }];
</script>

<template>
  <BarList label="Traffic sources" :items="sources" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { BarList } from '@arclux/arc-ui-svelte';
  const sources = [{ label: "Search", value: 482 }, { label: "Direct", value: 311 }, { label: "Social", value: 97 }];
</script>

<BarList label="Traffic sources" items={sources} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { BarList } from '@arclux/arc-ui-angular';

@Component({
  imports: [BarList],
  template: \`<arc-bar-list label="Traffic sources" [items]="sources"></arc-bar-list>\`,
})
export class MyComponent {
  sources = [{ label: "Search", value: 482 }, { label: "Direct", value: 311 }, { label: "Social", value: 97 }];
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { BarList } from '@arclux/arc-ui-solid';

const sources = [{ label: "Search", value: 482 }, { label: "Direct", value: 311 }, { label: "Social", value: 97 }];

export default function Example() {
  return <BarList label="Traffic sources" items={sources} />;
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { BarList } from '@arclux/arc-ui-preact';

const sources = [{ label: "Search", value: 482 }, { label: "Direct", value: 311 }, { label: "Social", value: 97 }];

export default function Example() {
  return <BarList label="Traffic sources" items={sources} />;
}`,
    },
  ],

  seeAlso: ['chart', 'meter', 'sparkline'],
};
