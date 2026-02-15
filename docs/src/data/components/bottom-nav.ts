import type { ComponentDef } from './_types';

export const bottomNav: ComponentDef = {
  name: 'Bottom Nav',
  slug: 'bottom-nav',
  tag: 'arc-bottom-nav',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Mobile bottom bar with icon + label items. Active item gets accent-primary glow underline with surface-overlay background and backdrop blur.',

  overview: `BottomNav is a fixed-position navigation bar anchored to the bottom of the viewport, purpose-built for mobile and touch-first interfaces. It renders a row of icon-and-label items where the active selection is highlighted with an accent-primary glow underline and a frosted surface-overlay background with backdrop blur, making the current section immediately obvious even at a glance.

The component follows the well-established mobile navigation pattern used by native apps: three to five top-level destinations, each represented by an icon above a short label. Tapping an item dispatches an \`arc-change\` event so your application can update the active route. The \`value\` prop controls which item is currently selected, enabling both controlled and uncontrolled usage patterns.

BottomNav is designed to complement TopBar — use TopBar for desktop viewports and swap in BottomNav at mobile breakpoints. The backdrop blur effect ensures the bar remains legible even when content scrolls beneath it. For deeper hierarchical navigation on mobile, pair BottomNav with a Drawer or Sheet for secondary menu levels.`,

  features: [
    'Fixed bottom positioning for mobile-first navigation',
    'Icon + label items for scannable touch targets',
    'Accent-primary glow underline on the active item',
    'Surface-overlay background with backdrop blur',
    'arc-change event on item selection',
    'Controlled value prop for external state management',
    'Supports three to five navigation destinations',
    'Keyboard accessible with arrow key navigation',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Limit to three to five items — more will crowd the bar on small screens',
      'Use recognisable icons with short labels (one to two words)',
      'Show BottomNav only on mobile breakpoints — use TopBar or Sidebar on desktop',
      'Set the value prop to match the current route for correct highlighting',
      'Pair with a Drawer or Sheet for deeper navigation within a section',
    ],
    dont: [
      'Display BottomNav and TopBar navigation simultaneously on the same viewport',
      'Use labels longer than two words — they will truncate on narrow screens',
      'Add more than five items — prioritise the most important destinations',
      'Use BottomNav for actions (like "Create" or "Delete") — it is for navigation only',
      'Forget to provide icons — label-only items break the expected mobile pattern',
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

  props: [
    { name: 'items', type: 'Array<{ label, icon, value }>', default: '[]', description: 'Array of navigation items, each with a label, icon name, and value identifier.' },
    { name: 'value', type: 'string', default: "''", description: 'The value of the currently active item. Controls which item is highlighted.' },
  ],
  events: [
    { name: 'arc-change', description: 'Fired when an item is tapped with detail: { value }.' },
  ],

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
    <BottomNav
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
