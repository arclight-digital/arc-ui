import type { ComponentDef } from './_types';

export const cluster: ComponentDef = {
    name: 'Cluster',
    slug: 'cluster',
    tag: 'arc-cluster',
    tier: 'layout',
    interactivity: 'static',
    description: 'Flex-wrap primitive for variable-width children like tags, chips, and buttons with token gap spacing.',

    overview: `Cluster is a flex-wrap layout primitive designed for groups of variable-width inline elements — tags, chips, badges, buttons, or any set of items that should flow naturally across the available width and wrap to the next line when space runs out. It is the horizontal-flow counterpart to Stack (vertical spacing) and the wrapping counterpart to a simple flexbox row.

The component applies \`display: flex\`, \`flex-wrap: wrap\`, and token-based gap spacing, with configurable \`align\` and \`justify\` props that map to \`align-items\` and \`justify-content\`. This covers the full range of common inline-group patterns: left-aligned tag lists, centered button groups, space-between navigation items, and everything in between.

Use Cluster whenever you have a set of inline elements that should wrap naturally. For fixed-column grids, use Dashboard Grid or Aspect Grid. For vertical stacking, use Stack. For a single row that should never wrap, use a plain flex container with \`flex-wrap: nowrap\`.`,

    features: [
      'Flex-wrap layout for natural inline-flow wrapping',
      'Design-token-based gap spacing (xs, sm, md, lg) for consistent rhythm',
      'Configurable alignment via `align` prop (start, center, end)',
      'Configurable justification via `justify` prop (start, center, end, between)',
      'Handles variable-width children gracefully — no fixed column assumptions',
      'Lightweight wrapper with zero JavaScript overhead',
      'CSS part: `cluster` for targeted ::part() styling',
    ],

    guidelines: {
      do: [
        'Use for tag lists, chip groups, and badge collections',
        'Use for button groups that should wrap on narrow screens',
        'Use gap="sm" for dense tag/chip groups; gap="md" for button groups',
        'Use justify="between" for navigation-style layouts with space between items',
        'Combine with Inset for padded containers of clustered items',
      ],
      dont: [
        'Do not use Cluster for vertical stacking — use Stack instead',
        'Do not use Cluster for fixed-column grids — use Dashboard Grid or Aspect Grid',
        'Do not set large gap values on dense tag lists — it creates excessive whitespace',
        'Do not nest Cluster inside Cluster unless you intentionally want compound wrapping groups',
        'Do not use Cluster for single items — it adds unnecessary wrapper overhead',
      ],
    },

    previewHtml: `<div style="display:flex;flex-wrap:wrap;gap:var(--space-sm);align-items:center;width:100%">
  <span style="display:inline-flex;align-items:center;padding:4px 12px;background:rgba(77,126,247,0.12);color:var(--accent-primary);border-radius:var(--radius-full);font-size:13px;font-family:var(--font-body)">Design</span>
  <span style="display:inline-flex;align-items:center;padding:4px 12px;background:rgba(139,92,246,0.12);color:var(--accent-secondary);border-radius:var(--radius-full);font-size:13px;font-family:var(--font-body)">Engineering</span>
  <span style="display:inline-flex;align-items:center;padding:4px 12px;background:rgba(77,126,247,0.12);color:var(--accent-primary);border-radius:var(--radius-full);font-size:13px;font-family:var(--font-body)">Product</span>
  <span style="display:inline-flex;align-items:center;padding:4px 12px;background:rgba(139,92,246,0.12);color:var(--accent-secondary);border-radius:var(--radius-full);font-size:13px;font-family:var(--font-body)">Marketing</span>
  <span style="display:inline-flex;align-items:center;padding:4px 12px;background:rgba(77,126,247,0.12);color:var(--accent-primary);border-radius:var(--radius-full);font-size:13px;font-family:var(--font-body)">Sales</span>
  <span style="display:inline-flex;align-items:center;padding:4px 12px;background:rgba(139,92,246,0.12);color:var(--accent-secondary);border-radius:var(--radius-full);font-size:13px;font-family:var(--font-body)">Support</span>
  <span style="display:inline-flex;align-items:center;padding:4px 12px;background:rgba(77,126,247,0.12);color:var(--accent-primary);border-radius:var(--radius-full);font-size:13px;font-family:var(--font-body)">Research</span>
  <span style="display:inline-flex;align-items:center;padding:4px 12px;background:rgba(139,92,246,0.12);color:var(--accent-secondary);border-radius:var(--radius-full);font-size:13px;font-family:var(--font-body)">Operations</span>
</div>`,

    props: [
      { name: 'gap', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'sm'", description: 'Spacing between items, mapped to design system spacing tokens. Use sm for dense tag groups, md for button groups.' },
      { name: 'align', type: "'start' | 'center' | 'end'", default: "'center'", description: 'Vertical alignment of items within each row (maps to align-items).' },
      { name: 'justify', type: "'start' | 'center' | 'end' | 'between'", default: "'start'", description: 'Horizontal distribution of items (maps to justify-content). Use "between" for navigation-style spacing.' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-cluster gap="sm" align="center" justify="start">
  <arc-tag>Design</arc-tag>
  <arc-tag>Engineering</arc-tag>
  <arc-tag>Product</arc-tag>
  <arc-tag>Marketing</arc-tag>
  <arc-tag>Sales</arc-tag>
  <arc-tag>Support</arc-tag>
</arc-cluster>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Cluster, Tag } from '@arclux/arc-ui-react';

function TagList() {
  const tags = ['Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Support'];

  return (
    <Cluster gap="sm" align="center" justify="start">
      {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
    </Cluster>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Cluster, Tag } from '@arclux/arc-ui-vue';

const tags = ['Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Support'];
</script>

<template>
  <Cluster gap="sm" align="center" justify="start">
    <Tag v-for="tag in tags" :key="tag">{{ tag }}</Tag>
  </Cluster>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Cluster, Tag } from '@arclux/arc-ui-svelte';

  const tags = ['Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Support'];
</script>

<Cluster gap="sm" align="center" justify="start">
  {#each tags as tag}
    <Tag>{tag}</Tag>
  {/each}
</Cluster>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Cluster, Tag } from '@arclux/arc-ui-angular';

@Component({
  imports: [Cluster, Tag],
  template: \`
    <Cluster gap="sm" align="center" justify="start">
      @for (tag of tags; track tag) {
        <Tag>{{ tag }}</Tag>
      }
    </Cluster>
  \`,
})
export class TagListComponent {
  tags = ['Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Support'];
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { For } from 'solid-js';
import { Cluster, Tag } from '@arclux/arc-ui-solid';

function TagList() {
  const tags = ['Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Support'];

  return (
    <Cluster gap="sm" align="center" justify="start">
      <For each={tags}>{tag => <Tag>{tag}</Tag>}</For>
    </Cluster>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Cluster, Tag } from '@arclux/arc-ui-preact';

function TagList() {
  const tags = ['Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Support'];

  return (
    <Cluster gap="sm" align="center" justify="start">
      {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
    </Cluster>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- See HTML tab after running pnpm generate -->
<div class="arc-cluster">...</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- See HTML (Inline) tab after running pnpm generate -->
<div class="arc-cluster" style="display:flex;flex-wrap:wrap;gap:var(--space-sm);align-items:center">...</div>` },
    ],

  seeAlso: ['stack', 'tag', 'chip'],
};
