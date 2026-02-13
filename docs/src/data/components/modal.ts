import type { ComponentDef } from './_types';

export const modal: ComponentDef = {
    name: 'Modal',
    slug: 'modal',
    tag: 'arc-modal',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'General-purpose focus-trapping overlay with backdrop blur, slide-up animation, and ESC-to-close behavior for forms, settings, and rich content that needs full user attention.',

    overview: `Modal is a general-purpose focus-trapping overlay that floats above the page content behind a blurred backdrop. It captures keyboard focus on open, cycles through focusable children with Tab, and returns focus to the trigger element on close. Use Modal any time you need a rich container for forms, settings panels, content previews, or multi-step workflows where background interaction must be blocked.

Unlike Dialog — which is a minimal, top-positioned prompt for urgent binary decisions (discard/cancel, session expiry) — Modal is centered, uses backdrop blur, and supports arbitrary slotted content. It's the right choice for edit forms, creation wizards, detail views, and settings panels. For quick "Are you sure?" confirmations, use Dialog instead.

The component ships with three width presets (sm/md/lg) and a smooth slide-up entrance powered by CSS transforms. The backdrop dims and blurs the underlying page, reinforcing the modal context. Closing is handled automatically via the built-in close button, the Escape key, or a backdrop click — all of which can be disabled with the \`closable\` prop for scenarios that require an explicit user choice.`,

    features: [
      'Automatic focus trap — Tab and Shift+Tab cycle within the dialog',
      'Returns focus to the trigger element on close',
      'Backdrop blur and dim overlay for clear visual hierarchy',
      'Slide-up entry and fade-out exit animations via CSS transforms',
      'ESC key and backdrop click close the dialog by default',
      'Three width presets: sm (400px), md (560px), lg (720px)',
      'Named `footer` slot for action buttons with built-in right-alignment',
      'Closable prop to disable all implicit dismiss paths for critical flows',
      'Fires `arc-close` event when the dialog is dismissed',
      'Fully accessible with `role="dialog"`, `aria-modal`, and `aria-labelledby`',
    ],

    guidelines: {
      do: [
        'Use for forms, settings panels, creation wizards, and rich content overlays',
        'Provide a clear heading that describes what the user is doing',
        'Always include a cancel or dismiss path so users never feel trapped',
        'Place the primary action button last (rightmost) in the footer',
        'Keep modal content concise — long scrolling modals indicate a page is needed instead',
        'Use the `sm` size for simple content, `md` for forms, and `lg` for tables or multi-column layouts',
      ],
      dont: [
        'Do not use Modal for quick binary confirmations — use Dialog instead',
        'Do not nest modals inside other modals — use a stepped flow within a single modal instead',
        'Do not use a modal for passive notifications — use Toast or Alert',
        'Do not disable `closable` unless the workflow truly requires an explicit choice',
        'Do not put complex navigation or multi-page flows inside a modal',
        'Do not auto-open a modal on page load — this is disruptive and hurts accessibility',
      ],
    },

    previewHtml: `<arc-button id="open-demo-modal" variant="secondary">Edit Profile</arc-button>
<arc-modal id="demo-modal" heading="Edit Profile" size="md">
  <div style="display:flex; flex-direction:column; gap:12px;">
    <label style="color: var(--arc-text-secondary, #a1a1aa); font-size: 13px; display:flex; flex-direction:column; gap:4px;">Display Name
      <arc-input value="Ada Lovelace"></arc-input>
    </label>
    <label style="color: var(--arc-text-secondary, #a1a1aa); font-size: 13px; display:flex; flex-direction:column; gap:4px;">Bio
      <arc-input value="Analytical engine enthusiast"></arc-input>
    </label>
  </div>
  <div slot="footer">
    <arc-button id="cancel-demo-modal" variant="ghost">Cancel</arc-button>
    <arc-button id="confirm-demo-modal" variant="primary">Save Changes</arc-button>
  </div>
</arc-modal>`,

    previewSetup: `const openBtn = el.querySelector('#open-demo-modal'); const modal = el.querySelector('#demo-modal'); openBtn?.addEventListener('click', () => { if (modal) modal.open = true; }); el.querySelector('#cancel-demo-modal')?.addEventListener('click', () => { if (modal) modal.open = false; }); el.querySelector('#confirm-demo-modal')?.addEventListener('click', () => { if (modal) modal.open = false; });`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls the visible state of the dialog. Set to `true` to open the modal and activate the focus trap; set to `false` to close it, run the exit animation, and restore focus to the previously-focused element.' },
      { name: 'heading', type: 'string', description: 'Text displayed in the modal header bar. Automatically linked to the dialog via `aria-labelledby` for screen-reader accessibility. Keep it short and action-oriented (e.g. "Delete Project" rather than "Are you sure?").' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the maximum width of the dialog panel. `sm` (400px) is ideal for simple confirmations, `md` (560px) for standard forms, and `lg` (720px) for content-heavy dialogs with tables or multi-column layouts.' },
      { name: 'closable', type: 'boolean', default: 'true', description: 'When `true`, renders the built-in X close button and allows dismissal via Escape key and backdrop click. Set to `false` for critical decision modals where the user must explicitly choose an action from the footer buttons.' },
    ],
    events: [
      { name: 'arc-open', description: 'Fired when the modal opens' },
      { name: 'arc-close', description: 'Fired when the modal closes' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-button id="open-demo-modal" variant="secondary">Edit Profile</arc-button>
<arc-modal id="demo-modal" heading="Edit Profile" size="md">
  <div style="display:flex; flex-direction:column; gap:12px;">
    <label>Display Name
      <arc-input value="Ada Lovelace"></arc-input>
    </label>
    <label>Bio
      <arc-input value="Analytical engine enthusiast"></arc-input>
    </label>
  </div>
  <div slot="footer">
    <arc-button id="cancel-demo-modal" variant="ghost">Cancel</arc-button>
    <arc-button id="confirm-demo-modal" variant="primary">Save Changes</arc-button>
  </div>
</arc-modal>

<script>
  const openBtn = document.querySelector('#open-demo-modal');
  const modal = document.querySelector('#demo-modal');
  openBtn.addEventListener('click', () => { modal.open = true; });
  document.querySelector('#cancel-demo-modal').addEventListener('click', () => { modal.open = false; });
  document.querySelector('#confirm-demo-modal').addEventListener('click', () => { modal.open = false; });
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Modal, Button, Input } from '@arclux/arc-ui-react';
import { useState } from 'react';

function EditProfileModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Edit Profile</Button>
      <Modal open={open} heading="Edit Profile" size="md" onArcClose={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>Display Name<Input value="Ada Lovelace" /></label>
          <label>Bio<Input value="Analytical engine enthusiast" /></label>
        </div>
        <div slot="footer">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Modal>
    </>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Button, Modal, Input } from '@arclux/arc-ui-vue';

const open = ref(false);
</script>

<template>
  <Button variant="secondary" @click="open = true">Edit Profile</Button>
  <Modal :open="open" heading="Edit Profile" size="md" @arc-close="open = false">
    <form style="display:flex; flex-direction:column; gap:12px;">
      <label>Display Name<Input value="Ada Lovelace" /></label>
      <label>Bio<Input value="Analytical engine enthusiast" /></label>
    </form>
    <template #footer>
      <Button variant="ghost" @click="open = false">Cancel</Button>
      <Button variant="primary" @click="open = false">Save Changes</Button>
    </template>
  </Modal>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Button, Modal, Input } from '@arclux/arc-ui-svelte';

  let open = $state(false);
</script>

<Button variant="secondary" onclick={() => open = true}>Edit Profile</Button>
<Modal {open} heading="Edit Profile" size="md" on:arc-close={() => open = false}>
  <div style="display:flex; flex-direction:column; gap:12px;">
    <label>Display Name<Input value="Ada Lovelace" /></label>
    <label>Bio<Input value="Analytical engine enthusiast" /></label>
  </div>
  <div slot="footer">
    <Button variant="ghost" onclick={() => open = false}>Cancel</Button>
    <Button variant="primary" onclick={() => open = false}>Save Changes</Button>
  </div>
</Modal>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Button, Modal, Input } from '@arclux/arc-ui-angular';

