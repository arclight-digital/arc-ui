import type { ComponentDef } from './_types';

export const appShell: ComponentDef = {
    name: 'App Shell',
    slug: 'app-shell',
    tag: 'arc-app-shell',
    tier: 'layout',
    interactivity: 'hybrid',
    description: 'Full-page layout scaffold that composes a TopBar, Sidebar, and scrollable content area into a cohesive application frame. Handles responsive collapse, sidebar toggling, and optional table-of-contents rail out of the box.',

    overview: `AppShell is the outermost structural component for any ARC UI application. It establishes the canonical three-zone layout — a fixed top bar, a collapsible sidebar, and a flexible main content area — so that every page in your app shares a consistent chrome without duplicating layout logic.

The component manages responsive behavior automatically. On screens narrower than 768 px the sidebar collapses out of view and can be toggled back with the \`sidebar-open\` attribute, making it suitable for both desktop dashboards and mobile-first admin panels. A fourth optional slot, \`toc\`, provides a right-hand rail for table-of-contents or contextual widgets; it hides below 1280 px to keep the content area readable.

Because AppShell is slot-based, it composes freely with other ARC UI primitives. Drop an \`arc-top-bar\` into the \`topbar\` slot, an \`arc-sidebar\` (or any nav markup) into \`sidebar\`, and your page content into the default slot. The shell handles all the flex math, scroll containment, and z-index layering so you can focus on what goes inside each zone rather than how the zones relate to each other.`,

    features: [
      'Three-zone layout: fixed top bar, collapsible sidebar, scrollable main content',
      'Optional fourth "toc" slot for a right-hand table-of-contents rail',
      'Responsive sidebar collapse at 768 px with toggle via sidebar-open attribute',
      'Table-of-contents rail auto-hides below 1280 px',
      'Slot-based composition works with any TopBar, Sidebar, or custom markup',
      'Full-viewport min-height ensures the shell always fills the screen',
      'CSS custom property integration for consistent spacing and color tokens',
      'Exposed CSS parts (shell, body, sidebar, main, content, toc) for deep style overrides',
    ],

    guidelines: {
      do: [
        'Use one AppShell as the root layout wrapper for each page or route',
        'Place an arc-top-bar in the "topbar" slot for a consistent fixed header',
        'Provide a sidebar toggle button in the top bar that sets sidebar-open on mobile',
        'Use the "toc" slot for table-of-contents navigation on documentation pages',
        'Combine with Container or Section components inside the default slot for consistent content widths',
      ],
      dont: [
        'Nest one AppShell inside another — it is designed as a singleton page frame',
        'Put scrollable content directly in the sidebar slot without its own overflow handling',
        'Rely on the toc slot for critical navigation — it hides on narrower viewports',
        'Override min-height: 100vh on the host unless you are embedding a preview or iframe',
        'Use AppShell for simple marketing pages that do not need a persistent sidebar or top bar',
      ],
    },

    previewHtml: `<div style="width:100%;height:300px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;position:relative">
  <arc-app-shell>
    <arc-top-bar slot="topbar" heading="Dashboard"></arc-top-bar>
    <nav slot="sidebar" style="width:200px;padding:var(--space-md);display:flex;flex-direction:column;gap:var(--space-xs);border-right:1px solid var(--border-subtle)">
      <span style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:1.5px;color:var(--text-muted);margin-bottom:var(--space-xs)">Navigation</span>
      <a href="#" style="color:var(--accent);text-decoration:none;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm);background:rgba(77,126,247,0.1)">Overview</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Analytics</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Settings</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Users</a>
    </nav>
    <main style="padding:var(--space-lg)">
      <h2 style="margin:0 0 var(--space-sm) 0;font-size:var(--text-lg)">Welcome back</h2>
      <p style="color:var(--text-secondary);margin:0 0 var(--space-md) 0">Here is what happened while you were away.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-sm)">
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:var(--space-md)">
          <div style="font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Revenue</div>
          <div style="font-size:var(--text-xl);font-weight:700;margin-top:var(--space-xs)">$48.2k</div>
        </div>
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:var(--space-md)">
          <div style="font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Users</div>
          <div style="font-size:var(--text-xl);font-weight:700;margin-top:var(--space-xs)">1,247</div>
        </div>
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:var(--space-md)">
          <div style="font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Uptime</div>
          <div style="font-size:var(--text-xl);font-weight:700;margin-top:var(--space-xs)">99.9%</div>
        </div>
      </div>
    </main>
  </arc-app-shell>
</div>`,

    props: [
      {
        name: 'sidebar-open',
        type: 'boolean',
        default: 'false',
        description: 'Controls whether the sidebar is visible on mobile viewports (below 768 px). On desktop the sidebar is always shown regardless of this attribute. Toggle it from a hamburger button in your TopBar to give mobile users access to navigation.',
      },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-app-shell>
  <arc-top-bar slot="topbar" heading="Dashboard"></arc-top-bar>
  <nav slot="sidebar" style="width: 200px; padding: 16px;">
    <a href="/overview">Overview</a>
    <a href="/analytics">Analytics</a>
    <a href="/settings">Settings</a>
  </nav>
  <main>
    <h1>Welcome back</h1>
    <p>Here is what happened while you were away.</p>
  </main>
</arc-app-shell>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { AppShell, TopBar } from '@arclux/arc-ui-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <TopBar slot="topbar" heading="Dashboard" />
      <nav slot="sidebar" style={{ width: 200, padding: 16 }}>
        <a href="/overview">Overview</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </nav>
      <main>{children}</main>
    </AppShell>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { AppShell, TopBar } from '@arclux/arc-ui-vue';
</script>

<template>
  <AppShell>
    <TopBar slot="topbar" heading="Dashboard" />
    <nav slot="sidebar" style="width: 200px; padding: 16px;">
      <a href="/overview">Overview</a>
      <a href="/analytics">Analytics</a>
      <a href="/settings">Settings</a>
    </nav>
    <main>
      <slot />
    </main>
  </AppShell>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { AppShell, TopBar } from '@arclux/arc-ui-svelte';
</script>

<AppShell>
  <TopBar slot="topbar" heading="Dashboard" />
  <nav slot="sidebar" style="width: 200px; padding: 16px;">
    <a href="/overview">Overview</a>
    <a href="/analytics">Analytics</a>
    <a href="/settings">Settings</a>
  </nav>
  <main>
    <slot />
  </main>
</AppShell>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { AppShell, TopBar } from '@arclux/arc-ui-angular';

@Component({
  imports: [AppShell, TopBar],
  template: \`
    <AppShell>
      <TopBar slot="topbar" heading="Dashboard"></TopBar>
      <nav slot="sidebar" style="width: 200px; padding: 16px;">
        <a href="/overview">Overview</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </nav>
      <main>
        <ng-content />
      </main>
    </AppShell>
  \`,
})
export class DashboardLayoutComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { AppShell, TopBar } from '@arclux/arc-ui-solid';
import type { ParentProps } from 'solid-js';

export function DashboardLayout(props: ParentProps) {
  return (
    <AppShell>
      <TopBar slot="topbar" heading="Dashboard" />
      <nav slot="sidebar" style={{ width: '200px', padding: '16px' }}>
        <a href="/overview">Overview</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </nav>
      <main>{props.children}</main>
    </AppShell>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { AppShell, TopBar } from '@arclux/arc-ui-preact';
import type { ComponentChildren } from 'preact';

export function DashboardLayout({ children }: { children: ComponentChildren }) {
  return (
    <AppShell>
      <TopBar slot="topbar" heading="Dashboard" />
      <nav slot="sidebar" style={{ width: 200, padding: 16 }}>
        <a href="/overview">Overview</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </nav>
      <main>{children}</main>
    </AppShell>
  );
}`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-app-shell — requires app-shell.css + tokens.css (or arc-ui.css) -->
<div class="arc-app-shell">
  <div class="shell">
    <div class="shell__body">
      <div class="shell__sidebar">
        <!-- sidebar nav goes here -->
      </div>
      <div class="shell__main">
        <div class="shell__content">
          App Shell
        </div>
        <div class="shell__toc">
          <!-- optional table-of-contents -->
        </div>
      </div>
    </div>
  </div>
</div>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-app-shell — self-contained, no external CSS needed -->
<style>
  @media (max-width: 1280px) {
    .arc-app-shell .shell__toc { display: none; }
  }
  @media (max-width: 768px) {
    .arc-app-shell .shell__sidebar { display: none; }
  }
  @media (max-width: 768px) {
    .arc-app-shell([sidebar-open]) .shell__sidebar { display: block; }
  }
</style>
<div class="arc-app-shell" style="display: block; min-height: 100vh; background: rgb(3, 3, 7); color: rgb(232, 232, 236)">
  <div class="shell" style="display: flex; flex-direction: column; min-height: 100vh">
    <div style="display: flex; flex: 1; padding-top: 64px">
      <div class="shell__sidebar" style="flex-shrink: 0">
        <!-- sidebar nav goes here -->
      </div>
      <div style="flex: 1; min-width: 0; display: flex">
        <div style="flex: 1; min-width: 0; padding: 40px 40px; max-width: 860px">
          App Shell
        </div>
        <div class="shell__toc" style="flex-shrink: 0; width: 220px">
          <!-- optional table-of-contents -->
        </div>
      </div>
    </div>
  </div>
</div>`,
      },
    ],
  
  seeAlso: ["page-layout","sidebar","top-bar","footer","auth-shell"],
};
