import type { ComponentDef } from './_types';

export const collapsible: ComponentDef = {
    name: 'Collapsible',
    slug: 'collapsible',
    tag: 'arc-collapsible',
    tier: 'content',
    interactivity: 'interactive',
    description: 'A disclosure widget with a clickable heading that toggles the visibility of its slotted content using a smooth CSS grid animation.',

    overview: `Collapsible provides a single-section disclosure pattern where clicking the heading row expands or collapses the body content below it. Unlike Accordion, which manages multiple panels with mutual exclusion, Collapsible is a standalone toggle -- perfect for optional details, advanced settings, or supplementary information that the user may not need immediately.

The expand/collapse animation uses a CSS \`grid-template-rows\` transition from \`0fr\` to \`1fr\`, producing a smooth height animation without JavaScript measurement. A chevron indicator on the right side of the heading rotates from 0 to 90 degrees when the section opens, providing a clear visual cue of the current state. The heading row highlights on hover with an elevated background and gains an inset accent-primary ring on focus-visible.

The component fires an \`arc-toggle\` event with an \`open\` boolean in the detail whenever the state changes, allowing parent components to track or persist the disclosure state. The \`open\` attribute is reflected, so it can be set declaratively in HTML or toggled programmatically. The content region uses an ARIA \`region\` role with the heading text as its label for proper screen reader announcements.`,

    features: [
      'Smooth expand/collapse animation using CSS `grid-template-rows` transition (no JS measurement)',
      'Chevron indicator rotates from 0 to 90 degrees to signal open/closed state',
      'Heading row with hover highlight and inset accent-primary focus ring',
      'Reflected `open` attribute for declarative or programmatic state control',
      'ARIA `aria-expanded` on the trigger button and `role="region"` on the content area',
      'Fires `arc-toggle` event with `{ open: boolean }` detail on every state change',
      'Keyboard support: Enter and Space toggle the disclosure from the heading button',
      'Respects `prefers-reduced-motion` by disabling all transitions',
    ],

    guidelines: {
      do: [
        'Use Collapsible for optional or secondary content that does not need to be visible by default',
        'Provide a clear, descriptive `heading` so users know what the hidden content contains',
        'Set `open` declaratively when the content should be visible on initial render',
        'Use multiple Collapsibles in a stack for FAQ-style sections without mutual exclusion',
        'Listen to `arc-toggle` to persist the open/closed state across sessions if needed',
      ],
      dont: [
        'Do not use Collapsible for primary content that users must see -- keep it visible instead',
        'Do not nest Collapsibles more than one level deep -- it creates confusing disclosure hierarchies',
        'Do not use Collapsible when you need only-one-open-at-a-time behaviour -- use Accordion instead',
        'Do not leave the `heading` empty -- the trigger button needs visible text for usability and accessibility',
        'Avoid placing very tall content inside a Collapsible without a scrollable wrapper -- it can push the page layout significantly',
      ],
    },

    previewHtml: `<arc-collapsible heading="Advanced Options" open>
  <p>These settings control fine-grained behaviour that most users will not need to change.</p>
</arc-collapsible>`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls whether the content is visible. Reflected as an attribute and toggleable by clicking the heading.' },
      { name: 'heading', type: 'string', default: "''", description: 'Text displayed in the clickable trigger row. Also used as the ARIA label for the content region.' },
    ],
    events: [
      { name: 'arc-toggle', description: 'Fired when the collapsible expands or collapses' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-collapsible heading="More Details">
  <p>Hidden content revealed on click.</p>
</arc-collapsible>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Collapsible } from '@arclux/arc-ui-react';

<Collapsible heading="More Details">
  <p>Hidden content revealed on click.</p>
</Collapsible>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Collapsible } from '@arclux/arc-ui-vue';
</script>

<template>
  <Collapsible heading="More Details">
    <p>Hidden content revealed on click.</p>
  </Collapsible>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Collapsible } from '@arclux/arc-ui-svelte';
</script>

<Collapsible heading="More Details">
  <p>Hidden content revealed on click.</p>
</Collapsible>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Collapsible } from '@arclux/arc-ui-angular';

@Component({
  imports: [Collapsible],
  template: \`
    <Collapsible heading="More Details">
      <p>Hidden content revealed on click.</p>
    </Collapsible>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Collapsible } from '@arclux/arc-ui-solid';

<Collapsible heading="More Details">
  <p>Hidden content revealed on click.</p>
</Collapsible>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Collapsible } from '@arclux/arc-ui-preact';

<Collapsible heading="More Details">
  <p>Hidden content revealed on click.</p>
</Collapsible>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<arc-collapsible heading="More Details">
  <p>Hidden content revealed on click.</p>
</arc-collapsible>`,
      },
    ],
  };
