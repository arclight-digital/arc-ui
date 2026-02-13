import type { ComponentDef } from './_types';

export const settingsLayout: ComponentDef = {
    name: 'Settings Layout',
    slug: 'settings-layout',
    tag: 'arc-settings-layout',
    tier: 'layout',
    interactivity: 'hybrid',
    description: 'Settings page with side navigation and content area.',

    overview: `SettingsLayout is a two-region layout component designed specifically for settings and preference pages. It pairs a navigation panel (where you place section links like "Profile", "Security", "Billing") with a content area that displays the active settings form. The \`nav-position\` prop lets you choose between a left sidebar (the classic settings pattern) and a top tab-bar style layout.

In \`left\` mode, the navigation renders as a 220px sidebar with a card-colored background and a right border, creating a clear visual separation from the content. In \`top\` mode, the navigation appears as a horizontal bar above the content with a bottom border, which works well when there are only a few sections or when horizontal space is at a premium. Both modes use the same slot names, so switching between them requires changing a single attribute.

On screens narrower than 768px, the left sidebar layout automatically collapses to a stacked column -- the nav moves above the content with a bottom border instead of a right border. This responsive behavior is built in and requires no additional configuration. The component exposes CSS parts for the layout container, nav region, and content region, allowing targeted style overrides when needed.`,

    features: [
      'Two layout modes: left sidebar (220px) and top navigation bar',
      'Card-colored nav background with subtle border separation',
      'Automatic responsive collapse from sidebar to stacked layout at 768px',
      'Named slots: nav (for section links) and default (for content)',
      'CSS Grid layout in left mode, flexbox column in top mode',
      'Exposed CSS parts (layout, nav, content) for targeted ::part() styling',
      'Consistent padding via design tokens (--space-lg for nav, --space-xl for content)',
      'Border swaps from right to bottom automatically on mobile collapse',
    ],

    guidelines: {
      do: [
        'Use SettingsLayout for account settings, preferences, and configuration pages',
        'Place a vertical link list or tab group in the nav slot for section switching',
        'Use nav-position="left" when you have more than four or five settings sections',
        'Use nav-position="top" for compact settings pages with only two or three sections',
        'Nest individual settings forms or panels in the default content slot',
      ],
      dont: [
        'Use SettingsLayout for general page layout -- use PageLayout for dashboard and content pages',
        'Place primary application navigation in the nav slot; it is for settings-section switching only',
        'Nest SettingsLayout inside another SettingsLayout or PageLayout with its own sidebar',
        'Override the responsive breakpoint without testing the stacked layout on real mobile devices',
        'Put heavy interactive content (tables, charts) in the nav slot -- keep it lightweight',
      ],
    },

    previewHtml: `<div style="width:100%;height:280px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <arc-settings-layout nav-position="left" style="height:100%">
    <div slot="nav" style="display:flex;flex-direction:column;gap:var(--space-xs)">
      <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:var(--space-xs);font-family:var(--font-accent)">Settings</span>
      <a href="#" style="color:var(--accent-primary);text-decoration:none;font-size:14px;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm);background:rgba(77,126,247,0.1);font-family:var(--font-body)">Profile</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;font-size:14px;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm);font-family:var(--font-body)">Security</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;font-size:14px;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm);font-family:var(--font-body)">Notifications</a>
      <a href="#" style="color:var(--text-secondary);text-decoration:none;font-size:14px;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm);font-family:var(--font-body)">Billing</a>
    </div>
    <div>
      <h2 style="margin:0 0 var(--space-sm);font-family:var(--font-body);font-size:20px;font-weight:700;color:var(--text-primary)">Profile</h2>
      <p style="margin:0 0 var(--space-md);color:var(--text-secondary);font-size:14px;font-family:var(--font-body)">Manage your display name, avatar, and contact information.</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
        <label style="font-size:13px;color:var(--text-secondary);font-family:var(--font-body)">Display Name
          <input type="text" value="Alice" style="display:block;margin-top:4px;padding:6px 10px;background:var(--bg-input);border:1px solid var(--border-default);border-radius:var(--radius-sm);color:var(--text-primary);font-size:14px;width:240px;box-sizing:border-box" />
        </label>
      </div>
    </div>
  </arc-settings-layout>
</div>`,

    props: [
      { name: 'nav-position', type: "'left' | 'top'", default: "'left'", description: 'Controls whether the navigation panel appears as a left sidebar (220px wide, CSS Grid) or a top bar (full-width, flexbox column). The left layout collapses to stacked on screens narrower than 768px.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-settings-layout nav-position="left">
  <div slot="nav">Profile | Security</div>
  <div>
    <h2>Profile Settings</h2>
    <p>Manage your account.</p>
  </div>
</arc-settings-layout>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { SettingsLayout } from '@arclux/arc-ui-react';

<SettingsLayout nav-position="left">
  <div slot="nav">Profile | Security</div>
  <div>
    <h2>Profile Settings</h2>
    <p>Manage your account.</p>
  </div>
</SettingsLayout>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { SettingsLayout } from '@arclux/arc-ui-vue';
</script>

<template>
  <SettingsLayout nav-position="left">
    <div slot="nav">Profile | Security</div>
    <div>
      <h2>Profile Settings</h2>
      <p>Manage your account.</p>
    </div>
  </SettingsLayout>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { SettingsLayout } from '@arclux/arc-ui-svelte';
</script>

<SettingsLayout nav-position="left">
  <div slot="nav">Profile | Security</div>
  <div>
    <h2>Profile Settings</h2>
    <p>Manage your account.</p>
  </div>
</SettingsLayout>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { SettingsLayout } from '@arclux/arc-ui-angular';

@Component({
  imports: [SettingsLayout],
  template: \`
    <SettingsLayout nav-position="left">
      <div slot="nav">Profile | Security</div>
      <div>
        <h2>Profile Settings</h2>
        <p>Manage your account.</p>
      </div>
    </SettingsLayout>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { SettingsLayout } from '@arclux/arc-ui-solid';

<SettingsLayout nav-position="left">
  <div slot="nav">Profile | Security</div>
  <div>
    <h2>Profile Settings</h2>
    <p>Manage your account.</p>
  </div>
</SettingsLayout>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { SettingsLayout } from '@arclux/arc-ui-preact';

<SettingsLayout nav-position="left">
  <div slot="nav">Profile | Security</div>
  <div>
    <h2>Profile Settings</h2>
    <p>Manage your account.</p>
  </div>
</SettingsLayout>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-settings-layout — requires settings-layout.css + tokens.css (or arc-ui.css) -->
<div class="arc-settings-layout">
  <div>
   <div class="nav">

   </div>
   <div class="content">
   Settings Layout
   </div>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-settings-layout — self-contained, no external CSS needed -->
<style>
  @media (max-width: 768px) {
    .arc-settings-layout .settings-layout--left { display: flex;
          flex-direction: column; }
  }
  @media (max-width: 768px) {
    .arc-settings-layout .settings-layout--left .nav { border-right: none;
          border-bottom: 1px solid rgb(24, 24, 30); }
  }
</style>
<div class="arc-settings-layout" style="display: block; box-sizing: border-box">
  <div>
   <div class="nav" style="padding: 24px; background: rgb(13, 13, 18); border-right: 1px solid rgb(24, 24, 30); border-bottom: 1px solid rgb(24, 24, 30)">

   </div>
   <div style="padding: 40px; flex: 1">
   Settings Layout
   </div>
   </div>
</div>` }
    ],
  };
