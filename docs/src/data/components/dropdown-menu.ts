import type { ComponentDef } from './_types';

export const dropdownMenu: ComponentDef = {
  name: 'Dropdown Menu',
  slug: 'dropdown-menu',
  tag: 'arc-dropdown-menu',
  tier: 'feedback',
  interactivity: 'interactive',
  description: 'A menu of actions that opens from a button.',

  overview: `DropdownMenu opens a menu from the element in its \`trigger\` slot, which can be an \`<arc-button>\`, a plain \`<button>\` or an icon button. Items are \`<arc-menu-item>\` children with a label and an optional \`shortcut\` hint, \`<arc-menu-divider>\` separates groups, and \`<arc-menu-label>\` names the group after it. Clicking the trigger toggles the menu. A click outside or Escape closes it.

Arrow Down and Arrow Up move through the items, skipping dividers and disabled items, Home and End jump to the ends, and Enter chooses. Choosing fires \`arc-select\` with the item's \`value\`, or its label if it has none, then closes the menu. Every close fires a cancelable \`arc-close\`, and focus returns to where it was when the menu opened, unless a click outside closed it.

Use it for action menus on a button: a file menu, a "more actions" button or a profile menu. ContextMenu opens on right-click instead, and Select is a form control that keeps a value.`,

  features: [
    'The menu renders in the top layer and flips above the trigger when there\'s no room below',
    'Disabled items are muted and can\'t be chosen',
    'The trigger is shrink-to-fit. Give the host a width, or `display: block`, and the trigger fills it',
    'The trigger gets `aria-haspopup` and `aria-expanded`, and the component sets `role="menu"` and `role="menuitem"`',
    'The `arc-select` detail also has `index`, and an `item` object with the item\'s `label`, `shortcut` and `value`',
  ],

  guidelines: {
    do: [
      'Make the trigger say what\'s in the menu, such as an "Actions" button or a recognizable icon',
      'Name groups with `<arc-menu-label>`, not with a disabled item',
      'Show shortcut hints on items that also have a key binding',
      'Give items a `value` when two of them could share a label',
      'Move long lists of commands to a CommandPalette',
    ],
    dont: [
      'Don\'t use it in place of a Select. It doesn\'t keep a selected value',
      'Don\'t put the trigger outside the component. It has to be in the `trigger` slot',
      'Don\'t nest a DropdownMenu inside a menu item. There are no submenus',
      'Don\'t add `role="menu"` or `role="menuitem"` yourself',
    ],
  },

  previewHtml: `<arc-dropdown-menu>
  <arc-button slot="trigger" variant="secondary">Actions</arc-button>
  <arc-menu-item label="Edit" shortcut="Ctrl+E"></arc-menu-item>
  <arc-menu-item label="Duplicate"></arc-menu-item>
  <arc-menu-item label="Move to…" disabled></arc-menu-item>
  <arc-menu-label>Danger zone</arc-menu-label>
  <arc-menu-item label="Archive"></arc-menu-item>
  <arc-menu-item label="Delete"></arc-menu-item>
</arc-dropdown-menu>`,

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

export default function Example() {
  return (
    <DropdownMenu>
      <button slot="trigger">File Menu</button>
      <MenuItem shortcut="⌘N">New File</MenuItem>
      <MenuItem shortcut="⌘O">Open</MenuItem>
      <MenuItem shortcut="⌘S">Save</MenuItem>
    </DropdownMenu>
  );
}`,
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
    <arc-dropdown-menu>
      <button slot="trigger">File Menu</button>
      <arc-menu-item shortcut="⌘N">New File</arc-menu-item>
      <arc-menu-item shortcut="⌘O">Open</arc-menu-item>
      <arc-menu-item shortcut="⌘S">Save</arc-menu-item>
    </arc-dropdown-menu>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { DropdownMenu, MenuItem } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <DropdownMenu>
      <button slot="trigger">File Menu</button>
      <MenuItem shortcut="⌘N">New File</MenuItem>
      <MenuItem shortcut="⌘O">Open</MenuItem>
      <MenuItem shortcut="⌘S">Save</MenuItem>
    </DropdownMenu>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { DropdownMenu, MenuItem } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <DropdownMenu>
      <button slot="trigger">File Menu</button>
      <MenuItem shortcut="⌘N">New File</MenuItem>
      <MenuItem shortcut="⌘O">Open</MenuItem>
      <MenuItem shortcut="⌘S">Save</MenuItem>
    </DropdownMenu>
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

  seeAlso: ['context-menu', 'popover', 'select'],
};
