import type { ComponentDef } from './_types';

const previewMarkup = `<arc-page-header heading="Team settings" description="Manage roles, permissions, and invitations for your team." border>
    <arc-breadcrumb slot="above" label="Example breadcrumb">
      <arc-breadcrumb-item href="/">Home</arc-breadcrumb-item>
      <arc-breadcrumb-item href="/settings">Settings</arc-breadcrumb-item>
      <arc-breadcrumb-item>Team</arc-breadcrumb-item>
    </arc-breadcrumb>
    <arc-button slot="aside" variant="primary" size="sm">Invite member</arc-button>
  </arc-page-header>`;

export const pageHeader: ComponentDef = {
  name: 'Page Header',
  slug: 'page-header',
  tag: 'arc-page-header',
  tier: 'layout',
  interactivity: 'static',
  description:
    'The title block at the top of a page: an `<h1>`, an optional description, and slots for breadcrumbs, actions and tabs.',

  overview: `PageHeader renders a heading as an \`<h1>\`, an optional description under it, and slots around both.

\`above\` renders above the heading row, \`aside\` to the right of the heading, \`below\` between the description and the default content, and the default slot at the bottom. A typical page puts breadcrumbs in \`above\`, action buttons in \`aside\` and a tab strip in \`below\`.

The \`heading\` and \`description\` props render plain text. To put markup there, leave the prop empty and use the \`heading\` or \`description\` slot. The component doesn't wrap slotted heading content in an \`<h1>\`, so bring your own. The \`border\` prop adds a bottom border between the header and the page body.`,

  features: [
    'The heading row wraps on narrow screens, so `aside` drops under the heading',
    'Parts: `base`, `above`, `title-row`, `heading`, `aside`, `description`, `below`, `content`',
  ],

  guidelines: {
    do: [
      'Use one PageHeader per page, so the page has one `<h1>`',
      'Put breadcrumbs in `above` on pages more than one level deep',
      'Put the page\'s main action in `aside`, for example "Invite member"',
      'Keep the description to one or two short sentences about what the page contains',
      'Use `below` for tab strips or secondary controls between the heading and the content',
    ],
    dont: [
      "Don't use it as a divider between sections of a long page. Use Section or Divider",
      "Don't put more than two or three buttons in `aside`. Move the rest into a DropdownMenu",
    ],
  },

  previewHtml: `<div style="width:100%;padding:0 var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);box-sizing:border-box">
  ${previewMarkup}
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-page-header heading="Team Settings" description="Manage roles, permissions, and invitations for your team." border>
  <arc-breadcrumb slot="above">
    <arc-breadcrumb-item href="/">Home</arc-breadcrumb-item>
    <arc-breadcrumb-item href="/settings">Settings</arc-breadcrumb-item>
    <arc-breadcrumb-item>Team</arc-breadcrumb-item>
  </arc-breadcrumb>
  <arc-button slot="aside" variant="primary" size="sm">Invite Member</arc-button>
</arc-page-header>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Breadcrumb, BreadcrumbItem, Button, PageHeader } from '@arclux/arc-ui-react';

export function TeamSettings() {
  return (
    <PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team." border>
      <Breadcrumb slot="above">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
        <BreadcrumbItem>Team</BreadcrumbItem>
      </Breadcrumb>
      <Button slot="aside" variant="primary" size="sm">Invite Member</Button>
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
  <PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team." border>
    <Breadcrumb slot="above">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
      <BreadcrumbItem>Team</BreadcrumbItem>
    </Breadcrumb>
    <Button slot="aside" variant="primary" size="sm">Invite Member</Button>
  </PageHeader>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Breadcrumb, BreadcrumbItem, Button, PageHeader } from '@arclux/arc-ui-svelte';
</script>

<PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team." border>
  <Breadcrumb slot="above">
    <BreadcrumbItem href="/">Home</BreadcrumbItem>
    <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
    <BreadcrumbItem>Team</BreadcrumbItem>
  </Breadcrumb>
  <Button slot="aside" variant="primary" size="sm">Invite Member</Button>
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
    <arc-page-header heading="Team Settings" description="Manage roles, permissions, and invitations for your team." border>
      <arc-breadcrumb slot="above">
        <arc-breadcrumb-item href="/">Home</arc-breadcrumb-item>
        <arc-breadcrumb-item href="/settings">Settings</arc-breadcrumb-item>
        <arc-breadcrumb-item>Team</arc-breadcrumb-item>
      </arc-breadcrumb>
      <arc-button slot="aside" variant="primary" size="sm">Invite Member</arc-button>
    </arc-page-header>
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
    <PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team." border>
      <Breadcrumb slot="above">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
        <BreadcrumbItem>Team</BreadcrumbItem>
      </Breadcrumb>
      <Button slot="aside" variant="primary" size="sm">Invite Member</Button>
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
    <PageHeader heading="Team Settings" description="Manage roles, permissions, and invitations for your team." border>
      <Breadcrumb slot="above">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
        <BreadcrumbItem>Team</BreadcrumbItem>
      </Breadcrumb>
      <Button slot="aside" variant="primary" size="sm">Invite Member</Button>
    </PageHeader>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-page-header — requires page-header.css + base.css (or arc-ui.css) -->
<div class="arc-page-header">
  <div class="page-header">
   <div class="page-header__above">
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
   <div class="page-header__aside">
    <a class="btn btn--primary btn--sm" href="#">Invite Member</a>
   </div>
   </div>
   <p class="page-header__description">Manage roles, permissions, and invitations for your team.</p>
   </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
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
   <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: rgb(232, 232, 236); line-height: 1.2">Team Settings</h1>
   <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0">
    <a href="#" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Tomorrow', system-ui, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border: 1px solid transparent; border-radius: 10px; cursor: pointer; text-decoration: none; white-space: nowrap; padding: 6px 14px; font-size: 13px; background: rgb(77, 126, 247); color: rgb(232, 232, 236)">Invite Member</a>
   </div>
   </div>
   <p style="margin-top: 8px; margin-bottom: 0; color: rgb(160, 160, 176); font-size: 15px; line-height: 1.5">Manage roles, permissions, and invitations for your team.</p>
   </div>
</div>`,
    },
  ],

  seeAlso: ['breadcrumb', 'page-layout'],
};
