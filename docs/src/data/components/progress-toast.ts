import type { ComponentDef } from './_types';

export const progressToast: ComponentDef = {
    name: 'Progress Toast',
    slug: 'progress-toast',
    tag: 'arc-progress-toast',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Toast variant with embedded progress bar for long-running operations. Same positioning and animation as toast but persists until complete.',

    overview: `Progress Toast extends the toast pattern with an embedded progress bar for long-running operations like file uploads, data exports, and batch processing. Unlike standard toast (which auto-dismisses after a timeout), progress toast persists until the operation completes or is cancelled, giving users continuous visual feedback on the operation's progress.

A single \`<arc-progress-toast>\` element acts as the host — place it once in your layout and call its \`show()\` method with a message, initial progress, and optional cancel callback. The method returns an ID that you use to update progress via \`update(id, progress)\` and to signal completion via \`complete(id)\`. Multiple progress toasts can stack vertically, each tracking an independent operation.

The component shares the same positioning options and enter/exit animations as toast, so it integrates visually with any existing toast notifications. Each progress toast includes a cancel button that fires an \`arc-cancel\` event with the operation ID, and the \`arc-complete\` event fires when an operation reaches 100%.`,

    features: [
      'Imperative show() API — returns an ID for tracking each operation',
      'Embedded progress bar with smooth fill animation',
      'update(id, progress) method for incremental progress updates',
      'complete(id) method to signal completion and trigger auto-dismiss',
      'Cancel button on each toast fires arc-cancel with operation ID',
      'Persists until complete — no auto-dismiss timeout',
      'Vertical stacking for multiple concurrent operations',
      'Same positioning options as toast: top-right, bottom-right',
      'Smooth enter/exit animations matching toast',
      'arc-complete and arc-cancel events with operation ID in detail',
    ],

    guidelines: {
      do: [
        'Use progress-toast for operations that take more than 2-3 seconds',
        'Update progress frequently enough that the bar moves visibly (every 5-10%)',
        'Provide a cancel button for operations that can be aborted',
        'Call complete() to trigger the success state and auto-dismiss animation',
        'Place a single <arc-progress-toast> at the root of your layout for all pages',
      ],
      dont: [
        'Use progress-toast for operations that complete instantly — use regular toast instead',
        'Fire more than 3-4 concurrent progress toasts — it overwhelms the UI',
        'Update progress on every byte — batch updates to avoid performance issues',
        'Forget to handle errors — call complete() or remove the toast on failure',
        'Use progress-toast for indeterminate loading — use loading-overlay or spinner instead',
      ],
    },

    previewHtml: `<div style="width:100%"><arc-progress-toast id="demo-progress-toast" position="bottom-right"></arc-progress-toast><arc-button id="demo-progress-toast-btn" variant="primary">Simulate Upload</arc-button></div>`,

    previewSetup: `
      const pt = document.getElementById('demo-progress-toast');
      document.getElementById('demo-progress-toast-btn')?.addEventListener('click', () => {
        if (!pt) return;
        const id = pt.show({ message: 'Uploading report.pdf...' });
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 100) {
            clearInterval(interval);
            pt.complete(id);
          } else {
            pt.update(id, Math.min(progress, 99));
          }
        }, 400);
      });
    `,

    props: [
      {
        name: 'position',
        type: "'top-right' | 'bottom-right'",
        default: "'bottom-right'",
        description: 'Anchors the progress toast stack to a fixed corner of the viewport.',
      },
    ],
    events: [
      { name: 'arc-complete', description: 'Fired when a progress toast operation reaches 100%. Detail contains { id } with the operation identifier.' },
      { name: 'arc-cancel', description: 'Fired when the user clicks the cancel button on a progress toast. Detail contains { id } with the operation identifier.' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-progress-toast id="progress" position="bottom-right"></arc-progress-toast>

<arc-button variant="primary" onclick="startUpload()">Upload File</arc-button>

<script>
  function startUpload() {
    const pt = document.getElementById('progress');
    const id = pt.show({ message: 'Uploading report.pdf...' });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        pt.complete(id);
      } else {
        pt.update(id, progress);
      }
    }, 500);
  }
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { ProgressToast, Button } from '@arclux/arc-ui-react';
import { useRef } from 'react';

export function UploadDemo() {
  const ptRef = useRef<HTMLElement>(null);

  const startUpload = () => {
    const pt = ptRef.current as any;
    if (!pt) return;
    const id = pt.show({ message: 'Uploading report.pdf...' });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        pt.complete(id);
      } else {
        pt.update(id, progress);
      }
    }, 500);
  };

  return (
    <>
      <ProgressToast ref={ptRef} position="bottom-right" />
      <Button variant="primary" onClick={startUpload}>Upload File</Button>
    </>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Button, ProgressToast } from '@arclux/arc-ui-vue';

const pt = ref(null);
const startUpload = () => {
  const el = pt.value;
  if (!el) return;
  const id = el.show({ message: 'Uploading report.pdf...' });

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    if (progress >= 100) {
      clearInterval(interval);
      el.complete(id);
    } else {
      el.update(id, progress);
    }
  }, 500);
};
</script>

<template>
  <ProgressToast ref="pt" position="bottom-right" />
  <Button variant="primary" @click="startUpload">Upload File</Button>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Button, ProgressToast } from '@arclux/arc-ui-svelte';

  let pt;
  const startUpload = () => {
    if (!pt) return;
    const id = pt.show({ message: 'Uploading report.pdf...' });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        pt.complete(id);
      } else {
        pt.update(id, progress);
      }
    }, 500);
  };
</script>

<ProgressToast bind:this={pt} position="bottom-right" />
<Button variant="primary" on:click={startUpload}>Upload File</Button>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component, ViewChild, ElementRef } from '@angular/core';
import { Button, ProgressToast } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, ProgressToast],
  template: \`
    <ProgressToast #pt position="bottom-right"></ProgressToast>
    <Button variant="primary" (click)="startUpload()">Upload File</Button>
  \`,
})
export class UploadDemoComponent {
  @ViewChild('pt') pt!: ElementRef;

  startUpload() {
    const el = this.pt.nativeElement;
    const id = el.show({ message: 'Uploading report.pdf...' });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        el.complete(id);
      } else {
        el.update(id, progress);
      }
    }, 500);
  }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Button, ProgressToast } from '@arclux/arc-ui-solid';

export function UploadDemo() {
  let pt: HTMLElement | undefined;

  const startUpload = () => {
    const el = pt as any;
    if (!el) return;
    const id = el.show({ message: 'Uploading report.pdf...' });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        el.complete(id);
      } else {
        el.update(id, progress);
      }
    }, 500);
  };

  return (
    <>
      <ProgressToast ref={pt} position="bottom-right" />
      <Button variant="primary" onClick={startUpload}>Upload File</Button>
    </>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Button, ProgressToast } from '@arclux/arc-ui-preact';
import { useRef } from 'preact/hooks';

export function UploadDemo() {
  const ptRef = useRef<HTMLElement>(null);

  const startUpload = () => {
    const pt = ptRef.current as any;
    if (!pt) return;
    const id = pt.show({ message: 'Uploading report.pdf...' });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        pt.complete(id);
      } else {
        pt.update(id, progress);
      }
    }, 500);
  };

  return (
    <>
      <ProgressToast ref={ptRef} position="bottom-right" />
      <Button variant="primary" onClick={startUpload}>Upload File</Button>
    </>
  );
}`,
      },
    ],

    seeAlso: ['toast', 'progress', 'snackbar'],
};
