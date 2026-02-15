import type { ComponentDef } from './_types';

export const breadcrumb: ComponentDef = {
  name: 'Breadcrumb',
  slug: 'breadcrumb',
  tag: 'arc-breadcrumb',
  tier: 'navigation',
  interactivity: 'hybrid',
  description: 'Wayfinding navigation trail that shows the user their current location within a hierarchical page structure, with separator icons and current-page indication.',

  overview: `Breadcrumbs are a secondary navigation pattern that reveals the user's position inside a site hierarchy. Each crumb is a clickable link back to a parent page, separated by a visual divider, with the final crumb representing the current page. This lets users orient themselves at a glance and jump several levels up without repeatedly hitting the browser back button.

The component renders a \`<nav>\` landmark with \`aria-label="Breadcrumb"\` and marks the last item with \`aria-current="page"\`, following the WAI-ARIA Breadcrumb pattern. Separator characters are injected automatically and hidden from assistive technology with \`aria-hidden="true"\`, so screen readers announce the trail as a clean list of links rather than reading out each slash or chevron.

Breadcrumbs work best alongside a primary navigation element like a sidebar or top bar. They do not replace top-level navigation; instead they complement it by answering the question "where am I?" after the user has drilled into a deep page. In applications with flat information architecture (fewer than two levels), breadcrumbs add clutter without value and should be omitted.`,

  features: [
    'Automatic separator icons inserted between crumb items -- no manual markup needed',
    'Current-page indication via `aria-current="page"` on the last item with distinct font weight',
    'Fires `arc-navigate` custom event on crumb click, enabling SPA-friendly routing without full page reloads',
    'Wraps gracefully on narrow viewports using flex-wrap so long trails never overflow',
    'Renders a semantic `<nav>` landmark with `aria-label="Breadcrumb"` for assistive technology',
    'Separator characters hidden from screen readers with `aria-hidden="true"`',
    'Focus-visible ring on each link for keyboard-only users',
    'Declarative slotted API -- compose `<arc-breadcrumb-item>` children in any template language',
    'CSS custom-property theming for text color, separator color, and spacing via design tokens',
  ],

  guidelines: {
    do: [
      'Place breadcrumbs near the top of the page, above the main content heading, so users see their location before engaging with page content.',
      'Always include the root page (e.g. "Dashboard" or "Home") as the first crumb to anchor the trail.',
      'Keep crumb labels short -- one or two words that match the actual page title so users can predict where each link goes.',
      'Use breadcrumbs in apps with three or more levels of hierarchy where users frequently navigate between depths.',
      'Listen for the `arc-navigate` event to handle route changes in single-page applications instead of relying on full page navigations.',
    ],
    dont: [
      'Do not use breadcrumbs as a replacement for primary navigation; they are a supplementary wayfinding aid.',
      'Avoid making the current (last) crumb a clickable link -- it represents the page the user is already on.',
      'Do not show breadcrumbs on top-level pages with no parent; a single crumb provides no navigational value.',
      'Avoid duplicating breadcrumbs and a back button in the same spot -- pick one pattern to reduce visual noise.',
      'Do not include more than five or six levels in a single trail; deep trails signal an overly nested information architecture that should be simplified.',
    ],
  },

  previewHtml: `<div style="width:100%">
  <arc-breadcrumb>
    <arc-breadcrumb-item href="/dashboard">Dashboard</arc-breadcrumb-item>
    <arc-breadcrumb-item href="/dashboard/projects">Projects</arc-breadcrumb-item>
    <arc-breadcrumb-item href="/dashboard/projects/arc-ui">ARC UI</arc-breadcrumb-item>
    <arc-breadcrumb-item>Settings</arc-breadcrumb-item>
  </arc-breadcrumb>
</div>`,

  props: [
    { name: 'separator', type: 'string', default: "'/'", description: "Character used as the separator between breadcrumb items. Common options: '/', '>', '•'." },
  ],
  events: [
    { name: 'arc-navigate', description: 'Fired when a breadcrumb item is clicked' },
  ],

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

<Breadcrumb>
  <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
  <BreadcrumbItem href="/dashboard/projects">Projects</BreadcrumbItem>
  <BreadcrumbItem href="/dashboard/projects/arc-ui">ARC UI</BreadcrumbItem>
  <BreadcrumbItem>Settings</BreadcrumbItem>
</Breadcrumb>`,
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
    <Breadcrumb>
      <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
      <BreadcrumbItem href="/dashboard/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/dashboard/projects/arc-ui">ARC UI</BreadcrumbItem>
      <BreadcrumbItem>Settings</BreadcrumbItem>
    </Breadcrumb>
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
      description: 'An individual crumb inside a Breadcrumb trail. Each item represents one level of the page hierarchy. Items with an `href` render as clickable links; the item without an `href` (typically the last one) is treated as the current page and displayed with stronger visual weight.',
      props: [
        { name: 'href', type: 'string', description: 'Navigation URL for this crumb. When provided, the crumb renders as a clickable link styled in muted text that brightens on hover. Omit this property on the final item to mark it as the current page -- it will receive `aria-current="page"` and a bolder font weight automatically.' },
      ],
    },
  ],

  seeAlso: ["pagination","navigation-menu","link"],
};
