import type { ComponentDef } from './_types';

export const pageLayout: ComponentDef = {
    name: 'Page Layout',
    slug: 'page-layout',
    tag: 'arc-page-layout',
    tier: 'layout',
    interactivity: 'hybrid',
    description: 'Page structure primitive that arranges content into sidebar-left, sidebar-right, centered, or wide layouts using CSS Grid. Handles responsive collapse, configurable gap and max-width, and exposes named slots for sidebar, main, and aside regions.',

    overview: `PageLayout is the structural foundation for every page in your application. Rather than hand-coding grid columns and responsive breakpoints, you set a single \`layout\` attribute and the component handles the rest: sidebar-left places a 240px navigation rail to the left of the main content, sidebar-right adds a 300px aside on the right for contextual panels, centered constrains content to a max-width with auto margins, and wide lets content stretch full-bleed.

The component is deliberately unopinionated about what goes inside each region. Drop a navigation menu, filter panel, or table of contents into the sidebar slot; place your primary content in the default slot; and optionally fill the aside slot with supplementary widgets. This separation of structure and content means you can swap layouts without touching the content itself -- switch from sidebar-left to centered by changing one attribute.

PageLayout collapses gracefully on mobile. At 768px and below, sidebar-left and sidebar-right layouts flatten to a single stacked column so content remains readable on small screens. The \`gap\` and \`maxWidth\` properties let you fine-tune spacing and width constraints at the page level, keeping your layout tokens consistent with the rest of the design system.`,

    features: [
      'Four layout modes: sidebar-left, sidebar-right, centered, and wide',
      'CSS Grid-based columns with fixed sidebar widths (240px left, 300px right)',
      'Responsive collapse to single-column at 768px breakpoint',
      'Configurable max-width for centered layouts (default 1120px)',
      'Adjustable gap between regions via the gap property',
      'Named slots for sidebar, default (main), and aside regions',
      'CSS custom properties (--max-width, --gap) for runtime tuning',
      'Exposed CSS parts (layout, sidebar, main, aside) for deep styling',
      'Minimum-width protection on the main column to prevent content overflow',
    ],

    guidelines: {
      do: [
        'Use sidebar-left for primary navigation layouts like dashboards and admin panels',
        'Use sidebar-right for contextual detail panels, table-of-contents, or filter drawers',
        'Use centered for article pages, documentation, and content-heavy layouts',
        'Set a meaningful maxWidth when using centered to maintain readable line lengths',
        'Nest PageLayout inside AppShell to combine top bar, sidebar chrome, and page structure',
        'Test the responsive breakpoint to verify sidebar content stacks correctly on mobile',
        'Use the gap property to match the spacing scale defined in your design tokens',
      ],
      dont: [
        'Nest multiple PageLayouts -- one per page is sufficient; use Container or Section for inner structure',
        'Hard-code column widths with inline styles when the layout prop covers your use case',
        'Place critical navigation in the aside slot -- it is hidden in non-sidebar-right layouts',
        'Forget to provide meaningful content in the sidebar slot when using sidebar-left or sidebar-right',
        'Use wide layout without any internal max-width constraints -- text becomes unreadable at large viewports',
        'Override the responsive breakpoint without testing on real mobile devices',
      ],
    },

    previewHtml: `<div style="width:100%;height:300px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-page-layout layout="sidebar-left" gap="0" style="height:100%">
    <nav slot="sidebar" style="background:var(--surface-alt);height:100%;padding:var(--space-md);display:flex;flex-direction:column;gap:var(--space-xs);border-right:1px solid var(--border-subtle)">
      <span style="font-family:var(--font-heading);font-weight:600;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:var(--space-xs)">Navigation</span>
      <a href="#" style="color:var(--accent);text-decoration:none;font-size:0.85rem;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm);background:rgba(77,126,247,0.1)">Dashboard</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;font-size:0.85rem;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Analytics</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;font-size:0.85rem;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Settings</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;font-size:0.85rem;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Users</a>
    </nav>
    <main style="padding:var(--space-lg);display:flex;flex-direction:column;gap:var(--space-md)">
      <h2 style="margin:0;font-family:var(--font-heading);font-size:1.25rem;font-weight:600">Dashboard</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-sm)">
        <div style="background:var(--surface-alt);border-radius:var(--radius-sm);padding:var(--space-md);border:1px solid var(--border-subtle)">
          <div style="font-size:0.75rem;color:var(--text-muted)">Revenue</div>
          <div style="font-size:1.25rem;font-weight:700;font-family:var(--font-heading)">$48.2k</div>
        </div>
        <div style="background:var(--surface-alt);border-radius:var(--radius-sm);padding:var(--space-md);border:1px solid var(--border-subtle)">
          <div style="font-size:0.75rem;color:var(--text-muted)">Users</div>
          <div style="font-size:1.25rem;font-weight:700;font-family:var(--font-heading)">1,204</div>
        </div>
        <div style="background:var(--surface-alt);border-radius:var(--radius-sm);padding:var(--space-md);border:1px solid var(--border-subtle)">
          <div style="font-size:0.75rem;color:var(--text-muted)">Uptime</div>
          <div style="font-size:1.25rem;font-weight:700;font-family:var(--font-heading)">99.9%</div>
        </div>
      </div>
      <div style="flex:1;background:var(--surface-alt);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);padding:var(--space-md);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.85rem">Chart area</div>
    </main>
  </arc-page-layout>
</div>`,

    props: [
      {
        name: 'layout',
        type: "'sidebar-left' | 'sidebar-right' | 'centered' | 'wide'",
        default: "'centered'",
        description: 'Controls the column structure of the page. sidebar-left creates a 240px fixed column on the left for navigation. sidebar-right creates a 300px fixed column on the right for contextual content. centered constrains the main area to max-width with auto margins. wide allows content to stretch the full available width.',
      },
      {
        name: 'max-width',
        type: 'string',
        default: "'1120px'",
        description: 'Maximum width of the content area when using the centered layout. Accepts any valid CSS length value. Has no effect on sidebar-left, sidebar-right, or wide layouts. Maps to the --max-width CSS custom property.',
      },
      {
        name: 'gap',
        type: 'string',
        default: "'var(--space-xl)'",
        description: 'Gap between the sidebar/aside and main content regions. Accepts any valid CSS length or spacing token. Maps to the --gap CSS custom property and applies to the CSS Grid gap in sidebar layouts.',
      },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-page-layout layout="sidebar-left">
  <nav slot="sidebar" style="display: flex; flex-direction: column; gap: 8px;">
    <a href="/dashboard">Dashboard</a>
    <a href="/analytics">Analytics</a>
    <a href="/settings">Settings</a>
  </nav>
  <main>
    <h1>Dashboard</h1>
    <p>Main content area with full-width access.</p>
  </main>
</arc-page-layout>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { PageLayout } from '@arclux/arc-ui-react';

export function DashboardPage() {
  return (
    <PageLayout layout="sidebar-left">
      <nav slot="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a href="/dashboard">Dashboard</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </nav>
      <main>
        <h1>Dashboard</h1>
        <p>Main content area with full-width access.</p>
      </main>
    </PageLayout>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { PageLayout } from '@arclux/arc-ui-vue';
</script>

<template>
  <PageLayout layout="sidebar-left">
    <nav slot="sidebar" style="display: flex; flex-direction: column; gap: 8px;">
      <a href="/dashboard">Dashboard</a>
      <a href="/analytics">Analytics</a>
      <a href="/settings">Settings</a>
    </nav>
    <main>
      <h1>Dashboard</h1>
      <p>Main content area with full-width access.</p>
    </main>
  </PageLayout>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { PageLayout } from '@arclux/arc-ui-svelte';
</script>

<PageLayout layout="sidebar-left">
  <nav slot="sidebar" style="display: flex; flex-direction: column; gap: 8px;">
    <a href="/dashboard">Dashboard</a>
    <a href="/analytics">Analytics</a>
    <a href="/settings">Settings</a>
  </nav>
  <main>
    <h1>Dashboard</h1>
    <p>Main content area with full-width access.</p>
  </main>
</PageLayout>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { PageLayout } from '@arclux/arc-ui-angular';

@Component({
  imports: [PageLayout],
  template: \`
    <PageLayout layout="sidebar-left">
      <nav slot="sidebar" style="display: flex; flex-direction: column; gap: 8px;">
        <a href="/dashboard">Dashboard</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </nav>
      <main>
        <h1>Dashboard</h1>
        <p>Main content area with full-width access.</p>
      </main>
    </PageLayout>
  \`,
})
export class DashboardPageComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { PageLayout } from '@arclux/arc-ui-solid';

export function DashboardPage() {
  return (
    <PageLayout layout="sidebar-left">
      <nav slot="sidebar" style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
        <a href="/dashboard">Dashboard</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </nav>
      <main>
        <h1>Dashboard</h1>
        <p>Main content area with full-width access.</p>
      </main>
    </PageLayout>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { PageLayout } from '@arclux/arc-ui-preact';

export function DashboardPage() {
  return (
    <PageLayout layout="sidebar-left">
      <nav slot="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a href="/dashboard">Dashboard</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </nav>
      <main>
        <h1>Dashboard</h1>
        <p>Main content area with full-width access.</p>
      </main>
    </PageLayout>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-page-layout — requires page-layout.css + base.css (or arc-ui.css) -->
<div class="arc-page-layout">
  <div class="page-layout">
   <div class="sidebar">

   </div>
   <div class="main">
   Page Layout
   </div>
   <div class="aside">

   </div>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-page-layout — self-contained, no external CSS needed -->
<style>
  @media (max-width: 768px) {
    .arc-page-layout([layout='sidebar-left']) .page-layout,
        .arc-page-layout([layout='sidebar-right']) .page-layout { grid-template-columns: 1fr; }
  }
</style>
<div class="arc-page-layout" style="display: block; box-sizing: border-box">
  <div class="page-layout" style="padding: 40px 24px; gap: var(--gap); min-height: 100%; box-sizing: border-box">
   <div style="display: none">

   </div>
   <div style="min-width: 0">
   Page Layout
   </div>
   <div style="display: none">

   </div>
   </div>
</div>` }
    ],
  
  seeAlso: ["app-shell","container","section","page-header"],
};
