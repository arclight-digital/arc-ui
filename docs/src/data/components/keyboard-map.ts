import type { ComponentDef } from './_types';

export const keyboardMap: ComponentDef = {
  name: 'Keyboard Map',
  slug: 'keyboard-map',
  tag: 'arc-keyboard-map',
  tier: 'typography',
  interactivity: 'static',
  searchKeywords: ['shortcut diagram', 'cheat sheet', 'keycap', 'keyboard layout', 'hotkey map'],
  description:
    'A rendered keyboard with highlighted keys and chords, for shortcut documentation and editor cheat sheets.',

  overview: `Keyboard Map draws a keyboard as a grid of keycaps and highlights the keys named in its \`highlight\` prop. Kbd names a key inline and Hotkey listens for one, while Keyboard Map shows where a chord's keys are on the board. Highlighted keys get an accent tint, a glow and accent legend text.

Chords use Hotkey's syntax: keys join with "+", \`cmd\`/\`command\` normalize to meta, \`option\` to alt, and \`mod\` resolves to Cmd on Mac and Ctrl on Windows, so one chord string documents both. \`platform\` sets the modifier legends and how \`mod\` resolves: "auto" detects the visitor's platform in the browser (and renders the Mac board on the server), and "mac" or "win" pins it.

The board is a stylized diagram with two layouts. \`compact\` (the default) is a 60%-style block with no nav cluster or numpad, and \`ansi\` adds the F-row and nav cluster. There's no ISO or JIS layout.

It's display only: no slots, no click events, nothing focusable. Wiring up a shortcut is Hotkey's job. The board is one \`role="img"\` whose label is computed from the chords ("Keyboard diagram highlighting Cmd+Shift+P"), and the key legends are hidden from assistive technology.`,

  features: [
    'Modifier legends: ⌘ ⌥ ⇧ ⌃ on Mac, Ctrl/Alt/Shift/Win on Windows',
    '`highlight` takes an array property or a comma- or space-separated attribute string. Unknown key names are ignored',
    'Optional `caption` below the board in muted text',
    'Scales to its container. `--keyboard-map-key` and `--keyboard-map-gap` set the geometry, and the legends drop out below about 340px',
    'Unknown `layout` values fall back to compact',
  ],

  guidelines: {
    do: [
      'Use it for cheat sheets and settings pages. For a shortcut mentioned in a sentence, use Kbd',
      'Put related chords on one board, such as undo and redo, and give it a caption naming the group',
      'Use the compact layout unless a chord uses the F-row or nav cluster',
    ],
    dont: [
      'Don\'t make the board the only place a shortcut is written down. The computed label names the chords, but the surrounding text should too',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 28px; width: min(540px, 100%);">
  <arc-keyboard-map highlight="mod+z, mod+shift+z" caption="Edit: undo and redo history"></arc-keyboard-map>
  <arc-keyboard-map highlight="space" caption="Transport: play/pause"></arc-keyboard-map>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Chords as an attribute string; mod = Cmd on Mac, Ctrl on Windows -->
<arc-keyboard-map highlight="mod+z, mod+shift+z" caption="Undo and redo"></arc-keyboard-map>

<!-- Full board with F-row and nav cluster, pinned to Windows legends -->
<arc-keyboard-map layout="ansi" platform="win" highlight="alt+f4"></arc-keyboard-map>

<!-- Chords as an array property -->
<arc-keyboard-map id="palette-map"></arc-keyboard-map>
<script type="module">
  document.getElementById('palette-map').highlight = ['mod+shift+p', 'escape'];
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { KeyboardMap } from '@arclux/arc-ui-react';

<KeyboardMap highlight={['mod+z', 'mod+shift+z']} caption="Undo and redo" />
<KeyboardMap layout="ansi" platform="win" highlight="alt+f4" />`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { KeyboardMap } from '@arclux/arc-ui-vue';
</script>

<template>
  <KeyboardMap :highlight="['mod+z', 'mod+shift+z']" caption="Undo and redo" />
  <KeyboardMap layout="ansi" platform="win" highlight="alt+f4" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { KeyboardMap } from '@arclux/arc-ui-svelte';
</script>

<KeyboardMap highlight={['mod+z', 'mod+shift+z']} caption="Undo and redo" />
<KeyboardMap layout="ansi" platform="win" highlight="alt+f4" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { KeyboardMap } from '@arclux/arc-ui-angular';

@Component({
  imports: [KeyboardMap],
  template: \`
    <arc-keyboard-map highlight="mod+z, mod+shift+z" caption="Undo and redo" />
    <arc-keyboard-map layout="ansi" platform="win" highlight="alt+f4" />
  \`,
})
export class ShortcutsComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { KeyboardMap } from '@arclux/arc-ui-solid';

<KeyboardMap highlight={['mod+z', 'mod+shift+z']} caption="Undo and redo" />
<KeyboardMap layout="ansi" platform="win" highlight="alt+f4" />`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { KeyboardMap } from '@arclux/arc-ui-preact';

<KeyboardMap highlight={['mod+z', 'mod+shift+z']} caption="Undo and redo" />
<KeyboardMap layout="ansi" platform="win" highlight="alt+f4" />`,
    },
  ],

  seeAlso: ['kbd', 'hotkey', 'command-palette'],
};
