import type { ComponentDef } from './_types';

export const pageLayout: ComponentDef = {
  name: 'Page Layout',
  slug: 'page-layout',
  tag: 'arc-page-layout',
  tier: 'layout',
  interactivity: 'hybrid',
  description:
    'A CSS Grid page frame whose `layout` attribute picks a left sidebar, a right aside, a centered column or full width.',

  overview: `PageLayout picks its grid from the \`layout\` attribute. \`sidebar-left\` puts the \`sidebar\` slot in a 240px column left of the main content. \`sidebar-right\` puts the \`aside\` slot in a 300px column on the right. \`centered\` (the default) caps the content at a max width with auto margins, and \`wide\` lets it run full width.

Main content goes in the default slot. A slot that the current layout doesn't use is hidden, so switching \`layout\` doesn't mean moving content between slots.

At 768px and below, both sidebar layouts collapse to one stacked column. \`gap\` sets the space between regions and \`maxWidth\` sets the cap for \`centered\`.`,

  features: [
    '`maxWidth` defaults to 1120px and only applies to `centered`',
    'Both props are also set as `--max-width` and `--gap` custom properties',
    'The main column has `min-width: 0`, so wide content doesn\'t push it past its grid track',
    'Parts: `base`, `layout`, `sidebar`, `main`, `aside`',
  ],

  guidelines: {
    do: [
      'Use sidebar-left for navigation, as in dashboards and admin panels',
      'Use sidebar-right for a detail panel, table of contents or filters',
      'Use centered for articles and documentation, with a `maxWidth` that keeps lines readable',
      'Put PageLayout inside AppShell to get a top bar and sidebar chrome around it',
      'Set `gap` to a value from your spacing scale',
    ],
    dont: [
      'Don\'t hand-code column widths in inline styles when a `layout` value already gives you them',
      'Don\'t put content in `aside` unless the layout is sidebar-right. It\'s hidden in every other layout',
      'Don\'t use `wide` for text without a max width inside it. Lines get too long to read on large screens',
    ],
  },

  previewLayout: 'frame',

  previewHeight: '300px',

  previewHtml: `<div style="width:100%;height:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-page-layout layout="sidebar-left" gap="0" style="height:100%">
    <nav slot="sidebar" style="background:var(--surface-alt);height:100%;padding:var(--space-md);display:flex;flex-direction:column;gap:var(--space-xs);border-right:1px solid var(--border-subtle)">
      <span style="font-family:var(--font-heading);font-weight:600;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:var(--space-xs)">Navigation</span>
      <a href="#" style="color:var(--accent);text-decoration:none;font-size:0.85rem;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm);background:rgba(77,126,247,0.1)">Dashboard</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;font-size:0.85rem;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Analytics</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;font-size:0.85rem;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Settings</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;font-size:0.85rem;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm)">Users</a>
    </nav>
    <div style="padding:var(--space-lg);display:flex;flex-direction:column;gap:var(--space-md)">
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
    </div>
  </arc-page-layout>
</div>`,

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
    </arc-page-layout>
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
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-page-layout — requires page-layout.css + base.css (or arc-ui.css) -->
<div class="arc-page-layout">
  <div class="page-layout">
   <div class="sidebar">

   </div>
   <div class="main">
   PageLayout
   </div>
   <div class="aside">

   </div>
   </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
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
   PageLayout
   </div>
   <div style="display: none">

   </div>
   </div>
</div>`,
    },
  ],

  seeAlso: ['app-shell', 'container', 'section', 'page-header'],
};
