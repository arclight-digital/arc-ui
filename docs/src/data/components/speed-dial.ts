import type { ComponentDef } from './_types';

export const speedDial: ComponentDef = {
  name: 'Speed Dial',
  slug: 'speed-dial',
  tag: 'arc-speed-dial',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Floating action button that fans out secondary actions with staggered scale-in animation. Trigger is a primary icon-button.',

  overview: `SpeedDial is a floating action button (FAB) pattern that reveals a cluster of secondary action buttons when activated. The trigger button — rendered as a prominent icon-button — fans out child actions in a configurable direction (up, down, left, or right) with a staggered scale-in animation that gives each item a satisfying cascade entrance. This pattern is borrowed from Material Design but adapted to the ARC UI token system with accent-primary glow and surface-overlay backdrops.

SpeedDial is best suited for mobile and tablet interfaces where screen space is limited but quick access to two to five frequent actions is important. Common use cases include "compose" flows in messaging apps, quick-add actions in project management tools, and creation shortcuts in creative applications. The floating position ensures the trigger is always reachable without scrolling.

The component manages its own open/closed state and dispatches \`arc-open\`, \`arc-close\`, and \`arc-action\` events. The \`arc-action\` event includes the index of the selected item so your application can map each position to a specific handler. Clicking outside the expanded dial or pressing Escape closes it automatically. For a menu of text-labelled items rather than icon actions, consider DropdownMenu instead.`,

  features: [
    'Floating action button with staggered scale-in animation',
    'Configurable fan direction: up, down, left, or right',
    'Fixed position in bottom-right or bottom-left corner',
    'arc-open and arc-close events for state tracking',
    'arc-action event with index of selected item',
    'Auto-close on outside click or Escape keypress',
    'Keyboard accessible with Tab and Enter activation',
    'Accent-primary glow on trigger and action items',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Limit secondary actions to two to five items for quick scanning',
      'Use recognisable icons for each action — tooltips can add context',
      'Place in bottom-right for right-handed thumb reach on mobile',
      'Use SpeedDial for creation or composition actions that benefit from quick access',
      'Close the dial after an action is selected to avoid visual clutter',
    ],
    dont: [
      'Use SpeedDial for navigation — it is for actions, not route changes',
      'Add more than five actions — use a full menu or action sheet instead',
      'Place SpeedDial in a scrollable container — it should float above content',
      'Use text labels on the action items — icons only keeps the pattern compact',
      'Show SpeedDial on desktop when a toolbar with labelled buttons would be clearer',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:200px;height:240px;position:relative;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
  <arc-speed-dial direction="up" position="bottom-right" open items='[{"icon":"pencil-simple","label":"Edit"},{"icon":"image","label":"Image"},{"icon":"share","label":"Share"}]'></arc-speed-dial>
</div>`,

  props: [
    { name: 'open', type: 'boolean', default: 'false', description: 'Whether the secondary actions are currently visible.' },
    { name: 'direction', type: "'up' | 'down' | 'left' | 'right'", default: "'up'", description: 'The direction in which child actions fan out from the trigger.' },
    { name: 'position', type: "'bottom-right' | 'bottom-left'", default: "'bottom-right'", description: 'Fixed viewport corner where the speed dial is anchored.' },
  ],
  events: [
    { name: 'arc-open', description: 'Fired when the speed dial expands.' },
    { name: 'arc-close', description: 'Fired when the speed dial collapses.' },
    { name: 'arc-action', description: 'Fired when a secondary action is selected with detail: { index }.' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-speed-dial direction="up" position="bottom-right" id="dial">
  <arc-icon-button slot="action" name="pencil-simple" aria-label="Edit"></arc-icon-button>
  <arc-icon-button slot="action" name="image" aria-label="Image"></arc-icon-button>
  <arc-icon-button slot="action" name="share" aria-label="Share"></arc-icon-button>
</arc-speed-dial>

<script>
  const dial = document.querySelector('#dial');
  dial.addEventListener('arc-action', (e) => {
    console.log('action index:', e.detail.index);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { SpeedDial, IconButton } from '@arclux/arc-ui-react';

export function QuickActions() {
  return (
    <SpeedDial
      direction="up"
      position="bottom-right"
      onArcAction={(e) => console.log('action:', e.detail.index)}
    >
      <IconButton slot="action" icon="edit" aria-label="Edit" />
      <IconButton slot="action" icon="image" aria-label="Image" />
      <IconButton slot="action" icon="share" aria-label="Share" />
    </SpeedDial>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { SpeedDial, IconButton } from '@arclux/arc-ui-vue';

function onAction(e) {
  console.log('action:', e.detail.index);
}
</script>

<template>
  <SpeedDial direction="up" position="bottom-right" @arc-action="onAction">
    <IconButton slot="action" icon="edit" aria-label="Edit" />
    <IconButton slot="action" icon="image" aria-label="Image" />
    <IconButton slot="action" icon="share" aria-label="Share" />
  </SpeedDial>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { SpeedDial, IconButton } from '@arclux/arc-ui-svelte';
</script>

<SpeedDial
  direction="up"
  position="bottom-right"
  on:arc-action={(e) => console.log('action:', e.detail.index)}
>
  <IconButton slot="action" icon="edit" aria-label="Edit" />
  <IconButton slot="action" icon="image" aria-label="Image" />
  <IconButton slot="action" icon="share" aria-label="Share" />
</SpeedDial>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { SpeedDial, IconButton } from '@arclux/arc-ui-angular';

@Component({
  imports: [SpeedDial, IconButton],
  template: \`
    <SpeedDial
      direction="up"
      position="bottom-right"
      (arc-action)="onAction($event)"
    >
      <IconButton slot="action" icon="edit" aria-label="Edit" />
      <IconButton slot="action" icon="image" aria-label="Image" />
      <IconButton slot="action" icon="share" aria-label="Share" />
    </SpeedDial>
  \`,
})
export class QuickActionsComponent {
  onAction(e: CustomEvent) {
    console.log('action:', e.detail.index);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { SpeedDial, IconButton } from '@arclux/arc-ui-solid';

export function QuickActions() {
  return (
    <SpeedDial
      direction="up"
      position="bottom-right"
      onArcAction={(e) => console.log('action:', e.detail.index)}
    >
      <IconButton slot="action" icon="edit" aria-label="Edit" />
      <IconButton slot="action" icon="image" aria-label="Image" />
      <IconButton slot="action" icon="share" aria-label="Share" />
    </SpeedDial>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { SpeedDial, IconButton } from '@arclux/arc-ui-preact';

export function QuickActions() {
  return (
    <SpeedDial
      direction="up"
      position="bottom-right"
      onArcAction={(e) => console.log('action:', e.detail.index)}
    >
      <IconButton slot="action" icon="edit" aria-label="Edit" />
      <IconButton slot="action" icon="image" aria-label="Image" />
      <IconButton slot="action" icon="share" aria-label="Share" />
    </SpeedDial>
  );
}`,
    },
  ],

  seeAlso: ['icon-button', 'float-bar', 'dropdown-menu'],
};
