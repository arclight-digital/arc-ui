import type { ComponentDef } from './_types';

export const avatar: ComponentDef = {
    name: 'Avatar',
    slug: 'avatar',
    tag: 'arc-avatar',
    tier: 'content',
    interactivity: 'static',
    description: 'User avatar with image or initials fallback.',

    overview: `Avatar displays a user's profile image inside a circular, bordered container with a hover glow effect. When an image \`src\` is provided, it renders a fully covered \`<img>\` element with object-fit: cover and full border-radius. When no image is available, the component automatically falls back to rendering the first character of the \`name\` property as an uppercase initial inside the circle, using the Tektur accent font at weight 600.

Three size presets — sm (32px), md (40px), and lg (56px) — control both the container dimensions and the initials font-size (12px, 14px, and 20px respectively). The container uses a subtle \`--border-default\` ring that transitions to \`--border-bright\` on hover, paired with a blue-tinted box-shadow glow for an interactive feel even though the component is primarily presentational.

The component sets \`role="img"\` and \`aria-label\` on the container, using the \`name\` property as the accessible label. This ensures screen readers announce the avatar as an image with the person's name. The exposed CSS parts — "avatar", "img", and "initials" — let you override the border, background, or typography for specific contexts like admin badges or status indicators.`,

    features: [
      'Image display with object-fit: cover for consistent circular cropping',
      'Automatic initial-letter fallback when no src is provided',
      'Three size presets: sm (32px), md (40px), lg (56px)',
      'Hover glow effect with border-color transition and blue box-shadow',
      'Accessible role="img" with aria-label derived from the name property',
      'Exposed CSS parts: avatar, img, initials for per-instance customization',
      'Uppercase Tektur-font initials at weight 600 for visual consistency',
    ],

    guidelines: {
      do: [
        'Always provide the name prop for accessibility, even when using an image src',
        'Use the sm size for compact UI like comment threads and table rows',
        'Use the lg size for profile headers and user detail panels',
        'Pair with arc-avatar-group to display collections of user avatars',
        'Provide a fallback-friendly name so the initial letter is meaningful (e.g., full name, not email)',
      ],
      dont: [
        'Omit the name prop — the initial fallback and aria-label both depend on it',
        'Use Avatar for non-person images like logos or product icons; it is semantically a user avatar',
        'Set src to a very large image without server-side resizing; the component does not resize images',
        'Override border-radius on the avatar — the circular shape is core to the component identity',
        'Rely on the hover glow as a click affordance; Avatar is presentational, not interactive',
      ],
    },

    previewHtml: `<div style="display: flex; align-items: center; gap: 16px;">
  <arc-avatar name="Alice Smith" size="sm"></arc-avatar>
  <arc-avatar name="Bob Jones" size="md"></arc-avatar>
  <arc-avatar name="Charlie Davis" size="lg"></arc-avatar>
  <arc-avatar src="https://i.pravatar.cc/150?img=3" name="Diana Lee" size="lg"></arc-avatar>
</div>`,

    props: [
      { name: 'src', type: 'string', default: "''", description: 'Image URL for the avatar. When provided, renders an `<img>` element. When empty, displays initials derived from the `name` prop.' },
      { name: 'name', type: 'string', default: "''", description: 'User name used to generate initials (first letter, uppercased) and as the `alt` text / `aria-label` for the avatar.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls avatar dimensions: `sm` (32px), `md` (40px), `lg` (56px).' },
      { name: 'status', type: "'online' | 'offline' | 'busy' | 'away'", default: "''", description: "Shows a status indicator dot. Options: 'online', 'offline', 'busy', 'away'." },
      { name: 'shape', type: "'circle' | 'square' | 'rounded'", default: "'circle'", description: "Controls the avatar shape. Options: 'circle', 'square', 'rounded'." },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-avatar name="Alice Smith"></arc-avatar>
<arc-avatar name="Bob Jones" size="lg"></arc-avatar>
<arc-avatar src="https://i.pravatar.cc/150?img=1" name="User" size="sm"></arc-avatar>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Avatar } from '@arclux/arc-ui-react';

<Avatar name="Alice Smith"></Avatar>
<Avatar name="Bob Jones" size="lg"></Avatar>
<Avatar src="https://i.pravatar.cc/150?img=1" name="User" size="sm"></Avatar>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Avatar } from '@arclux/arc-ui-vue';
</script>

<template>
  <Avatar name="Alice Smith"></Avatar>
  <Avatar name="Bob Jones" size="lg"></Avatar>
  <Avatar src="https://i.pravatar.cc/150?img=1" name="User" size="sm"></Avatar>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Avatar } from '@arclux/arc-ui-svelte';
</script>

<Avatar name="Alice Smith"></Avatar>
<Avatar name="Bob Jones" size="lg"></Avatar>
<Avatar src="https://i.pravatar.cc/150?img=1" name="User" size="sm"></Avatar>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Avatar } from '@arclux/arc-ui-angular';

@Component({
  imports: [Avatar],
  template: \`
    <Avatar name="Alice Smith"></Avatar>
    <Avatar name="Bob Jones" size="lg"></Avatar>
    <Avatar src="https://i.pravatar.cc/150?img=1" name="User" size="sm"></Avatar>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Avatar } from '@arclux/arc-ui-solid';

<Avatar name="Alice Smith"></Avatar>
<Avatar name="Bob Jones" size="lg"></Avatar>
<Avatar src="https://i.pravatar.cc/150?img=1" name="User" size="sm"></Avatar>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Avatar } from '@arclux/arc-ui-preact';

<Avatar name="Alice Smith"></Avatar>
<Avatar name="Bob Jones" size="lg"></Avatar>
<Avatar src="https://i.pravatar.cc/150?img=1" name="User" size="sm"></Avatar>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-avatar — requires avatar.css + tokens.css (or arc-ui.css) -->
<span class="arc-avatar">
  <div class="avatar" role="img" aria-label="Name">

   </div>
</span>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-avatar — self-contained, no external CSS needed -->
<style>
  .arc-avatar .avatar:hover { border-color: rgb(51, 51, 64);
        box-shadow: 0 0 12px rgba(77, 126, 247, 0.15); }
</style>
<span class="arc-avatar" style="display: inline-flex">
  <div class="avatar" style="display: inline-flex; align-items: center; justify-content: center; border-radius: 9999px; border: 1px solid rgb(34, 34, 41); overflow: hidden; background: rgb(17, 17, 22)" role="img" aria-label="Name">

   </div>
</span>` }
    ],
  
  seeAlso: ["avatar-group","badge"],
};
