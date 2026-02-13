import type { ComponentDef } from './_types';

export const carousel: ComponentDef = {
    name: 'Carousel',
    slug: 'carousel',
    tag: 'arc-carousel',
    tier: 'content',
    interactivity: 'interactive',
    replayable: true,
    description: 'A scrollable slide container with navigation arrows, dot indicators, auto-play, looping, and keyboard controls.',

    overview: `Carousel presents a sequence of slotted elements as full-width slides within a scroll-snapping viewport. Users navigate between slides using circular arrow buttons on the left and right edges, clickable dot indicators below the viewport, or left/right arrow keys. Each slotted child becomes a slide that snaps into position with smooth scroll behaviour, and the component tracks the current index to keep the arrows and dots synchronised.

Auto-play mode advances slides on a configurable interval (default 5 seconds) and automatically pauses when the user hovers over the carousel or when any element inside receives keyboard focus, preventing content from changing while the user is interacting. The auto-play timer also respects \`prefers-reduced-motion\` -- if the user has requested reduced motion, auto-play is disabled entirely and scroll behaviour falls back to instant jumps.

When \`loop\` is enabled (the default), navigating past the last slide wraps to the first and vice versa, creating an infinite cycle. The arrow buttons are disabled at the edges when looping is off. Dot indicators use a \`tablist\` ARIA role with individual \`tab\` roles and \`aria-selected\` state, allowing screen reader users to jump directly to any slide. The component fires \`arc-change\` with the new slide index whenever the active slide changes.`,

    features: [
      'Scroll-snap viewport with smooth scrolling and full-width slides from slotted children',
      'Circular navigation arrows positioned at 50% height on the left and right edges',
      'Dot indicators with `tablist` ARIA role for direct slide navigation',
      'Auto-play mode with configurable interval, pausing on hover and focus',
      'Loop mode wraps navigation at the edges; non-loop mode disables arrows at boundaries',
      'Keyboard navigation: left/right arrow keys move between slides',
      'Respects `prefers-reduced-motion` by disabling auto-play and using instant scroll',
      'Fires `arc-change` with `{ index }` in the event detail on every slide change',
    ],

    guidelines: {
      do: [
        'Use Carousel for image galleries, testimonial rotators, or feature highlights',
        'Provide meaningful content in each slide -- avoid empty or placeholder slides',
        'Set `auto-play` only when the content is supplementary and not time-sensitive',
        'Include at least 2 slides -- a single slide makes the navigation controls meaningless',
        'Use the `arc-change` event to synchronise external indicators or captions with the current slide',
      ],
      dont: [
        'Do not use Carousel for critical content that users must see -- some users never advance past the first slide',
        'Do not set `interval` below 3000ms -- slides change too fast to read or interact with',
        'Do not place form inputs inside carousel slides -- the scrolling behaviour conflicts with input focus',
        'Do not hide navigation arrows and dots simultaneously -- the user needs at least one way to navigate',
        'Avoid nesting a Carousel inside another Carousel -- the scroll-snapping conflicts are unpredictable',
      ],
    },

    previewHtml: `<arc-carousel show-arrows show-dots loop style="max-width:400px;">
  <div style="padding:var(--space-xl); background:var(--bg-elevated); text-align:center;">Slide 1</div>
  <div style="padding:var(--space-xl); background:var(--bg-surface); text-align:center;">Slide 2</div>
  <div style="padding:var(--space-xl); background:var(--bg-elevated); text-align:center;">Slide 3</div>
</arc-carousel>`,

    props: [
      { name: 'auto-play', type: 'boolean', default: 'false', description: 'Enables automatic slide advancement on a timer. Pauses on hover and focus, respects prefers-reduced-motion.' },
      { name: 'interval', type: 'number', default: '5000', description: 'Auto-play interval in milliseconds between slide transitions.' },
      { name: 'loop', type: 'boolean', default: 'true', description: 'Enables wrapping at the edges so the last slide connects to the first and vice versa.' },
      { name: 'show-dots', type: 'boolean', default: 'true', description: 'Shows dot indicators below the viewport for direct slide navigation.' },
      { name: 'show-arrows', type: 'boolean', default: 'true', description: 'Shows previous/next arrow buttons on the left and right edges of the viewport.' },
    ],
    events: [
      { name: 'arc-change', description: 'Fired when the active slide changes' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-carousel show-arrows show-dots loop>
  <img src="/slide-1.jpg" alt="Slide 1" />
  <img src="/slide-2.jpg" alt="Slide 2" />
  <img src="/slide-3.jpg" alt="Slide 3" />
</arc-carousel>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Carousel } from '@arclux/arc-ui-react';

<Carousel showArrows showDots loop>
  <img src="/slide-1.jpg" alt="Slide 1" />
  <img src="/slide-2.jpg" alt="Slide 2" />
  <img src="/slide-3.jpg" alt="Slide 3" />
</Carousel>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Carousel } from '@arclux/arc-ui-vue';
</script>

<template>
  <Carousel show-arrows show-dots loop>
    <img src="/slide-1.jpg" alt="Slide 1" />
    <img src="/slide-2.jpg" alt="Slide 2" />
    <img src="/slide-3.jpg" alt="Slide 3" />
  </Carousel>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Carousel } from '@arclux/arc-ui-svelte';
</script>

<Carousel showArrows showDots loop>
  <img src="/slide-1.jpg" alt="Slide 1" />
  <img src="/slide-2.jpg" alt="Slide 2" />
  <img src="/slide-3.jpg" alt="Slide 3" />
</Carousel>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Carousel } from '@arclux/arc-ui-angular';

@Component({
  imports: [Carousel],
  template: \`
    <Carousel [showArrows]="true" [showDots]="true" [loop]="true">
      <img src="/slide-1.jpg" alt="Slide 1" />
      <img src="/slide-2.jpg" alt="Slide 2" />
      <img src="/slide-3.jpg" alt="Slide 3" />
    </Carousel>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Carousel } from '@arclux/arc-ui-solid';

<Carousel showArrows showDots loop>
  <img src="/slide-1.jpg" alt="Slide 1" />
  <img src="/slide-2.jpg" alt="Slide 2" />
  <img src="/slide-3.jpg" alt="Slide 3" />
</Carousel>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Carousel } from '@arclux/arc-ui-preact';

<Carousel showArrows showDots loop>
  <img src="/slide-1.jpg" alt="Slide 1" />
  <img src="/slide-2.jpg" alt="Slide 2" />
  <img src="/slide-3.jpg" alt="Slide 3" />
</Carousel>`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<arc-carousel show-arrows show-dots loop>
  <img src="/slide-1.jpg" alt="Slide 1" />
  <img src="/slide-2.jpg" alt="Slide 2" />
  <img src="/slide-3.jpg" alt="Slide 3" />
</arc-carousel>`,
      },
    ],
  };
