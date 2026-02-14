import type { ComponentDef } from './_types';

export const dashboardGrid: ComponentDef = {
    name: 'Dashboard Grid',
    slug: 'dashboard-grid',
    tag: 'arc-dashboard-grid',
    tier: 'layout',
    interactivity: 'static',
    description: 'Responsive grid for dashboard metric cards.',

    overview: `DashboardGrid is a responsive CSS Grid wrapper purpose-built for arranging metric cards, stat widgets, and KPI panels in a dashboard layout. By default it uses \`auto-fill\` with a configurable minimum column width (280px), so cards automatically wrap into as many columns as fit the available space without any manual breakpoints. Drop in three cards or twelve and the grid adapts.

When you need a fixed column count instead of fluid wrapping, set the \`columns\` attribute explicitly. The component detects the explicit attribute and switches from \`auto-fill\` to a \`repeat(N, 1fr)\` grid, giving you precise control for layouts where card count is predictable. The \`gap\` prop accepts any CSS length or spacing token for consistent gutter sizing across your dashboard.

The \`min-column-width\` attribute controls the minimum width of each column in the fluid layout. Lowering it to 200px lets you pack more smaller cards; raising it to 360px forces fewer, wider cards. All three props (\`columns\`, \`gap\`, \`min-column-width\`) map to CSS custom properties (\`--columns\`, \`--gap\`, \`--min-col\`), so they can also be set from external stylesheets or media queries for advanced responsive control.`,

    features: [
      'Fluid auto-fill grid that wraps cards based on available width',
      'Explicit columns mode via the columns attribute for fixed-count layouts',
      'Configurable min-column-width for controlling when columns wrap',
      'Gap property accepts any CSS length or spacing design token',
      'CSS custom properties (--columns, --gap, --min-col) for external override',
      'Built-in padding via --space-lg for comfortable card spacing',
      'Exposes a grid CSS part for targeted ::part() styling',
      'Zero JavaScript layout logic -- pure CSS Grid under the hood',
    ],

    guidelines: {
      do: [
        'Use DashboardGrid for metric cards, stat panels, and KPI widgets at the top of dashboards',
        'Let the default auto-fill behavior handle responsiveness unless you need a fixed column count',
        'Set min-column-width to match the natural minimum width of your card components',
        'Pair with ValueCard or Card components for consistent card sizing',
        'Use spacing tokens like var(--space-md) for the gap prop to stay on the design system grid',
      ],
      dont: [
        'Use DashboardGrid for general page layout -- use PageLayout for sidebar/main structures',
        'Set columns to a high number without testing on narrow viewports; cards will crush',
        'Nest DashboardGrid inside another DashboardGrid -- use a single grid with appropriate min-column-width',
        'Mix radically different card heights in the same grid without aligning their internal content',
        'Override the grid CSS with inline flex or float styles -- let the component manage the layout',
      ],
    },

    previewHtml: `<arc-dashboard-grid columns="3" gap="var(--space-md)">
  <arc-card><arc-stat value="$45,231" label="Revenue"></arc-stat></arc-card>
  <arc-card><arc-stat value="2,345" label="Active Users"></arc-stat></arc-card>
  <arc-card><arc-stat value="99.98%" label="Uptime"></arc-stat></arc-card>
</arc-dashboard-grid>`,

    props: [
      { name: 'columns', type: 'number', default: '3', description: 'Number of columns when using explicit column mode. When this attribute is set on the element, the grid switches from auto-fill to a fixed repeat(N, 1fr) layout.' },
      { name: 'gap', type: 'string', default: "'var(--space-lg)'", description: 'Gap between grid cells. Accepts any CSS length value or spacing token. Maps to the --gap CSS custom property.' },
      { name: 'min-column-width', type: 'string', default: "'280px'", description: 'Minimum column width in auto-fill mode. Controls the minmax() threshold at which columns wrap to the next row. Maps to the --min-col CSS custom property.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-dashboard-grid columns="3" gap="var(--space-md)">
  <arc-card>Revenue: $45,231</arc-card>
  <arc-card>Users: 2,345</arc-card>
  <arc-card>Growth: +12.5%</arc-card>
</arc-dashboard-grid>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Card, DashboardGrid } from '@arclux/arc-ui-react';

<DashboardGrid columns="3" gap="var(--space-md)">
  <Card>Revenue: $45,231</Card>
  <Card>Users: 2,345</Card>
  <Card>Growth: +12.5%</Card>
</DashboardGrid>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Card, DashboardGrid } from '@arclux/arc-ui-vue';
</script>

<template>
  <DashboardGrid columns="3" gap="var(--space-md)">
    <Card>Revenue: $45,231</Card>
    <Card>Users: 2,345</Card>
    <Card>Growth: +12.5%</Card>
  </DashboardGrid>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Card, DashboardGrid } from '@arclux/arc-ui-svelte';
</script>

<DashboardGrid columns="3" gap="var(--space-md)">
  <Card>Revenue: $45,231</Card>
  <Card>Users: 2,345</Card>
  <Card>Growth: +12.5%</Card>
</DashboardGrid>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Card, DashboardGrid } from '@arclux/arc-ui-angular';

@Component({
  imports: [Card, DashboardGrid],
  template: \`
    <DashboardGrid columns="3" gap="var(--space-md)">
      <Card>Revenue: $45,231</Card>
      <Card>Users: 2,345</Card>
      <Card>Growth: +12.5%</Card>
    </DashboardGrid>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Card, DashboardGrid } from '@arclux/arc-ui-solid';

<DashboardGrid columns="3" gap="var(--space-md)">
  <Card>Revenue: $45,231</Card>
  <Card>Users: 2,345</Card>
  <Card>Growth: +12.5%</Card>
</DashboardGrid>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Card, DashboardGrid } from '@arclux/arc-ui-preact';

<DashboardGrid columns="3" gap="var(--space-md)">
  <Card>Revenue: $45,231</Card>
  <Card>Users: 2,345</Card>
  <Card>Growth: +12.5%</Card>
</DashboardGrid>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-dashboard-grid — requires dashboard-grid.css + tokens.css (or arc-ui.css) -->
<div class="arc-dashboard-grid">
  <div class="dashboard-grid">
   Dashboard Grid
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-dashboard-grid — self-contained, no external CSS needed -->
<div class="arc-dashboard-grid" style="display: block; box-sizing: border-box">
  <div style="display: grid; grid-template-columns: repeat(
            auto-fill,
            minmax(280px, 1fr)
          ); gap: 24px; padding: 24px">
   Dashboard Grid
   </div>
</div>` }
    ],
  
  seeAlso: ["card","stat","resizable"],
};
