import type { ComponentDef } from './_types';

export const breadcrumbMenu: ComponentDef = {
  name: 'Breadcrumb Menu',
  slug: 'breadcrumb-menu',
  tag: 'arc-breadcrumb-menu',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'Each breadcrumb segment doubles as a dropdown showing sibling pages at that hierarchy level. Dropdown panels match dropdown-menu styling.',

  overview: `BreadcrumbMenu is a breadcrumb trail where a segment can open a dropdown of its sibling pages, so users can move sideways at any level without going up to the parent first. It's for deep hierarchies where people switch between items at the same depth, like file managers, CMS interfaces and documentation sites. The dropdowns use DropdownMenu's styling.

Give an item in \`items\` a \`siblings\` array and its segment becomes a button with a chevron that opens the dropdown on click. Without \`siblings\`, the segment is a plain crumb. A segment with siblings only opens its dropdown, so its own \`href\` is never used.

Segments and dropdown items are buttons, not links. Clicking one fires \`arc-navigate\` with \`{ href }\` and does nothing else, so you need a listener that does the navigation. Tab and Enter reach every button. A click outside closes an open dropdown. There are no arrow keys and no Escape to close.`,

  features: [
    'The last segment gets `aria-current="page"`',
  ],

  guidelines: {
    do: [
      'Listen for arc-navigate and hand the href to your router',
      'Add siblings only at levels where moving sideways is useful',
      'Keep each sibling list to ten items or fewer',
      'Mark the current page in the sibling list',
    ],
    dont: [
      'Don\'t use it for a flat hierarchy (two levels or fewer). Use Breadcrumb',
      'Don\'t use it in place of TopBar or Sidebar navigation',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:480px;padding:var(--space-lg);padding-bottom:100px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
  <arc-breadcrumb-menu label="Example breadcrumb" items='[{"label":"Home","href":"/"},{"label":"Products","href":"/products","siblings":[{"label":"Solutions","href":"/solutions"},{"label":"Pricing","href":"/pricing"}]},{"label":"Analytics","href":"/products/analytics"}]'></arc-breadcrumb-menu>
</div>`,

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
    <arc-breadcrumb-menu
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
