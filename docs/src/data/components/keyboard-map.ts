import type { ComponentDef } from './_types';

export const keyboardMap: ComponentDef = {
  name: 'Keyboard Map',
  slug: 'keyboard-map',
  tag: 'arc-keyboard-map',
  tier: 'typography',
  interactivity: 'static',
  searchKeywords: ['shortcut diagram', 'cheat sheet', 'keycap', 'keyboard layout', 'hotkey map'],
  description:
    'A rendered keyboard with highlighted keys and chords — the visual big sibling of Kbd and Hotkey, for shortcut documentation and editor cheat sheets.',

  overview: `Keyboard Map draws a full keyboard as a grid of keycaps and lights up the keys named in its \`highlight\` prop. Where Kbd names a key inline and Hotkey listens for one invisibly, Keyboard Map shows a chord in its physical context — Cmd+Shift+P stops being three tokens in a sentence and becomes three glowing caps on a board, which is how people actually remember shortcuts. Highlighted keys carry the house state marking: accent tint, glow, and accent legend text.

The \`highlight\` prop accepts chords as an array property (\`["mod+z", "mod+shift+z"]\`) or as a comma- or space-separated attribute string. Chord syntax follows Hotkey's conventions — keys join with "+", \`cmd\`/\`command\` normalize to meta, \`option\` to alt — plus \`mod\`, which resolves to Cmd on Mac and Ctrl on Windows so one chord string documents both platforms. The \`platform\` prop controls modifier legends and \`mod\` resolution: "auto" detects the visitor's platform in the browser (and renders the Mac board on the server), while "mac" and "win" pin it. Two layouts cover the documentation cases: \`compact\` (the default) is a 60%-style block without nav cluster or numpad, and \`ansi\` adds the F-row and nav cluster. The board is deliberately a stylised diagram rather than a keyboard configurator — there is no ISO/JIS machinery, because chasing physical-layout fidelity would trade legibility for configuration surface.

The component is pure display typography: no slots, no click events, nothing focusable. A shortcut diagram that responded to clicks would imply the keys do something, and wiring real shortcuts is Hotkey's job — the two compose naturally, one listening while the other documents. Accessibility follows the diagram model: the board is a single \`role="img"\` whose label is computed from the chords ("Keyboard diagram highlighting Cmd+Shift+P"), and the individual key legends are hidden from assistive technology. The board scales to its container; \`--keyboard-map-key\` overrides the key size, and legends step out below ~340px where they would be unreadable noise.`,

  features: [
    'Chord highlighting with accent tint, glow, and accent legend text — the house state marking',
    'Platform-aware `mod` (Cmd on Mac, Ctrl on Windows) and modifier legends (⌘ ⌥ ⇧ ⌃ vs Ctrl/Alt/Shift/Win), following Hotkey’s normalization',
    'Two layouts: compact (60%-style, the default) and ansi (adds F-row and nav cluster)',
    'Highlight as an array property or a comma/space-separated attribute string; unknown key names are ignored',
    'Optional caption below the board in muted text',
    'role="img" with an aria-label computed from the chords; key legends hidden from assistive tech',
    'Scales to its container; `--keyboard-map-key` and `--keyboard-map-gap` tune the geometry',
    'Server-renders deterministically — platform detection waits for the browser, defaulting to Mac',
  ],

  guidelines: {
    do: [
      'Use Keyboard Map for cheat sheets and settings pages where seeing a chord on the board beats reading it — Kbd stays the right tool for a shortcut mentioned inline in a sentence',
      'Write chords with `mod` (mod+shift+p) so one string documents Cmd on Mac and Ctrl on Windows',
      'Pair it with Hotkey: Hotkey wires the shortcut, Keyboard Map documents it',
      'Group related chords on one board (undo and redo together) and give each board a caption naming the group',
      'Prefer the compact layout — reach for ansi only when a chord actually uses the F-row or nav cluster',
    ],
    dont: [
      'Do not use it as an input device or key tester — it is documentation typography, deliberately non-interactive, and renders no click events',
      'Do not put one board per shortcut in running prose — that is Kbd’s job; a board earns its space by showing several related chords in context',
      'Do not expect ISO, JIS, or numpad geometry — the diagram is stylised, and unknown layout values fall back to compact',
      'Do not rely on the highlight alone to document a shortcut for screen reader users — the computed label names the chords, but the surrounding text should too',
    ],
  },

  previewHtml: `<div style="display: flex; flex-direction: column; gap: 28px; width: min(540px, 100%);">
  <arc-keyboard-map highlight="mod+z, mod+shift+z" caption="Edit — undo and redo history"></arc-keyboard-map>
  <arc-keyboard-map highlight="space" caption="Transport — play / pause"></arc-keyboard-map>
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
