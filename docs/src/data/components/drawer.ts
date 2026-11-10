import type { ComponentDef } from './_types';

export const drawer: ComponentDef = {
  name: 'Drawer',
  slug: 'drawer',
  tag: 'arc-drawer',
  tier: 'navigation',
  interactivity: 'interactive',
  searchKeywords: ['side panel'],
  description:
    'A panel that slides in from the left or right edge, for navigation menus, filters and detail views.',

  overview: `Drawer is a panel that slides in from the left or right edge of the viewport, set by \`position\`. Use it for a mobile navigation menu, a filter panel or a detail view, without leaving the current page. It has a header with the \`heading\` and a close button, and a body that scrolls.

By default it's modal. It's a native \`<dialog>\`, so the page behind is inert, dimmed by a backdrop and scroll-locked until it closes. With \`no-modal\` it floats over a page that stays usable: no backdrop, no scroll lock, and opening it leaves focus where it was. Escape still closes it while focus is inside.

The close button, Escape and a backdrop click all fire \`arc-close\`. The event is cancelable, so \`preventDefault()\` keeps the drawer open.

Choose Drawer over Dialog for navigation, for tall content that needs to scroll, or, with \`no-modal\`, when people need to keep using the page beside it. For a decision the user has to make before going on, use Dialog.`,

  features: [
    '300px wide by default and never more than 85vw, so some of the page always shows',
    "`heading` is also the panel's accessible name",
    "The backdrop is `::backdrop`, which can't be a CSS part. Style it with `--drawer-backdrop`",
  ],

  guidelines: {
    do: [
      'Use `position="left"` for navigation menus and `position="right"` for details, filters and settings',
      "Write a short heading that says what's in the panel",
      'Listen for `arc-close` and update your own open state',
    ],
    dont: [
      "Don't use it for critical confirmations. Use Dialog",
      "Don't put long multi-step forms in it. Use a full page or a Dialog",
      "Don't open it on page load. Open it when someone asks for it",
    ],
  },

  previewHtml: `<div style="width:100%">
  <arc-button id="open-nav-drawer" variant="secondary">
    <svg slot="prefix" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right:4px">
      <path d="M2 3.5h12a.5.5 0 010 1H2a.5.5 0 010-1zm0 4h12a.5.5 0 010 1H2a.5.5 0 010-1zm0 4h12a.5.5 0 010 1H2a.5.5 0 010-1z"/>
    </svg>
    Menu
  </arc-button>
  <arc-drawer id="nav-drawer" heading="Navigation" position="left">
    <nav style="display:flex; flex-direction:column; gap:2px; padding:8px;">
      <a href="#" style="display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:6px; color:var(--text-primary); text-decoration:none; background:rgba(255,255,255,0.06); font-size:14px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.25l6.5 5.5V14a.75.75 0 01-.75.75H10V10H6v4.75H2.25A.75.75 0 011.5 14V6.75L8 1.25z"/></svg>
        Dashboard
      </a>
      <a href="#" style="display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:6px; color:var(--text-secondary); text-decoration:none; font-size:14px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 1v3h8V4H4zm0 5v3h3V9H4zm5 0v3h3V9H9z"/></svg>
        Projects
      </a>
      <a href="#" style="display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:6px; color:var(--text-secondary); text-decoration:none; font-size:14px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5l2.1 1.26a.75.75 0 01-.76 1.3L7.75 9V4.75z"/></svg>
        Activity
      </a>
      <a href="#" style="display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:6px; color:var(--text-secondary); text-decoration:none; font-size:14px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2.5 2.5 0 00-2.5 2.5v1.17A4.001 4.001 0 003 8.5V11l-1 2h12l-1-2V8.5a4.001 4.001 0 00-2.5-3.83V3.5A2.5 2.5 0 008 1zM6.5 14a1.5 1.5 0 003 0h-3z"/></svg>
        Notifications
      </a>
      <div style="border-top:1px solid var(--border-subtle); margin:8px 0;"></div>
      <a href="#" style="display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:6px; color:var(--text-secondary); text-decoration:none; font-size:14px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a3 3 0 100 6 3 3 0 000-6zM3 13a5 5 0 0110 0v.5a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V13z"/></svg>
        Profile
      </a>
      <a href="#" style="display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:6px; color:var(--text-secondary); text-decoration:none; font-size:14px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a1.75 1.75 0 00-.618 3.39A5.724 5.724 0 004.5 7.96V9.5H3v1h1.5V12H3v1h1.5v1.25a.75.75 0 001.5 0V13h4v1.25a.75.75 0 001.5 0V13H13v-1h-1.5v-1.5H13v-1h-1.5V7.96a5.724 5.724 0 00-2.882-3.07A1.75 1.75 0 008 1.5z"/></svg>
        Settings
      </a>
    </nav>
  </arc-drawer>
</div>`,

  previewSetup: `const openBtn = el.querySelector('#open-nav-drawer'); const drawer = el.querySelector('#nav-drawer'); openBtn?.addEventListener('click', () => { if (drawer) drawer.open = true; });`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-button id="open-nav-drawer">Menu</arc-button>
<arc-drawer id="nav-drawer" heading="Navigation" position="left">
  <nav style="display:flex; flex-direction:column; gap:4px; padding:8px;">
    <a href="/dashboard" style="padding:10px 12px; border-radius:6px; color:var(--text-primary); text-decoration:none;">Dashboard</a>
    <a href="/projects" style="padding:10px 12px; border-radius:6px; color:var(--text-secondary); text-decoration:none;">Projects</a>
    <a href="/activity" style="padding:10px 12px; border-radius:6px; color:var(--text-secondary); text-decoration:none;">Activity</a>
    <a href="/settings" style="padding:10px 12px; border-radius:6px; color:var(--text-secondary); text-decoration:none;">Settings</a>
  </nav>
</arc-drawer>

<script>
  const openBtn = document.querySelector('#open-nav-drawer');
  const drawer = document.querySelector('#nav-drawer');
  openBtn.addEventListener('click', () => { drawer.open = true; });
  drawer.addEventListener('arc-close', () => { drawer.open = false; });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { useState } from 'react';
import { Button, Drawer } from '@arclux/arc-ui-react';

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Menu</Button>
      <Drawer open={open} heading="Navigation" position="left" onArcClose={() => setOpen(false)}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 8 }}>
          <a href="/dashboard">Dashboard</a>
          <a href="/projects">Projects</a>
          <a href="/activity">Activity</a>
          <a href="/settings">Settings</a>
        </nav>
      </Drawer>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { Button, Drawer } from '@arclux/arc-ui-vue';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Menu</Button>
  <Drawer :open="open" heading="Navigation" position="left" @arc-close="open = false">
    <nav style="display:flex; flex-direction:column; gap:4px; padding:8px;">
      <a href="/dashboard">Dashboard</a>
      <a href="/projects">Projects</a>
      <a href="/activity">Activity</a>
      <a href="/settings">Settings</a>
    </nav>
  </Drawer>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Button, Drawer } from '@arclux/arc-ui-svelte';

  let open = $state(false);
