import type { ComponentDef } from './_types';

export const dialog: ComponentDef = {
    name: 'Dialog',
    slug: 'dialog',
    tag: 'arc-dialog',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Urgent, top-positioned confirmation dialog for interruptive decisions — unsaved changes, session expiry, and discard prompts.',

    overview: `Dialog is a lightweight, urgent confirmation component that appears at the top of the viewport like a system alert. Unlike Modal, which is a centered overlay with backdrop blur for rich content, Dialog is purpose-built for quick, interruptive "Are you sure?" moments — unsaved changes, session warnings, and discard prompts.

Visually, Dialog is designed to feel urgent and minimal: it drops in from the top with a snappy animation, uses a light dimmed backdrop without blur, and features a colored accent line at the top of the card (like Alert and Toast) that color-codes by variant. The \`variant="danger"\` option adds a red accent line and a subtle glow to the card border, reinforcing the severity of the action.

The component uses \`role="alertdialog"\` with \`aria-modal="true"\` to properly signal its interruptive nature to screen readers. Focus is automatically trapped between the Cancel and Confirm buttons, and the Confirm button receives initial focus on open. Escape key and backdrop clicks both trigger cancellation. The \`confirm()\` method returns a \`Promise<boolean>\` — call \`await dialog.confirm()\` and the promise resolves to \`true\` on confirm or \`false\` on cancel.`,

    features: [
      'Top-positioned like a system alert — appears ~15% from the top of the viewport',
      'Colored accent line at top of card — primary for default, red for danger variant',
      'Light dimmed backdrop without blur — feels urgent, not heavy',
      'Snappy drop-in animation (120ms) from slightly above',
      'Promise-based confirm() API — returns true on confirm, false on cancel/escape',
      'Built-in focus trap cycling between Cancel and Confirm buttons',
      'Danger variant with red accent line, glow border, and red confirm button',
      'Escape key and backdrop click trigger cancellation',
      'role="alertdialog" with aria-modal for proper screen reader semantics',
      'Customizable button labels via confirm-label and cancel-label attributes',
    ],

    guidelines: {
      do: [
        'Use Dialog for urgent, interruptive prompts — unsaved changes, session expiry, discard warnings',
        'Keep the message concise — one or two sentences explaining what will happen',
        'Use variant="danger" when the confirmed action is destructive or irreversible',
        'Use the confirm() promise API for cleaner async flow in your logic',
        'Set specific button labels: "Discard Changes" is clearer than "Confirm"',
      ],
      dont: [
        'Use Dialog for complex forms or rich content — use Modal instead',
        'Stack multiple dialogs — resolve one before opening another',
        'Use Dialog for informational messages — use Alert or Toast instead',
        'Use Dialog for general-purpose overlays — that\'s what Modal is for',
        'Use variant="danger" for non-destructive confirmations — it creates unnecessary anxiety',
      ],
    },

    previewHtml: `<arc-button onclick="this.nextElementSibling.open = true" variant="secondary">Discard Draft</arc-button>
<arc-dialog heading="Discard Draft?" message="You have unsaved changes that will be permanently lost. This action cannot be undone." confirm-label="Discard" cancel-label="Keep Editing" variant="danger"></arc-dialog>`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Whether the dialog is visible' },
      { name: 'heading', type: 'string', default: "''", description: 'Dialog title text' },
      { name: 'message', type: 'string', default: "''", description: 'Dialog body message' },
      { name: 'confirm-label', type: 'string', default: "'Confirm'", description: 'Text for the confirm button' },
      { name: 'cancel-label', type: 'string', default: "'Cancel'", description: 'Text for the cancel button' },
      { name: 'variant', type: "'default' | 'danger'", default: "'default'", description: 'Visual variant — danger adds red accent line, glow border, and red confirm button' },
    ],
    events: [
      { name: 'arc-confirm', description: 'Fired when the confirm button is clicked' },
      { name: 'arc-cancel', description: 'Fired when cancel, escape, or backdrop click occurs' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-dialog
  heading="Discard Draft?"
  message="You have unsaved changes that will be permanently lost."
  confirm-label="Discard"
  cancel-label="Keep Editing"
  variant="danger"
></arc-dialog>

<script>
  const dialog = document.querySelector('arc-dialog');
  // Promise-based API
  const confirmed = await dialog.confirm();
  if (confirmed) discardDraft();
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Dialog } from '@arclux/arc-ui-react';
import { useRef } from 'react';

function App() {
  const ref = useRef(null);

  const handleDiscard = async () => {
    const confirmed = await ref.current.confirm();
    if (confirmed) discardDraft();
  };

  return (
    <>
      <button onClick={handleDiscard}>Discard</button>
      <Dialog
        ref={ref}
        heading="Discard Draft?"
        message="You have unsaved changes that will be permanently lost."
        confirm-label="Discard"
        cancel-label="Keep Editing"
        variant="danger"
      />
    </>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Dialog } from '@arclux/arc-ui-vue';

const dialogRef = ref(null);

async function handleDiscard() {
  const confirmed = await dialogRef.value.confirm();
  if (confirmed) discardDraft();
}
</script>

<template>
  <button @click="handleDiscard">Discard</button>
  <Dialog
    ref="dialogRef"
    heading="Discard Draft?"
    message="You have unsaved changes that will be permanently lost."
    confirm-label="Discard"
    cancel-label="Keep Editing"
    variant="danger"
  />
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Dialog } from '@arclux/arc-ui-svelte';
  let dialogEl;

  async function handleDiscard() {
    const confirmed = await dialogEl.confirm();
    if (confirmed) discardDraft();
  }
</script>

<button on:click={handleDiscard}>Discard</button>
<Dialog
  bind:this={dialogEl}
  heading="Discard Draft?"
  message="You have unsaved changes that will be permanently lost."
  confirmLabel="Discard"
  cancelLabel="Keep Editing"
  variant="danger"
/>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component, ViewChild, ElementRef } from '@angular/core';
import { Dialog } from '@arclux/arc-ui-angular';

@Component({
  imports: [Dialog],
  template: \`
    <button (click)="handleDiscard()">Discard</button>
    <Dialog #dialog
      heading="Discard Draft?"
      message="You have unsaved changes that will be permanently lost."
      confirmLabel="Discard"
      cancelLabel="Keep Editing"
      variant="danger"
    />
  \`,
})
export class MyComponent {
  @ViewChild('dialog') dialog!: ElementRef;

  async handleDiscard() {
    const confirmed = await this.dialog.nativeElement.confirm();
    if (confirmed) this.discardDraft();
  }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Dialog } from '@arclux/arc-ui-solid';

let dialogEl;

async function handleDiscard() {
  const confirmed = await dialogEl.confirm();
  if (confirmed) discardDraft();
}

<button onClick={handleDiscard}>Discard</button>
<Dialog
  ref={dialogEl}
  heading="Discard Draft?"
  message="You have unsaved changes that will be permanently lost."
  confirmLabel="Discard"
  cancelLabel="Keep Editing"
  variant="danger"
/>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Dialog } from '@arclux/arc-ui-preact';
import { useRef } from 'preact/hooks';

function App() {
  const ref = useRef(null);

  const handleDiscard = async () => {
    const confirmed = await ref.current.confirm();
    if (confirmed) discardDraft();
  };

  return (
    <>
      <button onClick={handleDiscard}>Discard</button>
      <Dialog
        ref={ref}
        heading="Discard Draft?"
        message="You have unsaved changes that will be permanently lost."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        variant="danger"
      />
    </>
  );
}`,
      },
    ],
  };
