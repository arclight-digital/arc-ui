import type { ComponentDef } from './_types';

export const masonry: ComponentDef = {
    name: 'Masonry',
    slug: 'masonry',
    tag: 'arc-masonry',
    tier: 'layout',
    interactivity: 'static',
    description: 'Pinterest-style vertical-pack grid using CSS columns for efficient masonry layout without JavaScript.',

    overview: `Masonry is a layout primitive that arranges variable-height children into a Pinterest-style vertical-pack grid using pure CSS columns. Items flow top-to-bottom within each column, filling vertical space efficiently without leaving gaps — the classic masonry pattern used in image galleries, card feeds, and content discovery interfaces.

The component uses CSS \`column-count\` and \`column-gap\` under the hood, which means layout is handled entirely by the browser with zero JavaScript overhead. Each child element is automatically placed into the shortest column, creating a tightly packed grid that adapts to varying content heights. The \`columns\` prop controls the number of columns, while the \`gap\` prop maps to design system spacing tokens for consistent rhythm.

Use Masonry when your content items have naturally varying heights — image galleries, blog post cards, testimonial collections, or any feed where uniform row heights would waste space. For uniform aspect-ratio grids, use Aspect Grid instead. For responsive column-to-stack behavior, combine Masonry with Responsive Switcher.`,

    features: [
      'Pure CSS columns layout — zero JavaScript for masonry positioning',
      'Configurable column count via the `columns` prop',
      'Design-token-based gap spacing (sm, md, lg) for consistent rhythm',
      'Vertical-pack flow fills shortest columns first for tight packing',
      'Break-inside: avoid ensures children are never split across columns',
      'Lightweight wrapper with no resize observers or layout calculations',
      'CSS part: `grid` for targeted ::part() styling',
    ],

    guidelines: {
      do: [
        'Use for image galleries with varying aspect ratios',
        'Use for card feeds where content height varies (blog posts, testimonials, products)',
        'Set columns to match the expected viewport width — 2 for narrow, 3-4 for wide',
        'Combine with Responsive Switcher to reduce columns on smaller screens',
        'Use gap="md" for most card-based layouts; gap="sm" for dense image grids',
      ],
      dont: [
        'Do not use Masonry for uniform-height content — use a regular CSS grid or Aspect Grid instead',
        'Do not set very high column counts (>5) as it creates unreadably narrow columns',
        'Do not expect left-to-right reading order — masonry flows top-to-bottom per column',
        'Do not nest Masonry inside Masonry',
        'Do not use for layouts that require precise item ordering — column flow is determined by height',
      ],
    },

    previewHtml: `<div style="column-count:3;column-gap:var(--space-md);width:100%">
  <div style="break-inside:avoid;margin-bottom:var(--space-md);background:rgba(77,126,247,0.12);border-radius:var(--radius-sm);padding:var(--space-md);height:120px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Item 1</div>
  <div style="break-inside:avoid;margin-bottom:var(--space-md);background:rgba(139,92,246,0.12);border-radius:var(--radius-sm);padding:var(--space-md);height:80px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Item 2</div>
  <div style="break-inside:avoid;margin-bottom:var(--space-md);background:rgba(77,126,247,0.12);border-radius:var(--radius-sm);padding:var(--space-md);height:140px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Item 3</div>
  <div style="break-inside:avoid;margin-bottom:var(--space-md);background:rgba(139,92,246,0.12);border-radius:var(--radius-sm);padding:var(--space-md);height:100px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Item 4</div>
  <div style="break-inside:avoid;margin-bottom:var(--space-md);background:rgba(77,126,247,0.12);border-radius:var(--radius-sm);padding:var(--space-md);height:160px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Item 5</div>
  <div style="break-inside:avoid;margin-bottom:var(--space-md);background:rgba(139,92,246,0.12);border-radius:var(--radius-sm);padding:var(--space-md);height:90px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Item 6</div>
</div>`,

    props: [
      { name: 'columns', type: 'number', default: '3', description: 'Number of columns in the masonry grid. The browser distributes children across columns to minimize overall height difference.' },
      { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Spacing between columns and rows, mapped to design system spacing tokens (--space-sm, --space-md, --space-lg).' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-masonry columns="3" gap="md">
  <arc-card>Short content</arc-card>
  <arc-card>Taller content with more text that wraps to multiple lines</arc-card>
  <arc-card>Medium content</arc-card>
  <arc-card>Another short card</arc-card>
  <arc-card>Variable height content for masonry layout</arc-card>
  <arc-card>Brief</arc-card>
</arc-masonry>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Masonry, Card } from '@arclux/arc-ui-react';

function ImageGallery() {
  return (
    <Masonry columns={3} gap="md">
      <Card>Short content</Card>
      <Card>Taller content with more text</Card>
      <Card>Medium content</Card>
      <Card>Another short card</Card>
    </Masonry>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Masonry, Card } from '@arclux/arc-ui-vue';
</script>

<template>
  <Masonry :columns="3" gap="md">
    <Card>Short content</Card>
    <Card>Taller content with more text</Card>
    <Card>Medium content</Card>
    <Card>Another short card</Card>
  </Masonry>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Masonry, Card } from '@arclux/arc-ui-svelte';
</script>

<Masonry columns={3} gap="md">
  <Card>Short content</Card>
  <Card>Taller content with more text</Card>
  <Card>Medium content</Card>
  <Card>Another short card</Card>
</Masonry>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Masonry, Card } from '@arclux/arc-ui-angular';

@Component({
  imports: [Masonry, Card],
  template: \`
    <Masonry [columns]="3" gap="md">
      <Card>Short content</Card>
      <Card>Taller content with more text</Card>
      <Card>Medium content</Card>
      <Card>Another short card</Card>
    </Masonry>
  \`,
})
export class GalleryComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Masonry, Card } from '@arclux/arc-ui-solid';

function ImageGallery() {
  return (
    <Masonry columns={3} gap="md">
      <Card>Short content</Card>
      <Card>Taller content with more text</Card>
      <Card>Medium content</Card>
      <Card>Another short card</Card>
    </Masonry>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Masonry, Card } from '@arclux/arc-ui-preact';

function ImageGallery() {
  return (
    <Masonry columns={3} gap="md">
      <Card>Short content</Card>
      <Card>Taller content with more text</Card>
      <Card>Medium content</Card>
      <Card>Another short card</Card>
    </Masonry>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- See HTML tab after running pnpm generate -->
<div class="arc-masonry">...</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- See HTML (Inline) tab after running pnpm generate -->
<div class="arc-masonry" style="column-count:3;column-gap:var(--space-md)">...</div>` },
    ],

  seeAlso: ['aspect-grid', 'dashboard-grid', 'card'],
};
