import type { ComponentDef } from './_types';

export const progress: ComponentDef = {
    name: 'Progress',
    slug: 'progress',
    tag: 'arc-progress',
    tier: 'feedback',
    interactivity: 'static',
    replayable: true,
    description: 'Progress indicator as a bar or spinner, with determinate and indeterminate modes. Shows completion state for uploads, installations, and long-running operations.',

    overview: `Progress communicates that work is happening and, when possible, how close it is to completion. It is the right component whenever a user triggers an operation whose duration is noticeable — file uploads, data imports, multi-step wizards, or background processing tasks. A clear progress signal reduces perceived wait time and reassures users that the application has not stalled.

The component ships in two visual variants. The bar variant fills a horizontal track from left to right, making it ideal for operations where percentage complete is known — file transfers, form completion scores, or quota usage. The spinner variant renders a circular animation suited to compact spaces like buttons, table cells, or inline loading states where a full-width bar would feel out of proportion.

Both variants support an indeterminate mode for operations whose total duration is unknown. In indeterminate mode the bar pulses or the spinner loops continuously, signaling activity without committing to a completion estimate. Switch from indeterminate to determinate as soon as the total is known — for example, once the server responds with a Content-Length header during an upload.`,

    features: [
      'Bar variant with horizontal fill track for determinate completion',
      'Spinner variant with circular animation for compact contexts',
      'Indeterminate mode for unknown-duration operations',
      'Three size presets (sm, md, lg) for different layout contexts',
      'Accessible label text announced by screen readers via aria-label',
      'ARIA progressbar role with aria-valuenow, aria-valuemin, and aria-valuemax',
      'Respects prefers-reduced-motion by disabling animations',
      'Smooth fill transition when value updates for determinate bar',
    ],

    guidelines: {
      do: [
        'Use the bar variant when you can report a numeric percentage (e.g. file uploads, multi-step forms)',
        'Switch from indeterminate to determinate as soon as the total work is known',
        'Always provide a label prop so screen readers can announce the purpose of the indicator',
        'Use the spinner variant inside buttons or inline contexts where a bar would be too wide',
        'Pair with descriptive text nearby (e.g. "Uploading project files...") to add context beyond the bar alone',
        'Use the sm size for inline or table-cell indicators and lg for full-width page loaders',
      ],
      dont: [
        'Show a determinate bar stuck at 0% — use indeterminate until real progress data is available',
        'Use a spinner when you have percentage data; bars are more informative for known-length tasks',
        'Omit the label prop — without it the progress indicator is invisible to assistive technology',
        'Animate progress backwards; if the total changes, reset to indeterminate rather than decreasing the value',
        'Stack multiple progress bars in view simultaneously — consolidate into a single indicator or use a stepper',
        'Use progress for instant actions that complete in under 300ms; a brief delay feels faster without a loader',
      ],
    },

    previewHtml: `<div style="display:flex;flex-direction:column;width:100%;gap:var(--space-lg)">
  <arc-progress value="65" label="Uploading project files..."></arc-progress>
  <arc-progress variant="spinner" indeterminate label="Processing upload"></arc-progress>
</div>`,

    props: [
      {
        name: 'value',
        type: 'number',
        default: '0',
        description: 'Current completion percentage from 0 to 100. Only meaningful in determinate mode. The bar fills proportionally and aria-valuenow updates to match, giving screen readers a live reading.',
      },
      {
        name: 'variant',
        type: "'bar' | 'spinner'",
        default: "'bar'",
        description: 'Selects the visual shape. Bar renders a horizontal track with a fill that grows from left to right — best for wide containers and known percentages. Spinner renders a circular indicator suited to compact inline or button contexts.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Controls the thickness of the bar track or the diameter of the spinner. Small (sm) fits inside table cells and tight layouts. Medium (md) is the standard default. Large (lg) is appropriate for page-level or hero loading states.',
      },
      {
        name: 'indeterminate',
        type: 'boolean',
        default: 'false',
        description: 'When true, the bar pulses or the spinner loops without a fixed endpoint. Use this when the total work is unknown. Switch to determinate (indeterminate=false) and set a value as soon as real progress data becomes available.',
      },
      {
        name: 'label',
        type: 'string',
        description: 'Accessible label text applied as aria-label on the underlying progressbar role element. This is the only way screen readers can convey the purpose of the indicator. Always provide a meaningful label such as "Uploading report.pdf" rather than a generic "Loading".',
      },
      {
        name: 'show-value',
        type: 'boolean',
        default: 'false',
        description: 'Displays the current percentage value next to the label.',
      },
    ],

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
      <Progress [value]="65" label="Uploading project files..." />
      <Progress variant="spinner" indeterminate label="Processing upload" />
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
<!-- arc-progress — requires progress.css + tokens.css (or arc-ui.css) -->
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
  
  seeAlso: ["meter","spinner","skeleton"],
};
