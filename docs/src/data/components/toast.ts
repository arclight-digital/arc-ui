import type { ComponentDef } from './_types';

export const toast: ComponentDef = {
    name: 'Toast',
    slug: 'toast',
    tag: 'arc-toast',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Stack-managed notification toasts with auto-dismiss, variant-colored indicators, configurable position, and smooth enter/exit animations.',

    overview: `Toast provides a stack-managed notification system that surfaces brief, non-blocking messages to the user. Unlike modals or alerts, toasts appear in a fixed corner of the viewport and dismiss themselves automatically, making them ideal for confirming background operations — file saved, record updated, network reconnected — without interrupting the user's workflow.

A single \`<arc-toast>\` element acts as the toaster: you place it once in your layout and call its \`show()\` method imperatively whenever a notification needs to appear. Each call pushes a new toast onto the stack. Multiple toasts stack vertically with consistent spacing, and each one exits with a scale-and-fade animation after the configured duration. This imperative API keeps your template clean — there is no need to manage an array of open notifications in your component state.

Four built-in variants — info, success, warning, and error — apply a colored bottom-edge indicator and a matching icon so users can parse the severity at a glance. The six position options let you anchor the toast stack to any corner or center-edge of the viewport, and a responsive breakpoint ensures toasts span the full width on small screens. The container carries \`role="status"\` and \`aria-live="polite"\` so screen readers announce new messages without stealing focus.`,

    features: [
      'Imperative show() API — call with message, variant, and optional duration',
      'Four variants (info, success, warning, error) with color-coded bottom indicators and icons',
      'Six position anchors: top-right, top-left, top-center, bottom-right, bottom-left, bottom-center',
      'Auto-dismiss after configurable duration (default 4 000 ms); pass 0 to persist',
      'Smooth enter/exit animations with scale and opacity transitions',
      'Manual dismiss via close button on each toast',
      'Vertical stacking with consistent gap for multiple simultaneous toasts',
      'aria-live="polite" container for screen-reader announcements',
      'Respects prefers-reduced-motion — disables animations when set',
      'Responsive full-width layout on viewports under 640 px',
      'arc-dismiss event fires when a toast is removed',
    ],

    guidelines: {
      do: [
        'Place a single <arc-toast> element at the root of your layout so all pages share one toaster',
        'Use the success variant to confirm completed actions like saves, uploads, and deletions',
        'Keep messages short — one sentence or less — so users can read them before auto-dismiss',
        'Use the error variant for failures that need acknowledgment but not a blocking dialog',
        'Set duration to 0 for critical messages that the user must dismiss manually',
        'Pair with form submissions and async operations to provide immediate feedback',
      ],
      dont: [
        'Create multiple <arc-toast> elements on the same page — use one shared instance',
        'Use toasts for information that requires user decision or input; use a Modal instead',
        'Display sensitive data (passwords, tokens) in a toast — they are visible to anyone nearby',
        'Set very short durations (under 2 000 ms); users may not have time to read the message',
        'Rely solely on color to convey meaning — the icon and message text must stand on their own',
        'Fire toasts in rapid succession for batch operations; summarize into a single notification',
      ],
    },

    previewHtml: `<div style="width:100%"><arc-toast id="demo-toaster" position="top-right"></arc-toast><div style="display:flex;gap:8px;flex-wrap:wrap"><arc-button variant="primary" id="demo-toast-success">Show Success Toast</arc-button><arc-button variant="secondary" id="demo-toast-error">Show Error Toast</arc-button></div></div>`,

    previewSetup: `
      const toaster = document.getElementById('demo-toaster');
      document.getElementById('demo-toast-success')?.addEventListener('click', () => {
        toaster?.show({ message: 'Changes saved successfully.', variant: 'success' });
      });
      document.getElementById('demo-toast-error')?.addEventListener('click', () => {
        toaster?.show({ message: 'Something went wrong. Please try again.', variant: 'error' });
      });
    `,

    props: [
      {
        name: 'position',
        type: "'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'",
        default: "'top-right'",
        description: 'Anchors the toast stack to a fixed edge of the viewport. Top-right is the most conventional position for web applications. Bottom positions work well for media players or editors where the top area is occupied by toolbars.',
      },
      {
        name: 'duration',
        type: 'number',
        default: '4000',
        description: 'Time in milliseconds before a toast auto-dismisses. Applies as the default for every show() call but can be overridden per-toast via the duration option in the show() payload. Set to 0 to disable auto-dismiss entirely, requiring the user to click the close button.',
      },
    ],
    events: [
      { name: 'arc-dismiss', description: 'Fired when a toast notification is dismissed' },
    ],

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
</div>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Toast, Button } from '@arclux/arc-ui-react';
import { useRef } from 'react';

export function NotificationDemo() {
  const toastRef = useRef<HTMLElement>(null);

  const showSuccess = () =>
    (toastRef.current as any)?.show({ message: 'Changes saved successfully.', variant: 'success' });
  const showError = () =>
    (toastRef.current as any)?.show({ message: 'Something went wrong.', variant: 'error' });

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

@Component({
  imports: [Button, Toast],
  template: \`
    <Toast #toaster position="top-right"></Toast>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <Button variant="primary" (click)="showSuccess()">Success</Button>
      <Button variant="secondary" (click)="showError()">Error</Button>
    </div>
  \`,
})
export class NotificationDemoComponent {
  @ViewChild('toaster') toaster!: ElementRef;

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

export function NotificationDemo() {
  let toaster: HTMLElement | undefined;

  return (
    <>
      <Toast ref={toaster} position="top-right" />
      <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
        <Button variant="primary"
          onClick={() => (toaster as any)?.show({ message: 'Changes saved successfully.', variant: 'success' })}>
          Success
        </Button>
        <Button variant="secondary"
          onClick={() => (toaster as any)?.show({ message: 'Something went wrong.', variant: 'error' })}>
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
import { useRef } from 'preact/hooks';

export function NotificationDemo() {
  const toastRef = useRef<HTMLElement>(null);

  const showSuccess = () =>
    (toastRef.current as any)?.show({ message: 'Changes saved successfully.', variant: 'success' });
  const showError = () =>
    (toastRef.current as any)?.show({ message: 'Something went wrong.', variant: 'error' });

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
  
  seeAlso: ["alert","notification-panel"],
};
