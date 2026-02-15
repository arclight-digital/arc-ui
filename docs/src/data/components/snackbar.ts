import type { ComponentDef } from './_types';

export const snackbar: ComponentDef = {
    name: 'Snackbar',
    slug: 'snackbar',
    tag: 'arc-snackbar',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Bottom-anchored single-line notification with optional action button. Darker than toast — surface-base background with accent-colored action link. Slides up, auto-dismisses.',

    overview: `Snackbar sits at the bottom of the viewport for brief, non-critical notifications. Unlike toast (which stacks in a corner), snackbar is a single-line bar anchored at the bottom center. Ideal for "undo" patterns after destructive actions.

A single \`<arc-snackbar>\` element acts as the snackbar host — place it once in your layout and call its \`show()\` method whenever you need a bottom-bar notification. Each invocation replaces the current snackbar (there is no stacking), keeping the UI clean and focused. The snackbar slides up from the bottom edge with a subtle ease-out animation and auto-dismisses after the configured duration.

The surface-base background gives snackbar a darker, more grounded feel than toast, while the accent-colored action link draws the eye to the primary call to action — typically "Undo" or "Retry". The component carries \`role="status"\` and \`aria-live="polite"\` so screen readers announce the message without interrupting the user's current task.`,

    features: [
      'Imperative show() API — call with message, optional action label, and duration',
      'Bottom-anchored single-line bar with surface-base background',
      'Three position options: bottom-center, bottom-left, bottom-right',
      'Accent-colored action link for undo/retry patterns',
      'Auto-dismiss after configurable duration (default 5 000 ms)',
      'Slide-up enter and slide-down exit animations',
      'Single-instance — new show() replaces the current snackbar, no stacking',
      'aria-live="polite" for non-intrusive screen-reader announcements',
      'Respects prefers-reduced-motion — disables slide animations when set',
      'arc-dismiss and arc-action events for parent component integration',
    ],

    guidelines: {
      do: [
        'Use snackbar for brief confirmations of completed actions like "Item deleted" or "Message sent"',
        'Include an action button for destructive operations so users can undo immediately',
        'Place a single <arc-snackbar> at the root of your layout for all pages to share',
        'Keep messages to a single line — snackbar is not designed for multi-line content',
        'Use the arc-action event to handle undo/retry logic in your application state',
      ],
      dont: [
        'Stack multiple snackbars — use toast if you need a notification queue',
        'Use snackbar for errors that require user acknowledgment — use alert or dialog instead',
        'Set very short durations (under 3 000 ms) when an action button is present',
        'Display sensitive data in a snackbar — it is visible to anyone nearby',
        'Use snackbar for persistent information — it auto-dismisses by design',
      ],
    },

    previewHtml: `<div style="width:100%"><arc-snackbar id="demo-snackbar" position="bottom-center"></arc-snackbar><div style="display:flex;gap:8px;flex-wrap:wrap"><arc-button variant="primary" id="demo-snackbar-undo">Show Undo Snackbar</arc-button><arc-button variant="secondary" id="demo-snackbar-simple">Show Simple Snackbar</arc-button></div></div>`,

    previewSetup: `
      const snackbar = document.getElementById('demo-snackbar');
      document.getElementById('demo-snackbar-undo')?.addEventListener('click', () => {
        snackbar?.show({ message: 'Item deleted.', action: 'Undo' });
      });
      document.getElementById('demo-snackbar-simple')?.addEventListener('click', () => {
        snackbar?.show({ message: 'Message sent successfully.' });
      });
    `,

    props: [
      {
        name: 'position',
        type: "'bottom-center' | 'bottom-left' | 'bottom-right'",
        default: "'bottom-center'",
        description: 'Anchors the snackbar to a bottom edge of the viewport. Bottom-center is the conventional position for material-style snackbars.',
      },
      {
        name: 'duration',
        type: 'number',
        default: '5000',
        description: 'Time in milliseconds before the snackbar auto-dismisses. Can be overridden per-show via the duration option. Set to 0 to persist until manually dismissed.',
      },
    ],
    events: [
      { name: 'arc-dismiss', description: 'Fired when the snackbar is dismissed, either by auto-timeout or user interaction' },
      { name: 'arc-action', description: 'Fired when the user clicks the action button (e.g. "Undo")' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-snackbar id="snackbar" position="bottom-center"></arc-snackbar>

<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <arc-button variant="primary"
    onclick="document.getElementById('snackbar').show({ message: 'Item deleted.', action: 'Undo' })">
    Delete Item
  </arc-button>
  <arc-button variant="secondary"
    onclick="document.getElementById('snackbar').show({ message: 'Message sent successfully.' })">
    Send Message
  </arc-button>
</div>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Snackbar, Button } from '@arclux/arc-ui-react';
import { useRef } from 'react';

export function SnackbarDemo() {
  const snackbarRef = useRef<HTMLElement>(null);

  const showUndo = () =>
    (snackbarRef.current as any)?.show({ message: 'Item deleted.', action: 'Undo' });
  const showSimple = () =>
    (snackbarRef.current as any)?.show({ message: 'Message sent successfully.' });

  return (
    <>
      <Snackbar ref={snackbarRef} position="bottom-center" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={showUndo}>Delete Item</Button>
        <Button variant="secondary" onClick={showSimple}>Send Message</Button>
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
import { Button, Snackbar } from '@arclux/arc-ui-vue';

const snackbar = ref(null);
const showUndo   = () => snackbar.value?.show({ message: 'Item deleted.', action: 'Undo' });
const showSimple = () => snackbar.value?.show({ message: 'Message sent successfully.' });
</script>

<template>
  <Snackbar ref="snackbar" position="bottom-center" />
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <Button variant="primary" @click="showUndo">Delete Item</Button>
    <Button variant="secondary" @click="showSimple">Send Message</Button>
  </div>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Button, Snackbar } from '@arclux/arc-ui-svelte';

  let snackbar;
  const showUndo   = () => snackbar?.show({ message: 'Item deleted.', action: 'Undo' });
  const showSimple = () => snackbar?.show({ message: 'Message sent successfully.' });
</script>

<Snackbar bind:this={snackbar} position="bottom-center" />
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <Button variant="primary" on:click={showUndo}>Delete Item</Button>
  <Button variant="secondary" on:click={showSimple}>Send Message</Button>
</div>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component, ViewChild, ElementRef } from '@angular/core';
import { Button, Snackbar } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, Snackbar],
  template: \`
    <Snackbar #snackbar position="bottom-center"></Snackbar>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <Button variant="primary" (click)="showUndo()">Delete Item</Button>
      <Button variant="secondary" (click)="showSimple()">Send Message</Button>
    </div>
  \`,
})
export class SnackbarDemoComponent {
  @ViewChild('snackbar') snackbar!: ElementRef;

  showUndo() {
    this.snackbar.nativeElement.show({ message: 'Item deleted.', action: 'Undo' });
  }
  showSimple() {
    this.snackbar.nativeElement.show({ message: 'Message sent successfully.' });
  }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Button, Snackbar } from '@arclux/arc-ui-solid';

export function SnackbarDemo() {
  let snackbar: HTMLElement | undefined;

  return (
    <>
      <Snackbar ref={snackbar} position="bottom-center" />
      <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
        <Button variant="primary"
          onClick={() => (snackbar as any)?.show({ message: 'Item deleted.', action: 'Undo' })}>
          Delete Item
        </Button>
        <Button variant="secondary"
          onClick={() => (snackbar as any)?.show({ message: 'Message sent successfully.' })}>
          Send Message
        </Button>
      </div>
    </>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Button, Snackbar } from '@arclux/arc-ui-preact';
import { useRef } from 'preact/hooks';

export function SnackbarDemo() {
  const snackbarRef = useRef<HTMLElement>(null);

  const showUndo = () =>
    (snackbarRef.current as any)?.show({ message: 'Item deleted.', action: 'Undo' });
  const showSimple = () =>
    (snackbarRef.current as any)?.show({ message: 'Message sent successfully.' });

  return (
    <>
      <Snackbar ref={snackbarRef} position="bottom-center" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={showUndo}>Delete Item</Button>
        <Button variant="secondary" onClick={showSimple}>Send Message</Button>
      </div>
    </>
  );
}`,
      },
    ],

    seeAlso: ['toast', 'banner', 'alert'],
};
