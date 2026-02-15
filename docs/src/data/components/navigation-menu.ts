import type { ComponentDef } from './_types';

const previewMarkup = `<arc-navigation-menu>
  <arc-nav-item>Products
    <arc-nav-item href="#" description="Real-time dashboards and metrics">Analytics</arc-nav-item>
    <arc-nav-item href="#" description="CI/CD pipelines and deployment">Automation</arc-nav-item>
    <arc-nav-item href="#" description="Role-based access and SSO">Security</arc-nav-item>
  </arc-nav-item>
  <arc-nav-item>Solutions
    <arc-nav-item href="#" description="Ship faster with integrated tooling">Engineering Teams</arc-nav-item>
    <arc-nav-item href="#" description="Unified observability stack">Platform Teams</arc-nav-item>
    <arc-nav-item href="#" description="SOC 2 and HIPAA compliance">Enterprise</arc-nav-item>
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
    description: 'Horizontal navigation bar with hover-triggered dropdown sub-menus and full keyboard accessibility. Designed for marketing sites, documentation hubs, and product landing pages where top-level sections expand into categorised link lists.',

    overview: `NavigationMenu is a horizontal nav bar that pairs top-level links with hover-triggered dropdown panels. It is the right choice whenever a site needs to expose multiple content categories — products, solutions, resources — without cluttering the header with dozens of links. Each top-level item can be a simple link or a parent that reveals a dropdown on hover (and on click for touch devices).

Dropdown items support an optional description line, turning each link into a mini feature card. This "mega-menu" pattern helps users scan a large information architecture at a glance rather than drilling through nested pages. Because descriptions are optional, the same component works for both rich marketing navs and lean documentation menus.

