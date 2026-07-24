import type { ComponentDef } from './_types';

export const dateRangePicker: ComponentDef = {
    name: 'Date Range Picker',
    slug: 'date-range-picker',
    tag: 'arc-date-range-picker',
    tier: 'input',
    interactivity: 'interactive',
    status: 'beta',
    description: 'Dual-calendar picker for selecting a start/end date range with presets and full keyboard navigation.',

    overview: `DateRangePicker extends the single DatePicker model to a start/end range. The read-only input displays the committed range in a compact human-readable form (e.g., "Jan 5 – Feb 2, 2026") while the \`start\` and \`end\` properties hold ISO strings (YYYY-MM-DD). The derived \`value\` getter returns the two dates joined as an ISO 8601 interval ("2026-01-05/2026-02-02") -- the same string is submitted with the parent form via ElementInternals, and \`form.reset()\` restores the initial range.

Selection follows the familiar two-click model: the first click (or Enter on a focused day) sets the start date, and while the end is pending, hovering or keyboard-focusing another day previews the resulting range with a soft highlight. The second click commits the range (automatically swapping if the second date is earlier), fires \`arc-change\` with \`{ start, end }\`, and closes the popup. A third click begins a new range. The popup shows a configurable number of month panels (two by default) that sit side by side and wrap into a vertical stack when horizontal space runs out, with shared previous/next month navigation.

An optional \`presets\` array renders a left rail of one-click quick ranges such as "Last 7 days" -- each entry is \`{ label, days }\` and resolves to a range ending today. The day grids use a roving tabindex with Arrow/Home/End/PageUp/PageDown navigation that pages months automatically at the edges, endpoint days carry ", range start"/", range end" label suffixes, and a polite live region announces selection progress ("Start date set. Choose end date.") for screen reader users. Escape closes the popup and restores focus to the input.`,

    features: [
      'Two-click range selection with automatic start/end swap when picked out of order',
      'Live range preview highlight while hovering or keyboard-focusing the end date',
      'ISO 8601 interval value ("start/end") submitted through native form association',
      'Configurable number of side-by-side month panels (default 2) that stack when space is tight',
      'Optional preset rail for one-click quick ranges like "Last 7 days"',
      'Min/max bounds that disable out-of-range days',
      'Roving-tabindex day grid with Arrow, Home/End, and PageUp/PageDown month paging',
      'Polite live-region announcements of selection progress for assistive technology',
      'Escape and outside-click dismissal with focus restoration to the input'
    ],

    guidelines: {
      do: [
        'Provide presets for the ranges users pick most often (7/30/90 days) to reduce interaction cost',
        'Use the start and end ISO strings (or the interval value) for APIs -- never parse the display text',
        'Set min and max when only a bounded window is meaningful (e.g., report data availability)',
        'Listen to arc-change to react to committed ranges; it fires only when both dates are set',
        'Set months={1} in narrow layouts like popover filters where two panels would overflow'
      ],
      dont: [
        'Use it for a single date -- use DatePicker instead',
        'Treat the first click as a committed value; arc-change fires only after the end date is chosen',
        'Hand-build preset buttons outside the component when the presets prop covers the need',
        'Place it inside an overflow: hidden container, as the popup will be clipped',
        'Set min greater than max, which disables every day in the calendar'
      ],
    },

    previewLayout: 'block',

    previewHeight: '560px',

    previewHtml: `<arc-date-range-picker
  label="Reporting Period"
  placeholder="Select date range"
  presets='[{"label":"Last 7 days","days":7},{"label":"Last 30 days","days":30},{"label":"Last 90 days","days":90}]'
  style="width:300px"
></arc-date-range-picker>`,

    tabs: [
    {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-date-range-picker
  label="Reporting Period"
  presets='[{"label":"Last 7 days","days":7},{"label":"Last 30 days","days":30}]'
></arc-date-range-picker>`,
      },
    {
        label: 'React',
        lang: 'tsx',
        code: `import { DateRangePicker } from '@arclux/arc-ui-react';

<DateRangePicker
  label="Reporting Period"
  presets={[{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }]}
  onArcChange={(e) => console.log(e.detail.start, e.detail.end)}
></DateRangePicker>`,
      },
    {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { DateRangePicker } from '@arclux/arc-ui-vue';

const presets = [{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }];
</script>

<template>
  <DateRangePicker label="Reporting Period" :presets="presets"></DateRangePicker>
</template>`,
      },
    {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { DateRangePicker } from '@arclux/arc-ui-svelte';

  const presets = [{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }];
</script>

<DateRangePicker label="Reporting Period" presets={presets}></DateRangePicker>`,
      },
    {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { DateRangePicker } from '@arclux/arc-ui-angular';

@Component({
  imports: [DateRangePicker],
  template: \`
    <DateRangePicker label="Reporting Period" [presets]="presets"></DateRangePicker>
  \`,
})
export class MyComponent {
  presets = [{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }];
}`,
      },
    {
        label: 'Solid',
        lang: 'tsx',
        code: `import { DateRangePicker } from '@arclux/arc-ui-solid';

<DateRangePicker
  label="Reporting Period"
  presets={[{ label: 'Last 7 days', days: 7 }]}
></DateRangePicker>`,
      },
    {
        label: 'Preact',
        lang: 'tsx',
        code: `import { DateRangePicker } from '@arclux/arc-ui-preact';

<DateRangePicker
  label="Reporting Period"
  presets={[{ label: 'Last 7 days', days: 7 }]}
></DateRangePicker>`,
      },
  ],

  seeAlso: ["date-picker","calendar","input"],
};
