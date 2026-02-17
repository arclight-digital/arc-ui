import type { ComponentDef } from './_types';

export const topBar: ComponentDef = {
    name: 'Top Bar',
    slug: 'top-bar',
    tag: 'arc-top-bar',
    tier: 'navigation',
    interactivity: 'hybrid',
    description: 'Fixed header bar that anchors every page with a brand slot on the left, an optional center navigation area, and a right-aligned actions region for user controls, search, and settings.',

    overview: `TopBar is the persistent horizontal header that sits at the top of every page in an ARC UI application. It provides three clearly defined regions — brand, center, and actions — that map to the universal header pattern found in virtually every modern web app: logo on the left, navigation in the middle, and user controls on the right.

The component is designed to work hand-in-hand with AppShell and Sidebar. When nested inside an AppShell via the \`top-bar\` slot, it automatically spans the full viewport width and stays fixed at the top of the page while the content below scrolls. On mobile viewports, a hamburger menu button appears automatically, dispatching an \`arc-sidebar-toggle\` event that AppShell listens for to open or close the Sidebar overlay.

Use TopBar whenever your application needs a consistent, recognizable header. It handles responsive behavior out of the box: the brand slot collapses gracefully, the center slot hides on narrow screens, and the actions slot remains accessible at every breakpoint. The \`fixed\` property pins the bar to the viewport so content scrolls underneath it, which is the recommended default for most dashboard and documentation layouts.`,

    features: [
      'Three named slots (logo, center, actions) for flexible header composition',
      'Fixed positioning mode that pins the bar to the top of the viewport',
      'Built-in responsive hamburger menu button that appears on mobile breakpoints',
      'Dispatches arc-sidebar-toggle custom event for Sidebar integration',
      'Brand region with accent typography, letter-spacing, and uppercase treatment',
      'Seamless integration with AppShell via the top-bar slot',
      'CSS custom property theming through design tokens (--bg-deep, --border-subtle, --nav-height)',
      'Shadow DOM part attributes (topbar, brand, center, menu-btn) for external styling',
      'Accessible aria-label and aria-expanded on the mobile menu toggle',
    ],

    guidelines: {
      do: [
        'Place TopBar inside an AppShell top-bar slot for automatic fixed positioning and sidebar coordination',
        'Keep the heading short — one or two words that identify the application',
        'Use the logo slot to place an SVG or image mark next to the heading text',
        'Put primary navigation links in the center slot for desktop layouts',
        'Reserve the actions slot for user-facing controls: avatar, settings, notifications, sign-in',
        'Set the fixed property when the page content is scrollable and the header should stay visible',
        'Listen for the arc-sidebar-toggle event to synchronize sidebar open/close state',
      ],
      dont: [
        'Stack multiple TopBars on the same page — use one per application shell',
        'Put long text or paragraphs in the heading prop; it is meant for a brand name only',
        'Place form elements or search inputs in the brand area; use the center or actions slot instead',
        'Rely solely on the hamburger button for primary navigation on desktop — it is hidden above 768px',
        'Override the z-index without checking that modals and drawers still layer correctly',
        'Omit the heading entirely without providing a logo slot — the brand region should never be empty',
      ],
    },

    previewHtml: `<div style="width:100%;">
  <arc-top-bar heading="Arclight">
    <svg slot="logo" width="28" height="28" viewBox="0 0 28 28" fill="none" style="flex-shrink:0;">
      <circle cx="14" cy="14" r="13" stroke="rgb(77,126,247)" stroke-width="2"/>
      <path d="M9 18l5-10 5 10" stroke="rgb(77,126,247)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="10.5" y1="15" x2="17.5" y2="15" stroke="rgb(77,126,247)" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <nav slot="center" style="display:flex;gap:24px;">
      <arc-link href="#">Dashboard</arc-link>
      <arc-link href="#">Projects</arc-link>
      <arc-link href="#">Settings</arc-link>
    </nav>
    <div slot="actions" style="display:flex;align-items:center;gap:12px;">
      <arc-icon-button name="gear" variant="ghost" size="sm" aria-label="Settings"></arc-icon-button>
      <arc-avatar size="sm" initials="JD" aria-label="Jane Doe"></arc-avatar>
    </div>
  </arc-top-bar>
</div>`,

    props: [
      {
        name: 'heading',
        type: 'string',
        default: "''",
        description: 'Brand text displayed in the top-left corner next to the optional logo slot. Rendered with the accent font family (Tektur), uppercase, and wide letter-spacing. Keep this to one or two words that identify the application.',
      },
      {
        name: 'fixed',
        type: 'boolean',
        default: 'false',
        description: 'When true, the bar uses position: fixed so it stays at the top of the viewport while content scrolls underneath. Automatically applied when TopBar is placed inside an AppShell. Be sure to add matching top padding to the content below to prevent overlap.',
      },
      {
        name: 'menu-open',
        type: 'boolean',
        default: 'false',
        description: 'Reflects whether the mobile hamburger menu is open. Toggling this value updates the aria-expanded attribute on the menu button. Typically managed by AppShell in response to the arc-sidebar-toggle event rather than set directly.',
      },
      {
        name: 'nav-align',
        type: 'string',
        default: "'center'",
        description: "Controls the alignment of content in the center slot. Options: 'left', 'center', 'right'. Pulls nav toward the brand or actions without reordering DOM.",
      },
      { name: 'contained', type: 'string', default: "''", description: 'Sets a max-width containment on the top bar content area. Accepts any CSS length or named size.' },
      { name: 'mobile-menu', type: 'string', default: "''", description: 'Controls the mobile menu behavior. When set to a value like "nav", the hamburger toggles an inline navigation panel instead of triggering sidebar toggle.' },
      { name: 'menu-position', type: 'string', default: "''", description: 'Position of the mobile menu panel when mobile-menu is active.' },
    ],
    events: [
      { name: 'arc-sidebar-toggle', description: 'Fired when the mobile menu toggle is clicked (sidebar mode)' },
      { name: 'arc-mobile-menu-toggle', description: 'Fired when the mobile hamburger button is clicked and mobile-menu mode is active. Use this to toggle your own mobile navigation panel.' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-top-bar heading="Arclight">
  <svg slot="logo" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="2"/>
    <path d="M9 18l5-10 5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="10.5" y1="15" x2="17.5" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <nav slot="center" style="display:flex;gap:24px;">
    <arc-link href="#">Dashboard</arc-link>
    <arc-link href="#">Projects</arc-link>
    <arc-link href="#">Settings</arc-link>
  </nav>
  <div slot="actions" style="display:flex;align-items:center;gap:12px;">
    <arc-icon-button name="gear" variant="ghost" size="sm" aria-label="Settings"></arc-icon-button>
    <arc-avatar size="sm" initials="JD" aria-label="Jane Doe"></arc-avatar>
  </div>
</arc-top-bar>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Avatar, IconButton, Link, TopBar } from '@arclux/arc-ui-react';

export function AppHeader() {
  return (
    <TopBar heading="Arclight">
      <svg slot="logo" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 18l5-10 5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="10.5" y1="15" x2="17.5" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <nav slot="center" style={{ display: 'flex', gap: 24 }}>
        <Link href="#">Dashboard</Link>
        <Link href="#">Projects</Link>
        <Link href="#">Settings</Link>
      </nav>
      <div slot="actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconButton icon="settings" variant="ghost" size="sm" aria-label="Settings" />
        <Avatar size="sm" initials="JD" aria-label="Jane Doe" />
      </div>
    </TopBar>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Avatar, IconButton, Link, TopBar } from '@arclux/arc-ui-vue';
</script>

<template>
  <TopBar heading="Arclight">
    <svg slot="logo" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="2"/>
      <path d="M9 18l5-10 5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="10.5" y1="15" x2="17.5" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <nav slot="center" style="display:flex;gap:24px;">
      <Link href="#">Dashboard</Link>
      <Link href="#">Projects</Link>
      <Link href="#">Settings</Link>
    </nav>
    <div slot="actions" style="display:flex;align-items:center;gap:12px;">
      <IconButton icon="settings" variant="ghost" size="sm" aria-label="Settings" />
      <Avatar size="sm" initials="JD" aria-label="Jane Doe" />
    </div>
  </TopBar>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Avatar, IconButton, Link, TopBar } from '@arclux/arc-ui-svelte';
</script>

<TopBar heading="Arclight">
  <svg slot="logo" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="2"/>
    <path d="M9 18l5-10 5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="10.5" y1="15" x2="17.5" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <nav slot="center" style="display:flex;gap:24px;">
    <Link href="#">Dashboard</Link>
    <Link href="#">Projects</Link>
    <Link href="#">Settings</Link>
  </nav>
  <div slot="actions" style="display:flex;align-items:center;gap:12px;">
    <IconButton icon="settings" variant="ghost" size="sm" aria-label="Settings" />
    <Avatar size="sm" initials="JD" aria-label="Jane Doe" />
  </div>
</TopBar>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Avatar, IconButton, Link, TopBar } from '@arclux/arc-ui-angular';

@Component({
  imports: [Avatar, IconButton, Link, TopBar],
  template: \`
    <TopBar heading="Arclight">
      <svg slot="logo" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="2"/>
        <path d="M9 18l5-10 5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="10.5" y1="15" x2="17.5" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <nav slot="center" style="display:flex;gap:24px;">
        <Link href="#">Dashboard</Link>
        <Link href="#">Projects</Link>
        <Link href="#">Settings</Link>
      </nav>
      <div slot="actions" style="display:flex;align-items:center;gap:12px;">
        <IconButton icon="settings" variant="ghost" size="sm" aria-label="Settings" />
        <Avatar size="sm" initials="JD" aria-label="Jane Doe" />
      </div>
    </TopBar>
  \`,
})
export class AppHeaderComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Avatar, IconButton, Link, TopBar } from '@arclux/arc-ui-solid';

export function AppHeader() {
  return (
    <TopBar heading="Arclight">
      <svg slot="logo" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="2"/>
        <path d="M9 18l5-10 5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="10.5" y1="15" x2="17.5" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <nav slot="center" style={{ display: 'flex', gap: '24px' }}>
        <Link href="#">Dashboard</Link>
        <Link href="#">Projects</Link>
        <Link href="#">Settings</Link>
      </nav>
      <div slot="actions" style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
        <IconButton icon="settings" variant="ghost" size="sm" aria-label="Settings" />
        <Avatar size="sm" initials="JD" aria-label="Jane Doe" />
      </div>
    </TopBar>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Avatar, IconButton, Link, TopBar } from '@arclux/arc-ui-preact';

export function AppHeader() {
  return (
    <TopBar heading="Arclight">
      <svg slot="logo" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 18l5-10 5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="10.5" y1="15" x2="17.5" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <nav slot="center" style={{ display: 'flex', gap: 24 }}>
        <Link href="#">Dashboard</Link>
        <Link href="#">Projects</Link>
        <Link href="#">Settings</Link>
      </nav>
      <div slot="actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconButton icon="settings" variant="ghost" size="sm" aria-label="Settings" />
        <Avatar size="sm" initials="JD" aria-label="Jane Doe" />
      </div>
    </TopBar>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-top-bar — requires top-bar.css + base.css (or arc-ui.css) -->
<div class="arc-top-bar">
  <header class="topbar">
   <button class="topbar__menu-btn" aria-label="Toggle menu" aria-expanded="false">
   <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
   <rect y="3" width="20" height="2" rx="1"/>
   <rect y="9" width="20" height="2" rx="1"/>
   <rect y="15" width="20" height="2" rx="1"/>
   </svg>
   </button>
   <a class="topbar__brand" href="/">

   Heading
   </a>
   <div class="topbar__center">

   </div>
   <div class="topbar__actions">

   </div>
   </header>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-top-bar — self-contained, no external CSS needed -->
<style>
  @media (max-width: 768px) {
    .arc-top-bar .topbar__menu-btn { display: flex; }
  }
  .arc-top-bar .topbar__menu-btn:hover { background: rgba(255, 255, 255, 0.05); }
</style>
<div class="arc-top-bar" style="display: block; width: 100%; z-index: 100">
  <header class="topbar" style="display: flex; align-items: center; height: 64px; padding: 0 24px; background: rgb(3, 3, 7); border-bottom: 1px solid rgb(24, 24, 30); gap: 16px">
   <button class="topbar__menu-btn" style="display: none; background: none; border: none; color: rgb(232, 232, 236); cursor: pointer; padding: 4px; border-radius: 4px" aria-label="Toggle menu" aria-expanded="false">
   <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
   <rect y="3" width="20" height="2" rx="1"/>
   <rect y="9" width="20" height="2" rx="1"/>
   <rect y="15" width="20" height="2" rx="1"/>
   </svg>
   </button>
   <a style="display: flex; align-items: center; gap: 8px; font-family: 'Tektur', system-ui, sans-serif; font-size: clamp(20px, 2.5vw, 28px); font-weight: 500; letter-spacing: clamp(8px, 1.2vw, 14px); text-transform: uppercase; color: rgb(232, 232, 236); text-decoration: none; flex-shrink: 0" href="/">

   Heading
   </a>
   <div style="flex: 1; display: flex; align-items: center; justify-content: center">

   </div>
   <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0">

   </div>
   </header>
</div>` }
    ],
  
  seeAlso: ["sidebar","navigation-menu","footer","app-shell"],
};
