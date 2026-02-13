import type { ComponentDef } from './_types';

export const pageHeader: ComponentDef = {
    name: 'Page Header',
    slug: 'page-header',
    tag: 'arc-page-header',
    tier: 'layout',
    interactivity: 'static',
    description: 'Page title area with breadcrumb, description, and action slots. Provides a consistent top-of-page landmark that orients users with wayfinding context and surfaces the primary page-level action.',

    overview: `PageHeader is the topmost landmark on any content page. It anchors the user by combining a breadcrumb trail, a prominent heading, an optional description, and a right-aligned action area into a single, predictable layout. Every settings screen, detail view, and dashboard in your application should use PageHeader so users always know where they are and what they can do.

The component exposes four named slots — breadcrumb, actions, tabs, and default content — so you can compose it with any combination of navigation, buttons, tab strips, or supplementary content without touching the internal layout. The heading and description are set via properties, keeping the most common usage to a single self-closing tag with slotted children.

Because PageHeader renders a semantic \`<h1>\` for its heading, it establishes the document outline automatically. Pair it with Breadcrumb for full wayfinding, or drop in a Tabs strip to create sub-navigation within the page. The bottom border provides a clean visual separator from the page body below.`,

    features: [
      'Semantic <h1> heading that establishes the document outline',
      'Breadcrumb slot for hierarchical wayfinding above the title',
      'Right-aligned actions slot for primary page-level buttons',
      'Optional description text for additional page context',
      'Tabs slot for in-page sub-navigation below the title row',
      'Default content slot for supplementary elements',
      'Bottom border separator between header and page body',
      'Responsive title row that wraps gracefully on narrow viewports',
      'CSS custom property theming via design tokens',
      'Shadow DOM parts (base, breadcrumb, heading, actions, description, tabs, content) for targeted styling',
    ],

    guidelines: {
      do: [
        'Use one PageHeader per page to maintain a single <h1> document landmark',
        'Always populate the heading prop — it is the primary orientation cue for the page',
        'Place a Breadcrumb component in the breadcrumb slot on pages more than one level deep',
        'Put the single most important page-level action in the actions slot (e.g. "Invite Member", "Create Report")',
        'Keep the description to one or two short sentences that clarify what the page contains',
        'Use the tabs slot when the page has distinct sub-views (e.g. General, Security, Billing)',
      ],
      dont: [
        'Nest multiple PageHeaders on the same page — this creates duplicate <h1> elements and confuses assistive technology',
        'Use PageHeader as a section divider inside a scrolling page; use Section or Divider instead',
        'Overload the actions slot with more than two or three buttons — move overflow actions into a DropdownMenu',
        'Omit the breadcrumb slot on deeply nested pages; users lose spatial context without it',
        'Place lengthy paragraph text in the description — keep it concise and scannable',
        'Hard-code colors or font sizes on slotted children; rely on the token system for consistency',
      ],
    },

    previewHtml: `<div style="width:100%;padding:0 var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);box-sizing:border-box">
  <arc-page-header heading="Team Settings" description="Manage roles, permissions, and invitations for your team.">
    <arc-breadcrumb slot="breadcrumb">
      <arc-breadcrumb-item href="/">Home</arc-breadcrumb-item>
      <arc-breadcrumb-item href="/settings">Settings</arc-breadcrumb-item>
      <arc-breadcrumb-item>Team</arc-breadcrumb-item>
    </arc-breadcrumb>
    <div slot="actions">
      <arc-button variant="primary" size="sm">Invite Member</arc-button>
    </div>
  </arc-page-header>
</div>`,

    props: [
      {
        name: 'heading',
        type: 'string',
        default: "''",
        description: 'The page title rendered as an <h1>. This is the primary text landmark and should clearly describe the current page or view (e.g. "Team Settings", "Order #4021"). Keep it concise — two to five words is ideal.',
      },
      {
        name: 'description',
        type: 'string',
        default: "''",
        description: 'Optional supporting text displayed below the title row. Use it to provide a one-line summary of what the page contains or what action the user should take. When empty, the description paragraph is not rendered.',
      },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-page-header heading="Team Settings" description="Manage roles, permissions, and invitations for your team.">
  <arc-breadcrumb slot="breadcrumb">
    <arc-breadcrumb-item href="/">Home</arc-breadcrumb-item>
    <arc-breadcrumb-item href="/settings">Settings</arc-breadcrumb-item>
    <arc-breadcrumb-item>Team</arc-breadcrumb-item>
  </arc-breadcrumb>
  <div slot="actions">
    <arc-button variant="primary" size="sm">Invite Member</arc-button>
  </div>
</arc-page-header>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Breadcrumb, BreadcrumbItem, Button, PageHeader } from '@arclux/arc-ui-react';

export function TeamSettings() {
  return (
    <PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team.">
      <Breadcrumb slot="breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
        <BreadcrumbItem>Team</BreadcrumbItem>
      </Breadcrumb>
      <div slot="actions">
        <Button variant="primary" size="sm">Invite Member</Button>
      </div>
    </PageHeader>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Breadcrumb, BreadcrumbItem, Button, PageHeader } from '@arclux/arc-ui-vue';
</script>

<template>
  <PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team.">
    <Breadcrumb slot="breadcrumb">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
      <BreadcrumbItem>Team</BreadcrumbItem>
    </Breadcrumb>
    <div slot="actions">
      <Button variant="primary" size="sm">Invite Member</Button>
    </div>
  </PageHeader>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Breadcrumb, BreadcrumbItem, Button, PageHeader } from '@arclux/arc-ui-svelte';
</script>

<PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team.">
  <Breadcrumb slot="breadcrumb">
    <BreadcrumbItem href="/">Home</BreadcrumbItem>
    <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
    <BreadcrumbItem>Team</BreadcrumbItem>
  </Breadcrumb>
  <div slot="actions">
    <Button variant="primary" size="sm">Invite Member</Button>
  </div>
</PageHeader>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Breadcrumb, BreadcrumbItem, Button, PageHeader } from '@arclux/arc-ui-angular';