</script>

<Button onclick={() => open = true}>Menu</Button>
<Drawer {open} heading="Navigation" position="left" on:arc-close={() => open = false}>
  <nav style="display:flex; flex-direction:column; gap:4px; padding:8px;">
    <a href="/dashboard">Dashboard</a>
    <a href="/projects">Projects</a>
    <a href="/activity">Activity</a>
    <a href="/settings">Settings</a>
  </nav>
</Drawer>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Button, Drawer } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, Drawer],
  template: \`
    <arc-button (click)="open = true">Menu</arc-button>
    <arc-drawer [open]="open" heading="Navigation" position="left" (arcClose)="open = false">
      <nav style="display:flex; flex-direction:column; gap:4px; padding:8px;">
        <a href="/dashboard">Dashboard</a>
        <a href="/projects">Projects</a>
        <a href="/activity">Activity</a>
        <a href="/settings">Settings</a>
      </nav>
    </arc-drawer>
  \`,
})
export class MobileNavComponent {
  open = false;
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { createSignal } from 'solid-js';
import { Button, Drawer } from '@arclux/arc-ui-solid';

function MobileNav() {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Menu</Button>
      <Drawer open={open()} heading="Navigation" position="left" onArcClose={() => setOpen(false)}>
        <nav style={{ display: 'flex', 'flex-direction': 'column', gap: '4px', padding: '8px' }}>
          <a href="/dashboard">Dashboard</a>
          <a href="/projects">Projects</a>
          <a href="/activity">Activity</a>
          <a href="/settings">Settings</a>
        </nav>
      </Drawer>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { useState } from 'preact/hooks';
import { Button, Drawer } from '@arclux/arc-ui-preact';

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Menu</Button>
      <Drawer open={open} heading="Navigation" position="left" onArcClose={() => setOpen(false)}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 8 }}>
          <a href="/dashboard">Dashboard</a>
          <a href="/projects">Projects</a>
          <a href="/activity">Activity</a>
          <a href="/settings">Settings</a>
        </nav>
      </Drawer>
    </>
  );
}`,
    },
  ],

  seeAlso: ['dialog', 'sheet', 'sidebar'],
};
