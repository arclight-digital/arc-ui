import type { ComponentDef } from './_types';

export const avatarGroup: ComponentDef = {
    name: 'Avatar Group',
    slug: 'avatar-group',
    tag: 'arc-avatar-group',
    tier: 'content',
    interactivity: 'static',
    description: 'Stack of avatars with overflow count badge.',

    overview: `AvatarGroup arranges a collection of arc-avatar components in a horizontally overlapping stack, with a "+N" overflow counter that appears when the number of avatars exceeds the \`max\` threshold. The overlap is controlled by three presets — sm (-8px), md (-12px), and lg (-16px) — applied as negative margin-left on every child except the first, creating the characteristic fanned-card effect.

When avatars are slotted in, the component listens for slotchange events and dynamically manages visibility. Avatars beyond the \`max\` count are hidden via \`display: none\`, and a circular overflow badge (styled to match the avatar aesthetic) shows the remaining count. Each visible avatar receives a descending z-index so earlier avatars stack on top, creating the correct visual overlap order.

AvatarGroup is marked as a hybrid component: the overlapping layout works in pure CSS, but the overflow counter logic — hiding excess avatars and computing the "+N" label — requires JavaScript. The group wrapper uses \`role="group"\` with \`aria-label="Avatar group"\` for assistive technology, and the overflow badge uses the same Tektur font and elevated background as the avatar initials fallback for visual cohesion.`,

    features: [
      'Automatic "+N" overflow counter when slotted avatars exceed the max threshold',
      'Three overlap presets: sm (-8px), md (-12px), lg (-16px) for adjustable density',
      'Dynamic slot management with slotchange listener for visibility toggling',
      'Descending z-index assignment for correct visual stacking order',
      'Overflow badge styled to match avatar aesthetics (Tektur font, elevated background, circular shape)',
      'Accessible role="group" with aria-label on the container',
      'Exposed CSS parts: group and overflow for external style customization',
    ],

    guidelines: {
      do: [
        'Set a reasonable max (3-5) to keep the group compact and scannable',
        'Use consistent avatar sizes within a group for uniform overlap alignment',
        'Pair with arc-avatar components exclusively — the overlap styling targets slotted children',
        'Use the md overlap preset for most contexts; sm for tight spaces, lg for larger avatars',
        'Place in team member sections, comment threads, or collaboration indicators',
      ],
      dont: [
        'Mix different avatar sizes in the same group — overlap alignment will be inconsistent',
        'Set max to a very high number and rely solely on the counter; limit visible avatars for clarity',
        'Slot non-avatar elements — the overlap margin and z-index logic assumes arc-avatar children',
        'Remove the overflow badge styling; it provides critical information about hidden members',
        'Use AvatarGroup for a single avatar — it adds unnecessary wrapper markup',
      ],
    },

    previewHtml: `<arc-avatar-group max="3" overlap="md">
  <arc-avatar name="Alice" size="md"></arc-avatar>
  <arc-avatar name="Bob" size="md"></arc-avatar>
  <arc-avatar name="Charlie" size="md"></arc-avatar>
  <arc-avatar name="Diana" size="md"></arc-avatar>
  <arc-avatar name="Eve" size="md"></arc-avatar>
</arc-avatar-group>`,

    props: [

    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-avatar-group max="3">
  <arc-avatar name="Alice"></arc-avatar>
  <arc-avatar name="Bob"></arc-avatar>
  <arc-avatar name="Charlie"></arc-avatar>
  <arc-avatar name="Diana"></arc-avatar>
</arc-avatar-group>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Avatar, AvatarGroup } from '@arclux/arc-ui-react';

<AvatarGroup max="3">
  <Avatar name="Alice"></Avatar>
  <Avatar name="Bob"></Avatar>
  <Avatar name="Charlie"></Avatar>
  <Avatar name="Diana"></Avatar>
</AvatarGroup>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Avatar, AvatarGroup } from '@arclux/arc-ui-vue';
</script>

<template>
  <AvatarGroup max="3">
    <Avatar name="Alice"></Avatar>
    <Avatar name="Bob"></Avatar>
    <Avatar name="Charlie"></Avatar>
    <Avatar name="Diana"></Avatar>
  </AvatarGroup>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Avatar, AvatarGroup } from '@arclux/arc-ui-svelte';
</script>

<AvatarGroup max="3">
  <Avatar name="Alice"></Avatar>
  <Avatar name="Bob"></Avatar>
  <Avatar name="Charlie"></Avatar>
  <Avatar name="Diana"></Avatar>
</AvatarGroup>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Avatar, AvatarGroup } from '@arclux/arc-ui-angular';

@Component({
  imports: [Avatar, AvatarGroup],
  template: \`
    <AvatarGroup max="3">
      <Avatar name="Alice"></Avatar>
      <Avatar name="Bob"></Avatar>
      <Avatar name="Charlie"></Avatar>
      <Avatar name="Diana"></Avatar>
    </AvatarGroup>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Avatar, AvatarGroup } from '@arclux/arc-ui-solid';

<AvatarGroup max="3">
  <Avatar name="Alice"></Avatar>
  <Avatar name="Bob"></Avatar>
  <Avatar name="Charlie"></Avatar>
  <Avatar name="Diana"></Avatar>
</AvatarGroup>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Avatar, AvatarGroup } from '@arclux/arc-ui-preact';

<AvatarGroup max="3">
  <Avatar name="Alice"></Avatar>
  <Avatar name="Bob"></Avatar>
  <Avatar name="Charlie"></Avatar>
  <Avatar name="Diana"></Avatar>
</AvatarGroup>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-avatar-group — requires avatar-group.css + base.css (or arc-ui.css) -->
<span class="arc-avatar-group">
  <div class="group" role="group" aria-label="Avatar group">
   Avatar Group
   <span class="group__overflow" style="display:none"></span>
   </div>
</span>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-avatar-group — self-contained, no external CSS needed -->
<span class="arc-avatar-group" style="display: inline-flex">
  <div style="display: flex; align-items: center" role="group" aria-label="Avatar group">
   Avatar Group
   <span style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 9999px; background: rgb(17, 17, 22); border: 1px solid rgb(34, 34, 41); font-family: 'Tektur', system-ui, sans-serif; font-weight: 600; font-size: 12px; color: rgb(124, 124, 137); user-select: none" style="display:none"></span>
   </div>
</span>` }
    ],
  
  seeAlso: ["avatar","badge"],
};
