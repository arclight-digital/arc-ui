import type { ComponentDef } from './_types';

export const comparison: ComponentDef = {
  name: 'Comparison',
  slug: 'comparison',
  tag: 'arc-comparison',
  tier: 'data',
  interactivity: 'static',
  description: 'A two-column or multi-column comparison table for pricing tiers, feature breakdowns, or before/after comparisons. Each column is defined with an arc-comparison-column child element.',

  overview: `Comparison renders a structured grid of feature rows and value columns, ideal for pricing tables, plan comparisons, and feature matrices. The parent \`arc-comparison\` element accepts a JSON array of feature labels, while each slotted \`arc-comparison-column\` child provides a heading and a matching JSON array of values.

Boolean values are rendered automatically as check marks or crosses — pass \`"true"\` or \`"false"\` as string values and the component renders accessible SVG icons in success/ghost colors. Any other string value is displayed as-is, making it flexible for mixed comparison data (e.g., "5 GB", "Unlimited", "true").

The \`highlight\` attribute on a column adds a subtle accent background to both the header and all cells in that column, drawing the user's eye to the recommended or featured tier. The entire component uses CSS Grid for automatic column sizing and includes row hover states for scanability.`,

  features: [
    'CSS Grid layout with automatic column count based on slotted children',
    'JSON-driven features and values — no complex DOM nesting required',
    'Boolean rendering: "true" becomes a green check, "false" becomes a ghost X',
    'Column highlighting with accent background for featured/recommended tiers',
    'Row hover states for easy horizontal scanning',
    'Accessible table roles (table, row, rowheader, columnheader, cell)',
    'CSS parts for deep customization: table, header, cell, feature',
    'Respects prefers-reduced-motion for transitions',
  ],

  guidelines: {
    do: [
      'Use for pricing tables, feature matrices, and plan comparisons',
      'Keep feature labels concise — long labels compress the value columns',
      'Highlight at most one column (the recommended tier) to guide user attention',
      'Use boolean values ("true"/"false") for feature presence to get automatic check/cross icons',
      'Ensure the features array and each column\'s values array have the same length',
    ],
    dont: [
      'Use for arbitrary data tables — use data-table instead for sortable/filterable data',
      'Add more than 4-5 columns — the grid becomes too compressed on smaller screens',
      'Mix boolean and text values in the same row — pick one format per feature',
      'Forget to provide the features prop — without it, no rows will render',
    ],
  },

  previewHtml: `<arc-comparison features='["Storage","Bandwidth","Custom Domain","Priority Support"]'>
  <arc-comparison-column heading="Free" values='["5 GB","10 GB","false","false"]'></arc-comparison-column>
  <arc-comparison-column heading="Pro" highlight values='["100 GB","Unlimited","true","true"]'></arc-comparison-column>
  <arc-comparison-column heading="Enterprise" values='["Unlimited","Unlimited","true","true"]'></arc-comparison-column>
</arc-comparison>`,

  props: [
    { name: 'features', type: 'string', default: "'[]'", description: 'JSON array of feature label strings, e.g. \'["Storage","Bandwidth","Support"]\'. Each entry becomes a row in the comparison grid.' },
  ],

  subComponents: [
    {
      name: 'ComparisonColumn',
      tag: 'arc-comparison-column',
      description: 'Data-holder child element that defines a single column in the comparison grid. Renders nothing visible — it provides heading, highlight, and values data to the parent.',
      props: [
        { name: 'heading', type: 'string', default: "''", description: 'Column header text displayed at the top of this column (e.g., "Free", "Pro").' },
        { name: 'highlight', type: 'boolean', default: 'false', description: 'When true, adds an accent background to the header and all cells in this column.' },
        { name: 'values', type: 'string', default: "'[]'", description: 'JSON array of values matching the features order. Use "true"/"false" for check/cross icons, or any string for text values.' },
      ],
    },
  ],

  events: [],

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
    <Comparison [features]="features">
      <ComparisonColumn heading="Free" values='["5 GB","10 GB","false","false"]' />
      <ComparisonColumn heading="Pro" highlight values='["100 GB","Unlimited","true","true"]' />
      <ComparisonColumn heading="Enterprise" values='["Unlimited","Unlimited","true","true"]' />
    </Comparison>
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

  seeAlso: ['data-table', 'card', 'feature-card'],
};
