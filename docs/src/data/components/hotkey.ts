import type { ComponentDef } from './_types';

export const hotkey: ComponentDef = {
  name: 'Hotkey',
  slug: 'hotkey',
  tag: 'arc-hotkey',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'An invisible element that fires an event when someone presses a keyboard shortcut, like Ctrl+K or the chord g i.',

  overview: `Hotkey listens for a keyboard shortcut and fires \`arc-hotkey-trigger\` when someone presses it. It renders nothing (\`display: none\` is enforced), so you can put it anywhere in your markup.

The \`keys\` prop takes modifier combos like \`"ctrl+k"\`, \`"meta+shift+p"\` and \`"alt+n"\`, or a Vim-style chord of space-separated keys pressed in order: \`"g i"\` means press G, release, then press I within 1 second. Modifier names are normalized: \`cmd\`/\`command\` → \`meta\`, \`option\` → \`alt\`, \`control\` → \`ctrl\`.

By default, Hotkey ignores keys typed into a text input, textarea, select or contentEditable element. Inputs you don't type into, like checkboxes and sliders, don't block it. Setting \`global\` listens on \`window\` instead of \`document\` and drops that filter, so the shortcut also fires while someone is typing.`,

  features: [
    '`disabled` suspends the shortcut without removing the element',
    "The event's `detail.keys` holds the pattern that matched",
  ],

  guidelines: {
    do: [
      'Set `global` for shortcuts that must work inside text inputs, such as Ctrl+S',
      'Show the shortcut somewhere in the UI, in a tooltip or a menu item',
      'Set `disabled` while a modal or dialog is open',
    ],
    dont: [
      "Don't bind shortcuts the browser reserves, like Ctrl+T, Ctrl+W and Ctrl+N. They won't fire",
      "Don't make chords longer than two or three keys. People won't remember them",
      "Don't make a hotkey the only way to reach a feature. Give it a button or menu item too",
    ],
  },

  previewHtml: `<div style="padding: 24px; text-align: center;">
  <p style="color: var(--text-muted); margin-bottom: 12px;">Press <arc-kbd>Ctrl+K</arc-kbd> to trigger the shortcut</p>
  <arc-hotkey keys="ctrl+k" id="demo-hotkey"></arc-hotkey>
  <p id="hotkey-output" style="color: var(--text-secondary);"></p>
</div>`,
  previewSetup: `{
  let _t;
  document.getElementById('demo-hotkey')?.addEventListener('arc-hotkey-trigger', () => {
    const el = document.getElementById('hotkey-output');
    if (!el) return;
    clearTimeout(_t);
    el.textContent = 'Ctrl+K triggered!';
    _t = setTimeout(() => { el.textContent = ''; }, 2000);
  });
}`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Search shortcut -->
<arc-hotkey keys="ctrl+k" id="search-hotkey"></arc-hotkey>

<!-- Vim-style chord: press g, then i -->
<arc-hotkey keys="g i" id="go-inbox"></arc-hotkey>

<!-- Global shortcut (works in inputs) -->
<arc-hotkey keys="ctrl+s" global id="save-hotkey"></arc-hotkey>

<script type="module">
  document.getElementById('search-hotkey')
    .addEventListener('arc-hotkey-trigger', () => openSearch());

  document.getElementById('save-hotkey')
    .addEventListener('arc-hotkey-trigger', () => saveDocument());
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Hotkey } from '@arclux/arc-ui-react';

function App() {
  const handleSearch = () => openSearch();
  const handleSave = () => saveDocument();

  return (
    <>
      <Hotkey keys="ctrl+k" onArcHotkeyTrigger={handleSearch} />
      <Hotkey keys="ctrl+s" global onArcHotkeyTrigger={handleSave} />
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Hotkey } from '@arclux/arc-ui-vue';

function openSearch() { /* ... */ }
function saveDoc() { /* ... */ }
</script>

<template>
  <Hotkey keys="ctrl+k" @arc-hotkey-trigger="openSearch" />
  <Hotkey keys="ctrl+s" global @arc-hotkey-trigger="saveDoc" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Hotkey } from '@arclux/arc-ui-svelte';

  function openSearch() { /* ... */ }
</script>

<Hotkey keys="ctrl+k" on:arc-hotkey-trigger={openSearch} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Hotkey } from '@arclux/arc-ui-angular';

@Component({
  imports: [Hotkey],
  template: \`
    <arc-hotkey keys="ctrl+k" (arc-hotkey-trigger)="openSearch()" />
    <arc-hotkey keys="ctrl+s" global (arc-hotkey-trigger)="save()" />
  \`,
})
export class AppComponent {
  openSearch() { /* ... */ }
  save() { /* ... */ }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Hotkey } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Hotkey keys="ctrl+k" onArcHotkeyTrigger={() => openSearch()} />
      <Hotkey keys="ctrl+s" global onArcHotkeyTrigger={() => save()} />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Hotkey } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Hotkey keys="ctrl+k" onArcHotkeyTrigger={() => openSearch()} />
      <Hotkey keys="ctrl+s" global onArcHotkeyTrigger={() => save()} />
    </>
  );
}`,
    },
  ],

  seeAlso: ['kbd', 'command-palette'],
};
