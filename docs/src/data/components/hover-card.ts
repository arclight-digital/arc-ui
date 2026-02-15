import type { ComponentDef } from './_types';

export const hoverCard: ComponentDef = {
    name: 'Hover Card',
    slug: 'hover-card',
    tag: 'arc-hover-card',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Card that appears on hover with a delay.',

    overview: `HoverCard displays a floating card with supplementary content when the user hovers over or focuses a trigger element. Unlike Tooltip (which shows a short text label), HoverCard is designed for richer content -- user profile previews, link metadata, product summaries, or any structured information that benefits from appearing on demand without a click.

The card appears after a configurable \`open-delay\` (default 400ms) and disappears after a \`close-delay\` (default 300ms) once the cursor leaves the trigger. Critically, moving the cursor from the trigger into the card itself cancels the close timer, so users can interact with links, buttons, or text inside the card without it vanishing. This enter-to-keep-open pattern is essential for hover-based rich content panels.

The card supports four positions -- \`bottom\` (default), \`top\`, \`left\`, and \`right\` -- set via the \`position\` attribute, which controls the CSS absolute positioning relative to the trigger. The card animates in with a scale transition from 0.96 to 1 and fades in via opacity, and the transition respects ARC design token timing variables. Pressing Escape while the card is visible hides it immediately. The trigger is provided via the default slot, and the card content goes in the \`content\` named slot.`,

    features: [
      'Rich content popover for profiles, previews, and structured hover information',
      'Configurable open-delay and close-delay with sensible defaults (400ms / 300ms)',
      'Enter-to-keep-open: moving the cursor into the card cancels the close timer',
      'Four positioning options: bottom, top, left, right via the position attribute',
      'Scale and opacity entrance animation using ARC design token transition timing',
      'Escape key dismissal for keyboard accessibility',
      'Focus-in and focus-out support so keyboard users can trigger the card via tab navigation',
      'arc-open and arc-close custom events for tracking card visibility state'
    ],

    guidelines: {
      do: [
        'Use HoverCard for supplementary content that enriches the trigger without requiring a click (e.g., user profile previews)',
        'Keep card content concise -- a heading, a few lines of text, and optionally a link or action',
        'Set position to avoid clipping against viewport edges; "top" works well for triggers near the bottom of the page',
        'Increase open-delay for triggers in dense layouts to prevent accidental activation during quick mouse traversal',
        'Test with keyboard navigation to ensure the card is accessible via focus-in on the trigger'
      ],
      dont: [
        'Use HoverCard for critical information that the user must see -- hover is not discoverable on touch devices',
        'Place complex interactive forms inside the card; use a Popover or Modal for those use cases',
        'Set open-delay to 0, as this causes cards to flash on every accidental hover',
        'Nest a HoverCard inside another HoverCard -- the stacking and delay logic will conflict',
        'Forget the content slot; without it, the card renders as an empty floating panel'
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

    props: [
      { name: 'position', type: "'bottom' | 'top' | 'left' | 'right'", default: "'bottom'", description: 'Controls which side of the trigger the card appears on. The card is centered along the perpendicular axis using CSS transforms.' },
      { name: 'open-delay', type: 'number', default: '400', description: 'Milliseconds to wait after hover/focus before showing the card. Prevents accidental activation during fast cursor movement.' },
      { name: 'close-delay', type: 'number', default: '300', description: 'Milliseconds to wait after the cursor leaves the trigger before hiding the card. Moving into the card cancels this timer.' }
    ],
    events: [
      { name: 'arc-open', description: 'Fired when the hover card becomes visible' },
      { name: 'arc-close', description: 'Fired when the hover card hides' }
    ],
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

<HoverCard>
  <Button variant="secondary">Hover me</Button>
  <div slot="content">Additional details on hover.</div>
</HoverCard>`,
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
    <HoverCard>
      <Button variant="secondary">Hover me</Button>
      <div slot="content">Additional details on hover.</div>
    </HoverCard>
  \`,
})
export class MyComponent {}`,
      },
    {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Button, HoverCard } from '@arclux/arc-ui-solid';

<HoverCard>
  <Button variant="secondary">Hover me</Button>
  <div slot="content">Additional details on hover.</div>
</HoverCard>`,
      },
    {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Button, HoverCard } from '@arclux/arc-ui-preact';

<HoverCard>
  <Button variant="secondary">Hover me</Button>
  <div slot="content">Additional details on hover.</div>
</HoverCard>`,
      },
  ],

  seeAlso: ["tooltip","popover","card"],
};
