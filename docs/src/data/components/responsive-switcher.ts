import type { ComponentDef } from './_types';

export const responsiveSwitcher: ComponentDef = {
    name: 'Responsive Switcher',
    slug: 'responsive-switcher',
    tag: 'arc-responsive-switcher',
    tier: 'layout',
    interactivity: 'static',
    description: 'Container-query-based layout that flips between horizontal and vertical at a threshold width. No media queries needed.',

    overview: `Responsive Switcher is a layout primitive that uses CSS container queries to automatically switch its children between a horizontal (row) and vertical (column) arrangement based on the component's own width — not the viewport width. When the container is wider than the threshold, children are laid out side by side; when it narrows below the threshold, they stack vertically.

This approach is superior to media queries for component-level responsiveness because the same Responsive Switcher works correctly whether it lives in a full-width page section, a narrow sidebar, or a resizable split pane. The breakpoint is intrinsic to the component's container, not the viewport, making it truly reusable across different layout contexts.

Common use cases include form layouts that go from two-column to single-column in narrow containers, card groups that stack when a sidebar is expanded, and hero sections with side-by-side text and image that stack on smaller screens. The \`threshold\` prop accepts any CSS length value (px, rem, ch), and the \`gap\` prop uses design system spacing tokens for consistent rhythm.`,

    features: [
      'CSS container queries for intrinsic responsive behavior — no media queries',
      'Flips between horizontal (row) and vertical (column) layout at a configurable threshold',
      'Threshold prop accepts any CSS length value (px, rem, ch)',
      'Design-token-based gap spacing (sm, md, lg) for consistent rhythm',
      'Works correctly regardless of where the component is placed (sidebar, main, split pane)',
      'Pure CSS — no JavaScript resize observers or breakpoint calculations',
      'CSS part: `switcher` for targeted ::part() styling',
    ],

    guidelines: {
      do: [
        'Use for form layouts that should go from multi-column to single-column in narrow containers',
        'Use for hero sections with side-by-side text and image that stack on small screens',
        'Set threshold to the minimum width at which horizontal layout is comfortable (e.g., "600px")',
        'Combine with Container to get both width constraints and responsive switching',
        'Use inside resizable panels or split panes where viewport media queries are unreliable',
      ],
      dont: [
        'Do not use Responsive Switcher for complex multi-breakpoint layouts — use CSS Grid directly',
        'Do not set threshold too low — the horizontal layout becomes cramped',
        'Do not nest Responsive Switchers deeply — one level of switching is usually sufficient',
        'Do not confuse Responsive Switcher with Stack — Stack is always vertical, Switcher is conditional',
        'Do not use for navigation menus — use a dedicated responsive navigation component instead',
      ],
    },

    previewHtml: `<div style="width:100%;display:flex;flex-direction:column;gap:var(--space-lg)">
  <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Wide container (horizontal):</div>
  <div style="display:flex;gap:var(--space-md);width:100%">
    <div style="flex:1;padding:var(--space-md);background:rgba(77,126,247,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child A</div>
    <div style="flex:1;padding:var(--space-md);background:rgba(139,92,246,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child B</div>
    <div style="flex:1;padding:var(--space-md);background:rgba(77,126,247,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child C</div>
  </div>
  <div style="color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Narrow container (vertical):</div>
  <div style="display:flex;flex-direction:column;gap:var(--space-md);width:50%">
    <div style="padding:var(--space-md);background:rgba(77,126,247,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child A</div>
    <div style="padding:var(--space-md);background:rgba(139,92,246,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child B</div>
    <div style="padding:var(--space-md);background:rgba(77,126,247,0.1);border-radius:var(--radius-sm);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">Child C</div>
  </div>
</div>`,

    props: [
      { name: 'threshold', type: 'string', default: "'600px'", description: 'The container width at which the layout switches between horizontal and vertical. Accepts any CSS length value. When the container is wider than this value, children are in a row; below it, they stack.' },
      { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Spacing between children in both horizontal and vertical modes, mapped to design system spacing tokens.' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-responsive-switcher threshold="600px" gap="md">
  <arc-card>First panel</arc-card>
  <arc-card>Second panel</arc-card>
  <arc-card>Third panel</arc-card>
</arc-responsive-switcher>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-react';

function AdaptiveLayout() {
  return (
    <ResponsiveSwitcher threshold="600px" gap="md">
      <Card>First panel</Card>
      <Card>Second panel</Card>
      <Card>Third panel</Card>
    </ResponsiveSwitcher>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-vue';
</script>

<template>
  <ResponsiveSwitcher threshold="600px" gap="md">
    <Card>First panel</Card>
    <Card>Second panel</Card>
    <Card>Third panel</Card>
  </ResponsiveSwitcher>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-svelte';
</script>

<ResponsiveSwitcher threshold="600px" gap="md">
  <Card>First panel</Card>
  <Card>Second panel</Card>
  <Card>Third panel</Card>
</ResponsiveSwitcher>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-angular';

@Component({
  imports: [ResponsiveSwitcher, Card],
  template: \`
    <ResponsiveSwitcher threshold="600px" gap="md">
      <Card>First panel</Card>
      <Card>Second panel</Card>
      <Card>Third panel</Card>
    </ResponsiveSwitcher>
  \`,
})
export class AdaptiveLayoutComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-solid';

function AdaptiveLayout() {
  return (
    <ResponsiveSwitcher threshold="600px" gap="md">
      <Card>First panel</Card>
      <Card>Second panel</Card>
      <Card>Third panel</Card>
    </ResponsiveSwitcher>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { ResponsiveSwitcher, Card } from '@arclux/arc-ui-preact';

function AdaptiveLayout() {
  return (
    <ResponsiveSwitcher threshold="600px" gap="md">
      <Card>First panel</Card>
      <Card>Second panel</Card>
      <Card>Third panel</Card>
    </ResponsiveSwitcher>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- See HTML tab after running pnpm generate -->
<div class="arc-responsive-switcher">...</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- See HTML (Inline) tab after running pnpm generate -->
<div class="arc-responsive-switcher" style="container-type:inline-size">...</div>` },
    ],

  seeAlso: ['stack', 'cluster', 'container'],
};
