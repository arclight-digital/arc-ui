import type { ComponentDef } from './_types';

export const rail: ComponentDef = {
  name: 'Rail',
  slug: 'rail',
  tag: 'arc-rail',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    "A 48px column of icon buttons for switching top-level sections, like VS Code's activity bar.",

  overview: `Rail renders its \`items\` as a single column of icon buttons, 48px wide. Use it for top-level sections in an app that has room for a strip but not for a labelled Sidebar. Pair it with a Sidebar that shows the detail for the active section, the way VS Code pairs its activity bar with Explorer, Search and Source Control.

Icons are \`text-muted\` at rest. The item whose \`value\` matches the Rail's \`value\` gets the primary button style, an accent glow and \`aria-current="page"\`. Selecting an item fires \`arc-change\` with the new value, so your app can swap the content next to it.

Each item's \`label\` is the button's accessible name, not visible text. Setting \`expanded\` widens the strip to 200px, but the labels still don't show, and nothing sets \`expanded\` on hover.`,

  features: [
    'Items are plain buttons: Tab moves between them and Enter or Space selects one. There are no arrow-key shortcuts',
    'The inner `<nav>` carries `aria-label="Rail navigation"`',
    'The width change on `expanded` animates',
  ],

  guidelines: {
    do: [
      'Keep it to about four to seven items, so the column doesn\'t overflow',
      'Pick icons people recognize without a label, since none is shown',
      'Put it at the far-left edge of an AppShell',
    ],
    dont: [
      'Don\'t make it the only navigation on a content-heavy site. Icons alone can\'t carry many destinations',
      'Don\'t use it on phone-width screens. Use BottomNav',
    ],
  },

  previewHtml: `<div style="display:flex;width:100%;max-width:480px;height:260px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-rail value="explorer" items='[{"icon":"folder","label":"Explorer","value":"explorer"},{"icon":"magnifying-glass","label":"Search","value":"search"},{"icon":"git-branch","label":"Source Control","value":"scm"},{"icon":"puzzle-piece","label":"Extensions","value":"extensions"},{"icon":"gear","label":"Settings","value":"settings"}]' style="height:100%"></arc-rail>
  <div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:var(--text-sm)">App content here.</div>
</div>`,

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
    <arc-rail
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
