import type { ComponentDef } from './_types';

export const eventCalendar: ComponentDef = {
    name: 'Event Calendar',
    slug: 'event-calendar',
    tag: 'arc-event-calendar',
    tier: 'data',
    interactivity: 'interactive',
    status: 'beta',
    description: 'Scheduling calendar with month and week views that renders all-day and multi-day event chips colored by the chart palette.',

    overview: `Event Calendar displays a collection of event objects on a navigable month or week grid. Unlike Calendar (a date *picker* that manages a selected value), Event Calendar is a read-oriented scheduling surface: you pass an \`events\` array via JavaScript and listen for click events to open your own detail views. Each event has an ISO \`date\`, an optional \`end\` date for multi-day spans, a \`label\`, and a \`color\` index (1-6) that maps to the fixed \`--chart-N\` palette -- the component never cycles colors automatically, so consumers assign meaning consistently.

The month view renders a 6-week grid with up to three event chips per day; overflow collapses into a "+N more" button that fires \`arc-date-click\` so you can open a day detail panel. Multi-day events render a chip on every covered day, with the inner edges squared on continuation days so the span reads as continuous (the color dot appears only on the start day). The week view shows the same chips listed vertically per day with no overflow limit. Both views are all-day/multi-day only -- there is no hour axis or time-of-day positioning; timed agendas are out of scope.

Keyboard interaction uses a roving tabindex across day cells: arrows move by day and week, Home/End jump to the start and end of the week, and PageUp/PageDown move to the previous or next period (month in month view, week in week view), automatically navigating the visible period when focus crosses a boundary. Event chips are excluded from the tab order; pressing Enter on a focused day that has events moves focus to its first chip, ArrowUp/ArrowDown move between chips (and the "+N more" button), and Escape returns focus to the day cell. This keeps the calendar to a single tab stop regardless of event count.`,

    features: [
      'Month view: 6-week grid with weekday headers, today highlight, and muted adjacent-month days',
      'Week view: 7 columns with all event chips listed vertically per day (all-day style, no hour axis)',
      'Event chips tinted with `--chart-1` through `--chart-6` via the `color` index (defaults to 1, never auto-cycled)',
      'Multi-day events span every covered day with squared inner edges on continuation days',
      'Overflow handling in month view: max 3 chips per day, then a "+N more" button that fires `arc-date-click`',
      'Header with previous/next period navigation, period title, Today button, and a month/week view toggle',
      'Roving-tabindex keyboard navigation: arrows, Home/End, PageUp/PageDown with automatic period transitions',
      'Single tab stop: chips are reached with Enter on a day cell and exited with Escape',
      'Three events: `arc-event-click`, `arc-date-click`, and `arc-period-change`'
    ],

    guidelines: {
      do: [
        'Assign `events` as a JavaScript property -- it is an array of objects, not an HTML attribute',
        'Use `arc-period-change` to lazy-load events for the newly visible month or week',
        'Handle `arc-date-click` to open your own day detail view -- the "+N more" overflow button routes there too',
        'Assign `color` indexes consistently by category (e.g. 1 = meetings, 2 = deadlines) so colors carry meaning',
        'Give each event a stable `id` so your `arc-event-click` handler can look up the full record'
      ],
      dont: [
        'Do not use Event Calendar for date selection -- use Calendar or DatePicker for picking a value',
        'Do not expect hour-level scheduling -- events are all-day/multi-day only; there is no time axis',
        'Do not pass `color` values outside 1-6 -- out-of-range values fall back to 1',
        'Do not encode meaning through color alone -- chip labels remain the primary identifier',
        'Avoid rendering the month grid in very narrow containers -- day cells need room for legible chips'
      ],
    },

    previewHtml: `<arc-event-calendar id="demo-event-calendar"></arc-event-calendar>`,

    previewSetup: `const cal = el.querySelector('#demo-event-calendar');
if (cal) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = (day) => \`\${y}-\${m}-\${String(day).padStart(2, '0')}\`;
  cal.events = [
    { id: 1, date: d(2), label: 'Sprint planning', color: 1 },
    { id: 2, date: d(5), end: d(8), label: 'Design offsite', color: 4 },
    { id: 3, date: d(11), label: 'Release v2.1', color: 2 },
    { id: 4, date: d(11), label: 'Retro', color: 3 },
    { id: 5, date: d(11), label: '1:1 sync', color: 5 },
    { id: 6, date: d(11), label: 'Budget review', color: 6 },
    { id: 7, date: d(17), end: d(19), label: 'Conference', color: 2 },
    { id: 8, date: d(24), label: 'Demo day', color: 1 }
  ];
}`,

    props: [
      { name: 'events', type: 'Array<{ id: string | number; date: string; end?: string; label: string; color?: 1|2|3|4|5|6 }>', default: '[]', description: 'The event objects to display. `date` (and optional `end` for multi-day spans) are ISO strings (YYYY-MM-DD). `color` indexes the fixed `--chart-N` palette and defaults to 1. Set via JavaScript property, not an attribute.' },
      { name: 'view', type: "'month' | 'week'", default: "'month'", description: 'Which period layout to render. Also switchable by the user via the header view toggle.' },
      { name: 'date', type: 'string', default: "''", description: 'ISO date string (YYYY-MM-DD) anchoring the visible period. Defaults to today when left empty.' }
    ],
    events: [
      { name: 'arc-event-click', description: 'Fired when an event chip is clicked or activated. `event.detail.event` contains the original event object.' },
      { name: 'arc-date-click', description: 'Fired when a day cell or a "+N more" overflow button is activated. `event.detail.date` contains the ISO date string.' },
      { name: 'arc-period-change', description: 'Fired when the visible period or view changes (navigation buttons, Today, view toggle, or keyboard). `event.detail` contains `{ view, date }`.' }
    ],
    tabs: [
    {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-event-calendar id="cal"></arc-event-calendar>

<script>
  const cal = document.querySelector('#cal');
  cal.events = [
    { id: 1, date: '2026-07-13', label: 'Sprint planning', color: 1 },
    { id: 2, date: '2026-07-15', end: '2026-07-17', label: 'Offsite', color: 4 },
  ];
  cal.addEventListener('arc-event-click', (e) => openDetail(e.detail.event));
  cal.addEventListener('arc-date-click', (e) => openDay(e.detail.date));
</script>`,
      },
    {
        label: 'React',
        lang: 'tsx',
        code: `import { EventCalendar } from '@arclux/arc-ui-react';

const events = [
  { id: 1, date: '2026-07-13', label: 'Sprint planning', color: 1 },
  { id: 2, date: '2026-07-15', end: '2026-07-17', label: 'Offsite', color: 4 },
];

<EventCalendar
  events={events}
  onArcEventClick={(e) => openDetail(e.detail.event)}
  onArcDateClick={(e) => openDay(e.detail.date)}
/>`,
      },
    {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { EventCalendar } from '@arclux/arc-ui-vue';

const events = [
  { id: 1, date: '2026-07-13', label: 'Sprint planning', color: 1 },
];
</script>

<template>
  <EventCalendar :events="events" @arc-event-click="openDetail" />
</template>`,
      },
    {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { EventCalendar } from '@arclux/arc-ui-svelte';

  const events = [
    { id: 1, date: '2026-07-13', label: 'Sprint planning', color: 1 },
  ];
</script>

<EventCalendar {events} on:arc-event-click={openDetail} />`,
      },
  ],

  seeAlso: ['calendar', 'date-picker', 'timeline'],
};
