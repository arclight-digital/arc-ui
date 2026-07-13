import type { ComponentDef } from './_types';

export const menubar: ComponentDef = {
    name: 'Menubar',
    slug: 'menubar',
    tag: 'arc-menubar',
    tier: 'navigation',
    interactivity: 'interactive',
    status: 'beta',
    description: 'Desktop-application-style menu bar (File / Edit / View) with nested submenus, keyboard shortcuts display, and full WAI-ARIA menubar keyboard navigation.',

    overview: `Menubar renders the horizontal command bar familiar from desktop applications: a row of top-level menus like File, Edit, and View, each opening a vertical dropdown of commands. The entire structure is data-driven — assign an array to the \`items\` property via JavaScript and the component renders triggers, menus, submenus, dividers, and right-aligned keyboard shortcut hints.

Menu entries can nest one further level: an item with its own \`items\` array becomes a submenu parent, rendered with a caret indicator. Submenus open to the right of their parent item and automatically flip to the left when they would overflow the viewport. Entries with \`{ divider: true }\` render as separator lines, \`disabled\` entries are skipped by keyboard navigation, and \`shortcut\` strings display in muted monospace (display only — the component does not bind global hotkeys).

Interaction follows the WAI-ARIA menubar pattern faithfully. The bar exposes a single tab stop with roving focus: ArrowLeft/ArrowRight move across top-level items, ArrowDown or Enter opens a menu, ArrowUp opens it focused on the last item. Inside menus, arrows move and wrap past dividers and disabled items, ArrowRight enters a submenu, ArrowLeft steps back out (or over to the previous top-level menu), typeahead jumps to items by first letter, and Escape unwinds one level at a time, restoring focus to the trigger. With the pointer, clicking a trigger toggles its menu, hovering other triggers switches menus once one is open, and hovering a submenu parent opens it after a short delay. Activating a leaf fires \`arc-select\` with the full label path from root to leaf.`,

    features: [
      'Data-driven: one `items` array describes triggers, menus, submenus, dividers, shortcuts, and disabled states',
      'Faithful WAI-ARIA menubar pattern: `role="menubar"`, `role="menu"`, `role="menuitem"`, roving tabindex with a single tab stop',
      'Full 2D keyboard navigation: arrows in both axes, Home/End, Enter/Space, Escape unwinding one level at a time',
      'Typeahead: printable characters jump to the next matching item in the open menu, or across the menubar when closed',
      'Standard menubar pointer behavior: click to toggle, hover to switch open menus, ~150ms hover-intent delay on submenus',
      'Submenus flip from right to left automatically when they would overflow the viewport',
      '`arc-select` event carries the full label path from root to leaf (e.g. `["File", "Export", "PNG"]`)',
      'CSS parts for `bar`, `trigger`, `menu`, `item`, and `shortcut` enable external styling'
    ],

    guidelines: {
      do: [
        'Assign `items` via JavaScript — it is a property, not an HTML attribute',
        'Group related commands with `{ divider: true }` entries, mirroring desktop app conventions',
        'Use `shortcut` strings that match your actual key bindings — the menubar displays them but you must register the hotkeys yourself',
        'Keep top-level labels to single words (File, Edit, View) so the bar scans like a native app',
        'Listen to `arc-select` and branch on the label path array to route commands'
      ],
      dont: [
        'Do not use Menubar for site navigation — use navigation-menu or top-bar; menubars are for application commands',
        'Do not nest submenus more than one level below a menu — deep chains are hard to traverse with a pointer',
        'Do not put destructive actions directly next to common ones without a divider between them',
        'Do not rely on shortcut hints as functionality — they are display-only text',
        'Avoid more than 7-8 top-level menus; consolidate rare commands into a submenu instead'
      ],
    },

    previewLayout: 'block',

    previewHeight: '380px',

    previewHtml: `<div style="display: flex; flex-direction: column; gap: var(--space-md); align-items: flex-start;">
  <arc-menubar id="demo-menubar-preview"></arc-menubar>
  <div style="font-size: var(--text-sm); color: var(--text-muted); font-family: var(--font-mono);">selected: <span id="demo-menubar-out">—</span></div>
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

    props: [
      {
        name: 'items',
        type: 'Array<MenubarItem>',
        default: '[]',
        description: 'The menu structure. Each top-level entry is `{ label, disabled?, items }` where `items` contains menu entries of shape `{ label, shortcut?, disabled?, divider?, items? }`. Entries with an `items` array become submenus (one further nesting level supported); `{ divider: true }` renders a separator. Set via JavaScript — this is a property, not an HTML attribute.',
      },
    ],
    events: [
      { name: 'arc-select', description: 'Fired when a leaf menu item is activated. `detail.path` is the array of labels from the top-level menu to the selected leaf, e.g. `["File", "Export", "PNG"]`.' },
    ],
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
    ],

  seeAlso: ["dropdown-menu","context-menu","top-bar","command-bar"],
};