Keyboard support is built in from the start. Arrow keys move between top-level items, Enter and Space toggle dropdowns, and Escape closes any open panel and returns focus to the trigger. All ARIA attributes — \`aria-expanded\`, \`aria-haspopup\`, and \`role="menu"\` / \`role="menuitem"\` — are managed automatically. When a link is navigated, the component dispatches an \`arc-navigate\` custom event so frameworks can intercept client-side routing without full page reloads.`,

    features: [
      'Hover-triggered dropdowns with smooth fade-and-slide transition',
      'Click fallback for touch devices and assistive tech',
      'Keyboard navigation with Arrow, Enter, Space, and Escape keys',
      'Automatic ARIA attributes (aria-expanded, aria-haspopup, role="menu")',
      'Optional description text per dropdown item for mega-menu layouts',
      'Active state indicator via accent-coloured bottom border',
      'arc-navigate custom event for client-side routing integration',
      'Graceful close delay prevents accidental dismissal on mouse exit',
      'CSS custom-property theming via design tokens',
      'Shadow DOM encapsulation with ::part() hooks for targeted styling',
    ],

    guidelines: {
      do: [
        'Keep top-level items to five or fewer so the bar remains scannable',
        'Add description text to dropdown items when categories need extra context',
        'Use simple href links (no dropdown) for single-destination items like "Pricing"',
        'Set the active attribute on the NavItem that matches the current route',
        'Listen for the arc-navigate event to integrate with client-side routers',
        'Place NavigationMenu inside a TopBar or sticky header for consistent positioning',
      ],
      dont: [
        'Nest dropdowns more than one level deep — the component is flat by design',
        'Mix NavigationMenu and Sidebar in the same viewport; pick one navigation pattern',
        'Use NavigationMenu for in-page section links — use ScrollSpy or Tabs instead',
        'Omit href on leaf items; every clickable link should have a destination',
        'Add more than six or seven items per dropdown — group into separate top-level categories instead',
        'Rely on hover alone for critical paths; ensure click and keyboard access too',
      ],
    },

    previewHtml: `<div style="width:100%;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:var(--space-lg) 0;min-height:280px">
  ${previewMarkup}
</div>`,

    props: [],
    events: [
      { name: 'arc-navigate', description: 'Fired when a navigation item is selected' },
    ],

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
        <NavItem href="/engineering" description="Ship faster with integrated tooling">Engineering Teams</NavItem>
        <NavItem href="/platform" description="Unified observability stack">Platform Teams</NavItem>
        <NavItem href="/enterprise" description="SOC 2 and HIPAA compliance">Enterprise</NavItem>
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
      <NavItem href="/engineering" description="Ship faster with integrated tooling">Engineering Teams</NavItem>
      <NavItem href="/platform" description="Unified observability stack">Platform Teams</NavItem>
      <NavItem href="/enterprise" description="SOC 2 and HIPAA compliance">Enterprise</NavItem>
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
    <NavItem href="/engineering" description="Ship faster with integrated tooling">Engineering Teams</NavItem>
    <NavItem href="/platform" description="Unified observability stack">Platform Teams</NavItem>
    <NavItem href="/enterprise" description="SOC 2 and HIPAA compliance">Enterprise</NavItem>
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
    <NavigationMenu>
      <NavItem>Products
        <NavItem href="/analytics" description="Real-time dashboards and metrics">Analytics</NavItem>
        <NavItem href="/automation" description="CI/CD pipelines and deployment">Automation</NavItem>
        <NavItem href="/security" description="Role-based access and SSO">Security</NavItem>
      </NavItem>
      <NavItem>Solutions
        <NavItem href="/engineering" description="Ship faster with integrated tooling">Engineering Teams</NavItem>
        <NavItem href="/platform" description="Unified observability stack">Platform Teams</NavItem>
        <NavItem href="/enterprise" description="SOC 2 and HIPAA compliance">Enterprise</NavItem>
      </NavItem>
      <NavItem href="/pricing">Pricing</NavItem>
      <NavItem href="/docs">Docs</NavItem>
    </NavigationMenu>
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
        <NavItem href="/engineering" description="Ship faster with integrated tooling">Engineering Teams</NavItem>
        <NavItem href="/platform" description="Unified observability stack">Platform Teams</NavItem>
        <NavItem href="/enterprise" description="SOC 2 and HIPAA compliance">Enterprise</NavItem>
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
        <NavItem href="/engineering" description="Ship faster with integrated tooling">Engineering Teams</NavItem>
        <NavItem href="/platform" description="Unified observability stack">Platform Teams</NavItem>
        <NavItem href="/enterprise" description="SOC 2 and HIPAA compliance">Enterprise</NavItem>
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
        description: 'A single entry inside NavigationMenu. When used at the top level and containing nested NavItem children, it becomes a dropdown trigger. When used without children, it renders as a direct navigation link. Nest one level deep to populate a dropdown panel.',
        props: [
          {
            name: 'href',
            type: 'string',
            description: 'Destination URL for the nav item. Required for leaf items that navigate. Omit on parent items that serve only as dropdown triggers.',
          },
          {
            name: 'active',
            type: 'boolean',
            default: 'false',
            description: 'Highlights the item with an accent-coloured bottom border to indicate the current route. Set this on the top-level NavItem that corresponds to the active page.',
          },
          {
            name: 'variant',
            type: "'default' | 'primary' | 'muted'",
            default: "'default'",
            description: 'Visual style variant. `default` shows a subtle border and muted text with accent glow on active. `primary` uses accent-colored text and border in the resting state with a stronger glow on hover/active. `muted` renders a subdued style with no border and lighter text — ideal for secondary links like "Blog" or "Changelog".',
          },
          {
            name: 'description',
            type: 'string',
            description: 'Secondary text displayed below the item label inside a dropdown. Use this to add context like "Real-time dashboards and metrics" so users can scan the mega-menu without clicking through.',
          },
        ],
      },
    ],
  
  seeAlso: ["sidebar","top-bar","breadcrumb","tabs"],
};
