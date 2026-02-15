import type { ComponentDef } from './_types';

export const confirm: ComponentDef = {
    name: 'Confirm',
    slug: 'confirm',
    tag: 'arc-confirm',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Programmatic confirmation API that wraps dialog. Call ArcConfirm.open() and await the returned promise. Same visual treatment as dialog.',

    overview: `Confirm provides a promise-based programmatic API for confirmation dialogs. Instead of managing dialog open/close state and listening for button clicks, you call \`ArcConfirm.open()\` with a heading and message, and \`await\` the returned promise. The promise resolves to \`true\` if the user confirms and \`false\` if they cancel — making it trivial to gate destructive actions behind user consent.

Under the hood, Confirm renders a dialog with the same visual treatment — backdrop blur, surface-raised panel, and focus trap — but with a fixed two-button layout: a cancel button (ghost variant) and a confirm button (primary or danger variant depending on the \`variant\` prop). The danger variant uses the error colour for the confirm button, making it visually clear that the action is destructive.

The component can also be used declaratively as \`<arc-confirm>\` with props and events, but the imperative \`ArcConfirm.open()\` API is the recommended pattern for most use cases. A single \`<arc-confirm>\` element in the layout can be reused for all confirmation prompts in the application.`,

    features: [
      'Promise-based ArcConfirm.open() API — await user confirmation in one line',
      'Resolves true on confirm, false on cancel — no event listeners needed',
      'Two variants: default (primary confirm button) and danger (error-coloured confirm button)',
      'Customizable heading, message, confirm label, and cancel label',
      'Same visual treatment as dialog — backdrop blur, surface-raised panel, focus trap',
      'Focus trap keeps keyboard navigation within the dialog while open',
      'Escape key and backdrop click trigger cancel',
      'arc-confirm and arc-cancel events for declarative usage',
      'Accessible — role="alertdialog", aria-modal, auto-focus on confirm button',
    ],

    guidelines: {
      do: [
        'Use the danger variant for destructive actions like delete, remove, or revoke',
        'Write a clear heading that states the action: "Delete project?" not "Are you sure?"',
        'Provide specific confirm/cancel labels: "Delete" and "Keep" instead of "OK" and "Cancel"',
        'Use the imperative API for cleaner async flows: const ok = await ArcConfirm.open(...)',
        'Place a single <arc-confirm> at the root of your layout for reuse across the application',
      ],
      dont: [
        'Use confirm for informational messages that don\'t require a decision — use alert or dialog',
        'Chain multiple confirmations — if the action needs more context, use a full dialog or form',
        'Use vague labels like "OK" and "Cancel" — be specific about what each button does',
        'Fire a confirmation for every action — reserve it for destructive or irreversible operations',
        'Rely on the default browser confirm() — it blocks the thread and cannot be styled',
      ],
    },

    previewHtml: `<div style="width:100%;display:flex;gap:8px;flex-wrap:wrap"><arc-confirm id="demo-confirm"></arc-confirm><arc-button id="demo-confirm-danger" variant="danger">Delete Item</arc-button><arc-button id="demo-confirm-default" variant="secondary">Confirm Action</arc-button></div>`,

    previewSetup: `
      const confirmEl = document.getElementById('demo-confirm');
      document.getElementById('demo-confirm-danger')?.addEventListener('click', async () => {
        if (confirmEl) {
          confirmEl.heading = 'Delete this item?';
          confirmEl.message = 'This action cannot be undone.';
          confirmEl.variant = 'danger';
          confirmEl.confirmLabel = 'Delete';
          confirmEl.cancelLabel = 'Keep';
          confirmEl.open = true;
        }
      });
      document.getElementById('demo-confirm-default')?.addEventListener('click', async () => {
        if (confirmEl) {
          confirmEl.heading = 'Confirm action';
          confirmEl.message = 'Do you want to proceed with this action?';
          confirmEl.variant = 'default';
          confirmEl.confirmLabel = 'Confirm';
          confirmEl.cancelLabel = 'Cancel';
          confirmEl.open = true;
        }
      });
    `,

    props: [
      {
        name: 'open',
        type: 'boolean',
        default: 'false',
        description: 'Controls whether the confirmation dialog is visible. For declarative usage; the imperative API manages this automatically.',
      },
      {
        name: 'heading',
        type: 'string',
        description: 'The heading text displayed at the top of the confirmation dialog.',
      },
      {
        name: 'message',
        type: 'string',
        description: 'The body message explaining what the user is confirming.',
      },
      {
        name: 'confirm-label',
        type: 'string',
        default: "'Confirm'",
        description: 'Label for the confirm button. Use a specific verb like "Delete" or "Publish" instead of generic "OK".',
      },
      {
        name: 'cancel-label',
        type: 'string',
        default: "'Cancel'",
        description: 'Label for the cancel button. Use a specific alternative like "Keep" or "Go back" when possible.',
      },
      {
        name: 'variant',
        type: "'default' | 'danger'",
        default: "'default'",
        description: 'Controls the confirm button style. Use "danger" for destructive actions — the confirm button renders in the error colour.',
      },
    ],
    events: [
      { name: 'arc-confirm', description: 'Fired when the user clicks the confirm button' },
      { name: 'arc-cancel', description: 'Fired when the user clicks cancel, presses Escape, or clicks the backdrop' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-confirm id="confirm"></arc-confirm>

<arc-button variant="danger"
  onclick="Object.assign(document.getElementById('confirm'), {
    heading: 'Delete this item?',
    message: 'This action cannot be undone.',
    variant: 'danger',
    confirmLabel: 'Delete',
    cancelLabel: 'Keep',
    open: true
  })">
  Delete Item
</arc-button>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Confirm, Button } from '@arclux/arc-ui-react';
import { useState } from 'react';

