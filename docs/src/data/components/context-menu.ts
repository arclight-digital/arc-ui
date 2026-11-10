import type { ComponentDef } from './_types';

export const contextMenu: ComponentDef = {
  name: 'Context Menu',
  slug: 'context-menu',
  tag: 'arc-context-menu',
  tier: 'feedback',
  interactivity: 'interactive',
  description: 'Replaces the browser\'s right-click menu inside one element with a menu of your own items.',

  overview: `ContextMenu replaces the browser's right-click menu inside one element. It listens for \`contextmenu\` on its parent, so a right-click anywhere in the parent opens the menu at the pointer, flipped away from the viewport edges. Items are \`<arc-menu-item>\` children with an optional \`icon\`, \`shortcut\` hint and \`disabled\`. \`<arc-menu-divider>\` separates them and \`<arc-menu-label>\` heads a named group.

Choosing an item fires \`arc-select\` with its \`value\`, or its label if it has none, and closes the menu. Escape or a click outside also closes it. \`arc-open\` fires on every right-click, including one that only moves an open menu. \`arc-close\` fires when it closes and is cancelable.

The menu takes focus when it opens. Arrow Down and Arrow Up move through the items, skipping dividers and disabled ones, Home and End jump to the first and last, and Enter or Space chooses. Closing from the keyboard returns focus to where it was. A click elsewhere leaves focus where you clicked.`,

  features: [
    'A second right-click while it\'s open moves the menu to the new spot',
    'The `arc-select` detail also has `index`, and an `item` object with the item\'s `label`, `shortcut`, `icon` and `value`',
    'Opens with a scale-in animation',
  ],

  guidelines: {
    do: [
      'Make it a direct child of the element that should get the menu',
      'Group related items with `<arc-menu-divider>` or `<arc-menu-label>`, such as clipboard actions and then navigation',
      'Show shortcut hints on items that also have a key binding',
      'Disable items that don\'t apply right now instead of removing them, so people learn what the menu offers',
      'Give items a `value` when two of them could share a label',
      'Move long lists of actions to a CommandPalette',
    ],
    dont: [
      'Don\'t put it on `<body>`. That replaces the browser\'s menu everywhere on the page',
      'Don\'t put forms or other complex UI in an item. The menu renders its own copy of each item, so only the label, icon and shortcut survive',
    ],
  },

  previewHtml: `<div style="padding:40px; border:1px dashed var(--border-default); border-radius:var(--radius-md); text-align:center; color:var(--text-secondary); font-size:14px;">
  Right-click anywhere in this box
  <arc-context-menu>
    <arc-menu-item shortcut="Ctrl+X" icon="scissors">Cut</arc-menu-item>
    <arc-menu-item shortcut="Ctrl+C" icon="copy">Copy</arc-menu-item>
    <arc-menu-item shortcut="Ctrl+V" icon="clipboard">Paste</arc-menu-item>
    <arc-menu-divider></arc-menu-divider>
    <arc-menu-item shortcut="Ctrl+A">Select all</arc-menu-item>
    <arc-menu-divider></arc-menu-divider>
    <arc-menu-item disabled>Delete</arc-menu-item>
  </arc-context-menu>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-context-menu>
  <div slot="trigger">Right-click me</div>
  <arc-menu-item shortcut="⌘C">Copy</arc-menu-item>
  <arc-menu-item shortcut="⌘V">Paste</arc-menu-item>
</arc-context-menu>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ContextMenu, MenuItem } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <ContextMenu>
      <div slot="trigger">Right-click me</div>
      <MenuItem shortcut="⌘C">Copy</MenuItem>
      <MenuItem shortcut="⌘V">Paste</MenuItem>
    </ContextMenu>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ContextMenu, MenuItem } from '@arclux/arc-ui-vue';
</script>

<template>
  <ContextMenu>
    <div slot="trigger">Right-click me</div>
    <MenuItem shortcut="⌘C">Copy</MenuItem>
    <MenuItem shortcut="⌘V">Paste</MenuItem>
  </ContextMenu>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ContextMenu, MenuItem } from '@arclux/arc-ui-svelte';
</script>

<ContextMenu>
  <div slot="trigger">Right-click me</div>
  <MenuItem shortcut="⌘C">Copy</MenuItem>
  <MenuItem shortcut="⌘V">Paste</MenuItem>
</ContextMenu>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ContextMenu, MenuItem } from '@arclux/arc-ui-angular';

@Component({
  imports: [ContextMenu, MenuItem],
  template: \`
    <arc-context-menu>
      <div slot="trigger">Right-click me</div>
      <arc-menu-item shortcut="⌘C">Copy</arc-menu-item>
      <arc-menu-item shortcut="⌘V">Paste</arc-menu-item>
    </arc-context-menu>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ContextMenu, MenuItem } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <ContextMenu>
      <div slot="trigger">Right-click me</div>
      <MenuItem shortcut="⌘C">Copy</MenuItem>
      <MenuItem shortcut="⌘V">Paste</MenuItem>
    </ContextMenu>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ContextMenu, MenuItem } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <ContextMenu>
      <div slot="trigger">Right-click me</div>
      <MenuItem shortcut="⌘C">Copy</MenuItem>
      <MenuItem shortcut="⌘V">Paste</MenuItem>
    </ContextMenu>
  );
}`,
    },
  ],

  subComponents: [
    {
      name: 'MenuItem',
      tag: 'arc-menu-item',
      description: 'One action in the menu. Its label is the `label` attribute or, without one, its text content.',
    },
    {
      name: 'MenuDivider',
      tag: 'arc-menu-divider',
      description: 'A line between groups of menu items.',
    },
    {
      name: 'MenuLabel',
      tag: 'arc-menu-label',
      description:
        'A heading over a group of menu items. The items after it, up to the next label, form one named group.',
    },
  ],

  seeAlso: ['dropdown-menu', 'popover'],
};
