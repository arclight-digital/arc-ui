import type { ComponentDef } from './_types';

export const contextMenu: ComponentDef = {
    name: 'Context Menu',
    slug: 'context-menu',
    tag: 'arc-context-menu',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Right-click context menu with keyboard shortcuts.',

    overview: `ContextMenu replaces the browser's native right-click menu with a custom, styled menu that matches your application's design system. It automatically attaches a \`contextmenu\` event listener to its parent element, so any right-click within that parent opens the custom menu at the cursor position. The menu supports icons, labels, keyboard shortcut hints, disabled items, and visual dividers via \`<arc-menu-item>\` and \`<arc-menu-divider>\` children.

The menu appears with a subtle scale-in animation and positions itself intelligently, flipping away from viewport edges so it never renders off-screen. When an item is clicked or activated via keyboard, the component dispatches an \`arc-select\` event with the item's label, shortcut, and icon metadata, then closes itself. Clicking the transparent backdrop or pressing Escape also dismisses the menu.

Keyboard navigation follows the standard menu pattern: ArrowDown and ArrowUp move focus through selectable items (skipping dividers and disabled entries), Home and End jump to the first and last items, Enter or Space activate the focused item, and Escape closes the menu. The \`prefers-reduced-motion\` media query disables the entrance animation for users who request it.`,

    features: [
      'Automatically intercepts contextmenu events on the parent element',
      'Viewport-aware positioning that flips to avoid off-screen rendering',
      'Scale-in entrance animation with prefers-reduced-motion support',
      'Keyboard navigation: ArrowUp/Down, Home/End, Enter/Space to select, Escape to close',
      'Support for icons, labels, shortcut hints, and disabled state on each menu item',
      'Visual dividers via <arc-menu-divider> to group related actions',
      'arc-select event with item metadata (label, shortcut, icon) on activation',
      'Transparent backdrop click-to-close for intuitive dismissal',
    ],

    guidelines: {
      do: [
        'Place ContextMenu as a direct child of the element that should trigger the right-click menu',
        'Group related items with <arc-menu-divider> to improve scannability (e.g., clipboard actions, then navigation actions)',
        'Include keyboard shortcut hints on items that have global keybindings for consistency',
        'Disable items that are contextually unavailable rather than removing them, so users learn the full action set',
        'Keep the menu under 10 items; use submenus or a CommandPalette for larger action sets',
      ],
      dont: [
        'Attach a ContextMenu to the entire document body -- scope it to a specific interactive region',
        'Put complex UI (forms, multi-select lists) inside context menu items',
        'Forget to handle the arc-select event -- without it, selecting an item has no effect',
        'Mix ContextMenu with DropdownMenu on the same element; they serve different interaction models',
        'Remove the default Escape-to-close behavior, as it is critical for keyboard accessibility',
      ],
    },

    previewHtml: `<div style="padding:40px; border:1px dashed var(--border-default); border-radius:var(--radius-md); text-align:center; color:var(--text-secondary); font-size:14px;">
  Right-click anywhere in this box
  <arc-context-menu>
    <arc-menu-item shortcut="Ctrl+X" icon="scissors">Cut</arc-menu-item>
    <arc-menu-item shortcut="Ctrl+C" icon="copy">Copy</arc-menu-item>
    <arc-menu-item shortcut="Ctrl+V" icon="clipboard">Paste</arc-menu-item>
    <arc-menu-divider></arc-menu-divider>
    <arc-menu-item shortcut="Ctrl+A">Select All</arc-menu-item>
    <arc-menu-divider></arc-menu-divider>
    <arc-menu-item disabled>Delete</arc-menu-item>
  </arc-context-menu>
</div>`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls the visibility of the context menu. Set to true when the contextmenu event fires; set to false when the user selects an item, clicks the backdrop, or presses Escape.' },
    ],
    events: [
      { name: 'arc-open', description: 'Fired when the context menu opens' },
      { name: 'arc-close', description: 'Fired when the context menu closes' },
      { name: 'arc-select', description: 'Fired when a menu item is selected' },
    ],
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

<ContextMenu>
  <div slot="trigger">Right-click me</div>
  <MenuItem shortcut="⌘C">Copy</MenuItem>
  <MenuItem shortcut="⌘V">Paste</MenuItem>
</ContextMenu>`,
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
    <ContextMenu>
      <div slot="trigger">Right-click me</div>
      <MenuItem shortcut="⌘C">Copy</MenuItem>
      <MenuItem shortcut="⌘V">Paste</MenuItem>
    </ContextMenu>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { ContextMenu, MenuItem } from '@arclux/arc-ui-solid';

<ContextMenu>
  <div slot="trigger">Right-click me</div>
  <MenuItem shortcut="⌘C">Copy</MenuItem>
  <MenuItem shortcut="⌘V">Paste</MenuItem>
</ContextMenu>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { ContextMenu, MenuItem } from '@arclux/arc-ui-preact';

<ContextMenu>
  <div slot="trigger">Right-click me</div>
  <MenuItem shortcut="⌘C">Copy</MenuItem>
  <MenuItem shortcut="⌘V">Paste</MenuItem>
</ContextMenu>`,
      },
    ],
  };
