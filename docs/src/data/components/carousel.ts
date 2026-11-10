import type { ComponentDef } from './_types';

export const carousel: ComponentDef = {
  name: 'Carousel',
  slug: 'carousel',
  tag: 'arc-carousel',
  tier: 'content',
  interactivity: 'interactive',
  replayable: true,
  description: 'Shows its children one at a time as full-width slides in a scroll-snapping strip.',

  overview: `Carousel shows its children one at a time as full-width slides in a scroll-snapping viewport. Users move between slides with the round arrow buttons at the left and right edges, the dots under the viewport, or the left and right arrow keys. Arrows and dots are on by default, and \`no-arrows\` and \`no-dots\` turn them off.

\`auto-play\` advances the slides every \`interval\` milliseconds (default 5000). It pauses while the pointer is over the carousel or anything inside it has focus, so slides don't change while someone is using them. With reduced motion on, auto-play doesn't start.

With \`loop\` on (the default), going past the last slide wraps to the first and the reverse. With \`no-loop\`, the arrow buttons disable at the ends. The dots are a \`tablist\` of \`tab\` buttons with \`aria-selected\`, so screen reader users can jump to any slide. \`arc-change\` fires with \`{ index }\` whenever the slide changes.`,

  features: [
    "The arrow buttons sit at half the viewport's height",
    'The viewport takes focus (`tabindex="0"`), so the arrow keys work once it\'s focused',
  ],

  guidelines: {
    do: [
      'Use it for image galleries, rotating testimonials or feature highlights',
      'Turn on auto-play only for content that is extra and not time-sensitive',
      'Use at least two slides. With one, the controls do nothing',
      'Use arc-change to keep captions or other indicators outside the carousel in sync',
    ],
    dont: [
      "Don't put content everyone must see in a carousel. Slides after the first are easy to miss",
      "Don't set interval below 3000ms. Slides change too fast to read",
      "Don't put form inputs in slides. Scrolling fights with input focus",
      "Don't turn off both the arrows and the dots. Users need at least one way to move",
    ],
  },

  previewHtml: `<arc-carousel show-arrows show-dots loop style="max-width:400px;">
  <div style="padding:var(--space-xl); background:var(--bg-elevated); text-align:center;">Slide 1</div>
  <div style="padding:var(--space-xl); background:var(--bg-surface); text-align:center;">Slide 2</div>
  <div style="padding:var(--space-xl); background:var(--bg-elevated); text-align:center;">Slide 3</div>
</arc-carousel>`,

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

export default function Example() {
  return (
    <Carousel showArrows showDots loop>
      <img src="/slide-1.jpg" alt="Slide 1" />
      <img src="/slide-2.jpg" alt="Slide 2" />
      <img src="/slide-3.jpg" alt="Slide 3" />
    </Carousel>
  );
}`,
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
    <arc-carousel [showArrows]="true" [showDots]="true" [loop]="true">
      <img src="/slide-1.jpg" alt="Slide 1" />
      <img src="/slide-2.jpg" alt="Slide 2" />
      <img src="/slide-3.jpg" alt="Slide 3" />
    </arc-carousel>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Carousel } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Carousel showArrows showDots loop>
      <img src="/slide-1.jpg" alt="Slide 1" />
      <img src="/slide-2.jpg" alt="Slide 2" />
      <img src="/slide-3.jpg" alt="Slide 3" />
    </Carousel>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Carousel } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Carousel showArrows showDots loop>
      <img src="/slide-1.jpg" alt="Slide 1" />
      <img src="/slide-2.jpg" alt="Slide 2" />
      <img src="/slide-3.jpg" alt="Slide 3" />
    </Carousel>
  );
}`,
    },
  ],

  seeAlso: ['tabs', 'marquee'],
};
