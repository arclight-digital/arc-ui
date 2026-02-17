import type { ComponentDef } from './_types';

export const dropdownMenu: ComponentDef = {
    name: 'Dropdown Menu',
    slug: 'dropdown-menu',
    tag: 'arc-dropdown-menu',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Menu dropdown triggered by a button with keyboard navigation.',

    overview: `DropdownMenu renders a click-triggered menu panel anchored below a customizable trigger element. The trigger is provided via the \`trigger\` named slot, and menu items are declared as \`<arc-menu-item>\` children in the default slot. Clicking the trigger toggles the panel open or closed, and clicking outside the component or pressing Escape dismisses it. The panel slides down with a smooth CSS transition using \`opacity\`, \`visibility\`, and \`transform\`.

Menu items display a label and an optional keyboard shortcut hint in monospace. Dividers between groups of items are added with \`<arc-menu-divider>\`. When the panel is open, ArrowDown and ArrowUp cycle focus through selectable items (dividers are skipped), and Enter activates the focused item. The component dispatches an \`arc-select\` event with the item's label and shortcut on selection, then closes the panel and fires an \`arc-close\` event.

DropdownMenu is designed for action menus attached to buttons -- file menus, "more actions" dots, profile menus, and similar patterns. It differs from ContextMenu (which is triggered by right-click on a parent region) and from Select (which is a form control that captures a value). The trigger slot accepts any element, so you can use an \`<arc-button>\`, a plain \`<button>\`, or an icon as the toggle.`,

    features: [
      'Click-triggered panel anchored below a customizable trigger slot',
      'Smooth CSS transition with opacity, visibility, and translateY animation',
      'Full keyboard navigation: ArrowUp/Down cycle items, Enter selects, Escape closes',
      'Support for <arc-menu-item> with label and shortcut hint, and <arc-menu-divider> for grouping',
      'arc-select event on item activation with label and shortcut in the detail',
      'arc-close event when the panel is dismissed by any means',
      'Automatic close on outside click via a document-level event listener',
      'aria-haspopup and aria-expanded on the trigger for screen reader accessibility'
    ],

    guidelines: {
      do: [
        'Provide a clear, descriptive trigger element -- a button with text like "Actions" or a recognizable icon',
        'Group related items with <arc-menu-divider> to create visual sections within the menu',
        'Include shortcut hints on items that have associated keyboard bindings for user education',
        'Listen to arc-select to execute the chosen action; the event contains the item label and shortcut',
        'Keep the item count under 10; for larger command sets, use CommandPalette instead'
      ],
      dont: [
        'Use DropdownMenu as a form Select replacement -- it does not track a selected value',
        'Place the trigger element outside the <arc-dropdown-menu> component; it must be in the trigger slot',
        'Nest another DropdownMenu inside a menu item; use a flat list or CommandPalette for complex hierarchies',
        'Forget to add role="menu" semantics -- the component handles this automatically',
        'Override the z-index of the panel without testing stacking context conflicts with other overlays'
      ],
    },

    previewHtml: `<arc-dropdown-menu>
  <arc-button slot="trigger" variant="secondary">Actions</arc-button>
  <arc-menu-item label="Edit" shortcut="Ctrl+E"></arc-menu-item>
  <arc-menu-item label="Duplicate"></arc-menu-item>
  <arc-menu-divider></arc-menu-divider>
  <arc-menu-item label="Archive"></arc-menu-item>
  <arc-menu-item label="Delete"></arc-menu-item>
</arc-dropdown-menu>`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls whether the menu panel is visible. Toggled by clicking the trigger. Set to false when the user selects an item, clicks outside, or presses Escape.' }
    ],
    events: [
      { name: 'arc-close', description: 'Fired when the dropdown closes' },
      { name: 'arc-select', description: 'Fired when a menu item is selected' }
    ],
    tabs: [
    {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-dropdown-menu>
  <button slot="trigger">File Menu</button>
  <arc-menu-item shortcut="⌘N">New File</arc-menu-item>
  <arc-menu-item shortcut="⌘O">Open</arc-menu-item>
  <arc-menu-item shortcut="⌘S">Save</arc-menu-item>
</arc-dropdown-menu>`,
      },
    {
        label: 'React',
        lang: 'tsx',
        code: `import { DropdownMenu, MenuItem } from '@arclux/arc-ui-react';

<DropdownMenu>
  <button slot="trigger">File Menu</button>
  <MenuItem shortcut="⌘N">New File</MenuItem>
  <MenuItem shortcut="⌘O">Open</MenuItem>
  <MenuItem shortcut="⌘S">Save</MenuItem>
</DropdownMenu>`,
      },
    {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { DropdownMenu, MenuItem } from '@arclux/arc-ui-vue';
</script>

<template>
  <DropdownMenu>
    <button slot="trigger">File Menu</button>
    <MenuItem shortcut="⌘N">New File</MenuItem>
    <MenuItem shortcut="⌘O">Open</MenuItem>
    <MenuItem shortcut="⌘S">Save</MenuItem>
  </DropdownMenu>
</template>`,
      },
    {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { DropdownMenu, MenuItem } from '@arclux/arc-ui-svelte';
</script>

<DropdownMenu>
  <button slot="trigger">File Menu</button>
  <MenuItem shortcut="⌘N">New File</MenuItem>
  <MenuItem shortcut="⌘O">Open</MenuItem>
  <MenuItem shortcut="⌘S">Save</MenuItem>
</DropdownMenu>`,
      },
    {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { DropdownMenu, MenuItem } from '@arclux/arc-ui-angular';

@Component({
  imports: [DropdownMenu, MenuItem],
  template: \`
    <DropdownMenu>
      <button slot="trigger">File Menu</button>
      <MenuItem shortcut="⌘N">New File</MenuItem>
      <MenuItem shortcut="⌘O">Open</MenuItem>
      <MenuItem shortcut="⌘S">Save</MenuItem>
    </DropdownMenu>
  \`,
})
export class MyComponent {}`,
      },
    {
        label: 'Solid',
        lang: 'tsx',
        code: `import { DropdownMenu, MenuItem } from '@arclux/arc-ui-solid';

<DropdownMenu>
  <button slot="trigger">File Menu</button>
  <MenuItem shortcut="⌘N">New File</MenuItem>
  <MenuItem shortcut="⌘O">Open</MenuItem>
  <MenuItem shortcut="⌘S">Save</MenuItem>
</DropdownMenu>`,
      },
    {
        label: 'Preact',
        lang: 'tsx',
        code: `import { DropdownMenu, MenuItem } from '@arclux/arc-ui-preact';

<DropdownMenu>
  <button slot="trigger">File Menu</button>
  <MenuItem shortcut="⌘N">New File</MenuItem>
  <MenuItem shortcut="⌘O">Open</MenuItem>
  <MenuItem shortcut="⌘S">Save</MenuItem>
</DropdownMenu>`,
      },
  ],

  subComponents: [
    {
      name: 'MenuItem',
      tag: 'arc-menu-item',
      description: 'A single action entry inside the context menu.',
      props: [
        { name: 'label', type: 'string', description: 'Display text for the menu item.' },
        { name: 'shortcut', type: 'string', description: 'Keyboard shortcut hint displayed on the right side.' },
        { name: 'icon', type: 'string', description: 'Name of the icon to display before the label.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the item, preventing interaction.' },
      ],
    },
    {
      name: 'MenuDivider',
      tag: 'arc-menu-divider',
      description: 'A visual separator between groups of menu items.',
      props: [],
    },
  ],

  seeAlso: ["context-menu","popover","select"],
};
