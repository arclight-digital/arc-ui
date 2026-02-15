import type { ComponentDef } from './_types';

export const aspectGrid: ComponentDef = {
    name: 'Aspect Grid',
    slug: 'aspect-grid',
    tag: 'arc-aspect-grid',
    tier: 'layout',
    interactivity: 'static',
    description: 'Uniform aspect-ratio cell grid with configurable columns and ratio.',

    overview: `Aspect Grid is a layout component that creates a uniform grid of cells where every cell maintains the same aspect ratio. This is the standard pattern for image galleries, video thumbnails, product grids, and any collection where visual uniformity matters more than accommodating variable content heights.

Each cell uses CSS \`aspect-ratio\` to enforce the configured ratio (1/1 for squares, 16/9 for widescreen, 4/3 for classic), and the grid uses \`grid-template-columns\` with \`repeat()\` to create the specified number of equal-width columns. The \`gap\` prop maps to design system spacing tokens so the grid rhythm stays consistent with the rest of your layout.

Use Aspect Grid when all items should have identical dimensions — photo galleries, team member portraits, video thumbnail grids, or product card collections. For variable-height content where items should pack tightly, use Masonry instead. For responsive dashboard-style layouts with named regions, use Dashboard Grid.`,

    features: [
      'CSS Grid layout with uniform aspect-ratio cells',
      'Configurable column count via the `columns` prop',
      'Aspect ratio options: 1/1 (square), 16/9 (widescreen), 4/3 (classic)',
      'Design-token-based gap spacing (sm, md, lg) for consistent rhythm',
      'Children overflow-hidden with border-radius for clean cell edges',
      'Pure CSS — no JavaScript for layout calculations',
      'CSS part: `grid` for targeted ::part() styling',
    ],

    guidelines: {
      do: [
        'Use ratio="1/1" for avatar grids, product squares, and icon collections',
        'Use ratio="16/9" for video thumbnail grids and hero image galleries',
        'Use ratio="4/3" for photo galleries and landscape image collections',
        'Ensure child content (especially images) uses object-fit: cover to fill cells',
        'Adjust columns based on viewport width for responsive grids',
      ],
      dont: [
        'Do not use Aspect Grid for variable-height content — use Masonry instead',
        'Do not set very high column counts that make cells too small to be useful',
        'Do not mix different aspect ratios within the same grid — use separate grids',
        'Do not put long text content in aspect-ratio cells — it will overflow or be clipped',
        'Do not nest Aspect Grid inside Masonry or vice versa',
      ],
    },

    previewHtml: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-md);width:100%">
  <div style="aspect-ratio:1/1;background:rgba(77,126,247,0.12);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">1</div>
  <div style="aspect-ratio:1/1;background:rgba(139,92,246,0.12);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">2</div>
  <div style="aspect-ratio:1/1;background:rgba(77,126,247,0.12);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">3</div>
  <div style="aspect-ratio:1/1;background:rgba(139,92,246,0.12);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">4</div>
  <div style="aspect-ratio:1/1;background:rgba(77,126,247,0.12);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">5</div>
  <div style="aspect-ratio:1/1;background:rgba(139,92,246,0.12);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">6</div>
