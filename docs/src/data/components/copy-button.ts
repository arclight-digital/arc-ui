import type { ComponentDef } from './_types';

export const copyButton: ComponentDef = {
  name: 'Copy Button',
  slug: 'copy-button',
  tag: 'arc-copy-button',
  tier: 'input',
  interactivity: 'interactive',
  description: 'A button that copies a string to the clipboard and shows "Copied!" when the copy works.',

  overview: `CopyButton writes its \`value\` to the clipboard when clicked. It shows a clipboard icon and the word "Copy". After a successful copy it turns success-colored with a check mark and "Copied!" for 2 seconds, then goes back, and fires \`arc-copy\` with the copied value.

It uses \`navigator.clipboard.writeText\`, which needs a secure context (HTTPS or localhost). If the write fails, as it can in a non-secure iframe, the error is swallowed and the button doesn't change, so nothing tells the user it failed.

\`icon-only\` drops the word and draws a round, borderless 30px button for toolbars, whose check shows for 1.4 seconds. Its accessible name is "Copy to clipboard", or your \`label\` (such as "Copy code"), and "Copied" after a copy.`,

  features: [
    'Clicks are ignored while the "Copied!" state is showing',
    '`disabled` lowers the opacity and blocks pointer events',
  ],

  guidelines: {
    do: [
      'Put it next to the text it copies, such as a code snippet, URL or API key',
      'Set `value` to the exact string people expect to paste, not a formatted or truncated version',
      'Set `label` when several copy buttons share a page, so each name says what it copies',
      'Serve the page over HTTPS so the Clipboard API is available',
      'Set `disabled` until the value exists, for example while it loads',
    ],
    dont: [
      'Don\'t put it inside another button or interactive element. HTML doesn\'t allow nested interactive content',
      'Don\'t rely on the "Copied!" state alone. Pair it with a toast from `arc-copy` for people who look away',
    ],
  },

  previewHtml: `<div style="display:flex; align-items:center; gap:12px;">
  <code style="font-family:var(--font-mono); font-size:13px; color:var(--text-secondary); background:var(--bg-elevated); padding:6px 12px; border-radius:var(--radius-sm);">npm install @arclux/arc-ui</code>
  <arc-copy-button value="npm install @arclux/arc-ui"></arc-copy-button>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-copy-button value="npm install @arclux/arc-ui"></arc-copy-button>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { CopyButton } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <CopyButton value="npm install @arclux/arc-ui" />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { CopyButton } from '@arclux/arc-ui-vue';
</script>

<template>
  <CopyButton value="npm install @arclux/arc-ui" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { CopyButton } from '@arclux/arc-ui-svelte';
</script>

<CopyButton value="npm install @arclux/arc-ui" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { CopyButton } from '@arclux/arc-ui-angular';

@Component({
  imports: [CopyButton],
  template: \`
    <arc-copy-button value="npm install @arclux/arc-ui"></arc-copy-button>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { CopyButton } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <CopyButton value="npm install @arclux/arc-ui" />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { CopyButton } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <CopyButton value="npm install @arclux/arc-ui" />
  );
}`,
    },
  ],

  seeAlso: ['code-block', 'icon-button', 'tooltip'],
};
