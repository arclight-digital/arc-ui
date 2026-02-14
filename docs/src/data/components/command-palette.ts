import type { ComponentDef } from './_types';

export const commandPalette: ComponentDef = {
    name: 'Command Palette',
    slug: 'command-palette',
    tag: 'arc-command-palette',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Spotlight-style command palette with search and keyboard shortcuts.',

    overview: `CommandPalette provides a spotlight-style overlay for quick access to application commands, navigation, and actions. It renders as a centered modal dialog with a prominent search input at the top, a scrollable results list in the middle, and a keyboard-hint footer at the bottom. Users open it with a trigger (typically a keyboard shortcut like Cmd+K), type to filter commands, and press Enter to execute the focused item.

The palette accepts \`<arc-command-item>\` children in its default slot, each with a \`label\` and an optional \`shortcut\` string. On open, the search input auto-focuses and the query resets so users start from a clean state every time. The filtered results update live as the user types, matching against each item's label. Arrow keys cycle the focus highlight through the visible results, and the footer displays the key bindings so users can navigate without a mouse.

When an item is selected -- by clicking or pressing Enter -- the palette dispatches an \`arc-select\` event containing the item's label and shortcut, then closes itself. The Escape key and backdrop click both dismiss the palette and fire an \`arc-close\` event. The component locks body scroll while open and restores it on close, preventing the background page from shifting under the overlay.`,

    features: [
      'Centered modal dialog with animated scale-in transition on open',
      'Auto-focusing search input that resets the query on every open',
      'Live type-ahead filtering against command item labels',
      'Full keyboard navigation: ArrowUp/ArrowDown cycle focus, Enter selects, Escape closes',
      'Keyboard shortcut hints displayed next to each command item in monospace',
      'Footer bar showing navigation key bindings for discoverability',
      'Backdrop overlay with click-to-close and body scroll locking',
      'arc-select and arc-close custom events for integration with application logic',
    ],

    guidelines: {
      do: [
        'Bind a global keyboard shortcut (e.g., Cmd+K) to toggle the open property for fast access',
        'Provide concise, action-oriented labels on each <arc-command-item> (e.g., "Open File", "Toggle Theme")',
        'Include shortcut hints on items that have associated keyboard bindings for discoverability',
        'Close the palette programmatically after handling the arc-select event to confirm the action ran',
        'Keep the command list under 20-30 items; for larger sets, rely on the search filter',
      ],
      dont: [
        'Use CommandPalette as a generic search bar -- it is designed for discrete actions, not content search',
        'Leave the palette open after an item is selected; it should always close to return focus to the app',
        'Put nested interactive components like forms or modals inside command items',
        'Omit the label attribute on <arc-command-item> -- the filter and display both depend on it',
        'Override the body scroll lock behavior, as this prevents jarring background movement',
      ],
    },

    previewHtml: `<arc-button onclick="this.nextElementSibling.open = true" variant="secondary">Open Command Palette</arc-button>
<arc-command-palette placeholder="Search commands...">
  <arc-command-item shortcut="Ctrl+N" icon="file-plus">New File</arc-command-item>
  <arc-command-item shortcut="Ctrl+O" icon="folder-open">Open File</arc-command-item>
  <arc-command-item shortcut="Ctrl+S" icon="floppy-disk">Save</arc-command-item>
  <arc-command-item icon="moon">Toggle Dark Mode</arc-command-item>
  <arc-command-item icon="gear">Go to Settings</arc-command-item>
  <arc-command-item icon="sign-out">Sign Out</arc-command-item>
</arc-command-palette>`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls whether the palette is visible. When set to true, the dialog animates in, the search input auto-focuses, and body scroll is locked. Set to false to close.' },
      { name: 'placeholder', type: 'string', default: "'Type a command...'", description: 'Placeholder text displayed in the search input when the query is empty.' },
    ],
    events: [
      { name: 'arc-select', description: 'Fired when a command item is selected' },
      { name: 'arc-close', description: 'Fired when the palette closes' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-button onclick="document.querySelector('#palette').open = true">Open Palette</arc-button>
<arc-command-palette id="palette">
  <arc-command-item shortcut="⌘O">Open File</arc-command-item>
  <arc-command-item shortcut="⌘S">Save File</arc-command-item>
</arc-command-palette>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Button, CommandItem, CommandPalette } from '@arclux/arc-ui-react';

<Button onclick="document.querySelector('#palette').open = true">Open Palette</Button>
<CommandPalette id="palette">
  <CommandItem shortcut="⌘O">Open File</CommandItem>
  <CommandItem shortcut="⌘S">Save File</CommandItem>
</CommandPalette>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Button, CommandItem, CommandPalette } from '@arclux/arc-ui-vue';
</script>

<template>
  <Button onclick="document.querySelector('#palette').open = true">Open Palette</Button>
  <CommandPalette id="palette">
    <CommandItem shortcut="⌘O">Open File</CommandItem>
    <CommandItem shortcut="⌘S">Save File</CommandItem>
  </CommandPalette>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Button, CommandItem, CommandPalette } from '@arclux/arc-ui-svelte';
</script>

<Button onclick="document.querySelector('#palette').open = true">Open Palette</Button>
<CommandPalette id="palette">
  <CommandItem shortcut="⌘O">Open File</CommandItem>
  <CommandItem shortcut="⌘S">Save File</CommandItem>
</CommandPalette>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Button, CommandItem, CommandPalette } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, CommandItem, CommandPalette],
  template: \`
    <Button onclick="document.querySelector('#palette').open = true">Open Palette</Button>
    <CommandPalette id="palette">
      <CommandItem shortcut="⌘O">Open File</CommandItem>
      <CommandItem shortcut="⌘S">Save File</CommandItem>
    </CommandPalette>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Button, CommandItem, CommandPalette } from '@arclux/arc-ui-solid';

<Button onclick="document.querySelector('#palette').open = true">Open Palette</Button>
<CommandPalette id="palette">
  <CommandItem shortcut="⌘O">Open File</CommandItem>
  <CommandItem shortcut="⌘S">Save File</CommandItem>
</CommandPalette>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Button, CommandItem, CommandPalette } from '@arclux/arc-ui-preact';

<Button onclick="document.querySelector('#palette').open = true">Open Palette</Button>
<CommandPalette id="palette">
  <CommandItem shortcut="⌘O">Open File</CommandItem>
  <CommandItem shortcut="⌘S">Save File</CommandItem>
</CommandPalette>`,
      },
    ],
    subComponents: [
      {
        name: 'CommandItem',
        tag: 'arc-command-item',
        description: 'Action item inside a CommandPalette.',
        props: [
          { name: 'shortcut', type: 'string', description: 'Keyboard shortcut hint' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the item' },
        ],
      },
    ],
  
  seeAlso: ["combobox","search","dropdown-menu"],
};
