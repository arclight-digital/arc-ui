import type { ComponentDef } from './_types';

export const badge: ComponentDef = {
    name: 'Badge',
    slug: 'badge',
    tag: 'arc-badge',
    tier: 'data',
    interactivity: 'static',
    description: 'Compact pill-shaped label for status indicators, category tags, and notification counts. Three color variants let you encode meaning at a glance across dashboards, tables, and card layouts.',

    overview: `Badge is a small, pill-shaped label designed to communicate status, category, or count at a glance. Its compact form factor makes it the right choice whenever you need to annotate another element — a table row, a card header, a sidebar item — without disrupting the surrounding layout or visual hierarchy.

The three color variants map to distinct semantic roles. Default (neutral gray) works for general-purpose labels like categories or metadata. Primary conveys an active or informational state — think "In Progress", "New", or a notification count. Secondary signals a distinct or highlighted category such as "Featured", "Beta", or "Archived", giving you a third color lane that stays visually separated from the default and primary tones.

Because Badge is a static content element with no interactive behavior, it renders as a simple \`<span>\` and carries no ARIA roles beyond its text content. This keeps the DOM lightweight and ensures badges inside table cells, list items, and cards don't introduce unexpected focus stops or interaction patterns.`,

    features: [
      'Seven color variants (default, primary, secondary, success, warning, error, info) for semantic differentiation',
      'Small rounded border radius (--radius-sm) for a compact, rectangular appearance',
      'Monospace typography (--font-mono) at medium weight for technical readability',
      'Subtle hover effect with border highlight or glow per variant',
      'Lightweight inline-flex layout that flows naturally in text, tables, and flex containers',
      'Transparent background with fine border for dark-theme harmony',
      'No interactive ARIA roles — stays out of the tab order for clean accessibility',
    ],

    guidelines: {
      do: [
        'Use default (gray) for neutral metadata like categories, tags, or counts',
        'Use primary for active or informational states like "In Progress" or "New"',
        'Use secondary to distinguish a separate category such as "Archived", "Beta", or "Featured"',
        'Keep badge labels to one or two words — brevity is the whole point',
        'Place badges inline next to the element they annotate (heading, table cell, nav item)',
        'Combine multiple badge variants in a row to show compound status (e.g. category + state)',
      ],
      dont: [
        'Use badges for long descriptions — switch to an Alert or Callout for multi-word messages',
        'Rely on color alone to convey meaning; always include a text label alongside the color',
        'Stack more than three or four badges in a single row — the density becomes unreadable',
        'Use Badge as an interactive element; if users need to click it, use a Tag or Button instead',
        'Mix badge variants inconsistently — establish a color convention and apply it throughout the app',
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

    props: [
      {
        name: 'variant',
        type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'",
        default: "'default'",
        description: 'Controls the badge color scheme. Default renders a neutral gray. Primary and secondary use the accent token colors. Success, warning, error, and info map to the corresponding semantic color tokens for status-oriented labels.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: "Controls the badge size. Options: 'sm', 'md', 'lg'.",
      },
      {
        name: 'color',
        type: 'string',
        description: 'Custom RGB color value (e.g. `"255, 100, 50"`) that overrides the variant color. Sets the border, text, background tint, and hover glow to the specified color.',
      },
    ],

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
      <Badge>Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Deployed</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Failed</Badge>
      <Badge variant="info">New</Badge>
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
  <span class="badge" style="display: inline-flex; align-items: center; gap: 8px; font-family: 'Tektur', system-ui, sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: rgb(124, 124, 137); padding: 6px 16px; border: 1px solid rgb(34, 34, 41); border-radius: 100px; background: rgba(255, 255, 255, 0.03)">Badge</span>
</span>`,
      },
    ],
  
  seeAlso: ["tag","chip","avatar"],
};
