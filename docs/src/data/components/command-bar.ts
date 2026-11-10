import type { ComponentDef } from './_types';

export const commandBar: ComponentDef = {
  name: 'Command Bar',
  slug: 'command-bar',
  tag: 'arc-command-bar',
  tier: 'navigation',
  interactivity: 'interactive',
  description:
    'Search input that stays visible in a top bar or toolbar. The border turns accent-colored with a glow ring on focus.',

  overview: `CommandBar is a search field for a TopBar or toolbar. It renders an icon, a text input and a \`hint\` slot. It fires \`arc-input\` on every keystroke and \`arc-submit\` on Enter, both with \`{ value }\`. It doesn't render results: show them in a dropdown or popover, or send the submitted value to a results page.

Use it where people search all the time, as in an admin dashboard or a docs site. When search is occasional, use CommandPalette, a modal overlay you open on demand.`,

  features: [
    '`label` sets the input\'s `aria-label` and defaults to "Search". The placeholder is never used as the name',
    '`icon` takes any Phosphor icon name and defaults to `magnifying-glass`',
    'Enter is claimed, so inside a `<form>` it fires `arc-submit` without also submitting the form',
    'Set `value` from outside to control the input',
  ],

  guidelines: {
    do: [
      'Write a placeholder that names the scope, such as "Search docs..."',
      'If there\'s more than one on a page, give each a different `label`. Otherwise they\'re all announced as "Search"',
      'Give it a max-width so it doesn\'t take over the toolbar',
    ],
    dont: [
      'Don\'t use it as a general text input. It\'s styled and labeled for search',
    ],
  },

  previewHtml: `<div style="width:100%;max-width:480px;padding:var(--space-lg);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
  <arc-command-bar placeholder="Search or type a command..." style="width:100%;max-width:400px"></arc-command-bar>
</div>`,

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
    <arc-command-bar
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
