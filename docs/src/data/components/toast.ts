import type { ComponentDef } from './_types';

export const toast: ComponentDef = {
  name: 'Toast',
  slug: 'toast',
  tag: 'arc-toast',
  tier: 'feedback',
  interactivity: 'interactive',
  searchKeywords: ['notification', 'progress', 'snackbar', 'action'],
  description:
    'Stack-managed notification toasts with auto-dismiss, variant-colored indicators, configurable position, and smooth enter/exit animations.',

  overview: `Toast provides a stack-managed notification system that surfaces brief, non-blocking messages to the user. Unlike modals or alerts, toasts appear in a fixed corner of the viewport and dismiss themselves automatically, making them ideal for confirming background operations — file saved, record updated, network reconnected — without interrupting the user's workflow.

A single \`<arc-toast>\` element acts as the toaster: you place it once in your layout and call its \`show()\` method imperatively whenever a notification needs to appear. Each call pushes a new toast onto the stack. Multiple toasts stack vertically with consistent spacing, and each one exits with a scale-and-fade animation after the configured duration. This imperative API keeps your template clean — there is no need to manage an array of open notifications in your component state.

**Queueing is built in.** \`max-visible\` (default 3) caps how many toasts are on screen at once; the rest wait and appear as slots free up, with \`queue-limit\` bounding the backlog. Set \`max-visible="0"\` for unbounded stacking. \`dedupe\` collapses a repeat of a message already showing into a "(×N)" counter on the existing toast — updated in place, so nothing flickers — and restarts its timer, so a message that keeps repeating stays on screen while it does. \`arc-queue-change\` reports the visible and queued counts; \`arc-queue-overflow\` fires when the backlog is full and the oldest queued toast is dropped.

\`show()\` returns the id it assigned, and \`dismiss(id)\` removes that toast whether it is visible or still queued.

Toasts can also be raised from anywhere without a reference to the element: dispatch an \`arc-toast\` event on \`document\` with the same options \`show()\` takes.

**Progress mode** covers long-running work. Pass a numeric \`progress\` to \`show()\` and the toast renders a track beneath its message, then exempts itself from the two behaviours that assume a message is momentary: it is never deduped, and it never auto-dismisses. Two uploads of a file with the same name are two uploads, so coalescing them would leave one bar tracking both; and the toast ends when the work does, not when a timer says so. Move the bar with \`updateToast(id, { progress })\` — which can revise the message in the same call — and finish with \`complete(id)\`, which dismisses it and fires \`arc-complete\`. Supplying an \`onCancel\` callback turns the close button into a cancel button and fires \`arc-cancel\`; without one the toast keeps an ordinary dismiss. \`complete\` is deliberately not \`dismiss\`: the operation finishing and the user closing the toast are different events, and code waiting on the first should not be woken by the second. The mode is chosen at \`show()\` and cannot be switched on later — a track appearing mid-life would relayout a notification the reader is already reading.

**An action button** turns a toast into an undo or a retry. \`actionLabel\` renders a ghost button in the toast, and a click runs the \`action\` callback, fires \`arc-action\`, and dismisses. Both the callback and the event exist because a callback cannot be attached declaratively, and either is a valid way to listen.

Four built-in variants — info, success, warning, and error — apply a colored bottom-edge indicator and a matching icon so users can parse the severity at a glance. The six position options let you anchor the toast stack to any corner or center-edge of the viewport, and a responsive breakpoint ensures toasts span the full width on small screens. The container carries \`role="status"\` and \`aria-live="polite"\` so screen readers announce new messages without stealing focus.`,

  features: [
    'Imperative show() API — call with message, variant, and optional duration; returns the toast id',
    '`max-visible` caps on-screen toasts (default 3) and queues the rest; `queue-limit` bounds the backlog',
    '`dedupe` collapses a repeated message into a "(×N)" counter, updated in place',
    '`dismiss(id)` removes a toast whether it is visible or still queued',
    'Progress mode — pass `progress` to `show()` for a track that skips dedupe and never auto-dismisses',
    '`updateToast(id, { progress, message })` moves the bar and revises the text; `complete(id)` ends it and fires `arc-complete`',
    '`onCancel` turns the close button into a cancel button and fires `arc-cancel`',
    '`action` and `actionLabel` render an undo/retry button that fires `arc-action` before dismissing',
    'Document-level `arc-toast` event raises a toast without a reference to the element',
    '`arc-queue-change` and `arc-queue-overflow` report queue state',
    'Four variants (info, success, warning, error) with color-coded bottom indicators and icons',
    'Six position anchors: top-right, top-left, top-center, bottom-right, bottom-left, bottom-center',
    'Auto-dismiss after configurable duration (default 4 000 ms); pass 0 to persist',
    'Smooth enter/exit animations with scale and opacity transitions',
    'Manual dismiss via close button on each toast',
    'Vertical stacking with consistent gap for multiple simultaneous toasts',
    'aria-live="polite" container for screen-reader announcements',
    'Respects `prefers-reduced-motion` — disables animations when set',
    'Responsive full-width layout on viewports under 640 px',
    '`arc-close` event fires when a toast is removed',
  ],

  guidelines: {
    do: [
      'Place a single <arc-toast> element at the root of your layout so all pages share one toaster',
      'Use the success variant to confirm completed actions like saves, uploads, and deletions',
      'Keep messages short — one sentence or less — so users can read them before auto-dismiss',
      'Use the error variant for failures that need acknowledgment but not a blocking dialog',
      'Set duration to 0 for critical messages that the user must dismiss manually',
      'Pair with form submissions and async operations to provide immediate feedback',
      'Use progress mode for work with a knowable percentage — uploads, exports, batch jobs',
      'Give a progress toast an onCancel whenever the work can actually be abandoned, so the button means something',
      'Call complete(id) when the work finishes, so listeners can tell completion from the user closing the toast',
    ],
    dont: [
      'Do not create multiple <arc-toast> elements on the same page — use one shared instance',
      'Do not use toasts for information that requires user decision or input; use a Dialog, or Confirm for a yes/no',
      'Do not display sensitive data (passwords, tokens) in a toast — they are visible to anyone nearby',
      'Do not set very short durations (under 2 000 ms); users may not have time to read the message',
      'Do not rely solely on color to convey meaning — the icon and message text must stand on their own',
      'Do not fire toasts in rapid succession for batch operations; summarize into a single notification',
      'Do not use progress mode for work of unknown duration — a bar that cannot advance honestly is a Spinner',
      'Do not leave a progress toast open after its work ends; it never auto-dismisses, so complete(id) or dismiss(id) is required',
      'Do not put the only route to an irreversible action in a toast action button — it dismisses on its own',
    ],
  },

  previewHtml: `<div style="width:100%"><arc-toast id="demo-toaster" position="top-right"></arc-toast><div style="display:flex;gap:8px;flex-wrap:wrap"><arc-button variant="primary" id="demo-toast-success">Show Success Toast</arc-button><arc-button variant="secondary" id="demo-toast-error">Show Error Toast</arc-button><arc-button variant="ghost" id="demo-toast-progress">Upload a File</arc-button></div></div>`,

  previewSetup: `
      const toaster = document.getElementById('demo-toaster');
      document.getElementById('demo-toast-success')?.addEventListener('click', () => {
        toaster?.show({ message: 'Changes saved successfully.', variant: 'success' });
      });
      document.getElementById('demo-toast-error')?.addEventListener('click', () => {
        toaster?.show({ message: 'Something went wrong. Please try again.', variant: 'error' });
      });
      document.getElementById('demo-toast-progress')?.addEventListener('click', () => {
        let pct = 0;
        let timer;
        // onCancel is what puts the cancel button on the toast, so the demo has
        // to clear its own timer when the reader uses it.
        const id = toaster?.show({
          message: 'Uploading report.pdf…',
          progress: 0,
          onCancel: () => clearInterval(timer),
        });
        timer = setInterval(() => {
          pct += 8;
          if (pct >= 100) {
            clearInterval(timer);
            toaster?.updateToast(id, { progress: 100, message: 'Uploaded report.pdf' });
            setTimeout(() => toaster?.complete(id), 700);
            return;
          }
          toaster?.updateToast(id, { progress: pct });
        }, 240);
      });
    `,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-toast id="toaster" position="top-right"></arc-toast>

<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <arc-button variant="primary"
    onclick="document.getElementById('toaster').show({ message: 'Changes saved successfully.', variant: 'success' })">
    Success
  </arc-button>
  <arc-button variant="secondary"
    onclick="document.getElementById('toaster').show({ message: 'Something went wrong.', variant: 'error' })">
    Error
  </arc-button>
  <arc-button variant="ghost"
    onclick="document.getElementById('toaster').show({ message: 'Deployment in progress...', variant: 'warning', duration: 6000 })">
    Warning (6 s)
  </arc-button>
  <arc-button variant="ghost" onclick="upload()">Upload</arc-button>
</div>

<script>
  // Progress mode: a numeric progress option renders the track. The toast then
  // skips dedupe and never auto-dismisses — it ends when complete() says so.
  async function upload() {
    const toaster = document.getElementById('toaster');
    const controller = new AbortController();
    const id = toaster.show({
      message: 'Uploading report.pdf…',
      progress: 0,
      onCancel: () => controller.abort(),   // this is what renders the cancel button
    });

    try {
      for (let sent = 0; sent <= 100; sent += 10) {
        await sendChunk(sent, { signal: controller.signal });
        toaster.updateToast(id, { progress: sent });
      }
      toaster.updateToast(id, { message: 'Uploaded report.pdf' });
      toaster.complete(id);                 // dismisses and fires arc-complete
    } catch {
      toaster.dismiss(id);
      toaster.show({ message: 'Upload failed.', variant: 'error' });
    }
  }

  // Completion and cancellation are distinct events, so a listener can tell
  // "the work finished" from "the user closed it".
  document.getElementById('toaster').addEventListener('arc-complete', (e) => {
    console.log('upload finished', e.detail.id);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Toast, Button } from '@arclux/arc-ui-react';
import type { ArcToast } from '@arclux/arc-ui/toast';
import { useRef } from 'react';

export function NotificationDemo() {
  // Typing the ref as ArcToast is what makes show()/updateToast()/complete()
  // and the shape of the options object visible to TypeScript.
  const toastRef = useRef<ArcToast>(null);

  const showSuccess = () =>
    toastRef.current?.show({ message: 'Changes saved successfully.', variant: 'success' });
  const showError = () =>
    toastRef.current?.show({ message: 'Something went wrong.', variant: 'error' });

  // Progress mode. show() returns the id every later call needs, and the toast
  // stays until complete() or dismiss() — there is no timer to race.
  const upload = async () => {
    const toaster = toastRef.current;
    if (!toaster) return;
    const controller = new AbortController();
    const id = toaster.show({
      message: 'Uploading report.pdf…',
      progress: 0,
      onCancel: () => controller.abort(),
    });

    for (let sent = 0; sent <= 100; sent += 10) {
      await sendChunk(sent, { signal: controller.signal });
      toaster.updateToast(id, { progress: sent });
    }
    toaster.complete(id);
  };

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={showSuccess}>Success</Button>
        <Button variant="secondary" onClick={showError}>Error</Button>
        <Button variant="ghost" onClick={upload}>Upload</Button>
      </div>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { Button, Toast } from '@arclux/arc-ui-vue';

const toaster = ref(null);
const showSuccess = () => toaster.value?.show({ message: 'Changes saved successfully.', variant: 'success' });
const showError   = () => toaster.value?.show({ message: 'Something went wrong.', variant: 'error' });
</script>

<template>
  <Toast ref="toaster" position="top-right" />
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <Button variant="primary" @click="showSuccess">Success</Button>
    <Button variant="secondary" @click="showError">Error</Button>
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Button, Toast } from '@arclux/arc-ui-svelte';

  let toaster;
  const showSuccess = () => toaster?.show({ message: 'Changes saved successfully.', variant: 'success' });
  const showError   = () => toaster?.show({ message: 'Something went wrong.', variant: 'error' });
</script>

<Toast bind:this={toaster} position="top-right" />
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <Button variant="primary" on:click={showSuccess}>Success</Button>
  <Button variant="secondary" on:click={showError}>Error</Button>
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component, ViewChild, ElementRef } from '@angular/core';
import { Button, Toast } from '@arclux/arc-ui-angular';
import type { ArcToast } from '@arclux/arc-ui/toast';

@Component({
  imports: [Button, Toast],
  template: \`
    <arc-toast #toaster position="top-right"></arc-toast>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <arc-button variant="primary" (click)="showSuccess()">Success</arc-button>
      <arc-button variant="secondary" (click)="showError()">Error</arc-button>
    </div>
  \`,
})
export class NotificationDemoComponent {
  @ViewChild('toaster') toaster!: ElementRef<ArcToast>;

  showSuccess() {
    this.toaster.nativeElement.show({ message: 'Changes saved successfully.', variant: 'success' });
  }
  showError() {
    this.toaster.nativeElement.show({ message: 'Something went wrong.', variant: 'error' });
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Button, Toast } from '@arclux/arc-ui-solid';
import type { ArcToast } from '@arclux/arc-ui/toast';

export function NotificationDemo() {
  let toaster: ArcToast | undefined;

  return (
    <>
      <Toast ref={toaster} position="top-right" />
      <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
        <Button variant="primary"
          onClick={() => toaster?.show({ message: 'Changes saved successfully.', variant: 'success' })}>
          Success
        </Button>
        <Button variant="secondary"
          onClick={() => toaster?.show({ message: 'Something went wrong.', variant: 'error' })}>
          Error
        </Button>
      </div>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Button, Toast } from '@arclux/arc-ui-preact';
import type { ArcToast } from '@arclux/arc-ui/toast';
import { useRef } from 'preact/hooks';

export function NotificationDemo() {
  const toastRef = useRef<ArcToast>(null);

  const showSuccess = () =>
    toastRef.current?.show({ message: 'Changes saved successfully.', variant: 'success' });
  const showError = () =>
    toastRef.current?.show({ message: 'Something went wrong.', variant: 'error' });

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={showSuccess}>Success</Button>
        <Button variant="secondary" onClick={showError}>Error</Button>
      </div>
    </>
  );
}`,
    },
  ],

  seeAlso: ['alert', 'notification-panel'],
};
