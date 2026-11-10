import type { ComponentDef } from './_types';

export const popover: ComponentDef = {
  name: 'Popover',
  slug: 'popover',
  tag: 'arc-popover',
  tier: 'feedback',
  interactivity: 'interactive',
  description:
    'A floating panel that opens when its trigger is clicked, placed on one of four sides and closed by an outside click or Escape.',

  overview: `Popover opens a panel of any content when the reader clicks its trigger. Use it for info cards, filter panels and small forms. For a panel that opens on hover, use HoverCard, and for a short hint, use Tooltip.

Put the trigger in the \`trigger\` slot and the content in the default slot. \`position\` (\`top\`, \`bottom\`, \`left\` or \`right\`, default \`bottom\`) picks the preferred side. The panel is drawn in the top layer, so \`overflow: hidden\` ancestors can't clip it, and it flips to the opposite side or shifts along the edge when it doesn't fit in the viewport. It scales in on \`--transition-base\`.

Clicking outside or pressing Escape closes it. The component fires \`arc-open\` and \`arc-close\`. The panel has \`role="dialog"\` and the trigger gets \`aria-haspopup\` and \`aria-expanded\`.`,

  features: [
    'Escape returns focus to the element that had it when the panel opened',
    'Parts: `base`, `trigger`, `panel`',
  ],

  guidelines: {
    do: [
      'Use a focusable element, like a button, in the `trigger` slot so keyboard users can open it',
      'Keep the content short. Use Dialog or Drawer for complex forms, tables or long lists',
      'Links, buttons and small forms are fine inside the panel',
    ],
    dont: ["Don't put information readers must see in a popover. It's easy to close by accident"],
  },

  previewHtml: `<arc-popover position="bottom">
  <button slot="trigger" style="padding:8px 16px; border:1px solid var(--border-default); border-radius:var(--radius-md); background:var(--bg-card); color:var(--text-primary); cursor:pointer;">Show details</button>
  <div style="min-width:200px;">
    <p style="margin:0 0 8px; font-weight:600; color:var(--text-primary);">Details</p>
    <p style="margin:0; font-size:13px; color:var(--text-secondary);">Click outside or press Escape to close.</p>
  </div>
</arc-popover>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-popover>
  <button slot="trigger">Show Popover</button>
  <div>Popover content here.</div>
</arc-popover>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Popover } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Popover>
      <button slot="trigger">Show Popover</button>
      <div>Popover content here.</div>
    </Popover>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Popover } from '@arclux/arc-ui-vue';
</script>

<template>
  <Popover>
    <button slot="trigger">Show Popover</button>
    <div>Popover content here.</div>
  </Popover>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Popover } from '@arclux/arc-ui-svelte';
</script>

<Popover>
  <button slot="trigger">Show Popover</button>
  <div>Popover content here.</div>
</Popover>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Popover } from '@arclux/arc-ui-angular';

@Component({
  imports: [Popover],
  template: \`
    <arc-popover>
      <button slot="trigger">Show Popover</button>
      <div>Popover content here.</div>
    </arc-popover>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Popover } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Popover>
      <button slot="trigger">Show Popover</button>
      <div>Popover content here.</div>
    </Popover>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Popover } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Popover>
      <button slot="trigger">Show Popover</button>
      <div>Popover content here.</div>
    </Popover>
  );
}`,
    },
  ],

  seeAlso: ['tooltip', 'hover-card', 'dropdown-menu'],
};
