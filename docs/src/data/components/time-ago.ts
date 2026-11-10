import type { ComponentDef } from './_types';

export const timeAgo: ComponentDef = {
  name: 'Time Ago',
  slug: 'time-ago',
  tag: 'arc-time-ago',
  tier: 'typography',
  interactivity: 'interactive',
  description: 'Relative time display that auto-updates ("3 minutes ago", "yesterday").',

  overview: `TimeAgo shows how far a date is from now, as in "3 minutes ago", "yesterday" or "in 2 hours". \`datetime\` takes an ISO 8601 string, or anything \`new Date()\` can parse. The text is recalculated every minute while the date is within an hour, every 5 minutes within a day, and every hour after that. Set \`live="false"\` to stop the updates.

It renders a \`<time>\` element that keeps the exact \`datetime\` attribute, with the full formatted date in \`title\` for hover. Formatting uses \`Intl.RelativeTimeFormat\`, so \`locale="de-DE"\` gives "vor 3 Minuten". Under a minute it shows "just now", in English whatever the locale.`,

  features: [
    'Set in `--font-mono`, with the size and color of the surrounding text',
  ],

  guidelines: {
    do: [
      'Use it for timestamps in feeds, comments, commit logs and activity streams',
      'Pass a valid ISO 8601 string in `datetime`',
      'Set `live="false"` for printed reports or export previews',
      'Set `locale` to your app\'s locale',
    ],
    dont: [
      'Don\'t use it as a countdown with second-level precision. Use CountdownTimer',
      'Don\'t pass a date `new Date()` can\'t parse. An invalid date renders nothing',
      'Don\'t make it the only date shown where the exact time matters, such as legal or financial records. The full date is only in the hover title',
      'Don\'t use it when you need a fixed format such as "Feb 16, 2026". Format the date yourself',
    ],
  },

  previewHtml: `<div style="display:flex;flex-direction:column;gap:var(--space-sm);font-size:14px;color:var(--text-secondary)">
  <div>Last commit: <arc-time-ago datetime="2026-02-16T10:30:00Z"></arc-time-ago></div>
  <div>Account created: <arc-time-ago datetime="2025-06-15T00:00:00Z"></arc-time-ago></div>
  <div>Next deploy: <arc-time-ago datetime="2026-02-17T08:00:00Z"></arc-time-ago></div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-time-ago datetime="2026-02-16T10:30:00Z"></arc-time-ago>

<!-- Future date -->
<arc-time-ago datetime="2026-02-17T08:00:00Z"></arc-time-ago>

<!-- Static (no live updates) -->
<arc-time-ago datetime="2025-06-15" live="false"></arc-time-ago>

<!-- German locale -->
<arc-time-ago datetime="2026-02-16T10:30:00Z" locale="de-DE"></arc-time-ago>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { TimeAgo } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <TimeAgo datetime="2026-02-16T10:30:00Z" />

      {/* Future date */}
      <TimeAgo datetime="2026-02-17T08:00:00Z" />

      {/* Static snapshot */}
      <TimeAgo datetime="2025-06-15" live={false} />
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { TimeAgo } from '@arclux/arc-ui-vue';
</script>

<template>
  <TimeAgo datetime="2026-02-16T10:30:00Z" />
  <TimeAgo datetime="2026-02-17T08:00:00Z" />
  <TimeAgo datetime="2025-06-15" :live="false" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { TimeAgo } from '@arclux/arc-ui-svelte';
</script>

<TimeAgo datetime="2026-02-16T10:30:00Z" />
<TimeAgo datetime="2026-02-17T08:00:00Z" />
<TimeAgo datetime="2025-06-15" live={false} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { TimeAgo } from '@arclux/arc-ui-angular';

@Component({
  imports: [TimeAgo],
  template: \`
    <arc-time-ago datetime="2026-02-16T10:30:00Z" />
    <arc-time-ago datetime="2026-02-17T08:00:00Z" />
    <arc-time-ago datetime="2025-06-15" [live]="false" />
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { TimeAgo } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <TimeAgo datetime="2026-02-16T10:30:00Z" />
      <TimeAgo datetime="2026-02-17T08:00:00Z" />
      <TimeAgo datetime="2025-06-15" live={false} />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { TimeAgo } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <TimeAgo datetime="2026-02-16T10:30:00Z" />
      <TimeAgo datetime="2026-02-17T08:00:00Z" />
      <TimeAgo datetime="2025-06-15" live={false} />
    </>
  );
}`,
    },
  ],

  seeAlso: ['countdown-timer', 'text', 'badge'],
};
