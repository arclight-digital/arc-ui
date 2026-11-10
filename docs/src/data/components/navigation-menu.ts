import type { ComponentDef } from './_types';

const previewMarkup = `<arc-navigation-menu label="Example menu">
  <arc-nav-item>Products
    <arc-nav-item href="#" description="Real-time dashboards and metrics">Analytics</arc-nav-item>
    <arc-nav-item href="#" description="CI/CD pipelines and deployment">Automation</arc-nav-item>
    <arc-nav-item href="#" description="Role-based access and SSO">Security</arc-nav-item>
  </arc-nav-item>
  <arc-nav-item>Solutions
    <arc-nav-item href="#" description="Shared tooling for product teams">Engineering teams</arc-nav-item>
    <arc-nav-item href="#" description="Infrastructure and monitoring">Platform teams</arc-nav-item>
    <arc-nav-item href="#" description="Support plans and procurement">Enterprise</arc-nav-item>
  </arc-nav-item>
  <arc-nav-item href="#" variant="primary">Pricing</arc-nav-item>
  <arc-nav-item href="#">Docs</arc-nav-item>
  <arc-nav-item href="#" variant="muted">Blog</arc-nav-item>
  <arc-nav-item href="#" variant="muted" active>Changelog</arc-nav-item>
</arc-navigation-menu>`;

