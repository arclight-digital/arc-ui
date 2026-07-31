import type { ComponentDef } from './_types';

export const inlineEdit: ComponentDef = {
  name: 'Inline Edit',
  slug: 'inline-edit',
  tag: 'arc-inline-edit',
  tier: 'input',
  interactivity: 'interactive',
  searchKeywords: ['rename', 'click to edit', 'editable text', 'editable title'],
  description:
    'Click-to-edit text that renders as plain content until activated, then swaps to a pre-filled field. Enter or blur commits, Escape cancels. Built for track renames, titles, and other fields where a permanent input box would be visual noise.',

  overview: `Inline Edit is text that happens to be editable. In its resting state it renders the current value as plain text with no field chrome at all — just a faint pencil affordance on hover or focus. Clicking it, or pressing Enter or F2 while it is focused, swaps in a field pre-filled with the current value, text selected and ready to overtype. Enter or clicking away commits; Escape throws the edit away.

The display text inherits the surrounding typography, and the edit field matches it, so the swap never changes the text's size or position. An Inline Edit inside a heading edits at heading size; one in a table cell edits at cell size. This is the component's whole reason to exist: rename flows and title fields where a visible input box would say "form" when the page is saying "document".

While the user types, keystrokes accumulate in an internal draft and stream out as \`arc-input\` events. The \`value\` prop — and the value a surrounding form submits — only changes when the edit commits, which fires a single \`arc-change\`. Committing an unchanged value fires nothing, so listeners never see a rename that didn't happen. Cancelling fires \`arc-cancel\` and restores the previous text.

Inline Edit participates in forms through the same ElementInternals machinery as Input: give it a \`name\` and the committed value is submitted, \`required\` makes an empty committed value invalid (shown as a quiet error tint even in display state), and \`form.reset()\` restores the initial text. The \`multiline\` prop swaps the edit field to a textarea, where Enter inserts a newline and Cmd/Ctrl+Enter commits.`,

  features: [
    'Renders as plain text until activated — no field chrome in the resting state',
    'Display text inherits surrounding typography, and the edit field matches it, so the swap never reflows',
    'Activation by click, or Enter, Space, or F2 while focused; the field opens pre-filled with the text selected',
    'Enter or blur commits and fires a single `arc-change`; Escape reverts and fires `arc-cancel`',
    'Committing an unchanged value fires no event at all',
    '`arc-input` streams the draft on every keystroke while editing',
    'Multiline mode edits in a textarea: Enter inserts a newline, Cmd/Ctrl+Enter commits',
    'Full form participation: named submission of the committed value, `required` validation, reset support',
    'Programmatic control through `edit()`, `commit()`, and `cancel()` methods',
    'Pencil affordance and hover tint follow the design tokens; the swap animates subtly and honors reduced motion',
  ],

  guidelines: {
    do: [
      'Use Inline Edit where the text is content first and a field second: titles, track names, table cells, sidebar labels',
      'Always provide a `label` — it becomes the accessible name ("Edit Track title") for the display button and the field',
      'Listen for `arc-change` to persist a rename; it fires once per commit and only when the value actually changed',
      'Use `multiline` for short notes and descriptions that may wrap, and tell users that Cmd/Ctrl+Enter saves',
      'Set a domain-specific `placeholder` ("Untitled track") so an empty value still reads as something clickable',
      'Use `readonly` when a value is temporarily locked — the text stays in the reading order without inviting an edit',
    ],
    dont: [
      'Do not use Inline Edit in a conventional form layout — a labelled Input communicates "fill me in"; Inline Edit deliberately hides that invitation',
      'Do not use it for values needing heavy validation or structured entry (emails, dates, numbers) — use Input, DatePicker, or NumberInput',
      'Do not treat `arc-input` as a save signal; it carries the in-progress draft, which Escape may still throw away',
      'Do not hide the only editing path behind hover alone on touch-heavy interfaces — the affordance also appears on focus, so keep the control reachable by keyboard',
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
