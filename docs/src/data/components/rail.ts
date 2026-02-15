import type { ComponentDef } from './_types';

export const rail: ComponentDef = {
  name: 'Rail',
  slug: 'rail',
  tag: 'arc-rail',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Ultra-narrow icon-only vertical navigation like VS Code\'s activity bar. Icons use text-muted at rest, accent-primary glow on active. Expands on hover.',

  overview: `Rail is an ultra-narrow vertical navigation strip — typically 48 to 56 pixels wide — that displays icon-only items in a single column. Inspired by the activity bar in VS Code and similar IDE layouts, it provides top-level section switching without consuming the horizontal space that a full Sidebar requires. Icons render in text-muted at rest and light up with an accent-primary glow when active, giving immediate visual feedback about the current section.

On hover, the Rail can optionally expand to reveal text labels beside each icon, bridging the gap between compact icon-only navigation and a full labelled sidebar. This expand-on-hover behaviour is controlled by the \`expanded\` prop and can also be toggled programmatically for accessibility — some users prefer the labels to remain visible at all times.

Rail is designed to sit at the far-left edge of an AppShell, occupying a fixed vertical strip from top to bottom. It works well alongside a contextual Sidebar: the Rail handles top-level section switching (e.g. Explorer, Search, Source Control) while the Sidebar shows the detail panel for the active section. The component dispatches \`arc-change\` on item selection so your application can swap the adjacent content area accordingly.`,

  features: [
    'Ultra-narrow icon-only vertical navigation strip',
    'Accent-primary glow on active item, text-muted at rest',
    'Optional expand-on-hover to reveal text labels',
    'Controlled expanded prop for programmatic label visibility',
    'arc-change event on item selection',
    'Designed for far-left positioning in AppShell layouts',
    'Keyboard navigable with arrow keys and Enter activation',
    'Pairs with Sidebar for section-detail navigation patterns',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Limit items to four to seven for a scannable icon column',
      'Use universally recognisable icons — Rail has no visible labels by default',
      'Place Rail at the far-left edge of the viewport inside an AppShell',
      'Pair with a Sidebar to show detail content for the active Rail section',
      'Provide aria-label on the Rail for screen-reader context',
    ],
    dont: [
      'Use Rail as the only navigation on a content-heavy site — it is too compact',
      'Add more than seven items — vertical overflow will be confusing',
      'Rely solely on icon recognition — ensure tooltips or expand-on-hover labels are available',
      'Use Rail on mobile viewports — switch to BottomNav instead',
      'Nest a Rail inside a Sidebar — Rail replaces the sidebar for top-level switching',
    ],
  },

  previewHtml: `<div style="display:flex;width:100%;max-width:480px;height:260px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-rail value="explorer" items='[{"icon":"folder","label":"Explorer","value":"explorer"},{"icon":"magnifying-glass","label":"Search","value":"search"},{"icon":"git-branch","label":"Source Control","value":"scm"},{"icon":"puzzle-piece","label":"Extensions","value":"extensions"},{"icon":"gear","label":"Settings","value":"settings"}]' style="height:100%"></arc-rail>
  <div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:var(--text-sm)">App content here.</div>
</div>`,

  props: [
    { name: 'items', type: 'Array<{ icon, label, value }>', default: '[]', description: 'Array of navigation items, each with an icon name, text label, and value identifier.' },
    { name: 'value', type: 'string', default: "''", description: 'The value of the currently active item. Controls which icon receives the accent glow.' },
    { name: 'expanded', type: 'boolean', default: 'false', description: 'When true, the Rail widens to show text labels beside each icon. Can be toggled on hover or set permanently.' },
  ],
  events: [
    { name: 'arc-change', description: 'Fired when an item is selected with detail: { value }.' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-rail
  value="explorer"
  id="rail"
  items='[
    { "icon": "folder", "label": "Explorer", "value": "explorer" },
    { "icon": "magnifying-glass", "label": "Search", "value": "search" },
    { "icon": "git-branch", "label": "Source Control", "value": "scm" },
    { "icon": "puzzle-piece", "label": "Extensions", "value": "extensions" },
    { "icon": "gear", "label": "Settings", "value": "settings" }
  ]'
></arc-rail>

<script>
  document.querySelector('#rail').addEventListener('arc-change', (e) => {
    console.log('section:', e.detail.value);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Rail } from '@arclux/arc-ui-react';

const items = [
  { icon: 'folder', label: 'Explorer', value: 'explorer' },
  { icon: 'search', label: 'Search', value: 'search' },
  { icon: 'git-branch', label: 'Source Control', value: 'scm' },
  { icon: 'puzzle', label: 'Extensions', value: 'extensions' },
  { icon: 'settings', label: 'Settings', value: 'settings' },
];

export function ActivityBar() {
  return (
    <Rail
      items={items}
      value="explorer"
      onArcChange={(e) => console.log('section:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Rail } from '@arclux/arc-ui-vue';

const items = [
  { icon: 'folder', label: 'Explorer', value: 'explorer' },
  { icon: 'search', label: 'Search', value: 'search' },
  { icon: 'git-branch', label: 'Source Control', value: 'scm' },
  { icon: 'puzzle', label: 'Extensions', value: 'extensions' },
  { icon: 'settings', label: 'Settings', value: 'settings' },
];

function onChange(e) {
  console.log('section:', e.detail.value);
}
</script>

<template>
  <Rail :items="items" value="explorer" @arc-change="onChange" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Rail } from '@arclux/arc-ui-svelte';

  const items = [
    { icon: 'folder', label: 'Explorer', value: 'explorer' },
    { icon: 'search', label: 'Search', value: 'search' },
    { icon: 'git-branch', label: 'Source Control', value: 'scm' },
    { icon: 'puzzle', label: 'Extensions', value: 'extensions' },
    { icon: 'settings', label: 'Settings', value: 'settings' },
  ];
</script>

<Rail
  {items}
  value="explorer"
  on:arc-change={(e) => console.log('section:', e.detail.value)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Rail } from '@arclux/arc-ui-angular';

@Component({
  imports: [Rail],
  template: \`
    <Rail
      [items]="items"
      value="explorer"
      (arc-change)="onChange($event)"
    />
  \`,
})
export class ActivityBarComponent {
  items = [
    { icon: 'folder', label: 'Explorer', value: 'explorer' },
    { icon: 'search', label: 'Search', value: 'search' },
    { icon: 'git-branch', label: 'Source Control', value: 'scm' },
    { icon: 'puzzle', label: 'Extensions', value: 'extensions' },
    { icon: 'settings', label: 'Settings', value: 'settings' },
  ];

  onChange(e: CustomEvent) {
    console.log('section:', e.detail.value);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Rail } from '@arclux/arc-ui-solid';

const items = [
  { icon: 'folder', label: 'Explorer', value: 'explorer' },
  { icon: 'search', label: 'Search', value: 'search' },
  { icon: 'git-branch', label: 'Source Control', value: 'scm' },
  { icon: 'puzzle', label: 'Extensions', value: 'extensions' },
  { icon: 'settings', label: 'Settings', value: 'settings' },
];

export function ActivityBar() {
  return (
    <Rail
      items={items}
      value="explorer"
      onArcChange={(e) => console.log('section:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Rail } from '@arclux/arc-ui-preact';

const items = [
  { icon: 'folder', label: 'Explorer', value: 'explorer' },
  { icon: 'search', label: 'Search', value: 'search' },
  { icon: 'git-branch', label: 'Source Control', value: 'scm' },
  { icon: 'puzzle', label: 'Extensions', value: 'extensions' },
  { icon: 'settings', label: 'Settings', value: 'settings' },
];

export function ActivityBar() {
  return (
    <Rail
      items={items}
      value="explorer"
      onArcChange={(e) => console.log('section:', e.detail.value)}
    />
  );
}`,
    },
  ],

  seeAlso: ['sidebar', 'navigation-menu', 'bottom-nav'],
};
