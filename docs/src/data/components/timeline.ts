import type { ComponentDef } from './_types';

export const timeline: ComponentDef = {
    name: 'Timeline',
    slug: 'timeline',
    tag: 'arc-timeline',
    tier: 'content',
    interactivity: 'static',
    description: 'Vertical timeline with dated events.',

    overview: `Timeline renders a vertical sequence of events connected by a dotted line, suitable for changelogs, activity feeds, project histories, and audit logs. Each event displays a heading, optional description, and optional date in a clean layout with a blue dot marker and a connecting vertical line. The last item's line is automatically hidden to cap the timeline cleanly.

Like Stepper, Timeline uses a declarative child-element API: nest \`<arc-timeline-item>\` elements with \`heading\`, \`date\`, and text content (accessed via the \`description\` getter which reads \`textContent\`). The parent collects children via slotchange and renders the visual timeline, keeping markup readable and data management simple.

The dot marker uses \`--accent-primary\` with a double-ring effect (2px \`--bg-card\` border surrounded by a 1px \`--accent-primary-border\` box shadow) for a polished appearance. The date is rendered in monospace (\`--font-mono\`) at 11px in \`--text-ghost\` colour, giving it a subtle, metadata-like treatment. The timeline renders as a semantic \`<ol>\` with \`role="list"\` for correct ordering and accessibility.`,

    features: [
      'Vertical event sequence with blue dot markers and connecting lines',
      'Declarative <arc-timeline-item> children with heading, date, and text content',
      'Double-ring dot marker using border and box-shadow for a polished appearance',
      'Automatic hiding of the last item connecting line for clean termination',
      'Monospace date display in --text-ghost colour for subtle metadata treatment',
      'Semantic <ol> with role="list" for accessible ordered event representation',
      'CSS parts (timeline, item, marker, dot, line, content, title, description, date)',
      'Description read from textContent of child elements for flexible content',
    ],

    guidelines: {
      do: [
        'Use for chronologically ordered events — changelogs, activity logs, project history',
        'Include dates for every item when the timeline represents real events',
        'Order items chronologically — most recent first or earliest first, but be consistent',
        'Keep headings concise and event descriptions to one or two sentences',
        'Use inside a card or sidebar for contextual activity feeds',
      ],
      dont: [
        'Use timeline for non-sequential content — it implies chronological ordering',
        'Mix items with and without dates randomly — be consistent across all items',
        'Use more than 10-15 items without pagination or a "show more" pattern',
        'Use timeline as a stepper — stepper is for workflow progress, timeline is for history',
        'Put interactive elements (buttons, forms) inside timeline items — keep them read-only',
      ],
    },

    previewHtml: `<arc-timeline style="max-width: 400px;">
  <arc-timeline-item heading="v2.0 Released" date="2026-02-01">Major release with new component library.</arc-timeline-item>
  <arc-timeline-item heading="Beta Launch" date="2026-01-15">Public beta opened for early adopters.</arc-timeline-item>
  <arc-timeline-item heading="Project Started" date="2025-12-01">Initial commit and architecture planning.</arc-timeline-item>
</arc-timeline>`,

    props: [],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-timeline>
  <arc-timeline-item heading="Project started" date="2026-01-15">Initial setup</arc-timeline-item>
  <arc-timeline-item heading="First release" date="2026-02-01">v1.0 shipped</arc-timeline-item>
</arc-timeline>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Timeline, TimelineItem } from '@arclux/arc-ui-react';

<Timeline>
  <TimelineItem heading="Project started" date="2026-01-15">Initial setup</TimelineItem>
  <TimelineItem heading="First release" date="2026-02-01">v1.0 shipped</TimelineItem>
</Timeline>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Timeline, TimelineItem } from '@arclux/arc-ui-vue';
</script>

<template>
  <Timeline>
    <TimelineItem heading="Project started" date="2026-01-15">Initial setup</TimelineItem>
    <TimelineItem heading="First release" date="2026-02-01">v1.0 shipped</TimelineItem>
  </Timeline>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Timeline, TimelineItem } from '@arclux/arc-ui-svelte';
</script>

<Timeline>
  <TimelineItem heading="Project started" date="2026-01-15">Initial setup</TimelineItem>
  <TimelineItem heading="First release" date="2026-02-01">v1.0 shipped</TimelineItem>
</Timeline>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Timeline, TimelineItem } from '@arclux/arc-ui-angular';

@Component({
  imports: [Timeline, TimelineItem],
  template: \`
    <Timeline>
      <TimelineItem heading="Project started" date="2026-01-15">Initial setup</TimelineItem>
      <TimelineItem heading="First release" date="2026-02-01">v1.0 shipped</TimelineItem>
    </Timeline>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Timeline, TimelineItem } from '@arclux/arc-ui-solid';

<Timeline>
  <TimelineItem heading="Project started" date="2026-01-15">Initial setup</TimelineItem>
  <TimelineItem heading="First release" date="2026-02-01">v1.0 shipped</TimelineItem>
</Timeline>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Timeline, TimelineItem } from '@arclux/arc-ui-preact';

<Timeline>
  <TimelineItem heading="Project started" date="2026-01-15">Initial setup</TimelineItem>
  <TimelineItem heading="First release" date="2026-02-01">v1.0 shipped</TimelineItem>
</Timeline>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-timeline — requires timeline.css + tokens.css (or arc-ui.css) -->
<div class="arc-timeline">
  <div class="timeline__slot-host">
   Timeline
   </div>
   <ol class="timeline" role="list">
   _items
   </ol>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-timeline — self-contained, no external CSS needed -->
<div class="arc-timeline" style="display: block">
  <div style="display: none">
   Timeline
   </div>
   <ol style="display: flex; flex-direction: column; gap: 0; padding: 0; margin: 0; list-style: none" role="list">
   _items
   </ol>
</div>` }
    ],
    subComponents: [
      {
        name: 'TimelineItem',
        tag: 'arc-timeline-item',
        description: 'Individual event within a Timeline.',
        props: [
          { name: 'heading', type: 'string', description: 'Event heading' },
          { name: 'date', type: 'string', description: 'Date string to display' },
        ],
      },
    ],
  };
