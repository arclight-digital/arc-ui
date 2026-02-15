import type { ComponentDef } from './_types';

export const breadcrumbMenu: ComponentDef = {
  name: 'Breadcrumb Menu',
  slug: 'breadcrumb-menu',
  tag: 'arc-breadcrumb-menu',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Each breadcrumb segment doubles as a dropdown showing sibling pages at that hierarchy level. Dropdown panels match dropdown-menu styling.',

  overview: `BreadcrumbMenu extends the standard breadcrumb pattern by turning each segment into a clickable dropdown trigger. When a user hovers or clicks a segment, a dropdown panel appears listing sibling pages at that hierarchy level — giving users the ability to navigate laterally within any tier of the information architecture without backtracking to a parent page first. The dropdown panels use the same styling as DropdownMenu for visual consistency across the design system.

This pattern is common in file managers, CMS interfaces, and documentation sites where the hierarchy is deep and users frequently need to switch between sibling items at the same depth. Instead of navigating up to a parent and then back down to a sibling, BreadcrumbMenu provides a direct shortcut that saves clicks and preserves context.

Each item in the \`items\` array can optionally include a \`siblings\` array. When siblings are present, the segment renders a dropdown trigger with a subtle chevron indicator. When siblings are absent, the segment behaves as a standard breadcrumb link. The component dispatches \`arc-navigate\` with the selected href whenever a dropdown item or breadcrumb link is clicked, enabling client-side routing integration.`,

  features: [
    'Breadcrumb segments double as dropdown triggers for sibling navigation',
    'Dropdown panels match DropdownMenu styling for consistency',
    'Optional siblings array per breadcrumb item',
    'arc-navigate event for client-side routing integration',
    'Hover and click trigger modes for mouse and touch devices',
    'Keyboard accessible with arrow keys within dropdowns',
    'Chevron indicator on segments that have sibling options',
    'Automatic Escape-to-close and outside-click dismissal',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Provide siblings arrays for levels where lateral navigation is useful',
      'Keep sibling lists to ten items or fewer per dropdown',
      'Use BreadcrumbMenu in file managers, CMS interfaces, and documentation hubs',
      'Listen for arc-navigate to integrate with your client-side router',
      'Highlight the current page in the siblings list for orientation',
    ],
    dont: [
      'Add siblings to every level — only include them where lateral navigation is meaningful',
      'Use BreadcrumbMenu when the hierarchy is flat (two levels or fewer) — use Breadcrumb instead',
      'Nest dropdown panels within dropdown panels — keep it to one level of expansion',
      'Omit the href on the final breadcrumb segment — it should link to the current page',
      'Replace primary navigation (TopBar, Sidebar) with BreadcrumbMenu — it is a secondary aid',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:480px;padding:var(--space-lg);padding-bottom:100px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
  <arc-breadcrumb-menu items='[{"label":"Home","href":"/"},{"label":"Products","href":"/products","siblings":[{"label":"Solutions","href":"/solutions"},{"label":"Pricing","href":"/pricing"}]},{"label":"Analytics","href":"/products/analytics"}]'></arc-breadcrumb-menu>
</div>`,

  props: [
    { name: 'items', type: 'Array<{ label, href, siblings? }>', default: '[]', description: 'Array of breadcrumb items. Each item has a label and href. Optionally include a siblings array to enable a dropdown at that level.' },
  ],
  events: [
    { name: 'arc-navigate', description: 'Fired when a breadcrumb link or dropdown item is clicked with detail: { href }.' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-breadcrumb-menu
  id="crumbs"
  items='[
    { "label": "Home", "href": "/" },
    { "label": "Products", "href": "/products", "siblings": [
      { "label": "Solutions", "href": "/solutions" },
      { "label": "Pricing", "href": "/pricing" }
    ]},
    { "label": "Analytics", "href": "/products/analytics" }
  ]'
></arc-breadcrumb-menu>

<script>
  document.querySelector('#crumbs').addEventListener('arc-navigate', (e) => {
    console.log('navigate to:', e.detail.href);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { BreadcrumbMenu } from '@arclux/arc-ui-react';

const items = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    href: '/products',
    siblings: [
      { label: 'Solutions', href: '/solutions' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  { label: 'Analytics', href: '/products/analytics' },
];

export function PageBreadcrumbs() {
  return (
    <BreadcrumbMenu
      items={items}
      onArcNavigate={(e) => console.log('navigate:', e.detail.href)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { BreadcrumbMenu } from '@arclux/arc-ui-vue';

const items = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    href: '/products',
    siblings: [
      { label: 'Solutions', href: '/solutions' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  { label: 'Analytics', href: '/products/analytics' },
];

function onNavigate(e) {
  console.log('navigate:', e.detail.href);
}
</script>

<template>
  <BreadcrumbMenu :items="items" @arc-navigate="onNavigate" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { BreadcrumbMenu } from '@arclux/arc-ui-svelte';

  const items = [
    { label: 'Home', href: '/' },
    {
      label: 'Products',
      href: '/products',
      siblings: [
        { label: 'Solutions', href: '/solutions' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
    { label: 'Analytics', href: '/products/analytics' },
  ];
</script>

<BreadcrumbMenu
  {items}
  on:arc-navigate={(e) => console.log('navigate:', e.detail.href)}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { BreadcrumbMenu } from '@arclux/arc-ui-angular';

@Component({
  imports: [BreadcrumbMenu],
  template: \`
    <BreadcrumbMenu
      [items]="items"
      (arc-navigate)="onNavigate($event)"
    />
  \`,
})
export class PageBreadcrumbsComponent {
  items = [
    { label: 'Home', href: '/' },
    {
      label: 'Products',
      href: '/products',
      siblings: [
        { label: 'Solutions', href: '/solutions' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
    { label: 'Analytics', href: '/products/analytics' },
  ];

  onNavigate(e: CustomEvent) {
    console.log('navigate:', e.detail.href);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { BreadcrumbMenu } from '@arclux/arc-ui-solid';

const items = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    href: '/products',
    siblings: [
      { label: 'Solutions', href: '/solutions' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  { label: 'Analytics', href: '/products/analytics' },
];

export function PageBreadcrumbs() {
  return (
    <BreadcrumbMenu
      items={items}
      onArcNavigate={(e) => console.log('navigate:', e.detail.href)}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { BreadcrumbMenu } from '@arclux/arc-ui-preact';

const items = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    href: '/products',
    siblings: [
      { label: 'Solutions', href: '/solutions' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  { label: 'Analytics', href: '/products/analytics' },
];

export function PageBreadcrumbs() {
  return (
    <BreadcrumbMenu
      items={items}
      onArcNavigate={(e) => console.log('navigate:', e.detail.href)}
    />
  );
}`,
    },
  ],

  seeAlso: ['breadcrumb', 'dropdown-menu', 'navigation-menu'],
};
