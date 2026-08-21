import type { ComponentDef } from './_types';

export const sidebar: ComponentDef = {
  name: 'Sidebar',
  slug: 'sidebar',
  tag: 'arc-sidebar',
  tier: 'navigation',
  interactivity: 'hybrid',
  description:
    'Collapsible navigation sidebar with grouped sections, heading labels, and active link highlighting. Ideal for documentation sites, admin panels, and any layout that needs persistent vertical navigation.',

  overview: `Sidebar provides a structured vertical navigation panel that organizes links into collapsible, headed sections. It is the standard way to present multi-level navigation in documentation sites, admin dashboards, settings panels, and any application where the user needs to move between many related pages without losing context.

Each SidebarSection groups links under an optional heading, creating a clear visual hierarchy that mirrors your information architecture. The active prop on SidebarLink highlights the current page, giving users an immediate sense of where they are within the navigation tree. An \`icon\` on a section renders before its heading.

**Collapsing is opt-in and has an imperative half.** A section is a static group until you set \`collapsible\`, which turns its heading into a toggle button; \`open\` then controls whether the links are showing, and defaults to expanded (\`no-open\` starts it collapsed). Either state change fires \`arc-toggle\` with \`{ open }\` in the detail. You can drive it from script with \`section.toggle()\` — which is how you expand the section containing the current route on load, or collapse everything but one. It fires the same event the header does, so a listener sees both paths identically. Note that it is a deliberate no-op on a section without \`collapsible\`: a section whose header offers no way back would otherwise be collapsible from script into a state the user cannot undo.

Sidebar is designed to sit inside an AppShell or PageLayout, typically occupying the left rail. It reads the full viewport height by default and scrolls independently of the main content area, so deep navigation trees remain accessible even on long pages. Pair it with TopBar for a complete application chrome.`,

  features: [
    'Collapsible sections with heading labels for grouped navigation',
    '`toggle()` on a section expands or collapses it from script, firing `arc-toggle` exactly as the header does',
    '`arc-toggle` carries `{ open }` and bubbles, so one listener on the sidebar covers every section',
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
      'Call `toggle()` on the section holding the active route at page load, so a deep link arrives with its group already open',
      'Keep section headings short — one to three words that name the category',
      'Place the Sidebar inside an AppShell or PageLayout for consistent layout',
      'Use a Drawer to present the Sidebar on narrow viewports',
      'Order sections by importance or frequency of use, most common first',
    ],
    dont: [
      'Do not nest Sidebars inside each other — use sections and indentation instead',
      'Do not mark more than one link as active at the same time',
      'Do not expect `toggle()` to do anything on a section without `collapsible` — it deliberately no-ops rather than hiding links behind a header that cannot bring them back',
      'Do not use Sidebar for top-level site-wide navigation — prefer TopBar for that role',
      'Do not add more than eight to ten links per section; split large groups into sub-sections',
      'Do not omit headings on sections — unlabeled groups make navigation harder to scan',
      'Do not place actions (buttons, toggles) inside the Sidebar — it is for navigation links only',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:300px;height:280px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-sidebar label="Example sidebar" active="#theming" glow style="position:static;height:100%">
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
    </arc-sidebar>
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
      description:
        'A collapsible group within a Sidebar. Each section renders an optional heading label above its child links, creating a visual and semantic grouping that mirrors your information architecture. Fires an `arc-toggle` event with `{ open }` detail when the section is expanded or collapsed.',
    },
    {
      name: 'SidebarLink',
      tag: 'arc-sidebar-link',
      description:
        'A navigation link rendered inside a SidebarSection. Supports an active state to indicate the current page and provides focus-visible styling for keyboard navigation.',
    },
  ],

  seeAlso: ['navigation-menu', 'drawer', 'app-shell', 'top-bar'],
};
