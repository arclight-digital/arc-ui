import type { ComponentDef } from './_types';

export const aspectGrid: ComponentDef = {
  name: 'Aspect Grid',
  slug: 'aspect-grid',
  tag: 'arc-aspect-grid',
  tier: 'layout',
  interactivity: 'static',
  description: 'Equal columns where every child has the same aspect ratio.',

  overview: `AspectGrid lays its children out in equal-width columns and gives every child the same aspect ratio. Use it when every item should be the same size: photo galleries, team portraits, video thumbnails, product cards.

For items of different heights that should pack tightly, use Masonry. For dashboard layouts with named regions, use DashboardGrid.`,

  features: [
    '`columns` sets the number of equal-width columns',
    '`ratio` takes 1/1 (square), 16/9 (widescreen) or 4/3 (classic)',
    '`gap` takes sm, md or lg, mapped to the spacing tokens',
    'Each child gets a 1px border, `--radius-md` corners and `overflow: hidden`',
    'Layout is CSS only. There is no column count per breakpoint, so a responsive grid means changing `columns` yourself',
  ],

  guidelines: {
    do: [
      'Use ratio="1/1" for avatars, product squares and icons',
      'Use ratio="16/9" for video thumbnails and wide images',
      'Use ratio="4/3" for photos and other landscape images',
      'Set object-fit: cover on images so they fill their cells',
    ],
    dont: [
      'Don\'t use it for content of different heights. Use Masonry',
      'Don\'t mix ratios in one grid. Use separate grids',
      'Don\'t put long text in a cell. It overflows and gets clipped',
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
    <arc-aspect-grid [columns]="3" ratio="1/1" gap="md">
      <img src="/photo-1.jpg" alt="Photo 1" style="object-fit:cover;width:100%;height:100%">
      <img src="/photo-2.jpg" alt="Photo 2" style="object-fit:cover;width:100%;height:100%">
      <img src="/photo-3.jpg" alt="Photo 3" style="object-fit:cover;width:100%;height:100%">
    </arc-aspect-grid>
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
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-aspect-grid — requires aspect-grid.css + base.css (or arc-ui.css) -->
<div class="arc-aspect-grid">
  <div class="grid">
    AspectGrid
  </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-aspect-grid — self-contained, no external CSS needed -->
<div class="arc-aspect-grid" style="display: block">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px">
    AspectGrid
  </div>
</div>`,
    },
  ],

  seeAlso: ['masonry', 'dashboard-grid', 'image'],
};
