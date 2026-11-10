import type { ComponentDef } from './_types';

export const sidebar: ComponentDef = {
  name: 'Sidebar',
  slug: 'sidebar',
  tag: 'arc-sidebar',
  tier: 'navigation',
  interactivity: 'hybrid',
  description:
    'Vertical navigation with grouped, optionally collapsible sections and a highlighted active link. For docs sites, admin panels and other layouts with a persistent side nav.',

  overview: `Sidebar is a vertical list of links grouped into SidebarSections. Use it when people move between many related pages, as in documentation or an admin dashboard. Each section can have a \`heading\` and an \`icon\` before it. Set \`active\` on the SidebarLink for the current page to highlight it.

A section is a static group until you set \`collapsible\`, which turns its heading into a toggle button. \`open\` then controls whether the links are showing, and defaults to expanded (\`no-open\` starts it collapsed). Either state change fires \`arc-toggle\` with \`{ open }\` in the detail. You can drive it from script with \`section.toggle()\`, which is how you expand the section containing the current route on load, or collapse everything but one. It fires the same event the header does, so a listener sees both paths identically. It is a no-op on a section without \`collapsible\`: a section whose header offers no way back would otherwise be collapsible from script into a state the user cannot undo.

Put Sidebar in the left column of an AppShell or PageLayout, with TopBar above. It sticks below the top bar, fills the viewport height under it, and scrolls on its own, so a long link list stays reachable on a long page.`,

  features: [
    '`toggle()` on a section expands or collapses it from script, firing `arc-toggle` exactly as the header does',
    '`arc-toggle` carries `{ open }` and bubbles, so one listener on the sidebar covers every section',
    'Focus-visible ring on every link',
    'Only `arc-sidebar-link` children of a section are rendered',
  ],

  guidelines: {
    do: [
      'Give every section a short heading, one to three words that name the group',
      'Set `active` on the link that matches the current route, and on only one link',
      'Call `toggle()` on the section holding the active route at page load, so a deep link arrives with its group already open',
      'Show the Sidebar in a Drawer on narrow viewports',
      'Put the most-used sections first',
    ],
    dont: [
      'Don\'t nest Sidebars. Use sections, and the link `level` attribute for indentation',
      'Don\'t use it for top-level, site-wide navigation. Use TopBar',
      'Don\'t put more than eight to ten links in a section. Split it',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:300px;height:280px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-sidebar label="Example sidebar" active="#theming" glow style="position:static;height:100%">
    <arc-sidebar-section heading="Guide">
      <arc-sidebar-link href="#getting-started">Getting started</arc-sidebar-link>
      <arc-sidebar-link href="#tokens">Design tokens</arc-sidebar-link>
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
        'A group of links in a Sidebar, with an optional heading. With `collapsible`, the heading is a toggle and `arc-toggle` fires with `{ open }` when the section opens or closes.',
    },
    {
      name: 'SidebarLink',
      tag: 'arc-sidebar-link',
      description:
        'One link in a SidebarSection. `active` marks it as the current page.',
    },
  ],

  seeAlso: ['navigation-menu', 'drawer', 'app-shell', 'top-bar'],
};
