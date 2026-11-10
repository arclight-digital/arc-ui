import type { ComponentDef } from './_types';

export const inlineEdit: ComponentDef = {
  name: 'Inline Edit',
  slug: 'inline-edit',
  tag: 'arc-inline-edit',
  tier: 'input',
  interactivity: 'interactive',
  searchKeywords: ['rename', 'click to edit', 'editable text', 'editable title'],
  description:
    'Text that turns into a pre-filled field when clicked, for renaming titles and labels in place.',

  overview: `Inline Edit shows its value as plain text, with no field chrome and only a faint pencil on hover or focus. Clicking it, or pressing Enter, Space or F2 while it's focused, swaps in a field with the current value selected, ready to type over. Enter or clicking away commits, and Escape throws the edit away.

The display text inherits the surrounding typography and the field matches it, so the text doesn't change size or move when it swaps. In a heading it edits at heading size, and in a table cell at cell size. Use it for renames and titles, where a visible input box would make the page look like a form.

While someone types, the draft streams out as \`arc-input\` events. \`value\`, and the value a surrounding form submits, change only on commit, which fires one \`arc-change\`. Committing an unchanged value fires nothing. Cancelling fires \`arc-cancel\` and restores the previous text.

From script, \`edit()\` enters edit mode with the field focused and its text selected, for a "Rename" menu item or a freshly added row. \`commit()\` and \`cancel()\` leave edit mode the two ways the keyboard does and fire the same events. Call \`commit()\` when something outside the component ends the edit (a toolbar Save, a route change), and \`cancel()\` when a save fails and the old text should come back. \`edit()\` does nothing when the component is disabled, readonly or already editing, so you can call it without checking first.`,

  features: [
    'Takes part in forms through ElementInternals, like Input: the committed value submits under `name`, and `form.reset()` restores the initial text',
    '`required` makes an empty committed value invalid, shown as a faint error tint even in display state',
    '`multiline` edits in a textarea, where Enter inserts a newline and Cmd/Ctrl+Enter commits',
  ],

  guidelines: {
    do: [
      'Always set `label`. It names both the display button ("Edit Track title") and the field',
      'Listen for `arc-change` to save a rename',
      'Use `multiline` for short notes that may wrap, and tell people that Cmd/Ctrl+Enter saves',
      'Set a `placeholder` that fits the content, such as "Untitled track", so an empty value still looks clickable',
      "Use `readonly` when a value is temporarily locked. The text stays in the reading order but can't be edited",
    ],
    dont: [
      "Don't use it in a conventional form layout. A labeled Input tells people there's something to fill in, and Inline Edit hides that",
      "Don't use it for values that need heavy validation or structured entry, such as emails, dates and numbers. Use Input, Date Picker or Number Input",
      "Don't treat `arc-input` as a save signal. It carries the draft, which Escape can still throw away",
      "Don't rely on the pencil to show that text is editable on touch screens. It appears on hover and focus, and touch has no hover",
    ],
  },

  previewHtml: `<div style="display:flex; flex-direction:column; width:100%; max-width:440px; gap:2px;">
  <div style="display:flex; align-items:center; gap:12px;">
    <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted); width:16px; text-align:right;">1</span>
    <arc-inline-edit value="Midnight Signal" label="Track 1 title" placeholder="Untitled track" style="flex:1;"></arc-inline-edit>
    <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted);">3:42</span>
  </div>
  <div style="display:flex; align-items:center; gap:12px;">
    <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted); width:16px; text-align:right;">2</span>
    <arc-inline-edit value="Glass Harbor" label="Track 2 title" placeholder="Untitled track" style="flex:1;"></arc-inline-edit>
    <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted);">4:17</span>
  </div>
  <div style="display:flex; align-items:center; gap:12px;">
    <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted); width:16px; text-align:right;">3</span>
    <arc-inline-edit label="Track 3 title" placeholder="Untitled track" style="flex:1;"></arc-inline-edit>
    <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted);">2:58</span>
  </div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- A renameable track list: text until clicked, field until committed -->
<div style="display:flex; flex-direction:column; max-width:440px; gap:2px;">
  <arc-inline-edit value="Midnight Signal" label="Track 1 title" placeholder="Untitled track"></arc-inline-edit>
  <arc-inline-edit value="Glass Harbor" label="Track 2 title" placeholder="Untitled track"></arc-inline-edit>
  <arc-inline-edit label="Track 3 title" placeholder="Untitled track"></arc-inline-edit>
</div>

<script>
  document.querySelectorAll('arc-inline-edit').forEach((el) => {
    el.addEventListener('arc-change', (e) => {
      console.log('renamed to', e.detail.value);
    });
  });
</script>

<!-- Multiline notes: Enter newlines, Cmd/Ctrl+Enter commits -->
<arc-inline-edit multiline label="Session notes" placeholder="Add a note"></arc-inline-edit>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { InlineEdit } from '@arclux/arc-ui-react';

export default function TrackList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 440, gap: 2 }}>
      <InlineEdit
        value="Midnight Signal"
        label="Track 1 title"
        placeholder="Untitled track"
        onArcChange={(e) => console.log('renamed to', e.detail.value)}
      />
      <InlineEdit value="Glass Harbor" label="Track 2 title" placeholder="Untitled track" />
      <InlineEdit label="Track 3 title" placeholder="Untitled track" />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { InlineEdit } from '@arclux/arc-ui-vue';

function onRename(e) {
  console.log('renamed to', e.detail.value);
}
</script>

<template>
  <div style="display:flex; flex-direction:column; max-width:440px; gap:2px;">
    <InlineEdit value="Midnight Signal" label="Track 1 title" placeholder="Untitled track" @arc-change="onRename" />
    <InlineEdit value="Glass Harbor" label="Track 2 title" placeholder="Untitled track" />
    <InlineEdit label="Track 3 title" placeholder="Untitled track" />
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { InlineEdit } from '@arclux/arc-ui-svelte';

  function onRename(e) {
    console.log('renamed to', e.detail.value);
  }
</script>

<div style="display:flex; flex-direction:column; max-width:440px; gap:2px;">
  <InlineEdit value="Midnight Signal" label="Track 1 title" placeholder="Untitled track" on:arc-change={onRename} />
  <InlineEdit value="Glass Harbor" label="Track 2 title" placeholder="Untitled track" />
  <InlineEdit label="Track 3 title" placeholder="Untitled track" />
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { InlineEdit } from '@arclux/arc-ui-angular';

@Component({
  imports: [InlineEdit],
  template: \`
    <div style="display:flex; flex-direction:column; max-width:440px; gap:2px;">
      <arc-inline-edit value="Midnight Signal" label="Track 1 title" placeholder="Untitled track" (arc-change)="onRename($event)"></arc-inline-edit>
      <arc-inline-edit value="Glass Harbor" label="Track 2 title" placeholder="Untitled track"></arc-inline-edit>
      <arc-inline-edit label="Track 3 title" placeholder="Untitled track"></arc-inline-edit>
    </div>
  \`,
})
export class TrackListComponent {
  onRename(e: CustomEvent<{ value: string }>) {
    console.log('renamed to', e.detail.value);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { InlineEdit } from '@arclux/arc-ui-solid';

export default function TrackList() {
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', 'max-width': '440px', gap: '2px' }}>
      <InlineEdit
        value="Midnight Signal"
        label="Track 1 title"
        placeholder="Untitled track"
        on:arc-change={(e) => console.log('renamed to', e.detail.value)}
      />
      <InlineEdit value="Glass Harbor" label="Track 2 title" placeholder="Untitled track" />
      <InlineEdit label="Track 3 title" placeholder="Untitled track" />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { InlineEdit } from '@arclux/arc-ui-preact';

export default function TrackList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 440, gap: 2 }}>
      <InlineEdit
        value="Midnight Signal"
        label="Track 1 title"
        placeholder="Untitled track"
        onArcChange={(e) => console.log('renamed to', e.detail.value)}
      />
      <InlineEdit value="Glass Harbor" label="Track 2 title" placeholder="Untitled track" />
      <InlineEdit label="Track 3 title" placeholder="Untitled track" />
    </div>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<div style="display:flex; flex-direction:column; max-width:440px; gap:2px;">
  <arc-inline-edit value="Midnight Signal" label="Track 1 title" placeholder="Untitled track"></arc-inline-edit>
  <arc-inline-edit value="Glass Harbor" label="Track 2 title" placeholder="Untitled track"></arc-inline-edit>
  <arc-inline-edit label="Track 3 title" placeholder="Untitled track"></arc-inline-edit>
</div>`,
    },
  ],

  seeAlso: ['input', 'textarea', 'form', 'label'],
};