export const navigationMenu: ComponentDef = {
  name: 'Navigation Menu',
  slug: 'navigation-menu',
  tag: 'arc-navigation-menu',
  tier: 'navigation',
  interactivity: 'hybrid',
  description:
    'Horizontal navigation bar whose top-level items open dropdowns of links on hover or click. Each link can carry a one-line description.',

  overview: `Navigation Menu is a horizontal nav bar for a site header. Each top-level \`<arc-nav-item>\` is either a link or a parent whose nested items open in a dropdown on hover, or on click for touch screens and keyboards. Use it when a site has several sections (products, solutions, resources) and listing every link in the header would crowd it.

A dropdown item can have a \`description\`, shown as a line of text under its label. With descriptions it works as a mega-menu, and without them it's a plain list of links.

Triggers are buttons, so Enter or Space opens a dropdown, and Escape closes it and returns focus to its trigger. Triggers carry \`aria-expanded\` and \`aria-haspopup\`, and dropdowns use \`role="menu"\` and \`role="menuitem"\`. Following a link fires a cancelable \`arc-navigate\` event with the \`href\`, so a client-side router can call \`preventDefault()\` and handle the route itself.

When its container is 480px wide or narrower, the bar hides. The same items then open in a modal panel when a Top Bar with \`mobile-menu="nav"\` fires \`arc-mobile-menu-toggle\` from its menu button.`,

  features: [
    'Dropdowns fade and slide in',
    "A dropdown waits 150ms before closing when the pointer leaves, so moving from the trigger to the panel doesn't close it",
    '`active` on a NavItem gives it a tinted background, border and glow',
  ],

  guidelines: {
    do: [
      'Keep top-level items to five or fewer',
      'Add descriptions to dropdown items when a label needs context',
      'Make single-destination items like "Pricing" plain links with no dropdown',
      'Set `active` on the NavItem that matches the current route',
      'Put it inside a Top Bar or a sticky header',
    ],
    dont: [
      "Don't nest NavItems more than one level deep. A dropdown renders only its direct children",
      "Don't use it alongside a Sidebar in the same view. Pick one navigation pattern",
      "Don't use it for links within a page. Use ScrollSpy or Tabs",
      "Don't leave out `href` on leaf items",
      "Don't put more than six or seven items in one dropdown. Split them into more top-level categories",
    ],
  },

  previewHtml: `<div style="width:100%;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:var(--space-lg) 0;min-height:280px">
  ${previewMarkup}
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

${previewMarkup}`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { NavigationMenu, NavItem } from '@arclux/arc-ui-react';

export function SiteNav() {
  return (
    <NavigationMenu>
      <NavItem>Products
        <NavItem href="/analytics" description="Real-time dashboards and metrics">Analytics</NavItem>
        <NavItem href="/automation" description="CI/CD pipelines and deployment">Automation</NavItem>
        <NavItem href="/security" description="Role-based access and SSO">Security</NavItem>
      </NavItem>
      <NavItem>Solutions
        <NavItem href="/engineering" description="Shared tooling for product teams">Engineering teams</NavItem>
        <NavItem href="/platform" description="Infrastructure and monitoring">Platform teams</NavItem>
        <NavItem href="/enterprise" description="Support plans and procurement">Enterprise</NavItem>
      </NavItem>
      <NavItem href="/pricing">Pricing</NavItem>
      <NavItem href="/docs">Docs</NavItem>
    </NavigationMenu>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { NavigationMenu, NavItem } from '@arclux/arc-ui-vue';
</script>

<template>
  <NavigationMenu>
    <NavItem>Products
      <NavItem href="/analytics" description="Real-time dashboards and metrics">Analytics</NavItem>
      <NavItem href="/automation" description="CI/CD pipelines and deployment">Automation</NavItem>
      <NavItem href="/security" description="Role-based access and SSO">Security</NavItem>
    </NavItem>
    <NavItem>Solutions
      <NavItem href="/engineering" description="Shared tooling for product teams">Engineering teams</NavItem>
      <NavItem href="/platform" description="Infrastructure and monitoring">Platform teams</NavItem>
      <NavItem href="/enterprise" description="Support plans and procurement">Enterprise</NavItem>
    </NavItem>
    <NavItem href="/pricing">Pricing</NavItem>
    <NavItem href="/docs">Docs</NavItem>
  </NavigationMenu>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { NavigationMenu, NavItem } from '@arclux/arc-ui-svelte';
</script>

<NavigationMenu>
  <NavItem>Products
    <NavItem href="/analytics" description="Real-time dashboards and metrics">Analytics</NavItem>
    <NavItem href="/automation" description="CI/CD pipelines and deployment">Automation</NavItem>
    <NavItem href="/security" description="Role-based access and SSO">Security</NavItem>
  </NavItem>
  <NavItem>Solutions
    <NavItem href="/engineering" description="Shared tooling for product teams">Engineering teams</NavItem>
    <NavItem href="/platform" description="Infrastructure and monitoring">Platform teams</NavItem>
    <NavItem href="/enterprise" description="Support plans and procurement">Enterprise</NavItem>
  </NavItem>
  <NavItem href="/pricing">Pricing</NavItem>
  <NavItem href="/docs">Docs</NavItem>
</NavigationMenu>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { NavigationMenu, NavItem } from '@arclux/arc-ui-angular';

@Component({
  imports: [NavigationMenu, NavItem],
  template: \`
    <arc-navigation-menu>
      <arc-nav-item>Products
        <arc-nav-item description="Real-time dashboards and metrics"><a href="/analytics">Analytics</a></arc-nav-item>
        <arc-nav-item description="CI/CD pipelines and deployment"><a href="/automation">Automation</a></arc-nav-item>
        <arc-nav-item description="Role-based access and SSO"><a href="/security">Security</a></arc-nav-item>
      </arc-nav-item>
      <arc-nav-item>Solutions
        <arc-nav-item description="Ship faster with integrated tooling"><a href="/engineering">Engineering Teams</a></arc-nav-item>
        <arc-nav-item description="Unified observability stack"><a href="/platform">Platform Teams</a></arc-nav-item>
        <arc-nav-item description="SOC 2 and HIPAA compliance"><a href="/enterprise">Enterprise</a></arc-nav-item>
      </arc-nav-item>
      <arc-nav-item><a href="/pricing">Pricing</a></arc-nav-item>
      <arc-nav-item><a href="/docs">Docs</a></arc-nav-item>
    </arc-navigation-menu>
  \`,
})
export class SiteNavComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { NavigationMenu, NavItem } from '@arclux/arc-ui-solid';

export function SiteNav() {
  return (
    <NavigationMenu>
      <NavItem>Products
        <NavItem href="/analytics" description="Real-time dashboards and metrics">Analytics</NavItem>
        <NavItem href="/automation" description="CI/CD pipelines and deployment">Automation</NavItem>
        <NavItem href="/security" description="Role-based access and SSO">Security</NavItem>
      </NavItem>
      <NavItem>Solutions
        <NavItem href="/engineering" description="Shared tooling for product teams">Engineering teams</NavItem>
        <NavItem href="/platform" description="Infrastructure and monitoring">Platform teams</NavItem>
        <NavItem href="/enterprise" description="Support plans and procurement">Enterprise</NavItem>
      </NavItem>
      <NavItem href="/pricing">Pricing</NavItem>
      <NavItem href="/docs">Docs</NavItem>
    </NavigationMenu>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { NavigationMenu, NavItem } from '@arclux/arc-ui-preact';

export function SiteNav() {
  return (
    <NavigationMenu>
      <NavItem>Products
        <NavItem href="/analytics" description="Real-time dashboards and metrics">Analytics</NavItem>
        <NavItem href="/automation" description="CI/CD pipelines and deployment">Automation</NavItem>
        <NavItem href="/security" description="Role-based access and SSO">Security</NavItem>
      </NavItem>
      <NavItem>Solutions
        <NavItem href="/engineering" description="Shared tooling for product teams">Engineering teams</NavItem>
        <NavItem href="/platform" description="Infrastructure and monitoring">Platform teams</NavItem>
        <NavItem href="/enterprise" description="Support plans and procurement">Enterprise</NavItem>
      </NavItem>
      <NavItem href="/pricing">Pricing</NavItem>
      <NavItem href="/docs">Docs</NavItem>
    </NavigationMenu>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `${previewMarkup}`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- arc-navigation-menu is hybrid — CSS handles layout, JS enhances interactivity -->
<arc-navigation-menu></arc-navigation-menu>`,
    },
  ],
  subComponents: [
    {
      name: 'NavItem',
      tag: 'arc-nav-item',
      description:
        'One entry in a Navigation Menu. At the top level, a NavItem with NavItem children becomes a dropdown trigger, and one without children is a link.',
    },
  ],

  seeAlso: ['sidebar', 'top-bar', 'breadcrumb', 'tabs'],
};
