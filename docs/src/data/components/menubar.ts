import type { ComponentDef } from './_types';

export const menubar: ComponentDef = {
  name: 'Menubar',
  slug: 'menubar',
  tag: 'arc-menubar',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'Desktop-application menu bar (File, Edit, View) with submenus, shortcut hints and WAI-ARIA menubar keyboard navigation.',

  overview: `Menubar is the row of menus from desktop applications: File, Edit and View, each opening a dropdown of commands. One \`items\` array describes it all, set as a property from JavaScript or as a JSON attribute when the menu is static. The component renders the triggers, menus, submenus, dividers and right-aligned shortcut hints.

An entry with its own \`items\` array becomes a submenu, marked with a caret. Submenus go one level deep. They open to the right of their parent and flip to the left when they would overflow the viewport. \`{ divider: true }\` renders a separator line, keyboard navigation skips \`disabled\` entries, and \`shortcut\` strings show in muted monospace. Shortcuts are display only: the component doesn't bind any keys.

Interaction follows the WAI-ARIA menubar pattern. The bar is a single tab stop with roving focus: ArrowLeft and ArrowRight move across top-level items, ArrowDown or Enter opens a menu, and ArrowUp opens it on the last item. Inside a menu, the arrows move and wrap past dividers and disabled items, ArrowRight enters a submenu, ArrowLeft steps back out (or over to the previous top-level menu), typing a letter jumps to the next item that starts with it, and Escape closes one level at a time and returns focus to the trigger. With a pointer, clicking a trigger toggles its menu, hovering another trigger switches menus once one is open, and hovering a submenu parent opens it after a short delay. Activating a leaf fires \`arc-select\` with the label path from root to leaf.`,

  features: [
    'Roles are `menubar`, `menu` and `menuitem`, with a roving tabindex',
    'Home and End jump to the first and last item, and Space activates an item like Enter',
    'Typing a letter also works on the bar itself when no menu is open',
    'Submenus open after about 150ms of hover',
    '`arc-select` puts the path in `detail.path`, such as `["File", "Export", "PNG"]`',
  ],

  guidelines: {
    do: [
      'Group related commands with `{ divider: true }` entries',
      'Make `shortcut` strings match your real key bindings. You register the bindings yourself',
      'Keep top-level labels to one word (File, Edit, View)',
      'Route commands by the label path in `arc-select`',
    ],
    dont: [
      'Don\'t use it for site navigation. Use Navigation Menu or Top Bar. A menubar is for application commands',
      'Don\'t put destructive actions right next to common ones without a divider between them',
      'Don\'t use more than 7 or 8 top-level menus. Move rare commands into a submenu',
    ],
  },

  previewLayout: 'block',

  previewHeight: '380px',

  previewHtml: `<div style="display: flex; flex-direction: column; gap: var(--space-md); align-items: flex-start;">
  <arc-menubar id="demo-menubar-preview"></arc-menubar>
  <div style="font-size: var(--text-sm); color: var(--text-muted); font-family: var(--font-mono);">selected: <span id="demo-menubar-out">none</span></div>
</div>`,

  previewSetup: `const mb = el.querySelector('#demo-menubar-preview');
const out = el.querySelector('#demo-menubar-out');
if (mb) {
  mb.items = [
    { label: 'File', items: [
      { label: 'New File', shortcut: '⌘N' },
      { label: 'Open…', shortcut: '⌘O' },
      { divider: true },
      { label: 'Export', items: [
        { label: 'PNG' },
        { label: 'SVG' },
        { label: 'PDF', disabled: true }
      ] },
      { divider: true },
      { label: 'Close Window', shortcut: '⇧⌘W' }
    ] },
    { label: 'Edit', items: [
      { label: 'Undo', shortcut: '⌘Z' },
      { label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
      { divider: true },
      { label: 'Cut', shortcut: '⌘X' },
      { label: 'Copy', shortcut: '⌘C' },
      { label: 'Paste', shortcut: '⌘V' }
    ] },
    { label: 'View', items: [
      { label: 'Zoom In', shortcut: '⌘+' },
      { label: 'Zoom Out', shortcut: '⌘-' },
      { divider: true },
      { label: 'Appearance', items: [
        { label: 'Light' },
        { label: 'Dark' },
        { label: 'System' }
      ] },
      { label: 'Full Screen', shortcut: '⌃⌘F' }
    ] }
  ];
  mb.addEventListener('arc-select', (e) => {
    if (out) out.textContent = e.detail.path.join(' → ');
  });
}`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-menubar id="app-menubar"></arc-menubar>

<script>
  const menubar = document.getElementById('app-menubar');
  menubar.items = [
    { label: 'File', items: [
      { label: 'New File', shortcut: '⌘N' },
      { label: 'Open…', shortcut: '⌘O' },
      { divider: true },
      { label: 'Export', items: [
        { label: 'PNG' },
        { label: 'SVG' }
      ] }
    ] },
    { label: 'Edit', items: [
      { label: 'Undo', shortcut: '⌘Z' },
      { label: 'Redo', shortcut: '⇧⌘Z', disabled: true }
    ] }
  ];

  menubar.addEventListener('arc-select', (e) => {
    console.log('command:', e.detail.path); // e.g. ['File', 'Export', 'PNG']
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Menubar } from '@arclux/arc-ui-react';

const items = [
  { label: 'File', items: [
    { label: 'New File', shortcut: '⌘N' },
    { label: 'Open…', shortcut: '⌘O' },
    { divider: true },
    { label: 'Export', items: [
      { label: 'PNG' },
      { label: 'SVG' }
    ] }
  ] },
  { label: 'Edit', items: [
    { label: 'Undo', shortcut: '⌘Z' },
    { label: 'Redo', shortcut: '⇧⌘Z', disabled: true }
  ] }
];

<Menubar
  items={items}
  onArcSelect={(e) => console.log('command:', e.detail.path)}
/>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Menubar } from '@arclux/arc-ui-vue';

const items = [
  { label: 'File', items: [
    { label: 'New File', shortcut: '⌘N' },
    { divider: true },
    { label: 'Export', items: [{ label: 'PNG' }, { label: 'SVG' }] }
  ] },
  { label: 'Edit', items: [
    { label: 'Undo', shortcut: '⌘Z' }
  ] }
];
</script>

<template>
  <Menubar :items="items" @arc-select="(e) => console.log(e.detail.path)" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Menubar } from '@arclux/arc-ui-svelte';

  const items = [
    { label: 'File', items: [
      { label: 'New File', shortcut: '⌘N' },
      { divider: true },
      { label: 'Export', items: [{ label: 'PNG' }, { label: 'SVG' }] }
    ] },
    { label: 'Edit', items: [
      { label: 'Undo', shortcut: '⌘Z' }
    ] }
  ];
</script>

<Menubar {items} on:arc-select={(e) => console.log(e.detail.path)} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Menubar } from '@arclux/arc-ui-angular';

@Component({
  imports: [Menubar],
  template: \`
    <arc-menubar [items]="items" (arcSelect)="onSelect($event)"></arc-menubar>
  \`,
})
export class AppMenubarComponent {
  items = [
    { label: 'File', items: [
      { label: 'New File', shortcut: '⌘N' },
      { divider: true },
      { label: 'Export', items: [{ label: 'PNG' }, { label: 'SVG' }] }
    ] },
    { label: 'Edit', items: [
      { label: 'Undo', shortcut: '⌘Z' }
    ] }
  ];

  onSelect(e: CustomEvent) {
    console.log(e.detail.path);
  }
}`,
    },
  ],

  seeAlso: ['dropdown-menu', 'context-menu', 'top-bar', 'command-bar'],
};
