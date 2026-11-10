import type { ComponentDef } from './_types';

export const announcement: ComponentDef = {
  name: 'Announcement',
  slug: 'announcement',
  tag: 'arc-announcement',
  tier: 'feedback',
  interactivity: 'static',
  description:
    'An invisible live region for announcing page changes to screen readers.',

  overview: `Announcement is a live region with nothing on screen. Set its \`message\` property and screen readers read the new text out. Use it for changes sighted users see but screen reader users would miss: route changes, live search result counts, form confirmations, timer updates, new chat messages.

\`politeness\` sets how it interrupts. \`polite\` waits for the screen reader to finish what it's saying, and \`assertive\` cuts in at once. Put one in your layout and update its \`message\` whenever you need to announce something.`,

  features: [
    'Renders one `role="status"` element with `aria-atomic="true"`, clipped to a 1px box',
    'Setting the same message twice in a row doesn\'t announce it again, because nothing changed',
  ],

  guidelines: {
    do: [
      'Use polite for routine updates like search result counts',
      'Use assertive for errors, timeouts and session expiry warnings',
      'Keep messages short. Screen reader users can\'t skim an announcement',
    ],
    dont: [
      'Don\'t announce content that is already in a live region, such as a Toast or an `error`, `warning` or `success` Alert',
      'Don\'t fire announcements in quick succession. Screen readers may drop the ones in between',
      'Don\'t use it in place of labels and semantic HTML',
    ],
  },

  previewHtml: `<arc-announcement id="demo-announce" politeness="polite"></arc-announcement><arc-button id="demo-announce-btn" variant="secondary">Announce message</arc-button>`,

  previewSetup: `
      document.getElementById('demo-announce-btn')?.addEventListener('click', () => {
        const el = document.getElementById('demo-announce');
        if (el) el.message = 'New search results loaded: 42 items found.';
      });
    `,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-announcement id="announcer" politeness="polite"></arc-announcement>

<arc-button onclick="document.getElementById('announcer').message = '42 results found.'">
  Search
</arc-button>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Announcement, Button } from '@arclux/arc-ui-react';
import type { ArcAnnouncement } from '@arclux/arc-ui/announcement';
import { useRef } from 'react';

export function SearchDemo() {
  // Typing the ref as ArcAnnouncement is what makes \`message\` visible to
  // TypeScript — an HTMLElement has no such property.
  const announcerRef = useRef<ArcAnnouncement>(null);

  const handleSearch = () => {
    // perform search...
    if (announcerRef.current) {
      announcerRef.current.message = '42 results found.';
    }
  };

  return (
    <>
      <Announcement ref={announcerRef} politeness="polite" />
      <Button onClick={handleSearch}>Search</Button>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { Announcement, Button } from '@arclux/arc-ui-vue';

const announcer = ref(null);
const handleSearch = () => {
  if (announcer.value) announcer.value.message = '42 results found.';
};
</script>

<template>
  <Announcement ref="announcer" politeness="polite" />
  <Button @click="handleSearch">Search</Button>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Announcement, Button } from '@arclux/arc-ui-svelte';

  let announcer;
  const handleSearch = () => {
    if (announcer) announcer.message = '42 results found.';
  };
</script>

<Announcement bind:this={announcer} politeness="polite" />
<Button on:click={handleSearch}>Search</Button>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component, ViewChild, ElementRef } from '@angular/core';
import { Announcement, Button } from '@arclux/arc-ui-angular';

@Component({
  imports: [Announcement, Button],
  template: \`
    <arc-announcement #announcer politeness="polite"></arc-announcement>
    <arc-button (click)="handleSearch()">Search</arc-button>
  \`,
})
export class SearchDemoComponent {
  @ViewChild('announcer') announcer!: ElementRef;

  handleSearch() {
    this.announcer.nativeElement.message = '42 results found.';
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Announcement, Button } from '@arclux/arc-ui-solid';
import type { ArcAnnouncement } from '@arclux/arc-ui/announcement';

export function SearchDemo() {
  let announcer: ArcAnnouncement | undefined;

  const handleSearch = () => {
    if (announcer) announcer.message = '42 results found.';
  };

  return (
    <>
      <Announcement ref={announcer} politeness="polite" />
      <Button onClick={handleSearch}>Search</Button>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Announcement, Button } from '@arclux/arc-ui-preact';
import type { ArcAnnouncement } from '@arclux/arc-ui/announcement';
import { useRef } from 'preact/hooks';

export function SearchDemo() {
  const announcerRef = useRef<ArcAnnouncement>(null);

  const handleSearch = () => {
    if (announcerRef.current) {
      announcerRef.current.message = '42 results found.';
    }
  };

  return (
    <>
      <Announcement ref={announcerRef} politeness="polite" />
      <Button onClick={handleSearch}>Search</Button>
    </>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-announcement — requires announcement.css + base.css (or arc-ui.css) -->
<div class="arc-announcement">
  <div role="status" aria-live="polite" aria-atomic="true">Message</div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-announcement — self-contained, no external CSS needed -->
<div class="arc-announcement" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); clip-path: inset(50%); white-space: nowrap">
  <div role="status" aria-live="polite" aria-atomic="true">Message</div>
</div>`,
    },
  ],

  seeAlso: ['alert'],
};
