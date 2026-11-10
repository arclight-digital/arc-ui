import type { ComponentDef } from './_types';

export const timeline: ComponentDef = {
  name: 'Timeline',
  slug: 'timeline',
  tag: 'arc-timeline',
  tier: 'data',
  interactivity: 'static',
  description: 'Vertical timeline with dated events.',

  overview: `Timeline lists events in a vertical column, each with a dot and a line down to the next. The last item has no line below it.

Each event is an \`<arc-timeline-item>\` with a \`heading\`, an optional \`date\` and an optional description in its text. Timeline reads the items as data and renders its own copy of each. The description is the item's \`textContent\`, so it renders as plain text, and links or other markup inside an item are lost.

The heading and date are uppercase in the label font, with the date in \`--text-ghost\`. The dot is \`--accent-primary\` with a 2px \`--surface-base\` border and a faint accent ring, and the line fades from the accent color to \`--border-default\`. Hovering an item enlarges its dot and turns its heading accent.`,

  features: [
    'Renders an `<ol>` with `role="list"`',
    'Each heading has `role="heading"`, at `aria-level` 3 unless you set `heading-level`',
  ],

  guidelines: {
    do: [
      'Include a date on every item when the timeline records real events',
      'Pick one order, newest first or oldest first, and keep to it',
      'Keep headings short and descriptions to one or two sentences',
      'Put it in a card or sidebar for an activity feed',
    ],
    dont: [
      'Don\'t use it for content that isn\'t in time order. The line implies a sequence',
      'Don\'t show more than 10 to 15 items without pagination or a "show more" control',
      'Don\'t use it for progress through a workflow. Use Stepper',
      'Don\'t put links, buttons or forms in an item. Only its text is rendered',
    ],
  },

  previewHtml: `<arc-timeline style="max-width: 400px;">
  <arc-timeline-item heading="Order shipped" date="2026-02-01">Left the warehouse with tracking number 4417.</arc-timeline-item>
  <arc-timeline-item heading="Payment received" date="2026-01-15">Card payment cleared.</arc-timeline-item>
  <arc-timeline-item heading="Order placed" date="2025-12-01">Two items added to the order.</arc-timeline-item>
</arc-timeline>`,

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

export default function Example() {
  return (
    <Timeline>
      <TimelineItem heading="Project started" date="2026-01-15">Initial setup</TimelineItem>
      <TimelineItem heading="First release" date="2026-02-01">v1.0 shipped</TimelineItem>
    </Timeline>
  );
}`,
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
    <arc-timeline>
      <arc-timeline-item heading="Project started" date="2026-01-15">Initial setup</arc-timeline-item>
      <arc-timeline-item heading="First release" date="2026-02-01">v1.0 shipped</arc-timeline-item>
    </arc-timeline>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Timeline, TimelineItem } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Timeline>
      <TimelineItem heading="Project started" date="2026-01-15">Initial setup</TimelineItem>
      <TimelineItem heading="First release" date="2026-02-01">v1.0 shipped</TimelineItem>
    </Timeline>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Timeline, TimelineItem } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Timeline>
      <TimelineItem heading="Project started" date="2026-01-15">Initial setup</TimelineItem>
      <TimelineItem heading="First release" date="2026-02-01">v1.0 shipped</TimelineItem>
    </Timeline>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-timeline — requires timeline.css + base.css (or arc-ui.css) -->
<div class="arc-timeline">
  <div class="timeline__slot-host">
   Timeline
   </div>
   <ol class="timeline" role="list">
   _items
   </ol>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-timeline — self-contained, no external CSS needed -->
<div class="arc-timeline" style="display: block">
  <div style="display: none">
   Timeline
   </div>
   <ol style="display: flex; flex-direction: column; gap: 0; padding: 0; margin: 0; list-style: none" role="list">
   _items
   </ol>
</div>`,
    },
  ],
  subComponents: [
    {
      name: 'TimelineItem',
      tag: 'arc-timeline-item',
      description: 'Individual event within a Timeline.',
    },
  ],

  seeAlso: ['stepper', 'progress'],
};
