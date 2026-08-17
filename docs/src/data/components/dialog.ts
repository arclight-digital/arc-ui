import type { ComponentDef } from './_types';

export const dialog: ComponentDef = {
  name: 'Dialog',
  slug: 'dialog',
  tag: 'arc-dialog',
  tier: 'feedback',
  interactivity: 'interactive',
  searchKeywords: ['modal', 'popup', 'overlay'],
  description:
    'General-purpose focus-trapping overlay on the platform <dialog> — backdrop blur, slide-up entrance, and Escape-to-dismiss for forms, settings, and rich content that needs full user attention.',

  overview: `Dialog is the general-purpose overlay primitive, built on the platform's native \`<dialog>\` element. It floats above the page behind a blurred backdrop, moves focus inside on open, and returns focus to the trigger element on close. Use it any time you need a rich container for forms, settings panels, content previews, or multi-step workflows where background interaction must be blocked — the native top layer and \`::backdrop\` do the heavy lifting the way the platform intends.

**Renamed in v4.** This component was \`arc-modal\` through v3; the element is a dialog, the platform calls it a dialog, and *modal* named one of its behaviours rather than what it is. The old tag is gone in v4.0.0 — removed rather than aliased, since v4 never shipped and an alias would have served nobody. Note the hazard in the other direction: the v3 tag \`arc-dialog\` was a small confirm prompt, and that component is now \`arc-confirm\`. Handing this Dialog the old prompt props (\`message\`, \`confirm-label\`, \`cancel-label\`) logs a \`console.error\` naming \`arc-confirm\` rather than silently ignoring them.

The component ships with three width presets (\`sm\`/\`md\`/\`lg\`), a \`fullscreen\` mode, and a smooth slide-up entrance. Dismissal is governed by one prop: \`dismissible\` renders the built-in close button and enables Escape and backdrop click, and it defaults to on — a dialog is dismissible unless you say otherwise. Set it to \`false\` for decisions the user must resolve through the footer buttons. The \`arc-close\` event is cancelable, so \`preventDefault()\` can veto a close while a form inside is mid-save.`,

  features: [
    'Built on the native `<dialog>` element — top layer, `::backdrop`, and modality from the platform',
    'Automatic focus trap — focus moves inside on open and returns to the trigger on close',
    'Backdrop blur and dim, styled via `--dialog-backdrop` and `--dialog-backdrop-filter`',
    'Slide-up entry and fade-out exit animations',
    '`dismissible` (default on): built-in close button, Escape key, and backdrop click',
    'Cancelable `arc-close` event — `preventDefault()` vetoes the close',
    'Three width presets: sm (400px), md (560px), lg (720px), plus `fullscreen`',
    '`header` and `footer` slots around arbitrary body content',
    '`heading` doubles as the dialog’s accessible name',
  ],

  guidelines: {
    do: [
      'Use Dialog for rich content that blocks the page: edit forms, creation wizards, detail views, settings panels',
      'Keep `dismissible` on unless abandoning the dialog would lose meaningful user state',
      'Put primary actions in the `footer` slot, with the confirming action last',
      'Use `size="sm"` for short single-purpose dialogs and `lg` only for genuinely dense content',
      'Cancel the `arc-close` event to hold the dialog open while an in-flight save completes',
    ],
    dont: [
      'Do not use Dialog for a yes/no prompt — that is `arc-confirm`, which exists so you never rebuild the two-button layout',
      'Do not stack dialogs — resolve one before opening another',
      'Do not use Dialog for passive notifications — use Alert or Toast, which do not steal focus',
      'Do not disable `dismissible` for convenience; an inescapable overlay must be earning that severity',
    ],
  },

  previewHtml: `<arc-button onclick="this.nextElementSibling.open = true" variant="secondary">Edit Profile</arc-button>
<arc-dialog heading="Edit Profile" size="sm">
  <arc-input label="Display Name" value="Ada Lovelace"></arc-input>
  <arc-input label="Email" type="email" value="ada@example.com" style="margin-top:var(--space-md)"></arc-input>
  <div slot="footer" style="display:flex;gap:var(--space-sm);justify-content:flex-end">
    <arc-button variant="ghost" onclick="this.closest('arc-dialog').open = false">Cancel</arc-button>
    <arc-button variant="primary" onclick="this.closest('arc-dialog').open = false">Save Changes</arc-button>
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