</div>`,

    props: [
      { name: 'columns', type: 'number', default: '3', description: 'Number of columns in the grid. Each column is equal width (1fr).' },
      { name: 'ratio', type: "'1/1' | '16/9' | '4/3'", default: "'1/1'", description: 'Aspect ratio applied to every cell. 1/1 for squares, 16/9 for widescreen, 4/3 for classic landscape.' },
      { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Spacing between grid cells, mapped to design system spacing tokens (--space-sm, --space-md, --space-lg).' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-aspect-grid columns="3" ratio="1/1" gap="md">
  <img src="/photo-1.jpg" alt="Photo 1" style="object-fit:cover;width:100%;height:100%">
  <img src="/photo-2.jpg" alt="Photo 2" style="object-fit:cover;width:100%;height:100%">
  <img src="/photo-3.jpg" alt="Photo 3" style="object-fit:cover;width:100%;height:100%">
  <img src="/photo-4.jpg" alt="Photo 4" style="object-fit:cover;width:100%;height:100%">
  <img src="/photo-5.jpg" alt="Photo 5" style="object-fit:cover;width:100%;height:100%">
  <img src="/photo-6.jpg" alt="Photo 6" style="object-fit:cover;width:100%;height:100%">
</arc-aspect-grid>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { AspectGrid } from '@arclux/arc-ui-react';

function PhotoGallery() {
  return (
    <AspectGrid columns={3} ratio="1/1" gap="md">
      <img src="/photo-1.jpg" alt="Photo 1" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
      <img src="/photo-2.jpg" alt="Photo 2" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
      <img src="/photo-3.jpg" alt="Photo 3" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
    </AspectGrid>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { AspectGrid } from '@arclux/arc-ui-vue';
</script>

<template>
  <AspectGrid :columns="3" ratio="1/1" gap="md">
    <img src="/photo-1.jpg" alt="Photo 1" style="object-fit:cover;width:100%;height:100%">
    <img src="/photo-2.jpg" alt="Photo 2" style="object-fit:cover;width:100%;height:100%">
    <img src="/photo-3.jpg" alt="Photo 3" style="object-fit:cover;width:100%;height:100%">
  </AspectGrid>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { AspectGrid } from '@arclux/arc-ui-svelte';
</script>

<AspectGrid columns={3} ratio="1/1" gap="md">
  <img src="/photo-1.jpg" alt="Photo 1" style="object-fit:cover;width:100%;height:100%">
  <img src="/photo-2.jpg" alt="Photo 2" style="object-fit:cover;width:100%;height:100%">
  <img src="/photo-3.jpg" alt="Photo 3" style="object-fit:cover;width:100%;height:100%">
</AspectGrid>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { AspectGrid } from '@arclux/arc-ui-angular';

@Component({
  imports: [AspectGrid],
  template: \`
    <AspectGrid [columns]="3" ratio="1/1" gap="md">
      <img src="/photo-1.jpg" alt="Photo 1" style="object-fit:cover;width:100%;height:100%">
      <img src="/photo-2.jpg" alt="Photo 2" style="object-fit:cover;width:100%;height:100%">
      <img src="/photo-3.jpg" alt="Photo 3" style="object-fit:cover;width:100%;height:100%">
    </AspectGrid>
  \`,
})
export class GalleryComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { AspectGrid } from '@arclux/arc-ui-solid';

function PhotoGallery() {
  return (
    <AspectGrid columns={3} ratio="1/1" gap="md">
      <img src="/photo-1.jpg" alt="Photo 1" style={{ 'object-fit': 'cover', width: '100%', height: '100%' }} />
      <img src="/photo-2.jpg" alt="Photo 2" style={{ 'object-fit': 'cover', width: '100%', height: '100%' }} />
      <img src="/photo-3.jpg" alt="Photo 3" style={{ 'object-fit': 'cover', width: '100%', height: '100%' }} />
    </AspectGrid>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { AspectGrid } from '@arclux/arc-ui-preact';

function PhotoGallery() {
  return (
    <AspectGrid columns={3} ratio="1/1" gap="md">
      <img src="/photo-1.jpg" alt="Photo 1" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
      <img src="/photo-2.jpg" alt="Photo 2" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
      <img src="/photo-3.jpg" alt="Photo 3" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
    </AspectGrid>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- See HTML tab after running pnpm generate -->
<div class="arc-aspect-grid">...</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- See HTML (Inline) tab after running pnpm generate -->
<div class="arc-aspect-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-md)">...</div>` },
    ],

  seeAlso: ['masonry', 'dashboard-grid', 'image'],
};
