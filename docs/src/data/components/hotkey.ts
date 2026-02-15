import type { ComponentDef } from './_types';

export const hotkey: ComponentDef = {
  name: 'Hotkey',
  slug: 'hotkey',
  tag: 'arc-hotkey',
  tier: 'input',
  interactivity: 'interactive',
  description: 'Invisible keyboard shortcut listener that supports modifier combos (Ctrl+K) and chord sequences (g i). Fires an event when the key pattern is matched.',

  overview: `Hotkey is a zero-UI component that listens for keyboard shortcuts and fires an \`arc-trigger\` event when a matching key pattern is detected. It renders nothing visible — \`display: none\` is enforced — so it acts purely as a declarative shortcut binding you drop into your template.

The \`keys\` prop accepts modifier combos like \`"ctrl+k"\`, \`"meta+shift+p"\`, and \`"alt+n"\`, as well as Vim-style chord sequences where space-separated keys must be pressed in order (e.g., \`"g i"\` means press G, release, then press I within 1 second). Modifier names are normalized: \`cmd\`/\`command\` → \`meta\`, \`option\` → \`alt\`, \`control\` → \`ctrl\`.

By default, Hotkey skips events when focus is inside an input, textarea, select, or contentEditable element, preventing shortcuts from interfering with typing. Setting \`global\` attaches the listener to \`window\` and removes this filter, useful for app-wide shortcuts that must work regardless of focus.`,

  features: [
    'Modifier combos: ctrl+k, meta+shift+p, alt+n, etc.',
    'Chord sequences: "g i" (press G, then I within 1 second)',
    'Normalized modifier names: cmd/command → meta, option → alt',
    'Automatic input/textarea/select filtering — won\'t fire while typing',
    'Global mode attaches to window and bypasses focus filtering',
    'Disabled prop to temporarily suspend the shortcut',
    'Zero UI — `display: none` enforced, no layout impact',
    'Fires `arc-trigger` with `event.detail.keys` containing the matched pattern'
  ],

  guidelines: {
    do: [
      'Use for app-level shortcuts like Ctrl+K for search or Ctrl+S for save',
      'Set `global` for shortcuts that must work inside text inputs (e.g., Ctrl+S)',
      'Provide visual hints elsewhere in the UI (tooltips, menu items) showing available shortcuts',
      'Use `disabled` to suspend shortcuts when a modal or dialog is open'
    ],
    dont: [
      'Override browser-reserved shortcuts (Ctrl+T, Ctrl+W, Ctrl+N) — they won\'t work',
      'Create chord sequences longer than 2-3 keys — users can\'t remember them',
      'Rely on hotkeys as the only way to access a feature — always provide a clickable alternative',
      'Forget the 1-second chord timeout — slow typists may miss the window'
    ],
  },

  previewHtml: `<div style="padding: 24px; text-align: center;">
  <p style="color: var(--text-muted); margin-bottom: 12px;">Press <arc-kbd>Ctrl+K</arc-kbd> to trigger the shortcut</p>
  <arc-hotkey keys="ctrl+k" id="demo-hotkey"></arc-hotkey>
  <p id="hotkey-output" style="color: var(--text-secondary);"></p>
</div>`,
  previewSetup: `{
  let _t;
  document.getElementById('demo-hotkey')?.addEventListener('arc-trigger', () => {
    const el = document.getElementById('hotkey-output');
    if (!el) return;
    clearTimeout(_t);
    el.textContent = 'Ctrl+K triggered!';
    _t = setTimeout(() => { el.textContent = ''; }, 2000);
  });
}`,

  props: [
    { name: 'keys', type: 'string', default: "''", description: 'Key pattern to match. Modifier combos use "+" (e.g., "ctrl+k"). Chords use spaces (e.g., "g i").' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Temporarily suspends the shortcut listener.' },
    { name: 'global', type: 'boolean', default: 'false', description: 'When true, attaches to `window` instead of `document` and skips input/textarea filtering.' }
  ],

  events: [
    { name: 'arc-trigger', description: 'Fired when the full key pattern is matched. `event.detail.keys` contains the matched pattern string.' }
  ],

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
    .addEventListener('arc-trigger', () => openSearch());

  document.getElementById('save-hotkey')
    .addEventListener('arc-trigger', () => saveDocument());
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
      <Hotkey keys="ctrl+k" onArcTrigger={handleSearch} />
      <Hotkey keys="ctrl+s" global onArcTrigger={handleSave} />
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
  <Hotkey keys="ctrl+k" @arc-trigger="openSearch" />
  <Hotkey keys="ctrl+s" global @arc-trigger="saveDoc" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Hotkey } from '@arclux/arc-ui-svelte';

  function openSearch() { /* ... */ }
</script>

<Hotkey keys="ctrl+k" on:arc-trigger={openSearch} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Hotkey } from '@arclux/arc-ui-angular';

@Component({
  imports: [Hotkey],
  template: \`
    <Hotkey keys="ctrl+k" (arc-trigger)="openSearch()" />
    <Hotkey keys="ctrl+s" global (arc-trigger)="save()" />
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

<Hotkey keys="ctrl+k" onArcTrigger={() => openSearch()} />
<Hotkey keys="ctrl+s" global onArcTrigger={() => save()} />`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Hotkey } from '@arclux/arc-ui-preact';

<Hotkey keys="ctrl+k" onArcTrigger={() => openSearch()} />
<Hotkey keys="ctrl+s" global onArcTrigger={() => save()} />`,
    },
  ],

  seeAlso: ['kbd', 'command-palette'],
};
