import type { ComponentDef } from './_types';

export const marquee: ComponentDef = {
    name: 'Marquee',
    slug: 'marquee',
    tag: 'arc-marquee',
    tier: 'content',
    interactivity: 'static',
    replayable: true,
    description: 'Continuously scrolling content strip with configurable speed, direction, gap, and pause-on-hover behavior for logos, testimonials, and announcements.',

    overview: `Marquee creates a seamlessly looping horizontal scroll animation for its slotted content. The component duplicates its children into a shadow-DOM clone group, then uses a CSS keyframe animation to translate the combined track so that as the primary group scrolls out of view, the duplicate takes its place -- creating an infinite loop with no visible seam. This technique avoids JavaScript-driven animation, relying entirely on GPU-accelerated CSS transforms for smooth 60fps performance.

The scroll speed is controlled by the \`speed\` prop, which represents pixels per second. The component automatically calculates the animation duration based on the measured width of the content group, so the perceived speed remains consistent regardless of how much content is slotted. A ResizeObserver recalculates the duration when content changes size, ensuring the animation stays smooth after dynamic content updates.

By default, the marquee pauses when the user hovers over it (\`pause-on-hover\` is true), giving users time to read or interact with the content. The component also respects \`prefers-reduced-motion\` by pausing the animation entirely for users who have opted out of motion. The \`direction\` prop accepts \`"left"\` (default) or \`"right"\` to control which way the content scrolls, and the \`gap\` prop sets the spacing between items using any valid CSS length.`,

    features: [
      'Seamless infinite loop using duplicated shadow-DOM content and CSS keyframe translation',
      'Speed prop in pixels-per-second with automatic duration calculation based on content width',
      'ResizeObserver-driven recalculation ensures consistent speed after dynamic content changes',
      'Pause-on-hover enabled by default -- animation pauses when the cursor enters the track',
      'Respects `prefers-reduced-motion` media query by pausing animation for motion-sensitive users',
      'Configurable scroll direction: `left` (default) or `right`',
      'Adjustable gap between items using any valid CSS length via the `gap` prop',
      'GPU-accelerated animation using `will-change: transform` for smooth 60fps performance',
    ],

    guidelines: {
      do: [
        'Use Marquee for decorative content like logo strips, partner logos, or scrolling testimonials',
        'Keep `pause-on-hover` enabled (default) so users can read individual items at their own pace',
        'Provide enough slotted items to fill the viewport width -- otherwise the duplicate gap may be visible',
        'Set `speed` between 20-60 pixels per second for a comfortable, readable scroll rate',
        'Test with `prefers-reduced-motion` enabled to confirm the static fallback looks correct',
      ],
      dont: [
        'Do not use Marquee for critical information that users must read -- it is easy to miss scrolling content',
        'Do not place interactive elements (buttons, links) inside the marquee without `pause-on-hover` -- they become hard to click',
        'Do not set `speed` above 100 -- fast scrolling is disorienting and inaccessible',
        'Do not use Marquee as a substitute for a proper notification system or alert banner',
        'Avoid stacking multiple Marquees moving in different directions -- the competing motion is visually overwhelming',
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

    props: [
      { name: 'speed', type: 'number', default: '40', description: 'Scroll speed in pixels per second. The animation duration is calculated from the content width divided by this value.' },
      { name: 'direction', type: "'left' | 'right'", default: "'left'", description: 'Scroll direction. `left` scrolls content from right to left (default), `right` reverses the direction.' },
      { name: 'pause-on-hover', type: 'boolean', default: 'true', description: 'When true, the animation pauses while the cursor hovers over the marquee.' },
      { name: 'gap', type: 'string', default: 'var(--space-xl)', description: 'CSS length value for the gap between slotted items. Accepts any valid CSS length or custom property.' },
    ],
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

<Marquee speed={40} direction="left" pauseOnHover>
  <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
  <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
  <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
  <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
</Marquee>`,
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
    <Marquee [speed]="40" direction="left" pause-on-hover>
      <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
      <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
      <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
      <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
    </Marquee>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Marquee } from '@arclux/arc-ui-solid';

<Marquee speed={40} direction="left" pauseOnHover>
  <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
  <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
  <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
  <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
</Marquee>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Marquee } from '@arclux/arc-ui-preact';

<Marquee speed={40} direction="left" pauseOnHover>
  <img src="/logos/partner-1.svg" alt="Partner 1" height="32" />
  <img src="/logos/partner-2.svg" alt="Partner 2" height="32" />
  <img src="/logos/partner-3.svg" alt="Partner 3" height="32" />
  <img src="/logos/partner-4.svg" alt="Partner 4" height="32" />
</Marquee>`,
      },
    ],
  };
