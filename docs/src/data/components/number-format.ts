import type { ComponentDef } from './_types';

export const numberFormat: ComponentDef = {
    name: 'Number Format',
    slug: 'number-format',
    tag: 'arc-number-format',
    tier: 'typography',
    interactivity: 'static',
    description: 'Locale-aware number, currency, percentage, and compact formatter using Intl.NumberFormat.',

    overview: `NumberFormat renders a formatted number using the browser's built-in \`Intl.NumberFormat\` API, providing locale-aware formatting for numbers, currencies, percentages, and compact notation out of the box. Pass a raw numeric \`value\` and a \`type\` — the component handles thousands separators, currency symbols, percent signs, and compact suffixes like "12.3K" or "1.2M" automatically.

The component uses \`font-variant-numeric: tabular-nums\` and the monospace font stack so that formatted numbers align vertically in tables, stat grids, and dashboards. Because formatting is handled entirely via \`Intl.NumberFormat\`, it respects the user's locale conventions — decimal commas in Germany, lakh grouping in India, yen symbol placement in Japan — without any manual configuration beyond setting the \`locale\` prop.

For the \`percent\` type, values are treated as the actual percentage: pass \`50\` to display "50%", not \`0.5\`. This matches human intuition and avoids the common Intl.NumberFormat footgun where percent style multiplies by 100.`,

    features: [
      'Locale-aware formatting via Intl.NumberFormat for numbers, currency, percent, and compact notation',
      'Tabular nums and monospace font for vertical alignment in grids and tables',
      'Compact notation renders "12.3K", "1.2M", "4.5B" for large numbers',
      'Percent type treats values as actual percentages (50 = 50%) for intuitive usage',
      'Configurable decimal places with sensible defaults per type',
      'Supports any BCP 47 locale and ISO 4217 currency code',
      'Minimal styling — inherits size and color from parent context',
    ],

    guidelines: {
      do: [
        'Use in tables and stat cards where numbers need to align vertically',
        'Set type="currency" with the appropriate currency code for financial data',
        'Use notation="compact" for large numbers in space-constrained layouts',
        'Pair with AnimatedNumber for values that change over time',
        'Set locale explicitly when building multi-language applications',
      ],
      dont: [
        'Use for animated counting effects — use AnimatedNumber instead',
        'Wrap in additional monospace styling — the component already uses tabular-nums',
        'Pass 0.5 for 50% — the percent type expects the actual percentage value (50)',
        'Forget to set the currency prop when using type="currency" in non-USD contexts',
      ],
    },

    previewHtml: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);font-size:16px;color:var(--text-secondary)">
  <div>Number: <arc-number-format value="1234567"></arc-number-format></div>
  <div>Currency: <arc-number-format value="1234.5" type="currency"></arc-number-format></div>
  <div>Percent: <arc-number-format value="99.9" type="percent"></arc-number-format></div>
  <div>Compact: <arc-number-format value="1234567" notation="compact"></arc-number-format></div>
</div>`,

    props: [
      { name: 'value', type: 'number', default: '0', description: 'The number to format' },
      { name: 'type', type: "'number' | 'currency' | 'percent' | 'compact'", default: "'number'", description: 'Formatting style to apply' },
      { name: 'locale', type: 'string', default: "'en-US'", description: 'BCP 47 locale tag for locale-aware formatting' },
      { name: 'currency', type: 'string', default: "'USD'", description: 'ISO 4217 currency code, used when type is "currency"' },
      { name: 'decimals', type: 'number', default: 'auto', description: 'Number of decimal places (defaults: 0 for number, 2 for currency, 1 for percent)' },
      { name: 'notation', type: "'standard' | 'compact'", default: "'standard'", description: 'Number notation — compact gives "12.3K", "1.2M"' },
    ],

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
    <NumberFormat [value]="price" type="currency" />
    <NumberFormat [value]="change" type="percent" />
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
