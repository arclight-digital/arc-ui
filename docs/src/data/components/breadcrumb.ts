import type { ComponentDef } from './_types';

export const breadcrumb: ComponentDef = {
  name: 'Breadcrumb',
  slug: 'breadcrumb',
  tag: 'arc-breadcrumb',
  tier: 'navigation',
  interactivity: 'hybrid',
  description:
    'A trail of links from the site root down to the current page.',

  overview: `Breadcrumb shows where the current page sits in the site's hierarchy. Each crumb links to a parent page, and the last crumb is the current page, so users can jump several levels up without pressing Back. Use it next to a sidebar or top bar, not in place of one.

Write the trail as \`<arc-breadcrumb-item>\` children. The component renders a \`<nav>\` with \`aria-label="Breadcrumb"\` (change it with \`label\`) and gives the last crumb \`aria-current="page"\`. The \`separator\` character (default \`/\`) goes between crumbs and is hidden from screen readers. The crumbs aren't in an \`<ol>\` as the WAI-ARIA Breadcrumb pattern has them, so screen readers don't announce them as a list.

Crumbs with an \`href\` render as ordinary \`<a>\` links. \`arc-navigate\` fires only from a crumb before the last that has no \`href\`, which renders as a button.`,

  features: [
    'The current crumb is set apart by color alone: primary text against the muted links',
    'Long trails wrap onto a second line on narrow screens',
  ],

  guidelines: {
    do: [
      'Put the trail near the top of the page, above the main heading',
      'Start with the root page ("Dashboard" or "Home")',
      'Keep crumb labels to one or two words that match the page titles',
      'Use breadcrumbs in apps with three or more levels',
    ],
    dont: [
      'Don\'t make the last crumb a link. It is the page the user is already on',
      'Don\'t show a trail on a top-level page. One crumb tells the user nothing',
      'Don\'t put breadcrumbs and a back button in the same spot. Pick one',
      'Don\'t go past five or six levels. A trail that deep means the site is nested too far',
    ],
  },

  previewHtml: `<div style="width:100%">
  <arc-breadcrumb label="Example breadcrumb">
    <arc-breadcrumb-item href="/dashboard">Dashboard</arc-breadcrumb-item>
    <arc-breadcrumb-item href="/dashboard/projects">Projects</arc-breadcrumb-item>
    <arc-breadcrumb-item href="/dashboard/projects/arc-ui">ARC UI</arc-breadcrumb-item>
    <arc-breadcrumb-item>Settings</arc-breadcrumb-item>
  </arc-breadcrumb>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-breadcrumb>
  <arc-breadcrumb-item href="/dashboard">Dashboard</arc-breadcrumb-item>
  <arc-breadcrumb-item href="/dashboard/projects">Projects</arc-breadcrumb-item>
  <arc-breadcrumb-item href="/dashboard/projects/arc-ui">ARC UI</arc-breadcrumb-item>
  <arc-breadcrumb-item>Settings</arc-breadcrumb-item>
</arc-breadcrumb>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Breadcrumb, BreadcrumbItem } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
      <BreadcrumbItem href="/dashboard/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/dashboard/projects/arc-ui">ARC UI</BreadcrumbItem>
      <BreadcrumbItem>Settings</BreadcrumbItem>
    </Breadcrumb>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Breadcrumb, BreadcrumbItem } from '@arclux/arc-ui-vue';
</script>

<template>
  <Breadcrumb>
    <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
    <BreadcrumbItem href="/dashboard/projects">Projects</BreadcrumbItem>
    <BreadcrumbItem href="/dashboard/projects/arc-ui">ARC UI</BreadcrumbItem>
    <BreadcrumbItem>Settings</BreadcrumbItem>
  </Breadcrumb>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Breadcrumb, BreadcrumbItem } from '@arclux/arc-ui-svelte';
</script>

<Breadcrumb>
  <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
  <BreadcrumbItem href="/dashboard/projects">Projects</BreadcrumbItem>
  <BreadcrumbItem href="/dashboard/projects/arc-ui">ARC UI</BreadcrumbItem>
  <BreadcrumbItem>Settings</BreadcrumbItem>
</Breadcrumb>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Breadcrumb, BreadcrumbItem } from '@arclux/arc-ui-angular';

@Component({
  imports: [Breadcrumb, BreadcrumbItem],
  template: \`
    <arc-breadcrumb>
      <arc-breadcrumb-item href="/dashboard">Dashboard</arc-breadcrumb-item>
      <arc-breadcrumb-item href="/dashboard/projects">Projects</arc-breadcrumb-item>
      <arc-breadcrumb-item href="/dashboard/projects/arc-ui">ARC UI</arc-breadcrumb-item>
      <arc-breadcrumb-item>Settings</arc-breadcrumb-item>
    </arc-breadcrumb>
  \`,
})
export class BreadcrumbDemoComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Breadcrumb, BreadcrumbItem } from '@arclux/arc-ui-solid';

export default function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
      <BreadcrumbItem href="/dashboard/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/dashboard/projects/arc-ui">ARC UI</BreadcrumbItem>
      <BreadcrumbItem>Settings</BreadcrumbItem>
    </Breadcrumb>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Breadcrumb, BreadcrumbItem } from '@arclux/arc-ui-preact';

export default function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
      <BreadcrumbItem href="/dashboard/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/dashboard/projects/arc-ui">ARC UI</BreadcrumbItem>
      <BreadcrumbItem>Settings</BreadcrumbItem>
    </Breadcrumb>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<arc-breadcrumb>
  <arc-breadcrumb-item href="/dashboard">Dashboard</arc-breadcrumb-item>
  <arc-breadcrumb-item href="/dashboard/projects">Projects</arc-breadcrumb-item>
  <arc-breadcrumb-item href="/dashboard/projects/arc-ui">ARC UI</arc-breadcrumb-item>
  <arc-breadcrumb-item>Settings</arc-breadcrumb-item>
</arc-breadcrumb>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- arc-breadcrumb is hybrid — CSS handles layout, JS enhances interactivity -->
<arc-breadcrumb></arc-breadcrumb>`,
    },
  ],

  subComponents: [
    {
      name: 'BreadcrumbItem',
      tag: 'arc-breadcrumb-item',
      description:
        'One crumb in a Breadcrumb trail. An item with an `href` renders as a link. The last item is always the current page, shown in the primary text color.',
    },
  ],

  seeAlso: ['pagination', 'navigation-menu', 'link'],
};
