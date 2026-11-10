import type { ComponentDef } from './_types';

export const banner: ComponentDef = {
  name: 'Banner',
  slug: 'banner',
  tag: 'arc-banner',
  tier: 'feedback',
  interactivity: 'hybrid',
  description:
    'Full-width strip for page-wide messages, with the same semantic variants as Alert and a gradient wash.',

  overview: `Banner is a one-line message strip that takes the full width of its container, usually the viewport or a major section. Use it for messages about the whole app: maintenance windows, version updates, cookie consent, account warnings. For feedback about one part of a page, use Alert.

\`sticky\` keeps the banner at the top while the page scrolls. \`dismissible\` adds a close button, which fires a cancelable \`arc-close\` and then hides the banner.

The four variants (info, success, warning, error) set a gradient wash and an icon, in the same colors as Alert and Toast. Every banner renders with \`role="alert"\`, whatever the variant, so screen readers announce it straight away.`,

  features: [
    'The default slot takes links, buttons and other inline actions',
    'A 1px border in the variant color, `--radius-md` corners, a wash that fades out by 60% of the width, and a 2px line along the bottom',
  ],

  guidelines: {
    do: [
      'Turn on sticky for messages that must stay visible while the user scrolls',
      'Use the warning variant for maintenance windows and upcoming breaking changes',
      'Keep the text to one line, with an optional action link',
      'Put the banner at the very top of the layout, above the top bar if you can',
    ],
    dont: [
      'Don\'t stack banners. Combine the messages or show them one after another',
      'Don\'t make every banner dismissible. Some system messages should stay',
      'Don\'t use the error variant for warnings. Keep it for outages and failures',
    ],
  },

  previewHtml: `<div style="display:flex;flex-direction:column;width:100%;gap:var(--space-md)">
  <arc-banner variant="info" dismissible>Scheduled maintenance tonight from 11 PM to 1 AM UTC.</arc-banner>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-banner variant="info" dismissible>
  Scheduled maintenance tonight from 11 PM to 1 AM UTC.
</arc-banner>

<arc-banner variant="warning" sticky>
  Your subscription expires in 3 days.
  <a href="/billing" slot="action">Renew now</a>
</arc-banner>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Banner } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Banner variant="info" dismissible>
        Scheduled maintenance tonight from 11 PM to 1 AM UTC.
      </Banner>

      <Banner variant="warning" sticky>
        Your subscription expires in 3 days.
      </Banner>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Banner } from '@arclux/arc-ui-vue';
</script>

<template>
  <Banner variant="info" dismissible>
    Scheduled maintenance tonight from 11 PM to 1 AM UTC.
  </Banner>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Banner } from '@arclux/arc-ui-svelte';
</script>

<Banner variant="info" dismissible>
  Scheduled maintenance tonight from 11 PM to 1 AM UTC.
</Banner>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Banner } from '@arclux/arc-ui-angular';

@Component({
  imports: [Banner],
  template: \`
    <arc-banner variant="info" dismissible>
      Scheduled maintenance tonight from 11 PM to 1 AM UTC.
    </arc-banner>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Banner } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <Banner variant="info" dismissible>
      Scheduled maintenance tonight from 11 PM to 1 AM UTC.
    </Banner>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Banner } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <Banner variant="info" dismissible>
      Scheduled maintenance tonight from 11 PM to 1 AM UTC.
    </Banner>
  );
}`,
    },
  ],

  seeAlso: ['alert', 'toast', 'connection-status'],
};
