import type { ComponentDef } from './_types';

export const sidebar: ComponentDef = {
    name: 'Sidebar',
    slug: 'sidebar',
    tag: 'arc-sidebar',
    tier: 'navigation',
    interactivity: 'hybrid',
    description: 'Collapsible navigation sidebar with grouped sections, heading labels, and active link highlighting. Ideal for documentation sites, admin panels, and any layout that needs persistent vertical navigation.',

    overview: `Sidebar provides a structured vertical navigation panel that organises links into collapsible, headed sections. It is the standard way to present multi-level navigation in documentation sites, admin dashboards, settings panels, and any application where the user needs to move between many related pages without losing context.

Each SidebarSection groups links under an optional heading, creating a clear visual hierarchy that mirrors your information architecture. The active prop on SidebarLink highlights the current page, giving users an immediate sense of where they are within the navigation tree. Sections can be expanded or collapsed to keep long navigation lists manageable.

Sidebar is designed to sit inside an AppShell or PageLayout, typically occupying the left rail. It reads the full viewport height by default and scrolls independently of the main content area, so deep navigation trees remain accessible even on long pages. Pair it with TopBar for a complete application chrome.`,

    features: [
      'Collapsible sections with heading labels for grouped navigation',
      'Active link highlighting to indicate the current page',
      'Independent scroll region for deep navigation trees',
      'Composable with SidebarSection and SidebarLink sub-components',
      'Keyboard navigable with focus-visible indicators on every link',
      'Designed to integrate with AppShell and PageLayout for full-page chrome',
      'Responsive-ready — pairs with Drawer for mobile breakpoints',
      'Token-driven theming for background, border, and active-link colors',
    ],

    guidelines: {
      do: [
        'Group related links under a SidebarSection with a descriptive heading',
        'Set the active prop on the link that matches the current route',
        'Keep section headings short — one to three words that name the category',
        'Place the Sidebar inside an AppShell or PageLayout for consistent layout',
        'Use a Drawer to present the Sidebar on narrow viewports',
        'Order sections by importance or frequency of use, most common first',
      ],
      dont: [
        'Nest Sidebars inside each other — use sections and indentation instead',
        'Mark more than one link as active at the same time',
        'Use Sidebar for top-level site-wide navigation — prefer TopBar for that role',
        'Add more than eight to ten links per section; split large groups into sub-sections',
        'Omit headings on sections — unlabelled groups make navigation harder to scan',
        'Place actions (buttons, toggles) inside the Sidebar — it is for navigation links only',
      ],
    },

    previewHtml: `<div style="width:100%;max-width:300px;height:280px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-sidebar active="#theming" glow style="position:static;height:100%">
    <arc-sidebar-section heading="Guide">
      <arc-sidebar-link href="#getting-started">Getting Started</arc-sidebar-link>
      <arc-sidebar-link href="#tokens">Design Tokens</arc-sidebar-link>
      <arc-sidebar-link href="#theming">Theming</arc-sidebar-link>
    </arc-sidebar-section>
    <arc-sidebar-section heading="Components" collapsible open>
      <arc-sidebar-link href="#button">Button</arc-sidebar-link>
      <arc-sidebar-link href="#card">Card</arc-sidebar-link>
      <arc-sidebar-link href="#modal">Modal</arc-sidebar-link>
    </arc-sidebar-section>
    <arc-sidebar-section heading="Feedback" collapsible>
      <arc-sidebar-link href="#alert">Alert</arc-sidebar-link>
      <arc-sidebar-link href="#toast">Toast</arc-sidebar-link>
    </arc-sidebar-section>
  </arc-sidebar>
</div>`,

    props: [
      { name: 'position', type: 'string', default: "'left'", description: "Controls which side the sidebar appears on. Options: 'left', 'right'. Moves the border line to the opposite edge." },
      { name: 'active', type: 'string', default: "''", description: 'The href of the currently active sidebar link. Used to highlight the matching link with accent styling.' },
      { name: 'collapsed', type: 'boolean', default: 'false', description: 'When true, collapses the sidebar to icon-only mode, hiding labels and reducing width.' },
      { name: 'width', type: 'string', default: "'280px'", description: 'Width of the sidebar. Accepts any CSS length value.' },
      { name: 'glow', type: 'boolean', default: 'false', description: 'Enables an accent glow effect on the active sidebar link for enhanced visual emphasis.' },
    ],
    events: [
      { name: 'arc-navigate', description: 'Fired when a sidebar link is clicked' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-sidebar>
  <arc-sidebar-section heading="Guide">
    <arc-sidebar-link href="/docs/getting-started">Getting Started</arc-sidebar-link>
    <arc-sidebar-link href="/docs/tokens">Design Tokens</arc-sidebar-link>
    <arc-sidebar-link href="/docs/theming" active>Theming</arc-sidebar-link>
  </arc-sidebar-section>
  <arc-sidebar-section heading="Components">
    <arc-sidebar-link href="/docs/components/button">Button</arc-sidebar-link>
    <arc-sidebar-link href="/docs/components/card">Card</arc-sidebar-link>
    <arc-sidebar-link href="/docs/components/modal">Modal</arc-sidebar-link>
  </arc-sidebar-section>
</arc-sidebar>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Sidebar, SidebarSection, SidebarLink } from '@arclux/arc-ui-react';

export function DocsSidebar() {
  return (
    <Sidebar>
      <SidebarSection heading="Guide">
        <SidebarLink href="/docs/getting-started">Getting Started</SidebarLink>
        <SidebarLink href="/docs/tokens">Design Tokens</SidebarLink>
        <SidebarLink href="/docs/theming" active>Theming</SidebarLink>
      </SidebarSection>
      <SidebarSection heading="Components">
        <SidebarLink href="/docs/components/button">Button</SidebarLink>
        <SidebarLink href="/docs/components/card">Card</SidebarLink>
        <SidebarLink href="/docs/components/modal">Modal</SidebarLink>
      </SidebarSection>
    </Sidebar>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Sidebar, SidebarSection, SidebarLink } from '@arclux/arc-ui-vue';
</script>

<template>
  <Sidebar>
    <SidebarSection heading="Guide">
      <SidebarLink href="/docs/getting-started">Getting Started</SidebarLink>
      <SidebarLink href="/docs/tokens">Design Tokens</SidebarLink>
      <SidebarLink href="/docs/theming" active>Theming</SidebarLink>
    </SidebarSection>
    <SidebarSection heading="Components">
      <SidebarLink href="/docs/components/button">Button</SidebarLink>
      <SidebarLink href="/docs/components/card">Card</SidebarLink>
      <SidebarLink href="/docs/components/modal">Modal</SidebarLink>
    </SidebarSection>
  </Sidebar>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Sidebar, SidebarSection, SidebarLink } from '@arclux/arc-ui-svelte';
</script>

<Sidebar>
  <SidebarSection heading="Guide">
    <SidebarLink href="/docs/getting-started">Getting Started</SidebarLink>
    <SidebarLink href="/docs/tokens">Design Tokens</SidebarLink>
    <SidebarLink href="/docs/theming" active>Theming</SidebarLink>
  </SidebarSection>
  <SidebarSection heading="Components">
    <SidebarLink href="/docs/components/button">Button</SidebarLink>
    <SidebarLink href="/docs/components/card">Card</SidebarLink>
    <SidebarLink href="/docs/components/modal">Modal</SidebarLink>
  </SidebarSection>
</Sidebar>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Sidebar, SidebarSection, SidebarLink } from '@arclux/arc-ui-angular';

@Component({
  imports: [Sidebar, SidebarSection, SidebarLink],
  template: \`
    <Sidebar>
      <SidebarSection heading="Guide">
        <SidebarLink href="/docs/getting-started">Getting Started</SidebarLink>
        <SidebarLink href="/docs/tokens">Design Tokens</SidebarLink>
        <SidebarLink href="/docs/theming" active>Theming</SidebarLink>
      </SidebarSection>
      <SidebarSection heading="Components">
        <SidebarLink href="/docs/components/button">Button</SidebarLink>
        <SidebarLink href="/docs/components/card">Card</SidebarLink>
        <SidebarLink href="/docs/components/modal">Modal</SidebarLink>
      </SidebarSection>
    </Sidebar>
  \`,
})
export class DocsSidebarComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Sidebar, SidebarSection, SidebarLink } from '@arclux/arc-ui-solid';

export function DocsSidebar() {
  return (
    <Sidebar>
      <SidebarSection heading="Guide">
        <SidebarLink href="/docs/getting-started">Getting Started</SidebarLink>
        <SidebarLink href="/docs/tokens">Design Tokens</SidebarLink>
        <SidebarLink href="/docs/theming" active>Theming</SidebarLink>
      </SidebarSection>
      <SidebarSection heading="Components">
        <SidebarLink href="/docs/components/button">Button</SidebarLink>
        <SidebarLink href="/docs/components/card">Card</SidebarLink>
        <SidebarLink href="/docs/components/modal">Modal</SidebarLink>
      </SidebarSection>
    </Sidebar>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Sidebar, SidebarSection, SidebarLink } from '@arclux/arc-ui-preact';

export function DocsSidebar() {
  return (
    <Sidebar>
      <SidebarSection heading="Guide">
        <SidebarLink href="/docs/getting-started">Getting Started</SidebarLink>
        <SidebarLink href="/docs/tokens">Design Tokens</SidebarLink>
        <SidebarLink href="/docs/theming" active>Theming</SidebarLink>
      </SidebarSection>
      <SidebarSection heading="Components">
        <SidebarLink href="/docs/components/button">Button</SidebarLink>
        <SidebarLink href="/docs/components/card">Card</SidebarLink>
        <SidebarLink href="/docs/components/modal">Modal</SidebarLink>
      </SidebarSection>
    </Sidebar>
  );
}`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<arc-sidebar>
  <arc-sidebar-section heading="Guide">
    <arc-sidebar-link href="/docs/getting-started">Getting Started</arc-sidebar-link>
    <arc-sidebar-link href="/docs/tokens">Design Tokens</arc-sidebar-link>
    <arc-sidebar-link href="/docs/theming" active>Theming</arc-sidebar-link>
  </arc-sidebar-section>
  <arc-sidebar-section heading="Components">
    <arc-sidebar-link href="/docs/components/button">Button</arc-sidebar-link>
    <arc-sidebar-link href="/docs/components/card">Card</arc-sidebar-link>
    <arc-sidebar-link href="/docs/components/modal">Modal</arc-sidebar-link>
  </arc-sidebar-section>
</arc-sidebar>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- arc-sidebar is hybrid — CSS handles layout, JS enhances interactivity -->
<arc-sidebar></arc-sidebar>`,
      },
    ],
    subComponents: [
      {
        name: 'SidebarSection',
        tag: 'arc-sidebar-section',
        description: 'A collapsible group within a Sidebar. Each section renders an optional heading label above its child links, creating a visual and semantic grouping that mirrors your information architecture. Fires an `arc-toggle` event with `{ open }` detail when the section is expanded or collapsed.',
        props: [
          { name: 'heading', type: 'string', description: 'Text label displayed above the group of links. Keep it short (one to three words) so the sidebar stays scannable. When omitted, links render without a heading divider.' },
          { name: 'collapsible', type: 'boolean', default: 'false', description: 'When true, the section heading becomes a toggle button that expands/collapses the child links.' },
          { name: 'open', type: 'boolean', default: 'true', description: 'Controls whether a collapsible section is expanded (true) or collapsed (false). Only relevant when collapsible is true.' },
        ],
        events: [
          { name: 'arc-toggle', description: 'Fired when a collapsible section is expanded or collapsed. Detail contains { open } indicating the new state.' },
        ],
      },
      {
        name: 'SidebarLink',
        tag: 'arc-sidebar-link',
        description: 'A navigation link rendered inside a SidebarSection. Supports an active state to indicate the current page and provides focus-visible styling for keyboard navigation.',
        props: [
          { name: 'href', type: 'string', description: 'Destination URL for the link. Can be an absolute path, relative path, or hash anchor. The link renders as a standard anchor element for full accessibility and SEO.' },
          { name: 'active', type: 'boolean', default: 'false', description: 'When true, applies a highlighted style (accent-colored text and a left-edge indicator) to signal that this link corresponds to the currently viewed page. Only one link should be active at a time.' },
          { name: 'level', type: 'number', default: '0', description: 'Nesting depth for visual indentation. Level 0 links render at default size; level 1+ links are indented and use a smaller font size.' },
        ],
      },
    ],
  
  seeAlso: ["navigation-menu","drawer","app-shell","top-bar"],
};
