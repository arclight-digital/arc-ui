import type { ComponentDef } from './_types';

export const toast: ComponentDef = {
  name: 'Toast',
  slug: 'toast',
  tag: 'arc-toast',
  tier: 'feedback',
  interactivity: 'interactive',
  searchKeywords: ['notification', 'progress', 'snackbar', 'action'],
  description:
    'Short messages that stack at one edge of the screen and dismiss themselves.',

  overview: `Toast shows short messages that don't block the page and dismiss themselves, such as "File saved" or "Back online". Place one \`<arc-toast>\` in your layout and call its \`show()\` method whenever a message should appear. Toasts stack at one corner or edge of the viewport, set by \`position\`, and span the full width below 640px.

\`max-visible\` (3 by default) caps how many are on screen. The rest wait in a queue, up to \`queue-limit\`, and appear as space frees up. Set \`max-visible="0"\` for no cap. Dedupe is on by default. Showing a message that matches a visible or queued toast of the same variant adds a "(×N)" counter to that toast and restarts its timer, in place, with no second toast. Set \`no-dedupe\` to turn it off.

To raise a toast without a reference to the element, dispatch an \`arc-toast\` event on \`document\` with the options \`show()\` takes.

For long-running work, pass a numeric \`progress\` to \`show()\`. The toast draws a track under its message, is never deduped and never dismisses on a timer, so two uploads with the same file name get two bars. Move the bar with \`updateToast(id, { progress })\` and finish with \`complete(id)\`. That dismisses the toast and fires \`arc-complete\`. \`complete\` is separate from \`dismiss\` so that code waiting for the work to finish doesn't run when the reader closes the toast. An \`onCancel\` callback turns the close button into a cancel button that fires \`arc-cancel\`. Progress mode is set at \`show()\` and can't be turned on later.

\`actionLabel\` adds a button for an undo or a retry. Clicking it runs the \`action\` callback, fires \`arc-action\` and dismisses the toast.`,

  features: [
    '`show({ message, variant, duration })` returns the toast\'s id, and `dismiss(id)` removes it whether it\'s visible or queued',
    '`duration` defaults to 4000ms, and 0 keeps a toast until it\'s closed',
    'Positions: `top-right`, `top-left`, `top-center`, `bottom-right`, `bottom-left` and `bottom-center`',
    'Four variants (info, success, warning and error), each with an icon and a colored bottom edge',
    '`updateToast()` can change the message in the same call as the progress',
    '`arc-queue-change` reports the visible and queued counts, and `arc-queue-overflow` fires when the queue is full and the oldest waiting toast is dropped',
    '`arc-close` fires with the toast\'s id when it\'s removed',
    'The container has `role="status"` and `aria-live="polite"`, so screen readers announce new messages without moving focus',
  ],

  guidelines: {
    do: [
      'Place one `<arc-toast>` at the root of your layout so every page shares it',
      'Use `success` to confirm saves, uploads and deletions',
      'Keep messages to one sentence so readers finish before the toast goes',
      'Use `error` for failures that need acknowledging but not a blocking dialog',
      'Set `duration` to 0 for a message the reader must close',
      'Use progress mode for work with a known percentage, such as uploads, exports and batch jobs',
      'Give a progress toast `onCancel` only when the work can really be stopped',
      'Call `complete(id)` when the work finishes',
    ],
    dont: [
      'Don\'t use a toast for anything that needs a decision or input. Use Dialog, or Confirm for a yes or no',
      'Don\'t show passwords, tokens or other secrets. Anyone nearby can see them',
      'Don\'t set a duration under 2000ms. Readers may not finish the message',
      'Don\'t rely on color alone. The icon and the text must carry the meaning',
      'Don\'t fire one toast per item in a batch. Summarize the batch in one',
      'Don\'t use progress mode for work of unknown length. Use Spinner',
      'Don\'t leave a progress toast open after the work ends. It never dismisses itself, so call `complete(id)` or `dismiss(id)`',
      'Don\'t make an action button the only way to reach an irreversible action. The toast dismisses on its own',
    ],
  },

  previewHtml: `<div style="width:100%"><arc-toast id="demo-toaster" position="top-right"></arc-toast><div style="display:flex;gap:8px;flex-wrap:wrap"><arc-button variant="primary" id="demo-toast-success">Show success toast</arc-button><arc-button variant="secondary" id="demo-toast-error">Show error toast</arc-button><arc-button variant="ghost" id="demo-toast-progress">Upload a file</arc-button></div></div>`,

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
