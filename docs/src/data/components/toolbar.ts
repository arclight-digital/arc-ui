import type { ComponentDef } from './_types';

export const toolbar: ComponentDef = {
    name: 'Toolbar',
    slug: 'toolbar',
    tag: 'arc-toolbar',
    tier: 'layout',
    interactivity: 'hybrid',
    description: 'Horizontal toolbar with start, center, and end slots.',

    overview: `Toolbar is a horizontal action bar that groups related controls -- buttons, dropdowns, search fields -- into a consistent strip above or within a content region. It follows the classic start/center/end three-slot pattern: the start slot anchors left-aligned actions (like a file menu or back button), the center slot holds a title or contextual info, and the end slot pins right-aligned actions (like save, share, or settings).

The component renders with \`role="toolbar"\` for accessibility, signaling to screen readers that the contained controls are a logically grouped set. Two size variants are available: the default \`md\` size (48px height) for primary toolbars and the \`sm\` size (36px height) for secondary or nested toolbars. The \`border\` prop (on by default) adds a subtle bottom border to visually separate the toolbar from the content below.

When the \`sticky\` prop is set, the toolbar uses \`position: sticky\` with \`top: 0\` and a z-index of 50, keeping it visible as the user scrolls through long content. The toolbar background uses \`--bg-card\` to provide a slight elevation from the page surface. Combine Toolbar with SplitPane panels, code editors, or document viewers where contextual actions should remain accessible without scrolling.`,

    features: [
      'Three-slot layout: start (left-pinned), center (flexible), end (right-pinned)',
      'role="toolbar" for accessible grouping of related controls',
      'Two size variants: md (48px) and sm (36px) for primary and secondary toolbars',
      'Optional bottom border via the border prop (enabled by default)',
      'Sticky positioning with top: 0 and z-index: 50 when sticky is set',
      'Card-colored background (--bg-card) for subtle elevation above the page surface',
      'Exposed CSS parts (base, start, center, end) for targeted ::part() styling',
      'Consistent gap spacing (--space-sm) between slotted controls',
    ],

    guidelines: {
      do: [
        'Use Toolbar above content panels, editors, and detail views for contextual actions',
        'Place the most important action (e.g. Save) in the end slot where users expect it',
        'Use size="sm" for secondary toolbars nested inside panels or split panes',
        'Enable sticky for long scrollable content where the toolbar should remain visible',
        'Group related buttons together in each slot for visual clarity',
      ],
      dont: [
        'Use Toolbar as the primary site navigation -- use TopBar or NavigationMenu instead',
        'Overload the toolbar with more than five or six controls; move overflow into a DropdownMenu',
        'Nest Toolbar inside another Toolbar -- use a single toolbar with grouped slot content',
        'Disable the border prop when the toolbar sits above content with the same background color',
        'Use Toolbar for status information -- use StatusBar for persistent informational displays',
      ],
    },

    previewHtml: `<div style="width:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <arc-toolbar border>
    <div slot="start" style="display:flex;align-items:center;gap:4px">
      <arc-button variant="ghost" size="sm">File</arc-button>
      <arc-button variant="ghost" size="sm">Edit</arc-button>
      <arc-button variant="ghost" size="sm">View</arc-button>
    </div>
    <span style="font-size:13px;color:var(--text-secondary);font-family:var(--font-body)">Document.txt</span>
    <div slot="end" style="display:flex;align-items:center;gap:4px">
      <arc-button variant="ghost" size="sm">Share</arc-button>
      <arc-button variant="primary" size="sm">Save</arc-button>
    </div>
  </arc-toolbar>
  <div style="padding:var(--space-lg);color:var(--text-muted);font-size:13px;font-family:var(--font-body);min-height:80px;display:flex;align-items:center;justify-content:center">
    Document content area
  </div>
</div>`,

    props: [
      { name: 'sticky', type: 'boolean', default: 'false', description: 'When set, the toolbar uses position: sticky with top: 0 and z-index: 50, keeping it visible as the user scrolls through content below.' },
      { name: 'size', type: "'md' | 'sm'", default: "'md'", description: 'Controls the toolbar height. The default md size is 48px for primary toolbars. The sm size is 36px for secondary or nested toolbars.' },
      { name: 'border', type: 'boolean', default: 'true', description: 'Renders a subtle bottom border (--border-subtle) to visually separate the toolbar from the content below. Enabled by default.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-toolbar border>
  <div slot="start"><arc-button variant="ghost" size="sm">File</arc-button></div>
  <span>Document.txt</span>
  <div slot="end"><arc-button variant="ghost" size="sm">Save</arc-button></div>
</arc-toolbar>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Button, Toolbar } from '@arclux/arc-ui-react';

<Toolbar border>
  <div slot="start"><Button variant="ghost" size="sm">File</Button></div>
  <span>Document.txt</span>
  <div slot="end"><Button variant="ghost" size="sm">Save</Button></div>
</Toolbar>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Button, Toolbar } from '@arclux/arc-ui-vue';
</script>

<template>
  <Toolbar border>
    <div slot="start"><Button variant="ghost" size="sm">File</Button></div>
    <span>Document.txt</span>
    <div slot="end"><Button variant="ghost" size="sm">Save</Button></div>
  </Toolbar>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Button, Toolbar } from '@arclux/arc-ui-svelte';
</script>

<Toolbar border>
  <div slot="start"><Button variant="ghost" size="sm">File</Button></div>
  <span>Document.txt</span>
  <div slot="end"><Button variant="ghost" size="sm">Save</Button></div>
</Toolbar>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Button, Toolbar } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, Toolbar],
  template: \`
    <Toolbar border>
      <div slot="start"><Button variant="ghost" size="sm">File</Button></div>
      <span>Document.txt</span>
      <div slot="end"><Button variant="ghost" size="sm">Save</Button></div>
    </Toolbar>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Button, Toolbar } from '@arclux/arc-ui-solid';

<Toolbar border>
  <div slot="start"><Button variant="ghost" size="sm">File</Button></div>
  <span>Document.txt</span>
  <div slot="end"><Button variant="ghost" size="sm">Save</Button></div>
</Toolbar>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Button, Toolbar } from '@arclux/arc-ui-preact';

<Toolbar border>
  <div slot="start"><Button variant="ghost" size="sm">File</Button></div>
  <span>Document.txt</span>
  <div slot="end"><Button variant="ghost" size="sm">Save</Button></div>
</Toolbar>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-toolbar — requires toolbar.css + tokens.css (or arc-ui.css) -->
<div class="arc-toolbar">
  <div class="toolbar" role="toolbar">
   <div class="toolbar__start">

   </div>
   <div class="toolbar__center">
   Toolbar
   </div>
   <div class="toolbar__end">

   </div>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-toolbar — self-contained, no external CSS needed -->
<div class="arc-toolbar" style="display: block; font-family: 'Host Grotesk', system-ui, sans-serif">
  <div style="display: flex; align-items: center; height: 48px; padding: 0 16px; background: rgb(13, 13, 18); gap: 8px" role="toolbar">
   <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0">

   </div>
   <div style="display: flex; align-items: center; gap: 8px; flex: 1; justify-content: center">
   Toolbar
   </div>
   <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: auto">

   </div>
   </div>
</div>` }
    ],
  };
