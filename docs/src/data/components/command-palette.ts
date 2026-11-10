import type { ComponentDef } from './_types';

export const commandPalette: ComponentDef = {
  name: 'Command Palette',
  slug: 'command-palette',
  tag: 'arc-command-palette',
  tier: 'feedback',
  interactivity: 'interactive',
  description: 'Command list that opens as a dialog, with fuzzy, ranked search and shortcut hints.',

  overview: `CommandPalette is a modal dialog with a search field, a list of commands and a footer of key hints. You open it by setting \`open\`, usually from a Cmd+K handler or a button. The palette doesn't bind any shortcut itself.

Commands are \`<arc-command-item>\` children. An item's text content is its label, and it can add an \`icon\`, a \`shortcut\` hint, \`keywords\` that are searched but never shown, and a \`description\` that's shown as a second line and also searched. Search is fuzzy and ranked: "cmdpal" finds "Command Palette", terms can come in any order, and the best matches come first with the matched characters marked. Only the top \`max-results\` (50 by default) are rendered.

Picking an item fires \`arc-select\` with its \`value\`, or its label if it has no value, and closes the palette. Escape and a click on the backdrop close it too. Each of these fires a cancelable \`arc-close\`, so \`preventDefault()\` keeps the palette open. Setting \`open\` to \`false\` from code closes it without the event. For a search field that's always on screen, use CommandBar.`,

  features: [
    'Opens with a scale-in transition. The search input takes focus and the query clears on every open',
    'Arrow Up and Arrow Down move the highlight, Enter selects and Escape closes',
    'Body scroll is locked while it\'s open, and focus returns to where it was when it closes',
    'When nothing matches, the empty state repeats the query',
    'The backdrop is `::backdrop`, which can\'t be a CSS part. Style it with `--palette-backdrop`',
  ],

  guidelines: {
    do: [
      'Write labels as short actions, such as "Open file" or "Toggle theme"',
      'Add `shortcut` to items that have a key binding',
      'Give items a `value` when two of them could share a label, so your `arc-select` handler can tell them apart',
    ],
    dont: [
      'Don\'t put forms or other interactive content in an item. The palette renders its own copy of each item from its text, so anything else is lost',
    ],
  },

  previewHtml: `<arc-button onclick="this.nextElementSibling.open = true" variant="secondary">Open command palette</arc-button>
<arc-command-palette placeholder="Search commands...">
  <arc-command-item shortcut="Ctrl+N" icon="file-plus">New file</arc-command-item>
  <arc-command-item shortcut="Ctrl+O" icon="folder-open">Open file</arc-command-item>
  <arc-command-item shortcut="Ctrl+S" icon="floppy-disk">Save</arc-command-item>
  <arc-command-item icon="moon">Toggle dark mode</arc-command-item>
  <arc-command-item icon="gear">Go to settings</arc-command-item>
  <arc-command-item icon="sign-out">Sign out</arc-command-item>
</arc-command-palette>`,

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

export default function Example() {
  return (
    <>
      <Button onclick="document.querySelector('#palette').open = true">Open Palette</Button>
      <CommandPalette id="palette">
        <CommandItem shortcut="⌘O">Open File</CommandItem>
        <CommandItem shortcut="⌘S">Save File</CommandItem>
      </CommandPalette>
    </>
  );
}`,
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
    <arc-button onclick="document.querySelector('#palette').open = true">Open Palette</arc-button>
    <arc-command-palette id="palette">
      <arc-command-item shortcut="⌘O">Open File</arc-command-item>
      <arc-command-item shortcut="⌘S">Save File</arc-command-item>
    </arc-command-palette>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Button, CommandItem, CommandPalette } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Button onclick="document.querySelector('#palette').open = true">Open Palette</Button>
      <CommandPalette id="palette">
        <CommandItem shortcut="⌘O">Open File</CommandItem>
        <CommandItem shortcut="⌘S">Save File</CommandItem>
      </CommandPalette>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Button, CommandItem, CommandPalette } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Button onclick="document.querySelector('#palette').open = true">Open Palette</Button>
      <CommandPalette id="palette">
        <CommandItem shortcut="⌘O">Open File</CommandItem>
        <CommandItem shortcut="⌘S">Save File</CommandItem>
      </CommandPalette>
    </>
  );
}`,
    },
  ],
  subComponents: [
    {
      name: 'CommandItem',
      tag: 'arc-command-item',
      description: 'One command in a CommandPalette. Its text content is the label.',
    },
    {
      name: 'CommandGroup',
      tag: 'arc-command-group',
      description:
        'Puts CommandItems under a small uppercase heading. Items in groups still filter and move as one flat list, groups are ordered by their best match, and a heading hides when none of its items match.',
    },
  ],

  seeAlso: ['combobox', 'search', 'dropdown-menu'],
};
