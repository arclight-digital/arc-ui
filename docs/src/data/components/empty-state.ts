import type { ComponentDef } from './_types';

export const emptyState: ComponentDef = {
    name: 'Empty State',
    slug: 'empty-state',
    tag: 'arc-empty-state',
    tier: 'content',
    interactivity: 'static',
    description: 'Placeholder for empty lists or search results.',

    overview: `Empty State is a structured placeholder for screens, sections, or lists that have no content to display. It centralises an icon, heading, description, and action buttons into a clean, centred layout that guides users toward a next step rather than leaving them staring at a blank area. Common use cases include empty search results, first-run experiences, empty data tables, and zero-state dashboards.

The component uses a dashed border and \`--bg-card\` background to visually distinguish itself from regular content cards. The icon slot (named \`icon\`) accepts any custom icon markup — SVG, emoji, or icon-font — displayed at 40px in \`--text-ghost\` colour for a subtle, non-distracting appearance. The heading and description are set via string properties, keeping the API simple for the most common use cases.

The action slot (named \`action\`) provides a flex container for one or more buttons, enabling patterns like "Create your first item" or "Try a different search". The description text is capped at 360px max-width for comfortable reading. The outer container uses \`role="status"\` so assistive technology announces the empty state to screen reader users.`,

    features: [
      'Centred layout with icon, heading, description, and action button area',
      'Dashed border container with --bg-card background for visual distinction',
      'Named icon slot for custom SVG or emoji icons displayed at 40px',
      'Named action slot with flex layout for one or more CTA buttons',
      'Description text capped at 360px max-width for readability',
      'role="status" on the container for screen reader announcements',
      'CSS parts (container, icon, heading, description, actions) for styling',
      'Heading and description conditionally rendered only when provided',
    ],

    guidelines: {
      do: [
        'Always provide at least one action button so the user knows what to do next',
        'Use a relevant icon that hints at the type of missing content (search, folder, etc.)',
        'Write a clear, specific heading like "No results found" rather than a generic "Empty"',
        'Include a helpful description that explains why the area is empty or how to populate it',
        'Use empty state inside data tables, lists, and dashboards that can have zero items',
      ],
      dont: [
        'Use empty state as a general-purpose card — it is specifically for zero-content scenarios',
        'Leave out the action slot — an empty state without a next step is a dead end',
        'Write vague descriptions like "Nothing here" — be specific about the cause and solution',
        'Use more than two action buttons — keep the path forward simple and clear',
        'Show an empty state while data is loading — use skeletons for loading, empty state for zero results',
      ],
    },

    previewHtml: `<arc-empty-state heading="No projects yet" description="Create your first project to get started with ARC UI.">
  <span slot="icon" style="font-size: 40px;">&#128193;</span>
  <arc-button slot="action" variant="primary" size="sm">Create Project</arc-button>
</arc-empty-state>`,

    props: [
      { name: 'heading', type: 'string', default: "''", description: 'Main heading text displayed below the icon' },
      { name: 'description', type: 'string', default: "''", description: 'Supporting text displayed below the heading, max-width 360px' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-empty-state heading="No results found" description="Try adjusting your search.">
</arc-empty-state>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { EmptyState } from '@arclux/arc-ui-react';

<EmptyState heading="No results found" description="Try adjusting your search.">
</EmptyState>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { EmptyState } from '@arclux/arc-ui-vue';
</script>

<template>
  <EmptyState heading="No results found" description="Try adjusting your search.">
  </EmptyState>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { EmptyState } from '@arclux/arc-ui-svelte';
</script>

<EmptyState heading="No results found" description="Try adjusting your search.">
</EmptyState>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { EmptyState } from '@arclux/arc-ui-angular';

@Component({
  imports: [EmptyState],
  template: \`
    <EmptyState heading="No results found" description="Try adjusting your search.">
    </EmptyState>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { EmptyState } from '@arclux/arc-ui-solid';

<EmptyState heading="No results found" description="Try adjusting your search.">
</EmptyState>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { EmptyState } from '@arclux/arc-ui-preact';

<EmptyState heading="No results found" description="Try adjusting your search.">
</EmptyState>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-empty-state — requires empty-state.css + tokens.css (or arc-ui.css) -->
<div class="arc-empty-state">
  <div class="empty" role="status">
   <div class="empty__icon" aria-hidden="true">

   </div>
   Heading
   Description text goes here
   <div class="empty__actions">

   </div>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-empty-state — self-contained, no external CSS needed -->
<div class="arc-empty-state" style="display: block">
  <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 64px 40px; border: 1px dashed rgb(34, 34, 41); border-radius: 14px; background: rgb(13, 13, 18)" role="status">
   <div style="margin-bottom: 24px; color: rgb(107, 107, 128); font-size: 40px" aria-hidden="true">

   </div>
   Heading
   Description text goes here
   <div style="display: flex; gap: 8px">

   </div>
   </div>
</div>` }
    ],
  };
