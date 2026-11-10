import type { ComponentDef } from './_types';

export const dialog: ComponentDef = {
  name: 'Dialog',
  slug: 'dialog',
  tag: 'arc-dialog',
  tier: 'feedback',
  interactivity: 'interactive',
  searchKeywords: ['modal', 'popup', 'overlay'],
  description:
    'General-purpose focus-trapping overlay on the native <dialog>, with a blurred backdrop, a slide-up entrance and Escape to close. For forms, settings and other content that blocks the page.',

  overview: `Dialog is the general overlay, built on the native \`<dialog>\` element, so the browser handles the top layer, \`::backdrop\` and modality. It opens over a blurred backdrop, moves focus inside, and returns focus to where it came from when it closes. Use it for forms, settings, previews and multi-step flows where the page behind shouldn't be usable.

**Renamed in v4.** This component was \`arc-modal\` through v3. That tag was removed in v4.0.0, not aliased. The v3 \`arc-dialog\` tag was a small confirm prompt, and that component is now \`arc-confirm\`. If you pass this Dialog the old prompt props (\`message\`, \`confirm-label\`, \`cancel-label\`), it logs a \`console.error\` that points you to \`arc-confirm\`.

\`dismissible\` is on by default. It shows the X button and lets Escape and a backdrop click close the dialog. Set it to \`false\` for decisions the user has to make with the footer buttons. \`arc-close\` is cancelable, so \`preventDefault()\` keeps the dialog open, for example while a form inside it is saving.`,

  features: [
    'The backdrop\'s dim and blur come from `--dialog-backdrop` and `--dialog-backdrop-filter`',
    'Slides up on open and fades out on close',
    '`size` sets the max width: `sm` is 400px, `md` 560px and `lg` 720px. `fullscreen` fills the viewport',
    '`header` and `footer` slots around the body',
    '`heading` is the text in the header bar and the dialog\'s accessible name',
  ],

  guidelines: {
    do: [
      'Keep `dismissible` on unless closing by accident would lose the user\'s work',
      'Put actions in the `footer` slot, with the confirming action last',
      'Use `size="sm"` for short single-purpose dialogs, and `lg` only for dense content',
    ],
    dont: [
      'Don\'t use it for a yes-or-no question. Use `arc-confirm`, which already has the two buttons',
      'Don\'t stack dialogs. Close one before opening another',
      'Don\'t use it for passive notices. Use Alert or Toast, which don\'t take focus',
    ],
  },

  previewHtml: `<arc-button onclick="this.nextElementSibling.open = true" variant="secondary">Edit profile</arc-button>
<arc-dialog heading="Edit profile" size="sm">
  <arc-input label="Display name" value="Ada Lovelace"></arc-input>
  <arc-input label="Email" type="email" value="ada@example.com" style="margin-top:var(--space-md)"></arc-input>
  <div slot="footer" style="display:flex;gap:var(--space-sm);justify-content:flex-end">
    <arc-button variant="ghost" onclick="this.closest('arc-dialog').open = false">Cancel</arc-button>
    <arc-button variant="primary" onclick="this.closest('arc-dialog').open = false">Save changes</arc-button>
  </div>
</arc-dialog>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-button id="edit">Edit Profile</arc-button>

<arc-dialog heading="Edit Profile" size="sm">
  <arc-input label="Display Name"></arc-input>
  <div slot="footer">
    <arc-button variant="ghost" data-close>Cancel</arc-button>
    <arc-button variant="primary" data-close>Save Changes</arc-button>
  </div>
</arc-dialog>

<script>
  const dialog = document.querySelector('arc-dialog');
  document.getElementById('edit').addEventListener('click', () => {
    dialog.open = true;
  });
  dialog.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) dialog.open = false;
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Dialog, Button, Input } from '@arclux/arc-ui-react';
import { useState } from 'react';

function EditProfile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit Profile</Button>
      <Dialog heading="Edit Profile" size="sm" open={open} onArcClose={() => setOpen(false)}>
        <Input label="Display Name" />
        <div slot="footer">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Dialog>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { Dialog, Button, Input } from '@arclux/arc-ui-vue';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Edit Profile</Button>
  <Dialog heading="Edit Profile" size="sm" :open="open" @arc-close="open = false">
    <Input label="Display Name" />
    <div slot="footer">
      <Button variant="ghost" @click="open = false">Cancel</Button>
      <Button variant="primary" @click="open = false">Save Changes</Button>
    </div>
  </Dialog>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Dialog, Button, Input } from '@arclux/arc-ui-svelte';
  let open = false;
</script>

<Button on:click={() => (open = true)}>Edit Profile</Button>
<Dialog heading="Edit Profile" size="sm" {open} on:arc-close={() => (open = false)}>
  <Input label="Display Name" />
  <div slot="footer">
    <Button variant="ghost" on:click={() => (open = false)}>Cancel</Button>
    <Button variant="primary" on:click={() => (open = false)}>Save Changes</Button>
  </div>
</Dialog>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Dialog, Button, Input } from '@arclux/arc-ui-angular';

@Component({
  imports: [Dialog, Button, Input],
  template: \`
    <arc-button (click)="open = true">Edit Profile</arc-button>
    <arc-dialog heading="Edit Profile" size="sm" [open]="open" (arc-close)="open = false">
      <arc-input label="Display Name" />
      <div slot="footer">
        <arc-button variant="ghost" (click)="open = false">Cancel</arc-button>
        <arc-button variant="primary" (click)="open = false">Save Changes</arc-button>
      </div>
    </arc-dialog>
  \`,
})
export class EditProfileComponent {
  open = false;
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Dialog, Button, Input } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

function EditProfile() {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit Profile</Button>
      <Dialog heading="Edit Profile" size="sm" open={open()} on:arc-close={() => setOpen(false)}>
        <Input label="Display Name" />
        <div slot="footer">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Dialog>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Dialog, Button, Input } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

function EditProfile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit Profile</Button>
      <Dialog heading="Edit Profile" size="sm" open={open} onArcClose={() => setOpen(false)}>
        <Input label="Display Name" />
        <div slot="footer">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Dialog>
    </>
  );
}`,
    },
  ],

  seeAlso: ['confirm', 'sheet', 'drawer'],
};
