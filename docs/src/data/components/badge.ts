import type { ComponentDef } from './_types';

export const badge: ComponentDef = {
  name: 'Badge',
  slug: 'badge',
  tag: 'arc-badge',
  tier: 'data',
  interactivity: 'static',
  description:
    'A small monospace pill that labels a status, a category or a count next to the thing it describes.',

  overview: `Badge is a small pill-shaped label for a status, a category or a count. It's small enough to annotate a table row, a card header or a sidebar item without pushing the layout around.

Three of the seven variants are for labels that categorize: \`default\` (neutral gray) for categories and metadata, \`primary\` for an active or informational state such as "In progress", "New" or a notification count, and \`secondary\` for a separate category such as "Featured", "Beta" or "Archived".

The other four (\`success\`, \`warning\`, \`error\` and \`info\`) are the library's status set. They use the semantic color tokens, so a badge reporting a state matches an Alert or a Tag reporting the same one. Use them for a build result, a health check or a severity. If none of the seven fit, the \`color\` prop takes an RGB triplet and overrides the variant, for category colors that come from data.

Badge and Tag look different on purpose. Badge is monospace, sentence case and compact. Tag is uppercase in the label font with 2px tracking and a touch-sized minimum height. They were slated to merge in v4 and didn't, because merging would have reset every badge in Tag's uppercase face, turning \`v3.2.0\` into \`V3.2.0\` in a taller box. Use Badge for dense inline annotation and Tag for filter chips and categorical labels.

Badge renders a \`<span>\` with no ARIA role, so badges in table cells, list items and cards add no focus stops.`,

  features: [
    'Fully rounded corners (`--radius-full`)',
    '`--font-mono` at the body weight',
    'Colored variants get a 6% tint of their color and a matching 1px border. `default` uses `--surface-hover`. All of them glow on hover',
  ],

  guidelines: {
    do: [
      'Keep labels to one or two words',
      'Put a badge next to the thing it annotates: a heading, a table cell, a nav item',
      'Put two badges side by side for a combined status, such as category plus state',
    ],
    dont: [
      "Don't use a badge for a sentence. Use an Alert",
      "Don't rely on color alone. The text should carry the meaning",
      "Don't put more than three or four badges in a row",
      "Don't make a badge clickable. Use a Tag or a Button",
      "Don't change what each variant means from page to page. Pick a color convention and keep it",
    ],
  },

  previewHtml: `<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
  <arc-badge>Default</arc-badge>
  <arc-badge variant="primary">Primary</arc-badge>
  <arc-badge variant="secondary">Secondary</arc-badge>
  <arc-badge variant="success">Success</arc-badge>
  <arc-badge variant="warning">Warning</arc-badge>
  <arc-badge variant="error">Error</arc-badge>
  <arc-badge variant="info">Info</arc-badge>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
  <arc-badge>Default</arc-badge>
  <arc-badge variant="primary">Primary</arc-badge>
  <arc-badge variant="secondary">Secondary</arc-badge>
  <arc-badge variant="success">Deployed</arc-badge>
  <arc-badge variant="warning">Pending</arc-badge>
  <arc-badge variant="error">Failed</arc-badge>
  <arc-badge variant="info">New</arc-badge>
</div>

<!-- Custom color -->
<arc-badge color="255, 165, 0">Custom</arc-badge>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Badge } from '@arclux/arc-ui-react';

export function ProjectStatus() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <Badge>Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Deployed</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Failed</Badge>
      <Badge variant="info">New</Badge>
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Badge } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
    <Badge>Default</Badge>
    <Badge variant="primary">Primary</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="success">Deployed</Badge>
    <Badge variant="warning">Pending</Badge>
    <Badge variant="error">Failed</Badge>
    <Badge variant="info">New</Badge>
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Badge } from '@arclux/arc-ui-svelte';
</script>

<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
  <Badge>Default</Badge>
  <Badge variant="primary">Primary</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="success">Deployed</Badge>
  <Badge variant="warning">Pending</Badge>
  <Badge variant="error">Failed</Badge>
  <Badge variant="info">New</Badge>
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Badge } from '@arclux/arc-ui-angular';

@Component({
  imports: [Badge],
  template: \`
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <arc-badge>Default</arc-badge>
      <arc-badge variant="primary">Primary</arc-badge>
      <arc-badge variant="secondary">Secondary</arc-badge>
      <arc-badge variant="success">Deployed</arc-badge>
      <arc-badge variant="warning">Pending</arc-badge>
      <arc-badge variant="error">Failed</arc-badge>
      <arc-badge variant="info">New</arc-badge>
    </div>
  \`,
})
export class ProjectStatusComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Badge } from '@arclux/arc-ui-solid';

export function ProjectStatus() {
  return (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '12px', 'flex-wrap': 'wrap' }}>
      <Badge>Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Deployed</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Failed</Badge>
      <Badge variant="info">New</Badge>
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Badge } from '@arclux/arc-ui-preact';

export function ProjectStatus() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <Badge>Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Deployed</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Failed</Badge>
      <Badge variant="info">New</Badge>
    </div>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-badge — requires badge.css + base.css (or arc-ui.css) -->
<span class="arc-badge">
  <span class="badge">Badge</span>
</span>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-badge — self-contained, no external CSS needed -->
<style>
  .arc-badge:hover .badge { border-color: rgb(51, 51, 64); }
  .arc-badge[data-variant="primary"]:hover .badge { box-shadow: 0 0 12px rgba(77, 126, 247, 0.15); }
  .arc-badge[data-variant="secondary"]:hover .badge { box-shadow: 0 0 12px rgba(139, 92, 246, 0.15); }
</style>
<span class="arc-badge" style="display: inline-flex">
  <span class="badge" style="display: inline-flex; align-items: center; gap: 8px; font-family: 'Tomorrow', system-ui, sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: rgb(124, 124, 137); padding: 6px 16px; border: 1px solid rgb(34, 34, 41); border-radius: 100px; background: rgba(255, 255, 255, 0.03)">Badge</span>
</span>`,
    },
  ],

  seeAlso: ['tag', 'chip', 'avatar'],
};
