import type { ComponentDef } from './_types';

export const iconButton: ComponentDef = {
    name: 'Icon Button',
    slug: 'icon-button',
    tag: 'arc-icon-button',
    tier: 'input',
    interactivity: 'hybrid',
    description: 'Compact button that renders an icon with optional text label, supporting ghost, secondary, and primary variants.',

    overview: `IconButton is a versatile interactive element designed for actions where an icon is the primary affordance. It renders as a square button when used icon-only, or expands into a compact labeled button when the \`text\` prop is provided. This makes it ideal for toolbars, action bars, card headers, and anywhere space is limited but functionality needs to be discoverable.

The component supports three visual variants: \`ghost\` (transparent background, the default), \`secondary\` (bordered with accent glow on hover), and \`primary\` (solid accent-primary background with a glow effect). Four sizes are available -- \`xs\`, \`sm\`, \`md\`, and \`lg\` -- each with distinct dimensions for both icon-only and icon-plus-text modes. The icon-only mode enforces a 1:1 aspect ratio for visual consistency.

When an \`href\` is provided, IconButton renders as an anchor tag instead of a \`<button>\`, making it suitable for navigation links that should look like action buttons. The \`name\` prop references an icon from the arc-icon library, but you can also pass custom SVG content through the default slot if the built-in icon set does not cover your use case.`,

    features: [
      'Three visual variants: ghost (default transparent), secondary (bordered with blue glow), and primary (solid accent fill)',
      'Four sizes -- xs (24px), sm (32px), md (36px), lg (44px) -- with automatic icon size mapping',
      'Optional `text` prop that expands the button from a square icon into a labeled action button with uppercase styling',
      'Renders as an `<a>` tag when `href` is provided, enabling accessible navigation links',
      'Active-press animation with `scale(0.93)` transform for tactile feedback',
      'Built-in `arc-icon` integration via the `name` prop, or custom content via the default slot',
      'Focus-visible glow ring using the shared `--focus-glow` token for keyboard navigation',
      'Accessible `aria-label` derived automatically from `label`, `text`, or manual override',
    ],

    guidelines: {
      do: [
        'Always provide a `label` or `text` prop so the button has an accessible name for screen readers',
        'Use the `ghost` variant for secondary or tertiary actions in toolbars to reduce visual noise',
        'Use `href` for navigation actions so the element renders as a semantic anchor tag',
        'Match the `size` to surrounding elements -- use `xs` or `sm` in dense UIs like table rows',
        'Pair with `arc-tooltip` to explain icon-only buttons on hover',
      ],
      dont: [
        'Do not use IconButton for primary page actions that need a full-width call to action -- use Button instead',
        'Do not omit the `label` prop on icon-only buttons -- they will be invisible to assistive technology',
        'Do not combine `disabled` with `href` -- anchor tags cannot be natively disabled',
        'Do not use long `text` values -- the uppercase styling and compact padding are designed for 1-2 word labels',
        'Avoid placing many `primary` variant icon buttons in the same row -- reserve the solid fill for the single most important action',
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

    props: [
      { name: 'name', type: 'string', default: "''", description: 'Name of the arc-icon to render. When empty, the default slot is used for custom icon content.' },
      { name: 'text', type: 'string', default: "''", description: 'Optional text label displayed next to the icon. When provided, the button expands from a square to a wider labeled button with uppercase styling.' },
      { name: 'variant', type: "'ghost' | 'secondary' | 'primary'", default: "'ghost'", description: 'Visual style variant. Ghost is transparent, secondary has a border with glow, primary has a solid accent-primary fill.' },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Button size controlling dimensions and icon scale. Icon-only sizes: xs=24px, sm=32px, md=36px, lg=44px.' },
      { name: 'label', type: 'string', default: "''", description: 'Accessible label for the button. Falls back to `text` if not provided. Required for icon-only usage.' },
      { name: 'href', type: 'string', default: "''", description: 'When set, renders the button as an anchor tag for navigation links.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button, reducing opacity to 40% and blocking pointer events.' },
      { name: 'type', type: 'string', default: "'button'", description: 'HTML button type attribute. Only applies when `href` is not set.' },
    ],
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
      <IconButton name="pencil" label="Edit" (click)="onEdit()"></IconButton>
      <IconButton name="copy" label="Duplicate" variant="ghost"></IconButton>
      <IconButton name="trash" label="Delete" variant="secondary" (click)="onDelete()"></IconButton>
      <IconButton name="plus" text="New Item" variant="primary" (click)="onCreate()"></IconButton>
    </div>

    <!-- Navigation links -->
    <div style="display:flex; gap:8px; margin-top:16px;">
      <IconButton name="gear" text="Settings" variant="secondary" href="/settings"></IconButton>
      <IconButton name="bell" text="Notifications" variant="ghost" href="/notifications"></IconButton>
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
    ],
  
  seeAlso: ["button","copy-button","tooltip"],
};
