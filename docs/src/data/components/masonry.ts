import type { ComponentDef } from './_types';

export const masonry: ComponentDef = {
  name: 'Masonry',
  slug: 'masonry',
  tag: 'arc-masonry',
  tier: 'layout',
  interactivity: 'static',
  description: 'Packs variable-height children into columns with CSS columns, Pinterest-style.',

  overview: `Masonry packs children of different heights into columns. It uses CSS \`column-count\` and \`column-gap\`, so the browser does the layout and no script measures or positions items. Children fill the first column top to bottom, then the next, and the browser picks the break points so the columns end at similar heights.

\`columns\` sets the column count (3 by default), and \`gap\` picks the sm, md or lg spacing token. Use it for image galleries, blog post cards, or any feed where uniform row heights would waste space.`,

  features: [
    'Children get `break-inside: avoid`, so no item is split across two columns',
    'The `gap` also sets the space below each child, so rows and columns are spaced alike',
  ],

  guidelines: {
    do: [
      'Set `columns` for the expected width: 2 for narrow containers, 3 or 4 for wide ones',
      'Combine with ResponsiveSwitcher to drop columns on smaller screens',
      'Use `gap="md"` for most card layouts and `gap="sm"` for dense image grids',
    ],
    dont: [
      "Don't use it for items of the same height. Use a CSS grid or AspectGrid",
      "Don't set more than five columns. They get too narrow to read",
      "Don't use it where items must read left to right. Order runs down each column, and where a column breaks depends on item heights",
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
    <arc-masonry [columns]="3" gap="md">
      <arc-card>Short content</arc-card>
      <arc-card>Taller content with more text</arc-card>
      <arc-card>Medium content</arc-card>
      <arc-card>Another short card</arc-card>
    </arc-masonry>
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
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-masonry — requires masonry.css + base.css (or arc-ui.css) -->
<div class="arc-masonry">
  <div class="masonry">
    Masonry
  </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-masonry — self-contained, no external CSS needed -->
<div class="arc-masonry" style="display: block">
  <div style="column-count: 3; column-gap: 16px">
    Masonry
  </div>
</div>`,
    },
  ],

  seeAlso: ['aspect-grid', 'dashboard-grid', 'card'],
};
