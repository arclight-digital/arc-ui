import type { ComponentDef } from './_types';

export const copyButton: ComponentDef = {
    name: 'Copy Button',
    slug: 'copy-button',
    tag: 'arc-copy-button',
    tier: 'input',
    interactivity: 'interactive',
    description: 'One-click copy-to-clipboard button with confirmation.',

    overview: `CopyButton provides a single-click interaction for copying a text value to the system clipboard. It renders as a compact button with a clipboard icon and a "Copy" label. When clicked, it calls the Clipboard API to write the \`value\` property to the clipboard, then transitions to a green checkmark "Copied!" confirmation state for two seconds before reverting to its default appearance. This gives users immediate visual feedback that the copy succeeded.

The component is commonly paired with code blocks, API keys, URLs, and other text that users frequently need to paste elsewhere. Because it uses the async Clipboard API (\`navigator.clipboard.writeText\`), it requires a secure context (HTTPS or localhost). If the clipboard write fails -- for example in a non-secure iframe -- the error is caught silently and the button remains in its default state.

CopyButton dispatches an \`arc-copy\` event on successful copy, carrying the copied value in the event detail. This lets parent components react to the copy -- for example, showing a toast notification or logging the event. The button supports a \`disabled\` attribute that reduces opacity and prevents interaction, and all states (default, hover, focus, copied) are styled through ARC design tokens for consistent theming.`,

    features: [
      'One-click copy to clipboard using the async Clipboard API',
      'Visual confirmation state with green checkmark icon and "Copied!" label for 2 seconds',
      'arc-copy custom event fired on successful copy with the value in the detail payload',
      'Disabled state with reduced opacity and pointer-events: none',
      'Focus-visible ring via var(--focus-glow) for keyboard accessibility',
      'Hover state with elevated border and background color shift',
      'Graceful fallback when the Clipboard API is unavailable (non-secure contexts)',
      'Compact inline-flex layout that fits naturally next to code blocks and input fields',
    ],

    guidelines: {
      do: [
        'Place CopyButton adjacent to the content it copies -- next to a code snippet, URL, or API key',
        'Set the value property to the exact string the user expects to paste, not a formatted or truncated version',
        'Use the arc-copy event to trigger a toast or analytics event confirming the copy action',
        'Ensure the page is served over HTTPS so the Clipboard API is available',
        'Use the disabled attribute when the value is not yet available (e.g., while loading)',
      ],
      dont: [
        'Use CopyButton for general-purpose actions -- it is specifically designed for clipboard copy',
        'Set the value to empty string and expect the button to be useful; always provide meaningful content',
        'Override the 2-second confirmation timeout -- it is calibrated for comfortable visual feedback',
        'Nest CopyButton inside another button or interactive element, as this creates invalid HTML nesting',
        'Rely solely on the confirmation state for feedback; pair with a toast for users who look away',
      ],
    },

    previewHtml: `<div style="display:flex; align-items:center; gap:12px;">
  <code style="font-family:var(--font-mono); font-size:13px; color:var(--text-secondary); background:var(--bg-elevated); padding:6px 12px; border-radius:var(--radius-sm);">npm install @arclux/arc-ui</code>
  <arc-copy-button value="npm install @arclux/arc-ui"></arc-copy-button>
</div>`,

    props: [
      { name: 'value', type: 'string', default: "''", description: 'The text string to copy to the clipboard when the button is clicked.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button, preventing clicks and reducing visual opacity.' },
    ],
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

<CopyButton value="npm install @arclux/arc-ui"></CopyButton>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { CopyButton } from '@arclux/arc-ui-vue';
</script>

<template>
  <CopyButton value="npm install @arclux/arc-ui"></CopyButton>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { CopyButton } from '@arclux/arc-ui-svelte';
</script>

<CopyButton value="npm install @arclux/arc-ui"></CopyButton>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { CopyButton } from '@arclux/arc-ui-angular';

@Component({
  imports: [CopyButton],
  template: \`
    <CopyButton value="npm install @arclux/arc-ui"></CopyButton>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { CopyButton } from '@arclux/arc-ui-solid';

<CopyButton value="npm install @arclux/arc-ui"></CopyButton>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { CopyButton } from '@arclux/arc-ui-preact';

<CopyButton value="npm install @arclux/arc-ui"></CopyButton>`,
      },
    ],
  };
