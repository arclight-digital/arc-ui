import type { ComponentDef } from './_types';

const tabItems = `[
    { label: 'Overview', content: 'ARC UI is a framework-agnostic component library built on web standards. It ships as lightweight Lit-based web components with zero-config wrappers for every major framework.' },
    { label: 'Features', content: 'Keyboard navigation with arrow keys, automatic ARIA tab/tabpanel roles, smooth crossfade transitions between panels, and lazy rendering for heavy content.' },
    { label: 'Changelog', content: 'v2.4.0 — Added disabled tab support and improved focus-visible ring styling. v2.3.0 — Introduced smooth crossfade panel transitions.' },
  ]`;

export const tabs: ComponentDef = {
  name: 'Tabs',
  slug: 'tabs',
  tag: 'arc-tabs',
  tier: 'navigation',
  interactivity: 'hybrid',
  description: 'Tabbed content navigation with keyboard support and ARIA roles.',

  overview: `Tabs organize related content into separate panels that share the same page space. Only one panel is visible at a time, letting users switch context without navigating away. This makes Tabs ideal for grouping settings pages, documentation sections, or dashboard views where horizontal real estate is limited.

The component follows the WAI-ARIA Tabs pattern out of the box. Each tab button carries \`role="tab"\` and its corresponding panel carries \`role="tabpanel"\`, linked via \`aria-controls\` and \`aria-labelledby\`. Focus management uses a roving tabindex so arrow keys move between tabs while Tab moves focus out of the tab list entirely, matching the behavior users expect from native OS tab controls.

Transitions between panels are handled with a crossfade animation driven by CSS, keeping the switch feeling instantaneous on fast machines while remaining smooth on lower-end hardware. Panels that are not active are removed from the accessibility tree and hidden with \`display: none\` so screen readers never encounter stale content.`,

  features: [
    'Arrow-key keyboard navigation between tabs (left/right for horizontal, up/down for vertical)',
    'Automatic WAI-ARIA roles: tab, tablist, and tabpanel with proper aria-controls linking',
    'Smooth crossfade transition when switching panels',
    'Disabled tab support — individual tabs can be non-interactive while remaining visible',
    'Programmatic selected index via the `selected` property',
    'Roving tabindex so only the active tab participates in the page Tab order',
    'Works with dynamic item arrays — add or remove tabs at runtime',
    'Supports rich HTML content inside each panel, not just plain text',
  ],

  guidelines: {
    do: [
      'Use Tabs when content sections are closely related and users need to compare or switch between them frequently.',
      'Keep tab labels short — one or two words — so the entire tab bar fits without scrolling.',
      'Set a sensible default `selected` index (usually 0) so the component is never empty on first render.',
      'Provide meaningful panel content for every tab; avoid empty or placeholder panels in production.',
      'Use the disabled state for tabs that are temporarily unavailable rather than hiding them entirely.',
    ],
    dont: [
      'Do not use Tabs for sequential steps — use a Stepper component instead.',
      'Avoid nesting Tabs inside Tabs; the double tab bar creates confusion for keyboard and screen-reader users.',
      'Do not place critical actions (like a Save button) inside a non-default tab where users may never see them.',
      'Avoid more than five or six tabs in a single group — consider a dropdown or sidebar navigation for larger sets.',
      'Do not rely on tab order to imply a workflow; tabs should be independently meaningful.',
    ],
  },

  previewHtml: `<div style="width:100%">
  <arc-tabs id="preview-tabs"></arc-tabs>
  <script>
    document.getElementById('preview-tabs').items = ${tabItems};
  </script>
</div>`,

  props: [
    { name: 'items', type: 'Array<{ label: string; content: string }>', description: 'Array of tab objects. Each entry defines a tab button label and the HTML or plain-text content rendered in its associated panel. The array order determines the visual left-to-right tab order.' },
    { name: 'selected', type: 'number', default: '0', description: 'Zero-based index of the currently active tab. Changing this value programmatically switches the visible panel and updates ARIA attributes. Out-of-range values are clamped to the nearest valid index.' },
  ],
  events: [
    { name: 'arc-change', description: 'Fired when the active tab changes' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-tabs id="demo-tabs"></arc-tabs>
<script>
  document.getElementById('demo-tabs').items = ${tabItems};
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Tabs } from '@arclux/arc-ui-react';

<Tabs items={${tabItems}} />`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Tabs } from '@arclux/arc-ui-vue';

const items = ${tabItems};
</script>

<template>
  <Tabs :items="items" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Tabs } from '@arclux/arc-ui-svelte';

  const items = ${tabItems};
</script>

<Tabs {items} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Tabs } from '@arclux/arc-ui-angular';

@Component({
  imports: [Tabs],
  template: \`<arc-tabs [items]="items"></arc-tabs>\`,
})
export class TabsDemoComponent {
  items = ${tabItems};
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Tabs } from '@arclux/arc-ui-solid';

const items = ${tabItems};

export default function TabsDemo() {
  return <Tabs items={items} />;
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Tabs } from '@arclux/arc-ui-preact';

const items = ${tabItems};

export default function TabsDemo() {
  return <Tabs items={items} />;
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<arc-tabs id="demo-tabs"></arc-tabs>
<script>
  document.getElementById('demo-tabs').items = ${tabItems};
</script>`,
    },
  ],

  subComponents: [
    {
      name: 'Tab',
      tag: 'arc-tab',
      description: 'An individual tab panel within a Tabs group. Each Tab renders a button in the tab bar and owns its associated content panel. Use this sub-component when you need fine-grained control over individual tab behavior, such as disabling a specific tab or attaching per-tab event listeners.',
      props: [
        { name: 'label', type: 'string', description: 'Text displayed on the tab button. Keep labels concise — one or two words — to prevent the tab bar from overflowing.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'When true, the tab button is visually dimmed and cannot be activated via click or keyboard. The tab remains visible in the bar so users understand the option exists.' },
      ],
    },
  ],
};
