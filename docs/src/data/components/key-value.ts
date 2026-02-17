import type { ComponentDef } from './_types';

export const keyValue: ComponentDef = {
  name: 'Key Value',
  slug: 'key-value',
  tag: 'arc-key-value',
  tier: 'data',
  interactivity: 'static',
  description: 'A styled definition list for displaying labeled key-value pairs. Supports horizontal and stacked layouts with optional dividers between rows.',

  overview: `Key Value provides a clean, scannable way to present labeled data — similar to a definition list, but styled with ARC UI's token system. Each pair is an \`arc-kv-pair\` element with a \`label\` attribute for the term and slotted content for the value.

Two layout modes cover the most common patterns: horizontal (grid-based, with the key and value side by side) and stacked (key above value). An optional \`dividers\` prop adds subtle separators between rows for improved readability in longer lists.

Pairs respond to hover with a subtle background highlight, making it easy to track which row you're reading. The component uses semantic markup and exposed CSS parts for full style customization.`,

  features: [
    'Two layout modes: horizontal (grid) and stacked (flex column)',
    'Optional dividers between key-value pairs for visual separation',
    'Subtle hover highlight on each pair row for readability',
    'Keys styled with accent font, uppercase, and letter-spacing for clear hierarchy',
    'Values support arbitrary slotted content — text, badges, links, icons',
    'Exposed CSS parts: list, pair, key, value',
    'Respects `prefers-reduced-motion` for transitions',
  ],

  guidelines: {
    do: [
      'Use for metadata displays — server details, user profiles, order summaries',
      'Use `arc-kv-pair` as direct children for consistent styling',
      'Use horizontal layout when keys are short and values are single-line',
      'Use stacked layout when values are long or multi-line',
      'Pair with `arc-card` to contain key-value groups within panels',
    ],
    dont: [
      'Use for tabular data with many columns — use `arc-data-table` instead',
      'Use for form field labels — use proper `arc-label` and input components',
      'Mix raw HTML elements with `arc-kv-pair` children',
      'Use for navigation or action lists — use `arc-list` instead',
    ],
  },

  previewHtml: `<arc-key-value style="max-width: 400px;">
  <arc-kv-pair label="Status">Active</arc-kv-pair>
  <arc-kv-pair label="Region">US-East</arc-kv-pair>
  <arc-kv-pair label="Uptime">99.9%</arc-kv-pair>
  <arc-kv-pair label="Last Deploy">2 hours ago</arc-kv-pair>
</arc-key-value>`,

  props: [
    { name: 'layout', type: "'horizontal' | 'stacked'", default: "'horizontal'", description: 'Controls pair arrangement. Horizontal uses a CSS grid with key and value side by side. Stacked places the key above the value.' },
    { name: 'dividers', type: 'boolean', default: 'true', description: 'When true, renders a subtle border between each key-value pair.' },
  ],

  subComponents: [
    {
      name: 'KV Pair',
      tag: 'arc-kv-pair',
      description: 'A single key-value pair within an arc-key-value container. The `label` attribute provides the key text, and the default slot holds the value content.',
      props: [
        { name: 'label', type: 'string', default: "''", description: 'The key/term text displayed in uppercase accent styling.' },
        { name: 'default slot', type: 'slot', description: 'The value content — can be text, badges, links, or any inline/block content.' },
      ],
    },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-key-value>
  <arc-kv-pair label="Status">Active</arc-kv-pair>
  <arc-kv-pair label="Region">US-East</arc-kv-pair>
  <arc-kv-pair label="Uptime">99.9%</arc-kv-pair>
  <arc-kv-pair label="Last Deploy">2 hours ago</arc-kv-pair>
</arc-key-value>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { KeyValue, KvPair } from '@arclux/arc-ui-react';

<KeyValue>
  <KvPair label="Status">Active</KvPair>
  <KvPair label="Region">US-East</KvPair>
  <KvPair label="Uptime">99.9%</KvPair>
  <KvPair label="Last Deploy">2 hours ago</KvPair>
</KeyValue>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { KeyValue, KvPair } from '@arclux/arc-ui-vue';
</script>

<template>
  <KeyValue>
    <KvPair label="Status">Active</KvPair>
    <KvPair label="Region">US-East</KvPair>
    <KvPair label="Uptime">99.9%</KvPair>
    <KvPair label="Last Deploy">2 hours ago</KvPair>
  </KeyValue>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { KeyValue, KvPair } from '@arclux/arc-ui-svelte';
</script>

<KeyValue>
  <KvPair label="Status">Active</KvPair>
  <KvPair label="Region">US-East</KvPair>
  <KvPair label="Uptime">99.9%</KvPair>
  <KvPair label="Last Deploy">2 hours ago</KvPair>
</KeyValue>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { KeyValue, KvPair } from '@arclux/arc-ui-angular';

@Component({
  imports: [KeyValue, KvPair],
  template: \`
    <KeyValue>
      <KvPair label="Status">Active</KvPair>
      <KvPair label="Region">US-East</KvPair>
      <KvPair label="Uptime">99.9%</KvPair>
      <KvPair label="Last Deploy">2 hours ago</KvPair>
    </KeyValue>
  \`,
})
export class ServerDetailsComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { KeyValue, KvPair } from '@arclux/arc-ui-solid';

<KeyValue>
  <KvPair label="Status">Active</KvPair>
  <KvPair label="Region">US-East</KvPair>
  <KvPair label="Uptime">99.9%</KvPair>
  <KvPair label="Last Deploy">2 hours ago</KvPair>
</KeyValue>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { KeyValue, KvPair } from '@arclux/arc-ui-preact';

<KeyValue>
  <KvPair label="Status">Active</KvPair>
  <KvPair label="Region">US-East</KvPair>
  <KvPair label="Uptime">99.9%</KvPair>
  <KvPair label="Last Deploy">2 hours ago</KvPair>
</KeyValue>`,
    },
  ],

  seeAlso: ['stat', 'data-table', 'list'],
};
