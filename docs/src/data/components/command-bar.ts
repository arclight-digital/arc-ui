import type { ComponentDef } from './_types';

export const commandBar: ComponentDef = {
  name: 'Command Bar',
  slug: 'command-bar',
  tag: 'arc-command-bar',
  tier: 'navigation',
  interactivity: 'interactive',
  description: 'Always-visible search input designed to sit inside a top bar. Accent-primary bottom border on focus with glow ring.',

  overview: `CommandBar is a persistent search-and-command input designed to live permanently inside a TopBar or toolbar region. Unlike CommandPalette, which is a modal overlay triggered by a keyboard shortcut, CommandBar is always visible and ready for input. This makes it ideal for applications where search is a primary workflow — admin dashboards, documentation sites, and developer tools that benefit from an always-accessible entry point.

When focused, the input reveals an accent-primary bottom border with a subtle glow ring, drawing the user's eye without disrupting the surrounding layout. The component dispatches \`arc-input\` on every keystroke for live filtering and \`arc-submit\` when the user presses Enter, making it easy to wire up search-as-you-type or explicit command submission patterns.

CommandBar is intentionally minimal — it handles the input chrome and events while leaving result rendering to your application. Pair it with a dropdown or popover to display search results, or route the submitted value to a dedicated search results page. For modal command experiences, use CommandPalette instead.`,

  features: [
    'Always-visible search input for persistent toolbar placement',
    'Accent-primary bottom border with glow ring on focus',
    'arc-input event on every keystroke for live filtering',
    'arc-submit event on Enter for explicit command submission',
    'Customisable placeholder text',
    'Controlled value prop for external state management',
    'Keyboard accessible with standard input behaviour',
    'Token-driven theming via CSS custom properties',
  ],

  guidelines: {
    do: [
      'Place inside a TopBar or toolbar for consistent positioning',
      'Use a descriptive placeholder like "Search docs..." to hint at scope',
      'Listen to arc-input for search-as-you-type and arc-submit for explicit queries',
      'Pair with a dropdown or popover to display search results inline',
      'Constrain the width with max-width so the bar does not dominate the toolbar',
    ],
    dont: [
      'Use CommandBar when search is secondary — prefer CommandPalette for on-demand access',
      'Place multiple CommandBars on the same page',
      'Omit the placeholder — an empty input gives no affordance',
      'Use CommandBar as a general-purpose text input — it is styled for search context only',
      'Forget to handle the arc-submit event — users expect Enter to do something',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:480px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
  <arc-command-bar placeholder="Search or type a command..." style="width:100%;max-width:400px"></arc-command-bar>
</div>`,

  props: [
    { name: 'placeholder', type: 'string', default: "'Search...'", description: 'Placeholder text displayed when the input is empty. Use it to communicate the scope of the search.' },
    { name: 'value', type: 'string', default: "''", description: 'The current value of the input. Set externally to control the input state programmatically.' },
    { name: 'icon', type: 'string', default: "'magnifying-glass'", description: 'Icon name displayed before the input. Accepts any Phosphor icon name.' },
  ],
  events: [
    { name: 'arc-input', description: 'Fired on every keystroke with detail: { value }.' },
    { name: 'arc-submit', description: 'Fired when the user presses Enter with detail: { value }.' },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-command-bar placeholder="Search..." id="search"></arc-command-bar>

<script>
  const bar = document.querySelector('#search');
  bar.addEventListener('arc-input', (e) => {
    console.log('typing:', e.detail.value);
  });
  bar.addEventListener('arc-submit', (e) => {
    console.log('submitted:', e.detail.value);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { CommandBar } from '@arclux/arc-ui-react';

export function AppSearch() {
  return (
    <CommandBar
      placeholder="Search..."
      onArcInput={(e) => console.log('typing:', e.detail.value)}
      onArcSubmit={(e) => console.log('submitted:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { CommandBar } from '@arclux/arc-ui-vue';

function onInput(e) {
  console.log('typing:', e.detail.value);
}
function onSubmit(e) {
  console.log('submitted:', e.detail.value);
}
</script>

<template>
  <CommandBar
    placeholder="Search..."
    @arc-input="onInput"
    @arc-submit="onSubmit"
  />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { CommandBar } from '@arclux/arc-ui-svelte';

  function handleInput(e) {
    console.log('typing:', e.detail.value);
  }
  function handleSubmit(e) {
    console.log('submitted:', e.detail.value);
  }
</script>

<CommandBar
  placeholder="Search..."
  on:arc-input={handleInput}
  on:arc-submit={handleSubmit}
/>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { CommandBar } from '@arclux/arc-ui-angular';

@Component({
  imports: [CommandBar],
  template: \`
    <CommandBar
      placeholder="Search..."
      (arc-input)="onInput($event)"
      (arc-submit)="onSubmit($event)"
    />
  \`,
})
export class AppSearchComponent {
  onInput(e: CustomEvent) {
    console.log('typing:', e.detail.value);
  }
  onSubmit(e: CustomEvent) {
    console.log('submitted:', e.detail.value);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { CommandBar } from '@arclux/arc-ui-solid';

export function AppSearch() {
  return (
    <CommandBar
      placeholder="Search..."
      onArcInput={(e) => console.log('typing:', e.detail.value)}
      onArcSubmit={(e) => console.log('submitted:', e.detail.value)}
    />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { CommandBar } from '@arclux/arc-ui-preact';

export function AppSearch() {
  return (
    <CommandBar
      placeholder="Search..."
      onArcInput={(e) => console.log('typing:', e.detail.value)}
      onArcSubmit={(e) => console.log('submitted:', e.detail.value)}
    />
  );
}`,
    },
  ],

  seeAlso: ['command-palette', 'search', 'top-bar'],
};
