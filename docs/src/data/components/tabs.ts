import type { ComponentDef } from './_types';

export const tabs: ComponentDef = {
  name: 'Tabs',
  slug: 'tabs',
  tag: 'arc-tabs',
  tier: 'navigation',
  interactivity: 'hybrid',
  description: 'A row of tab buttons that shows one of several panels at a time.',

  overview: `Tabs puts related panels in one space and shows one at a time. Each \`<arc-tab>\` child sets the \`label\` for its button and holds its panel's content. Use it when the reader switches between panels and doesn't need to see two at once.

The component follows the WAI-ARIA Tabs pattern. Each button has \`role="tab"\` inside a \`role="tablist"\`, and the panel has \`role="tabpanel"\`, linked by \`aria-controls\` and \`aria-labelledby\`. Focus uses a roving tabindex, so the arrow keys move between tabs and Tab leaves the tab list.

Switching tabs moves one indicator between them: the underline in the default variant, the ground behind the selection in \`pills\` and in vertical bars. The incoming panel rises into place. Both animations are CSS and stop under \`prefers-reduced-motion\`. When there are more tabs than the bar can show, it scrolls the selected tab into view without scrolling the page. Inactive panels are hidden with \`display: none\`, so they're also out of the accessibility tree.`,

  features: [
    'With `orientation="vertical"`, the up and down arrows replace left and right',
    'A disabled tab stays visible, but the arrow keys skip it and clicking does nothing',
    '`selected` sets the active tab by zero-based index',
  ],

  guidelines: {
    do: [
      'Keep tab labels to one or two words so the whole bar fits without scrolling',
      "Disable a tab that's temporarily unavailable instead of hiding it",
    ],
    dont: [
      "Don't use Tabs for sequential steps. Use StepperNav",
      "Don't nest Tabs inside Tabs. Two tab bars are hard to follow with a keyboard or screen reader",
      "Don't put a Save button or other key action in a tab that isn't open by default",
      "Don't put more than five or six tabs in one group. Use a dropdown or sidebar navigation for more",
    ],
  },

  previewHtml: `<div style="width:100%">
  <arc-tabs>
    <arc-tab label="Overview">ARC UI is a set of Lit web components, with wrapper packages for React, Vue, Svelte, Angular, Solid and Preact.</arc-tab>
    <arc-tab label="Features">The arrow keys move between tabs. Home and End jump to the first and last tab.</arc-tab>
    <arc-tab label="Changelog">Each release's changes are listed on the GitHub releases page.</arc-tab>
  </arc-tabs>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-tabs>
  <arc-tab label="Overview">
    ARC UI is a framework-agnostic component library built on web standards.
  </arc-tab>
  <arc-tab label="Features">
    Keyboard navigation, ARIA roles, smooth transitions, and lazy rendering.
  </arc-tab>
  <arc-tab label="Changelog">
    v2.4.0 — Disabled tab support and improved focus-visible ring styling.
  </arc-tab>
</arc-tabs>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Tabs, Tab } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <Tabs>
      <Tab label="Overview">
        ARC UI is a framework-agnostic component library built on web standards.
      </Tab>
      <Tab label="Features">
        Keyboard navigation, ARIA roles, smooth transitions, and lazy rendering.
      </Tab>
      <Tab label="Changelog">
        v2.4.0 — Disabled tab support and improved focus-visible ring styling.
      </Tab>
    </Tabs>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Tabs, Tab } from '@arclux/arc-ui-vue';
</script>

<template>
  <Tabs>
    <Tab label="Overview">
      ARC UI is a framework-agnostic component library built on web standards.
    </Tab>
    <Tab label="Features">
      Keyboard navigation, ARIA roles, smooth transitions, and lazy rendering.
    </Tab>
    <Tab label="Changelog">
      v2.4.0 — Disabled tab support and improved focus-visible ring styling.
    </Tab>
  </Tabs>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Tabs, Tab } from '@arclux/arc-ui-svelte';
</script>

<Tabs>
  <Tab label="Overview">
    ARC UI is a framework-agnostic component library built on web standards.
  </Tab>
  <Tab label="Features">
    Keyboard navigation, ARIA roles, smooth transitions, and lazy rendering.
  </Tab>
  <Tab label="Changelog">
    v2.4.0 — Disabled tab support and improved focus-visible ring styling.
  </Tab>
</Tabs>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Tabs, Tab } from '@arclux/arc-ui-angular';

@Component({
  imports: [Tabs, Tab],
  template: \`
    <arc-tabs>
      <arc-tab label="Overview">
        ARC UI is a framework-agnostic component library built on web standards.
      </arc-tab>
      <arc-tab label="Features">
        Keyboard navigation, ARIA roles, smooth transitions, and lazy rendering.
      </arc-tab>
      <arc-tab label="Changelog">
        v2.4.0 — Disabled tab support and improved focus-visible ring styling.
      </arc-tab>
    </arc-tabs>
  \`,
})
export class TabsDemoComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Tabs, Tab } from '@arclux/arc-ui-solid';

export default function TabsDemo() {
  return (
    <Tabs>
      <Tab label="Overview">
        ARC UI is a framework-agnostic component library built on web standards.
      </Tab>
      <Tab label="Features">
        Keyboard navigation, ARIA roles, smooth transitions, and lazy rendering.
      </Tab>
      <Tab label="Changelog">
        v2.4.0 — Disabled tab support and improved focus-visible ring styling.
      </Tab>
    </Tabs>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Tabs, Tab } from '@arclux/arc-ui-preact';

export default function TabsDemo() {
  return (
    <Tabs>
      <Tab label="Overview">
        ARC UI is a framework-agnostic component library built on web standards.
      </Tab>
      <Tab label="Features">
        Keyboard navigation, ARIA roles, smooth transitions, and lazy rendering.
      </Tab>
      <Tab label="Changelog">
        v2.4.0 — Disabled tab support and improved focus-visible ring styling.
      </Tab>
    </Tabs>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<arc-tabs>
  <arc-tab label="Overview">
    ARC UI is a framework-agnostic component library built on web standards.
  </arc-tab>
  <arc-tab label="Features">
    Keyboard navigation, ARIA roles, smooth transitions, and lazy rendering.
  </arc-tab>
  <arc-tab label="Changelog">
    v2.4.0 — Disabled tab support and improved focus-visible ring styling.
  </arc-tab>
</arc-tabs>`,
    },
  ],

  subComponents: [
    {
      name: 'Tab',
      tag: 'arc-tab',
      description:
        'One tab in a Tabs group. Its `label` is the button text, its content is the panel, and `disabled` turns the button off.',
    },
  ],

  seeAlso: ['accordion', 'segmented-control'],
};
