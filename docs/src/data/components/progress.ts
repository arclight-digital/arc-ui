import type { ComponentDef } from './_types';

export const progress: ComponentDef = {
  name: 'Progress',
  slug: 'progress',
  tag: 'arc-progress',
  tier: 'feedback',
  interactivity: 'static',
  replayable: true,
  description:
    'A progress bar or spinner for long-running work, with or without a known percentage.',

  overview: `Progress shows that work is running and, when you know it, how far along it is.

The bar variant fills a horizontal track from left to right. Use it when you know the percentage, as with a file transfer or quota usage. The spinner variant is a circle sized for buttons, table cells and inline loading states, where a full-width bar doesn't fit.

Both variants have an indeterminate mode for work of unknown length: a 30% segment slides across the bar, or the spinner loops. Switch to determinate as soon as you know the total, for example once the server sends a Content-Length header during an upload.`,

  features: [
    "`value` is a percentage, clamped to 0-100, and the bar's fill animates when it changes",
    "Three sizes (`sm`, `md`, `lg`) set the bar's thickness or the spinner's diameter",
    '`progressbar` role with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`. `label` is shown above the indicator and used as its `aria-label`',
    'Without a `label`, the accessible name falls back to "Progress" for the bar and "Loading" for the spinner',
    'Under `prefers-reduced-motion`, the indeterminate and spinner animations stop',
  ],

  guidelines: {
    do: [
      'Give every indicator a `label` that says what\'s loading, like "Uploading report.pdf". The fallback names don\'t',
      'Use `sm` in table cells and inline spots, and `lg` for full-page loaders',
    ],
    dont: [
      "Don't leave a determinate bar at 0%. Use indeterminate until real progress data arrives",
      "Don't use a spinner when you have a percentage. Show the bar",
      "Don't move a bar backwards. If the total changes, go back to indeterminate",
      "Don't stack several progress bars on one screen. Combine them into one, or use a Stepper",
      "Don't show a loader for actions that finish almost at once",
    ],
  },

  previewHtml: `<div style="display:flex;flex-direction:column;width:100%;gap:var(--space-lg)">
  <arc-progress value="65" label="Uploading project files..."></arc-progress>
  <arc-progress variant="spinner" indeterminate label="Processing upload"></arc-progress>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<div style="display: flex; flex-direction: column; width: 100%; gap: var(--space-lg);">
  <arc-progress value="65" label="Uploading project files..."></arc-progress>
  <arc-progress variant="spinner" indeterminate label="Processing upload"></arc-progress>
</div>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Progress } from '@arclux/arc-ui-react';

export function FileUploadStatus() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 'var(--space-lg)' }}>
      <Progress value={65} label="Uploading project files..." />
      <Progress variant="spinner" indeterminate label="Processing upload" />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Progress } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display: flex; flex-direction: column; width: 100%; gap: var(--space-lg);">
    <Progress :value="65" label="Uploading project files..." />
    <Progress variant="spinner" indeterminate label="Processing upload" />
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Progress } from '@arclux/arc-ui-svelte';
</script>

<div style="display: flex; flex-direction: column; width: 100%; gap: var(--space-lg);">
  <Progress value={65} label="Uploading project files..." />
  <Progress variant="spinner" indeterminate label="Processing upload" />
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Progress } from '@arclux/arc-ui-angular';

@Component({
  imports: [Progress],
  template: \`
    <div style="display: flex; flex-direction: column; width: 100%; gap: var(--space-lg);">
      <arc-progress [value]="65" label="Uploading project files..." />
      <arc-progress variant="spinner" indeterminate label="Processing upload" />
    </div>
  \`,
})
export class FileUploadStatusComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Progress } from '@arclux/arc-ui-solid';

export function FileUploadStatus() {
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', width: '100%', gap: 'var(--space-lg)' }}>
      <Progress value={65} label="Uploading project files..." />
      <Progress variant="spinner" indeterminate label="Processing upload" />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Progress } from '@arclux/arc-ui-preact';

export function FileUploadStatus() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 'var(--space-lg)' }}>
      <Progress value={65} label="Uploading project files..." />
      <Progress variant="spinner" indeterminate label="Processing upload" />
    </div>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-progress — requires progress.css + base.css (or arc-ui.css) -->
<div class="arc-progress">
  <div>
   Label
   <div
   class="progress__spinner"
   role="progressbar"
   aria-valuenow="Indeterminate"
   aria-valuemin="0"
   aria-valuemax="100"
   aria-label="Label"
   >
   <svg viewBox="0 0 44 44">
   <circle class="progress__spinner-track" cx="22" cy="22" r="20"></circle>
   <circle class="progress__spinner-fill" cx="22" cy="22" r="20"></circle>
   </svg>
   </div>
   </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-progress — self-contained, no external CSS needed -->
<style>
  @media (prefers-reduced-motion: reduce) {
    .arc-progress .progress__fill,
        .arc-progress .progress__spinner svg,
        .arc-progress .progress__spinner-fill { animation: none; }
  }
</style>
<div class="arc-progress" style="display: block">
  <div>
   Label
   <div
   class="progress__spinner" style="display: inline-block"
   role="progressbar"
   aria-valuenow="Indeterminate"
   aria-valuemin="0"
   aria-valuemax="100"
   aria-label="Label"
   >
   <svg viewBox="0 0 44 44">
   <circle style="fill: none; stroke: rgb(24, 24, 30); stroke-width: 3" cx="22" cy="22" r="20"></circle>
   <circle class="progress__spinner-fill" style="fill: none; stroke: rgb(77, 126, 247); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 80, 200; stroke-dashoffset: 0; animation: spinner-dash 1.4s ease-in-out infinite" cx="22" cy="22" r="20"></circle>
   </svg>
   </div>
   </div>
</div>`,
    },
  ],

  seeAlso: ['meter', 'spinner', 'skeleton'],
};
