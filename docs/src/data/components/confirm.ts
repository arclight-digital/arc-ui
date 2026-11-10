import type { ComponentDef } from './_types';

export const confirm: ComponentDef = {
  name: 'Confirm',
  slug: 'confirm',
  tag: 'arc-confirm',
  tier: 'feedback',
  interactivity: 'interactive',
  description:
    'Confirmation prompt built on Dialog. Call ArcConfirm.open() and await a true or false answer.',

  overview: `Confirm asks a yes-or-no question in a small dialog with a cancel button and a confirm button. It comes in two shapes. \`await ArcConfirm.open({ heading, message, ... })\` creates a prompt, resolves to \`true\` on confirm and \`false\` on cancel, then removes the element. Use it at a call site that has to decide before it continues. The \`<arc-confirm>\` element is for templates: bind \`open\` and listen for \`arc-confirm\` and \`arc-cancel\`. Its default slot takes body markup the \`message\` string can't carry, such as a filename in \`<code>\`.

It's built on Dialog, so it has the same blurred backdrop, raised panel and focus trap. Escape, a backdrop click and the X button all count as cancel. \`variant="error"\` turns the confirm button the error color.

**Upgrading from v3:** the \`arc-dialog\` tag used to be this prompt. In v4, \`arc-dialog\` is the overlay primitive (renamed from \`arc-modal\`), and the prompt's props (\`heading\`, \`message\`, \`confirm-label\`, \`cancel-label\`, \`variant\`) moved here unchanged. Only the tag name changed.`,

  features: [
    '`ArcConfirm.open()` takes `heading`, `message`, `confirmLabel`, `cancelLabel` and `variant`. Its body can only be the `message` string',
    'Button labels default to "Confirm" and "Cancel"',
    'In the slot, `<code>` gets the mono font and `<strong>` the primary text color',
  ],

  guidelines: {
    do: [
      'Use `variant="error"` when the action deletes something',
      'Write a heading that names the action: "Delete project?", not "Are you sure?"',
      'Label the buttons with what they do, such as "Delete" and "Keep", not "OK" and "Cancel"',
      'With the element, one `<arc-confirm>` can serve every prompt. Set its props before you open it',
    ],
    dont: [
      'Don\'t use it for a message that needs no decision. Use Alert or Dialog',
      'Don\'t chain confirmations. If the action needs more context, use a Dialog with a form',
      'Don\'t confirm every action. Save it for ones that are destructive or can\'t be undone',
      'Don\'t use the browser\'s `confirm()`. It blocks the page and can\'t be styled',
    ],
  },

  previewHtml: `<div style="width:100%;display:flex;gap:8px;flex-wrap:wrap"><arc-confirm id="demo-confirm"></arc-confirm><arc-button id="demo-confirm-error" variant="primary">Delete item</arc-button><arc-button id="demo-confirm-default" variant="secondary">Confirm action</arc-button></div>`,

  previewSetup: `
      const confirmEl = document.getElementById('demo-confirm');
      document.getElementById('demo-confirm-error')?.addEventListener('click', async () => {
        if (confirmEl) {
          confirmEl.heading = 'Delete this item?';
          confirmEl.message = 'This action cannot be undone.';
          confirmEl.variant = 'error';
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

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-confirm id="confirm"></arc-confirm>

<arc-button variant="primary"
  onclick="Object.assign(document.getElementById('confirm'), {
    heading: 'Delete this item?',
    message: 'This action cannot be undone.',
    variant: 'error',
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
        variant="error"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onArcConfirm={() => { setOpen(false); /* perform delete */ }}
        onArcCancel={() => setOpen(false)}
      />
      <Button variant="primary" onClick={() => setOpen(true)}>Delete Item</Button>
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
    message="This action cannot be undone." variant="error"
    confirm-label="Delete" cancel-label="Keep"
    @arc-confirm="handleConfirm" @arc-cancel="open = false" />
  <Button variant="primary" @click="open = true">Delete Item</Button>
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
  message="This action cannot be undone." variant="error"
  confirmLabel="Delete" cancelLabel="Keep"
  on:arc-confirm={handleConfirm}
  on:arc-cancel={() => open = false} />
<Button variant="primary" on:click={() => open = true}>Delete Item</Button>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Button, Confirm } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, Confirm],
  template: \`
    <arc-confirm [open]="open" heading="Delete this item?"
      message="This action cannot be undone." variant="error"
      confirmLabel="Delete" cancelLabel="Keep"
      (arc-confirm)="onConfirm()" (arc-cancel)="open = false"></arc-confirm>
    <arc-button variant="primary" (click)="open = true">Delete Item</arc-button>
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
        variant="error"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onArcConfirm={() => { setOpen(false); /* perform delete */ }}
        onArcCancel={() => setOpen(false)}
      />
      <Button variant="primary" onClick={() => setOpen(true)}>Delete Item</Button>
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
        variant="error"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onArcConfirm={() => { setOpen(false); /* perform delete */ }}
        onArcCancel={() => setOpen(false)}
      />
      <Button variant="primary" onClick={() => setOpen(true)}>Delete Item</Button>
    </>
  );
}`,
    },
  ],

  seeAlso: ['dialog', 'alert'],
};
