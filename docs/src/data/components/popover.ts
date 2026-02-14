import type { ComponentDef } from './_types';

export const popover: ComponentDef = {
    name: 'Popover',
    slug: 'popover',
    tag: 'arc-popover',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Floating content panel anchored to a trigger element, with four placement positions and automatic outside-click dismissal.',

    overview: `Popover is a disclosure component that reveals a floating panel of arbitrary content when the user clicks a trigger element. It is the foundation for building dropdown menus, info cards, filter panels, and other contextual UI that should appear on demand without leaving the current page. The panel is positioned relative to the trigger using the \`position\` prop, which accepts \`top\`, \`bottom\`, \`left\`, or \`right\`.

The trigger element is placed in the named \`trigger\` slot, and the popover content goes in the default slot. When the popover opens, the panel scales in with a smooth CSS transition powered by \`--transition-base\`. Clicking outside the popover or pressing Escape closes it, and the component fires \`arc-open\` and \`arc-close\` events so you can coordinate side effects like pausing scroll or loading data.

Popover uses \`role="dialog"\` on the panel and sets \`aria-haspopup\` and \`aria-expanded\` on the trigger, following WAI-ARIA patterns for disclosure widgets. The panel is absolutely positioned with \`z-index: 100\` and uses the \`--shadow-overlay\` token for depth. CSS parts are exposed for \`trigger\` and \`panel\` to allow targeted styling without piercing the shadow DOM.`,

    features: [
      'Four placement positions: top, bottom (default), left, and right, each with centered alignment',
      'Smooth open/close animation using CSS scale and opacity transitions',
      'Automatic outside-click dismissal -- clicking anywhere outside the popover closes it',
      'Escape key closes the popover for keyboard-accessible dismissal',
      'Named `trigger` slot for the clickable element and default slot for popover content',
      'Fires `arc-open` and `arc-close` events for coordinating external state',
      'Accessible `aria-haspopup`, `aria-expanded`, and `role="dialog"` attributes',
      'CSS parts `trigger` and `panel` for external style customisation',
    ],

    guidelines: {
      do: [
        'Use the `trigger` slot with a focusable element like a button for keyboard accessibility',
        'Choose a `position` that keeps the panel visible within the viewport for your layout',
        'Keep popover content concise -- for complex forms, consider a Modal or Drawer instead',
        'Use `arc-close` events to clean up temporary state when the popover dismisses',
        'Nest interactive content like links, buttons, or small forms inside the default slot',
      ],
      dont: [
        'Do not use Popover for critical information that the user must see -- it can be dismissed accidentally',
        'Do not nest a Popover inside another Popover -- stacking z-index and focus management becomes unreliable',
        'Do not place very large content (tables, long lists) inside a popover -- use a Drawer or Modal for that',
        'Do not use Popover as a tooltip -- use the Tooltip component for brief hover-triggered hints',
        'Avoid placing the trigger inside a scrollable container without testing that the panel remains aligned',
      ],
    },

    previewHtml: `<arc-popover position="bottom">
  <button slot="trigger" style="padding:8px 16px; border:1px solid var(--border-default); border-radius:var(--radius-md); background:var(--bg-card); color:var(--text-primary); cursor:pointer;">Open Popover</button>
  <div style="min-width:200px;">
    <p style="margin:0 0 8px; font-weight:600; color:var(--text-primary);">Popover Title</p>
    <p style="margin:0; font-size:13px; color:var(--text-secondary);">This is popover content. Click outside or press Escape to close.</p>
  </div>
</arc-popover>`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Whether the popover panel is currently visible. Reflected as an attribute.' },
      { name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'", description: 'Placement of the panel relative to the trigger element.' },
      { name: 'trigger', type: 'string', default: "''", description: 'Reserved for future trigger-mode configuration (click, hover, manual).' },
    ],
    events: [
      { name: 'arc-close', description: 'Fired when the popover closes' },
    ],
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

<Popover>
  <button slot="trigger">Show Popover</button>
  <div>Popover content here.</div>
</Popover>`,
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
    <Popover>
      <button slot="trigger">Show Popover</button>
      <div>Popover content here.</div>
    </Popover>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Popover } from '@arclux/arc-ui-solid';

<Popover>
  <button slot="trigger">Show Popover</button>
  <div>Popover content here.</div>
</Popover>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Popover } from '@arclux/arc-ui-preact';

<Popover>
  <button slot="trigger">Show Popover</button>
  <div>Popover content here.</div>
</Popover>`,
      },
    ],
  
  seeAlso: ["tooltip","hover-card","dropdown-menu"],
};
