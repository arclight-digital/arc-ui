import type { ComponentDef } from './_types';

export const appShell: ComponentDef = {
  name: 'App Shell',
  slug: 'app-shell',
  tag: 'arc-app-shell',
  tier: 'layout',
  interactivity: 'hybrid',
  description:
    'Full-page layout that puts a TopBar, a Sidebar and a scrolling content area into one frame, with a mobile sidebar toggle and an optional table-of-contents rail.',

  overview: `AppShell is the page frame for an app: a fixed top bar, a collapsible sidebar and a scrolling main area. Put an \`arc-top-bar\` in the \`topbar\` slot, an \`arc-sidebar\` (or any nav markup) in \`sidebar\`, and the page content in the default slot. The sidebar and the toc rail stick below the top bar and scroll on their own.

At 900 px and below (the \`breakpoint\` prop, default \`navCollapse\`), the sidebar collapses out of view, and the \`sidebar-open\` attribute brings it back. A fourth slot, \`toc\`, is a right-hand rail for a table of contents or other side content. It hides at 1280 px and below.`,

  features: [
    'At least `100vh` tall by default, so the shell fills the screen',
  ],

  guidelines: {
    do: [
      'Use one AppShell as the root layout of each page or route',
      'Put a button in the top bar that sets sidebar-open on small screens',
      'Use the "toc" slot for the table of contents on documentation pages',
      'Use Container or Section inside the default slot to set content widths',
    ],
    dont: [
      'Don\'t put scrolling content in the sidebar slot without giving it its own overflow',
      'Don\'t put anything users need in the toc slot. It hides on narrower screens',
      'Don\'t override the min-height to fit a shell inside a card or preview. Set `embedded`',
      'Don\'t use AppShell for marketing pages with no persistent sidebar or top bar',
    ],
  },

  previewLayout: 'frame',

  previewHeight: '480px',

  previewHtml: `<div style="width:100%;height:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;position:relative">
  <arc-app-shell embedded style="height:100%">
    <arc-top-bar slot="topbar" heading="Dashboard"></arc-top-bar>
    <nav slot="sidebar" style="width:200px;padding:var(--space-md);display:flex;flex-direction:column;gap:var(--space-xs);border-right:1px solid var(--border-subtle)">
      <span style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:1.5px;color:var(--text-muted);margin-bottom:var(--space-xs)">Navigation</span>
      <a href="#" style="color:var(--accent);text-decoration:none;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm);background:rgba(77,126,247,0.1)">Overview</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Analytics</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Settings</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Users</a>
    </nav>
    <div style="padding:var(--space-lg)">
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
    </div>
  </arc-app-shell>
</div>`,

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
    <arc-app-shell>
      <arc-top-bar slot="topbar" heading="Dashboard"></arc-top-bar>
      <nav slot="sidebar" style="width: 200px; padding: 16px;">
        <a href="/overview">Overview</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </nav>
      <main>
        <ng-content />
      </main>
    </arc-app-shell>
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
<!-- arc-app-shell — requires app-shell.css + base.css (or arc-ui.css) -->
<div class="arc-app-shell">
  <div class="shell">
    <div class="shell__body">
      <div class="shell__sidebar">
        <!-- sidebar nav goes here -->
      </div>
      <div class="shell__main">
        <div class="shell__content">
          AppShell
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
          AppShell
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

  seeAlso: ['page-layout', 'sidebar', 'top-bar', 'footer', 'auth-shell'],
};
