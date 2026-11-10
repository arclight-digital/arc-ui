import type { ComponentDef } from './_types';

export const numberFormat: ComponentDef = {
  name: 'Number Format',
  slug: 'number-format',
  tag: 'arc-number-format',
  tier: 'typography',
  interactivity: 'static',
  description:
    'Locale-aware number, currency, percentage, and compact formatter using Intl.NumberFormat.',

  overview: `Number Format renders a number formatted by the browser's \`Intl.NumberFormat\`. Pass a raw \`value\` and a \`type\` (\`number\`, \`currency\`, \`percent\` or \`compact\`), and it adds thousands separators, currency symbols, percent signs or compact suffixes like "12.3K" and "1.2M".

It sets \`font-variant-numeric: tabular-nums\` and the monospace font, so numbers line up in tables, stat grids and dashboards. The \`locale\` prop takes a BCP 47 tag, and \`Intl.NumberFormat\` applies that locale's conventions: decimal commas in German, lakh grouping in Indian English, yen symbol placement in Japanese. Without it, the locale is \`en-US\`.

For the \`percent\` type, pass the percentage itself: \`50\` displays "50%". Plain \`Intl.NumberFormat\` multiplies by 100, so it would want \`0.5\`.`,

  features: [
    '`decimals` sets decimal places, 0 to 20. Unset, it\'s 0 for numbers, 2 for currency and 1 for percent',
    '`currency` takes an ISO 4217 code and defaults to USD',
    'Inherits size and color from its parent',
  ],

  guidelines: {
    do: [
      'Use it in tables and stat cards where numbers need to line up',
      'Set `type="currency"` and a `currency` code for money',
      'Use `notation="compact"` for large numbers in tight layouts',
      'Set `locale` in multi-language apps',
    ],
    dont: [
      'Don\'t use it for animated counting. Use Animated Number',
      'Don\'t add your own monospace styling. It already sets the mono font and tabular-nums',
      'Don\'t leave out `currency` with `type="currency"` unless you mean USD',
    ],
  },

  previewHtml: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);font-size:16px;color:var(--text-secondary)">
  <div>Number: <arc-number-format value="1234567"></arc-number-format></div>
  <div>Currency: <arc-number-format value="1234.5" type="currency"></arc-number-format></div>
  <div>Percent: <arc-number-format value="99.9" type="percent"></arc-number-format></div>
  <div>Compact: <arc-number-format value="1234567" notation="compact"></arc-number-format></div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Basic number with thousands separators -->
<arc-number-format value="1234567"></arc-number-format>

<!-- Currency -->
<arc-number-format value="1234.50" type="currency" currency="USD"></arc-number-format>

<!-- Percentage (50 = 50%) -->
<arc-number-format value="99.9" type="percent"></arc-number-format>

<!-- Compact notation -->
<arc-number-format value="1234567" notation="compact"></arc-number-format>

<!-- European locale -->
<arc-number-format value="1234.56" type="currency" currency="EUR" locale="de-DE"></arc-number-format>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { NumberFormat } from '@arclux/arc-ui-react';

function PricingTable({ price, change, users }) {
  return (
    <div>
      <NumberFormat value={price} type="currency" />
      <NumberFormat value={change} type="percent" />
      <NumberFormat value={users} notation="compact" />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { NumberFormat } from '@arclux/arc-ui-vue';

const price = 1234.50;
const change = 12.5;
</script>

<template>
  <NumberFormat :value="price" type="currency" />
  <NumberFormat :value="change" type="percent" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { NumberFormat } from '@arclux/arc-ui-svelte';

  let price = 1234.50;
  let change = 12.5;
</script>

<NumberFormat value={price} type="currency" />
<NumberFormat value={change} type="percent" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { NumberFormat } from '@arclux/arc-ui-angular';

@Component({
  imports: [NumberFormat],
  template: \`
    <arc-number-format [value]="price" type="currency" />
    <arc-number-format [value]="change" type="percent" />
  \`,
})
export class MetricsComponent {
  price = 1234.50;
  change = 12.5;
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { NumberFormat } from '@arclux/arc-ui-solid';

function Metrics() {
  return (
    <div>
      <NumberFormat value={1234.50} type="currency" />
      <NumberFormat value={12.5} type="percent" />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { NumberFormat } from '@arclux/arc-ui-preact';

function Metrics() {
  return (
    <div>
      <NumberFormat value={1234.50} type="currency" />
      <NumberFormat value={12.5} type="percent" />
    </div>
  );
}`,
    },
  ],

  seeAlso: ['animated-number', 'stat', 'text'],
};
