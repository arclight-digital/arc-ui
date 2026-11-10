import type { ComponentDef } from './_types';

export const toolbar: ComponentDef = {
  name: 'Toolbar',
  slug: 'toolbar',
  tag: 'arc-toolbar',
  tier: 'layout',
  interactivity: 'hybrid',
  description: 'Horizontal toolbar with prefix, center, and suffix slots.',

  overview: `Toolbar is a horizontal strip of controls (buttons, dropdowns, a search field) above or inside a content region. The \`prefix\` slot holds start-edge actions such as a file menu or a back button, the default slot holds a title or context in the middle, and \`suffix\` holds end-edge actions such as Save or Share.

It has \`role="toolbar"\`, so screen readers treat its controls as one group. \`size\` sets the height: \`md\` (the default) is 48px for a main toolbar, \`sm\` is 36px for a secondary or nested one, and \`lg\` is 60px for a prominent app bar. A bottom border is on by default, and \`no-border\` removes it.

With \`overflow\` set, items that don't fit the width are hidden from the end and listed in a "More" menu, whose icon button follows \`size\`. With \`sticky\` set, the toolbar sticks to \`top: 0\` at \`z-index: 50\` as the content scrolls.`,

  features: [
    'Background is `--surface-raised`',
    'Slotted controls are spaced by `--space-sm`',
  ],

  guidelines: {
    do: [
      'Use it above content panels, editors and detail views for actions on that content',
      'Put the main action, such as Save, in the `suffix` slot',
      'Use `size="sm"` for a secondary toolbar inside a panel or split pane',
      'Set `sticky` over long scrolling content so the toolbar stays in view',
      'Group related buttons in the same slot',
    ],
    dont: [
      'Don\'t use it as the main site navigation. Use TopBar or NavigationMenu',
      'Don\'t put more than five or six controls in it. Move the rest into a DropdownMenu',
      'Don\'t turn off the border when the toolbar sits on content with the same background color',
      'Don\'t use it for status information. Use StatusBar',
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
