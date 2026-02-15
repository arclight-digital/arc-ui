import type { ComponentDef } from './_types';

export const statusBar: ComponentDef = {
    name: 'Status Bar',
    slug: 'status-bar',
    tag: 'arc-status-bar',
    tier: 'layout',
    interactivity: 'static',
    description: 'Bottom status bar with start, center, and end slots.',

    overview: `StatusBar is a compact informational strip designed to sit at the bottom of an application window, mirroring the pattern found in code editors, terminals, and desktop applications. It renders at a fixed 28px height with a monospace font (\`--font-mono\`) and muted text color, providing an unobtrusive surface for status indicators, cursor positions, encoding info, and connection states.

The component uses a three-region flexbox layout with named slots: \`start\` (flex-shrink: 0, anchored to the leading edge), default (centered, flex: 1), and \`end\` (flex-shrink: 0, anchored to the trailing edge via margin-left: auto). This pattern ensures the left and right indicators stay pinned to their edges while center content fills the remaining space.

The \`position\` prop controls whether the status bar flows with the page layout (\`static\`, the default) or sticks to the bottom of the viewport (\`fixed\`). Fixed positioning sets \`bottom: 0\`, \`left: 0\`, \`right: 0\` with a z-index of 100, making the bar persistent across scrolling. The bar renders with \`role="status"\` for screen reader announcements of dynamic content changes.`,

    features: [
      'Compact 28px height with monospace font for data-dense status information',
      'Three-slot layout: start (pinned), center (flexible), end (pinned)',
      'Static or fixed positioning via the position prop',
      'Fixed mode pins to viewport bottom with z-index: 100',
      'role="status" for accessible live-region announcements',
      'Dark background (--bg-deep) with subtle top border for visual separation',
      'Exposed CSS parts (base, start, center, end) for targeted styling',
      'Muted 11px text that stays out of the way of primary content',
    ],

    guidelines: {
      do: [
        'Use StatusBar for editor-style applications that need persistent status indicators',
        'Place cursor position, line numbers, or encoding info in the start slot',
        'Put connection status, sync state, or version info in the end slot',
        'Use the center slot for transient messages like "Saved" or "Building..."',
        'Set position="fixed" when the status bar should persist during scrolling',
      ],
      dont: [
        'Use StatusBar as a primary navigation bar -- use TopBar or Toolbar instead',
        'Place interactive buttons or form controls in the status bar -- keep it informational',
        'Set position="fixed" in layouts where AppShell already manages the bottom edge',
        'Override the 28px height -- the compact size is intentional for information density',
        'Use StatusBar for toast-style notifications -- use Toast or Alert for user-facing messages',
      ],
    },

    previewHtml: `<div style="width:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <arc-status-bar>
    <span slot="start" style="display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--accent-green)"></span>
      Ln 24, Col 15
    </span>
    <span>UTF-8 &middot; LF &middot; TypeScript</span>
    <span slot="end">Spaces: 2 &middot; 100%</span>
  </arc-status-bar>
</div>`,

    props: [
      { name: 'position', type: "'static' | 'fixed'", default: "'static'", description: 'Controls whether the status bar flows with the document (static) or pins to the bottom of the viewport (fixed). Fixed mode sets bottom: 0, left: 0, right: 0 with z-index: 100.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-status-bar>
  <div slot="start">Ln 24, Col 15</div>
  <div>UTF-8</div>
  <div slot="end">100%</div>
</arc-status-bar>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { StatusBar } from '@arclux/arc-ui-react';

<StatusBar>
  <div slot="start">Ln 24, Col 15</div>
  <div>UTF-8</div>
  <div slot="end">100%</div>
</StatusBar>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { StatusBar } from '@arclux/arc-ui-vue';
</script>

<template>
  <StatusBar>
    <div slot="start">Ln 24, Col 15</div>
    <div>UTF-8</div>
    <div slot="end">100%</div>
  </StatusBar>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { StatusBar } from '@arclux/arc-ui-svelte';
</script>

<StatusBar>
  <div slot="start">Ln 24, Col 15</div>
  <div>UTF-8</div>
  <div slot="end">100%</div>
</StatusBar>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { StatusBar } from '@arclux/arc-ui-angular';

@Component({
  imports: [StatusBar],
  template: \`
    <StatusBar>
      <div slot="start">Ln 24, Col 15</div>
      <div>UTF-8</div>
      <div slot="end">100%</div>
    </StatusBar>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { StatusBar } from '@arclux/arc-ui-solid';

<StatusBar>
  <div slot="start">Ln 24, Col 15</div>
  <div>UTF-8</div>
  <div slot="end">100%</div>
</StatusBar>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { StatusBar } from '@arclux/arc-ui-preact';

<StatusBar>
  <div slot="start">Ln 24, Col 15</div>
  <div>UTF-8</div>
  <div slot="end">100%</div>
</StatusBar>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-status-bar — requires status-bar.css + base.css (or arc-ui.css) -->
<div class="arc-status-bar">
  <div class="status-bar" role="status">
   <div class="status-bar__left">

   </div>
   <div class="status-bar__center">
   Status Bar
   </div>
   <div class="status-bar__right">

   </div>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-status-bar — self-contained, no external CSS needed -->
<div class="arc-status-bar" style="display: block; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: rgb(124, 124, 137)">
  <div style="display: flex; align-items: center; height: 28px; padding: 0 8px; background: rgb(3, 3, 7); border-top: 1px solid rgb(24, 24, 30); gap: 8px" role="status">
   <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0">

   </div>
   <div style="display: flex; align-items: center; gap: 8px; flex: 1; justify-content: center">
   Status Bar
   </div>
   <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: auto">

   </div>
   </div>
</div>` }
    ],
  
  seeAlso: ["top-bar","footer","badge"],
};