@Component({
  imports: [Button, Modal, Input],
  template: \`
    <Button variant="secondary" (click)="open = true">Edit Profile</Button>
    <Modal [open]="open" heading="Edit Profile" size="md" (arcClose)="open = false">
      <div style="display:flex; flex-direction:column; gap:12px;">
        <label>Display Name<Input value="Ada Lovelace" /></label>
        <label>Bio<Input value="Analytical engine enthusiast" /></label>
      </div>
      <div slot="footer">
        <Button variant="ghost" (click)="open = false">Cancel</Button>
        <Button variant="primary" (click)="open = false">Save Changes</Button>
      </div>
    </Modal>
  \`,
})
export class EditProfileComponent {
  open = false;
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { createSignal } from 'solid-js';
import { Button, Modal, Input } from '@arclux/arc-ui-solid';

function EditProfileModal() {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Edit Profile</Button>
      <Modal open={open()} heading="Edit Profile" size="md" onArcClose={() => setOpen(false)}>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <label>Display Name<Input value="Ada Lovelace" /></label>
          <label>Bio<Input value="Analytical engine enthusiast" /></label>
        </div>
        <div slot="footer">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Modal>
    </>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { useState } from 'preact/hooks';
import { Button, Modal, Input } from '@arclux/arc-ui-preact';

function EditProfileModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Edit Profile</Button>
      <Modal open={open} heading="Edit Profile" size="md" onArcClose={() => setOpen(false)}>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <label>Display Name<Input value="Ada Lovelace" /></label>
          <label>Bio<Input value="Analytical engine enthusiast" /></label>
        </div>
        <div slot="footer">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Modal>
    </>
  );
}`,
      },
    ],
  };
