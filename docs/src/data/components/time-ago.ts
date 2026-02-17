import type { ComponentDef } from './_types';

export const timeAgo: ComponentDef = {
    name: 'Time Ago',
    slug: 'time-ago',
    tag: 'arc-time-ago',
    tier: 'typography',
    interactivity: 'interactive',
    description: 'Relative time display that auto-updates ("3 minutes ago", "yesterday").',

    overview: `TimeAgo renders a human-readable relative timestamp from an ISO date string — "3 minutes ago", "yesterday", "in 2 hours" — and keeps it live by recalculating on an adaptive interval. Closer timestamps update more frequently (every 60 seconds within the first hour) while older ones settle to hourly checks, keeping the display accurate without unnecessary work.

The component outputs a semantic \`<time>\` element with the machine-readable \`datetime\` attribute preserved, so search engines, screen readers, and browser extensions can parse the exact date. A \`title\` attribute provides the full formatted date on hover for users who need precision. Future dates are handled naturally — "in 5 minutes", "in 3 days" — making TimeAgo suitable for countdowns, scheduled events, and deploy timers.

Under the hood it uses \`Intl.RelativeTimeFormat\` for locale-aware formatting, so switching the \`locale\` prop from \`en-US\` to \`de-DE\` produces "vor 3 Minuten" without any extra configuration. The live update interval self-adjusts as time passes: sub-hour timestamps poll every minute, sub-day every 5 minutes, and everything else every hour. Set \`live="false"\` to disable auto-updates entirely for static snapshots.`,

    features: [
      'Semantic <time> element with machine-readable datetime attribute',
      'Adaptive live updates — faster for recent timestamps, slower for old ones',
      'Intl.RelativeTimeFormat for locale-aware output (BCP 47 locale prop)',
      'Future date support ("in X minutes", "in X days")',
      'Full formatted date in title attribute for hover tooltip',
      '"Just now" threshold for sub-60-second differences to avoid flicker',
      'Automatic interval cleanup on disconnect to prevent memory leaks',
      'Monospace font (--font-mono) for consistent inline rendering',
      'CSS part (time) for external style customization',
    ],

    guidelines: {
      do: [
        'Use for timestamps in feeds, comments, commit logs, and activity streams',
        'Provide valid ISO 8601 date strings in the datetime prop',
        'Use alongside a tooltip or expandable detail for exact timestamps when precision matters',
        'Set live="false" for static contexts like printed reports or export previews',
        'Set the locale prop to match your app locale for correct relative formatting',
      ],
      dont: [
        'Use TimeAgo for countdown timers with second-level precision — use CountdownTimer instead',
        'Pass unparseable date strings — the component renders empty for invalid dates',
        'Rely on TimeAgo as the sole date display when exact timestamps are critical (e.g. legal, financial)',
        'Use for dates that need a specific format like "Feb 16, 2026" — use a date formatter instead',
      ],
    },

    previewHtml: `<div style="display:flex;flex-direction:column;gap:var(--space-sm);font-size:14px;color:var(--text-secondary)">
  <div>Last commit: <arc-time-ago datetime="2026-02-16T10:30:00Z"></arc-time-ago></div>
  <div>Account created: <arc-time-ago datetime="2025-06-15T00:00:00Z"></arc-time-ago></div>
  <div>Next deploy: <arc-time-ago datetime="2026-02-17T08:00:00Z"></arc-time-ago></div>
</div>`,

    props: [
      { name: 'datetime', type: 'string', description: 'ISO 8601 date string or any value parseable by new Date().' },
      { name: 'live', type: 'boolean', default: 'true', description: 'Auto-update the relative time on an adaptive interval.' },
      { name: 'locale', type: 'string', default: "'en-US'", description: 'BCP 47 locale tag for Intl.RelativeTimeFormat output.' },
    ],

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

<TimeAgo datetime="2026-02-16T10:30:00Z" />

{/* Future date */}
<TimeAgo datetime="2026-02-17T08:00:00Z" />

{/* Static snapshot */}
<TimeAgo datetime="2025-06-15" live={false} />`,
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
    <TimeAgo datetime="2026-02-16T10:30:00Z" />
    <TimeAgo datetime="2026-02-17T08:00:00Z" />
    <TimeAgo datetime="2025-06-15" [live]="false" />
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { TimeAgo } from '@arclux/arc-ui-solid';

<TimeAgo datetime="2026-02-16T10:30:00Z" />
<TimeAgo datetime="2026-02-17T08:00:00Z" />
<TimeAgo datetime="2025-06-15" live={false} />`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { TimeAgo } from '@arclux/arc-ui-preact';

<TimeAgo datetime="2026-02-16T10:30:00Z" />
<TimeAgo datetime="2026-02-17T08:00:00Z" />
<TimeAgo datetime="2025-06-15" live={false} />`,
      },
    ],

    seeAlso: ['countdown-timer', 'text', 'badge'],
};
