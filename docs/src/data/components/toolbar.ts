import type { ComponentDef } from './_types';

export const toolbar: ComponentDef = {
  name: 'Toolbar',
  slug: 'toolbar',
  tag: 'arc-toolbar',
  tier: 'layout',
  interactivity: 'hybrid',
  description: 'Horizontal toolbar with prefix, center, and suffix slots.',

  overview: `Toolbar is a horizontal action bar that groups related controls — buttons, dropdowns, search fields — into a consistent strip above or within a content region. It follows the classic three-slot pattern: the prefix slot anchors inline-start actions (like a file menu or back button), the center (default) slot holds a title or contextual info, and the suffix slot pins inline-end actions (like save, share, or settings). The v3 slot names start/end still work as deprecated aliases through v4.

The component renders with \`role="toolbar"\` for accessibility, signaling to screen readers that the contained controls are a logically grouped set. Two size variants are available: the default \`md\` size (48px height) for primary toolbars and the \`sm\` size (36px height) for secondary or nested toolbars. The \`border\` prop (on by default) adds a subtle bottom border to visually separate the toolbar from the content below.

When the \`sticky\` prop is set, the toolbar uses \`position: sticky\` with \`top: 0\` and a z-index of 50, keeping it visible as the user scrolls through long content. The toolbar background uses \`--bg-card\` to provide a slight elevation from the page surface. Combine Toolbar with SplitPane panels, code editors, or document viewers where contextual actions should remain accessible without scrolling.`,

  features: [
    'Three-slot layout: prefix (inline-start), center (flexible), suffix (inline-end)',
    '`role="toolbar"` for accessible grouping of related controls',
    'Two size variants: md (48px) and sm (36px) for primary and secondary toolbars',
    'Optional bottom border via the border prop (enabled by default)',
    'Sticky positioning with top: 0 and z-index: 50 when sticky is set',
    'Card-colored background (`--bg-card`) for subtle elevation above the page surface',
    'Exposed CSS parts (base, prefix, center, suffix) for targeted ::part() styling',
    'Consistent gap spacing (`--space-sm`) between slotted controls',
  ],

  guidelines: {
    do: [
      'Use Toolbar above content panels, editors, and detail views for contextual actions',
      'Place the most important action (e.g. Save) in the suffix slot where users expect it',
      'Use size="sm" for secondary toolbars nested inside panels or split panes',
      'Enable sticky for long scrollable content where the toolbar should remain visible',
      'Group related buttons together in each slot for visual clarity',
    ],
    dont: [
      'Do not use Toolbar as the primary site navigation — use TopBar or NavigationMenu instead',
      'Do not overload the toolbar with more than five or six controls; move overflow into a DropdownMenu',
      'Do not nest Toolbar inside another Toolbar — use a single toolbar with grouped slot content',
      'Do not disable the border prop when the toolbar sits above content with the same background color',
      'Do not use Toolbar for status information — use StatusBar for persistent informational displays',
    ],
  },

  previewHtml: `<div style="width:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <arc-toolbar border>
    <div slot="prefix" style="display:flex;align-items:center;gap:4px">
      <arc-button variant="ghost" size="sm">File</arc-button>
      <arc-button variant="ghost" size="sm">Edit</arc-button>
      <arc-button variant="ghost" size="sm">View</arc-button>
    </div>
    <span style="font-size:13px;color:var(--text-secondary);font-family:var(--font-body)">Document.txt</span>
    <div slot="suffix" style="display:flex;align-items:center;gap:4px">
      <arc-button variant="ghost" size="sm">Share</arc-button>
      <arc-button variant="primary" size="sm">Save</arc-button>
    </div>
  </arc-toolbar>
  <div style="padding:var(--space-lg);color:var(--text-muted);font-size:13px;font-family:var(--font-body);min-height:80px;display:flex;align-items:center;justify-content:center">
    Document content area
  </div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-toolbar border>
  <div slot="prefix"><arc-button variant="ghost" size="sm">File</arc-button></div>
  <span>Document.txt</span>
  <div slot="suffix"><arc-button variant="ghost" size="sm">Save</arc-button></div>
</arc-toolbar>`,
    },
    {
      label: 'Overflow',
      lang: 'html',
      code: `<!-- Items that no longer fit collapse (from the end) into a "More" menu.
     Collapsed originals stay in the light DOM with the hidden attribute;
     the menu shows text-label proxies that forward clicks to them. -->
<arc-toolbar overflow>
  <arc-button slot="prefix" variant="ghost" size="sm">File</arc-button>
  <arc-button slot="prefix" variant="ghost" size="sm">Edit</arc-button>
  <arc-button slot="prefix" variant="ghost" size="sm">View</arc-button>
  <arc-button slot="prefix" variant="ghost" size="sm">Insert</arc-button>
  <arc-button slot="prefix" variant="ghost" size="sm">Format</arc-button>
  <arc-icon-button slot="suffix" name="share" label="Share"></arc-icon-button>
  <arc-button slot="suffix" variant="primary" size="sm">Save</arc-button>
</arc-toolbar>

<script>
  document.querySelector('arc-toolbar')
    .addEventListener('arc-overflow-change', (e) => {
      console.log('hidden items:', e.detail.hiddenCount);
    });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Button, Toolbar } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Toolbar border>
      <div slot="prefix"><Button variant="ghost" size="sm">File</Button></div>
      <span>Document.txt</span>
      <div slot="suffix"><Button variant="ghost" size="sm">Save</Button></div>
    </Toolbar>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Button, Toolbar } from '@arclux/arc-ui-vue';
</script>

<template>
  <Toolbar border>
    <div slot="prefix"><Button variant="ghost" size="sm">File</Button></div>
    <span>Document.txt</span>
    <div slot="suffix"><Button variant="ghost" size="sm">Save</Button></div>
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
  <div slot="prefix"><Button variant="ghost" size="sm">File</Button></div>
  <span>Document.txt</span>
  <div slot="suffix"><Button variant="ghost" size="sm">Save</Button></div>
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
    <arc-toolbar border>
      <div slot="prefix"><arc-button variant="ghost" size="sm">File</arc-button></div>
      <span>Document.txt</span>
      <div slot="suffix"><arc-button variant="ghost" size="sm">Save</arc-button></div>
    </arc-toolbar>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Button, Toolbar } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Toolbar border>
      <div slot="prefix"><Button variant="ghost" size="sm">File</Button></div>
      <span>Document.txt</span>
      <div slot="suffix"><Button variant="ghost" size="sm">Save</Button></div>
    </Toolbar>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Button, Toolbar } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Toolbar border>
      <div slot="prefix"><Button variant="ghost" size="sm">File</Button></div>
      <span>Document.txt</span>
      <div slot="suffix"><Button variant="ghost" size="sm">Save</Button></div>
    </Toolbar>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-toolbar — requires toolbar.css + base.css (or arc-ui.css) -->
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
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
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
</div>`,
    },
  ],

  seeAlso: ['button', 'icon-button', 'segmented-control'],
};
