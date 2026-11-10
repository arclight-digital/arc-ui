import type { ComponentDef } from './_types';

export const hoverCard: ComponentDef = {
  name: 'Hover Card',
  slug: 'hover-card',
  tag: 'arc-hover-card',
  tier: 'feedback',
  interactivity: 'interactive',
  description: 'Floating card that opens after a delay when its trigger is hovered or focused.',

  overview: `Hover Card shows a floating card when someone hovers over or focuses its trigger. Tooltip shows a short text label. Hover Card holds any markup and opens without a click.

The card opens after \`open-delay\` (400ms by default) and closes \`close-delay\` (300ms by default) after the cursor leaves the trigger. Moving the cursor into the card cancels the close, so people can use links and buttons inside it. Escape closes it while focus is in the trigger or the card.

\`position\` sets the preferred side: \`bottom\` (default), \`top\`, \`left\` or \`right\`. If the card doesn't fit there, it flips to the opposite side and shifts along the edge to stay in the viewport. It opens with a fade and a scale from 0.96 to 1. Put the trigger in the default slot and the card's content in the \`content\` slot.`,

  features: [
    '`arc-open` and `arc-close` fire when the card shows and hides',
  ],

  guidelines: {
    do: [
      'Keep the content short: a heading, a few lines of text, and at most a link or an action',
      'Raise `open-delay` in dense layouts so the card doesn\'t open as the cursor passes over',
    ],
    dont: [
      'Don\'t put anything people must see in a hover card. Touch screens have no hover',
      'Don\'t put forms in the card. Use Popover or Dialog',
      'Don\'t set `open-delay` to 0. The card flashes open on every passing hover',
      'Don\'t leave the `content` slot empty. The card opens as an empty panel',
    ],
  },

  previewHtml: `<div style="height:200px;display:flex;align-items:flex-start;justify-content:center;padding-top:var(--space-md)">
  <arc-hover-card position="bottom">
    <arc-button variant="secondary">Hover for details</arc-button>
    <div slot="content" style="display:flex; flex-direction:column; gap:8px; min-width:220px;">
      <strong style="color:var(--text-primary); font-size:14px;">Alice Chen</strong>
      <span style="color:var(--text-secondary); font-size:13px;">Senior Engineer @ Arclight</span>
      <span style="color:var(--text-muted); font-size:12px;">San Francisco, CA</span>
    </div>
  </arc-hover-card>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-hover-card>
  <arc-button variant="secondary">Hover me</arc-button>
  <div slot="content">Additional details on hover.</div>
</arc-hover-card>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Button, HoverCard } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <HoverCard>
      <Button variant="secondary">Hover me</Button>
      <div slot="content">Additional details on hover.</div>
    </HoverCard>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Button, HoverCard } from '@arclux/arc-ui-vue';
</script>

<template>
  <HoverCard>
    <Button variant="secondary">Hover me</Button>
    <div slot="content">Additional details on hover.</div>
  </HoverCard>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Button, HoverCard } from '@arclux/arc-ui-svelte';
</script>

<HoverCard>
  <Button variant="secondary">Hover me</Button>
  <div slot="content">Additional details on hover.</div>
</HoverCard>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Button, HoverCard } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, HoverCard],
  template: \`
    <arc-hover-card>
      <arc-button variant="secondary">Hover me</arc-button>
      <div slot="content">Additional details on hover.</div>
    </arc-hover-card>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Button, HoverCard } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <HoverCard>
      <Button variant="secondary">Hover me</Button>
      <div slot="content">Additional details on hover.</div>
    </HoverCard>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Button, HoverCard } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <HoverCard>
      <Button variant="secondary">Hover me</Button>
      <div slot="content">Additional details on hover.</div>
    </HoverCard>
  );
}`,
    },
  ],

  seeAlso: ['tooltip', 'popover', 'card'],
};
