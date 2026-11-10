import type { ComponentDef } from './_types';

export const marquee: ComponentDef = {
  name: 'Marquee',
  slug: 'marquee',
  tag: 'arc-marquee',
  tier: 'content',
  interactivity: 'static',
  replayable: true,
  description:
    'A strip of content that scrolls sideways in a loop, such as a row of logos.',

  overview: `Marquee scrolls its children horizontally in a loop. It copies them into a second group in its shadow DOM, and a CSS keyframe animation moves both groups, so the copy takes the original's place as it scrolls out with no visible seam.

\`speed\` is in pixels per second. Marquee measures the content's width and sets the animation's duration from it, so the speed is the same however much content you put in. A ResizeObserver measures again when the content changes size.

\`pause-on-hover\` is on by default and stops the animation while the pointer is over it. With \`prefers-reduced-motion\`, the animation stays paused. \`direction\` is \`"left"\` (the default) or \`"right"\`, and \`gap\` takes any CSS length for the space between items.`,

  features: [
    'The track sets `will-change: transform`',
  ],

  guidelines: {
    do: [
      'Use it for decorative content like logo strips or scrolling testimonials',
      'Leave `pause-on-hover` on so people can stop on an item and read it',
      'Put in enough items to fill the width. Otherwise the gap before the copy shows',
      'Keep `speed` near its default of 40 pixels per second when the strip has text people need to read',
      'Turn on reduced motion and check that the paused strip looks right',
    ],
    dont: [
      'Don\'t put anything people must read in a marquee. Scrolling text is easy to miss',
      'Don\'t put buttons or links in it with `pause-on-hover` off. They\'re hard to click while they move',
      'Don\'t use it in place of a notification or an alert banner',
      'Don\'t stack marquees that move in different directions',
    ],
  },

  previewHtml: `<arc-marquee speed="30" pause-on-hover>
  <span style="padding:var(--space-sm) var(--space-md); background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); white-space:nowrap;">Acme Corp</span>
  <span style="padding:var(--space-sm) var(--space-md); background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); white-space:nowrap;">Globex Inc</span>
  <span style="padding:var(--space-sm) var(--space-md); background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); white-space:nowrap;">Initech</span>
  <span style="padding:var(--space-sm) var(--space-md); background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); white-space:nowrap;">Umbrella</span>
  <span style="padding:var(--space-sm) var(--space-md); background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); white-space:nowrap;">Wayne Enterprises</span>
  <span style="padding:var(--space-sm) var(--space-md); background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); white-space:nowrap;">Stark Industries</span>
</arc-marquee>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-marquee speed="40" direction="left" pause-on-hover>
  <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
  <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
  <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
  <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
</arc-marquee>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Marquee } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Marquee speed={40} direction="left" pauseOnHover>
      <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
      <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
      <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
      <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
    </Marquee>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Marquee } from '@arclux/arc-ui-vue';
</script>

<template>
  <Marquee :speed="40" direction="left" pause-on-hover>
    <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
    <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
    <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
    <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
  </Marquee>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Marquee } from '@arclux/arc-ui-svelte';
</script>

<Marquee speed={40} direction="left" pause-on-hover>
  <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
  <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
  <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
  <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
</Marquee>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Marquee } from '@arclux/arc-ui-angular';

@Component({
  imports: [Marquee],
  template: \`
    <arc-marquee [speed]="40" direction="left" pause-on-hover>
      <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
      <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
      <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
      <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
    </arc-marquee>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Marquee } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Marquee speed={40} direction="left" pauseOnHover>
      <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
      <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
      <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
      <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
    </Marquee>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Marquee } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Marquee speed={40} direction="left" pauseOnHover>
      <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
      <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
      <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
      <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
    </Marquee>
  );
}`,
    },

    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-marquee — requires marquee.css + tokens.css (or arc-ui.css) -->
<div class="arc-marquee">

</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-marquee — self-contained, no external CSS needed -->
<div class="arc-marquee">

</div>`,
    },
  ],

  seeAlso: ['carousel', 'text'],
};
