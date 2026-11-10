import type { ComponentDef } from './_types';

export const settingsLayout: ComponentDef = {
  name: 'Settings Layout',
  slug: 'settings-layout',
  tag: 'arc-settings-layout',
  tier: 'layout',
  interactivity: 'hybrid',
  description: 'A settings page frame: section links in a side or top nav, and the settings content beside or below them.',

  overview: `SettingsLayout splits a settings page into a nav of section links ("Profile", "Security", "Billing") and a content area for the forms. \`nav-position="left"\`, the default, puts the nav in a 220px sidebar on a raised background. \`nav-position="top"\` puts it in a bar above the content. Both use the same slots, so switching is one attribute.

Use it for account settings, preferences and configuration. For other pages, use PageLayout.`,

  features: [
    '`arc-settings-nav-item` links with an active state that follows the URL hash, so a shared link or the back button lands on the right section',
    '`sections` shows only the section whose `id` matches the active item, for a tabbed settings page',
    'Below 768px the nav becomes a scrolling row of tabs above the content, in either mode, instead of a stack that pushes the content down',
    'CSS parts `layout`, `nav` and `content`',
  ],

  guidelines: {
    do: [
      'Use `nav-position="left"` for more than four or five sections',
      'Use `nav-position="top"` for two or three sections',
    ],
    dont: [
      'Don\'t put the app\'s main navigation in the nav slot. It\'s for switching settings sections',
      'Don\'t put tables, charts or other heavy content in the nav. On a phone it\'s one scrolling row',
    ],
  },

  previewHtml: `<div style="width:100%;height:300px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <arc-settings-layout nav-position="left" sections style="height:100%">
    <nav slot="nav" aria-label="Settings">
      <arc-settings-nav-item href="#sl-demo-profile">Profile</arc-settings-nav-item>
      <arc-settings-nav-item href="#sl-demo-security">Security</arc-settings-nav-item>
      <arc-settings-nav-item href="#sl-demo-billing">Billing</arc-settings-nav-item>
    </nav>
    <section id="sl-demo-profile">
      <h2 style="margin:0 0 var(--space-sm);font-size:20px;color:var(--text-primary)">Profile</h2>
      <arc-input label="Display name" value="Alice" style="max-width:260px"></arc-input>
    </section>
    <section id="sl-demo-security">
      <h2 style="margin:0 0 var(--space-sm);font-size:20px;color:var(--text-primary)">Security</h2>
      <arc-toggle label="Two-factor authentication"></arc-toggle>
    </section>
    <section id="sl-demo-billing">
      <h2 style="margin:0 0 var(--space-sm);font-size:20px;color:var(--text-primary)">Billing</h2>
      <p style="margin:0;color:var(--text-secondary)">Pro plan, renews monthly.</p>
    </section>
  </arc-settings-layout>
</div>`,

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

export default function Example() {
  return (
    <SettingsLayout nav-position="left">
      <div slot="nav">Profile | Security</div>
      <div>
        <h2>Profile Settings</h2>
        <p>Manage your account.</p>
      </div>
    </SettingsLayout>
  );
}`,
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
    <arc-settings-layout nav-position="left">
      <div slot="nav">Profile | Security</div>
      <div>
        <h2>Profile Settings</h2>
        <p>Manage your account.</p>
      </div>
    </arc-settings-layout>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { SettingsLayout } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <SettingsLayout nav-position="left">
      <div slot="nav">Profile | Security</div>
      <div>
        <h2>Profile Settings</h2>
        <p>Manage your account.</p>
      </div>
    </SettingsLayout>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { SettingsLayout } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <SettingsLayout nav-position="left">
      <div slot="nav">Profile | Security</div>
      <div>
        <h2>Profile Settings</h2>
        <p>Manage your account.</p>
      </div>
    </SettingsLayout>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-settings-layout — requires settings-layout.css + base.css (or arc-ui.css) -->
<div class="arc-settings-layout">
  <div>
   <div class="nav">

   </div>
   <div class="content">
   SettingsLayout
   </div>
   </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
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
   SettingsLayout
   </div>
   </div>
</div>`,
    },
  ],

  subComponents: [
    {
      name: 'SettingsNavItem',
      tag: 'arc-settings-nav-item',
      description:
        'A link to one section of the settings page, marked active by the layout from the URL hash.',
    },
  ],

  seeAlso: ['app-shell', 'sidebar', 'tabs', 'form'],
};