@Component({
  imports: [Breadcrumb, BreadcrumbItem, Button, PageHeader],
  template: \`
    <PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team.">
      <Breadcrumb slot="breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
        <BreadcrumbItem>Team</BreadcrumbItem>
      </Breadcrumb>
      <div slot="actions">
        <Button variant="primary" size="sm">Invite Member</Button>
      </div>
    </PageHeader>
  \`,
})
export class TeamSettingsComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Breadcrumb, BreadcrumbItem, Button, PageHeader } from '@arclux/arc-ui-solid';

export function TeamSettings() {
  return (
    <PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team.">
      <Breadcrumb slot="breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
        <BreadcrumbItem>Team</BreadcrumbItem>
      </Breadcrumb>
      <div slot="actions">
        <Button variant="primary" size="sm">Invite Member</Button>
      </div>
    </PageHeader>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Breadcrumb, BreadcrumbItem, Button, PageHeader } from '@arclux/arc-ui-preact';

export function TeamSettings() {
  return (
    <PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team.">
      <Breadcrumb slot="breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
        <BreadcrumbItem>Team</BreadcrumbItem>
      </Breadcrumb>
      <div slot="actions">
        <Button variant="primary" size="sm">Invite Member</Button>
      </div>
    </PageHeader>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-page-header — requires page-header.css + tokens.css (or arc-ui.css) -->
<div class="arc-page-header">
  <div class="page-header">
   <div class="page-header__breadcrumb">
    <nav class="arc-breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb__list">
        <li class="breadcrumb__item"><a href="/">Home</a><span class="breadcrumb__separator" aria-hidden="true">/</span></li>
        <li class="breadcrumb__item"><a href="/settings">Settings</a><span class="breadcrumb__separator" aria-hidden="true">/</span></li>
        <li class="breadcrumb__item" aria-current="page">Team</li>
      </ol>
    </nav>
   </div>
   <div class="page-header__title-row">
   <h1 class="page-header__heading">Team Settings</h1>
   <div class="page-header__actions">
    <a class="btn btn--primary btn--sm" href="#">Invite Member</a>
   </div>
   </div>
   <p class="page-header__description">Manage roles, permissions, and invitations for your team.</p>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-page-header — self-contained, no external CSS needed -->
<div class="arc-page-header" style="display: block; font-family: 'Host Grotesk', system-ui, sans-serif">
  <div style="padding: 24px 0 16px; border-bottom: 1px solid rgb(24, 24, 30)">
   <div style="margin-bottom: 8px">
    <nav aria-label="Breadcrumb">
      <ol style="display: flex; align-items: center; gap: 6px; list-style: none; margin: 0; padding: 0; font-size: 13px; color: rgb(160, 160, 176)">
        <li><a href="/" style="color: rgb(160, 160, 176); text-decoration: none">Home</a><span style="margin-left: 6px" aria-hidden="true">/</span></li>
        <li><a href="/settings" style="color: rgb(160, 160, 176); text-decoration: none">Settings</a><span style="margin-left: 6px" aria-hidden="true">/</span></li>
        <li style="color: rgb(232, 232, 236)" aria-current="page">Team</li>
      </ol>
    </nav>
   </div>
   <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap">
   <h1 style="margin: 0; font-family: 'Tektur', system-ui, sans-serif; font-size: 28px; font-weight: 700; color: rgb(232, 232, 236); line-height: 1.2">Team Settings</h1>
   <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0">
    <a href="#" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Tektur', system-ui, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; border: 1px solid transparent; border-radius: 10px; cursor: pointer; text-decoration: none; white-space: nowrap; padding: 6px 14px; font-size: 13px; background: rgb(77, 126, 247); color: rgb(232, 232, 236)">Invite Member</a>
   </div>
   </div>
   <p style="margin-top: 8px; margin-bottom: 0; color: rgb(160, 160, 176); font-size: 15px; line-height: 1.5">Manage roles, permissions, and invitations for your team.</p>
   </div>
</div>` }
    ],
  };