export function ConfirmDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Confirm
        open={open}
        heading="Delete this item?"
        message="This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onArcConfirm={() => { setOpen(false); /* perform delete */ }}
        onArcCancel={() => setOpen(false)}
      />
      <Button variant="danger" onClick={() => setOpen(true)}>Delete Item</Button>
    </>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Button, Confirm } from '@arclux/arc-ui-vue';

const open = ref(false);
const handleConfirm = () => { open.value = false; /* perform delete */ };
</script>

<template>
  <Confirm :open="open" heading="Delete this item?"
    message="This action cannot be undone." variant="danger"
    confirm-label="Delete" cancel-label="Keep"
    @arc-confirm="handleConfirm" @arc-cancel="open = false" />
  <Button variant="danger" @click="open = true">Delete Item</Button>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Button, Confirm } from '@arclux/arc-ui-svelte';

  let open = false;
  const handleConfirm = () => { open = false; /* perform delete */ };
</script>

<Confirm {open} heading="Delete this item?"
  message="This action cannot be undone." variant="danger"
  confirmLabel="Delete" cancelLabel="Keep"
  on:arc-confirm={handleConfirm}
  on:arc-cancel={() => open = false} />
<Button variant="danger" on:click={() => open = true}>Delete Item</Button>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Button, Confirm } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, Confirm],
  template: \`
    <Confirm [open]="open" heading="Delete this item?"
      message="This action cannot be undone." variant="danger"
      confirmLabel="Delete" cancelLabel="Keep"
      (arc-confirm)="onConfirm()" (arc-cancel)="open = false"></Confirm>
    <Button variant="danger" (click)="open = true">Delete Item</Button>
  \`,
})
export class ConfirmDemoComponent {
  open = false;
  onConfirm() {
    this.open = false;
    // perform delete
  }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Button, Confirm } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

export function ConfirmDemo() {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Confirm
        open={open()}
        heading="Delete this item?"
        message="This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onArcConfirm={() => { setOpen(false); /* perform delete */ }}
        onArcCancel={() => setOpen(false)}
      />
      <Button variant="danger" onClick={() => setOpen(true)}>Delete Item</Button>
    </>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Button, Confirm } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

export function ConfirmDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Confirm
        open={open}
        heading="Delete this item?"
        message="This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onArcConfirm={() => { setOpen(false); /* perform delete */ }}
        onArcCancel={() => setOpen(false)}
      />
      <Button variant="danger" onClick={() => setOpen(true)}>Delete Item</Button>
    </>
  );
}`,
      },
    ],

    seeAlso: ['dialog', 'modal', 'alert'],
};
