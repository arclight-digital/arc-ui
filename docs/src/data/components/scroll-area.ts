import type { ComponentDef } from './_types';

export const scrollArea: ComponentDef = {
    name: 'Scroll Area',
    slug: 'scroll-area',
    tag: 'arc-scroll-area',
    tier: 'content',
    interactivity: 'static',
    description: 'Styled scrollable container with custom thin scrollbar styling for Webkit and Firefox, configurable orientation, and optional max-height constraint.',

    overview: `Scroll Area provides a drop-in scrollable container with custom scrollbar styling that integrates seamlessly with ARC UI's design tokens. Instead of the browser's default thick scrollbars, Scroll Area renders slim 6px tracks with rounded thumbs that use the theme's border and surface colors. The thumb darkens subtly on hover, providing visual feedback without drawing excessive attention to chrome.

The component supports three orientation modes. The default \`"vertical"\` orientation enables vertical scrolling while hiding horizontal overflow -- the most common pattern for content panels, sidebars, and dropdown menus. Setting \`orientation="horizontal"\` reverses this for horizontally scrollable galleries or code blocks. The \`"both"\` option enables scrolling in both directions for large tables or canvas-like content.

The \`max-height\` attribute constrains the container's height, making it ideal for bounding lists, menus, or panels within a fixed space. The inner content renders via the default slot, and the container inherits the parent's border-radius for consistent clipping. Scroll Area is keyboard-accessible with \`tabindex="0"\` and \`role="region"\`, allowing keyboard users to scroll with arrow keys when the container is focused.`,

    features: [
      'Custom thin scrollbar styling (6px) for both Webkit and Firefox browsers using design tokens',
      'Three orientation modes: `vertical` (default), `horizontal`, and `both` for flexible scroll direction control',
      'Optional `max-height` attribute to constrain the scrollable region within a fixed space',
      'Smooth scroll behavior via `scroll-behavior: smooth` CSS property',
      'Scrollbar thumb hover effect that transitions from border-bright to text-ghost color',
      'Keyboard-accessible with `tabindex="0"` and `role="region"` for arrow-key scrolling',
      'Inherits parent border-radius for seamless visual clipping',
      'Firefox scrollbar support via `scrollbar-width: thin` and `scrollbar-color`',
    ],

    guidelines: {
      do: [
        'Set `max-height` when Scroll Area is used inside fixed-height layouts like sidebars, modals, or dropdowns',
        'Use `orientation="horizontal"` for image galleries, code blocks, or horizontally scrollable tables',
        'Place Scroll Area around content that may exceed the available space rather than letting the entire page scroll',
        'Ensure the scroll area has a visible boundary (border or background) so users know the region is scrollable',
        'Use `orientation="both"` sparingly -- only for truly two-dimensional content like data grids',
      ],
      dont: [
        'Do not nest multiple Scroll Areas -- nested scrolling regions create confusing interaction',
        'Do not set `max-height` to very small values that hide most content without clear indication',
        'Do not use Scroll Area for the main page scroll -- it is designed for embedded scrollable regions',
        'Do not override the custom scrollbar styles with conflicting global CSS -- the component encapsulates them in shadow DOM',
        'Avoid using Scroll Area when content fits within the viewport -- unnecessary scroll containers add cognitive overhead',
      ],
    },

    previewHtml: `<arc-scroll-area max-height="150px" style="border:1px solid var(--border-default); border-radius:var(--radius-md); padding:var(--space-sm);">
  <p>Line 1: Scroll Area provides styled scrollable containers.</p>
  <p>Line 2: Custom thin scrollbars match the design system.</p>
  <p>Line 3: Supports vertical, horizontal, and both orientations.</p>
  <p>Line 4: Set max-height to constrain the visible area.</p>
  <p>Line 5: Keyboard accessible with tabindex and role region.</p>
  <p>Line 6: Smooth scroll behavior is enabled by default.</p>
  <p>Line 7: Works great in sidebars, modals, and dropdowns.</p>
  <p>Line 8: Try scrolling down to see more content below.</p>
</arc-scroll-area>`,

    props: [
      { name: 'max-height', type: 'string', default: "''", description: 'CSS max-height value applied to the scrollable container. Use any valid CSS length (e.g. `300px`, `50vh`).' },
      { name: 'orientation', type: "'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'Scroll direction. `vertical` shows a vertical scrollbar, `horizontal` shows a horizontal scrollbar, `both` shows both.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-scroll-area max-height="300px">
  <p>Your scrollable content here...</p>
  <!-- More content that exceeds 300px height -->
</arc-scroll-area>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { ScrollArea } from '@arclux/arc-ui-react';

<ScrollArea maxHeight="300px">
  <p>Your scrollable content here...</p>
  {/* More content that exceeds 300px height */}
</ScrollArea>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ScrollArea } from '@arclux/arc-ui-vue';
</script>

<template>
  <ScrollArea max-height="300px">
    <p>Your scrollable content here...</p>
    <!-- More content that exceeds 300px height -->
  </ScrollArea>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { ScrollArea } from '@arclux/arc-ui-svelte';
</script>

<ScrollArea max-height="300px">
  <p>Your scrollable content here...</p>
  <!-- More content that exceeds 300px height -->
</ScrollArea>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { ScrollArea } from '@arclux/arc-ui-angular';

@Component({
  imports: [ScrollArea],
  template: \`
    <ScrollArea max-height="300px">
      <p>Your scrollable content here...</p>
      <!-- More content that exceeds 300px height -->
    </ScrollArea>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { ScrollArea } from '@arclux/arc-ui-solid';

<ScrollArea maxHeight="300px">
  <p>Your scrollable content here...</p>
  {/* More content that exceeds 300px height */}
</ScrollArea>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { ScrollArea } from '@arclux/arc-ui-preact';

<ScrollArea maxHeight="300px">
  <p>Your scrollable content here...</p>
  {/* More content that exceeds 300px height */}
</ScrollArea>`,
      },
    ],
  
  seeAlso: ["infinite-scroll","scroll-to-top"],
};
