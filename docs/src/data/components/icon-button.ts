import type { ComponentDef } from './_types';

export const iconButton: ComponentDef = {
  name: 'Icon Button',
  slug: 'icon-button',
  tag: 'arc-icon-button',
  tier: 'input',
  interactivity: 'hybrid',
  description:
    'Compact button that shows an icon, with an optional text label, in ghost, secondary or primary variants.',

  overview: `Icon Button is a button whose main content is an icon. Icon-only, it's a circle. Set \`text\` and it becomes a small rounded rectangle with an uppercase label beside the icon. Use it in toolbars, action bars and card headers.

There are three variants: \`ghost\` (transparent, the default), \`secondary\` (bordered, with a glow on hover) and \`primary\` (solid accent fill). Icon-only sizes are \`xs\` (28px), \`sm\` (32px), \`md\` (36px, the default) and \`lg\` (44px), and each size has its own padding when there's text.

With \`href\`, it renders an \`<a>\` in place of a \`<button>\`. \`name\` picks an icon from arc-icon. For your own SVG, leave \`name\` empty and put the SVG in the default slot.`,

  features: [
    'The icon scales with `size`',
    'Pressing it scales the button to 0.93',
    'A disabled link drops its `href` and gets `aria-disabled`, so it leaves the tab order',
    'An `aria-label` set on the host moves to the inner button. If `label` is also set, `label` wins',
  ],

  guidelines: {
    do: [
      'Give every icon-only button a `label`. Without one, screen readers have nothing to announce',
      'Use `ghost` for secondary actions in toolbars',
      'Use `href` for navigation so the button renders a real link',
      'Use `xs` or `sm` in dense UIs such as table rows',
      'Pair icon-only buttons with Tooltip so people can see what they do',
    ],
    dont: [
      'Don\'t use it for the main action on a page. Use Button',
      'Don\'t use long `text`. The uppercase label and tight padding fit one or two words',
      'Don\'t put several `primary` icon buttons in one row. Save the solid fill for the most important action',
    ],
  },

  previewHtml: `<div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
  <arc-icon-button name="pencil" label="Edit"></arc-icon-button>
  <arc-icon-button name="trash" label="Delete" variant="secondary"></arc-icon-button>
  <arc-icon-button name="plus" label="Add item" variant="primary"></arc-icon-button>
  <arc-icon-button name="gear" text="Settings" variant="secondary" size="sm"></arc-icon-button>
  <arc-icon-button name="heart" label="Favorite" variant="primary" size="lg"></arc-icon-button>
  <arc-icon-button name="download" text="Export" variant="ghost" size="md"></arc-icon-button>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Toolbar with mixed variants -->
<div style="display:flex; gap:8px; align-items:center;">
  <arc-icon-button name="pencil" label="Edit" variant="ghost"></arc-icon-button>
  <arc-icon-button name="copy" label="Duplicate" variant="ghost"></arc-icon-button>
  <arc-icon-button name="trash" label="Delete" variant="ghost"></arc-icon-button>
  <arc-icon-button name="share" label="Share" variant="secondary"></arc-icon-button>
  <arc-icon-button name="plus" text="New Item" variant="primary"></arc-icon-button>
</div>

<!-- Sizes -->
<div style="display:flex; gap:8px; align-items:center; margin-top:16px;">
  <arc-icon-button name="star" label="Favorite" size="xs"></arc-icon-button>
  <arc-icon-button name="star" label="Favorite" size="sm"></arc-icon-button>
  <arc-icon-button name="star" label="Favorite" size="md"></arc-icon-button>
  <arc-icon-button name="star" label="Favorite" size="lg"></arc-icon-button>
</div>

<!-- Navigation link -->
<arc-icon-button name="gear" text="Settings" variant="secondary" href="/settings"></arc-icon-button>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { IconButton } from '@arclux/arc-ui-react';

function DocumentToolbar({ onSave, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <IconButton name="pencil" label="Edit" />
      <IconButton name="copy" label="Duplicate" />
      <IconButton name="download" label="Download" variant="secondary" />
      <IconButton name="trash" label="Delete" variant="secondary"
        onClick={onDelete} />
      <IconButton name="floppy-disk" text="Save" variant="primary"
        onClick={onSave} />
    </div>
  );
}

function SocialActions() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <IconButton name="heart" label="Like" size="lg" variant="primary" />
      <IconButton name="share" label="Share" size="lg" variant="secondary" />
      <IconButton name="bookmark" label="Bookmark" size="lg" />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { IconButton } from '@arclux/arc-ui-vue';

function handleEdit() { console.log('Editing...'); }
function handleDelete() { console.log('Deleting...'); }
</script>

<template>
  <!-- Card action bar -->
  <div style="display:flex; gap:8px; align-items:center;">
    <IconButton name="pencil" label="Edit" @click="handleEdit" />
    <IconButton name="copy" label="Duplicate" variant="ghost" />
    <IconButton name="trash" label="Delete" variant="secondary" @click="handleDelete" />
  </div>

  <!-- With text labels for clarity -->
  <div style="display:flex; gap:8px; align-items:center; margin-top:16px;">
    <IconButton name="download" text="Export" variant="secondary" />
    <IconButton name="share" text="Share" variant="ghost" />
    <IconButton name="plus" text="Add" variant="primary" />
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { IconButton } from '@arclux/arc-ui-svelte';

  let liked = false;
</script>

<!-- Toggle-style icon button -->
<IconButton
  name={liked ? 'heart-fill' : 'heart'}
  label={liked ? 'Unlike' : 'Like'}
  variant={liked ? 'primary' : 'ghost'}
  on:click={() => liked = !liked}
/>

<!-- Compact toolbar -->
<div style="display:flex; gap:4px;">
  <IconButton name="pencil" label="Edit" size="sm" />
  <IconButton name="copy" label="Copy" size="sm" />
  <IconButton name="link" label="Copy Link" size="sm" />
  <IconButton name="trash" label="Delete" size="sm" variant="secondary" />
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { IconButton } from '@arclux/arc-ui-angular';

@Component({
  imports: [IconButton],
  template: \`
    <div style="display:flex; gap:8px; align-items:center;">
      <arc-icon-button name="pencil" label="Edit" (click)="onEdit()"></arc-icon-button>
      <arc-icon-button name="copy" label="Duplicate" variant="ghost"></arc-icon-button>
      <arc-icon-button name="trash" label="Delete" variant="secondary" (click)="onDelete()"></arc-icon-button>
      <arc-icon-button name="plus" text="New Item" variant="primary" (click)="onCreate()"></arc-icon-button>
    </div>

    <!-- Navigation links -->
    <div style="display:flex; gap:8px; margin-top:16px;">
      <arc-icon-button name="gear" text="Settings" variant="secondary" href="/settings"></arc-icon-button>
      <arc-icon-button name="bell" text="Notifications" variant="ghost" href="/notifications"></arc-icon-button>
    </div>
  \`,
})
export class ToolbarComponent {
  onEdit() { console.log('Edit'); }
  onDelete() { console.log('Delete'); }
  onCreate() { console.log('Create'); }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { IconButton } from '@arclux/arc-ui-solid';

function TableRowActions(props: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <IconButton name="pencil" label="Edit" size="xs" onClick={props.onEdit} />
      <IconButton name="copy" label="Duplicate" size="xs" />
      <IconButton name="trash" label="Delete" size="xs" variant="secondary" onClick={props.onDelete} />
    </div>
  );
}

function PageHeader() {
  return (
    <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
      <IconButton name="arrow-left" label="Back" href="/" />
      <IconButton name="share" text="Share" variant="secondary" />
      <IconButton name="download" text="Export" variant="primary" />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { IconButton } from '@arclux/arc-ui-preact';

function MediaControls() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <IconButton name="skip-back" label="Previous" size="sm" />
      <IconButton name="play" label="Play" variant="primary" size="lg" />
      <IconButton name="skip-forward" label="Next" size="sm" />
      <IconButton name="speaker-high" label="Volume" size="sm" variant="ghost" />
      <IconButton name="heart" label="Favorite" size="sm" />
    </div>
  );
}`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- arc-icon-button is interactive — requires JS -->
<arc-icon-button></arc-icon-button>`,
    },

    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-icon-button — requires icon-button.css + tokens.css (or arc-ui.css) -->
<span class="arc-icon-button">
  <a href="#" aria-label="Label"></a>
</span>`,
    },
  ],

  seeAlso: ['button', 'copy-button', 'tooltip'],
};
