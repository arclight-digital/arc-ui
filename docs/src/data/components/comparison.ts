import type { ComponentDef } from './_types';

export const comparison: ComponentDef = {
  name: 'Comparison',
  slug: 'comparison',
  tag: 'arc-comparison',
  tier: 'data',
  interactivity: 'static',
  description:
    'Table that compares plans or options feature by feature. Each column is an arc-comparison-column child element.',

  overview: `Comparison draws a grid with one row per feature and one column per plan. Pass the row labels to \`features\` as a JSON array. Each \`<arc-comparison-column>\` adds a column with a \`heading\` and a \`values\` array in the same order as the features.

A value of \`"true"\` renders a check mark and \`"false"\` a cross, each with an accessible name of "Yes" or "No". Any other string, such as "5 GB" or "Unlimited", is shown as text. A missing value leaves the cell blank. Use it for pricing tables and plan comparisons. For data people sort and filter, use DataGrid.`,

  features: [
    '`highlight` on a column gives its header and every cell an accent background',
    'Rows highlight on hover',
    'Uses `table`, `row`, `rowheader`, `columnheader` and `cell` roles',
    'The feature column is at least 140px wide, and the value columns share the rest equally',
    'A malformed `features` value falls back to an empty list without throwing',
    'CSS parts: `table`, `header`, `feature`, `cell`',
  ],

  guidelines: {
    do: [
      'Keep feature labels short. Long ones squeeze the value columns',
      'Highlight one column at most, usually the plan you recommend',
      'Give `features` and every column\'s `values` the same length',
    ],
    dont: [
      'Don\'t mix check marks and text in one row. Pick one format per feature',
    ],
  },

  previewHtml: `<arc-comparison features='["Storage","Bandwidth","Custom domain","Priority support"]'>
  <arc-comparison-column heading="Free" values='["5 GB","10 GB","false","false"]'></arc-comparison-column>
  <arc-comparison-column heading="Pro" highlight values='["100 GB","Unlimited","true","true"]'></arc-comparison-column>
  <arc-comparison-column heading="Enterprise" values='["Unlimited","Unlimited","true","true"]'></arc-comparison-column>
</arc-comparison>`,

  subComponents: [
    {
      name: 'ComparisonColumn',
      tag: 'arc-comparison-column',
      description:
        'One column of a Comparison. It renders nothing itself: the parent reads its heading, highlight and values.',
    },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-comparison features='["Storage","Bandwidth","Custom Domain","Priority Support"]'>
  <arc-comparison-column
    heading="Free"
    values='["5 GB","10 GB","false","false"]'>
  </arc-comparison-column>
  <arc-comparison-column
    heading="Pro"
    highlight
    values='["100 GB","Unlimited","true","true"]'>
  </arc-comparison-column>
  <arc-comparison-column
    heading="Enterprise"
    values='["Unlimited","Unlimited","true","true"]'>
  </arc-comparison-column>
</arc-comparison>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Comparison, ComparisonColumn } from '@arclux/arc-ui-react';

function PricingTable() {
  const features = JSON.stringify(['Storage', 'Bandwidth', 'Custom Domain', 'Support']);

  return (
    <Comparison features={features}>
      <ComparisonColumn heading="Free" values='["5 GB","10 GB","false","false"]' />
      <ComparisonColumn heading="Pro" highlight values='["100 GB","Unlimited","true","true"]' />
      <ComparisonColumn heading="Enterprise" values='["Unlimited","Unlimited","true","true"]' />
    </Comparison>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Comparison, ComparisonColumn } from '@arclux/arc-ui-vue';

const features = JSON.stringify(['Storage', 'Bandwidth', 'Custom Domain', 'Support']);
</script>

<template>
  <Comparison :features="features">
    <ComparisonColumn heading="Free" values='["5 GB","10 GB","false","false"]' />
    <ComparisonColumn heading="Pro" highlight values='["100 GB","Unlimited","true","true"]' />
    <ComparisonColumn heading="Enterprise" values='["Unlimited","Unlimited","true","true"]' />
  </Comparison>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Comparison, ComparisonColumn } from '@arclux/arc-ui-svelte';

  const features = JSON.stringify(['Storage', 'Bandwidth', 'Custom Domain', 'Support']);
</script>

<Comparison {features}>
  <ComparisonColumn heading="Free" values='["5 GB","10 GB","false","false"]' />
  <ComparisonColumn heading="Pro" highlight values='["100 GB","Unlimited","true","true"]' />
  <ComparisonColumn heading="Enterprise" values='["Unlimited","Unlimited","true","true"]' />
</Comparison>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Comparison, ComparisonColumn } from '@arclux/arc-ui-angular';

@Component({
  imports: [Comparison, ComparisonColumn],
  template: \`
    <arc-comparison [features]="features">
      <arc-comparison-column heading="Free" values='["5 GB","10 GB","false","false"]' />
      <arc-comparison-column heading="Pro" highlight values='["100 GB","Unlimited","true","true"]' />
      <arc-comparison-column heading="Enterprise" values='["Unlimited","Unlimited","true","true"]' />
    </arc-comparison>
  \`,
})
export class PricingComponent {
  features = JSON.stringify(['Storage', 'Bandwidth', 'Custom Domain', 'Support']);
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Comparison, ComparisonColumn } from '@arclux/arc-ui-solid';

const features = JSON.stringify(['Storage', 'Bandwidth', 'Custom Domain', 'Support']);

<Comparison features={features}>
  <ComparisonColumn heading="Free" values='["5 GB","10 GB","false","false"]' />
  <ComparisonColumn heading="Pro" highlight values='["100 GB","Unlimited","true","true"]' />
  <ComparisonColumn heading="Enterprise" values='["Unlimited","Unlimited","true","true"]' />
</Comparison>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Comparison, ComparisonColumn } from '@arclux/arc-ui-preact';

const features = JSON.stringify(['Storage', 'Bandwidth', 'Custom Domain', 'Support']);

<Comparison features={features}>
  <ComparisonColumn heading="Free" values='["5 GB","10 GB","false","false"]' />
  <ComparisonColumn heading="Pro" highlight values='["100 GB","Unlimited","true","true"]' />
  <ComparisonColumn heading="Enterprise" values='["Unlimited","Unlimited","true","true"]' />
</Comparison>`,
    },
  ],

  seeAlso: ['data-grid', 'card', 'feature-card'],
};
