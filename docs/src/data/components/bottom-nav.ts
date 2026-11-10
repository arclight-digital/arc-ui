import type { ComponentDef } from './_types';

export const bottomNav: ComponentDef = {
  name: 'Bottom Nav',
  slug: 'bottom-nav',
  tag: 'arc-bottom-nav',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'Mobile bottom bar with icon and label items on a blurred surface-overlay background. The active item gets an accent-primary glow underline.',

  overview: `BottomNav is a navigation bar fixed to the bottom of the viewport, for phones and other touch screens. Each item is an icon above a short label, for the three to five top-level destinations a mobile app usually has.

Pass the destinations as \`items\` (\`{ label, icon, value }\`) and the active one as \`value\`. Tapping an item sets \`value\` and fires \`arc-change\` with \`{ value }\`, so your app can change the route.

Use TopBar on desktop and swap in BottomNav at mobile widths. The bar's backdrop blur keeps it legible over content scrolling underneath. For a second level of navigation, open a Drawer or Sheet from a BottomNav item.`,

  features: [
    'Items are `<button>` elements, so Tab and Enter reach them. There are no arrow-key bindings',
    'The active item gets `aria-current="page"`',
  ],

  guidelines: {
    do: [
      'Use three to five items. More crowd the bar on a small screen',
      'Give every item an icon people recognize and a label of one or two words',
      'Show it only at mobile widths, and use TopBar or Sidebar on desktop',
      'Set value to match the current route so the right item is highlighted',
    ],
    dont: [
      'Don\'t show BottomNav and TopBar navigation at the same time',
      'Don\'t use it for actions like "Create" or "Delete". It is for navigation only',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:375px;border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--border-subtle)">
  <nav style="display:flex;background:var(--bg-elevated);backdrop-filter:blur(12px);border-top:1px solid var(--border-subtle);padding:var(--space-xs) 0">
    <button style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:var(--space-xs);color:var(--accent-primary);background:none;border:none;cursor:pointer;font-size:10px;font-family:var(--font-body)">
      <arc-icon name="house" size="md"></arc-icon>
      Home
    </button>
    <button style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:var(--space-xs);color:var(--text-muted);background:none;border:none;cursor:pointer;font-size:10px;font-family:var(--font-body)">
      <arc-icon name="magnifying-glass" size="md"></arc-icon>
      Search
    </button>
    <button style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:var(--space-xs);color:var(--text-muted);background:none;border:none;cursor:pointer;font-size:10px;font-family:var(--font-body)">
      <arc-icon name="user" size="md"></arc-icon>
      Profile
    </button>
    <button style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:var(--space-xs);color:var(--text-muted);background:none;border:none;cursor:pointer;font-size:10px;font-family:var(--font-body)">
      <arc-icon name="gear" size="md"></arc-icon>
      Settings
    </button>
  </nav>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-bottom-nav
  value="home"
  items='[
    { "label": "Home", "icon": "house", "value": "home" },
    { "label": "Search", "icon": "magnifying-glass", "value": "search" },
    { "label": "Profile", "icon": "user", "value": "profile" },
    { "label": "Settings", "icon": "gear", "value": "settings" }
  ]'
  id="nav"
></arc-bottom-nav>

<script>
  document.querySelector('#nav').addEventListener('arc-change', (e) => {
    console.log('navigate:', e.detail.value);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { BottomNav } from '@arclux/arc-ui-react';

const items = [
  { label: 'Home', icon: 'home', value: 'home' },
  { label: 'Search', icon: 'search', value: 'search' },
  { label: 'Profile', icon: 'user', value: 'profile' },
  { label: 'Settings', icon: 'settings', value: 'settings' },
];

export function MobileNav() {
  return (
    <BottomNav
      items={items}
      value="home"
      onArcChange={(e) => console.log('navigate:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { BottomNav } from '@arclux/arc-ui-vue';

const items = [
  { label: 'Home', icon: 'home', value: 'home' },
  { label: 'Search', icon: 'search', value: 'search' },
  { label: 'Profile', icon: 'user', value: 'profile' },
  { label: 'Settings', icon: 'settings', value: 'settings' },
];

function onChange(e) {
  console.log('navigate:', e.detail.value);
}
</script>

<template>
  <BottomNav :items="items" value="home" @arc-change="onChange" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { BottomNav } from '@arclux/arc-ui-svelte';

  const items = [
    { label: 'Home', icon: 'home', value: 'home' },
    { label: 'Search', icon: 'search', value: 'search' },
    { label: 'Profile', icon: 'user', value: 'profile' },
    { label: 'Settings', icon: 'settings', value: 'settings' },
  ];
</script>

<BottomNav
  {items}
  value="home"
  on:arc-change={(e) => console.log('navigate:', e.detail.value)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { BottomNav } from '@arclux/arc-ui-angular';

@Component({
  imports: [BottomNav],
  template: \`
    <arc-bottom-nav
      [items]="items"
      value="home"
      (arc-change)="onChange($event)"
    />
  \`,
})
export class MobileNavComponent {
  items = [
    { label: 'Home', icon: 'home', value: 'home' },
    { label: 'Search', icon: 'search', value: 'search' },
    { label: 'Profile', icon: 'user', value: 'profile' },
    { label: 'Settings', icon: 'settings', value: 'settings' },
  ];

  onChange(e: CustomEvent) {
    console.log('navigate:', e.detail.value);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { BottomNav } from '@arclux/arc-ui-solid';

const items = [
  { label: 'Home', icon: 'home', value: 'home' },
  { label: 'Search', icon: 'search', value: 'search' },
  { label: 'Profile', icon: 'user', value: 'profile' },
  { label: 'Settings', icon: 'settings', value: 'settings' },
];

export function MobileNav() {
  return (
    <BottomNav
      items={items}
      value="home"
      onArcChange={(e) => console.log('navigate:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { BottomNav } from '@arclux/arc-ui-preact';

const items = [
  { label: 'Home', icon: 'home', value: 'home' },
  { label: 'Search', icon: 'search', value: 'search' },
  { label: 'Profile', icon: 'user', value: 'profile' },
  { label: 'Settings', icon: 'settings', value: 'settings' },
];

export function MobileNav() {
  return (
    <BottomNav
      items={items}
      value="home"
      onArcChange={(e) => console.log('navigate:', e.detail.value)}
    />
  );
}`,
    },
  ],

  seeAlso: ['top-bar', 'tabs', 'navigation-menu'],
};
